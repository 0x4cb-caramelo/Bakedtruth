/**
 * Purpose: the words of the fee page (BR-32; P1 §1.2, §3.3–§3.5, §3.7; D-m vocabulary; English per L-01): what Brot
 *          keeps, what the creator gets, the worked example, the one-sided pot, the void and where its opening fee
 *          goes (P-4), the opening's 90/10, the refund policy, and rent and network fees. On devnet nothing pays out by
 *          itself yet: no line promises an automatic payout or a time (the founder's answer, 2026-10-10). Every rule
 *          follows the program, the Economic Viability Rule included (2026-10-09, TP §3.4.18): a pot splits only when
 *          its losing side can pay Brot's fee and the creator's 1%; otherwise every entry is refunded.
 * Version: 0.2.0 (the Sprint 13 copy and legal reviews: the viability rule, the late-entry refund, shorter sentences)
 * Sprint:  13 (site: ranking, notices and copy)
 */
export const FEES = {
  kicker: "Fees · in SOL",
  title: "Who keeps what",
  lead: "Brot keeps 10% of the losing side. The creator gets 1% of the entries. When the losing side can pay those two, the side that was right splits the rest, prize included: your entry back plus your share of the rest. When it cannot, every entry is refunded instead.",

  keepsTitle: "What Brot keeps",
  keeps: [
    "10% of the losing side, when YES or NO wins and the losing side can pay the fees. The pot's fee comes only from the losing side.",
    "The opening fee: 10% of the US$500 a paid opening costs.",
    "1% of each entry in a refunded pot (one side only, or a losing side too small to pay the fees), except the first wallet's.",
    "Nothing from the entries of a voided campaign. The opening fee follows the cause (below).",
  ],
  creatorTitle: "What the creator gets",
  creator: [
    "1% of all the entries, taken from the pot, when YES or NO wins and the losing side can pay it and Brot's 10%.",
    "If the losing side is too small for both, the pot is refunded instead (below), and the creator gets nothing.",
    "Nothing on team and partner campaigns, in refunded pots or on voids, and never anything from the prize.",
  ],

  exampleTitle: "Worked example: YES wins",
  exampleIntro: "An example, not a promise: bakers put 6 SOL on YES and 4 SOL on NO, and YES wins.",
  rows: {
    yes: "Entries on YES",
    no: "Entries on NO",
    fee: "Brot's fee: 10% of the NO side",
    creator: "Creator: 1% of the 10 SOL entered",
    winners: "The YES side splits",
    perOne: "Each 1 SOL on YES gets back",
  },
  perOne: (ratio: string) => `${ratio} per 1`,
  withPrize: (prize: string, winners: string, ratio: string) =>
    `With a prize in the pot, the winners split it too. With a ${prize} SOL prize, the YES side splits ${winners} SOL: ${ratio} per 1.`,
  prizeSize:
    "A paid opening's prize is 90% of what it cost, so its size in SOL depends on the SOL price when the campaign opened.",
  partner: (winners: string, ratio: string) =>
    `On a team or partner campaign, with no prize and no creator share, the YES side splits ${winners} SOL: ${ratio} per 1.`,
  exampleNote: "The NO side gets nothing back. Each payout is rounded down to the lamport, the smallest unit of SOL.",

  oneSidedTitle: "One side only",
  oneSidedIntro:
    "Ana enters first with 1 SOL, then Bruno with 2 SOL and Carla with 3 SOL, all on YES. Nobody enters NO, so nobody lost, and every entry comes back, the first wallet's in full and the others less 1%.",
  oneSidedRow: (back: string, fee: string | null) => `${back} SOL back · ${fee ? `${fee} SOL fee` : "no fee"}`,
  first: "first",
  oneSidedNote: (kept: string) =>
    `Brot keeps ${kept} SOL and, on a paid campaign, the opening fee. The prize goes back to whoever opened. The creator gets nothing.`,
  tooSmall:
    "The same refund applies, whichever side was right, when the losing side is too small to pay Brot's fee and the creator's 1%.",

  voidTitle: "Voided",
  voidText:
    "When a campaign cannot be decided, every entry comes back in full, with no fee, and the prize goes back to whoever opened it.",
  voidHouse:
    "The opening fee comes back too when the cause was Brot's: a reading Brot's service missed, or a void the team records as Brot's fault.",
  voidOutside:
    "Brot keeps the opening fee when the cause was outside Brot: an account that can no longer be read, a price feed that stopped updating, or a void the team records as an outside cause.",
  voidEmpty: "With no entry at all, Brot keeps the opening fee whatever the cause.",

  openingTitle: "Opening a campaign",
  opening:
    "A wallet opens a campaign for US$500, paid in SOL at the Pyth SOL/USD price the transaction reads; on devnet that is test SOL. 90% (US$450) becomes the prize, in the pot on neither side. 10% (US$50) is Brot's opening fee, held in the campaign until it settles.",
  openingMax:
    "The wallet signs a maximum in SOL. If the price moves past it before the transaction lands, the opening fails: the US$500 is not taken, only the network fee.",
  openingRent:
    "Opening also needs a deposit for the campaign's two accounts (Solana's rent). It goes back to whoever opened when the campaign closes.",
  openingFree: "The team and launch partners open for free: no prize and no creator share.",
  openingSite: "Opening a campaign from this site is not available yet.",

  refundTitle: "Refund policy",
  refunds: [
    "Voided: every entry back in full, with no fee. The prize back to whoever opened.",
    "One side only, or a losing side too small to pay the fees: every entry back, the first wallet's in full and the others less 1%, whichever side was right. The prize back to whoever opened.",
    "On a price campaign that resolves YES, an entry made at or after the time of its YES proof comes back whole, with no fee.",
    "The opening fee comes back only when the cause of a void was Brot's.",
    "No early exit, and no refunds other than these. No instruction lets anyone, the team included, move or return an entry by hand.",
    "Payouts and refunds go to the wallet that entered, after the result is final. On devnet they are not sent automatically yet, and no time is promised.",
  ],

  costsTitle: "Rent and network fees",
  costs: [
    "Each entry opens a small account on Solana, and a wallet's first entry in a campaign opens one more. Their deposit (Solana's rent) comes back when the campaign settles, on either side.",
    "Every transaction pays Solana a network fee, about 0.000005 SOL per signature. You pay it when you join; whoever sends a payout pays it for that payout.",
    "No cap: a pot and an entry can be any size, from the 0.01 SOL minimum. A large entry lowers its own side's return.",
  ],
} as const;
