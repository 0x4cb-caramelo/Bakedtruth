/**
 * Purpose: a void's public record and its sending (TP §3.4.7, BR-45), shared by the team's void (void.ts) and the
 *          admin's void at stage 2 of a contest (decide.ts): the bytes saved to content/void-log/<campaign>-<UTC
 *          time>.md (a header the reader checks against the chain, then the text with LF line endings), the SHA-256 of
 *          exactly those bytes that goes on-chain, and the send: the record is written as `.pending` only with --yes
 *          and after the simulation passes, renamed once the ledger confirms, removed on a refusal, and left pending
 *          when the answer never comes (Sprint 05 deploy review, F10).
 * Version: 0.1.0 (Sprint 14: moved out of void.ts, so the admin's void writes the same record)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; 12 (the record's public format); 14 (lane INV14)
 *
 * The record names the acting key (accountability: it is public on-chain as the signer anyway) and nothing else
 * about a person: a text with an email address, an @handle, a URL or a domain is refused (`personalDataIn`).
 */
import { createHash } from "node:crypto";
import { renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { type Address, type Instruction } from "@solana/kit";

import { personalDataIn } from "@brot/sdk/schemas";

import { send } from "../validator/rpc";
import { act, type TeamContext } from "./common";

export type TeamVoidReason = "TeamHouseFailure" | "TeamOutsideCause";
export const REASONS: TeamVoidReason[] = ["TeamHouseFailure", "TeamOutsideCause"];

/**
 * The record's bytes: a short header the reader can check against the chain, then the text with its line endings
 * made `\n` first, so the bytes hashed on-chain are the bytes Git keeps (Sprint 12 review, L2).
 */
export function voidRecord(campaign: Address, reason: TeamVoidReason, signer: Address, at: string, text: string) {
  const header = `# Void of campaign ${campaign}\n\n- Reason: ${reason}\n- Team key: ${signer}\n- Written (UTC): ${at}\n\n`;
  return new TextEncoder().encode(`${header}${text.replace(/\r\n?/g, "\n").trimEnd()}\n`);
}

/** Refuses a reason the record's format does not hold, an empty text, or a text with personal data in it. */
export function checkVoidText(reason: string, text: string) {
  if (!REASONS.includes(reason as TeamVoidReason))
    throw new Error(`a void names ${REASONS.join(" or ")}, not ${reason}`);
  if (text.trim() === "") throw new Error("the void needs its public text (--note <file>)");
  const personal = personalDataIn(text);
  if (personal) throw new Error(`the public text holds ${personal}: the record is permanent, so leave it out`);
}

/** The record of a void of `campaign` signed by `signer` now: its bytes, their SHA-256 and where it is saved. */
export function recordOf(campaign: Address, reason: TeamVoidReason, signer: Address, text: string, logDir: string) {
  const at = new Date().toISOString();
  const bytes = voidRecord(campaign, reason, signer, at, text);
  const noteHash = new Uint8Array(createHash("sha256").update(bytes).digest());
  const path = join(logDir, `${campaign}-${at.replace(/[:.]/g, "-")}.md`);
  console.log(`record ${path}, sha256 ${Buffer.from(noteHash).toString("hex")}:\n${new TextDecoder().decode(bytes)}`);
  return { bytes, noteHash, path };
}

/** Simulates `ixs`; with --yes and a passing simulation, saves the record around the send (module documentation). */
export async function sendRecorded(
  ctx: TeamContext,
  label: string,
  ixs: Instruction[],
  record: { bytes: Uint8Array; noteHash: Uint8Array; path: string },
) {
  const { simulated } = await act(ctx, label, ixs, { simulateOnly: true });
  if (!ctx.yes) {
    console.log("nothing written or sent: add --yes to save the record and send");
    return { simulated, path: null };
  }
  if (!simulated.ok) throw new Error(`the program would refuse ${label} (${simulated.error}): nothing written`);
  const pending = `${record.path}.pending`;
  writeFileSync(pending, record.bytes);
  let sent;
  try {
    sent = await send(ctx.rpc, ctx.signer, ixs);
  } catch (error) {
    const hash = Buffer.from(record.noteHash).toString("hex");
    throw new Error(
      `no answer from the ledger (${(error as Error).message}): ${pending} stays; compare the campaign's void_note_hash with ${hash}, then rename it or delete it`,
    );
  }
  if (!sent.ok) {
    rmSync(pending);
    throw new Error(`${label} failed on the ledger (${sent.error}); the record was removed`);
  }
  renameSync(pending, record.path);
  console.log(
    `sent ${label}: ${sent.signature}; events ${sent.events.map((e) => e.name).join(", ")}; commit ${record.path}`,
  );
  return { simulated, path: record.path, sent };
}
