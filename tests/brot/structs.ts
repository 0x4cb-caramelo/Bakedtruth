/**
 * Purpose: the program's structs as layouts: accounts (GlobalConfig, Campaign, Entry), instruction
 *          arguments and events, each in the field order of its Rust struct.
 * Version: 0.0.2
 * Sprint:  02 (pot core on Pinocchio); Sprint 03 adds `epoch`, `params_version` and the opening's
 *          `epoch` and `expected_params_version`, frozen at its opening
 */
import type { Layout } from "./layouts";

export const CREATION_PARAMS: Layout = [
  ["opening_fee_usd", "u64"],
  ["opening_prize_bps", "u16"],
  ["fee_bps", "u16"],
  ["one_sided_fee_bps", "u16"],
  ["creator_share_bps", "u16"],
  ["max_open_campaigns", "u32"],
  ["min_entry_lamports", "u64"],
  ["sol_usd_feed_id", { bytes: 32 }],
  ["max_price_age", "u32"],
  ["max_price_conf_bps", "u16"],
  ["campaign_max_age", "u32"],
];

export const GLOBAL_CONFIG: Layout = [
  ["tag", "u8"],
  ["version", "u8"],
  ["bump", "u8"],
  ["fee_vault_bump", "u8"],
  ["operating_level", "u8"],
  ["team_len", "u8"],
  ["admin", "pubkey"],
  ["pending_admin", "pubkey"],
  ["team", { pubkeys: 5 }],
  ["fee_recipient", "pubkey"],
  ["params", { struct: CREATION_PARAMS }],
  ["open_campaigns", "u32"],
  ["params_version", "u32"],
  ["_reserved", { bytes: 60 }],
];

export const CAMPAIGN: Layout = [
  ["tag", "u8"],
  ["version", "u8"],
  ["bump", "u8"],
  ["vault_bump", "u8"],
  ["kind", "u8"],
  ["direction", "u8"],
  ["status", "u8"],
  ["outcome", "u8"],
  ["settle_mode", "u8"],
  ["void_reason", "u8"],
  ["contest_stage", "u8"],
  ["creator_is_team", "bool"],
  ["met_late", "bool"],
  ["creator_share_settled", "bool"],
  ["fee_collected", "bool"],
  ["prize_settled", "bool"],
  ["id", "u64"],
  ["creator", "pubkey"],
  ["rent_payer", "pubkey"],
  ["template_version", "u16"],
  ["creator_share_bps", "u16"],
  ["fee_bps", "u16"],
  ["one_sided_fee_bps", "u16"],
  ["feed_id", { bytes: 32 }],
  ["metric_account", "pubkey"],
  ["target", "i128"],
  ["price_exponent", "i32"],
  ["max_age", "u32"],
  ["opens_at", "i64"],
  ["entries_close_at", "i64"],
  ["deadline_at", "i64"],
  ["opening_usd", "u64"],
  ["opening_paid_lamports", "u64"],
  ["opening_price", "i64"],
  ["opening_price_exponent", "i32"],
  ["opening_price_publish_time", "i64"],
  ["prize_lamports", "u64"],
  ["opening_fee_lamports", "u64"],
  ["pool_yes", "u64"],
  ["pool_no", "u64"],
  ["first_baker", "pubkey"],
  ["entries_open", "u32"],
  ["event_seq", "u64"],
  ["observed_value", "i128"],
  ["resolved_at", "i64"],
  ["review_ends_at", "i64"],
  ["contest_ends_at", "i64"],
  ["void_note_hash", { bytes: 32 }],
  ["winning_total", "u64"],
  ["losing_total", "u64"],
  ["distributable", "u64"],
  ["fee_total", "u64"],
  ["creator_share", "u64"],
  ["creator_share_from_fee", "u64"],
  ["paid_out_total", "u64"],
  ["epoch", "u64"],
  ["_reserved", { bytes: 56 }],
];

export const ENTRY: Layout = [
  ["tag", "u8"],
  ["version", "u8"],
  ["bump", "u8"],
  ["is_first", "bool"],
  ["campaign", "pubkey"],
  ["baker", "pubkey"],
  ["amount_yes", "u64"],
  ["amount_no", "u64"],
  ["_reserved", { bytes: 16 }],
];

// --- Instruction arguments (after the one-byte discriminator) ---------------------------------

export const INITIALIZE_CONFIG_ARGS: Layout = [
  ["admin", "pubkey"],
  ["fee_recipient", "pubkey"],
  ["params", { struct: CREATION_PARAMS }],
];
export const SET_TEAM_ARGS: Layout = [
  ["team_len", "u8"],
  ["team", { pubkeys: 5 }],
];
export const SET_FEE_RECIPIENT_ARGS: Layout = [["fee_recipient", "pubkey"]];
export const TRANSFER_ADMIN_ARGS: Layout = [["new_admin", "pubkey"]];
export const OPEN_CAMPAIGN_ARGS: Layout = [
  ["id", "u64"],
  ["kind", "u8"],
  ["direction", "u8"],
  ["feed_id", { bytes: 32 }],
  ["target", "i128"],
  ["deadline_at", "i64"],
  ["opening_usd", "u64"],
  ["max_lamports", "u64"],
  ["epoch", "u64"],
  ["expected_params_version", "u32"],
];
export const JOIN_CAMPAIGN_ARGS: Layout = [
  ["side", "u8"],
  ["amount", "u64"],
  ["min_return_bps", "u32"],
  ["expected_entry_total", "u64"],
];
