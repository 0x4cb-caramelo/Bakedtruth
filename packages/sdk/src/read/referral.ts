/**
 * Purpose: the referral link (`["referral", referee]`, Sprint 14) for a client: the account decoded from its bytes
 *          after the checks the program's loader makes before it reads a field (owner, exact size, tag, layout
 *          version, in that order), and `checkReferrer`, the SDK's mirror of `user_link_referrer`'s one rule.
 *          Mirrors programs/brot-markets/src/state/referral.rs and instructions/referral/rules.rs.
 * Version: 0.1.0
 * Sprint:  14 (referral), lane L14A
 *
 * The program writes a link once, signed by the referee, and no instruction changes or closes it. "Before the first
 * entry" is not a program rule: the indexer decides it by chain order (slot, the transaction's place in the block, the instruction) against the referee's first entry
 * (TP 3.4.11).
 */
import { type Address } from "@solana/kit";

import { getReferralLinkDecoder, type ReferralLink } from "../idl/generated/accounts";
import { AccountRefused, type RawAccount } from "./accounts";
import { ACCOUNT_LEN, ACCOUNT_TAG, LAYOUT_VERSION, PROGRAM_ID, SYSTEM_PROGRAM_ID } from "./constants";
import { BrotRefusal } from "./errors";

export type { ReferralLink } from "../idl/generated/accounts";
/** The raw Codama decoder, without the loader's checks, for callers that already made them. */
export { getReferralLinkDecoder } from "../idl/generated/accounts";

/** A `ReferralLink`, refused (`AccountRefused`) as the program's loader refuses it, in its order. */
export function decodeReferralLink(account: RawAccount): ReferralLink {
  if (account.owner !== PROGRAM_ID) throw new AccountRefused("WrongOwner", "referralLink");
  if (account.data.length !== ACCOUNT_LEN.referralLink) throw new AccountRefused("WrongLength", "referralLink");
  if (account.data[0] !== ACCOUNT_TAG.referralLink) throw new AccountRefused("WrongTag", "referralLink");
  if (account.data[1] !== LAYOUT_VERSION) throw new AccountRefused("WrongLayoutVersion", "referralLink");
  return getReferralLinkDecoder().decode(account.data);
}

export type ReferrerCheck = { ok: true } | { ok: false; refusal: BrotRefusal };

/**
 * The program's verdict on `referrer` for a link signed by `referee`: `InvalidReferrer` for the zero address (the
 * System Program's) and for the referee itself. Hygiene only, as in the program: a second wallet of the referee
 * passes (the accepted risk of P1 3.9). Whether the referee already has a link is read from the chain, not here.
 */
export function checkReferrer(referee: Address, referrer: Address): ReferrerCheck {
  if (referrer === SYSTEM_PROGRAM_ID || referrer === referee) {
    return { ok: false, refusal: new BrotRefusal("InvalidReferrer") };
  }
  return { ok: true };
}
