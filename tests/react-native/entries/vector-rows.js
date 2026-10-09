/**
 * Purpose: replays one line of either Rust vector file through `@brot/sdk/read`'s math: splits it into
 *          kind, inputs and expected output, and hands the inputs to the kind's row (rows-math.js,
 *          rows-snapshot.js). No formula is copied here.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 *
 * A line is `kind,inputs,outputs`, split on its first two commas only: inputs are `;`-separated and
 * an output may hold a tuple with a comma, such as `(2403614236, 0)`.
 */
import { MATH_ROWS } from "./rows-math";
import { SNAPSHOT_ROWS } from "./rows-snapshot";

const ROWS = { ...MATH_ROWS, ...SNAPSHOT_ROWS };

/** The kinds this runner replays, in the order the two files hold them. */
export const KINDS = Object.keys(ROWS);

/** One line: its kind, the SDK's output and the Rust output. `null` for the header or a blank line. */
export function replay(line) {
  const first = line.indexOf(",");
  const second = line.indexOf(",", first + 1);
  if (first < 0 || second < 0) return null;
  const kind = line.slice(0, first);
  if (kind === "kind") return null;
  const row = ROWS[kind];
  const expected = line.slice(second + 1);
  if (!row) return { kind, actual: `no replay for kind ${kind}`, expected };
  return { kind, actual: row(line.slice(first + 1, second).split(";")), expected };
}
