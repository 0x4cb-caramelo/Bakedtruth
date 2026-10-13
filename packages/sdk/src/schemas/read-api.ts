/**
 * Purpose: the read API's answers as zod schemas (TP §6, Appendix B; Sprint 08 DoD "/api/v1"): `/api/v1/health`,
 *          the campaign list and one campaign, the leaderboard, the names and the display price, as services/api serves
 *          them today; shared by the API's contract tests, the site and the app. The conventions are the indexer's
 *          (indexer.ts): lamports, slots and times as decimal strings, addresses base58, enums by name, errors as
 *          `ApiErrorSchema`. They describe what is served, so a change is only by adding fields (TP §6).
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { z } from "zod";

import { Direction, Outcome, ReaderKind, Status } from "../read/constants";

const Count = z.string().regex(/^\d+$/, "a whole number as a decimal string");
const Signed = z.string().regex(/^-?\d+$/, "an integer as a decimal string");
const Address = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "a base58 address");
const Hex32 = z.string().regex(/^[0-9a-f]{64}$/, "32 bytes in hex");
const Bps = z.number().int().min(0).max(10_000);
/** A program enum's names (a numeric enum keeps its numbers as keys too), and "unknown" for a byte it does not name. */
const named = (e: Record<string, string | number>) =>
  z.enum(["unknown", ...Object.keys(e).filter((k) => Number.isNaN(Number(k)))] as [string, ...string[]]);

export const ReadApiHealthSchema = z.object({
  status: z.enum(["starting", "ok", "stale"]),
  cluster: z.enum(["devnet", "local"]),
  schema_version: z.number().int().min(1),
  as_of_slot: Count.nullable(),
  taken_at: z.iso.datetime().nullable(),
  campaigns_total: z.number().int().min(0).nullable(),
  last_refresh_error: z.string().nullable(),
  leaderboard_complete: z.boolean().nullable(),
  leaderboard_skipped: z.number().int().min(0).nullable(),
  names_error: z.string().nullable(),
  price_source: z.literal("pyth").nullable(),
  price_error: z.string().nullable(),
  /** The slot of the program's last deploy (its ProgramData), null until read: a client built for another pauses (A-8). */
  program_last_deploy_slot: Count.nullable(),
  /** Entries may be offered (K-11): the API is fresh, the program's entries are not halted, the operator's switch is on. */
  entries_allowed: z.boolean(),
});

/** One campaign as the list and the detail serve it, from its account and the SDK's public state. */
export const PublicCampaignSchema = z.object({
  address: Address,
  id: Count,
  state: z.enum(["open", "closed", "in_review", "paid", "void"]),
  kind: named(ReaderKind),
  status: named(Status),
  outcome: named(Outcome),
  creator: Address,
  creator_is_team: z.boolean(),
  pool_yes: Count,
  pool_no: Count,
  prize_lamports: Count,
  entries_close_at: Count,
  deadline_at: Count,
  review_ends_at: Count.nullable(),
  resolved_at: Count,
  target: Signed,
  metric_account: Address,
  feed_id: Hex32,
  direction: named(Direction),
  price_exponent: z.number().int(),
  opens_at: Count,
  entries_count: z.number().int().min(0),
  fee_bps: Bps,
  one_sided_fee_bps: Bps,
  creator_share_bps: Bps,
});

const Fresh = { as_of_slot: Count, chain_time: Count };
const Page = {
  total: z.number().int().min(0),
  offset: z.number().int().min(0),
  limit: z.number().int().min(1).max(100),
};

export const CampaignListSchema = z.object({ ...Fresh, ...Page, campaigns: z.array(PublicCampaignSchema) });
export const CampaignDetailSchema = z.object({ ...Fresh, campaign: PublicCampaignSchema });

export const LeaderboardRowSchema = z.object({
  rank: z.number().int().min(1).nullable(),
  wallet: Address,
  points: z.number().int().min(0),
  entered: z.number().int().min(1),
});

export const LeaderboardSchema = z.object({
  ...Fresh,
  complete: z.boolean(),
  rule: z.string().min(1),
  both_sides_score: z.boolean(),
  ...Page,
  rows: z.array(LeaderboardRowSchema),
});

export const NamesSchema = z.object({
  chain_time: Count.nullable(),
  names: z.array(
    z.object({ address: Address, kind: z.enum(["burn", "lock", "pool", "stake", "curve"]), name: z.string() }),
  ),
  feeds: z.array(z.object({ feed_id: Hex32, symbol: z.string().min(1), account: Address })),
});

export const PriceSchema = z.object({
  chain_time: Count.nullable(),
  price: z.object({
    asset: z.literal("SOL"),
    currency: z.literal("USD"),
    usd: z.string().regex(/^\d+(\.\d+)?$/, "a decimal string"),
    source: z.literal("pyth"),
    published_at: Count,
    fetched_at: Count,
    stale: z.boolean(),
    attribution: z.string().min(1),
    use: z.string().min(1),
  }),
});

export type ReadApiHealthDto = z.infer<typeof ReadApiHealthSchema>;
export type PublicCampaignDto = z.infer<typeof PublicCampaignSchema>;
export type CampaignListDto = z.infer<typeof CampaignListSchema>;
export type CampaignDetailDto = z.infer<typeof CampaignDetailSchema>;
export type LeaderboardDto = z.infer<typeof LeaderboardSchema>;
export type NamesDto = z.infer<typeof NamesSchema>;
export type PriceDto = z.infer<typeof PriceSchema>;
