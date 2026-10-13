/**
 * Purpose: `team_open_contest` on the binary (Sprint 14, lane L14B): a team key contests a result inside its window,
 *          stage 1 starts for 24 hours (D2), and `ContestOpened` decodes through the SDK; each refusal with its own
 *          error and nothing written (the same call on a contest is the escalation: contest-escalate.test.ts); the
 *          pause never blocks it; and while a campaign is contested, at either stage, no payout instruction moves a
 *          lamport. Filter: `bun test tests/ -t "contest opens"`.
 * Version: 0.1.1 (D2: stage 1's 24 hours)
 * Sprint:  14 (lane L14B). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { buildPauseEntries } from "@brot/sdk/tx";

import * as C from "./contest-support";
import { readCampaign } from "./flows";
import * as IS from "./instructions-settlement";
import * as P from "./program";
import { at, expectRefused, resolveIx, snapshot } from "./resolve-support";
import { balance, expectOk, send } from "./setup";

const contestIx = IS.teamOpenContestIx;

describe("contest opens", () => {
  test("contest opens: a team key contests inside the window and ContestOpened says so", async () => {
    const cw = await C.contestWorld();
    const c = await C.reviewed(cw);
    const before = snapshot(cw.w, c);
    const sent = expectOk(await C.openContest(cw, c));
    // Decoded by the SDK as an indexer decodes it (the kit lays out no `ContestOpened` of its own: camelCase).
    expect(sent.events).toEqual([
      {
        name: "ContestOpened",
        data: {
          campaign: c.campaign,
          seq: C.SEQ,
          signer: cw.team.address,
          contestStage: 1,
          contestEndsAt: C.NOW + C.STAGE1_SECONDS,
        },
      },
    ]);
    const after = readCampaign(cw.w, c.campaign);
    expect([after.status, after.contest_stage, after.contest_ends_at, after.event_seq]).toEqual([
      P.Status.Contested,
      1,
      C.NOW + C.STAGE1_SECONDS,
      C.SEQ + 1n,
    ]);
    // The result is not touched and no lamport moves.
    expect([after.outcome, after.observed_value]).toEqual([P.Outcome.No, C.SUPPLY]);
    expect(snapshot(cw.w, c).lamports).toEqual(before.lamports);
  });

  test("contest opens: each refusal has its own error and writes nothing", async () => {
    const cw = await C.contestWorld();
    const c = await C.reviewed(cw);
    for (const signer of [cw.outsider, cw.admin]) {
      await expectRefused(cw.w, c, contestIx(signer, cw.config, c.campaign), "NotTeamMember");
    }
    // A Contested campaign takes the team's escalation instead (contest-escalate.test.ts).
    for (const status of [P.Status.Open, P.Status.Settling]) {
      const other = await C.reviewed(cw, { status });
      await expectRefused(cw.w, other, contestIx(cw.team, cw.config, other.campaign), "TeamKeyOutsideReview");
    }
    const untallied = await C.reviewed(cw, { entries_untallied: 1 });
    await expectRefused(cw.w, untallied, contestIx(cw.team, cw.config, untallied.campaign), "NotTallied");
    at(cw.w, C.REVIEW_ENDS); // the instant the window closes
    await expectRefused(cw.w, c, contestIx(cw.team, cw.config, c.campaign), "ContestOutsideReview");
  });

  test("contest opens: the pause never blocks a contest", async () => {
    const cw = await C.contestWorld();
    expectOk(await send(cw.w, [await buildPauseEntries({ teamMember: cw.team })]));
    const c = await C.reviewed(cw);
    expectOk(await C.openContest(cw, c));
    expect(readCampaign(cw.w, c.campaign).status).toBe(P.Status.Contested);
  });

  test("contest opens: while contested, at either stage, no payout moves a lamport", async () => {
    const cw = await C.contestWorld();
    const feeVault = await P.feeVaultPda();
    // Before its lapse a contest at either stage refuses finalize (an unread stage 1 lapses 48 hours after its deadline).
    for (const [stage, refusesFinalize] of [
      [1, "ContestNotLapsed"],
      [2, "ContestNotLapsed"],
    ] as const) {
      const c = await C.contested(cw, stage, C.NOW + C.HOUR);
      const { yes } = await C.entries(cw, c);
      const creator = readCampaign(cw.w, c.campaign).creator;
      const entry = await P.entryPda(c.campaign, yes.address);
      const wallets = () => [balance(cw.w, yes.address), balance(cw.w, creator), balance(cw.w, feeVault)];
      const kept = wallets();
      const join = await P.joinPda(c.campaign, yes.address, 0);
      const refusals = [
        [IS.settleEntryIx(entry, c.campaign, c.vault, yes.address), "NotFinalized"],
        [IS.settleCreatorShareIx(c.campaign, c.vault, creator), "NotFinalized"],
        [IS.collectFeeIx(c.campaign, c.vault, feeVault), "NotFinalized"],
        [IS.settlePrizeIx(c.campaign, c.vault, creator), "NotFinalized"],
        [IS.closeCampaignIx(c.campaign, c.vault, creator, feeVault), "CampaignNotSettled"],
        [IS.finalizeCampaignIx(c.campaign, cw.config), refusesFinalize],
        [IS.teamConfirmResultIx(cw.team, cw.config, c.campaign), "TeamKeyOutsideReview"],
        [resolveIx(c), "CampaignNotOpen"],
        [IS.tallyLateJoinsIx(yes.address, c.campaign, entry, [join]), "TallyNotReady"],
      ] as const;
      for (const [ix, error] of refusals) await expectRefused(cw.w, c, ix, error);
      expect(wallets()).toEqual(kept);
    }
  });
});
