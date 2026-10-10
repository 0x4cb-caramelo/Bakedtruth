/**
 * Purpose: the void log's public format (Sprint 12 deliverable, "its JSON Schema check in CI"): the committed JSON
 *          Schema is the one generated from the zod schema; every record committed in content/void-log/ parses; what
 *          the team script writes parses back field for field, with the SHA-256 of exactly its bytes; text with
 *          personal data, a team void's reason that is not a team reason, or a file named for another campaign is
 *          refused; the site reads only records (never a `.pending` file); and the campaign page shows a note only
 *          when its hash is the one the chain stored for that campaign.
 *          Filter: `bun test tests/ -t "void log"`.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateKeyPairSigner } from "@solana/kit";

import { hexToBytes } from "@brot/sdk/read";
import { parseVoidLog, VoidLogRecord } from "@brot/sdk/schemas";

import { noteFor } from "../../app/features/campaign-page/void-note";
import { loadVoidLog } from "../../app/features/record/load-void-log";
import { voidRecord } from "../../scripts/team/void";
import { SCHEMA_PATH, schemaText } from "../../scripts/void-log-schema";

const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const AT = "2026-10-10T18:04:05.123Z";
const fileFor = (campaign: string) => `${campaign}-${AT.replace(/[:.]/g, "-")}.md`;
const TEXT = "The feed stopped before the deadline through a fault in our keeper's schedule.";

async function written(reason: "TeamHouseFailure" | "TeamOutsideCause" = "TeamHouseFailure", text = TEXT) {
  const [campaign, team] = [await generateKeyPairSigner(), await generateKeyPairSigner()];
  const bytes = voidRecord(campaign.address, reason, team.address, AT, text);
  return { campaign: campaign.address, team: team.address, bytes, file: fileFor(campaign.address) };
}

describe("void log", () => {
  test("the committed JSON Schema is generated from the zod schema", () => {
    expect(readFileSync(SCHEMA_PATH, "utf8")).toBe(schemaText());
  });

  test("every record committed in content/void-log/ follows the public format", () => {
    const log = loadVoidLog(join(process.cwd(), "content", "void-log"));
    expect(log.skipped).toEqual([]);
    for (const record of log.records) expect(VoidLogRecord.safeParse(record).success).toBe(true);
  });

  test("what the team script writes parses back, with the hash of exactly its bytes", async () => {
    const r = await written();
    const parsed = parseVoidLog(r.file, new TextDecoder().decode(r.bytes), sha(r.bytes));
    expect(parsed).toEqual({
      ok: true,
      record: {
        kind: "void",
        file: r.file,
        campaign: r.campaign,
        reason: "TeamHouseFailure",
        teamKey: r.team,
        writtenAt: AT,
        text: TEXT,
        sha256: sha(r.bytes),
      },
    });
  });

  test("a note written with Windows line endings is hashed as Git keeps it, with LF only (security review L2)", async () => {
    const r = await written("TeamHouseFailure", "First line.\r\nSecond line.\r\n");
    const text = new TextDecoder().decode(r.bytes);
    expect(text.includes("\r")).toBe(false);
    expect(parseVoidLog(r.file, text, sha(r.bytes))).toMatchObject({
      ok: true,
      record: { text: "First line.\nSecond line." },
    });
  });

  test("a correction names the record it corrects", async () => {
    const r = await written();
    const text = `# Correction of ${r.file}\n\n- Team key: ${r.team}\n- Written (UTC): ${AT}\n\nThe cause was the feed, not the keeper.\n`;
    const parsed = parseVoidLog(fileFor(r.campaign).replace("123Z", "456Z"), text, sha(new TextEncoder().encode(text)));
    expect(parsed.ok && parsed.record.kind === "correction" && parsed.record.corrects).toBe(r.file);
  });

  test("personal data, a reason no team key sends, and a file named for another campaign are refused", async () => {
    for (const bad of ["Ask ana@example.com", "Thanks @someone", "See https://example.com"]) {
      const r = await written("TeamOutsideCause", bad);
      expect(parseVoidLog(r.file, new TextDecoder().decode(r.bytes), sha(r.bytes)).ok).toBe(false);
    }
    const r = await written();
    const text = new TextDecoder().decode(r.bytes);
    expect(parseVoidLog(r.file, text.replace("TeamHouseFailure", "StaleFeed"), sha(r.bytes)).ok).toBe(false);
    const other = await generateKeyPairSigner();
    expect(parseVoidLog(fileFor(other.address), text, sha(r.bytes)).ok).toBe(false);
    expect(parseVoidLog(r.file, text.replace("# Void of", "# Voided"), sha(r.bytes)).ok).toBe(false);
  });

  test("the site reads records only, newest first, and leaves out what does not parse", async () => {
    const dir = mkdtempSync(join(tmpdir(), "void-log-"));
    const first = await written();
    const second = await written("TeamOutsideCause");
    const laterFile = second.file.replace("2026-10-10T18", "2026-10-11T18");
    writeFileSync(join(dir, first.file), first.bytes);
    writeFileSync(join(dir, laterFile), new TextDecoder().decode(second.bytes).replace(AT, "2026-10-11T18:04:05.123Z"));
    writeFileSync(join(dir, `${first.file}.pending`), first.bytes);
    writeFileSync(join(dir, "README.md"), "# Void log\n");
    writeFileSync(join(dir, fileFor(first.campaign).replace("123Z", "999Z")), "not a record\n");
    const log = loadVoidLog(dir);
    expect(log.records.map((r) => r.file)).toEqual([laterFile, first.file]);
    expect(log.skipped).toEqual([fileFor(first.campaign).replace("123Z", "999Z")]);
  });

  test("the campaign page shows a note only when its hash is the chain's for that campaign", async () => {
    const r = await written();
    const note = { file: r.file, campaign: r.campaign, reason: "TeamHouseFailure", text: TEXT, sha256: sha(r.bytes) };
    const stored = { voidNoteHash: hexToBytes(note.sha256) };
    expect(noteFor(stored, r.campaign, [note])).toEqual(note);
    expect(noteFor(stored, (await generateKeyPairSigner()).address, [note])).toBeNull();
    expect(noteFor({ voidNoteHash: new Uint8Array(32) }, r.campaign, [note])).toBeNull();
    expect(noteFor({ voidNoteHash: hexToBytes("ab".repeat(32)) }, r.campaign, [note])).toBeNull();
  });
});
