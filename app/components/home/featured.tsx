"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatBps, formatDuration, formatUsdc, slotTime, type ClockInfo } from "@/lib/format";
import { priceSeries, type Activity } from "@/lib/history";
import { useMarketActivity, type MarketEntry } from "@/lib/hooks";
import { questionText } from "@/lib/metric";
import { closeSlot, KIND_INFO, kindOf, phaseOf, statusOf, yesPrice } from "@/lib/view";
import { Card, KindTile, OutcomeRow, ProgressLine, StatusPill } from "@/components/primitives";
import { ActivityFeed } from "@/components/activity-feed";
import { PriceChart } from "@/components/price-chart";
import { marketHref } from "@/components/home/market-tile";

type History = { activity: Activity[]; fetchedAt: number } | undefined;

function FeaturedChart({ entry, clock, history }: { entry: MarketEntry; clock: ClockInfo | null; history: History }) {
  const price = yesPrice(entry.account);
  return (
    <div className="flex min-h-[260px] min-w-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <span className="size-2 rounded-full bg-yes" />
          Yes <span className="tabular-nums text-yes">{formatBps(price.bps)}</span>
          <span className="text-xs font-normal text-dim">{price.source === "pool" ? "pool price" : "sale price"}</span>
        </span>
        <span className="font-display text-xl font-bold text-ink/90">Provable</span>
      </div>
      {history ? (
        <div className="min-h-0 flex-1">
          <PriceChart points={priceSeries(history.activity)} end={clock?.observedAt ?? history.fetchedAt} />
        </div>
      ) : (
        <div className="flex-1 animate-pulse rounded-xl bg-raised/60" />
      )}
    </div>
  );
}

/** Kalshi-style hero: one market at a time, with its chance chart, and a pager. */
export function Featured({ entries, clock }: { entries: MarketEntry[]; clock: ClockInfo | null }) {
  const [index, setIndex] = useState(0);
  if (entries.length === 0) {
    return <Card className="grid h-[380px] place-items-center text-sm text-dim">No markets yet.</Card>;
  }
  const i = index % entries.length;
  const entry = entries[i]!;
  const pager =
    entries.length > 1 ? (
      <div className="flex items-center gap-2 text-sm text-muted">
        <button
          type="button"
          onClick={() => setIndex(i === 0 ? entries.length - 1 : i - 1)}
          className="grid size-8 place-items-center rounded-full border border-line hover:border-muted hover:text-ink"
          aria-label="Previous market"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="tabular-nums">
          {i + 1} of {entries.length}
        </span>
        <button
          type="button"
          onClick={() => setIndex(i + 1)}
          className="grid size-8 place-items-center rounded-full border border-line hover:border-muted hover:text-ink"
          aria-label="Next market"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    ) : null;
  return <FeaturedMarket key={entry.address.toBase58()} entry={entry} clock={clock} pager={pager} />;
}

function FeaturedMarket({ entry, clock, pager }: { entry: MarketEntry; clock: ClockInfo | null; pager: ReactNode }) {
  const history = useMarketActivity(entry.address.toBase58(), 60);
  const { account, reading, name } = entry;
  const kind = kindOf(account);
  const price = yesPrice(account);
  const status = statusOf(account);
  const phase = phaseOf(account, clock);
  const closesIn = clock ? slotTime(closeSlot(account, clock), clock).deltaMs : null;

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <KindTile kind={kind} size="sm" />
          {KIND_INFO[kind].label}
        </span>
        {pager}
      </div>

      <div className="flex flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-4 lg:w-[44%]">
          <Link href={marketHref(entry)} className="hover:underline">
            <h2 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-ink sm:text-4xl">
              {questionText(account, reading, name)}
            </h2>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <StatusPill status={status} phase={phase} />
            {status === "active" && phase === "trading" && closesIn !== null && (
              <span>Closes in {formatDuration(closesIn)}</span>
            )}
          </div>
          <div className="space-y-3">
            <OutcomeRow label="Yes" bps={price.bps} tone="yes" />
            <OutcomeRow label="No" bps={10_000 - price.bps} tone="no" />
          </div>
          <div className="space-y-2 border-t border-dashed border-line pt-4">
            <ProgressLine reading={reading} />
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="tabular-nums">${formatUsdc(entry.vault)} locked</span>
              <Link href={marketHref(entry)} className="font-semibold text-brand hover:underline">
                Trade →
              </Link>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted">{KIND_INFO[kind].summary}</p>
          {history.data && history.data.activity.length > 0 && (
            <div className="border-t border-dashed border-line pt-1">
              <ActivityFeed items={[...history.data.activity].reverse().slice(0, 3)} now={history.data.fetchedAt} />
            </div>
          )}
        </div>
        <FeaturedChart entry={entry} clock={clock} history={history.data} />
      </div>
    </Card>
  );
}
