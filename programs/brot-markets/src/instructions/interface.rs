//! Purpose: the program's interface for the Shank IDL (T9): the `BrotInstruction` enum, with each
//!          instruction's accounts in order and its arguments.
//! Version: 0.0.2
//! Sprint: 04 (contract freeze: the ten settlement instructions appended; moved out of `mod.rs`); the
//!         scaffold of Sprints 14–15 (2026-10-13) appends five (22 to 26), stubs until their lanes
//!
//! One enum, so one file: Shank reads a single definition, and splitting it would split the IDL.
//! It is longer than the 200-line guide on purpose; the variants are documentation and layout.

use shank::ShankInstruction;

use super::{
    admin::{
        initialize_config::InitializeConfigArgs, set_fee_recipient::SetFeeRecipientArgs,
        set_team::SetTeamArgs, transfer_admin::TransferAdminArgs,
    },
    campaigns::open_campaign::OpenCampaignArgs,
    entries::{join_campaign::JoinCampaignArgs, sponsor_join_campaign::SponsorJoinArgs},
    referral::link_referrer::LinkReferrerArgs,
    resolution::{
        admin_decide_contest::DecideContestArgs, team_open_contest::TeamOpenContestArgs,
        team_void_campaign::TeamVoidCampaignArgs,
    },
};
use crate::state::config::CreationParams;

#[derive(ShankInstruction)]
#[rustfmt::skip]
pub enum BrotInstruction {
    /// Creates `GlobalConfig` and the fee vault, once. Only the program's upgrade authority.
    #[account(0, writable, signer, name = "authority", desc = "The program's upgrade authority; pays both rents")]
    #[account(1, writable, name = "config", desc = "GlobalConfig, PDA [\"config\"], created")]
    #[account(2, writable, name = "fee_vault", desc = "Fee vault, PDA [\"fee_vault\"], created with no data")]
    #[account(3, name = "program_data", desc = "This program's ProgramData account")]
    #[account(4, name = "system_program", desc = "System Program")]
    #[account(5, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(6, name = "program", desc = "This program")]
    AdminInitializeConfig(InitializeConfigArgs),

    /// Sets up to five team keys.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminSetTeam(SetTeamArgs),

    /// Changes the creation parameters, each under its ceiling, for future campaigns only.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminSetCreationParams(CreationParams),

    /// Sets where `sweep_fees` sends the fee vault.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminSetFeeRecipient(SetFeeRecipientArgs),

    /// First step of an admin change: names the pending admin (zero cancels).
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminTransferAdmin(TransferAdminArgs),

    /// Second step: the pending admin accepts.
    #[account(0, signer, name = "new_admin", desc = "GlobalConfig.pending_admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminAcceptAdmin,

    /// Pauses entries and openings: `Normal` to `EntriesHalted` only. Never blocks payouts.
    #[account(0, signer, name = "team_member", desc = "A key in GlobalConfig.team")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    TeamPauseEntries,

    /// Resumes entries: `EntriesHalted` to `Normal`.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminResumeEntries,

    /// Opens a campaign: the ten checks of TP section 3.4.10, then the campaign, its vault and
    /// the opening payment into the vault. `DbcGraduated` reads one more account, after the nine
    /// listed: the pool's `PoolConfig`, read only.
    #[account(0, writable, signer, name = "creator", desc = "Any wallet, or a team key; pays the opening and both rents")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, writable, name = "campaign", desc = "Campaign, PDA [\"campaign\", id], created")]
    #[account(3, writable, name = "vault", desc = "Vault, PDA [\"vault\", campaign], created with no data")]
    #[account(4, name = "metric_account", desc = "The account the reader reads (price: the sponsored account of feed_id)")]
    #[account(5, name = "sol_usd_price", desc = "The sponsored SOL/USD account; read only when the opening pays")]
    #[account(6, name = "system_program", desc = "System Program")]
    #[account(7, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(8, name = "program", desc = "This program")]
    UserOpenCampaign(OpenCampaignArgs),

    /// Joins a campaign: the entry moves from the baker's wallet into the vault.
    #[account(0, writable, signer, name = "baker", desc = "The joining wallet; pays the entry and the Entry rent")]
    #[account(1, name = "config", desc = "GlobalConfig: the pause and the minimum")]
    #[account(2, writable, name = "campaign", desc = "Campaign")]
    #[account(3, writable, name = "vault", desc = "The campaign's vault")]
    #[account(4, writable, name = "entry", desc = "Entry, PDA [\"entry\", campaign, baker], created on the first join")]
    #[account(5, name = "metric_account", desc = "Campaign.metric_account, read by the join lock")]
    #[account(6, writable, name = "join", desc = "Join, PDA [\"join\", campaign, baker, index], created: one per join")]
    #[account(7, name = "system_program", desc = "System Program")]
    #[account(8, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(9, name = "program", desc = "This program")]
    UserJoinCampaign(JoinCampaignArgs),

    /// Records the outcome the reader reads and opens the review window. Any wallet, top level
    /// only; it chooses nothing (Q1). For a price campaign the proof slot offers a YES proof.
    #[account(0, writable, name = "campaign", desc = "Campaign, Open")]
    #[account(1, name = "metric_account", desc = "Campaign.metric_account")]
    #[account(2, name = "proof_account", desc = "Price kind: the YES proof, any Full account of the feed; other kinds: not read")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    ResolveCampaign,

    /// Ends the review window now and runs the snapshot. A team key, inside the window only, and
    /// it never inverts the outcome (lane A).
    #[account(0, signer, name = "team_member", desc = "A key in GlobalConfig.team")]
    #[account(1, writable, name = "config", desc = "GlobalConfig: the open count, for a paid campaign")]
    #[account(2, writable, name = "campaign", desc = "Campaign, InReview")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    TeamConfirmResult,

    /// Voids the campaign with a reason and a note hash, inside the window. A team key may choose
    /// only the reasons of its class (lane A).
    #[account(0, signer, name = "team_member", desc = "A key in GlobalConfig.team")]
    #[account(1, writable, name = "config", desc = "GlobalConfig: the open count, for a paid campaign")]
    #[account(2, writable, name = "campaign", desc = "Campaign, InReview")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    TeamVoidCampaign(TeamVoidCampaignArgs),

    /// The act is the signed byte `stage`, never the stored status. Stage 1: enters Contested inside
    /// the window, once every entry is tallied: payout paused, stage 1 lasts 24 hours; on a campaign
    /// already Contested it is refused (ContestAlreadyOpen), so a retried opening never escalates.
    /// Stage 2: sends a contest still at stage 1, before its deadline, to the admin for 48 hours (the
    /// escalation, D2); NotContested on any other campaign. A contest leaves by reread_campaign (the
    /// same reading pays from stage 1's deadline on, a different one opens stage 2),
    /// admin_decide_contest (stage 2) or finalize_campaign (the lapse).
    #[account(0, signer, name = "team_member", desc = "A key in GlobalConfig.team")]
    #[account(1, name = "config", desc = "GlobalConfig, read")]
    #[account(2, writable, name = "campaign", desc = "Campaign: InReview for stage 1; Contested at stage 1 for stage 2")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    TeamOpenContest(TeamOpenContestArgs),

    /// Snapshots the totals, the mode and the creator share of a reviewed campaign, once the window
    /// has closed, or of a contested one once its contest lapsed (stage 2's deadline, or 48 hours
    /// after an unread stage 1's). Any wallet. Decrements the open count for a paid campaign only (I7).
    #[account(0, writable, name = "campaign", desc = "Campaign, InReview with its window closed, or Contested and lapsed")]
    #[account(1, writable, name = "config", desc = "GlobalConfig: the open count")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    FinalizeCampaign,

    /// Pays one entry from the vault to its stored baker, and closes the Entry with its rent back to
    /// the baker. A losing entry goes through the same instruction with zero. Any wallet.
    #[account(0, writable, name = "entry", desc = "Entry, closed")]
    #[account(1, writable, name = "campaign", desc = "Campaign, Settling")]
    #[account(2, writable, name = "vault", desc = "The campaign's vault")]
    #[account(3, writable, name = "baker", desc = "The Entry's stored baker")]
    #[account(4, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(5, name = "program", desc = "This program")]
    SettleEntry,

    /// Pays the creator's share once, to the stored creator only (I13). Any wallet.
    #[account(0, writable, name = "campaign", desc = "Campaign, Settling")]
    #[account(1, writable, name = "vault", desc = "The campaign's vault")]
    #[account(2, writable, name = "creator", desc = "The stored creator")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    SettleCreatorShare,

    /// Moves what Brot keeps to the fee vault. Any wallet.
    #[account(0, writable, name = "campaign", desc = "Campaign")]
    #[account(1, writable, name = "vault", desc = "The campaign's vault")]
    #[account(2, writable, name = "fee_vault", desc = "The fee vault")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    CollectFee,

    /// Returns the prize to whoever opened (and the opening fee on a house-failure void). Any wallet.
    #[account(0, writable, name = "campaign", desc = "Campaign")]
    #[account(1, writable, name = "vault", desc = "The campaign's vault")]
    #[account(2, writable, name = "recipient", desc = "The stored creator, who opened")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    SettlePrize,

    /// Closes the campaign once its fee, prize and creator share are settled: dust and surplus to
    /// the fee vault, the rent to rent_payer, the data zeroed. Any wallet.
    #[account(0, writable, name = "campaign", desc = "Campaign, Settled")]
    #[account(1, writable, name = "vault", desc = "The campaign's vault")]
    #[account(2, writable, name = "rent_payer", desc = "The stored rent_payer")]
    #[account(3, writable, name = "fee_vault", desc = "The fee vault")]
    #[account(4, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(5, name = "program", desc = "This program")]
    CloseCampaign,


    /// Sends the fee vault's surplus to GlobalConfig.fee_recipient, never to the vault itself. Any wallet.
    #[account(0, name = "config", desc = "GlobalConfig, read")]
    #[account(1, writable, name = "fee_vault", desc = "The fee vault")]
    #[account(2, writable, name = "fee_recipient", desc = "GlobalConfig.fee_recipient")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    SweepFees,

    /// Reads and closes a baker's Join accounts (passed after the five listed slots, in index order),
    /// adds their late amounts to the campaign and the entry, and marks the entry tallied when its last
    /// join is closed. Inside the review window, after resolve. Any wallet. Founder decision, 2026-10-09.
    #[account(0, writable, name = "campaign", desc = "Campaign, InReview, publish_time recorded")]
    #[account(1, writable, name = "entry", desc = "Entry of the baker, not yet tallied")]
    #[account(2, writable, name = "baker", desc = "The Entry's stored baker: receives the rent of the closed joins")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    TallyLateJoins,

    /// Sprint 14: the referee records, once and for good, the wallet that referred it. No instruction
    /// changes or closes a link; linking is never paused.
    #[account(0, writable, signer, name = "referee", desc = "The signing wallet; pays the rent")]
    #[account(1, writable, name = "referral_link", desc = "ReferralLink, PDA [\"referral\", referee], created")]
    #[account(2, name = "system_program", desc = "System Program")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    UserLinkReferrer(LinkReferrerArgs),

    /// Sprint 14 (lane L14B; a stub until then): in stage 1 of a contest, runs the reading again and
    /// compares it with the stored result: the same reading pays only from stage 1's deadline on
    /// (RereadBeforeTimelock), a different one opens stage 2. Any wallet, top level only.
    #[account(0, writable, name = "campaign", desc = "Campaign, Contested, stage 1")]
    #[account(1, writable, name = "config", desc = "GlobalConfig: the open count")]
    #[account(2, name = "metric_account", desc = "Campaign.metric_account")]
    #[account(3, name = "proof_account", desc = "Price kind: a proof, any Full account of the feed; other kinds: not read")]
    #[account(4, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(5, name = "program", desc = "This program")]
    RereadCampaign,

    /// Sprint 14 (lane L14B; a stub until then): in stage 2 of a contest, before its deadline, the
    /// admin confirms the stored result or voids the campaign; never inverts it.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig: the open count")]
    #[account(2, writable, name = "campaign", desc = "Campaign, Contested, stage 2")]
    #[account(3, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(4, name = "program", desc = "This program")]
    AdminDecideContest(DecideContestArgs),

    /// Sprint 15 (lane L15; a stub until then): a sealed entry, priced in US$ at the SOL/USD price;
    /// the entry joins the pot, the fee is held in the sponsor's SealedFee.
    #[account(0, writable, signer, name = "sponsor", desc = "The joining wallet; pays the entry, the fee and the rents")]
    #[account(1, name = "config", desc = "GlobalConfig: the pause, the minimum and the price rules")]
    #[account(2, writable, name = "campaign", desc = "Campaign")]
    #[account(3, writable, name = "vault", desc = "The campaign's vault")]
    #[account(4, writable, name = "entry", desc = "Entry, PDA [\"entry\", campaign, sponsor], created on the first join")]
    #[account(5, name = "metric_account", desc = "Campaign.metric_account, read by the join lock")]
    #[account(6, writable, name = "join", desc = "Join, PDA [\"join\", campaign, sponsor, index], created: one per join")]
    #[account(7, name = "sol_usd_price", desc = "The sponsored SOL/USD account of SOL_USD_FEED_ID")]
    #[account(8, writable, name = "sealed_fee", desc = "SealedFee, PDA [\"sealed\", campaign, sponsor], created on the first sealed entry, then topped up")]
    #[account(9, name = "system_program", desc = "System Program")]
    #[account(10, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(11, name = "program", desc = "This program")]
    SponsorJoinCampaign(SponsorJoinArgs),

    /// Sprint 15 (lane L15; a stub until then): once the campaign is finalized, the held fee goes to
    /// the sponsor (a house-failure refund) or to the fee vault, and the SealedFee is closed. Any wallet.
    #[account(0, writable, name = "sealed_fee", desc = "SealedFee, closed")]
    #[account(1, writable, name = "campaign", desc = "Campaign, Settling or Settled: sealed_fees_open decremented")]
    #[account(2, writable, name = "sponsor", desc = "SealedFee.sponsor: receives the refund and the rent")]
    #[account(3, writable, name = "fee_vault", desc = "The fee vault, PDA [\"fee_vault\"]")]
    #[account(4, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(5, name = "program", desc = "This program")]
    SettleSealedFee,
}
