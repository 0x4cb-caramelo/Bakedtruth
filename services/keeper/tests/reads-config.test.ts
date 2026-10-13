/**
 * Purpose: the batched reads and the settings (Sprint 06 DoD: batched reads; the settlement switch; the credentials).
 *          `fetchMany` reads 100 accounts per `getMultipleAccounts` and each address once; the pre-filter simulates
 *          every campaign past its deadline and, before it, only one whose outcome the SDK's mirror says is knowable
 *          (or cannot read); `KEEPER_SETTLE` is off unless it says "on" and any other word is refused; the fee and
 *          batch settings are bounded; the RPC URLs come from their credential files when `*_FILE` is set, and an
 *          error never echoes a value. Fake RPCs and an injected file reader; no cluster.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: batched reads; per-unit identities, the code half)
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAddressDecoder } from "@solana/kit";
import { PYTH_RECEIVER_ID, ReaderKind, type ChainTime, type SolanaRpc } from "@brot/sdk/read";

import { fetchMany } from "../src/chain";
import { loadConfig } from "../src/config";
import { loadOpsConfig } from "../src/config-ops";
import { worthSimulating } from "../src/prefilter";
import { campaignWith, KEY } from "./kit/accounts";

describe("fetchMany", () => {
  test("100 accounts per call, each address once, a missing one answered null", async () => {
    const sizes: number[] = [];
    const rpc = {
      getMultipleAccounts: (list: string[]) => ({
        send: async () => (
          sizes.push(list.length),
          {
            value: list.map((at) => (at === KEY(5) ? null : { owner: KEY(9), lamports: 7n, data: ["AQ==", "base64"] })),
          }
        ),
      }),
    } as unknown as SolanaRpc;
    // Any 32 bytes are an address: 250 distinct ones, after 250 that repeat the 31 of KEY.
    const distinct = Array.from({ length: 250 }, (_, i) => getAddressDecoder().decode(new Uint8Array(32).fill(i + 1)));
    const addresses = [...Array.from({ length: 250 }, (_, i) => KEY(i % 31)), ...distinct];
    const { accounts, calls } = await fetchMany(rpc, addresses);
    expect(calls).toBe(3); // 31 + 250 distinct addresses
    expect(sizes).toEqual([100, 100, 81]);
    expect(accounts.get(KEY(5))).toBeNull();
    expect(accounts.get(KEY(6))).toMatchObject({ owner: KEY(9), lamports: 7n, data: new Uint8Array([1]) });
  });
});

describe("worthSimulating (the pre-filter)", () => {
  const CHAIN: ChainTime = { slot: 1_000n, epoch: 5n, unixTimestamp: 1_800_000_000n };
  const fixture = new Uint8Array(
    readFileSync(join(import.meta.dir, "../../../tests/fixtures/pyth-btc-usd-devnet.bin")),
  );
  const btc = (price: bigint) => {
    const data = fixture.slice();
    const view = new DataView(data.buffer);
    view.setBigInt64(73, price, true);
    view.setBigUint64(81, 0n, true); // no confidence band
    view.setBigInt64(93, CHAIN.unixTimestamp - 5n, true);
    view.setBigUint64(125, CHAIN.slot, true);
    return { address: KEY(2), owner: PYTH_RECEIVER_ID, data };
  };
  const price = campaignWith({
    kind: ReaderKind.PriceTouch,
    feedId: fixture.slice(41, 73), // the feed id of the captured BTC/USD update
    priceExponent: -8,
    maxAge: 120,
    target: 100n,
    deadlineAt: CHAIN.unixTimestamp + 3_600n,
  });

  test("before the deadline: simulated only when the outcome is knowable or the mirror cannot read the account", () => {
    expect(worthSimulating(price, btc(99n), CHAIN)).toEqual({ simulate: false, why: "not knowable yet" });
    expect(worthSimulating(price, btc(100n), CHAIN).simulate).toBe(true);
    expect(worthSimulating(price, null, CHAIN).simulate).toBe(true);
    const stranger = { ...btc(99n), owner: KEY(9) };
    expect(worthSimulating(price, stranger, CHAIN)).toMatchObject({ simulate: true });
  });

  test("past the deadline every campaign is simulated; an epoch kind waits for its measured epoch", () => {
    const due = { ...price, deadlineAt: CHAIN.unixTimestamp };
    expect(worthSimulating(due, btc(1n), CHAIN)).toEqual({ simulate: true, why: "past the deadline" });
    const epochKind = campaignWith({ kind: ReaderKind.StakeAtLeast, epoch: 6n, deadlineAt: CHAIN.unixTimestamp + 9n });
    const vote = { address: KEY(3), owner: KEY(9), data: new Uint8Array() };
    expect(worthSimulating(epochKind, vote, CHAIN).simulate).toBe(false);
    expect(worthSimulating({ ...epochKind, epoch: 5n }, vote, CHAIN).simulate).toBe(true);
  });
});

describe("settings", () => {
  test("KEEPER_SETTLE is off by default and off for 'off'; 'on' turns it on; anything else is refused", () => {
    expect(loadOpsConfig({}).settle).toBe(false);
    expect(loadOpsConfig({ KEEPER_SETTLE: "off" }).settle).toBe(false);
    expect(loadOpsConfig({ KEEPER_SETTLE: "on" }).settle).toBe(true);
    for (const word of ["1", "true", "ON", "yes"]) {
      expect(() => loadOpsConfig({ KEEPER_SETTLE: word })).toThrow("KEEPER_SETTLE must be on or off");
    }
  });

  test("the fee floor never above its ceiling; at most 12 instructions a batch; numbers only", () => {
    const ops = loadOpsConfig({});
    expect({ fees: ops.fees, batchMax: ops.batchMax }).toEqual({
      fees: { floor: 0n, ceiling: 1_000_000n, maxLamports: 1_000_000n },
      batchMax: 10,
    });
    expect(() => loadOpsConfig({ KEEPER_PRIORITY_FEE_FLOOR: "5", KEEPER_PRIORITY_FEE_CEILING: "4" })).toThrow("FLOOR");
    expect(() => loadOpsConfig({ KEEPER_SETTLE_BATCH: "13" })).toThrow("at most 12");
    expect(() => loadOpsConfig({ KEEPER_EXPOSURE_ALERT_LAMPORTS: "1e9" })).toThrow("KEEPER_EXPOSURE_ALERT_LAMPORTS");
  });

  test("the RPC URLs are read from their credential files when *_FILE is set; the error never echoes a value", () => {
    const files: Record<string, string> = {
      "/run/credentials/brot-keeper.service/keeper-rpc-url": "https://rpc.example.test/?api-key=from-file\n",
      "/run/credentials/brot-keeper.service/keeper-rpc-url-b": "not a url but secret",
    };
    const read = (path: string) => files[path] ?? "";
    const env = {
      KEEPER_RPC_URL: "https://ignored.example.test/",
      KEEPER_RPC_URL_FILE: "/run/credentials/brot-keeper.service/keeper-rpc-url",
      KEEPER_KEYPAIR: "/run/credentials/brot-keeper.service/keeper-keypair",
    };
    expect(loadConfig(env, read).rpcUrl).toBe("https://rpc.example.test/?api-key=from-file");
    const bad = { ...env, KEEPER_RPC_URL_B_FILE: "/run/credentials/brot-keeper.service/keeper-rpc-url-b" };
    expect(() => loadConfig(bad, read)).toThrow("KEEPER_RPC_URL_B is not a URL");
    try {
      loadConfig(bad, read);
    } catch (error) {
      expect((error as Error).message).not.toContain("secret");
    }
    expect(() => loadConfig({ KEEPER_RPC_URL_FILE: "/missing", KEEPER_KEYPAIR: "/k" }, read)).toThrow(
      "KEEPER_RPC_URL is not set",
    );
  });
});
