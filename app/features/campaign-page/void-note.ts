/**
 * Purpose: the team's note on a void, as the campaign page shows it (BR-45): the void-log record whose SHA-256 equals
 *          the `void_note_hash` the program stored, and which names this campaign. The server reads the log
 *          (features/record/load-void-log.ts) and passes the voids to the page; the browser only matches the hash, so
 *          a note that does not hash to what the chain recorded is never shown as the team's.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { bytesToHex, type Campaign } from "@brot/sdk/read";

export type VoidNote = { file: string; campaign: string; reason: string; text: string; sha256: string };

const ZERO = "0".repeat(64);

/** The note for campaign `c` at `address` among `notes`, or `null`. */
export function noteFor(
  c: Pick<Campaign, "voidNoteHash">,
  address: string,
  notes: readonly VoidNote[],
): VoidNote | null {
  const hash = bytesToHex(c.voidNoteHash);
  if (hash === ZERO) return null;
  return notes.find((n) => n.sha256 === hash && n.campaign === address) ?? null;
}
