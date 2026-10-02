"use client";

import { useState } from "react";
import { CircleCheck, CircleX, Inbox, RefreshCw, TriangleAlert, Zap, type LucideIcon } from "lucide-react";

import { useClock, useMarkets } from "@/lib/hooks";
import { statusOf, type Status } from "@/lib/view";
import { MarketCard } from "@/components/market-card";

const FILTERS: { status: Status; label: string; short: string; icon: LucideIcon; empty: string }[] = [
  { status: "active", label: "Active", short: "Active", icon: Zap, empty: "No open markets right now." },
  { status: "yes", label: "Resolved YES", short: "YES", icon: CircleCheck, empty: "No market has resolved YES yet." },
  { status: "no", label: "Resolved NO", short: "NO", icon: CircleX, empty: "No market has resolved NO yet." },
];

export function MarketsExplorer() {
  const [filter, setFilter] = useState<Status>("active");
  const markets = useMarkets();
  const clock = useClock();

  const all = markets.data ?? [];
  const counts = { active: 0, yes: 0, no: 0 };
  for (const m of all) counts[statusOf(m.account)]++;
  const shown = all.filter((m) => statusOf(m.account) === filter);
  const empty = FILTERS.find((f) => f.status === filter)!.empty;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Market status"
          className="grid w-full grid-cols-3 gap-1 rounded-xl border border-white/10 bg-zinc-900/60 p-1 sm:flex sm:w-auto"
        >
          {FILTERS.map(({ status, label, short, icon: Icon }) => (
            <button
              key={status}
              role="tab"
              aria-selected={filter === status}
              onClick={() => setFilter(status)}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition ${
                filter === status ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
              <span className="rounded-md bg-white/5 px-1.5 text-xs tabular-nums text-zinc-400">
                {markets.data ? counts[status] : "·"}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={markets.refresh}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {markets.error && !markets.data && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-rose-200">
          <TriangleAlert className="size-5 shrink-0" />
          Could not load markets from the RPC: {markets.error.message}
        </div>
      )}

      {markets.loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-60 animate-pulse rounded-2xl border border-white/5 bg-zinc-900/60" />
          ))}
        </div>
      )}

      {markets.data && shown.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-zinc-500">
          <Inbox className="size-8 text-zinc-600" />
          {empty}
        </div>
      )}

      {shown.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((entry) => (
            <MarketCard key={entry.address.toBase58()} entry={entry} clock={clock} />
          ))}
        </div>
      )}
    </section>
  );
}
