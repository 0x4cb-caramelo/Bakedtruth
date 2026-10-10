/**
 * Purpose: the fee page (#/fees): what Brot keeps and what the creator gets; TP worked example A in SOL (a paid
 *          campaign, YES wins), every lamport through the program's math; the one-sided pot (example C); the void
 *          and where its opening fee goes (example D); the opening at the Pyth price; the refund policy; rent and
 *          network fees.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Spec 3.10; BR-09, BR-32; TP §3.4.16. Sprint 13 builds it.
 */
import { SOL_USD } from "../data/index.js";
import { LAMPORTS, sol, value } from "../format.js";
import { estimate, opening, payoutOf, settleSplit } from "../model.js";
import { voidReason } from "../ui/card.js";
import { icon } from "../ui/icons.js";
import { splitBar } from "../ui/parts.js";

const S = (x) => x * LAMPORTS;
/** Pyth SOL/USD in TP worked example A: US$109.27, exponent −8. */
const REF = 10_927_000_000;
const A = opening(500, REF);
const [V, P] = [S(6), S(4)];
const X = settleSplit({ V, P, R: A.prize });
const pay = (x, s = X) => Number(payoutOf(x, s.distributable, V));
const perOne = (s) => `${sol(pay(S(1), s), { unit: false })} per 1`;
const NOW_PRICE = SOL_USD.price * 10 ** SOL_USD.expo;
const TODAY = opening(500, SOL_USD.price, SOL_USD.expo);
const ONE_SIDED = { poolYes: S(6), poolNo: 0, oneSidedFeeBps: 100 };
const HOUSE = ["missed-window", "team-house"];

const rows = (list) =>
  `<dl class="rows">${list.map(([k, v, cls = ""]) => `<div${cls ? ` class="${cls}"` : ""}><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
const list = (items) => `<ul class="pg-list">${items.map(([ic, t]) => `<li>${icon(ic)}<span>${t}</span></li>`).join("")}</ul>`;
const box = (title, ic, body) => `<section class="panel"><h2 class="panel-head">${icon(ic)}${title}</h2>${body}</section>`;

const KEEPS = [
  ["scale", "<b>10% of the losing side</b> when YES or NO wins. The pot fee comes only from the losing side."],
  ["vault", "<b>The opening fee:</b> 10% of the US$500 a paid opening costs."],
  ["refresh", "<b>1% of each entry in a one-sided pot</b>, except the first wallet's."],
  ["x", "<b>Nothing from entries on a void.</b> The opening fee follows the cause (below)."],
];
const CREATOR = [
  ["check", "<b>1% of the entries</b>, from the pot, when YES or NO wins with entries on both sides."],
  ["shield", "From Brot's fee instead, only when the winners would otherwise get back less than they put in."],
  ["x", "Nothing on team and partner campaigns, one-sided pots or voids, and never on the prize."],
];

const example = `<section class="pg-sec" aria-labelledby="pg-ex">
  <h2 class="t-section" id="pg-ex">Worked example: YES wins</h2>
  <p>A paid campaign, opened for US$500 at ${value(REF / 1e8, "$")} per SOL. Ana puts 4 SOL on YES, Bruno 2 SOL on YES and Carla 4 SOL on NO. YES wins.</p>
  <div class="panel pg-example" data-perch="example" data-perch-x="0.9" data-perch-size="0.8" data-perch-pose="point" data-perch-say="Checked to the lamport.">
    ${splitBar({ poolYes: V, poolNo: P, prize: A.prize })}
    <div class="pg-two">
      <div><h3 class="t-h3">The pot</h3>${rows([
        ["Entries on YES: Ana 4, Bruno 2", sol(V)],
        ["Entries on NO: Carla 4", sol(P)],
        [`Prize: 90% of the ${sol(A.paid)} opening`, sol(A.prize)],
        ["Brot's fee: 10% of NO", `−${sol(Number(X.fee))}`],
        ["Creator: 1% of the 10 SOL entered", `−${sol(Number(X.creator))}`],
        ["The winners split", sol(Number(X.distributable)), "total"],
      ])}</div>
      <div><h3 class="t-h3">Who gets what</h3>${rows([
        ["Ana, 4 SOL on YES", `<b class="pg-win">${sol(pay(S(4)), { round: "down" })}</b>`],
        ["Bruno, 2 SOL on YES", `<b class="pg-win">${sol(pay(S(2)), { round: "down" })}</b>`],
        ["Carla, 4 SOL on NO", sol(0)],
        ["The creator", sol(Number(X.creator))],
        [`Brot: the fee plus the ${sol(A.fee)} opening fee`, sol(Number(X.brot) + A.fee)],
      ])}</div></div>
    <p class="pg-note">YES paid ${perOne(X)}. Without the prize it would have paid ${perOne(settleSplit({ V, P, R: 0 }))}; on a partner campaign, with no prize and no creator share, ${perOne(settleSplit({ V, P, R: 0, shareBps: 0 }))}. The sums close to the lamport: the 1 lamport of rounding goes to Brot's fee account at close.</p>
  </div></section>`;

const oneSided = box("One side only", "refresh", `<p class="pg-note">Ana enters first with 1 SOL, then Bruno with 2 SOL and Carla with 3 SOL, all on YES. NO stays empty, so nobody lost, and every entry comes back.</p>
  ${rows([["Ana", "first", 1], ["Bruno", "", 2], ["Carla", "", 3]].map(([who, first, x]) => {
    const e = estimate(ONE_SIDED, "yes", S(x), { first: !!first });
    return [`${who}, ${x} SOL${first ? ", first" : ""}`, `${sol(e.back)} back · ${e.fee ? `${sol(e.fee)} fee` : "no fee"}`];
  }))}
  <p class="pg-note">Brot keeps 0.05 SOL and the opening fee. The prize goes back to whoever opened. The creator gets nothing.</p>`);

const voided = box("Voided", "x", `<p class="pg-note">When a campaign can't be decided, every entry comes back in full, with no fee, and the prize goes back to whoever opened. The opening fee, ${sol(A.fee)} in the example, follows the cause:</p>
  ${rows(["missed-window", "team-house", "unreadable", "stale-feed", "team-outside"].map((k) => [voidReason({ voidReason: k }), HOUSE.includes(k) ? "Refunded: our failure" : "Kept: outside cause"]))}
  <p class="pg-note">A campaign that ends with no entries at all: the prize goes back and Brot keeps the opening fee, as in a one-sided pot.</p>`);

const openingBox = `<section class="pg-sec" aria-labelledby="pg-open">
  <h2 class="t-section" id="pg-open">Opening a campaign</h2>
  <p>Any wallet pays US$500 in SOL, at the Pyth SOL/USD price the transaction reads: at ${value(NOW_PRICE, "$")} that is ${sol(TODAY.paid, { round: "up" })}. 90% becomes the prize, in the pot on no side; 10% is Brot's opening fee, held until the outcome. Paying more makes a bigger prize at the same split. The team and launch partners open free: no prize, no creator share.</p>
  <div class="pg-tbl pg-open" role="table" aria-label="Opening amounts">
    <div class="pg-tr pg-th" role="row"><span role="columnheader">Paid</span><span role="columnheader">In SOL at ${value(REF / 1e8, "$")}</span><span role="columnheader">Prize, 90%</span><span role="columnheader">Brot, 10%</span></div>
    ${[500, 1500, 5000].map((u) => `<div class="pg-tr" role="row"><span role="cell"><b>US$${value(u)}</b></span><span role="cell" data-k="In SOL">${sol(opening(u, REF).paid)}</span>
      <span role="cell" data-k="Prize">US$${value(u * 0.9)}</span><span role="cell" data-k="Brot">US$${value(u * 0.1)}</span></div>`).join("")}</div>
  <p class="pg-note">Only the first row is the rule; the others are larger prizes. Your wallet signs a maximum in SOL: if the price moves past it before the transaction lands, the opening fails and nothing is charged.</p></section>`;

const REFUNDS = [
  ["check", "<b>Voided:</b> every entry back in full, no fee. The prize back to whoever opened."],
  ["check", "<b>One-sided:</b> every entry back less 1%; the first wallet pays nothing. The prize back to whoever opened."],
  ["info", "<b>The opening fee</b> comes back only when Brot's service caused the void."],
  ["lock", "<b>No early exit, and no other refunds.</b> Nobody can move or return an entry by hand, the team included."],
];
const COSTS = [
  ["vault", `<b>Opening rent:</b> ${sol(3_901_440, { exact: true })} for the campaign's accounts, returned to whoever opened at close.`],
  ["receipt", `<b>Entry rent:</b> ${sol(1_158_240, { exact: true })} on a wallet's first entry in a campaign, returned with its payout, losers included.`],
  ["clock", "<b>Network fee:</b> ≈ 0.000005 SOL per signature. Brot's service pays it for every payout and refund."],
  ["scale", "<b>No cap:</b> a pot and an entry can be any size, from 0.01 SOL. A large entry lowers its own side's return."],
];

export default () => ({
  title: "Fees",
  html: `<div class="page-head"><div><p class="t-kicker">Fees · in SOL</p><h1 class="t-title">Who keeps what</h1>
    <p class="pg-lead">Brot keeps 10% of the losing side. The creator gets 1% of the entries. The right side splits the rest, prize included: if you're right, you get your entry back plus your share of the rest.</p></div></div>
  <div class="pg">
    <div class="pg-two">${box("What Brot keeps", "vault", list(KEEPS))}${box("What the creator gets", "users", list(CREATOR))}</div>
    ${example}
    <div class="pg-two">${oneSided}${voided}</div>
    ${openingBox}
    <div class="pg-two">${box("Refund policy", "shield", list(REFUNDS))}${box("Rent and network fees", "receipt", list(COSTS))}</div>
  </div>`,
});
