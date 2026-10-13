/**
 * Purpose: the indexer's read routes as zod schemas (TP §6, Appendix B; Sprint 08, slice 2), shared by the indexer
 *          that serves them, the site and the app that read them, and the contract tests: one campaign's activity
 *          (its entries, settlements and other events, in chain order) and the history of its YES/NO split, the
 *          recent entries across campaigns, and one wallet's entries with what it received. The read API's
 *          conventions: amounts as lamport strings, addresses base58, slots and times as decimal strings (Unix
 *          seconds, UTC), every answer with `as_of_slot` and `chain_time`, errors as `{ error: { code, message } }`.
 *          A campaign is its address plus its `opening` (1, 2…): a closed campaign's address can carry a new one.
 *          Since slice 3, the home page's order (`/api/v1/ranking`); a campaign's activity and chance and a wallet's
 *          entries come in pages, each answer with `next_before` (the `?before=` of the page before it, or null on the
 *          last page): a campaign's lists by `seq`, a wallet's rows by its first entry's place in the chain.
 * Version: 0.3.0 (the pages' `next_before`; 0.2.0, the ranking)
 * Sprint:  08 (indexer, API, relay and points), slices 2 and 3
 */
import { z } from "zod";

const Lamports = z.string().regex(/^\d+$/, "lamports as a decimal string");
const Count = z.string().regex(/^\d+$/, "a whole number as a decimal string");
const Address = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "a base58 address");
const Signature = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{64,88}$/, "a base58 signature");
/** Unix seconds, UTC; `null` when the node gave no block time. */
const Time = Count.nullable();
const Opening = z.number().int().min(1);
const Side = z.enum(["yes", "no"]);

/** Where an item sits in the chain: its transaction, slot, block time and, for a campaign's event, its `seq`. */
const Placed = { signature: Signature, slot: Count, block_time: Time, campaign: Address, opening: Opening };

export const EntryItemSchema = z.object({
  type: z.literal("entry"),
  ...Placed,
  seq: Count,
  baker: Address,
  side: Side,
  amount: Lamports,
  /** The wallet is the pot's first baker (Q3): it pays no one-sided fee. */
  is_first: z.boolean(),
  /** The creator's own wallet entered (BR-26). */
  is_creator: z.boolean(),
  pool_yes_after: Lamports,
  pool_no_after: Lamports,
});

export const SettlementItemSchema = z.object({
  type: z.literal("settlement"),
  ...Placed,
  seq: Count,
  recipient: Address,
  role: z.enum(["baker", "creator", "opener"]),
  /** Lamports that reached the recipient's wallet. */
  paid: Lamports,
  mode: z.string().nullable(),
});

/** Any other event of the campaign (`CampaignOpened`, `CampaignResolved`, `CampaignFinalized`…), by name. */
export const EventItemSchema = z.object({
  type: z.literal("event"),
  ...Placed,
  seq: Count.nullable(),
  name: z.string(),
});

export const ActivityItemSchema = z.discriminatedUnion("type", [
  EntryItemSchema,
  SettlementItemSchema,
  EventItemSchema,
]);

/** Every answer: the last slot the indexer has read in full, and that slot's block time. */
const Fresh = { as_of_slot: Count, chain_time: Time };

/** A campaign list's cursor: the `seq` to pass as `?before=` for the older page; null on the last page. */
const SeqCursor = Count.nullable();
/** A wallet list's cursor, `<slot>:<signature>:<instruction>:<inner>` of a row's first entry; null on the last page. */
const WalletCursor = z
  .string()
  .regex(/^\d{1,15}:[1-9A-HJ-NP-Za-km-z]{64,88}:\d{1,3}:\d{1,3}$/, "a wallet list's cursor")
  .nullable();

export const CampaignActivitySchema = z.object({
  ...Fresh,
  campaign: Address,
  opening: Opening,
  items: z.array(ActivityItemSchema),
  next_before: SeqCursor,
});

/** The split after one entry, from the pools the program wrote in its `EntryAdded`. */
export const ChancePointSchema = z.object({
  seq: Count,
  slot: Count,
  block_time: Time,
  pool_yes: Lamports,
  pool_no: Lamports,
  /** YES's share of the pot in basis points, rounded down. */
  yes_bps: z.number().int().min(0).max(10_000),
});

export const ChanceSchema = z.object({
  ...Fresh,
  campaign: Address,
  opening: Opening,
  points: z.array(ChancePointSchema),
  next_before: SeqCursor,
});

export const RecentActivitySchema = z.object({ ...Fresh, items: z.array(EntryItemSchema) });

/** One wallet in one campaign: its two sides, its entry count and what reached it, with the campaign's result. */
export const WalletEntrySchema = z.object({
  campaign: Address,
  opening: Opening,
  id: Count,
  kind: z.string(),
  status: z.string(),
  outcome: z.string(),
  yes: Lamports,
  no: Lamports,
  entries: z.number().int().min(1),
  /** Every settlement to this wallet as a baker; the creator's share and a returned prize are not counted here. */
  received: Lamports,
  first_slot: Count,
  last_slot: Count,
});

export const WalletEntriesSchema = z.object({
  ...Fresh,
  wallet: Address,
  items: z.array(WalletEntrySchema),
  next_before: WalletCursor,
});

/** One live opening in the home page's order: 1 is first; `listed` false is off the home page, still reachable. */
export const RankedCampaignSchema = z.object({
  campaign: Address,
  opening: Opening,
  id: Count,
  rank: z.number().int().min(1),
  listed: z.boolean(),
});

export const RankingSchema = z.object({
  ...Fresh,
  total: z.number().int().min(0),
  offset: z.number().int().min(0),
  limit: z.number().int().min(1).max(100),
  items: z.array(RankedCampaignSchema),
});

export const ApiErrorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

export type EntryItem = z.infer<typeof EntryItemSchema>;
export type SettlementItem = z.infer<typeof SettlementItemSchema>;
export type EventItem = z.infer<typeof EventItemSchema>;
export type ActivityItem = z.infer<typeof ActivityItemSchema>;
export type CampaignActivity = z.infer<typeof CampaignActivitySchema>;
export type ChancePoint = z.infer<typeof ChancePointSchema>;
export type Chance = z.infer<typeof ChanceSchema>;
export type RecentActivity = z.infer<typeof RecentActivitySchema>;
export type WalletEntry = z.infer<typeof WalletEntrySchema>;
export type WalletEntries = z.infer<typeof WalletEntriesSchema>;
export type RankedCampaign = z.infer<typeof RankedCampaignSchema>;
export type Ranking = z.infer<typeof RankingSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
