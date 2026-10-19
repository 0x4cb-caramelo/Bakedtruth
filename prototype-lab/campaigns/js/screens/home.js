/**
 * Purpose: the home page (#/): a top line with the opening action and its cost, the mosaic (the carousel of
 *          home-mosaic.js, then "Closing soon" and "Answered recently"), how it works in three steps, three
 *          principles, and the grid of listed campaigns in ranking order, with state and kind filters, a sort and a
 *          polite count. The view lives in the hash (#/?state=paid&kind=burn&sort=pot), so a link or a redraw keeps it.
 *          Review switches: ?loading=1, ?empty=1, ?error=1, and ?seal=band for the partner's placement B (L-24).
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Replaces conflicts 7 to 15 of DESIGN-DIRECTION.md: the
 *          steps and principles of the pot in SOL, the five states as filters, nothing to sort by "YES price".
 */
import { listed, SOL_USD } from "../data/index.js";
import { esc, HOUR, NOW, rel, sol, usd } from "../format.js";
import { joinable, opening, pot, result } from "../model.js";
import { state, toggleSaved } from "../state.js";
import { card, cardRow, wireCards } from "../ui/card.js";
import { icon } from "../ui/icons.js";
import { KINDS, kindLabel, kindTile } from "../ui/parts.js";
import { feature, mountCarousel } from "./home-mosaic.js";
import {
  countText, emptyBlock, errorBlock, FILTERS, hashQuery, kindChips, mode, readView, select, skelCard, skelRow, SORTS, stateChips,
  syncToolbar, wireRetry, wireToolbar, writeView,
} from "./home-parts.js";

const DEFAULTS = { state: "open", kind: "all", sort: "ranked" };
const STATE_KEYS = ["open", "closed", "review", "paid", "void", "saved"];
const SORT_KEYS = ["ranked", "pot", "close", "chance"];
const ALLOWED = { state: STATE_KEYS, kind: ["all", ...Object.keys(KINDS)], sort: SORT_KEYS };
let refocus = null; // a bookmark click redraws the screen; focus goes back to that bookmark

// Spec 3.2's six steps, told in three (the full list is #/how); its principles, with the review rule spelled out.
const STEPS = [
  ["Open a campaign", "Any wallet opens one for US$500 in SOL: 90% is a prize in the pot, 10% goes to Brot. The site writes the question from the kind, the account, the target and the date."],
  ["Join YES or NO with SOL", "Bakers put SOL on a side, from 0.01 SOL. Chance is each side's share of the entries. Entries close before the deadline, 24 hours to 7 days ahead, or once the answer is known."],
  ["The program reads the answer", "Target met: YES. Deadline passed without it: NO. After a 6-hour review, the winning side splits the pot, and one-sided pots and voided campaigns refund every entry."],
];
const PRINCIPLES = [
  ["eye", "The chain answers", "A campaign opens only if a Solana account holds its answer; price campaigns read Pyth's price on-chain. No human picks the winner: the 6-hour review can confirm or void a result, never switch it."],
  ["vault", "One pot, in SOL", "YES or NO, one pot. The winning side splits it with the prize. Brot keeps 10% of the losing side; the creator gets 1% of the entries."],
  ["wallet", "Paid to your wallet", "After the 6-hour review, SOL goes straight to each winning wallet. No claim button. No early exit."],
];

/** The top line: what this is, and the opening action with what it costs right now. */
function lead() {
  const paid = opening(500, SOL_USD.price, SOL_USD.expo).paid;
  const now = state.paused ? "New campaigns are paused right now."
    : state.stalePrice ? "Paid openings wait for a fresh SOL/USD price."
    : `Now ${sol(paid, { round: "up" })} at Pyth SOL/USD ${usd(SOL_USD.price * 10 ** SOL_USD.expo, 2)}`;
  return `<section class="home-lead"><div><h1>YES/NO questions an on-chain account answers.</h1><p>Join with SOL; the program reads the result.</p></div>
    <div class="home-open"><a class="cta" href="#/open"><span>${icon("plus", 15)}Open a campaign</span></a>
      <p>US$500 in SOL · 90% becomes the prize</p><p>${now}</p></div></section>`;
}

function how() {
  const step = ([t, p], i) => `<li><b class="num" aria-hidden="true">${i + 1}</b><div><h3>${t}</h3><p>${p}</p></div></li>`;
  const principle = ([ic, t, p]) => `<li><span class="home-ic">${icon(ic, 18)}</span><div><h3>${t}</h3><p>${p}</p></div></li>`;
  const perch = 'data-perch="home-how" data-perch-x="0.5" data-perch-size="0.8" data-perch-pose="point" data-perch-say="Read, not voted."';
  return `<section class="home-how" aria-labelledby="home-how-title">
      <div class="home-how-head" ${perch}><h2 id="home-how-title">How it works</h2><a href="#/how">Every step, fee and refund ${icon("arrow-right", 14)}</a></div>
      <ol class="home-steps" role="list">${STEPS.map(step).join("")}</ol></section>
    <section aria-labelledby="home-why"><h2 id="home-why" class="sr-only">Why you can check it</h2>
      <ul class="home-principles" role="list">${PRINCIPLES.map(principle).join("")}</ul></section>`;
}

function toolbar(view, count) {
  const sorts = SORT_KEYS.map((k) => [k, SORTS[k][0]]);
  return `<section class="home-toolbar" aria-labelledby="home-browse" data-toolbar data-perch="home-toolbar" data-perch-x="0.5" data-perch-size="0.8" data-perch-pose="skeptical">
    <h2 id="home-browse" class="sr-only">Browse campaigns</h2>
    <div class="home-bar-row">${stateChips(STATE_KEYS, view.state)}
      <div class="home-bar-end"><p class="home-count" data-count aria-live="polite">${count}</p>${select("sort", "Sort", sorts, view.sort)}</div></div>
    <div class="home-bar-row">${kindChips(view.kind)}<a class="home-all" href="#/campaigns">All campaigns, unlisted too ${icon("arrow-right", 14)}</a></div></section>`;
}

/** "Read: NO · pays in 3 h 12 min", "YES · paid", "Voided · refunded": an answered campaign on one line. */
function answeredRow(c) {
  const r = result(c);
  const read = c.status === "review" || c.status === "contested";
  const when = { review: `pays ${rel(c.reviewEndsAt)}`, contested: "payout paused", void: "refunded",
    paid: c.settleMode === "onesided" ? "one side only · refunded" : "paid" }[c.status];
  return `<a class="card-row" href="#/c/${c.id}">${kindTile(c, "sm")}<span class="card-row-text"><b>${esc(c.sentence)}</b><span>${kindLabel(c)} · ${sol(pot(c).total)} pot</span></span>
    <span class="card-row-right"><span class="chip ${c.outcome === "void" ? "state state-void" : c.outcome}">${read ? `Read: ${r}` : r}</span><em${c.status === "review" ? ' class="warn"' : ""}>${when}</em></span></a>`;
}

/** The shared row, with its "closes in" in the warning colour only under 24 hours (spec 1.4). */
const closing = (c) => (c.entriesCloseAt - NOW < 24 * HOUR ? cardRow(c).replace('class="card-row"', 'class="card-row is-soon"') : cardRow(c));

/** "Closing soon" (the four soonest entries close) and "Answered recently" (read in the last 72 hours). */
function sideBoxes(all, m) {
  const open = all.filter((c) => joinable(c, NOW)).sort((a, b) => a.entriesCloseAt - b.entriesCloseAt).slice(0, 4);
  const at = (c) => c.observed?.at ?? c.deadlineAt;
  const done = all
    .filter((c) => ["review", "contested", "paid", "void"].includes(c.status) && NOW - at(c) <= 72 * HOUR)
    .sort((a, b) => at(b) - at(a))
    .slice(0, 4);
  const body = (rows, none) => (m === "loading" ? skelRow().repeat(4) : m === "error" ? errorBlock()
    : rows.length ? rows.join("") : `<p class="home-none">${none}</p>`);
  const box = (id, title, inner) =>
    `<section class="home-box" aria-labelledby="${id}"${m === "loading" ? ' aria-busy="true"' : ""}><h2 id="${id}">${title}</h2><div class="home-rows">${inner}</div></section>`;
  return `<div class="home-side">${box("home-closing", "Closing soon", body(open.map(closing), "Nothing is open right now."))}${box(
    "home-answered", "Answered recently", body(done.map(answeredRow), "Nothing answered yet."))}</div>`;
}

/** The grid for the current view, or its loading, error or empty state. */
function results(all, view, m) {
  if (m === "loading") return { count: "Loading campaigns…", html: `<div class="grid-cards">${skelCard().repeat(6)}</div>` };
  if (m === "error") return { count: "", html: errorBlock() };
  const list = all
    .filter(FILTERS[view.state][1])
    .filter((c) => view.kind === "all" || c.kind === view.kind)
    .sort(SORTS[view.sort][1]);
  if (list.length) return { count: countText(list.length), html: `<div class="grid-cards">${list.map((c) => card(c)).join("")}</div>` };
  const clear = `<button type="button" class="btn" data-clear>Clear filters</button>`;
  const html = !all.length ? emptyBlock("No campaigns yet.") // the top line and the carousel already offer to open one
    : view.state === "saved" && !state.saved.size ? emptyBlock("Nothing saved yet. The bookmark on a card keeps it here, in this browser.", clear)
    : emptyBlock("No campaigns here.", clear);
  return { count: countText(0), html };
}

export default () => {
  const m = mode();
  const view = readView(DEFAULTS, ALLOWED);
  const all = m === "empty" ? [] : listed();
  const band = hashQuery().get("seal") === "band";
  const r = results(all, view, m);
  return {
    title: "",
    html: `${lead()}
      <div class="home-mosaic">${feature(all.filter((c) => joinable(c, NOW)).slice(0, 5), m, band)}${sideBoxes(all, m)}</div>
      ${how()}${toolbar(view, r.count)}
      <div class="home-results" data-results${m === "loading" ? ' aria-busy="true"' : ""}>${r.html}</div>`,
    mount(main) {
      const stop = mountCarousel(main.querySelector("[data-carousel]"));
      const bar = main.querySelector("[data-toolbar]");
      const out = main.querySelector("[data-results]");
      const save = (id) => ((refocus = id), toggleSaved(id));
      const paint = () => {
        writeView(view, DEFAULTS);
        const next = results(all, view, m);
        out.innerHTML = next.html;
        main.querySelector("[data-count]").textContent = next.count;
        wireCards(out, save);
      };
      wireCards(main.querySelector("[data-carousel]"), save); // the phone carousel shows cards too
      wireCards(out, save);
      wireToolbar(bar, view, paint);
      wireRetry(main);
      out.addEventListener("click", (e) => {
        if (!e.target.closest("[data-clear]")) return;
        Object.assign(view, DEFAULTS);
        syncToolbar(bar, view);
        paint();
        bar.querySelector('[data-state][aria-pressed="true"]').focus();
      });
      if (refocus) {
        const again = [...main.querySelectorAll(`[data-save="${refocus}"]`)].find((b) => b.offsetParent && !b.closest("[inert]"));
        (again ?? bar.querySelector('[data-state][aria-pressed="true"]')).focus({ preventScroll: true });
        refocus = null;
      }
      return stop;
    },
  };
};
