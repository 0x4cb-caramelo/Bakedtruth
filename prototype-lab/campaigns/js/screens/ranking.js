/**
 * Purpose: the devnet leaderboard (#/leaderboard): wallets by points (1 per campaign entered on the right side, Q7),
 *          with the campaigns each entered and its hit rate, the connected wallet pinned as "You" and marked, when
 *          the table was computed, and how points work: only right calls score, volume and profit never do, and
 *          points are a devnet game. Switches for review: `?empty=1`, `?error=1`, `?loading=1`.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Spec 3.9; BR-29; TP §3.5 "Points". Sprint 13 builds it.
 */
import { RANKING, RANKING_AT } from "../data/index.js";
import { esc, short, utc, value } from "../format.js";
import { connected, DEMO_WALLET } from "../state.js";
import { icon } from "../ui/icons.js";
import { toast } from "../ui/layer.js";
import { empty, moment } from "../ui/parts.js";
import { connectDialog } from "../ui/wallet.js";

const flag = (name) => new URLSearchParams(location.search).get(name) === "1";
const points = (n) => `${value(n)} ${n === 1 ? "point" : "points"}`;
/** Campaigns entered on the winning side over campaigns entered. */
const rate = (r) => `${Math.round((r.correct / r.entries) * 100)}%`;

/** Highest points first; ties share a rank (1, 2, 2, 4). */
const ranked = () => {
  const list = [...RANKING].sort((a, b) => b.points - a.points);
  return list.map((r) => ({ ...r, rank: list.findIndex((x) => x.points === r.points) + 1, me: r.address === DEMO_WALLET.address }));
};

const row = (r, mine) => `<li class="pg-lb-row${mine ? " me" : ""}"${mine ? ' aria-current="true"' : ""}>
    <span class="pg-lb-rank num${r.rank <= 3 ? " pg-top" : ""}"><span class="sr-only">Rank </span>${r.rank}</span>
    <span class="pg-lb-who"><span class="mono" title="${esc(r.address)}">${short(r.address)}</span>${mine ? '<span class="chip pg-you">You</span>' : ""}
      <button class="pg-copy" type="button" data-copy="${esc(r.address)}" aria-label="Copy address ${short(r.address)}">${icon("copy", 14)}</button></span>
    <span class="pg-lb-pts"><b class="num">${value(r.points)}</b><span class="pg-lbl"> points</span></span>
    <span class="pg-lb-sub"><span class="pg-lb-n"><span class="tabular">${rate(r)}</span><span class="pg-lbl"> hit rate</span></span>
      <span class="pg-lb-n"><span class="tabular">${r.entries}</span><span class="pg-lbl"> entered</span></span></span></li>`;

const head = (when = "") => `<div class="page-head"><div><p class="t-kicker">Devnet points</p><h1 class="t-title">Devnet leaderboard</h1></div>${when}</div>`;

function board(list, mine) {
  if (flag("loading"))
    return `<div class="panel pg-board" aria-busy="true"><p class="sr-only" role="status">Loading the leaderboard…</p>${'<div class="skel pg-sk row"></div>'.repeat(6)}</div>`;
  if (flag("error"))
    return `<div class="panel pg-msg" role="alert">${icon("alert", 20)}<div><b>Couldn't load the leaderboard.</b><p>Your entries are on-chain and unaffected; only this page failed to load.</p></div>
      <button class="btn" data-retry>${icon("refresh")}Try again</button></div>`;
  if (!list.length) return empty("No points yet: they arrive when campaigns resolve.", `<a class="btn" href="#/">See the campaigns</a>`);
  return `<section class="panel pg-board" aria-label="Wallets by points" data-perch="board" data-perch-x="0.9" data-perch-size="0.8" data-perch-pose="skeptical" data-perch-say="Volume buys nothing here.">
    <div class="pg-lb-row pg-lb-head" aria-hidden="true"><span>Rank</span><span>Wallet</span><span>Points</span><span>Hit rate</span><span>Entered</span></div>
    <ol class="pg-lb" role="list">${list.map((r) => row(r, mine && r.me)).join("")}</ol>
    <p class="pg-foot">Top ${list.length} of ${list.length} wallets with points. One point per campaign entered on the side that won; "Entered" counts every campaign joined.</p></section>`;
}

function you(list) {
  if (flag("loading")) return `<div class="skel pg-sk pg-you-card"></div>`;
  if (flag("error")) return "";
  if (!connected())
    return `<div class="pg-you-card"><p>Connect a wallet to see where it stands.</p><button class="btn" data-connect>${icon("wallet")}Connect wallet</button></div>`;
  const me = list.find((r) => r.me);
  if (!me) return `<div class="pg-you-card"><p><b>You: no points yet.</b> They arrive when a campaign you entered resolves on your side.</p></div>`;
  return `<div class="pg-you-card me"><small>You</small><p><b class="num">#${me.rank}</b><span>${points(me.points)}</span></p>
    <span class="t-small">${me.correct} of ${me.entries} on the right side (${rate(me)}) · <span class="mono">${short(me.address)}</span></span></div>`;
}

export default () => {
  const list = flag("empty") ? [] : ranked();
  const when = flag("loading") || flag("error") ? "" : `<p class="pg-when">${icon("clock", 14)}<span>Computed ${moment(RANKING_AT)}<small>${utc(RANKING_AT)}</small></span></p>`;
  return {
    title: "Leaderboard",
    html: `${head(when)}<div class="pg"><div class="pg-split">
      ${you(list)}
      <div class="pg-lb-main">${board(list, connected())}</div>
      <section class="panel pg-about" aria-labelledby="pg-about-h"><h2 class="panel-head" id="pg-about-h">${icon("trophy")}How points work</h2>
        <ul class="pg-list">
          <li>${icon("check")}<span>One point per campaign entered on the side that won. Nothing else scores.</span></li>
          <li>${icon("x")}<span>Volume and profit never score: they would reward wallets that wash SOL between YES and NO.</span></li>
          <li>${icon("info")}<span>Points are a devnet game, not money. What they're worth after the beta isn't decided.</span></li>
        </ul></section></div></div>`,
    mount(main) {
      main.querySelector("[data-connect]")?.addEventListener("click", connectDialog);
      main.querySelector("[data-retry]")?.addEventListener("click", () => {
        const u = new URL(location.href);
        u.searchParams.delete("error");
        location.href = u.href;
      });
      main.querySelectorAll("[data-copy]").forEach((b) =>
        b.addEventListener("click", () =>
          (navigator.clipboard?.writeText(b.dataset.copy) ?? Promise.reject()).then(
            () => toast("Address copied.", { kind: "ok" }),
            () => toast("Couldn't copy here. Select the address instead."),
          ),
        ),
      );
    },
  };
};
