/**
 * Purpose: the campaign card, shared by the home grid, the full list, the opening preview and the screens index:
 *          kind and state, the generated sentence, the live value against the target, each side's share of the
 *          entries with the pot bar, what 1 SOL on each side would return now (net of fees), the creator chip on
 *          kinds a creator can move, the entries-close moment and the pot. Past its entries the card says where the
 *          campaign is instead of offering a side. Variants follow spec 3.4.
 * Version: 0.2.0 · Sprint -1 (design system), 2026-10-08. Replaces conflicts 1 to 4 and 14 to 17 of
 *          DESIGN-DIRECTION.md: no YES price, no buy buttons, no redemption; five states; a pot per side; two moments.
 */
import { countdown, esc, HOUR, LAMPORTS, NOW, sol, utc, value } from "../format.js";
import { estimate, joinable, result } from "../model.js";
import { state } from "../state.js";
import { icon } from "./icons.js";
import { chancePair, kindLabel, kindTile, moment, seal, splitBar, stateChip } from "./parts.js";

const VOID_REASONS = {
  "missed-window": "Reading window missed",
  unreadable: "Account could not be read",
  "stale-feed": "Price feed stopped",
  "team-house": "Voided by the team: our failure",
  "team-outside": "Voided by the team: outside cause",
};
export const voidReason = (c) => VOID_REASONS[c.voidReason] ?? "Voided";

/** The creator notice of P1 §4.2 (BP-14): kinds whose creator can move the measured thing. */
export const CREATOR_NOTICE = "Whoever opened this campaign can control the result and may have an entry on YES or NO.";
export const creatorCanMove = (c) => c.kind !== "price";

/** "est. 2.47 per 1" for one side (spec 1.3: never × or →), floored to two decimals. */
export function per1(c, side) {
  const e = estimate(c, side, LAMPORTS);
  if (!e) return "";
  return e.mode === "split" ? `est. ${(Math.floor(e.multiple * 100) / 100).toFixed(2)} per 1` : `refund if ${side === "yes" ? "NO" : "YES"} stays empty`;
}

/** The two side buttons, with the one-sided and empty variants of spec 3.4; disabled while entries are paused. */
function sides(c) {
  const empty = !c.poolYes && !c.poolNo;
  const label = (side) => {
    if (empty) return "";
    const mine = side === "yes" ? c.poolYes : c.poolNo;
    return mine ? per1(c, side) : "be first";
  };
  const btn = (side) => {
    const text = `<span>${empty ? `Join ${side.toUpperCase()}` : side.toUpperCase()}</span><span class="per">${label(side)}</span>`;
    return state.paused
      ? `<span class="side-btn ${side}" aria-disabled="true">${text}</span>`
      : `<a class="side-btn ${side}" href="#/c/${c.id}?side=${side}" data-mood="${side === "yes" ? "approve" : "skeptical"}">${text}</a>`;
  };
  const sub = state.paused ? "Entries paused" : empty ? "No entries yet" : !c.poolYes || !c.poolNo ? "One-sided so far" : "";
  return `<div class="card-sides">${btn("yes")}${btn("no")}</div>${sub ? `<p class="card-note">${sub}</p>` : ""}`;
}

/** What the bottom of the card says past its entries, by state. Each line is built only for its own state. */
function status(c) {
  const r = result(c);
  const lines = {
    open: () => "Entries closed · waiting for the reading",
    closed: () => "Entries closed · waiting for the reading",
    review: () => `Read: ${r} · pays in ${countdown(c.reviewEndsAt)}`,
    contested: () => `Read: ${r} · payout paused`,
    paid: () => (c.settleMode === "onesided" ? `Result: ${r} · one-sided, refunded` : `Result: ${r} · paid ${utc(c.deadlineAt).split(" · ")[0]}`),
    void: () => `Voided · refunded · ${voidReason(c)}`,
  };
  const tone = c.status === "paid" ? (c.settleMode === "onesided" ? "paid" : `paid ${c.outcome}`) : c.status;
  return `<p class="card-status ${tone}">${icon(c.status === "paid" ? "check" : c.status === "void" ? "x" : "clock", 14)}<span>${lines[c.status]()}</span></p>`;
}

/** The proof line: the value read now against the target; for prices, the distance in percent. */
function proof(c) {
  const sign = c.direction === "below" ? "≤" : "≥";
  if (!c.live) return `<p class="card-read"><span>${icon("eye", 13)}No reading</span><span>YES ${sign} <b>${value(c.target, c.unit)}</b></span></p>`;
  const gap = c.kind === "price" ? ` <span class="gap">(${c.target > c.live.value ? "+" : ""}${(((c.target - c.live.value) / c.live.value) * 100).toFixed(1)}%)</span>` : "";
  return `<p class="card-read"><span>${icon("eye", 13)}Now <b>${value(c.live.value, c.unit)}</b></span><span>YES ${sign} <b>${value(c.target, c.unit)}</b>${gap}</span></p>`;
}

/** Placement B of the partner seal (L-24, for the founder to pick): a band across the top of the card. */
const sealBand = () => new URLSearchParams(location.hash.split("?")[1] ?? "").get("seal") === "band";
const band = (c) =>
  c.partner ? `<p class="card-band">${icon("sparkle", 13)}<span>Launch partner · <b>${esc(c.partner.name)}</b></span><span>highlight ends ${moment(c.partner.highlightUntil)}</span></p>` : "";

/** `seal` forces a placement ("chip" or "band"); by default the hash decides (`#/?seal=band`). */
export function card(c, { seal: placement } = {}) {
  const ch = chancePair(c);
  const B = placement ? placement === "band" : sealBand();
  const saved = state.saved.has(c.id);
  const creator = creatorCanMove(c)
    ? `<span class="chip card-creator" title="${CREATOR_NOTICE}${c.creatorJoined ? ` The creator's wallet has an entry on ${c.creatorJoined.toUpperCase()}.` : ""}">${icon("alert", 12)}Creator may control the result</span>`
    : "";
  return `
  <article class="card" data-perch="card-${c.id}" data-perch-x="0.86" data-perch-size="0.74"${c.status === "paid" ? ' data-perch-pose="approve" data-perch-say="Fine. It checks out."' : ""}>
    ${B ? band(c) : ""}
    <div class="card-top">${kindTile(c)}<div class="card-kind"><b>${kindLabel(c)}</b><span>${esc(c.asset)}</span></div>
      <div class="card-chips">${stateChip(c)}${B ? "" : seal(c)}</div></div>
    <a class="card-title" href="#/c/${c.id}">${esc(c.sentence)}</a>
    ${proof(c)}
    <div class="card-chance" aria-label="Share of the entries: YES ${ch ? ch.yes : "none yet"}, NO ${ch ? ch.no : "none yet"}">
      <span class="y"><small>YES</small><strong class="num">${ch ? ch.yes : "–"}</strong></span>
      <span class="n"><small>NO</small><strong class="num">${ch ? ch.no : "–"}</strong></span></div>
    ${splitBar(c, { thin: true, legend: false })}
    ${joinable(c, NOW) ? sides(c) : status(c)}
    ${creator}
    <div class="card-foot"><span>Pot <b class="tabular">${sol(c.poolYes + c.poolNo + c.prize)}</b></span><span aria-hidden="true">·</span>
      <span>${joinable(c, NOW) ? `Entries close <span class="${c.entriesCloseAt - NOW < 24 * HOUR ? "soon" : ""}">${moment(c.entriesCloseAt)}</span>` : `${c.bakers} bakers`}</span>
      ${c.creatorIsTeam && !c.partner ? `<span aria-hidden="true">·</span><span>Team</span>` : ""}
      <button class="save" data-save="${c.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove from" : "Add to"} saved: ${esc(c.sentence)}">${icon("bookmark", 15)}</button></div>
  </article>`;
}

/** Wires the save buttons of every card under `root` (the state redraws the screen). */
export function wireCards(root, toggleSaved) {
  root.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", () => toggleSaved(b.dataset.save)));
}

/** A one-line row for side lists: tile, sentence, YES share, a moment (amber only under 24 hours). */
export const cardRow = (c) => `
  <a class="card-row" href="#/c/${c.id}">${kindTile(c, "sm")}
    <span class="card-row-text"><b>${esc(c.sentence)}</b><span>${kindLabel(c)} · ${sol(c.poolYes + c.poolNo + c.prize)} pot</span></span>
    <span class="card-row-right"><strong class="num">${chancePair(c)?.yes ?? "–"}</strong>${c.status === "open" ? `<em class="${c.entriesCloseAt - NOW < 24 * HOUR ? "soon" : ""}">closes ${moment(c.entriesCloseAt)}</em>` : stateChip(c)}</span></a>`;
