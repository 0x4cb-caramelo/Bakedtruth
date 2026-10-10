/**
 * Purpose: what the creation box refuses and how it signs. One plain message per refusal of user_open_campaign (spec
 *          3.12; TP §3.4.10 rows 1–10: program codes 6043–6061, the readers' 6001–6004, 6014 and 6021); check(), the
 *          mirror of validateOpenCampaign that runs on every change; and the flow after "Review and sign": the sheet
 *          "Check before you sign" built from the exact arguments (A-3), the wallet, sent, opened with the share links,
 *          each failure with its own message, and the retry that finds its campaign already open (T17).
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Nothing signs: the flow is timers over mock data.
 */
import { DAY, esc, local, NOW, short, sol, usd, utc } from "../format.js";
import { card } from "../ui/card.js";
import { icon } from "../ui/icons.js";
import { dialog, toast } from "../ui/layer.js";
import { notice, TEXT } from "../ui/notices.js";
import { KINDS } from "../ui/parts.js";
import * as T from "./open-templates.js";
const R = (row, code, name, text, where) => ({ row, code, name, text, where });
/** The refusals, in the spec's copy; where the shared notices already word a state, their text wins. */
export const REFUSALS = [
  R(1, 6043, "UnknownReaderKind", "That kind doesn't exist. Reload and pick one of the five.", "After signing only: the box offers the five"),
  R(1, 6044, "ReaderKindNotOpen", "This kind doesn't open yet. Price campaigns open now.", "Kinds, Details, the button"),
  R(2, 6045, "MetricAccountMismatch", "This isn't the price account for that feed.", "After signing only: the box derives the account"),
  R(2, 6001, "ReaderWrongOwner", "This account doesn't belong to {program}, so it can't back a {kind} campaign.", "Account picker"),
  R(2, 6002, "ReaderBadLayout", "Right owner, but not the format this kind reads.", "Account picker"),
  R(3, 6046, "TargetAlreadyTouched", "Already met: the campaign would be decided at birth. Pick a target the account hasn't reached.", "Target"),
  R(3, "C45", "minimum distance", "Too close to the current value.", "Target, once Sprint 03 sets the distance per kind"),
  R(4, 6003, "PriceNotFullyVerified", "This price isn't fully verified by Pyth.", "Asset (?feedstate=unverified)"),
  R(4, 6004, "PriceWrongFeed", "This account carries another asset's price.", "After signing only"),
  R(4, 6047, "PriceStale", "No fresh price for this feed in the last 120 s. Devnet updates about once a minute; try again shortly.", "Asset (?stale=1, ?feedstate=stale)"),
  R(4, 6048, "PriceConfidenceTooWide", "Pyth's confidence band is wider than 0.5% right now. Try again in a minute.", "Asset (?feedstate=wide)"),
  R(4, 6049, "PriceNonPositive", "This feed reports no valid price right now.", "Asset (?feedstate=zero)"),
  R(4, 6050, "InvalidDirection", "Pick a direction: touches or goes above, or touches or goes below.", "After signing only: two buttons"),
  R(5, 6051, "DurationTooShort", "The deadline must be at least 3 days away.", "Deadline"),
  R(5, 6052, "DurationTooLong", "The deadline must be at most 90 days away.", "Deadline"),
  R(6, "—", "by construction", "No message: fees and share are read-only, set by the program.", "Cost, as facts"),
  R(7, 6053, "OpeningUsdBelowFee", "Opening costs at least US$500 in SOL.", "Cost (custom amount)"),
  R(7, 6054, "OpeningAboveMaxLamports", "SOL/USD moved more than 1% since your quote. Nothing was charged.", "After signing, with “Get a new quote”"),
  R(7, 6055, "SolUsdAccountMismatch", "The SOL/USD price can't be used right now. Reload and try again.", "After signing"),
  R(7, 6056, "SolUsdStale", `${TEXT.stale} Nothing was charged.`, "Cost and the button (?stale=1); after signing"),
  R(7, 6057, "SolUsdConfidenceTooWide", "Pyth's SOL/USD price is too uncertain right now. Try again in a minute.", "After signing"),
  R(7, 6058, "SolUsdPriceNonPositive", "Pyth's SOL/USD price is too uncertain right now. Try again in a minute.", "After signing"),
  R(7, 6059, "PriceExponentOutOfRange", "The SOL/USD price can't be used right now. Reload and try again.", "After signing"),
  R(8, 6060, "OpenWhilePaused", TEXT.paused, "Notice bar and the button (?paused=1)"),
  R(8, 6061, "TooManyOpenCampaigns", TEXT.valve, "Notice in the box and the button (?valve=1)"),
  R(9, 6021, "BadInstructionData", "This transaction is malformed. Reload and try again.", "After signing"),
  R(10, 6014, "AlreadyInitialized", "A campaign with this id is already open.", "After a retry: the box looks it up by id"),
];
export const MSG = Object.fromEntries(REFUSALS.map((r) => [r.code, r.text]));

/** The account picker's refusals (spec 3.12), the first two being row 2's reader errors. */
const ACCT = {
  owner: (k) => (k === "burn" ? "This account isn't a classic SPL token mint, so it can't back a Burn campaign. Token-2022 tokens aren't supported yet."
    : MSG[6001].replace("{program}", T.TEMPLATES[k].program).replace("{kind}", KINDS[k].label)),
  layout: () => MSG[6002],
  rule: () => "This token can still be minted, so its supply could grow. Burn campaigns need a revoked mint authority.",
  missing: () => "No account at this address on devnet.",
  error: () => "Couldn't check this account right now. Try again.",
};
export const acctMessage = (kind, check) => ACCT[check](kind);
const ICON = { refuse: "x", block: "alert", wait: "clock", need: "info" };
/** The messages of one slot, each with an icon, so a refusal never reads as colour alone. */
export const msgs = (issues, slot) =>
  issues.filter((i) => i.slot === slot).map((i) => `<p class="op-msg ${i.level}">${icon(ICON[i.level], 14)}<span>${i.text}</span></p>`).join("");

/** Everything that stops the opening now, slot by slot; empty when the draft can go to the sheet. */
export function check(d, c) {
  const out = [];
  const add = (slot, level, text, tag) => out.push({ slot, level, text, tag });
  const paid = !c.team || d.prize;
  if (c.paused) add("site", "block", "Openings are paused. Payouts and refunds continue.", "Openings are paused");
  if (c.valve) add("site", "block", "The limit of open campaigns is reached.", "Limit reached");
  const o = T.TEMPLATES[d.kind].open;
  if (o !== "now") add("kind", "refuse", o === "devnet" ? "This kind opens after a test YES on devnet. Price campaigns open now." : MSG[6044], T.OPENS[o]);
  if (d.kind === "price") {
    const f = T.feed(d.feed);
    const p = f && T.feedProblem(f);
    if (!f) add("feed", "need", "Pick an asset.", "Pick an asset");
    else if (p) add("feed", "refuse", MSG[p.code], p.tag);
  } else if (!T.looksLikeAddress(d.account)) add("account", "need", "Pick an account or paste its address.", "Pick an account");
  else if (!d.res) add("account", "wait", "Reading the account…", "Checking the account");
  else if (d.res.check === "error") add("account", "block", acctMessage(d.kind, "error"), "Couldn't check the account");
  else if (d.res.check !== "ok") add("account", "refuse", acctMessage(d.kind, d.res.check), "Account refused");
  const r = T.reading(d);
  if (!(d.target > 0)) add("target", "need", "Set a target.", "Set a target");
  else if (r && T.met(d, r)) add("target", "refuse", MSG[6046], "Already met");
  if (T.TEMPLATES[d.kind].epoch) {
    const at = d.epoch && T.epochStart(d.epoch);
    if (!d.epoch) add("epoch", "need", "Pick an epoch.", "Pick an epoch");
    else if (at <= NOW) add("epoch", "refuse", "That epoch has already started. Pick a later one.", "Epoch started");
    else if (at >= d.deadline) add("epoch", "refuse", "That epoch starts after the deadline. Pick an earlier one, or a later deadline.", "Epoch after the deadline");
  }
  const span = d.deadline - NOW;
  if (!Number.isFinite(span)) add("deadline", "need", "Pick a date and a time.", "Pick a deadline");
  else if (span < T.MIN_SPAN) add("deadline", "refuse", `${MSG[6051]}${span >= 3 * DAY ? " Leave 10 minutes more for the transaction to land." : ""}`, "Deadline too soon");
  else if (span > T.MAX_SPAN) add("deadline", "refuse", MSG[6052], "Deadline too far");
  if (paid && !(d.usd >= 500 && Number.isInteger(d.usd))) add("cost", "refuse", `${MSG[6053]}${d.usd >= 500 ? " Whole US$ only." : ""}`, "At least US$500");
  else if (paid && c.stale) add("pricing", "block", "SOL/USD is stale: paid openings wait for the next update.", "Price on hold");
  const need = paid ? T.quote(d.usd).total : T.RENT + T.NET_FEE;
  if (c.wallet === "off") add("wallet", "need", "Connect a wallet to open.", "Connect wallet");
  else if (c.wallet === "connecting") add("wallet", "wait", "Connecting your wallet…", "Connecting…");
  else if (c.wallet === "wrongnet") add("wallet", "block", "Your wallet may be set to mainnet. Switch it to devnet before signing.", "Switch to devnet");
  else if (c.balance < need) add("wallet", "block", `You need ${sol(need, { round: "up" })}; this wallet has ${sol(c.balance, { round: "down" })}.`, "Not enough SOL");
  return out;
}

/** The card bakers will see, built from the draft; inert, and without the mascot's perch. */
export const cardOf = (d, c) => card(T.asCampaign(d, c.team)).replace(/ data-(perch|mood)[\w-]*="[^"]*"/g, "");
export const creatorNotice = `<div class="notice warn op-creator">${icon("alert", 18)}<p>Your campaign will show: <b>“Whoever opened this campaign can control the result and may have an entry on YES or NO.”</b></p></div>`;

const mono = (x, full = x) => `<span class="mono" title="${full}">${short(x)}</span>`;
const row = (dt, dd, small = "") => `<div><dt>${dt}</dt><dd>${dd}${small ? `<small>${small}</small>` : ""}</dd></div>`;
const btn = (to, text) => `<button type="button" class="cta wide" data-to="${to}"><span>${text}</span></button>`;
const back = (text = "Back") => `<button type="button" class="btn wide" data-close>${text}</button>`;
const goto = (text) => `<a class="cta wide" href="#/c/${T.ID}" data-goto autofocus><span>${text}${icon("arrow-right", 16)}</span></a>`;
const spin = (html) => `<div class="op-wait"><span class="op-spin lg" aria-hidden="true"></span><p>${html}</p></div>`;
const steps = (n) => `<ol class="op-steps">${["Check", "Sign", "Confirm"].map((s, i) => `<li class="${i < n ? "done" : i === n ? "now" : ""}">${i < n ? icon("check", 12) : ""}${s}</li>`).join("")}</ol>`;
const SIG = "DemobTcz1XTVJBXABMCcH7veyRbs4qpWaWVtRvPbV5WFXwN717yASKbbvGTRRYuqq8xEjJDdWEwSQwevQbhJGAfj";

/** "Check before you sign" (spec 3.12): every argument the transaction carries, the money exact, then the notices. */
function summary(d, c) {
  const f = T.feed(d.feed);
  const a = T.accepted(d);
  const paid = !c.team || d.prize;
  const q = T.quote(d.usd);
  const k = d.kind;
  const rows = [
    row("Network", "Solana devnet"), row("Program", mono(T.PROGRAM), "Brot Markets"),
    row("Campaign id", `<span class="mono">${T.ID}</span>`, "Saved before signing, so a retry can't open it twice"),
    row("Kind", KINDS[k].label, `Template ${T.TEMPLATES[k].id} v1`),
    row("Account", k === "price" ? `Pyth ${f.name}` : esc(a.name || "No reviewed name"), mono(k === "price" ? f.account : a.address)),
    k === "price" && row("Feed id", mono(`0x${f.id}`)),
    k === "price" && row("Direction", d.dir === "below" ? "Touches or goes below" : "Touches or goes above"),
    row("Target", k === "price" ? T.dollars(d.target) : `${T.whole(d.target)} ${esc(T.unitOf(d))}`, k === "price" ? `${usd(d.target, 2)} = ${Math.round(d.target * 1e8).toLocaleString("en-US")} at exponent −8` : ""),
    T.TEMPLATES[k].epoch && row("Epoch", String(d.epoch), `Starts ≈ ${utc(T.epochStart(d.epoch))} (estimate)`),
    row("Deadline", utc(d.deadline), local(d.deadline)), row("Entries close", utc(T.closesAt(d)), local(T.closesAt(d))),
    paid ? row(`Opening · US$${d.usd.toLocaleString("en-US")}`, T.exact(q.paid), T.chargeLine(d.usd, q).replace(/^.*? at /, "At ")) : row("Opening", "Free (team key)", "No prize, no creator share"),
    paid && row("Prize, on no side · 90%", T.exact(q.prize)), paid && row("Opening fee, held · 10%", T.exact(q.fee)),
    paid && row("Most you'll pay", T.exact(q.max), "The quote + 1%: above it the program refuses"),
    row("Rent", T.exact(T.RENT), "Returned when the campaign closes"), row("Network fee", `≈ ${T.exact(T.NET_FEE)}`),
  ];
  return `<p class="op-dq" tabindex="-1" autofocus>${esc(T.plain(T.sentence(d)))}</p>
    <dl class="rows op-sum">${rows.filter(Boolean).join("")}</dl>${k === "price" ? "" : creatorNotice}
    ${notice("info", "<b>Test phase on Solana devnet:</b> entries use test SOL, which is worth nothing. Program not audited yet.")}
    <p class="op-see">${icon("eye", 15)}<span>If your wallet shows something different from this summary, reject it.</span></p>
    <div class="op-btns">${btn("signing", "Sign in wallet")}${back()}</div>`;
}

/** Each failure with its own message (spec 3.12); the program's own code when it refused. */
const FAIL = {
  moved: ["Not opened: SOL/USD moved", 6054, "Get a new quote"], rejected: ["Not signed", "You rejected it in your wallet.", "Try again"],
  network: ["Not sent", "Can't reach Solana right now. Nothing was sent.", "Try again"], stale: ["Not opened: price on hold", 6056],
  paused: ["Not opened: paused", 6060], valve: ["Not opened: limit reached", 6061], price: ["Not opened", 6055, "Try again"],
  malformed: ["Not opened", 6021, "Try again"],
};
const share = (d) => `https://x.com/intent/tweet?text=${encodeURIComponent(`${T.plain(T.sentence(d))} An On-Chain Campaign on Brot Markets (devnet, test SOL).`)}&url=${encodeURIComponent(`https://brot.markets/c/${T.ID}`)}`;

const STEPS = {
  summary: (d, c) => ({ title: "Check before you sign", body: summary(d, c), full: true }),
  signing: (d, c) => ({ title: "Approve in your wallet", next: "pending", ms: 1500,
    body: `${spin(`Your wallet should show <b>${T.pays(!c.team || d.prize ? T.quote(d.usd).total : T.RENT + T.NET_FEE)}</b> leaving this wallet for the Brot Markets program. If it shows anything else, reject it.`)}${steps(1)}${back("Cancel")}` }),
  pending: () => ({ title: "Sent. Confirming…", next: "confirmed", ms: 1900,
    body: `${spin("Waiting for devnet to finalize it, usually within a minute.")}${steps(2)}<p class="op-sig">Signature <a class="mono" href="https://explorer.solana.com/tx/${SIG}?cluster=devnet" target="_blank" rel="noopener">${short(SIG)}${icon("external", 12)}</a></p>
      <p class="help">You can close this: the id is saved, and coming back looks the campaign up instead of opening it twice.</p>` }),
  confirmed: (d, c) => ({ title: "Opened. Your campaign is live.", full: true,
    body: `<div class="op-done"><img src="img/baked-approve.webp" alt="" width="96" height="61"><p>It appears in lists within a minute. Entries close ${utc(T.closesAt(d))}. Every campaign has a card to post on X.</p></div>
      <div class="op-card" inert>${cardOf(d, c)}</div><div class="op-btns">${goto("Go to the campaign")}
      <a class="btn wide" href="${share(d)}" target="_blank" rel="noopener">${icon("share", 16)}Share on X</a><button type="button" class="btn quiet wide" data-copy>${icon("copy", 16)}Copy link</button></div>` }),
  checking: () => ({ title: "Checking whether your campaign opened…", next: "retried", ms: 2200,
    body: `${spin("Looking it up by its id, for up to about 90 seconds. Nothing is sent again.")}${back("Close")}` }),
  retried: () => ({ title: `It's open: campaign ${T.ID}`,
    body: `<div class="op-done"><img src="img/baked-deadpan.webp" alt="" width="96" height="61"><p><b>This campaign is already open — your first transaction landed.
      Nothing was charged twice.</b></p></div><div class="op-btns">${goto("Go to it")}${back("Close")}</div>` }),
  notfound: () => ({ title: "It didn't open",
    body: `<div class="op-fail">${icon("x", 18)}<p>Nothing was charged: your first transaction expired before it landed.</p></div>
      <p class="help">Trying again reuses the same id, so it can't open twice.</p><div class="op-btns">${btn("signing", "Try again")}${back("Close")}</div>` }),
  failed: (d, c, why) => {
    const [title, m, retry] = FAIL[why] ?? FAIL.moved;
    return { title, body: `<div class="op-fail">${icon("x", 18)}<p>${typeof m === "number" ? MSG[m] : m}</p></div>${typeof m === "number" ? `<p class="t-caption">Program error ${m}</p>` : ""}
      <div class="op-btns">${retry ? btn("summary", retry) : ""}${back("Close")}</div>` };
  },
};

let timer = 0;
/** Opens one step of the flow; `auto` walks signing → pending → confirmed and checking → retried on timers. */
export function flow(step, d, c, { auto = true, why } = {}) {
  clearTimeout(timer);
  const s = (STEPS[step] ?? STEPS.summary)(d, c, why);
  dialog({
    title: s.title,
    body: `<div class="op-dlg${s.full ? " full" : ""}">${s.body}</div>`,
    onClose: () => clearTimeout(timer),
    mount(body, close) {
      body.querySelectorAll("[data-to]").forEach((b) => b.addEventListener("click", () => flow(b.dataset.to, d, c)));
      body.querySelectorAll("[data-goto]").forEach((a) => a.addEventListener("click", () => close({ restore: false })));
      body.querySelector("[data-copy]")?.addEventListener("click", () => toast("Link copied.", { kind: "ok" }));
      if (auto && s.next) timer = setTimeout(() => flow(s.next, d, c), s.ms);
    },
  });
}
