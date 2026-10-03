"use client";

import { useState } from "react";

import { formatBps, formatUsdc, slotTime, type ClockInfo } from "@/lib/format";
import { priceSeries, type Activity } from "@/lib/history";
import type { MarketEntry } from "@/lib/hooks";
import type { Side } from "@/lib/market";
import { measuredEpoch, statusOf, yesPrice } from "@/lib/view";
import { Card } from "@/components/primitives";
import { PriceChart, type Range } from "@/components/price-chart";

const RANGES: Range[] = ["1D", "1W", "1M", "ALL"];

/** Change in basis points over the last day, from the price series. */
function dayChange(points: { time: number; bps: number }[], now: number) {
  if (points.length === 0) return null;
  const before = [...points].reverse().find((p) => p.time <= now - 86_400_000) ?? points[0]!;
  return points[points.length - 1]!.bps - before.bps;
}

export function ChartCard({
  entry,
  clock,
  history,
  onPick,
}: {
  entry: MarketEntry;
  clock: ClockInfo | null;
  history?: { activity: Activity[]; fetchedAt: number };
  onPick: (side: Side) => void;
}) {
  const [range, setRange] = useState<Range>("ALL");
  const { account } = entry;
  const price = yesPrice(account);
  const points = history ? priceSeries(history.activity) : [];
  const end = clock?.observedAt ?? history?.fetchedAt ?? 0;
  const change = history ? dayChange(points, end) : null;
  const trades = history?.activity.filter((a) => ["yesBought", "swapped", "pairMinted", "pairBurned"].includes(a.event.name)).length;
  const epoch = measuredEpoch(account);
  const deadline =
    epoch !== null
      ? `epoch ${epoch}`
      : clock
        ? slotTime(Number(account.deadlineSlot.toString()), clock).at.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "…";
  const yes = price.bps;
  const open = statusOf(account) === "active";

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <span className="size-2.5 rounded-full bg-yes" />
          Yes
          <span className="text-lg tabular-nums text-yes">{formatBps(yes)}</span>
          {change !== null && change !== 0 && (
            <span className={`text-xs tabular-nums ${change > 0 ? "text-yes" : "text-no"}`}>
              {change > 0 ? "▲" : "▼"} {Math.abs(change / 100).toFixed(0)}
            </span>
          )}
        </span>
        <span className="text-xs text-dim">{price.source === "pool" ? "pool price" : "sponsor sale price"}</span>
        <span className="ml-auto font-display text-2xl font-bold text-ink/90">Provable</span>
      </div>

      {history ? (
        <PriceChart points={points} end={end} range={range} height={300} />
      ) : (
        <div className="h-[300px] animate-pulse rounded-xl bg-raised/60" />
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <span className="text-sm text-muted tabular-nums">
          <span className="font-semibold text-ink">${formatUsdc(entry.vault)}</span> locked
          {trades !== undefined && <> · {trades} trades</>}
        </span>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                range === r ? "bg-raised text-ink" : "text-dim hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Kalshi-style outcome row: the chance and both sides' prices. */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 pt-4 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <p className="font-semibold text-ink">Goal met by {deadline}</p>
          <p className="text-xs text-dim">Chance</p>
        </div>
        <p className="text-right font-display text-3xl font-bold tabular-nums text-ink">{formatBps(yes)}</p>
        <div className="col-span-2 flex gap-2 sm:col-span-1">
          <button
            type="button"
            disabled={!open}
            onClick={() => onPick("yes")}
            className="h-10 flex-1 rounded-full border border-yes/60 px-5 text-sm font-bold text-yes transition hover:bg-yes/10 disabled:opacity-40 sm:w-32 sm:flex-none"
          >
            Yes {Math.round(yes / 100)}¢
          </button>
          <button
            type="button"
            disabled={!open}
            onClick={() => onPick("no")}
            className="h-10 flex-1 rounded-full border border-no/60 px-5 text-sm font-bold text-no transition hover:bg-no/10 disabled:opacity-40 sm:w-32 sm:flex-none"
          >
            No {Math.round((10_000 - yes) / 100)}¢
          </button>
        </div>
      </div>
    </Card>
  );
}
