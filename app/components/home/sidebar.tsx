"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { formatBps, formatDuration, formatUsdc, slotTime, type ClockInfo } from "@/lib/format";
import type { MarketEntry } from "@/lib/hooks";
import { questionText } from "@/lib/metric";
import { closeSlot, kindOf, yesPrice } from "@/lib/view";
import { Card, KindTile } from "@/components/primitives";
import { marketHref } from "@/components/home/market-tile";

function Header({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      {href && (
        <Link href={href} className="text-dim hover:text-ink" aria-label={`All ${title}`}>
          <ChevronRight className="size-5" />
        </Link>
      )}
    </div>
  );
}

/** Trueo-style numbered list: rank, thumbnail, question, locked USDC and the Yes/No split. */
export function TrendingList({ entries }: { entries: MarketEntry[] }) {
  return (
    <Card className="p-4">
      <Header title="Trending" href="/#browse" />
      {entries.length === 0 && <p className="py-4 text-sm text-dim">Nothing open yet.</p>}
      <ol className="space-y-1">
        {entries.map((entry, i) => {
          const bps = yesPrice(entry.account).bps;
          return (
            <li key={entry.address.toBase58()}>
              <Link
                href={marketHref(entry)}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-raised"
              >
                <span className="w-4 text-center font-display text-lg font-bold text-dim">{i + 1}</span>
                <KindTile kind={kindOf(entry.account)} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-ink">
                    {questionText(entry.account, entry.reading, entry.name)}
                  </span>
                  <span className="mt-0.5 block text-xs tabular-nums text-dim">
                    ${formatUsdc(entry.vault)} · <span className="text-yes">Y {formatBps(bps)}</span>{" "}
                    <span className="text-no">N {formatBps(10_000 - bps)}</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/** Open markets whose sale closes soonest. */
export function ClosingSoon({ entries, clock }: { entries: MarketEntry[]; clock: ClockInfo | null }) {
  return (
    <Card className="p-4">
      <Header title="Closing soon" />
      {entries.length === 0 && <p className="py-4 text-sm text-dim">Nothing closing.</p>}
      <ul className="space-y-3">
        {entries.map((entry) => {
          const deltaMs = clock ? slotTime(closeSlot(entry.account, clock), clock).deltaMs : null;
          return (
            <li key={entry.address.toBase58()}>
              <Link href={marketHref(entry)} className="group flex items-start justify-between gap-3">
                <span className="line-clamp-2 text-sm text-ink/90 group-hover:text-ink">
                  {questionText(entry.account, entry.reading, entry.name)}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums text-ink">
                    {formatBps(yesPrice(entry.account).bps)}
                  </span>
                  <span className="block text-xs tabular-nums text-warn">
                    {deltaMs === null ? "…" : formatDuration(deltaMs)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
