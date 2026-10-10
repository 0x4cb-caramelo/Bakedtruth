/**
 * Purpose: the words of the fee page (BR-32; P1 §1.2, §3.3–§3.5, §3.7; D-m vocabulary; English per L-01): what Brot
 *          keeps, what the creator gets, the worked example, the one-sided pot, the void and where its opening fee
 *          goes (P-4), the opening's 90/10, the refund policy, and rent and network fees. On devnet nothing pays out by
 *          itself yet: no line promises an automatic payout or a time (the founder's answer, 2026-10-10).
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
export const FEES = {
  kicker: "Fees · in SOL",
  title: "Who keeps what",
  lead: "Brot keeps 10% of the losing side. The creator gets 1% of the entries. The side that was right splits the rest, prize included: if you were right, you get your entry back plus your share of the rest.",

  keepsTitle: "What Brot keeps",
  keeps: [
    "10% of the losing side, when YES or NO wins. The pot's fee comes only from the losing side.",
    "The opening fee: 10% of the US$500 a paid opening costs.",
    "1% of each entry in a one-sided pot, except the first wallet's.",
    "Nothing from the entries of a voided campaign. The opening fee follows the cause (below).",
  ],
  creatorTitle: "What the creator gets",
  creator: [
    "1% of the entries, from the pot, when YES or NO wins with entries on both sides.",
    "From Brot's fee instead, only for the part the losing side cannot cover: the winners never get back less than they put in.",
    "Nothing on team and partner campaigns, in one-sided pots or on voids, and never anything from the prize.",
  ],

  exampleTitle: "Worked example: YES wins",
  exampleIntro: "Bakers put 6 SOL on YES and 4 SOL on NO. YES wins.",
  rows: {
    yes: "Entries on YES",
    no: "Entries on NO",
    fee: "Brot's fee: 10% of NO",
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
  exampleNote: "The NO side gets nothing back. Each payout is rounded down to the lamport.",

  oneSidedTitle: "One side only",
  oneSidedIntro:
    "Ana enters first with 1 SOL, then Bruno with 2 SOL and Carla with 3 SOL, all on YES. Nobody enters NO, so nobody lost, and every entry comes back.",
  oneSidedRow: (back: string, fee: string | null) => `${back} SOL back · ${fee ? `${fee} SOL fee` : "no fee"}`,
  first: "first",
  oneSidedNote: (kept: string) =>
    `Brot keeps ${kept} SOL and the opening fee. The prize goes back to whoever opened. The creator gets nothing. The same refund applies when the losing side is too small to cover the fees.`,

  voidTitle: "Voided",
  voidText:
    "When a campaign cannot be decided, every entry comes back in full, with no fee, and the prize goes back to whoever opened it.",
  voidHouse:
    "The opening fee comes back too when the cause was Brot's: a reading Brot's service missed, or a team void for a failure on Brot's side.",
  voidOutside:
    "Brot keeps the opening fee when the cause was outside Brot: an account that can no longer be read, a price feed that stopped updating, or a team void for an outside cause.",
  voidEmpty: "With no entry at all, Brot keeps the opening fee whatever the cause.",

  openingTitle: "Opening a campaign",
  opening:
    "A wallet opens a campaign for US$500, paid in SOL at the Pyth SOL/USD price the transaction reads. 90% (US$450) becomes the prize, in the pot on neither side; 10% (US$50) is Brot's opening fee, held in the campaign until its result.",
  openingMax:
    "The wallet signs a maximum in SOL: if the price moves past it before the transaction lands, the opening fails and the US$500 is not taken (only the network fee is).",
  openingFree: "The team and launch partners open for free: no prize and no creator share.",
  openingSite: "Opening a campaign from this site is not available yet.",

  refundTitle: "Refund policy",
  refunds: [
    "Voided: every entry back in full, with no fee. The prize back to whoever opened.",
    "One side only: every entry back, the first wallet's in full and the others less 1%. The prize back to whoever opened.",
    "The opening fee comes back only when the cause of a void was Brot's.",
    "No early exit and no other refunds. No instruction lets anyone, the team included, move or return an entry by hand.",
    "Payouts and refunds go to the wallet that entered, after the result is final. On devnet they are not sent automatically yet, and no time is promised.",
  ],

  costsTitle: "Rent and network fees",
  costs: [
    "Each entry opens a small account on Solana, and a wallet's first entry in a campaign opens one more. Their deposit (Solana's rent) comes back when the campaign settles, on either side.",
    "Every transaction pays Solana a network fee, about 0.000005 SOL per signature. You pay it when you join; whoever sends a payout pays it for that payout.",
    "No cap: a pot and an entry can be any size, from the 0.01 SOL minimum. A large entry lowers its own side's return.",
  ],
} as const;
