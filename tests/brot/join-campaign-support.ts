/**
 * Purpose: what the join tests share: a world with the founder's config, a team and a paid BTC/USD
 *          campaign; SOL sent by hand with a plain System Program transfer; an account rewritten in
 *          place; and the return estimate of TP section 3.4.16 that `min_return_bps` is checked on.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane E
 */
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

import { DEFAULT_PARAMS, initConfig, openedCampaign, readCampaign, setTeam } from "./flows";
import { layoutSize } from "./layouts";
import * as P from "./program";
import { createWorld, fundedWallet, type World } from "./setup";
import { ENTRY } from "./structs";

/** P-5: 0.01 SOL, the config's `min_entry_lamports`. */
export const MIN_ENTRY = DEFAULT_PARAMS.min_entry_lamports;
/** `Entry::LEN` (T19). */
export const ENTRY_LEN = layoutSize(ENTRY);

/** A world with the founder's config, two team keys and one paid price campaign, still empty. */
export async function joinWorld() {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const team = await setTeam(w, admin);
  const creator = await fundedWallet(w);
  const opened = await openedCampaign(w, creator);
  const metric = readCampaign(w, opened.campaign).metric_account as Address;
  return { w, admin, team, creator, opened, campaign: opened.campaign, vault: opened.vault, metric };
}

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
 * A wallet holding 100 SOL whose address satisfies `wanted`, drawn until one does. A foreign
 * Entry's stored bump, re-derived on another wallet's seeds, either gives a valid address (when
 * the two canonical bumps are equal, that wallet's own Entry address) or none at all (when it is
 * above that wallet's canonical bump, the point is on the curve). Choosing the wallets makes each
 * test take one of the two paths on every run, instead of one at random.
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
 * The estimate the program will compute for `amount` on `side`, from the campaign's books as they
 * stand. Tests use it only where the rounding is unambiguous: a one-sided pot with whole-percent
 * fees, or a joiner alone on its side (`amount` equal to V).
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
