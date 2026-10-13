/**
 * Purpose: the resolve task: for an open campaign, offer `resolve_campaign` with the campaign's own metric account
 *          (the program's reader decides), simulate it, and send it only when the program accepts, with the compute
 *          limit and the bounded priority fee of landing.ts. A refusal of NotResolvableYet is the normal "not yet";
 *          any other refusal is logged by name. `resolvable` says the program accepted the simulation, whether or not
 *          this keeper then sent (a dry run, a closed standby gate): the idle watch reads it.
 * Version: 0.2.0 (the landing path: compute limit, priority fee; `resolvable` for the idle alert)
 * Sprint:  06 (server and primary keeper), MVP happy path; 07 carry-over
 */
import type { Address } from "@solana/kit";
import { address } from "@solana/kit";
import { buildResolveCampaign, simulate } from "@brot/sdk/tx";

import type { OpenCampaign } from "./campaigns";
import { sendPassing, type LandingContext } from "./landing";
import { buildMessage } from "./send";

export type Attempt = "resolved" | "wouldResolve" | "notYet" | "refused" | "failed";
export type AttemptResult = { attempt: Attempt; campaign: Address; detail: string | null; resolvable?: boolean };

/**
 * What the keeper does with a simulation: send it, or record why it did not. The only send is a simulation the
 * program accepts, and never in a dry run. NotResolvableYet is the normal "not yet"; any other named refusal is
 * recorded by name; a simulation with no name (a missing account, an empty fee payer) is a failure.
 */
export function decide(
  sim: { ok: boolean; errorName: string | null; err?: unknown },
  dryRun: boolean,
): { next: "send" } | { next: "record"; attempt: Attempt; detail: string | null } {
  if (sim.ok) return dryRun ? { next: "record", attempt: "wouldResolve", detail: null } : { next: "send" };
  if (sim.errorName === "NotResolvableYet") return { next: "record", attempt: "notYet", detail: null };
  if (sim.errorName) return { next: "record", attempt: "refused", detail: sim.errorName };
  const err = JSON.stringify(sim.err ?? null, (_, value) => (typeof value === "bigint" ? value.toString() : value));
  return { next: "record", attempt: "failed", detail: `simulation failed before any send: ${err}` };
}

export async function tryResolve(ctx: LandingContext, open: OpenCampaign): Promise<AttemptResult> {
  const campaign = address(open.address);
  const instruction = buildResolveCampaign({ campaign, metricAccount: open.campaign.metricAccount });
  const sim = await simulate(ctx.rpc, await buildMessage(ctx.rpc, ctx.payer, [instruction]));
  const decision = decide(sim, ctx.dryRun);
  if (decision.next === "record") {
    return { attempt: decision.attempt, campaign, detail: decision.detail, resolvable: sim.ok };
  }
  const landed = await sendPassing(ctx, [{ key: `resolve:${campaign}`, kind: "resolve", ix: instruction }], sim);
  return landed.ok
    ? { attempt: "resolved", campaign, detail: landed.signature, resolvable: true }
    : { attempt: "failed", campaign, detail: landed.error, resolvable: true };
}
