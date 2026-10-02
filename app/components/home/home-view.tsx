"use client";

import { Landmark, ScanEye, ShieldHalf, TriangleAlert, type LucideIcon } from "lucide-react";

import { useClock, useMarkets } from "@/lib/hooks";
import { closeSlot, phaseOf, statusOf } from "@/lib/view";
import { Browse } from "@/components/home/browse";
import { Featured } from "@/components/home/featured";
import { ClosingSoon, TrendingList } from "@/components/home/sidebar";

const PRINCIPLES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ScanEye,
    title: "Resolution is a read",
    body: "Each market reads one on-chain account. No oracle, no committee, no dispute window.",
  },
  {
    icon: Landmark,
    title: "Backed 1:1 in USDC",
    body: "Every YES sits on one USDC in the market's vault. Winners redeem 1:1, any time after.",
  },
  {
    icon: ShieldHalf,
    title: "Guarded trading",
    body: "Trading halts the moment a goal is met, so nobody buys a known winner at a stale price.",
  },
];

export function HomeView() {
  const markets = useMarkets();
  const clock = useClock();
  const all = markets.data ?? [];
  const active = all.filter((e) => statusOf(e.account) === "active");
  // Biggest vaults first: the markets with the most at stake.
  const byVault = [...(active.length ? active : all)].sort((a, b) => (b.vault > a.vault ? 1 : b.vault < a.vault ? -1 : 0));
  const closing = active
    .filter((e) => phaseOf(e.account, clock) === "trading")
    .sort((a, b) => closeSlot(a.account, clock) - closeSlot(b.account, clock))
    .slice(0, 4);

  return (
    <div className="space-y-10">
      {markets.error && !markets.data && (
        <div className="flex items-center gap-3 rounded-2xl border border-no/30 bg-no/5 p-4 text-sm text-no">
          <TriangleAlert className="size-5 shrink-0" />
          Could not load markets from the RPC: {markets.error.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {markets.data ? (
          <Featured entries={byVault.slice(0, 7)} clock={clock} />
        ) : (
          <div className="h-[420px] animate-pulse rounded-2xl border border-line bg-surface" />
        )}
        <div className="space-y-6">
          <TrendingList entries={byVault.slice(0, 5)} />
          <ClosingSoon entries={closing} clock={clock} />
        </div>
      </div>

      <div id="how" className="grid scroll-mt-28 grid-cols-1 gap-4 md:grid-cols-3">
        {PRINCIPLES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <Browse entries={all} clock={clock} loading={!markets.data} />
    </div>
  );
}
