/**
 * Purpose: section 1 of the creation box, "What" (spec 3.12; TP §3.6): the combobox "What should the chain answer?"
 *          over the templates, the pinned Pyth feeds and the reviewed names, with the keyboard of a listbox (arrows,
 *          Enter, Escape) and a polite count for screen readers; outside the grammar, "we can't check this on-chain"
 *          and the nearest templates. Then the six kinds; one closed in this build says when it opens. What is typed
 *          in the combobox stays in this component's memory and is never sent or stored (D-j); a picked suggestion
 *          fills only what search.ts says, checked like a typed field.
 * Version: 0.2.0 (the UI overhaul: the prototype's list, each suggestion a whole campaign sentence; Enter takes the
 *          first; after a pick the cursor moves to the account or the target; 0.1.1, the Sprint 19 reviews)
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
import { opensText, TEMPLATES } from "./kinds";
import { search, type SearchSources, type Suggestion } from "./search";
import { WhatList } from "./what-list";

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
  const { items } = result;
  const pick = (s: Suggestion) => {
    onPick(s);
    setQuery("");
    setOpen(false);
    setActive(-1);
    // As in the prototype, the cursor goes on to what is left to type: the account, or else the target.
    const next = s.kind !== "price" && !s.account ? "account" : "target";
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>(`[data-op-next="${next}"]`)?.focus());
  };
  const expanded = open && items.length > 0;
  return (
    <Card as="section" aria-labelledby={`${id}-h`} className="space-y-3 p-4 [grid-area:what]">
      <h2 id={`${id}-h`} className="op-h">
        <span className="op-n" aria-hidden="true">
          1
        </span>
        {BOX.what}
      </h2>
      <div className="op-combo relative">
        <label htmlFor={`${id}-q`} className="op-label">
          {WHAT.search}
        </label>
        <div className="op-qbox mt-1.5">
          <Search className="size-4" aria-hidden="true" />
          <input
            id={`${id}-q`}
            className="input"
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
              if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key) || items.length === 0) return;
              e.preventDefault();
              // Enter takes the highlighted suggestion, or the first, as a search bar does.
              if (e.key === "Enter") return pick(items[active >= 0 ? active : 0]);
              const step = e.key === "ArrowDown" ? 1 : -1;
              setOpen(true);
              setActive((i) => (i + step + items.length) % items.length);
            }}
          />
          {expanded ? <WhatList id={id} result={result} active={active} onPick={pick} onActive={setActive} /> : null}
        </div>
        <p id={`${id}-help`} className="help mt-1.5">
          {WHAT.searchHelp}
        </p>
        <p className="sr-only" aria-live="polite">
          {open && query ? (result.outside ? WHAT.countOutside(items.length) : WHAT.count(items.length)) : ""}
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
                  {opensText(t)}
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
