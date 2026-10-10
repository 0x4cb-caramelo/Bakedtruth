/**
 * Purpose: the home route's campaign list (Sprint 10): the search, the state and kind filters, the sort, the unlisted
 *          switch, and the cards in the ranking order. The data comes from the read API through useCampaigns; the saved
 *          list is this browser's own (saved.ts). The filters are the page's own state, not the URL's. Since Sprint 13 a
 *          campaign the team unlisted after a report counts as unlisted (C-10).
 * Version: 0.2.0
 * Sprint:  10 (site: campaign list); 13
 */
"use client";

import { useState, useSyncExternalStore } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { arrange, DEFAULT_FILTERS, type Filters, type Sort, type StateFilter } from "./arrange";
import { CampaignCard } from "./campaign-card";
import { KIND_LABEL } from "./sentence";
import { getSaved, subscribeSaved, toggleSaved } from "./saved";
import { useCampaigns } from "./use-campaigns";

const STATES: { id: StateFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "in_review", label: "In review" },
  { id: "paid", label: "Paid" },
  { id: "void", label: "Void" },
  { id: "saved", label: "Saved" },
];
const SORTS: { id: Sort; label: string }[] = [
  { id: "ranking", label: "Ranking" },
  { id: "pot", label: "Pot" },
  { id: "close", label: "Entries close" },
  { id: "chance", label: "YES chance" },
];
const NO_SAVED = new Set<string>();
const serverSaved = () => NO_SAVED;

/** `unlisted`: the ids the team unlisted after a report (C-10); they show only with "Show unlisted". */
export function CampaignList({ unlisted = [] }: { unlisted?: readonly string[] }) {
  const loaded = useCampaigns();
  const saved = useSyncExternalStore(subscribeSaved, getSaved, serverSaved);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const set = (patch: Partial<Filters>) => setFilters((current) => ({ ...current, ...patch }));

  if (loaded.status === "loading") {
    return (
      <div className="grid gap-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }
  if (loaded.status === "error") {
    return (
      <EmptyState title="The campaigns did not load">
        <p>The read API did not answer ({loaded.error}). Reload the page to try again.</p>
      </EmptyState>
    );
  }

  const hidden = new Set(unlisted);
  const cards = loaded.cards.map((card) => (hidden.has(card.id) ? { ...card, listed: false } : card));
  const kinds = [...new Set(cards.map((c) => c.kind))];
  const shown = arrange(cards, filters, saved);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={filters.query}
          onChange={(event) => set({ query: event.target.value })}
          placeholder="Search campaigns"
          aria-label="Search campaigns"
          className="min-w-0 flex-1 rounded border-2 border-line bg-panel px-3 py-2 text-ink"
        />
        <select
          value={filters.kind}
          onChange={(event) => set({ kind: event.target.value })}
          aria-label="Kind"
          className="rounded border-2 border-line bg-panel px-2 py-2 text-ink"
        >
          <option value="all">All kinds</option>
          {kinds.map((kind) => (
            <option key={kind} value={kind}>
              {KIND_LABEL[kind] ?? kind}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(event) => set({ sort: event.target.value as Sort })}
          aria-label="Sort"
          className="rounded border-2 border-line bg-panel px-2 py-2 text-ink"
        >
          {SORTS.map((sort) => (
            <option key={sort.id} value={sort.id}>
              Sort: {sort.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-dim">
          <input
            type="checkbox"
            checked={filters.showUnlisted}
            onChange={(event) => set({ showUnlisted: event.target.checked })}
          />
          Show unlisted
        </label>
      </div>
      <Segmented
        label="Filter by state"
        items={STATES}
        value={filters.state}
        onChange={(id) => set({ state: id as StateFilter })}
      />
      <p className="text-sm text-dim">
        {shown.length} of {loaded.cards.length} campaigns · as of slot {loaded.asOfSlot}
      </p>
      {shown.length === 0 ? (
        <EmptyState
          title="No campaigns here"
          action={
            <button type="button" className="underline" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {shown.map((card) => (
            <CampaignCard
              key={card.address}
              card={card}
              saved={saved.has(card.address)}
              onToggle={() => toggleSaved(card.address)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
