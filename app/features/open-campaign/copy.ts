/**
 * Purpose: the creation box's words (spec 3.12 of Sprint -1; BR-01, BR-02, BR-26; D-m vocabulary; English per L-01): the
 *          four sections, the slots and their help, the account check's states, the preview's money lines, the team
 *          key's variant, the notices before paying, and what the box stops on its own before the program would. The
 *          program's refusals have their own file (copy-refusals.ts); the signing steps are in copy-sheet.ts.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { CREATOR_NOTICE } from "../campaign-page/copy";

export const BOX = {
  kicker: "Any wallet, inside the rules",
  kickerTeam: "Team key",
  title: "Open a campaign",
  lede: "US$500 in SOL; 90% becomes the prize in your campaign's pot. You fill the slots and the site writes the sentence; the program checks every rule again when you sign.",
  ledeTeam:
    "Your wallet is a team key: this opening is free, with no prize and no creator share. You fill the slots and the site writes the sentence; the program checks every rule again when you sign.",
  fromLink: "Filled from a link. Check every field: a link never signs anything.",
  what: "What",
  details: "Details",
  preview: "Preview",
  cost: "Cost",
  notSigned: "Not signed",
  template: (id: string, version: number) => `Template ${id} v${version}`,
} as const;

export const WHAT = {
  search: "What should the chain answer?",
  placeholder: "Try: BTC 120000, burn, stake pool",
  searchHelp: "A search over the templates and the known names. What you type here is never sent or stored.",
  outside: "We can't check this on-chain. Questions we can check:",
  count: (n: number) => `${n} suggestions.`,
  countOutside: (n: number) => `We can't check this on-chain. ${n} questions we can check.`,
  orPick: "Or pick a kind",
  opensNow: "Opens now",
  opensLater: "Opens after a YES on devnet",
  kindLong: {
    price: "A Pyth price reaches a target",
    burn: "A token's supply falls to a target",
    lock: "A Meteora pool's locked liquidity reaches a target",
    pool: "A stake pool holds a target at an epoch's start",
    stake: "A validator's stake reaches a target in an epoch",
  },
} as const;

export const SLOTS = {
  sentence: "Your sentence",
  asset: "Asset · Pyth feeds on the program's list",
  assetHelp: "Each feed is read live; one that isn't fresh or verified right now can't back a campaign.",
  noAccount: "No price account",
  otherFeeds: (n: number) => `${n} more listed feeds, not usable right now`,
  fresh: (age: string) => `Fresh · ${age} ago`,
  direction: "Direction",
  above: "Reaches or goes above",
  below: "Falls to or below",
  target: {
    price: "Target (US$)",
    burn: "Target supply (raw units, as the mint stores them)",
    lock: "Target liquidity locked for good (raw units)",
    pool: "Target (SOL in the pool)",
    stake: "Target (SOL staked)",
  },
  targetHelp: "Use a dot for decimals. The program compares raw values.",
  now: (value: string, below: boolean) => `Now ${value}; the target must be ${below ? "below" : "above"} it`,
  epoch: "Epoch",
  epochHelp: (now: string) =>
    `The epoch whose start is measured. Now: epoch ${now}. Entries close at its start at the latest.`,
  deadline: "Deadline · 3 to 90 days from now",
  days: (n: number) => `${n} days`,
  date: "Date, your time",
  time: "Time, your time",
  inUtc: "In UTC:",
  closes: (utc: string) =>
    `Entries close ${utc}: 5% of the time before the deadline, at least 24 h and at most 7 days.`,
  usd: "Opening amount · above US$500 the extra is a bigger prize, at the same 90/10",
  custom: "Custom, whole US$",
} as const;

export const ACCOUNT = {
  label: (slot: string) => slot,
  placeholder: "Paste an address or pick a known name",
  help: "Any account the reader accepts. A name shows only when two people reviewed the account.",
  notAddress: "A Solana address is 32 to 44 letters and digits.",
  checking: "Reading the account through the site's RPC…",
  missing: "No account at this address on this network.",
  readFailed: "Couldn't read this account right now. Try again.",
  checkAgain: "Check again",
  named: (name: string, owner: string) => `${name} · ${owner} · reviewed name`,
  unnamed: (owner: string) => `${owner} · no reviewed name`,
  known: "Known names",
  explorer: "Explorer",
} as const;

export const PREVIEW = {
  pick: (what: string) => `Pick ${what} to see its value now.`,
  now: (name: string) => `${name} now`,
  yesAt: (below: boolean) => `YES at or ${below ? "below" : "above"}`,
  ifResolvedNow: "If resolved now",
  decidedAtEpoch: "Decided at the epoch's start",
  noTarget: "No target yet",
  rule: "The rule",
  asItAppears: "As it will appear in the list",
  cardWhenFilled: "The card appears once every slot is filled.",
  creatorNotice: `Your campaign will show: "${CREATOR_NOTICE}"`,
  money: "The money",
  theAsset: "The asset",
  theAccount: "The account",
  priceAccount: (symbol: string) => `Pyth's ${symbol} price account`,
  accountOf: (name: string | null, owner: string) => `${name ?? "No reviewed name"}, ${owner}`,
  /** The rule's words for a slot not filled yet. */
  gaps: { asset: "the asset", target: "the target", deadline: "the deadline", epoch: "the chosen epoch" },
  labels: {
    reads: "Reads",
    rule: "YES and NO",
    deadline: "Deadline",
    closes: "Entries close",
    oneSided: "Refunds",
    voided: "Voided",
    noEntry: "No entry",
    who: "Who decides",
  },
  /** The fee page's refund policy, in the same words (features/fees/copy.ts). */
  oneSided:
    "One side only, or a losing side too small to pay the fees: every entry back, the first wallet's in full and the others less 1%, whichever side was right. The prize back to whoever opened.",
  voided:
    "Every entry is refunded in full and the prize returns to whoever opened; the opening fee too, only if Brot's service caused the void.",
  who: (principle: string) =>
    `${principle} The program reads the account; Brot's team can only confirm or void a result during the review window.`,
  opening: (sol: string, usd: string, prize: string, fee: string) =>
    `Opening: ${sol} SOL, for ${usd}: ${prize} becomes the prize, ${fee} is Brot's opening fee`,
  most: (sol: string) => `Most you'll pay for it (max_lamports): ${sol} SOL`,
} as const;

export const MONEY = {
  charge: (usd: string, sol: string, price: string, at: string) =>
    `${usd} = ${sol} SOL at Pyth SOL/USD ${price}, its price minus its confidence band, published ${at}`,
  opening: "Opening",
  prize: "Prize in the pot (90%)",
  prizeNote: "On no side. Returns to you if the pot ends one-sided or the campaign is voided",
  fee: "Opening fee (10%)",
  feeNote: "Held until the outcome; refunded only if Brot's service causes a void",
  most: "Most you'll pay",
  mostNote: "The quote plus 1% for price moves. Past it the program refuses the opening and nothing is charged",
  rent: "Account rent",
  rentNote: "For the campaign and its vault; returned to you when the campaign closes",
  network: "Network fee",
  total: "Total now",
  atMost: (sol: string) => `At most ${sol} SOL`,
  free: "Free (team key)",
  noPrize: "None: a team key's opening has no prize",
  onEntries: (feePct: string, sharePct: string | null) =>
    `On entries: Brot keeps ${feePct} of the losing side · ${sharePct ? `you get ${sharePct} of the entries when the pot splits` : "no creator share"} · no cap on the pot`,
  usdSource: "The US$ values are the opening's own terms; the SOL is what the program charges at Pyth's price.",
  balanceOk: (sol: string) => `Balance ${sol} SOL, enough`,
  balanceShort: (need: string, has: string) => `You need ${need} SOL; this wallet has ${has} SOL.`,
  faucet: "Get test SOL",
} as const;

/** Before paying (Sprint 12's copy review; TP §3.4.10 "A campaign with no entries"): said next to the price. */
export const NO_ENTRY_RULE =
  "If the campaign ends with no entry at all, the prize comes back to you and Brot keeps the 10% opening fee, even when Brot's service caused a void.";
/** The opening is a commitment: there is no early exit for a prize either (P1 §3.10). */
export const NO_TAKE_BACK = "The opening can't be taken back: the prize stays in the pot until the campaign ends.";

export const TEAM = {
  note: "Team key: this opening is free, with no prize and no creator share. A launch partner's campaign is linked to the partner by Brot's team, apart from this box.",
} as const;

export const ACTION = {
  review: "Review and sign",
  ready: "Nothing is signed until your wallet asks.",
  wait: "The program checks every rule again when you sign.",
  also: (tags: string) => `Also: ${tags}`,
} as const;

/** What the box stops on its own before the program would, each with a short tag for the button. */
export const ISSUES = {
  connect: ["Connect a wallet to open.", "Connect wallet"],
  reading: ["Reading the program's config and the price…", "Reading the chain"],
  readFailed: ["Couldn't read the chain right now. The box tries again by itself.", "Can't reach Solana"],
  noConfig: ["The program isn't set up on this network.", "Not set up"],
  feed: ["Pick an asset.", "Pick an asset"],
  account: ["Paste an account's address, or pick a known name.", "Pick an account"],
  accountWait: ["Reading the account…", "Checking the account"],
  noAccount: ["No account at this address on this network.", "No account there"],
  target: ["Set a target.", "Set a target"],
  targetFormat: ["Write the target as a plain number, with a dot for decimals.", "Check the target"],
  epoch: ["Pick an epoch.", "Pick an epoch"],
  deadline: ["Pick a date and a time.", "Pick a deadline"],
  margin: ["Leave 10 minutes more than 3 days, so the transaction lands inside the rule.", "Deadline too soon"],
  usd: ["Whole US$ only, at least 500.", "At least US$500"],
  site: ["Openings are off on this site right now. Campaigns already open are not affected.", "Openings off here"],
  balance: ["", "Not enough SOL"],
} as const;
