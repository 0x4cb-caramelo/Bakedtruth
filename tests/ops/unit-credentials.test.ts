/**
 * Purpose: the systemd units of deploy/vps/ read their secrets from the credentials directory spelled out, because the
 *          server's systemd 249 does not expand the `%d` specifier in `Environment=`: it logs "Invalid slot" and drops
 *          the line, which is how the indexer failed its first start on 2026-10-14. No unit uses `%d` in an
 *          `Environment=` line; every `/run/credentials/<unit>/<name>` path names the unit's own file and a credential
 *          the same unit loads (`LoadCredential=<name>:`). Reads the files only.
 * Version: 0.0.2 (the third review's P4: `%d` refused in every directive, not only `Environment=`)
 * Sprint:  16 (lane L16P, the last changes before the freeze)
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "deploy/vps";
const units = readdirSync(DIR)
  .filter((file) => file.endsWith(".service"))
  .sort();
/** A unit's directive lines (comments and blank lines left out). */
const directives = (unit: string) =>
  readFileSync(join(DIR, unit), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"));

describe("the units' credentials", () => {
  test("no directive uses %d; each credentials path is the unit's own and names a credential it loads", () => {
    const problems: string[] = [];
    let paths = 0;
    for (const unit of units) {
      const lines = directives(unit);
      const loaded = new Set(lines.flatMap((line) => line.match(/^LoadCredential=([^:]+):/)?.slice(1) ?? []));
      // %d fails the same way in any directive on systemd 249 (`%%d` is a literal and stays allowed).
      for (const line of lines) {
        if (/(^|[^%])%d/.test(line)) problems.push(`${unit}: ${line}`);
      }
      for (const [, owner, name] of lines.join("\n").matchAll(/\/run\/credentials\/([^/\s]+)\/([^\s/"']+)/g)) {
        paths++;
        if (owner !== unit) problems.push(`${unit}: a credentials path of ${owner}`);
        if (!loaded.has(name)) problems.push(`${unit}: ${name} is not loaded by LoadCredential=`);
      }
    }
    expect(problems).toEqual([]);
    // The four units that take secrets: the keeper (3), its standby (4), the indexer (1) and the relay (2).
    expect(paths).toBe(10);
  });
});
