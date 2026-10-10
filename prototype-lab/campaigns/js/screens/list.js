/**
 * Purpose: every campaign (#/campaigns), unlisted ones included (TP §3.6, spec 3.3), as a dense list: a search read
 *          from the hash (#/campaigns?q=sol matches the sentence, asset, kind, account and creator), state and kind
 *          chips, who opened it, a sort, a "Show unlisted" switch and Load more. A table-like list on desktop, stacked
 *          rows on phones; the count is polite. Review switches: ?loading=1, ?error=1.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Load more steps by 12 here (the spec's real step is 50) so
 *          the control shows with the prototype's sixteen campaigns.
 */
import { CAMPAIGNS } from "../data/index.js";
import { esc, NOW, short, sol } from "../format.js";
import { pot, result } from "../model.js";
import { voidReason } from "../ui/card.js";
import { icon } from "../ui/icons.js";
import { chancePair, KINDS, kindLabel, kindTile, moment, seal, stateChip } from "../ui/parts.js";
import {
  countText, emptyBlock, errorBlock, FILTERS, kindChips, mode, phase, readView, select, skelRow, SORTS, stateChips,
  syncToolbar, wireRetry, wireToolbar, writeView,
} from "./home-parts.js";

const DEFAULTS = { q: "", state: "all", kind: "all", by: "any", sort: "newest", unlisted: "1" };
const STATE_KEYS = ["all", "open", "closed", "review", "paid", "void", "saved"];
const SORT_KEYS = ["newest", "pot", "close", "deadline"];
const BY = [["any", "Anyone"], ["team", "Brot team"], ["partner", "Launch partners"], ["wallet", "Other wallets"]];
const ALLOWED = { state: STATE_KEYS, kind: ["all", ...Object.keys(KINDS)], by: BY.map(([k]) => k), sort: SORT_KEYS, unlisted: ["0", "1"] };
const STEP = 12;
const UNLISTED = CAMPAIGNS.filter((c) => !c.listed).length;

// A partner campaign is a team-key opening too (P-3), so "Brot team" includes it.
const OPENED = { any: () => true, team: (c) => c.creatorIsTeam, partner: (c) => !!c.partner, wallet: (c) => !c.creatorIsTeam };
const haystack = (c) =>
  [c.sentence, c.asset, c.kind, KINDS[c.kind].label, c.account, c.accountName ?? "", c.creator, c.id, c.partner?.name ?? ""].join(" ").toLowerCase();

/** The text with each match of `q` marked, escaped piece by piece so a query can never inject markup. */
function mark(text, q) {
  if (!q) return esc(text);
  const [lower, needle] = [text.toLowerCase(), q.toLowerCase()];
  let out = "";
  let i = 0;
  for (let j = lower.indexOf(needle); j !== -1; j = lower.indexOf(needle, i)) {
    out += `${esc(text.slice(i, j))}<mark>${esc(text.slice(j, j + needle.length))}</mark>`;
    i = j + needle.length;
  }
  return out + esc(text.slice(i));
}

/** Where the campaign stands, then its deadline: two moments, never one (BR-06). */
function when(c) {
  const r = result(c);
  const first = {
    open: () => `Entries close ${moment(c.entriesCloseAt)}`,
    closed: () => `Entries closed ${moment(c.entriesCloseAt)}`,
    review: () => `Read: ${r} · pays ${moment(c.reviewEndsAt)}`,
    contested: () => `Read: ${r} · contested, payout paused`,
    paid: () => (c.settleMode === "onesided" ? "One side only · refunded" : `${r} won`),
    void: () => `${voidReason(c)} · refunded`,
  }[phase(c)]();
  return `<span>${first}</span><span class="list-dim">${c.deadlineAt > NOW ? "Deadline" : "Deadline passed"} ${moment(c.deadlineAt)}</span>`;
}

function row(c, q) {
  const ch = chancePair(c);
  const by = c.partner ? `Launch partner · ${esc(c.partner.name)}` : c.creatorIsTeam ? "Brot team" : `<span class="mono" title="${esc(c.creator)}">${short(c.creator)}</span>`;
  const bakers = `${c.bakers} baker${c.bakers === 1 ? "" : "s"}`;
  const note = c.listed ? "" // spec notice 19, or the team's reason when it unlisted the campaign after a report
    : `<span class="list-note">${icon("info", 13)}<span>${esc(c.unlistedNote ?? "Not on the home page: no entries in its first 24 hours.")} It still resolves and pays.</span></span>`;
  return `<li class="list-row">
    <div class="list-main">${kindTile(c, "sm")}<div class="list-text"><a class="list-title" href="#/c/${c.id}">${mark(c.sentence, q)}</a>
      <span class="list-sub"><span>${kindLabel(c)} · ${mark(c.asset, q)}</span>${seal(c)}<span class="list-extra">${bakers} · opened by ${by}</span></span>${note}</div></div>
    <div class="list-state">${stateChip(c)}</div>
    <div class="list-chance">${ch ? `<b class="y">YES ${ch.yes}</b><b class="n">NO ${ch.no}</b>` : `<span class="list-dim">No entries yet</span>`}</div>
    <div class="list-pot"><span class="list-label">Pot </span>${sol(pot(c).total)}</div>
    <div class="list-when">${when(c)}</div>
    <div class="list-bakers">${c.bakers}<span class="sr-only"> bakers</span></div>
    <div class="list-by"><span class="sr-only">Opened by </span>${by}</div></li>`;
}

const COLS = `<div class="list-cols" aria-hidden="true"><span>Campaign</span><span>State</span><span>YES / NO</span><span>Pot</span><span>Entries close · deadline</span><span class="x">Bakers</span><span class="x">Opened by</span></div>`;
const table = (rows, tag = "ol") => `<div class="list-table">${COLS}<${tag} class="list-rows" role="list">${rows}</${tag}></div>`;

/** The campaigns the view lets through, and how many unlisted ones the switch hides. */
function pick(view) {
  const q = view.q.trim().toLowerCase();
  const base = CAMPAIGNS.filter(FILTERS[view.state][1])
    .filter((c) => view.kind === "all" || c.kind === view.kind)
    .filter(OPENED[view.by])
    .filter((c) => !q || haystack(c).includes(q));
  const list = (view.unlisted === "1" ? base.slice() : base.filter((c) => c.listed)).sort(SORTS[view.sort][1]);
  return { list, hidden: base.length - list.length };
}

function results(view, m, shown) {
  if (m === "loading") return { count: "Loading campaigns…", html: table(skelRow().repeat(8), "div") };
  if (m === "error") return { count: "", html: errorBlock() };
  const { list, hidden } = pick(view);
  const q = view.q.trim();
  const count = `${countText(list.length)}${q ? ` ${list.length === 1 ? "matches" : "match"} “${q}”` : ""}${hidden ? ` · ${hidden} unlisted hidden` : ""}`;
  if (!list.length && hidden) {
    const text = `Only unlisted campaigns match${q ? ` “${esc(q)}”` : " these filters"}.`;
    return { count, html: emptyBlock(text, `<button type="button" class="btn" data-unhide>Show unlisted</button>`) };
  }
  if (!list.length) {
    const text = q ? `No campaign matches “${esc(q)}”. Try an asset (SOL), a kind (burn) or part of an address.` : "No campaigns match these filters.";
    return { count, html: emptyBlock(text, `<button type="button" class="btn" data-clear>Clear ${q ? "search and filters" : "filters"}</button>`) };
  }
  const left = list.length - shown;
  const more = left > 0 ? `<div class="list-more"><button type="button" class="btn" data-more>Load ${Math.min(STEP, left)} more</button></div>` : "";
  return { count, html: table(list.slice(0, shown).map((c) => row(c, q)).join("")) + more };
}

export default () => {
  const m = mode();
  const view = readView(DEFAULTS, ALLOWED);
  let shown = STEP;
  const r = results(view, m, shown);
  const sorts = SORT_KEYS.map((k) => [k, SORTS[k][0]]);
  return {
    title: "All campaigns",
    html: `<div class="list-head"><div><h1 class="t-title">All campaigns</h1>
        <p>Every campaign, unlisted ones too. An unlisted campaign left the home page; it still resolves and pays.</p></div>
        <p class="list-count" data-count aria-live="polite">${esc(r.count)}</p></div>
      <div class="list-tools" data-toolbar>
        <div class="list-line"><label class="list-search">${icon("search", 16)}<span class="sr-only">Search campaigns</span>
          <input type="search" data-q value="${esc(view.q)}" placeholder="SOL, burn, an address, a creator…" autocomplete="off" spellcheck="false" /></label>
          ${select("by", "Opened by", BY, view.by)}${select("sort", "Sort", sorts, view.sort)}</div>
        <div class="home-bar-row">${stateChips(STATE_KEYS, view.state)}
          <button type="button" class="list-toggle" data-unlisted aria-pressed="${view.unlisted === "1"}">Show unlisted <span class="home-n">${UNLISTED}</span></button></div>
        <div class="home-bar-row">${kindChips(view.kind)}</div></div>
      <div data-results${m === "loading" ? ' aria-busy="true"' : ""}>${r.html}</div>`,
    mount(main) {
      const bar = main.querySelector("[data-toolbar]");
      const out = main.querySelector("[data-results]");
      const input = main.querySelector("[data-q]");
      const toggle = main.querySelector("[data-unlisted]");
      const paint = (reset = true) => {
        if (reset) shown = STEP;
        writeView(view, DEFAULTS);
        const next = results(view, m, shown);
        out.innerHTML = next.html;
        main.querySelector("[data-count]").textContent = next.count;
      };
      let typing = 0;
      input.addEventListener("input", () => {
        clearTimeout(typing);
        typing = setTimeout(() => ((view.q = input.value), paint()), 150);
      });
      toggle.addEventListener("click", () => {
        view.unlisted = view.unlisted === "1" ? "0" : "1";
        toggle.setAttribute("aria-pressed", String(view.unlisted === "1"));
        paint();
      });
      wireToolbar(bar, view, paint);
      wireRetry(main);
      out.addEventListener("click", (e) => {
        if (e.target.closest("[data-more]")) {
          const before = shown;
          shown += STEP;
          paint(false);
          out.querySelectorAll(".list-title")[before]?.focus(); // the first row that just arrived
        } else if (e.target.closest("[data-unhide]")) {
          toggle.click();
          toggle.focus();
        } else if (e.target.closest("[data-clear]")) {
          Object.assign(view, DEFAULTS);
          input.value = "";
          toggle.setAttribute("aria-pressed", "true");
          syncToolbar(bar, view);
          paint();
          input.focus();
        }
      });
      return () => clearTimeout(typing);
    },
  };
};
