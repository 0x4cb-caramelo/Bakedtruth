/**
 * Purpose: runs every case of the slot matrix (tests/brot/slot-matrix.gen.ts) against the binary: each
 *          refused with its own BrotError, and no lamport of the instruction's accounts moved (T24, the
 *          Sprint 04 slot matrix). Needs `target/deploy/brot_markets.so`; runs at integration.
 * Version: 0.0.2
 * Sprint:  04 (settlement and invariants), lane F; a disabled baseline's error is the DISABLED map's (the scaffold of
 *          Sprints 14–15, 2026-10-13)
 */
import { describe, expect, test } from "bun:test";

import { DISABLED } from "../../scripts/slot-matrix-spec";
import { BrotError } from "./errors";
import { SLOT_MATRIX, SLOT_MATRIX_COUNTS } from "./slot-matrix.gen";
import { BASELINES } from "./slot-matrix-fixtures";
import { mutate } from "./slot-matrix-mutate";
import { balance, send } from "./setup";

describe("slot matrix", () => {
  test("the generated matrix is complete: every instruction has cases and a baseline", () => {
    expect(SLOT_MATRIX.length).toBe(Object.values(SLOT_MATRIX_COUNTS).reduce((a, b) => a + b, 0));
    for (const name of Object.keys(SLOT_MATRIX_COUNTS)) expect(BASELINES[name]).toBeDefined();
  });

  test("slot matrix: every case refuses with its own error and moves no lamport", async () => {
    const failures: string[] = [];
    for (const [name, baseline] of Object.entries(BASELINES)) {
      const cases = SLOT_MATRIX.filter((c) => c.ix === name);
      if (cases.length === 0) continue;
      const valid = await baseline();
      const sanity = await send(valid.w, [valid.ix]);
      // A disabled instruction (TeamOpenContest; the scaffold's stubs until their lanes) is refused by design: its
      // baseline must be refused with the error DISABLED names.
      const disabled = DISABLED[name] as keyof typeof BrotError | undefined;
      if (disabled ? sanity.ok || sanity.code !== BrotError[disabled] : !sanity.ok) {
        failures.push(
          `${name}: the baseline is ${sanity.ok ? "accepted" : `refused (${sanity.error})`}; its cases prove nothing`,
        );
        continue;
      }
      const { w, ix } = await baseline();
      const accounts = (ix.accounts ?? []).map((a) => a.address);
      for (const c of cases) {
        const label = `${name} ${c.cat} ${c.name}${c.src ? ` (${c.src})` : ""}${c.with !== undefined ? ` (with ${c.with})` : ""}`;
        const before = accounts.map((a) => balance(w, a));
        const sent = await send(w, [await mutate(w, ix, c)]);
        if (sent.ok) {
          failures.push(`${label}: succeeded, expected ${c.expect}`);
        } else if (sent.code !== BrotError[c.expect as keyof typeof BrotError]) {
          failures.push(`${label}: expected ${c.expect}, got ${sent.error}`);
        }
        const after = accounts.map((a) => balance(w, a));
        if (before.some((b, k) => b !== after[k])) failures.push(`${label}: moved lamports`);
      }
    }
    expect(failures).toEqual([]);
  }, 1_800_000);
});
