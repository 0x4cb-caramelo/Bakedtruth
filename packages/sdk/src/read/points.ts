/**
 * Purpose: devnet points (BR-29; TP §3.5 "Points"; Q7 answered a): 1 point per campaign a wallet entered on the side
 *          that won, once that result is final. Volume and profit never score. Computed from the program's own events
 *          (`CampaignOpened`, `EntryAdded`, `LateTallied`, `CampaignResolved`, `CampaignVoided`, `CampaignFinalized`)
 *          and, for a campaign whose account still exists, what that account says now. Pure, so the read API and any
 *          client compute the same table from the same events.
 * Version: 0.2.0 (the Sprint 13 adversarial review: each opening of an address counts apart, since a closed campaign's
 *          id can be opened again; the events are taken in the order given, which must be the chain's)
 * Sprint:  13 (site: ranking, notices and copy)
 *
 * A result is final when no key can change it any more (the read API decides it for a live account: `CampaignNow`); a
 * campaign known only from its events is final once finalized. A void is final but has no right side, so it scores
 * nothing and is not "decided". A join tallied as late (after a YES proof) comes back whole and never scores. A closed
 * campaign's address can carry a new campaign later: every `CampaignOpened` starts a new campaign at that address.
 */
import { Outcome, SettleMode, Side } from "./constants";
import type { DecodedEvent } from "./decoder";

/**
 * Q7 read literally: a wallet with entries on both sides of a campaign scores when either side wins. Whether such a
 * wallet should score is a founder question (Sprint 13); this one constant switches it.
 */
export const BOTH_SIDES_SCORE = true;

/** What a campaign's account says now, when it still exists. */
export type CampaignNow = { outcome: Outcome; final: boolean };

export type FinalResult = "Yes" | "No" | "Void";

/** One wallet's line: its points, the campaigns it entered, and those of them with a final YES or NO. */
export type PointsRow = { wallet: string; points: number; entered: number; decided: number };

type Track = { resolved?: Outcome; voided: boolean; finalized?: SettleMode };
type Stake = { key: string; wallet: string; yes: bigint; no: bigint };

const asResult = (outcome: Outcome | undefined): FinalResult | null =>
  outcome === Outcome.Yes ? "Yes" : outcome === Outcome.No ? "No" : outcome === Outcome.Void ? "Void" : null;

/**
 * The events, already in chain order (oldest first, as the read API's history keeps them: a slot holds many
 * transactions, so their order cannot be rebuilt from slots), each tied to one opening of its campaign:
 * `<address>#<n>`, n counting openings.
 */
function byOpening(events: readonly DecodedEvent[]) {
  const openings = new Map<string, number>();
  const keyOf = (campaign: string) => `${campaign}#${openings.get(campaign) ?? 0}`;
  const tied: { key: string; event: DecodedEvent }[] = [];
  for (const event of events) {
    const campaign = (event.data as { campaign?: string }).campaign;
    if (typeof campaign !== "string") continue;
    if (event.name === "CampaignOpened") openings.set(campaign, (openings.get(campaign) ?? 0) + 1);
    tied.push({ key: keyOf(campaign), event });
  }
  // The account that exists now is the latest opening of its address.
  return { tied, latest: keyOf };
}

/**
 * Each campaign's final result, keyed `<address>#<opening>`. The account's own outcome for the latest opening of an
 * address that still has an account; for any other opening, its events: finalized as a refund or voided is a void,
 * otherwise the outcome read.
 */
export function finalResults(
  events: readonly DecodedEvent[],
  now: ReadonlyMap<string, CampaignNow>,
): Map<string, FinalResult> {
  const { tied, latest } = byOpening(events);
  const tracks = new Map<string, Track>();
  const track = (key: string) => tracks.get(key) ?? tracks.set(key, { voided: false }).get(key)!;
  for (const { key, event } of tied) {
    if (event.name === "CampaignResolved") track(key).resolved = event.data.outcome;
    else if (event.name === "CampaignVoided") track(key).voided = true;
    else if (event.name === "CampaignFinalized") track(key).finalized = event.data.settleMode;
  }
  const results = new Map<string, FinalResult>();
  const live = new Set<string>();
  for (const [campaign, stored] of now) {
    const key = latest(campaign);
    live.add(key);
    const result = stored.final ? asResult(stored.outcome) : null;
    if (result) results.set(key, result);
  }
  for (const [key, t] of tracks) {
    if (live.has(key) || t.finalized === undefined) continue;
    const result = t.voided || t.finalized === SettleMode.Refund ? "Void" : asResult(t.resolved);
    if (result) results.set(key, result);
  }
  return results;
}

/** Every wallet that entered a campaign, with its points; highest points first, then by address. */
export function pointsTable(
  events: readonly DecodedEvent[],
  now: ReadonlyMap<string, CampaignNow>,
  options: { bothSidesScore?: boolean } = {},
): PointsRow[] {
  const bothSidesScore = options.bothSidesScore ?? BOTH_SIDES_SCORE;
  const results = finalResults(events, now);
  // What each wallet has on each side of each campaign, late joins taken out.
  const stakes = new Map<string, Stake>();
  const stake = (key: string, wallet: string) => {
    const id = `${key}|${wallet}`;
    return stakes.get(id) ?? stakes.set(id, { key, wallet, yes: 0n, no: 0n }).get(id)!;
  };
  for (const { key, event } of byOpening(events).tied) {
    if (event.name === "EntryAdded") {
      const s = stake(key, event.data.baker);
      if (event.data.side === Side.Yes) s.yes += event.data.amount;
      else s.no += event.data.amount;
    } else if (event.name === "LateTallied") {
      const s = stake(key, event.data.baker);
      s.yes -= event.data.lateYesAdded;
      s.no -= event.data.lateNoAdded;
    }
  }
  const rows = new Map<string, PointsRow>();
  for (const s of stakes.values()) {
    const row =
      rows.get(s.wallet) ?? rows.set(s.wallet, { wallet: s.wallet, points: 0, entered: 0, decided: 0 }).get(s.wallet)!;
    if (s.yes <= 0n && s.no <= 0n) continue; // only late joins, all refunded: not an entry that called anything
    row.entered += 1;
    const result = results.get(s.key);
    if (result !== "Yes" && result !== "No") continue;
    row.decided += 1;
    const [right, wrong] = result === "Yes" ? [s.yes, s.no] : [s.no, s.yes];
    if (right > 0n && (bothSidesScore || wrong <= 0n)) row.points += 1;
  }
  return [...rows.values()]
    .filter((row) => row.entered > 0)
    .sort((a, b) => b.points - a.points || (a.wallet < b.wallet ? -1 : a.wallet > b.wallet ? 1 : 0));
}

/** Competition ranks over rows already sorted by points: ties share a rank (1, 2, 2, 4). Zero points has no rank. */
export function ranksOf(rows: readonly PointsRow[]): (number | null)[] {
  let rank = 0;
  return rows.map((row, i) => {
    if (i === 0 || row.points !== rows[i - 1].points) rank = i + 1;
    return row.points === 0 ? null : rank;
  });
}
