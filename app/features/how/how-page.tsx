/**
 * Purpose: "How it works" (spec 3.2 and 3.15 of Sprint -1, prototype-lab/campaigns/js/screens/how.js): the six steps
 *          as one ordered path that reads the same on a phone (the steps had no path under 860 px, accessibility
 *          problem 4 of DESIGN-DIRECTION.md), then what they mean for a baker's SOL, with links to the fees and the
 *          record. Drawn on the server; the mascot may stand on the steps and the panels (data-perch).
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { HOW } from "./copy";

export function HowPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="t-kicker">{HOW.kicker}</p>
        <h1 className="t-title">{HOW.title}</h1>
        <p className="m-0 max-w-3xl text-sm text-muted">{HOW.lead}</p>
      </header>
      <section aria-labelledby="how-steps" className="space-y-3">
        <h2 id="how-steps" className="t-section">
          {HOW.stepsTitle}
        </h2>
        <ol
          className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3"
          data-perch="how-steps"
          data-perch-x="0.92"
          data-perch-pose="point"
        >
          {HOW.steps.map(([title, text], i) => (
            <li key={title} className="flex gap-3 rounded-md border border-line bg-panel p-4">
              <span aria-hidden="true" className="font-display text-2xl font-bold text-accent-soft tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 space-y-1">
                <h3 className="m-0 text-base font-bold text-ink">{title}</h3>
                <p className="m-0 text-sm">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="how-more" className="space-y-3">
        <h2 id="how-more" className="t-section">
          {HOW.moreTitle}
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {HOW.more.map(([title, text]) => (
            <Card as="section" key={title} className="space-y-1 p-4" data-perch={`how-${title}`}>
              <h3 className="m-0 text-base font-bold text-ink">{title}</h3>
              <p className="m-0 text-sm">{text}</p>
            </Card>
          ))}
          <Card as="section" className="space-y-2 p-4">
            <p className="m-0 text-sm">{HOW.costs}</p>
            <p className="m-0 flex flex-wrap gap-4 text-sm">
              <Link href="/fees" className="text-accent-soft hover:underline">
                {HOW.feesLink}
              </Link>
              <Link href="/record" className="text-accent-soft hover:underline">
                {HOW.recordLink}
              </Link>
              <Link href="/" className="text-accent-soft hover:underline">
                {HOW.campaignsLink}
              </Link>
            </p>
          </Card>
        </div>
      </section>
      <p className="m-0 text-xs text-muted">{HOW.mascot}</p>
    </div>
  );
}
