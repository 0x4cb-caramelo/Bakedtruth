/**
 * Purpose: sections 3 and 4 of the creation box (spec 3.12). 3 Preview, built only from what the transaction would
 *          carry: the sentence, the value now with "If read now", the rule in plain words, the creator notice on the
 *          kinds a creator can push (BP-14), the card bakers will see and the share image's thumbnail, then the total
 *          and "Review and sign" with what still stops it. 4 Cost: the opening amount, or a team key's free opening with
 *          its optional prize (C44), the money table and the wallet check. Also the phone's sticky price bar.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. US$ appears only in the charge line, at the Pyth price.
 */
import { esc, local, pct, short, sol, usd, utc } from "../format.js";
import { icon } from "../ui/icons.js";
import { TEXT } from "../ui/notices.js";
import { KINDS } from "../ui/parts.js";
import { cardOf, creatorNotice, msgs, REFUSALS } from "./open-signing.js";
import { sentenceHtml } from "./open-slots.js";
import * as T from "./open-templates.js";

const down = (d) => d.kind === "burn" || (d.kind === "price" && d.dir === "below");
const val = (d, x) => (d.kind === "price" ? usd(x, 2) : `${T.whole(x)}${T.unitOf(d) ? ` ${esc(T.unitOf(d))}` : ""}`);
const paidOf = (d, c) => !c.team || d.prize;
const totalOf = (d, c) => (paidOf(d, c) ? T.quote(d.usd).total : T.RENT + T.NET_FEE);
const pays = T.pays;

function live(d, r) {
  if (!r) return `<div class="op-live none">${icon("eye", 16)}<p>Pick ${d.kind === "price" ? "an asset" : "an account"} to see its value now.</p></div>`;
  const set = d.target > 0;
  const yes = set && T.met(d, r);
  return `<div class="op-live"><div><small>${esc(r.name)} now</small><b class="num">${val(d, r.value)}</b><span>${d.kind === "price" ? "Pyth" : "Read"} · ${T.age(r.at)}</span></div>
    <div><small>YES at or ${down(d) ? "below" : "above"}</small><b class="num">${set ? val(d, d.target) : "–"}</b><span>${set ? `${pct(Math.abs(d.target / r.value - 1), 1)} away` : "No target yet"}</span></div>
    <div class="op-if"><small>If read now</small>${set ? `<span class="chip ${yes ? "yes" : "no"}">${yes ? "YES" : "NO"}</span>` : "<b>–</b>"}</div></div>`;
}

/** The rule in plain words (spec 3.12, RuleText): the account, YES, early, the two moments, missing values, refunds. */
function rule(d, paid) {
  const k = d.kind;
  const f = T.feed(d.feed);
  const a = T.accepted(d);
  const t = !(d.target > 0) ? "the target" : k === "price" ? T.dollars(d.target) : T.whole(d.target);
  const link = (addr, name) => `${name} · <a href="${T.explorer(addr)}" target="_blank" rel="noopener"><span class="mono">${short(addr)}</span>${icon("external", 12)}</a>`;
  const reads = k === "price" ? (f ? link(f.account, `Pyth's ${f.name} price account`) : "The asset's Pyth price account")
    : a ? link(a.address, a.name ? `${esc(a.name)}, ${T.TEMPLATES[k].owner}` : `A ${T.TEMPLATES[k].owner} with no reviewed name`) : "The account you pick, checked for owner and format";
  const ep = d.epoch ? `epoch ${d.epoch}` : "the epoch";
  const yes = {
    price: `As soon as Pyth's ${f?.asset ?? ""} price, net of its confidence band, ${down(d) ? "touches or goes below" : "touches or goes above"} ${t} before the deadline. Proofs land within 60 s of a price, so a touch of a few seconds may not count.`,
    burn: `As soon as the supply reads ${t} or less before the deadline. The mint authority is revoked, so the supply can't grow back.`,
    lock: `As soon as the pool's liquidity locked for good reads ${t} or more before the deadline. Locked liquidity only grows.`,
    pool: `If the pool starts ${ep} with ${t} SOL or more; NO if less.`,
    stake: `If the validator enters ${ep} with ${t} SOL or more staked; NO if less.`,
  }[k];
  const epochKind = T.TEMPLATES[k].epoch;
  const has = Number.isFinite(d.deadline);
  const close = has && T.closesAt(d);
  const items = [
    ["eye", "Reads", reads], ["check", "YES", yes],
    ["sparkle", "Early", epochKind ? `Read when ${ep} starts${d.epoch ? `, ≈ ${utc(T.epochStart(d.epoch))}` : ""}, before the deadline.` : "It can resolve YES early, the moment the target is met. NO waits for the deadline."],
    ["clock", "Deadline", has ? `${utc(d.deadline)}<small>${local(d.deadline)}</small>` : "Not set yet"],
    ["lock", "Entries close", has ? `${utc(close)}<small>${local(close)}${k === "burn" || k === "lock" ? " · or the moment the target is met" : ""}</small>` : "5% of the time before the deadline"],
    ["alert", "No reading", k === "price" ? "If the feed stops updating before the deadline, the campaign is voided and every entry refunded."
      : epochKind ? "If the epoch's reading is missed, the campaign is voided and every entry refunded." : "If the account can't be read at the deadline, the campaign is voided and every entry refunded."],
    ["users", "One side only", `Every entry is refunded: the first wallet in full, the others minus 1%.${paid ? " The prize returns to you." : ""}`],
    ["x", "Voided", `Every entry is refunded in full.${paid ? " The prize returns to you; the opening fee too, only if Brot's service caused the void." : ""}`],
    ["shield", "Who decides", "No human picks the winner. The team can only confirm or void a result, within 6 hours."],
  ];
  return `<ul class="op-rule">${items.map(([i, label, v]) => `<li>${icon(i, 14)}<b>${label}</b><span>${v}</span></li>`).join("")}</ul>`;
}

/** The share image (spec 3.13) scaled to the column: what a post on X shows before resolution. */
function thumb(d, c) {
  const m = T.asCampaign(d, c.team);
  const r = T.reading(d);
  return `<figure class="op-og"><div class="op-og-in" role="img" aria-label="Share image: ${esc(m.sentence)} Open, no entries yet, pot ${sol(m.prize)}.">
    <p class="op-og-k"><span class="kind-tile sm ${KINDS[d.kind].cls}">${KINDS[d.kind].tile}</span>${KINDS[d.kind].label} · ${esc(m.asset)}</p>
    <p class="op-og-s">${esc(m.sentence)}</p><p class="op-og-v">${esc(r.name)} now <b>${val(d, r.value)}</b> · target <b>${val(d, d.target)}</b></p>
    <p class="op-og-d">Deadline ${utc(d.deadline)}</p><p class="op-og-p"><small>Pot</small><b>${sol(m.prize)}</b><small>No entries yet</small></p>
    <p class="op-og-b"><b>brot.markets</b><span>/c/${short(T.ID)}</span><span>Devnet · test SOL, worth nothing</span></p>
    <img src="img/baked-deadpan.webp" alt="" width="120" height="76"></div><figcaption>The image a post on X shows (1200 × 630).</figcaption></figure>`;
}

/** What the preview shows; re-rendered on every change inside its scrolling box. */
export function body(d, c) {
  const done = T.complete(T.sentence(d)) && Number.isFinite(d.deadline);
  return `<p class="op-sent">${sentenceHtml(d)}</p>${live(d, T.reading(d))}<h3 class="op-h3">The rule</h3>${rule(d, paidOf(d, c))}
    ${d.kind === "price" ? "" : creatorNotice}<h3 class="op-h3">As it will appear</h3>
    ${done ? `<div class="op-card" inert>${cardOf(d, c)}</div>${thumb(d, c)}` : `<p class="t-small">The card appears once every slot is filled.</p>`}`;
}

/** The total, what still stops the opening, and the one button that fits the wallet. */
export function go(d, issues, c) {
  const tags = [...new Set(issues.filter((i) => c.wallet !== "off" || i.slot !== "wallet").map((i) => i.tag))].slice(c.wallet === "off" ? 0 : 1);
  const btn = c.wallet === "off" ? `<button type="button" class="cta wide" data-go="connect"><span>${icon("wallet", 16)}Connect wallet to open</span></button>`
    : `<button type="button" class="cta wide" data-go="review"${issues.length ? " disabled" : ""}><span>${issues.length ? esc(issues[0].tag) : "Review and sign"}</span></button>`;
  return `<p class="op-total"><span>Total now</span><b class="num">≈ ${pays(totalOf(d, c))}</b></p>
    ${tags.length ? `<p class="op-why">${icon("info", 14)}<span>${c.wallet === "off" ? "" : "Also: "}${tags.join(" · ")}</span></p>` : ""}${btn}
    <p class="t-caption">${issues.length ? "The program checks every rule again when you sign." : "Nothing is signed until your wallet asks."}</p>`;
}

/** The phone's sticky bar (spec 3.12): "Total ≈ … · Review and sign". */
export function bar(d, issues, c) {
  const off = c.wallet === "off";
  return `<p class="op-bar-sum"><small>Total</small><b class="num">≈ ${pays(totalOf(d, c))}</b>${!off && issues.length ? `<small class="op-bar-why">${esc(issues[0].tag)}</small>` : ""}</p>
    ${off ? `<button type="button" class="cta" data-go="connect"><span>Connect wallet</span></button>` : `<button type="button" class="cta" data-go="review"${issues.length ? " disabled" : ""}><span>Review and sign</span></button>`}`;
}

const AMOUNTS = [500, 1000, 1500, "custom"];
function amounts(d) {
  return `<fieldset class="op-field"><legend class="op-label">Opening amount · above US$500 the extra is a bigger prize, at the same 90/10</legend>
    <div class="op-amts">${AMOUNTS.map((v) => {
      const on = d.pick === v;
      return `<label class="op-amt${on ? " on" : ""}"><input class="sr-only" type="radio" name="op-amt" id="op-a-${v}" value="${v}" data-set="pick"${on ? " checked" : ""}>
        <b>${v === "custom" ? "Custom" : `US$${v.toLocaleString("en-US")}`}</b><small>${v === 500 ? "the minimum" : v === "custom" ? "whole US$" : `US$${(v * 0.9).toLocaleString("en-US")} prize`}</small></label>`;
    }).join("")}</div>
    ${d.pick === "custom" ? `<div class="op-num pre wide"><span class="op-pre" aria-hidden="true">US$</span>
      <input id="op-usd" class="input" type="number" min="500" step="1" inputmode="numeric" value="${d.usd}" data-set="usd" aria-label="Custom amount, in whole US$"></div>` : ""}</fieldset>`;
}

function wallet(c, need) {
  const line = (cls, ic, html) => `<p class="op-wallet ${cls}">${icon(ic, 14)}<span>${html}</span></p>`;
  if (c.wallet === "off" || c.wallet === "connecting") return line("", "wallet", c.wallet === "off" ? "Connect a wallet to check its balance." : "Connecting…");
  if (c.wallet === "wrongnet") return line("bad", "alert", "Your wallet may be set to mainnet. Switch it to devnet before signing.");
  if (c.balance >= need) return line("ok", "check", `Balance ${sol(c.balance, { round: "down" })} — enough`);
  return line("bad", "alert", `You need ${sol(need, { round: "up" })}; this wallet has ${sol(c.balance, { round: "down" })}. <a href="${T.FAUCET}" target="_blank" rel="noopener">Get test SOL${icon("external", 12)}</a>`);
}

function table(d, issues, c) {
  const paid = paidOf(d, c);
  const q = T.quote(d.usd);
  const row = (k, v, s = "", cls = "") => `<div${cls ? ` class="${cls}"` : ""}><dt>${k}${s ? `<small>${s}</small>` : ""}</dt><dd>${v}</dd></div>`;
  const rows = paid
    ? [row("Prize in the pot (90%)", sol(q.prize), "On no side. Returns to you if the pot ends one-sided or the campaign is voided"),
      row("Opening fee (10%)", sol(q.fee, { round: "up" }), "Held until the outcome; refunded only if Brot's service causes a void"),
      row("Most you'll pay", sol(q.max, { round: "up" }), "The quote + 1% for price moves. Past it, the opening is refused and nothing is charged")]
    : [row("Opening", "Free (team key)"), row("Prize", "None", "Unless the team adds one")];
  rows.push(row("Account rent", T.exact(T.RENT), "Returned to you when the campaign closes"), row("Network fee", `≈ ${T.exact(T.NET_FEE)}`),
    row("Total now", `≈ ${pays(totalOf(d, c))}`, paid ? `At most ${sol(q.most, { round: "up" })}` : "", "total"));
  return `${paid ? `<p class="op-charge"><b class="num">${sol(q.paid, { round: "up" })}</b><span>${T.chargeLine(d.usd, q)}</span></p>` : ""}${msgs(issues, "cost")}
    <dl class="rows op-money">${rows.join("")}</dl>
    <p class="op-fees">${icon("scale", 14)}<span>On entries: Brot keeps 10% of the losing side · ${c.team ? "no creator share" : "you get 1% of all entries"} · no cap on the pot</span></p>${wallet(c, totalOf(d, c))}`;
}

/** Section 4: what the opening costs. */
export const cost = (d, issues, c) => `<section class="panel op-sec op-cost" aria-labelledby="op-s4">
  <h2 class="op-h" id="op-s4"><span class="op-n" aria-hidden="true">4</span>Cost</h2>
  ${c.team ? `<div class="op-team">${icon("shield", 18)}<p><b>Team key:</b> this opening is free, with no prize unless you add one and no creator share. Linking it to a launch partner happens in <span class="mono">content/partners.json</span>.</p></div>
    <label class="op-check"><input type="checkbox" id="op-prize" data-set="prize"${d.prize ? " checked" : ""}><span>Add a prize (paid like any wallet, 90/10)</span>
      <span class="chip op-wip" title="TP §14.4: the sources don't say how a team key adds a prize">Working reading C44</span></label>
    ${c.stale ? `<p class="help">No prize while the SOL/USD price is stale; the free opening still works.</p>` : ""}${d.prize ? amounts(d) : ""}` : amounts(d)}
  <div data-derived="cost" aria-live="polite">${table(d, issues, c)}</div></section>`;

/** Section 3, the preview: sticky beside the builder on desktop, after the details on phones. */
export const preview = (d, issues, c) => `<section class="op-sec op-preview" aria-labelledby="op-s3">
  <div class="op-pv" data-perch="open-preview" data-perch-x="0.84" data-perch-size="0.8" data-perch-pose="skeptical" data-perch-say="Pick something I can read.">
    <h2 class="op-h" id="op-s3"><span class="op-n" aria-hidden="true">3</span>Preview<span class="chip">Not signed</span></h2><div data-op="pv">${body(d, c)}</div></div>
  <div class="op-go" data-op="go">${go(d, issues, c)}</div></section>`;

export const costDerived = (d, issues, c) => ({ cost: table(d, issues, c) });

/** Every message in one place, for review (?refusals=1): the program's refusals, then what the box itself stops. */
const EXTRA = [
  ["2", "picker", "No account at this address on devnet. · Couldn't check this account right now. Try again. · This token can still be minted, so its supply could grow. Burn campaigns need a revoked mint authority.", "Account picker"],
  ["10", "retry", "Checking whether your campaign opened… · It's open: campaign 8231904417. This campaign is already open — your first transaction landed. Nothing was charged twice. · It didn't open. Nothing was charged.", "A return without an answer"],
  ["—", "wallet", "You rejected it in your wallet. · Can't reach Solana right now. Nothing was sent.", "After signing"],
  ["—", "box", "Connect wallet to open · Your wallet may be set to mainnet. Switch it to devnet before signing. · You need 4.1979 SOL; this wallet has 0 SOL. Get test SOL", "The button, Cost"],
  ["—", "box", "That epoch has already started. Pick a later one. · That epoch starts after the deadline. Pick an earlier one, or a later deadline.", "Epoch (Sprint 03, C46)"],
  ["—", "country", TEXT.geo, "Replaces the box"],
];
export const refusals = () => `<section class="panel op-all" aria-labelledby="op-all-h"><h2 class="t-section" id="op-all-h">All refusal messages</h2>
  <p class="t-small">Every refusal of <span class="mono">user_open_campaign</span> (TP §3.4.10, rows 1 to 10) as the box words it, then what the box stops on its own. For review only: <span class="mono">?refusals=1</span>.</p>
  <div class="op-tablewrap"><table class="op-table"><thead><tr><th scope="col">Row</th><th scope="col">Code</th><th scope="col">Message</th><th scope="col">Where</th></tr></thead><tbody>
  ${[...REFUSALS.map((r) => [r.row, `${r.code} ${r.name}`, r.text, r.where]), ...EXTRA].map(([a, b, m, w]) => `<tr><td data-l="Row">${a}</td><td data-l="Code" class="mono">${b}</td><td data-l="Message">${m}</td><td data-l="Where">${w}</td></tr>`).join("")}
  </tbody></table></div></section>`;
