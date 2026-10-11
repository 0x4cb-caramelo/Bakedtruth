/**
 * Purpose: the deadline slot of the creation box (TP §3.4.10 row 5; P1 §3.6): quick choices of 7 to 90 days from the
 *          chain's clock (A-7), a date and a time in the visitor's own zone, the same moment in UTC, and when entries
 *          close (5% of the time before the deadline, at least 24 hours and at most 7 days), from the SDK's mirror of
 *          `math/schedule.rs`. The program checks 3 to 90 days again when it opens the campaign.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useId } from "react";
import { formatUtc } from "@brot/sdk/read";

import { Button } from "@/components/ui/button";
import type { Issue } from "./check";
import { SLOTS } from "./copy";
import { DAY_SECONDS, daysFrom, type Draft } from "./draft";
import { IssueList } from "./issue-list";

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
  const at = deadline && "at" in deadline ? deadline.at : null;
  const [day, time] = at === null ? ["", ""] : localParts(at);
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
            onChange={(e) => onChange(withLocal(e.target.value, time))}
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
            onChange={(e) => onChange(withLocal(day, e.target.value))}
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

function withLocal(day: string, time: string): Draft["deadline"] {
  const at = fromLocal(day, time);
  return at === null ? null : { at };
}
