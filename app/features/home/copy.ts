/**
 * Purpose: the home page's words (the UI overhaul), from the approved prototype (prototype-lab/campaigns, home.js and
 *          home-mosaic.js) where they hold on devnet, and changed where they do not: payouts are not sent
 *          automatically on devnet yet (the fee page's words), and a reserved creator share has its "Receive". A copy
 *          file, so the vocabulary test reads it.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
export const HOME = {
  // The pitch's cover, in the site's own vocabulary (Ronaldo, 2026-10-11).
  title: "Campaigns the chain resolves.",
  sub: "Permissionless campaigns that turn on-chain milestones into growth, settled by the chain itself.",
  open: "Open a campaign",
  // No-break spaces keep the second clause whole, so a phone breaks the line at the "·".
  cost: "Opening a campaign costs US$500 in SOL · 90% becomes its prize",
  // The creator's 1% is of the entries, never of the prize (the fee page's words); the hook a creator comes for.
  creator: "The creator gets 1% of all entries when YES or NO wins",
  now: (sol: string, usd: string) => `Now ${sol} at Pyth SOL/USD ${usd}`,
  reading: "Reading Pyth's SOL/USD price…",
  paused: "New campaigns are paused right now.",
  stale: "Paid openings wait for a fresh SOL/USD price.",
  openNow: "Open now",
  noOpen: "No campaign takes entries on the home page right now.",
  closing: "Closing soon",
  answered: "Answered recently",
  nothingOpen: "Nothing is open right now.",
  nothingAnswered: "Nothing answered yet.",
  how: "How it works",
  howLink: "Every step, fee and refund",
  howClose: "Hide “How it works”",
  howCloseHint: "Hide this in this browser. Every step stays on the How it works page.",
  loadFailed: "Couldn't load campaigns.",
  loadFailedNote: "Your SOL is on-chain and unaffected. Reload the page to try again.",
} as const;

export const STEPS: readonly (readonly [string, string])[] = [
  [
    "Open a campaign",
    "Any wallet opens one for US$500 in SOL: 90% is a prize in the pot, 10% goes to Brot. The site writes the campaign from the kind, the account, the target and the date.",
  ],
  [
    "Join YES or NO with SOL",
    "Bakers put SOL on a side, from 0.01 SOL. Chance is each side's share of the entries. Entries close before the deadline, 24 hours to 7 days ahead, or once the answer is known.",
  ],
  [
    "The program reads the answer",
    "Target met: YES. Deadline passed without it: NO. After a 6-hour review, the winning side splits the pot, and one-sided pots and voided campaigns refund every entry.",
  ],
];

export const PRINCIPLES: readonly (readonly ["eye" | "vault" | "wallet", string, string])[] = [
  [
    "eye",
    "The chain answers",
    "A campaign opens only if a Solana account holds its answer; price campaigns read Pyth's price on-chain. No human picks the winner: the 6-hour review can confirm or void a result, never switch it.",
  ],
  [
    "vault",
    "One pot, in SOL",
    "YES or NO, one pot. The winning side splits it with the prize. Brot keeps 10% of the losing side; the creator gets 1% of the entries.",
  ],
  [
    "wallet",
    "Paid to your wallet",
    "After the 6-hour review, payouts go to the wallets that entered; on devnet they are not sent automatically yet. No early exit.",
  ],
];

/** The line under a slide's two sides, by how many sides have entries. */
export const SLIDE_NOTE = {
  empty: "No entries yet. If the pot stays one-sided, the first wallet gets its entry back in full.",
  lone: (side: string, other: string) =>
    `Only ${side} has entries so far. If ${other} stays empty, every entry is refunded: the first wallet in full, the others minus 1%.`,
  both: (creator: boolean) =>
    `Estimates, not promises: what 1 SOL returns if that side wins, prize included, net of Brot's 10% of the losing side${creator ? " and the creator's 1%" : ""}. They change with every entry.`,
} as const;

/** The toolbar: the five states and "Saved", the kinds, the sort, and the switch for unlisted campaigns. */
export const TOOLBAR = {
  states: { open: "Open", closed: "Closed", in_review: "In review", paid: "Paid", void: "Voided", saved: "Saved" },
  sorts: { ranking: "Ranked", pot: "Pot", close: "Entries close", chance: "YES chance" },
  sort: "Sort",
  allKinds: "All kinds",
  unlisted: "All campaigns, unlisted too",
  listedOnly: "Listed campaigns only",
  count: (n: number) => `${n || "No"} campaign${n === 1 ? "" : "s"}`,
  empty: "No campaigns here.",
  emptySaved: "Nothing saved yet. The bookmark on a card keeps it here, in this browser.",
  clear: "Clear filters",
} as const;
