/**
 * Purpose: "My entries" (#/entries): a connect prompt with no wallet, a skeleton while it connects, then the summary
 *          (in open campaigns, waiting for a result, received in the last 30 days), the reserved credit when there is
 *          one, and four tabs: Open, Waiting, Done and Opened by me. Switches for review: `?empty=1` (a wallet with no
 *          entries), `?error=1` (the load failed), `?pending=1` (the indexer is catching up); `#/entries?tab=done`.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Spec 3.8; BR-05, BR-10, BR-11, BR-13; Sprint 12.
 */
import { RECEIPTS } from "../data/index.js";
import { DAY, NOW, sol } from "../format.js";
import { state } from "../state.js";
import { icon } from "../ui/icons.js";
import { notice } from "../ui/notices.js";
import { empty } from "../ui/parts.js";
import { connectDialog } from "../ui/wallet.js";
import { opened, openedRow, receivedNow, reservedCard, reservedNow, wireCreator } from "./me-creator.js";
import { entryRow, joined, tabOf } from "./me-rows.js";

const TABS = [["open", "Open"], ["waiting", "Waiting"], ["done", "Done"], ["opened", "Opened by me"]];
const NONE = {
  open: "No entries in open campaigns.",
  waiting: "Nothing is waiting for a result.",
  done: "Nothing paid or voided yet.",
  opened: "This wallet hasn't opened a campaign.",
};
const flag = (name) => new URLSearchParams(location.search).get(name) === "1";
const hashTab = () => new URLSearchParams(location.hash.split("?")[1] ?? "").get("tab");
const count = (n) => `${n} ${n === 1 ? "entry" : "entries"}`;
const lamportsIn = (list) => list.reduce((s, { e }) => s + e.yes + e.no, 0);

const head = `<div class="page-head"><div><p class="t-kicker">Your wallet · devnet</p><h1 class="t-title">My entries</h1></div></div>`;

const connect = () => `${head}
  <section class="panel pg-connect" data-perch="connect" data-perch-x="0.8" data-perch-pose="impatient" data-perch-say="Connect. I'll wait.">
    <img src="img/baked-impatient.webp" alt="" width="176" height="112">
    <div class="stack"><h2>Connect a wallet to see its entries.</h2>
      <p class="muted">Every entry, where its campaign stands, and what came back: payouts, refunds and the creator's 1%. There's nothing to sign up for: entries are read from the chain by the wallet's address.</p>
      <div class="cluster"><button class="cta" data-connect><span>${icon(state.android ? "phone" : "wallet", 16)}${state.android ? "Use Installed Wallet" : "Connect wallet"}</span></button>
        <a class="btn quiet" href="#/how">How it works</a></div></div></section>`;

const loading = () => `${head}<div class="pg" aria-busy="true"><p class="sr-only" role="status">Loading this wallet's entries…</p>
  <div class="pg-sk-grid">${'<div class="skel pg-sk"></div>'.repeat(3)}</div><div class="stack">${'<div class="skel pg-sk row"></div>'.repeat(4)}</div></div>`;

const failed = () => `${head}<div class="panel pg-msg" role="alert">${icon("alert", 20)}<div><b>Couldn't load your entries.</b>
  <p>Your SOL is on-chain and unaffected: nothing on this page can move it.</p></div><button class="btn" data-retry>${icon("refresh")}Try again</button></div>`;

const stat = (label, value, sub) => `<div class="pg-stat"><small>${label}</small><b class="num">${value}</b><span>${sub}</span></div>`;

/** The wallet's notices: wrong network, no SOL, an entry the indexer has not caught up with. */
const notices = () =>
  [
    state.wallet === "wrongnet" && notice("info", "<b>Your wallet is on mainnet.</b> These are its devnet entries. Switch it to Devnet to join or open a campaign."),
    state.wallet === "nosol" && notice("info", "<b>This wallet has no SOL.</b> Its entries and payouts still show here. Test SOL is free from a devnet faucet."),
    flag("pending") && notice("info", `<b>Your last entry may take a minute to appear.</b> Pending: <span class="mono">5xKp…9dNe</span>, confirming.`),
  ].filter(Boolean).join("");

function view() {
  const rows = joined();
  const lists = { open: [], waiting: [], done: [] };
  for (const x of rows) lists[tabOf(x.c)].push(x);
  const mine = opened();
  const recent = (ts) => ts >= NOW - 30 * DAY;
  const asBaker = lists.done.filter(({ e }) => recent(e.receivedAt)).reduce((s, { e }) => s + e.received, 0);
  const asCreator = RECEIPTS.filter((r) => r.amount > 0 && recent(r.at)).reduce((s, r) => s + r.amount, 0) + receivedNow();
  const sizes = { ...Object.fromEntries(Object.entries(lists).map(([k, l]) => [k, l.length])), opened: mine.length };
  const tab = TABS.some(([k]) => k === hashTab()) ? hashTab() : "open";
  const panel = ([key]) => {
    const items = key === "opened" ? mine.map(openedRow) : lists[key].map(entryRow);
    return `<section class="pg-panel" id="pg-p-${key}" role="tabpanel" aria-labelledby="pg-t-${key}" tabindex="0"${key === tab ? "" : " hidden"}>
      ${items.length ? `<ul class="pg-entries" role="list">${items.join("")}</ul>` : `<p class="pg-none">${NONE[key]}</p>`}</section>`;
  };
  return `${head}<div class="pg">${notices()}
    <div class="pg-stats" data-perch="stats" data-perch-x="0.94" data-perch-size="0.8" data-perch-say="Counted to the lamport.">
      ${stat("In open campaigns", sol(lamportsIn(lists.open)), `${count(lists.open.length)} · the estimates move until entries close`)}
      ${stat("Waiting for a result", sol(lamportsIn(lists.waiting)), `${count(lists.waiting.length)} · closed or in review`)}
      ${stat("Received in the last 30 days", sol(asBaker + asCreator, { round: "down" }), `${sol(asBaker, { round: "down" })} as a baker · ${sol(asCreator, { round: "down" })} as creator · plus rent returned`)}
    </div>
    ${reservedNow().map(reservedCard).join("")}
    <div class="pg-tabs" role="tablist" aria-label="Entries by state">${TABS.map(([k, t]) => `<button role="tab" id="pg-t-${k}" data-tab="${k}"
      aria-controls="pg-p-${k}" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}">${t}<span>${sizes[k]}</span></button>`).join("")}</div>
    ${TABS.map(panel).join("")}</div>`;
}

/** Arrow keys, Home and End move between tabs; the choice goes in the address without a redraw. */
function wireTabs(main) {
  const tabs = [...main.querySelectorAll('[role="tab"]')];
  const pick = (t, focus) => {
    for (const x of tabs) {
      const on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      main.querySelector(`#${x.getAttribute("aria-controls")}`).hidden = !on;
    }
    if (focus) t.focus();
    history.replaceState(null, "", `#/entries?tab=${t.dataset.tab}`);
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => pick(t));
    t.addEventListener("keydown", (ev) => {
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[ev.key];
      if (to === undefined) return;
      ev.preventDefault();
      pick(tabs[(to + tabs.length) % tabs.length], true);
    });
  });
}

export default () => {
  const on = ["on", "nosol", "wrongnet"].includes(state.wallet);
  const html = state.wallet === "connecting" ? loading() : !on ? connect() : flag("error") ? failed()
    : flag("empty") ? `${head}<div class="pg">${empty("No entries yet. Campaigns are on the home page.", `<a class="cta" href="#/"><span>See the campaigns</span></a>`)}</div>` : view();
  return {
    title: "My entries",
    html,
    mount(main) {
      main.querySelector("[data-connect]")?.addEventListener("click", connectDialog);
      main.querySelector("[data-retry]")?.addEventListener("click", () => {
        const u = new URL(location.href);
        u.searchParams.delete("error");
        location.href = u.href;
      });
      wireTabs(main);
      wireCreator(main);
    },
  };
};
