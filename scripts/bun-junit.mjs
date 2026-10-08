/**
 * Purpose: reads the JUnit file `bun test --reporter=junit` writes: each test by name, with its
 *          body (empty when it passed, `<skipped />` when filtered out, `<failure …>` when it failed).
 *          Bun names each test on its console only on a terminal; the file lists them anywhere.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio): used by scripts/checks-mutation.mjs (X0.9).
 */
/** The JUnit testcases by name, each with its body ("" when self-closing, so it passed). */
export function junitCases(xml) {
  const cases = new Map();
  for (const m of xml.matchAll(/<testcase name="([^"]*)"[^>]*?(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
    cases.set(unxml(m[1]), m[2] ?? "");
  }
  return cases;
}
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
export const unxml = (s) => s.replace(/&(amp|lt|gt|quot|apos);/g, (_, e) => ENTITIES[e]);
