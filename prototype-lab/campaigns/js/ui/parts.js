/**
 * Purpose: the small pieces every screen repeats, each one function returning HTML: the kind tile and label, the
 *          state chip, the partner seal, the YES/NO bar with the prize, the pot line, the two moments (entries close
 *          and deadline, in UTC and local time), the live value against the target, and the empty state with Baked.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. These are the primitives app/components/ui gets in Sprint -1.
 */
import { esc, local, NOW, pct, rel, sol, utc, value } from "../format.js";
import { chance, pot, result, STATES } from "../model.js";
import { icon } from "./icons.js";

/** The five kinds of P1 §4.2. Day one opens only `price` in the program (Sprint 02); the rest arrive in Sprint 03. */
export const KINDS = {
  price: { label: "Price", long: "Price of a large asset", tile: "$", cls: "kind-price" },
  burn: { label: "Supply burn", long: "Token supply burned", tile: "B", cls: "kind-burn" },
  lock: { label: "Locked liquidity", long: "Liquidity locked on Meteora", tile: "L", cls: "kind-lock" },
  pool: { label: "Stake pool", long: "Size of a stake pool", tile: "P", cls: "kind-pool" },
  stake: { label: "Validator stake", long: "Stake on a validator", tile: "V", cls: "kind-stake" },
};

export const kindTile = (c, size = "") =>
  `<span class="kind-tile ${size} ${KINDS[c.kind].cls}" aria-hidden="true">${KINDS[c.kind].tile}</span>`;
export const kindLabel = (c) => KINDS[c.kind].label;

/** The state chip: label and dot, never colour alone. Paid campaigns say the result. */
export function stateChip(c) {
  const s = STATES[c.status];
  const r = result(c);
  const text = c.status === "paid" && r ? `Paid · ${r}` : s.label;
  return `<span class="chip state ${s.cls}"${s.sub ? ` title="${s.sub}"` : ""}>${text}${s.sub ? `<span class="sr-only">, ${s.sub}</span>` : ""}</span>`;
}

/** The partner seal (BR-19): a team-key campaign opened for a launch partner. Placement is the founder's call (L-24). */
export const seal = (c) =>
  c.partner ? `<span class="chip seal" title="Opened free by the Brot team for a launch partner">${icon("sparkle", 12)}Launch partner · ${esc(c.partner.name)}</span>` : "";

/** Each side's share as whole percents that add up to 100 (largest remainder), "<1%" and ">99%" at the ends. */
export function chancePair(c) {
  const ch = chance(c);
  if (!ch) return null;
  let y = Math.floor(ch.yes * 100);
  let n = Math.floor(ch.no * 100);
  if (y + n < 100) (ch.yes * 100 - y >= ch.no * 100 - n ? y++ : n++);
  const label = (x, raw) => (raw > 0 && x === 0 ? "<1%" : raw < 1 && x === 100 ? ">99%" : `${x}%`);
  return { yes: label(y, ch.yes), no: label(n, ch.no) };
}

/** The pot as one bar: YES, NO, then the prize as a hatched end cap, with an accessible description. */
export function splitBar(c, { thin = false, legend = true } = {}) {
  const p = pot(c);
  const total = p.total || 1;
  const w = (x) => `${((x / total) * 100).toFixed(2)}%`;
  const ch = chancePair(c);
  const label = ch
    ? `YES ${sol(p.yes)}, ${ch.yes} of entries; NO ${sol(p.no)}, ${ch.no}; prize ${sol(p.prize)}`
    : `No entries yet; prize ${sol(p.prize)}`;
  const bar = `<div class="split ${thin ? "thin" : ""}" role="img" aria-label="${label}">
      <span class="y" style="width:${w(p.yes)}"></span><span class="n" style="width:${w(p.no)}"></span><span class="p" style="width:${w(p.prize)}"></span></div>`;
  if (!legend) return bar;
  return `${bar}<div class="split-legend" aria-hidden="true">
      <span class="y">YES <b>${ch ? ch.yes : "–"}</b> · ${sol(p.yes)}</span>
      ${p.prize ? `<span>Prize <b>${sol(p.prize)}</b></span>` : ""}
      <span class="n">NO <b>${ch ? ch.no : "–"}</b> · ${sol(p.no)}</span></div>`;
}

/** "Pot 18.40 SOL" with what it holds. */
export const potLine = (c) => {
  const p = pot(c);
  return `<span class="pot-line"><b class="tabular">${sol(p.total)}</b> in the pot${p.prize ? ` · ${sol(p.prize)} prize` : ""}</span>`;
};

/** A moment shown both ways: relative on screen, UTC and local time on hover and for screen readers. */
export const moment = (ts) => `<time datetime="${new Date(ts).toISOString()}" title="${utc(ts)} · ${local(ts)}">${rel(ts, NOW)}</time>`;

/** Entries close, then the deadline: two moments, never one (BR-06). */
export function moments(c, { compact = false } = {}) {
  const closeWord = c.entriesCloseAt > NOW ? "Entries close" : "Entries closed";
  const endWord = c.deadlineAt > NOW ? "Deadline" : "Deadline passed";
  if (compact) return `<span class="moments">${icon("clock", 13)}${closeWord} ${moment(c.entriesCloseAt)}</span>`;
  return `<dl class="rows moments-rows">
      <div><dt>${closeWord}</dt><dd>${moment(c.entriesCloseAt)}<small>${utc(c.entriesCloseAt)}</small></dd></div>
      <div><dt>${endWord}</dt><dd>${moment(c.deadlineAt)}<small>${utc(c.deadlineAt)}</small></dd></div></dl>`;
}

/** The live value and the target, the heart of the proof (P1 §4.7: "the number read, the target and the link"). */
export function liveVsTarget(c) {
  const now = c.live ? value(c.live.value, c.unit) : "No reading";
  const dir = c.direction === "below" ? "at or below" : "at or above";
  return `<div class="read-values">
      <div><small>${esc(c.field)} now</small><b class="num">${now}</b></div>
      <div><small>YES if ${dir}</small><b class="num dim">${value(c.target, c.unit)}</b></div></div>`;
}

/** The empty state: Baked sulking, a sentence, and one way out. */
export const empty = (text, action = "") =>
  `<div class="empty" data-perch="empty" data-perch-pose="sulking"><img src="img/baked-sulking.webp" alt="Baked, sulking" width="150" height="95"><p>${text}</p>${action}</div>`;
