/**
 * Purpose: `user_link_referrer(referrer)`, built by the Codama client: the referee signs, pays the rent of its
 *          `ReferralLink` and names, once and for good, the wallet that referred it. The link's address is derived
 *          here from the referee, as the program derives it.
 * Version: 0.1.0
 * Sprint:  14 (referral), lane L14A
 *
 * The program refuses a referrer that is the zero address or the referee itself (`InvalidReferrer`; `checkReferrer`
 * in `@brot/sdk/read` says so before the wallet) and a second link (`AlreadyInitialized`). No instruction changes or
 * closes a link, so its rent never comes back.
 */
import { type Address, type Instruction, type TransactionSigner } from "@solana/kit";

import { getUserLinkReferrerInstruction } from "../idl/generated/instructions";
import { referralLinkAddress } from "../read/pdas";

/** `user_link_referrer`: `referee` signs and pays the link's rent; `referrer` is the wallet it names. */
export async function buildUserLinkReferrer(a: {
  referee: TransactionSigner;
  referrer: Address;
}): Promise<Instruction> {
  return getUserLinkReferrerInstruction({
    referee: a.referee,
    referralLink: await referralLinkAddress(a.referee.address),
    referrer: a.referrer,
  });
}
