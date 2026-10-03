"use client";

// Building blocks shared by the home page and the market page.

import Link from "next/link";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  Copy,
  ExternalLink,
  Flame,
  KeyRound,
  Lock,
  ShieldCheck,
  Snowflake,
  Vote,
  type LucideIcon,
} from "lucide-react";

import { explorerAddress } from "@/lib/config";
import { formatBps, shortAddress } from "@/lib/format";
import type { Reading } from "@/lib/metric";
import { KIND_INFO, multiplier, type Kind, type Phase, type Status } from "@/lib/view";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-white">
        <BadgeCheck className="size-5" />
      </span>
      <span className="font-display text-2xl font-bold tracking-tight text-ink">Provable</span>
    </span>
  );
}

const KIND_STYLE: Record<Kind, { icon: LucideIcon; tile: string }> = {
  supplyAtMost: { icon: Flame, tile: "from-orange-500 to-rose-600" },
  mintAuthorityRevoked: { icon: KeyRound, tile: "from-violet-500 to-fuchsia-600" },
  freezeAuthorityRevoked: { icon: Snowflake, tile: "from-sky-400 to-indigo-600" },
  lockedAtLeast: { icon: Lock, tile: "from-cyan-400 to-teal-600" },
  immutable: { icon: ShieldCheck, tile: "from-emerald-400 to-green-700" },
  stakeAtLeast: { icon: Vote, tile: "from-amber-300 to-orange-600" },
};

/** Gradient square with the resolver's icon, in place of a market thumbnail. */
export function KindTile({ kind, size = "md" }: { kind: Kind; size?: "sm" | "md" | "lg" }) {
  const { icon: Icon, tile } = KIND_STYLE[kind];
  const box = { sm: "size-8 rounded-lg", md: "size-11 rounded-xl", lg: "size-16 rounded-2xl" }[size];
  const glyph = { sm: "size-4", md: "size-5", lg: "size-8" }[size];
  return (
    <span className={`grid shrink-0 place-items-center bg-gradient-to-br ${tile} ${box} text-white shadow-inner`}>
      <Icon className={glyph} />
    </span>
  );
}

export const CategoryLabel = ({ kind }: { kind: Kind }) => (
  <span className="text-xs font-medium text-brand">{KIND_INFO[kind].label}</span>
);

/** Trueo-style pair of outlined boxes: "Yes 20%" / "No 80%". */
export function YesNoBoxes({ bps, href, size = "md" }: { bps: number; href?: string; size?: "md" | "lg" }) {
  const pad = size === "lg" ? "h-11 px-4 text-base" : "h-9 px-3 text-sm";
  const box = (label: string, value: number, tone: "yes" | "no") => {
    const cls = `flex flex-1 items-center justify-between rounded-lg border ${pad} font-medium transition ${
      tone === "yes"
        ? "border-yes/40 text-yes hover:bg-yes/10"
        : "border-no/40 text-no hover:bg-no/10"
    }`;
    const body = (
      <>
        <span>{label}</span>
        <span className="tabular-nums">{formatBps(value)}</span>
      </>
    );
    return href ? (
      <Link href={`${href}?side=${tone}`} className={cls} onClick={(e) => e.stopPropagation()}>
        {body}
      </Link>
    ) : (
      <span className={cls}>{body}</span>
    );
  };
  return (
    <div className="flex gap-2">
      {box("Yes", bps, "yes")}
      {box("No", 10_000 - bps, "no")}
    </div>
  );
}

/** Kalshi-style outcome row: label with a probability bar, payout multiplier and a % pill. */
export function OutcomeRow({ label, bps, tone }: { label: string; bps: number; tone: "yes" | "no" }) {
  const x = multiplier(bps);
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">{label}</p>
        <div className="mt-1.5 h-1 w-full rounded-full bg-line">
          <div
            className={`h-1 rounded-full ${tone === "yes" ? "bg-yes" : "bg-no"}`}
            style={{ width: `${Math.max(2, bps / 100)}%` }}
          />
        </div>
      </div>
      <span className="w-14 text-right text-sm tabular-nums text-muted">{x ? `${x.toFixed(2)}x` : "—"}</span>
      <span
        className={`grid h-9 w-16 place-items-center rounded-full border-2 text-sm font-bold tabular-nums ${
          tone === "yes" ? "border-yes/70 text-yes" : "border-no/70 text-no"
        }`}
      >
        {formatBps(bps).replace(/\.\d+%$/, "%")}
      </span>
    </div>
  );
}

const STATUS = {
  trading: { label: "Trading", cls: "bg-brand/15 text-brand" },
  awaitingResolution: { label: "Awaiting resolution", cls: "bg-warn/15 text-warn" },
  yes: { label: "Resolved YES", cls: "bg-yes/15 text-yes" },
  no: { label: "Resolved NO", cls: "bg-no/15 text-no" },
};

export function StatusPill({ status, phase }: { status: Status; phase: Phase }) {
  const key = status === "active" ? (phase === "trading" ? "trading" : "awaitingResolution") : status;
  const { label, cls } = STATUS[key];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/** Slim KPI progress line with its label, for cards and lists. */
export function ProgressLine({ reading }: { reading?: Reading }) {
  if (!reading) return <div className="h-4 animate-pulse rounded bg-raised" />;
  if (reading.type === "unavailable") return <p className="truncate text-xs text-dim">{reading.reason}</p>;
  if (reading.type === "authority") {
    return (
      <p className={`text-xs ${reading.met ? "text-yes" : "text-muted"}`}>
        {reading.what} {reading.met ? "revoked ✓" : "still live"}
      </p>
    );
  }
  const pct = Math.floor(reading.progress * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="h-1.5 flex-1 rounded-full bg-line">
        <div
          className={`h-1.5 rounded-full ${reading.met ? "bg-yes" : "bg-warn"}`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <span className={`shrink-0 tabular-nums ${reading.met ? "text-yes" : "text-muted"}`}>
        {reading.met ? "Goal met" : `${pct}% to goal`}
      </span>
    </div>
  );
}

export function AddressLink({ address, label }: { address: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm">
      <a
        href={explorerAddress(address)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-ink/90 hover:text-ink"
        title={address}
      >
        {label ?? shortAddress(address)}
        <ExternalLink className="size-3 text-dim" />
      </a>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(address)}
        className="rounded p-0.5 text-dim hover:text-ink"
        aria-label="Copy address"
        title="Copy address"
      >
        <Copy className="size-3" />
      </button>
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</section>;
}

/** Underlined text tabs, Kalshi/Trueo style. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  size = "md",
}: {
  tabs: { id: T; label: ReactNode }[];
  value: T;
  onChange: (id: T) => void;
  size?: "md" | "lg";
}) {
  return (
    <div role="tablist" className="flex gap-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`relative pb-2 font-semibold transition ${size === "lg" ? "font-display text-3xl" : "text-sm tracking-wide"} ${
            value === t.id ? (size === "lg" ? "text-brand" : "text-ink") : "text-dim hover:text-muted"
          }`}
        >
          {t.label}
          {value === t.id && (
            <span className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full ${size === "lg" ? "bg-brand" : "bg-ink"}`} />
          )}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <p className="text-lg font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-xs text-dim">
        {label}
        {sub && <span className="ml-1 text-muted">{sub}</span>}
      </p>
    </div>
  );
}
