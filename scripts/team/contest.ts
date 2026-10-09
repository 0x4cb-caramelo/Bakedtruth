/**
 * Purpose: `team_open_contest`, SIMULATED ONLY: the program refuses it with `ContestExitDisabled` until Sprint 14
 *          (decision of 2026-10-09: a contest would freeze the pot with no exit before `reread_campaign` and
 *          `admin_decide_contest` exist). The script shows the program's answer and never sends, even with --yes.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 *   TEAM_KEYPAIR=~/my-team-key.json bun run scripts/team/contest.ts <campaign> --cluster devnet
 */
import { address, type Address } from "@solana/kit";

import { buildTeamOpenContest } from "@brot/sdk/tx";

import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";

export async function contest(ctx: TeamContext, campaign: Address) {
  await requireRole(ctx, "team");
  const ix = await buildTeamOpenContest({ teamMember: ctx.signer, campaign });
  const result = await act(ctx, "team_open_contest", [ix], { simulateOnly: true });
  console.log("contests open in Sprint 14; until then use confirm (or void, for an automatic void)");
  return result;
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, positionals } = await contextFromCli();
    if (!positionals[0]) throw new Error("usage: contest.ts <campaign address>");
    await contest(ctx, address(positionals[0]));
  });
}
