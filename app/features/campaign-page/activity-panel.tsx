/**
 * Purpose: the recent entries and the chance history (L-23, answered yes), read from the chain's `EntryAdded` events
 *          (activity.ts) once per page view and again after an entry lands: the chart of the YES share after each
 *          entry, and the list of entries (side, amount, wallet, when), which is also the chart's table view.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { shortAddress } from "@/lib/brot";
import { explorerTx } from "@/lib/config";
import { rpc } from "@/lib/rpc";
import { sol4 } from "@/features/entry/amount";
import { Skeleton } from "@/components/ui/skeleton";
import { ACTIVITY } from "./copy";
import { chanceHistory, readActivity, ACTIVITY_LIMIT, type ActivityItem } from "./activity";
import { ChanceChart } from "./chance-chart";
import { utc } from "./format";

type Loaded = { campaign: string; items: ActivityItem[] | null };

export function ActivityPanel({ campaign, round }: { campaign: string; round: number }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  useEffect(() => {
    let live = true;
    readActivity(rpc, campaign).then(
      (items) => live && setLoaded({ campaign, items }),
      () => live && setLoaded({ campaign, items: null }),
    );
    return () => {
      live = false;
    };
  }, [campaign, round]);
  const current = loaded && loaded.campaign === campaign ? loaded : null;
  const items = current?.items;
  return (
    <section aria-labelledby="activity-title" className="space-y-3 rounded-md border border-line bg-panel p-4">
      <h2 id="activity-title" className="m-0 flex flex-wrap items-center gap-2 font-display text-2xl font-bold">
        <Clock className="size-5" aria-hidden="true" />
        <span className="flex-1">{ACTIVITY.title}</span>
        <span className="font-sans text-xs font-normal text-muted">{ACTIVITY.hint(ACTIVITY_LIMIT)}</span>
      </h2>
      {!current ? (
        <Skeleton className="h-40" />
      ) : items === null || items === undefined ? (
        <p className="m-0 text-sm text-warn">{ACTIVITY.failed}</p>
      ) : items.length === 0 ? (
        <p className="m-0 text-sm text-muted">{ACTIVITY.none}</p>
      ) : (
        <>
          <ChanceChart points={chanceHistory(items)} label={ACTIVITY.history} />
          <ol className="m-0 list-none space-y-1 p-0 text-sm">
            {[...items].reverse().map((item) => (
              <li
                key={item.signature + item.seq}
                className="flex flex-wrap items-baseline gap-x-3 border-t border-line pt-1"
              >
                <b className={item.side === "yes" ? "text-yes-fg" : "text-no-fg"}>{item.side.toUpperCase()}</b>
                <span className="tabular-nums">{sol4(item.amount)} SOL</span>
                <span className="font-mono text-xs text-muted">{shortAddress(item.baker)}</span>
                <a
                  href={explorerTx(item.signature)}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs text-muted underline"
                >
                  {item.blockTime === null ? "tx" : utc(item.blockTime)}
                </a>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
