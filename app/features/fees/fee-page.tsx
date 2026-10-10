/**
 * Purpose: the fee page (BR-32; spec 3.10 of Sprint -1, prototype-lab/campaigns/js/screens/fees.js): what Brot keeps
 *          and what the creator gets, the worked example of P1 §1.2 with every number from the SDK's math
 *          (example.ts), the one-sided pot, the void and its opening fee, the opening's 90/10, the refund policy, and
 *          rent and network fees, the Economic Viability Rule's refund included. Drawn on the server; no script runs
 *          here.
 * Version: 0.1.1 (the Sprint 13 reviews: the too-small refund and the opening's rent)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { FEES } from "./copy";
import { EXAMPLE, oneSidedExample, perOne, solText, splitExamples } from "./example";

const sol = (lamports: bigint) => `${solText(lamports)} SOL`;

const Box = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card as="section" className="space-y-3 p-4">
    <h2 className="m-0 font-display text-2xl font-bold">{title}</h2>
    {children}
  </Card>
);

const List = ({ items }: { items: readonly string[] }) => (
  <ul className="m-0 list-disc space-y-1.5 pl-5 text-sm">
    {items.map((text) => (
      <li key={text}>{text}</li>
    ))}
  </ul>
);

const Rows = ({ rows }: { rows: [string, string, boolean?][] }) => (
  <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
    {rows.map(([label, value, total]) => (
      <div key={label} className={`contents ${total ? "font-bold" : ""}`}>
        <dt className={total ? "text-ink" : "text-muted"}>{label}</dt>
        <dd className="m-0 text-right tabular-nums">{value}</dd>
      </div>
    ))}
  </dl>
);

function Example() {
  const { noPrize, withPrize, partner } = splitExamples();
  return (
    <Card as="section" aria-labelledby="fees-example" className="space-y-3 p-4" data-perch="fees-example">
      <h2 id="fees-example" className="m-0 font-display text-2xl font-bold">
        {FEES.exampleTitle}
      </h2>
      <p className="m-0 text-sm">{FEES.exampleIntro}</p>
      <Rows
        rows={[
          [FEES.rows.yes, sol(EXAMPLE.yes)],
          [FEES.rows.no, sol(EXAMPLE.no)],
          [FEES.rows.fee, `−${sol(noPrize.fee)}`],
          [FEES.rows.creator, `−${sol(noPrize.creator)}`],
          [FEES.rows.winners, sol(noPrize.winners), true],
          [FEES.rows.perOne, FEES.perOne(perOne(noPrize.perOneMilli)), true],
        ]}
      />
      <p className="m-0 text-sm">
        {FEES.withPrize(solText(withPrize.prize), solText(withPrize.winners), perOne(withPrize.perOneMilli))}
      </p>
      <p className="m-0 text-xs text-muted">{FEES.prizeSize}</p>
      <p className="m-0 text-sm">{FEES.partner(solText(partner.winners), perOne(partner.perOneMilli))}</p>
      <p className="m-0 text-xs text-muted">{FEES.exampleNote}</p>
    </Card>
  );
}

function OneSided() {
  const rows = oneSidedExample();
  const kept = rows.reduce((sum, r) => sum + r.fee, 0n);
  return (
    <Box title={FEES.oneSidedTitle}>
      <p className="m-0 text-sm">{FEES.oneSidedIntro}</p>
      <Rows
        rows={rows.map((r): [string, string] => [
          `${r.name}, ${sol(r.amount)}${r.first ? `, ${FEES.first}` : ""}`,
          FEES.oneSidedRow(solText(r.payout), r.fee > 0n ? solText(r.fee) : null),
        ])}
      />
      <p className="m-0 text-xs text-muted">{FEES.oneSidedNote(solText(kept))}</p>
      <p className="m-0 text-xs text-muted">{FEES.tooSmall}</p>
    </Box>
  );
}

export function FeePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="m-0 text-xs uppercase tracking-wide text-muted">{FEES.kicker}</p>
        <h1 className="m-0 font-display text-4xl font-bold">{FEES.title}</h1>
        <p className="m-0 max-w-3xl text-sm text-muted">{FEES.lead}</p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Box title={FEES.keepsTitle}>
          <List items={FEES.keeps} />
        </Box>
        <Box title={FEES.creatorTitle}>
          <List items={FEES.creator} />
        </Box>
      </div>
      <Example />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <OneSided />
        <Box title={FEES.voidTitle}>
          <p className="m-0 text-sm">{FEES.voidText}</p>
          <List items={[FEES.voidHouse, FEES.voidOutside, FEES.voidEmpty]} />
        </Box>
      </div>
      <Box title={FEES.openingTitle}>
        <p className="m-0 text-sm">{FEES.opening}</p>
        <p className="m-0 text-sm">{FEES.openingMax}</p>
        <p className="m-0 text-sm">{FEES.openingRent}</p>
        <p className="m-0 text-sm">{FEES.openingFree}</p>
        <p className="m-0 text-xs text-muted">{FEES.openingSite}</p>
      </Box>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Box title={FEES.refundTitle}>
          <List items={FEES.refunds} />
        </Box>
        <Box title={FEES.costsTitle}>
          <List items={FEES.costs} />
        </Box>
      </div>
    </div>
  );
}
