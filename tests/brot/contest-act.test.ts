/**
 * Purpose: the act of `team_open_contest` is its signed byte (the second review's S1, 2026-10-13), on the binary.
 *          The S1 sequence (an opening that landed, sent again as the same bytes after a 429, or by a second team
 *          member on the same alert) is refused with `ContestAlreadyOpen`, at either stage, writing nothing. Byte 2
 *          on a campaign not contested is `NotContested`; any other byte or length is `BadInstructionData`. An
 *          opening and an escalation in one transaction (the runbook's "reader in doubt", review Info 3) leave the
 *          contest at stage 2. Filter: `bun test tests/ -t "contest act"`.
 * Version: 0.1.0
 * Sprint:  14 (lane L14B, the second review's S1). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { ContestStage } from "@brot/sdk/read";
import { buildTeamOpenContest } from "@brot/sdk/tx";

import * as C from "./contest-support";
import { readCampaign, setTeam } from "./flows";
import * as IS from "./instructions-settlement";
import * as P from "./program";
import { expectRefused } from "./resolve-support";
import { expectOk, send } from "./setup";

describe("contest act", () => {
  test("contest act: a retried or duplicate opening is refused with ContestAlreadyOpen and writes nothing", async () => {
    const cw = await C.contestWorld();
    const [first, second] = await setTeam(cw.w, cw.admin, 2);
    const c = await C.reviewed(cw);
    const opening = await buildTeamOpenContest({ teamMember: first, campaign: c.campaign, stage: ContestStage.Stage1 });
    expectOk(await send(cw.w, [opening]));
    // The same bytes again (its sender's retry after a 429), then a second team member on the same alert.
    await expectRefused(cw.w, c, opening, "ContestAlreadyOpen");
    await expectRefused(cw.w, c, IS.teamOpenContestIx(second, cw.config, c.campaign, 1), "ContestAlreadyOpen");
    expect(readCampaign(cw.w, c.campaign).contest_stage).toBe(1);
    // A contest at stage 2 refuses an opening the same way.
    const atStage2 = await C.contested(cw, 2, C.NOW + C.HOUR);
    await expectRefused(
      cw.w,
      atStage2,
      IS.teamOpenContestIx(first, cw.config, atStage2.campaign, 1),
      "ContestAlreadyOpen",
    );
  });

  test("contest act: byte 2 on a campaign not contested is refused with NotContested and writes nothing", async () => {
    const cw = await C.contestWorld();
    for (const status of [P.Status.InReview, P.Status.Open, P.Status.Settling]) {
      const c = await C.reviewed(cw, { status });
      await expectRefused(cw.w, c, IS.teamOpenContestIx(cw.team, cw.config, c.campaign, 2), "NotContested");
    }
  });

  test("contest act: any other byte or data length is BadInstructionData and writes nothing", async () => {
    const cw = await C.contestWorld();
    const c = await C.reviewed(cw);
    for (const bytes of [[], [0], [3], [255], [1, 0], [2, 2]]) {
      const ix = IS.teamOpenContestIx(cw.team, cw.config, c.campaign, Uint8Array.from(bytes));
      await expectRefused(cw.w, c, ix, "BadInstructionData");
    }
  });

  test("contest act: an opening and an escalation in one transaction leave the contest at stage 2", async () => {
    const cw = await C.contestWorld();
    const c = await C.reviewed(cw);
    const ixs = ([ContestStage.Stage1, ContestStage.Stage2] as const).map((stage) =>
      buildTeamOpenContest({ teamMember: cw.team, campaign: c.campaign, stage }),
    );
    const sent = expectOk(await send(cw.w, await Promise.all(ixs)));
    expect(sent.events.map((e) => [e.name, e.data.contestStage, e.data.contestEndsAt])).toEqual([
      ["ContestOpened", 1, C.NOW + C.STAGE1_SECONDS],
      ["ContestOpened", 2, C.NOW + C.STAGE2_SECONDS],
    ]);
    const after = readCampaign(cw.w, c.campaign);
    expect([after.status, after.contest_stage, after.contest_ends_at, after.event_seq]).toEqual([
      P.Status.Contested,
      2,
      C.NOW + C.STAGE2_SECONDS,
      C.SEQ + 2n,
    ]);
    expect([after.outcome, after.observed_value]).toEqual([P.Outcome.No, C.SUPPLY]);
  });
});
