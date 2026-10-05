"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { BRAND } from "@/lib/brand";
import { useClock, useMarkets } from "@/lib/hooks";
import { statusOf } from "@/lib/view";
import { Browse } from "@/components/home/browse";
import { HeroMeter } from "@/components/home/hero-meter";
import { usePublishTape } from "@/components/tape-context";

const button =
  "inline-flex items-center px-4 py-2.5 font-display text-xl leading-none shadow-hard transition hover:-translate-x-px hover:-translate-y-px active:translate-x-[3px] active:translate-y-[3px] active:shadow-hard-sm";

export function HomeView() {
  const markets = useMarkets();
  const clock = useClock();
  usePublishTape(markets.data);
  const all = markets.data ?? [];
  const active = all.filter((e) => statusOf(e.account) === "active");
  // The market with the most at stake leads the page.
  const top = [...(active.length ? active : all)].sort((a, b) =>
    b.vault > a.vault ? 1 : b.vault < a.vault ? -1 : 0,
  )[0];

  return (
    <div className="space-y-14">
      {markets.error && !markets.data && (
        <div className="flex items-center gap-3 border-2 border-no bg-no/10 p-4 text-sm text-no">
          <TriangleAlert className="size-5 shrink-0" />
          Could not load markets from the RPC: {markets.error.message}
        </div>
      )}

      <section className="grid grid-cols-1 items-end gap-10 pt-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pt-32">
        <div>
          <h1 className="font-display text-[clamp(44px,5.4vw,78px)] leading-[.92]">
            {BRAND.headline[0]}
            <br />
            <span className="text-crust">{BRAND.headline[1]}</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted">{BRAND.sub}</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/#browse" className={`${button} bg-crust text-[#1a0f02]`}>
              Browse markets
            </Link>
            <Link href="/#how" className={`${button} border-2 border-line bg-surface text-ink`}>
              How it works
            </Link>
          </div>
        </div>
        {top ? <HeroMeter entry={top} /> : <div className="h-64 animate-pulse border-2 border-line bg-surface" />}
      </section>

      <div id="how" className="grid scroll-mt-28 grid-cols-1 gap-4 md:grid-cols-3">
        {BRAND.principles.map((p, i) => (
          <div
            key={p.title}
            data-perch={`principle-${i}`}
            data-perch-x="0.88"
            data-perch-size="0.75"
            className="border-2 border-line bg-surface p-4"
          >
            <h3 className="font-display text-[26px] leading-none text-ink">{p.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{p.body}</p>
          </div>
        ))}
      </div>

      <Browse entries={all} clock={clock} loading={!markets.data} />
    </div>
  );
}
