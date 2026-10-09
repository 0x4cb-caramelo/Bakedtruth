/**
 * Purpose: `team_confirm_result` with your own team key: ends a campaign's review window now; the snapshot runs
 *          at once and payouts can start (TP §3.4.7). Only inside the window, and it never inverts the outcome.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 *   TEAM_KEYPAIR=~/my-team-key.json bun run scripts/team/confirm.ts <campaign> --cluster devnet [--yes]
 */
import { address, type Address } from "@solana/kit";

import { Outcome, Status, decodeCampaign } from "@brot/sdk/read";
import { buildTeamConfirmResult } from "@brot/sdk/tx";

import { account } from "../validator/rpc";
import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";

export async function confirm(ctx: TeamContext, campaign: Address) {
  await requireRole(ctx, "team");
  const found = await account(ctx.rpc, campaign);
  if (!found) throw new Error(`no campaign at ${campaign}`);
  const c = decodeCampaign(found);
  console.log(
    `campaign #${c.id}: ${Status[c.status]}, outcome ${Outcome[c.outcome]}, window ends at ${c.reviewEndsAt}`,
  );
  return act(ctx, "team_confirm_result", [await buildTeamConfirmResult({ teamMember: ctx.signer, campaign })]);
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, positionals } = await contextFromCli();
    if (!positionals[0]) throw new Error("usage: confirm.ts <campaign address>");
    await confirm(ctx, address(positionals[0]));
  });
}
