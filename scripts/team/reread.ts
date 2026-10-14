/**
 * Purpose: `reread_campaign`, stage 1 of a contest (TP §3.4.7): any wallet (here your own key from TEAM_KEYPAIR, as
 *          the keeper would) runs the campaign's reading again now and the program compares it exactly with the
 *          stored result. The same reading pays out with the stored result, but only from stage 1's deadline on, 24
 *          hours after the contest opened (`RereadBeforeTimelock` before it, D2); a different one, or a reader that
 *          cannot decide now, opens stage 2 at once: 48 hours for the admin (decide.ts). It never writes a new result.
 * Version: 0.2.0 (the founder's answer to D2: the matching re-read's 24-hour wait)
 * Sprint:  14 (the two-stage dispute; lane INV14; lane L14B, D2)
 *
 * A price campaign inside its proof window (up to the deadline + 60 s) reads only a YES proof: pass one with
 * --proof (any fully verified account of the feed); after it, the sponsored account alone is read.
 *
 *   TEAM_KEYPAIR=~/my-key.json bun run scripts/team/reread.ts <campaign> [--proof <account>] --cluster devnet [--yes]
 */
import { address, type Address } from "@solana/kit";

import { ContestStage, Outcome, Status, VoidReason, decodeCampaign } from "@brot/sdk/read";
import { buildRereadCampaign } from "@brot/sdk/tx";

import { account } from "../validator/rpc";
import { act, contextFromCli, runCli, type TeamContext } from "./common";

export async function reread(ctx: TeamContext, campaign: Address, proof?: Address) {
  const found = await account(ctx.rpc, campaign);
  if (!found) throw new Error(`no campaign at ${campaign}`);
  const c = decodeCampaign(found);
  const stored = `${Outcome[c.outcome]} (${VoidReason[c.voidReason]}), observed ${c.observedValue}`;
  console.log(`campaign #${c.id}: ${Status[c.status]}, ${ContestStage[c.contestStage]}; stored ${stored}`);
  if (c.status !== Status.Contested || c.contestStage !== ContestStage.Stage1) {
    console.log("note: only a contest at stage 1 is re-read (NotContested or WrongContestStage otherwise)");
  } else console.log(`stage 1's deadline ${c.contestEndsAt}: the same reading pays only from it on`);
  const ix = await buildRereadCampaign({ campaign, metricAccount: c.metricAccount, proofAccount: proof });
  const result = await act(ctx, "reread_campaign", [ix]);
  const reread = result.sent?.events.find((e) => e.name === "CampaignReread")?.data as
    { same: boolean; outcome: Outcome; observedValue: bigint; contestEndsAt: bigint } | undefined;
  if (reread?.same) console.log("the same reading: the campaign pays out with the stored result");
  else if (reread) {
    const now = `${Outcome[reread.outcome]}, observed ${reread.observedValue}`;
    console.log(`a different reading (${now}): stage 2, the admin decides before ${reread.contestEndsAt}`);
  }
  return result;
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, values, positionals } = await contextFromCli({ proof: { type: "string" } });
    if (!positionals[0]) throw new Error("usage: reread.ts <campaign address> [--proof <price account>]");
    const proof = typeof values.proof === "string" ? address(values.proof) : undefined;
    await reread(ctx, address(positionals[0]), proof);
  });
}
