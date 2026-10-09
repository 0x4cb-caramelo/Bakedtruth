/**
 * Purpose: what the two vector replays share: reading a vector file, running an SDK function the way the
 *          Rust generators print a `Result` (`ERR:<BrotError>` for a refusal), and comparing every row.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { expect } from "bun:test";
import { readFileSync } from "node:fs";

import { BrotRefusal } from "@brot/sdk/read";

export type Outcome = { ok: true; value: any } | { ok: false; error: string };

/** Runs `f`; a `BrotRefusal` becomes the refusal, anything else is a bug and throws. */
export function attempt(f: () => unknown): Outcome {
  try {
    return { ok: true, value: f() };
  } catch (error) {
    if (error instanceof BrotRefusal) return { ok: false, error: error.errorName };
    throw error;
  }
}

/** A `Result` printed as the generators print it. */
export const show = (outcome: Outcome, format: (value: any) => string = String) =>
  outcome.ok ? format(outcome.value) : `ERR:${outcome.error}`;

/** `Result::and_then`: the first refusal carries through. */
export const then = (first: Outcome, next: (value: any) => unknown): Outcome =>
  first.ok ? attempt(() => next(first.value)) : first;

export const tuple = (...values: bigint[]) => `(${values.join(", ")})`;

/**
 * Replays every row of `path` through `replay(kind, inputs)` and expects the Rust output, with no
 * mismatch and at least 10,000 rows (X0.3). Lines are `kind,inputs,outputs`, split on the first two
 * commas only, because outputs may hold commas inside tuples.
 */
export function replayFile(path: string, replay: (kind: string, inputs: string[]) => string) {
  const lines = readFileSync(path, "utf8").trim().split("\n");
  expect(lines[0]).toBe("kind,inputs,outputs");
  const counts: Record<string, number> = {};
  const mismatches: string[] = [];
  for (const line of lines.slice(1)) {
    const first = line.indexOf(",");
    const second = line.indexOf(",", first + 1);
    const kind = line.slice(0, first);
    const expected = line.slice(second + 1);
    const actual = replay(kind, line.slice(first + 1, second).split(";"));
    counts[kind] = (counts[kind] ?? 0) + 1;
    if (actual !== expected) mismatches.push(`${line}\n  sdk: ${actual}`);
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`${path}: ${total} rows replayed ${JSON.stringify(counts)}, ${mismatches.length} mismatches`);
  expect(mismatches.slice(0, 5)).toEqual([]);
  expect(total).toBeGreaterThanOrEqual(10_000);
}
