"use client";

import { CircleCheck, CircleX, Gavel, Loader2, ScanEye } from "lucide-react";

import { formatUnits, type ClockInfo } from "@/lib/format";
import { useSendTransaction, type MarketEntry } from "@/lib/hooks";
import { marketKeys, resolveIx } from "@/lib/instructions";
import { goalText, ruleText, type Reading } from "@/lib/metric";
import { useProgram } from "@/lib/program";
import { stakeEpoch, statusOf } from "@/lib/view";
import { AddressLink, Card } from "@/components/primitives";

/** What `resolve` would do now, as far as the app can tell; the program has the final word. */
function nextResolution(entry: MarketEntry, clock: ClockInfo | null) {
  const { account, reading } = entry;
  if (statusOf(account) !== "active" || !clock) return null;
  const epoch = stakeEpoch(account);
  if (epoch !== null) return clock.epoch >= epoch ? `Epoch ${epoch} has started. Anyone can resolve now.` : null;
  if (clock.slot > Number(account.deadlineSlot.toString())) return "The deadline passed. Anyone can resolve it NO now.";
  if (reading && reading.type !== "unavailable" && reading.met) return "The goal is met. Anyone can resolve it YES now.";
  return null;
}

function ReadingView({ reading }: { reading?: Reading }) {
  if (!reading) return <div className="h-24 animate-pulse rounded-xl bg-raised/60" />;
  if (reading.type === "unavailable") return <p className="text-sm text-muted">{reading.reason}</p>;
  if (reading.type === "authority") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-raised/60 p-4">
        <div>
          <p className="text-xs text-dim">{reading.what}</p>
          {reading.authority ? <AddressLink address={reading.authority} /> : <p className="font-mono text-sm">None</p>}
        </div>
        <span className={`text-sm font-semibold ${reading.met ? "text-yes" : "text-warn"}`}>
          {reading.met ? "Revoked ✓" : "Still live"}
        </span>
      </div>
    );
  }
  const pct = Math.floor(reading.progress * 100);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-dim">Now</p>
          <p className="font-display text-4xl font-bold tabular-nums text-ink">{formatUnits(reading.current, reading.decimals, 2)}</p>
          <p className="text-xs text-dim">{reading.unit}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-dim">Target</p>
          <p className="font-display text-2xl font-bold tabular-nums text-muted">
            {reading.direction === "atMost" ? "≤" : "≥"} {formatUnits(reading.target, reading.decimals, 2)}
          </p>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-line">
        <div
          className={`h-2.5 rounded-full transition-[width] duration-700 ${reading.met ? "bg-yes" : "bg-gradient-to-r from-warn/70 to-warn"}`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <p className="text-sm text-muted">
        {reading.met ? "Goal met." : `${pct}% of the way to the target.`}
        {reading.note && <span className="block text-xs text-dim">{reading.note}</span>}
      </p>
    </div>
  );
}

export function ProofCard({ entry, clock, onDone }: { entry: MarketEntry; clock: ClockInfo | null; onDone: () => void }) {
  const program = useProgram();
  const { send, pending, publicKey } = useSendTransaction();
  const { account, reading } = entry;
  const status = statusOf(account);
  const next = nextResolution(entry, clock);

  const resolve = async () => {
    if (await send("Resolve market", [await resolveIx(program, marketKeys(entry.address, account.metricAccount))])) onDone();
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
          <ScanEye className="size-5 text-brand" /> On-chain proof
        </h2>
        <span className="text-xs text-dim">Live read, every few seconds</span>
      </div>
      <p className="mb-4 font-semibold text-ink">{goalText(account, reading)}</p>
      <ReadingView reading={reading} />

      {status !== "active" && (
        <div
          className={`mt-5 flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
            status === "yes" ? "bg-yes/10 text-yes" : "bg-no/10 text-no"
          }`}
        >
          {status === "yes" ? <CircleCheck className="size-5" /> : <CircleX className="size-5" />}
          Resolved {status.toUpperCase()} at slot {Number(account.resolvedSlot.toString()).toLocaleString()}.
        </div>
      )}

      {next && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn/30 bg-warn/5 p-4">
          <p className="text-sm text-warn">{next}</p>
          <button
            type="button"
            onClick={() => void resolve()}
            disabled={!publicKey || pending !== null}
            title={publicKey ? undefined : "Connect a wallet to resolve"}
            className="flex items-center gap-2 rounded-lg bg-warn px-4 py-2 text-sm font-bold text-page transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Gavel className="size-4" />}
            Resolve
          </button>
        </div>
      )}

      <div className="mt-5 space-y-1 border-t border-line pt-4 text-xs text-dim">
        <p>{ruleText(account)}</p>
        <p className="flex flex-wrap items-center gap-2">
          Reads account <AddressLink address={account.metricAccount.toBase58()} />
        </p>
      </div>
    </Card>
  );
}
