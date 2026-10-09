/**
 * Purpose: the entry panel of the campaign page (spec 3.6; S11): YES or NO with each side's chance and estimated
 *          return, the amount in SOL (0.01 SOL minimum, the balance, quick amounts), the estimate net of Brot's 10% of
 *          the losing side and the creator's 1% in a polite live region (one-sided, first wallet, large entry), the
 *          account rent, the lock notice, and one button that fits the wallet: connect, Use Installed Wallet, get test
 *          SOL, wrong network, paused, no fresh price, or "Review entry". A link may prefill it
 *          (?side=yes&amount=<lamports>) and says so; a link never signs.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. The number is model.js's estimate, the math the program
 *          checks against min_return_bps (TP §3.4.16; Sprint 02's join). The lock text is L-03's option A.
 */
import { ENTRIES } from "../data/index.js";
import { DAY, LAMPORTS, NOW, sol, utc } from "../format.js";
import { estimate } from "../model.js";
import { connected, state, walletBalance } from "../state.js";
import { icon } from "./icons.js";
import { notice, TEXT } from "./notices.js";
import { chancePair, moment } from "./parts.js";
import { connectDialog } from "./wallet.js";

export const MIN_ENTRY = 10_000_000; // P-5; read live from GlobalConfig at every join (spec 1.7 #2)
export const ENTRY_RENT = 1_158_240; // Entry, 100 bytes: (128 + 100) × 5,080 lamports (S02, measured)
export const NETWORK_FEE = 5_000;
export const FAUCET = "https://faucet.solana.com";
const CHIPS = [0.1, 0.5, 1, 5];

/** The query after the route in the hash: "#/c/1?side=no&amount=500000000". */
export const hashQuery = () => new URLSearchParams(location.hash.split("?")[1] ?? "");
/** An estimated return per 1 SOL, floored to two decimals (spec 1.3): "2.47". */
export const per = (m) => (Math.floor(m * 100) / 100).toFixed(2);
const toText = (l) => String(Number((l / LAMPORTS).toFixed(9)));
const toLamports = (t) => {
  const v = Number(String(t).trim().replace(",", "."));
  return Number.isFinite(v) && v > 0 ? Math.round(v * LAMPORTS) : 0;
};

let draft = null;
/** The panel's draft survives redraws (a wallet switch redraws the page) and starts again on a new link. */
export function draftFor() {
  if (draft?.key === location.hash) return draft;
  const q = hashQuery();
  const linked = Math.round(Number(q.get("amount")));
  const amount = linked > 0 ? linked : LAMPORTS;
  draft = { key: location.hash, side: q.get("side") === "no" ? "no" : "yes", amount, text: toText(amount), fromLink: linked > 0 };
  return draft;
}

/** The connected wallet's entry in this campaign, if any. */
export const myEntry = (c) => (connected() ? ENTRIES.find((e) => e.id === c.id) : undefined);
/** The first wallet in the pot pays no one-sided fee, on either side (Q3). */
const isFirst = (c, mine) => c.poolYes + c.poolNo === 0 || !!mine?.first;

/** The estimate for a draft, with the words the panel and the sheet build around it. */
export function outlook(c, d, mine = myEntry(c)) {
  const first = isFirst(c, mine);
  return { e: estimate(c, d.side, d.amount, { first }), S: d.side.toUpperCase(), O: d.side === "yes" ? "NO" : "YES", first };
}

/** Notice #7, net of what this campaign takes; the team's campaigns carry no creator share (P-3). */
export const estimateNote = (c) =>
  `Estimate, not a promise: net of Brot's 10% of the losing side${c.creatorShareBps ? " and the creator's 1%" : ""}, and it changes with every entry until entries close.${c.creatorShareBps ? "" : " No creator share on this campaign."}`;

/** Notice #6, L-03 option A (recommended in spec 3.15). */
export const lockText = (c) =>
  `<b>No early exit.</b> This SOL stays in the pot until the campaign is paid or voided, after ${utc(c.deadlineAt)} and a 6-hour review. You can't cancel it or move it to the other side.`;

function estimateHtml(c, d, mine) {
  if (!d.amount) return `<p class="en-est-note">Enter an amount to see the estimate.</p>`;
  const { e, S, O, first } = outlook(c, d, mine);
  if (e.mode === "onesided")
    return `<p class="en-est-main">If ${O} stays empty: refund <b>≈ ${sol(e.back, { round: "down" })}</b></p>
      <p class="en-est-sub">${first ? "No fee: you would be the first wallet." : "1% fee; the first wallet pays none."} If someone joins ${O}, the winning side splits the losing side${c.prize ? " and the prize" : ""}.</p>`;
  const small = estimate(c, d.side, MIN_ENTRY);
  const big = e.multiple < small.multiple * 0.9;
  const alone = (d.side === "yes" ? c.poolYes : c.poolNo) === 0;
  return `<p class="en-est-main">If ${S} wins: <b>≈ ${sol(e.payout, { round: "down" })}</b> for ${sol(d.amount)}</p>
    <p class="en-est-sub">est. ${per(e.multiple)} per 1${alone ? `, as the first on ${S}, while the pot stays as it is` : ""}. If ${O} wins: 0 SOL back.</p>
    <p class="en-est-note">${estimateNote(c)}</p>
    <p class="en-est-note${big ? " en-warn" : ""}">${big ? icon("alert", 14) : ""}<span>Your entry is counted: the more you put in, the lower your side's return.${big ? ` est. ${per(small.multiple)} per 1 for a small entry, ${per(e.multiple)} with yours.` : ""}</span></p>`;
}

/** What stops this wallet from joining, as text; empty when the draft can go to the sheet. */
function invalid(c, d, mine) {
  if (!d.amount) return d.text.trim() ? "Write the amount in SOL, like 0.5." : " ";
  if (d.amount < MIN_ENTRY) return "The minimum entry is 0.01 SOL.";
  const need = d.amount + (mine ? 0 : ENTRY_RENT) + NETWORK_FEE;
  if (state.wallet === "on" && need > walletBalance())
    return `Not enough SOL for ${sol(d.amount)}, the account rent and the network fee. You have ${sol(walletBalance(), { round: "down" })}.`;
  return "";
}

const feedStale = (c) => c.kind === "price" && hashQuery().get("feed") === "stale";

/** The notice above the button: pause, stale price, no SOL, wrong network. */
function blocker(c) {
  if (state.paused) return notice("warn", TEXT.paused);
  if (feedStale(c)) return notice("warn", `<b>No fresh ${c.asset} price in the last 120 s.</b> Devnet updates about once a minute; try again shortly.`);
  if (state.wallet === "nosol") return notice("info", `<b>You need SOL to join.</b> On devnet, test SOL is free from a faucet and worth nothing.`);
  if (state.wallet === "wrongnet")
    return notice("danger", "<b>Your wallet may be set to mainnet.</b> Brot runs on devnet for now: switch your wallet to devnet before signing.");
  return "";
}

function cta(c) {
  const off = (text) => `<button class="cta wide" type="button" disabled><span>${text}</span></button>`;
  if (state.paused) return off(`${icon("pause", 16)}Entries are paused`);
  if (feedStale(c)) return off("Waiting for a fresh price");
  if (state.wallet === "off")
    return `<button class="cta wide" type="button" data-connect data-mood="tapping"><span>${icon(state.android ? "phone" : "wallet", 16)}${state.android ? "Use Installed Wallet" : "Connect wallet to join"}</span></button>`;
  if (state.wallet === "connecting") return off("Connecting…");
  if (state.wallet === "nosol") return `<a class="cta wide" href="${FAUCET}" target="_blank" rel="noopener"><span>Get test SOL${icon("external", 15)}</span></a>`;
  if (state.wallet === "wrongnet") return off("Switch your wallet to devnet");
  return `<button class="cta wide" type="button" data-review><span>Review entry${icon("arrow-right", 16)}</span></button>`;
}

const balance = () =>
  ({ off: "Connect to see your balance", connecting: "Connecting…" })[state.wallet] ?? `Balance ${sol(walletBalance(), { round: "down" })}`;

/** The panel. `mountPanel` wires it; nothing in it signs. */
export function panel(c) {
  const d = draftFor();
  const mine = myEntry(c);
  const ch = chancePair(c);
  const side = (s) => {
    const e = estimate(c, s, LAMPORTS, { first: isFirst(c, mine) });
    const sub = e?.mode === "split" ? `est. ${per(e.multiple)} per 1` : "refund if alone";
    return `<button type="button" class="side-btn ${s}" data-side="${s}" aria-pressed="${d.side === s}" data-mood="${s === "yes" ? "approve" : "skeptical"}">
      <span class="en-side-top"><b>${s.toUpperCase()}</b>${ch ? `<span>${ch[s]}</span>` : ""}</span><span class="per">${sub}</span></button>`;
  };
  const soon = c.entriesCloseAt - NOW < DAY;
  return `<section class="panel en-panel" data-perch="panel" data-perch-x="0.22" data-perch-size="0.9" data-perch-pose="${d.side === "no" ? "skeptical" : "deadpan"}" aria-labelledby="en-title">
    <h2 class="panel-head" id="en-title">Join this campaign<span class="hint${soon ? " en-soon" : ""}">Entries close ${moment(c.entriesCloseAt)}</span></h2>
    <div class="en-sides" role="group" aria-label="Side">${side("yes")}${side("no")}</div>
    <div class="field en-amount">
      <div class="en-amount-top"><label for="en-amount">Amount (SOL)</label><span>${balance()}</span></div>
      <div class="input-wrap"><input id="en-amount" class="input" data-amount inputmode="decimal" autocomplete="off" spellcheck="false" value="${d.text}" aria-describedby="en-help" /><span class="unit">SOL</span></div>
      <div class="en-chips">${CHIPS.map((v) => `<button type="button" class="btn small" data-chip="${v}">${v}</button>`).join("")}
        <button type="button" class="btn small" data-max ${state.wallet === "on" ? "" : "disabled"}>Max</button></div>
      <p class="help" id="en-help" data-help></p>
    </div>
    <div class="en-est" data-estimate data-tone="${d.side}" aria-live="polite"></div>
    <p class="en-rent">${mine ? "Your entry account exists: no new rent." : `First entry here: + ${sol(ENTRY_RENT, { exact: true })} account rent, returned when it's paid out.`}</p>
    <p class="en-lock">${icon("lock", 15)}<span>${lockText(c)}</span></p>
    ${blocker(c)}${cta(c)}
  </section>`;
}

/** Wires the panel under `root`; `onReview(draft)` opens the sheet. */
export function mountPanel(root, c, onReview) {
  const input = root.querySelector("[data-amount]");
  if (!input) return;
  const d = draftFor();
  const mine = myEntry(c);
  const [help, est, go, box] = ["[data-help]", "[data-estimate]", "[data-review]", ".en-panel"].map((s) => root.querySelector(s));
  let timer = 0;
  const update = (now = false) => {
    const err = invalid(c, d, mine).trim();
    input.setAttribute("aria-invalid", String(!!err));
    help.className = `help${err ? " error" : d.fromLink ? " en-linked" : ""}`;
    help.innerHTML = err || (d.fromLink ? `${icon("alert", 14)}This amount came from the link you opened. Check it before you sign.` : "Minimum 0.01 SOL.");
    root.querySelectorAll("[data-side]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.side === d.side)));
    box.dataset.perchPose = d.side === "no" ? "skeptical" : "deadpan";
    est.dataset.tone = d.side;
    if (go) go.disabled = !!invalid(c, d, mine);
    clearTimeout(timer);
    const paint = () => (est.innerHTML = estimateHtml(c, d, mine));
    now ? paint() : (timer = setTimeout(paint, 220));
  };
  const setAmount = (lamports) => {
    Object.assign(d, { amount: lamports, text: toText(lamports), fromLink: false });
    input.value = d.text;
    update(true);
  };
  root.querySelectorAll("[data-side]").forEach((b) => b.addEventListener("click", () => ((d.side = b.dataset.side), update(true))));
  input.addEventListener("input", () => (Object.assign(d, { text: input.value, amount: toLamports(input.value), fromLink: false }), update()));
  root.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", () => setAmount(Math.round(Number(b.dataset.chip) * LAMPORTS))));
  root.querySelector("[data-max]")?.addEventListener("click", () =>
    setAmount(Math.max(0, Math.floor((walletBalance() - (mine ? 0 : ENTRY_RENT) - NETWORK_FEE) / MIN_ENTRY) * MIN_ENTRY)),
  );
  root.querySelector("[data-connect]")?.addEventListener("click", connectDialog);
  go?.addEventListener("click", () => onReview(d));
  update(true);
}
