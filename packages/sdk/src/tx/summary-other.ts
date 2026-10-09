/**
 * Purpose: what the summary says for the instructions that move no money out of a signer's wallet (the
 *          admin, team and settlement instructions), and the exact data size of every instruction, so a
 *          summary never describes bytes the program would refuse as `BadInstructionData`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import * as G from "../idl/generated/instructions";
import { BrotMarketsInstruction as B } from "../idl/generated/programs";

/** Each instruction's data size, discriminator included, from the generated decoders. */
export const DATA_SIZE: Record<B, number> = {
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
};

type Slots = Record<string, { address: string }>;

/** One line for an instruction that takes nothing from the signer's wallet but the network fee. */
export function describeOther(type: B, a: Slots): string {
  const campaign = a.campaign?.address;
  switch (type) {
    case B.AdminInitializeConfig:
      return "Initialise the program's config and fee vault (the upgrade authority pays both rents)";
    case B.AdminSetTeam:
      return "Set the team keys";
    case B.AdminSetCreationParams:
      return "Change the creation parameters for future campaigns";
    case B.AdminSetFeeRecipient:
      return "Change where the fee vault is swept";
    case B.AdminTransferAdmin:
      return "Name a pending admin";
    case B.AdminAcceptAdmin:
      return "Accept the admin role";
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
    default:
      return `Brot Markets instruction ${B[type]}`;
  }
}
