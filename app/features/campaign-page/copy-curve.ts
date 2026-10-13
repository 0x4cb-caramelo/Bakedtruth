/**
 * Purpose: the words of a graduation campaign's curve on its page (D-m vocabulary; English per L-01): what the bar shows
 *          (the SOL raised against the curve's threshold), what is still missing, when the curve completed as the pool
 *          stamped it, its stage, and the risk every baker reads before joining: whoever pays the rest of the curve
 *          makes YES happen (the Meteora plan, M-6).
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05 (docs/technical/meteora-readers-plan.md)
 */
import { BOUGHT } from "./copy";

export const CURVE = {
  title: "The curve",
  raised: (raised: string, threshold: string) => `${raised} raised of ${threshold}`,
  filled: (percent: string) => `${percent} filled`,
  bar: (percent: string) => `The curve is ${percent} filled`,
  missing: (sol: string) => `${sol} still to raise before the curve completes and the token graduates.`,
  completed: (utc: string) => `The curve completed at ${utc}, the second the pool stamped.`,
  completedNoStamp: "The curve completed, but the pool recorded no time: after the deadline that counts as NO.",
  /** `migration_progress`, in words: 0 on the curve, then the three steps after it completes. */
  stage: ["On the curve", "Curve complete", "Curve complete, tokens vesting", "Graduated: the new pool is created"],
  bought: BOUGHT,
  boughtMore:
    "Paying the rest of the curve completes it at once, and the program then records YES from the pool's own stamp. The token's team is the one best placed to do it, so read this campaign as a question about what they will do.",
  priced: "Priced in SOL, as every graduation campaign is.",
} as const;
