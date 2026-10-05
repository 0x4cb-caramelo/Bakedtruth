"use client";

// The tape across the top: cluster status, then the markets the page has loaded scrolling past,
// each with its YES price and what is locked. It reads no data of its own (see tape-context).

import Link from "next/link";

import { CLUSTER } from "@/lib/config";
import { formatBps, formatUsdc } from "@/lib/format";
import { useClock } from "@/lib/hooks";
import { questionText } from "@/lib/metric";
import { statusOf, yesPrice } from "@/lib/view";
import { useTape } from "@/components/tape-context";

export function Ticker() {
  const clock = useClock();
  const entries = useTape();

  const line = entries.map((e) => {
    const status = statusOf(e.account);
    return (
      <Link key={e.address.toBase58()} href={`/markets/${e.address.toBase58()}`} className="hover:text-ink">
        <span className="text-ink/90">{questionText(e.account, e.reading, e.name)}</span>
        {status === "active" ? (
          <b className="ml-2 font-semibold text-yes tabular-nums">YES {formatBps(yesPrice(e.account).bps)}</b>
        ) : (
          <b className={`ml-2 font-semibold ${status === "yes" ? "text-yes" : "text-no"}`}>
            Resolved {status.toUpperCase()}
          </b>
        )}
        <span className="text-dim tabular-nums"> · ${formatUsdc(e.vault)} locked</span>
      </Link>
    );
  });

  return (
    <div className="flex h-9 items-stretch overflow-hidden border-b-2 border-line bg-[#070b13] text-xs text-muted">
      <span className="flex shrink-0 items-center gap-2 border-r-2 border-line px-4">
        <span className="size-2 animate-blink bg-yes motion-reduce:animate-none" />
        <span className="font-semibold text-yes">Live</span>
        <span className="capitalize">Solana {CLUSTER}</span>
        {clock && <span className="hidden tabular-nums sm:inline">· slot {clock.slot.toLocaleString()}</span>}
      </span>
      <div className="group relative min-w-0 flex-1 overflow-hidden">
        {line.length > 0 ? (
          // The list twice over, so the loop has no seam.
          <div className="flex w-max animate-tape items-center gap-12 py-2.5 pl-6 whitespace-nowrap group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {line}
            <span aria-hidden="true" className="flex items-center gap-12">
              {line}
            </span>
          </div>
        ) : (
          <p className="py-2.5 pl-6 text-dim">Reading the program…</p>
        )}
      </div>
    </div>
  );
}
