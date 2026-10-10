/**
 * Purpose: X0.3, the TypeScript half, first file: every vector the program's Rust math wrote into
 *          tests/vectors/math-vectors.csv (programs/brot-markets/tests/math_vectors.rs: the house fee,
 *          the creator share, the distributable pot, the split payout, the one-sided fee, the opening)
 *          is replayed through the SDK, refusals included, with no mismatch.
 *          `bun test tests/ -t "sdk math matches rust vectors"` runs both vector files.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, test } from "bun:test";

import {
  creatorShare,
  distributable,
  houseFee,
  oneSidedFee,
  openingPaidLamports,
  splitOpening,
  splitPayout,
} from "@brot/sdk/read";

import { attempt, replayFile, show, then, tuple } from "./vectors";

function replay(kind: string, inputs: string[]): string {
  const big = (i: number) => BigInt(inputs[i]);
  const num = (i: number) => Number(inputs[i]);
  switch (kind) {
    case "split": {
      const [winning, losing, prize, feeBps, creatorBps] = [big(0), big(1), big(2), num(3), num(4)];
      const fee = attempt(() => houseFee(losing, feeBps));
      const share = then(fee, (f) => creatorShare(winning, losing, prize, f, creatorBps));
      const dist = !fee.ok ? fee : then(share, (s) => distributable(winning, losing, prize, fee.value, s.fromPot));
      return [show(fee), show(share, (s) => tuple(s.fromPot, s.fromFee)), show(dist)].join(";");
    }
    case "payout":
      return show(attempt(() => splitPayout(big(0), big(1), big(2))));
    case "one_sided":
      return show(attempt(() => oneSidedFee(big(0), num(1), inputs[2] === "true")));
    case "opening": {
      const paid = attempt(() => openingPaidLamports(big(0), big(1), num(2)));
      return show(
        then(paid, (p) => splitOpening(p, num(3))),
        (s) => tuple(s.paid, s.prize, s.fee),
      );
    }
    default:
      throw new Error(`unknown vector kind ${kind}`);
  }
}

describe("sdk math matches rust vectors", () => {
  test("tests/vectors/math-vectors.csv: fee, share, distributable, payout, one-sided fee, opening", () => {
    replayFile("tests/vectors/math-vectors.csv", replay);
  });
});
