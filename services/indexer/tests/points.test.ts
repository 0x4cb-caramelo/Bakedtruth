/**
 * Purpose: the indexer's points against the SDK's rule (Q7 narrowed by the founder's answer 3a; Sprint 08 DoD
 *          "Points"), through the real ingest and decoder with no cluster: the stored table equals `pointsTable` over
 *          the same events and live word, and each 3a case holds in it: one point per campaign on the side that won,
 *          whatever the amount; none for a wallet on both sides; none for the creator's own wallet on a burn campaign
 *          (it scores on a price one); none for a join tallied as late, which is not even an entry; none in a pot
 *          refunded as one-sided; none while a result is in review, until the live account says it is final.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";
import {
  decodeTransactionEvents,
  Outcome,
  pointsTable,
  ReaderKind,
  type CampaignNow,
  type RpcTransaction,
} from "@brot/sdk/read";

import { openStore } from "../src/db/store";
import { createIngest } from "../src/ingest";
import type { Live } from "../src/live";
import { CREATOR, entry, finalized, lateTallied, noLive, opened, resolved, scripted, SOL, txOf } from "./fake-chain";

const AT = (c: string) => `${"1".repeat(31)}${c}`;
const [P, Q, R, S, U] = ["P", "Q", "R", "S", "U"].map(AT);
const [A, B, C, D, E, F, G, H] = ["A", "B", "C", "D", "E", "F", "G", "H"].map(AT);
const [YES, NO] = [0, 1] as const;
const SPLIT = 1;
const ONE_SIDED = 2;

/** Five campaigns, each a few transactions; a transaction's name's first letter is its signature. */
const TXS: RpcTransaction[] = [
  // P, a price campaign: A right, B wrong, C on both sides, the creator right (a price: it scores).
  txOf("a", 10, [opened(P)]),
  txOf("b", 11, [entry(P, 1n, A, YES, SOL, [SOL, 0n]), entry(P, 2n, B, NO, 2n * SOL, [SOL, 2n * SOL])]),
  txOf("c", 12, [entry(P, 3n, C, YES, SOL, [2n * SOL, 2n * SOL]), entry(P, 4n, C, NO, SOL, [2n * SOL, 3n * SOL])]),
  txOf("d", 13, [entry(P, 5n, CREATOR, YES, SOL, [3n * SOL, 3n * SOL]), resolved(P, 6n, Outcome.Yes)]),
  txOf("e", 14, [finalized(P, 7n, SPLIT)]),
  // Q, a burn campaign: the creator on the right side scores nothing (it can control the result); E does.
  txOf("f", 20, [opened(Q, { kind: ReaderKind.SupplyAtMost }), entry(Q, 1n, CREATOR, YES, SOL, [SOL, 0n])]),
  txOf("g", 21, [entry(Q, 2n, D, NO, SOL, [SOL, SOL]), entry(Q, 3n, E, YES, 5n * SOL, [6n * SOL, SOL])]),
  txOf("h", 22, [resolved(Q, 4n, Outcome.Yes, ReaderKind.SupplyAtMost), finalized(Q, 5n, SPLIT)]),
  // R: F's join is tallied as late after the YES: it comes back whole and never scores; A scores again.
  txOf("i", 30, [opened(R), entry(R, 1n, A, YES, SOL, [SOL, 0n]), entry(R, 2n, F, YES, SOL, [2n * SOL, 0n])]),
  txOf("j", 31, [entry(R, 3n, B, NO, SOL, [2n * SOL, SOL]), resolved(R, 4n, Outcome.Yes)]),
  txOf("k", 32, [lateTallied(R, 5n, F, SOL, 0n), finalized(R, 6n, SPLIT)]),
  // S: one side only, refunded as one-sided: G is decided and scores nothing.
  txOf("l", 40, [opened(S), entry(S, 1n, G, YES, SOL, [SOL, 0n]), resolved(S, 2n, Outcome.Yes)]),
  txOf("m", 41, [finalized(S, 3n, ONE_SIDED)]),
  // U: a YES still in review: final only once its live account says so.
  txOf("n", 50, [opened(U), entry(U, 1n, H, YES, SOL, [SOL, 0n]), entry(U, 2n, B, NO, SOL, [SOL, SOL])]),
  txOf("o", 51, [resolved(U, 3n, Outcome.Yes)]),
];

const finalU: CampaignNow = {
  outcome: Outcome.Yes,
  final: true,
  oneSided: false,
  creator: CREATOR,
  kind: ReaderKind.PriceTouch,
};

async function indexed(readLive: () => Promise<Live>) {
  const store = openStore(":memory:");
  const report = await createIngest(scripted({ txs: [...TXS] }).rpc, store, { readLive }).refresh();
  expect(report).toMatchObject({ processed: TXS.length, gaps: [], pointsError: null });
  const rows = store.db.query("SELECT wallet, points, entered, decided FROM points ORDER BY points DESC, wallet").all();
  store.close();
  return rows;
}

describe("the indexer's points are the SDK's rule (3a)", () => {
  test("judged from the events alone: every 3a case, and the same table as pointsTable", async () => {
    const rows = await indexed(noLive);
    const events = TXS.flatMap((tx) => decodeTransactionEvents(tx));
    expect(rows).toEqual(pointsTable(events, new Map()));
    const line = (wallet: string) => rows.find((r) => (r as { wallet: string }).wallet === wallet);
    expect(line(A)).toEqual({ wallet: A, points: 2, entered: 2, decided: 2 });
    expect(line(B)).toEqual({ wallet: B, points: 0, entered: 3, decided: 2 });
    expect(line(C)).toEqual({ wallet: C, points: 0, entered: 1, decided: 1 });
    expect(line(CREATOR)).toEqual({ wallet: CREATOR, points: 1, entered: 2, decided: 2 });
    expect(line(E)).toEqual({ wallet: E, points: 1, entered: 1, decided: 1 });
    expect(line(D)).toMatchObject({ points: 0 });
    expect(line(G)).toEqual({ wallet: G, points: 0, entered: 1, decided: 1 });
    expect(line(H)).toEqual({ wallet: H, points: 0, entered: 1, decided: 0 });
    expect(line(F)).toBeUndefined();
  });

  test("a live account's word that a result is final is passed through, keyed by address", async () => {
    const live = async (): Promise<Live> => ({ ...(await noLive()), now: new Map([[U, finalU]]) });
    const rows = await indexed(live);
    const events = TXS.flatMap((tx) => decodeTransactionEvents(tx));
    expect(rows).toEqual(pointsTable(events, new Map([[U, finalU]])));
    expect(rows.find((r) => (r as { wallet: string }).wallet === H)).toEqual({
      wallet: H,
      points: 1,
      entered: 1,
      decided: 1,
    });
  });
});
