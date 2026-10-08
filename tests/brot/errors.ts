/**
 * Purpose: the program's custom error codes by name, so tests assert the exact refusal (X0.7).
 *          Mirrors programs/brot-markets/src/error.rs; a lane that appends an error there appends
 *          it here, in the same range.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio)
 */
export const BrotError = {
  MathOverflow: 6000,
  ReaderWrongOwner: 6001,
  ReaderBadLayout: 6002,
  PriceNotFullyVerified: 6003,
  PriceWrongFeed: 6004,
  // The checks module
  WrongOwner: 6005,
  MissingSignature: 6006,
  NotWritable: 6007,
  WrongTag: 6008,
  WrongLength: 6009,
  PdaMismatch: 6010,
  WrongSystemProgram: 6011,
  UpgradeAuthorityMismatch: 6012,
  WrongProgramData: 6013,
  AlreadyInitialized: 6014,
  DuplicateAccount: 6015,
  WrongEventAuthority: 6016,
  WrongProgramAccount: 6017,
  WrongLayoutVersion: 6018,
  BadAccountData: 6019,
  // Instruction data
  UnknownInstruction: 6020,
  BadInstructionData: 6021,
  // Roles
  NotAdmin: 6022,
  NotTeamMember: 6023,
  NotPendingAdmin: 6024,
  NoPendingAdmin: 6025,
  // Config values
  ZeroAddress: 6026,
  TeamTooLarge: 6027,
  TeamSlotNotEmpty: 6028,
  DuplicateTeamKey: 6029,
  OpeningFeeUsdOutOfRange: 6030,
  OpeningPrizeBpsOutOfRange: 6031,
  FeeBpsAboveCeiling: 6032,
  OneSidedFeeBpsAboveCeiling: 6033,
  CreatorShareBpsAboveCeiling: 6034,
  MaxOpenCampaignsOutOfRange: 6035,
  MinEntryOutOfRange: 6036,
  SolUsdFeedIdZero: 6037,
  MaxPriceAgeOutOfRange: 6038,
  MaxPriceConfOutOfRange: 6039,
  CampaignMaxAgeOutOfRange: 6040,
  // The pause
  AlreadyPaused: 6041,
  NotPaused: 6042,
  // Opening: the rows of TP section 3.4.10
  UnknownReaderKind: 6043,
  ReaderKindNotOpen: 6044,
  MetricAccountMismatch: 6045,
  TargetAlreadyTouched: 6046,
  PriceStale: 6047,
  PriceConfidenceTooWide: 6048,
  PriceNonPositive: 6049,
  InvalidDirection: 6050,
  DurationTooShort: 6051,
  DurationTooLong: 6052,
  OpeningUsdBelowFee: 6053,
  OpeningAboveMaxLamports: 6054,
  SolUsdAccountMismatch: 6055,
  SolUsdStale: 6056,
  SolUsdConfidenceTooWide: 6057,
  SolUsdPriceNonPositive: 6058,
  PriceExponentOutOfRange: 6059,
  OpenWhilePaused: 6060,
  TooManyOpenCampaigns: 6061,
  // Joining
  CampaignNotOpen: 6062,
  EntriesClosed: 6063,
  JoinWhilePaused: 6064,
  EntryBelowMinimum: 6065,
  EntryTotalMismatch: 6066,
  ReturnBelowMinimum: 6067,
  InvalidSide: 6068,
  EntryMismatch: 6069,
  // Readers
  ReaderNotReady: 6070,

  // --- Sprint 02 lane A (checks) appends below, from 6100 ---

  // --- Sprint 02 lane B (admin) appends below, from 6120 ---

  // --- Sprint 02 lane C (math) appends below, from 6140 ---

  // --- Sprint 02 lane D (opening) appends below, from 6160 ---

  // --- Sprint 02 lane E (entries) appends below, from 6180 ---

  // --- Sprint 02 lane F (tooling) appends below, from 6200 ---
} as const;

export type BrotErrorName = keyof typeof BrotError;
