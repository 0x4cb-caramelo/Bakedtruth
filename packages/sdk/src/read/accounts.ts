/**
 * Purpose: the program's own accounts decoded from their bytes (Codama's codecs, from the Shank IDL),
 *          after the checks the program makes before it reads a field: the owner, the exact size, the
 *          type tag and the layout version.
 * Version: 0.1.0
 * Sprint:  05 (SDK); T9: the Codama client is the SDK's codec layer
 *
 * The program refuses an account under another owner, of another size, tag or version, and the SDK
 * refuses the same, so a client never shows a value the program would not read.
 */
import { type Address } from "@solana/kit";

import {
  getCampaignDecoder,
  getEntryDecoder,
  getGlobalConfigDecoder,
  getJoinDecoder,
  type Campaign,
  type Entry,
  type GlobalConfig,
  type Join,
} from "../idl/generated/accounts";
import { ACCOUNT_LEN, ACCOUNT_TAG, LAYOUT_VERSION, PROGRAM_ID } from "./constants";

export type { Campaign, Entry, GlobalConfig, Join } from "../idl/generated/accounts";
/** The raw Codama decoders, without the loader's checks, for callers that already made them. */
export { getCampaignDecoder, getEntryDecoder, getGlobalConfigDecoder, getJoinDecoder } from "../idl/generated/accounts";

/** An account as read from the chain: its owner and its bytes. */
export type RawAccount = { readonly owner: Address | string; readonly data: Uint8Array };

/** Why an account is not the program's account of the expected type. */
export type AccountProblem = "WrongOwner" | "WrongLength" | "WrongTag" | "WrongLayoutVersion";

/** The account fails the program's loader checks, in the program's order. */
export class AccountRefused extends Error {
  constructor(
    readonly problem: AccountProblem,
    readonly expected: keyof typeof ACCOUNT_TAG,
  ) {
    super(`not a ${expected} account of the program: ${problem}`);
    this.name = "AccountRefused";
  }
}

function checked(account: RawAccount, kind: keyof typeof ACCOUNT_TAG): Uint8Array {
  if (account.owner !== PROGRAM_ID) throw new AccountRefused("WrongOwner", kind);
  if (account.data.length !== ACCOUNT_LEN[kind]) throw new AccountRefused("WrongLength", kind);
  if (account.data[0] !== ACCOUNT_TAG[kind]) throw new AccountRefused("WrongTag", kind);
  if (account.data[1] !== LAYOUT_VERSION) throw new AccountRefused("WrongLayoutVersion", kind);
  return account.data;
}

export const decodeGlobalConfig = (account: RawAccount): GlobalConfig =>
  getGlobalConfigDecoder().decode(checked(account, "globalConfig"));
export const decodeCampaign = (account: RawAccount): Campaign =>
  getCampaignDecoder().decode(checked(account, "campaign"));
export const decodeEntry = (account: RawAccount): Entry => getEntryDecoder().decode(checked(account, "entry"));
export const decodeJoin = (account: RawAccount): Join => getJoinDecoder().decode(checked(account, "join"));

/** The team keys in use (`GlobalConfig::team`). */
export const teamOf = (config: GlobalConfig): readonly Address[] => config.team.slice(0, config.teamLen);

/** True when `key` is one of the config's team keys in use (`GlobalConfig::is_team`). */
export const isTeamKey = (config: GlobalConfig, key: Address | string): boolean =>
  teamOf(config).includes(key as Address);

/** A baker's whole entry, both sides: what the next join signs as `expected_entry_total` (T10, A-9). */
export const entryTotal = (entry: Entry | null): bigint => (entry ? entry.amountYes + entry.amountNo : 0n);
