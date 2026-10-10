/**
 * Purpose: the four kinds of tests/vectors/math-vectors.csv (programs/brot-markets/tests/math_vectors.rs),
 *          each row's inputs passed to `@brot/sdk/read`'s math and its result printed as the Rust wrote it:
 *          `split` (house fee, creator share, distributable), `payout`, `one_sided` and `opening`.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 */
import {
  creatorShare,
  distributable,
  houseFee,
  oneSidedFee,
  openingPaidLamports,
  splitOpening,
  splitPayout,
} from "@brot/sdk/read";

import { attempt, shown } from "./outcome";

const pair = (share) => `(${share.fromPot}, ${share.fromFee})`;
const triple = (split) => `(${split.paid}, ${split.prize}, ${split.fee})`;

/** `split`: the house fee, then the share on that fee, then `distributable`, a refusal carried on as Rust's `and_then`. */
function split([w, l, r, feeBps, creatorBps]) {
  const [winning, losing, prize] = [BigInt(w), BigInt(l), BigInt(r)];
  const fee = attempt(() => houseFee(losing, Number(feeBps)));
  const share = fee.ok ? attempt(() => creatorShare(winning, losing, prize, fee.value, Number(creatorBps))) : fee;
  const dist = !fee.ok
    ? fee
    : !share.ok
      ? share
      : attempt(() => distributable(winning, losing, prize, fee.value, share.value.fromPot));
  return `${shown(fee)};${shown(share, pair)};${shown(dist)}`;
}

export const MATH_ROWS = {
  split,
  payout: ([entry, dist, winning]) => shown(attempt(() => splitPayout(BigInt(entry), BigInt(dist), BigInt(winning)))),
  one_sided: ([entry, bps, first]) => shown(attempt(() => oneSidedFee(BigInt(entry), Number(bps), first === "true"))),
  opening: ([usd, price, exponent, prizeBps]) =>
    shown(
      attempt(() => splitOpening(openingPaidLamports(BigInt(usd), BigInt(price), Number(exponent)), Number(prizeBps))),
      triple,
    ),
};
