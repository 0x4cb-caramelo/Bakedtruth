/**
 * Purpose: the whole cycles the indexer's LiteSVM tests share (Sprint 08): a paid two-sided campaign paid out and
 *          closed, a one-sided pot refunded, a stale-feed void and a NO in review, run through the SDK's builders
 *          behind the recording RPC, then ingested at `finalized` into a new file. Each test file builds its own, so
 *          no file depends on another's order; `close` stops the chain and removes the file.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points), slice 2 (moved out of cycles.test.ts)
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSolanaRpc } from "@solana/kit";
import { Side } from "@brot/sdk/read";

import { openStore, type Store } from "../../services/indexer/src/db/store";
import { createIngest, type IngestReport } from "../../services/indexer/src/ingest";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { setPriceAccount } from "../brot/setup";
import { runCycle, SOL, type Cycle } from "../site/cycle-run";
import { startFakeChain, type FakeChain } from "../site/fake-chain";

export type CycleName = "paid" | "oneSided" | "voided" | "review";

export type CyclesWorld = {
  w: OpeningWorld;
  chain: FakeChain;
  store: Store;
  ingest: ReturnType<typeof createIngest>;
  /** The first refresh, which reads the whole history. */
  first: IngestReport;
  cycles: Record<CycleName, Cycle>;
  dir: string;
  close: () => void;
};

export async function indexedCycles(): Promise<CyclesWorld> {
  const dir = mkdtempSync(join(tmpdir(), "brot-indexer-cycles-"));
  const w = await openingWorld();
  const chain = startFakeChain(w);
  // A later cycle opens a paid campaign after the clock moved: both price accounts are written fresh again.
  const freshPrices = () => {
    const publishTime = w.client.svm.getClock().unixTimestamp - 5n;
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime });
    setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime });
  };
  const two = { how: "no", chain } as const;
  const cycles = {} as Record<CycleName, Cycle>;
  cycles.paid = await runCycle(
    w,
    (b) => [
      { who: b[0], side: Side.Yes, amount: SOL },
      { who: b[1], side: Side.No, amount: SOL },
    ],
    { ...two, stopAt: "closed" },
  );
  freshPrices();
  cycles.oneSided = await runCycle(w, (b) => [{ who: b[0], side: Side.No, amount: SOL }], {
    ...two,
    stopAt: "settling",
  });
  freshPrices();
  cycles.voided = await runCycle(
    w,
    (b) => [
      { who: b[0], side: Side.Yes, amount: SOL },
      { who: b[1], side: Side.No, amount: SOL / 2n },
    ],
    { how: "stale", chain, stopAt: "settling" },
  );
  freshPrices();
  cycles.review = await runCycle(
    w,
    (b) => [
      { who: b[0], side: Side.Yes, amount: SOL / 4n },
      { who: b[1], side: Side.No, amount: SOL },
      { who: b[2], side: Side.No, amount: SOL / 10n },
    ],
    { ...two, stopAt: "review" },
  );
  const store = openStore(join(dir, "live.sqlite"));
  const ingest = createIngest(createSolanaRpc(chain.url), store);
  const first = await ingest.refresh();
  const close = () => {
    chain.close();
    store.close();
    rmSync(dir, { recursive: true, force: true });
  };
  return { w, chain, store, ingest, first, cycles, dir, close };
}
