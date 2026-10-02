"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock, ChartNoAxesColumn, Database, SearchX, TriangleAlert } from "lucide-react";

import { formatBps, formatUnits, formatUsdc, relativeSlot, slotTime, type ClockInfo } from "@/lib/format";
import { useClock, useMarket } from "@/lib/hooks";
import * as lib from "@/lib/market";
import { big, hasPool, KIND_INFO, kindOf, phaseOf, stakeEpoch, statusOf, yesPrice, type MarketAccount } from "@/lib/view";
import { ActionPanel } from "@/components/action-panel";
import { MetricPanel } from "@/components/metric-panel";
import { AddressLink, KindChip, Panel, Stat, StatusBadge } from "@/components/ui";

function SlotRow({ label, slot, clock, note }: { label: string; slot: number; clock: ClockInfo | null; note?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/5 py-3 last:border-0">
      <div>
        <p className="text-sm text-zinc-300">{label}</p>
        {note && <p className="text-xs text-zinc-500">{note}</p>}
      </div>
      <div className="text-right">
        <p className="text-sm tabular-nums text-zinc-200">
          {clock ? `≈ ${slotTime(slot, clock).at.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}` : "…"}
        </p>
        <p className="text-xs tabular-nums text-zinc-500">
          slot {slot.toLocaleString()}
          {clock && ` · ${relativeSlot(slot, clock)}`}
        </p>
      </div>
    </div>
  );
}

function Timeline({ account, clock }: { account: MarketAccount; clock: ClockInfo | null }) {
  const epoch = stakeEpoch(account);
  return (
    <Panel title="Timeline" icon={CalendarClock}>
      <SlotRow label="Sale and pool close" slot={Number(account.cutoffSlot.toString())} clock={clock} />
      {epoch === null ? (
        <SlotRow
          label="Deadline"
          slot={Number(account.deadlineSlot.toString())}
          clock={clock}
          note="Not met by then: resolves NO"
        />
      ) : (
        <div className="flex justify-between border-b border-white/5 py-3 text-sm">
          <span className="text-zinc-300">Measured epoch</span>
          <span className="tabular-nums text-zinc-200">
            {epoch} {clock && <span className="text-zinc-500">(now {clock.epoch})</span>}
          </span>
        </div>
      )}
      {statusOf(account) !== "active" && (
        <SlotRow label="Resolved" slot={Number(account.resolvedSlot.toString())} clock={clock} />
      )}
      <p className="mt-3 text-xs text-zinc-500">
        Times are estimated from slots at the cluster&apos;s recent pace
        {clock && ` (${Math.round(clock.msPerSlot)} ms per slot)`}.
      </p>
    </Panel>
  );
}

export function MarketDetail({ address }: { address: string }) {
  const market = useMarket(address);
  const clock = useClock();

  if (market.loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-900/60" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-900/60" />
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-900/60" />
      </div>
    );
  }
  if (market.error && !market.data) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-rose-200">
        <TriangleAlert className="size-5 shrink-0" />
        Could not load this market: {market.error.message}
      </div>
    );
  }
  if (!market.data) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center text-zinc-400">
        <SearchX className="size-10 text-zinc-600" />
        <p>No market at this address.</p>
        <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">
          Back to markets
        </Link>
      </div>
    );
  }

  const entry = market.data;
  const { account } = entry;
  const kind = kindOf(account);
  const price = yesPrice(account);
  const budget = big(account.budget);

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100">
        <ArrowLeft className="size-4" /> All markets
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <KindChip kind={kind} />
          <StatusBadge status={statusOf(account)} phase={phaseOf(account, clock)} />
        </div>
        <p className="max-w-2xl text-sm text-zinc-400">{KIND_INFO[kind].summary}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-2">
            Target <AddressLink address={account.targetPubkey.toBase58()} />
          </span>
          <span className="inline-flex items-center gap-2">
            Sponsor <AddressLink address={account.sponsor.toBase58()} />
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <MetricPanel entry={entry} clock={clock} onChange={market.refresh} />

          <Panel title="Market" icon={ChartNoAxesColumn}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="YES price" value={formatBps(price.bps)} hint={price.source === "pool" ? "from the pool" : "sale price"} />
              <Stat label="Sale price" value={formatBps(account.yesPriceBps)} hint="sponsor pays the rest" />
              <Stat label="Budget left" value={`${formatUsdc(budget)} USDC`} hint="bounty still on offer" />
              <Stat
                label="Sale capacity"
                value={`${formatUnits(lib.maxSaleAmount(budget, account.yesPriceBps), 6, 2)} YES`}
                hint="the budget can still cover"
              />
              <Stat
                label="Pool"
                value={hasPool(account) ? `${formatUnits(big(account.poolYes), 6, 2)} / ${formatUnits(big(account.poolNo), 6, 2)}` : "Empty"}
                hint={hasPool(account) ? "YES / NO reserves" : "no liquidity yet"}
              />
              <Stat label="Sponsor NO" value={formatUsdc(big(account.sponsorNo))} hint="booked for sold YES" />
            </div>
          </Panel>

          <Timeline account={account} clock={clock} />

          <Panel title="Accounts" icon={Database}>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ["Market", entry.address.toBase58()],
                ["Metric account (read at resolution)", account.metricAccount.toBase58()],
                ["YES mint", account.yesMint.toBase58()],
                ["NO mint", account.noMint.toBase58()],
                ["USDC vault", account.vault.toBase58()],
                ["Program", lib.PROGRAM_ID.toBase58()],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-zinc-500">{label}</dt>
                  <dd>
                    <AddressLink address={value!} />
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-24">
          <ActionPanel entry={entry} clock={clock} onChange={market.refresh} />
        </div>
      </div>
    </div>
  );
}
