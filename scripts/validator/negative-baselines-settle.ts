/**
 * Purpose: the slot matrix's baselines of the review window and of settlement on the surfnet: the team's confirm,
 *          void and contest, finalize, the late-join tally, each payout, close and the sweep, each in the state the
 *          kit's injectors write (tests/brot/slot-matrix-fixtures.ts), replayed with `surfnet_setAccount`.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { getAddressEncoder, getProgramDerivedAddress, type Address } from "@solana/kit";

import { injectCampaign, injectEntry, injectReviewed, injectSettling } from "../../tests/brot/campaigns";
import * as S from "../../tests/brot/instructions-settlement";
import { encode, layoutSize } from "../../tests/brot/layouts";
import * as P from "../../tests/brot/program";
import { JOIN } from "../../tests/brot/structs";

import { funded, type Build, type Env } from "./negative-baselines";
import { base, SNAPSHOT } from "./negative-world";
import { airdrop, clock } from "./rpc";
import { SOL } from "./world";

const SIX_HOURS = 6n * P.HOUR;
const nowOf = async (env: Env) => (await clock(env.rpc)).unixTimestamp;

/** A campaign in review with `outcome`, its window open (or ended, `endsIn` negative). */
async function reviewed(env: Env, outcome: number, endsIn: bigint, extra: Record<string, unknown> = {}) {
  const c = await base(env.rpc, { extra: { publish_time: await nowOf(env), ...extra } });
  const injected = await injectReviewed(env.sw.w.client, c, outcome, (await nowOf(env)) + endsIn);
  await env.sw.flush();
  return injected.campaign;
}

/** A settling campaign whose vault holds its pools, with a snapshot. */
export async function settling(
  env: Env,
  snapshot: Parameters<typeof injectSettling>[3],
  extra: Record<string, unknown> = {},
) {
  const c = await base(env.rpc, { extra: { publish_time: await nowOf(env), ...extra } });
  const { campaign, vault } = await injectSettling(env.sw.w.client, c, P.Outcome.Yes, snapshot);
  await env.sw.flush();
  return { campaign, vault, creator: c.creator as Address };
}

/** One `Join` at its PDA, as the join instruction writes it. */
async function injectJoin(env: Env, campaign: Address, baker: Address, joinedAt: bigint) {
  const key = getAddressEncoder();
  const seeds = [new TextEncoder().encode("join"), key.encode(campaign), key.encode(baker), new Uint8Array(4)];
  const [join, bump] = await getProgramDerivedAddress({ programAddress: P.PROGRAM_ID, seeds });
  const fields = { tag: 5, version: 1, bump, side: 0, campaign, baker, index: 0, joined_at: joinedAt, amount: SOL };
  const data = encode(JOIN, { ...fields, _reserved: new Uint8Array(8) });
  const lamports = env.sw.w.client.svm.minimumBalanceForRentExemption(BigInt(layoutSize(JOIN)));
  const account = { address: join, data, executable: false, lamports, programAddress: P.PROGRAM_ID, space: 96n };
  env.sw.w.client.svm.setAccount(account as never);
  await env.sw.flush();
  return join;
}

export const SETTLE_BASELINES: [string, Build][] = [
  [
    "TeamConfirmResult",
    async (env) => ({
      ix: S.teamConfirmResultIx(env.team[0], await P.configPda(), await reviewed(env, P.Outcome.Yes, SIX_HOURS)),
    }),
  ],
  [
    "TeamVoidCampaign",
    async (env) => {
      // A team key voids only an automatic void (decision of 2026-10-09): the baseline is one.
      const campaign = await reviewed(env, P.Outcome.Void, SIX_HOURS, { void_reason: P.VoidReason.StaleFeed });
      const args = { reason: P.VoidReason.TeamHouseFailure, noteHash: new Uint8Array(32) };
      return { ix: S.teamVoidCampaignIx(env.team[0], await P.configPda(), campaign, args) };
    },
  ],
  [
    "TeamOpenContest",
    async (env) => ({
      ix: S.teamOpenContestIx(env.team[0], await P.configPda(), await reviewed(env, P.Outcome.Yes, SIX_HOURS)),
    }),
  ],
  [
    "FinalizeCampaign",
    async (env) => ({ ix: S.finalizeCampaignIx(await reviewed(env, P.Outcome.Yes, -1n), await P.configPda()) }),
  ],
  [
    "TallyLateJoins",
    async (env) => {
      const baker = await funded(env.rpc);
      const extra = { publish_time: await nowOf(env), entries_untallied: 1 };
      const c = await base(env.rpc, { poolYes: SOL, poolNo: 0n, extra });
      const { campaign } = await injectReviewed(env.sw.w.client, c, P.Outcome.Yes, (await nowOf(env)) + SIX_HOURS);
      const entry = await injectEntry(env.sw.w.client, {
        campaign,
        baker: baker.address,
        amountYes: SOL,
        joinCount: 1,
      });
      await env.sw.flush();
      const join = await injectJoin(env, campaign, baker.address, (await nowOf(env)) - 60n);
      return { ix: S.tallyLateJoinsIx(baker.address, campaign, entry, [join]) };
    },
  ],
  [
    "SettleEntry",
    async (env) => {
      const baker = await funded(env.rpc);
      const { campaign, vault } = await settling(env, SNAPSHOT, { entries_open: 1 });
      await injectEntry(env.sw.w.client, { campaign, baker: baker.address, amountYes: 2n * SOL });
      await env.sw.flush();
      return { ix: S.settleEntryIx(await P.entryPda(campaign, baker.address), campaign, vault, baker.address) };
    },
  ],
  [
    "SettleCreatorShare",
    async (env) => {
      const { campaign, vault, creator } = await settling(env, SNAPSHOT);
      return { ix: S.settleCreatorShareIx(campaign, vault, creator) };
    },
  ],
  [
    "CollectFee",
    async (env) => {
      const { campaign, vault } = await settling(env, SNAPSHOT);
      return { ix: S.collectFeeIx(campaign, vault, await P.feeVaultPda()) };
    },
  ],
  [
    "SettlePrize",
    async (env) => {
      // A one-sided pot returns the prize to whoever opened (a Split leaves it in the distributable).
      const snapshot = {
        ...SNAPSHOT,
        settle_mode: 2,
        distributable: 0n,
        fee_total: 0n,
        creator_share: 0n,
        opening_fee_lamports: SOL / 10n,
      };
      const { campaign, vault, creator } = await settling(env, snapshot);
      return { ix: S.settlePrizeIx(campaign, vault, creator) };
    },
  ],
  [
    "CloseCampaign",
    async (env) => {
      const c = await base(env.rpc, { poolYes: 0n, poolNo: 0n });
      const extra = { rent_payer: c.creator, fee_collected: 1, prize_settled: 1, creator_share_settled: 1 };
      const { campaign, vault } = await injectCampaign(env.sw.w.client, { ...c, status: P.Status.Settled, extra });
      await env.sw.flush();
      return { ix: S.closeCampaignIx(campaign, vault, c.creator as Address, await P.feeVaultPda()) };
    },
  ],
  [
    "SweepFees",
    async (env) => {
      const feeVault = await P.feeVaultPda();
      await airdrop(env.rpc, feeVault, 2n * SOL);
      return { ix: S.sweepFeesIx(await P.configPda(), feeVault, env.feeRecipient.address) };
    },
  ],
];
