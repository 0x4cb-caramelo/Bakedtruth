/**
 * Purpose: the amount of an entry, in SOL: a decimal field (exact lamports, amount.ts), quick amounts, "Max" (the
 *          balance less the rents and the network fee, in 0.01 SOL steps), the wallet's balance, and one line of help
 *          that says the minimum, what is wrong with the text, or that the amount came from a link (TP §3.6 "Links").
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import type { RefObject } from "react";

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
    <div className="field en-amount">
      <div className="en-amount-top">
        <label htmlFor="entry-amount">{PANEL.amountLabel}</label>
        <span>
          {!connected ? PANEL.connectToSee : balance === null ? PANEL.balanceUnknown : PANEL.balance(sol4(balance))}
        </span>
      </div>
      <div className="input-wrap">
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
          className="input"
        />
        <span className="unit">SOL</span>
      </div>
      <div className="en-chips">
        {CHIPS.map((chip) => (
          <button key={chip} type="button" className="btn small" onClick={() => onText(chip)}>
            {chip}
          </button>
        ))}
        <button
          type="button"
          className="btn small"
          disabled={max === null}
          onClick={() => max !== null && onText(solText(max))}
        >
          {PANEL.max}
        </button>
      </div>
      <p id="entry-amount-help" className={cx("help", error ? "error" : fromLink ? "en-linked" : null)}>
        {help}
      </p>
    </div>
  );
}

export const ONE_SOL = LAMPORTS_PER_SOL;
