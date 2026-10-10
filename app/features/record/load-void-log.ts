/**
 * Purpose: the void log read on the server (the site's build and its server render; never in the browser): every
 *          record in content/void-log/ (not the README, the JSON Schema or a `.pending` file), its SHA-256 over
 *          exactly the file's bytes, parsed into the public format (`@brot/sdk/schemas`, checked in CI by
 *          tests/site/void-log.test.ts). Newest first. A file that does not parse is left out and counted.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * The folder is found from the app's directory (the site runs from app/, so it is ../content/void-log), or from the
 * repository root; with neither, the log is empty.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseVoidLog, type VoidLogRecord } from "@brot/sdk/schemas";

export type VoidLog = { records: VoidLogRecord[]; skipped: string[] };

const folder = (): string | null =>
  [join(process.cwd(), "..", "content", "void-log"), join(process.cwd(), "content", "void-log")].find((dir) =>
    existsSync(dir),
  ) ?? null;

/** Every record of the void log, newest first. */
export function loadVoidLog(dir: string | null = folder()): VoidLog {
  if (!dir) return { records: [], skipped: [] };
  const records: VoidLogRecord[] = [];
  const skipped: string[] = [];
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const bytes = readFileSync(join(dir, file));
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const parsed = parseVoidLog(file, bytes.toString("utf8"), sha256);
    if (parsed.ok) records.push(parsed.record);
    else skipped.push(file);
  }
  records.sort((a, b) => (a.writtenAt < b.writtenAt ? 1 : a.writtenAt > b.writtenAt ? -1 : 0));
  return { records, skipped };
}
