"use client";

import { useState, type ReactNode } from "react";

import { formatBps, formatUnits, formatUsdc, relativeSlot, slotTime, type ClockInfo } from "@/lib/format";
import type { Activity } from "@/lib/history";
import type { MarketEntry } from "@/lib/hooks";
import * as lib from "@/lib/market";
import { big, closeSlot, hasPool, stakeEpoch, statusOf } from "@/lib/view";
import { ActivityFeed } from "@/components/activity-feed";
import { AddressLink, Card, Tabs } from "@/components/primitives";

function KeyValue({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl bg-raised/50 p-3">
      <p className="text-xs text-dim">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-ink">{value}</p>
      {hint && <p className="text-[11px] text-dim">{hint}</p>}
    </div>
  );
}

function When({ label, slot, clock }: { label: string; slot: number; clock: ClockInfo | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right tabular-nums">
        <span className="text-ink">
          {clock ? slotTime(slot, clock).at.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "…"}
        </span>
        <span className="block text-xs text-dim">
          slot {slot.toLocaleString()}
          {clock && ` · ${relativeSlot(slot, clock)}`}
        </span>
      </span>
    </div>
  );
}

/** Activity feed, and the market's rules, numbers, timeline and accounts. */
export function Details({
  entry,
  clock,
  history,
}: {
  entry: MarketEntry;
  clock: ClockInfo | null;
  history?: { activity: Activity[]; fetchedAt: number };
}) {
  const [tab, setTab] = useState<"activity" | "details">("activity");
  const { account } = entry;
  const budget = big(account.budget);
  const epoch = stakeEpoch(account);

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-2 border-b border-line">
        <Tabs
          tabs={[
            { id: "activity", label: "Activity" },
            { id: "details", label: "Rules & details" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "activity" ? (
        history ? (
          <ActivityFeed items={[...history.activity].reverse()} now={history.fetchedAt} />
        ) : (
          <div className="space-y-3 py-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-raised/60" />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-6 pt-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <KeyValue label="Sale price" value={formatBps(account.yesPriceBps)} hint="sponsor pays the rest" />
            <KeyValue label="Budget left" value={`$${formatUsdc(budget)}`} hint="bounty still on offer" />
            <KeyValue
              label="Sale capacity"
              value={`${formatUnits(lib.maxSaleAmount(budget, account.yesPriceBps), 6, 2)} YES`}
              hint="the budget can still cover"
            />
            <KeyValue
              label="Pool"
              value={hasPool(account) ? `${formatUnits(big(account.poolYes), 6, 2)} / ${formatUnits(big(account.poolNo), 6, 2)}` : "Empty"}
              hint="YES / NO reserves"
            />
            <KeyValue label="Sponsor NO" value={formatUsdc(big(account.sponsorNo))} hint="booked for sold YES" />
            <KeyValue label="Vault" value={`$${formatUsdc(entry.vault)}`} hint="USDC backing every YES" />
          </div>

          <div className="divide-y divide-line">
            <When label="Sale and pool close" slot={closeSlot(account, clock)} clock={clock} />
            {epoch === null ? (
              <When label="Deadline (not met by then: NO)" slot={Number(account.deadlineSlot.toString())} clock={clock} />
            ) : (
              <div className="flex justify-between py-2.5 text-sm">
                <span className="text-muted">Measured epoch</span>
                <span className="tabular-nums text-ink">
                  {epoch} {clock && <span className="text-dim">(now {clock.epoch})</span>}
                </span>
              </div>
            )}
            {statusOf(account) !== "active" && (
              <When label="Resolved" slot={Number(account.resolvedSlot.toString())} clock={clock} />
            )}
          </div>
          <p className="text-xs text-dim">
            Times are estimated from slots at the cluster&apos;s recent pace
            {clock && ` (${Math.round(clock.msPerSlot)} ms per slot)`}.
          </p>

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {[
              ["Market", entry.address.toBase58()],
              ["Target", account.targetPubkey.toBase58()],
              ["Metric account (read at resolution)", account.metricAccount.toBase58()],
              ["Sponsor", account.sponsor.toBase58()],
              ["YES mint", account.yesMint.toBase58()],
              ["NO mint", account.noMint.toBase58()],
              ["USDC vault", account.vault.toBase58()],
              ["Program", lib.PROGRAM_ID.toBase58()],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-dim">{label}</dt>
                <dd>
                  <AddressLink address={value!} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Card>
  );
}
