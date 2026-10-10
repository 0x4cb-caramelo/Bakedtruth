/**
 * Purpose: the program's events as layouts: an inner instruction to the program whose data is
 *          [0xFF, discriminator, payload], signed by the event authority (T4). Mirrors events.rs.
 * Version: 0.0.3
 * Sprint:  02 (pot core on Pinocchio); Sprint 03 adds `CampaignResolved` and the opening's `epoch`; Sprint 04 adds
 *          the team's `ResultConfirmed` and `CampaignVoided` and the snapshot's `CampaignFinalized`
 */
import type { Layout } from "./layouts";
import { CREATION_PARAMS } from "./structs";

export const EVENTS: Record<string, { discriminator: number; layout: Layout }> = {
  ConfigInitialized: {
    discriminator: 0,
    layout: [
      ["signer", "pubkey"],
      ["admin", "pubkey"],
      ["fee_recipient", "pubkey"],
      ["params", { struct: CREATION_PARAMS }],
    ],
  },
  ConfigChanged: {
    discriminator: 1,
    layout: [
      ["change", "u8"],
      ["signer", "pubkey"],
      ["admin", "pubkey"],
      ["pending_admin", "pubkey"],
      ["fee_recipient", "pubkey"],
      ["team_len", "u8"],
      ["team", { pubkeys: 5 }],
      ["params", { struct: CREATION_PARAMS }],
    ],
  },
  EntriesPaused: { discriminator: 2, layout: [["signer", "pubkey"]] },
  EntriesResumed: { discriminator: 3, layout: [["signer", "pubkey"]] },
  CampaignOpened: {
    discriminator: 4,
    layout: [
      ["campaign", "pubkey"],
      ["seq", "u64"],
      ["id", "u64"],
      ["creator", "pubkey"],
      ["creator_is_team", "bool"],
      ["kind", "u8"],
      ["direction", "u8"],
      ["feed_id", { bytes: 32 }],
      ["metric_account", "pubkey"],
      ["target", "i128"],
      ["price_exponent", "i32"],
      ["max_age", "u32"],
      ["template_version", "u16"],
      ["opens_at", "i64"],
      ["entries_close_at", "i64"],
      ["deadline_at", "i64"],
      ["fee_bps", "u16"],
      ["one_sided_fee_bps", "u16"],
      ["creator_share_bps", "u16"],
      ["opening_usd", "u64"],
      ["opening_paid_lamports", "u64"],
      ["opening_price", "i64"],
      ["opening_price_exponent", "i32"],
      ["opening_price_publish_time", "i64"],
      ["prize_lamports", "u64"],
      ["opening_fee_lamports", "u64"],
      ["epoch", "u64"],
    ],
  },
  EntryAdded: {
    discriminator: 5,
    layout: [
      ["campaign", "pubkey"],
      ["seq", "u64"],
      ["baker", "pubkey"],
      ["side", "u8"],
      ["is_first", "bool"],
      ["amount", "u64"],
      ["pool_yes", "u64"],
      ["pool_no", "u64"],
      ["entry_yes", "u64"],
      ["entry_no", "u64"],
    ],
  },
  CampaignResolved: {
    discriminator: 6,
    layout: [
      ["campaign", "pubkey"],
      ["seq", "u64"],
      ["kind", "u8"],
      ["outcome", "u8"],
      ["void_reason", "u8"],
      ["met_late", "bool"],
      ["observed_value", "i128"],
      ["read_account", "pubkey"],
      ["publish_time", "i64"],
      ["posted_slot", "u64"],
      ["resolved_at", "i64"],
      ["review_ends_at", "i64"],
      ["slot", "u64"],
      ["epoch", "u64"],
    ],
  },
  ResultConfirmed: {
    discriminator: 7,
    layout: [
      ["campaign", "pubkey"],
      ["seq", "u64"],
      ["signer", "pubkey"],
      ["outcome", "u8"],
    ],
  },
  CampaignVoided: {
    discriminator: 8,
    layout: [
      ["campaign", "pubkey"],
      ["seq", "u64"],
      ["signer", "pubkey"],
      ["void_reason", "u8"],
      ["note_hash", { bytes: 32 }],
    ],
  },
  CampaignFinalized: {
    discriminator: 10,
    layout: [
      ["campaign", "pubkey"],
      ["seq", "u64"],
      ["settle_mode", "u8"],
      ["winning_total", "u64"],
      ["losing_total", "u64"],
      ["refunded_late", "u64"],
      ["fee_total", "u64"],
      ["from_pot", "u64"],
      ["from_fee", "u64"],
      ["distributable", "u64"],
    ],
  },
};
