/**
 * Purpose: the suggestions under "What should the chain answer?" (the approved prototype's `.op-drop`, open-slots.js):
 *          grouped by kind, the most relevant group first, each group saying when its kind opens; each suggestion with
 *          its kind's tile, what it reads (the asset and its Pyth feed, or a reviewed name, or the kind) and the campaign
 *          sentence it would start, its filled slots in bold and the empty ones as "…". Outside the grammar, Baked
 *          skeptical over "We can't check this on-chain." The options are a listbox; the input drives the keyboard.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign), in the UI overhaul
 */
import { KindTile } from "@/components/ui/kind-tile";
import { asset } from "@/lib/base-path";
import { KIND_NAME } from "../campaign-page/copy";
import { WHAT } from "./copy";
import { templateOf } from "./kinds";
import type { SearchResult, Suggestion } from "./search";
import { suggestionParts } from "./suggestion-text";

function Head({ s }: { s: Suggestion }) {
  if (s.feedSymbol)
    return (
      <span>
        <b>{s.feedSymbol.split("/")[0]}</b> · {WHAT.feedHead(s.feedSymbol)} · {KIND_NAME[s.kind]}
        {s.stale ? <em className="not-italic text-st-review-fg"> · {WHAT.stale}</em> : null}
      </span>
    );
  if (s.name)
    return (
      <span>
        <b>{s.name}</b> · {templateOf(s.kind).owner} · {KIND_NAME[s.kind]}
      </span>
    );
  return <b>{KIND_NAME[s.kind]}</b>;
}

function Sentence({ s }: { s: Suggestion }) {
  const notes = [s.example ? WHAT.example : null, s.days ? WHAT.days(s.days) : null].filter(Boolean);
  return (
    <small>
      {suggestionParts(s).map((p, i) =>
        typeof p === "string" ? <span key={i}>{p}</span> : p.value ? <b key={i}>{p.value}</b> : <span key={i}>…</span>,
      )}
      {notes.length ? <span className="text-dim"> · {notes.join(" · ")}</span> : null}
    </small>
  );
}

export function WhatList(props: {
  id: string;
  result: SearchResult;
  active: number;
  onPick: (s: Suggestion) => void;
  onActive: (i: number) => void;
}) {
  const { id, result, active } = props;
  // search.ts returns the suggestions grouped by kind, so the numbering below is the order the arrows walk.
  const kinds = [...new Set(result.items.map((s) => s.kind))];
  let n = 0;
  return (
    <div className="op-drop">
      {result.outside ? (
        <div className="op-out">
          {/* eslint-disable-next-line @next/next/no-img-element -- Baked's sprite, already sized */}
          <img src={asset("/mascot/skeptical.png")} alt="" width={64} height={40} />
          <p>
            <b>{WHAT.outsideTitle}</b> {WHAT.outsideNext}
          </p>
        </div>
      ) : null}
      <ul className="op-list" id={`${id}-list`} role="listbox" aria-label={WHAT.search}>
        {kinds.map((k) => (
          <li role="presentation" key={k}>
            <ul role="group" aria-labelledby={`${id}-g-${k}`}>
              <li role="presentation" className="op-grp-h" id={`${id}-g-${k}`}>
                {KIND_NAME[k]}
                <em>{templateOf(k).opens === "now" ? WHAT.opensNow : WHAT.opensLater}</em>
              </li>
              {result.items
                .filter((s) => s.kind === k)
                .map((s) => {
                  const i = n++;
                  return (
                    <li
                      key={`${s.kind}:${s.feedHex ?? ""}:${s.account ?? ""}:${i}`}
                      id={`${id}-o${i}`}
                      role="option"
                      aria-selected={i === active}
                      className="op-o"
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseMove={() => i !== active && props.onActive(i)}
                      onClick={() => props.onPick(s)}
                    >
                      <KindTile kind={s.kind} small />
                      <span className="op-o-t">
                        <Head s={s} />
                        <Sentence s={s} />
                      </span>
                    </li>
                  );
                })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
