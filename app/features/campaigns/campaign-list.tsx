/**
 * Purpose: the home page's toolbar and grid (Sprint 10), in the approved prototype's layout (`.home-toolbar`,
 *          `.grid-cards`): the five states and "Saved" as chips (Open by default), the count, the sort, the kinds as
 *          chips with their tiles, and the switch that shows the unlisted campaigns too (no entry in 24 hours, or
 *          unlisted by the team after a report, C-10), then the cards in the chosen order. The words to search come from
 *          the top bar (search-store.ts). The filters are the page's own state; the saved list is this browser's.
 * Version: 0.3.0 (the UI overhaul: the prototype's toolbar and cards; 0.2.0, Sprint 13's unlisting)
 * Sprint:  10 (site: campaign list); 13
 */
"use client";

import { useState, useSyncExternalStore } from "react";

import { cx } from "@/components/ui/cx";
import { TOOLBAR } from "@/features/home/copy";
import { HomeEmpty } from "@/features/home/home-empty";
import { arrange, DEFAULT_FILTERS, type Filters, type Sort, type StateFilter } from "./arrange";
import { CampaignCard } from "./campaign-card";
import { KINDS, KindTile } from "./card-parts";
import type { Card } from "./model";
import { KIND_NAME } from "./readings";
import { getQuery, serverQuery, subscribeQuery } from "./search-store";
import type { Readings } from "./use-readings";

const STATE_KEYS = ["open", "closed", "in_review", "paid", "void", "saved"] as const satisfies readonly StateFilter[];
const SORT_KEYS = ["ranking", "pot", "close", "chance"] as const satisfies readonly Sort[];
const START: Filters = { ...DEFAULT_FILTERS, state: "open" };

type Props = {
  cards: readonly Card[];
  now: bigint;
  readings: Readings;
  saved: ReadonlySet<string>;
  onToggle: (address: string) => void;
};

export function CampaignList({ cards, now, readings, saved, onToggle }: Props) {
  const query = useSyncExternalStore(subscribeQuery, getQuery, serverQuery);
  const [filters, setFilters] = useState<Filters>(START);
  const set = (patch: Partial<Filters>) => setFilters((was) => ({ ...was, ...patch }));
  const shown = arrange(cards, { ...filters, query }, saved);
  const kinds = Object.entries(KIND_NAME);
  const chip = (pressed: boolean, onClick: () => void, children: React.ReactNode, key: string) => (
    <button key={key} type="button" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
  return (
    <>
      <section
        className="home-toolbar"
        aria-labelledby="home-browse"
        data-perch="home-toolbar"
        data-perch-x="0.5"
        data-perch-size="0.8"
        data-perch-pose="skeptical"
      >
        <h2 id="home-browse" className="sr-only">
          Browse campaigns
        </h2>
        <div className="home-bar-row">
          <div className="home-chips" role="group" aria-label="Filter by state">
            {STATE_KEYS.map((key) =>
              chip(
                filters.state === key,
                () => set({ state: key }),
                key === "saved" && saved.size ? (
                  <>
                    {TOOLBAR.states.saved} <span className="home-n">{saved.size}</span>
                  </>
                ) : (
                  TOOLBAR.states[key]
                ),
                key,
              ),
            )}
          </div>
          <div className="home-bar-end">
            <p className="home-count" aria-live="polite">
              {TOOLBAR.count(shown.length)}
            </p>
            <label className="home-select">
              <span>{TOOLBAR.sort}</span>
              <select className="select" value={filters.sort} onChange={(e) => set({ sort: e.target.value as Sort })}>
                {SORT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {TOOLBAR.sorts[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="home-bar-row">
          <div className="home-chips" role="group" aria-label="Filter by kind">
            {chip(filters.kind === "all", () => set({ kind: "all" }), TOOLBAR.allKinds, "all")}
            {kinds.map(([api, name]) =>
              chip(
                filters.kind === api,
                () => set({ kind: api }),
                <>
                  <KindTile kind={name} />
                  {KINDS[name].label}
                </>,
                api,
              ),
            )}
          </div>
          <button
            type="button"
            className={cx("home-all", "list-toggle")}
            aria-pressed={filters.showUnlisted}
            onClick={() => set({ showUnlisted: !filters.showUnlisted })}
          >
            {TOOLBAR.unlisted}
          </button>
        </div>
      </section>
      <div className="home-results">
        {shown.length ? (
          <div className="grid-cards">
            {shown.map((card) => (
              <CampaignCard
                key={card.id}
                card={card}
                now={now}
                reading={readings.get(card.id)}
                saved={saved.has(card.address)}
                onToggle={() => onToggle(card.address)}
              />
            ))}
          </div>
        ) : (
          <HomeEmpty
            text={filters.state === "saved" && !saved.size ? TOOLBAR.emptySaved : TOOLBAR.empty}
            action={
              <button type="button" className="btn" onClick={() => setFilters(START)}>
                {TOOLBAR.clear}
              </button>
            }
          />
        )}
      </div>
    </>
  );
}
