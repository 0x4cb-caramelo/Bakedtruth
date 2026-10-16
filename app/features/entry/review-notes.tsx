/**
 * Purpose: the notes of the sheet "Check before you sign" (the redesign of 2026-10-15), each approved notice word for
 *          word with its lead in bold: "Before you enter", in view, as a list (the lock in L-03's two sentences; the
 *          public-entries line before a wallet's first entry in a campaign; devnet; the warning when this browser keeps
 *          no record), then "How payouts work", folded: the fee and the creator's share as two figures (their sentence
 *          for screen readers), the estimate, a large entry and the refunds. notices/registry.ts names this file.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), the sheet's redesign
 */
import type { ReactNode } from "react";
import { ChevronDown, Eye, FlaskConical, Lock, Timer, TriangleAlert } from "lucide-react";

import { LOCK_LINES, NOTICES, SHEET, leadOf, pct } from "./copy";
import type { ReviewFacts } from "./entry-review";

const Lead = ({ text }: { text: readonly [string, string] }) => (
  <>
    {text[0] ? <b>{text[0]}</b> : null} {text[1]}
  </>
);

const Item = ({ icon, text, warn }: { icon: ReactNode; text: readonly [string, string]; warn?: boolean }) => (
  <li className={warn ? "is-warn" : undefined}>
    <span aria-hidden="true">{icon}</span>
    <p>
      <Lead text={text} />
    </p>
  </li>
);

const ICON = "size-3.5";

export function ReviewNotes({
  facts,
}: {
  facts: Pick<ReviewFacts, "feeBps" | "creatorShareBps" | "oneSidedFeeBps" | "firstEntry" | "persists">;
}) {
  return (
    <>
      <section className="er-before" aria-label={SHEET.beforeYouEnter}>
        <h3 className="er-kicker">{SHEET.beforeYouEnter}</h3>
        <ul className="er-risks">
          <Item icon={<Lock className={ICON} />} text={LOCK_LINES[0]} />
          <Item icon={<Timer className={ICON} />} text={LOCK_LINES[1]} />
          {facts.firstEntry ? <Item icon={<Eye className={ICON} />} text={leadOf(SHEET.public)} /> : null}
          <Item icon={<FlaskConical className={ICON} />} text={leadOf(NOTICES.devnet)} />
          {facts.persists ? null : <Item icon={<TriangleAlert className={ICON} />} text={["", SHEET.notKept]} warn />}
        </ul>
      </section>
      <details className="er-box accent">
        <summary>
          {SHEET.payouts}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </summary>
        <div className="er-box-body">
          <div className="er-tiles" aria-hidden="true">
            <div>
              <b>{pct(facts.feeBps)}</b>
              <span>{SHEET.feeTile}</span>
            </div>
            <div>
              <b>{pct(facts.creatorShareBps)}</b>
              <span>{SHEET.creatorTile}</span>
            </div>
          </div>
          <p className="sr-only">{NOTICES.fee(facts.feeBps, facts.creatorShareBps)}</p>
          <div className="er-rules">
            <p>
              <Lead text={leadOf(NOTICES.estimate)} />
            </p>
            <p>
              <Lead text={leadOf(NOTICES.largeEntry)} />
            </p>
            <p>
              <Lead text={[SHEET.refunds, NOTICES.oneSided(facts.oneSidedFeeBps)]} />
            </p>
          </div>
        </div>
      </details>
    </>
  );
}
