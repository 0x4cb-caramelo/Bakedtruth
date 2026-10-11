/**
 * Purpose: the fee page's worked examples (BR-32), every number computed by the SDK's mirror of the program: the split
 *          of P1 §1.2 (6 SOL on YES and 4 SOL on NO, YES wins) through `snapshot`, the finalize math, with no prize, with
 *          a 4.5 SOL prize and as a team or partner campaign (no creator share); and the one-sided pot of P1 §3.5 (1, 2
 *          and 3 SOL, all on YES) through `oneSidedRefund`. P1's amounts are hundreds of a unit; here they are SOL,
 *          divided by 100, so every ratio is the same. Pure: no React.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { oneSidedRefund, snapshot, type Snapshot } from "@brot/sdk/read";

const SOL = 1_000_000_000n;
/** The rates every campaign opened under the founder's config carries (TP §3.4.16): 10%, 1%, 1%. */
export const RATES = { feeBps: 1_000, oneSidedFeeBps: 100, creatorShareBps: 100 } as const;
export const EXAMPLE = { yes: 6n * SOL, no: 4n * SOL, prize: (45n * SOL) / 10n } as const;

export type SplitExample = {
  prize: bigint;
  fee: bigint;
  creator: bigint;
  winners: bigint;
  /** What each 1 SOL on the winning side gets back, in thousandths, rounded down: 1583 is 1.583. */
  perOneMilli: bigint;
};

function split(prize: bigint, team: boolean): SplitExample {
  const s: Snapshot = snapshot({
    verdict: { kind: "Yes" },
    yesTotal: EXAMPLE.yes,
    noTotal: EXAMPLE.no,
    lateYes: 0n,
    lateNo: 0n,
    prize,
    openingFee: 0n,
    ...RATES,
    creatorIsTeam: team,
  });
  return {
    prize,
    fee: s.feeTotal,
    creator: s.creatorShare,
    winners: s.distributable,
    perOneMilli: (s.distributable * 1_000n) / s.winningTotal,
  };
}

/** YES wins: without a prize, with the 4.5 SOL prize, and on a team or partner campaign (no prize, no creator share). */
export const splitExamples = () => ({
  noPrize: split(0n, false),
  withPrize: split(EXAMPLE.prize, false),
  partner: split(0n, true),
});

/** Ana enters first with 1 SOL, Bruno with 2 and Carla with 3, all on YES; nobody enters NO. */
export const oneSidedExample = () =>
  [
    { name: "Ana", amount: 1n * SOL, first: true },
    { name: "Bruno", amount: 2n * SOL, first: false },
    { name: "Carla", amount: 3n * SOL, first: false },
  ].map((b) => ({ ...b, ...oneSidedRefund(b.amount, RATES.oneSidedFeeBps, b.first) }));

/** Thousandths as a ratio: 1583n → "1.583", 1600n → "1.6". */
export const perOne = (milli: bigint): string =>
  `${milli / 1_000n}.${(milli % 1_000n).toString().padStart(3, "0")}`.replace(/\.?0+$/, "");

/** Lamports as SOL with the trailing zeros dropped: 9_500_000_000n → "9.5". */
export const solText = (lamports: bigint): string => {
  const whole = lamports / SOL;
  const frac = (lamports % SOL).toString().padStart(9, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : `${whole}`;
};
