/**
 * Purpose: the CI step of the slot matrix: regenerates the matrix in memory and fails when the
 *          committed tests/brot/slot-matrix.gen.ts is stale (or missing).
 * Version: 0.0.1
 * Sprint:  04 (lane F). CI runs `bun scripts/slot-matrix-check.ts` after the IDL check.
 */
import { existsSync, readFileSync } from "node:fs";

import { buildMatrix, OUT_PATH } from "./slot-matrix";

const { text, cases } = await buildMatrix();
const committed = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, "utf8") : "";
if (committed !== text) {
  console.error("slot matrix is stale: run `bun scripts/slot-matrix.ts` and commit tests/brot/slot-matrix.gen.ts");
  process.exit(1);
}
console.log(`slot matrix is current (${cases.length} cases)`);
