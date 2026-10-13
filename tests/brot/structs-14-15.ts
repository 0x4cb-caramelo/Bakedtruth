/**
 * Purpose: the structs of Sprints 14 and 15 as layouts, in the field order of their Rust structs: the
 *          `ReferralLink` and `SealedFee` accounts and the arguments of `user_link_referrer`,
 *          `team_open_contest`, `admin_decide_contest` and `sponsor_join_campaign`. Kept apart from
 *          structs.ts, which they would push past 200 lines.
 * Version: 0.0.2 (`team_open_contest`'s byte, the second review's S1)
 * Sprint:  scaffold of Sprints 14–15, 2026-10-13 (the bodies are lanes L14A, L14B and L15's)
 */
import type { Layout } from "./layouts";

/** `["referral", referee]`, tag 4 (state/referral.rs): 96 bytes. */
export const REFERRAL_LINK: Layout = [
  ["tag", "u8"],
  ["version", "u8"],
  ["bump", "u8"],
  ["referee", "pubkey"],
  ["referrer", "pubkey"],
  ["linked_at", "i64"],
  ["linked_slot", "u64"],
  ["_reserved", { bytes: 13 }],
];

/** `["sealed", campaign, sponsor]`, tag 6 (state/sealed_fee.rs): 112 bytes. */
export const SEALED_FEE: Layout = [
  ["tag", "u8"],
  ["version", "u8"],
  ["bump", "u8"],
  ["campaign", "pubkey"],
  ["sponsor", "pubkey"],
  ["fee_lamports", "u64"],
  ["entry_lamports", "u64"],
  ["usd_total", "u64"],
  ["sealed_count", "u32"],
  ["_reserved", { bytes: 17 }],
];

// --- Instruction arguments (after the one-byte discriminator) ---------------------------------

export const LINK_REFERRER_ARGS: Layout = [["referrer", "pubkey"]];
/** `team_open_contest`'s one byte (the second review's S1): the stage the call opens, 1 or 2. */
export const TEAM_OPEN_CONTEST_ARGS: Layout = [["stage", "u8"]];
export const DECIDE_CONTEST_ARGS: Layout = [
  ["decision", "u8"],
  ["void_reason", "u8"],
  ["note_hash", { bytes: 32 }],
];
export const SPONSOR_JOIN_ARGS: Layout = [
  ["side", "u8"],
  ["entry_usd", "u64"],
  ["max_lamports", "u64"],
  ["min_return_bps", "u32"],
  ["expected_entry_total", "u64"],
  ["expected_params_version", "u32"], // lane L15, red team L2: the creation rules' version, as an opening binds it
];
