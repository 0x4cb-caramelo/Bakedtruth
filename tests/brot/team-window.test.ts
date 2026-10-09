/**
 * Purpose: the team's acts in the review window, on the binary: confirm, void with each reason, and contest.
 *          Each act is refused outside `InReview`, outside the window, to a signer who is not a team key, and
 *          with a reason the team may not choose; an automatic void is confirmed and never inverted.
 *          Run one with `bun test tests/ -t "void refunds and the opening fee follows the cause"`.
 * Version: 0.0.1
 * Sprint:  04 (lane A). Needs target/deploy/brot_markets.so, and lane C's `finalize_snapshot` for the
 *          successful paths (a stub refuses with UnknownInstruction). Written here, run at integration.
 */
import { describe, expect, test } from "bun:test";

import { initConfig, readCampaign, setTeam } from "./flows";
import * as I from "./instructions-settlement";
import * as P from "./program";
import { anyAddress, at, campaignOn, resolveWorld } from "./resolve-support";
import { START_TIME, accountData, expectError, expectOk, fundedWallet, send, type World } from "./setup";

const { Yes, No, Void } = P.Outcome;
const { MissedWindow, UnreadableAccount, StaleFeed, TeamHouseFailure, TeamOutsideCause, None } = P.VoidReason;
/** Contest stage 1 lasts one hour (TP section 3.4.7). */
const STAGE1_SECONDS = P.HOUR;
const REVIEW_ENDS = START_TIME + P.REVIEW_WINDOW_SECONDS;
const NOTE = new Uint8Array(32).fill(7);

/** A campaign with `outcome` in `status` (`InReview` unless told otherwise), its window ending at `REVIEW_ENDS`. */
async function reviewed(w: World, outcome: number, status: number = P.Status.InReview) {
  return campaignOn(w, P.ReaderKind.SupplyAtMost, await anyAddress(), 1_000_000n, {
    status,
    // A void always carries the reason `resolve_campaign` recorded; an automatic one is StaleFeed here.
    extra: {
      outcome,
      void_reason: outcome === Void ? StaleFeed : None,
      review_ends_at: REVIEW_ENDS,
      resolved_at: START_TIME,
      event_seq: 2n,
    },
  });
}

/** A world with a config, two team keys, a wallet that is no team key, and the clock inside the window. */
async function teamWorld() {
  const w = await resolveWorld();
  const { admin } = await initConfig(w);
  const [member, other] = await setTeam(w, admin, 2);
  const outsider = await fundedWallet(w);
  const config = await P.configPda();
  return { w, member, other, outsider, config };
}

describe("team window", () => {
  test("void refunds and the opening fee follows the cause: MissedWindow and TeamHouseFailure refund", async () => {
    const { w, member, config } = await teamWorld();
    for (const reason of [MissedWindow, TeamHouseFailure]) {
      const c = await reviewed(w, Yes);
      expectOk(await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason, noteHash: NOTE })]));
      const after = readCampaign(w, c.campaign);
      // This campaign has no entry: finalize settles it at once (decision of 2026-10-09).
      expect([after.status, after.outcome, after.void_reason]).toEqual([P.Status.Settled, Void, reason]);
    }
  });

  test("void refunds and the opening fee follows the cause: UnreadableAccount is refused, TeamOutsideCause keeps", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, No);
    const before = accountData(w, c.campaign);
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: UnreadableAccount, noteHash: NOTE })]),
      "VoidReasonNotForTeam",
    );
    expect(accountData(w, c.campaign)).toEqual(before);
    expectOk(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: TeamOutsideCause, noteHash: NOTE })]),
    );
    expect(readCampaign(w, c.campaign).void_reason).toBe(TeamOutsideCause);
  });

  test("void refunds and the opening fee follows the cause: StaleFeed is kept", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    expectOk(await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: StaleFeed, noteHash: NOTE })]));
    const after = readCampaign(w, c.campaign);
    expect([after.outcome, after.void_reason]).toEqual([Void, StaleFeed]);
  });

  test("void refunds and the opening fee follows the cause: no reason is not a void for the team", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: None, noteHash: NOTE })]),
      "VoidReasonNotForTeam",
    );
  });

  test("team window: a manual StaleFeed void after an update landed past the deadline", async () => {
    const { w, member, config } = await teamWorld();
    // resolve_campaign recorded No; the feed's update landed after its deadline, so the team voids by hand.
    const c = await reviewed(w, No);
    expectOk(await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: StaleFeed, noteHash: NOTE })]));
    expect(readCampaign(w, c.campaign).void_reason).toBe(StaleFeed);
  });

  test("team window: a manual MissedWindow void of a YES result", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    expectOk(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: MissedWindow, noteHash: NOTE })]),
    );
    expect(readCampaign(w, c.campaign).void_reason).toBe(MissedWindow);
  });

  test("team window: an automatic void is confirmed, never turned into YES or NO", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Void);
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: TeamOutsideCause, noteHash: NOTE })]),
      "AutomaticVoidNotInvertible",
    );
    expectOk(await send(w, [I.teamConfirmResultIx(member, config, c.campaign)]));
    expect(readCampaign(w, c.campaign).outcome).toBe(Void);
  });

  test("team window: confirm ends the window and the outcome stands", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    expectOk(await send(w, [I.teamConfirmResultIx(member, config, c.campaign)]));
    const after = readCampaign(w, c.campaign);
    // No entry: finalize settles the campaign at once, so the status is Settled.
    expect([after.status, after.outcome]).toEqual([P.Status.Settled, Yes]);
  });

  test("team window: a team key acts only in review", async () => {
    const { w, member, config } = await teamWorld();
    for (const status of [P.Status.Open, P.Status.Contested, P.Status.Settling]) {
      const c = await reviewed(w, Yes, status);
      expectError(await send(w, [I.teamConfirmResultIx(member, config, c.campaign)]), "TeamKeyOutsideReview");
      expectError(
        await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: MissedWindow, noteHash: NOTE })]),
        "TeamKeyOutsideReview",
      );
      expectError(await send(w, [I.teamOpenContestIx(member, config, c.campaign)]), "TeamKeyOutsideReview");
    }
  });

  test("team window: outside the window nobody voids", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    at(w, REVIEW_ENDS); // the instant the window closes
    expectError(await send(w, [I.teamConfirmResultIx(member, config, c.campaign)]), "OutsideReviewWindow");
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: MissedWindow, noteHash: NOTE })]),
      "OutsideReviewWindow",
    );
    expectError(await send(w, [I.teamOpenContestIx(member, config, c.campaign)]), "ContestOutsideReview");
  });

  test("team window: a signer who is not a team key is refused", async () => {
    const { w, outsider, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    expectError(await send(w, [I.teamConfirmResultIx(outsider, config, c.campaign)]), "NotTeamMember");
  });

  test("team window: team_open_contest moves InReview to Contested, and nothing leaves it", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    expectOk(await send(w, [I.teamOpenContestIx(member, config, c.campaign)]));
    const after = readCampaign(w, c.campaign);
    expect([after.status, after.contest_stage, after.contest_ends_at]).toEqual([
      P.Status.Contested,
      1, // ContestStage::Stage1
      START_TIME + STAGE1_SECONDS,
    ]);
    // Payout is paused: no team act leaves Contested in this sprint (ContestExitDisabled has no instruction yet).
    expectError(await send(w, [I.teamConfirmResultIx(member, config, c.campaign)]), "TeamKeyOutsideReview");
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: MissedWindow, noteHash: NOTE })]),
      "TeamKeyOutsideReview",
    );
  });

  test("team window: each act takes the campaign's next event number", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    expectOk(await send(w, [I.teamOpenContestIx(member, config, c.campaign)]));
    expect(readCampaign(w, c.campaign).event_seq).toBe(3n);
  });
});
