/**
 * Purpose: the entry the Hermes VM runs: every row of the Rust math vectors replayed through the
 *          SDK's math (X0.3, the React Native half), with a count per file and per kind, the first
 *          mismatches, and an uncaught error, so a non-zero exit, when any row differs or a file holds
 *          fewer than 10,000 rows.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 *
 * `run.mjs` writes the vector files into `generated/vectors.json` before Metro starts, because Metro
 * bundles JavaScript and JSON, not CSV. Output goes through `console.log`, which React Native's
 * console polyfill maps to the Hermes CLI's `print`.
 */
import vectors from "../generated/vectors.json";
import { KINDS, replay } from "./vector-rows";

const perKind = {};
const perFile = {};
const mismatches = [];
const started = Date.now();
for (const [file, text] of Object.entries(vectors)) {
  perFile[file] = 0;
  for (const line of text.split("\n")) {
    const result = replay(line);
    if (result === null) continue;
    perFile[file] += 1;
    perKind[result.kind] = (perKind[result.kind] ?? 0) + 1;
    if (result.actual !== result.expected) mismatches.push({ file, line, actual: result.actual });
  }
}
const rows = Object.values(perFile).reduce((a, b) => a + b, 0);
const kinds = KINDS.filter((kind) => perKind[kind]).map((kind) => `${kind} ${perKind[kind]}`);
const files = Object.entries(perFile).map(([file, n]) => `${file} ${n}`);
console.log(`vectors: ${rows} rows replayed in ${Date.now() - started} ms (${files.join(", ")})`);
console.log(`vectors: per kind ${kinds.join(", ")}`);
console.log(`vectors: ${mismatches.length} mismatches`);
for (const { file, line, actual } of mismatches.slice(0, 5)) {
  console.log(`  ${file}: ${line}\n    sdk gave ${actual}`);
}
const short = Object.entries(perFile).filter(([, n]) => n < 10000);
if (short.length > 0) throw new Error(`fewer than 10,000 rows in ${short.map(([file]) => file).join(", ")} (X0.3)`);
if (mismatches.length > 0) throw new Error(`${mismatches.length} vector rows differ from the Rust output`);
