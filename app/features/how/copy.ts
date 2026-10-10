/**
 * Purpose: the words of "How it works" (spec 3.2 and 3.15 of Sprint -1; D-m vocabulary; English per L-01): the six steps
 *          of a campaign from opening to payout, what chance means, why there is no early exit, the one-sided pot, the
 *          void, and who reads the result. Holds BP-5's line and the mascot's written name (BP-11), each once, so the
 *          founder's answer (P-9, open) changes one string. Nothing here promises an automatic payout or a time: on
 *          devnet nothing pays out by itself yet (the founder's answer, 2026-10-10).
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */

/** BP-5, as recommended (P-9, open): the line P1 §4.6 puts in place of the pitch's old one. Change it here only. */
export const PRINCIPLE = "No human picks the winner.";

/** BP-11, as recommended (P-9, open): Baked in writing; Cacetinho is only the spoken nickname. Change it here only. */
export const MASCOT_NAME = "Baked";

export const HOW = {
  kicker: "How it works",
  title: "A question the chain answers",
  lead: "An On-Chain Campaign is a YES/NO question about one Solana account. Bakers put SOL on YES or NO. When the time comes, the program reads the account, and the side that was right splits the pot.",
  stepsTitle: "Six steps, from opening to payout",
  steps: [
    [
      "Open",
      "A wallet opens a campaign for US$500 in SOL: 90% becomes a prize in the pot, 10% goes to Brot. The team and launch partners open for free. The question is written from the kind, the account, the target and the date, never from free text.",
    ],
    [
      "Join",
      "Bakers put SOL on YES or NO, from 0.01 SOL. A side's chance is its share of the entries, not a forecast.",
    ],
    [
      "Entries close",
      "When 5% of the campaign's time is left (at least 24 hours and at most 7 days before the deadline), or earlier, once the answer is already on-chain.",
    ],
    [
      "The chain is read",
      "The program reads the account. Target met: YES. Deadline passed without it: NO. Brot's service asks for the read, and any wallet can ask too; nobody chooses the result.",
    ],
    [
      "6-hour review",
      "For 6 hours the team can confirm the result. Nobody can change a YES into a NO or a NO into a YES, and the team can void a campaign only when the program voided it first.",
    ],
    [
      "Paid",
      "The side that was right splits the pot, prize included; one-sided and voided campaigns refund the entries. Payouts go to each wallet, with nothing for a baker to claim. On devnet they are not sent automatically yet, and no time is promised.",
    ],
  ] as const,
  moreTitle: "What that means for your SOL",
  more: [
    [
      "Chance is a share, not a forecast",
      "A side's chance is the share of the SOL entered that sits on it. Nobody computed a probability. The estimated return you see before joining is net of Brot's 10% of the losing side and the creator's 1%, and it changes with every entry until entries close.",
    ],
    [
      "No early exit",
      "An entry stays in the pot until the campaign is paid or voided. You cannot cancel it or move it to the other side.",
    ],
    [
      "One side only",
      "If nobody joins the other side, nobody lost, and every entry comes back: the first wallet's in full, the others less 1%. The prize goes back to whoever opened.",
    ],
    [
      "Voided",
      "When a campaign cannot be decided (its account can no longer be read, the reading was missed, or the price feed stopped updating), every entry comes back in full, with no fee.",
    ],
    [
      "Who reads the result",
      `${PRINCIPLE} The program opens the account the campaign named and compares its number with the target. Price campaigns read Pyth's signed price, checked on-chain. Anyone can re-check: same account, same answer.`,
    ],
  ] as const,
  costs: "Brot keeps 10% of the losing side; the creator gets 1% of the entries.",
  feesLink: "Fees, worked out",
  recordLink: "Who can do what",
  campaignsLink: "See the campaigns",
  mascot: `${MASCOT_NAME}, the bread on these pages, is Brot's mascot. It only believes accounts.`,
} as const;
