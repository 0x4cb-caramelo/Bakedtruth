/**
 * Purpose: every alert the keeper can raise has its runbook (Sprint 07 DoD: "a runbook per alert in deploy/vps/ says
 *          who acts, how, and how fast"): for each kind in `ALERT_KINDS` the file deploy/vps/runbooks/<kind with
 *          dashes>.md exists, says who acts, how and by when, and is listed in the runbooks' index.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the runbooks of the new alerts)
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { ALERT_KINDS } from "../src/alert";

const DIR = join(import.meta.dir, "../../../deploy/vps/runbooks");

describe("runbooks", () => {
  test.each(ALERT_KINDS.map((kind) => [kind]))("%s has a runbook with who, how and by when, in the index", (kind) => {
    const file = `${kind.replaceAll("_", "-")}.md`;
    expect(existsSync(join(DIR, file))).toBe(true);
    const text = readFileSync(join(DIR, file), "utf8");
    for (const section of ["**Quem age.**", "**Como", "**Prazo.**"]) expect(text).toContain(section);
    expect(readFileSync(join(DIR, "README.md"), "utf8")).toContain(`(${file})`);
  });
});
