/**
 * Purpose: `team_pause_entries` with your own team key: stops joins and openings at once, never payouts or
 *          refunds (TP §3.4.9). One team key is enough, to be fast; only the admin resumes (resume.ts).
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 *   TEAM_KEYPAIR=~/my-team-key.json bun run scripts/team/pause.ts --cluster devnet [--yes]
 */
import { OperatingLevel } from "@brot/sdk/read";
import { buildPauseEntries } from "@brot/sdk/tx";

import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";

export async function pause(ctx: TeamContext) {
  const config = await requireRole(ctx, "team");
  console.log(`entries now: ${OperatingLevel[config.operatingLevel]}`);
  return act(ctx, "team_pause_entries", [await buildPauseEntries({ teamMember: ctx.signer })]);
}

if (import.meta.main) runCli(async () => pause((await contextFromCli()).ctx));
