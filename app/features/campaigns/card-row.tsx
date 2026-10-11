/**
 * Purpose: a campaign on one line (the approved prototype's `.card-row`), for the home page's "Closing soon" and
 *          "Answered recently": the kind tile, the sentence and its kind and pot, then what the box needs on the right
 *          (the YES share and the close, amber under 24 hours; or the answer and where its payout is).
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import Link from "next/link";
import type { ReactNode } from "react";

import { cx } from "@/components/ui/cx";
import { KindTileOf, kindLabel } from "./card-parts";
import type { Card } from "./model";
import { solShort } from "./when";

export function CardRow({ card, right, soon }: { card: Card; right: ReactNode; soon?: boolean }) {
  return (
    <Link className={cx("card-row", soon && "is-soon")} href={`/c/${card.id}`}>
      <KindTileOf card={card} small />
      <span className="card-row-text">
        <b>{card.title}</b>
        <span>
          {kindLabel(card)} · {solShort(card.potLamports + card.prizeLamports)} pot
        </span>
      </span>
      <span className="card-row-right">{right}</span>
    </Link>
  );
}
