/**
 * Purpose: `team_confirm_result` with your own team key: ends a campaign's review window now; the snapshot runs
 *          at once and payouts can start (TP §3.4.7). Only inside the window, and it never inverts the outcome. The
 *          snapshot needs every join tallied (`NotTallied`), so the entries not yet tallied go first (tally.ts).
 * Version: 0.1.1 (Sprint 14: the late-join tally before the confirmation)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; 14 (lane INV14)
 *
 *   TEAM_KEYPAIR=~/my-team-key.json bun run scripts/team/confirm.ts <campaign> --cluster devnet [--yes]
 */
import { address, type Address } from "@solana/kit";

import { Outcome, Status, decodeCampaign } from "@brot/sdk/read";
import { buildTeamConfirmResult } from "@brot/sdk/tx";

import { account } from "../validator/rpc";
import { contextFromCli, requireRole, runCli, type TeamContext } from "./common";
import { actAfterTallies } from "./tally";

export async function confirm(ctx: TeamContext, campaign: Address) {
  await requireRole(ctx, "team");
  const found = await account(ctx.rpc, campaign);
  if (!found) throw new Error(`no campaign at ${campaign}`);
  const c = decodeCampaign(found);
  console.log(
    `campaign #${c.id}: ${Status[c.status]}, outcome ${Outcome[c.outcome]}, window ends at ${c.reviewEndsAt}`,
  );
  const ix = await buildTeamConfirmResult({ teamMember: ctx.signer, campaign });
  return actAfterTallies(ctx, campaign, "team_confirm_result", [ix]);
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, positionals } = await contextFromCli();
    if (!positionals[0]) throw new Error("usage: confirm.ts <campaign address>");
    await confirm(ctx, address(positionals[0]));
  });
}
