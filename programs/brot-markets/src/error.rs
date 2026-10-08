//! Purpose: every refusal the program can return, one code per cause, as custom program errors.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); reader errors from 01 keep their codes
//!
//! Codes start at 6000 so they never collide with the System Program's own custom errors, which
//! a failed CPI passes through. A code, once assigned, never changes meaning. Each variant's
//! `#[error("...")]` message is its documentation and what shank-cli writes into the IDL (T9); a
//! variant without one is left out of the IDL and fails tests/brot/idl.test.ts. The derive's
//! `Display` and `Error` impls are never called on-chain.

use pinocchio::error::ProgramError;

#[derive(Clone, Copy, Debug, PartialEq, Eq, thiserror::Error)]
#[error("Brot Markets error without a message yet")]
#[repr(u32)]
pub enum BrotError {
    // --- Sprints 00 and 01 -------------------------------------------------------------
    #[error("Arithmetic overflow")]
    MathOverflow = 6000,
    #[error("Account is not owned by the program this reader trusts")]
    ReaderWrongOwner = 6001,
    #[error("Account data does not match the layout this reader expects")]
    ReaderBadLayout = 6002,
    #[error("Price update was not fully verified by the Pyth receiver")]
    PriceNotFullyVerified = 6003,
    #[error("Price update is for another feed than the one expected")]
    PriceWrongFeed = 6004,

    // --- The checks module (TP section 3.4.17) -----------------------------------------
    #[error("An account the program treats as its own belongs to another program")]
    WrongOwner = 6005,
    #[error("A slot that must sign did not")]
    MissingSignature = 6006,
    #[error("A slot that must be writable was passed read-only")]
    NotWritable = 6007,
    #[error("The account's type tag is not the one this slot expects (a zeroed account included)")]
    WrongTag = 6008,
    #[error("The account's data is not exactly the size of its type")]
    WrongLength = 6009,
    #[error("The address is not the program-derived address its seeds and bump give")]
    PdaMismatch = 6010,
    #[error("The System Program slot holds another account")]
    WrongSystemProgram = 6011,
    #[error("The signer is not the program's upgrade authority")]
    UpgradeAuthorityMismatch = 6012,
    #[error("The ProgramData account is not this program's, or records no upgrade authority")]
    WrongProgramData = 6013,
    #[error("The account already exists; the program never re-initialises one")]
    AlreadyInitialized = 6014,
    #[error("The same account was passed in two slots that must differ")]
    DuplicateAccount = 6015,
    #[error("The event-authority slot is not this program's event authority")]
    WrongEventAuthority = 6016,
    #[error("The program slot is not this program")]
    WrongProgramAccount = 6017,
    #[error("The account's layout version is not the one this program reads")]
    WrongLayoutVersion = 6018,
    #[error("A stored field holds a value no variant of its enum has")]
    BadAccountData = 6019,

    // --- Instruction data ---------------------------------------------------------------
    #[error("The first byte of the instruction data names no instruction")]
    UnknownInstruction = 6020,
    #[error("The instruction data is not exactly the size of the instruction's arguments")]
    BadInstructionData = 6021,

    // --- Roles ---------------------------------------------------------------------------
    #[error("The signer is not the config's admin")]
    NotAdmin = 6022,
    #[error("The signer is not one of the config's team keys")]
    NotTeamMember = 6023,
    #[error("The signer is not the admin named by the pending transfer")]
    NotPendingAdmin = 6024,
    #[error("No admin transfer is pending")]
    NoPendingAdmin = 6025,

    // --- Config values (TP section 3.4.1) -------------------------------------------------
    #[error("An address that must name a key is all zeros")]
    ZeroAddress = 6026,
    #[error("More than five team keys")]
    TeamTooLarge = 6027,
    #[error("A team slot past `team_len` is not zero")]
    TeamSlotNotEmpty = 6028,
    #[error("The same team key appears twice")]
    DuplicateTeamKey = 6029,
    #[error("`opening_fee_usd` is outside its floor and ceiling")]
    OpeningFeeUsdOutOfRange = 6030,
    #[error("`opening_prize_bps` is outside its floor and ceiling")]
    OpeningPrizeBpsOutOfRange = 6031,
    #[error("`fee_bps` is above `MAX_FEE_BPS`")]
    FeeBpsAboveCeiling = 6032,
    #[error("`one_sided_fee_bps` is above its ceiling")]
    OneSidedFeeBpsAboveCeiling = 6033,
    #[error("`creator_share_bps` is above `MAX_CREATOR_SHARE_BPS`")]
    CreatorShareBpsAboveCeiling = 6034,
    #[error("`max_open_campaigns` is outside its floor and ceiling")]
    MaxOpenCampaignsOutOfRange = 6035,
    #[error("`min_entry_lamports` is outside its floor and ceiling")]
    MinEntryOutOfRange = 6036,
    #[error("`sol_usd_feed_id` is all zeros")]
    SolUsdFeedIdZero = 6037,
    #[error("`max_price_age` is outside its floor and ceiling")]
    MaxPriceAgeOutOfRange = 6038,
    #[error("`max_price_conf_bps` is outside its floor and ceiling")]
    MaxPriceConfOutOfRange = 6039,
    #[error("`campaign_max_age` is below 30 seconds or above its ceiling")]
    CampaignMaxAgeOutOfRange = 6040,

    // --- The pause (TP section 3.4.9) -------------------------------------------------------
    #[error("Entries are already paused")]
    AlreadyPaused = 6041,
    #[error("Entries are not paused")]
    NotPaused = 6042,

    // --- Opening a campaign: the rows of TP section 3.4.10 ---------------------------------
    #[error("Row 1: the kind byte names no reader")]
    UnknownReaderKind = 6043,
    #[error("Row 1: this kind does not open yet (the four non-price kinds until Sprint 03)")]
    ReaderKindNotOpen = 6044,
    #[error("Row 2: the metric account is not the one the campaign's parameters name")]
    MetricAccountMismatch = 6045,
    #[error("Row 3: the target is already touched or met; the campaign would be decided at birth")]
    TargetAlreadyTouched = 6046,
    #[error("Row 4: the price is older than the campaign's maximum age")]
    PriceStale = 6047,
    #[error("Row 4: the confidence interval is wider than 0.5% of the price")]
    PriceConfidenceTooWide = 6048,
    #[error("Row 4: the price is zero or negative")]
    PriceNonPositive = 6049,
    #[error("Row 4: the direction byte is neither `Above` nor `Below`")]
    InvalidDirection = 6050,
    #[error("Row 5: the deadline is less than three days away")]
    DurationTooShort = 6051,
    #[error("Row 5: the deadline is more than ninety days away")]
    DurationTooLong = 6052,
    #[error("Row 7: the opening pays less than `opening_fee_usd` (a non-team signer always pays)")]
    OpeningUsdBelowFee = 6053,
    #[error("Row 7: the opening would cost more lamports than the signed `max_lamports`")]
    OpeningAboveMaxLamports = 6054,
    #[error("Row 7: the SOL/USD slot is not the sponsored account of `sol_usd_feed_id`")]
    SolUsdAccountMismatch = 6055,
    #[error("Row 7: the SOL/USD price is older than `max_price_age`")]
    SolUsdStale = 6056,
    #[error("Row 7: the SOL/USD confidence is wider than `max_price_conf_bps`")]
    SolUsdConfidenceTooWide = 6057,
    #[error("Row 7: the SOL/USD price is zero or negative")]
    SolUsdPriceNonPositive = 6058,
    #[error("Row 7: the SOL/USD exponent is outside the range the conversion supports")]
    PriceExponentOutOfRange = 6059,
    #[error("Row 8: entries are paused, which also stops openings")]
    OpenWhilePaused = 6060,
    #[error("Row 8: `open_campaigns` has reached `max_open_campaigns`")]
    TooManyOpenCampaigns = 6061,

    // --- Joining a campaign -------------------------------------------------------------------
    #[error("The campaign is not `Open`")]
    CampaignNotOpen = 6062,
    #[error("Entries closed at `entries_close_at`")]
    EntriesClosed = 6063,
    #[error("Entries are paused")]
    JoinWhilePaused = 6064,
    #[error("The entry is below `min_entry_lamports`")]
    EntryBelowMinimum = 6065,
    #[error("The baker's entry total is not the `expected_entry_total` the client signed")]
    EntryTotalMismatch = 6066,
    #[error("The estimated return is below the signed `min_return_bps`")]
    ReturnBelowMinimum = 6067,
    #[error("The side byte is neither `Yes` nor `No`")]
    InvalidSide = 6068,
    #[error("The `Entry` account belongs to another campaign or another baker")]
    EntryMismatch = 6069,

    // --- Readers --------------------------------------------------------------------------------
    #[error("This reader method arrives in Sprint 03 (`outcome_knowable`, `try_resolve`)")]
    ReaderNotReady = 6070,
    // New codes are appended here, numbered from 6071, never reusing a number.
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
