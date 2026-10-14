/**
 * Purpose: the team's escalation on the binary (the founder's answer to D2, 2026-10-13): during stage 1's 24 hours a
 *          team key calls `team_open_contest(2)` and the contest goes to stage 2 for 48 hours, `ContestOpened`
 *          (decoded through the SDK) saying stage 2; each refusal with its own error and nothing written (anyone but
 *          a team key first, a contest at stage 2 already, stage 1's deadline passed); the pause never blocks it; then
 *          the re-read is closed, and the admin decides or stage 2 lapses. Filter: `bun test tests/ -t "contest escalate"`.
 * Version: 0.1.1 (the escalation is byte 2, the second review's S1)
 * Sprint:  14 (lane L14B, D2). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";
import type { Address, KeyPairSigner } from "@solana/kit";

import { buildPauseEntries } from "@brot/sdk/tx";

import * as C from "./contest-support";
import { readCampaign } from "./flows";
import * as IS from "./instructions-settlement";
import * as P from "./program";
import { at, expectRefused, snapshot } from "./resolve-support";
import { expectOk, send } from "./setup";

/** Stage 1's deadline: twenty hours after `NOW`, its 24 hours still running. */
const ENDS = C.NOW + 20n * C.HOUR;
/** The escalation's raw bytes: byte 2 (the second review's S1). */
const contestIx = (signer: KeyPairSigner, config: Address, campaign: Address) =>
  IS.teamOpenContestIx(signer, config, campaign, 2);

describe("contest escalate", () => {
  test("contest escalate: a team key sends a contest at stage 1 to the admin, and ContestOpened says stage 2", async () => {
    const cw = await C.contestWorld();
    const c = await C.contested(cw, 1, ENDS);
    const before = snapshot(cw.w, c);
    const sent = expectOk(await C.escalate(cw, c));
    // Decoded by the SDK as an indexer decodes it (the kit lays out no `ContestOpened` of its own: camelCase).
    expect(sent.events).toEqual([
      {
        name: "ContestOpened",
        data: {
          campaign: c.campaign,
          seq: C.SEQ,
          signer: cw.team.address,
          contestStage: 2,
          contestEndsAt: C.NOW + C.STAGE2_SECONDS,
        },
      },
    ]);
    const after = readCampaign(cw.w, c.campaign);
    expect([after.status, after.contest_stage, after.contest_ends_at, after.event_seq]).toEqual([
      P.Status.Contested,
      2,
      C.NOW + C.STAGE2_SECONDS,
      C.SEQ + 1n,
    ]);
    expect([after.outcome, after.observed_value]).toEqual([P.Outcome.No, C.SUPPLY]);
    expect(snapshot(cw.w, c).lamports).toEqual(before.lamports);
    // Stage 2 is the admin's now: the re-read is closed.
    await expectRefused(cw.w, c, await C.rereadIx(c), "WrongContestStage");
  });

  test("contest escalate: each refusal has its own error and writes nothing", async () => {
    const cw = await C.contestWorld();
    const c = await C.contested(cw, 1, ENDS);
    for (const signer of [cw.outsider, cw.admin]) {
      await expectRefused(cw.w, c, contestIx(signer, cw.config, c.campaign), "NotTeamMember");
    }
    const stage2 = await C.contested(cw, 2, ENDS);
    await expectRefused(cw.w, stage2, contestIx(cw.team, cw.config, stage2.campaign), "WrongContestStage");
    at(cw.w, ENDS); // stage 1's deadline: a matching re-read may pay from here, so the team's hand is closed
    await expectRefused(cw.w, c, contestIx(cw.team, cw.config, c.campaign), "ContestDeadlinePassed");
  });

  test("contest escalate: the pause never blocks it", async () => {
    const cw = await C.contestWorld();
    expectOk(await send(cw.w, [await buildPauseEntries({ teamMember: cw.team })]));
    const c = await C.contested(cw, 1, ENDS);
    expectOk(await C.escalate(cw, c));
    expect(readCampaign(cw.w, c.campaign).contest_stage).toBe(2);
  });

  test("contest escalate: then the admin decides, or stage 2 lapses at its deadline with the stored result", async () => {
    const cw = await C.contestWorld();
    const decided = await C.contested(cw, 1, ENDS);
    expectOk(await C.escalate(cw, decided));
    expectOk(await C.decide(cw, decided, P.ContestDecision.Void, P.VoidReason.TeamOutsideCause));
    expect(readCampaign(cw.w, decided.campaign)).toMatchObject({ status: P.Status.Settling, outcome: P.Outcome.Void });
    const lapsed = await C.contested(cw, 1, ENDS);
    expectOk(await C.escalate(cw, lapsed));
    const lapse = C.NOW + C.STAGE2_SECONDS;
    at(cw.w, lapse - 1n);
    await expectRefused(cw.w, lapsed, IS.finalizeCampaignIx(lapsed.campaign, cw.config), "ContestNotLapsed");
    at(cw.w, lapse);
    expectOk(await send(cw.w, [IS.finalizeCampaignIx(lapsed.campaign, cw.config)]));
    expect(readCampaign(cw.w, lapsed.campaign)).toMatchObject({ status: P.Status.Settling, outcome: P.Outcome.No });
  });
});
