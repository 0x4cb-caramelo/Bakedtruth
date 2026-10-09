/**
 * Purpose: what the screens compute from a campaign: the pot's parts, the chance (each side's share of the
 *          entries), the estimated return of an entry net of Brot's fee and the creator's 1% (TP §3.4.16, in BigInt
 *          so it matches the program to the lamport), the one-sided refund, the opening price in lamports, and the
 *          public state with its label.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Sprint 05's SDK mirrors the program; this file only has
 *          to show the right numbers for the design. Checked against TP worked examples A and C (review.js).
 */
const B = (n) => BigInt(Math.round(Number(n)));
const ceilDiv = (a, b) => (a + b - 1n) / b;
const BPS = 10_000n;

/** The pot: entries on each side plus the prize, which belongs to no side. */
export function pot(c) {
  const total = c.poolYes + c.poolNo + c.prize;
  return { yes: c.poolYes, no: c.poolNo, prize: c.prize, entries: c.poolYes + c.poolNo, total };
}

/** Each side's share of the entries (P1 §3.2: "chance"); null while nobody has joined. */
export function chance(c) {
  const sum = c.poolYes + c.poolNo;
  return sum ? { yes: c.poolYes / sum, no: c.poolNo / sum } : null;
}

/** Split mode for a winning side V against a losing side P with prize R (TP §3.4.16, P-2). */
export function settleSplit({ V, P, R, feeBps = 1000, shareBps = 100 }) {
  [V, P, R] = [B(V), B(P), B(R)];
  const fee = ceilDiv(P * B(feeBps), BPS);
  const C = ((V + P) * B(shareBps)) / BPS;
  const room = P - fee + R;
  const fromPot = C < room ? C : room;
  const rest = C - fromPot;
  const fromFee = rest < fee ? rest : fee;
  const distributable = V + P - fee - fromPot + R;
  return { fee, creator: fromPot + fromFee, brot: fee - fromFee, distributable };
}

/** What one winning entry receives from `distributable` (floor, as the program pays it). */
export const payoutOf = (entry, distributable, V) => (B(entry) * B(distributable)) / B(V);

/**
 * The estimate shown before an entry: if `side` won with the pot as it would stand after this entry. With the
 * other side empty it is the one-sided refund instead (1% fee, none for the first wallet; P1 §3.5).
 */
export function estimate(c, side, amount, { first = false } = {}) {
  const mine = side === "yes" ? c.poolYes : c.poolNo;
  const other = side === "yes" ? c.poolNo : c.poolYes;
  if (!amount) return null;
  if (other === 0) {
    const fee = first ? 0n : ceilDiv(B(amount) * B(c.oneSidedFeeBps ?? 100), BPS);
    return { mode: "onesided", back: Number(B(amount) - fee), fee: Number(fee) };
  }
  const V = mine + amount;
  const s = settleSplit({ V, P: other, R: c.prize, feeBps: c.feeBps, shareBps: c.creatorShareBps });
  const payout = Number(payoutOf(amount, s.distributable, V));
  return { mode: "split", payout, multiple: payout / amount, profit: payout - amount, fee: Number(s.fee), creator: Number(s.creator) };
}

/** The opening price: ceil(usd × 10^(9 − e) ÷ p), then 90% prize and the rest Brot's fee (TP §3.4.16). */
export function opening(usd, price, expo = -8, prizeBps = 9000) {
  const paid = ceilDiv(B(usd) * 10n ** B(9 - expo), B(price));
  const prize = (paid * B(prizeBps)) / BPS;
  return { paid: Number(paid), prize: Number(prize), fee: Number(paid - prize) };
}

/** The five public states (P1 §3.1) plus the contested stage, with the chip class each one wears. */
export const STATES = {
  open: { label: "Open", cls: "state-open" },
  closed: { label: "Closed", cls: "state-closed" },
  review: { label: "In review", cls: "state-review" },
  // TP §3.4.2 folds Contested into "In review"; its own public name is L-04, a founder question (Sprint 12).
  contested: { label: "In review", sub: "Contested · payout paused", cls: "state-contest" },
  paid: { label: "Paid", cls: "state-paid" },
  void: { label: "Voided", cls: "state-void" },
};

/** The result in words: "YES", "NO", "Voided", or null while it is not known. */
export function result(c) {
  if (c.outcome === "yes") return "YES";
  if (c.outcome === "no") return "NO";
  if (c.outcome === "void") return "Voided";
  return null;
}

/** True when a wallet can still join (state open, before entries close, not paused). */
export const joinable = (c, now) => c.status === "open" && now < c.entriesCloseAt;
