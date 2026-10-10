/**
 * Purpose: the leaderboard route tests' fake data, with no cluster: campaign rows as the snapshot keeps them (a paid
 *          pot with 1 SOL on each side and the devnet rates, opened by WALLET(9)), entries as the history keeps them, a
 *          history and a hide list that answer what a test says, and a call through the route's handler.
 * Version: 0.1.0 (moved out of leaderboard.test.ts with the founder's answer 3a)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { Outcome, ReaderKind, SettleMode, Side, Status, type DecodedEvent } from "@brot/sdk/read";

import type { Hidden } from "../src/hidden";
import type { History } from "../src/history";
import { createHandler } from "../src/routes";
import type { Row, Snapshot } from "../src/snapshot";
import type { Store } from "../src/store";

export const CHAIN = { slot: 900n, epoch: 9n, unixTimestamp: 1_800_000_000n };
export const ADDR = (n: number) => `${"1".repeat(31)}${n}`;
export const WALLET = (n: number) => `${"9".repeat(31)}${n}`;
export const view = (state: string, more: Record<string, unknown> = {}) =>
  ({
    state,
    closedBecause: null,
    contested: false,
    reviewEndsAt: null,
    windowEnded: false,
    settled: false,
    ...more,
  }) as unknown as Row["view"];
export const SOL = 1_000_000_000n;
/** A paid campaign's pot as its account keeps it: 1 SOL on each side, the devnet rates, opened by WALLET(9). */
export const POT = {
  settleMode: SettleMode.Unset,
  creator: WALLET(9),
  creatorIsTeam: false,
  poolYes: SOL,
  poolNo: SOL,
  lateYes: 0n,
  lateNo: 0n,
  prizeLamports: 0n,
  openingFeeLamports: 0n,
  feeBps: 1_000,
  oneSidedFeeBps: 100,
  creatorShareBps: 100,
  voidReason: 0,
};
export const row = (
  n: number,
  outcome: Outcome,
  v: Row["view"],
  kind = ReaderKind.SupplyAtMost,
  pot: Partial<typeof POT> = {},
): Row =>
  ({
    address: ADDR(n),
    campaign: { outcome, kind, status: Status.InReview, ...POT, ...pot },
    view: v,
  }) as unknown as Row;
export const ended = view("InReview", { windowEnded: true });

export const entry = (campaign: string, baker: string, side: Side, n: number) =>
  ({
    name: "EntryAdded",
    discriminator: 5,
    data: { campaign, baker, side, amount: 10_000_000n, seq: 0n, isFirst: false },
    key: { signature: `s${n}`, ixIndex: 0, innerIndex: 0 },
    slot: BigInt(n),
    blockTime: null,
  }) as unknown as DecodedEvent;

export const history = (events: DecodedEvent[], ready = true, complete = true, version = 1): History => ({
  events: () => events,
  version: () => version,
  ready: () => ready,
  complete: () => complete,
  skipped: () => 0,
  refresh: async () => {},
});
export const hideOnly = (wallets: string[]): Hidden => ({
  current: () => new Set(wallets),
  version: () => wallets.length,
  lastError: () => null,
  refresh: () => {},
});

export const SNAP: Snapshot = {
  takenAt: "2026-10-10T06:00:00.000Z",
  asOfSlot: 900n,
  chain: CHAIN,
  rows: [
    row(1, Outcome.Yes, view("InReview", { windowEnded: true })),
    row(2, Outcome.No, view("InReview", { windowEnded: false })),
    row(3, Outcome.No, view("Paid"), ReaderKind.SupplyAtMost, { settleMode: SettleMode.Split }),
  ],
};
const store: Store = { current: () => SNAP, lastError: () => null, refresh: async () => {} };
export const call = async (h: History | undefined, path: string, hidden?: Hidden) => {
  const res = await createHandler(store, { corsOrigin: "*", cluster: "devnet", history: h, hidden })(
    new Request(`http://api.test${path}`),
  );
  return { status: res.status, body: (await res.json()) as any };
};

export const EVENTS = [
  entry(ADDR(1), WALLET(1), Side.Yes, 1),
  entry(ADDR(2), WALLET(1), Side.No, 2),
  entry(ADDR(3), WALLET(2), Side.No, 3),
  entry(ADDR(3), WALLET(3), Side.No, 4),
  entry(ADDR(1), WALLET(3), Side.Yes, 5),
];
