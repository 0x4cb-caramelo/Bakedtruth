/**
 * Purpose: `admin_resume_entries` with the admin's key: ends a pause (`EntriesHalted` to `Normal`). The admin's
 *          act, not a team key's (TP §3.4.9); on mainnet it is the 2-of-3 multisig's.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 *   TEAM_KEYPAIR=~/admin-key.json bun run scripts/team/resume.ts --cluster devnet [--yes]
 */
import { OperatingLevel } from "@brot/sdk/read";
import { buildResumeEntries } from "@brot/sdk/tx";

import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";

export async function resume(ctx: TeamContext) {
  const config = await requireRole(ctx, "admin");
  console.log(`entries now: ${OperatingLevel[config.operatingLevel]}`);
  return act(ctx, "admin_resume_entries", [await buildResumeEntries({ admin: ctx.signer })]);
}

if (import.meta.main) runCli(async () => resume((await contextFromCli()).ctx));
