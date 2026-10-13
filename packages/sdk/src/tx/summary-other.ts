/**
 * Purpose: what the summary says for the instructions that move no money out of a signer's wallet (the
 *          admin, team and settlement instructions), each with the values it signs: the new admin, the fee
 *          recipient, the team keys, every creation parameter. Also the exact data size of every instruction,
 *          so a summary never describes bytes the program would refuse as `BadInstructionData`.
 * Version: 0.1.4 (no size, so never trusted, for the scaffold's stubs until their lanes; the sealed entry's two
 *          instructions sized, lane L15)
 * Sprint:  05 (SDK); the scaffold of Sprints 14–15 (2026-10-13); 15 (lane L15)
 */
import * as G from "../idl/generated/instructions";
import { BrotMarketsInstruction as B } from "../idl/generated/programs";
import { bytesToHex, type Bytes } from "../read/bytes";
import { formatBps, formatSol } from "../read/format";

/**
 * Each instruction's data size, discriminator included, from the generated decoders. The scaffold's stubs of Sprints
 * 14–15 have none until their lanes write their summary, so the summary never trusts them.
 */
export const DATA_SIZE: Partial<Record<B, number>> = {
  [B.AdminInitializeConfig]: G.getAdminInitializeConfigInstructionDataDecoder().fixedSize,
  [B.AdminSetTeam]: G.getAdminSetTeamInstructionDataDecoder().fixedSize,
  [B.AdminSetCreationParams]: G.getAdminSetCreationParamsInstructionDataDecoder().fixedSize,
  [B.AdminSetFeeRecipient]: G.getAdminSetFeeRecipientInstructionDataDecoder().fixedSize,
  [B.AdminTransferAdmin]: G.getAdminTransferAdminInstructionDataDecoder().fixedSize,
  [B.AdminAcceptAdmin]: G.getAdminAcceptAdminInstructionDataDecoder().fixedSize,
  [B.TeamPauseEntries]: G.getTeamPauseEntriesInstructionDataDecoder().fixedSize,
  [B.AdminResumeEntries]: G.getAdminResumeEntriesInstructionDataDecoder().fixedSize,
  [B.UserOpenCampaign]: G.getUserOpenCampaignInstructionDataDecoder().fixedSize,
  [B.UserJoinCampaign]: G.getUserJoinCampaignInstructionDataDecoder().fixedSize,
  [B.ResolveCampaign]: G.getResolveCampaignInstructionDataDecoder().fixedSize,
  [B.TeamConfirmResult]: G.getTeamConfirmResultInstructionDataDecoder().fixedSize,
  [B.TeamVoidCampaign]: G.getTeamVoidCampaignInstructionDataDecoder().fixedSize,
  [B.TeamOpenContest]: G.getTeamOpenContestInstructionDataDecoder().fixedSize,
  [B.FinalizeCampaign]: G.getFinalizeCampaignInstructionDataDecoder().fixedSize,
  [B.SettleEntry]: G.getSettleEntryInstructionDataDecoder().fixedSize,
  [B.SettleCreatorShare]: G.getSettleCreatorShareInstructionDataDecoder().fixedSize,
  [B.CollectFee]: G.getCollectFeeInstructionDataDecoder().fixedSize,
  [B.SettlePrize]: G.getSettlePrizeInstructionDataDecoder().fixedSize,
  [B.CloseCampaign]: G.getCloseCampaignInstructionDataDecoder().fixedSize,
  [B.SweepFees]: G.getSweepFeesInstructionDataDecoder().fixedSize,
  [B.TallyLateJoins]: G.getTallyLateJoinsInstructionDataDecoder().fixedSize,
  // Lane L15 (Sprint 15): the sealed entry (said by ./summary-sealed.ts) and its fee's settlement.
  [B.SponsorJoinCampaign]: G.getSponsorJoinCampaignInstructionDataDecoder().fixedSize,
  [B.SettleSealedFee]: G.getSettleSealedFeeInstructionDataDecoder().fixedSize,
};

type Slots = Record<string, { address: string }>;
type Params = {
  openingFeeUsd: bigint;
  openingPrizeBps: number;
  feeBps: number;
  oneSidedFeeBps: number;
  creatorShareBps: number;
  maxOpenCampaigns: number;
  minEntryLamports: bigint;
  solUsdFeedId: Bytes;
  maxPriceAge: number;
  maxPriceConfBps: number;
  campaignMaxAge: number;
};

/** Every creation parameter, in words. */
export function paramsText(p: Params): string {
  return [
    `paid openings US$${p.openingFeeUsd}, ${formatBps(p.openingPrizeBps)} of the payment as prize`,
    `Brot's fee ${formatBps(p.feeBps)} of the losing side`,
    `a one-sided pot's fee ${formatBps(p.oneSidedFeeBps)}`,
    `the creator's share ${formatBps(p.creatorShareBps)} of the entries`,
    `at most ${p.maxOpenCampaigns} open campaigns`,
    `entries from ${formatSol(p.minEntryLamports)} SOL`,
    `SOL/USD feed ${bytesToHex(p.solUsdFeedId).slice(0, 8)}…`,
    `prices at most ${p.maxPriceAge} s old, confidence within ${formatBps(p.maxPriceConfBps)}`,
    `campaign readings at most ${p.campaignMaxAge} s old`,
  ].join("; ");
}

function teamText(teamLen: number, team: readonly string[]): string {
  if (teamLen > team.length) return `${teamLen} keys, more than its ${team.length} slots (the program refuses it)`;
  const keys = team.slice(0, teamLen);
  return keys.length === 0 ? "none (then nobody can pause entries)" : keys.join(", ");
}

/** One line for an instruction that takes nothing from the signer's wallet but the network fee. */
export function describeOther(type: B, a: Slots, d: Record<string, any>): string {
  const campaign = a.campaign?.address;
  switch (type) {
    case B.AdminInitializeConfig:
      return `Initialise the program's config and fee vault: admin ${d.admin}, fee recipient ${d.feeRecipient}; ${paramsText(d.params)} (the upgrade authority pays both rents)`;
    case B.AdminSetTeam:
      return `Set the team keys to ${teamText(d.teamLen, d.team)}`;
    case B.AdminSetCreationParams:
      return `Change the creation parameters for future campaigns to: ${paramsText(d.creationParams)}`;
    case B.AdminSetFeeRecipient:
      return `Change where the fee vault is swept to ${d.feeRecipient}`;
    case B.AdminTransferAdmin:
      return `Name ${d.newAdmin} the pending admin (the role passes when that key accepts it)`;
    case B.AdminAcceptAdmin:
      return `Accept the admin role as ${a.newAdmin.address}`;
    case B.TeamPauseEntries:
      return "Pause entries and openings (payouts continue)";
    case B.AdminResumeEntries:
      return "Resume entries and openings";
    case B.ResolveCampaign:
      return `Record the outcome of campaign ${campaign} from ${a.metricAccount.address}`;
    case B.TeamConfirmResult:
      return `Confirm the result of campaign ${campaign} and end its review window`;
    case B.TeamOpenContest:
      return `Open a contest on campaign ${campaign} (refused until Sprint 14)`;
    case B.FinalizeCampaign:
      return `Finalize campaign ${campaign} after its review window`;
    case B.SettleEntry:
      return `Pay ${a.baker.address}'s entry in campaign ${campaign}`;
    case B.SettleCreatorShare:
      return `Pay the creator's share of campaign ${campaign} to ${a.creator.address}`;
    case B.CollectFee:
      return `Collect Brot's fee of campaign ${campaign}`;
    case B.SettlePrize:
      return `Return the prize of campaign ${campaign} to ${a.recipient.address}`;
    case B.CloseCampaign:
      return `Close campaign ${campaign}; its rent goes back to ${a.rentPayer.address}`;
    case B.SweepFees:
      return `Sweep the fee vault to ${a.feeRecipient.address}`;
    case B.TallyLateJoins:
      return `Tally ${a.baker.address}'s joins in campaign ${campaign}`;
    case B.SettleSealedFee:
      return `Settle ${a.sponsor.address}'s held fee on campaign ${campaign}: back to that sponsor on a void the house caused, else to Brot's fee vault; the SealedFee closes, its rent back to the sponsor`;
    default:
      return `Brot Markets instruction ${B[type]}`;
  }
}
