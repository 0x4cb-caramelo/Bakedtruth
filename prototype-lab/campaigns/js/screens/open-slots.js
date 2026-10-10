/**
 * Purpose: sections 1 and 2 of the creation box (spec 3.12). 1 What: the combobox "What should the chain answer?" over
 *          the templates and the known names, grouped by kind, with "We can't check this on-chain" and the nearest
 *          templates outside the grammar; then the five kinds, four of them not open on the program yet. 2 Details:
 *          the sentence as it fills, then typed slots: asset, direction, target and deadline for a price; the account
 *          picker with its nine states, the target and, on the epoch kinds, the epoch.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Every slot is a labelled field, never an inline blank.
 */
import { DAY, esc, NOW, pct, short, usd, utc } from "../format.js";
import { icon } from "../ui/icons.js";
import { KINDS } from "../ui/parts.js";
import { acctMessage, msgs } from "./open-signing.js";
import * as T from "./open-templates.js";

/** The sentence with its slots marked: filled ones underlined, missing ones as dashed gaps (never inline fields). */
export const sentenceHtml = (d) =>
  T.sentence(d).map((p) => (typeof p === "string" ? esc(p) : p.fill ? `<b class="op-fill">${esc(p.fill)}</b>` : `<span class="op-gap">${p.gap}</span>`)).join("");

const tile = (k, size = "") => `<span class="kind-tile ${size} ${KINDS[k].cls}" aria-hidden="true">${KINDS[k].tile}</span>`;

/** One suggestion: a pinned feed, a reviewed name or a bare template, with the sentence it would start. */
function option(it) {
  const k = KINDS[it.kind];
  const f = it.feed && T.feed(it.feed);
  const a = it.account && T.lookup(it.kind, it.account);
  const draft = { kind: it.kind, feed: it.feed, dir: "above", target: Number(it.target) || null, deadline: NaN, res: a };
  const head = f ? `<b>${f.asset}</b> · Pyth ${f.name} · ${k.label}` : a ? `<b>${esc(a.name)}</b> · ${T.TEMPLATES[it.kind].owner} · ${k.label}` : `<b>${k.label}</b>`;
  return `${tile(it.kind, "sm")}<span class="op-o-t"><span>${head}</span><small>${esc(T.plain(T.sentence(draft), () => "…"))}</small></span>`;
}

function list(d, ui) {
  if (!ui.combo && !d.q) return "";
  const r = T.search(d.q);
  let n = 0;
  const groups = Object.keys(KINDS).map((k) => [k, r.items.filter((it) => it.kind === k)]).filter(([, its]) => its.length);
  const out = r.outside ? `<div class="op-out"><img src="img/baked-skeptical.webp" alt="" width="64" height="40"><p><b>We can't check this on-chain.</b> Questions we can check:</p></div>` : "";
  return `${out}<ul class="op-list" id="op-list" role="listbox" aria-label="${r.outside ? "Questions we can check" : "Templates and known names"}">${groups
    .map(([k, its]) => `<li role="presentation"><ul role="group" class="op-grp" aria-labelledby="op-g-${k}">
      <li role="presentation" class="op-grp-h" id="op-g-${k}">${KINDS[k].label}<em>${T.OPENS[T.TEMPLATES[k].open]}</em></li>
      ${its.map((it) => `<li role="option" class="op-o" id="op-o${n++}" aria-selected="false" data-pick="${[it.kind, it.feed ?? "", it.account ?? "", it.target ?? ""].join("|")}">${option(it)}</li>`).join("")}</ul></li>`)
    .join("")}</ul>`;
}
const count = (d, ui) => {
  if (!ui.combo && !d.q) return "";
  const r = T.search(d.q);
  return r.outside ? `We can't check this on-chain. ${r.items.length} questions we can check.` : `${r.items.length} suggestions.`;
};

function kind(d, k) {
  const v = KINDS[k];
  const o = T.TEMPLATES[k].open;
  const on = d.kind === k;
  return `<label class="op-kind${on ? " on" : ""}${o === "now" ? "" : " later"}"><input class="sr-only" type="radio" name="op-kind" id="op-k-${k}" value="${k}" data-set="kind"${on ? " checked" : ""}>
    ${tile(k)}<span class="op-kind-t"><b>${v.label}</b><small>${v.long}</small><em>${T.OPENS[o]}</em></span></label>`;
}

/** Section 1: what the chain should answer. */
export const what = (d, ui, issues) => `<section class="panel op-sec op-what" aria-labelledby="op-s1">
  <h2 class="op-h" id="op-s1"><span class="op-n" aria-hidden="true">1</span>What</h2>
  <div class="op-combo"><label class="op-label" for="op-q">What should the chain answer?</label>
    <div class="op-qbox">${icon("search", 16)}<input id="op-q" class="input" type="text" role="combobox" aria-autocomplete="list" aria-controls="op-list"
      aria-expanded="${!!(ui.combo || d.q)}" aria-describedby="op-q-help" autocomplete="off" spellcheck="false" placeholder="Try: SOL 300, burn, stake pool" value="${esc(d.q)}" data-set="q">
      <div class="op-drop" data-derived="list">${list(d, ui)}</div></div>
    <p class="help" id="op-q-help">A search over the templates and known names. What you type is never sent or stored.</p>
    <p class="sr-only" aria-live="polite" data-derived="count">${count(d, ui)}</p></div>
  <fieldset class="op-kinds"><legend class="op-label">Or pick a kind</legend>${Object.keys(KINDS).map((k) => kind(d, k)).join("")}</fieldset>
  <div data-derived="kind">${msgs(issues, "kind")}</div></section>`;

const price = (d, issues) => `<fieldset class="op-field"><legend class="op-label">Asset · the pinned Pyth feeds</legend>
  <div class="op-feeds">${T.FEEDS.map((f, i) => {
    const p = T.feedProblem(f);
    const on = d.feed === f.name;
    return `<label class="op-feed${on ? " on" : ""}"><input class="sr-only" type="radio" name="op-feed" id="op-f${i}" value="${f.name}" data-set="feed"${on ? " checked" : ""}>
      <span class="op-feed-n"><b>${f.asset}</b><small>Pyth ${f.name}</small></span><span class="num">${usd(f.price, 2)}</span><em class="${p ? "bad" : ""}">${p ? p.tag : `Fresh · ${T.age(f.at)}`}</em></label>`;
  }).join("")}</div>
  <p class="help">Only the feeds Pyth keeps fresh on devnet, for now.</p><div data-derived="feed">${msgs(issues, "feed")}</div></fieldset>
  <div class="op-field"><span class="op-label" id="op-dir-l">Direction</span><div class="seg op-seg" role="group" aria-labelledby="op-dir-l">${[["above", "Touches or goes above"], ["below", "Touches or goes below"]]
    .map(([v, t]) => `<button type="button" id="op-dir-${v}" data-set="dir" data-val="${v}" aria-pressed="${d.dir === v}">${t}</button>`).join("")}</div></div>`;

const LABEL = { price: "Target (US$)", burn: "Target supply (token units)", lock: "Target liquidity locked for good", pool: "Target (SOL in the pool)", stake: "Target (SOL staked)" };
function targetHelp(d, issues) {
  const r = T.reading(d);
  const down = d.kind === "burn" || (d.kind === "price" && d.dir === "below");
  const v = (x) => (d.kind === "price" ? usd(x, 2) : T.whole(x));
  const line = r ? `Now ${v(r.value)} · must be ${down ? "below" : "above"} it${d.target > 0 ? ` · ${pct(Math.abs(d.target / r.value - 1), 1)} away` : ""}`
    : `The value now shows once the ${d.kind === "price" ? "asset" : "account"} is read.`;
  return `<p class="help">${line}${d.kind === "lock" ? ". Raw DAMM v2 liquidity units: Sprint 03 decides how to show them" : ""}</p>${msgs(issues, "target")}`;
}
function target(d, issues) {
  const p = d.kind === "price";
  const unit = T.unitOf(d);
  return `<div class="op-field"><label class="op-label" for="op-target">${LABEL[d.kind]}</label>
    <div class="op-num${p ? " pre" : ""}">${p ? `<span class="op-pre" aria-hidden="true">$</span>` : ""}<input id="op-target" class="input" type="number" inputmode="decimal" min="0"
      step="${p ? "0.01" : "1"}" value="${d.target ?? ""}" data-set="target" aria-describedby="op-target-help">${!p && unit ? `<span class="op-unit" aria-hidden="true">${esc(unit)}</span>` : ""}</div>
    <div id="op-target-help" data-derived="target">${targetHelp(d, issues)}</div></div>`;
}

/** The account picker's states (spec 3.12): empty, checking, accepted with or without a reviewed name, refused. */
function acctState(d) {
  const t = T.TEMPLATES[d.kind];
  if (!d.account) return `<p class="help">Any ${t.what.toLowerCase()} the reader accepts. A name shows only when two people reviewed the account.</p>`;
  if (!T.looksLikeAddress(d.account)) return `<p class="help">A Solana address is 32 to 44 letters and digits.</p>`;
  if (!d.res) return `<div class="op-acct wait"><span class="op-spin" aria-hidden="true"></span><p>Reading the account through Brot's relay…</p></div>`;
  const a = d.res;
  if (a.check !== "ok")
    return `<div class="op-acct bad">${icon(a.check === "error" ? "alert" : "x", 16)}<p>${acctMessage(d.kind, a.check)}${a.check === "error" ? ` <button type="button" class="btn small" data-recheck>Check again</button>` : ""}</p></div>`;
  const head = a.name ? `<b>${esc(a.name)}</b> · ${t.owner} · reviewed name` : `<b class="mono" title="${a.address}">${short(a.address)}</b> · ${t.owner} · no reviewed name`;
  return `<div class="op-acct ok">${icon("check", 16)}<p><span>${head}</span><span class="op-addr">${a.name ? `<span class="mono" title="${a.address}">${short(a.address)}</span>` : ""}
    <a href="${T.explorer(a.address)}" target="_blank" rel="noopener">Explorer${icon("external", 12)}</a></span></p></div>`;
}
const AIDS = [["named", "Reviewed name"], ["unnamed", "No name"], ["owner", "Wrong owner"], ["layout", "Wrong format"], ["rule", "Can still mint"], ["missing", "Not found"], ["error", "Relay error"]];
function picker(d) {
  const t = T.TEMPLATES[d.kind];
  return `<div class="op-field"><label class="op-label" for="op-acct">${t.what}</label>
    <input id="op-acct" class="input mono" type="text" autocomplete="off" spellcheck="false" placeholder="Paste an address or pick a known name" value="${esc(d.account)}" data-set="account" aria-describedby="op-acct-st">
    <div class="op-names"><span class="op-label">Known names</span>${T.ACCOUNTS[d.kind].filter((a) => a.name).map((a) => `<button type="button" class="btn small" id="op-nm-${a.address}" data-acct="${a.address}">${esc(a.name)}</button>`).join("")}</div>
    <div id="op-acct-st" data-derived="acct" aria-live="polite">${acctState(d)}</div>
    <p class="op-aid"><span>Review aid, not on the site:</span>${AIDS.filter(([s]) => s !== "rule" || d.kind === "burn").map(([s, l]) => `<button type="button" id="op-x-${s}" data-aid="${s}">${l}</button>`).join("")}</p></div>`;
}

const epochHelp = (d, issues) =>
  `<p class="help">${d.epoch ? `Starts ≈ ${utc(T.epochStart(d.epoch))} (estimate: devnet epochs last about 28 h). ` : ""}Now: epoch ${T.EPOCH_NOW}. Entries close at its start at the latest.</p>${msgs(issues, "epoch")}`;
const epoch = (d, issues) => `<div class="op-field"><label class="op-label" for="op-epoch">Epoch</label>
  <input id="op-epoch" class="input" type="number" inputmode="numeric" min="${T.EPOCH_NOW + 1}" step="1" value="${d.epoch ?? ""}" data-set="epoch" aria-describedby="op-epoch-help">
  <div id="op-epoch-help" data-derived="epoch">${epochHelp(d, issues)}</div></div>`;

const pad = (n) => String(n).padStart(2, "0");
const localParts = (ts) => {
  const x = new Date(ts);
  return [`${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`, `${pad(x.getHours())}:${pad(x.getMinutes())}`];
};
function when(d, issues) {
  if (!Number.isFinite(d.deadline)) return msgs(issues, "deadline");
  const close = T.closesAt(d);
  const span = d.deadline - NOW;
  const w = span > 0 ? Math.max(0, Math.min(100, ((close - NOW) / span) * 100)) : 0;
  const byEpoch = T.TEMPLATES[d.kind].epoch && d.epoch && T.epochStart(d.epoch) === close;
  return `<p class="op-utc">In UTC: <b>${utc(d.deadline)}</b></p>${span > 0 ? `<div class="op-tl" aria-hidden="true"><span style="width:${w.toFixed(1)}%"></span></div>` : ""}
    <p class="help">Entries close <b>${utc(close)}</b> — ${byEpoch ? "when the epoch starts, earlier than 5% of the time" : "5% of the time before the deadline, at least 24 h and at most 7 days"}.</p>${msgs(issues, "deadline")}`;
}
const deadline = (d, issues) => {
  const [day, time] = Number.isFinite(d.deadline) ? localParts(d.deadline) : ["", ""];
  return `<fieldset class="op-field"><legend class="op-label">Deadline · 3 to 90 days from now</legend>
    <div class="op-days">${[7, 14, 30, 60, 90].map((n) => `<button type="button" class="btn small" id="op-d${n}" data-days="${n}" aria-pressed="${d.deadline - NOW === n * DAY}">${n} days</button>`).join("")}</div>
    <div class="op-dt"><div class="field"><label for="op-date">Date, your time</label><input id="op-date" class="input" type="date" value="${day}" data-set="when"></div>
      <div class="field"><label for="op-time">Time, your time</label><input id="op-time" class="input" type="time" value="${time}" data-set="when"></div></div>
    <div class="op-when" data-derived="deadline">${when(d, issues)}</div></fieldset>`;
};

/** Section 2: the sentence as it fills, then the kind's slots. */
export const details = (d, issues) => `<section class="panel op-sec op-details" aria-labelledby="op-s2">
  <h2 class="op-h" id="op-s2"><span class="op-n" aria-hidden="true">2</span>Details<span class="hint">${KINDS[d.kind].label} · template ${T.TEMPLATES[d.kind].id} v1</span></h2>
  <div class="op-strip"><span class="op-label">Your sentence</span><p aria-live="polite" data-derived="strip">${sentenceHtml(d)}</p></div>
  ${d.kind === "price" ? price(d, issues) : picker(d)}${target(d, issues)}${T.TEMPLATES[d.kind].epoch ? epoch(d, issues) : ""}${deadline(d, issues)}</section>`;

/** What a keystroke changes without rebuilding the fields (the focused input keeps its caret). */
export const derived = (d, issues, ui) => ({
  list: list(d, ui), count: count(d, ui), kind: msgs(issues, "kind"), strip: sentenceHtml(d), feed: msgs(issues, "feed"),
  target: targetHelp(d, issues), acct: acctState(d), epoch: epochHelp(d, issues), deadline: when(d, issues),
});
