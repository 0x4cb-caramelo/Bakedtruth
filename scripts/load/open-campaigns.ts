/**
 * Purpose: one keeper cycle over many open campaigns (Sprint 06 DoD, the load run, X1.8), measured in-process: N open
 *          BTC/USD campaigns are written into a LiteSVM world with the program's binary, `--due` of them already past
 *          their deadline; the keeper's own cycle runs once against the in-process RPC of its tests, and the script
 *          prints how long the cycle took, what it simulated and sent, and every RPC call it made, by method.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the keeper's batched reads; a step towards Sprint 06's load run)
 *
 * What this measures and what it does not: the keeper's work and its RPC calls, not the network. A real RPC adds its
 * latency to each call (the call counts printed are what it would see) and confirms each send in seconds, where
 * LiteSVM confirms at once. The DoD's run on Surfpool, with 1,000 campaigns and a 60 s bound, is still to do.
 *
 *   bun scripts/load/open-campaigns.ts [--campaigns 1000] [--due 0]     # needs target/deploy/brot_markets.so
 */
import { generateKeyPairSigner, lamports } from "@solana/kit";

import { injectCampaign } from "../../tests/brot/campaigns";
import { BTC_PRICE, DEFAULT_PARAMS, initConfig } from "../../tests/brot/flows";
import * as P from "../../tests/brot/program";
import { createWorld, START_TIME } from "../../tests/brot/setup";
import { Backoff, DailyClock } from "../../services/keeper/src/backoff";
import { runCycle } from "../../services/keeper/src/cycle";
import { chainRpc } from "../../services/keeper/tests/kit/litesvm-rpc";

const arg = (name: string, fallback: number) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 ? Number(process.argv[at + 1]) : fallback;
};
const COUNT = arg("campaigns", 1_000);
const DUE = Math.min(arg("due", 0), COUNT);

const w = await createWorld();
await initConfig(w, { ...DEFAULT_PARAMS, max_open_campaigns: 10_000 });
const keeper = await generateKeyPairSigner();
w.client.svm.airdrop(keeper.address, lamports(100n * P.SOL));
const creator = (await generateKeyPairSigner()).address;
for (let i = 0; i < COUNT; i++) {
  const due = i < DUE;
  await injectCampaign(w.client, {
    id: 50_000n + BigInt(i),
    kind: P.ReaderKind.PriceTouch,
    metric: P.BTC_USD_ACCOUNT,
    feedId: P.BTC_USD_FEED_ID,
    priceExponent: -8,
    maxAge: 120,
    target: BTC_PRICE * 2n, // far: the sponsored account shows nothing to resolve before the deadline
    creator,
    opensAt: START_TIME - P.DAY,
    entriesCloseAt: due ? START_TIME - 2n * P.HOUR : START_TIME + P.DAY,
    deadlineAt: due ? START_TIME - P.HOUR : START_TIME + 2n * P.DAY,
    extra: { event_seq: 1n },
  });
}

const chain = chainRpc(w);
const report = await runCycle(
  {
    landing: {
      rpc: chain.rpc,
      payer: keeper,
      fees: { floor: 0n, ceiling: 1_000_000n, maxLamports: 1_000_000n },
      batchMax: 10,
      timing: { rebroadcastMs: 0, maxWaitMs: 5_000 },
    },
    settle: { enabled: false, backoff: new Backoff(), claims: new DailyClock(), sweepMinLamports: 0n },
    watch: null,
    pyth: null,
  },
  false,
);
const calls = chain.calls.reduce<Record<string, number>>((m, c) => ((m[c] = (m[c] ?? 0) + 1), m), {});
console.log(
  JSON.stringify(
    {
      campaigns: COUNT,
      pastDeadline: DUE,
      cycleMs: report.durationMs,
      skipped: report.skipped,
      counts: report.counts,
      readBatches: report.readBatches,
      rpcCalls: chain.calls.length,
      byMethod: calls,
    },
    null,
    2,
  ),
);
