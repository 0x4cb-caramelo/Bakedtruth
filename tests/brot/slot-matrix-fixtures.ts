/**
 * Purpose: one valid instruction per Brot Markets instruction, in a world of its own, the baseline
 *          each slot case mutates. Every baseline must succeed before its cases mean anything; the test
 *          checks that first. Built from the kit's injectors, so no instruction's own path is needed.
 * Version: 0.0.2
 * Sprint:  04 (lane F). Lanes C and D's bodies decide whether the settlement baselines succeed; the
 *          integration run is where they are checked. The scaffold of Sprints 14–15 (2026-10-13) spreads in
 *          its five baselines (slot-matrix-fixtures-14-15.ts).
 */
import {
  generateKeyPairSigner,
  getProgramDerivedAddress,
  getAddressEncoder,
  lamports,
  type Address,
  type Instruction,
} from "@solana/kit";

import * as I from "./instructions";
import * as S from "./instructions-settlement";
import { injectCampaign, injectEntry, injectReviewed, injectSettling, type InjectedCampaign } from "./campaigns";
import { DEFAULT_PARAMS, initConfig, newId, setTeam } from "./flows";
import { joinWorld } from "./join-campaign-support";
import { encode, layoutSize } from "./layouts";
import { settleSplit } from "./money-model";
import { JOIN } from "./structs";
import { BASELINES_14_15 } from "./slot-matrix-fixtures-14-15";
import { openArgs, openingWorld } from "./opening";
import * as P from "./program";
import { resolveIx, resolveWorld, supplyCampaign } from "./resolve-support";
import { createWorld, expectOk, fundedWallet, now, send, type World } from "./setup";

export type Baseline = { w: World; ix: Instruction };
const configWorld = async () => {
  const w = await createWorld();
  const { admin, feeRecipient } = await initConfig(w);
  return { w, admin, feeRecipient };
};

/** A campaign to inject: a price kind (no reader runs), a fresh creator, times around the clock. */
async function base(w: World, over: Partial<InjectedCampaign> = {}): Promise<InjectedCampaign> {
  const t = now(w.client);
  return {
    id: newId(),
    kind: P.ReaderKind.PriceTouch,
    metric: (await generateKeyPairSigner()).address,
    target: 1n,
    creator: (await fundedWallet(w)).address,
    opensAt: t - P.DAY,
    entriesCloseAt: t + P.DAY,
    deadlineAt: t + 2n * P.DAY,
    poolYes: 2n * P.SOL,
    poolNo: P.SOL,
    // A YES price campaign needs its proof time (`resolve_campaign` records it); other kinds ignore it.
    extra: { publish_time: t },
    ...over,
  };
}

/** A settling campaign whose vault holds its pools; `snapshot` sets the fields the payouts read. */
async function settling(w: World, snapshot: Parameters<typeof injectSettling>[3], over = {}) {
  const c = await base(w, over);
  const { campaign, vault } = await injectSettling(w.client, c, P.Outcome.Yes, snapshot);
  return { campaign, vault, creator: c.creator as Address };
}

const SOL = P.SOL;
// The snapshot of a Split pot of 2 SOL on YES and 1 SOL on NO, computed by the reference model with the
// fee (10%) and the creator's share (1%) of the campaign, so the vault holds what the books owe.
const SPLIT = settleSplit({ winning: 2n * SOL, losing: SOL, prize: 0n, feeBps: 1_000n, creatorBps: 100n });
const SNAPSHOT = {
  settle_mode: 1, // Split
  winning_total: 2n * SOL,
  losing_total: SOL,
  distributable: SPLIT.distributable,
  fee_total: SPLIT.fee,
  creator_share: SPLIT.creatorFromPot + SPLIT.creatorFromFee,
  creator_share_from_fee: SPLIT.creatorFromFee,
  prize_lamports: 0n,
};

export const BASELINES: Record<string, () => Promise<Baseline>> = {
  TallyLateJoins: async () => {
    const { w } = await configWorld();
    const baker = await fundedWallet(w);
    const { campaign } = await injectReviewed(
      w.client,
      await base(w, { poolYes: SOL, poolNo: 0n, extra: { publish_time: now(w.client), entries_untallied: 1 } }),
      P.Outcome.Yes,
      now(w.client) + P.HOUR * 6n,
    );
    const entry = await injectEntry(w.client, { campaign, baker: baker.address, amountYes: SOL, joinCount: 1 });
    // The baker's one Join, written at its PDA (tag 5, layout 1) as the join instruction creates it.
    const join = await P.joinPda(campaign, baker.address, 0);
    const [, bump] = await getProgramDerivedAddress({
      programAddress: P.PROGRAM_ID,
      seeds: [
        new TextEncoder().encode("join"),
        getAddressEncoder().encode(campaign),
        getAddressEncoder().encode(baker.address),
        new Uint8Array(4),
      ],
    });
    const data = encode(JOIN, {
      tag: 5, // AccountTag::Join (the kit's AccountTag predates the tag)
      version: 1,
      bump,
      side: 0,
      campaign,
      baker: baker.address,
      index: 0,
      joined_at: now(w.client) - 60n,
      amount: SOL,
      _reserved: new Uint8Array(8),
    });
    w.client.svm.setAccount({
      address: join,
      data,
      executable: false,
      lamports: lamports(w.client.svm.minimumBalanceForRentExemption(BigInt(layoutSize(JOIN)))),
      programAddress: P.PROGRAM_ID,
      space: BigInt(data.length),
    });
    return { w, ix: S.tallyLateJoinsIx(baker.address, campaign, entry, [join]) };
  },
  AdminInitializeConfig: async () => {
    const w = await createWorld();
    const admin = await fundedWallet(w);
    const feeRecipient = await fundedWallet(w, 1n);
    const ix = await I.initializeConfigIx({
      authority: w.upgradeAuthority,
      admin: admin.address,
      feeRecipient: feeRecipient.address,
      params: DEFAULT_PARAMS,
    });
    return { w, ix };
  },
  AdminSetTeam: async () => {
    const { w, admin } = await configWorld();
    const team = await Promise.all([fundedWallet(w), fundedWallet(w)]);
    return {
      w,
      ix: await I.setTeamIx(
        admin,
        team.map((t) => t.address),
      ),
    };
  },
  AdminSetCreationParams: async () => {
    const { w, admin } = await configWorld();
    return { w, ix: await I.setCreationParamsIx(admin, DEFAULT_PARAMS) };
  },
  AdminSetFeeRecipient: async () => {
    const { w, admin } = await configWorld();
    return { w, ix: await I.setFeeRecipientIx(admin, (await fundedWallet(w)).address) };
  },
  AdminTransferAdmin: async () => {
    const { w, admin } = await configWorld();
    return { w, ix: await I.transferAdminIx(admin, (await fundedWallet(w)).address) };
  },
  AdminAcceptAdmin: async () => {
    const { w, admin } = await configWorld();
    const next = await fundedWallet(w);
    expectOk(await send(w, [await I.transferAdminIx(admin, next.address)]));
    return { w, ix: await I.acceptAdminIx(next) };
  },
  TeamPauseEntries: async () => {
    const { w, admin } = await configWorld();
    const [team] = await setTeam(w, admin, 1);
    return { w, ix: await I.pauseEntriesIx(team) };
  },
  AdminResumeEntries: async () => {
    const { w, admin } = await configWorld();
    const [team] = await setTeam(w, admin, 1);
    expectOk(await send(w, [await I.pauseEntriesIx(team)]));
    return { w, ix: await I.resumeEntriesIx(admin) };
  },
  UserOpenCampaign: async () => {
    const w = await openingWorld();
    return { w, ix: await I.openCampaignIx(w.creator, openArgs(w)) };
  },
  UserJoinCampaign: async () => {
    const { w, campaign, metric } = await joinWorld();
    const baker = await fundedWallet(w);
    return { w, ix: await I.joinCampaignIx(baker, campaign, metric, { side: P.Side.Yes, amount: SOL }) };
  },
  ResolveCampaign: async () => {
    const w = await resolveWorld();
    return { w, ix: resolveIx(await supplyCampaign(w, 5n, 10n)) };
  },
  TeamConfirmResult: async () => {
    const { w, admin } = await configWorld();
    const [team] = await setTeam(w, admin, 1);
    const { campaign } = await injectReviewed(w.client, await base(w), P.Outcome.Yes, now(w.client) + P.HOUR * 6n);
    return { w, ix: S.teamConfirmResultIx(team, await P.configPda(), campaign) };
  },
  TeamVoidCampaign: async () => {
    const { w, admin } = await configWorld();
    const [team] = await setTeam(w, admin, 1);
    // A team key voids only an automatic void (decision of 2026-10-09): the baseline is one.
    const { campaign } = await injectReviewed(
      w.client,
      await base(w, { extra: { publish_time: now(w.client), void_reason: P.VoidReason.StaleFeed } }),
      P.Outcome.Void,
      now(w.client) + P.HOUR * 6n,
    );
    const args = { reason: P.VoidReason.TeamHouseFailure, noteHash: new Uint8Array(32) };
    return { w, ix: S.teamVoidCampaignIx(team, await P.configPda(), campaign, args) };
  },
  TeamOpenContest: async () => {
    const { w, admin } = await configWorld();
    const [team] = await setTeam(w, admin, 1);
    const { campaign } = await injectReviewed(w.client, await base(w), P.Outcome.Yes, now(w.client) + P.HOUR * 6n);
    return { w, ix: S.teamOpenContestIx(team, await P.configPda(), campaign) };
  },
  FinalizeCampaign: async () => {
    const { w } = await configWorld();
    const { campaign } = await injectReviewed(w.client, await base(w), P.Outcome.Yes, now(w.client) - 1n);
    return { w, ix: S.finalizeCampaignIx(campaign, await P.configPda()) };
  },
  SettleEntry: async () => {
    const { w } = await configWorld();
    const baker = await fundedWallet(w);
    // One open entry: the one being settled.
    const { campaign, vault } = await settling(w, SNAPSHOT, { extra: { entries_open: 1 } });
    await injectEntry(w.client, { campaign, baker: baker.address, amountYes: 2n * SOL });
    return { w, ix: S.settleEntryIx(await P.entryPda(campaign, baker.address), campaign, vault, baker.address) };
  },
  SettleCreatorShare: async () => {
    const { w } = await configWorld();
    const { campaign, vault, creator } = await settling(w, SNAPSHOT);
    return { w, ix: S.settleCreatorShareIx(campaign, vault, creator) };
  },
  CollectFee: async () => {
    const { w } = await configWorld();
    const { campaign, vault } = await settling(w, SNAPSHOT);
    return { w, ix: S.collectFeeIx(campaign, vault, await P.feeVaultPda()) };
  },
  SettlePrize: async () => {
    const { w } = await configWorld();
    // A one-sided pot returns the prize to whoever opened (a Split leaves it in the distributable).
    const { campaign, vault, creator } = await settling(w, {
      ...SNAPSHOT,
      settle_mode: 2,
      distributable: 0n,
      fee_total: 0n,
      creator_share: 0n,
      opening_fee_lamports: SOL / 10n,
    });
    return { w, ix: S.settlePrizeIx(campaign, vault, creator) };
  },
  CloseCampaign: async () => {
    const { w } = await configWorld();
    const c = await base(w, { poolYes: 0n, poolNo: 0n });
    const { campaign, vault } = await injectCampaign(w.client, {
      ...c,
      status: P.Status.Settled,
      extra: { rent_payer: c.creator, fee_collected: 1, prize_settled: 1, creator_share_settled: 1 },
    });
    return { w, ix: S.closeCampaignIx(campaign, vault, c.creator as Address, await P.feeVaultPda()) };
  },
  SweepFees: async () => {
    const { w, feeRecipient } = await configWorld();
    const feeVault = await P.feeVaultPda();
    w.client.svm.airdrop(feeVault, lamports(2n * SOL));
    return { w, ix: S.sweepFeesIx(await P.configPda(), feeVault, feeRecipient.address) };
  },
  ...BASELINES_14_15,
};
