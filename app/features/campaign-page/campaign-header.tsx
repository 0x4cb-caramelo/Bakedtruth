/**
 * Purpose: the campaign page's header (spec 3.5 of Sprint -1): the way back, the kind, the public state from chain time
 *          (A-7), the team chip, the sentence as the page's one <h1>, the rule in plain words with the deadline in UTC
 *          and local time, who opened it, and the creator notice on burn, lock and stake campaigns (BR-26) with the
 *          creator's own entry when the creator's wallet has one.
 * Version: 0.2.0 (the UI overhaul: the approved prototype's `.cp-head`)
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { StateChip } from "@/components/ui/state-chip";
import { formatSol, shortAddress } from "@/lib/brot";
import { sol4 } from "@/features/entry/amount";
import { KINDS } from "@/features/campaigns/card-parts";
import { CREATOR_NOTICE, KIND_NAME, PAGE, creatorHasEntry, ruleText } from "./copy";
import { local, priceAsset, stateChip, utc, valueText } from "./format";
import type { PageData } from "./load";
import type { Proof } from "./proof";

export function CampaignHeader({ data, proof, sentence }: { data: PageData; proof: Proof; sentence: string }) {
  const c = data.campaign;
  const name = proof.price?.symbol ?? shortAddress(c.metricAccount);
  const rule = ruleText({
    kind: proof.kind,
    name,
    target: valueText(proof.kind, c.target, c.priceExponent, priceAsset(proof.kind, c.feedId)),
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
    <header className="cp-head">
      <Link href="/" className="cp-back">
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {PAGE.back}
      </Link>
      <div className="cp-eyebrow">
        <span className={`chip cp-kind kind-${proof.kind}`}>
          <span aria-hidden="true">{KINDS[proof.kind].tile}</span>
          {KIND_NAME[proof.kind]}
        </span>
        <span className="cp-name">{name}</span>
        <span className="cp-state">
          <StateChip state={stateChip(data.view)} />
          {c.creatorIsTeam ? <span className="chip">{PAGE.team}</span> : null}
        </span>
      </div>
      <h1 className="cp-title">{sentence}</h1>
      <p className="cp-rule">{rule}</p>
      <p className="cp-by">
        {c.creatorIsTeam ? PAGE.openedByTeam : PAGE.openedBy(shortAddress(c.creator), formatSol(c.prizeLamports))} ·{" "}
        {utc(c.opensAt)}
      </p>
      {proof.kind !== "price" ? (
        <div role="note" className="cp-creator mt-3">
          <TriangleAlert className="size-4" aria-hidden="true" />
          <p>
            <b>{CREATOR_NOTICE}</b>
            {creatorSides ? ` ${creatorHasEntry(creatorSides)}` : null}
          </p>
        </div>
      ) : null}
    </header>
  );
}
