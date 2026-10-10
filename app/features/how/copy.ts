/**
 * Purpose: the words of "How it works" (spec 3.2 and 3.15 of Sprint -1; D-m vocabulary; English per L-01): the six steps
 *          of a campaign from opening to payout, what chance means, why there is no early exit, the one-sided pot, the
 *          void, and who reads the result. Holds BP-5's line and the mascot's written name (BP-11), each once, so the
 *          founder's answer (P-9, open) changes one string. Nothing here promises an automatic payout or a time: on
 *          devnet nothing pays out by itself yet (the founder's answer, 2026-10-10).
 * Version: 0.2.0 (the Sprint 13 copy and legal reviews: the viability refund, the review's two facts, "Payout",
 *          the creator-control caveat next to BP-5's line)
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
      "Bakers join YES or NO with SOL, from 0.01 SOL. A side's chance is its share of the entries, not a forecast.",
    ],
    [
      "Entries close",
      "Entries close before the deadline: 5% of the campaign's length early, but never less than 24 hours or more than 7 days. They close sooner if the answer is already on-chain.",
    ],
    [
      "The chain is read",
      "The program reads the account. Target met: YES. Deadline passed without it: NO. Brot's service asks for the read, and any wallet can ask too; nobody chooses the result.",
    ],
    [
      "6-hour review",
      "For 6 hours the team can confirm the result. Nobody can change a YES into a NO or a NO into a YES. The team cannot void a YES or a NO; it can only record the cause of a void the program made first.",
    ],
    [
      "Payout",
      'The side that was right splits the pot, prize included. A pot with one side only, or with a losing side too small to pay the fees, refunds the entries instead; so does a void. A baker claims nothing. On devnet payouts are not sent automatically yet, and no time is promised: until then the campaign shows "Waiting for payout".',
    ],
  ] as const,
  moreTitle: "What that means for your SOL",
  more: [
    [
      "Chance is a share, not a forecast",
      "A side's chance is the share of the SOL entered that sits on it. It is not a probability. The estimated return you see before joining is net of Brot's 10% of the losing side and the creator's 1%. It changes with every entry until entries close.",
    ],
    [
      "No early exit",
      "An entry stays in the pot until the campaign is paid or voided. You cannot cancel it or move it to the other side.",
    ],
    [
      "One side only",
      "If nobody joins the other side, nobody lost, and every entry comes back: the first wallet's in full, the others less 1%. The same happens when the other side is too small to pay the fees. The prize goes back to whoever opened.",
    ],
    [
      "Voided",
      "When a campaign cannot be decided (its account can no longer be read, the reading was missed, or the price feed stopped updating), every entry comes back in full, with no fee.",
    ],
    [
      "Who reads the result",
      `${PRINCIPLE} The program opens the account the campaign named and compares its number with the target. Price campaigns read Pyth's signed price, checked on-chain. On burn, lock and stake campaigns, whoever opened the campaign may be able to move that number; those campaigns carry a notice. Anyone can re-check the account, the value read and the target on-chain.`,
    ],
  ] as const,
  costs: "Brot keeps 10% of the losing side; the creator gets 1% of the entries.",
  feesLink: "Fees, worked out",
  recordLink: "Who can do what",
  campaignsLink: "See the campaigns",
  mascot: `${MASCOT_NAME}, the bread on these pages, is Brot's mascot. It only believes accounts.`,
} as const;
