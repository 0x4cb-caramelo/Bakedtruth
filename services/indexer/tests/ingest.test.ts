/**
 * Purpose: the ingest against a scripted RPC (Sprint 08), no cluster: pages shorter than asked, chain order and the
 *          checkpoint, a node that ignores `until`, each transaction read once, a second refresh that changes nothing;
 *          a transaction that does not read back holds the later ones until it does; one that never does is skipped
 *          and, through its campaign's gap, read once more per refresh until it reads; a transaction the program's
 *          listing left out is found through the campaign's own listing; a failed one is kept and never read; a
 *          closed campaign's address opened again is a second opening. Filter: `bun test services/indexer`.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";

import { dump, openStore } from "../src/db/store";
import { createIngest } from "../src/ingest";
import { ADDR, closed, entry, noLive, opened, scripted, SIG, SOL, txOf, type Script } from "./fake-chain";

const C = ADDR(2);
const [A, B] = [ADDR(4), ADDR(5)];
/** An opening, a YES of 1 SOL by A and a NO of 2 SOL by B: three transactions, oldest first. */
const three = () => [
  txOf("a", 10, [opened(C)]),
  txOf("b", 11, [entry(C, 1n, A, 0, SOL, [SOL, 0n])]),
  txOf("c", 12, [entry(C, 2n, B, 1, 2n * SOL, [SOL, 2n * SOL])]),
];

function setup(script: Script, maxTries = 5) {
  const { rpc, reads } = scripted(script);
  const store = openStore(":memory:");
  const ingest = createIngest(rpc, store, { maxTries, readLive: noLive, pageSize: 1_000 });
  const row = () => store.db.query("SELECT * FROM campaigns WHERE address = ?").get(C) as Record<string, unknown>;
  const names = () => reads.map((sig) => "abcdefgh".split("").find((n) => SIG(n) === sig));
  return { store, ingest, row, names };
}

describe("the ingest", () => {
  test("pages, chain order and the checkpoint; a node that ignores until; each transaction read once", async () => {
    const script: Script = { txs: three(), pageCap: 2 };
    const { store, ingest, row, names } = setup(script);
    const first = await ingest.refresh();
    expect([first.listed, first.processed, first.waiting, first.gaps]).toEqual([3, 3, false, []]);
    expect(names()).toEqual(["a", "b", "c"]);
    expect(store.db.query("SELECT ord FROM signatures ORDER BY slot").all()).toEqual([
      { ord: 1 },
      { ord: 2 },
      { ord: 3 },
    ]);
    expect(dump(store).checkpoints).toEqual([{ source: "program", last_signature: SIG("c"), last_slot: 12 }]);
    expect(row()).toMatchObject({ pool_yes: String(SOL), pool_no: String(2n * SOL), entries_open: 2, last_seq: 2 });
    script.txs.push(txOf("d", 13, [{ ...entry(C, 3n, A, 0, SOL, [2n * SOL, 2n * SOL]) }]));
    script.ignoreUntil = true;
    const second = await ingest.refresh();
    expect([second.listed, second.processed]).toEqual([1, 1]);
    expect(names()).toEqual(["a", "b", "c", "d"]);
    expect(row()).toMatchObject({ pool_yes: String(2n * SOL), entries_open: 3, last_seq: 3 });
    const before = dump(store);
    expect(await ingest.refresh()).toMatchObject({ listed: 0, processed: 0 });
    expect(dump(store)).toEqual(before);
  });

  test("a transaction that does not read back holds the later ones until it does", async () => {
    const { store, ingest, row, names } = setup({ txs: three(), unreadable: new Map([[SIG("b"), 2]]) });
    expect(await ingest.refresh()).toMatchObject({ processed: 1, waiting: true });
    expect(await ingest.refresh()).toMatchObject({ processed: 0, waiting: true });
    expect(await ingest.refresh()).toMatchObject({ processed: 2, waiting: false, gaps: [] });
    // Four reads go out at once, so "c" is read again each time "b" holds it back.
    expect(names()).toEqual(["a", "b", "c", "b", "c", "b", "c"]);
    expect(row()).toMatchObject({ pool_no: String(2n * SOL), last_seq: 2 });
    expect(store.db.query("SELECT state, tries FROM signatures WHERE signature = ?").get(SIG("b"))).toEqual({
      state: "done",
      tries: 2,
    });
  });

  test("one that never reads back is skipped, and read once more each refresh through its campaign's gap", async () => {
    const unreadable = new Map([[SIG("b"), Infinity]]);
    const { store, ingest, row } = setup({ txs: three(), unreadable }, 2);
    expect(await ingest.refresh()).toMatchObject({ processed: 1, waiting: true });
    // Out of tries: skipped, "c" lands, the gap at seq 1 refetches the campaign, and "b" fails once more, unwaited.
    expect(await ingest.refresh()).toMatchObject({ processed: 1, waiting: false, skipped: 2, gaps: [C] });
    expect(row()).toMatchObject({ pool_no: String(2n * SOL), entries_open: 1, last_seq: 2 });
    unreadable.set(SIG("b"), 0);
    expect(await ingest.refresh()).toMatchObject({ listed: 0, processed: 1, gaps: [] });
    expect(row()).toMatchObject({ pool_yes: String(SOL), pool_no: String(2n * SOL), entries_open: 2 });
    expect(store.db.query("SELECT count(*) AS n FROM entries").get()).toEqual({ n: 2 });
  });

  test("a transaction the program's listing left out is found through the campaign's own", async () => {
    const { store, ingest, row } = setup({ txs: three(), hidden: new Set([SIG("b")]) });
    expect(await ingest.refresh()).toMatchObject({ listed: 2, processed: 3, gaps: [] });
    expect(row()).toMatchObject({ pool_yes: String(SOL), pool_no: String(2n * SOL), entries_open: 2, last_seq: 2 });
    // It sorts by its slot, ahead of "c", though it was kept last.
    const order = store.db.query("SELECT signature FROM events ORDER BY slot, ord").all() as { signature: string }[];
    expect(order.map((r) => r.signature)).toEqual([SIG("a"), SIG("b"), SIG("c")]);
  });

  test("a failed transaction is kept as done and never read; a reopened address is a second opening", async () => {
    const txs = [
      ...three(),
      txOf("e", 13, [entry(C, 3n, A, 0, SOL, [2n * SOL, 2n * SOL])], true),
      txOf("f", 14, [closed(C, 3n)]),
      txOf("g", 15, [opened(C)]),
    ];
    const { store, ingest, names } = setup({ txs });
    expect(await ingest.refresh()).toMatchObject({ listed: 6, processed: 5, gaps: [] });
    expect(names()).not.toContain("e");
    expect(store.db.query("SELECT failed, state FROM signatures WHERE signature = ?").get(SIG("e"))).toEqual({
      failed: 1,
      state: "done",
    });
    const rows = store.db.query("SELECT opening, closed, pool_no, last_seq FROM campaigns ORDER BY opening").all();
    expect(rows).toEqual([
      { opening: 1, closed: 1, pool_no: String(2n * SOL), last_seq: 3 },
      { opening: 2, closed: 0, pool_no: "0", last_seq: 0 },
    ]);
    expect(store.db.query("SELECT DISTINCT opening FROM entries").all()).toEqual([{ opening: 1 }]);
  });
});
