//! Purpose: seeds, program ids, code ceilings and the duration and window constants compiled
//!          into the program, with the devnet-only drill values behind the `drill` feature.
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio); Sprint 03 adds the readers' programs and rules
//!
//! Values marked [AC] were chosen by the team where the sources give none (TP section 3.4.1,
//! C43); the session logs of 2026-10-08 (Sprint 02) and 2026-10-09 (Sprint 03) record why. Money
//! is SOL (D-a): there is no mint, no cap (D-h) and no accepted-account list (D-i), so none of
//! them has a constant.

use pinocchio::{address::address, Address};

// --- Seeds -------------------------------------------------------------------------------------

/// `GlobalConfig`, one per program: `["config"]`.
pub const CONFIG_SEED: &[u8] = b"config";
/// The data-less fee vault, one per program: `["fee_vault"]`.
pub const FEE_VAULT_SEED: &[u8] = b"fee_vault";
/// One `Campaign` per client-chosen id: `["campaign", id as u64 little-endian]` (T17).
pub const CAMPAIGN_SEED: &[u8] = b"campaign";
/// The data-less lamport vault of a campaign: `["vault", campaign]`.
pub const VAULT_SEED: &[u8] = b"vault";
/// One `Entry` per baker and campaign, both sides: `["entry", campaign, baker]`.
pub const ENTRY_SEED: &[u8] = b"entry";

/// `["join", campaign, baker, index]`: one account per join (founder decision, 2026-10-09).
pub const JOIN_SEED: &[u8] = b"join";
/// The PDA that signs the program's self-CPI events (T4): `["__event_authority"]`.
pub const EVENT_AUTHORITY_SEED: &[u8] = b"__event_authority";

/// The event authority of this program id, derived once and checked by a host test.
pub const EVENT_AUTHORITY: Address = address!("E5CgcK5xs4YfPdBLnCWTAA9ruStbTqLjEzTxtVaRuB5o");
/// Its canonical bump.
pub const EVENT_AUTHORITY_BUMP: u8 = 254;

// --- Other programs ----------------------------------------------------------------------------

/// The BPF upgradeable loader, owner of the program's ProgramData account.
pub const BPF_LOADER_UPGRADEABLE_ID: Address =
    address!("BPFLoaderUpgradeab1e11111111111111111111111");
/// The Pyth receiver whose `PriceUpdateV2` accounts the price reader trusts (upgraded Core).
pub const PYTH_RECEIVER_ID: Address = address!("rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp");
/// The Pyth push oracle that derives the sponsored price accounts: seeds `[shard u16 LE, feed_id]`.
pub const PYTH_PUSH_ORACLE_ID: Address = address!("pyt2F414BA6dPttK6RddPZUdHfapoBN24GL5wbrPCou");
/// The shard of the sponsored accounts the program accepts.
pub const PYTH_SHARD: u16 = 0;

// --- Money -------------------------------------------------------------------------------------

/// Basis points in 100%.
pub const BPS_DENOMINATOR: u64 = 10_000;
/// Ceiling of Brot's fee on the losing side (P1 section 3.3).
pub const MAX_FEE_BPS: u16 = 1_000;
/// Ceiling of the creator's share of the entries (D-g).
pub const MAX_CREATOR_SHARE_BPS: u16 = 100;
/// [AC] Ceiling of the one-sided fee per entry: today's 1% (P1 section 3.5), so it can only fall.
pub const MAX_ONE_SIDED_FEE_BPS: u16 = 100;
/// [AC] Floor of the prize share of a paid opening: Brot's part never exceeds D-b's 10%.
pub const MIN_OPENING_PRIZE_BPS: u16 = 9_000;
/// [AC] Floor and ceiling of the opening fee, in whole US$. The signed `max_lamports` protects
/// each opener from a change between preview and signature.
pub const MIN_OPENING_FEE_USD: u64 = 1;
pub const MAX_OPENING_FEE_USD: u64 = 5_000;
/// [AC] Floor and ceiling of `min_entry_lamports`. The floor keeps every refund above the
/// rent-exempt minimum of an empty wallet (TP section 3.4.5); P-5 sets the value, 0.01 SOL.
pub const MIN_ENTRY_FLOOR_LAMPORTS: u64 = 1_000_000;
pub const MIN_ENTRY_CEILING_LAMPORTS: u64 = 1_000_000_000;
/// [AC] Ceiling of `max_open_campaigns`: ten times the keeper's design load of 1,000 (X1.8).
pub const MAX_OPEN_CAMPAIGNS_CEILING: u32 = 10_000;
/// The sentence template a Sprint 02 campaign is rendered with (D-j). The program sets it.
pub const CAMPAIGN_TEMPLATE_VERSION: u16 = 1;

// --- Prices --------------------------------------------------------------------------------------

/// Row 4 of TP section 3.4.10: a price campaign's own feed must be within 0.5% at opening.
pub const PRICE_CAMPAIGN_MAX_CONF_BPS: u16 = 50;
/// [AC] Ceiling of `max_price_age` for the SOL/USD read at opening, in seconds.
pub const MAX_PRICE_AGE_CEILING: u32 = 300;
/// [AC] Ceiling of `max_price_conf_bps` for the SOL/USD read at opening (1%).
pub const MAX_PRICE_CONF_BPS_CEILING: u16 = 100;
/// [AC] A price published more than this many seconds ahead of the cluster clock is refused as
/// stale (Sprint 02 review): a fault upstream could otherwise stamp a price that never ages. The
/// measured leads are 1 to 2 s (knowledge-base/tecnologia/pyth-leitor-de-preco.md, 1.4 and 1.7).
pub const MAX_PRICE_CLOCK_LEAD_SECONDS: i64 = 60;
/// The join-time price age copied into each price campaign is never below 30 s (Q4 answer).
pub const CAMPAIGN_MAX_AGE_FLOOR: u32 = 30;
/// [AC] Ceiling of `campaign_max_age`, in seconds.
pub const CAMPAIGN_MAX_AGE_CEILING: u32 = 300;
/// [AC] Row 3, far side of a price target (Sprint 03): `Above` at most this many times the price,
/// `Below` at least the price divided by it, and never at or below zero. A tenfold move of a
/// large asset inside 90 days would be a campaign decided at birth.
pub const PRICE_TARGET_MAX_RATIO: i128 = 10;
/// [AC] The shortest slot the freshness rules assume when a bound in seconds becomes a bound in
/// slots: `Clock::slot − posted_slot` may be at most `ceil(seconds × 1,000 / MIN_SLOT_MS)`. A
/// backstop against a cluster clock that lags, never the main rule (Sprint 03).
pub const MIN_SLOT_MS: u64 = 100;

// --- Readers (Sprint 03; TP section 3.4.8) --------------------------------------------------------

/// Classic SPL Token: the burn kind's mint must belong to it, so a Token-2022 mint is refused.
pub const SPL_TOKEN_PROGRAM_ID: Address = address!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
/// Token-2022, named so that its refusal can be tested.
pub const TOKEN_2022_PROGRAM_ID: Address = address!("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
/// Meteora DAMM v2, owner of the locked-liquidity kind's pool.
pub const DAMM_V2_PROGRAM_ID: Address = address!("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG");
/// SPL Stake Pool, owner of the stake-pool kind's pool.
pub const STAKE_POOL_PROGRAM_ID: Address = address!("SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy");
/// The Vote program, owner of the stake kind's vote account.
pub const VOTE_PROGRAM_ID: Address = address!("Vote111111111111111111111111111111111111111");
/// The EpochSchedule sysvar, read to find the first slot of the measured epoch.
pub const EPOCH_SCHEDULE_SYSVAR_ID: Address =
    address!("SysvarEpochSchedu1e111111111111111111111111");
/// `sol_get_stack_height` at the top level of a transaction; a CPI runs deeper.
pub const TRANSACTION_LEVEL_STACK_HEIGHT: u64 = 1;

/// [AC] Row 3, the minimum distance between the target and the current value, in bps of the
/// current value (at least one unit), per kind. For the price kind it is measured from the edge
/// of the confidence band. All are 1% today; the session log defends each.
pub const MIN_DISTANCE_BPS_PRICE: u16 = 100;
pub const MIN_DISTANCE_BPS_SUPPLY: u16 = 100;
pub const MIN_DISTANCE_BPS_DAMM: u16 = 100;
pub const MIN_DISTANCE_BPS_STAKE_POOL: u16 = 100;
pub const MIN_DISTANCE_BPS_STAKE: u16 = 100;
/// [AC] The slowest average slot the opening assumes when it checks that the measured epoch
/// starts before the deadline: mainnet runs near 400 ms and devnet near 235 ms.
pub const EPOCH_START_SLOW_SLOT_MS: u64 = 500;

#[cfg(all(feature = "mainnet", feature = "stake-at-least"))]
compile_error!(
    "`StakeAtLeast` opens only after a devnet YES is recorded; never build it with `mainnet`"
);

// --- Time (TP section 3.4.1; P1 sections 3.6 and 4.5) ----------------------------------------------

pub const SECONDS_PER_HOUR: i64 = 3_600;
pub const SECONDS_PER_DAY: i64 = 86_400;
/// Longest campaign: 90 days (D-k).
pub const MAX_DURATION_SECONDS: i64 = 90 * SECONDS_PER_DAY;
/// Entries close 5% of the duration before the deadline...
pub const ENTRY_CLOSE_BPS: i64 = 500;
/// ...but never more than seven days before it.
pub const ENTRY_CLOSE_MAX_SECONDS: i64 = 7 * SECONDS_PER_DAY;
/// The proof delay for a price touch (Q4), Sprint 03.
pub const PROOF_DELAY_SECONDS: i64 = 60;
/// [AC] `StaleFeed` (D7): the sponsored account's last update before the deadline must be older
/// than the larger of the campaign's `max_age` and this floor, ten times devnet's heartbeat
/// (62 to 64 s): one missed heartbeat, or a resolution timed into an update gap, cannot turn a NO
/// into a void (Sprint 03 review).
pub const STALE_FEED_MIN_SECONDS: u32 = 600;
/// Contest stage 1, one hour; stage 2, 48 hours (P1 section 4.5), Sprints 04 and 14.
pub const CONTEST_STAGE1_SECONDS: i64 = SECONDS_PER_HOUR;
pub const CONTEST_STAGE2_SECONDS: i64 = 48 * SECONDS_PER_HOUR;

#[cfg(all(feature = "mainnet", feature = "drill"))]
compile_error!("the `drill` feature shortens the review window and the minimum duration; never build it with `mainnet`");

/// Shortest campaign: three days (D-k).
#[cfg(not(feature = "drill"))]
pub const MIN_DURATION_SECONDS: i64 = 3 * SECONDS_PER_DAY;
/// The review window after resolution: six hours (P1 section 4.5).
#[cfg(not(feature = "drill"))]
pub const REVIEW_WINDOW_SECONDS: i64 = 6 * SECONDS_PER_HOUR;
/// Entries close at least 24 hours before the deadline (P1 section 3.6).
#[cfg(not(feature = "drill"))]
pub const ENTRY_CLOSE_MIN_SECONDS: i64 = 24 * SECONDS_PER_HOUR;

/// [AC] Drill (devnet only, T12): a 15-minute shortest campaign, so a full cycle fits a session.
#[cfg(feature = "drill")]
pub const MIN_DURATION_SECONDS: i64 = 15 * 60;
/// [AC] Drill: a 10-minute review window.
#[cfg(feature = "drill")]
pub const REVIEW_WINDOW_SECONDS: i64 = 10 * 60;
/// [AC] Drill: entries close at least 5 minutes before the deadline. Without it the 24-hour floor
/// would close a 15-minute campaign before it opens.
#[cfg(feature = "drill")]
pub const ENTRY_CLOSE_MIN_SECONDS: i64 = 5 * 60;
