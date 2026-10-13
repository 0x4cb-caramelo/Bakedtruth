/**
 * Purpose: graduation curves named on every screen (curve-name.ts): the reviewed names, which the root layout reads on
 *          the server from content/account-names.json and hands down once, and `useCurveNames`, which names any pool
 *          from them or, for the others, from its token's ticker read in the browser (curve-tokens.ts). A pool not read
 *          yet, or whose read failed, is "Token (…7Dny)"; a reviewed pool is named at once and never read. Then
 *          `useNamedCards`, the list's cards with their curves named.
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05
 */
"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AccountName } from "@brot/sdk/schemas";

import { rpc } from "@/lib/rpc";
import { curveName, reviewedCurves } from "./curve-name";
import { pageCache, readCurveTokens, type CurveTokens } from "./curve-tokens";
import { cardTitle, type Card } from "./model";

const Reviewed = createContext<ReadonlyMap<string, string>>(new Map());

export function CurveNamesProvider({ names, children }: { names: readonly AccountName[]; children: ReactNode }) {
  const reviewed = useMemo(() => reviewedCurves(names), [names]);
  return <Reviewed.Provider value={reviewed}>{children}</Reviewed.Provider>;
}

/** What the page already knows of `pools`: the reads that settled before this screen mounted. */
const settledOf = (pools: readonly string[]): CurveTokens =>
  new Map(pools.filter((p) => pageCache.settled.has(p)).map((p) => [p, pageCache.settled.get(p) ?? null]));

/** A function that names each pool, for `pools` (read once each; the reviewed ones never). */
export function useCurveNames(pools: readonly string[]): (pool: string) => string {
  const reviewed = useContext(Reviewed);
  const wanted = [...new Set(pools)].filter((p) => !reviewed.has(p)).sort();
  const key = wanted.join(",");
  const [tokens, setTokens] = useState<CurveTokens>(() => settledOf(wanted));
  useEffect(() => {
    if (!key) return;
    let live = true;
    readCurveTokens(rpc, key.split(",")).then(
      (read) => live && setTokens(read),
      () => undefined, // the pools stay "Token (…7Dny)"; the next screen asks again
    );
    return () => {
      live = false;
    };
  }, [key]);
  return useMemo(
    () => (pool: string) => curveName(pool, { reviewed: reviewed.get(pool), symbol: tokens.get(pool)?.symbol }),
    [reviewed, tokens],
  );
}

/** The cards with each graduation campaign's title naming its curve. */
export function useNamedCards(cards: readonly Card[]): Card[] {
  const pools = useMemo(() => cards.filter((c) => c.kind === "DbcGraduated").map((c) => c.metricAccount), [cards]);
  const nameOf = useCurveNames(pools);
  return useMemo(
    () => cards.map((c) => (c.kind === "DbcGraduated" ? { ...c, title: cardTitle(c, nameOf(c.metricAccount)) } : c)),
    [cards, nameOf],
  );
}
