/**
 * Purpose: the two fact readers in the program, on the mainnet accounts of tests/fixtures: a team key
 *          opens `SupplyAtMost` and `DammV2LockedAtLeast` campaigns on the real mints and pools, and
 *          `resolve_campaign` reads them after the supply or the lock is edited in memory (YES before
 *          the deadline, NO flagged `met_late` after, void when unreadable); rows 2 and 3 refuse.
 * Version: 0.0.3
 * Sprint:  03 (readers and resolution), lane A. Needs the integration's SBF build (not the contract's).
 */
import { describe, expect, test } from "bun:test";
import { type Address } from "@solana/kit";

import { injectCampaign } from "./campaigns";
import { BrotError, type BrotErrorName } from "./errors";
import { newId, readCampaign } from "./flows";
import * as I from "./instructions";
import { openingWorld, type OpeningWorld } from "./opening";
import * as P from "./program";
import { DAMM_OFFSETS, fixtureBytes, MINT_OFFSETS, setFixture, setRawAccount } from "./readers";
import { expectError, expectOk, now, send, setTime, type Sent } from "./setup";

/** An opening: the account (written first when given), the target, the error (`null`: it opens). */
type Row = [label: string, metric: Address, target: bigint, error: BrotErrorName | null, account?: Account];
type Account = [data: Uint8Array, owner: Address];
type At = { campaign: Address; metric: Address; target: bigint; deadlineAt: bigint };
const view = (data: Uint8Array) => new DataView(data.buffer, data.byteOffset, data.byteLength);
const [SUPPLY_AT, LOCK_AT] = [MINT_OFFSETS.supply, DAMM_OFFSETS.permanentLockLiquidity];
const readU64 = (data: Uint8Array, at: number) => view(data).getBigUint64(at, true);
const readU128 = (data: Uint8Array, at: number) => readU64(data, at) | (readU64(data, at + 8) << 64n);
const u128Bytes = (v: bigint) => Uint8Array.from({ length: 16 }, (_, i) => Number((v >> BigInt(8 * i)) & 0xffn));
const writeU128 = (data: Uint8Array, at: number, value: bigint) => data.set(u128Bytes(value), at);
/** Row 3's minimum distance from `value` (constants.rs): `bps` of it, rounded up, at least one unit. */
const atLeastOne = (units: bigint) => (units > 0n ? units : 1n);
const distance = (value: bigint, bps: bigint) => atLeastOne((value * bps + 9_999n) / 10_000n);

/** What each fact kind reads, how a test moves it, and where row 3 puts the nearest target. */
const SUPPLY = {
  name: "SupplyAtMost",
  kind: P.ReaderKind.SupplyAtMost,
  fixtures: ["mint-wif", "mint-bonk"],
  read: (data: Uint8Array) => readU64(data, SUPPLY_AT),
  write: (data: Uint8Array, supply: bigint) => view(data).setBigUint64(SUPPLY_AT, supply, true),
  // Met at or below the target: the nearest target is 1% below, one unit above it is not met.
  nearest: (supply: bigint) => supply - distance(supply, P.MIN_DISTANCE_BPS.supply),
  short: (target: bigint) => target + 1n,
  far: (supply: bigint) => supply / 2n,
  // Unreadable: the same bytes under Token-2022.
  unreadable: { cut: 0, owner: P.TOKEN_2022_PROGRAM_ID, error: "ReaderWrongOwner" as BrotErrorName },
};
const DAMM = {
  name: "DammV2LockedAtLeast",
  kind: P.ReaderKind.DammV2LockedAtLeast,
  fixtures: ["damm-ft8fd9", "damm-sol-usdc"],
  read: (data: Uint8Array) => readU128(data, LOCK_AT),
  write: (data: Uint8Array, lock: bigint) => writeU128(data, LOCK_AT, lock),
  // Met at or above the target: the nearest target is 1% above, one unit below it is not met.
  nearest: (lock: bigint) => lock + distance(lock, P.MIN_DISTANCE_BPS.damm),
  short: (target: bigint) => target - 1n,
  far: (lock: bigint) => lock * 2n,
  // Unreadable: the pool cut by one byte.
  unreadable: { cut: 1, owner: P.DAMM_V2_PROGRAM_ID, error: "ReaderBadLayout" as BrotErrorName },
};
const FACTS = [SUPPLY, DAMM];

/** A fact campaign opened by the world's team key (free, so SOL/USD is not read), seven days long. */
async function openFact(w: OpeningWorld, kind: number, metric: Address, target: bigint) {
  const [id, deadlineAt, feedId] = [newId(), now(w.client) + 7n * P.DAY, new Uint8Array(32)];
  const args = { id, kind, direction: 0, feedId, target, deadlineAt, openingUsd: 0n, maxLamports: 0n, epoch: 0n };
  const sent = await send(w, [await I.openCampaignIx(w.team, args, { metric })]);
  return { sent, at: { campaign: await P.campaignPda(id), metric, target, deadlineAt } };
}

/** Opens and expects success: the campaign stores the kind, the account and the target as given. */
async function opened(w: OpeningWorld, kind: number, metric: Address, target: bigint): Promise<At> {
  const { sent, at } = await openFact(w, kind, metric, target);
  expectOk(sent);
  expect(readCampaign(w, at.campaign)).toMatchObject({ kind, metric_account: metric, target, price_exponent: 0 });
  return at;
}

/** A campaign written straight into the world (no opening rules), its deadline seven days away. */
async function injected(w: OpeningWorld, kind: number, metric: Address, target: bigint): Promise<At> {
  const [start, creator, id] = [now(w.client), w.team.address, newId()];
  const times = { opensAt: start, entriesCloseAt: start + 5n * P.DAY, deadlineAt: start + 7n * P.DAY };
  const { campaign } = await injectCampaign(w.client, { id, kind, metric, target, creator, ...times });
  return { campaign, metric, target, deadlineAt: times.deadlineAt };
}

const resolve = (w: OpeningWorld, at: At) => send(w, [I.resolveCampaignIx(at.campaign, at.metric)]);

/** The outcome as the campaign records it and as `CampaignResolved` carries it, read from `metric`. */
function expectResolved(w: OpeningWorld, sent: Sent, at: At, outcome: number, observed: bigint, more = {}) {
  const ok = expectOk(sent);
  const recorded = { outcome, met_late: false, void_reason: P.VoidReason.None, observed_value: observed, ...more };
  expect(readCampaign(w, at.campaign)).toMatchObject({ ...recorded, status: P.Status.InReview });
  const event = ok.events.find((e) => e.name === "CampaignResolved");
  expect(event?.data).toMatchObject({ ...recorded, campaign: at.campaign, read_account: at.metric });
}

/** Each row's opening is refused with its error, or opens; all rows are reported together. */
async function expectOpenings(w: OpeningWorld, kind: number, rows: Row[]) {
  const name = (code: number | null) => Object.keys(BrotError).find((k) => BrotError[k as BrotErrorName] === code);
  const results: [string, string | undefined][] = [];
  for (const [label, metric, target, , account] of rows) {
    if (account) setRawAccount(w.client, metric, ...account);
    const { sent } = await openFact(w, kind, metric, target);
    results.push([label, sent.ok ? "opens" : (name(sent.code) ?? `code ${sent.code}`)]);
  }
  expect(results).toEqual(rows.map(([label, , , error]) => [label, error ?? "opens"]));
}

for (const fact of FACTS) {
  const rewrite = (w: OpeningWorld, name: string, value: bigint) =>
    setFixture(w.client, name, { mutate: (data) => fact.write(data, value) });

  describe(`readers match fixtures: ${fact.name} on the captured accounts`, () => {
    for (const name of fact.fixtures) {
      test(`${name}: opens at row 3's distance, waits, and is YES once the value reaches the target`, async () => {
        const w = await openingWorld();
        const { address, data } = setFixture(w.client, name);
        const at = await opened(w, fact.kind, address, fact.nearest(fact.read(data)));
        expectError(await resolve(w, at), "NotResolvableYet");
        // One unit short of the target is still not met; at the target it is.
        rewrite(w, name, fact.short(at.target));
        expectError(await resolve(w, at), "NotResolvableYet");
        rewrite(w, name, at.target);
        expectResolved(w, await resolve(w, at), at, P.Outcome.Yes, at.target);
      });
    }

    test("after the deadline: NO, flagged met_late when met late and unflagged when never met", async () => {
      const w = await openingWorld();
      const { address, data } = setFixture(w.client, fact.fixtures[0]!);
      const late = await opened(w, fact.kind, address, fact.far(fact.read(data)));
      const never = await opened(w, fact.kind, address, fact.far(late.target));
      setTime(w.client, late.deadlineAt + 1n);
      rewrite(w, fact.fixtures[0]!, late.target);
      expectResolved(w, await resolve(w, late), late, P.Outcome.No, late.target, { met_late: true });
      expectResolved(w, await resolve(w, never), never, P.Outcome.No, late.target);
    });

    test("an unreadable account: resolution refused up to the deadline's second, void after it", async () => {
      const w = await openingWorld();
      const { address, data } = setFixture(w.client, fact.fixtures[0]!);
      const { cut, owner, error } = fact.unreadable;
      setRawAccount(w.client, address, data.slice(0, data.length - cut), owner);
      const at = await injected(w, fact.kind, address, 1n);
      setTime(w.client, at.deadlineAt);
      expectError(await resolve(w, at), error);
      setTime(w.client, at.deadlineAt + 1n);
      expectResolved(w, await resolve(w, at), at, P.Outcome.Void, 0n, { void_reason: P.VoidReason.UnreadableAccount });
    });
  });
}

describe("readers match fixtures: what rows 2 and 3 refuse on the captured accounts", () => {
  test("SupplyAtMost refuses USDC (authority live), Token-2022 PYUSD and targets too close or met", async () => {
    const w = await openingWorld();
    const [usdc, pyusd, wif] = ["mint-usdc", "mint-pyusd", "mint-wif"].map((n) => setFixture(w.client, n).address);
    const supply = SUPPLY.read(fixtureBytes("mint-wif"));
    const target = SUPPLY.nearest(supply);
    await expectOpenings(w, SUPPLY.kind, [
      ["USDC, mint authority live", usdc, 1n, "MintAuthorityLive"],
      ["PYUSD, a Token-2022 mint", pyusd, 0n, "ReaderWrongOwner"],
      ["WIF, a target below zero", wif, -1n, "TargetUnreachable"],
      ["WIF, a target at the supply", wif, supply, "TargetAlreadyTouched"],
      ["WIF, one unit below the supply", wif, supply - 1n, "TargetTooClose"],
      ["WIF, one unit short of 1% below", wif, target + 1n, "TargetTooClose"],
      ["WIF, exactly 1% below", wif, target, null],
    ]);
  });

  test("DammV2LockedAtLeast refuses another owner, a cut or stretched pool, another type and close targets", async () => {
    const w = await openingWorld();
    const { address: pool, data: bytes } = setFixture(w.client, "damm-ft8fd9");
    const [lock, target] = [DAMM.read(bytes), DAMM.nearest(DAMM.read(bytes))];
    const [damm, flipped] = [P.DAMM_V2_PROGRAM_ID, Uint8Array.from(bytes, (b, i) => (i === 0 ? b ^ 1 : b))];
    // The targets first, on the pool as captured; then the broken pools, each written over it.
    const rows: Row[] = [
      ["a target of zero", pool, 0n, "TargetUnreachable"],
      ["a target at the lock", pool, lock, "TargetAlreadyTouched"],
      ["one unit short of 1% above", pool, target - 1n, "TargetTooClose"],
      ["exactly 1% above", pool, target, null],
      ["owned by SPL Token", pool, lock * 2n, "ReaderWrongOwner", [bytes, P.SPL_TOKEN_PROGRAM_ID]],
      ["another discriminator", pool, lock * 2n, "ReaderBadLayout", [flipped, damm]],
      ["cut by one byte", pool, lock * 2n, "ReaderBadLayout", [bytes.slice(0, -1), damm]],
      ["stretched by one byte", pool, lock * 2n, "ReaderBadLayout", [Uint8Array.from([...bytes, 0]), damm]],
    ];
    await expectOpenings(w, DAMM.kind, rows);
  });

  test("DammV2LockedAtLeast reads a lock above i128::MAX as i128::MAX, which meets the largest target", async () => {
    const w = await openingWorld();
    const { address: pool } = setFixture(w.client, "damm-ft8fd9", { mutate: (d) => DAMM.write(d, (1n << 128n) - 1n) });
    const max = (1n << 127n) - 1n;
    const at = await injected(w, DAMM.kind, pool, max);
    expectResolved(w, await resolve(w, at), at, P.Outcome.Yes, max);
  });
});
