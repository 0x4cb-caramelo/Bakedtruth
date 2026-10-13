/**
 * Purpose: devnet points (BR-29; TP §3.5 "Points"; Q7 answered a, narrowed by the founder's answer 3a): 1 point per
 *          campaign a wallet entered on the side that won, once that result is final and the pot splits; never for a
 *          wallet with entries on both sides, nor for the creator's own wallet on a campaign whose result the creator
 *          can control. Volume and profit never score. Computed from the program's own events (`CampaignOpened`,
 *          `EntryAdded`, `LateTallied`, `CampaignResolved`, `CampaignVoided`, `CampaignFinalized`) and, for a campaign
 *          whose account still exists, what that account says now. Pure, so the read API and any client compute the
 *          same table from the same events.
 * Version: 0.3.0 (the founder's answer 3a, 2026-10-10: no point on both sides, in a refunded pot, or for the creator's
 *          own wallet on a burn, lock or stake campaign)
 * Sprint:  13 (site: ranking, notices and copy)
 *
 * A result is final when no key can change it any more (the read API decides it for a live account: `CampaignNow`); a
 * campaign known only from its events is final once finalized. A void is final but has no right side, so it scores
 * nothing and is not "decided". A pot refunded as one-sided (one side empty, or a losing side too small to pay the
 * fees) is decided but scores nothing: every entry came back. A join tallied as late (after a YES proof) comes back
 * whole and never scores. A closed campaign's address can carry a new campaign later: every `CampaignOpened` starts a
 * new campaign at that address. Only the wallet that opened a campaign is known on-chain: the creator's other wallets
 * cannot be told apart from anyone's, and still score.
 */
import { Outcome, ReaderKind, SettleMode, Side } from "./constants";
import type { DecodedEvent } from "./decoder";

/** Whether a wallet with entries on both sides of a campaign scores when either side wins: no (the founder's 3a). */
export const BOTH_SIDES_SCORE = false;

/**
 * Whether whoever opened a campaign of this kind can control its result (a burn, a lock, a stake, a curve's graduation,
 * which whoever pays the rest of the curve completes): every kind but a price, the kinds whose pages carry the creator
 * notice. The creator's own wallet never scores on them.
 */
export const creatorCanControl = (kind: ReaderKind): boolean => kind !== ReaderKind.PriceTouch;

/** What a campaign's account says now, when it still exists. */
export type CampaignNow = {
  outcome: Outcome;
  final: boolean;
  /** Its pot is, or will be at finalize, refunded as one-sided: one side empty, or a losing side too small to pay. */
  oneSided: boolean;
  creator: string;
  kind: ReaderKind;
};

export type FinalResult = "Yes" | "No" | "Void";

/** A final result, with what decides who scores on it; no creator or kind when its opening was never read. */
export type Final = { result: FinalResult; oneSided: boolean; creator?: string; kind?: ReaderKind };

/** One wallet's line: its points, the campaigns it entered, and those of them with a final YES or NO. */
export type PointsRow = { wallet: string; points: number; entered: number; decided: number };

type Opening = { creator?: string; kind?: ReaderKind; resolved?: Outcome; voided: boolean; finalized?: SettleMode };
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
 * Each campaign's final result, keyed `<address>#<opening>`. The account's own word for the latest opening of an
 * address that still has an account; for any other opening, its events: finalized as a refund or voided is a void,
 * otherwise the outcome read, one-sided when finalized so.
 */
export function finalResults(
  events: readonly DecodedEvent[],
  now: ReadonlyMap<string, CampaignNow>,
): Map<string, Final> {
  const { tied, latest } = byOpening(events);
  const openings = new Map<string, Opening>();
  const at = (key: string) => openings.get(key) ?? openings.set(key, { voided: false }).get(key)!;
  for (const { key, event } of tied) {
    if (event.name === "CampaignOpened") Object.assign(at(key), { creator: event.data.creator, kind: event.data.kind });
    else if (event.name === "CampaignResolved") at(key).resolved = event.data.outcome;
    else if (event.name === "CampaignVoided") at(key).voided = true;
    else if (event.name === "CampaignFinalized") at(key).finalized = event.data.settleMode;
  }
  const finals = new Map<string, Final>();
  const live = new Set<string>();
  for (const [campaign, stored] of now) {
    const key = latest(campaign);
    live.add(key);
    const result = stored.final ? asResult(stored.outcome) : null;
    if (result) finals.set(key, { result, oneSided: stored.oneSided, creator: stored.creator, kind: stored.kind });
  }
  for (const [key, o] of openings) {
    if (live.has(key) || o.finalized === undefined) continue;
    const result = o.voided || o.finalized === SettleMode.Refund ? "Void" : asResult(o.resolved);
    const oneSided = o.finalized === SettleMode.OneSided;
    if (result) finals.set(key, { result, oneSided, creator: o.creator, kind: o.kind });
  }
  return finals;
}

/** Whether `wallet` opened the campaign and could control its result. */
const createdIt = (wallet: string, final: Final) =>
  final.creator === wallet && final.kind !== undefined && creatorCanControl(final.kind);

/** Every wallet that entered a campaign, with its points; highest points first, then by address. */
export function pointsTable(
  events: readonly DecodedEvent[],
  now: ReadonlyMap<string, CampaignNow>,
  options: { bothSidesScore?: boolean } = {},
): PointsRow[] {
  const bothSidesScore = options.bothSidesScore ?? BOTH_SIDES_SCORE;
  const finals = finalResults(events, now);
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
    const final = finals.get(s.key);
    if (!final || final.result === "Void") continue;
    row.decided += 1;
    const [right, wrong] = final.result === "Yes" ? [s.yes, s.no] : [s.no, s.yes];
    if (right <= 0n || final.oneSided || (wrong > 0n && !bothSidesScore) || createdIt(s.wallet, final)) continue;
    row.points += 1;
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
