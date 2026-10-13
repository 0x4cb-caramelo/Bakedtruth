/**
 * Purpose: the `SealedFee` account (Sprint 15; `["sealed", campaign, sponsor]`) decoded from its bytes after the checks
 *          the program's loader makes before it reads a field, in its order: the owner, the exact size, the type tag
 *          and the layout version. It holds a sponsor's fee on one campaign, bookkept in `feeLamports` (never read from
 *          its lamports: I15), with the totals of that sponsor's sealed entries, until `settle_sealed_fee` closes it.
 * Version: 0.1.0
 * Sprint:  15 (lane L15)
 */
import { getSealedFeeDecoder, type SealedFee } from "../idl/generated/accounts";
import { AccountRefused, type RawAccount } from "./accounts";
import { ACCOUNT_LEN, ACCOUNT_TAG, LAYOUT_VERSION, PROGRAM_ID } from "./constants";

export type { SealedFee } from "../idl/generated/accounts";

/** A sponsor's `SealedFee`, refused (`AccountRefused`) wherever the program's loader refuses it. */
export function decodeSealedFee(account: RawAccount): SealedFee {
  if (account.owner !== PROGRAM_ID) throw new AccountRefused("WrongOwner", "sealedFee");
  if (account.data.length !== ACCOUNT_LEN.sealedFee) throw new AccountRefused("WrongLength", "sealedFee");
  if (account.data[0] !== ACCOUNT_TAG.sealedFee) throw new AccountRefused("WrongTag", "sealedFee");
  if (account.data[1] !== LAYOUT_VERSION) throw new AccountRefused("WrongLayoutVersion", "sealedFee");
  return getSealedFeeDecoder().decode(account.data);
}
