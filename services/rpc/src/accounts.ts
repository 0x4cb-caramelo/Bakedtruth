/**
 * Purpose: what an account read may return through brot-rpc (TP §3.5, by owner, since there is no list of accounts,
 *          D-i): an account owned by the program, one of the five readers' programs or the Sysvar program comes back
 *          whole; any other comes back with its owner and size but no data, so the creation box can still say whose it
 *          is while the relay serves no other program's bytes; a missing one stays null. The program's ProgramData is
 *          the one exception by address (A-8), and only as a slice of offset 0 and at most 45 bytes. What may be
 *          cached: never a missing account, ProgramData, or the program's Entry or Join, which the retry guard
 *          decides on (docs/technical/relay-allowlist.md). Pure.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { getBase64Encoder } from "@solana/kit";
import {
  ACCOUNT_TAG,
  BPF_LOADER_UPGRADEABLE_ID,
  DAMM_V2_PROGRAM_ID,
  PROGRAM_DATA_METADATA_LEN,
  PROGRAM_ID,
  PYTH_RECEIVER_ID,
  SPL_TOKEN_PROGRAM_ID,
  STAKE_POOL_PROGRAM_ID,
  VOTE_PROGRAM_ID,
} from "@brot/sdk/read";

/** The owner of every sysvar the clients read (the Clock; the EpochSchedule since Sprint 19). */
export const SYSVAR_OWNER = "Sysvar1111111111111111111111111111111111111";
const SERVED = new Set<string>([
  PROGRAM_ID,
  PYTH_RECEIVER_ID,
  SPL_TOKEN_PROGRAM_ID,
  DAMM_V2_PROGRAM_ID,
  STAKE_POOL_PROGRAM_ID,
  VOTE_PROGRAM_ID,
  SYSVAR_OWNER,
]);
/** The program's accounts a short cache may hold: its config and its campaigns, never an entry or a join. */
const CACHED_TAGS = new Set<number>([ACCOUNT_TAG.globalConfig, ACCOUNT_TAG.campaign]);

export type AccountInfo = { owner?: unknown; data?: unknown; [field: string]: unknown } | null;

/** The account as the relay returns it: whole when its owner is served, else its owner and size with no data. */
export function served(info: AccountInfo): AccountInfo {
  if (info === null || typeof info !== "object") return null;
  if (typeof info.owner === "string" && SERVED.has(info.owner)) return info;
  return { ...info, data: ["", "base64"] };
}

/** ProgramData as A-8 reads it: at that one address, owned by the upgradeable loader, the first 45 bytes at most. */
export function servedProgramData(info: AccountInfo): AccountInfo {
  if (info === null || typeof info !== "object") return null;
  return info.owner === BPF_LOADER_UPGRADEABLE_ID ? info : { ...info, data: ["", "base64"] };
}

/** The slice A-8 asks for: offset 0, a length of at most 45. */
export const isProgramDataSlice = (slice: unknown) => {
  const s = slice as { offset?: number; length?: number } | undefined;
  return s?.offset === 0 && typeof s.length === "number" && s.length >= 1 && s.length <= PROGRAM_DATA_METADATA_LEN;
};

function firstByte(info: AccountInfo): number | null {
  const data = (info as { data?: unknown } | null)?.data;
  if (!Array.isArray(data) || data[1] !== "base64" || typeof data[0] !== "string" || data[0] === "") return null;
  try {
    return getBase64Encoder().encode(data[0])[0] ?? null;
  } catch {
    return null;
  }
}

/** Whether an answer holding this account may be cached for a moment. */
export function cacheable(info: AccountInfo): boolean {
  if (info === null || typeof info !== "object") return false;
  if (info.owner !== PROGRAM_ID) return true;
  const tag = firstByte(info);
  return tag !== null && CACHED_TAGS.has(tag);
}
