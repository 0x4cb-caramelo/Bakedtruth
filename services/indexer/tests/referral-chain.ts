/**
 * Purpose: the chain of the referral tests (Sprint 14, lane L14R), with no cluster: each step is one landed
 *          transaction at the next slot, with a block time a test may set, carrying the program's events encoded by
 *          the generated client and wrapped as fake-chain.ts wraps them (an inner instruction of the program whose one
 *          account is its event authority); `together` lands several steps as one transaction, each its own
 *          instruction, in order; each slot's block lists its transactions in the order they landed unless a test
 *          sets another (`blocks`), and `getBlock` answers it, or fails while `blockDown`. The referral link is signed
 *          at a slot a test may choose; `indexed` reads the chain with the real ingest into a new file. The
 *          campaigns' own events come from referral-campaign.ts.
 * Version: 0.2.0 (several instructions in one transaction; the block's order and getBlock)
 * Sprint:  14 (referral, lane L14R)
 */
import { getBase58Decoder, type Address } from "@solana/kit";
import { expect } from "bun:test";
import { EVENT_AUTHORITY, EVENT_IX_TAG, EVENTS, PROGRAM_ID, type RpcTransaction } from "@brot/sdk/read";

import { openStore } from "../src/db/store";
import { createIngest } from "../src/ingest";
import { noLive, scripted } from "./fake-chain";

import * as T from "../../../packages/sdk/src/idl/generated/types";

export const T0 = 1_800_000_000;
export const DAY = 86_400;
export const SOL = 1_000_000_000n;
/** A distinct valid address: tag 1 for wallets, 2 for campaigns. */
export const key = (tag: number, n: number) =>
  getBase58Decoder().decode(new Uint8Array(32).map((_, i) => (i === 0 ? tag : i === 1 ? n : 0))) as Address;
export const wallet = (n: number) => key(1, n);

export type Ev = { name: string; data: Record<string, unknown> };
export type Edit = (e: Ev) => void;
export type At = { slot?: number; time?: number };
type Placed = { slot: number; time: number; signature: string };
type Encoder = { encode(value: unknown): Uint8Array };
const encoderOf = (name: string) => (T as unknown as Record<string, () => Encoder>)[`get${name}Encoder`]();
const base58 = getBase58Decoder();
const eventData = (e: Ev) => {
  const { discriminator } = EVENTS.find((x) => x.name === e.name)!;
  return base58.decode(new Uint8Array([EVENT_IX_TAG, discriminator, ...encoderOf(e.name).encode(e.data)]));
};
let signatures = 0;

export class Chain {
  readonly txs: RpcTransaction[] = [];
  slot = 100;
  time = T0;
  /** A slot's transactions in block order, when a test sets one. */
  readonly blocks = new Map<number, string[]>();
  /** `getBlock` fails while set, as a node that does not answer. */
  blockDown = false;
  private batch: { placed: Placed; groups: Ev[][] } | null = null;

  private next(at: At): Placed {
    this.slot = at.slot ?? this.slot + 1;
    this.time = at.time ?? this.time + 1;
    signatures += 1;
    const signature = base58.decode(new Uint8Array(64).map((_, i) => (i < 4 ? signatures >> (8 * i) : 9)));
    return { slot: this.slot, time: this.time, signature };
  }

  private push(placed: Placed, groups: Ev[][]): void {
    const keys = new Set(groups.flat().map((e) => (e.data.campaign ?? e.data.referee) as string));
    this.txs.push({
      slot: BigInt(placed.slot),
      blockTime: BigInt(placed.time),
      transaction: {
        signatures: [placed.signature],
        message: { accountKeys: [wallet(250), PROGRAM_ID, EVENT_AUTHORITY, ...keys] },
      },
      meta: {
        err: null,
        innerInstructions: groups.map((events, index) => ({
          index,
          instructions: events.map((e) => ({ programIdIndex: 1, accounts: [2], data: eventData(e) })),
        })),
      },
    } as unknown as RpcTransaction);
  }

  /** One transaction carrying `events`, at the next slot (or `slot`) and one second later (or `time`). */
  land(events: Ev[], at: At = {}): Placed {
    if (this.batch) {
      this.batch.groups.push(events);
      return this.batch.placed;
    }
    const placed = this.next(at);
    this.push(placed, [events]);
    return placed;
  }

  /** Every step inside `work` lands in one transaction, each its own instruction, in the order taken. */
  together<R>(work: () => R, at: At = {}): R {
    this.batch = { placed: this.next(at), groups: [] };
    try {
      return work();
    } finally {
      const { placed, groups } = this.batch;
      this.batch = null;
      this.push(placed, groups);
    }
  }

  /** `referee` names `referrer`, signed now (or at `at`). */
  link(referee: Address, referrer: Address, at: At = {}): Placed {
    const slot = this.batch?.placed.slot ?? at.slot ?? this.slot + 1;
    const time = this.batch?.placed.time ?? at.time ?? this.time + 1;
    return this.land([{ name: "ReferralLinked", data: { referee, referrer, linkedAt: time, linkedSlot: slot } }], at);
  }

  /** The block of `slot`: its transactions' first signatures, in block order. */
  blockOf(slot: number): string[] {
    return (
      this.blocks.get(slot) ??
      this.txs.filter((tx) => Number(tx.slot) === slot).map((tx) => tx.transaction.signatures[0])
    );
  }
}

/** The scripted RPC of fake-chain.ts over the chain's transactions, with `getBlock` (signatures only). */
export function rpcOf(chain: Chain) {
  const { rpc } = scripted({ txs: chain.txs });
  const blockReads: number[] = [];
  const getBlock = (slot: bigint) => ({
    send: async () => {
      blockReads.push(Number(slot));
      if (chain.blockDown) throw new Error("503");
      return { signatures: chain.blockOf(Number(slot)) };
    },
  });
  return { rpc: Object.assign(rpc, { getBlock }) as typeof rpc, blockReads };
}

type Row = Record<string, unknown>;

/** The chain ingested into a new file; `refresh` reads what was added since. */
export async function indexed(chain: Chain) {
  const { rpc, blockReads } = rpcOf(chain);
  const store = openStore(":memory:");
  const ingest = createIngest(rpc, store, { readLive: noLive });
  const refresh = async () => {
    const report = await ingest.refresh();
    expect(report.referralError).toBe(chain.blockDown ? "Error" : null);
    return report;
  };
  await refresh();
  const referral = (referee: string) => store.db.query("SELECT * FROM referrals WHERE referee = ?").get(referee) as Row;
  const entries = (referee: string) =>
    store.db.query("SELECT * FROM referral_entries WHERE referee = ? ORDER BY first_slot").all(referee) as Row[];
  return { store, rpc, refresh, referral, entries, blockReads };
}
