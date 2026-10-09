/**
 * Purpose: `admin_set_team` with the admin's key: up to five team keys, one per person (Q12; Lucas, Ronaldo and
 *          Bernardo, founder answer 6, 2026-10-09), shown against the stored team first, --yes required. Run at
 *          once after the deploy's initialization, which leaves the team empty (nobody can pause until then); and
 *          to remove a leaked team key (TP §3.4.9).
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 *   TEAM_KEYPAIR=~/admin-key.json bun run scripts/team/set-team.ts --team <key1>,<key2>,<key3> --cluster devnet [--yes]
 */
import { type Address } from "@solana/kit";

import { teamOf } from "@brot/sdk/read";
import { buildSetTeam } from "@brot/sdk/tx";

import { parseTeam } from "../deploy/initialize";
import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";

export async function setTeamKeys(ctx: TeamContext, team: Address[]) {
  if (team.length < 1 || team.length > 5) throw new Error("one to five team keys");
  const config = await requireRole(ctx, "admin");
  const before = teamOf(config);
  console.log(`team now:  ${before.join(", ") || "(empty)"}\nteam next: ${team.join(", ")}`);
  for (const key of before.filter((k) => !team.includes(k))) console.log(`  removed: ${key}`);
  return act(ctx, "admin_set_team", [await buildSetTeam({ admin: ctx.signer, team })]);
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, values } = await contextFromCli({ team: { type: "string" } });
    if (!values.team) throw new Error("usage: set-team.ts --team <key1>,<key2>,...");
    await setTeamKeys(ctx, parseTeam(String(values.team)));
  });
}
