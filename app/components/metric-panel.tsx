"use client";

import { Activity, CircleCheck, CircleX, Gavel, Loader2 } from "lucide-react";

import { formatUnits, shortAddress, type ClockInfo } from "@/lib/format";
import { useSendTransaction, type MarketEntry } from "@/lib/hooks";
import { marketKeys, resolveIx } from "@/lib/instructions";
import { goalText, type Reading } from "@/lib/metric";
import { useProgram } from "@/lib/program";
import { kindOf, stakeEpoch, statusOf } from "@/lib/view";
import { Panel, ProgressBar } from "@/components/ui";

/** What `resolve` would do now, as far as the app can tell; the program has the final word. */
function resolution(entry: MarketEntry, clock: ClockInfo | null): { label: string; outcome: "YES" | "NO" | "?" } | null {
  const { account, reading } = entry;
  if (statusOf(account) !== "active" || !clock) return null;
  const epoch = stakeEpoch(account);
  if (epoch !== null) return clock.epoch >= epoch ? { label: `Epoch ${epoch} reached`, outcome: "?" } : null;
  if (clock.slot > Number(account.deadlineSlot.toString())) return { label: "Deadline passed", outcome: "NO" };
  if (reading && reading.type !== "unavailable" && reading.met) return { label: "Goal met", outcome: "YES" };
  return null;
}

function ReadingBody({ reading }: { reading?: Reading }) {
  if (!reading) return <div className="h-24 animate-pulse rounded-xl bg-white/5" />;
  if (reading.type === "unavailable") return <p className="text-sm text-zinc-400">{reading.reason}</p>;

  if (reading.type === "authority") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{reading.what}</p>
          <p className="mt-1 font-mono text-sm text-zinc-200">
            {reading.authority ? shortAddress(reading.authority, 6) : "None"}
          </p>
        </div>
        {reading.met ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300">
            <CircleCheck className="size-4" /> Revoked
          </span>
        ) : (
          <span className="text-sm text-amber-300">Still live: the goal is to revoke it</span>
        )}
      </div>
    );
  }

  const cmp = reading.direction === "atMost" ? "≤" : "≥";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Now</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-100">
            {formatUnits(reading.current, reading.decimals, 2)}
          </p>
          <p className="text-xs text-zinc-500">{reading.unit}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Target</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-300">
            {cmp} {formatUnits(reading.target, reading.decimals, 2)}
          </p>
        </div>
      </div>
      <ProgressBar progress={reading.progress} met={reading.met} />
      <p className="text-sm text-zinc-400">
        {reading.met ? "Goal met." : `${Math.floor(reading.progress * 100)}% of the way to the target.`}
        {reading.note && <span className="block text-xs text-zinc-500">{reading.note}</span>}
      </p>
    </div>
  );
}

export function MetricPanel({ entry, clock, onChange }: { entry: MarketEntry; clock: ClockInfo | null; onChange: () => void }) {
  const program = useProgram();
  const { send, pending, connected } = useSendTransaction();
  const { account, reading } = entry;
  const status = statusOf(account);
  const next = resolution(entry, clock);

  const resolve = async () => {
    const ix = await resolveIx(program, marketKeys(entry.address, account.metricAccount));
    if (await send("Resolve market", [ix])) onChange();
  };

  return (
    <Panel title="On-chain KPI" icon={Activity}>
      <p className="mb-5 text-lg font-medium text-zinc-100">{goalText(account, reading)}</p>
      <ReadingBody reading={reading} />

      {status !== "active" && (
        <div
          className={`mt-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${
            status === "yes"
              ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"
              : "border-rose-400/20 bg-rose-400/5 text-rose-200"
          }`}
        >
          {status === "yes" ? <CircleCheck className="size-5" /> : <CircleX className="size-5" />}
          Resolved {status.toUpperCase()} at slot {account.resolvedSlot.toString()}.{" "}
          {status === "yes" ? "YES redeems 1:1 for USDC." : "NO redeems 1:1 for USDC."}
        </div>
      )}

      {next && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            {next.label}.{" "}
            {next.outcome === "?" ? "Anyone can resolve it now." : `Anyone can resolve it ${next.outcome} now.`}
          </p>
          <button
            type="button"
            onClick={resolve}
            disabled={!connected || pending !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            title={connected ? undefined : "Connect a wallet to resolve"}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Gavel className="size-4" />}
            Resolve
          </button>
        </div>
      )}

      {kindOf(account) !== "stakeAtLeast" && status === "active" && !next && (
        <p className="mt-5 text-xs text-zinc-500">
          Resolves YES the moment the goal is met, by anyone, in the same transaction. If it is not met by the deadline,
          the market resolves NO.
        </p>
      )}
    </Panel>
  );
}
