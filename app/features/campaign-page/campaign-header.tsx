/**
 * Purpose: the campaign page's header (spec 3.5 of Sprint -1): the way back, the kind, the public state from chain time
 *          (A-7), the team chip, the sentence as the page's one <h1>, the rule in plain words with the deadline in UTC
 *          and local time, who opened it, and the creator notice on burn, lock and stake campaigns (BR-26) with the
 *          creator's own entry when the creator's wallet has one.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { KindTile } from "@/components/ui/kind-tile";
import { StateChip } from "@/components/ui/state-chip";
import { formatSol, shortAddress } from "@/lib/brot";
import { sol4 } from "@/features/entry/amount";
import { CREATOR_NOTICE, KIND_NAME, PAGE, creatorHasEntry, ruleText } from "./copy";
import { local, stateChip, utc, valueText } from "./format";
import type { PageData } from "./load";
import type { Proof } from "./proof";

export function CampaignHeader({ data, proof, sentence }: { data: PageData; proof: Proof; sentence: string }) {
  const c = data.campaign;
  const name = proof.price?.symbol ?? shortAddress(c.metricAccount);
  const rule = ruleText({
    kind: proof.kind,
    name,
    target: valueText(proof.kind, c.target, c.priceExponent),
    below: proof.comparator === "≤" && proof.kind === "price",
    deadline: `${utc(c.deadlineAt)} (${local(c.deadlineAt)})`,
    epoch: c.epoch.toString(),
  });
  const creator = data.creatorEntry;
  const creatorSides = creator
    ? [
        creator.amountYes > 0n && `YES ${sol4(creator.amountYes)} SOL`,
        creator.amountNo > 0n && `NO ${sol4(creator.amountNo)} SOL`,
      ]
        .filter(Boolean)
        .join(" and ")
    : "";
  return (
    <header className="space-y-3">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-accent-soft hover:underline">
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {PAGE.back}
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-2">
          <KindTile kind={proof.kind} small />
          <span className="font-semibold">{KIND_NAME[proof.kind]}</span>
        </span>
        <span className="text-muted">{name}</span>
        <StateChip state={stateChip(data.view)} />
        {c.creatorIsTeam ? (
          <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-semibold">{PAGE.team}</span>
        ) : null}
      </div>
      <h1 className="m-0 font-display text-4xl font-bold leading-tight">{sentence}</h1>
      <p className="m-0 max-w-3xl text-sm text-muted">{rule}</p>
      <p className="m-0 text-xs text-muted">
        {c.creatorIsTeam ? PAGE.openedByTeam : PAGE.openedBy(shortAddress(c.creator), formatSol(c.prizeLamports))} ·{" "}
        {utc(c.opensAt)}
      </p>
      {proof.kind !== "price" ? (
        <div
          role="note"
          className="flex items-start gap-2 rounded-sm bg-st-review-bg px-3 py-2 text-sm text-st-review-fg"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="m-0">
            <b>{CREATOR_NOTICE}</b>
            {creatorSides ? ` ${creatorHasEntry(creatorSides)}` : null}
          </p>
        </div>
      ) : null}
    </header>
  );
}
