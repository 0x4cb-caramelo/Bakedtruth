/**
 * Purpose: section 1 of the creation box, "What" (spec 3.12; TP §3.6): the combobox "What should the chain answer?"
 *          over the templates, the pinned Pyth feeds and the reviewed names, with the keyboard of a listbox (arrows,
 *          Enter, Escape) and a polite count for screen readers; outside the grammar, "we can't check this on-chain"
 *          and the nearest templates. Then the five kinds; `StakeAtLeast` says when it opens. What is typed in the
 *          combobox stays in this component's memory and is never sent or stored (D-j); a picked suggestion fills only
 *          what search.ts says, checked like a typed field.
 * Version: 0.1.1 (the Sprint 19 reviews: the header says what a suggestion fills; the label from the copy file)
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cx } from "@/components/ui/cx";
import { KindTile } from "@/components/ui/kind-tile";
import { KIND_NAME } from "../campaign-page/copy";
import type { KindName } from "../campaign-page/proof";
import type { Issue } from "./check";
import { BOX, WHAT } from "./copy";
import { IssueList } from "./issue-list";
import { TEMPLATES } from "./kinds";
import { search, type SearchSources, type Suggestion } from "./search";

const label = (s: Suggestion) =>
  s.feedSymbol
    ? `${s.feedSymbol} · ${WHAT.pythPrice}`
    : s.name
      ? `${s.name} · ${KIND_NAME[s.kind]}`
      : KIND_NAME[s.kind];

export function WhatSection({
  kind,
  sources,
  issues,
  onPick,
  onKind,
}: {
  kind: KindName;
  sources: SearchSources;
  issues: readonly Issue[];
  onPick: (s: Suggestion) => void;
  onKind: (kind: KindName) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const result = useMemo(() => search(query, sources), [query, sources]);
  const pick = (s: Suggestion) => {
    onPick(s);
    setQuery("");
    setOpen(false);
    setActive(-1);
  };
  const expanded = open && result.items.length > 0;
  return (
    <Card as="section" aria-labelledby={`${id}-h`} className="space-y-3 p-4 [grid-area:what]">
      <h2 id={`${id}-h`} className="font-display text-2xl font-bold">
        <span className="mr-2 text-muted">1</span>
        {BOX.what}
      </h2>
      <div className="relative">
        <label htmlFor={`${id}-q`} className="text-xs font-medium text-muted">
          {WHAT.search}
        </label>
        <div className="mt-1.5 flex items-center gap-2 rounded-sm border border-field-line bg-bg px-3">
          <Search className="size-4 text-muted" aria-hidden="true" />
          <input
            id={`${id}-q`}
            role="combobox"
            aria-expanded={expanded}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-describedby={`${id}-help`}
            aria-activedescendant={expanded && active >= 0 ? `${id}-o${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            value={query}
            placeholder={WHAT.placeholder}
            onChange={(e) => (setQuery(e.target.value), setOpen(true), setActive(-1))}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") return setOpen(false);
              if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key) || result.items.length === 0) return;
              e.preventDefault();
              if (e.key === "Enter") return active >= 0 && pick(result.items[active]);
              const step = e.key === "ArrowDown" ? 1 : -1;
              setOpen(true);
              setActive((i) => (i + step + result.items.length) % result.items.length);
            }}
            className="min-h-11 w-full bg-transparent py-2.5 text-base text-text outline-none"
          />
        </div>
        {expanded ? (
          <div className="absolute inset-x-0 z-20 mt-1 max-h-72 overflow-auto rounded-sm border border-line bg-panel shadow-[var(--shadow-pop)]">
            {result.outside ? <p className="px-3 pt-2 text-xs font-semibold">{WHAT.outside}</p> : null}
            <ul id={`${id}-list`} role="listbox" aria-label={WHAT.search} className="list-none p-1">
              {result.items.map((s, i) => (
                <li
                  key={`${s.kind}:${s.feedHex ?? ""}:${s.account ?? ""}`}
                  id={`${id}-o${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(s)}
                  className={cx(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                    i === active ? "bg-pressed-bg text-pressed-fg" : "hover:bg-row-hover",
                  )}
                >
                  <KindTile kind={s.kind} small />
                  <span>{label(s)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p id={`${id}-help`} className="mt-1.5 text-xs text-muted">
          {WHAT.searchHelp}
        </p>
        <p className="sr-only" aria-live="polite">
          {open && query
            ? result.outside
              ? WHAT.countOutside(result.items.length)
              : WHAT.count(result.items.length)
            : ""}
        </p>
      </div>
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">{WHAT.orPick}</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          {TEMPLATES.map((t) => (
            <label
              key={t.kind}
              className={cx(
                "flex cursor-pointer items-start gap-2.5 rounded-sm border p-2.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                kind === t.kind ? "border-accent bg-row-hover" : "border-line",
              )}
            >
              <input
                type="radio"
                name={`${id}-kind`}
                value={t.kind}
                checked={kind === t.kind}
                onChange={() => onKind(t.kind)}
                className="sr-only"
              />
              <KindTile kind={t.kind} small />
              <span className="min-w-0 text-sm">
                <b className="block">{KIND_NAME[t.kind]}</b>
                <small className="block text-xs text-muted">{WHAT.kindLong[t.kind]}</small>
                <em className={cx("block text-xs not-italic", t.opens === "now" ? "text-dim" : "text-st-review-fg")}>
                  {t.opens === "now" ? WHAT.opensNow : WHAT.opensLater}
                </em>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <IssueList issues={issues} />
    </Card>
  );
}
