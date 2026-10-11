/**
 * Purpose: the deadline slot of the creation box (TP §3.4.10 row 5; P1 §3.6): quick choices of 7 to 90 days from the
 *          chain's clock (A-7), a date and a time in the visitor's own zone, the same moment in UTC, and when entries
 *          close (5% of the time before the deadline, at least 24 hours and at most 7 days), from the SDK's mirror of
 *          `math/schedule.rs`. The program checks 3 to 90 days again when it opens the campaign. The local fields are
 *          written in the browser only, and a half-typed date or time is kept until both are set.
 * Version: 0.2.1 (the UI overhaul: the chosen chip shows; 0.2.0, the Sprint 19 reviews: no server time zone, a date
 *          typed before its time)
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useId, useState } from "react";
import { formatUtc } from "@brot/sdk/read";

import { Button } from "@/components/ui/button";
import type { Issue } from "./check";
import { SLOTS } from "./copy";
import { DAY_SECONDS, daysFrom, type Draft } from "./draft";
import { IssueList } from "./issue-list";
import { useIsClient } from "./use-is-client";

const QUICK = [7, 14, 30, 60, 90];
const pad = (n: number) => String(n).padStart(2, "0");

/** The local date and time fields of a Unix moment (rendered in the browser only). */
function localParts(at: bigint): [string, string] {
  const d = new Date(Number(at) * 1_000);
  return [
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  ];
}

/** The visitor's local date and time as Unix seconds, or `null` while either is empty or invalid. */
function fromLocal(day: string, time: string): bigint | null {
  if (!day || !time) return null;
  const ms = new Date(`${day}T${time}`).getTime();
  return Number.isFinite(ms) ? BigInt(Math.floor(ms / 1_000)) : null;
}

export function DeadlineSlot({
  deadline,
  chainNow,
  entriesClose,
  issues,
  onChange,
}: {
  deadline: Draft["deadline"];
  chainNow: bigint | null;
  entriesClose: bigint | null;
  issues: readonly Issue[];
  onChange: (deadline: Draft["deadline"]) => void;
}) {
  const id = useId();
  const client = useIsClient();
  // A date typed before its time (or the reverse) is kept here until both make a moment.
  const [pending, setPending] = useState<[string, string]>(["", ""]);
  const at = deadline && "at" in deadline ? deadline.at : null;
  const [day, time] = at === null || !client ? pending : localParts(at);
  const setLocal = (d: string, t: string) => {
    const next = fromLocal(d, t);
    if (next === null) setPending([d, t]);
    onChange(next === null ? null : { at: next });
  };
  const pressed = (n: number) =>
    deadline !== null &&
    ("days" in deadline
      ? deadline.days === n
      : chainNow !== null &&
        (at as bigint) - chainNow - BigInt(n) * DAY_SECONDS < 120n &&
        (at as bigint) - chainNow - BigInt(n) * DAY_SECONDS > -120n);
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-xs font-medium text-muted">{SLOTS.deadline}</legend>
      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((n) => (
          <Button
            key={n}
            variant="secondary"
            small
            // The prototype's chosen chip (open.css, `.op-days .btn[aria-pressed=true]`), as utilities over the Button's.
            className="aria-pressed:border-accent aria-pressed:bg-[var(--spot)]"
            aria-pressed={pressed(n)}
            onClick={() => onChange(chainNow === null ? { days: n } : { at: daysFrom(chainNow, n) })}
          >
            {SLOTS.days(n)}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 min-[413px]:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor={`${id}-day`} className="text-xs text-muted">
            {SLOTS.date}
          </label>
          <input
            id={`${id}-day`}
            type="date"
            value={day}
            onChange={(e) => setLocal(e.target.value, time)}
            className="min-h-11 w-full rounded-sm border border-field-line bg-bg px-3 text-base text-text"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${id}-time`} className="text-xs text-muted">
            {SLOTS.time}
          </label>
          <input
            id={`${id}-time`}
            type="time"
            value={time}
            onChange={(e) => setLocal(day, e.target.value)}
            className="min-h-11 w-full rounded-sm border border-field-line bg-bg px-3 text-base text-text"
          />
        </div>
      </div>
      {at !== null ? (
        <p className="text-xs">
          {SLOTS.inUtc} <b>{formatUtc(at)}</b>
        </p>
      ) : null}
      {entriesClose !== null ? <p className="text-xs text-muted">{SLOTS.closes(formatUtc(entriesClose))}</p> : null}
      <IssueList issues={issues} />
    </fieldset>
  );
}
