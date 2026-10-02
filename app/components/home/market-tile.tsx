"use client";

import Link from "next/link";
import { Clock, Landmark } from "lucide-react";

import { formatUsdc, slotTime, type ClockInfo } from "@/lib/format";
import type { MarketEntry } from "@/lib/hooks";
import { questionText } from "@/lib/metric";
import { closeSlot, kindOf, phaseOf, statusOf, yesPrice, KIND_INFO } from "@/lib/view";
import { KindTile, ProgressLine, StatusPill, YesNoBoxes } from "@/components/primitives";

export const marketHref = (entry: MarketEntry) => `/markets/${entry.address.toBase58()}`;

/** Short date of a slot, e.g. "Oct 5, 23:47". */
export function slotDate(slot: number, clock: ClockInfo | null) {
  if (!clock) return "…";
  return slotTime(slot, clock).at.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Trueo-style grid card: thumbnail, category, question, Yes/No boxes, KPI line, meta. */
export function MarketTile({ entry, clock }: { entry: MarketEntry; clock: ClockInfo | null }) {
  const { account, reading, name } = entry;
  const kind = kindOf(account);
  const status = statusOf(account);
  const href = marketHref(entry);
  const closes = closeSlot(account, clock);

  return (
    <article className="group relative flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-muted/40 hover:bg-raised/60">
      <Link href={href} className="absolute inset-0 rounded-2xl" aria-label={questionText(account, reading, name)} />
      <div className="flex items-start gap-3">
        <KindTile kind={kind} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-brand">{KIND_INFO[kind].label}</p>
          <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
            {questionText(account, reading, name)}
          </h3>
        </div>
      </div>
      <div className="relative z-10">
        <YesNoBoxes bps={yesPrice(account).bps} href={status === "active" ? href : undefined} />
      </div>
      <ProgressLine reading={reading} />
      <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1 tabular-nums">
            <Landmark className="size-3.5 text-dim" />${formatUsdc(entry.vault)}
          </span>
          {status === "active" && (
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="size-3.5 text-dim" />
              {slotDate(closes, clock)}
            </span>
          )}
        </span>
        {status !== "active" || phaseOf(account, clock) !== "trading" ? (
          <StatusPill status={status} phase={phaseOf(account, clock)} />
        ) : null}
      </div>
    </article>
  );
}
