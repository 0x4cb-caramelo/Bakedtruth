"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { explorerTx } from "@/lib/config";
import { formatDuration, shortAddress } from "@/lib/format";
import { actorOf, describeEvent, marketOf, type Activity } from "@/lib/history";

const TONE = { yes: "bg-yes", no: "bg-no", neutral: "bg-muted" };

/**
 * On-chain activity, newest first. `questions` maps a market address to its question, for the
 * program-wide feed; leave it out on a market's own page.
 */
export function ActivityFeed({
  items,
  now,
  questions,
  empty = "No activity yet.",
}: {
  items: Activity[];
  now: number;
  questions?: Map<string, string>;
  empty?: string;
}) {
  if (items.length === 0) return <p className="py-8 text-center text-sm text-dim">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {items.map(({ signature, time, event }, i) => {
        const { text, tone } = describeEvent(event);
        const actor = actorOf(event);
        const market = marketOf(event).toBase58();
        return (
          <li key={`${signature}-${i}`} className="flex items-start gap-3 py-3 text-sm">
            <span className={`mt-1.5 size-2 shrink-0 ${TONE[tone]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-ink/90">
                {actor && <span className="font-mono text-muted">{shortAddress(actor.toBase58())} </span>}
                {text}
              </p>
              {questions && (
                <Link href={`/markets/${market}`} className="mt-0.5 block truncate text-xs text-brand hover:underline">
                  {questions.get(market) ?? shortAddress(market)}
                </Link>
              )}
            </div>
            <a
              href={explorerTx(signature)}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-0.5 text-xs tabular-nums text-dim hover:text-muted"
            >
              {time ? `${formatDuration(Math.max(0, now - time))} ago` : "tx"}
              <ArrowUpRight className="size-3" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
