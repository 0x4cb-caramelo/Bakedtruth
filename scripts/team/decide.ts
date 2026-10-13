/**
 * Purpose: `admin_decide_contest(decision, void_reason, note_hash)`, stage 2 of a contest (TP §3.4.7; BP v0.0.4 part
 *          1 §4.5), with the admin's key (TEAM_KEYPAIR holding it; on mainnet the 2-of-3 multisig proposes this
 *          instruction). Before stage 2's deadline the admin confirms the stored result or voids the campaign; the
 *          snapshot follows at once. It never inverts: a confirm keeps the stored outcome, a void records Void. After
 *          the deadline the stored result stands and anyone finalizes (finalize_campaign takes the lapse).
 * Version: 0.1.1 (the admin's reading of a fact-kind YES re-read after its deadline: review fix F5, lane L14B)
 * Sprint:  14 (the two-stage dispute; lane INV14)
 *
 * A void writes its public record to content/void-log/ as the team's void does (record.ts: the SHA-256 of the saved
 * bytes goes on-chain; written only with --yes after the simulation passes). Its header's "Team key" line names the
 * signing key, here the admin's: the record's format (packages/sdk/src/schemas/void-log.ts) has no admin form yet. A
 * confirm hashes its note's text (LF line endings) for the ContestClosed event and saves nothing.
 *
 * Reading the re-read's evidence (red-team review F5): on an irreversible fact (`SupplyAtMost`, `DammV2LockedAtLeast`)
 * a correct YES re-read after its deadline reads NO with `met_late` set, because after the deadline the reader decides
 * only NO, and `met_late` says the fact WAS met. That reading is what sent the contest here; it is not evidence against
 * the YES. Check the resolution's own `CampaignResolved` (its time before the deadline, the value it read) first.
 *
 *   TEAM_KEYPAIR=~/admin.json bun run scripts/team/decide.ts <campaign> --decision Confirm --note note.md --cluster devnet [--yes]
 *   TEAM_KEYPAIR=~/admin.json bun run scripts/team/decide.ts <campaign> --decision Void --reason TeamOutsideCause --note note.md ...
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { address, type Address } from "@solana/kit";

import { ContestDecision, ContestStage, Outcome, Status, VoidReason, decodeCampaign } from "@brot/sdk/read";
import { buildAdminDecideContest } from "@brot/sdk/tx";

import { account } from "../validator/rpc";
import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";
import { checkVoidText, recordOf, sendRecorded, type TeamVoidReason } from "./record";

export type Decision = "Confirm" | "Void";

export async function decide(
  ctx: TeamContext,
  campaign: Address,
  decision: Decision,
  reason: TeamVoidReason | null,
  text: string,
  logDir = "content/void-log",
) {
  if (decision !== "Confirm" && decision !== "Void")
    throw new Error(`the decision is Confirm or Void, not ${decision}`);
  if (decision === "Confirm" && reason) throw new Error("a confirm names no void reason (ConfirmWithVoidReason)");
  if (decision === "Void") checkVoidText(reason ?? "", text);
  else if (text.trim() === "") throw new Error("the decision needs the admin's note (--note <file>)");
  await requireRole(ctx, "admin");
  const found = await account(ctx.rpc, campaign);
  if (!found) throw new Error(`no campaign at ${campaign}`);
  const c = decodeCampaign(found);
  const stage = `${Status[c.status]}, ${ContestStage[c.contestStage]}, deadline ${c.contestEndsAt}`;
  console.log(`campaign #${c.id}: ${stage}; stored ${Outcome[c.outcome]} (${VoidReason[c.voidReason]})`);
  if (c.status !== Status.Contested || c.contestStage !== ContestStage.Stage2) {
    console.log("note: the admin decides only a contest at stage 2 (NotContested or WrongContestStage otherwise)");
  }
  const build = (noteHash: Uint8Array) =>
    buildAdminDecideContest({
      admin: ctx.signer,
      campaign,
      decision: ContestDecision[decision],
      voidReason: reason ? VoidReason[reason] : VoidReason.None,
      noteHash,
    });
  if (decision === "Void") {
    const record = recordOf(campaign, reason!, ctx.signer.address, text, logDir);
    return sendRecorded(ctx, "admin_decide_contest (Void)", [await build(record.noteHash)], record);
  }
  const note = new TextEncoder().encode(`${text.replace(/\r\n?/g, "\n").trimEnd()}\n`);
  const noteHash = new Uint8Array(createHash("sha256").update(note).digest());
  console.log(`note sha256 ${Buffer.from(noteHash).toString("hex")} (in ContestClosed; publish the note with it)`);
  return { ...(await act(ctx, "admin_decide_contest (Confirm)", [await build(noteHash)])), path: null };
}

if (import.meta.main) {
  runCli(async () => {
    const flags = { decision: { type: "string" }, reason: { type: "string" }, note: { type: "string" } } as const;
    const { ctx, values, positionals } = await contextFromCli(flags);
    if (!positionals[0] || !values.decision || !values.note) {
      throw new Error(
        "usage: decide.ts <campaign> --decision Confirm|Void [--reason <team reason>] --note <text file>",
      );
    }
    const reason = typeof values.reason === "string" ? (values.reason as TeamVoidReason) : null;
    const text = readFileSync(String(values.note), "utf8");
    await decide(ctx, address(positionals[0]), values.decision as Decision, reason, text);
  });
}
