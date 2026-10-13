/**
 * Purpose: the campaign page's header (spec 3.5 of Sprint -1): the way back, the kind, the public state from chain time
 *          (A-7), the team chip, the sentence as the page's one <h1>, asked ("…$150?"), the rule in one line with the
 *          deadline in UTC and local time and the whole rule folded under "Full rules", who opened it (a link to the
 *          opening transaction on Solscan, once found), and the creator
 *          notice on burn, lock and stake campaigns (BR-26) with the creator's own entry when the creator's wallet has
 *          one. A graduation curve is named by its ticker, never by its address alone (the address is in the proof).
 * Version: 0.3.2 (the curve's name; 0.3.1, Ronaldo, 2026-10-11: the rule in one line, the rest folded, the opening
 *          linked on Solscan; 0.2.0, the approved prototype's `.cp-head`)
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronDown, TriangleAlert } from "lucide-react";

import { StateChip } from "@/components/ui/state-chip";
import { formatSol, shortAddress } from "@/lib/brot";
import { solscanTx } from "@/lib/config";
import { rpc } from "@/lib/rpc";
import { sol4 } from "@/features/entry/amount";
import { KINDS } from "@/features/campaigns/card-parts";
import { CREATOR_NOTICE, KIND_NAME, PAGE, creatorHasEntry, ruleShort, ruleText } from "./copy";
import { local, priceAsset, stateChip, utc, valueText } from "./format";
import type { PageData } from "./load";
import { openingSignature } from "./opening";
import type { Proof } from "./proof";

/** `accountName`: a graduation curve's name (its ticker with the pool's last characters), in place of the address. */
export function CampaignHeader({
  data,
  proof,
  sentence,
  accountName = null,
}: {
  data: PageData;
  proof: Proof;
  sentence: string;
  accountName?: string | null;
}) {
  const c = data.campaign;
  const name = proof.price?.symbol ?? accountName ?? shortAddress(c.metricAccount);
  const terms = {
    kind: proof.kind,
    name,
    target: valueText(proof.kind, c.target, c.priceExponent, priceAsset(proof.kind, c.feedId)),
    below: proof.comparator === "≤" && proof.kind === "price",
    deadline: `${utc(c.deadlineAt)} (${local(c.deadlineAt)})`,
    epoch: c.epoch.toString(),
  };
  // The line links the transaction that opened the campaign, once its history names it (opening.ts).
  const [opening, setOpening] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    openingSignature(rpc, data.address, c.opensAt).then(
      (signature) => live && setOpening(signature),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [data.address, c.opensAt]);
  const opened = `${
    c.creatorIsTeam ? PAGE.openedByTeam : PAGE.openedBy(shortAddress(c.creator), formatSol(c.prizeLamports))
  } · ${utc(c.opensAt)}`;
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
      <p className="cp-rule">{ruleShort(terms)}</p>
      <details className="fold cp-fullrule">
        <summary>
          {PAGE.fullRules}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </summary>
        <p className="cp-rule">{ruleText(terms)}</p>
      </details>
      <p className="cp-by">
        {opening ? (
          <a href={solscanTx(opening)} target="_blank" rel="noreferrer" className="cp-opened" title={PAGE.onSolscan}>
            {opened}
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </a>
        ) : (
          opened
        )}
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
