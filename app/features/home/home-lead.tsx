/**
 * Purpose: the home page's top line (the approved prototype's `.home-lead`): what this is, and the opening action with
 *          what a US$500 opening costs in SOL right now at Pyth's SOL/USD price (4a: US$ only where it sets a cost).
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { solShort } from "@/features/campaigns/when";
import { usdText } from "@/features/open-campaign/quote";
import { HOME } from "./copy";
import { useOpeningNow } from "./use-opening-now";

/** The quote rounded up to four decimals, as the prototype writes it ("4.194 SOL"): never less than it costs. */
const upToFour = (lamports: bigint) => solShort(((lamports + 99_999n) / 100_000n) * 100_000n);

export function HomeLead() {
  const now = useOpeningNow();
  const line =
    now.status === "ready"
      ? HOME.now(upToFour(now.quote.paid), usdText(now.quote.price, now.quote.exponent))
      : now.status === "paused"
        ? HOME.paused
        : now.status === "stale"
          ? HOME.stale
          : HOME.reading;
  return (
    <section className="home-lead">
      <div>
        <h1>{HOME.title}</h1>
        <p>{HOME.sub}</p>
      </div>
      <div className="home-open">
        <Link className="cta" href="/abrir">
          <span>
            <Plus className="size-[15px]" aria-hidden="true" />
            {HOME.open}
          </span>
        </Link>
        <p>{HOME.cost}</p>
        <p>{line}</p>
      </div>
    </section>
  );
}
