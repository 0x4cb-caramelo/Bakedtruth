/**
 * Purpose: section 4 of the creation box, "Cost" (spec 3.12; TP §3.4.10, §3.4.16; P-3): the opening amount (US$500 or
 *          more, split 90/10 as a whole; amount-picker.tsx), the charge at Pyth's SOL/USD price minus its confidence
 *          band with its publish time, the money table in exact lamports (the prize, the opening fee, `max_lamports`,
 *          the rent of the two new accounts returned at close, the network fee, the total now and at most), what a
 *          campaign with no entry keeps, and the wallet's balance against the most the opening can take. Priced from
 *          the amount alone, "not priced yet" until the SOL/USD price allows it; only a team key sees "free", with no
 *          prize and no creator share. The box's own stops and the fees on entries are said once, elsewhere.
 * Version: 0.2.0 (the Sprint 19 copy and adversarial reviews: never "free" by default, the team variant, at most)
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
import { BOX } from "./copy";
import { MONEY, NO_ENTRY_RULE, OPEN_DEVNET, RETURNS_DEVNET, RETURNS_DEVNET_TEAM, TEAM } from "./copy-money";
import type { Draft } from "./draft";
import { AmountPicker } from "./amount-picker";
import { exactSol, NETWORK_FEE, usdSplit, usdText } from "./quote";
import type { BoxWorld } from "./reads";

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
        <AmountPicker usd={draft.usd} setDraft={setDraft} issues={check ? issuesAt(check, "usd") : []} />
      )}
      {q && split && !team ? (
        <p className="text-sm" data-testid="charge-line">
          <b className="block font-display text-3xl tabular-nums">{exactSol(q.paid)} SOL</b>
          <span className="text-xs text-muted">
            {MONEY.charge(split.total, exactSol(q.paid), usdText(q.price, q.exponent), formatUtc(q.publishTime))}
          </span>
        </p>
      ) : null}
      <dl data-testid="money">
        {team ? (
          <Row label={MONEY.opening}>{MONEY.free}</Row>
        ) : !q ? (
          <Row label={MONEY.opening} note={MONEY.notPricedNote}>
            {MONEY.notPriced}
          </Row>
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
          <Row
            label={MONEY.total}
            total
            note={q && !team && check.maxTotal !== null ? MONEY.atMost(exactSol(check.maxTotal)) : undefined}
          >
            ≈ {exactSol(check.total)} SOL
          </Row>
        ) : world ? (
          <Row label={MONEY.total} total>
            –
          </Row>
        ) : null}
      </dl>
      {CLUSTER === "devnet" ? (
        <p className="rounded-sm bg-notice-bg px-3 py-2 text-xs" data-notice="devnet-opening">
          {OPEN_DEVNET}
        </p>
      ) : null}
      {!team ? <p className="text-xs">{NO_ENTRY_RULE}</p> : null}
      {CLUSTER === "devnet" ? <p className="text-xs">{team ? RETURNS_DEVNET_TEAM : RETURNS_DEVNET}</p> : null}
      {!team && q ? <p className="text-xs text-muted">{MONEY.usdSource}</p> : null}
      {/* The balance against the most the opening can take (the adversarial review, L2), as the box's own check. */}
      {wallet && balance !== null && (check?.maxTotal === null || check?.maxTotal === undefined) ? (
        <p className="text-xs text-muted">{MONEY.balance(sol4(balance))}</p>
      ) : wallet && balance !== null && check?.maxTotal !== null && check?.maxTotal !== undefined ? (
        balance >= check.maxTotal ? (
          <p className="text-xs text-st-open-fg">{MONEY.balanceOk(sol4(balance))}</p>
        ) : (
          <p className="text-xs text-error">
            {MONEY.balanceShort(sol4(check.maxTotal, "up"), sol4(balance))}{" "}
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
