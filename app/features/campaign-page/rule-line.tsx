/**
 * Purpose: the campaign page's rule in one line (copy.ts), with the deadline as a live countdown from the chain's time
 *          ("… within 4d 10h 23m 07s. Otherwise NO.") so the time left reads at a glance (2026-10-15). The exact moment,
 *          in UTC and the visitor's time zone, stays on the countdown's hover, in "Full rules" and in the proof. Once
 *          the deadline passes, and for the epoch kinds, the line names the moment instead.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), the campaign page's polish
 */
"use client";

import { Timer } from "lucide-react";

import { ruleShort, ruleShortAround } from "./copy";
import { countdownText, isoOf } from "./format";
import type { KindName } from "./proof";
import { useCountdown } from "./use-countdown";

export function RuleLine({
  terms,
  deadlineAt,
  chainNow,
}: {
  terms: { kind: KindName; name: string; target: string; below: boolean; deadline: string; epoch: string };
  /** The deadline and the chain's time at the page's last read, in unix seconds. */
  deadlineAt: bigint;
  chainNow: bigint;
}) {
  const left = useCountdown(deadlineAt > chainNow ? deadlineAt - chainNow : 0n);
  const around = ruleShortAround(terms);
  if (!around || left === 0n) return <p className="cp-rule">{ruleShort(terms)}</p>;
  return (
    <p className="cp-rule">
      {around.lead}{" "}
      <time className="cp-countdown" dateTime={isoOf(deadlineAt)} title={terms.deadline} role="timer" aria-live="off">
        <Timer className="size-3.5" aria-hidden="true" />
        {countdownText(left)}
      </time>
      {around.tail}
    </p>
  );
}
