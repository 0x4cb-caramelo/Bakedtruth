/**
 * Purpose: the wallet as creator and opener, in "My entries": one row per campaign it opened, saying where its 1% of
 *          the entries, the prize, the 10% opening fee and the account rent stand; and the reserved-credit card, a
 *          share too small to send to an empty wallet, which the wallet can receive itself (Q2), with the check
 *          before signing and the signing steps. Nothing is signed: the steps are timed.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Spec 3.8 and 3.6 (signing states); TP §3.4.5.
 */
import { CAMPAIGNS, RECEIPTS, RESERVED } from "../data/index.js";
import { esc, sol, short } from "../format.js";
import { DEMO_WALLET, set, walletBalance } from "../state.js";
import { icon } from "../ui/icons.js";
import { dialog, toast } from "../ui/layer.js";
import { kindTile, moment, stateChip } from "../ui/parts.js";

/** Rent of one opening (the campaign and its vault), returned at close (spec 1.6, measured in Sprint 02). */
const OPEN_RENT = 3_901_440;
/** Under this a wallet cannot receive a reserved credit and pay the network fee (spec 3.8: "at least 0.001 SOL"). */
const ENOUGH = 1_000_000;
const HOUSE = ["missed-window", "team-house"];
const PROGRAM = "6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN";
/** Reserved credits this tab has received: the prototype's stand-in for the settle_creator_share transaction. */
const received = new Set();

const got = (lamports) => sol(lamports, { round: "down" });
export const opened = () => CAMPAIGNS.filter((c) => c.creator === DEMO_WALLET.address);
export const reservedNow = () => RESERVED.filter((r) => !received.has(r.id));
export const receivedNow = () => RESERVED.filter((r) => received.has(r.id)).reduce((s, r) => s + r.amount, 0);

/** A campaign the wallet opened: its state and the four amounts that follow the outcome. */
export function openedRow(c) {
  const live = !["paid", "void"].includes(c.status);
  const back = c.settleMode === "onesided" || c.status === "void";
  const share = RECEIPTS.find((r) => r.id === c.id && r.role === "creator");
  const held = RESERVED.find((r) => r.id === c.id);
  const paid = RECEIPTS.find((r) => r.id === c.id && r.role === "opener");
  const facts = [
    ["Your 1%", !c.creatorShareBps ? "None: team or partner campaign" : live ? "Pending: paid if both sides have entries" : back ? "None: one-sided or voided"
      : held ? (received.has(held.id) ? `${got(held.amount)} received just now` : `Reserved: ${sol(held.amount)}`) : share ? `${got(share.amount)} received ${moment(share.at)}` : "Received"],
    ["Prize", !c.prize ? "None: opened free" : live ? `${sol(c.prize)} in the pot, on no side` : back ? `Returned to you: ${got(c.prize)}` : "Shared by the winners"],
    ["Opening fee", !c.openingFee ? "None" : live ? `${sol(c.openingFee)} held until the outcome`
      : c.status === "void" && HOUSE.includes(c.voidReason) ? `Refunded: ${got(c.openingFee)}` : "Kept by Brot"],
    ["Rent", live ? `${sol(OPEN_RENT, { exact: true })} held until close` : held && !received.has(held.id) ? "Held until your 1% is paid" : `${sol(OPEN_RENT, { exact: true })} returned at close`],
  ];
  return `<li class="pg-entry opened">
    <div class="pg-what">${kindTile(c, "sm")}<div><a href="#/c/${c.id}">${esc(c.sentence)}</a>
      <span>Opened ${moment(c.opensAt)}${paid ? ` · ${esc(paid.what)} · ${sol(-paid.amount, { round: "up" })}` : ""}</span></div></div>
    <div class="pg-where">${stateChip(c)}</div>
    <dl class="pg-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></li>`;
}

/** The reserved-credit card: the amount, why it waits, and the one way to receive it besides the daily retry. */
export function reservedCard(r) {
  const c = CAMPAIGNS.find((x) => x.id === r.id);
  const empty = walletBalance() < ENOUGH;
  const why = empty
    ? `This wallet is empty, and a credit this small would leave it below Solana's minimum balance (${sol(r.minimum, { exact: true })}).`
    : `When it was due, this wallet was empty, and a credit this small would have left it below Solana's minimum balance (${sol(r.minimum, { exact: true })}).`;
  return `<section class="pg-held" aria-labelledby="held-${r.id}">
    <h2 id="held-${r.id}">${icon("lock", 18)}Reserved: <b class="num">${sol(r.amount)}</b></h2>
    <p class="pg-held-from">${esc(r.what)} · <a href="#/c/${c.id}">${esc(c.sentence)}</a></p>
    <p>${why} Brot's service retries daily. Or add at least 0.001 SOL to this wallet and receive it yourself.</p>
    <div class="pg-held-do"><button class="cta" data-receive="${r.id}" ${empty ? 'disabled aria-describedby="held-why"' : ""}><span>Receive ${sol(r.amount)}</span></button>
      <span class="t-small" id="held-why">${empty ? "This wallet holds 0 SOL: add some first." : `This wallet holds ${sol(walletBalance())}, enough to receive it now.`} The program fixed where it goes: this wallet.</span></div>
  </section>`;
}

const STEPS = ["Simulating the transaction…", "Approve in your wallet.", "Sent. Confirming on devnet…"];
const stepper = (at) =>
  `<ol class="pg-tx" aria-label="Progress">${STEPS.map((s, i) => `<li class="${i < at ? "done" : i === at ? "now" : ""}"${i === at ? ' aria-current="step"' : ""}>${i < at ? icon("check", 14) : ""}${s}</li>`).join("")}</ol>`;

/** "Check before you sign", then the signing steps, then the credit shows as received. */
function receive(id) {
  const r = RESERVED.find((x) => x.id === id);
  const c = CAMPAIGNS.find((x) => x.id === id);
  const rows = [
    ["Credit", `${esc(r.what)} · ${sol(r.amount, { exact: true })}`],
    ["Campaign", esc(c.sentence)],
    ["To", `<span class="mono">${short(DEMO_WALLET.address)}</span>, this wallet, fixed by the program`],
    ["Network fee", "≈ 0.000005 SOL"],
    ["Network · program", `Solana devnet · <span class="mono">${short(PROGRAM)}</span>`],
  ];
  dialog({
    title: "Check before you sign",
    body: `<div class="stack" data-flow>
      <dl class="rows">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <div class="notice">${icon("shield", 18)}<p>Only this wallet can receive this credit. If your wallet shows something different from this summary, reject it.</p></div>
      <div class="cluster"><button class="cta" data-sign><span>Sign in wallet</span></button><button class="btn" data-close>Back</button></div></div>`,
    mount(body, close) {
      body.querySelector("[data-sign]").addEventListener("click", () => {
        const flow = body.querySelector("[data-flow]");
        document.getElementById("dialog-title").textContent = `Receiving ${sol(r.amount)}`;
        flow.innerHTML = `<div data-steps></div><p class="sr-only" role="status"></p>`;
        body.parentElement.querySelector(".dialog-head [data-close]").focus();
        let at = 0;
        const next = () => {
          if (!flow.isConnected) return; // closed before the end: nothing is marked received
          if (at < STEPS.length) {
            flow.querySelector("[data-steps]").innerHTML = stepper(at);
            flow.querySelector('[role="status"]').textContent = STEPS[at++];
            setTimeout(next, 750);
            return;
          }
          received.add(id);
          close({ restore: false });
          toast(`Received ${sol(r.amount)} in this wallet. Design preview: nothing was signed.`, { kind: "ok" });
          set({});
        };
        next();
      });
    },
  });
}

/** Wires the receive buttons under `root`. */
export function wireCreator(root) {
  root.querySelectorAll("[data-receive]").forEach((b) => b.addEventListener("click", () => receive(b.dataset.receive)));
}
