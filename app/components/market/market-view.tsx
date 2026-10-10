"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Link2, SearchX, TriangleAlert } from "lucide-react";

import { explorerAddress } from "@/lib/config";
import { formatDuration, slotTime } from "@/lib/format";
import { useClock, useMarket, useMarketActivity, useTokenBalances } from "@/lib/hooks";
import { marketKeys } from "@/lib/instructions";
import * as lib from "@/lib/market";
import { goalText, questionText } from "@/lib/metric";
import { closeSlot, KIND_INFO, kindOf, phaseOf, statusOf } from "@/lib/view";
import { KindTile, StatusPill } from "@/components/primitives";
import { ChartCard } from "@/components/market/chart-card";
import { Details } from "@/components/market/details";
import { PositionCard } from "@/components/market/position-card";
import { ProofCard } from "@/components/market/proof-card";
import { TradeCard, type Balances } from "@/components/market/trade-card";
import { usePublishTape } from "@/components/tape-context";
import { useWallet } from "@solana/wallet-adapter-react";

export function MarketView({ address, initialSide }: { address: string; initialSide: lib.Side }) {
  const market = useMarket(address);
  const history = useMarketActivity(address);
  const clock = useClock();
  const { publicKey } = useWallet();
  const [side, setSide] = useState<lib.Side>(initialSide);
  // A stable array, or publishing it would re-render this view in a loop.
  const tape = useMemo(() => (market.data ? [market.data] : undefined), [market.data]);
  usePublishTape(tape, true);

  const account = market.data?.account;
  const keys = account ? marketKeys(market.data!.address, account.metricAccount) : null;
  const balanceData = useTokenBalances(
    publicKey && keys ? publicKey : null,
    keys ? [lib.USDC_MINT, keys.yesMint, keys.noMint] : [],
  );
  const balances: Balances = {
    usdc: balanceData.data?.get(lib.USDC_MINT.toBase58()) ?? 0n,
    yes: (keys && balanceData.data?.get(keys.yesMint.toBase58())) ?? 0n,
    no: (keys && balanceData.data?.get(keys.noMint.toBase58())) ?? 0n,
    loaded: balanceData.data !== undefined,
  };
  const refresh = () => {
    market.refresh();
    history.refresh();
    balanceData.refresh();
  };

  if (market.loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="h-28 animate-pulse rounded-2xl bg-surface" />
          <div className="h-[460px] animate-pulse rounded-2xl bg-surface" />
        </div>
        <div className="h-[520px] animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }
  if (market.error && !market.data) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-no/30 bg-no/5 p-5 text-sm text-no">
        <TriangleAlert className="size-5 shrink-0" />
        Could not load this market: {market.error.message}
      </div>
    );
  }
  if (!market.data || !account) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center text-muted">
        <SearchX className="size-10 text-dim" />
        <p>No market at this address.</p>
        <Link href="/" className="text-sm text-brand hover:underline">
          Back to markets
        </Link>
      </div>
    );
  }

  const entry = market.data;
  const kind = kindOf(account);
  const status = statusOf(account);
  const phase = phaseOf(account, clock);
  const closesIn = clock ? slotTime(closeSlot(account, clock), clock).deltaMs : null;
  const pick = (s: lib.Side) => {
    setSide(s);
    document.getElementById("trade")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-dim">
        <Link href="/" className="hover:text-ink">
          Markets
        </Link>
        <span>/</span>
        <span className="text-muted">{KIND_INFO[kind].label}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <header className="flex gap-4">
            <KindTile kind={kind} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">{KIND_INFO[kind].label}</span>
                <StatusPill status={status} phase={phase} />
                {status === "active" && phase === "trading" && closesIn !== null && (
                  <span className="text-xs text-dim">closes in {formatDuration(closesIn)}</span>
                )}
              </div>
              <h1 className="mt-1 font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl">
                {questionText(account, entry.reading, entry.name)}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {goalText(account, entry.reading)} · resolved by an on-chain read
              </p>
            </div>
            <div className="hidden shrink-0 gap-1 sm:flex">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="grid size-9 place-items-center rounded-lg text-dim hover:bg-raised hover:text-ink"
                aria-label="Copy link"
                title="Copy link"
              >
                <Link2 className="size-4" />
              </button>
              <a
                href={explorerAddress(address)}
                target="_blank"
                rel="noreferrer"
                className="grid size-9 place-items-center rounded-lg text-dim hover:bg-raised hover:text-ink"
                aria-label="Open in explorer"
                title="Open in explorer"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
          </header>

          {/* The proof leads: it is what the market resolves on. The padding is the mascot's ledge. */}
          <div
            className="pt-20"
            data-perch="proof"
            data-perch-x="0.86"
            data-perch-dy="80"
            data-perch-size="1.3"
            data-perch-pose="point"
            data-perch-say="Read the account."
          >
            <ProofCard entry={entry} clock={clock} onDone={refresh} />
          </div>
          <ChartCard entry={entry} clock={clock} history={history.data} onPick={pick} />
          <Details entry={entry} clock={clock} history={history.data} />
        </div>

        <aside id="trade" className="scroll-mt-28 space-y-4 lg:sticky lg:top-24">
          <div
            className="pt-20"
            data-perch="trade"
            data-perch-x="0.22"
            data-perch-dy="80"
            data-perch-pose={side === "yes" ? "deadpan" : "skeptical"}
          >
            <TradeCard entry={entry} clock={clock} side={side} onSide={setSide} balances={balances} onDone={refresh} />
          </div>
          <PositionCard entry={entry} clock={clock} balances={balances} onDone={refresh} />
        </aside>
      </div>
    </div>
  );
}
