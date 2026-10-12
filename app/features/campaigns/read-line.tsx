/**
 * Purpose: a card's one line about the account it reads (the approved prototype's `.card-read`): the value now, in the
 *          units of its kind, against the side of the target YES needs, and for a price the distance in percent.
 *          "Now …" while the first read is on its way, "No reading" when the account is missing or its bytes are
 *          refused, and for a validator's stake the moment it is read, since its value is not in any account's bytes.
 * Version: 0.1.1 (a price in US$ with "$")
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import { Eye } from "lucide-react";

import { valueText } from "@/features/campaign-page/format";
import type { Card } from "./model";
import { comparator, distanceText, kindName, type Reading } from "./readings";

export function ReadLine({ card, reading }: { card: Card; reading: Reading | null | undefined }) {
  const kind = kindName(card);
  const target = card.target === null ? "—" : valueText(kind, card.target, card.priceExponent, card.asset);
  const gap = kind === "price" && reading && card.target !== null ? distanceText(reading, card.target) : null;
  return (
    <p className="card-read">
      <span>
        <Eye className="size-[13px] shrink-0" aria-hidden="true" />
        {kind === "stake" ? (
          "Read at the epoch's start"
        ) : reading === undefined ? (
          "Now …"
        ) : reading === null ? (
          "No reading"
        ) : (
          <>
            Now <b>{valueText(kind, reading.value, reading.exponent, card.asset)}</b>
          </>
        )}
      </span>
      <span>
        YES {comparator(card)} <b>{target}</b>
        {gap ? <span className="gap"> ({gap})</span> : null}
      </span>
    </p>
  );
}
