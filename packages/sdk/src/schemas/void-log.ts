/**
 * Purpose: the public format of a `content/void-log/` record (TP §3.4.7, BR-45; Sprint 12 gives it its public format,
 *          which Sprint 05's `scripts/team/void.ts` started): a team void (the campaign, the reason, the acting team key,
 *          the UTC time, the team's text) or a correction that names an earlier record. Each record's SHA-256 is of
 *          exactly its file's bytes; a void's is on-chain (`void_note_hash`). The zod schema is the check; the JSON
 *          Schema committed at content/void-log/record.schema.json is generated from it (scripts/void-log-schema.ts),
 *          and tests/site/void-log.test.ts fails on a stale schema or on any record that does not parse.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * The record is permanent (its hash is on-chain and Git keeps every version), so its text may hold no email address,
 * no @handle and no URL (`personalDataIn`, shared with the team script that writes it).
 */
import { address } from "@solana/kit";
import { z } from "zod";

/** Why `text` cannot go into a permanent public record, or `null`: no email, @handle or URL. */
export function personalDataIn(text: string): string | null {
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)) return "an email address";
  if (/(^|[\s(])@\w{2,}/.test(text)) return "an @handle";
  if (/https?:\/\/|www\./i.test(text)) return "a URL";
  return null;
}

const Base58 = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "a base58 address")
  .refine(
    (v) => {
      try {
        address(v);
        return true;
      } catch {
        return false;
      }
    },
    { message: "a base58 address of 32 bytes" },
  );

/** `<campaign>-<UTC time with ':' and '.' as '-'>.md`, as the team script names it. */
const FILE = /^[1-9A-HJ-NP-Za-km-z]{32,44}-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.md$/;
const FileName = z.string().regex(FILE, "a void-log file name: <campaign>-<UTC time>.md");

const PublicText = z
  .string()
  .min(1, "the team's public text")
  .refine((text) => personalDataIn(text) === null, { message: "no email address, @handle or URL" });

const common = {
  file: FileName.describe("The record's file name in content/void-log/"),
  teamKey: Base58.describe("The team key that acted; the same key signs the void on-chain"),
  writtenAt: z.iso.datetime().describe("When the team script wrote the record, UTC"),
  text: PublicText.describe("The team's public text: no email address, @handle or URL"),
  sha256: z
    .string()
    .regex(/^[0-9a-f]{64}$/, "the SHA-256 of the file's bytes, in hex")
    .describe("The SHA-256 of exactly the file's bytes; a void's equals the campaign's void_note_hash on-chain"),
};

export const VoidLogRecord = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("void"),
      campaign: Base58.describe("The voided campaign's address"),
      reason: z
        .enum(["TeamHouseFailure", "TeamOutsideCause"])
        .describe("The VoidReason sent on-chain: the opening fee is refunded on a house failure, kept otherwise"),
      ...common,
    })
    .strict(),
  z
    .object({
      kind: z.literal("correction"),
      corrects: FileName.describe("The earlier record this one corrects; that record is never edited"),
      ...common,
    })
    .strict(),
]);

export type VoidLogRecord = z.infer<typeof VoidLogRecord>;

const HEADER = {
  void: /^# Void of campaign (\S+)\n\n- Reason: (\S+)\n- Team key: (\S+)\n- Written \(UTC\): (\S+)\n\n/,
  correction: /^# Correction of (\S+)\n\n- Team key: (\S+)\n- Written \(UTC\): (\S+)\n\n/,
};

/**
 * A record's fields from its file name, text and hash, checked by the schema: `{ ok: true, record }`, or the reasons
 * it is not a record in the public format.
 */
export function parseVoidLog(
  file: string,
  text: string,
  sha256: string,
): { ok: true; record: VoidLogRecord } | { ok: false; problems: string[] } {
  const isVoid = HEADER.void.exec(text);
  const isCorrection = HEADER.correction.exec(text);
  const head = isVoid ?? isCorrection;
  if (!head) return { ok: false, problems: ["the header is neither a void's nor a correction's"] };
  const body = text.slice(head[0].length).trimEnd();
  const raw = isVoid
    ? {
        kind: "void",
        file,
        campaign: head[1],
        reason: head[2],
        teamKey: head[3],
        writtenAt: head[4],
        text: body,
        sha256,
      }
    : { kind: "correction", file, corrects: head[1], teamKey: head[2], writtenAt: head[3], text: body, sha256 };
  const parsed = VoidLogRecord.safeParse(raw);
  if (!parsed.success)
    return { ok: false, problems: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  if (parsed.data.kind === "void" && !file.startsWith(`${parsed.data.campaign}-`)) {
    return { ok: false, problems: ["the file name does not start with the campaign it voids"] };
  }
  return { ok: true, record: parsed.data };
}

/** The JSON Schema of a record, as committed at content/void-log/record.schema.json. */
export const voidLogJsonSchema = () => ({
  ...z.toJSONSchema(VoidLogRecord, { unrepresentable: "any" }),
  title: "A content/void-log/ record (Brot Markets)",
  description:
    "Generated from packages/sdk/src/schemas/void-log.ts by scripts/void-log-schema.ts; the zod schema is the check (it also refuses personal data and a file name that does not start with the voided campaign).",
});
