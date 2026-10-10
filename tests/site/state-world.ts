/**
 * Purpose: a campaign account written into the program's world in each public state the site shows (Sprint 12), for
 *          the render test and the web smoke: closed on time, closed because the answer is on-chain, in review,
 *          contested, paid (a split waiting for payout, a one-sided pot paid out, a pot nobody entered) and void (a
 *          house failure with the team's note hash, an outside cause, a stale feed, a pot nobody entered). Each is a
 *          BTC/USD campaign around the world's clock; the page reads it with its own loader.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { hexToBytes, Outcome, SettleMode, Status, VoidReason } from "@brot/sdk/read";

import { injectCampaign } from "../brot/campaigns";
import { BTC_PRICE, newId } from "../brot/flows";
import type { OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { now } from "../brot/setup";

export const PRIZE = 4_118_239_224n;
export const OPENING_FEE = 457_582_136n;
export const NOTE_HASH = "ab".repeat(32);
const NOBODY = "11111111111111111111111111111111";

export type StateName =
  | "closed"
  | "knowable"
  | "review"
  | "contested"
  | "split-waiting"
  | "one-sided"
  | "empty"
  | "void-house"
  | "void-outside"
  | "void-stale"
  | "void-empty";

const voided = (reason: VoidReason, more: Record<string, unknown> = {}) => ({
  outcome: Outcome.Void,
  void_reason: reason,
  settle_mode: SettleMode.Refund,
  prize_lamports: PRIZE,
  opening_fee_lamports: OPENING_FEE,
  ...more,
});

/** Each state: the status, the stored fields, and the target (the knowable one is already met). */
function shape(name: StateName, t: bigint): [number, Record<string, unknown>, bigint?] {
  switch (name) {
    case "closed":
      return [Status.Open, { closed: true }];
    case "knowable":
      return [Status.Open, {}, BTC_PRICE / 2n];
    case "review":
      return [Status.InReview, { outcome: Outcome.Yes, observed_value: BTC_PRICE, review_ends_at: t + 3n * P.HOUR }];
    case "contested":
      return [Status.Contested, { outcome: Outcome.No, contest_ends_at: t + 48n * P.HOUR, contest_stage: 1 }];
    case "split-waiting":
      return [Status.Settling, { outcome: Outcome.Yes, settle_mode: SettleMode.Split }];
    case "one-sided":
      return [
        Status.Settled,
        {
          outcome: Outcome.No,
          settle_mode: SettleMode.OneSided,
          prize_lamports: PRIZE,
          opening_fee_lamports: OPENING_FEE,
        },
      ];
    case "empty":
      return [
        Status.Settled,
        {
          outcome: Outcome.No,
          settle_mode: SettleMode.Refund,
          prize_lamports: PRIZE,
          first_baker: NOBODY,
          entries_open: 0,
        },
      ];
    case "void-house":
      return [Status.Settling, voided(VoidReason.TeamHouseFailure, { void_note_hash: hexToBytes(NOTE_HASH) })];
    case "void-outside":
      return [Status.Settled, voided(VoidReason.UnreadableAccount)];
    case "void-stale":
      return [Status.Settling, voided(VoidReason.StaleFeed)];
    case "void-empty":
      return [Status.Settled, voided(VoidReason.MissedWindow, { first_baker: NOBODY, entries_open: 0 })];
  }
}

/** A BTC/USD campaign in state `name` (with `extra` stored fields on top), opened by `creator`. */
export async function injectState(
  w: OpeningWorld,
  name: StateName,
  extra: Record<string, unknown> = {},
  creator = w.creator.address,
) {
  const t = now(w.client);
  const [status, fields, target] = shape(name, t);
  const { closed, ...stored } = { ...fields, ...extra } as Record<string, unknown>;
  const id = newId();
  const { campaign } = await injectCampaign(w.client, {
    id,
    kind: P.ReaderKind.PriceTouch,
    metric: P.BTC_USD_ACCOUNT,
    target: target ?? (BTC_PRICE * 11n) / 10n,
    creator,
    opensAt: t - 4n * P.DAY,
    entriesCloseAt: status === Status.Open && !closed ? t + P.DAY : t - P.DAY,
    deadlineAt: status === Status.Open ? t + 2n * P.DAY : t - P.HOUR,
    feedId: P.BTC_USD_FEED_ID,
    priceExponent: -8,
    maxAge: 120,
    status,
    poolYes: 600_000_000n,
    poolNo: 400_000_000n,
    extra: { first_baker: creator, ...stored },
  });
  return { id, campaign };
}
