/**
 * Purpose: prints the compute units of each instruction's valid baseline and the program binary's
 *          size, in the Sprint 03 "Measurements" table's shape (T3). Runs in LiteSVM against
 *          target/deploy/brot_markets.so, so it needs the built binary (integration, not now).
 * Usage:   bun scripts/measure-cu.ts
 * Version: 0.0.1
 * Sprint:  04 (lane F)
 */
import { statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { PROGRAM_SO } from "../tests/brot/program";
import { send } from "../tests/brot/setup";
import { BASELINES } from "../tests/brot/slot-matrix-fixtures";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
/** AdminInitializeConfig -> admin_initialize_config, the Sprint 03 table's spelling. */
const snake = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
const bytes = statSync(join(ROOT, PROGRAM_SO)).size;

const rows: string[] = ["| Instruction (LiteSVM, integrated binary) | Compute units | Binary size |", "|---|---|---|"];
for (const [name, make] of Object.entries(BASELINES)) {
  const { w, ix } = await make();
  const sent = await send(w, [ix]);
  const cu = sent.ok ? sent.computeUnits.toLocaleString("en-US") : `refused (${sent.error})`;
  rows.push(`| \`${snake(name)}\` | ${cu} | ${bytes.toLocaleString("en-US")} bytes |`);
}
console.log(rows.join("\n"));
