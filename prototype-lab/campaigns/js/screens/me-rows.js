/**
 * Purpose: the rows of "My entries": one per campaign the wallet joined, with the sentence, the side or sides and
 *          the amount, the state, and what matters in that state: the estimate now while entries are open (net of
 *          Brot's 10% of the losing side and the creator's 1%), what it gets if the result read is confirmed while
 *          it waits, and what arrived, and when, once paid or voided. Also sorts the entries into their tabs.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Spec 3.8; Sprint 12 reads the same from the chain and
 *          /api/v1, and checks the totals against the wallet's EntrySettled events.
 */
import { byId, ENTRIES } from "../data/index.js";
import { countdown, esc, NOW, sol, utc } from "../format.js";
import { estimate, joinable, payoutOf, result, settleSplit } from "../model.js";
import { voidReason } from "../ui/card.js";
import { kindLabel, kindTile, moment, stateChip } from "../ui/parts.js";

/** Rent of a baker's `Entry` account, returned with its payout, losers included (spec 1.6, measured in Sprint 02). */
export const ENTRY_RENT = 1_158_240;

/** "2.59 per 1": a return written as the spec writes it, floored to two decimals, never "×". */
export const per1 = (got, put) => `${(Math.floor((got / put) * 100) / 100).toFixed(2)} per 1`;

/** The wallet's entries with their campaigns, newest first. */
export const joined = () =>
  ENTRIES.map((e) => ({ e, c: byId(e.id) }))
    .filter((x) => x.c)
    .sort((a, b) => b.e.at - a.e.at);

/** The tab an entry sits in: still open to entries, waiting for its result, or done (paid or voided). */
export const tabOf = (c) => (["paid", "void"].includes(c.status) ? "done" : joinable(c, NOW) ? "open" : "waiting");

const sides = (e) => [["yes", e.yes], ["no", e.no]].filter(([, a]) => a > 0);
const up = (side) => side.toUpperCase();
const got = (lamports) => sol(lamports, { round: "down" });

/**
 * What an entry already in the pot returns if `side` wins, with the pot as it stands. `estimate()` first adds the
 * amount to its side, which is right before joining and counts it twice after. With the other side empty, the refund.
 */
export function standing(c, side, amount, first) {
  const [mine, other] = side === "yes" ? [c.poolYes, c.poolNo] : [c.poolNo, c.poolYes];
  if (!other) return estimate(c, side, amount, { first });
  const s = settleSplit({ V: mine, P: other, R: c.prize, feeBps: c.feeBps, shareBps: c.creatorShareBps });
  return { mode: "split", payout: Number(payoutOf(amount, s.distributable, mine)) };
}

/** What the wallet gets if `outcome` ("yes", "no" or "void") is the one confirmed. */
const ifOutcome = (c, e, outcome) =>
  outcome === "void"
    ? e.yes + e.no
    : sides(e).reduce((sum, [side, a]) => {
        const s = standing(c, side, a, e.first);
        return sum + (s.mode === "onesided" ? s.back : side === outcome ? s.payout : 0);
      }, 0);

const out = (label, value, sub, { cls = "", note = "" } = {}) =>
  `<p class="pg-out ${cls}"><small>${label}</small><b class="num">${value}</b><span>${sub}</span>${note ? `<em>${note}</em>` : ""}</p>`;

/** Open: the estimate if the side wins, or the refund while the other side is still empty. */
const whileOpen = (c, e) =>
  sides(e)
    .map(([side, a]) => {
      const s = standing(c, side, a, e.first);
      if (s.mode === "onesided")
        return out(`If ${side === "yes" ? "NO" : "YES"} stays empty`, `≈ ${got(s.back)}`, e.first ? "Full refund: first wallet, no fee" : "Refund less the 1% fee");
      return out(`If ${up(side)} wins`, `≈ ${got(s.payout)}`, `est. ${per1(s.payout, a)} · it changes until entries close`);
    })
    .join("");

/** Waiting: what arrives if the result read is confirmed; before the read, each outcome of the wallet's side. */
function whileWaiting(c, e) {
  const r = result(c);
  if (!r) return sides(e).map(([side]) => out(`If ${up(side)} wins`, got(ifOutcome(c, e, side)), "Fixed: entries are closed")).join("");
  const amount = got(ifOutcome(c, e, c.outcome));
  if (c.status === "contested") return out("If confirmed", amount, "Payout paused while the result is checked");
  const what = c.outcome === "void" ? "Refunded in full" : "Paid automatically";
  return out("If confirmed", amount, `${what} at the end of the 6-hour window: ${utc(c.reviewEndsAt)}`);
}

/** Done: what arrived and when, with the entry's rent back. */
function done(c, e) {
  const when = moment(e.receivedAt);
  const rent = `+ ${sol(ENTRY_RENT, { exact: true })} rent returned`;
  if (c.status === "void") return out("Refunded", got(e.received), `In full, no fee · ${when}`, { note: rent });
  if (c.settleMode === "onesided")
    return out("Refunded", got(e.received), `${e.first ? "First wallet: no fee" : "Less the 1% fee"} · ${when}`, { note: rent });
  if (e.received > 0) return out("Received", got(e.received), `${per1(e.received, e.yes + e.no)} · ${when}`, { cls: "won", note: rent });
  return out("Received", sol(0), `Not on the winning side: ${result(c)} won · ${when}`, { cls: "lost", note: "Entry rent returned" });
}

/** Where the campaign stands, in words, next to its state chip. */
function where(c) {
  const r = result(c);
  if (joinable(c, NOW)) return `Entries close ${moment(c.entriesCloseAt)}`;
  if (c.status === "review") return `Read: ${r} · <span class="tabular">${countdown(c.reviewEndsAt)}</span> left in review`;
  if (c.status === "contested") return "Contested · payout paused";
  if (c.status === "void") return voidReason(c);
  if (c.status === "paid") return c.settleMode === "onesided" ? "One-sided: entries refunded" : `${r} won`;
  return `Entries closed · the account is read ${moment(c.deadlineAt)}`;
}

/** One entry row: what, how much on which side, where it stands, and the number that matters now. */
export function entryRow({ e, c }) {
  const tab = tabOf(c);
  const body = tab === "open" ? whileOpen(c, e) : tab === "waiting" ? whileWaiting(c, e) : done(c, e);
  const mine = sides(e)
    .map(([s, a]) => `<span class="pg-side"><span class="chip ${s}">${up(s)}</span><b class="num">${sol(a)}</b></span>`)
    .join("");
  return `<li class="pg-entry">
    <div class="pg-what">${kindTile(c, "sm")}<div><a href="#/c/${c.id}">${esc(c.sentence)}</a>
      <span>${kindLabel(c)} · ${esc(c.asset)} · joined ${moment(e.at)}</span></div></div>
    <div class="pg-mine"><span class="sr-only">Your entry:</span>${mine}</div>
    <div class="pg-where">${stateChip(c)}<span>${where(c)}</span></div>
    <div class="pg-outs">${body}</div></li>`;
}
