/**
 * Purpose: what the team scripts share (Sprint 05 DoD, `scripts/team/`): your own key from TEAM_KEYPAIR (each
 *          person uses theirs; nobody shares one), the cluster named on purpose, the role checked against the
 *          stored config before anything is built (a team key, or the admin for admin acts), and every act
 *          simulated first and sent only with --yes, so a wrong command shows the program's answer and changes
 *          nothing.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Usage: `bun run scripts/team/<act>.ts [args] --cluster devnet [--url ...] [--yes]`. The acts run against a
 * cluster where the program is deployed; scripts/team/rehearse.ts runs each one on a local offline surfnet.
 */
import { parseArgs } from "node:util";

import { type Instruction, type KeyPairSigner } from "@solana/kit";

import { configAddress, decodeGlobalConfig, isTeamKey, type GlobalConfig } from "@brot/sdk/read";

import { clusterArgs, openCluster } from "../validator/clusters";
import { keypairFromEnv } from "../validator/keys";
import { account, send, type Rpc, type Sent } from "../validator/rpc";
import { simulate, type Simulated } from "../validator/simulate";

/** Who acts and where: the person's own key, the cluster, and whether to send after the simulation. */
export type TeamContext = { rpc: Rpc; signer: KeyPairSigner; yes: boolean };
export type Role = "team" | "admin";

/** The context from the command line and TEAM_KEYPAIR; positionals and flags are returned for the act. */
export async function contextFromCli(flags: Record<string, { type: "string" | "boolean" }> = {}) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { ...flags, url: { type: "string" }, cluster: { type: "string" }, yes: { type: "boolean" } },
  });
  const { url, cluster } = clusterArgs();
  const rpc = await openCluster(url, cluster);
  const signer = await keypairFromEnv("TEAM_KEYPAIR");
  console.log(`acting as ${signer.address} (TEAM_KEYPAIR)`);
  const flagValues = values as Record<string, string | boolean | undefined>;
  return { ctx: { rpc, signer, yes: values.yes === true } as TeamContext, values: flagValues, positionals };
}

/** The stored config, refused unless the signer holds `role` in it. */
export async function requireRole(ctx: TeamContext, role: Role): Promise<GlobalConfig> {
  const found = await account(ctx.rpc, await configAddress());
  if (!found) throw new Error("no config on this cluster: the program is not initialized");
  const config = decodeGlobalConfig(found);
  if (role === "admin" && config.admin !== ctx.signer.address) {
    throw new Error(`${ctx.signer.address} is not the admin (${config.admin}): this act is the admin's`);
  }
  if (role === "team" && !isTeamKey(config, ctx.signer.address)) {
    throw new Error(`${ctx.signer.address} is not one of the config's team keys`);
  }
  return config;
}

/**
 * Simulates `ixs` and prints the program's answer; sends only when the context says --yes and `simulateOnly`
 * is not set. Returns what was sent, or the simulation.
 */
export async function act(
  ctx: TeamContext,
  label: string,
  ixs: Instruction[],
  options: { simulateOnly?: boolean } = {},
): Promise<{ simulated: Simulated; sent: Sent | null }> {
  const simulated = await simulate(ctx.rpc, ctx.signer, ixs);
  console.log(`simulation of ${label}: ${simulated.ok ? "ok" : `refused, ${simulated.error}`} (${simulated.units} CU)`);
  if (options.simulateOnly || !ctx.yes) {
    if (!options.simulateOnly) console.log("nothing sent: add --yes to send it");
    return { simulated, sent: null };
  }
  if (!simulated.ok) throw new Error(`${label} would be refused (${simulated.error}): not sent`);
  const sent = await send(ctx.rpc, ctx.signer, ixs);
  if (!sent.ok) throw new Error(`${label} failed on the ledger: ${sent.error} (${sent.signature})`);
  console.log(`sent ${label}: ${sent.signature}; events ${sent.events.map((e) => e.name).join(", ") || "none"}`);
  return { simulated, sent };
}

/** Runs a script's `main`, printing a failure and exiting 1. */
export function runCli(main: () => Promise<unknown>) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
