/**
 * Purpose: the retry guard's second witness (T17, A-9 [INF]; recent.ts), for a browser that lost its record: against
 *          the program in LiteSVM behind a local RPC, the wallet's opening of the last half hour is found on-chain and
 *          older ones are not, and a busy wallet's newest opening is found though it made more transactions than the
 *          look-up reads; with fake RPCs, the look-up fails closed (no answer, more transactions than it reads, or one
 *          that does not read back) and says "none" only when the chain says so.
 *          Filter: `bun test tests/ -t "a lost record is looked up on-chain"`.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";
import { PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

import { bytesToHex, ReaderKind, type SolanaRpc } from "@brot/sdk/read";
import type { OpeningChoice } from "@brot/sdk/tx";

import { idFor } from "../../app/features/open-campaign/retry-guard";
import { recentOpening } from "../../app/features/open-campaign/recent";
import { handToWallet, prepareOpening } from "../../app/features/open-campaign/submit";
import { BTC_PRICE, newId } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { now } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { memoryStore, napThen, testWallet } from "./support";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

async function setup() {
  const w = await openingWorld();
  chain = startFakeChain(w);
  const rpc = createSolanaRpc(chain.url);
  const choice: OpeningChoice = {
    kind: ReaderKind.PriceTouch,
    feedId: bytesToHex(P.BTC_USD_FEED_ID),
    target: (BTC_PRICE * 11n) / 10n,
    deadlineAt: now(w.client) + 7n * P.DAY,
    openingUsd: 500n,
  };
  return { w, rpc, choice, store: memoryStore(), creator: w.creator.address as string };
}

describe("a lost record is looked up on-chain", () => {
  test("with the record gone, the wallet's opening of the last half hour is found on-chain", async () => {
    const { w, rpc, choice, store, creator } = await setup();
    expect(await recentOpening(rpc, creator, now(w.client))).toEqual({ status: "none" });
    const record = idFor(store, creator, newId);
    const prepared = ready(await prepareOpening({ rpc, creator, choice, id: BigInt(record.id) }));
    await handToWallet({
      rpc,
      ready: prepared,
      record,
      send: testWallet(w.creator, chain!.url),
      store,
      watch: { sleep: napThen(() => {}) },
    });
    store.map.clear();
    const found = await recentOpening(rpc, creator, now(w.client));
    expect(found.status === "found" ? found.opening.id : null).toBe(BigInt(record.id));
    expect(await recentOpening(rpc, creator, now(w.client) + 31n * 60n)).toEqual({ status: "none" });
  });

  test("a busy wallet: past what the look-up reads, its newest opening is still found first", async () => {
    const { w, rpc, choice, store, creator } = await setup();
    const send = testWallet(w.creator, chain!.url);
    // 25 landed transfers in the half hour: more than the 20 transactions the look-up reads.
    const { value } = await rpc.getLatestBlockhash().send();
    const from = new PublicKey(creator);
    for (let i = 0; i < 25; i++) {
      const transfer = SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: new PublicKey(w.team.address),
        lamports: 1_000 + i,
      });
      const message = new TransactionMessage({
        payerKey: from,
        recentBlockhash: value.blockhash,
        instructions: [transfer],
      });
      await send(new VersionedTransaction(message.compileToV0Message()));
    }
    expect(await recentOpening(rpc, creator, now(w.client))).toEqual({ status: "unknown" });
    const record = idFor(store, creator, newId);
    const prepared = ready(await prepareOpening({ rpc, creator, choice, id: BigInt(record.id) }));
    await handToWallet({ rpc, ready: prepared, record, send, store, watch: { sleep: napThen(() => {}) } });
    store.map.clear();
    const found = await recentOpening(rpc, creator, now(w.client));
    expect(found.status === "found" ? found.opening.id : null).toBe(BigInt(record.id));
  });

  test("the on-chain look-up fails closed: no answer, too many transactions or one that won't read back", async () => {
    const wallet = "11111111111111111111111111111111";
    const page = (n: number, err: unknown = null) =>
      Array.from({ length: n }, (_, i) => ({ signature: `${i}`.padStart(88, "1"), err, blockTime: 1_000 }));
    const fake = (pages: () => unknown[]) =>
      ({
        getSignaturesForAddress: () => ({ send: async () => pages() }),
        getTransaction: () => ({ send: async () => null }),
      }) as unknown as SolanaRpc;
    const answers = await Promise.all(
      [
        fake(() => {
          throw new Error("429");
        }),
        fake(() => page(25)), // a full page every time: more than four pages in the half hour
        fake(() => page(3)), // three transactions that do not read back
        fake(() => page(3, { failed: 1 })), // only failed transactions: nothing to read, none by the chain's word
      ].map((rpc) => recentOpening(rpc, wallet, 1_000n)),
    );
    expect(answers.map((a) => a.status)).toEqual(["unknown", "unknown", "unknown", "none"]);
  });
});
