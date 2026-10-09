/**
 * Purpose: what the join tests share: a world with a paid price campaign, its sponsored price kept
 *          fresh across clock moves, a refused join that moves nothing, SOL sent by hand, an account
 *          rewritten in place, and the return estimate of TP section 3.4.16 (`min_return_bps`).
 * Version: 0.0.2
 * Sprint:  02 (pot core on Pinocchio), lane E; 03 (the join lock reads the sponsored price), lane E
 */
import { expect } from "bun:test";
import {
  AccountRole,
  generateKeyPairSigner,
  getAddressEncoder,
  getProgramDerivedAddress,
  lamports,
  type Address,
  type Instruction,
  type KeyPairSigner,
} from "@solana/kit";

import type { BrotErrorName } from "./errors";
import { DEFAULT_PARAMS, initConfig, openedCampaign, readCampaign, setTeam } from "./flows";
import * as I from "./instructions";
import { layoutSize } from "./layouts";
import * as P from "./program";
import { setClock } from "./readers";
import { balance, createWorld, expectError, fundedWallet, now, PRICE_OFFSETS, send, type World } from "./setup";
import { ENTRY } from "./structs";

/** P-5: 0.01 SOL, the config's `min_entry_lamports`. */
export const MIN_ENTRY = DEFAULT_PARAMS.min_entry_lamports;
/** `Entry::LEN` (T19). */
export const ENTRY_LEN = layoutSize(ENTRY);

/** A world with the founder's config, two team keys and one paid price campaign (BTC/USD unless `over`), empty. */
export async function joinWorld(over: Partial<I.OpenArgs> = {}) {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const [team, creator] = [await setTeam(w, admin), await fundedWallet(w)];
  const opened = await openedCampaign(w, creator, over);
  const metric = readCampaign(w, opened.campaign).metric_account as Address;
  return { w, admin, team, creator, opened, campaign: opened.campaign, vault: opened.vault, metric };
}

/**
 * Moves the clock's Unix time to `at` (by default it stays) and sets the publish time of the price
 * account `metric` 5 s before it, every other byte kept: from Sprint 03 the join lock reads it.
 */
export function freshPrice(w: World, metric: Address, at = now(w.client)) {
  setClock(w.client, { unixTimestamp: at });
  rewrite(w, metric, (d) => new DataView(d.buffer).setBigInt64(PRICE_OFFSETS.publishTime, at - 5n, true));
}

/**
 * A join that must fail with `error` and move nothing: the baker's and the vault's lamports, the campaign's bytes and
 * the baker's Entry (absent if it was) stay as they were; returns them. `a.metric` replaces the campaign's own account.
 */
export async function refusedJoin(w: World, baker: KeyPairSigner, campaign: Address, a: Refused, error: BrotErrorName) {
  const [vault, entry] = [await P.vaultPda(campaign), await P.entryPda(campaign, baker.address)];
  const metric = a.metric ?? (readCampaign(w, campaign).metric_account as Address);
  const state = () => ({
    baker: balance(w, baker.address),
    vault: balance(w, vault),
    campaign: snapshot(w, campaign),
    entry: snapshot(w, entry),
  });
  const kept = state();
  expectError(await send(w, [await I.joinCampaignIx(baker, campaign, metric, a)]), error);
  expect(state()).toEqual(kept);
  return kept;
}
type Refused = I.JoinArgs & { metric?: Address };

/** A System Program transfer signed by `from`: SOL sent by hand, outside the program. */
export function systemTransferIx(from: KeyPairSigner, to: Address, amount: bigint): Instruction {
  const data = new Uint8Array(12);
  const view = new DataView(data.buffer);
  view.setUint32(0, 2, true); // SystemInstruction::Transfer
  view.setBigUint64(4, amount, true);
  return {
    programAddress: P.SYSTEM_PROGRAM_ID,
    accounts: [
      { address: from.address, role: AccountRole.WRITABLE_SIGNER, signer: from },
      { address: to, role: AccountRole.WRITABLE },
    ],
    data,
  } as Instruction;
}

/** Rewrites an account's bytes with setAccount, which bypasses the runtime: a state no transaction reaches. */
export function rewrite(w: World, address: Address, change: (data: Uint8Array) => void) {
  const account = w.client.svm.getAccount(address);
  if (!account.exists) throw new Error(`account ${address} does not exist`);
  const data = new Uint8Array(account.data);
  change(data);
  w.client.svm.setAccount({
    address,
    data,
    executable: account.executable,
    lamports: account.lamports,
    programAddress: account.programAddress,
    space: account.space,
  });
}

/** An account's owner, lamports and bytes, to show that nothing about it changed; owner null when absent. */
export function snapshot(w: World, address: Address) {
  const account = w.client.svm.getAccount(address);
  if (!account.exists) return { owner: null as Address | null, lamports: 0n, data: [] as number[] };
  return {
    owner: account.programAddress as Address | null,
    lamports: BigInt(account.lamports),
    data: [...account.data],
  };
}

/** The canonical bump of `["entry", campaign, baker]`, the only one the program creates. */
export async function entryBump(campaign: Address, baker: Address) {
  const key = getAddressEncoder();
  const seeds = [new TextEncoder().encode("entry"), key.encode(campaign), key.encode(baker)];
  const [, bump] = await getProgramDerivedAddress({ programAddress: P.PROGRAM_ID, seeds });
  return bump;
}

/**
 * A wallet holding 100 SOL whose address satisfies `wanted`, drawn until one does. A foreign Entry's stored bump,
 * re-derived on another wallet's seeds, either gives a valid address (when the two canonical bumps are equal, that
 * wallet's own Entry address) or none at all (when it is above that wallet's canonical bump, the point is on the
 * curve). Choosing the wallets makes each test take one of the two paths on every run, instead of one at random.
 */
export async function walletWhere(w: World, wanted: (address: Address) => Promise<boolean>) {
  for (let tries = 0; tries < 64; tries++) {
    const signer = await generateKeyPairSigner();
    if (await wanted(signer.address)) {
      w.client.svm.airdrop(signer.address, lamports(100n * P.SOL));
      return signer;
    }
  }
  throw new Error("no wallet with the wanted Entry bumps in 64 draws");
}

// --- TP section 3.4.16, mirrored to compute what the program must answer --------------------------

const BPS = 10_000n;
const ceilDiv = (a: bigint, b: bigint) => (a + b - 1n) / b;
const min = (a: bigint, b: bigint) => (a < b ? a : b);

/** `Split`: what the winners share (V winning, P losing, R prize); the fee rounds up, the share down. */
export function distributable(winning: bigint, losing: bigint, prize: bigint, feeBps: bigint, shareBps: bigint) {
  const fee = ceilDiv(losing * feeBps, BPS);
  const share = ((winning + losing) * shareBps) / BPS;
  const fromPot = min(share, losing - fee + prize);
  return winning + losing - fee - fromPot + prize;
}

/** One winning entry's payout in `Split`: `floor(entry × distributable ÷ V)`. */
export const splitPayout = (entry: bigint, dist: bigint, winning: bigint) => (entry * dist) / winning;

/** One entry's refund in `OneSided`: the entry less its fee, none for the first baker. */
export const oneSidedRefund = (entry: bigint, feeBps: bigint, isFirst: boolean) =>
  entry - (isFirst ? 0n : ceilDiv(entry * feeBps, BPS));

export type JoinedPot = {
  amount: bigint;
  sideAfter: bigint;
  other: bigint;
  prize: bigint;
  feeBps: bigint;
  oneSidedFeeBps: bigint;
  creatorShareBps: bigint;
  isFirst: boolean;
};

/** What `amount` returns if its side wins, in bps of `amount`, on the pot after the entry. */
export function estimateReturnBps(p: JoinedPot) {
  const back =
    p.other === 0n
      ? oneSidedRefund(p.amount, p.oneSidedFeeBps, p.isFirst)
      : splitPayout(p.amount, distributable(p.sideAfter, p.other, p.prize, p.feeBps, p.creatorShareBps), p.sideAfter);
  return (back * BPS) / p.amount;
}

/**
 * The estimate the program will compute for `amount` on `side`, from the campaign's books as they stand. Tests use it
 * only where the rounding is unambiguous: a one-sided pot with whole-percent fees, or a joiner alone on its side.
 */
export function expectedEstimate(w: World, campaign: Address, side: number, amount: bigint, isFirst: boolean) {
  const c = readCampaign(w, campaign);
  const [mine, other] = side === P.Side.Yes ? [c.pool_yes, c.pool_no] : [c.pool_no, c.pool_yes];
  return estimateReturnBps({
    amount,
    sideAfter: (mine as bigint) + amount,
    other: other as bigint,
    prize: c.prize_lamports as bigint,
    feeBps: BigInt(c.fee_bps),
    oneSidedFeeBps: BigInt(c.one_sided_fee_bps),
    creatorShareBps: BigInt(c.creator_share_bps),
    isFirst,
  });
}
