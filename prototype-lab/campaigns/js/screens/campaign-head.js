/**
 * Purpose: the campaign page's header, split-and-pot block and timeline. The header: back link, the eyebrow (kind
 *          chip, display name, partner seal, state badge with its visible sub-label, unlisted tag, save), the
 *          sentence as the page's one <h1>, the rule in plain words from the kind's template, and who opened it. The
 *          split-and-pot block: each side's chance and total, the bar, the prize on no side, the pot with its US$
 *          display value and source, and the one-sided or empty note. The timeline: the five public states, with the
 *          campaign's own place marked (Contested is a stage of In review; Voided is the side exit).
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Copy from the screen spec (1.4, 3.5, 3.15) in D-m's words.
 */
import { SOL_USD } from "../data/index.js";
import { esc, LAMPORTS, local, NOW, rel, sol, usd, usdApprox, utc } from "../format.js";
import { joinable, pot, result, STATES } from "../model.js";
import { connected, DEMO_WALLET, state } from "../state.js";
import { voidReason } from "../ui/card.js";
import { hashQuery } from "../ui/entry.js";
import { icon } from "../ui/icons.js";
import { chancePair, KINDS, kindLabel, moment, seal, splitBar, stateChip } from "../ui/parts.js";
import { addr, full } from "./campaign-proof.js";

/** The visible sub-label next to the state badge (spec 1.4). */
function sub(c) {
  const r = result(c);
  if (joinable(c, NOW)) {
    if (state.paused) return ["Entries paused", true];
    if (c.entriesCloseAt - NOW < 24 * 3_600_000) return [`Closes ${rel(c.entriesCloseAt)}`, true];
    if (!c.poolYes && !c.poolNo) return ["No entries yet"];
    return c.poolYes && c.poolNo ? [""] : ["One-sided so far"];
  }
  return {
    open: ["Entries closed on time"],
    closed: ["Entries closed on time"],
    review: [`Read: ${r} · pays ${rel(c.reviewEndsAt)}`],
    contested: [STATES.contested.sub, true],
    paid: [c.settleMode === "onesided" ? "One-sided: entries refunded" : "All paid"],
    void: [`Refunded · ${voidReason(c)}`],
  }[c.status];
}

/** The rule in plain words, from the kind's template (spec 3.5); targets in full digits. */
function rule(c) {
  const t = `<b>${full(c.target, c.unit)}</b>`;
  const by = `<b>${utc(c.deadlineAt)}</b> (${local(c.deadlineAt)})`;
  const name = esc(c.asset);
  const epoch = `Entries lock when that epoch starts. If Brot's service misses its reading, the campaign is voided and every entry refunded.`;
  const T = {
    price: `YES if Pyth's ${name} price touches ${t} ${c.direction === "below" ? "or less" : "or more"} at any moment before ${by}; a touch resolves YES at once and locks entries. It counts once a signed Pyth price showing it is posted on-chain within 60 seconds of publication, so a touch of a few seconds may not count. NO if the deadline passes without one. If the price feed stops updating before the deadline, the campaign is voided and every entry is refunded.`,
    burn: `YES if ${name}'s total supply is at or below ${t} before ${by}. Its mint authority is revoked, so supply can't grow back; entries lock the moment the target is reached. NO if the deadline passes first.`,
    lock: `YES if the ${name.replace(/ LP$/, "")} pool on Meteora has at least ${t} of liquidity locked for good before ${by}. Locked liquidity only grows; entries lock the moment the target is reached. NO otherwise.`,
    pool: `YES if the ${name} records at least ${t} at the start of the epoch measured at ${by}. NO if less. ${epoch}`,
    stake: `YES if ${name} has at least ${t} of active stake at the start of the epoch measured at ${by}. NO if less. ${epoch}`,
  };
  return `${T[c.kind]} If the account can't be read, the campaign is voided. A target met after the deadline still resolves NO.`;
}

function openedBy(c) {
  if (c.creatorIsTeam && c.partner)
    return `the Brot team for <a href="${c.partner.url}" target="_blank" rel="noopener">${esc(c.partner.name)}</a>, launch partner (free; no creator share)`;
  if (c.creatorIsTeam) return "the Brot team (free; no creator share)";
  return `${connected() && c.creator === DEMO_WALLET.address ? "you" : addr(c.creator)} (paid, prize ${sol(c.prize)})`;
}

export function head(c) {
  const [text, warn] = sub(c);
  const saved = state.saved.has(c.id);
  const band = hashQuery().get("seal") === "band";
  return `<header class="cp-head" data-block="head">
    <a class="cp-back" href="#/campaigns">${icon("arrow-left", 14)}All campaigns</a>
    <div class="cp-eyebrow">
      <span class="chip cp-kind ${KINDS[c.kind].cls}"><span aria-hidden="true">${KINDS[c.kind].tile}</span>${kindLabel(c)}</span>
      <span class="cp-name">${esc(c.asset)}</span>${band ? "" : seal(c)}
      <span class="cp-state">${stateChip(c)}${text ? `<span class="cp-sub${warn ? " is-warn" : ""}">${text}</span>` : ""}</span>
      ${c.creatorIsTeam ? '<span class="chip">Team</span>' : ""}${c.listed ? "" : '<span class="chip cp-unlisted">Unlisted</span>'}
      <span class="cp-tools"><button class="cp-tool" type="button" data-share aria-haspopup="menu" aria-expanded="false" aria-label="Share this campaign">${icon("share", 16)}</button>
        <button class="save cp-tool" type="button" data-save aria-pressed="${saved}" aria-label="${saved ? "Remove from saved" : "Save this campaign"}">${icon("bookmark", 16)}</button></span>
    </div>
    <h1 class="cp-title">${esc(c.sentence)}</h1>
    <p class="cp-rule">${rule(c)}</p>
    <p class="cp-by">Opened by ${openedBy(c)} · ${moment(c.opensAt)}</p>
    ${c.listed ? "" : `<p class="cp-unlisted-note">${icon("flag", 14)}<span><b>Not on the home page.</b> ${esc(c.unlistedNote ?? "")} It still resolves and pays.</span></p>`}
  </header>`;
}

/** The split-and-pot block, where the approved prototype had its chart (L-23: no chart). */
export function potBlock(c) {
  const p = pot(c);
  const ch = chancePair(c);
  const price = SOL_USD.price * 10 ** SOL_USD.expo;
  const won = c.status === "paid" && c.settleMode !== "onesided" ? c.outcome : null;
  const side = (s) => `<div class="cp-side-${s}${won ? (won === s ? " is-won" : " is-lost") : ""}">
      <small>${s.toUpperCase()}${won === s ? " · won" : ""}</small><strong class="num">${ch ? ch[s] : "–"}</strong><span>${sol(p[s])} on ${s.toUpperCase()}</span></div>`;
  const full1 = c.poolYes ? "YES" : "NO";
  const empty1 = c.poolYes ? "NO" : "YES";
  const note = !joinable(c, NOW) ? ""
    : !p.entries ? `<p class="cp-pot-note">No entries yet. The first wallet pays no fee if the pot ends one-sided.</p>`
    : !c.poolYes || !c.poolNo ? `<p class="cp-pot-note">Only ${full1} has entries so far. If ${empty1} stays empty, every entry is refunded: the first wallet in full, the others minus 1%.${p.prize ? " The prize goes back to whoever opened." : ""}</p>` : "";
  return `<section class="panel cp-pot" data-block="pot" aria-labelledby="cp-pot-h">
    <h2 class="panel-head" id="cp-pot-h">${icon("vault", 18)}Split and pot<span class="hint">${c.bakers} ${c.bakers === 1 ? "baker" : "bakers"}</span></h2>
    ${ch ? `<div class="cp-chance">${side("yes")}${side("no")}</div>` : `<p class="cp-nochance">No entries yet</p>`}
    ${splitBar(c, { legend: false })}
    <p class="cp-prize">${p.prize ? `<span class="cp-swatch" aria-hidden="true"></span>+ ${sol(p.prize)} prize from the opening, on no side` : "No prize: the team opened it for free."}</p>
    <p class="cp-total"><span>Pot</span><b class="num">${sol(p.total)}</b><span>${usdApprox((p.total / LAMPORTS) * price)}</span></p>
    ${note}
    <p class="cp-source">US$ at 1 SOL = US${usd(price, 2)} · Pyth SOL/USD · ${utc(SOL_USD.at)} · display only</p>
  </section>`;
}

const STEPS = [
  ["open", "Open"],
  ["closed", "Closed"],
  ["review", "In review"],
  ["paid", "Paid"],
  ["void", "Voided"],
];

/** The five public states with this campaign's place (P1 §3.1; TP §3.4.2). */
export function timeline(c) {
  const at = joinable(c, NOW) ? 0 : { open: 1, closed: 1, review: 2, contested: 2, paid: 3, void: 4 }[c.status];
  const r = result(c);
  const note = {
    open: at === 0 ? `Entries close ${moment(c.entriesCloseAt)}` : `Opened ${moment(c.opensAt)}`,
    closed: at === 1 ? `The chain is read at the deadline, ${moment(c.deadlineAt)}` : at > 1 ? `Entries closed ${moment(c.entriesCloseAt)}` : "5% of the time before the deadline",
    review: c.status === "contested" ? "Contested · payout paused" : c.status === "review" ? `Read: ${r} · pays ${moment(c.reviewEndsAt)}` : "6 hours; the team confirms or voids",
    paid: c.status === "paid" ? (c.settleMode === "onesided" ? "One-sided: entries refunded" : `Result: ${r}, all paid`) : "Automatically, to each wallet",
    void: c.status === "void" ? voidReason(c) : "If it can't be decided: full refunds",
  };
  const cls = (i) => [i === at ? "is-now" : i < at && !(at === 4 && i === 3) ? "is-done" : at === 4 && i === 3 ? "is-skip" : "", i === 4 ? "is-exit" : ""].join(" ").trim();
  return `<section class="panel cp-time" data-block="time" aria-labelledby="cp-time-h">
    <h2 class="panel-head" id="cp-time-h">${icon("clock", 18)}Where it is<span class="hint">Five public states</span></h2>
    <ol class="cp-steps">${STEPS.map(([k, label], i) => `<li class="${cls(i)}"${i === at ? ' aria-current="step"' : ""}>
      <b>${label}${i < at && cls(i) === "is-done" ? '<span class="sr-only">, done</span>' : ""}</b><small>${note[k]}</small></li>`).join("")}</ol>
  </section>`;
}
