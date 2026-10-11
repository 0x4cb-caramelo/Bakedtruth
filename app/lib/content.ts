/**
 * Purpose: where the repository's content/ folder is, for what the site reads on the server when it is built (the void
 *          log, the powers table, the unlisted campaigns). The site runs from app/, so it is ../content; from the
 *          repository root, ./content. Neither found is an error that fails the build, never an empty page (the
 *          deferred Sprint 12 finding, TP §7.3: on another host the record would have shown empty without a word).
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

/** The content/ folder, recognised by its void log's README. Throws when it is missing. */
export function contentDir(cwd: string = process.cwd()): string {
  const found = [join(cwd, "..", "content"), join(cwd, "content")].find((dir) =>
    existsSync(join(dir, "void-log", "README.md")),
  );
  if (!found)
    throw new Error(`content/ was not found from ${cwd}: the record, the powers and the unlisted list need it`);
  return found;
}
