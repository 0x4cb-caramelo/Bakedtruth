/**
 * Purpose: `team_void_campaign(reason, note_hash)` with your own team key (TP §3.4.7, BR-45): the public text of
 *          the void is saved to content/void-log/<campaign>-<UTC time>.md, and the SHA-256 of exactly the saved
 *          bytes goes on-chain with the reason. A team key may use `TeamHouseFailure` (the 10% opening fee goes
 *          back to the opener, unless nobody had entered) or `TeamOutsideCause` (Brot keeps it). The snapshot that
 *          follows needs every join tallied (`NotTallied`), so the entries not yet tallied go first (tally.ts).
 * Version: 0.1.4 (Sprint 14: the late-join tally first; the record and its send moved to record.ts)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; 14 (lane INV14)
 *
 * The program lets a team key void only an AUTOMATIC void (a campaign `resolve_campaign` voided: missed window,
 * unreadable account, stale feed), never a YES or NO (`TeamVoidNotAutomatic`, decision of 2026-10-09); since Sprint
 * 14 the admin may void a contested YES or NO at stage 2 (decide.ts). The record (record.ts) parses in its public
 * format (packages/sdk/src/schemas/void-log.ts), and CI checks every committed record.
 *
 *   TEAM_KEYPAIR=~/k.json bun run scripts/team/void.ts <campaign> --reason TeamOutsideCause --note note.md --cluster devnet [--yes]
 */
import { readFileSync } from "node:fs";

import { address, type Address } from "@solana/kit";

import { Outcome, VoidReason, decodeCampaign } from "@brot/sdk/read";
import { buildTeamVoidCampaign } from "@brot/sdk/tx";

import { account } from "../validator/rpc";
import { contextFromCli, requireRole, runCli, type TeamContext } from "./common";
import { checkVoidText, recordOf, sendRecorded, type TeamVoidReason } from "./record";
import { frontTallies } from "./tally";

export { personalDataIn } from "@brot/sdk/schemas";
export { voidRecord, type TeamVoidReason } from "./record";

export async function voidCampaign(
  ctx: TeamContext,
  campaign: Address,
  reason: TeamVoidReason,
  text: string,
  logDir = "content/void-log",
) {
  checkVoidText(reason, text);
  await requireRole(ctx, "team");
  const found = await account(ctx.rpc, campaign);
  if (!found) throw new Error(`no campaign at ${campaign}`);
  const c = decodeCampaign(found);
  if (c.outcome !== Outcome.Void) {
    console.log(
      `note: outcome ${Outcome[c.outcome]} is not an automatic void; the program refuses (TeamVoidNotAutomatic)`,
    );
  }
  const record = recordOf(campaign, reason, ctx.signer.address, text, logDir);
  const noteHash = record.noteHash;
  const ix = await buildTeamVoidCampaign({ teamMember: ctx.signer, campaign, reason: VoidReason[reason], noteHash });
  const tallies = await frontTallies(ctx, campaign);
  return sendRecorded(ctx, "team_void_campaign", [...tallies, ix], record);
}

if (import.meta.main) {
  runCli(async () => {
    const { ctx, values, positionals } = await contextFromCli({ reason: { type: "string" }, note: { type: "string" } });
    if (!positionals[0] || !values.reason || !values.note) {
      throw new Error("usage: void.ts <campaign> --reason TeamHouseFailure|TeamOutsideCause --note <text file>");
    }
    const text = readFileSync(String(values.note), "utf8");
    await voidCampaign(ctx, address(positionals[0]), values.reason as TeamVoidReason, text);
  });
}
