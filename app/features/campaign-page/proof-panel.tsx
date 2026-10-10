/**
 * Purpose: the campaign page's proof (BR-23; spec 3.5): the value read now through the SDK's copy of the program's
 *          reader against the target, "if read now", the distance, and on a price campaign the price facts: the price
 *          and its confidence, when it was published and posted, the campaign's maximum price age (30 s floor), and what
 *          the screen says when no fresh price exists (L-22) or the price sits within 1% of the target. Then the account
 *          read with its explorer link, the owner checked first, and entries close and the deadline in UTC and local time.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, Eye } from "lucide-react";

import { cx } from "@/components/ui/cx";
import { Outcome, shortAddress } from "@/lib/brot";
import { explorerAddress } from "@/lib/config";
import { PRICE, PROOF } from "./copy";
import { ageText, grouped, local, utc, valueText } from "./format";
import type { PageData } from "./load";
import { READER, type Proof } from "./proof";

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[minmax(0,9.5rem)_1fr] gap-3 border-t border-line py-2 text-sm max-sm:grid-cols-1 max-sm:gap-0.5">
    <dt className="text-muted">{label}</dt>
    <dd className="m-0">{children}</dd>
  </div>
);

const When = ({ at }: { at: bigint }) => (
  <>
    {utc(at)}
    <small className="block text-xs text-muted">{local(at)}</small>
  </>
);

export function ProofPanel({ data, proof }: { data: PageData; proof: Proof }) {
  const c = data.campaign;
  const now = data.chain.unixTimestamp;
  const before = data.view.state === "Open" || data.view.state === "Closed";
  const exponent = proof.price?.exponent ?? c.priceExponent;
  const value = proof.value === null ? null : valueText(proof.kind, proof.value, exponent);
  const reader = READER[proof.kind];
  return (
    <section aria-labelledby="proof-title" className="rounded-md border border-line bg-panel p-4">
      <h2 id="proof-title" className="m-0 mb-3 flex items-center gap-2 font-display text-2xl font-bold">
        <Eye className="size-5" aria-hidden="true" />
        {PROOF.title}
      </h2>
      {c.outcome === Outcome.Yes || c.outcome === Outcome.No ? (
        <p className="m-0 mb-3 rounded-sm bg-raised px-3 py-2 text-sm">
          {PROOF.recorded}: <b className="tabular-nums">{valueText(proof.kind, c.observedValue, c.priceExponent)}</b> ·{" "}
          {utc(c.resolvedAt)}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <p className="m-0">
          <small className="block text-xs text-muted">{proof.kind === "price" ? PRICE.current : PROOF.valueNow}</small>
          <b className="font-display text-3xl tabular-nums">{value ?? "—"}</b>
          {proof.price ? (
            <small className="block text-xs text-muted">
              {PRICE.confidence(valueText("price", proof.price.conf, exponent))}
            </small>
          ) : null}
        </p>
        <p className="m-0">
          <small className="block text-xs text-muted">{PROOF.target}</small>
          <b className="font-display text-3xl tabular-nums">
            {proof.comparator} {valueText(proof.kind, c.target, c.priceExponent)}
          </b>
        </p>
      </div>
      {proof.problem ? (
        <p className="m-0 mt-3 text-sm text-warn">
          {proof.problem === "missing" ? PROOF.missing : PROOF.problem(proof.problem)}
        </p>
      ) : null}
      {before && proof.ifReadNow ? (
        <p className="m-0 mt-3 flex flex-wrap items-center gap-2 text-sm">
          {PROOF.ifReadNow}:
          <span
            className={cx(
              "rounded-full px-2 py-0.5 text-xs font-bold",
              proof.ifReadNow === "YES" ? "bg-yes-bg text-yes-fg" : "bg-no-bg text-no-fg",
            )}
          >
            {proof.ifReadNow}
          </span>
          <span className="text-muted">{proof.ifReadNow === "YES" ? PROOF.ifYes : PROOF.ifNo}</span>
        </p>
      ) : null}
      {before && proof.kind === "pool" && proof.ifReadNow === null && proof.measuredEpoch !== null ? (
        <p className="m-0 mt-3 text-sm text-muted">{PROOF.measured(proof.measuredEpoch.toString())}</p>
      ) : null}
      {proof.kind === "stake" && proof.measuredEpoch !== null ? (
        <p className="m-0 mt-3 text-sm text-muted">{PROOF.stakeNote(proof.measuredEpoch.toString())}</p>
      ) : null}
      {before && proof.price ? <PriceFacts proof={proof} maxAge={c.maxAge} /> : null}
      <dl className="m-0 mt-3">
        <Row label={PROOF.account}>
          <a
            href={explorerAddress(proof.account)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono underline"
            title={proof.account}
          >
            {shortAddress(proof.account)}
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </a>
        </Row>
        <Row label={PROOF.owner}>
          {reader.owner}{" "}
          <span className="font-mono text-xs text-muted" title={reader.ownerId}>
            {shortAddress(reader.ownerId)}
          </span>
        </Row>
        <Row label={now < c.entriesCloseAt ? PROOF.entriesClose : PROOF.entriesClosed}>
          <When at={c.entriesCloseAt} />
        </Row>
        <Row label={now < c.deadlineAt ? PROOF.deadline : PROOF.deadlinePassed}>
          <When at={c.deadlineAt} />
        </Row>
        <Row label={PROOF.resolution}>{PROOF.resolutionText}</Row>
      </dl>
      {proof.price ? (
        <p className="m-0 mt-2 text-xs text-muted">{PROOF.read(`at chain slot ${grouped(data.chain.slot)}`)}</p>
      ) : null}
    </section>
  );
}

function PriceFacts({ proof, maxAge }: { proof: Proof; maxAge: number }) {
  const p = proof.price!;
  const ahead = p.ageSeconds < 0n;
  return (
    <div className="mt-3 space-y-2 text-sm">
      <p className="m-0 text-muted">
        {PRICE.published(
          ahead ? "ahead of the cluster's clock" : `${ageText(p.ageSeconds)} ago`,
          grouped(p.postedSlot),
        )}
      </p>
      <p className="m-0 text-muted">{PRICE.maxAge(maxAge)}</p>
      {!p.fresh ? (
        <p role="status" className="m-0 rounded-sm bg-st-review-bg px-3 py-2 text-st-review-fg">
          {ahead ? PRICE.ahead : PRICE.stale(p.symbol ?? "feed's", ageText(p.ageSeconds), maxAge)}
        </p>
      ) : p.tooClose && proof.ifReadNow === "NO" ? (
        <p role="status" className="m-0 rounded-sm bg-st-review-bg px-3 py-2 text-st-review-fg">
          {PRICE.tooClose}
        </p>
      ) : null}
    </div>
  );
}
