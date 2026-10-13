/**
 * Purpose: what an account read may return through brot-rpc (TP §3.5, by owner, since there is no list of accounts,
 *          D-i): an account owned by the program, one of the six readers' programs or the Sysvar program comes back
 *          whole, and so do the two that hold a token's symbol, which names a graduation campaign's curve (Metaplex
 *          Token Metadata, and Token-2022 for a mint that keeps its metadata in itself); any other comes back with its
 *          owner and size but no data, so the creation box can still say whose it is while the relay serves no other
 *          program's bytes; a missing one stays null. The program's ProgramData is the one exception by address (A-8),
 *          and only as a slice of offset 0 and at most 45 bytes. What may be cached: another program's account and the
 *          sysvars, never the program's own (a page acts on its config, its campaigns and its entries: the web smoke
 *          through the relay saw a reload inside the cache's life keep a pause that had ended), a missing account or
 *          ProgramData. Pure.
 * Version: 0.1.2 (a token's symbol: Token Metadata and Token-2022; 0.1.1, the sixth reader's program, Meteora DBC)
 * Sprint:  08 (indexer, API, relay and points); the sixth kind's site
 */
import {
  BPF_LOADER_UPGRADEABLE_ID,
  DAMM_V2_PROGRAM_ID,
  DBC_PROGRAM_ID,
  PROGRAM_DATA_METADATA_LEN,
  PROGRAM_ID,
  PYTH_RECEIVER_ID,
  SPL_TOKEN_PROGRAM_ID,
  STAKE_POOL_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
  VOTE_PROGRAM_ID,
} from "@brot/sdk/read";

/** The owner of every sysvar the clients read (the Clock; the EpochSchedule since Sprint 19). */
export const SYSVAR_OWNER = "Sysvar1111111111111111111111111111111111111";
const SERVED = new Set<string>([
  PROGRAM_ID,
  PYTH_RECEIVER_ID,
  SPL_TOKEN_PROGRAM_ID,
  DAMM_V2_PROGRAM_ID,
  DBC_PROGRAM_ID,
  STAKE_POOL_PROGRAM_ID,
  VOTE_PROGRAM_ID,
  SYSVAR_OWNER,
  TOKEN_METADATA_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
]);

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

/** Whether an answer holding this account may be cached for a moment: never the program's own, never a missing one. */
export function cacheable(info: AccountInfo): boolean {
  if (info === null || typeof info !== "object") return false;
  return typeof info.owner === "string" && info.owner !== PROGRAM_ID;
}
