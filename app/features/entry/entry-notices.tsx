/**
 * Purpose: the notices a baker reads before signing (Sprint 11 DoD; BR-12, P1 §3.2, P1 §4.6): the return is an estimate
 *          that changes until entries close; a large entry lowers its own side's return (with the numbers when this one
 *          does); the lock, in the founder's L-03 words; the fee and the creator's share; what a one-sided pot does; and
 *          the devnet notice. Shown in the panel and again in the sheet before the wallet.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { Lock } from "lucide-react";

import { cx } from "@/components/ui/cx";
import { NOTICES } from "./copy";

export function EntryNotices({
  feeBps,
  creatorShareBps,
  oneSidedFeeBps,
  large,
  compact,
}: {
  feeBps: number;
  creatorShareBps: number;
  oneSidedFeeBps: number;
  /** This entry's per-1 and a minimum entry's, when this one lowers its side's return. */
  large: { mine: string; small: string } | null;
  compact?: boolean;
}) {
  const items = [
    NOTICES.estimate,
    large ? `${NOTICES.largeEntry} ${NOTICES.largeEntryNumbers(large.small, large.mine)}` : NOTICES.largeEntry,
    NOTICES.fee(feeBps, creatorShareBps),
    NOTICES.oneSided(oneSidedFeeBps),
    NOTICES.devnet,
  ];
  return (
    <div className={cx("space-y-2", compact ? "text-xs" : "text-[12.5px]")}>
      <p className="en-lock">
        <Lock className="size-4" aria-hidden="true" />
        <span>{NOTICES.lock}</span>
      </p>
      <ul className="en-notes list-disc">
        {items.map((text, i) => (
          <li key={i} className={cx(i === 1 && large ? "text-warn" : undefined)}>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
