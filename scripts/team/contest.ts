/**
 * Purpose: `team_open_contest(stage)` with your own team key (TP §3.4.7; BP v0.0.4 part 1 §4.5). The act is the
 *          signed byte (the second review's S1), never the campaign's status, so a re-run of this command, or a
 *          second team member's run on the same alert, never escalates. By default it opens a contest (byte 1):
 *          inside the review window the campaign becomes `Contested` at stage 1 for 24 hours, its payouts held, and a
 *          campaign already contested refuses it (`ContestAlreadyOpen`). A contest opens only once every join is
 *          tallied (`NotTallied`), so the entries not yet tallied go first (tally.ts). Then anyone re-reads
 *          (reread.ts): a different reading goes to the admin at once, the same one pays only after stage 1's 24
 *          hours. `--escalate` sends a contest still at stage 1 to the admin (byte 2, D2); on a campaign still in
 *          review it opens and sends in ONE transaction (the runbook's "reader in doubt": a cluster halt must not eat
 *          the team's 24 hours). At stage 2 the admin has 48 hours to confirm or void (decide.ts); then the stored
 *          result stands. The SDK's summary of the signed bytes is printed before the simulation, and nothing is sent
 *          without --yes.
 * Version: 0.4.0 (the act in its byte and --escalate, S1; the escalation, D2; the contest enabled in Sprint 14)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; 14 (lane INV14; lane L14B, D2 and S1)
 *
 *   TEAM_KEYPAIR=~/my-team-key.json bun run scripts/team/contest.ts <campaign> [--escalate] --cluster devnet [--yes]
 */
import { address, type Address } from "@solana/kit";

import { ContestStage, Outcome, Status, decodeCampaign } from "@brot/sdk/read";
import { buildTeamOpenContest, summarizeInstructions } from "@brot/sdk/tx";

import { account } from "../validator/rpc";
import { contextFromCli, requireRole, runCli, type TeamContext } from "./common";
import { actAfterTallies } from "./tally";

type Act = ContestStage.Stage1 | ContestStage.Stage2;
const ACT_NAMES: Record<Act, string> = { 1: "team_open_contest(1: open)", 2: "team_open_contest(2: to the admin)" };

/** The bytes a run signs: an opening; or, with --escalate, the escalation, preceded by an opening in review. */
export function contestActs(escalate: boolean, status: number): Act[] {
  if (!escalate) return [ContestStage.Stage1];
  return status === Status.InReview ? [ContestStage.Stage1, ContestStage.Stage2] : [ContestStage.Stage2];
}

export async function contest(ctx: TeamContext, campaign: Address, escalate = false) {
  await requireRole(ctx, "team");
  const found = await account(ctx.rpc, campaign);
  if (!found) throw new Error(`no campaign at ${campaign}`);
  const c = decodeCampaign(found);
  const contest = `${ContestStage[c.contestStage]}, contest deadline ${c.contestEndsAt}`;
  console.log(`campaign #${c.id}: ${Status[c.status]} (${contest}), outcome ${Outcome[c.outcome]}`);
  const acts = contestActs(escalate, c.status);
  const ixs = await Promise.all(acts.map((stage) => buildTeamOpenContest({ teamMember: ctx.signer, campaign, stage })));
  const context = { campaigns: new Map([[campaign as string, c]]) };
  for (const line of summarizeInstructions(ixs, { context }).lines) console.log(`summary ${line}`);
  const result = await actAfterTallies(ctx, campaign, acts.map((act) => ACT_NAMES[act]).join(" + "), ixs);
  if (result.sent && acts.includes(ContestStage.Stage2)) {
    console.log("sent to stage 2: the admin confirms or voids with scripts/team/decide.ts");
  } else if (result.sent) {
    console.log("contested: re-read it with scripts/team/reread.ts; --escalate sends it to the admin before 24 hours");
  }
  return result;
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, values, positionals } = await contextFromCli({ escalate: { type: "boolean" } });
    if (!positionals[0]) throw new Error("usage: contest.ts <campaign address> [--escalate]");
    await contest(ctx, address(positionals[0]), values.escalate === true);
  });
}
