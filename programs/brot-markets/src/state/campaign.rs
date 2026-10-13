//! Purpose: `Campaign` (`["campaign", id]`): everything about one campaign, and the loaders that
//!          check it. Its vault (`["vault", campaign]`) is data-less and its bump lives here.
//! Version: 0.0.4
//! Sprint: 02 (pot core on Pinocchio); `epoch` taken from the reserve in 03; settlement fields in 04 (lane C);
//!         `sealed_fees_open` takes the last of the reserve (scaffold of Sprints 14–15, 2026-10-13)
//!
//! Balances are bookkept in fields, never read from the vault, where anyone can send lamports
//! (I15). `resolve_campaign` writes the result group (03); the settlement group is Sprint 04's.

use shank::ShankAccount;

use crate::{
    layout::{LeI128, LeI32, LeI64, LeU16, LeU32, LeU64, Pubkey},
    state::{AccountState, AccountTag},
    zero_copy,
};

mod loaders;

#[derive(ShankAccount)]
#[repr(C)]
pub struct Campaign {
    pub tag: u8,
    pub version: u8,
    pub bump: u8,
    pub vault_bump: u8,
    #[idl_type("ReaderKind")]
    pub kind: u8,
    /// Price kind only.
    #[idl_type("Direction")]
    pub direction: u8,
    #[idl_type("Status")]
    pub status: u8,
    #[idl_type("Outcome")]
    pub outcome: u8,
    #[idl_type("SettleMode")]
    pub settle_mode: u8,
    #[idl_type("VoidReason")]
    pub void_reason: u8,
    #[idl_type("ContestStage")]
    pub contest_stage: u8,
    /// A team key opened it: no creator share (P-3, I12).
    #[idl_type("bool")]
    pub creator_is_team: u8,
    #[idl_type("bool")]
    pub met_late: u8,
    #[idl_type("bool")]
    pub creator_share_settled: u8,
    #[idl_type("bool")]
    pub fee_collected: u8,
    #[idl_type("bool")]
    pub prize_settled: u8,
    /// Drawn at random by the client and saved before signing: the retry guard (T17).
    #[idl_type("u64")]
    pub id: LeU64,
    pub creator: Pubkey,
    /// Paid the rent of the campaign and its vault; gets it back at close (I14).
    pub rent_payer: Pubkey,
    /// The sentence template the site renders (D-j).
    #[idl_type("u16")]
    pub template_version: LeU16,
    /// Copied from the config at opening, or 0 when a team key opened (P-3).
    #[idl_type("u16")]
    pub creator_share_bps: LeU16,
    /// Copied from the config at opening; never change.
    #[idl_type("u16")]
    pub fee_bps: LeU16,
    #[idl_type("u16")]
    pub one_sided_fee_bps: LeU16,
    // --- Reading ------------------------------------------------------------------------------
    /// Price kind only: the Pyth feed id.
    pub feed_id: [u8; 32],
    /// The account the reader reads, locked at opening (for price, the sponsored account).
    pub metric_account: Pubkey,
    /// The number the reading is compared with, in the account's own units.
    #[idl_type("i128")]
    pub target: LeI128,
    /// Price kind only: the feed's exponent at opening.
    #[idl_type("i32")]
    pub price_exponent: LeI32,
    /// Price kind only: the join-time price age, copied from the config (never below 30 s).
    #[idl_type("u32")]
    pub max_age: LeU32,
    // --- Time (Unix seconds) --------------------------------------------------------------------
    #[idl_type("i64")]
    pub opens_at: LeI64,
    #[idl_type("i64")]
    pub entries_close_at: LeI64,
    #[idl_type("i64")]
    pub deadline_at: LeI64,
    // --- Opening (zero for a team opening that adds no prize) ----------------------------------
    #[idl_type("u64")]
    pub opening_usd: LeU64,
    #[idl_type("u64")]
    pub opening_paid_lamports: LeU64,
    /// The SOL/USD price the opening was charged at: price, exponent, publish time.
    #[idl_type("i64")]
    pub opening_price: LeI64,
    #[idl_type("i32")]
    pub opening_price_exponent: LeI32,
    #[idl_type("i64")]
    pub opening_price_publish_time: LeI64,
    #[idl_type("u64")]
    pub prize_lamports: LeU64,
    /// Brot's 10%, held in the vault until the outcome (T23).
    #[idl_type("u64")]
    pub opening_fee_lamports: LeU64,
    // --- Pot (bookkept) ------------------------------------------------------------------------
    #[idl_type("u64")]
    pub pool_yes: LeU64,
    #[idl_type("u64")]
    pub pool_no: LeU64,
    /// The wallet whose entry landed in an empty pot; zero until then (Q3).
    pub first_baker: Pubkey,
    /// `Entry` accounts not yet settled.
    #[idl_type("u32")]
    pub entries_open: LeU32,
    /// Events emitted for this campaign so far: the next event's `seq` (X0.4).
    #[idl_type("u64")]
    pub event_seq: LeU64,
    // --- Result (Sprint 03) ----------------------------------------------------------------------
    #[idl_type("i128")]
    pub observed_value: LeI128,
    #[idl_type("i64")]
    pub resolved_at: LeI64,
    #[idl_type("i64")]
    pub review_ends_at: LeI64,
    #[idl_type("i64")]
    pub contest_ends_at: LeI64,
    pub void_note_hash: [u8; 32],
    // --- Settlement snapshot (Sprint 04) ------------------------------------------------------
    #[idl_type("u64")]
    pub winning_total: LeU64,
    #[idl_type("u64")]
    pub losing_total: LeU64,
    #[idl_type("u64")]
    pub distributable: LeU64,
    #[idl_type("u64")]
    pub fee_total: LeU64,
    #[idl_type("u64")]
    pub creator_share: LeU64,
    #[idl_type("u64")]
    pub creator_share_from_fee: LeU64,
    #[idl_type("u64")]
    pub paid_out_total: LeU64,
    /// Epoch kinds only (Sprint 03): the epoch whose stake or pool snapshot is read; else zero.
    #[idl_type("u64")]
    pub epoch: LeU64,
    /// The minimum entry this campaign opened with, copied from the config (question 5, 2026-10-09).
    #[idl_type("u64")]
    pub min_entry_lamports: LeU64,
    /// The YES proof's publish time, written by `resolve_campaign` (0 until then); the late refund compares
    /// each join with it (amendment 2026-10-09, founder decisions 1 and 2).
    #[idl_type("i64")]
    pub publish_time: LeI64,
    /// The late totals of each side, summed by `tally_late_joins`, and the entries not tallied yet: the
    /// snapshot refuses to finalize while `entries_untallied` is not zero (`NotTallied`).
    #[idl_type("u64")]
    pub late_yes: LeU64,
    #[idl_type("u64")]
    pub late_no: LeU64,
    #[idl_type("u32")]
    pub entries_untallied: LeU32,
    /// Lane C (settlement): the one-sided fees taken per entry at settlement, summed for `collect_fee`.
    #[idl_type("u64")]
    pub one_sided_fees: LeU64,
    /// Lane C: the creator share credited to an empty wallet below rent, held in the vault until the
    /// creator claims it (`settle_creator_share`); zero when nothing is reserved.
    #[idl_type("u64")]
    pub creator_share_reserved: LeU64,
    /// Sprint 15: `SealedFee` accounts of this campaign not yet settled; `close_campaign` waits for zero.
    /// Taken from the reserve, so the size stays 512 and old accounts read zero.
    #[idl_type("u32")]
    pub sealed_fees_open: LeU32,
}

zero_copy!(Campaign = 512);
// `stored_id` reads the id at this offset before the full checks run.
const _: () = assert!(core::mem::offset_of!(Campaign, id) == 16);

impl AccountState for Campaign {
    const TAG: AccountTag = AccountTag::Campaign;

    fn bump(&self) -> u8 {
        self.bump
    }
}
