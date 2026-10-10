/**
 * Purpose: what takes the entry panel's place when the site takes no entry (K-11's switch: the panel hides, the state,
 *          the proof and the payouts stay) and once entries close: closed with the deadline, closed because the answer
 *          is already on-chain, in review with what was read and when it pays, paid, voided. The full states after
 *          entries close are Sprint 12's; this card says only what the campaign account already shows.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { Outcome } from "@/lib/brot";
import { PANEL } from "@/features/entry/copy";
import { STATE } from "./copy";
import { utc } from "./format";
import type { PageData } from "./load";

const word = (outcome: Outcome) => (outcome === Outcome.Yes ? "YES" : outcome === Outcome.No ? "NO" : "—");

export function StateCard({ data, entriesTaken }: { data: PageData; entriesTaken: boolean }) {
  const c = data.campaign;
  const view = data.view;
  const [title, text] =
    view.state === "Open"
      ? [PANEL.title, entriesTaken ? "" : PANEL.notTaken]
      : view.state === "Closed"
        ? [
            STATE.closed,
            view.closedBecause === "outcomeKnowable" ? STATE.knowable : STATE.closedText(utc(c.deadlineAt)),
          ]
        : view.state === "InReview"
          ? [STATE.review, STATE.reviewText(word(c.outcome), utc(c.reviewEndsAt))]
          : view.state === "Paid"
            ? [STATE.paid, STATE.paidText(word(c.outcome))]
            : [STATE.void, STATE.voidText];
  return (
    <section aria-labelledby="state-title" className="rounded-md border border-line bg-panel p-4">
      <h2 id="state-title" className="m-0 mb-2 font-display text-2xl font-bold">
        {title}
      </h2>
      {text ? <p className="m-0 text-sm text-muted">{text}</p> : null}
    </section>
  );
}
