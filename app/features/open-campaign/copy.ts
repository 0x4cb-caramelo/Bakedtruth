/**
 * Purpose: the creation box's words (spec 3.12 of Sprint -1; BR-01, BR-02, BR-26; D-m vocabulary; English per L-01): the
 *          four sections, the five kinds' words, the fields and their help by unit, the account check's states and the
 *          preview. The money, the notices before paying and what the box stops on its own are in copy-money.ts; the
 *          program's refusals in copy-refusals.ts; the signing steps in copy-sheet.ts.
 * Version: 0.2.0 (the Sprint 19 copy, legal and adversarial reviews: plainer words, help by unit, the team variant)
 * Sprint:  19 (site: open a campaign)
 */
import { CREATOR_NOTICE, RAW_UNIT } from "../campaign-page/copy";
import type { KindName } from "../campaign-page/proof";

export const BOX = {
  kicker: "Any wallet, inside the rules",
  kickerTeam: "Team key",
  title: "Open a campaign",
  lede: "From US$500 in SOL: 90% becomes the prize in your campaign's pot, 10% is Brot's opening fee. You fill in the fields and the site writes the sentence. The program checks every rule again when you sign.",
  ledeTeam:
    "Your wallet is a team key: this opening is free, with no prize and no creator share. You fill in the fields and the site writes the sentence. The program checks every rule again when you sign.",
  fromLink: "Filled from a link. Check every field: a link never signs anything.",
  what: "What",
  details: "Details",
  preview: "Preview",
  cost: "Cost",
  notSigned: "Not signed",
  template: (id: string, version: number) => `Template ${id} v${version}`,
} as const;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const WHAT = {
  search: "What should the chain answer?",
  placeholder: "Try: BTC 120000, burn, stake pool",
  searchHelp: "A search over the templates and the known names. What you type here is never sent or stored.",
  outside: "We can't check this on-chain. Questions we can check:",
  count: (n: number) => `${plural(n, "suggestion", "suggestions")}.`,
  countOutside: (n: number) => `We can't check this on-chain. ${plural(n, "question", "questions")} we can check.`,
  pythPrice: "Pyth price",
  orPick: "Or pick a kind",
  opensNow: "Open now",
  opensLater: "Opens after a test YES on devnet",
  kindLong: {
    price: "A Pyth price reaches a target",
    burn: "A token's supply falls to a target",
    lock: "A Meteora pool's locked liquidity reaches a target",
    pool: "A stake pool's SOL reaches a target at an epoch's start",
    stake: "A validator's stake reaches a target in an epoch",
  },
} as const;

/** Each kind's account slot, the program that must own it, and the account named in a sentence of help. */
export const KIND_WORDS: Record<KindName, { slot: string | null; owner: string; phrase: string; unit: string }> = {
  price: { slot: null, owner: "the Pyth receiver", phrase: "Pyth price account", unit: "" },
  burn: { slot: "Token mint", owner: "the classic SPL Token program", phrase: "token mint", unit: RAW_UNIT.burn ?? "" },
  lock: { slot: "DAMM v2 pool", owner: "Meteora DAMM v2", phrase: "DAMM v2 pool", unit: RAW_UNIT.lock ?? "" },
  pool: { slot: "Stake pool", owner: "the SPL Stake Pool program", phrase: "stake pool", unit: "SOL" },
  stake: { slot: "Vote account", owner: "the Vote program", phrase: "vote account", unit: "SOL" },
};

export const SLOTS = {
  sentence: "Your sentence",
  asset: "Asset · Pyth feeds on the program's list",
  assetHelp: "Each feed is read live; one that isn't fresh or verified right now can't back a campaign.",
  noAccount: "No price account",
  otherFeeds: (n: number) => `${plural(n, "more listed feed", "more listed feeds")}, not usable right now`,
  fresh: (age: string) => `Fresh · ${age} ago`,
  direction: "Direction",
  above: "Reaches or goes above",
  below: "Falls to or below",
  /** The sentence's gaps, while a field is empty. */
  gap: { asset: "asset", target: "target", epoch: "epoch" },
  target: {
    price: "Target (US$)",
    burn: "Target supply (raw units, as the mint stores them)",
    lock: "Target liquidity locked for good (liquidity units)",
    pool: "Target (SOL in the pool)",
    stake: "Target (SOL staked)",
  },
  targetHelp: {
    price:
      "Use a dot for decimals, like 120000.50: at most 2 decimals, or 6 significant digits below US$1. Commas only group thousands.",
    burn: "A whole number of raw units, no decimals. Commas only group thousands. A token with 6 decimals stores 1 token as 1,000,000.",
    lock: "A whole number of liquidity units, no decimals. Commas only group thousands.",
    pool: "SOL, with a dot for decimals: at most 4 of them. Commas only group thousands.",
    stake: "SOL, with a dot for decimals: at most 4 of them. Commas only group thousands.",
  },
  now: (value: string, below: boolean) => `Now ${value}; the target must be ${below ? "below" : "above"} it.`,
  epoch: "Epoch",
  epochHelp: (now: string) =>
    `The epoch whose start is measured. Now: epoch ${now}. Entries close at its start at the latest.`,
  deadline: "Deadline · 3 to 90 days from now",
  days: (n: number) => `${n} days`,
  date: "Date (your time zone)",
  time: "Time (your time zone)",
  inUtc: "In UTC:",
  closes: (utc: string) =>
    `Entries close ${utc}: 5% of the campaign's length before the deadline, never less than 24 hours and never more than 7 days.`,
  usd: "Opening amount · US$500 or more. The whole amount is split 90% prize, 10% Brot's opening fee.",
  custom: "Custom, whole US$",
} as const;

export const ACCOUNT = {
  placeholder: "Paste an address or pick a known name",
  help: "Any account the program accepts for this kind. A name shows only when two people have reviewed it.",
  notAddress: "A Solana address is 32 to 44 letters and digits.",
  checking: "Reading the account on Solana…",
  missing: "No account at this address on this network.",
  readFailed: "Couldn't read this account right now. Try again.",
  checkAgain: "Check again",
  named: (name: string, owner: string) => `${name} · owned by ${owner} · reviewed name`,
  unnamed: (owner: string) => `Owned by ${owner} · no reviewed name`,
  known: "Known names",
  explorer: "Explorer",
} as const;

export const PREVIEW = {
  now: (name: string) => `${name} now`,
  yesAt: (below: boolean) => `YES at or ${below ? "below" : "above"}`,
  ifResolvedNow: "If resolved now",
  decidedAtEpoch: "Decided at the epoch's start",
  noTarget: "No target yet",
  rule: "The rule",
  asItAppears: "As it will appear in the list",
  cardWhenFilled: "The card appears once every field is filled in.",
  creatorNotice: `Your campaign will show: "${CREATOR_NOTICE}"`,
  /** The Sprint 19 adversarial review (M6): the creator is not the only one who can move these numbers. */
  othersCanPush: {
    burn: "Anyone who holds enough of this token can also burn it down to the target, and the prize you put in goes to the side that was right.",
    lock: "Anyone who holds liquidity in this pool can also lock it for good, and the prize you put in goes to the side that was right.",
    pool: "Others can also deposit into this stake pool, where it accepts deposits, or withdraw from it before the measured epoch, and the prize you put in goes to the side that was right.",
    stake:
      "Anyone can also delegate stake to this validator, and its stakers can take theirs away, before the measured epoch, and the prize you put in goes to the side that was right.",
  },
  money: "The money",
  theAsset: "The asset",
  theAccount: "The account",
  priceAccount: (symbol: string) => `Pyth's ${symbol} price account`,
  accountOf: (name: string | null, owner: string) =>
    name ? `${name}, owned by ${owner}` : `Owned by ${owner}, no reviewed name`,
  /** The rule's words for a field not filled in yet. */
  gaps: { asset: "(asset)", account: "(account)", target: "(target)", deadline: "(deadline)", epoch: "(epoch)" },
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
  /** The fee page's refund policy, in the same words (features/fees/copy.ts); a team key's opening has no prize. */
  oneSided:
    "One side only, or a losing side too small to pay the fees: every entry back, the first wallet's in full and the others less 1%, whichever side was right. The prize back to whoever opened.",
  oneSidedTeam:
    "One side only, or a losing side too small to pay the fees: every entry back, the first wallet's in full and the others less 1%, whichever side was right.",
  voided:
    "Every entry is refunded in full and the prize returns to whoever opened; the opening fee too, only if the void is Brot's fault.",
  voidedTeam: "Every entry is refunded in full.",
  who: (principle: string, team = false) =>
    `${principle} The program reads the account. During the review window a team key can confirm a YES or a NO, never change it; when the program voided a campaign by itself, the team records the cause${team ? "" : ", which decides whether the opening fee comes back"}. On devnet one key can still replace the program at any time.`,
  whoCreator: "On this kind, whoever opened the campaign may be able to move the number the program reads.",
  whoLink: "Who can do what",
  opening: (sol: string, usd: string, prize: string, fee: string) =>
    `Opening: ${sol} SOL, for ${usd}: ${prize} becomes the prize, ${fee} is Brot's opening fee`,
  most: (sol: string) => `Most you'll pay for it: ${sol} SOL`,
} as const;
