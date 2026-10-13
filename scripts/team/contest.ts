/**
 * Purpose: `team_open_contest` with your own team key (TP §3.4.7; BP v0.0.4 part 1 §4.5): inside the review window, a
 *          team key contests the stored result; the campaign becomes `Contested` at stage 1 for 24 hours, its payouts
 *          held. A contest opens only once every join is tallied (`NotTallied`), so the entries not yet tallied go
 *          first (tally.ts). Then anyone re-reads (reread.ts): a different reading goes to the admin at once, the same
 *          one pays only after stage 1's 24 hours. Until then the same script, run again, sends the contest to stage 2
 *          (D2). At stage 2 the admin has 48 hours to confirm or void (decide.ts); then the stored result stands.
 * Version: 0.3.0 (the escalation, D2; Sprint 14: the contest is enabled, refused with ContestExitDisabled until then)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; 14 (lane INV14; lane L14B, D2)
 *
 *   TEAM_KEYPAIR=~/my-team-key.json bun run scripts/team/contest.ts <campaign> --cluster devnet [--yes]
 */
import { address, type Address } from "@solana/kit";

import { ContestStage, Outcome, Status, decodeCampaign } from "@brot/sdk/read";
import { buildTeamOpenContest } from "@brot/sdk/tx";

import { account } from "../validator/rpc";
import { contextFromCli, requireRole, runCli, type TeamContext } from "./common";
import { actAfterTallies } from "./tally";

export async function contest(ctx: TeamContext, campaign: Address) {
  await requireRole(ctx, "team");
  const found = await account(ctx.rpc, campaign);
  if (!found) throw new Error(`no campaign at ${campaign}`);
  const c = decodeCampaign(found);
  console.log(
    `campaign #${c.id}: ${Status[c.status]}, outcome ${Outcome[c.outcome]}, window ends at ${c.reviewEndsAt}`,
  );
  const escalation = c.status === Status.Contested;
  if (escalation) {
    const stage = `${ContestStage[c.contestStage]}, deadline ${c.contestEndsAt}`;
    console.log(`contested (${stage}): this sends it to stage 2, only at stage 1 and before its deadline`);
  } else if (c.status !== Status.InReview) console.log("note: only a campaign in review can be contested");
  const ix = await buildTeamOpenContest({ teamMember: ctx.signer, campaign });
  const result = await actAfterTallies(ctx, campaign, "team_open_contest", [ix]);
  if (result.sent && escalation)
    console.log("sent to stage 2: the admin confirms or voids with scripts/team/decide.ts");
  else if (result.sent) {
    console.log(
      "contested: re-read it with scripts/team/reread.ts (the same reading pays only after stage 1's 24 hours)",
    );
  }
  return result;
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, positionals } = await contextFromCli();
    if (!positionals[0]) throw new Error("usage: contest.ts <campaign address>");
    await contest(ctx, address(positionals[0]));
  });
}
