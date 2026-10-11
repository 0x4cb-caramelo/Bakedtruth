/**
 * Purpose: section 4 of the creation box, "Cost" (spec 3.12; TP §3.4.10, §3.4.16; P-3): the opening amount (US$500 or
 *          more, the extra a bigger prize at the same 90/10), the charge at Pyth's SOL/USD price minus its confidence
 *          band with its publish time, the money table in exact lamports (the prize, the opening fee, `max_lamports`,
 *          the rent of the two new accounts returned at close, the network fee, the total now and at most), what a
 *          campaign with no entry keeps, the fees on entries, and the wallet's balance against the total. A team key
 *          sees no payment and no creator share.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useId, type ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cx } from "@/components/ui/cx";
import { formatUtc } from "@/lib/brot";
import { CLUSTER } from "@/lib/config";
import { FAUCET_URL } from "@/features/wallet/wallet-state";
import { sol4 } from "../entry/amount";
import { issuesAt, type BoxCheck } from "./check";
import { BOX, MONEY, NO_ENTRY_RULE, SLOTS, TEAM } from "./copy";
import type { Draft } from "./draft";
import { IssueList } from "./issue-list";
import { pct } from "./preview-parts";
import { exactSol, NETWORK_FEE, usdSplit, usdText } from "./quote";
import type { BoxWorld } from "./reads";

const AMOUNTS = ["500", "1000", "1500"];

const Row = ({
  label,
  note,
  children,
  total,
}: {
  label: string;
  note?: string;
  children: ReactNode;
  total?: boolean;
}) => (
  <div
    className={cx(
      "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 border-t border-line py-1.5 text-sm",
      total && "font-bold",
    )}
  >
    <dt>
      {label}
      {note ? <small className="block text-xs font-normal text-muted">{note}</small> : null}
    </dt>
    <dd className="text-right tabular-nums">{children}</dd>
  </div>
);

export function CostSection({
  draft,
  setDraft,
  check,
  world,
  wallet,
  balance,
}: {
  draft: Draft;
  setDraft: (change: (d: Draft) => Draft) => void;
  check: BoxCheck | null;
  world: BoxWorld | null;
  wallet: string | null;
  balance: bigint | null;
}) {
  const id = useId();
  const team = check?.isTeam ?? false;
  const q = check?.quote ?? null;
  const config = world?.config ?? null;
  const split = q && config ? usdSplit(q.openingUsd, config.params.openingPrizeBps) : null;
  const rent = world ? world.rents.campaign + world.rents.vault : null;
  const custom = !AMOUNTS.includes(draft.usd);
  return (
    <Card as="section" aria-labelledby={`${id}-h`} className="space-y-3 p-4 [grid-area:cost]">
      <h2 id={`${id}-h`} className="font-display text-2xl font-bold">
        <span className="mr-2 text-muted">4</span>
        {BOX.cost}
      </h2>
      {team ? (
        <p className="rounded-sm bg-notice-bg p-3 text-sm" data-testid="team-note">
          {TEAM.note}
        </p>
      ) : (
        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-muted">{SLOTS.usd}</legend>
          <div className="grid grid-cols-2 gap-2 min-[700px]:grid-cols-4">
            {[...AMOUNTS, "custom"].map((v) => {
              const on = v === "custom" ? custom : draft.usd === v;
              return (
                <label
                  key={v}
                  className={cx(
                    "cursor-pointer rounded-sm border p-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                    on ? "border-accent bg-row-hover" : "border-line",
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-usd`}
                    className="sr-only"
                    checked={on}
                    onChange={() => setDraft((d) => ({ ...d, usd: v === "custom" ? "" : v }))}
                  />
                  <b className="block">{v === "custom" ? SLOTS.custom : `US$${Number(v).toLocaleString("en-US")}`}</b>
                </label>
              );
            })}
          </div>
          {custom ? (
            <input
              aria-label={SLOTS.custom}
              inputMode="numeric"
              value={draft.usd}
              onChange={(e) => setDraft((d) => ({ ...d, usd: e.target.value.trim() }))}
              className="mt-2 min-h-11 w-full rounded-sm border border-field-line bg-bg px-3 text-base text-text tabular-nums"
            />
          ) : null}
          <IssueList issues={check ? issuesAt(check, "usd") : []} className="mt-1.5" />
        </fieldset>
      )}
      {q && split && !team ? (
        <p className="text-sm" data-testid="charge-line">
          <b className="block font-display text-3xl tabular-nums">{exactSol(q.paid)} SOL</b>
          <span className="text-xs text-muted">
            {MONEY.charge(split.total, exactSol(q.paid), usdText(q.price, q.exponent), formatUtc(q.publishTime))}
          </span>
        </p>
      ) : null}
      <IssueList issues={check ? issuesAt(check, "box") : []} />
      <dl data-testid="money">
        {team || !q ? (
          <Row label={MONEY.opening}>{MONEY.free}</Row>
        ) : (
          <>
            <Row label={MONEY.prize} note={MONEY.prizeNote}>
              {exactSol(q.prize)} SOL
            </Row>
            <Row label={MONEY.fee} note={MONEY.feeNote}>
              {exactSol(q.fee)} SOL
            </Row>
            <Row label={MONEY.most} note={MONEY.mostNote}>
              {exactSol(q.maxLamports)} SOL
            </Row>
          </>
        )}
        {rent !== null ? (
          <Row label={MONEY.rent} note={MONEY.rentNote}>
            {exactSol(rent)} SOL
          </Row>
        ) : null}
        <Row label={MONEY.network}>≈ {exactSol(NETWORK_FEE)} SOL</Row>
        {check?.total !== null && check?.total !== undefined ? (
          <Row label={MONEY.total} total note={q && !team ? MONEY.atMost(exactSol(check.maxTotal ?? 0n)) : undefined}>
            {exactSol(check.total)} SOL
          </Row>
        ) : null}
      </dl>
      {!team ? <p className="text-xs text-muted">{NO_ENTRY_RULE}</p> : null}
      <p className="text-xs text-muted">
        {MONEY.onEntries(pct(config?.params.feeBps ?? 1_000), team ? null : pct(config?.params.creatorShareBps ?? 100))}
      </p>
      {!team && q ? <p className="text-xs text-muted">{MONEY.usdSource}</p> : null}
      {wallet && balance !== null && check?.total !== null && check?.total !== undefined ? (
        balance >= check.total ? (
          <p className="text-xs text-st-open-fg">{MONEY.balanceOk(sol4(balance))}</p>
        ) : (
          <p className="text-xs text-error">
            {MONEY.balanceShort(sol4(check.total, "up"), sol4(balance))}{" "}
            {CLUSTER === "devnet" ? (
              <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="underline">
                {MONEY.faucet}
              </a>
            ) : null}
          </p>
        )
      ) : null}
    </Card>
  );
}
