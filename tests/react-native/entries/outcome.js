/**
 * Purpose: an SDK call's result written the way the Rust vector generators print a `Result`: the value
 *          through a formatter, or `ERR:<Name>` for a `BrotRefusal`. Anything else thrown is written
 *          `THROW:<message>`, which matches no expected output, so it counts as a mismatch.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 */
import { BrotRefusal } from "@brot/sdk/read";

/** `{ ok: true, value }`, or `{ ok: false, text }` holding what the generators print for a failure. */
export function attempt(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    if (error instanceof BrotRefusal) return { ok: false, text: `ERR:${error.errorName}` };
    return { ok: false, text: `THROW:${error && error.message}` };
  }
}

/** The result as a string: the value through `format`, or the failure's text. */
export const shown = (result, format = String) => (result.ok ? format(result.value) : result.text);
