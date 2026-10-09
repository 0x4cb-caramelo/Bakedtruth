/**
 * Purpose: `admin_set_creation_params` with the admin's key: the new parameters from a reviewed JSON file (the
 *          format of deploy/devnet/init-params.json), each change shown against the stored config before
 *          anything is sent, and --yes required. Future campaigns only; each change raises `params_version`, so a
 *          creator who previewed the old terms is refused with `CreationParamsChanged` (TP §3.4.1, §3.4.10 row 8).
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 *   TEAM_KEYPAIR=~/admin-key.json bun run scripts/team/set-params.ts <params.json> --cluster devnet [--yes]
 */
import { bytesToHex, type GlobalConfig } from "@brot/sdk/read";
import { buildSetCreationParams, type CreationParamsArgs } from "@brot/sdk/tx";

import { readInitParams } from "../deploy/initialize";
import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";

const shown = (value: unknown) =>
  typeof value === "object" && value !== null ? bytesToHex(value as Uint8Array) : String(value);

/** The fields that change, as `name: old -> new`. */
export function paramsDiff(current: GlobalConfig["params"], next: CreationParamsArgs): string[] {
  return Object.entries(next)
    .map(([name, value]) => [name, shown((current as Record<string, unknown>)[name]), shown(value)] as const)
    .filter(([, before, after]) => before !== after)
    .map(([name, before, after]) => `${name}: ${before} -> ${after}`);
}

export async function setParams(ctx: TeamContext, params: CreationParamsArgs) {
  const config = await requireRole(ctx, "admin");
  const diff = paramsDiff(config.params, params);
  if (diff.length === 0) throw new Error("no parameter changes: nothing to send");
  console.log(`params_version ${config.paramsVersion} -> ${config.paramsVersion + 1}:\n  ${diff.join("\n  ")}`);
  return act(ctx, "admin_set_creation_params", [await buildSetCreationParams({ admin: ctx.signer, params })]);
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, positionals } = await contextFromCli();
    if (!positionals[0]) throw new Error("usage: set-params.ts <params.json>");
    await setParams(ctx, readInitParams(positionals[0]));
  });
}
