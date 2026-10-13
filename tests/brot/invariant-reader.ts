/**
 * Purpose: the price reader's decision on the harness's own BTC/USD account, for the contest's re-read (TP sections
 *          3.4.6, 3.4.7): the account a re-read finds (the stored reading again, or moved) and what the reader
 *          decides from it now, so the model knows whether the reading is the same as the stored one.
 * Version: 0.1.0
 * Sprint:  14 (lane INV14)
 */
import { BTC_PRICE } from "./flows";
import { inProofWindow, type ModelCampaign, type Outcome } from "./invariant-model";
import { TARGET } from "./invariant-open";
import { PROOF_AGE, STALE_BEFORE, TOUCH } from "./invariant-review";

/** The account a re-read finds: as resolution read it (`same`), moved, or as read with no proof offered (`none`). */
export type RereadVariant = "same" | "moved" | "none";
/** The stale-feed rule's floor, `max(max_age, STALE_FEED_MIN_SECONDS)` for the harness's campaigns. */
const STALE_AGE = 600n;

/** A reading as the price reader decides it: null when it decides nothing (no proof yet, or a refused proof). */
export type Reading = { outcome: Outcome; voidReason: number; observed: bigint } | null;
export type Account = { price: bigint; publish: bigint };

/**
 * readers/price_touch/proof.rs on the harness's own accounts: up to `deadline + 60 s` only a YES proof decides,
 * published in `[opens_at, deadline]`, at most 60 s from the clock, across the target; after it, the sponsored account
 * gives NO, or `StaleFeed` when its last update is at or before the deadline and older than the stale age.
 */
export function priceReading(c: ModelCampaign, t: bigint, account: Account, offered: boolean): Reading {
  if (inProofWindow(c, t)) {
    if (!offered) return null;
    const p = account.publish;
    const fresh = t - p <= PROOF_AGE && p - t <= PROOF_AGE;
    if (p < c.opensAt || p > c.deadline || !fresh || account.price < TARGET) return null;
    return { outcome: "Yes", voidReason: 0, observed: account.price };
  }
  const stale = account.publish <= c.deadline && account.publish < c.deadline - STALE_AGE;
  return { outcome: stale ? "Void" : "No", voidReason: stale ? 3 : 0, observed: account.price };
}

/** The sponsored account a re-read finds: the stored reading again (`same`, `none`), or a moved one (`moved`). */
export function rereadAccount(c: ModelCampaign, t: bigint, op: { variant: RereadVariant; back: bigint }): Account {
  const moved = op.variant === "moved";
  if (c.outcome === "Yes" && inProofWindow(c, t)) {
    const back = op.back < t - c.opensAt ? op.back : t - c.opensAt;
    const publish = t - back > c.deadline ? c.deadline : t - back;
    return { price: moved ? TOUCH + 1n : TOUCH, publish };
  }
  if (c.outcome === "Void") return { price: BTC_PRICE, publish: moved ? t - 5n : c.deadline - STALE_BEFORE };
  return { price: moved ? BTC_PRICE + 1n : BTC_PRICE, publish: t - 5n };
}
