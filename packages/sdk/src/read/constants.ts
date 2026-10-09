/**
 * Purpose: the program's address and the constants compiled into it that a client needs: seeds, other
 *          programs, code ceilings, price and reader bounds, account sizes, and the enums. Mirrors
 *          programs/brot-markets/src/constants.rs; tests/sdk/constants.test.ts compares the two.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * The program address is read from the IDL, which shank-cli writes from `declare_id!` (Sprint 00's
 * carried item: "the SDK takes the program address from the IDL"). The time constants that differ in
 * a `drill` build are in ./math/schedule.ts.
 */
import { address, type Address } from "@solana/kit";

import idl from "../idl/brot_markets.json";

export {
  ConfigChange,
  ContestStage,
  Direction,
  OperatingLevel,
  Outcome,
  ReaderKind,
  SettleMode,
  Side,
  Status,
  VoidReason,
} from "../idl/generated/types";

/** The Brot Markets program, from the IDL's `metadata.address`. */
export const PROGRAM_ID: Address = address(idl.metadata.address);
/** The IDL itself (Shank), for tools that read it. */
export const BROT_MARKETS_IDL = idl;

export const SEEDS = {
  config: "config",
  feeVault: "fee_vault",
  campaign: "campaign",
  vault: "vault",
  entry: "entry",
  join: "join",
  eventAuthority: "__event_authority",
} as const;

/** The PDA that signs the program's self-CPI events, and its bump (constants.rs, checked by a test). */
export const EVENT_AUTHORITY = address("E5CgcK5xs4YfPdBLnCWTAA9ruStbTqLjEzTxtVaRuB5o");
export const EVENT_AUTHORITY_BUMP = 254;
/** The first byte of an event's inner instruction data; no instruction uses it. */
export const EVENT_IX_TAG = 0xff;

export const SYSTEM_PROGRAM_ID = address("11111111111111111111111111111111");
export const BPF_LOADER_UPGRADEABLE_ID = address("BPFLoaderUpgradeab1e11111111111111111111111");
export const PYTH_RECEIVER_ID = address("rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp");
export const PYTH_PUSH_ORACLE_ID = address("pyt2F414BA6dPttK6RddPZUdHfapoBN24GL5wbrPCou");
export const PYTH_SHARD = 0;
export const SPL_TOKEN_PROGRAM_ID = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const TOKEN_2022_PROGRAM_ID = address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
export const DAMM_V2_PROGRAM_ID = address("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG");
export const STAKE_POOL_PROGRAM_ID = address("SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy");
export const VOTE_PROGRAM_ID = address("Vote111111111111111111111111111111111111111");
export const CLOCK_SYSVAR_ID = address("SysvarC1ock11111111111111111111111111111111");
export const EPOCH_SCHEDULE_SYSVAR_ID = address("SysvarEpochSchedu1e111111111111111111111111");

/** The Pyth SOL/USD feed a paid opening is priced with, and its sponsored account (same on both clusters). */
export const SOL_USD_FEED_HEX = "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
export const SOL_USD_ACCOUNT = address("7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE");

export const LAMPORTS_PER_SOL = 1_000_000_000n;

/** Code ceilings and floors of the creation parameters (constants.rs, "Money"). */
export const LIMITS = {
  maxFeeBps: 1_000,
  maxCreatorShareBps: 100,
  maxOneSidedFeeBps: 100,
  minOpeningPrizeBps: 9_000,
  minOpeningFeeUsd: 1n,
  maxOpeningFeeUsd: 5_000n,
  minEntryFloorLamports: 1_000_000n,
  minEntryCeilingLamports: 1_000_000_000n,
  maxOpenCampaignsCeiling: 10_000,
  maxPriceAgeCeiling: 300,
  maxPriceConfBpsCeiling: 100,
  campaignMaxAgeFloor: 30,
  campaignMaxAgeCeiling: 300,
} as const;

/** The sentence template a campaign is rendered with (D-j); the program sets it. */
export const CAMPAIGN_TEMPLATE_VERSION = 1;

/** Price rules (constants.rs, "Prices"; join_rules.rs). */
export const PRICE_RULES = {
  /** Row 4: a price campaign's own feed within 0.5% at opening. */
  campaignMaxConfBps: 50,
  /** A publish time at most this far ahead of the cluster clock still counts as fresh. */
  maxClockLeadSeconds: 60n,
  /** Row 3, the far bound of a price target: within a tenfold move. */
  targetMaxRatio: 10n,
  /** The shortest slot the slot bound assumes, in milliseconds. */
  minSlotMs: 100n,
  /** The proximity buffer at the join lock, bps of the sponsored price (question 7). */
  joinBufferBps: 100,
  /** The NO window opens this long after the deadline (Q4). */
  proofDelaySeconds: 60n,
  /** `StaleFeed`'s floor (D7). */
  staleFeedMinSeconds: 600n,
} as const;

/** Row 3's minimum distance, bps of the current value, per kind; and the epoch rule's slow slot. */
export const MIN_DISTANCE_BPS = { price: 100, supply: 100, damm: 100, stakePool: 100, stake: 100 } as const;
export const EPOCH_START_SLOW_SLOT_MS = 500n;

/** Account sizes and type tags (state/*.rs; pinned by programs/brot-markets/tests/layout.rs). */
export const ACCOUNT_LEN = { globalConfig: 400, campaign: 512, entry: 116, join: 96, vault: 0, feeVault: 0 } as const;
export const ACCOUNT_TAG = { globalConfig: 1, campaign: 2, entry: 3, join: 5 } as const;
export const LAYOUT_VERSION = 1;
