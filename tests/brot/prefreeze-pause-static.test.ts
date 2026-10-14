/**
 * Purpose: F7 of the pre-freeze review (Sprint 16), the static half of I10′: the pause gates only the opening and the
 *          joins because only they read `operating_level` to refuse. Every file of the program's source that names the
 *          field, outside comments, is one of six with a known role: the two gates (`open_campaign.rs`,
 *          `join_core.rs`, one read each, which the sealed entry reaches through `join_core`), the field, the value
 *          `admin_initialize_config` writes, and the two toggles. A seventh file is a new pause gate: this test fails
 *          until it is reviewed and walked in prefreeze-pause.test.ts.
 * Version: 0.0.1
 * Sprint:  16 (lane L16P, the review's follow-ups). Reads the source only; needs no binary.
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE = "programs/brot-markets/src";
/** Each file that may name the field, with what it does with it. */
const ROLES: Record<string, string> = {
  "instructions/campaigns/open_campaign.rs": "gate: OpenWhilePaused",
  "instructions/entries/join_core.rs": "gate: JoinWhilePaused (the join and the sealed entry)",
  "state/config.rs": "the field",
  "instructions/admin/initialize_config.rs": "writes Normal",
  "instructions/admin/pause_entries.rs": "toggles to EntriesHalted",
  "instructions/admin/resume_entries.rs": "toggles to Normal",
};
const NAMES = /\boperating_level\b/;
const EVERY = /\boperating_level\b/g;

/** The file's code without its comment lines. */
const code = (file: string) =>
  readFileSync(join(SOURCE, file), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

describe("paused campaign refuses new money, never payouts", () => {
  test("only the opening and the joins read the pause: every use of operating_level in the source", () => {
    const files = readdirSync(SOURCE, { recursive: true })
      .map(String)
      .filter((file) => file.endsWith(".rs"));
    const naming = files.filter((file) => NAMES.test(code(file)));
    expect(naming.sort()).toEqual(Object.keys(ROLES).sort());
    for (const gate of ["instructions/campaigns/open_campaign.rs", "instructions/entries/join_core.rs"]) {
      expect(code(gate).match(EVERY)?.length).toBe(1);
    }
  });
});
