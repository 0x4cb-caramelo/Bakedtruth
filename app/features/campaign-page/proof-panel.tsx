/**
 * Purpose: the campaign page's proof (BR-23; spec 3.5): the value read now through the SDK's copy of the program's
 *          reader against the target, "if read now", the distance, and on a price campaign the price facts: the price
 *          and its confidence, when it was published and posted, the campaign's maximum price age (30 s floor), and what
 *          the screen says when no fresh price exists (L-22) or the price sits within 1% of the target. Then, folded
 *          under "Proof details" (Ronaldo, 2026-10-11), when the price was published, the account read with its
 *          explorer link, the owner checked first, and entries close and the deadline in UTC and local time.
 * Version: 0.3.0 (the details folded; 0.2.0, the UI overhaul: the approved prototype's `.cp-proof`)
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, ChevronDown, Eye } from "lucide-react";

import { cx } from "@/components/ui/cx";
import { Outcome, shortAddress } from "@/lib/brot";
import { explorerAddress } from "@/lib/config";
import { PRICE, PROOF, RAW_UNIT } from "./copy";
import { ageText, grouped, local, priceAsset, utc, valueText, valueWithUnit } from "./format";
import type { PageData } from "./load";
import { READER, type Proof } from "./proof";

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

const When = ({ at }: { at: bigint }) => (
  <>
    {utc(at)}
    <small>{local(at)}</small>
  </>
);

export function ProofPanel({ data, proof }: { data: PageData; proof: Proof }) {
  const c = data.campaign;
  const now = data.chain.unixTimestamp;
  const before = data.view.state === "Open" || data.view.state === "Closed";
  const exponent = proof.price?.exponent ?? c.priceExponent;
  const asset = priceAsset(proof.kind, c.feedId);
  const value = proof.value === null ? null : valueText(proof.kind, proof.value, exponent, asset);
  const reader = READER[proof.kind];
  const unit = RAW_UNIT[proof.kind];
  return (
    <section aria-labelledby="proof-title" className="panel cp-proof">
      <h2 id="proof-title" className="panel-head">
        <Eye className="size-[15px]" aria-hidden="true" />
        {PROOF.title}
      </h2>
      {c.outcome === Outcome.Yes || c.outcome === Outcome.No ? (
        <p className="cp-recorded">
          {PROOF.recorded}:{" "}
          <b className="tabular-nums">{valueWithUnit(proof.kind, c.observedValue, c.priceExponent, asset)}</b> ·{" "}
          {utc(c.resolvedAt)}
        </p>
      ) : null}
      <div className="read-values">
        <div>
          <small>{proof.kind === "price" ? PRICE.current : PROOF.valueNow}</small>
          <b>{value ?? "—"}</b>
          {value && unit ? <small className="mt-1">{unit}</small> : null}
          {proof.price ? (
            <small className="mt-1">{PRICE.confidence(valueText("price", proof.price.conf, exponent, asset))}</small>
          ) : null}
        </div>
        <div>
          <small>{PROOF.target}</small>
          <b className="dim">
            {proof.comparator} {valueText(proof.kind, c.target, c.priceExponent, asset)}
          </b>
          {unit ? <small className="mt-1">{unit}</small> : null}
        </div>
      </div>
      {proof.problem ? (
        <p className="cp-gap is-off">{proof.problem === "missing" ? PROOF.missing : PROOF.problem(proof.problem)}</p>
      ) : null}
      {before && proof.ifReadNow ? (
        <p className="cp-ifnow">
          {PROOF.ifReadNow}:
          <span className={cx("chip", proof.ifReadNow === "YES" ? "yes" : "no")}>{proof.ifReadNow}</span>
          <span>{proof.ifReadNow === "YES" ? PROOF.ifYes : PROOF.ifNo}</span>
        </p>
      ) : null}
      {before && proof.kind === "pool" && proof.ifReadNow === null && proof.measuredEpoch !== null ? (
        <p className="m-0 mt-3 text-sm text-muted">{PROOF.measured(proof.measuredEpoch.toString())}</p>
      ) : null}
      {proof.kind === "stake" && proof.measuredEpoch !== null ? (
        <p className="m-0 mt-3 text-sm text-muted">{PROOF.stakeNote(proof.measuredEpoch.toString())}</p>
      ) : null}
      {before && proof.price ? <PriceWarning proof={proof} maxAge={c.maxAge} /> : null}
      <details className="fold cp-proof-more">
        <summary>
          {PROOF.details}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </summary>
        {before && proof.price ? <PriceTimes proof={proof} maxAge={c.maxAge} /> : null}
        <dl className="rows cp-rows">
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
      </details>
    </section>
  );
}

/** What a price this old or this close means for an entry: always in view, never folded. */
function PriceWarning({ proof, maxAge }: { proof: Proof; maxAge: number }) {
  const p = proof.price!;
  if (!p.fresh)
    return (
      <p role="status" className="notice warn mt-3">
        {p.ageSeconds < 0n ? PRICE.ahead : PRICE.stale(p.symbol ?? "feed's", ageText(p.ageSeconds), maxAge)}
      </p>
    );
  if (p.tooClose && proof.ifReadNow === "NO")
    return (
      <p role="status" className="notice warn mt-3">
        {PRICE.tooClose}
      </p>
    );
  return null;
}

/** When the price was published and posted, and the campaign's age limit: in the folded details. */
function PriceTimes({ proof, maxAge }: { proof: Proof; maxAge: number }) {
  const p = proof.price!;
  return (
    <div className="mb-2 space-y-1 text-[12.5px]">
      <p className="m-0 text-muted">
        {PRICE.published(
          p.ageSeconds < 0n ? "ahead of the cluster's clock" : `${ageText(p.ageSeconds)} ago`,
          grouped(p.postedSlot),
        )}
      </p>
      <p className="m-0 text-muted">{PRICE.maxAge(maxAge)}</p>
    </div>
  );
}
