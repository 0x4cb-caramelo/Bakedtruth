/**
 * Purpose: one slide of the home page's "Open now" carousel (the approved prototype's `.home-slide`): the kind, the
 *          sentence, each side's share in large type, the pot bar with its legend, YES and NO shortcuts with what
 *          1 SOL returns now, the line under them, the pot and its bakers; the proof panel beside it; and on a phone
 *          the standard card instead (cards.css swaps them).
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import Link from "next/link";

import { SplitBar } from "@/components/ui/split-bar";
import { PANEL } from "@/features/entry/copy";
import { perOne } from "@/features/entry/estimate";
import { CampaignCard } from "@/features/campaigns/campaign-card";
import { KindTileOf, kindLabel } from "@/features/campaigns/card-parts";
import type { Card } from "@/features/campaigns/model";
import type { Reading } from "@/features/campaigns/readings";
import { solShort } from "@/features/campaigns/when";
import { SLIDE_NOTE } from "./copy";
import { HomeProof } from "./home-proof";

type Props = {
  card: Card;
  index: number;
  total: number;
  now: bigint;
  reading: Reading | null | undefined;
  saved: boolean;
  onToggle: () => void;
};

function sides(card: Card): { yes: string; no: string; note: string } {
  const { yesLamports: y, noLamports: n } = card;
  if (y === 0n && n === 0n) return { yes: "", no: "", note: SLIDE_NOTE.empty };
  const est = (bps: bigint | null) => (bps === null ? "" : PANEL.perOne(perOne(bps)));
  if (n === 0n) return { yes: "refund if NO stays empty", no: "be first", note: SLIDE_NOTE.lone("YES", "NO") };
  if (y === 0n) return { yes: "be first", no: "refund if YES stays empty", note: SLIDE_NOTE.lone("NO", "YES") };
  return { yes: est(card.estYesBps), no: est(card.estNoBps), note: SLIDE_NOTE.both(!card.creatorIsTeam) };
}

export function HomeSlide({ card, index, total, now, reading, saved, onToggle }: Props) {
  const yes = card.yesShare === null ? null : Math.round(card.yesShare * 100);
  const lone = (card.yesLamports === 0n) !== (card.noLamports === 0n);
  const s = sides(card);
  const empty = yes === null;
  const side = (key: "yes" | "no", sub: string) => (
    <Link className={`side-btn ${key}`} href={`/c/${card.id}?side=${key}`}>
      <span>{`${empty ? "Join " : ""}${key.toUpperCase()}`}</span>
      <span className="per">{sub}</span>
    </Link>
  );
  return (
    <article className="home-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${total}`}>
      <div className="home-slide-main">
        <div className="home-slide-head">
          <KindTileOf card={card} />
          <span className="card-kind">
            <b>{kindLabel(card)}</b>
            <span>{card.asset ?? `${card.metricAccount.slice(0, 4)}…${card.metricAccount.slice(-4)}`}</span>
          </span>
        </div>
        <Link className="home-slide-title" href={`/c/${card.id}`}>
          {card.title}
        </Link>
        {empty ? (
          <p className="home-chance none">No entries yet</p>
        ) : (
          <div className="home-chance">
            <span className="y">
              <small>YES</small>
              <strong className="num">{yes}%</strong>
            </span>
            {lone ? <span className="chip">One-sided so far</span> : null}
            <span className="n">
              <small>NO</small>
              <strong className="num">{100 - (yes ?? 0)}%</strong>
            </span>
          </div>
        )}
        <div>
          <SplitBar yes={Number(card.yesLamports)} no={Number(card.noLamports)} prize={Number(card.prizeLamports)} />
          {empty ? null : (
            <div className="split-legend">
              <span className="y">
                YES <b>{yes}%</b> · {solShort(card.yesLamports)}
              </span>
              <span className="n">
                NO <b>{100 - (yes ?? 0)}%</b> · {solShort(card.noLamports)}
              </span>
            </div>
          )}
        </div>
        <div className="home-sides">
          {side("yes", s.yes)}
          {side("no", s.no)}
        </div>
        <p className="home-note">{s.note}</p>
        <p className="home-pot">
          <b>{solShort(card.potLamports + card.prizeLamports).replace(" SOL", "")}</b> SOL in the pot · {card.entries}{" "}
          {card.entries === 1 ? "baker" : "bakers"}
        </p>
      </div>
      <HomeProof card={card} reading={reading} now={now} />
      <div className="home-slide-card">
        <CampaignCard card={card} now={now} reading={reading} saved={saved} onToggle={onToggle} />
      </div>
    </article>
  );
}
