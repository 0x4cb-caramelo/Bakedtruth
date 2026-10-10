/**
 * Purpose: the keeper's one task in the MVP: for an open campaign, offer `resolve_campaign` with the campaign's own
 *          metric account (the program's reader decides), simulate it, and send it only when the program accepts.
 *          A refusal of NotResolvableYet is the normal "not yet"; any other refusal is logged by name.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 */
import type { Address, TransactionSigner } from "@solana/kit";
import { address } from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";
import { buildResolveCampaign, simulate } from "@brot/sdk/tx";

import type { OpenCampaign } from "./campaigns";
import { buildMessage, signAndSend } from "./send";

export type Attempt = "resolved" | "wouldResolve" | "notYet" | "refused" | "failed";
export type AttemptResult = { attempt: Attempt; campaign: Address; detail: string | null };

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

export async function tryResolve(
  rpc: SolanaRpc,
  payer: TransactionSigner,
  dryRun: boolean,
  open: OpenCampaign,
): Promise<AttemptResult> {
  const campaign = address(open.address);
  const instruction = buildResolveCampaign({ campaign, metricAccount: open.campaign.metricAccount });
  const message = await buildMessage(rpc, payer, [instruction]);
  const decision = decide(await simulate(rpc, message), dryRun);
  if (decision.next === "record") return { attempt: decision.attempt, campaign, detail: decision.detail };
  const landed = await signAndSend(rpc, message);
  return landed.ok
    ? { attempt: "resolved", campaign, detail: landed.signature }
    : { attempt: "failed", campaign, detail: landed.error };
}
