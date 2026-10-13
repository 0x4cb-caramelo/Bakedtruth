/**
 * Purpose: the program's addresses for the LiteSVM tests: ids, seeds, discriminators, PDAs and
 *          the known outside accounts (Pyth, the loader). Mirrors programs/brot-markets/src
 *          (constants.rs, instructions/mod.rs).
 * Version: 0.0.4 (the sixth kind: Meteora DBC, wSOL, its distance and floor)
 * Sprint:  02 (pot core on Pinocchio); Sprint 03 adds `resolve_campaign`, the outcome enums, the
 *          readers' programs and constants, frozen at its opening; the sixth kind its own
 */
import { address, getAddressEncoder, getProgramDerivedAddress, type Address } from "@solana/kit";

export const PROGRAM_ID = address("5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o");
export const PROGRAM_SO = "target/deploy/brot_markets.so";
export const SYSTEM_PROGRAM_ID = address("11111111111111111111111111111111");
export const LOADER_V3_ID = address("BPFLoaderUpgradeab1e11111111111111111111111");
export const PYTH_RECEIVER_ID = address("rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp");
export const PYTH_LEGACY_RECEIVER_ID = address("rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ");
export const PYTH_PUSH_ORACLE_ID = address("pyt2F414BA6dPttK6RddPZUdHfapoBN24GL5wbrPCou");
/** The readers' programs (Sprint 03): owners the readers check, and the sysvar the epoch rule reads. */
export const SPL_TOKEN_PROGRAM_ID = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const TOKEN_2022_PROGRAM_ID = address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
export const DAMM_V2_PROGRAM_ID = address("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG");
export const DBC_PROGRAM_ID = address("dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN");
export const WSOL_MINT = address("So11111111111111111111111111111111111111112");
export const STAKE_POOL_PROGRAM_ID = address("SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy");
export const VOTE_PROGRAM_ID = address("Vote111111111111111111111111111111111111111");
export const EPOCH_SCHEDULE_SYSVAR_ID = address("SysvarEpochSchedu1e111111111111111111111111");
/** The test-only CPI proxy (tests/programs/cpi-proxy), loaded at any address a test picks. */
export const CPI_PROXY_SO = "target/deploy/cpi_proxy.so";
/** PDA `["__event_authority"]` of the program (bump 254), checked in tests/brot/kit.test.ts. */
export const EVENT_AUTHORITY = address("CmNehEdy55jRh7waxt2u5vbwLwe3jmRuZXv3AHi1qGwx");

export const hex = (h: string) => Uint8Array.from(h.match(/../g)!.map((b) => parseInt(b, 16)));
export const SOL_USD_FEED_ID = hex("ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d");
export const BTC_USD_FEED_ID = hex("e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43");
/** The sponsored push-oracle accounts (shard 0), the same on devnet and mainnet. */
export const SOL_USD_ACCOUNT = address("7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE");
export const BTC_USD_ACCOUNT = address("APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5");

export const SOL = 1_000_000_000n;
/** constants.rs, Sprint 03: the proof window, the review window and the readers' [AC] values. */
export const PROOF_DELAY_SECONDS = 60n;
export const STALE_FEED_MIN_SECONDS = 600n;
export const REVIEW_WINDOW_SECONDS = 6n * 3_600n;
export const MAX_PRICE_CLOCK_LEAD_SECONDS = 60n;
export const MIN_SLOT_MS = 100n;
export const PRICE_TARGET_MAX_RATIO = 10n;
export const EPOCH_START_SLOW_SLOT_MS = 500n;
export const MIN_DISTANCE_BPS = {
  price: 100n,
  supply: 100n,
  damm: 100n,
  stakePool: 100n,
  stake: 100n,
  dbc: 1_000n,
} as const;
/** The graduation kind's floor on a curve's threshold in the default (non-drill) build: 85 SOL. */
export const DBC_MIN_GRADUATION_LAMPORTS = 85n * 1_000_000_000n;
export const DAY = 86_400n;
export const HOUR = 3_600n;

/** Instruction discriminators: the first byte of the instruction data. */
export const IX = {
  ADMIN_INITIALIZE_CONFIG: 0,
  ADMIN_SET_TEAM: 1,
  ADMIN_SET_CREATION_PARAMS: 2,
  ADMIN_SET_FEE_RECIPIENT: 3,
  ADMIN_TRANSFER_ADMIN: 4,
  ADMIN_ACCEPT_ADMIN: 5,
  TEAM_PAUSE_ENTRIES: 6,
  ADMIN_RESUME_ENTRIES: 7,
  USER_OPEN_CAMPAIGN: 8,
  USER_JOIN_CAMPAIGN: 9,
  RESOLVE_CAMPAIGN: 10,
  TEAM_CONFIRM_RESULT: 11,
  TEAM_VOID_CAMPAIGN: 12,
  TEAM_OPEN_CONTEST: 13,
  FINALIZE_CAMPAIGN: 14,
  SETTLE_ENTRY: 15,
  SETTLE_CREATOR_SHARE: 16,
  COLLECT_FEE: 17,
  SETTLE_PRIZE: 18,
  CLOSE_CAMPAIGN: 19,
  SWEEP_FEES: 20,
  TALLY_LATE_JOINS: 21,
  EMIT_EVENT: 0xff,
} as const;

export const ReaderKind = {
  PriceTouch: 0,
  SupplyAtMost: 1,
  DammV2LockedAtLeast: 2,
  StakePoolTvlAtLeast: 3,
  StakeAtLeast: 4,
  DbcGraduated: 5,
} as const;
export const Status = { Open: 0, InReview: 1, Contested: 2, Settling: 3, Settled: 4 } as const;
export const Outcome = { Unresolved: 0, Yes: 1, No: 2, Void: 3 } as const;
export const VoidReason = {
  None: 0,
  MissedWindow: 1,
  UnreadableAccount: 2,
  StaleFeed: 3,
  TeamHouseFailure: 4,
  TeamOutsideCause: 5,
} as const;
export const Side = { Yes: 0, No: 1 } as const;
export const Direction = { Above: 0, Below: 1 } as const;
export const OperatingLevel = { Normal: 0, EntriesHalted: 1 } as const;
export const ConfigChange = { Team: 0, CreationParams: 1, FeeRecipient: 2, PendingAdmin: 3, Admin: 4 } as const;
export const AccountTag = { GlobalConfig: 1, Campaign: 2, Entry: 3 } as const;

const text = (s: string) => new TextEncoder().encode(s);
const key = (a: Address) => getAddressEncoder().encode(a);
export const u64le = (v: bigint) => {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigUint64(0, v, true);
  return b;
};

type Seeds = Parameters<typeof getProgramDerivedAddress>[0]["seeds"];
const pda = async (seeds: Seeds, programAddress: Address = PROGRAM_ID) =>
  (await getProgramDerivedAddress({ programAddress, seeds }))[0];

export const configPda = () => pda([text("config")]);
export const feeVaultPda = () => pda([text("fee_vault")]);
export const campaignPda = (id: bigint) => pda([text("campaign"), u64le(id)]);
export const vaultPda = (campaign: Address) => pda([text("vault"), key(campaign)]);
export const entryPda = (campaign: Address, baker: Address) => pda([text("entry"), key(campaign), key(baker)]);
/** `["join", campaign, baker, index]`, the index as a little-endian u32 (amendment 2026-10-09). */
export const joinPda = (campaign: Address, baker: Address, index: number) => {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, index, true);
  return pda([text("join"), key(campaign), key(baker), b]);
};
export const eventAuthorityPda = () => pda([text("__event_authority")]);
/** The program's ProgramData account under the upgradeable loader. */
export const programDataPda = () => pda([key(PROGRAM_ID)], LOADER_V3_ID);
/** The sponsored Pyth account of a feed: seeds `[shard 0 as u16 LE, feed_id]` under the push oracle. */
export const sponsoredPriceAccount = (feedId: Uint8Array) => pda([new Uint8Array([0, 0]), feedId], PYTH_PUSH_ORACLE_ID);
