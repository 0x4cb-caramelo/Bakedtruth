/**
 * Purpose: `team_void_campaign(reason, note_hash)` with your own team key (TP §3.4.7, BR-45): the public text of
 *          the void is saved to content/void-log/<campaign>-<UTC time>.md, and the SHA-256 of exactly the saved
 *          bytes goes on-chain with the reason. A team key may use `TeamHouseFailure` (the 10% opening fee goes
 *          back to the opener) or `TeamOutsideCause` (Brot keeps it).
 * Version: 0.1.1
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * The program lets a team key void only an AUTOMATIC void (a campaign `resolve_campaign` voided: missed window,
 * unreadable account, stale feed), never a YES or NO (`TeamVoidNotAutomatic`, decision of 2026-10-09). The
 * record names the acting team key (accountability: the key is public on-chain as the signer anyway) and nothing
 * else about a person: text with an email address, an @handle or a URL is refused. It is written as `.pending`
 * only after the simulation passes and with --yes, renamed once the ledger confirms, removed on a refusal, and left
 * pending when the answer never comes (Sprint 05 deploy review, F10). Sprint 12 gives the record its public format.
 *
 *   TEAM_KEYPAIR=~/k.json bun run scripts/team/void.ts <campaign> --reason TeamOutsideCause --note note.md --cluster devnet [--yes]
 */
import { createHash } from "node:crypto";
import { readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { address, type Address } from "@solana/kit";

import { Outcome, VoidReason, decodeCampaign } from "@brot/sdk/read";
import { buildTeamVoidCampaign } from "@brot/sdk/tx";

import { account, send } from "../validator/rpc";
import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";

export type TeamVoidReason = "TeamHouseFailure" | "TeamOutsideCause";
const REASONS: TeamVoidReason[] = ["TeamHouseFailure", "TeamOutsideCause"];

/** The record's bytes: a short header the reader can check against the chain, then the team's text. */
export function voidRecord(campaign: Address, reason: TeamVoidReason, signer: Address, at: string, text: string) {
  const header = `# Void of campaign ${campaign}\n\n- Reason: ${reason}\n- Team key: ${signer}\n- Written (UTC): ${at}\n\n`;
  return new TextEncoder().encode(`${header}${text.trimEnd()}\n`);
}

/** Why `text` cannot go into a permanent public record, or `null`: no email, @handle or URL. */
export function personalDataIn(text: string): string | null {
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)) return "an email address";
  if (/(^|[\s(])@\w{2,}/.test(text)) return "an @handle";
  if (/https?:\/\/|www\./i.test(text)) return "a URL";
  return null;
}

export async function voidCampaign(
  ctx: TeamContext,
  campaign: Address,
  reason: TeamVoidReason,
  text: string,
  logDir = "content/void-log",
) {
  if (!REASONS.includes(reason)) throw new Error(`a team key voids with ${REASONS.join(" or ")}, not ${reason}`);
  if (text.trim() === "") throw new Error("the void needs its public text (--note <file>)");
  const personal = personalDataIn(text);
  if (personal) throw new Error(`the public text holds ${personal}: the record is permanent, so leave it out`);
  await requireRole(ctx, "team");
  const found = await account(ctx.rpc, campaign);
  if (!found) throw new Error(`no campaign at ${campaign}`);
  const c = decodeCampaign(found);
  if (c.outcome !== Outcome.Void) {
    console.log(
      `note: outcome ${Outcome[c.outcome]} is not an automatic void; the program refuses (TeamVoidNotAutomatic)`,
    );
  }
  const at = new Date().toISOString();
  const bytes = voidRecord(campaign, reason, ctx.signer.address, at, text);
  const noteHash = new Uint8Array(createHash("sha256").update(bytes).digest());
  const path = join(logDir, `${campaign}-${at.replace(/[:.]/g, "-")}.md`);
  console.log(`record ${path}, sha256 ${Buffer.from(noteHash).toString("hex")}:\n${new TextDecoder().decode(bytes)}`);
  const ix = await buildTeamVoidCampaign({ teamMember: ctx.signer, campaign, reason: VoidReason[reason], noteHash });
  const { simulated } = await act(ctx, "team_void_campaign", [ix], { simulateOnly: true });
  if (!ctx.yes) {
    console.log("nothing written or sent: add --yes to save the record and void");
    return { simulated, path: null };
  }
  if (!simulated.ok) throw new Error(`the program would refuse the void (${simulated.error}): nothing written`);
  const pending = `${path}.pending`;
  writeFileSync(pending, bytes);
  let sent;
  try {
    sent = await send(ctx.rpc, ctx.signer, [ix]);
  } catch (error) {
    const hash = Buffer.from(noteHash).toString("hex");
    throw new Error(
      `no answer from the ledger (${(error as Error).message}): ${pending} stays; compare the campaign's void_note_hash with ${hash}, then rename it or delete it`,
    );
  }
  if (!sent.ok) {
    rmSync(pending);
    throw new Error(`the void failed on the ledger (${sent.error}); the record was removed`);
  }
  renameSync(pending, path);
  console.log(`voided: ${sent.signature}; events ${sent.events.map((e) => e.name).join(", ")}; commit ${path}`);
  return { simulated, path, sent };
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
