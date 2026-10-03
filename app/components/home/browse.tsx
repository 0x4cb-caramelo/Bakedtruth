"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Inbox, Search } from "lucide-react";

import type { ClockInfo } from "@/lib/format";
import { useProgramActivity, type MarketEntry } from "@/lib/hooks";
import { questionText } from "@/lib/metric";
import { CATEGORIES, categoryOf, statusOf, type Category, type Status } from "@/lib/view";
import { ActivityFeed } from "@/components/activity-feed";
import { Card, Tabs } from "@/components/primitives";
import { MarketTile } from "@/components/home/market-tile";

const STATUSES: { id: Status; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "yes", label: "Resolved YES" },
  { id: "no", label: "Resolved NO" },
];

function chip(on: boolean) {
  return `shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    on ? "bg-brand/15 text-brand" : "text-muted hover:bg-raised hover:text-ink"
  }`;
}

function ProgramActivity({ entries }: { entries: MarketEntry[] }) {
  const activity = useProgramActivity();
  const questions = new Map(
    entries.map((e) => [e.address.toBase58(), questionText(e.account, e.reading, e.name)] as const),
  );
  return (
    <Card className="px-5 py-2">
      {activity.data ? (
        <ActivityFeed
          items={activity.data.activity}
          now={activity.data.fetchedAt}
          questions={questions}
          empty="No activity on the program yet."
        />
      ) : (
        <div className="space-y-3 py-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-raised/60" />
          ))}
        </div>
      )}
    </Card>
  );
}

/** "Markets / Activity" tabs, then Browse all markets: search, categories, status and the grid. */
export function Browse({ entries, clock, loading }: { entries: MarketEntry[]; clock: ClockInfo | null; loading: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("active");
  const tab = params.get("tab") === "activity" ? "activity" : "markets";
  const category = params.get("category") as Category | null;
  const query = params.get("q") ?? "";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/?${qs}#browse` : "/#browse", { scroll: false });
  };

  const needle = query.trim().toLowerCase();
  const matches = (e: MarketEntry) =>
    !needle ||
    questionText(e.account, e.reading, e.name).toLowerCase().includes(needle) ||
    e.address.toBase58().toLowerCase().includes(needle) ||
    e.account.targetPubkey.toBase58().toLowerCase().includes(needle);
  const inCategory = entries.filter((e) => (!category || categoryOf(e.account) === category) && matches(e));
  const shown = inCategory.filter((e) => statusOf(e.account) === status);
  const count = (s: Status) => inCategory.filter((e) => statusOf(e.account) === s).length;

  return (
    <section id="browse" className="scroll-mt-28 space-y-5">
      <div className="border-b border-line">
        <Tabs
          size="lg"
          tabs={[
            { id: "markets", label: "Markets" },
            { id: "activity", label: "Activity" },
          ]}
          value={tab}
          onChange={(id) => setParam("tab", id === "activity" ? "activity" : null)}
        />
      </div>

      {tab === "activity" ? (
        <ProgramActivity entries={entries} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-bold text-ink">Browse all markets</h2>
            <label className="flex h-10 w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm focus-within:border-brand/60 sm:w-80">
              <Search className="size-4 text-dim" />
              <input
                value={query}
                onChange={(e) => setParam("q", e.target.value || null)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-dim"
                aria-label="Filter markets"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto">
              <button type="button" className={chip(!category)} onClick={() => setParam("category", null)}>
                All
              </button>
              {CATEGORIES.map((c) => (
                <button key={c.slug} type="button" className={chip(category === c.slug)} onClick={() => setParam("category", c.slug)}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 rounded-xl border border-line bg-surface p-1">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                    status === s.id ? "bg-raised text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {s.label}
                  <span className="ml-1.5 text-xs tabular-nums text-dim">{loading ? "·" : count(s.id)}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl border border-line bg-surface" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-sm text-dim">
              <Inbox className="size-8" />
              No markets match.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((entry) => (
                <MarketTile key={entry.address.toBase58()} entry={entry} clock={clock} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
