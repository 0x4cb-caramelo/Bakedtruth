/**
 * Purpose: the two boxes beside the home page's carousel (the approved prototype's `.home-side`): "Closing soon", the
 *          four listed campaigns whose entries close first, and "Answered recently", the four most recent answers of the
 *          last 72 hours, each with where its payout is. Loading draws skeleton rows; nothing to show says so.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import type { ReactNode } from "react";

import { CardRow } from "@/features/campaigns/card-row";
import type { Card } from "@/features/campaigns/model";
import { relative, soon } from "@/features/campaigns/when";
import { HOME } from "./copy";

const DAY = 86_400n;

function Box({ id, title, loading, children }: { id: string; title: string; loading: boolean; children: ReactNode }) {
  return (
    <section className="home-box" aria-labelledby={id} aria-busy={loading || undefined}>
      <h2 id={id}>{title}</h2>
      <div className="home-rows">{children}</div>
    </section>
  );
}

const Skeleton = () => (
  <>
    {[0, 1, 2, 3].map((k) => (
      <div key={k} className="home-skel-row" aria-hidden="true">
        <span className="skel home-sk s" />
        <span>
          <span className="skel home-sk w9" />
          <span className="skel home-sk w4" />
        </span>
        <span className="skel home-sk big" />
      </div>
    ))}
  </>
);

function answer(card: Card, now: bigint): ReactNode {
  const result = card.outcome === "Yes" ? "YES" : card.outcome === "No" ? "NO" : null;
  const reading = card.chip === "in_review" || card.chip === "contested";
  const chip = result ? (
    <span className={`chip ${result.toLowerCase()}`}>{reading ? `Read: ${result}` : result}</span>
  ) : (
    <span className="chip state state-void">Voided</span>
  );
  const where =
    card.chip === "in_review" && card.reviewEndsAt !== null
      ? `pays ${relative(card.reviewEndsAt, now)}`
      : card.chip === "contested"
        ? "payout paused"
        : card.chip === "void" || !result
          ? "refunded"
          : "paid";
  return (
    <>
      {chip}
      <em className={card.chip === "in_review" ? "warn" : undefined}>{where}</em>
    </>
  );
}

export function HomeSide({ cards, now, loading }: { cards: readonly Card[]; now: bigint; loading: boolean }) {
  const open = cards
    .filter((c) => c.chip === "open" && c.listed && c.entriesCloseAt !== null && c.entriesCloseAt > now)
    .sort((a, b) => Number((a.entriesCloseAt ?? 0n) - (b.entriesCloseAt ?? 0n)))
    .slice(0, 4);
  const at = (c: Card) => c.resolvedAt ?? c.deadlineAt ?? 0n;
  const done = cards
    .filter((c) => ["in_review", "contested", "final", "paid", "void"].includes(c.chip) && c.listed)
    .filter((c) => now - at(c) <= 3n * DAY)
    .sort((a, b) => Number(at(b) - at(a)))
    .slice(0, 4);
  return (
    <div className="home-side">
      <Box id="home-closing" title={HOME.closing} loading={loading}>
        {loading ? (
          <Skeleton />
        ) : open.length ? (
          open.map((c) => (
            <CardRow
              key={c.id}
              card={c}
              soon={soon(c.entriesCloseAt, now)}
              right={
                <>
                  <strong className="num">{c.yesShare === null ? "–" : `${Math.round(c.yesShare * 100)}%`}</strong>
                  <em className={soon(c.entriesCloseAt, now) ? "soon" : undefined}>
                    closes {relative(c.entriesCloseAt ?? now, now)}
                  </em>
                </>
              }
            />
          ))
        ) : (
          <p className="home-none">{HOME.nothingOpen}</p>
        )}
      </Box>
      <Box id="home-answered" title={HOME.answered} loading={loading}>
        {loading ? (
          <Skeleton />
        ) : done.length ? (
          done.map((c) => <CardRow key={c.id} card={c} right={answer(c, now)} />)
        ) : (
          <p className="home-none">{HOME.nothingAnswered}</p>
        )}
      </Box>
    </div>
  );
}
