/**
 * Purpose: the chain of the referral tests (Sprint 14, lane L14R), with no cluster: each step is one landed
 *          transaction at the next slot, with a block time a test may set, carrying the program's events encoded by
 *          the generated client and wrapped as fake-chain.ts wraps them (an inner instruction of the program whose one
 *          account is its event authority), for the scripted RPC and the real ingest; and the referral link, signed
 *          at a slot a test may choose; and `indexed`, the chain read by the real ingest into a new file, with the
 *          referral rows of a wallet. The campaigns' own events come from referral-campaign.ts.
 * Version: 0.1.0
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
type Encoder = { encode(value: unknown): Uint8Array };
const encoderOf = (name: string) => (T as unknown as Record<string, () => Encoder>)[`get${name}Encoder`]();
let signatures = 0;

export class Chain {
  readonly txs: RpcTransaction[] = [];
  slot = 100;
  time = T0;

  /** One transaction carrying `events`, at the next slot (or `slot`) and one second later (or `time`). */
  land(events: Ev[], at: { slot?: number; time?: number } = {}) {
    this.slot = at.slot ?? this.slot + 1;
    this.time = at.time ?? this.time + 1;
    signatures += 1;
    const signature = getBase58Decoder().decode(new Uint8Array(64).map((_, i) => (i < 4 ? signatures >> (8 * i) : 9)));
    const keys = [...new Set(events.map((e) => (e.data.campaign ?? e.data.referee) as string))];
    const data = (e: Ev) => {
      const { discriminator } = EVENTS.find((x) => x.name === e.name)!;
      return getBase58Decoder().decode(
        new Uint8Array([EVENT_IX_TAG, discriminator, ...encoderOf(e.name).encode(e.data)]),
      );
    };
    this.txs.push({
      slot: BigInt(this.slot),
      blockTime: BigInt(this.time),
      transaction: {
        signatures: [signature],
        message: { accountKeys: [wallet(250), PROGRAM_ID, EVENT_AUTHORITY, ...keys] },
      },
      meta: {
        err: null,
        innerInstructions: [
          { index: 0, instructions: events.map((e) => ({ programIdIndex: 1, accounts: [2], data: data(e) })) },
        ],
      },
    } as unknown as RpcTransaction);
    return { slot: this.slot, time: this.time, signature };
  }

  /** `referee` names `referrer`, signed now. */
  link(referee: Address, referrer: Address, at: { slot?: number; time?: number } = {}) {
    const slot = at.slot ?? this.slot + 1;
    const time = at.time ?? this.time + 1;
    return this.land([{ name: "ReferralLinked", data: { referee, referrer, linkedAt: time, linkedSlot: slot } }], at);
  }
}

type Row = Record<string, unknown>;

/** The chain ingested into a new file; `refresh` reads what was added since. */
export async function indexed(chain: Chain) {
  const { rpc } = scripted({ txs: chain.txs });
  const store = openStore(":memory:");
  const ingest = createIngest(rpc, store, { readLive: noLive });
  const refresh = async () => {
    const report = await ingest.refresh();
    expect(report.referralError).toBeNull();
    return report;
  };
  await refresh();
  const referral = (referee: string) => store.db.query("SELECT * FROM referrals WHERE referee = ?").get(referee) as Row;
  const entries = (referee: string) =>
    store.db.query("SELECT * FROM referral_entries WHERE referee = ? ORDER BY first_slot").all(referee) as Row[];
  return { store, rpc, refresh, referral, entries };
}
