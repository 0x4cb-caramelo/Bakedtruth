/**
 * Purpose: what the home page and the list of all campaigns share: the state and kind filters (the five public states
 *          and Saved, spec 3.2), the sorts, the view kept in the hash's query (#/?state=paid&kind=burn) so a link or a
 *          redraw keeps it, the toolbar's chips and selects, the review switches (?loading=1, ?empty=1, ?error=1) and
 *          the loading, empty and error blocks.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. The view is written with history.replaceState, so a filter
 *          never fires the router's hashchange (no redraw, no scroll, focus stays on the chip).
 */
import { NOW } from "../format.js";
import { chance, joinable, pot } from "../model.js";
import { currentPath } from "../router.js";
import { state } from "../state.js";
import { notice } from "../ui/notices.js";
import { empty, KINDS, kindTile } from "../ui/parts.js";

/** The state a filter sees: an open campaign past its entries close is closed (the real site asks chain time, A-7). */
export const phase = (c) => (c.status === "open" && !joinable(c, NOW) ? "closed" : c.status);

/** State filters (P1 §3.1, spec 3.2). A contested campaign is "In review" (L-04). `all` is the full list's default. */
export const FILTERS = {
  all: ["All", () => true],
  open: ["Open", (c) => phase(c) === "open"],
  closed: ["Closed", (c) => phase(c) === "closed"],
  review: ["In review", (c) => c.status === "review" || c.status === "contested"],
  paid: ["Paid", (c) => c.status === "paid"],
  void: ["Voided", (c) => c.status === "void"],
  saved: ["Saved", (c) => state.saved.has(c.id)],
};

// Moments still ahead come first, soonest first; past ones follow, most recent first.
const ahead = (t) => (t >= NOW ? t - NOW : 1e15 + (NOW - t));
const highlighted = (c) => (c.partner && c.partner.highlightUntil > NOW ? 0 : 1);

/** Sorts. "Ranked" is the indexer's order (TP §3.5): partners in their 72-hour highlight, then rank. */
export const SORTS = {
  ranked: ["Ranked", (a, b) => highlighted(a) - highlighted(b) || (a.rank ?? 99) - (b.rank ?? 99)],
  pot: ["Pot", (a, b) => pot(b).total - pot(a).total],
  close: ["Entries close", (a, b) => ahead(a.entriesCloseAt) - ahead(b.entriesCloseAt)],
  chance: ["YES chance", (a, b) => (chance(b)?.yes ?? -1) - (chance(a)?.yes ?? -1)],
  newest: ["Newest", (a, b) => b.opensAt - a.opensAt],
  deadline: ["Deadline", (a, b) => ahead(a.deadlineAt) - ahead(b.deadlineAt)],
};

/** The query after the hash: "#/campaigns?q=sol" gives q=sol. */
export const hashQuery = () => new URLSearchParams(location.hash.split("?")[1] ?? "");

/** A review switch, from the hash ("#/?loading=1") or from before it ("?loading=1#/"). */
export const flag = (name) => hashQuery().get(name) === "1" || new URLSearchParams(location.search).get(name) === "1";

/** What the screen draws: live data, or one of the states the reviewer asks for. */
export const mode = () => (flag("loading") ? "loading" : flag("error") ? "error" : flag("empty") ? "empty" : "live");

/** The view from the hash; a missing or unknown value falls back to its default. */
export function readView(defaults, allowed) {
  const q = hashQuery();
  const pick = (k, d) => {
    const v = q.get(k);
    return v !== null && (!allowed[k] || allowed[k].includes(v)) ? v : d;
  };
  return Object.fromEntries(Object.entries(defaults).map(([k, d]) => [k, pick(k, d)]));
}

/** Writes the view into the hash without navigating; defaults stay out, so a clean link stays clean. */
export function writeView(view, defaults) {
  const q = hashQuery();
  for (const [k, v] of Object.entries(view)) (v === defaults[k] || v === "" ? q.delete(k) : q.set(k, v));
  const s = q.toString();
  history.replaceState(history.state, "", `#${currentPath()}${s ? `?${s}` : ""}`);
}

/** A row of toggle chips, one pressed. On phones the row scrolls inside itself (spec 5.1). */
const chips = (name, keys, text, current, label, lead = () => "") =>
  `<div class="home-chips" role="group" aria-label="${label}">${keys
    .map((k) => `<button type="button" data-${name}="${k}" aria-pressed="${k === current}">${lead(k)}${text(k)}</button>`)
    .join("")}</div>`;

const savedText = () => (state.saved.size ? `Saved <span class="home-n">${state.saved.size}</span>` : "Saved");
export const stateChips = (keys, current) =>
  chips("state", keys, (k) => (k === "saved" ? savedText() : FILTERS[k][0]), current, "Filter by state");
export const kindChips = (current) =>
  chips("kind", ["all", ...Object.keys(KINDS)], (k) => (k === "all" ? "All kinds" : KINDS[k].label), current, "Filter by kind",
    (k) => (k === "all" ? "" : kindTile({ kind: k }, "xs")));

/** A labelled select of the toolbar: sort, or who opened the campaign. */
export const select = (name, label, options, current) =>
  `<label class="home-select"><span>${label}</span><select class="select" data-${name}>${options
    .map(([v, t]) => `<option value="${v}"${v === current ? " selected" : ""}>${t}</option>`)
    .join("")}</select></label>`;

/** Wires chips and selects under `root` to `view`; `onChange` redraws the results only. */
export function wireToolbar(root, view, onChange) {
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-state], button[data-kind]");
    if (!b) return;
    const key = b.dataset.state !== undefined ? "state" : "kind";
    view[key] = b.dataset[key];
    syncToolbar(root, view);
    onChange();
  });
  root.addEventListener("change", (e) => {
    const s = e.target.closest("select[data-sort], select[data-by]");
    if (!s) return;
    view[s.dataset.sort !== undefined ? "sort" : "by"] = s.value;
    onChange();
  });
}

/** Puts every chip and select under `root` back in line with `view` (after "Clear filters", or a chip click). */
export function syncToolbar(root, view) {
  root.querySelectorAll("button[data-state], button[data-kind]").forEach((b) => {
    const key = b.dataset.state !== undefined ? "state" : "kind";
    b.setAttribute("aria-pressed", String(b.dataset[key] === view[key]));
  });
  root.querySelectorAll("select[data-sort], select[data-by]").forEach((s) => (s.value = view[s.dataset.sort !== undefined ? "sort" : "by"]));
}

/** "6 campaigns", "1 campaign", "No campaigns": plain text for the polite live count. */
export const countText = (n) => `${n || "No"} campaign${n === 1 ? "" : "s"}`;

// Skeleton blocks: shapes only, hidden from screen readers; the count says "Loading campaigns…" instead.
const sk = (cls) => `<span class="skel home-sk ${cls}"></span>`;
export const skelCard = () =>
  `<div class="card home-skel" aria-hidden="true"><div class="home-sk-row">${sk("t")}${sk("w4")}</div>${sk("w9")}${sk("w6")}${sk(
    "box",
  )}<div class="home-sk-row">${sk("big")}${sk("big")}</div>${sk("bar")}<div class="home-sk-row">${sk("btn")}${sk("btn")}</div></div>`;
export const skelRow = () => `<div class="home-skel-row" aria-hidden="true">${sk("s")}<span>${sk("w9")}${sk("w4")}</span>${sk("big")}</div>`;
export const skelSlide = () =>
  `<div class="home-slide home-skel" aria-hidden="true"><div class="home-slide-main"><div class="home-sk-row">${sk("t")}${sk("w4")}</div>${sk(
    "title",
  )}${sk("title w6")}<div class="home-sk-row">${sk("big")}${sk("big")}</div>${sk("bar")}<div class="home-sk-row">${sk("btn")}${sk(
    "btn",
  )}</div></div><div class="home-proof">${sk("w6")}${sk("title")}${sk("w9")}${sk("w9")}</div><div class="home-slide-card">${skelCard()}</div></div>`;

/** Baked sulking, a sentence and one way out (spec 3.2: "No campaigns here." [Clear filters]). */
export const emptyBlock = (text, action = "") => `<div class="home-empty">${empty(text, action)}</div>`;

/** The error a container shows when the list does not load (spec 3.2); Retry drops the review switch. */
export const errorBlock = () =>
  notice("danger", `<b>Couldn't load campaigns.</b> Your SOL is on-chain and unaffected. <button type="button" class="btn small" data-retry>Retry</button>`);

export function wireRetry(root) {
  root.addEventListener("click", (e) => {
    if (!e.target.closest("[data-retry]")) return;
    const q = hashQuery();
    q.delete("error");
    const s = q.toString();
    location.hash = `#${currentPath()}${s ? `?${s}` : ""}`;
  });
}
