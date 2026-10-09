/**
 * Purpose: the opening's rules that read no account, in the program's order: the argument sizes (row 9),
 *          row 1 (the kind names a reader and opens in this build), the canonical arguments (a field the
 *          kind does not use is zero, D-j) and row 4's feed list. Mirrors
 *          programs/brot-markets/src/instructions/campaigns/open_campaign/rules.rs.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { refuse } from "../errors";
import { allZero, bytesToHex } from "../bytes";
import { Direction, ReaderKind } from "../constants";
import { feedsOf, type FeedCluster } from "../feeds";
import { I128_MAX, I128_MIN, I64_MAX, I64_MIN, U64_MAX } from "../math/integers";

/** The opening's arguments as the program receives them (`OpenCampaignArgs`), every field explicit. */
export type OpenArgs = {
  id: bigint;
  /** The kind byte; any value 0 to 255 can be sent, only 0 to 4 name a reader. */
  kind: number;
  /** The direction byte; 0 (`Above`) for every kind but the price kind. */
  direction: number;
  /** 32 bytes; zero for every kind but the price kind. */
  feedId: Uint8Array;
  target: bigint;
  deadlineAt: bigint;
  openingUsd: bigint;
  maxLamports: bigint;
  epoch: bigint;
  expectedParamsVersion: number;
};

const inRange = (value: bigint, min: bigint, max: bigint) => typeof value === "bigint" && value >= min && value <= max;
const isByte = (value: number) => Number.isInteger(value) && value >= 0 && value <= 255;

/**
 * Row 9: every argument fits the fixed layout the program reads (`BadInstructionData` otherwise; no
 * instruction could carry it). No argument is text (D-j).
 */
export function checkArgumentSizes(args: OpenArgs): void {
  const fits =
    inRange(args.id, 0n, U64_MAX) &&
    isByte(args.kind) &&
    isByte(args.direction) &&
    args.feedId instanceof Uint8Array &&
    args.feedId.length === 32 &&
    inRange(args.target, I128_MIN, I128_MAX) &&
    inRange(args.deadlineAt, I64_MIN, I64_MAX) &&
    inRange(args.openingUsd, 0n, U64_MAX) &&
    inRange(args.maxLamports, 0n, U64_MAX) &&
    inRange(args.epoch, 0n, U64_MAX) &&
    Number.isInteger(args.expectedParamsVersion) &&
    args.expectedParamsVersion >= 0 &&
    args.expectedParamsVersion <= 0xffff_ffff;
  if (!fits) refuse("BadInstructionData");
}

/** Row 1 (`opening_kind`): a reader's byte (`UnknownReaderKind`) that opens in this build (`ReaderKindNotOpen`). */
export function openingKind(byte: number, stakeAtLeastOpens: boolean): ReaderKind {
  if (!(byte in ReaderKind) || typeof ReaderKind[byte] !== "string") refuse("UnknownReaderKind");
  if (byte === ReaderKind.StakeAtLeast && !stakeAtLeastOpens) refuse("ReaderKindNotOpen");
  return byte as ReaderKind;
}

/** The two kinds read in a named epoch (`ReaderKind::measured_by_epoch`). */
export const measuredByEpoch = (kind: ReaderKind) =>
  kind === ReaderKind.StakePoolTvlAtLeast || kind === ReaderKind.StakeAtLeast;

/**
 * The canonical arguments (`canonical_direction`) and the feed list (`require_listed_feed`): a valid
 * direction byte; for a kind other than the price kind a zero feed and `Above`; `epoch` zero for a kind
 * not read by epoch; a price campaign's feed on the cluster's compiled list. Returns the direction.
 */
export function canonicalArguments(kind: ReaderKind, args: OpenArgs, cluster: FeedCluster): Direction {
  if (args.direction !== Direction.Above && args.direction !== Direction.Below) refuse("InvalidDirection");
  const direction = args.direction as Direction;
  const isPrice = kind === ReaderKind.PriceTouch;
  if (!isPrice && (!allZero(args.feedId) || direction !== Direction.Above)) refuse("UnusedArgumentNotZero");
  if (!measuredByEpoch(kind) && args.epoch !== 0n) refuse("UnusedArgumentNotZero");
  if (isPrice) {
    const hex = bytesToHex(args.feedId);
    if (!feedsOf(cluster).some(([listed]) => listed === hex)) refuse("FeedNotOnList");
  }
  return direction;
}
