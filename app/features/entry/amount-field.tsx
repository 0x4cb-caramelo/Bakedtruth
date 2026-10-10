/**
 * Purpose: the amount of an entry, in SOL: a decimal field (exact lamports, amount.ts), quick amounts, "Max" (the
 *          balance less the rents and the network fee, in 0.01 SOL steps), the wallet's balance, and one line of help
 *          that says the minimum, what is wrong with the text, or that the amount came from a link (TP §3.6 "Links").
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { LAMPORTS_PER_SOL, parseSol, sol4, solText } from "./amount";
import { PANEL } from "./copy";

const CHIPS = ["0.1", "0.5", "1", "5"];
const STEP = 10_000_000n; // 0.01 SOL

export function AmountField({
  text,
  onText,
  fromLink,
  minEntry,
  balance,
  connected,
  spare,
  inputRef,
}: {
  text: string;
  onText: (text: string) => void;
  fromLink: boolean;
  minEntry: bigint;
  balance: bigint | null;
  connected: boolean;
  /** What the wallet can put in: the balance less the rents and the fee; `null` until both are known. */
  spare: bigint | null;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const amount = parseSol(text);
  const error =
    text.trim() === ""
      ? null
      : amount === null
        ? PANEL.amountInvalid
        : amount < minEntry
          ? PANEL.belowMinimum(solText(minEntry))
          : null;
  const help = error ?? (fromLink ? PANEL.fromLink : PANEL.minimumHelp(solText(minEntry)));
  const max = spare !== null && spare >= minEntry ? (spare / STEP) * STEP : null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <label htmlFor="entry-amount" className="font-medium text-muted">
          {PANEL.amountLabel}
        </label>
        <span className="tabular-nums text-muted">
          {!connected ? PANEL.connectToSee : balance === null ? PANEL.balanceUnknown : PANEL.balance(sol4(balance))}
        </span>
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          id="entry-amount"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={text}
          onChange={(event) => onText(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby="entry-amount-help"
          className={cx(
            "w-full min-h-11 rounded-sm border border-field-line bg-bg px-3 py-2.5 pr-14 text-base tabular-nums text-text",
            "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 aria-[invalid=true]:border-error",
          )}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">SOL</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CHIPS.map((chip) => (
          <Button key={chip} variant="secondary" small onClick={() => onText(chip)}>
            {chip}
          </Button>
        ))}
        <Button variant="secondary" small disabled={max === null} onClick={() => max !== null && onText(solText(max))}>
          {PANEL.max}
        </Button>
      </div>
      <p
        id="entry-amount-help"
        className={cx("m-0 text-xs", error ? "text-error" : fromLink ? "text-warn" : "text-muted")}
      >
        {help}
      </p>
    </div>
  );
}

export const ONE_SOL = LAMPORTS_PER_SOL;
