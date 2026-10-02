"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { formatBps, formatDuration, formatUsdc, shortAddress, slotTime, type ClockInfo } from "@/lib/format";
import type { MarketEntry } from "@/lib/hooks";
import { goalText } from "@/lib/metric";
import { big, kindOf, phaseOf, statusOf, yesPrice } from "@/lib/view";
import { KindChip, ReadingSummary, StatusBadge } from "@/components/ui";

export function MarketCard({ entry, clock }: { entry: MarketEntry; clock: ClockInfo | null }) {
  const { account, reading } = entry;
  const status = statusOf(account);
  const phase = phaseOf(account, clock);
  const price = yesPrice(account);
  const cutoff = Number(account.cutoffSlot.toString());

  let timing = { label: "Closes in", value: "…" };
  if (status !== "active") {
    const ago = clock ? -slotTime(Number(account.resolvedSlot.toString()), clock).deltaMs : null;
    timing = { label: "Resolved", value: ago === null ? "—" : `${formatDuration(ago)} ago` };
  } else if (clock) {
    timing =
      phase === "trading"
        ? { label: "Closes in", value: formatDuration(slotTime(cutoff, clock).deltaMs) }
        : { label: "Sale", value: "Closed" };
  }

  return (
    <Link
      href={`/markets/${entry.address.toBase58()}`}
      className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 transition hover:border-white/20 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-2">
        <KindChip kind={kindOf(account)} />
        <StatusBadge status={status} phase={phase} />
      </div>

      <div className="min-w-0">
        <h3 className="flex items-start justify-between gap-2 text-base font-semibold text-zinc-100">
          {goalText(account, reading)}
          <ArrowUpRight className="size-4 shrink-0 text-zinc-600 transition group-hover:text-zinc-300" />
        </h3>
        <p className="mt-1 font-mono text-xs text-zinc-500">target {shortAddress(account.targetPubkey.toBase58())}</p>
      </div>

      <ReadingSummary reading={reading} />

      <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-xs">
        <div>
          <dt className="text-zinc-500">YES price</dt>
          <dd className="mt-0.5 text-sm font-semibold text-emerald-300 tabular-nums">
            {formatBps(price.bps)}
            <span className="ml-1 text-[10px] font-normal uppercase text-zinc-500">{price.source}</span>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Budget left</dt>
          <dd className="mt-0.5 text-sm font-semibold text-zinc-200 tabular-nums">
            {formatUsdc(big(account.budget))}
            <span className="ml-1 text-[10px] font-normal text-zinc-500">USDC</span>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{timing.label}</dt>
          <dd className="mt-0.5 whitespace-nowrap text-sm text-zinc-300 tabular-nums">{timing.value}</dd>
        </div>
      </dl>
    </Link>
  );
}
