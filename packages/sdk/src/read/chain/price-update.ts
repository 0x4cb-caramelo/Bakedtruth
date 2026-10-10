/**
 * Purpose: a Pyth `PriceUpdateV2` account read the way the program reads it: owner first (the upgraded
 *          receiver `rec2HH…` only), exactly 134 bytes, the discriminator, Full verification, the named
 *          feed; then price, confidence, exponent, publish time and posted slot. Mirrors
 *          programs/brot-markets/src/readers/price_update.rs.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * Refusals carry the reader's own errors (`ReaderWrongOwner`, `ReaderBadLayout`,
 * `PriceNotFullyVerified`, `PriceWrongFeed`); the SOL/USD read at opening renames them to row 7's.
 * `prev_publish_time` is Pythnet's previous aggregate, not the account's previous write: not read.
 */
import { refuse, type BrotErrorName } from "../errors";
import { bytesEqual, hexToBytes } from "../bytes";
import { PYTH_RECEIVER_ID } from "../constants";
import { Cursor } from "./cursor";

/** Anchor discriminator of `PriceUpdateV2`. */
export const PRICE_UPDATE_V2_DISCRIMINATOR = [34, 241, 35, 99, 157, 126, 244, 205] as const;
/** The receiver allocates every `PriceUpdateV2` at this size. */
export const PRICE_UPDATE_V2_LEN = 134;
/** Borsh tag of `VerificationLevel::Full`. */
const VERIFICATION_FULL = 1;

/** What the reader takes from a price update; `price` and `conf` are scaled by `10^exponent`. */
export type PriceReading = {
  feedId: Uint8Array;
  price: bigint;
  conf: bigint;
  exponent: number;
  publishTime: bigint;
  postedSlot: bigint;
};

/** The reader's refusals renamed for the SOL/USD slot of an opening (row 7, `payment::sol_usd_read`). */
export const SOL_USD_READ_ERRORS: Partial<Record<BrotErrorName, BrotErrorName>> = {
  ReaderWrongOwner: "SolUsdWrongOwner",
  ReaderBadLayout: "SolUsdBadLayout",
  PriceNotFullyVerified: "SolUsdNotFullyVerified",
  PriceWrongFeed: "SolUsdWrongFeed",
};

/** Reads a fully verified update of `expectedFeedId` from an account's owner and bytes (`read_price_update`). */
export function readPriceUpdate(owner: string, data: Uint8Array, expectedFeedId: Uint8Array | string): PriceReading {
  const expected = typeof expectedFeedId === "string" ? hexToBytes(expectedFeedId) : expectedFeedId;
  if (owner !== PYTH_RECEIVER_ID) refuse("ReaderWrongOwner");
  if (data.length !== PRICE_UPDATE_V2_LEN) refuse("ReaderBadLayout");
  const cursor = new Cursor(data);
  if (!bytesEqual(cursor.take(8), PRICE_UPDATE_V2_DISCRIMINATOR)) refuse("ReaderBadLayout");
  cursor.skip(32); // write_authority: who may overwrite this account; not part of the trust decision
  if (cursor.u8() !== VERIFICATION_FULL) refuse("PriceNotFullyVerified");
  const feedId = cursor.take(32);
  if (!bytesEqual(feedId, expected)) refuse("PriceWrongFeed");
  const price = cursor.i64();
  const conf = cursor.u64();
  const exponent = cursor.i32();
  const publishTime = cursor.i64();
  cursor.skip(24); // prev_publish_time, ema_price, ema_conf
  const postedSlot = cursor.u64();
  return { feedId, price, conf, exponent, publishTime, postedSlot };
}
