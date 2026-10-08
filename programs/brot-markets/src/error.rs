//! Purpose: every refusal the program can return, one code per cause, as custom program errors.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); reader errors from 01 keep their codes
//!
//! Codes start at 6000 so they never collide with the System Program's own custom errors, which
//! a failed CPI passes through. A code, once assigned, never changes meaning. Each lane of
//! Sprint 02 appends only inside its own range, at the end of the enum.

use pinocchio::error::ProgramError;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum BrotError {
    // --- Sprints 00 and 01 -------------------------------------------------------------
    /// Arithmetic overflow, underflow or a division by zero in money or time math.
    MathOverflow = 6000,
    /// The account is not owned by the program this reader trusts.
    ReaderWrongOwner = 6001,
    /// The account data does not match the layout this reader expects.
    ReaderBadLayout = 6002,
    /// The price update was not fully verified by the Pyth receiver.
    PriceNotFullyVerified = 6003,
    /// The price update is for another feed than the one expected.
    PriceWrongFeed = 6004,

    // --- The checks module (TP section 3.4.17) -----------------------------------------
    /// An account the program treats as its own belongs to another program.
    WrongOwner = 6005,
    /// A slot that must sign did not.
    MissingSignature = 6006,
    /// A slot that must be writable was passed read-only.
    NotWritable = 6007,
    /// The account's type tag is not the one this slot expects (a zeroed account included).
    WrongTag = 6008,
    /// The account's data is not exactly the size of its type.
    WrongLength = 6009,
    /// The address is not the program-derived address its seeds and bump give.
    PdaMismatch = 6010,
    /// The System Program slot holds another account.
    WrongSystemProgram = 6011,
    /// The signer is not the program's upgrade authority.
    UpgradeAuthorityMismatch = 6012,
    /// The ProgramData account is not this program's, or records no upgrade authority.
    WrongProgramData = 6013,
    /// The account already exists; the program never re-initialises one.
    AlreadyInitialized = 6014,
    /// The same account was passed in two slots that must differ.
    DuplicateAccount = 6015,
    /// The event-authority slot is not this program's event authority.
    WrongEventAuthority = 6016,
    /// The program slot is not this program.
    WrongProgramAccount = 6017,
    /// The account's layout version is not the one this program reads.
    WrongLayoutVersion = 6018,
    /// A stored field holds a value no variant of its enum has.
    BadAccountData = 6019,

    // --- Instruction data ---------------------------------------------------------------
    /// The first byte of the instruction data names no instruction.
    UnknownInstruction = 6020,
    /// The instruction data is not exactly the size of the instruction's arguments.
    BadInstructionData = 6021,

    // --- Roles ---------------------------------------------------------------------------
    /// The signer is not the config's admin.
    NotAdmin = 6022,
    /// The signer is not one of the config's team keys.
    NotTeamMember = 6023,
    /// The signer is not the admin named by the pending transfer.
    NotPendingAdmin = 6024,
    /// No admin transfer is pending.
    NoPendingAdmin = 6025,

    // --- Config values (TP section 3.4.1) -------------------------------------------------
    /// An address that must name a key is all zeros.
    ZeroAddress = 6026,
    /// More than five team keys.
    TeamTooLarge = 6027,
    /// A team slot past `team_len` is not zero.
    TeamSlotNotEmpty = 6028,
    /// The same team key appears twice.
    DuplicateTeamKey = 6029,
    /// `opening_fee_usd` is outside its floor and ceiling.
    OpeningFeeUsdOutOfRange = 6030,
    /// `opening_prize_bps` is outside its floor and ceiling.
    OpeningPrizeBpsOutOfRange = 6031,
    /// `fee_bps` is above `MAX_FEE_BPS`.
    FeeBpsAboveCeiling = 6032,
    /// `one_sided_fee_bps` is above its ceiling.
    OneSidedFeeBpsAboveCeiling = 6033,
    /// `creator_share_bps` is above `MAX_CREATOR_SHARE_BPS`.
    CreatorShareBpsAboveCeiling = 6034,
    /// `max_open_campaigns` is outside its floor and ceiling.
    MaxOpenCampaignsOutOfRange = 6035,
    /// `min_entry_lamports` is outside its floor and ceiling.
    MinEntryOutOfRange = 6036,
    /// `sol_usd_feed_id` is all zeros.
    SolUsdFeedIdZero = 6037,
    /// `max_price_age` is outside its floor and ceiling.
    MaxPriceAgeOutOfRange = 6038,
    /// `max_price_conf_bps` is outside its floor and ceiling.
    MaxPriceConfOutOfRange = 6039,
    /// `campaign_max_age` is below 30 seconds or above its ceiling.
    CampaignMaxAgeOutOfRange = 6040,

    // --- The pause (TP section 3.4.9) -------------------------------------------------------
    /// Entries are already paused.
    AlreadyPaused = 6041,
    /// Entries are not paused.
    NotPaused = 6042,

    // --- Opening a campaign: the rows of TP section 3.4.10 ---------------------------------
    /// Row 1: the kind byte names no reader.
    UnknownReaderKind = 6043,
    /// Row 1: this kind does not open yet (the four non-price kinds until Sprint 03).
    ReaderKindNotOpen = 6044,
    /// Row 2: the metric account is not the one the campaign's parameters name.
    MetricAccountMismatch = 6045,
    /// Row 3: the target is already touched or met; the campaign would be decided at birth.
    TargetAlreadyTouched = 6046,
    /// Row 4: the price is older than the campaign's maximum age.
    PriceStale = 6047,
    /// Row 4: the confidence interval is wider than 0.5% of the price.
    PriceConfidenceTooWide = 6048,
    /// Row 4: the price is zero or negative.
    PriceNonPositive = 6049,
    /// Row 4: the direction byte is neither `Above` nor `Below`.
    InvalidDirection = 6050,
    /// Row 5: the deadline is less than three days away.
    DurationTooShort = 6051,
    /// Row 5: the deadline is more than ninety days away.
    DurationTooLong = 6052,
    /// Row 7: the opening pays less than `opening_fee_usd` (a non-team signer always pays).
    OpeningUsdBelowFee = 6053,
    /// Row 7: the opening would cost more lamports than the signed `max_lamports`.
    OpeningAboveMaxLamports = 6054,
    /// Row 7: the SOL/USD slot is not the sponsored account of `sol_usd_feed_id`.
    SolUsdAccountMismatch = 6055,
    /// Row 7: the SOL/USD price is older than `max_price_age`.
    SolUsdStale = 6056,
    /// Row 7: the SOL/USD confidence is wider than `max_price_conf_bps`.
    SolUsdConfidenceTooWide = 6057,
    /// Row 7: the SOL/USD price is zero or negative.
    SolUsdPriceNonPositive = 6058,
    /// Row 7: the SOL/USD exponent is outside the range the conversion supports.
    PriceExponentOutOfRange = 6059,
    /// Row 8: entries are paused, which also stops openings.
    OpenWhilePaused = 6060,
    /// Row 8: `open_campaigns` has reached `max_open_campaigns`.
    TooManyOpenCampaigns = 6061,

    // --- Joining a campaign -------------------------------------------------------------------
    /// The campaign is not `Open`.
    CampaignNotOpen = 6062,
    /// Entries closed at `entries_close_at`.
    EntriesClosed = 6063,
    /// Entries are paused.
    JoinWhilePaused = 6064,
    /// The entry is below `min_entry_lamports`.
    EntryBelowMinimum = 6065,
    /// The baker's entry total is not the `expected_entry_total` the client signed.
    EntryTotalMismatch = 6066,
    /// The estimated return is below the signed `min_return_bps`.
    ReturnBelowMinimum = 6067,
    /// The side byte is neither `Yes` nor `No`.
    InvalidSide = 6068,
    /// The `Entry` account belongs to another campaign or another baker.
    EntryMismatch = 6069,

    // --- Readers --------------------------------------------------------------------------------
    /// This reader method arrives in a later sprint (`outcome_knowable` and `try_resolve`: 03).
    ReaderNotReady = 6070,
    // --- Sprint 02 lane A (checks) appends below, from 6100 ---

    // --- Sprint 02 lane B (admin) appends below, from 6120 ---

    // --- Sprint 02 lane C (math) appends below, from 6140 ---

    // --- Sprint 02 lane D (opening) appends below, from 6160 ---

    // --- Sprint 02 lane E (entries) appends below, from 6180 ---

    // --- Sprint 02 lane F (tooling) appends below, from 6200 ---
}

impl From<BrotError> for ProgramError {
    fn from(error: BrotError) -> Self {
        ProgramError::Custom(error as u32)
    }
}

impl From<BrotError> for u32 {
    fn from(error: BrotError) -> Self {
        error as u32
    }
}
