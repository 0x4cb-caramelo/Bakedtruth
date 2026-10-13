/**
 * Purpose: the slot matrix's baselines for the five instructions of Sprints 14 and 15, spread into
 *          slot-matrix-fixtures.ts's table. Until a lane lands, the program refuses its instruction with
 *          `UnknownInstruction` (DISABLED in scripts/slot-matrix-spec.ts), so the matrix checks only that every
 *          case is refused with it and moves no lamport; the lane then makes its baseline succeed.
 * Version: 0.0.1
 * Sprint:  scaffold of Sprints 14–15, 2026-10-13 (each baseline is made valid by its lane: L14A, L14B, L15)
 */
import {
  generateKeyPairSigner,
  getAddressEncoder,
  getProgramDerivedAddress,
  lamports,
  type Instruction,
} from "@solana/kit";

import { injectCampaign, injectSettling, type InjectedCampaign } from "./campaigns";
import { initConfig, newId } from "./flows";
import * as IL from "./instructions-14-15";
import { joinWorld } from "./join-campaign-support";
import { encode, layoutSize } from "./layouts";
import * as P from "./program";
import { createWorld, fundedWallet, now, type World } from "./setup";
import { SEALED_FEE } from "./structs-14-15";

type Baseline = { w: World; ix: Instruction };

/** A world with the founder's config and a price campaign past its deadline, resolved YES, to inject. */
async function resolvedWorld() {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const t = now(w.client);
  const c: InjectedCampaign = {
    id: newId(),
    kind: P.ReaderKind.PriceTouch,
    metric: (await generateKeyPairSigner()).address,
    target: 1n,
    creator: (await fundedWallet(w)).address,
    opensAt: t - 4n * P.DAY,
    entriesCloseAt: t - 2n * P.DAY,
    deadlineAt: t - P.DAY,
    poolYes: 2n * P.SOL,
    poolNo: P.SOL,
    extra: { outcome: P.Outcome.Yes, publish_time: t - 2n * P.DAY },
  };
  return { w, admin, c, t };
}

/** The campaign of `resolvedWorld` written `Contested` at `stage`, its stage's clock running for another hour. */
async function contested(stage: number) {
  const { w, admin, c, t } = await resolvedWorld();
  const extra = { ...c.extra, contest_stage: stage, contest_ends_at: t + P.HOUR };
  const { campaign } = await injectCampaign(w.client, { ...c, status: P.Status.Contested, extra });
  return { w, admin, campaign, metric: c.metric };
}

export const BASELINES_14_15: Record<string, () => Promise<Baseline>> = {
  UserLinkReferrer: async () => {
    const w = await createWorld();
    const [referee, referrer] = [await fundedWallet(w), await fundedWallet(w)];
    return { w, ix: await IL.userLinkReferrerIx(referee, referrer.address) };
  },
  RereadCampaign: async () => {
    const { w, campaign, metric } = await contested(1);
    return { w, ix: IL.rereadCampaignIx(campaign, await P.configPda(), metric) };
  },
  AdminDecideContest: async () => {
    const { w, admin, campaign } = await contested(2);
    const args = { decision: P.ContestDecision.Confirm, voidReason: P.VoidReason.None, noteHash: new Uint8Array(32) };
    return { w, ix: IL.adminDecideContestIx(admin, await P.configPda(), campaign, args) };
  },
  SponsorJoinCampaign: async () => {
    const { w, campaign, metric } = await joinWorld();
    const sponsor = await fundedWallet(w, 1_000n);
    const args = { side: P.Side.Yes, entryUsd: 500n, maxLamports: 100n * P.SOL };
    return { w, ix: await IL.sponsorJoinCampaignIx(sponsor, campaign, metric, args) };
  },
  SettleSealedFee: async () => {
    const { w, c } = await resolvedWorld();
    const sponsor = await fundedWallet(w);
    const snapshot = { settle_mode: 1, winning_total: 2n * P.SOL, losing_total: P.SOL }; // Split
    const settling = { ...c, extra: { ...c.extra, sealed_fees_open: 1 } };
    const { campaign } = await injectSettling(w.client, settling, P.Outcome.Yes, snapshot);
    // The sponsor's SealedFee at its PDA (tag 6, layout 1), holding a fee of 0.5 SOL above its rent.
    const key = getAddressEncoder();
    const [sealedFee, bump] = await getProgramDerivedAddress({
      programAddress: P.PROGRAM_ID,
      seeds: ["sealed", key.encode(campaign), key.encode(sponsor.address)],
    });
    const fee = P.SOL / 2n;
    const data = encode(SEALED_FEE, {
      tag: 6, // AccountTag::SealedFee
      version: 1,
      bump,
      campaign,
      sponsor: sponsor.address,
      fee_lamports: fee,
      entry_lamports: 9n * fee,
      usd_total: 500n,
      sealed_count: 1,
    });
    w.client.svm.setAccount({
      address: sealedFee,
      data,
      executable: false,
      lamports: lamports(w.client.svm.minimumBalanceForRentExemption(BigInt(layoutSize(SEALED_FEE))) + fee),
      programAddress: P.PROGRAM_ID,
      space: BigInt(data.length),
    });
    return { w, ix: IL.settleSealedFeeIx(sealedFee, campaign, sponsor.address, await P.feeVaultPda()) };
  },
};
