/**
 * Purpose: the program's events as layouts: an inner instruction to the program whose data is
 *          [0xFF, discriminator, payload], signed by the event authority (T4). Mirrors events.rs.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); frozen at the sprint's opening with the program's contract
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
};
