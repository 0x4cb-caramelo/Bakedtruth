/**
 * Purpose: every import rule of `.dependency-cruiser.cjs` fires (Sprint 05 review): the SDK is copied into
 *          a temporary folder with the configuration, one violation of each rule is planted there, and
 *          dependency-cruiser must report every rule by name. A rule added without a plant fails the test.
 *          The repository's own tree is never written; `bun run lint:sdk` checks it as it is.
 *          Filter: `bun test tests/ -t "every import rule fires"`.
 * Version: 0.1.1 (Sprint 08: the relay's plant, now that services/rpc exists)
 * Sprint:  05 (SDK); 08
 */
import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../..");
const SDK = "packages/sdk/src";

/** One planted file per rule (two for the cycle): its path in the copy and its one import. */
const PLANTS: Record<string, [path: string, source: string][]> = {
  "sdk-read-never-imports-tx": [[`${SDK}/read/__plant_tx.ts`, 'import "../tx/index";']],
  "sdk-read-tx-without-zod": [[`${SDK}/tx/__plant_zod.ts`, 'import "zod";']],
  "sdk-read-tx-never-import-schemas": [[`${SDK}/read/__plant_schemas.ts`, 'import "../schemas/index";']],
  "sdk-no-node-builtins": [[`${SDK}/read/__plant_node.ts`, 'import "node:fs";']],
  "sdk-no-frameworks": [[`${SDK}/tx/__plant_react.ts`, 'import "react";']],
  "sdk-self-contained": [
    ["tests/__plant_target.ts", "export {};"],
    [`${SDK}/read/__plant_self.ts`, 'import "../../../../tests/__plant_target";'],
  ],
  "sdk-not-codama-errors": [[`${SDK}/read/__plant_errors.ts`, 'import "../idl/generated/errors/index";']],
  "read-services-import-read-only": [
    ["services/indexer/__plant.ts", `import "../../${SDK}/tx/index";`],
    ["services/rpc/__plant.ts", `import "../../${SDK}/tx/index";`], // the relay, since Sprint 08
  ],
  "sdk-no-circular": [
    [`${SDK}/read/__plant_a.ts`, 'import "./__plant_b";'],
    [`${SDK}/read/__plant_b.ts`, 'import "./__plant_a";'],
  ],
};

describe("every import rule fires", () => {
  test("one planted violation per rule, in a copy of the SDK, and each rule reported by name", () => {
    const rules = (require(join(ROOT, ".dependency-cruiser.cjs")) as { forbidden: { name: string }[] }).forbidden;
    expect(rules.map((rule) => rule.name).sort()).toEqual(Object.keys(PLANTS).sort());
    const dir = mkdtempSync(join(tmpdir(), "brot-sdk-plants-"));
    try {
      cpSync(join(ROOT, SDK), join(dir, SDK), { recursive: true });
      for (const file of [".dependency-cruiser.cjs", "tsconfig.json", "package.json", "packages/sdk/package.json"]) {
        cpSync(join(ROOT, file), join(dir, file));
      }
      symlinkSync(join(ROOT, "node_modules"), join(dir, "node_modules"));
      symlinkSync(join(ROOT, "packages/sdk/node_modules"), join(dir, "packages/sdk/node_modules"));
      for (const [path, source] of Object.values(PLANTS).flat()) {
        mkdirSync(dirname(join(dir, path)), { recursive: true });
        writeFileSync(join(dir, path), `${source}\n`);
      }
      const args = ["x", "--bun", "depcruise", SDK, "services", "--config", ".dependency-cruiser.cjs", "-T", "json"];
      const run = spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8" });
      const report = JSON.parse(run.stdout) as { summary: { violations: { rule: { name: string } }[] } };
      const fired = new Set(report.summary.violations.map((v) => v.rule.name));
      expect([...fired].sort()).toEqual(Object.keys(PLANTS).sort());
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});
