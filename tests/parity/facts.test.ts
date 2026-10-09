/**
 * Purpose: the acceptance test "ported reader matches pred-provable" for the two fact kinds: each
 *          captured mint and pool, and edited or broken copies of them, put before both programs;
 *          the openings and the six resolution steps compared case by case, every expected
 *          difference asserted with its source, and the table printed for the sprint's record.
 * Version: 0.0.3
 * Sprint:  03 (readers and resolution), lane A. The pred-provable half runs on any build; the
 *          brot-markets half needs the integration's SBF build. Leaves with pred-provable.
 */
import { afterAll, describe, expect, test } from "bun:test";

import { address } from "@solana/kit";

import * as P from "../brot/program";
import { DAMM_OFFSETS, FIXTURES, fixtureBytes, MINT_OFFSETS } from "../brot/readers";
import { changed, runOriginal, runPorted, STEPS, type Account, type Case } from "./facts-support";

/** What pred-provable answers at each of `STEPS`, for an opening both programs accept... */
const ORIGINAL_STEPS = ["not yet", "refused: account", "YES", "NO", "NO", "NO"];
/**
 * ...and what the port answers. Two steps differ by design, both from TP section 3.4.6 (its
 * irreversible-fact row and its "Any" row; `fact_resolution` in readers/shared.rs): after the
 * deadline the port reads the account again, so a fact met late is NO flagged `met_late`, where
 * pred-provable's `resolve` answers NO without reading, and an account that no longer reads voids
 * (`UnreadableAccount`), where pred-provable answers NO.
 */
const PORTED_STEPS = ["not yet", "refused: account", "YES", "NO", "NO, met late", "void: unreadable account"];
const AFTER_DEADLINE = "TP 3.4.6, the port reads after the deadline";

type Expected = { original: string; ported?: string; why?: string };
const BOTH: Expected = { original: "accepted" };
const refused = (reason: string): Expected => ({ original: `refused: ${reason}` });
/** C45: row 3's minimum distance, 1% of the current value (constants.rs, TP section 3.4.10 row 3),
 *  is new. pred-provable only asked that the goal be unmet. */
const C45: Expected = { original: "accepted", ported: "refused: too close", why: "C45, row 3's 1% distance" };
/** SPL Token's own unpacking refuses a `COption` tag other than 0 or 1, so no real mint carries one.
 *  The port refuses it as `ReaderBadLayout` (spl_mint.rs); pred-provable's `read_mint` read any
 *  non-zero tag as set, and never looked at the freeze tag for this kind. */
const SPL_TAGS = (original: string): Expected => ({ original, ported: "refused: account", why: "SPL Token tags" });
/** The Sprint 03 contract refuses a pool target at or below zero as `TargetUnreachable` (error.rs
 *  6076, damm_v2.rs); pred-provable refused a zero threshold as `MetricAlreadyMet`. */
const ZERO: Expected = { original: "refused: already met", ported: "refused: unreachable", why: "contract, 6076" };

/** A captured account at its own address, under its own owner, its bytes a fresh copy. */
function captured(name: string): Account {
  const entry = FIXTURES[name]!;
  return { address: address(entry.address), owner: address(entry.owner), data: fixtureBytes(name) };
}
const view = (data: Uint8Array) => new DataView(data.buffer, data.byteOffset, data.byteLength);
const [SUPPLY_AT, LOCK_AT] = [MINT_OFFSETS.supply, DAMM_OFFSETS.permanentLockLiquidity];
const u64At = (data: Uint8Array, at: number) => view(data).getBigUint64(at, true);
/** A mint's u64 supply, and a pool's u128 permanent lock (two little-endian u64 words). */
const supplyOf = (a: Account) => u64At(a.data, SUPPLY_AT);
const lockOf = (a: Account) => u64At(a.data, LOCK_AT) | (u64At(a.data, LOCK_AT + 8) << 64n);
/** The same account with another supply, or another lock. */
function withSupply(a: Account, supply: bigint) {
  return changed(a, { data: (d) => (view(d).setBigUint64(SUPPLY_AT, supply, true), d) });
}
function withLock(a: Account, lock: bigint) {
  const words = [lock & ((1n << 64n) - 1n), lock >> 64n];
  return changed(a, {
    data: (d) => (words.forEach((word, i) => view(d).setBigUint64(LOCK_AT + 8 * i, word, true)), d),
  });
}
/** The smallest goal at or above `x` that pred-provable can express: a u64 threshold shifted left. */
function representable(x: bigint): bigint {
  const shift = BigInt(Math.max(0, x.toString(2).length - 64));
  return ((x + (1n << shift) - 1n) >> shift) << shift;
}

const [wif, bonk, usdc, pyusd] = ["mint-wif", "mint-bonk", "mint-usdc", "mint-pyusd"].map(captured) as Account[];
const [ft8, solUsdc] = ["damm-ft8fd9", "damm-sol-usdc"].map(captured) as Account[];
const [S, BONK, L, SOL_USDC] = [supplyOf(wif), supplyOf(bonk), lockOf(ft8), lockOf(solUsdc)];
/** Row 3's distance from a captured supply: 1%, rounded up (never below one unit for these values). */
const pct = (value: bigint) => (value * P.MIN_DISTANCE_BPS.supply + 9_999n) / 10_000n;
const MAX_U128 = (1n << 128n) - 1n;
const edit = (account: Account, at: number, bytes: number[]) =>
  changed(account, { data: (d) => (d.set(bytes, at), d) });
const cut = (account: Account) => changed(account, { data: (d) => d.slice(0, -1) });
const stretched = (account: Account) => changed(account, { data: (d) => Uint8Array.from([...d, 0]) });
const zeroed = (account: Account) => changed(account, { data: (d) => new Uint8Array(d.length) });

function mint(fixture: string, label: string, target: bigint, account = captured(fixture)): Case {
  return { reader: "SupplyAtMost", fixture, label, account, target, met: withSupply(account, target) };
}
function pool(fixture: string, label: string, target: bigint, account = captured(fixture), met?: Account): Case {
  return { reader: "DammV2LockedAtLeast", fixture, label, account, target, met: met ?? withLock(account, target) };
}

const W = "mint-wif";
const FT8 = "damm-ft8fd9";
const T = representable(2n * L);
const [SOL_T, SOL_MAX] = [representable(2n * SOL_USDC), withLock(solUsdc, (1n << 128n) - 1n)];
const CASES: [Case, Expected][] = [
  [mint(W, "target half the supply", S / 2n), BOTH],
  [mint(W, "target exactly 1% below the supply", S - pct(S)), BOTH],
  [mint(W, "target one unit short of 1% below", S - pct(S) + 1n), C45],
  [mint(W, "target one unit below the supply", S - 1n), C45],
  [mint(W, "target at the supply", S), refused("already met")],
  [mint("mint-bonk", "target half the supply", BONK / 2n), BOTH],
  [mint("mint-bonk", "target one unit below the supply", BONK - 1n), C45],
  [mint("mint-usdc", "as captured, mint authority live", supplyOf(usdc) / 2n), refused("authority")],
  [mint("mint-pyusd", "as captured, a Token-2022 mint", supplyOf(pyusd) / 2n), refused("account")],
  [mint(W, "mint authority set", S / 2n, edit(wif, 0, [1])), refused("authority")],
  [mint(W, "owned by Token-2022", S / 2n, changed(wif, { owner: P.TOKEN_2022_PROGRAM_ID })), refused("account")],
  [mint(W, "cut by one byte", S / 2n, cut(wif)), refused("account")],
  [mint(W, "stretched by one byte", S / 2n, stretched(wif)), refused("account")],
  [mint(W, "all zero", S / 2n, zeroed(wif)), refused("account")],
  [mint(W, "not initialized", S / 2n, edit(wif, 45, [0])), refused("account")],
  [mint(W, "mint authority tag 2", S / 2n, edit(wif, 0, [2])), SPL_TAGS("refused: authority")],
  [mint(W, "freeze authority tag 2", S / 2n, edit(wif, 46, [2])), SPL_TAGS("accepted")],
  [pool(FT8, "target twice the lock", T), BOTH],
  [pool("damm-sol-usdc", "target twice the lock", SOL_T), BOTH],
  [pool("damm-sol-usdc", "target twice the lock, met by a u128::MAX lock", SOL_T, solUsdc, SOL_MAX), BOTH],
  [pool(FT8, "target just above the lock", representable(L + 1n)), C45],
  [pool(FT8, "target under the lock", (L >> 64n) << 64n), refused("already met")],
  [pool(FT8, "target zero", 0n), ZERO],
  [pool(FT8, "lock 1,000,000, target exactly 1% above", 1_010_000n, withLock(ft8, 1_000_000n)), BOTH],
  [pool(FT8, "lock 1,000,000, target one unit short of 1% above", 1_009_999n, withLock(ft8, 1_000_000n)), C45],
  [pool(FT8, "lock u128::MAX", T, withLock(ft8, MAX_U128)), refused("already met")],
  [pool(FT8, "owned by SPL Token", T, changed(ft8, { owner: P.SPL_TOKEN_PROGRAM_ID })), refused("account")],
  [pool(FT8, "cut by one byte", T, cut(ft8)), refused("account")],
  [pool(FT8, "stretched by one byte", T, stretched(ft8)), refused("account")],
  [pool(FT8, "another discriminator", T, edit(ft8, 0, [ft8.data[0] ^ 1])), refused("account")],
  [pool(FT8, "all zero", T, zeroed(ft8)), refused("account")],
];

/** reader | fixture | original result | ported result, one row per opening and per step. */
const table: string[][] = [];
afterAll(() => {
  const lines = table.map((row) => `| ${row.join(" | ")} |`);
  console.log(["", "| reader | fixture | original result | ported result |", "|---|---|---|---|", ...lines].join("\n"));
});

describe("ported reader matches pred-provable: SupplyAtMost and DammV2LockedAtLeast", () => {
  for (const [c, e] of CASES) {
    test(`${c.reader}, ${c.fixture}: ${c.label}`, async () => {
      // Both accept: the six steps run on both programs; otherwise the opening alone is compared.
      const both = e.original === "accepted" && e.ported === undefined;
      const expectedOriginal = both ? ["accepted", ...ORIGINAL_STEPS] : [e.original];
      const expectedPorted = both ? ["accepted", ...PORTED_STEPS] : [e.ported ?? e.original];
      const original = await runOriginal(c, both);
      const ported = await runPorted(c, both).catch((failure) => [`threw: ${failure}`]);
      original.forEach((answer, i) => {
        const port = ported[i] ?? "-";
        const why = i === 0 ? e.why : AFTER_DEADLINE;
        const note = port === answer ? "" : port === expectedPorted[i] ? ` (expected: ${why})` : " (UNEXPECTED)";
        table.push([c.reader, `${c.fixture}, ${c.label}: ${i === 0 ? "opening" : STEPS[i - 1]}`, answer, port + note]);
      });
      expect(original).toEqual(expectedOriginal);
      expect(ported).toEqual(expectedPorted);
    }, 30_000);
  }
});
