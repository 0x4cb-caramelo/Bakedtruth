/**
 * Purpose: how a campaign works (#/how), as a path that reads the same on a phone: the six steps from opening to
 *          payout, what "chance" means, why there is no early exit, what a one-sided pot and a void do, who reads
 *          the result, and the devnet notice. Short sections, with Baked on each.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Spec 3.2 (the six steps) and 3.15; fixes accessibility
 *          problem 4 of DESIGN-DIRECTION.md: the steps had no path under 860 px.
 */
import { byId } from "../data/index.js";
import { icon } from "../ui/icons.js";
import { notice, TEXT } from "../ui/notices.js";
import { chancePair, splitBar } from "../ui/parts.js";

const STEPS = [
  ["Open", "Any wallet opens a campaign for US$500 in SOL: 90% is a prize in the pot, 10% goes to Brot. The site writes the question from the kind, the account, the target and the date."],
  ["Join", "Bakers put SOL on YES or NO, from 0.01 SOL. Chance is each side's share of the entries."],
  ["Entries close", "When 5% of the campaign's time is left (at least 24 hours and at most 7 days before the deadline), or the moment the answer is known."],
  ["The chain is read", "Brot's service has the program read the account. Target met: YES. Deadline passed without it: NO."],
  ["6-hour review", "The team can confirm the result or void it. It can't switch YES and NO. If nobody acts, the result stands."],
  ["Paid", "SOL goes straight to the winning side's wallets, with no claim button. One-sided pots and voided campaigns refund the entries."],
];

const EXAMPLE = byId("8231904417");

const MORE = [
  ["Chance is a share, not a forecast", "eye", "skeptical", "A share. Not a forecast.", () => {
    const ch = chancePair(EXAMPLE);
    return `<p>YES ${ch.yes} means ${ch.yes} of the SOL entered is on YES. Nobody computed a probability. The estimated return you see before joining is net of Brot's 10% of the losing side and the creator's 1%, and it changes with every entry until entries close.</p>
      <div class="pg-how-bar">${splitBar(EXAMPLE)}</div>`;
  }],
  ["No early exit", "lock", "deadpan", "In is in.", () =>
    `<p>An entry stays in the pot until the campaign is paid or voided, after its deadline and a 6-hour review. You can't cancel it or move it to the other side. A pot has no price, so leaving early could only take SOL from everyone else in it.</p>`],
  ["One side only", "refresh", "sulking", "Nobody showed up.", () =>
    `<p>If nobody joins the other side, nobody lost. Every entry comes back: the first wallet's in full, the others less 1%. The prize goes back to whoever opened.</p>`],
  ["Voided", "x", "tired", "Everyone gets it back.", () =>
    `<p>When a campaign can't be decided (its account can no longer be read, the reading was missed, or the review found the reading wrong), every entry comes back in full, with no fee.</p>`],
  ["Who reads the result", "shield", "point", "It's a read. Not a vote.", () =>
    `<p>No human picks the winner. The program opens the account the campaign named and compares its number with the target. Price campaigns read Pyth's signed price, checked on-chain. The team can only confirm or void a result, within 6 hours. Anyone can re-check: same account, same answer.</p>`],
  ["What it costs", "scale", "approve", "", () =>
    `<p>Brot keeps 10% of the losing side; the creator gets 1% of the entries. If you're right, you get your entry back plus your share of the rest, prize included.</p>
      <p class="cluster"><a class="btn small" href="#/fees">Fees, worked out</a><a class="btn small" href="#/record">Who can do what</a></p>`],
];

export default () => ({
  title: "How it works",
  html: `<div class="page-head pg-how-head"><div><p class="t-kicker">How it works</p><h1 class="t-title">A question the chain answers</h1>
      <p class="pg-lead">An On-Chain Campaign is a YES/NO question about one Solana account. Bakers put SOL on YES or NO. When the time comes, the program reads the account, and the side that was right splits the pot.</p></div>
    <img class="pg-how-img" src="img/baked-point.webp" alt="" width="220" height="140"></div>
  <div class="pg">
    <section class="pg-sec" aria-labelledby="pg-path"><h2 class="t-section" id="pg-path">Six steps, from opening to payout</h2>
      <ol class="pg-path" data-perch="path" data-perch-x="0.95" data-perch-size="0.8" data-perch-pose="point" data-perch-say="It's a read. Not a vote.">
        ${STEPS.map(([t, p], i) => `<li><span class="pg-path-n num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div><h3 class="t-h3">${t}</h3><p>${p}</p></div></li>`).join("")}
      </ol></section>
    ${notice("info", TEXT.devnet)}
    <section class="pg-sec" aria-labelledby="pg-more"><h2 class="t-section" id="pg-more">What that means for your SOL</h2>
      <div class="pg-more">${MORE.map(([t, ic, pose, say, body], i) => `<section class="panel" aria-labelledby="pg-m${i}" data-perch="how-${i}" data-perch-x="0.88" data-perch-size="0.75" data-perch-pose="${pose}"${say ? ` data-perch-say="${say}"` : ""}>
        <h3 class="panel-head" id="pg-m${i}">${icon(ic)}${t}</h3>${body()}</section>`).join("")}</div></section>
    <p class="cluster pg-how-go"><a class="cta" href="#/"><span>See the campaigns</span></a><a class="btn" href="#/abrir">${icon("plus")}Open a campaign</a></p>
  </div>`,
});
