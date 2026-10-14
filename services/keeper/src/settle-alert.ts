/**
 * Purpose: the settlement's money-invariant alert (Sprint 16, the second pre-freeze review's R1): a settlement step the
 *          program refused, or that failed on chain, because the campaign's books disagree with its vault or its
 *          snapshot (`InvariantViolated` 6101, `PaidOutAboveSnapshot` 6179, `EntryPayoutAboveShare` 6180) raises
 *          `settle_invariant`, once per campaign and process. Such a refusal never clears by retrying; before this the
 *          keeper only wrote a `settle-refused` journal line and backed off. Runbook: deploy/vps/runbooks/.
 * Version: 0.0.1
 * Sprint:  16 (lane L16P)
 */
import { BROT_ERROR_CODES, errorName } from "@brot/sdk/read";

import type { Alerter } from "./alert";
import type { ItemResult } from "./landing";

/** The refusals that mean a campaign's books disagree with its vault or its snapshot. */
export const INVARIANT_CODES: ReadonlySet<number> = new Set([
  BROT_ERROR_CODES.InvariantViolated,
  BROT_ERROR_CODES.PaidOutAboveSnapshot,
  BROT_ERROR_CODES.EntryPayoutAboveShare,
]);

/** Where the alert goes, and the campaigns it was already raised for in this process. */
export type InvariantAlerts = { alerter: Alerter; raised: Set<string> };

/** The first result of `results` the program refused for a money invariant, or `undefined`. */
export function invariantRefusal(results: readonly ItemResult[]): ItemResult | undefined {
  return results.find(
    (result) =>
      (result.outcome === "refused" || result.outcome === "failed") &&
      typeof result.code === "number" &&
      INVARIANT_CODES.has(result.code),
  );
}

/** Raises `settle_invariant` for `campaign` at its first such refusal; true when an alert line was written. */
export function alertInvariants(
  alerts: InvariantAlerts | undefined,
  campaign: string,
  results: readonly ItemResult[],
): boolean {
  if (!alerts || alerts.raised.has(campaign)) return false;
  const refusal = invariantRefusal(results);
  if (!refusal || typeof refusal.code !== "number") return false;
  alerts.raised.add(campaign);
  return alerts.alerter.alert("settle_invariant", campaign, {
    step: refusal.key,
    code: refusal.code,
    error: errorName(refusal.code) ?? null,
  });
}
