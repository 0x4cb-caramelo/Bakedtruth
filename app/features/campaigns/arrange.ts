/**
 * Purpose: what the list shows and in which order (Sprint 10): the five states and "saved", the six kinds, the search, the
 *          unlisted switch, and the sort. The default order is the ranking of the sprint's definition of done: two-sided
 *          campaigns first (by entries, then by time left before entries close), then one-sided, then empty ones. A
 *          partner highlight does not exist yet (no partners file), so no card moves up for it.
 * Version: 0.1.0
 * Sprint:  10 (site: campaign list)
 */
import type { Card } from "./model";

export const STATE_FILTERS = ["all", "open", "closed", "in_review", "paid", "void", "saved"] as const;
export type StateFilter = (typeof STATE_FILTERS)[number];
export const SORTS = ["ranking", "pot", "close", "chance"] as const;
export type Sort = (typeof SORTS)[number];

export type Filters = {
  state: StateFilter;
  kind: string | "all";
  query: string;
  sort: Sort;
  showUnlisted: boolean;
};

export const DEFAULT_FILTERS: Filters = { state: "all", kind: "all", query: "", sort: "ranking", showUnlisted: false };

const lower = (value: string | null | undefined) => (value ?? "").toLowerCase();

const matches = (card: Card, filters: Filters, saved: ReadonlySet<string>): boolean => {
  if (filters.state === "saved" && !saved.has(card.address)) return false;
  if (filters.state !== "all" && filters.state !== "saved" && card.state !== filters.state) return false;
  if (filters.kind !== "all" && card.kind !== filters.kind) return false;
  if (!filters.showUnlisted && !card.listed) return false;
  const q = filters.query.trim().toLowerCase();
  if (q === "") return true;
  return [card.title, card.asset, card.kind, card.address, card.creator, card.state].some((field) =>
    lower(field).includes(q),
  );
};

const byBig = (a: bigint | null, b: bigint | null, ascending: boolean): number => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a === b ? 0 : (a < b ? -1 : 1) * (ascending ? 1 : -1);
};

const compare: Record<Sort, (a: Card, b: Card) => number> = {
  ranking: (a, b) => a.group - b.group || b.entries - a.entries || byBig(a.entriesCloseAt, b.entriesCloseAt, true),
  pot: (a, b) => byBig(a.potLamports, b.potLamports, false),
  close: (a, b) => byBig(a.entriesCloseAt, b.entriesCloseAt, true),
  chance: (a, b) => {
    if (a.yesShare === null && b.yesShare === null) return 0;
    if (a.yesShare === null) return 1;
    if (b.yesShare === null) return -1;
    return b.yesShare - a.yesShare;
  },
};

export function arrange(cards: readonly Card[], filters: Filters, saved: ReadonlySet<string>): Card[] {
  return cards.filter((card) => matches(card, filters, saved)).sort(compare[filters.sort]);
}
