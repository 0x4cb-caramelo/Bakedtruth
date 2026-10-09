/**
 * Purpose: the creation box at /abrir and /open (spec 3.12; TP §3.6; proposal §2.9, flow F0), where any wallet opens an
 *          On-Chain Campaign: 1 What and 2 Details build the sentence from typed slots, 3 Preview (sticky on desktop)
 *          shows what the transaction carries, 4 Cost prices it at Pyth SOL/USD; the blocking states, the phone's
 *          price bar and the signing flow. A country block replaces the box (K-11).
 *          Review switches after the route: ?kind=price|burn|lock|pool|stake; a prefill, ?t= or ?template= with feed,
 *          target, dir, days, epoch, account, usd (a link never signs); ?team=1; ?acct=named|unnamed|owner|layout|rule|
 *          missing|error|checking; ?feedstate=stale|wide|zero|unverified; ?q=; ?open=summary|signing|pending|confirmed|
 *          failed|checking|retried|notfound, with ?why=moved|rejected|network|stale|paused|valve|price|malformed;
 *          ?refusals=1 lists every message.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { DAY, NOW } from "../format.js";
import { currentPath } from "../router.js";
import { state, walletBalance } from "../state.js";
import { closeDialog } from "../ui/layer.js";
import { notice, TEXT } from "../ui/notices.js";
import { KINDS } from "../ui/parts.js";
import { connectDialog } from "../ui/wallet.js";
import { bar, body, cost, costDerived, go, preview, refusals } from "./open-preview.js";
import { check, flow } from "./open-signing.js";
import { derived, details, what } from "./open-slots.js";
import * as T from "./open-templates.js";

const AID = { named: 0, unnamed: 1, owner: 2, layout: 3, rule: 4, error: 0, checking: 0 };
const TYPED = new Set(["q", "target", "usd", "account", "epoch", "when"]);
const ui = { combo: false };
let memo = { hash: null };

function setKind(d, kind, feed) {
  Object.assign(d, { kind, account: "", res: null, epoch: null, epochAuto: true, feed: kind === "price" ? feed || d.feed || T.freshFeed() : d.feed });
  d.target = kind === "price" ? T.suggest(d, T.reading(d)) : null;
  if (T.TEMPLATES[kind].epoch) d.epoch = T.epochBefore(d.deadline);
}
/** The review aid: the example account of one picker state. */
function aid(d, s) {
  const list = T.ACCOUNTS[d.kind];
  d.account = s === "missing" ? "DemoNoAcct8Pq3Rs6Tu9Vw2Xy5Za8Bc1De4Fg" : (list[AID[s]] ?? list[0]).address;
  d.res = s === "checking" ? null : s === "error" ? { check: "error" } : T.lookup(d.kind, d.account);
  if (d.res?.check === "ok" && d.target == null) d.target = T.suggest(d, T.reading(d));
}
function fromHash() {
  const p = new URLSearchParams(location.hash.split("?")[1] ?? "");
  const byT = Object.keys(T.TEMPLATES).find((k) => T.TEMPLATES[k].id === (p.get("t") ?? p.get("template")));
  const usd = Math.round(Number(p.get("usd")) || 500);
  const d = { dir: p.get("dir") === "below" ? "below" : "above", deadline: NOW + (Number(p.get("days")) || 23) * DAY, q: p.get("q") ?? "",
    usd, pick: [500, 1000, 1500].includes(usd) ? usd : "custom", prize: p.get("team") === "1" && p.has("usd") };
  T.force.state = p.get("feedstate");
  setKind(d, byT ?? (KINDS[p.get("kind")] ? p.get("kind") : "price"), T.feed((p.get("feed") ?? "").toUpperCase())?.name);
  T.force.feed = d.feed;
  const acct = p.get("acct") ?? (p.has("open") && d.kind !== "price" ? "named" : null);
  if (d.kind !== "price" && acct) aid(d, acct);
  if (d.kind !== "price" && p.has("account")) Object.assign(d, { account: p.get("account").trim(), res: null });
  if (p.has("target")) d.target = Number(p.get("target")) || null;
  if (p.has("epoch")) Object.assign(d, { epoch: Number(p.get("epoch")) || null, epochAuto: false });
  const view = { team: p.get("team") === "1", refusals: p.get("refusals") === "1", open: p.get("open"), why: p.get("why") ?? "moved",
    prefill: ["t", "template", "feed", "target", "dir", "days", "epoch", "account", "usd"].some((k) => p.has(k)), hold: acct === "checking" };
  return { hash: location.hash, d, view, shown: false, t: 0 };
}

const ctx = () => ({ team: memo.view.team, wallet: state.wallet, balance: walletBalance(), paused: state.paused, stale: state.stalePrice,
  valve: state.valveFull, geo: state.geoBlocked });

function html() {
  const { d, view } = memo;
  const c = ctx();
  const issues = check(d, c);
  const head = `<header class="op-head"><p class="t-kicker">${view.team ? "Team key" : "Any wallet, inside the rules"}</p><h1 class="t-title">Open a campaign</h1>
    <p class="op-lede">${view.team ? "Team key: free, with no prize unless you add one, and no creator share." : "US$500 in SOL. 90% becomes the prize in your campaign's pot."}
      You fill the slots and the site writes the sentence; the program checks every rule again when you sign.</p></header>`;
  if (c.geo)
    return `<div class="op">${head}<div class="panel op-geo"><img src="img/baked-tired.webp" alt="" width="150" height="95"><div><h2 class="t-section">Not available here</h2>
      <p>Opening a campaign isn't available from your location. You can still follow every campaign and its proof, and any payout still reaches your wallet.</p><a class="btn" href="#/">See the campaigns</a></div></div></div>`;
  const notices = [view.prefill && notice("info", "<b>Filled from a link.</b> Check every field: a link never signs anything."),
    c.valve && notice("warn", TEXT.valve), c.stale && notice("warn", `${TEXT.stale} Team keys can still open.`)];
  return `<div class="op">${head}${notices.filter(Boolean).join("")}
    <div class="op-grid">${what(d, ui, issues)}${details(d, issues)}${preview(d, issues, c)}${cost(d, issues, c)}</div>
    ${view.refusals ? refusals() : ""}<div class="op-bar" data-op="bar">${bar(d, issues, c)}</div></div>`;
}

/** Full: rebuild the builder's sections and give focus back. Partial: only what a keystroke changes. */
function paint(main, full) {
  const { d } = memo;
  const c = ctx();
  const issues = check(d, c);
  if (full) {
    const a = document.activeElement;
    let sel = null;
    try { sel = [a.selectionStart, a.selectionEnd]; } catch {} // number inputs have no selection
    const parts = { ".op-what": () => what(d, ui, issues), ".op-details": () => details(d, issues), ".op-cost": () => cost(d, issues, c) };
    for (const [s, fn] of Object.entries(parts)) main.querySelector(s).outerHTML = fn();
    const el = a?.id && document.getElementById(a.id);
    if (el && el !== document.activeElement) {
      el.focus({ preventScroll: true });
      try { if (sel?.[0] != null) el.setSelectionRange(...sel); } catch {}
    }
  } else {
    const parts = { ...derived(d, issues, ui), ...costDerived(d, issues, c) };
    for (const el of main.querySelectorAll("[data-derived]")) {
      const h = parts[el.dataset.derived];
      if (h != null && el.__h !== h) (el.innerHTML = h), (el.__h = h);
    }
    const q = main.querySelector("#op-q");
    q?.setAttribute("aria-expanded", String(!!(ui.combo || d.q)));
    if (!main.querySelector(".op-o[aria-selected=true]")) q?.removeAttribute("aria-activedescendant");
  }
  main.querySelector("[data-op=pv]").innerHTML = body(d, c);
  main.querySelector("[data-op=go]").innerHTML = go(d, issues, c);
  main.querySelector("[data-op=bar]").innerHTML = bar(d, issues, c);
}

function mount(main) {
  const { d, view } = memo;
  if (ctx().geo) return null;
  const ac = new AbortController();
  const on = (type, fn) => main.addEventListener(type, fn, { signal: ac.signal });
  const redraw = (full) => paint(main, full);
  const recheck = (keepHold = false) => {
    clearTimeout(memo.t);
    d.res = null;
    view.hold = keepHold && view.hold; // the review aid's "checking" holds only until the next real edit
    if (!T.looksLikeAddress(d.account) || view.hold) return;
    memo.t = setTimeout(() => {
      d.res = T.lookup(d.kind, d.account);
      if (d.res.check === "ok" && d.target == null) d.target = T.suggest(d, T.reading(d));
      redraw(true);
    }, 900);
  };
  const pick = (s) => {
    const [kind, feed, account, target] = s.split("|");
    setKind(d, kind, feed);
    if (Number(target) > 0) d.target = Number(target);
    if (account) (d.account = account), recheck();
    document.activeElement?.blur(); // the rebuilt combobox must not take focus back and reopen
    Object.assign(d, { q: "" }), (ui.combo = false), redraw(true);
    main.querySelector(kind === "price" ? "#op-target" : "#op-acct")?.focus();
  };
  const apply = (k, el) => {
    const v = el.value;
    if (k === "kind") setKind(d, v);
    else if (k === "feed") (d.feed = v), (d.target = T.suggest(d, T.reading(d)));
    else if (k === "target") d.target = v === "" ? null : Number(v);
    else if (k === "usd") d.usd = Number(v);
    else if (k === "pick") (d.pick = v === "custom" ? v : Number(v)), v !== "custom" && (d.usd = Number(v));
    else if (k === "prize") d.prize = el.checked;
    else if (k === "account") (d.account = v.trim()), (d.target = null), recheck(); // a new account gets its own suggestion
    else if (k === "epoch") (d.epoch = v === "" ? null : Number(v)), (d.epochAuto = false);
    else if (k === "q") d.q = v;
    else if (k === "when") {
      const [day, time] = ["#op-date", "#op-time"].map((s) => main.querySelector(s).value);
      d.deadline = day && time ? new Date(`${day}T${time}`).getTime() : NaN;
      if (d.epochAuto && T.TEMPLATES[d.kind].epoch && Number.isFinite(d.deadline)) d.epoch = T.epochBefore(d.deadline);
    }
  };
  on("input", (e) => TYPED.has(e.target.dataset.set) && (apply(e.target.dataset.set, e.target), redraw(false)));
  on("change", (e) => e.target.dataset.set && !TYPED.has(e.target.dataset.set) && (apply(e.target.dataset.set, e.target), redraw(true)));
  on("click", (e) => {
    const t = e.target.closest("[data-set=dir], [data-days], [data-acct], [data-aid], [data-recheck], [data-go], .op-o");
    if (!t) return;
    if (t.matches(".op-o")) return pick(t.dataset.pick);
    if (t.dataset.go) return t.dataset.go === "connect" ? connectDialog() : flow("summary", d, ctx());
    if (t.dataset.set === "dir") (d.dir = t.dataset.val), (d.target = T.suggest(d, T.reading(d)));
    else if (t.dataset.days) {
      d.deadline = NOW + Number(t.dataset.days) * DAY;
      if (d.epochAuto && T.TEMPLATES[d.kind].epoch) d.epoch = T.epochBefore(d.deadline);
    } else if (t.dataset.acct) (d.account = t.dataset.acct), (d.target = null), recheck();
    else if (t.dataset.aid) clearTimeout(memo.t), (view.hold = t.dataset.aid === "checking"), aid(d, t.dataset.aid);
    else recheck(); // "Check again" after a relay error
    redraw(true);
  });
  on("mousedown", (e) => e.target.closest(".op-o") && e.preventDefault());
  on("focusin", (e) => e.target.id === "op-q" && !ui.combo && ((ui.combo = true), redraw(false)));
  on("focusout", (e) => e.target.id === "op-q" && setTimeout(() => document.activeElement?.id !== "op-q" && ui.combo && ((ui.combo = false), redraw(false)), 150));
  on("keydown", (e) => {
    if (e.target.id !== "op-q") return;
    if (e.key === "Escape") return (ui.combo = false), redraw(false);
    const opts = [...main.querySelectorAll(".op-o")];
    if (!opts.length || !["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) return;
    e.preventDefault();
    let i = opts.findIndex((o) => o.getAttribute("aria-selected") === "true");
    if (e.key === "Enter") return i >= 0 && pick(opts[i].dataset.pick);
    i = (i + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length;
    opts.forEach((o, j) => o.setAttribute("aria-selected", String(j === i)));
    e.target.setAttribute("aria-activedescendant", opts[i].id);
    opts[i].scrollIntoView({ block: "nearest" });
  });
  if (view.open && !memo.shown) (memo.shown = true), setTimeout(() => flow(view.open, d, ctx(), { auto: false, why: view.why })); // after the router focuses the h1
  if (d.account && !d.res) recheck(true);
  return () => {
    ac.abort();
    clearTimeout(memo.t);
    if (!["/abrir", "/open"].includes(currentPath())) closeDialog();
  };
}

export default () => {
  if (memo.hash !== location.hash) memo = fromHash();
  return { title: "Open a campaign", html: html(), mount };
};
