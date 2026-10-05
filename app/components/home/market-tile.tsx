"use client";

import Link from "next/link";

import { formatBps, formatUsdc, slotTime, type ClockInfo } from "@/lib/format";
import type { MarketEntry } from "@/lib/hooks";
import { questionText, type Reading } from "@/lib/metric";
import { closeSlot, kindOf, phaseOf, statusOf, yesPrice, KIND_INFO } from "@/lib/view";
import { Blocks, KindTile, StatusPill, YesNoBoxes } from "@/components/primitives";

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

/** One line of evidence for the row's metadata. */
function readingText(reading?: Reading) {
  if (!reading) return "reading…";
  if (reading.type === "unavailable") return reading.reason;
  if (reading.type === "authority") return `${reading.what} ${reading.met ? "revoked" : "still live"}`;
  return reading.met ? "goal met" : `${Math.floor(reading.progress * 100)}% to goal`;
}

/**
 * A market as one row on the tape: thumbnail, question and evidence, progress in blocks, the YES
 * price, and the Yes/No boxes. The mascot stands on the rail beside the row (data-perch-dx).
 */
export function MarketRow({ entry, clock }: { entry: MarketEntry; clock: ClockInfo | null }) {
  const { account, reading, name } = entry;
  const kind = kindOf(account);
  const status = statusOf(account);
  const phase = phaseOf(account, clock);
  const href = marketHref(entry);
  const bps = yesPrice(account).bps;
  const question = questionText(account, reading, name);
  const quantity = reading?.type === "quantity";
  const progress = quantity ? Math.floor(reading.progress * 100) : bps / 100;

  return (
    <article
      data-perch={`market-${entry.address.toBase58()}`}
      data-perch-x="0"
      data-perch-dx="-44"
      data-perch-edge="bottom"
      data-perch-dy="-8"
      data-perch-size="0.8"
      data-perch-pose={status === "yes" ? "approve" : status === "no" ? "sulking" : "point"}
      className="group relative grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 border-x-2 border-b-2 border-x-transparent border-b-line px-3 py-3 transition hover:border-x-line hover:bg-surface lg:grid-cols-[44px_minmax(0,1fr)_150px_76px_210px]"
    >
      <Link href={href} className="absolute inset-0" aria-label={question} />
      <KindTile kind={kind} />
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-ink group-hover:text-brand">
          {question}
        </h3>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
          <span className="font-semibold text-crust">{KIND_INFO[kind].label}</span>
          {status === "active" && <span>closes {slotDate(closeSlot(account, clock), clock)}</span>}
          <span className="tabular-nums">${formatUsdc(entry.vault)} locked</span>
          <span>{readingText(reading)}</span>
        </p>
      </div>
      <div className="order-4 col-span-3 lg:order-none lg:col-span-1">
        <Blocks
          pct={progress}
          done={quantity && reading.met}
          label={quantity ? `${progress}% of the way to the goal` : `YES at ${formatBps(bps)}`}
        />
      </div>
      <strong className="order-3 text-right font-display text-4xl leading-none font-normal tabular-nums lg:order-none">
        {formatBps(bps).replace(/\.\d+%$/, "%")}
      </strong>
      <div className="relative z-10 order-5 col-span-3 lg:order-none lg:col-span-1">
        {status === "active" && phase === "trading" ? (
          <YesNoBoxes bps={bps} href={href} />
        ) : (
          <StatusPill status={status} phase={phase} />
        )}
      </div>
    </article>
  );
}
