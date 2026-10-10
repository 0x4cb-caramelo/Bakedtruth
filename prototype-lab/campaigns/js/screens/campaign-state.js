/**
 * Purpose: the campaign page's blocks that change with the state. The state card takes the entry panel's place once
 *          entries close (spec 3.5 table): closed with the deadline clock; in review with the reading, the 6-hour clock
 *          and "can't switch YES and NO"; contested, paused at stage 1; paid with what each 1 SOL received, Brot's fee
 *          and the creator share (held when below the rent minimum); paid one-sided; voided with the reason, the
 *          refunds and where the 10% opening fee went. Also "You're in" for the connected wallet, the about rows, the
 *          creator notice (BR-26), the report line and the share block.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Money from model.js (TP §3.4.16); void classes from P-4.
 */
import { RESERVED } from "../data/index.js";
import { countdown, esc, LAMPORTS, rel, sol, utc, value } from "../format.js";
import { payoutOf, pot, result, settleSplit } from "../model.js";
import { voidReason } from "../ui/card.js";
import { ENTRY_RENT, hashQuery, per } from "../ui/entry.js";
import { icon } from "../ui/icons.js";
import { notice, TEXT } from "../ui/notices.js";
import { chancePair, KINDS, moment, seal, splitBar, stateChip } from "../ui/parts.js";
import { addr, copyBtn, int } from "./campaign-proof.js";

const HOUSE = ["missed-window", "team-house"]; // the voids Brot caused: the 10% opening fee goes back (P-4)
const facts = (list) =>
  `<dl class="cp-facts">${list.filter(Boolean).map(([k, v, n]) => `<div><dt>${k}</dt><dd>${v}${n ? `<small>${n}</small>` : ""}</dd></div>`).join("")}</dl>`;
const split = (c, side) => {
  const [V, P] = side === "yes" ? [c.poolYes, c.poolNo] : [c.poolNo, c.poolYes];
  return { V, P, s: settleSplit({ V, P, R: c.prize, feeBps: c.feeBps, shareBps: c.creatorShareBps }) };
};

/** What a wallet's entry on `side` gets if that side wins, with the pot as it stands. */
function payNow(c, side, amount, first) {
  const { V, P, s } = split(c, side);
  if (!P) return { lone: true, back: first ? amount : amount - Math.ceil(amount / 100) };
  return { back: Number(payoutOf(amount, s.distributable, V)), multiple: Number(payoutOf(LAMPORTS, s.distributable, V)) / LAMPORTS };
}

export function statePanel(c) {
  const r = result(c);
  const other = r === "YES" ? "NO" : "YES";
  const o = c.observed;
  const read = o ? `<p class="cp-read"><b class="num">${value(o.value, c.unit)}</b><span>${esc(o.label)} · target ${c.direction === "below" ? "≤" : "≥"} ${value(c.target, c.unit)}</span><small>slot ${int(o.slot)} · ${utc(o.at)}</small></p>` : "";
  const big = (label) => `<p class="cp-result ${(r ?? "").toLowerCase()}"><small>${label}</small><b class="num">${r}</b></p>`;
  const clock = (ts, label) => `<p class="cp-clock"><b class="num">${countdown(ts)}</b><span>${label}</span></p>`;
  const report = `<p class="cp-report-line">Think this reading is wrong? <button class="btn quiet small" type="button" data-report>${icon("flag", 14)}Tell the team</button></p>`;
  const views = {
    closed: () => ["tired", "Waiting for the deadline.", "Entries closed",
      `${clock(c.deadlineAt, "until the deadline")}<p>Entries closed ${utc(c.entriesCloseAt)}. Deadline ${utc(c.deadlineAt)}; then the chain is read.</p>`],
    review: () => ["impatient", "Six hours. Then it pays.", "In review",
      `${big("Read")}${read}${clock(c.reviewEndsAt, "left in the 6-hour window")}<p>Paid automatically at the end of the 6-hour window: ${utc(c.reviewEndsAt)}.</p>
       <p class="cp-quiet">The team can confirm sooner or void. It can't switch YES and NO.</p>${report}`],
    contested: () => ["skeptical", "Reading it twice.", "In review",
      `<p class="cp-sub is-warn">Contested · payout paused</p>${big("Read")}${read}${clock(c.contestEndsAt, "left in stage 1")}
       <p>Payout paused. The team opened a contest at ${utc(c.contestEndsAt - 3_600_000)}. Stage 1: a second read from another source by ${utc(c.contestEndsAt)} (${rel(c.contestEndsAt)}). Same reading: payout goes ahead. Different: up to 48 hours for three team members, who can only confirm or void.</p>`],
    paid: () => {
      if (c.settleMode === "onesided") {
        const empty = c.poolYes ? "NO" : "YES";
        return ["deadpan", "Nobody to pay. Refunded.", "Paid · one-sided", `${big("Result")}${read}
          <p>One-sided pot: nobody joined ${empty}. Entries refunded: the first wallet in full, the others minus 1%. The prize went back to whoever opened.</p>
          ${facts([["Entries refunded", sol(c.poolYes + c.poolNo), "Less 1%, except the first wallet"], c.prize && ["Prize returned", sol(c.prize), "To whoever opened"], c.openingFee && ["Opening fee", sol(c.openingFee), "Kept: one-sided pot"]])}`];
      }
      const { V, s } = split(c, c.outcome);
      const held = RESERVED.find((x) => x.id === c.id && x.role === "creator");
      return ["approve", "Fine. It checks out.", "Paid", `${big("Result")}${read}<p>Paid automatically to the ${r} side's wallets. All paid.</p>${facts([
        [`1 SOL on ${r} received`, sol(Number(payoutOf(LAMPORTS, s.distributable, V)), { round: "down" })],
        ["Split among winners", sol(Number(s.distributable), { round: "down" }), "The pot, less Brot's fee and the creator's 1%"],
        ["Brot kept", sol(Number(s.brot)), `10% of the ${other} side`],
        ["Creator share", c.creatorShareBps ? sol(Number(s.creator), { round: "down" }) : "None", held ? `Held: below the ${sol(held.minimum, { exact: true })} an empty wallet needs. Retried daily.` : c.creatorShareBps ? "1% of the entries" : "Team campaign"],
      ])}`];
    },
    void: () => {
      const house = HOUSE.includes(c.voidReason);
      return ["sulking", "Nobody wins. Everyone's refunded.", "Voided", `<p class="cp-result void"><small>Result</small><b class="num">Voided</b></p>
        <p><b>${voidReason(c)}.</b> Every entry refunded in full, no fee. The prize went back to whoever opened. Opening fee: ${house ? "refunded (Brot's service caused this)" : "kept (outside cause)"}.</p>
        ${facts([["Entries refunded", sol(c.poolYes + c.poolNo), "In full, no fee"], c.prize && ["Prize returned", sol(c.prize), "To whoever opened"], c.openingFee && ["Opening fee", sol(c.openingFee), house ? "Refunded" : "Kept"]])}
        ${c.voidNote ? `<blockquote class="cp-log"><p>${esc(c.voidNote)}</p><small>Public record · content/void-log</small></blockquote>` : ""}`];
    },
  };
  const key = c.status === "open" ? "closed" : c.status;
  const [pose, say, title, body] = views[key]();
  return `<section class="panel cp-card-state is-${key}" data-perch="result" data-perch-x="0.84" data-perch-size="0.95" data-perch-pose="${pose}" data-perch-say="${say}" aria-labelledby="cp-state-h">
    <h2 class="panel-head" id="cp-state-h">${title}</h2>${body}</section>`;
}

/** Country switch on (K-11): the panel goes, the rest of the page stays. */
export const geoPanel = () =>
  `<section class="panel cp-card-state" aria-labelledby="cp-geo-h"><h2 class="panel-head" id="cp-geo-h">${icon("globe", 18)}Join this campaign</h2>${notice("info", TEXT.geo)}</section>`;

/** "You're in": the connected wallet's entry, its estimate now, or what it received. */
export function yourEntry(c, mine) {
  if (!mine) return "";
  const r = result(c)?.toLowerCase();
  const sides = ["yes", "no"].filter((s) => mine[s] > 0);
  const now = (s) => {
    const x = payNow(c, s, mine[s], mine.first);
    if (x.lone) return `If ${s === "yes" ? "NO" : "YES"} stays empty: ≈ ${sol(x.back, { round: "down" })} back.`;
    return `If ${s.toUpperCase()} wins: ≈ ${sol(x.back, { round: "down" })} (est. ${per(x.multiple)} per 1 now).`;
  };
  const text =
    mine.received != null
      ? `You received <b>${sol(mine.received, { round: "down" })}</b> ${moment(mine.receivedAt)}, + ${sol(ENTRY_RENT, { exact: true })} account rent returned.`
      : r === "yes" || r === "no"
        ? mine[r] ? `If the reading stands: ≈ ${sol(payNow(c, r, mine[r]).back, { round: "down" })}, paid at ${utc(c.reviewEndsAt)}.` : `If the reading stands: 0 SOL back; the account rent (${sol(ENTRY_RENT, { exact: true })}) comes back.`
        : sides.map(now).join(" ");
  return `<section class="panel cp-mine" data-block="mine" id="your-entry" tabindex="-1" aria-labelledby="cp-mine-h">
    <h2 class="panel-head" id="cp-mine-h">${icon("receipt", 18)}You're in<span class="hint">joined ${moment(mine.at)}${mine.first ? " · first wallet" : ""}</span></h2>
    <p class="cp-mine-sides">${sides.map((s) => `<span class="chip ${s}">${s.toUpperCase()}</span><b class="num">${sol(mine[s])}</b>`).join("")}</p>
    <p class="cp-mine-text">${text}</p></section>`;
}

const PUSHABLE = ["burn", "lock", "pool", "stake"];
/** Notices #4 and #5 (P1 §4.2, BP-14): on the kinds whoever opened can push. Factual, not alarming. */
export function creatorNotice(c) {
  if (!PUSHABLE.includes(c.kind)) return "";
  const flag = c.creatorJoined ? ` The creator's wallet has an entry: <b>${c.creatorJoined.toUpperCase()}</b>.` : "";
  return `<div class="cp-creator" data-block="creator" role="note">${icon("alert", 18)}<p><b>Whoever opened this campaign can control the result and may have an entry on YES or NO.</b>${flag}</p></div>`;
}

export function about(c) {
  const band = hashQuery().get("seal") === "band" && c.partner;
  const rows = [
    ["Campaign id", `<span class="mono">${c.id}</span>${copyBtn(c.id, "campaign id")}`],
    ["Opened", utc(c.opensAt)],
    ["Opened by", c.creatorIsTeam ? `Brot team · ${addr(c.creator)}` : addr(c.creator)],
    band && ["Opened for", `${seal(c)} <a href="${c.partner.url}" target="_blank" rel="noopener">${esc(c.partner.name)}</a>`],
    ["Kind", `${KINDS[c.kind].long} · template v${c.templateVersion}`],
    ["Fees", `Brot keeps 10% of the losing side · ${c.creatorShareBps ? "creator 1% of entries" : "no creator share"}`],
    ["One side only", `Every entry is refunded: the first wallet in full, the others minus 1%.${c.prize ? " The prize goes back to whoever opened." : ""}`],
    ["Voided", `Every entry is refunded in full, no fee.${c.prize ? " The prize goes back to whoever opened; the 10% opening fee is refunded if Brot's service caused it, kept otherwise." : ""}`],
    ["Who decides", "No human picks the winner. The team can only confirm or void a result, within 6 hours."],
    !c.listed && ["Listing", `Unlisted. ${esc(c.unlistedNote ?? "")} It still resolves and pays.`],
  ].filter(Boolean);
  return `<section class="panel cp-about" data-block="about" aria-labelledby="cp-about-h"><h2 class="panel-head" id="cp-about-h">${icon("info", 18)}About this campaign</h2>
    <dl class="rows cp-rows">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></section>`;
}

export const reportLink = (c) =>
  `<p class="cp-report" data-block="report"><button class="btn quiet" type="button" data-report>${icon("flag", 15)}Report this campaign</button>${c.status === "review" ? `<span>Think this reading is wrong? Tell the team before ${utc(c.reviewEndsAt)}.</span>` : ""}</p>`;

/** The share block: the card X shows with the link (#/card/:id) and the Share menu. */
export function shareBlock(c) {
  const ch = chancePair(c);
  return `<section class="panel cp-share" data-block="share" aria-labelledby="cp-share-h">
    <h2 class="panel-head" id="cp-share-h">${icon("share", 18)}Share<span class="hint">Every campaign has a card to post on X</span></h2>
    <a class="cp-sc" href="#/card/${c.id}" aria-label="Open this campaign's share card">
      <span class="cp-sc-top"><b>brot<i>.markets</i></b>${stateChip(c)}</span><span class="cp-sc-q">${esc(c.sentence)}</span>
      ${splitBar(c, { thin: true, legend: false })}
      <span class="cp-sc-foot"><span>${ch ? `YES ${ch.yes} · NO ${ch.no}` : "No entries yet"}</span><span>${sol(pot(c).total)} pot</span></span></a>
    <div class="cp-share-act"><button class="btn" type="button" data-share aria-haspopup="menu" aria-expanded="false">${icon("share", 15)}Share</button></div>
  </section>`;
}
