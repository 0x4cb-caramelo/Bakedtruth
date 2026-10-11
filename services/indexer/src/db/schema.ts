/**
 * Purpose: the indexer's SQLite schema (TP §4, Appendix B, D6 names; Sprint 08) and the version a file must carry
 *          (`PRAGMA user_version`). The projections of the program's events (`events`, `campaigns`, `entries`,
 *          `settlements`, `points`) and the ingest's own place (`signatures`, `checkpoints`) are rebuildable from the
 *          chain; `feed_history` is evidence (A-4), created here and written from a later slice. Amounts are lamport
 *          strings, times Unix seconds, enums their names.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Where it departs from Appendix B's sketch, the chain forced it. A closed campaign's id, and so its address, can carry
 * a new campaign later, so `campaigns` is keyed by (address, opening) and every campaign row keeps its `opening`.
 * `signatures` keeps each listed signature with its place in the chain (`ord`), so a transaction read late, or again
 * for a gap, still sorts where it landed: a slot holds many transactions. `events.raw` keeps the event's own bytes
 * (base58), which the SDK decodes again exactly. `settlements` has no `reserved`: a reserved creator share emits no
 * event (settle_creator_share), so every settlement row is lamports that reached a wallet.
 */
export const SCHEMA_VERSION = 1;

export const SCHEMA: readonly string[] = [
  `CREATE TABLE signatures (
    signature TEXT PRIMARY KEY, slot INTEGER NOT NULL, ord INTEGER NOT NULL UNIQUE, failed INTEGER NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('pending', 'done', 'skipped')), tries INTEGER NOT NULL DEFAULT 0)`,
  `CREATE INDEX signatures_state ON signatures (state, ord)`,
  `CREATE TABLE events (
    signature TEXT NOT NULL, ix_index INTEGER NOT NULL, inner_index INTEGER NOT NULL,
    slot INTEGER NOT NULL, ord INTEGER NOT NULL, block_time INTEGER, name TEXT NOT NULL,
    campaign TEXT, opening INTEGER, seq INTEGER, data TEXT NOT NULL, raw TEXT NOT NULL,
    PRIMARY KEY (signature, ix_index, inner_index))`,
  `CREATE INDEX events_chain ON events (slot, ord, ix_index, inner_index)`,
  `CREATE INDEX events_campaign ON events (campaign, slot, ord, ix_index, inner_index)`,
  `CREATE TABLE campaigns (
    address TEXT NOT NULL, opening INTEGER NOT NULL, id TEXT NOT NULL, kind TEXT NOT NULL, direction TEXT NOT NULL,
    feed_id TEXT NOT NULL, metric_account TEXT NOT NULL, target TEXT NOT NULL, epoch TEXT NOT NULL,
    creator TEXT NOT NULL, creator_is_team INTEGER NOT NULL, creator_share_bps INTEGER NOT NULL,
    template_version INTEGER NOT NULL, fee_bps INTEGER NOT NULL, one_sided_fee_bps INTEGER NOT NULL,
    opening_usd TEXT NOT NULL, opening_paid_lamports TEXT NOT NULL, opening_price TEXT NOT NULL,
    opening_price_exponent INTEGER NOT NULL, prize_lamports TEXT NOT NULL, opening_fee_lamports TEXT NOT NULL,
    status TEXT NOT NULL, outcome TEXT NOT NULL, void_reason TEXT, settle_mode TEXT,
    pool_yes TEXT NOT NULL, pool_no TEXT NOT NULL, entries_open INTEGER NOT NULL,
    opens_at INTEGER NOT NULL, entries_close_at INTEGER NOT NULL, deadline_at INTEGER NOT NULL, review_ends_at INTEGER,
    closed INTEGER NOT NULL, last_seq INTEGER NOT NULL, updated_slot INTEGER NOT NULL, listed INTEGER, rank REAL,
    PRIMARY KEY (address, opening))`,
  `CREATE INDEX campaigns_id ON campaigns (id)`,
  `CREATE TABLE entries (
    signature TEXT NOT NULL, ix_index INTEGER NOT NULL, inner_index INTEGER NOT NULL,
    campaign TEXT NOT NULL, opening INTEGER NOT NULL, seq INTEGER NOT NULL, baker TEXT NOT NULL, side TEXT NOT NULL,
    amount TEXT NOT NULL, is_first INTEGER NOT NULL, is_creator INTEGER NOT NULL,
    pool_yes_after TEXT NOT NULL, pool_no_after TEXT NOT NULL, slot INTEGER NOT NULL, block_time INTEGER,
    PRIMARY KEY (signature, ix_index, inner_index))`,
  `CREATE INDEX entries_baker ON entries (baker)`,
  `CREATE INDEX entries_campaign ON entries (campaign, opening, seq)`,
  `CREATE TABLE settlements (
    signature TEXT NOT NULL, ix_index INTEGER NOT NULL, inner_index INTEGER NOT NULL,
    campaign TEXT NOT NULL, opening INTEGER NOT NULL, seq INTEGER NOT NULL, recipient TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('baker', 'creator', 'opener')), paid TEXT NOT NULL, mode TEXT,
    slot INTEGER NOT NULL, block_time INTEGER,
    PRIMARY KEY (signature, ix_index, inner_index))`,
  `CREATE INDEX settlements_recipient ON settlements (recipient)`,
  `CREATE TABLE points (
    wallet TEXT PRIMARY KEY, points INTEGER NOT NULL, entered INTEGER NOT NULL, decided INTEGER NOT NULL,
    updated_slot INTEGER NOT NULL)`,
  `CREATE TABLE checkpoints (source TEXT PRIMARY KEY, last_signature TEXT NOT NULL, last_slot INTEGER NOT NULL)`,
  `CREATE TABLE feed_history (
    feed_account TEXT NOT NULL, publish_time INTEGER NOT NULL, price TEXT NOT NULL, conf TEXT NOT NULL,
    exponent INTEGER NOT NULL, posted_slot INTEGER, PRIMARY KEY (feed_account, publish_time))`,
];

/**
 * The tables a rebuild must reproduce, each with the columns compared and their order. A signature's `tries` is how the
 * reading went, not what the chain says, so it is left out.
 */
export const REBUILDABLE: readonly { table: string; columns: string; order: string }[] = [
  { table: "signatures", columns: "signature, slot, ord, failed, state", order: "ord" },
  { table: "events", columns: "*", order: "signature, ix_index, inner_index" },
  { table: "campaigns", columns: "*", order: "address, opening" },
  { table: "entries", columns: "*", order: "signature, ix_index, inner_index" },
  { table: "settlements", columns: "*", order: "signature, ix_index, inner_index" },
  { table: "points", columns: "*", order: "wallet" },
  { table: "checkpoints", columns: "*", order: "source" },
];
