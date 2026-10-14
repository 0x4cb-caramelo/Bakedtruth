/**
 * Purpose: F7 of the pre-freeze review (Sprint 16), the static half of I10′: the pause gates only the opening and the
 *          joins because only they read `operating_level` to refuse. Every file of the program's source that names the
 *          field, outside comments, is one of six with a known role: the two gates (`open_campaign.rs`,
 *          `join_core.rs`, one read each, which the sealed entry reaches through `join_core`), the field, the value
 *          `admin_initialize_config` writes, and the two toggles. A seventh file is a new pause gate: this test fails
 *          until it is reviewed and walked in prefreeze-pause.test.ts. Since the second review's R2 (S-6) the field's
 *          own file names it once, at its declaration, so no helper there can read it for a third gate, and the files
 *          that name the level's type are pinned the same way (the six and `state/enums.rs`, which declares it).
 * Version: 0.0.3 (the third review's P2: every file's count pinned, so no file of the six can grow a helper)
 * Sprint:  16 (lane L16P, the reviews' follow-ups). Reads the source only; needs no binary.
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE = "programs/brot-markets/src";
/** Each file that may name the field, with what it does with it. */
const ROLES: Record<string, string> = {
  "instructions/campaigns/open_campaign.rs": "gate: OpenWhilePaused",
  "instructions/entries/join_core.rs": "gate: JoinWhilePaused (the join and the sealed entry)",
  "state/config.rs": "the field, declared once",
  "instructions/admin/initialize_config.rs": "writes Normal",
  "instructions/admin/pause_entries.rs": "toggles to EntriesHalted",
  "instructions/admin/resume_entries.rs": "toggles to Normal",
};
/** How many times each of them names the field, outside comments: one more anywhere is a reviewable change. */
const USES: Record<string, number> = {
  "instructions/campaigns/open_campaign.rs": 1,
  "instructions/entries/join_core.rs": 1,
  "state/config.rs": 1,
  "instructions/admin/initialize_config.rs": 1,
  "instructions/admin/pause_entries.rs": 2,
  "instructions/admin/resume_entries.rs": 2,
};
/** The files that may name the level's type: the six above, and the one that declares it. */
const TYPE_NAMED = [...Object.keys(ROLES), "state/enums.rs"];
const count = (text: string, word: string) => text.match(new RegExp(`\\b${word}\\b`, "g"))?.length ?? 0;

/** The file's code without its comment lines. */
const code = (file: string) =>
  readFileSync(join(SOURCE, file), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
const files = readdirSync(SOURCE, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".rs"));
const naming = (word: string) => files.filter((file) => count(code(file), word) > 0).sort();

describe("paused campaign refuses new money, never payouts", () => {
  test("only the opening and the joins read the pause: every use of operating_level in the source", () => {
    expect(naming("operating_level")).toEqual(Object.keys(ROLES).sort());
    // Each file's count is pinned: the two gates read it once, the field's own file declares it and reads it nowhere,
    // and the three admin files write it. A helper added to any of them (an inherent `impl GlobalConfig` can live in
    // any module) changes a count and fails here until it is reviewed.
    for (const [file, uses] of Object.entries(USES))
      expect([file, count(code(file), "operating_level")]).toEqual([file, uses]);
    expect(naming("OperatingLevel")).toEqual([...TYPE_NAMED].sort());
  });
});
