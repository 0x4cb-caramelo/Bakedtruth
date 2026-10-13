/**
 * Purpose: what the sealed-entry tests share (Sprint 15): a world with a paid BTC/USD campaign and a sponsor holding
 *          1,000 SOL; the sealed entry sent through the SDK's builder with the sponsor's next Join index and entry
 *          total; its charge at the captured SOL/USD price (TP 3.4.16), split 90/10; the `SealedFee` read; the held
 *          fee settled; a `SealedFee` written straight into the world (a state no transaction reaches); and what an
 *          account holds, to show that a refusal moved nothing.
 * Version: 0.0.1
 * Sprint:  15 (lane L15)
 */
import { getAddressEncoder, getProgramDerivedAddress, lamports, type Address, type KeyPairSigner } from "@solana/kit";

import { buildSettleSealedFee, buildSponsorJoinCampaign } from "@brot/sdk/tx";

import { nextJoinIndex, openingLamports, readCampaign, readConfig, SOL_CHARGED } from "./flows";
import { joinWorld, snapshot } from "./join-campaign-support";
import { decode, encode, layoutSize } from "./layouts";
import * as I from "./instructions";
import * as P from "./program";
import { accountData, balance, fundedWallet, send, type World } from "./setup";
import { ENTRY } from "./structs";
import { SEALED_FEE } from "./structs-14-15";

/** `SealedFee::LEN` (state/sealed_fee.rs). */
export const SEALED_FEE_LEN = layoutSize(SEALED_FEE);

/** A world with the founder's config, two team keys, one paid BTC/USD campaign and a sponsor holding 1,000 SOL. */
export async function sealedWorld(over: Partial<I.OpenArgs> = {}) {
  const world = await joinWorld(over);
  return { ...world, sponsor: await fundedWallet(world.w, 1_000n) };
}

/**
 * The charge of `usd` at the captured SOL/USD account (its price less its confidence, exponent −8), split as an
 * opening is: the entry rounds down, the fee is the rest (`math/opening.rs`).
 */
export function sealedCharge(usd: bigint, prizeBps = 9_000n) {
  const paid = openingLamports(usd, SOL_CHARGED);
  const entry = (paid * prizeBps) / 10_000n;
  return { paid, entry, fee: paid - entry };
}

/** A baker's whole entry, both sides, as the chain holds it: 0 before the first join. */
export async function entryTotal(w: World, campaign: Address, baker: Address) {
  const account = w.client.svm.getAccount(await P.entryPda(campaign, baker));
  if (!account.exists || account.data.length === 0) return 0n;
  const entry = decode(ENTRY, account.data);
  return (entry.amount_yes as bigint) + (entry.amount_no as bigint);
}

export type SealedArgs = {
  side: number;
  entryUsd?: bigint;
  maxLamports?: bigint;
  minReturnBps?: number;
  /** The sponsor's entry total before this entry; the chain's own unless a test tampers with it. */
  expectedEntryTotal?: bigint;
  /** The Join's index; the sponsor's `join_count` unless a test tampers with it. */
  joinIndex?: number;
  /** The creation rules' version signed; the config's own unless a test tampers with it (red team L2). */
  expectedParamsVersion?: number;
};

/** A sealed entry by `sponsor`: US$500 and at most 100 SOL unless `a` says otherwise. */
export async function sealedEntryIx(w: World, sponsor: KeyPairSigner, campaign: Address, a: SealedArgs) {
  return buildSponsorJoinCampaign({
    sponsor,
    campaign,
    metricAccount: readCampaign(w, campaign).metric_account as Address,
    side: a.side,
    entryUsd: a.entryUsd ?? 500n,
    maxLamports: a.maxLamports ?? 100n * P.SOL,
    minReturnBps: a.minReturnBps ?? 0,
    expectedEntryTotal: a.expectedEntryTotal ?? (await entryTotal(w, campaign, sponsor.address)),
    expectedParamsVersion: a.expectedParamsVersion ?? Number((await readConfig(w)).params_version),
    joinIndex: a.joinIndex ?? (await nextJoinIndex(w, campaign, sponsor.address)),
  });
}

export const sealedEntry = async (w: World, sponsor: KeyPairSigner, campaign: Address, a: SealedArgs) =>
  send(w, [await sealedEntryIx(w, sponsor, campaign, a)]);

/** The sponsor's `SealedFee` on `campaign`, decoded with the kit's own layout. */
export const readSealedFee = async (w: World, campaign: Address, sponsor: Address) =>
  decode(SEALED_FEE, accountData(w, await P.sealedFeePda(campaign, sponsor)));

/** `settle_sealed_fee` for `sponsor`'s fee on `campaign`, sent by the world's payer (any wallet). */
export const settleSealedFee = async (w: World, campaign: Address, sponsor: Address) =>
  send(w, [await buildSettleSealedFee({ campaign, sponsor })]);

/** What a sealed entry can touch: the sponsor's lamports, the vault, the campaign, the Entry and the SealedFee. */
export async function sealedState(w: World, sponsor: Address, campaign: Address) {
  return {
    sponsor: balance(w, sponsor),
    vault: balance(w, await P.vaultPda(campaign)),
    campaign: snapshot(w, campaign),
    entry: snapshot(w, await P.entryPda(campaign, sponsor)),
    sealedFee: snapshot(w, await P.sealedFeePda(campaign, sponsor)),
    feeVault: balance(w, await P.feeVaultPda()),
  };
}

/**
 * A `SealedFee` written at `["sealed", campaign, sponsor]` with its canonical bump, holding its rent and `fee` (plus
 * `extra` lamports): the fields default to one sealed entry of US$500 by `sponsor`; `stored` overrides any of them.
 */
export async function placeSealedFee(
  w: World,
  campaign: Address,
  sponsor: Address,
  fee: bigint,
  stored: Record<string, unknown> = {},
  extra = 0n,
) {
  const key = getAddressEncoder();
  const [address, bump] = await getProgramDerivedAddress({
    programAddress: P.PROGRAM_ID,
    seeds: ["sealed", key.encode(campaign), key.encode(sponsor)],
  });
  const data = encode(SEALED_FEE, {
    tag: 6, // AccountTag::SealedFee
    version: 1,
    bump,
    campaign,
    sponsor,
    fee_lamports: fee,
    entry_lamports: 9n * fee,
    usd_total: 500n,
    sealed_count: 1,
    _reserved: new Uint8Array(17),
    ...stored,
  });
  const rent = w.client.svm.minimumBalanceForRentExemption(BigInt(SEALED_FEE_LEN));
  w.client.svm.setAccount({
    address,
    data,
    executable: false,
    lamports: lamports(rent + fee + extra),
    programAddress: P.PROGRAM_ID,
    space: BigInt(data.length),
  });
  return address;
}
