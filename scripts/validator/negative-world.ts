/**
 * Purpose: run the test kit's account injectors and the slot matrix's mutations against a surfnet, unchanged: a
 *          recording stand-in for the three synchronous LiteSVM calls they make (`setAccount`, `airdrop`,
 *          `minimumBalanceForRentExemption`), replayed on the surfnet with `surfnet_setAccount` and airdrops.
 * Version: 0.1.1
 * Sprint:  05 (SDK and the devnet cycle), lane OPS: the DoD row "the negative tests, the slot tests and one paid
 *          opening run once on a real validator"; 15 (the SealedFee's size, lane INV15)
 *
 * The rent the kit asks for is the surfnet's own, read beforehand for every size the kit writes. The campaign
 * `base` mirrors tests/brot/slot-matrix-fixtures.ts, times taken from the surfnet's clock.
 */
import { generateKeyPairSigner, type Address } from "@solana/kit";

import type { InjectedCampaign } from "../../tests/brot/campaigns";
import { settleSplit } from "../../tests/brot/money-model";
import * as P from "../../tests/brot/program";
import type { World } from "../../tests/brot/setup";

import { airdrop, clock, rentFor, type Rpc } from "./rpc";
import { setAccount } from "./surfnet";

type Recorded =
  | { kind: "set"; address: string; lamports: bigint; data: Uint8Array; owner: string; executable: boolean }
  | { kind: "airdrop"; address: string; lamports: bigint };

/** The account sizes the kit writes: data-less, mint, join, sealed fee, entry, token account, config, campaign. */
const SIZES = [0, 45, 82, 96, 112, 116, 134, 165, 400, 512, 611, 1_112, 3_762];

/** A world the kit's helpers accept; their writes wait in `flush` until it is awaited. */
export type ShimWorld = { w: World; flush: () => Promise<void> };

export async function shimWorld(rpc: Rpc): Promise<ShimWorld> {
  const rent = new Map<number, bigint>();
  for (const size of SIZES) rent.set(size, await rentFor(rpc, size));
  const queue: Recorded[] = [];
  const svm = {
    setAccount(a: {
      address: string;
      data: Uint8Array;
      lamports: bigint;
      programAddress: string;
      executable: boolean;
    }) {
      queue.push({
        kind: "set",
        address: a.address,
        lamports: BigInt(a.lamports),
        data: a.data,
        owner: a.programAddress,
        executable: a.executable,
      });
    },
    airdrop(address: string, lamports: bigint) {
      queue.push({ kind: "airdrop", address, lamports: BigInt(lamports) });
    },
    minimumBalanceForRentExemption(size: bigint) {
      const value = rent.get(Number(size));
      if (value === undefined) throw new Error(`no rent read for ${size} bytes: add the size to SIZES`);
      return value;
    },
  };
  const flush = async () => {
    for (const write of queue.splice(0)) {
      if (write.kind === "airdrop") await airdrop(rpc, write.address, write.lamports);
      else await setAccount(rpc, write.address, write);
    }
  };
  return { w: { client: { svm } } as unknown as World, flush };
}

const SOL = P.SOL;
/** The Split snapshot the settlement baselines use: 2 SOL on YES, 1 SOL on NO, 10% fee, 1% share. */
const SPLIT = settleSplit({ winning: 2n * SOL, losing: SOL, prize: 0n, feeBps: 1_000n, creatorBps: 100n });
export const SNAPSHOT = {
  settle_mode: 1,
  winning_total: 2n * SOL,
  losing_total: SOL,
  distributable: SPLIT.distributable,
  fee_total: SPLIT.fee,
  creator_share: SPLIT.creatorFromPot + SPLIT.creatorFromFee,
  creator_share_from_fee: SPLIT.creatorFromFee,
  prize_lamports: 0n,
};

let nextId = 7_000_000n;

/** A campaign to inject (slot-matrix-fixtures.ts `base`): a price kind, a funded creator, times around now. */
export async function base(rpc: Rpc, over: Partial<InjectedCampaign> = {}): Promise<InjectedCampaign> {
  const t = (await clock(rpc)).unixTimestamp;
  const creator = await generateKeyPairSigner();
  await airdrop(rpc, creator.address, 10n * SOL);
  return {
    id: nextId++,
    kind: P.ReaderKind.PriceTouch,
    metric: (await generateKeyPairSigner()).address as Address,
    target: 1n,
    creator: creator.address,
    opensAt: t - P.DAY,
    entriesCloseAt: t + P.DAY,
    deadlineAt: t + 2n * P.DAY,
    poolYes: 2n * SOL,
    poolNo: SOL,
    extra: { publish_time: t },
    ...over,
  };
}
