/**
 * Purpose: A-10 for the box's other kinds and its price refusals past row 4's staleness (the Sprint 19 adversarial
 *          review, M7): a stake pool opened on its measured epoch, a Meteora pool on its locked liquidity and a burn on
 *          a revoked mint, each accepted by the box and by the program; then the epoch refusals, a pool that stopped updating, a pool's
 *          target already met, a resized DAMM v2 account, a price band too wide, a target out of reach, and a feed
 *          Pyth no longer fully verifies. Each is built through the box (a draft read through the site's RPC, checked
 *          by `checkBox`), and the very arguments it would sign go straight to the program in LiteSVM, past the site,
 *          which gives the same verdict. A team key opens, so the SOL/USD price is not read (TP §3.4.10 row 7).
 *          Filter: `bun test tests/ -t "the box's other kinds agree with the program"`.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { generateKeyPairSigner } from "@solana/kit";

import { checkBox } from "../../app/features/open-campaign/check";
import { readDraftAccounts, readWorld } from "../../app/features/open-campaign/reads";
import { BTC_PRICE } from "../brot/flows";
import { BTC_CONF, openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import {
  DAMM_OFFSETS,
  fixtureBytes,
  mintBytes,
  setClock,
  setFixture,
  setMainnetEpochSchedule,
  setRawAccount,
  STAKE_POOL_OFFSETS,
} from "../brot/readers";
import { expectError, expectOk, setPriceAccount } from "../brot/setup";
import { boxThenProgram, closeChains, expectBoxRefusal, PRICE_DRAFT, usd } from "./open-cases";

afterEach(closeChains);

const u64At = (name: string, at: number) => new DataView(fixtureBytes(name).buffer).getBigUint64(at, true);
const POOL_EPOCH = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.lastUpdateEpoch);
const POOL_TOTAL = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.totalLamports);
const POOL_LAST = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.lastEpochTotalLamports);
const POOL_HIGH = POOL_TOTAL > POOL_LAST ? POOL_TOTAL : POOL_LAST;
const LOCKED =
  u64At("damm-sol-usdc", DAMM_OFFSETS.permanentLockLiquidity) |
  (u64At("damm-sol-usdc", DAMM_OFFSETS.permanentLockLiquidity + 8) << 64n);

/** Lamports as the box's SOL field takes them: at most 4 decimals, rounded `up` or down. */
const solText = (lamports: bigint, up: boolean) => {
  const step = 100_000n;
  const rounded = up ? ((lamports + step - 1n) / step) * step : (lamports / step) * step;
  return `${rounded / 1_000_000_000n}.${String((rounded % 1_000_000_000n) / step).padStart(4, "0")}`;
};

/** A world on the pool's epoch, with JitoSOL's pool last updated at `lastUpdateEpoch`. */
async function poolWorld(lastUpdateEpoch = POOL_EPOCH) {
  const w = await openingWorld();
  setMainnetEpochSchedule(w.client);
  setClock(w.client, { epoch: POOL_EPOCH, slot: POOL_EPOCH * 432_000n + 1_000n });
  const mutate = (_: Uint8Array, view: DataView) =>
    view.setBigUint64(STAKE_POOL_OFFSETS.lastUpdateEpoch, lastUpdateEpoch, true);
  return { w, pool: setFixture(w.client, "stakepool-jitosol", { mutate }).address };
}

const poolDraft = (pool: string, epoch: bigint, target: string) => ({
  ...PRICE_DRAFT,
  kind: "pool" as const,
  account: pool,
  epoch: epoch.toString(),
  target,
});

describe("the box's other kinds agree with the program", () => {
  test("a stake pool on its measured epoch: accepted; the epoch started, too late, or a target already met", async () => {
    const { w, pool } = await poolWorld();
    const next = POOL_EPOCH + 1n;
    const accepted = await boxThenProgram(w, w.team, poolDraft(pool, next, solText((POOL_HIGH * 105n) / 100n, true)));
    expect(accepted.check.verdict?.ok).toBe(true);
    expect(accepted.check.issues.filter((i) => i.place !== "wallet")).toEqual([]);
    expectOk(await accepted.program());
    const refused = [
      ["EpochAlreadyStarted", poolDraft(pool, POOL_EPOCH, solText((POOL_HIGH * 105n) / 100n, true))],
      ["EpochAfterDeadline", poolDraft(pool, POOL_EPOCH + 10n, solText((POOL_HIGH * 105n) / 100n, true))],
      ["TargetAlreadyTouched", poolDraft(pool, next, solText(POOL_TOTAL < POOL_LAST ? POOL_TOTAL : POOL_LAST, false))],
    ] as const;
    for (const [error, draft] of refused) {
      const { check, program } = await boxThenProgram(w, w.team, draft);
      expectBoxRefusal(check, error);
      expectError(await program(), error);
    }
  });

  test("a stake pool that stopped updating is refused by the box and by the program", async () => {
    const { w, pool } = await poolWorld(POOL_EPOCH - 5n);
    const draft = poolDraft(pool, POOL_EPOCH + 1n, solText((POOL_HIGH * 105n) / 100n, true));
    const { check, program } = await boxThenProgram(w, w.team, draft);
    expectBoxRefusal(check, "StakePoolNotUpdating");
    expectError(await program(), "StakePoolNotUpdating");
  });

  test("a Meteora pool's locked liquidity: accepted; a target already met; a resized account", async () => {
    const w = await openingWorld();
    const pool = setFixture(w.client, "damm-sol-usdc").address;
    const lock = (account: string, target: bigint) => ({
      ...PRICE_DRAFT,
      kind: "lock" as const,
      account,
      target: `${target}`,
    });
    const accepted = await boxThenProgram(w, w.team, lock(pool, (LOCKED * 102n) / 100n));
    expect(accepted.check.verdict?.ok).toBe(true);
    expectOk(await accepted.program());
    const met = await boxThenProgram(w, w.team, lock(pool, LOCKED));
    expectBoxRefusal(met.check, "TargetAlreadyTouched");
    expectError(await met.program(), "TargetAlreadyTouched");
    const resized = (await generateKeyPairSigner()).address;
    setRawAccount(w.client, resized, fixtureBytes("damm-sol-usdc").slice(0, -1), P.DAMM_V2_PROGRAM_ID);
    const bad = await boxThenProgram(w, w.team, lock(resized, (LOCKED * 102n) / 100n));
    expectBoxRefusal(bad.check, "ReaderBadLayout");
    expectError(await bad.program(), "ReaderBadLayout");
  });

  test("a burn on a mint whose authority is revoked: accepted by the box and by the program", async () => {
    const w = await openingWorld();
    const mint = (await generateKeyPairSigner()).address;
    setRawAccount(w.client, mint, mintBytes({ supply: 1_000_000n, mintAuthority: null }), P.SPL_TOKEN_PROGRAM_ID);
    const burn = await boxThenProgram(w, w.team, { ...PRICE_DRAFT, kind: "burn", account: mint, target: "900,000" });
    expect(burn.check.verdict?.ok).toBe(true);
    expect(burn.check.args?.target).toBe(900_000n);
    expectOk(await burn.program());
  });

  test("a price band too wide, and a target out of reach, are refused by the box and by the program", async () => {
    const w = await openingWorld();
    const far = await boxThenProgram(w, w.team, { ...PRICE_DRAFT, target: usd(BTC_PRICE * 11n) });
    expectBoxRefusal(far.check, "TargetUnreachable");
    expectError(await far.program(), "TargetUnreachable");
    setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { conf: BTC_PRICE / 200n + 1n });
    const wide = await boxThenProgram(w, w.team, PRICE_DRAFT);
    expectBoxRefusal(wide.check, "PriceConfidenceTooWide");
    expectError(await wide.program(), "PriceConfidenceTooWide");
    expect(BTC_CONF).toBeLessThan(BTC_PRICE / 200n);
  });

  test("a feed Pyth no longer fully verifies: the program refuses, and the box names it by the asset", async () => {
    const w = await openingWorld();
    const before = await boxThenProgram(w, w.team, PRICE_DRAFT);
    expect(before.check.verdict?.ok).toBe(true);
    setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { verification: 0 });
    expectError(await before.program(), "PriceNotFullyVerified");
    // The exponent can't be read from an unverified account, so the box stops at the asset with the program's words.
    const id = before.check.args?.id ?? 0n;
    const [world, accounts] = await Promise.all([readWorld(before.rpc), readDraftAccounts(before.rpc, id, null)]);
    const again = await checkBox({
      draft: PRICE_DRAFT,
      world,
      accounts,
      readFailed: false,
      id,
      wallet: w.team.address,
      balance: null,
      siteAllows: true,
    });
    const named = again.issues.find((i) => i.refusal === "PriceNotFullyVerified");
    expect(named?.place).toBe("feed");
    expect(again.issues.some((i) => i.place === "target" && i.level === "wait")).toBe(false);
  });
});
