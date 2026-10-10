/**
 * Purpose: `ready(prepared)` for the SDK tests: the prepared transaction when `prepareJoin` or
 *          `prepareOpenCampaign` says ready, or a failure that names the stage that stopped it (the SDK's
 *          checks, with the program's error, or the simulation, with the cluster's).
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import type { PreparedJoin, PreparedOpening } from "@brot/sdk/tx";

export function ready<T extends PreparedJoin | PreparedOpening>(prepared: T): Extract<T, { ok: true }> {
  if (prepared.ok) return prepared as Extract<T, { ok: true }>;
  const why =
    prepared.stage === "check"
      ? prepared.check.refusal.errorName
      : (prepared.simulation.errorName ?? String(prepared.simulation.err));
  throw new Error(`not ready, stopped at the ${prepared.stage}: ${why}`);
}
