/**
 * Purpose: the asset slot of a price campaign (TP §3.4.10 row 4): the Pyth feeds on the program's compiled list, each
 *          read live from its sponsored account, with its price and its state now (fresh, or why it cannot back a
 *          campaign). The feeds that can are shown first; the others wait behind one disclosure, so a list of feeds
 *          Pyth does not keep fresh on devnet does not bury the ones that work. The picked feed always shows.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useId } from "react";

import { cx } from "@/components/ui/cx";
import { SLOTS } from "./copy";
import type { FeedOption } from "./preview";

function Feed({ f, picked, name, onPick }: { f: FeedOption; picked: boolean; name: string; onPick: () => void }) {
  return (
    <label
      className={cx(
        "flex cursor-pointer items-center justify-between gap-2 rounded-sm border px-3 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
        picked ? "border-accent bg-row-hover" : "border-line",
      )}
    >
      <input type="radio" name={name} className="sr-only" checked={picked} onChange={onPick} />
      <b>{f.symbol}</b>
      <span className="text-right text-xs">
        <span className="block tabular-nums">{f.price ?? "–"}</span>
        <em className={cx("not-italic", f.usable ? "text-muted" : "text-error")}>{f.tag}</em>
      </span>
    </label>
  );
}

export function FeedPicker({
  feeds,
  picked,
  onPick,
}: {
  feeds: FeedOption[];
  picked: string | null;
  onPick: (hex: string) => void;
}) {
  const name = useId();
  const shown = feeds.filter((f) => f.usable || f.hex === picked);
  const others = feeds.filter((f) => !f.usable && f.hex !== picked);
  const grid = "grid grid-cols-1 gap-2 min-[413px]:grid-cols-2";
  const feed = (f: FeedOption) => (
    <Feed key={f.hex} f={f} picked={picked === f.hex} name={name} onPick={() => onPick(f.hex)} />
  );
  return (
    <>
      {shown.length > 0 ? <div className={grid}>{shown.map(feed)}</div> : null}
      {others.length > 0 ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted">{SLOTS.otherFeeds(others.length)}</summary>
          <div className={cx(grid, "mt-2")}>{others.map(feed)}</div>
        </details>
      ) : null}
    </>
  );
}
