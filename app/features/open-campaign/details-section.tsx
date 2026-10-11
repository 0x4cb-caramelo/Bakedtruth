/**
 * Purpose: section 2 of the creation box, "Details" (spec 3.12): the sentence as it fills (template v1, with its gaps),
 *          then the kind's typed slots, each a labelled field and never an inline blank: for a price, the listed Pyth
 *          feeds with their state read live and the direction; for the other kinds, the account slot; the target in
 *          the kind's unit with the value now; the epoch on the epoch kinds; and the deadline, in the visitor's own time
 *          with its UTC moment and when entries close. Each slot shows its own messages; the help and the gaps are in the
 *          kind's own words and unit.
 * Version: 0.2.0 (the Sprint 19 copy review: help by unit, the gaps' words)
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useId } from "react";

import { Card } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import type { SentencePart } from "../campaigns/sentence";
import { BOX, KIND_WORDS, SLOTS } from "./copy";
import { issuesAt, type BoxCheck } from "./check";
import { AccountSlot } from "./account-slot";
import { DeadlineSlot } from "./deadline-slot";
import { FeedPicker } from "./feed-picker";
import type { Draft } from "./draft";
import { IssueList } from "./issue-list";
import { templateOf } from "./kinds";
import type { KnownName } from "./names";
import type { FeedOption, SlotRead } from "./preview";

type Gap = Exclude<SentencePart, string>["slot"];

const Sentence = ({ parts, gap }: { parts: SentencePart[]; gap: (slot: Gap) => string }) => (
  <p className="font-display text-xl font-bold leading-snug" aria-live="polite">
    {parts.map((p, i) =>
      typeof p === "string" ? (
        <span key={i}>{p}</span>
      ) : p.value ? (
        <b key={i} className="underline decoration-accent underline-offset-4">
          {p.value}
        </b>
      ) : (
        <span key={i} className="rounded-sm border border-dashed border-line-strong px-1.5 text-base text-muted">
          {gap(p.slot)}
        </span>
      ),
    )}
  </p>
);

export function DetailsSection(p: {
  draft: Draft;
  setDraft: (change: (d: Draft) => Draft) => void;
  check: BoxCheck | null;
  parts: SentencePart[];
  feeds: FeedOption[];
  slotRead: SlotRead;
  names: KnownName[];
  valueNow: string | null;
  chainNow: bigint | null;
  epochNow: bigint | null;
  entriesClose: bigint | null;
  onCheckAgain: () => void;
}) {
  const id = useId();
  const { draft, setDraft, check } = p;
  const t = templateOf(draft.kind);
  const at = (place: Parameters<typeof issuesAt>[1]) => (check ? issuesAt(check, place) : []);
  const below = draft.kind === "burn" || (draft.kind === "price" && draft.direction === "below");
  const slotSaysWhy = p.slotRead.status === "read" && p.slotRead.state.state !== "ok";
  // The gaps in the kind's own words: "token mint", "DAMM v2 pool", "stake pool", "vote account" (S19).
  const gap = (slot: Gap) => (slot === "account" ? KIND_WORDS[draft.kind].phrase : SLOTS.gap[slot]);
  return (
    <Card as="section" aria-labelledby={`${id}-h`} className="space-y-4 p-4 [grid-area:details]">
      <h2 id={`${id}-h`} className="op-h">
        <span className="op-n" aria-hidden="true">
          2
        </span>
        {BOX.details}
      </h2>
      <div className="rounded-sm bg-raised p-3">
        <span className="text-xs font-medium text-muted">{SLOTS.sentence}</span>
        <Sentence parts={p.parts} gap={gap} />
      </div>
      {draft.kind === "price" ? (
        <>
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-muted">{SLOTS.asset}</legend>
            <FeedPicker
              feeds={p.feeds}
              picked={draft.feedHex}
              onPick={(hex) => setDraft((d) => ({ ...d, feedHex: hex, target: "" }))}
            />
            <p className="mt-1.5 text-xs text-muted">{SLOTS.assetHelp}</p>
            <IssueList issues={at("feed")} className="mt-1.5" />
          </fieldset>
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-muted">{SLOTS.direction}</span>
            <Segmented
              wide
              label={SLOTS.direction}
              value={draft.direction}
              onChange={(v) => setDraft((d) => ({ ...d, direction: v === "below" ? "below" : "above" }))}
              items={[
                { id: "above", label: SLOTS.above },
                { id: "below", label: SLOTS.below },
              ]}
            />
          </div>
        </>
      ) : (
        <div className="space-y-1.5">
          <AccountSlot
            kind={draft.kind}
            value={draft.account}
            read={p.slotRead}
            names={p.names}
            onChange={(account) => setDraft((d) => ({ ...d, account, target: "" }))}
            onCheckAgain={p.onCheckAgain}
          />
          {/* When the slot already says why the reader refused the account, it is not said twice. */}
          <IssueList issues={slotSaysWhy ? [] : at("account")} />
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor={`${id}-target`} className="text-xs font-medium text-muted">
          {SLOTS.target[draft.kind]}
        </label>
        <div className={draft.kind === "price" ? "op-num pre" : "op-num"}>
          {draft.kind === "price" ? (
            <span className="op-pre" aria-hidden="true">
              $
            </span>
          ) : null}
          <input
            id={`${id}-target`}
            inputMode="decimal"
            autoComplete="off"
            value={draft.target}
            onChange={(e) => setDraft((d) => ({ ...d, target: e.target.value }))}
            aria-describedby={`${id}-target-help`}
            aria-invalid={at("target").some((i) => i.level === "refuse")}
            className="input"
          />
        </div>
        <p id={`${id}-target-help`} className="text-xs text-muted">
          {p.valueNow ? `${SLOTS.now(p.valueNow, below)} ` : ""}
          {SLOTS.targetHelp[draft.kind]}
        </p>
        <IssueList issues={at("target")} />
      </div>
      {t.epoch ? (
        <div className="space-y-1.5">
          <label htmlFor={`${id}-epoch`} className="text-xs font-medium text-muted">
            {SLOTS.epoch}
          </label>
          <input
            id={`${id}-epoch`}
            inputMode="numeric"
            value={draft.epoch}
            onChange={(e) => setDraft((d) => ({ ...d, epoch: e.target.value.trim() }))}
            className="min-h-11 w-full rounded-sm border border-field-line bg-bg px-3 py-2.5 text-base text-text tabular-nums"
          />
          <p className="text-xs text-muted">{SLOTS.epochHelp(p.epochNow?.toString() ?? "…")}</p>
          <IssueList issues={at("epoch")} />
        </div>
      ) : null}
      <DeadlineSlot
        deadline={draft.deadline}
        chainNow={p.chainNow}
        entriesClose={p.entriesClose}
        issues={at("deadline")}
        onChange={(deadline) => setDraft((d) => ({ ...d, deadline }))}
      />
    </Card>
  );
}
