/**
 * Purpose: the "On-chain read" panel of a home slide (the approved prototype's `.home-proof`, where the old chart was):
 *          the value read now against the target, "if read now" with the distance, who opened the campaign, the
 *          account, who reads it, the two moments in UTC, and the creator notice on burn, lock and stake campaigns.
 * Version: 0.1.1 (a price in US$ with "$")
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import { AlertTriangle, Eye } from "lucide-react";

import { CREATOR_NOTICE } from "@/features/campaign-page/copy";
import { utc, valueText } from "@/features/campaign-page/format";
import type { Card } from "@/features/campaigns/model";
import { comparator, kindName, type Reading } from "@/features/campaigns/readings";
import { relative } from "@/features/campaigns/when";

const FIELD = { price: "price now", burn: "Supply now", lock: "Locked now", pool: "Pool total now", stake: "Stake" };
const short = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;

function IfNow({ card, reading }: { card: Card; reading: Reading | null | undefined }) {
  const kind = kindName(card);
  if (kind === "stake") return <p className="home-ifnow">Read in the measured epoch, by the program itself.</p>;
  if (!reading || card.target === null) return <p className="home-ifnow">No reading yet</p>;
  if (reading.ifReadNow === null) return <p className="home-ifnow">A read now decides nothing yet.</p>;
  const met = reading.ifReadNow === "YES";
  const gap = card.target > reading.value ? card.target - reading.value : reading.value - card.target;
  const share = reading.value === 0n ? null : ((Number(gap) / Number(reading.value)) * 100).toFixed(1);
  const up = comparator(card) === "≥";
  return (
    <p className="home-ifnow">
      If read now: <b className={met ? "y" : "n"}>{met ? "YES" : "NO"}</b>
      {met
        ? ""
        : ` · ${valueText(kind, gap, reading.exponent, card.asset)} to go${share ? ` (${up ? "+" : "−"}${share}%)` : ""}`}
    </p>
  );
}

export function HomeProof({ card, reading, now }: { card: Card; reading: Reading | null | undefined; now: bigint }) {
  const kind = kindName(card);
  const field = kind === "price" ? `${card.asset ?? "The"} ${FIELD.price}` : FIELD[kind];
  return (
    <div className="home-proof">
      <p className="home-proof-head">
        <Eye className="size-[15px]" aria-hidden="true" />
        <span>On-chain read</span>
        <span className="home-acct" title={card.metricAccount}>
          {kind === "price" && card.asset ? `Pyth ${card.asset}, sponsored feed` : short(card.metricAccount)}
        </span>
      </p>
      <div className="read-values">
        <div>
          <small>{field}</small>
          <b className="num">{reading ? valueText(kind, reading.value, reading.exponent, card.asset) : "—"}</b>
        </div>
        <div>
          <small>YES if {comparator(card) === "≥" ? "at or above" : "at or below"}</small>
          <b className="num dim">
            {card.target === null ? "—" : valueText(kind, card.target, card.priceExponent, card.asset)}
          </b>
        </div>
      </div>
      <IfNow card={card} reading={reading} />
      <dl className="rows home-facts">
        <div>
          <dt>Opened by</dt>
          <dd>
            {card.creatorIsTeam ? "Brot team (free)" : <span className="mono">{short(card.creator)} (paid)</span>}
          </dd>
        </div>
        <div>
          <dt>Account</dt>
          <dd className="mono" title={card.metricAccount}>
            {short(card.metricAccount)}
          </dd>
        </div>
        <div>
          <dt>Last read</dt>
          <dd>{reading ? "just now" : "No reading yet"}</dd>
        </div>
        <div>
          <dt>Who reads it</dt>
          <dd>Brot&apos;s service; anyone can re-check</dd>
        </div>
      </dl>
      <dl className="rows moments-rows">
        {(
          [
            ["Entries close", card.entriesCloseAt],
            ["Deadline", card.deadlineAt],
          ] as const
        ).map(([label, at]) =>
          at === null ? null : (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {relative(at, now)}
                <small>{utc(at)}</small>
              </dd>
            </div>
          ),
        )}
      </dl>
      {kind !== "price" ? (
        <p className="home-creator">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          <span>{CREATOR_NOTICE}</span>
        </p>
      ) : null}
    </div>
  );
}
