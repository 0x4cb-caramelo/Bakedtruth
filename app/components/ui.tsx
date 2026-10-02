"use client";

// Small presentational pieces shared by the explorer and the market page.

import type { ReactNode } from "react";
import { Copy, ExternalLink, Flame, KeyRound, Lock, ShieldCheck, Snowflake, Vote, type LucideIcon } from "lucide-react";

import { explorerAddress } from "@/lib/config";
import { shortAddress } from "@/lib/format";
import type { Reading } from "@/lib/metric";
import { KIND_INFO, type Kind, type Phase, type Status } from "@/lib/view";

export const KIND_ICON: Record<Kind, LucideIcon> = {
  supplyAtMost: Flame,
  immutable: ShieldCheck,
  stakeAtLeast: Vote,
  mintAuthorityRevoked: KeyRound,
  freezeAuthorityRevoked: Snowflake,
  lockedAtLeast: Lock,
};

export function KindChip({ kind }: { kind: Kind }) {
  const Icon = KIND_ICON[kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
      <Icon className="size-3.5 text-amber-300" />
      {KIND_INFO[kind].label}
    </span>
  );
}

const STATUS_STYLE = {
  trading: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  awaitingResolution: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  yes: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  no: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};

const STATUS_LABEL = {
  trading: "Trading",
  awaitingResolution: "Awaiting resolution",
  yes: "Resolved YES",
  no: "Resolved NO",
};

export function StatusBadge({ status, phase }: { status: Status; phase: Phase }) {
  const key = status === "active" ? (phase === "trading" ? "trading" : "awaitingResolution") : status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[key]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[key]}
    </span>
  );
}

export function AddressLink({ address, label }: { address: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm">
      <a
        href={explorerAddress(address)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-zinc-300 hover:text-white"
        title={address}
      >
        {label ?? shortAddress(address)}
        <ExternalLink className="size-3 text-zinc-500" />
      </a>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(address)}
        className="rounded p-0.5 text-zinc-500 hover:text-zinc-200"
        aria-label="Copy address"
        title="Copy address"
      >
        <Copy className="size-3" />
      </button>
    </span>
  );
}

export function ProgressBar({ progress, met }: { progress: number; met: boolean }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ${met ? "bg-emerald-400" : "bg-gradient-to-r from-amber-500 to-amber-300"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** One-line summary of a reading for cards: a bar for quantities, a state for authorities. */
export function ReadingSummary({ reading }: { reading?: Reading }) {
  if (!reading) return <div className="h-2 w-full animate-pulse rounded-full bg-white/10" />;
  if (reading.type === "unavailable") return <p className="text-xs text-zinc-500">{reading.reason}</p>;
  if (reading.type === "authority") {
    return (
      <p className={`text-xs ${reading.met ? "text-emerald-300" : "text-zinc-400"}`}>
        {reading.what}: {reading.met ? "revoked" : "still live"}
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      <ProgressBar progress={reading.progress} met={reading.met} />
      <p className="text-xs text-zinc-400">
        {reading.met ? "Goal met" : `${Math.floor(reading.progress * 100)}% of the way`}
      </p>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100 tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function Panel({ title, icon: Icon, children, action }: { title: string; icon?: LucideIcon; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {Icon && <Icon className="size-4" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
