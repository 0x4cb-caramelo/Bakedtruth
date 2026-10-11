/**
 * Purpose: the search behind "What should the chain answer?" (spec 3.12; TP §3.6, the creation box): known names first
 *          (the pinned Pyth feeds and content/account-names.json), then the templates whose words match; a number in
 *          the query becomes a suggested target. Outside the grammar, "we can't check this on-chain" and the three
 *          nearest templates by shared trigrams. Pure and local: the query is never sent, stored or put in the draft
 *          (D-j); only a picked suggestion fills slots, and only with values the box already knows.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
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
  target?: string;
};
export type SearchResult = { outside: boolean; items: Suggestion[] };

export type SearchSources = { feeds: readonly { hex: string; symbol: string }[]; names: readonly KnownName[] };

const ALIASES: Record<string, string[]> = { BTC: ["bitcoin"], SOL: ["solana"], ETH: ["ether", "ethereum"] };

const allKinds = (): Suggestion[] => TEMPLATES.map((t) => ({ kind: t.kind }));

function trigrams(text: string): Set<string> {
  const grams = new Set<string>();
  for (let i = 0; i + 3 <= text.length; i++) grams.add(text.slice(i, i + 3));
  return grams;
}

/** A plain number in the query ("120000", "120,000", "0.5"), as typed, for the target slot. */
function numberIn(query: string): string | undefined {
  const match = /\d[\d,]*(?:\.\d+)?/.exec(query);
  return match ? match[0].replace(/,/g, "") : undefined;
}

export function search(query: string, sources: SearchSources, limit = 12): SearchResult {
  const q = query.trim().toLowerCase();
  if (!q) return { outside: false, items: allKinds() };
  const target = numberIn(q);
  const words = q.split(/[^a-z0-9$]+/).filter((w) => w.length > 1 && !/^\d/.test(w));
  const hit = (keys: string[]) =>
    words.some((w) => keys.some((k) => k.startsWith(w) || (w.length > 3 && w.startsWith(k))));
  const items: Suggestion[] = [];
  for (const feed of sources.feeds) {
    const asset = feed.symbol.split("/")[0];
    const keys = [asset.toLowerCase(), feed.symbol.toLowerCase(), ...(ALIASES[asset] ?? [])];
    if (hit(keys)) items.push({ kind: "price", feedHex: feed.hex, feedSymbol: feed.symbol, target });
  }
  for (const known of sources.names) {
    const keys = known.name
      .toLowerCase()
      .split(/[^a-z0-9$]+/)
      .filter(Boolean);
    if (hit(keys) || known.address === query.trim())
      items.push({ kind: known.kind, account: known.address, name: known.name });
  }
  for (const t of TEMPLATES) {
    const named = items.some((it) => it.kind === t.kind);
    if (!named && hit([...t.words])) items.push({ kind: t.kind, target: t.kind === "price" ? undefined : target });
  }
  if (items.length > 0) return { outside: false, items: items.slice(0, limit) };
  if (q.length < 3) return { outside: false, items: allKinds() };
  const grams = trigrams(q);
  const score = (words: readonly string[]) => [...trigrams(words.join(" "))].filter((g) => grams.has(g)).length;
  const nearest = [...TEMPLATES].sort((a, b) => score(b.words) - score(a.words)).slice(0, 3);
  return { outside: true, items: nearest.map((t) => ({ kind: t.kind })) };
}
