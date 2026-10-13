/**
 * Purpose: what the site shows of a Meteora DBC launch curve (`DbcGraduated`), read through the SDK's copy of the
 *          program's reader (owner first, then the layout): the quote raised against the curve's threshold, which is the
 *          campaign's target, the share filled, what is still missing, whether the curve has completed and the second the
 *          pool stamped it, and what the program would record if it read the pool now (`stamped_resolution`).
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05 (docs/technical/meteora-readers-plan.md)
 */
import { curveGraduated, readCurvePool, type FetchedAccount } from "@brot/sdk/read";

export type CurveFacts = {
  /** The quote raised so far (`quote_reserve`), in lamports. */
  raised: bigint;
  /** The curve's threshold (`migration_quote_threshold`), the campaign's target, in lamports. */
  threshold: bigint;
  /** Basis points of the threshold raised, at most 10,000. */
  filledBps: number;
  /** Lamports still to raise before the curve completes; zero once it has. */
  missing: bigint;
  /** `migration_progress`: 0 on the curve, 1 to 3 once it completed. */
  stage: number;
  graduated: boolean;
  /** The second the curve completed, as the pool stamped it; `null` while it is open or when no stamp was written. */
  completedAt: bigint | null;
};

/** The curve's facts from its pool's bytes, against `threshold`; throws the reader's refusal on bytes it refuses. */
export function curveFacts(pool: FetchedAccount, threshold: bigint): CurveFacts {
  const read = readCurvePool(pool.owner, pool.data);
  const graduated = curveGraduated(read);
  const raised = read.quoteReserve;
  const filled = threshold > 0n ? (raised * 10_000n) / threshold : 10_000n;
  return {
    raised,
    threshold,
    filledBps: Number(filled > 10_000n ? 10_000n : filled),
    missing: raised >= threshold ? 0n : threshold - raised,
    stage: read.stage,
    graduated,
    completedAt: graduated && read.finishCurveTimestamp > 0n ? read.finishCurveTimestamp : null,
  };
}

/**
 * What the program would record if it read the pool now: YES once the curve completed, up to the deadline; after it, YES
 * only when the pool's stamp is at or before the deadline (a later stamp, or none, is NO flagged met late).
 */
export function curveIfReadNow(facts: CurveFacts, deadlineAt: bigint, now: bigint): "YES" | "NO" {
  if (!facts.graduated) return "NO";
  if (now <= deadlineAt) return "YES";
  return facts.completedAt !== null && facts.completedAt <= deadlineAt ? "YES" : "NO";
}

/** The share filled as the page writes it, never rounded up to look complete: "0.02%", "1.5%", "47.5%", "99.9%". */
export function filledText(filledBps: number): string {
  const percent = filledBps >= 1_000 ? Math.floor(filledBps / 10) / 10 : filledBps / 100;
  return `${percent}%`;
}
