/**
 * Purpose: the indexer against the program in LiteSVM behind the recording RPC (Sprint 08 DoD, X1.3): whole cycles run
 *          through the SDK's builders (a paid two-sided campaign paid out and closed, a one-sided pot refunded, a
 *          stale-feed void, a NO in review), then ingested at `finalized`. Each campaign that still has an account
 *          matches its row (pools, prize, status, outcome, mode, open entries, last `seq`) and its entries sum to its
 *          pools; the closed one is closed, and each baker's settlement row is what reached the wallet; a rebuild into
 *          a new file equals the live one; a second refresh changes nothing; the points equal what the read API's
 *          leaderboard computes over the same chain. Filter: `bun test tests/indexer`.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSolanaRpc, type Address } from "@solana/kit";
import {
  campaignNow,
  decodeCampaign,
  Outcome,
  pointsTable,
  publicState,
  readChainTime,
  SettleMode,
  Side,
  Status,
  VoidReason,
} from "@brot/sdk/read";

import { createHistory } from "../../services/api/src/history";
import { dump, openStore, type Store } from "../../services/indexer/src/db/store";
import { createIngest, type IngestReport } from "../../services/indexer/src/ingest";
import { rebuild } from "../../services/indexer/src/rebuild";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { setPriceAccount } from "../brot/setup";
import { runCycle, SOL, type Cycle } from "../site/cycle-run";
import { startFakeChain, type FakeChain } from "../site/fake-chain";
import { rawOf } from "../site/support";

const dir = mkdtempSync(join(tmpdir(), "brot-indexer-cycles-"));
let w: OpeningWorld;
let chain: FakeChain;
let store: Store;
let ingest: ReturnType<typeof createIngest>;
let first: IngestReport;
const cycles = {} as Record<"paid" | "oneSided" | "voided" | "review", Cycle>;

/** A later cycle opens a paid campaign after the clock moved: both price accounts are written fresh again. */
function freshPrices() {
  const publishTime = w.client.svm.getClock().unixTimestamp - 5n;
  setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime });
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime });
}

/** The row of the latest opening at `at`. */
const rowOf = (at: Address) =>
  store.db.query("SELECT * FROM campaigns WHERE address = ? ORDER BY opening DESC LIMIT 1").get(at) as Record<
    string,
    string | number | null
  >;

beforeAll(async () => {
  w = await openingWorld();
  chain = startFakeChain(w);
  const two = { how: "no", chain } as const;
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
  store = openStore(join(dir, "live.sqlite"));
  ingest = createIngest(createSolanaRpc(chain.url), store);
  first = await ingest.refresh();
}, 180_000);

afterAll(() => {
  chain.close();
  store.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("the indexer over whole cycles", () => {
  test("one refresh reads the whole history: nothing skipped, no gap, the points computed", () => {
    expect(first.listed).toBeGreaterThan(20);
    expect(first).toMatchObject({ waiting: false, skipped: 0, gaps: [], pointsError: null });
    expect(first.processed).toBe(
      first.listed - (store.db.query("SELECT count(*) AS n FROM signatures WHERE failed = 1").get() as { n: number }).n,
    );
  });

  test("each campaign that still has an account matches its row, and its entries sum to its pools (X1.3)", () => {
    for (const name of ["oneSided", "voided", "review"] as const) {
      const at = cycles[name].campaign;
      const c = decodeCampaign(rawOf(w, at));
      const row = rowOf(at);
      expect({ name, ...row }).toMatchObject({
        name,
        id: c.id.toString(),
        creator: c.creator,
        pool_yes: c.poolYes.toString(),
        pool_no: c.poolNo.toString(),
        prize_lamports: c.prizeLamports.toString(),
        status: Status[c.status],
        outcome: Outcome[c.outcome],
        void_reason: VoidReason[c.voidReason],
        settle_mode: c.settleMode === SettleMode.Unset ? null : SettleMode[c.settleMode],
        entries_open: c.entriesOpen,
        review_ends_at: Number(c.reviewEndsAt),
        last_seq: Number(c.eventSeq) - 1,
        closed: 0,
      });
      const sums = store.db
        .query("SELECT side, amount FROM entries WHERE campaign = ? AND opening = ?")
        .all(at, row.opening) as { side: string; amount: string }[];
      const sum = (side: string) => sums.filter((e) => e.side === side).reduce((t, e) => t + BigInt(e.amount), 0n);
      expect([sum("Yes"), sum("No")]).toEqual([c.poolYes, c.poolNo]);
    }
    expect(rowOf(cycles.oneSided.campaign)).toMatchObject({ status: "Settling", settle_mode: "OneSided" });
    expect(rowOf(cycles.voided.campaign)).toMatchObject({ outcome: "Void", void_reason: "StaleFeed" });
    expect(rowOf(cycles.review.campaign)).toMatchObject({ status: "InReview", outcome: "No", settle_mode: null });
  });

  test("the closed campaign is closed and settled; each baker's settlement is what reached the wallet", () => {
    const paid = cycles.paid;
    expect(w.client.svm.getAccount(paid.campaign).exists).toBe(false);
    expect(rowOf(paid.campaign)).toMatchObject({ closed: 1, status: "Settled", settle_mode: "Split", entries_open: 0 });
    const settled = store.db
      .query("SELECT recipient, paid FROM settlements WHERE campaign = ? AND role = 'baker'")
      .all(paid.campaign) as { recipient: string; paid: string }[];
    expect(settled.length).toBe(2);
    for (const s of settled) expect(BigInt(s.paid)).toBe(paid.delta(s.recipient) - paid.deposit(s.recipient));
    const winner = settled.find((s) => s.recipient === paid.bakers[1].address)!;
    expect(BigInt(winner.paid)).toBeGreaterThan(SOL);
  });

  test("the vaults: what came in went out by an event, or is still in the vault beside its rent (X1.3, I1)", async () => {
    const amounts = (at: Address, sql: string, field: string) =>
      (store.db.query(sql).all(at) as { data?: string; paid?: string }[])
        .map((r) => BigInt(r.paid ?? (JSON.parse(r.data!) as Record<string, string>)[field]))
        .reduce((t, n) => t + n, 0n);
    for (const cycle of Object.values(cycles)) {
      const at = cycle.campaign;
      const row = rowOf(at);
      const came = ["pool_yes", "pool_no", "prize_lamports", "opening_fee_lamports"].reduce(
        (t, k) => t + BigInt(row[k] as string),
        0n,
      );
      const went =
        amounts(at, "SELECT paid FROM settlements WHERE campaign = ?", "") +
        amounts(at, "SELECT data FROM events WHERE campaign = ? AND name = 'FeeCollected'", "amount");
      const swept = amounts(
        at,
        "SELECT data FROM events WHERE campaign = ? AND name = 'CampaignClosed'",
        "surplusSwept",
      );
      const vault = w.client.svm.getAccount(await P.vaultPda(at));
      if (row.closed === 1) {
        expect(vault.exists).toBe(false);
        expect(went + swept).toBe(came);
      } else {
        const rent = w.client.svm.minimumBalanceForRentExemption(0n);
        expect(BigInt(vault.exists ? vault.lamports : 0n) - rent).toBe(came - went);
      }
    }
  });

  test("a rebuild into a new file equals the live one; a second refresh changes nothing", async () => {
    const rpc = createSolanaRpc(chain.url);
    const rebuilt = await rebuild(rpc, join(dir, "rebuilt.sqlite"));
    expect(rebuilt.complete).toBe(true);
    expect(dump(rebuilt.store)).toEqual(dump(store));
    rebuilt.store.close();
    await expect(rebuild(rpc, join(dir, "live.sqlite"))).rejects.toThrow("new file");
    const before = dump(store);
    expect(await ingest.refresh()).toMatchObject({ listed: 0, processed: 0, gaps: [] });
    expect(dump(store)).toEqual(before);
  });

  test("the points equal the read API's leaderboard over the same chain", async () => {
    const rpc = createSolanaRpc(chain.url);
    const history = createHistory(rpc, { perRefresh: 1_000 });
    await history.refresh();
    const time = await readChainTime(rpc);
    const now = new Map(
      Object.values(cycles)
        .filter((c) => w.client.svm.getAccount(c.campaign).exists)
        .map((c) => {
          const campaign = decodeCampaign(rawOf(w, c.campaign));
          return [c.campaign as string, campaignNow(campaign, publicState(campaign, time))] as const;
        }),
    );
    const expected = pointsTable(history.events(), now).map(({ wallet, points, entered, decided }) => ({
      wallet,
      points,
      entered,
      decided,
    }));
    const got = store.db
      .query("SELECT wallet, points, entered, decided FROM points ORDER BY points DESC, wallet")
      .all();
    expect(got).toEqual(expected);
    expect(expected.find((r) => r.wallet === cycles.paid.bakers[1].address)?.points).toBe(1);
  });
});
