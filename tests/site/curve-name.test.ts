/**
 * Purpose: how the site names a graduation campaign's curve (the A-11 exception, TP §3.4.10; the ticker's cleaning
 *          is the SDK's, in tests/sdk/token-symbol.test.ts): the reviewed name as written, else "$TICKER (…7Dny)",
 *          else "Token (…7Dny)"; the committed names file naming the devnet demo pool "$BROT"; the reads, on real
 *          mainnet bytes behind a fake RPC (a pool's base mint, then its Metaplex metadata or its Token-2022
 *          extension), kept per page and forgotten on failure; the card title, the preview's account and the search
 *          that finds "$BROT" from "brot". Filter: `bun test tests/ -t "a curve's name"`.
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05
 */
import { describe, expect, test } from "bun:test";
import { getAddressEncoder } from "@solana/kit";

import { SPL_TOKEN_PROGRAM_ID, tokenMetadataAddress, type FetchedAccount, type SolanaRpc } from "@brot/sdk/read";

import { curveName, reviewedCurves } from "../../app/features/campaigns/curve-name";
import { readCurveTokens, type CurveCache } from "../../app/features/campaigns/curve-tokens";
import { cardTitle } from "../../app/features/campaigns/model";
import { questionOf } from "../../app/features/campaigns/sentence";
import { loadNames, parseNames } from "../../app/features/open-campaign/names";
import { accountShown } from "../../app/features/open-campaign/preview-parts";
import { search } from "../../app/features/open-campaign/search";
import { FIXTURES, fixtureBytes } from "../brot/readers";

const DEMO_POOL = "12uLN2texEDbadM4WzJm6Dry8Quc8qFpDQEwhSdi7Dny";
const STAGE0 = FIXTURES["dbc-pool-stage0"].address; // mxGZ…P8S6, base mint 6PW2…BAGS
const STAGE0_MINT = "6PW26Tqsuc6qeNK6Cp7mWj1KuM1X7NUCG97x6MJHBAGS";
const PYUSD = FIXTURES["mint-pyusd"].address;
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const T85 = "85000000000";

const ascii = (text: string) => Uint8Array.from(text, (c) => c.charCodeAt(0));
const key = (address: string) => getAddressEncoder().encode(address as never);
const fresh = (): CurveCache => ({ pending: new Map(), settled: new Map() });
const fixture = (name: string, at = FIXTURES[name].address, data: Uint8Array = fixtureBytes(name)): FetchedAccount => ({
  address: at,
  owner: FIXTURES[name].owner,
  data,
});
/** A fixture with `address` written at `offset` (a pool's base mint at 136, a metadata's mint at 33). */
function rewritten(name: string, offset: number, address: string): Uint8Array {
  const data = fixtureBytes(name);
  data.set(key(address), offset);
  return data;
}

/** An RPC that answers getMultipleAccounts from `accounts`, as a node does, recording each call. */
function fakeRpc(accounts: readonly FetchedAccount[], fail = false) {
  const byAddress = new Map(accounts.map((a) => [a.address, a]));
  const calls: string[][] = [];
  const rpc = {
    getMultipleAccounts: (addresses: string[]) => ({
      send: async () => {
        calls.push([...addresses]);
        if (fail) throw new Error("the RPC is down");
        const value = addresses.map((at) => {
          const a = byAddress.get(at);
          return a ? { owner: a.owner, data: [Buffer.from(a.data).toString("base64"), "base64"] } : null;
        });
        return { context: { slot: 1n }, value };
      },
    }),
  } as unknown as SolanaRpc;
  return { rpc, calls };
}

describe("a curve's name", () => {
  test("the reviewed name as written; else the ticker with the pool's last characters; else Token with them", () => {
    expect(curveName(DEMO_POOL, { reviewed: "$BROT", symbol: ascii("TEST") })).toBe("$BROT");
    expect(curveName(DEMO_POOL, { symbol: ascii("TEST") })).toBe("$TEST (…7Dny)");
    expect(curveName(DEMO_POOL, { symbol: ascii("USDC") })).toBe("Token (…7Dny)");
    expect(curveName(DEMO_POOL)).toBe("Token (…7Dny)");
    const sentence = { kind: "DbcGraduated", direction: "Above", feedIdHex: null, target: T85, priceExponent: 0 };
    expect(questionOf({ ...sentence, metricAccount: DEMO_POOL, accountName: "$BROT" })).toBe(
      "Meteora launch curve $BROT raises its full 85 SOL?",
    );
    expect(questionOf({ ...sentence, metricAccount: DEMO_POOL, accountName: "$TEST (…7Dny)" })).toBe(
      "Meteora launch curve $TEST (…7Dny) raises its full 85 SOL?",
    );
    expect(questionOf({ ...sentence, metricAccount: DEMO_POOL })).toBe(
      "Meteora launch curve Token (…7Dny) raises its full 85 SOL?",
    );
    // A gap stays a gap in the creation box until a pool is in the slot.
    expect(questionOf({ ...sentence, metricAccount: null })).toBe(
      "Meteora launch curve (account) raises its full 85 SOL?",
    );
  });

  test("the committed names file reviews the devnet demo pool as $BROT; a curve name may start with $", () => {
    const reviewed = reviewedCurves(loadNames());
    expect(reviewed.get(DEMO_POOL)).toBe("$BROT");
    expect(parseNames(JSON.stringify([{ address: DEMO_POOL, kind: "curve", name: "$BROT" }]))).toHaveLength(1);
    for (const name of ["$", "$$BROT", "$ BROT", "x".repeat(33)])
      expect(() => parseNames(JSON.stringify([{ address: DEMO_POOL, kind: "curve", name }]))).toThrow();
    expect(() => parseNames(JSON.stringify([{ address: DEMO_POOL, kind: "token", name: "BROT" }]))).toThrow();
  });

  test("the reads: a pool's base mint, then its Metaplex metadata or its own Token-2022 extension", async () => {
    // The captured stage-0 pool, its base mint a classic mint whose metadata says "$WIF".
    const metadata = await tokenMetadataAddress(STAGE0_MINT);
    // A pool on PYUSD, a Token-2022 mint that keeps its symbol in itself, with no metadata account.
    const onPyusd = FIXTURES["dbc-pool-11sol"].address;
    // A pool on USDC: its metadata, the real one, claims a reserved ticker.
    const onUsdc = FIXTURES["dbc-pool-usdc"].address;
    const { rpc, calls } = fakeRpc([
      fixture("dbc-pool-stage0"),
      fixture("mint-wif", STAGE0_MINT),
      fixture("metadata-wif", metadata, rewritten("metadata-wif", 33, STAGE0_MINT)),
      fixture("dbc-pool-11sol", onPyusd, rewritten("dbc-pool-11sol", 136, PYUSD)),
      fixture("mint-pyusd"),
      fixture("dbc-pool-usdc", onUsdc, rewritten("dbc-pool-usdc", 136, USDC)),
      fixture("mint-usdc"),
      fixture("metadata-usdc"),
      { ...fixture("dbc-pool-stage0"), address: DEMO_POOL, owner: SPL_TOKEN_PROGRAM_ID },
    ]);
    const cache = fresh();
    const tokens = await readCurveTokens(rpc, [STAGE0, onPyusd, onUsdc, DEMO_POOL, STAGE0], cache);
    const name = (pool: string) => curveName(pool, { symbol: tokens.get(pool)?.symbol });
    expect(tokens.get(STAGE0)?.mint).toBe(STAGE0_MINT);
    expect([name(STAGE0), name(onPyusd), name(onUsdc), name(DEMO_POOL)]).toEqual([
      "$WIF (…P8S6)",
      "$PYUSD (…h8i5)",
      "Token (…1Sca)",
      "Token (…7Dny)",
    ]);
    expect(tokens.get(DEMO_POOL)).toBeNull(); // a pool the reader refuses has no token
    // Two calls for four pools: the pools, then their mints and metadata accounts; each pool once.
    expect(calls).toHaveLength(2);
    expect(calls[0]).toEqual([STAGE0, onPyusd, onUsdc, DEMO_POOL]);
    // The page keeps what it read: the campaign page after the list asks the RPC nothing.
    const again = await readCurveTokens(fakeRpc([], true).rpc, [STAGE0], cache);
    expect(again.get(STAGE0)?.mint).toBe(STAGE0_MINT);
  });

  test("a read that fails is forgotten, so the next asks again", async () => {
    const cache = fresh();
    await expect(readCurveTokens(fakeRpc([], true).rpc, [STAGE0], cache)).rejects.toThrow("the RPC is down");
    await Bun.sleep(0);
    expect([cache.pending.size, cache.settled.size]).toEqual([0, 0]);
    const { rpc } = fakeRpc([fixture("dbc-pool-stage0")]);
    expect((await readCurveTokens(rpc, [STAGE0], cache)).get(STAGE0)).toEqual({ mint: STAGE0_MINT, symbol: null });
  });

  test("a card's title, the preview's account and the search name a curve the same way", () => {
    const card = {
      kind: "DbcGraduated",
      direction: "Above" as const,
      feedId: "",
      target: 85n * 1_000_000_000n,
      priceExponent: 0,
      metricAccount: DEMO_POOL,
    };
    expect(cardTitle(card)).toBe("Meteora launch curve Token (…7Dny) raises its full 85 SOL?");
    expect(cardTitle(card, "$BROT")).toBe("Meteora launch curve $BROT raises its full 85 SOL?");
    const input = { kind: "DbcGraduated", direction: "Above", feedIdHex: null, target: T85, priceExponent: 0 };
    expect(accountShown("curve", { ...input, metricAccount: DEMO_POOL, accountName: "$BROT" })).toBe("$BROT");
    expect(accountShown("curve", { ...input, metricAccount: DEMO_POOL })).toBe("Token (…7Dny)");
    expect(accountShown("burn", { ...input, metricAccount: DEMO_POOL })).toBe("12uL…7Dny");
    expect(accountShown("curve", { ...input, metricAccount: null })).toBeNull();
    const names = parseNames(JSON.stringify([{ address: DEMO_POOL, kind: "curve", name: "$BROT" }]));
    for (const query of ["brot", "$brot", "BROT 85"])
      expect(search(query, { feeds: [], names }).items[0]).toEqual({
        kind: "curve",
        account: DEMO_POOL,
        name: "$BROT",
        target: undefined,
      });
  });
});
