/**
 * Purpose: which row of the opening's checks (TP 3.4.10) each refusal belongs to, so a preview can say
 *          "row 7: the price moved past your maximum" next to the program's own message.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * Errors the readers share across kinds (owner, layout, feed) are rows 2 and 4 of the metric account;
 * the SOL/USD slot's are row 7's own codes (Sprint 02 review). An error not listed has no row.
 */
import type { BrotErrorName } from "../errors";

const ROWS: Partial<Record<BrotErrorName, number>> = {
  UnknownReaderKind: 1,
  ReaderKindNotOpen: 1,
  ReaderWrongOwner: 2,
  ReaderBadLayout: 2,
  MetricAccountMismatch: 2,
  MintAuthorityLive: 2,
  StakePoolNotUpdating: 2,
  CurveHasTransferHook: 2,
  CurveConfigMismatch: 2,
  CurveNotInSol: 2,
  CurveTooSmall: 2,
  TargetAlreadyTouched: 3,
  TargetTooClose: 3,
  TargetUnreachable: 3,
  TargetNotThreshold: 3,
  FeedNotOnList: 4,
  PriceNotFullyVerified: 4,
  PriceWrongFeed: 4,
  PriceStale: 4,
  PriceConfidenceTooWide: 4,
  PriceNonPositive: 4,
  InvalidDirection: 4,
  DurationTooShort: 5,
  DurationTooLong: 5,
  EpochAlreadyStarted: 5,
  EpochAfterDeadline: 5,
  UnusedArgumentNotZero: 9,
  BadInstructionData: 9,
  OpeningUsdBelowFee: 7,
  OpeningAboveMaxLamports: 7,
  SolUsdAccountMismatch: 7,
  SolUsdStale: 7,
  SolUsdConfidenceTooWide: 7,
  SolUsdPriceNonPositive: 7,
  PriceExponentOutOfRange: 7,
  SolUsdWrongOwner: 7,
  SolUsdBadLayout: 7,
  SolUsdNotFullyVerified: 7,
  SolUsdWrongFeed: 7,
  OpenWhilePaused: 8,
  TooManyOpenCampaigns: 8,
  CreationParamsChanged: 8,
  AlreadyInitialized: 10,
};

/** The row of TP 3.4.10 a refusal of `user_open_campaign` belongs to, or `null`. */
export const rowOf = (errorName: BrotErrorName): number | null => ROWS[errorName] ?? null;
