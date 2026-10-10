/**
 * Purpose: the team's acts in the review window, on the binary: confirm, void (an automatic void only: a team key
 *          never voids a YES or NO, decision of 2026-10-09), and contest (disabled until Sprint 14). Each act is
 *          refused outside `InReview`, outside the window, to a signer who is not a team key, and with a reason
 *          the team may not choose.
 *          Run one with `bun test tests/ -t "void refunds and the opening fee follows the cause"`.
 * Version: 0.0.3 (a void now takes two event numbers: `CampaignFinalized` follows `CampaignVoided`)
 * Sprint:  04 (lane A; team void and contest restricted at the closure review). Needs target/deploy/brot_markets.so, and lane C's `finalize_snapshot` for the
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
const REVIEW_ENDS = START_TIME + P.REVIEW_WINDOW_SECONDS;
const NOTE = new Uint8Array(32).fill(7);

/** A campaign with `outcome` in `status` (`InReview` unless told otherwise), its window ending at `REVIEW_ENDS`. */
async function reviewed(w: World, outcome: number, status: number = P.Status.InReview) {
  return campaignOn(w, P.ReaderKind.SupplyAtMost, await anyAddress(), 1_000_000n, {
    status,
    extra: {
      outcome,
      void_reason: outcome === Void ? StaleFeed : None,
      review_ends_at: REVIEW_ENDS,
      resolved_at: START_TIME,
      event_seq: 2n,
    },
  });
}

/** An automatic void: `resolve_campaign` recorded a void with `reason`; the team may confirm it or record its own reason. */
async function automatic(w: World, reason: number = StaleFeed) {
  return campaignOn(w, P.ReaderKind.SupplyAtMost, await anyAddress(), 1_000_000n, {
    status: P.Status.InReview,
    extra: { outcome: Void, void_reason: reason, review_ends_at: REVIEW_ENDS, resolved_at: START_TIME, event_seq: 2n },
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
      const c = await automatic(w, StaleFeed);
      expectOk(await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason, noteHash: NOTE })]));
      const after = readCampaign(w, c.campaign);
      // This campaign has no entry: finalize settles it at once (decision of 2026-10-09).
      expect([after.status, after.outcome, after.void_reason]).toEqual([P.Status.Settled, Void, reason]);
    }
  });

  test("void refunds and the opening fee follows the cause: UnreadableAccount is refused, TeamOutsideCause keeps", async () => {
    const { w, member, config } = await teamWorld();
    const c = await automatic(w, UnreadableAccount);
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
    const c = await automatic(w, StaleFeed);
    expectOk(await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: StaleFeed, noteHash: NOTE })]));
    const after = readCampaign(w, c.campaign);
    expect([after.outcome, after.void_reason]).toEqual([Void, StaleFeed]);
  });

  test("void refunds and the opening fee follows the cause: no reason is not a void for the team", async () => {
    const { w, member, config } = await teamWorld();
    const c = await automatic(w, StaleFeed);
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: None, noteHash: NOTE })]),
      "VoidReasonNotForTeam",
    );
  });

  test("team window: a team key never voids a YES or a NO result (decision of 2026-10-09)", async () => {
    const { w, member, config } = await teamWorld();
    const yes = await reviewed(w, Yes);
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, yes.campaign, { reason: StaleFeed, noteHash: NOTE })]),
      "TeamVoidNotAutomatic",
    );
    const no = await reviewed(w, No);
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, no.campaign, { reason: MissedWindow, noteHash: NOTE })]),
      "TeamVoidNotAutomatic",
    );
    expect(readCampaign(w, yes.campaign).outcome).toBe(Yes);
    expect(readCampaign(w, no.campaign).outcome).toBe(No);
  });

  test("team window: an automatic void is confirmed or given the team's reason, never turned into YES or NO", async () => {
    const { w, member, config } = await teamWorld();
    const c = await automatic(w, StaleFeed);
    expectOk(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: TeamOutsideCause, noteHash: NOTE })]),
    );
    expect([readCampaign(w, c.campaign).outcome, readCampaign(w, c.campaign).void_reason]).toEqual([
      Void,
      TeamOutsideCause,
    ]);
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
    }
  });

  test("team window: outside the window nobody voids", async () => {
    const { w, member, config } = await teamWorld();
    const c = await automatic(w, StaleFeed);
    at(w, REVIEW_ENDS); // the instant the window closes
    expectError(await send(w, [I.teamConfirmResultIx(member, config, c.campaign)]), "OutsideReviewWindow");
    expectError(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: MissedWindow, noteHash: NOTE })]),
      "OutsideReviewWindow",
    );
  });

  test("team window: a signer who is not a team key is refused", async () => {
    const { w, outsider, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    expectError(await send(w, [I.teamConfirmResultIx(outsider, config, c.campaign)]), "NotTeamMember");
  });

  test("team window: team_open_contest is disabled until Sprint 14 and changes nothing", async () => {
    const { w, member, config } = await teamWorld();
    const c = await reviewed(w, Yes);
    const before = accountData(w, c.campaign);
    expectError(await send(w, [I.teamOpenContestIx(member, config, c.campaign)]), "ContestExitDisabled");
    expect(accountData(w, c.campaign)).toEqual(before);
    expect(readCampaign(w, c.campaign).status).toBe(P.Status.InReview);
  });

  test("team window: each act takes the campaign's next event number", async () => {
    const { w, member, config } = await teamWorld();
    const c = await automatic(w, StaleFeed);
    expectOk(
      await send(w, [I.teamVoidCampaignIx(member, config, c.campaign, { reason: TeamOutsideCause, noteHash: NOTE })]),
    );
    // Two events, two numbers: CampaignVoided takes 2, CampaignFinalized 3 (team-window-events.test.ts).
    expect(readCampaign(w, c.campaign).event_seq).toBe(4n);
  });
});
