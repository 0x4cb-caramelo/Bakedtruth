/**
 * Purpose: the search behind "What should the chain answer?" (spec 3.12; TP §3.6, the creation box), which completes
 *          what a person types into campaigns the chain can check, like a search bar's suggestions: the pinned Pyth
 *          feeds and content/account-names.json, then the templates whose words match, grouped by kind. It reads a
 *          number as the target ("120000", "120,000", "120k"), a direction ("reach", "touch", "fall", "drop"…) and a
 *          duration ("30 days", "2 weeks"). With the live price of a feed it never offers a target already met (the
 *          program refuses one): a target below the price reads "falls to". An empty box starts with examples a fair
 *          way off the price. Outside the grammar, "we can't check this on-chain" and the three nearest templates.
 *          Pure and local: the query is never sent or stored (D-j); a pick fills only these fields, which the box then
 *          checks like typed ones. A graduation campaign is offered no target: its curve's threshold is its target.
 * Version: 0.3.0 (the sixth kind; 0.2.0, the UI overhaul: direction, duration, "k", live prices and examples)
 * Sprint:  19 (site: open a campaign), in the UI overhaul; the sixth kind's site
 */
import type { KindName } from "../campaign-page/proof";
import { TEMPLATES } from "./kinds";
import type { KnownName } from "./names";

export type Suggestion = {
  kind: KindName;
  feedHex?: string;
  feedSymbol?: string;
  account?: string;
  name?: string;
  /** In the kind's unit, as the target field takes it. */
  target?: string;
  direction?: "above" | "below";
  /** A deadline this many days from now, when the query says one (3 to 90). */
  days?: number;
  /** The target is a suggestion of ours, not a number the person typed. */
  example?: boolean;
  /** The feed has no fresh, verified price right now: the box will say so. */
  stale?: boolean;
};
export type SearchResult = { outside: boolean; items: Suggestion[] };

/** A pinned feed; `usable` and `price` (US$) when the box has read it. */
export type FeedSource = { hex: string; symbol: string; usable?: boolean; price?: number | null };
export type SearchSources = { feeds: readonly FeedSource[]; names: readonly KnownName[] };

const ALIASES: Record<string, string[]> = { BTC: ["bitcoin"], SOL: ["solana"], ETH: ["ether", "ethereum"] };
const BELOW = ["fall", "falls", "drop", "drops", "dip", "dips", "below", "under", "down", "sink", "sinks", "crash"];
const ABOVE = ["reach", "reaches", "touch", "touches", "hit", "hits", "above", "over", "up", "rise", "rises"];
// Words that join a sentence and name nothing: "in" would find INF/USD and "to" the burn kind's "token".
const STOP = ["in", "to", "at", "by", "on", "of", "the", "for", "and", "or", "is", "it", "be", "will", "than", "from"];

// The examples an empty box starts with come from the best-known assets first, then in the list's order.
const FAMOUS = ["BTC", "SOL", "ETH"];
const fame = (f: FeedSource) => {
  const i = FAMOUS.indexOf(f.symbol.split("/")[0]);
  return i < 0 ? FAMOUS.length : i;
};

const allKinds = (): Suggestion[] => TEMPLATES.map((t) => ({ kind: t.kind }));

/** Grouped by kind, the groups in the order of their best suggestion: the order the list shows and the arrows walk. */
const grouped = (items: Suggestion[]) =>
  [...new Set(items.map((s) => s.kind))].flatMap((kind) => items.filter((s) => s.kind === kind));

function trigrams(text: string): Set<string> {
  const grams = new Set<string>();
  for (let i = 0; i + 3 <= text.length; i++) grams.add(text.slice(i, i + 3));
  return grams;
}

/** "30 days", "30d", "2 weeks", "1 month": the deadline in days, kept within the program's 3 to 90; and the rest. */
function daysIn(query: string): { days?: number; rest: string } {
  const m = /(\d+)\s*(d|days?|w|weeks?|mo|months?)\b/.exec(query);
  if (!m) return { rest: query };
  const per = m[2].startsWith("w") ? 7 : m[2].startsWith("mo") ? 30 : 1;
  const days = Math.min(90, Math.max(3, Number(m[1]) * per));
  return { days, rest: query.slice(0, m.index) + query.slice(m.index + m[0].length) };
}

/**
 * A plain number in the query ("120000", "120,000", "0.5", "120k", "2m"), for the target field. A comma only groups
 * thousands, as in the field itself: "0,5" suggests no target rather than 5 (the Sprint 19 adversarial review, M5).
 */
function numberIn(query: string): string | undefined {
  const match = /\d[\d,]*(?:\.\d+)?(\s*[km]\b)?/.exec(query);
  if (!match) return undefined;
  const typed = match[0].replace(/\s*[km]$/, "").replace(/,+$/, "");
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(typed)) return undefined;
  const plain = typed.replace(/,/g, "");
  if (!match[1]) return plain;
  const [whole, frac = ""] = plain.split(".");
  const zeros = match[1].trim() === "k" ? 3 : 6;
  if (frac.length > zeros) return undefined;
  return BigInt(whole + frac.padEnd(zeros, "0")).toString();
}

/** A round example target a fair way off the price, so a fresh draft is never decided at birth (the prototype's). */
function exampleTarget(price: number, direction: "above" | "below"): string {
  const value = Number((price * (direction === "below" ? 0.85 : 1.25)).toPrecision(2));
  // Under 1e-6 JavaScript writes "1.5e-7", which the target field refuses: written out instead.
  return value >= 1e-6 ? String(value) : value.toFixed(Math.min(20, 1 - Math.floor(Math.log10(value))));
}

/** One feed's suggestion: the person's number and direction, or our example; never a target already met. */
function feedSuggestion(f: FeedSource, target: string | undefined, said: "above" | "below" | undefined): Suggestion {
  const base: Suggestion = { kind: "price", feedHex: f.hex, feedSymbol: f.symbol };
  if (f.usable === false) return { ...base, target, direction: said, stale: true };
  const price = f.price != null && f.price > 0 ? f.price : null;
  if (target === undefined) {
    if (price === null) return { ...base, direction: said };
    const direction = said ?? "above";
    return { ...base, direction, target: exampleTarget(price, direction), example: true };
  }
  if (price === null) return said ? { ...base, target, direction: said } : { ...base, target };
  // A target on the far side of the price only reads one way: reaching it from below, or falling to it from above.
  const direction = Number(target) > price ? "above" : "below";
  return { ...base, target, direction };
}

export function search(query: string, sources: SearchSources, limit = 12): SearchResult {
  const q = query.trim().toLowerCase();
  const fresh = sources.feeds
    .filter((f) => f.usable && f.price != null && f.price > 0)
    .sort((a, b) => fame(a) - fame(b));
  if (!q)
    return {
      outside: false,
      items: [...fresh.slice(0, 3).map((f) => feedSuggestion(f, undefined, undefined)), ...allKinds()],
    };
  const { days, rest } = daysIn(q);
  const target = numberIn(rest);
  const words = rest.split(/[^a-z0-9$]+/).filter((w) => w.length > 1 && !/^\d/.test(w) && !STOP.includes(w));
  const said = words.some((w) => BELOW.includes(w))
    ? "below"
    : words.some((w) => ABOVE.includes(w))
      ? "above"
      : undefined;
  const hit = (keys: string[]) =>
    words.some((w) => keys.some((k) => k.startsWith(w) || (w.length > 3 && w.startsWith(k))));
  const items: Suggestion[] = [];
  for (const feed of sources.feeds) {
    const asset = feed.symbol.split("/")[0];
    const keys = [asset.toLowerCase(), feed.symbol.toLowerCase(), ...(ALIASES[asset] ?? [])];
    if (hit(keys)) items.push(feedSuggestion(feed, target, said));
  }
  // A price word or a bare number, and no asset: the fresh feeds whose price is near the number, closest first.
  const priceWords = hit([...(TEMPLATES.find((t) => t.kind === "price")?.words ?? [])]) || said !== undefined;
  if (!items.some((it) => it.kind === "price") && (priceWords || (target && words.length === 0))) {
    const near = fresh
      .filter((f) => !target || (Number(target) > f.price! / 3 && Number(target) < f.price! * 3))
      .sort((a, b) =>
        target ? Math.abs(Math.log(Number(target) / a.price!)) - Math.abs(Math.log(Number(target) / b.price!)) : 0,
      );
    for (const f of near.slice(0, 3)) items.push(feedSuggestion(f, target, said));
  }
  for (const known of sources.names) {
    const keys = known.name
      .toLowerCase()
      .split(/[^a-z0-9$]+/)
      .filter(Boolean);
    if (hit(keys) || known.address === query.trim())
      items.push({ kind: known.kind, account: known.address, name: known.name, target });
  }
  for (const t of TEMPLATES) {
    const named = items.some((it) => it.kind === t.kind);
    const typed = t.kind === "price" || t.kind === "curve" ? undefined : target;
    if (!named && hit([...t.words])) items.push({ kind: t.kind, target: typed });
  }
  const withDays = (list: Suggestion[]) => (days ? list.map((it) => ({ ...it, days })) : list);
  if (items.length > 0) return { outside: false, items: withDays(grouped(items.slice(0, limit))) };
  if (q.length < 3) return { outside: false, items: allKinds() };
  const grams = trigrams(q);
  const score = (list: readonly string[]) => [...trigrams(list.join(" "))].filter((g) => grams.has(g)).length;
  const nearest = [...TEMPLATES].sort((a, b) => score(b.words) - score(a.words)).slice(0, 3);
  return { outside: true, items: nearest.map((t) => ({ kind: t.kind })) };
}
