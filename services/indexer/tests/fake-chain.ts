/**
 * Purpose: the indexer's no-cluster tests' chain (Sprint 08): the program's own events, encoded by the generated client
 *          and wrapped as a node writes a landed transaction (an inner instruction of the program whose one account is
 *          its event authority, so the SDK's decoder reads them under its rules), and a Kit-shaped scripted RPC that
 *          lists and returns them, with what the ingest must survive: pages shorter than asked, a node that ignores
 *          `until`, a transaction that does not read back, a call that fails, one the program's listing leaves out,
 *          a failed one.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { getBase58Decoder } from "@solana/kit";
import { EVENT_AUTHORITY, EVENT_IX_TAG, EVENTS, PROGRAM_ID, type RpcTransaction, type SolanaRpc } from "@brot/sdk/read";

import * as T from "../../../packages/sdk/src/idl/generated/types";
import type { Live } from "../src/live";

/** Valid 32-byte addresses: 31 leading zero bytes, then `n` (2 to 9). */
export const ADDR = (n: number) => `${"1".repeat(31)}${n}`;
/** A real-looking signature (64 bytes, base58) for a short name. */
export const SIG = (name: string) => getBase58Decoder().decode(new Uint8Array(64).fill(name.charCodeAt(0)));
export const SOL = 1_000_000_000n;
export const CREATOR = ADDR(3);

const ENCODERS: Record<string, { encode(value: never): Iterable<number> }> = {
  CampaignOpened: T.getCampaignOpenedEncoder(),
  EntryAdded: T.getEntryAddedEncoder(),
  CampaignClosed: T.getCampaignClosedEncoder(),
};
export type FakeEvent = { name: keyof typeof ENCODERS; data: Record<string, unknown> };

/** A `CampaignOpened` at seq 0 for a paid price campaign at `campaign`. */
export const opened = (campaign: string): FakeEvent => ({
  name: "CampaignOpened",
  data: {
    ...{ campaign, seq: 0n, id: 7n, creator: CREATOR, creatorIsTeam: false, kind: T.ReaderKind.PriceTouch },
    ...{ direction: T.Direction.Above, feedId: new Uint8Array(32).fill(1), metricAccount: ADDR(9), target: 100n },
    ...{ priceExponent: -8, maxAge: 60, templateVersion: 1, opensAt: 1_800_000_000n, entriesCloseAt: 1_800_500_000n },
    ...{ deadlineAt: 1_800_600_000n, feeBps: 1_000, oneSidedFeeBps: 100, creatorShareBps: 100, openingUsd: 500n },
    ...{ openingPaidLamports: 5n * SOL, openingPrice: 10_000_000_000n, openingPriceExponent: -8 },
    ...{ openingPricePublishTime: 1_799_999_990n, prizeLamports: 4_500_000_000n, openingFeeLamports: 500_000_000n },
    epoch: 0n,
  },
});

/** An `EntryAdded`: `side` 0 is YES; the pools are both sides after it. */
export const entry = (campaign: string, seq: bigint, baker: string, side: 0 | 1, amount: bigint, pools: bigint[]) =>
  ({
    name: "EntryAdded",
    data: { campaign, seq, baker, side, isFirst: true, amount, poolYes: pools[0], poolNo: pools[1] },
  }) as FakeEvent;

export const closed = (campaign: string, seq: bigint): FakeEvent => ({
  name: "CampaignClosed",
  data: { campaign, seq, rentPayer: CREATOR, rentReturned: 1n, surplusSwept: 0n },
});

/** A landed transaction carrying `events`, as `getTransaction` (JSON) writes it. */
export function txOf(name: string, slot: number, events: FakeEvent[], failed = false): RpcTransaction {
  const campaigns = [...new Set(events.map((e) => e.data.campaign as string))];
  const data = (e: FakeEvent) => {
    const { discriminator } = EVENTS.find((x) => x.name === e.name)!;
    const payload = ENCODERS[e.name].encode({ entryYes: 0n, entryNo: 0n, ...e.data } as never);
    return getBase58Decoder().decode(new Uint8Array([EVENT_IX_TAG, discriminator, ...payload]));
  };
  return {
    slot: BigInt(slot),
    blockTime: BigInt(1_800_000_000 + slot),
    transaction: {
      signatures: [SIG(name)],
      message: { accountKeys: [ADDR(8), PROGRAM_ID, EVENT_AUTHORITY, ...campaigns] },
    },
    meta: {
      err: failed ? { InstructionError: [0, { Custom: 6000 }] } : null,
      innerInstructions: [
        { index: 0, instructions: events.map((e) => ({ programIdIndex: 1, accounts: [2], data: data(e) })) },
      ],
    },
  } as RpcTransaction;
}

export type Script = {
  txs: RpcTransaction[];
  pageCap?: number;
  ignoreUntil?: boolean;
  /** Left out of the program's listing (a node that missed it), still in its campaign's. */
  hidden?: Set<string>;
  /** How many more reads of each signature answer null; `Infinity` for never. */
  unreadable?: Map<string, number>;
  /** How many more reads of each signature fail as a call (a timeout, a node down). */
  failing?: Map<string, number>;
};

/** A Kit-shaped RPC over `script`, oldest transaction first; `reads` records each signature read, in order. */
export function scripted(script: Script) {
  const reads: string[] = [];
  const send = <T>(work: () => T) => ({ send: async () => work() });
  const rpc = {
    getSignaturesForAddress: (at: string, config: { limit: number; before?: string; until?: string }) =>
      send(() => {
        let list = [...script.txs]
          .reverse()
          .filter((tx) => (tx.transaction.message.accountKeys as string[]).includes(at))
          .filter((tx) => at !== PROGRAM_ID || !script.hidden?.has(tx.transaction.signatures[0]));
        const sigs = list.map((tx) => tx.transaction.signatures[0]);
        if (config.until && !script.ignoreUntil && sigs.includes(config.until))
          list = list.slice(0, sigs.indexOf(config.until));
        const from = config.before ? sigs.indexOf(config.before) + 1 : 0;
        const size = Math.min(config.limit, script.pageCap ?? config.limit);
        return list
          .slice(from, from + size)
          .map((tx) => ({ signature: tx.transaction.signatures[0], slot: tx.slot, err: tx.meta!.err }));
      }),
    getTransaction: (sig: string) =>
      send(() => {
        reads.push(sig);
        const down = script.failing?.get(sig) ?? 0;
        if (down > 0) {
          script.failing!.set(sig, down - 1);
          throw new Error("503");
        }
        const left = script.unreadable?.get(sig) ?? 0;
        if (left > 0) {
          script.unreadable!.set(sig, left - 1);
          return null;
        }
        return script.txs.find((tx) => tx.transaction.signatures[0] === sig) ?? null;
      }),
  };
  return { rpc: rpc as unknown as SolanaRpc, reads };
}

/** The live read a test with no cluster gets: the clock only, no account. */
export const noLive = async (): Promise<Live> => ({
  chain: { slot: 9n, epoch: 1n, unixTimestamp: 1_800_000_000n },
  accounts: new Map(),
  now: new Map(),
});
