"use client";

// Building blocks shared by the home page and the market page, in the "Tape" direction:
// square edges, 2px borders, hard shadows, progress counted in blocks.

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Coins,
  Copy,
  Droplets,
  ExternalLink,
  FileLock,
  Flame,
  KeyRound,
  Lock,
  ShieldCheck,
  Snowflake,
  Vote,
  type LucideIcon,
} from "lucide-react";

import { BRAND } from "@/lib/brand";
import { explorerAddress } from "@/lib/config";
import { formatBps, shortAddress } from "@/lib/format";
import { authorityWords, type Reading } from "@/lib/metric";
import { KIND_INFO, multiplier, type Kind, type Phase, type Status } from "@/lib/view";

export function Logo() {
  return (
    <span className="flex items-center gap-1">
      <Image
        src="/mascot/deadpan.png"
        alt=""
        width={57}
        height={36}
        className="-ml-2 h-9 w-auto [image-rendering:pixelated]"
        priority
      />
      <span className="font-display text-[40px] leading-none text-crust">{BRAND.name}</span>
    </span>
  );
}

const KIND_STYLE: Record<Kind, { icon: LucideIcon; bg: string; fg: string }> = {
  supplyAtMost: { icon: Flame, bg: "#4a2d26", fg: "#f7b778" },
  mintAuthorityRevoked: { icon: KeyRound, bg: "#3a2f4f", fg: "#cdb6f2" },
  freezeAuthorityRevoked: { icon: Snowflake, bg: "#2d3a51", fg: "#a8c9ef" },
  lockedAtLeast: { icon: Lock, bg: "#23403f", fg: "#9fdcd6" },
  immutable: { icon: ShieldCheck, bg: "#2a3f30", fg: "#a9dfb4" },
  stakeAtLeast: { icon: Vote, bg: "#4a3a22", fg: "#f2cf8a" },
  // Each new kind keeps the hue of its category: stake amber, lock teal, immutable green.
  stakePoolTvlAtLeast: { icon: Coins, bg: "#4a4020", fg: "#f0dc8c" },
  dammV2LockedAtLeast: { icon: Droplets, bg: "#1f3d44", fg: "#9bd6e2" },
  metadataImmutable: { icon: FileLock, bg: "#2f4226", fg: "#bfe3a0" },
};

/** Flat square with the resolver's icon, in place of a market thumbnail. */
export function KindTile({ kind, size = "md" }: { kind: Kind; size?: "sm" | "md" | "lg" }) {
  const { icon: Icon, bg, fg } = KIND_STYLE[kind];
  const box = { sm: "size-8", md: "size-11", lg: "size-16" }[size];
  const glyph = { sm: "size-4", md: "size-5", lg: "size-8" }[size];
  return (
    <span className={`grid shrink-0 place-items-center ${box}`} style={{ background: bg, color: fg }}>
      <Icon className={glyph} />
    </span>
  );
}

export const CategoryLabel = ({ kind }: { kind: Kind }) => (
  <span className="text-xs font-semibold text-crust">{KIND_INFO[kind].label}</span>
);

/** Progress counted in blocks; the next block blinks. `done` paints them all YES-green. */
export function Blocks({
  pct,
  n = 12,
  label,
  done = false,
  className = "h-3.5",
}: {
  pct: number;
  n?: number;
  label: string;
  done?: boolean;
  className?: string;
}) {
  const on = done ? n : Math.round((Math.min(100, Math.max(0, pct)) / 100) * n);
  return (
    <div role="img" aria-label={label} className={`grid auto-cols-fr grid-flow-col gap-[3px] ${className}`}>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={
            i < on
              ? done
                ? "bg-yes"
                : "bg-brand"
              : i === on
                ? "animate-blink bg-crust motion-reduce:animate-none"
                : "bg-raised"
          }
        />
      ))}
    </div>
  );
}

/** Pair of square boxes: "Yes 20%" / "No 80%". They fill with their colour on hover. */
export function YesNoBoxes({ bps, href, size = "md" }: { bps: number; href?: string; size?: "md" | "lg" }) {
  const pad = size === "lg" ? "h-11 px-4 text-base" : "h-9 px-3 text-sm";
  const box = (label: string, value: number, tone: "yes" | "no") => {
    const cls = `flex flex-1 items-center justify-between border-2 ${pad} font-bold transition ${
      tone === "yes"
        ? "border-yes bg-yes/10 text-yes hover:bg-yes hover:text-page"
        : "border-no bg-no/10 text-no hover:bg-no hover:text-page"
    }`;
    const body = (
      <>
        <span>{label}</span>
        <span className="tabular-nums">{formatBps(value)}</span>
      </>
    );
    return href ? (
      <Link
        href={`${href}?side=${tone}`}
        className={cls}
        onClick={(e) => e.stopPropagation()}
        data-mood={tone === "yes" ? "approve" : "skeptical"}
      >
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

/** Outcome row: label with a block bar, payout multiplier and the price. */
export function OutcomeRow({ label, bps, tone }: { label: string; bps: number; tone: "yes" | "no" }) {
  const x = multiplier(bps);
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">{label}</p>
        <div className="mt-1.5 h-1.5 w-full bg-raised">
          <div
            className={`h-1.5 ${tone === "yes" ? "bg-yes" : "bg-no"}`}
            style={{ width: `${Math.max(2, bps / 100)}%` }}
          />
        </div>
      </div>
      <span className="w-14 text-right text-sm tabular-nums text-muted">{x ? `${x.toFixed(2)}x` : "—"}</span>
      <span
        className={`grid h-9 w-16 place-items-center border-2 font-display text-xl tabular-nums ${
          tone === "yes" ? "border-yes text-yes" : "border-no text-no"
        }`}
      >
        {formatBps(bps).replace(/\.\d+%$/, "%")}
      </span>
    </div>
  );
}

const STATUS = {
  trading: { label: "Trading", cls: "border-brand text-brand" },
  awaitingResolution: { label: "Awaiting resolution", cls: "border-warn text-warn" },
  yes: { label: "Resolved YES", cls: "border-yes text-yes" },
  no: { label: "Resolved NO", cls: "border-no text-no" },
};

export function StatusPill({ status, phase }: { status: Status; phase: Phase }) {
  const key = status === "active" ? (phase === "trading" ? "trading" : "awaitingResolution") : status;
  const { label, cls } = STATUS[key];
  return (
    <span className={`inline-flex items-center gap-1.5 border-2 px-2 py-0.5 text-[11px] font-bold ${cls}`}>
      <span className="size-1.5 bg-current" />
      {label}
    </span>
  );
}

/** KPI progress in blocks with its label, for rows and cards. */
export function ProgressLine({ reading }: { reading?: Reading }) {
  if (!reading) return <div className="h-4 animate-pulse bg-raised" />;
  if (reading.type === "unavailable") return <p className="truncate text-xs text-dim">{reading.reason}</p>;
  if (reading.type === "authority") {
    const { subject, state } = authorityWords(reading);
    return (
      <p className={`text-xs ${reading.met ? "text-yes" : "text-muted"}`}>
        {subject} {state}
        {reading.met && " ✓"}
      </p>
    );
  }
  const pct = Math.floor(reading.progress * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <Blocks pct={pct} done={reading.met} label={`${pct}% of the way to the goal`} className="h-3 flex-1" />
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
        className="p-0.5 text-dim hover:text-ink"
        aria-label="Copy address"
        title="Copy address"
      >
        <Copy className="size-3" />
      </button>
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border-2 border-line bg-surface shadow-hard ${className}`}>{children}</section>;
}

/** Segmented tabs; the large size is the display face, for section switches. */
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
    <div role="tablist" className={size === "lg" ? "flex gap-6" : "flex border-2 border-line"}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={
            size === "lg"
              ? `relative pb-2 font-display text-4xl leading-none transition ${value === t.id ? "text-ink" : "text-dim hover:text-muted"}`
              : `border-l-2 border-line px-3 py-1.5 text-sm font-semibold transition first:border-l-0 ${
                  value === t.id ? "bg-raised text-ink" : "text-muted hover:text-ink"
                }`
          }
        >
          {t.label}
          {size === "lg" && value === t.id && <span className="absolute inset-x-0 bottom-0 h-1 bg-crust" />}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <p className="font-display text-2xl leading-none tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs text-dim">
        {label}
        {sub && <span className="ml-1 text-muted">{sub}</span>}
      </p>
    </div>
  );
}
