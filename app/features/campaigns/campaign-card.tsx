/**
 * Purpose: one campaign's card (Sprint 10), in the approved prototype's structure (prototype-lab/campaigns, ui/card.js
 *          and css/card.css): kind and state, the sentence, the value read now against the target, each side's share
 *          of the entries with the pot bar, YES and NO shortcuts while entries are open (the button holds only its
 *          side; what 1 SOL returns now, the entry panel's own estimate, sits under it, as in the entry panel), the
 *          line past entries otherwise (Sprint 12), the creator notice on burn, lock and stake campaigns (BR-26, as a
 *          chip with the campaign page's words), the pot, the close and the save.
 * Version: 0.3.1 (the estimate under each side's button; 0.3.0, the UI overhaul: the prototype's card; 0.2.1, Sprint
 *          13's creator notice)
 * Sprint:  10 (site: campaign list); 12; 13; the sixth kind's site
 */
import Link from "next/link";
import { AlertTriangle, Bookmark, Check, Clock, X } from "lucide-react";

import { cx } from "@/components/ui/cx";
import { SplitBar } from "@/components/ui/split-bar";
import { CREATOR_NOTICE } from "@/features/campaign-page/copy";
import { PANEL } from "@/features/entry/copy";
import { perOne } from "@/features/entry/estimate";
import { CardChipView, KindTileOf, kindLabel } from "./card-parts";
import type { Card } from "./model";
import { ReadLine } from "./read-line";
import type { Reading } from "./readings";
import { relative, solShort, soon } from "./when";

function Sides({ card }: { card: Card }) {
  const empty = card.yesLamports === 0n && card.noLamports === 0n;
  const per = (side: "yes" | "no") => {
    if (empty) return "";
    const mine = side === "yes" ? card.yesLamports : card.noLamports;
    const other = side === "yes" ? card.noLamports : card.yesLamports;
    if (mine === 0n) return "be first";
    if (other === 0n) return `refund if ${side === "yes" ? "NO" : "YES"} stays empty`;
    const bps = side === "yes" ? card.estYesBps : card.estNoBps;
    return bps === null ? "" : PANEL.perOne(perOne(bps));
  };
  // As in the entry panel: the button holds only its side, and what 1 SOL returns sits under it; one link takes both.
  const button = (side: "yes" | "no") => {
    const line = per(side);
    return (
      <Link className="side-cell" href={`/c/${card.id}?side=${side}`}>
        <span className={`side-btn ${side}`}>{side.toUpperCase()}</span>
        {line ? <span className="side-est">{line}</span> : null}
      </Link>
    );
  };
  const note = empty ? "No entries yet" : card.yesLamports === 0n || card.noLamports === 0n ? "One-sided so far" : "";
  return (
    <>
      <div className="card-sides">
        {button("yes")}
        {button("no")}
      </div>
      {note ? <p className="card-note">{note}</p> : null}
    </>
  );
}

function Status({ card }: { card: Card }) {
  const paid = card.chip === "paid" || card.chip === "final";
  const answer = card.outcome === "Yes" ? " yes" : card.outcome === "No" ? " no" : "";
  const tone = paid ? `paid${answer}` : card.chip === "in_review" ? "review" : card.chip;
  const Icon = paid ? Check : card.chip === "void" ? X : Clock;
  return (
    <p className={cx("card-status", tone)} data-testid="card-state">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{card.stateLine}</span>
    </p>
  );
}

export function CampaignCard(props: {
  card: Card;
  now: bigint;
  reading: Reading | null | undefined;
  /** The creation box's "as it will appear": no live line, since nothing reads a campaign before it opens. */
  preview?: boolean;
  saved: boolean;
  onToggle: () => void;
}) {
  const { card, now } = props;
  const yes = card.yesShare === null ? null : Math.round(card.yesShare * 100);
  const share = (n: number | null) => (n === null ? "–" : `${n}%`);
  const open = card.chip === "open";
  return (
    <article className="card" data-perch={`card-${card.id}`} data-perch-x="0.86" data-perch-size="0.74">
      <div className="card-top">
        <KindTileOf card={card} />
        <div className="card-kind">
          <b>{kindLabel(card)}</b>
          <span>{card.asset ?? `${card.metricAccount.slice(0, 4)}…${card.metricAccount.slice(-4)}`}</span>
        </div>
        <div className="card-chips">
          <CardChipView chip={card.chip} />
        </div>
      </div>
      <Link className="card-title" href={`/c/${card.id}`}>
        {card.title}
      </Link>
      {props.preview ? null : <ReadLine card={card} reading={props.reading} />}
      <div
        className="card-chance"
        aria-label={`Share of the entries: YES ${yes === null ? "none yet" : `${yes}%`}, NO ${yes === null ? "none yet" : `${100 - yes}%`}`}
      >
        <span className="y">
          <small>YES</small>
          <strong className="num">{share(yes)}</strong>
        </span>
        <span className="n">
          <small>NO</small>
          <strong className="num">{share(yes === null ? null : 100 - yes)}</strong>
        </span>
      </div>
      <SplitBar thin yes={Number(card.yesLamports)} no={Number(card.noLamports)} prize={Number(card.prizeLamports)} />
      {open ? <Sides card={card} /> : <Status card={card} />}
      {card.kind !== "PriceTouch" ? (
        <span className="chip card-creator" title={CREATOR_NOTICE}>
          <AlertTriangle className="size-3" aria-hidden="true" />
          Creator may control the result
        </span>
      ) : null}
      <div className="card-foot">
        <span>
          Pot <b className="tabular">{solShort(card.potLamports + card.prizeLamports)}</b>
        </span>
        <span aria-hidden="true">·</span>
        {open && card.entriesCloseAt !== null ? (
          <span>
            Entries close{" "}
            <span className={soon(card.entriesCloseAt, now) ? "soon" : ""}>{relative(card.entriesCloseAt, now)}</span>
          </span>
        ) : (
          <span>{`${card.entries} ${card.entries === 1 ? "baker" : "bakers"}`}</span>
        )}
        {card.creatorIsTeam ? (
          <>
            <span aria-hidden="true">·</span>
            <span>Team</span>
          </>
        ) : null}
        <button
          type="button"
          className="save"
          aria-pressed={props.saved}
          aria-label={`${props.saved ? "Remove from" : "Add to"} saved: ${card.title}`}
          onClick={props.onToggle}
        >
          <Bookmark className="size-[15px]" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
