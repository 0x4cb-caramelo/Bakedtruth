/**
 * Purpose: what the team's confirm and void emit, on the binary (TP sections 3.4.3, 3.4.14): their own event
 *          (`ResultConfirmed`, `CampaignVoided`) with the campaign's next seq, then `CampaignFinalized` with the
 *          one after, its fields those the snapshot stored, as `finalize_campaign` builds them. The Sprint 05
 *          review found the second event missing: an indexer that follows events lost these snapshots.
 *          Run one with `bun test tests/ -t "team window events"`.
 * Version: 0.0.1
 * Sprint:  04 (the CampaignFinalized fix, after Sprint 05's review). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import { initConfig, readCampaign, setTeam } from "./flows";
import * as I from "./instructions-settlement";
import * as P from "./program";
import { anyAddress, campaignOn, resolveWorld } from "./resolve-support";
import { START_TIME, expectOk, send, type World } from "./setup";

const { Yes, Void } = P.Outcome;
const REVIEW_ENDS = START_TIME + P.REVIEW_WINDOW_SECONDS;
const NOTE = new Uint8Array(32).fill(9);
const SEQ = 5n;
const SPLIT = 1; // SettleMode::Split (state/enums.rs)

/** A price campaign in review with two open entries, its window open, its next event number `SEQ`. */
async function inReview(w: World, extra: Record<string, unknown>) {
  return campaignOn(w, P.ReaderKind.PriceTouch, await anyAddress(), 1_000_000n, {
    status: P.Status.InReview,
    poolYes: 2n * P.SOL,
    poolNo: P.SOL,
    extra: { review_ends_at: REVIEW_ENDS, resolved_at: START_TIME, entries_open: 2, event_seq: SEQ, ...extra },
  });
}

/** A config with one team key, the clock inside the window. */
async function teamWorld() {
  const w = await resolveWorld();
  const { admin } = await initConfig(w);
  const [member] = await setTeam(w, admin, 1);
  return { w, member, config: await P.configPda() };
}

/** `CampaignFinalized` as `finalize_campaign` builds it from the snapshot stored in `campaign`. */
function finalizedFrom(w: World, campaign: Address, seq: bigint) {
  const stored = readCampaign(w, campaign);
  return {
    campaign,
    seq,
    settle_mode: stored.settle_mode,
    winning_total: stored.winning_total,
    losing_total: stored.losing_total,
    refunded_late: stored.late_yes + stored.late_no,
    fee_total: stored.fee_total,
    from_pot: stored.creator_share - stored.creator_share_from_fee,
    from_fee: stored.creator_share_from_fee,
    distributable: stored.distributable,
  };
}

describe("team window events", () => {
  test("team window events: a confirm emits ResultConfirmed, then CampaignFinalized with the stored snapshot", async () => {
    const { w, member, config } = await teamWorld();
    // A YES price proof with a quarter SOL of late YES joins, refunded whole: every field of the snapshot moves.
    const late = P.SOL / 4n;
    const c = await inReview(w, { outcome: Yes, publish_time: START_TIME - 30n, late_yes: late });
    const sent = expectOk(await send(w, [I.teamConfirmResultIx(member, config, c.campaign)]));
    console.log(`team_confirm_result: ${sent.computeUnits} CU`);

    expect(sent.events.map((e) => [e.name, e.data.seq])).toEqual([
      ["ResultConfirmed", SEQ],
      ["CampaignFinalized", SEQ + 1n],
    ]);
    expect(sent.events[0].data).toEqual({ campaign: c.campaign, seq: SEQ, signer: member.address, outcome: Yes });
    const finalized = finalizedFrom(w, c.campaign, SEQ + 1n);
    expect(sent.events[1].data).toEqual(finalized);
    // Not an empty snapshot that any zeroed event would match.
    expect([finalized.settle_mode, finalized.winning_total, finalized.losing_total, finalized.refunded_late]).toEqual([
      SPLIT,
      2n * P.SOL - late,
      P.SOL,
      late,
    ]);
    expect([finalized.fee_total, finalized.from_pot, finalized.distributable].every((v) => v > 0n)).toBe(true);
    const after = readCampaign(w, c.campaign);
    expect([after.status, after.event_seq]).toEqual([P.Status.Settling, SEQ + 2n]);
  });

  test("team window events: a void emits CampaignVoided, then CampaignFinalized with the stored snapshot", async () => {
    const { w, member, config } = await teamWorld();
    const c = await inReview(w, { outcome: Void, void_reason: P.VoidReason.StaleFeed });
    const reason = P.VoidReason.TeamOutsideCause;
    const ix = I.teamVoidCampaignIx(member, config, c.campaign, { reason, noteHash: NOTE });
    const sent = expectOk(await send(w, [ix]));
    console.log(`team_void_campaign: ${sent.computeUnits} CU`);

    expect(sent.events.map((e) => [e.name, e.data.seq])).toEqual([
      ["CampaignVoided", SEQ],
      ["CampaignFinalized", SEQ + 1n],
    ]);
    expect(sent.events[0].data).toEqual({
      campaign: c.campaign,
      seq: SEQ,
      signer: member.address,
      void_reason: reason,
      note_hash: NOTE,
    });
    const finalized = finalizedFrom(w, c.campaign, SEQ + 1n);
    expect(sent.events[1].data).toEqual(finalized);
    expect(finalized.settle_mode).not.toBe(0); // SettleMode::Unset: the snapshot has run
    const after = readCampaign(w, c.campaign);
    expect([after.status, after.outcome, after.void_reason, after.event_seq]).toEqual([
      P.Status.Settling,
      Void,
      reason,
      SEQ + 2n,
    ]);
  });
});
