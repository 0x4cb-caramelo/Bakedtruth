/**
 * Purpose: the points rule tests' events and live accounts, shaped as the SDK decodes and the read API passes them:
 *          entries, results, finalizations and openings in chain order, and a live account's word (a price campaign
 *          opened by "maker" whose pot splits, unless a test says otherwise).
 * Version: 0.1.0 (moved out of points.test.ts with the founder's answer 3a)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import {
  Outcome,
  pointsTable,
  ReaderKind,
  SettleMode,
  Side,
  type CampaignNow,
  type DecodedEvent,
} from "@brot/sdk/read";

let n = 0;
export const event = (name: string, data: Record<string, unknown>): DecodedEvent =>
  ({
    name,
    discriminator: 0,
    data: { seq: 0n, ...data },
    key: { signature: `sig${++n}`, ixIndex: 0, innerIndex: 0 },
    slot: BigInt(n),
    blockTime: null,
  }) as unknown as DecodedEvent;

export const SOL = 1_000_000_000n;
export const entry = (campaign: string, baker: string, side: Side, amount = SOL) =>
  event("EntryAdded", { campaign, baker, side, isFirst: false, amount });
export const resolved = (campaign: string, outcome: Outcome) => event("CampaignResolved", { campaign, outcome });
export const finalized = (campaign: string, settleMode: SettleMode) =>
  event("CampaignFinalized", { campaign, settleMode });
export const opened = (campaign: string, creator = "maker", kind = ReaderKind.PriceTouch) =>
  event("CampaignOpened", { campaign, creator, kind });
/** A live account's word: a price campaign opened by "maker" whose pot splits, unless the test says otherwise. */
export const now = (outcome: Outcome, final: boolean, more: Partial<CampaignNow> = {}): CampaignNow => ({
  outcome,
  final,
  oneSided: false,
  creator: "maker",
  kind: ReaderKind.PriceTouch,
  ...more,
});
export const live = (pairs: [string, CampaignNow][]) => new Map(pairs);
export const row = (rows: ReturnType<typeof pointsTable>, wallet: string) => rows.find((r) => r.wallet === wallet);
