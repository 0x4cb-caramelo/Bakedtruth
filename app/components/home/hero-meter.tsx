"use client";

// The hero's meter: the market with the most at stake, read live. A quantity goal shows the
// number, its target and blocks filling toward it; an authority goal shows whether it is revoked.

import Link from "next/link";

import { formatBps, formatUnits, formatUsdc } from "@/lib/format";
import type { MarketEntry } from "@/lib/hooks";
import { questionText, type Reading } from "@/lib/metric";
import { KIND_INFO, kindOf, yesPrice } from "@/lib/view";
import { Blocks } from "@/components/primitives";
import { marketHref } from "@/components/home/market-tile";

function Readout({ reading }: { reading?: Reading }) {
  if (!reading) return <div className="my-4 h-24 animate-pulse bg-raised" />;
  if (reading.type === "unavailable") return <p className="my-4 text-sm text-muted">{reading.reason}</p>;
  if (reading.type === "authority") {
    return (
      <div className="my-4">
        <p className="text-xs text-dim">{reading.what}</p>
        <p className={`font-display text-6xl leading-none ${reading.met ? "text-yes" : "text-ink"}`}>
          {reading.met ? "Revoked" : "Still live"}
        </p>
      </div>
    );
  }
  const pct = Math.floor(reading.progress * 100);
  return (
    <div className="my-4 space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <b className="font-display text-6xl leading-[.9] font-normal tabular-nums">
          {formatUnits(reading.current, reading.decimals, 0)}
        </b>
        <span className="font-display text-3xl leading-none text-crust">
          → {reading.direction === "atMost" ? "≤" : "≥"} {formatUnits(reading.target, reading.decimals, 0)}
        </span>
      </div>
      <Blocks pct={pct} n={24} done={reading.met} label={`${pct}% of the way to the goal`} className="h-6" />
      <p className="text-xs text-dim">{reading.unit}</p>
    </div>
  );
}

export function HeroMeter({ entry }: { entry: MarketEntry }) {
  const { account, reading, name } = entry;
  const kind = kindOf(account);
  return (
    <Link
      href={marketHref(entry)}
      data-perch="hero-meter"
      data-perch-x="0.84"
      data-perch-size="1.4"
      data-perch-say="Prove it."
      className="block border-2 border-line bg-surface p-5 shadow-hard transition hover:border-brand"
    >
      <div className="flex justify-between gap-3 text-xs text-muted">
        <span className="font-semibold text-crust">{KIND_INFO[kind].label} · most at stake</span>
        <span className="tabular-nums">${formatUsdc(entry.vault)} locked</span>
      </div>
      <p className="mt-2 line-clamp-2 text-[15px] font-semibold text-ink">{questionText(account, reading, name)}</p>
      <Readout reading={reading} />
      <div className="flex justify-between gap-3 text-xs text-muted">
        <span>
          YES <b className="text-yes tabular-nums">{formatBps(yesPrice(account).bps)}</b>
        </span>
        <span>Resolves the moment the account says so. No oracle.</span>
      </div>
    </Link>
  );
}
