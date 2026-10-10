/**
 * Purpose: the void log read on the server (the site's build and its server render; never in the browser): every
 *          record in content/void-log/ (not the README, the JSON Schema or a `.pending` file), its SHA-256 over
 *          exactly the file's bytes, parsed into the public format (`@brot/sdk/schemas`, checked in CI by
 *          tests/site/void-log.test.ts). Newest first. A file that does not parse is left out and counted.
 * Version: 0.2.0 (Sprint 13: the folder from app/lib/content.ts, which fails the build when it is missing)
 * Sprint:  12 (site: my entries and campaign states); 13
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseVoidLog, type VoidLogRecord } from "@brot/sdk/schemas";
import { contentDir } from "../../lib/content";

export type VoidLog = { records: VoidLogRecord[]; skipped: string[] };

/** Every record of the void log, newest first. */
export function loadVoidLog(dir: string = join(contentDir(), "void-log")): VoidLog {
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
