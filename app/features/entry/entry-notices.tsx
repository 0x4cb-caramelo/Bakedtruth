/**
 * Purpose: the notices a baker reads before signing (Sprint 11 DoD; BR-12, P1 §3.2, P1 §4.6): the return is an estimate
 *          that changes until entries close; a large entry lowers its own side's return (with the numbers when this one
 *          does); the lock, in the founder's L-03 words; the fee and the creator's share; what a one-sided pot does; and
 *          the devnet notice. Shown in the panel, the notes folded under "Read before you enter" with the lock in view
 *          (Ronaldo, 2026-10-11), and again, all open, in the sheet before the wallet.
 * Version: 0.2.0 (the UI overhaul: the panel's notes folded)
 * Sprint:  11 (site: campaign page and entry)
 */
import { ChevronDown, Lock } from "lucide-react";

import { cx } from "@/components/ui/cx";
import { NOTICES } from "./copy";

export function EntryNotices({
  feeBps,
  creatorShareBps,
  oneSidedFeeBps,
  large,
  compact,
  folded,
}: {
  feeBps: number;
  creatorShareBps: number;
  oneSidedFeeBps: number;
  /** This entry's per-1 and a minimum entry's, when this one lowers its side's return. */
  large: { mine: string; small: string } | null;
  compact?: boolean;
  /** The panel folds the notes under "Read before you enter"; the lock stays in view, and the sheet shows them all. */
  folded?: boolean;
}) {
  const items = [
    NOTICES.estimate,
    large ? `${NOTICES.largeEntry} ${NOTICES.largeEntryNumbers(large.small, large.mine)}` : NOTICES.largeEntry,
    NOTICES.fee(feeBps, creatorShareBps),
    NOTICES.oneSided(oneSidedFeeBps),
    NOTICES.devnet,
  ];
  const notes = (
    <ul className="en-notes list-disc">
      {items.map((text, i) => (
        <li key={i} className={cx(i === 1 && large ? "text-warn" : undefined)}>
          {text}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cx("space-y-2", compact ? "text-xs" : "text-[12.5px]")}>
      <p className="en-lock">
        <Lock className="size-4" aria-hidden="true" />
        <span>{NOTICES.lock}</span>
      </p>
      {folded ? (
        <details className="fold accent">
          <summary>
            {NOTICES.readBefore}
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </summary>
          {notes}
        </details>
      ) : (
        notes
      )}
    </div>
  );
}
