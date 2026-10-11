/**
 * Purpose: section 3 of the creation box, "Preview" (spec 3.12; proposal Appendix B), built from the draft as `checkBox`
 *          reads it and the arguments it built (`OpenArgs`): the sentence; the value now with "if resolved
 *          now"; the rule in the campaign page's own words, with the account and its explorer link, the deadline in UTC
 *          and in the visitor's time, when entries close, the one-sided and void refunds and who decides; the money; the
 *          creator notice on every kind but price (BR-26), with who else can move the number; and the campaign's card
 *          as the list will show it. A team key's free opening drops the prize's lines. Sticky beside the builder on a
 *          wide screen; the total and "Review and sign" sit at its foot.
 * Version: 0.2.0 (the Sprint 19 copy and adversarial reviews: the team variant, the epoch kinds, who else can move it)
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CircleAlert, ExternalLink } from "lucide-react";

import { StateChip } from "@/components/ui/state-chip";
import { cx } from "@/components/ui/cx";
import { formatUtc, shortAddress } from "@/lib/brot";
import { explorerAddress } from "@/lib/config";
import { CampaignCard } from "../campaigns/campaign-card";
import { local } from "../campaign-page/format";
import { PRINCIPLE } from "../how/copy";
import { BOX, PREVIEW } from "./copy";
import { NO_ENTRY_RULE, NO_TAKE_BACK } from "./copy-money";
import type { PreviewFacts } from "./preview";
import { useIsClient } from "./use-is-client";

const L = PREVIEW.labels;

const Line = ({ label, children }: { label: string; children: ReactNode }) => (
  <li className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-2 border-t border-line py-1.5 text-xs max-[412px]:grid-cols-1">
    <b className="text-muted">{label}</b>
    <span>{children}</span>
  </li>
);

export function PreviewSection({ facts, footer }: { facts: PreviewFacts; footer: ReactNode }) {
  const n = facts.now;
  const client = useIsClient();
  return (
    <section
      aria-labelledby="open-preview-h"
      className="rounded-md border border-line bg-panel [grid-area:preview] min-[861px]:sticky min-[861px]:top-20 min-[861px]:flex min-[861px]:max-h-[calc(100vh-6rem)] min-[861px]:flex-col"
    >
      <div className="space-y-4 p-4 min-[861px]:min-h-0 min-[861px]:flex-1 min-[861px]:overflow-auto">
        <h2 id="open-preview-h" className="flex items-center gap-2 font-display text-2xl font-bold">
          <span className="text-muted">3</span>
          {BOX.preview}
          <span className="rounded-sm bg-raised px-2 py-0.5 font-sans text-xs font-normal">{BOX.notSigned}</span>
        </h2>
        <p className="font-display text-2xl font-bold leading-tight" data-testid="open-sentence">
          {facts.sentence}
        </p>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-sm bg-line text-xs max-[412px]:grid-cols-2">
          <div className="bg-raised p-2">
            <small className="block text-muted">{PREVIEW.now(n.name)}</small>
            <b className="tabular-nums">{n.value ?? "–"}</b>
          </div>
          <div className="bg-raised p-2">
            <small className="block text-muted">{PREVIEW.yesAt(n.below)}</small>
            <b className="tabular-nums">{n.target ?? PREVIEW.noTarget}</b>
          </div>
          <div className="bg-raised p-2 max-[412px]:col-span-2">
            <small className="block text-muted">{PREVIEW.ifResolvedNow}</small>
            {n.ifNow ? (
              <b className={cx(n.ifNow === "YES" ? "text-yes" : "text-no")} data-testid="if-now">
                {n.ifNow}
              </b>
            ) : facts.epochKind ? (
              <b className="font-normal">{PREVIEW.decidedAtEpoch}</b>
            ) : (
              <b>–</b>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{PREVIEW.rule}</h3>
          <ul className="mt-1 list-none p-0">
            {facts.account ? (
              <Line label={L.reads}>
                {facts.account.label} ·{" "}
                <a
                  href={explorerAddress(facts.account.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono underline"
                >
                  {shortAddress(facts.account.address)}
                  <ExternalLink className="ml-0.5 inline size-3" aria-hidden="true" />
                </a>
              </Line>
            ) : null}
            <Line label={L.rule}>{facts.rule}</Line>
            {facts.deadlineAt !== null ? (
              <Line label={L.deadline}>
                {formatUtc(facts.deadlineAt)}
                {client ? <small className="block text-muted">{local(facts.deadlineAt)}</small> : null}
              </Line>
            ) : null}
            {facts.entriesClose !== null ? (
              <Line label={L.closes}>
                {formatUtc(facts.entriesClose)}
                {client ? <small className="block text-muted">{local(facts.entriesClose)}</small> : null}
              </Line>
            ) : null}
            <Line label={L.oneSided}>{facts.team ? PREVIEW.oneSidedTeam : PREVIEW.oneSided}</Line>
            <Line label={L.voided}>{facts.team ? PREVIEW.voidedTeam : PREVIEW.voided}</Line>
            {facts.team ? null : <Line label={L.noEntry}>{NO_ENTRY_RULE}</Line>}
            <Line label={L.who}>
              {PREVIEW.who(PRINCIPLE, facts.team)} {facts.creatorNotice ? `${PREVIEW.whoCreator} ` : null}
              <Link href="/record" className="underline">
                {PREVIEW.whoLink}
              </Link>
            </Line>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{PREVIEW.money}</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
            {facts.money.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {facts.team ? null : <li>{NO_TAKE_BACK}</li>}
          </ul>
        </div>
        {facts.creatorNotice ? (
          <p className="flex gap-2 rounded-sm bg-st-review-bg p-3 text-xs text-st-review-fg" data-notice="creator">
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            <span>
              {PREVIEW.creatorNotice}
              {facts.othersCanPush ? ` ${facts.othersCanPush}` : null}
            </span>
          </p>
        ) : null}
        <div>
          <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
            {PREVIEW.asItAppears}
            <StateChip state="open" />
          </h3>
          {facts.card && facts.complete ? (
            <div inert className="pointer-events-none">
              <CampaignCard card={facts.card} saved={false} onToggle={() => undefined} />
            </div>
          ) : (
            <p className="text-xs text-muted">{PREVIEW.cardWhenFilled}</p>
          )}
        </div>
      </div>
      {footer}
    </section>
  );
}
