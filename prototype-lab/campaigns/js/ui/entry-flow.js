/**
 * Purpose: the entry flow after "Review entry" (spec 3.6): the sheet "Check before you sign", built like the
 *          deterministic summary (A-3), with the return floor signed as min_return_bps and what the transaction does;
 *          the signing steps (re-reading, simulating, the wallet, sent); the receipt; and one message for each refusal,
 *          each saying what it cost and offering its own way out. Nothing signs. In the hash, ?fail=<name> makes
 *          signing end in that refusal, and ?open=summary|pending|confirmed|failed (&step=, &fail=) shows a state.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Codes from programs/brot-markets/src/error.rs; the retry
 *          guard is A-9 with T10's expected_entry_total; the lock notice is L-03's option A (spec 3.15 #6).
 */
import { esc, NOW, short, sol, utc } from "../format.js";
import { DEMO_WALLET, walletBalance } from "../state.js";
import { icon } from "./icons.js";
import { dialog, toast } from "./layer.js";
import { kindTile } from "./parts.js";
import { ENTRY_RENT, estimateNote, FAUCET, hashQuery, lockText, myEntry, NETWORK_FEE, outlook, per } from "./entry.js";

const PROGRAM = "6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN";
const SIG = "DemobTcz1XTVJBXABMCcH7veyRbs4qpWaWVtRvPbV5WFXwN717yASKbbvGTRRYuqq8xEjJDdWEwSQwevQbhJGAfj";
/** The floor signed with the entry: 95% of the estimate now. The tolerance itself is [AC] in Sprint 11. */
const TOL = 0.95;
const int = (n) => n.toLocaleString("en-US");
const CREATOR_KINDS = ["burn", "lock", "pool", "stake"];

const STEPS = [
  ["read", "Checking the campaign and your entry…"],
  ["simulate", "Simulating the transaction…"],
  ["wallet", "Approve in your wallet."],
  ["sent", "Sent. Confirming on devnet…"],
];
const WAIT = { read: 600, simulate: 600, wallet: 1300, sent: 1100 };

// name: [step it stops at, title, message, what it cost, program error, way out]. "none": stopped before the chain
// (simulation, wallet); "fee": it landed and the program refused it, so only the network fee moved (spec 3.6 rule).
const FAILS = {
  rejected: ["wallet", "You rejected it in your wallet", "Nothing was sent.", "", "", "again"],
  network: ["read", "Can't reach Solana right now", "Nothing was sent.", "", "", "again"],
  upgrade: ["read", "Brot's program was just updated", "Reloading before you sign, so you sign against the new program.", "none", "", "reload"],
  funds: ["simulate", "Not enough SOL", (x) => `Not enough SOL for the entry, the account rent (${x.rent}, returned at payout) and the network fee. You have ${x.bal}.`, "none", "", "amount"],
  minimum: ["simulate", "Below the minimum entry", "The minimum entry is 0.01 SOL.", "none", "6065 EntryBelowMinimum", "amount"],
  notopen: ["simulate", "This campaign isn't open any more", "It stopped taking entries before you signed.", "none", "6062 CampaignNotOpen", "close"],
  mismatch: ["simulate", "Something doesn't match the campaign", "Something in this transaction doesn't match the campaign. Reload and try again.", "none", "6068 · 6069 · 6045", "reload"],
  moved: ["sent", "The estimate fell below what you accepted", (x) => `Other entries landed before yours and the return fell under ${x.floor}, the floor you signed. Review it again.`, "fee", "6067 ReturnBelowMinimum", "again"],
  closed: ["sent", "Entries closed", "Entries closed before your entry landed.", "fee", "6063 EntriesClosed", "close"],
  paused: ["sent", "Entries are paused", "Entries are paused. Payouts and refunds continue.", "fee", "6064 JoinWhilePaused", "close"],
  known: ["sent", "The answer is already known", "The answer is already known, so entries are locked.", "fee", "Sprint 03 code", "close"],
  stale: ["sent", "No fresh price", (x) => `No fresh ${x.asset} price in the last 120 s. Try again in a minute.`, "fee", "Sprint 03 code", "again"],
  retried: ["sent", "Your earlier entry already landed", (x) => `Nothing was charged twice: this copy was refused, and your entry account holds the ${x.amount} on ${x.S} once.`, "fee", "6066 EntryTotalMismatch", "mine"],
  changed: ["sent", "Your entry changed since this page read it", "An earlier attempt may have landed. We re-read it: check and sign again.", "fee", "6066 EntryTotalMismatch", "again"],
  failed: ["sent", "The transaction failed on-chain", "Only the network fee was spent.", "", "Custom(6070) ReaderNotReady", "again"],
  noanswer: ["sent", "Checking whether your entry landed…", "Your wallet sent it but no answer came back. This can take up to about 90 seconds.", "wait", "", "again"],
};
export const FAIL_NAMES = Object.keys(FAILS);

/** Example addresses and signatures ("Demo…") open a toast, not a broken explorer page. */
export function demoLinks(root) {
  root.querySelectorAll('a[data-explorer][href*="/Demo"]').forEach((a) =>
    a.addEventListener("click", (e) => (e.preventDefault(), toast("An example address: on the real site this opens Solana Explorer on devnet."))),
  );
}

const row = (k, v, note = "") => `<div><dt>${k}</dt><dd>${v}${note ? `<small>${note}</small>` : ""}</dd></div>`;

/** The sheet "Check before you sign" (A-3). `hooks`: onShare, onEdit, onMine, from the campaign page. */
export function summary(c, d, hooks = {}) {
  const mine = myEntry(c);
  const { e, S, O } = outlook(c, d, mine);
  const back = e.mode === "split" ? e.payout : e.back;
  const minBps = Math.floor(Math.floor((back * 10_000) / d.amount) * TOL);
  const rent = mine ? 0 : ENTRY_RENT;
  const notes = [
    estimateNote(c),
    "Your entry is counted: the more you put in, the lower your side's return.",
    `Brot keeps 10% of the losing side. ${c.creatorShareBps ? "The creator gets 1% of the entries." : "No creator share on this campaign."}`,
    !mine && "Entries are public and permanent: anyone can see this wallet's entries on-chain.",
    CREATOR_KINDS.includes(c.kind) && "Whoever opened this campaign can control the result and may have an entry on YES or NO.",
    "If your wallet shows something different from this summary, reject it.",
    "Test phase on Solana devnet: entries use test SOL, which is worth nothing. Program not audited yet.",
  ].filter(Boolean);
  dialog({
    title: "Check before you sign",
    body: `<div class="en-sheet">
      <p class="en-sum-q" tabindex="-1">${kindTile(c, "sm")}<span>${esc(c.sentence)}<small>Campaign <span class="mono">${c.id}</span></small></span></p>
      <dl class="rows en-rows">
        ${row("Side · amount", `<span class="chip ${d.side}">${S}</span> ${sol(d.amount, { exact: true })}`, d.fromLink ? "This amount came from the link you opened." : "")}
        ${row("Estimated return now", e.mode === "split" ? `est. ${per(e.multiple)} per 1 · ≈ ${sol(back, { round: "down" })} if ${S} wins` : `≈ ${sol(back, { round: "down" })} back if ${O} stays empty`)}
        ${row("You accept at least", `${per(minBps / 10_000)} per 1 · ≈ ${sol(Math.floor((d.amount * minBps) / 10_000), { round: "down" })}`, `min_return_bps ${int(minBps)}. If others join first and the estimate drops below this, the entry is refused.`)}
        ${row("Entry account rent", mine ? "None: your entry account exists" : sol(ENTRY_RENT, { exact: true }), mine ? "" : "Returned at payout")}
        ${row("Network fee", `≈ ${sol(NETWORK_FEE, { exact: true })}`)}
        <div class="total"><dt>Total from your wallet</dt><dd>${sol(d.amount + rent + NETWORK_FEE, { exact: true, round: "up" })}</dd></div>
        ${row("Network · program", `Solana devnet · <span class="mono" title="${PROGRAM}">${short(PROGRAM)}</span>`)}
      </dl>
      <div class="en-does"><h3>What you sign</h3><ul>
        <li>Moves ${sol(d.amount, { exact: true })} from ${short(DEMO_WALLET.address)} into this campaign's vault, on ${S}.</li>
        <li>${mine ? "Adds to your entry account" : "Creates your entry account"} and carries your entry so far, ${sol(mine ? mine.yes + mine.no : 0)}, so a repeated transaction can't enter twice.</li></ul></div>
      <p class="en-lock">${icon("lock", 15)}<span>${lockText(c)}</span></p>
      <ul class="en-notes">${notes.map((n) => `<li>${n}</li>`).join("")}</ul>
      <div class="en-actions"><button class="btn" type="button" data-close>Back</button><button class="cta" type="button" data-sign><span>Sign in wallet</span></button></div>
    </div>`,
    mount(body) {
      body.querySelector("[data-sign]").addEventListener("click", () => pending(c, d, hooks, { run: true }));
    },
  });
  document.querySelector(".dialog .en-sum-q")?.focus(); // read from the top: the dialog would focus "Back" at the bottom
}

/** The signing steps. With `run`, they advance and end in the receipt or in the ?fail= refusal. */
export function pending(c, d, hooks = {}, { run = false, step = "sent" } = {}) {
  const fail = FAILS[hashQuery().get("fail")] ? hashQuery().get("fail") : null;
  const { S } = outlook(c, d);
  dialog({
    title: "Signing your entry",
    body: `<div class="en-sheet"><p class="en-sum-q"><span class="chip ${d.side}">${S}</span><span>${sol(d.amount, { exact: true })}<small>${esc(c.sentence)}</small></span></p>
      <ol class="en-steps">${STEPS.map(([k, t]) => `<li data-step="${k}"><span class="en-dot" aria-hidden="true">${icon("check", 13)}</span><span>${t}</span></li>`).join("")}</ol>
      <p class="sr-only" aria-live="polite" data-said></p>
      <p class="t-small">Keep this page open. If your wallet doesn't answer, this page checks until the transaction expires before it offers a retry, so an entry can't land twice.</p></div>`,
    mount(body) {
      const mark = (k) => {
        const at = STEPS.findIndex(([s]) => s === k);
        body.querySelector("[data-said]").textContent = STEPS[at][1];
        body.querySelectorAll("[data-step]").forEach((li, i) => {
          li.className = i < at ? "is-done" : i === at ? "is-now" : "";
          if (i === at) li.setAttribute("aria-current", "step");
          else li.removeAttribute("aria-current");
        });
      };
      if (!run) return mark(STEPS.some(([s]) => s === step) ? step : "sent");
      const stop = fail ? FAILS[fail][0] : null;
      let i = 0;
      const tick = () => {
        const [k] = STEPS[i];
        mark(k);
        const next = k === stop ? () => failed(c, d, fail, hooks, { run }) : ++i < STEPS.length ? tick : () => confirmed(c, d, hooks);
        setTimeout(() => body.isConnected && next(), WAIT[k]);
      };
      tick();
    },
  });
}

/** The receipt, after the transaction is confirmed. */
export function confirmed(c, d, hooks = {}) {
  const mine = myEntry(c);
  const { e, S, O } = outlook(c, d, mine);
  if (hooks.toast !== false) toast(`You're in: ${S} ${sol(d.amount)}.`, { kind: "ok" });
  dialog({
    title: "You're in",
    body: `<div class="en-sheet">
      <p class="en-done ${d.side}">${icon("check", 22)}<span><b>${S} ${sol(d.amount)}</b> is in the pot. ${e.mode === "split" ? `Est. ${per(e.multiple)} per 1 now` : `≈ ${sol(e.back, { round: "down" })} back if ${O} stays empty`}; it changes until entries close ${utc(c.entriesCloseAt)}.</span></p>
      <dl class="rows en-rows">
        ${row("Side · amount", `${S} · ${sol(d.amount, { exact: true })}`)}
        ${mine ? row(`Your entry on ${S}`, `${sol((mine[d.side] ?? 0) + d.amount)} in all`) : ""}
        ${row("Account rent", mine ? "None: the account existed" : sol(ENTRY_RENT, { exact: true }), mine ? "" : "Returned at payout")}
        ${row("Transaction", `<a href="https://explorer.solana.com/tx/${SIG}?cluster=devnet" target="_blank" rel="noopener" data-explorer>${short(SIG)}${icon("arrow-up-right", 12)}</a>`)}
        ${row("Confirmed", utc(NOW))}
      </dl>
      <p class="t-small">Paid automatically to your wallet when the campaign settles. No claim button.</p>
      <div class="en-actions"><a class="btn" href="#/entries" data-leave>See my entries</a><button class="btn" type="button" data-share>${icon("share", 14)}Share</button><button class="cta" type="button" data-close><span>Done</span></button></div>
    </div>`,
    mount(body, close) {
      demoLinks(body);
      body.querySelector("[data-leave]").addEventListener("click", () => close({ restore: false }));
      body.querySelector("[data-share]").addEventListener("click", () => (close(), hooks.onShare?.()));
    },
  });
}

/** One refusal: what happened, what it cost, the program's code, and the way out. */
export function failed(c, d, name, hooks = {}, { run = false } = {}) {
  const [, title, text, cost, code, out] = FAILS[name] ?? FAILS.rejected;
  const { e, S } = outlook(c, d);
  const back = e ? (e.mode === "split" ? e.payout : e.back) : 0;
  const x = { S, amount: sol(d.amount), asset: c.asset, rent: sol(ENTRY_RENT, { exact: true }), bal: sol(Math.min(walletBalance(), Math.max(0, d.amount - 190_000_000)), { round: "down" }), floor: `≈ ${sol(Math.floor(back * TOL), { round: "down" })}` };
  const tone = ["rejected", "network", "upgrade", "retried", "noanswer"].includes(name) ? "info" : "error";
  const ways = { again: "Review again", amount: "Change the amount", mine: "See your entry", reload: "Reload", close: "Close" };
  dialog({
    title,
    body: `<div class="en-sheet">
      <p class="en-fail ${tone}">${icon(tone === "info" ? "info" : "alert", 20)}<span>${typeof text === "function" ? text(x) : text}</span></p>
      ${cost === "wait" ? `<div class="en-check"><span class="en-track"><span${run ? ' class="is-run"' : ""}></span></span><small>Waiting for block height 406,118,450 to pass.</small></div><p class="en-cost" data-verdict></p>` : ""}
      ${cost === "fee" ? `<p class="en-cost">No SOL moved except the network fee (≈ ${sol(NETWORK_FEE, { exact: true })}).</p>` : cost === "none" ? `<p class="en-cost">Nothing was charged.</p>` : ""}
      ${code ? `<p class="en-code">Program error <span class="mono">${code}</span></p>` : ""}
      ${name === "funds" ? `<p class="t-small">On devnet, test SOL is free: <a href="${FAUCET}" target="_blank" rel="noopener">get test SOL</a>.</p>` : ""}
      <div class="en-actions"><button class="btn" type="button" data-close>${out === "close" ? "Close" : "Not now"}</button>
        ${out === "close" ? "" : `<button class="cta" type="button" data-out ${cost === "wait" ? "disabled" : ""}><span>${cost === "wait" ? "Try again" : ways[out]}</span></button>`}</div>
    </div>`,
    mount(body, close) {
      const act = { again: () => summary(c, d, hooks), amount: () => (close(), hooks.onEdit?.()), mine: () => (close(), hooks.onMine?.()), reload: () => location.reload() };
      body.querySelector("[data-out]")?.addEventListener("click", () => act[out]?.());
      if (cost !== "wait" || !run) return;
      setTimeout(() => {
        if (!body.isConnected) return;
        body.closest(".dialog").querySelector("h2").textContent = "Your entry didn't land";
        body.querySelector("[data-verdict]").textContent = "It didn't land. Nothing was charged.";
        body.querySelector("[data-out]").disabled = false;
      }, 3600);
    },
  });
}
