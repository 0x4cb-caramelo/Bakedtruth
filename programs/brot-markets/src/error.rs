//! Purpose: every refusal the program can return, one code per cause, as custom program errors.
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio); reader errors from 01 keep their codes; 03 appends 6071 on
//!
//! Codes start at 6000 so they never collide with the System Program's own custom errors, which
//! a failed CPI passes through. A code, once assigned, never changes meaning. Each variant's
//! `#[error("...")]` message is its documentation and what shank-cli writes into the IDL (T9); a
//! variant without one is left out of the IDL and fails tests/brot/idl.test.ts. The derive's
//! `Display` and `Error` impls are never called on-chain. This file passes 200 lines on purpose:
//! shank-cli reads the errors from one enum, and a Rust enum cannot be split across files.

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
    #[error("Row 1: this kind does not open yet (`StakeAtLeast` until a devnet YES is recorded)")]
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
    #[error("Unused since Sprint 03: the reader methods returned it before they were ported")]
    ReaderNotReady = 6070,

    // --- Sprint 03: resolution, the join lock and the other four kinds -------------------------
    #[error("`resolve_campaign` must be a top-level instruction, never called through a CPI")]
    ResolveNotTopLevel = 6071,
    #[error("Nothing can be recorded yet: no YES is proven and the deadline's window is open")]
    NotResolvableYet = 6072,
    #[error(
        "Entries are locked: the outcome is already knowable (met, touched, or epoch started)"
    )]
    OutcomeKnowable = 6073,
    #[error("Row 2: the mint's authority can still mint, so its supply can grow")]
    MintAuthorityLive = 6074,
    #[error("Row 3: the target is within the minimum distance of the current value")]
    TargetTooClose = 6075,
    #[error("Row 3: the target is out of reach (a price at or below zero, or past the far bound)")]
    TargetUnreachable = 6076,
    #[error("An argument this kind does not use is not zero (feed, direction or epoch)")]
    UnusedArgumentNotZero = 6077,
    #[error("Row 5: the measured epoch has already started")]
    EpochAlreadyStarted = 6078,
    #[error("Row 5: the measured epoch may start after the deadline")]
    EpochAfterDeadline = 6079,
    #[error("Row 2: the stake pool stopped updating and cannot write the epoch's snapshot")]
    StakePoolNotUpdating = 6080,
    #[error("The price's exponent is not the one stored at opening")]
    PriceExponentChanged = 6081,
    #[error(
        "Join: the sponsored price is older than `max_age`, too far ahead, or too many slots old"
    )]
    JoinPriceStale = 6082,
    #[error("Proof: the publish time is outside the campaign's window")]
    ProofOutsideWindow = 6083,
    #[error("Proof: more than 60 s old, too far ahead of the clock, or too many slots old")]
    ProofStale = 6084,
    #[error("Proof: price minus confidence does not cross the target in the campaign's direction")]
    ProofDoesNotTouch = 6085,
    #[error("Row 7: the SOL/USD account is not owned by the Pyth receiver")]
    SolUsdWrongOwner = 6086,
    #[error("Row 7: the SOL/USD account does not have the `PriceUpdateV2` layout")]
    SolUsdBadLayout = 6087,
    #[error("Row 7: the SOL/USD price was not fully verified")]
    SolUsdNotFullyVerified = 6088,
    #[error("Row 7: the SOL/USD account holds another feed")]
    SolUsdWrongFeed = 6089,
    #[error(
        "The creation parameters changed since the client read them (`expected_params_version`)"
    )]
    CreationParamsChanged = 6090,
    // Lane A (numbers from 6091).
    #[error("The team key acts only while the campaign is InReview")]
    TeamKeyOutsideReview = 6091,
    #[error("The review window is closed, or the act is outside it")]
    OutsideReviewWindow = 6092,
    #[error("A team key may confirm an automatic void, never turn it into YES or NO")]
    AutomaticVoidNotInvertible = 6093,
    #[error("A team key cannot void with this reason")]
    VoidReasonNotForTeam = 6094,
    #[error("A contest opens only inside the review window")]
    ContestOutsideReview = 6095,
    #[error("Nothing leaves `Contested` before Sprint 14")]
    ContestExitDisabled = 6096,
    // Lane B (numbers from 6101).
    #[error("A money invariant (I1 to I15) does not hold")]
    InvariantViolated = 6101,
    #[error("The snapshot's totals disagree with each other")]
    SnapshotInconsistent = 6102,
    // Lane C (numbers from 6106).
    #[error("The campaign is not finalized yet")]
    NotFinalized = 6106,
    #[error("This payout was already made")]
    AlreadySettled = 6107,
    #[error("The entry's stored baker is not the recipient")]
    WrongBaker = 6108,
    #[error("No creator share is due: team, one-sided, void or refund")]
    CreatorShareNotDue = 6109,
    #[error("The recipient is not the stored creator")]
    WrongCreator = 6110,
    #[error("The wallet is still below its rent-exempt minimum; the reserved credit cannot be claimed yet")]
    ReserveNotClaimable = 6111,
    #[error("A payout would exceed the snapshot's distributable amount")]
    PayoutExceedsSnapshot = 6112,
    #[error("The entry belongs to another campaign")]
    EntryNotOnCampaign = 6113,
    #[error("The entry's joins are not all tallied yet: the late totals are not known")]
    NotTallied = 6114,
    // Lane D (numbers from 6121).
    #[error("The campaign's fee, prize and creator share are not all settled")]
    CampaignNotSettled = 6121,
    #[error("The fee recipient is the fee vault itself")]
    FeeRecipientIsFeeVault = 6122,
    #[error("The fee vault holds nothing above its rent-exempt minimum")]
    NothingToSweep = 6123,
    #[error("The campaign is already closed")]
    AlreadyClosed = 6124,
    #[error("The opening fee and the held 10% were already collected")]
    FeeAlreadyCollected = 6125,
    #[error("The prize was already returned to the opener")]
    PrizeAlreadySettled = 6126,
    #[error("The account still holds lamports, so it cannot be closed")]
    AccountNotEmpty = 6127,
    // Lane G (numbers from 6131).
    #[error("The sponsored price is within the join margin of the target")]
    JoinBufferRefused = 6131,
    #[error("The entry is below the minimum this campaign opened with")]
    BelowCampaignMinEntry = 6132,
    #[error("The join accounts passed do not match the entry's joins, in order")]
    JoinAccountsMismatch = 6133,
    // Lane H (numbers from 6141).
    #[error("The price feed is not on the compiled feed list")]
    FeedNotOnList = 6141,
    // Lane shared (numbers from 6146).
    #[error("The transition is not in the table of TP 3.4.2")]
    IllegalTransition = 6146,
    // New codes are appended here, from 6147, never reusing a number.
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
