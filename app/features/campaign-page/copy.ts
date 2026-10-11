/**
 * Purpose: the campaign page's words (BR-23, BR-26, BR-27; D-m vocabulary; English per L-01): the rule of each kind in
 *          plain words, the proof's labels, the price facts and the screen when no fresh price exists (L-22), the
 *          re-check panel, the creator notice (BR-26, BP-14's recommendation, still open in P-9), the pot, the activity
 *          and the state card. The entry panel's words are in features/entry/copy.ts.
 * Version: 0.3.0 (the UI overhaul: the rule in one line, the full rule and the proof's details folded; 0.2.1,
 *          Sprint 19: the burn and lock rules and units; 0.2.0, Sprint 12: the closed account)
 * Sprint:  11 (site: campaign page and entry); 12
 */
import type { KindName } from "./proof";

/** The unit a burn or a lock number is read in (the Sprint 19 copy review, M8): the program compares raw values. */
export const RAW_UNIT: Partial<Record<KindName, string>> = { burn: "raw units", lock: "liquidity units" };

export const KIND_NAME: Record<KindName, string> = {
  price: "Price",
  burn: "Burn",
  lock: "Lock",
  pool: "Stake pool",
  stake: "Stake",
};

/** BR-26, on burn, lock and stake kinds: factual, not alarming. */
export const CREATOR_NOTICE = "Whoever opened this campaign can control the result and may have an entry on YES or NO.";
export const creatorHasEntry = (sides: string) => `The creator's wallet has an entry: ${sides}.`;

const UNREADABLE = "If the account cannot be read, the campaign is voided.";
/** Burn and lock (TP §3.4.6): a read after the deadline records NO, even when the target was met by then. */
const BEFORE = "YES counts only if the program reads it before the deadline; read later, it resolves NO.";
const EPOCH =
  "Entries close when that epoch starts, or earlier on the campaign's schedule. If Brot's service misses its reading, the campaign is voided and every entry refunded.";

/** The rule in plain words, from the kind's template (spec 3.5): names come only from the pinned lists (A-11). */
export function ruleText(a: {
  kind: KindName;
  name: string;
  target: string;
  below: boolean;
  deadline: string;
  epoch: string;
}): string {
  const rules: Record<KindName, string> = {
    price: `YES if Pyth's ${a.name} price reaches ${a.target} ${a.below ? "or less" : "or more"}, with its whole confidence band past it, at any moment before ${a.deadline}; that resolves YES at once and locks entries. It counts once a signed Pyth price showing it is posted on-chain within 60 seconds of publication, so a touch of a few seconds may not count. NO if the deadline passes without one; a touch after it does not count. If the price feed stops updating before the deadline, the campaign is voided and every entry is refunded.`,
    burn: `YES if the total supply of the mint ${a.name} is at or below ${a.target} raw units (the token's smallest unit) before ${a.deadline}. Its mint authority is revoked, so the supply cannot grow back; entries lock the moment the target is reached. ${BEFORE}`,
    lock: `YES if the Meteora pool ${a.name} has at least ${a.target} liquidity units locked for good before ${a.deadline}. Locked liquidity only grows; entries lock the moment the target is reached. ${BEFORE}`,
    pool: `YES if the stake pool ${a.name} records at least ${a.target} at the start of epoch ${a.epoch}. NO if less. ${EPOCH}`,
    stake: `YES if the vote account ${a.name} has at least ${a.target} of active stake in epoch ${a.epoch}. NO if less. ${EPOCH}`,
  };
  return `${rules[a.kind]} ${UNREADABLE}`;
}

/**
 * The rule in one line, with only what decides it: the condition, the target and the deadline (Ronaldo, 2026-10-11).
 * The whole rule (`ruleText`) stays one click away, under "Full rules".
 */
export function ruleShort(a: {
  kind: KindName;
  name: string;
  target: string;
  below: boolean;
  deadline: string;
  epoch: string;
}): string {
  const rules: Record<KindName, string> = {
    price: `YES if ${a.name} ${a.below ? `falls to ${a.target} or less` : `reaches ${a.target} or more`} before ${a.deadline}.`,
    burn: `YES if the supply of ${a.name} falls to ${a.target} raw units or less before ${a.deadline}.`,
    lock: `YES if the Meteora pool ${a.name} has at least ${a.target} liquidity units locked for good before ${a.deadline}.`,
    pool: `YES if the stake pool ${a.name} holds at least ${a.target} at the start of epoch ${a.epoch}.`,
    stake: `YES if the vote account ${a.name} has at least ${a.target} of active stake in epoch ${a.epoch}.`,
  };
  return `${rules[a.kind]} Otherwise NO.`;
}

export const PAGE = {
  back: "All campaigns",
  fullRules: "Full rules",
  notFound: "No campaign at this address",
  notFoundText: (id: string) => `Nothing of this program lives at campaign id ${id}. The link may be wrong.`,
  closedAccount: "This campaign is settled",
  closedAccountText:
    "Every payout went out and the program closed the campaign's account. Its history stays on-chain; what your wallet received is in My entries.",
  loadFailed: "Can't reach Solana right now",
  loadFailedText: "The page could not read the campaign from the network. It tries again by itself.",
  team: "Team",
  openedByTeam: "Opened by the Brot team (free; no creator share)",
  openedBy: (who: string, prize: string) => `Opened by ${who} (paid; prize ${prize} SOL)`,
  stateAsOf: (slot: string) => `State at chain slot ${slot}`,
} as const;

export const PROOF = {
  title: "On-chain proof",
  read: (when: string) => `Read ${when}`,
  valueNow: "Value read now",
  target: "Target",
  ifReadNow: "If read now",
  ifYes: "the target is met",
  ifNo: "the target isn't met",
  undecided: "Decided at the measured epoch's start",
  account: "Account read",
  owner: "Owner checked first",
  entriesClose: "Entries close",
  entriesClosed: "Entries closed",
  deadline: "Deadline",
  deadlinePassed: "Deadline passed",
  details: "Proof details",
  resolution: "Resolution",
  resolutionText:
    "The program reads the account. Brot's scheduled service triggers it once the answer is known or the deadline passes; any wallet can.",
  missing: "The account can't be read now: it does not exist.",
  problem: (name: string) => `The account can't be read the way the program reads it (${name}).`,
  recorded: "Recorded by the program",
  measured: (epoch: string) => `Measured at the start of epoch ${epoch}. The value shown is the pool's total now.`,
  stakeNote: (epoch: string) => `The program reads the epoch stake in epoch ${epoch}; the re-check below shows it now.`,
  toGo: (gap: string, rate: string) => `${gap} to go · ${rate}`,
} as const;

export const PRICE = {
  current: "Current price",
  confidence: (conf: string) => `± ${conf} confidence`,
  published: (age: string, slot: string) => `Published ${age} · posted at slot ${slot}`,
  maxAge: (seconds: number) =>
    `Entries need a price at most ${seconds} s old (this campaign's limit; never below 30 s).`,
  stale: (asset: string, age: string, max: number) =>
    `No fresh ${asset} price: the last one on-chain is ${age} old, more than this campaign's ${max} s. Entries wait for the next update; on devnet it comes about once a minute.`,
  ahead: "The price update is ahead of the cluster's clock; entries wait until it is in range.",
  tooClose:
    "The price is within 1% of the target, so the answer could come at any moment: entries wait until it moves away.",
} as const;

export const RECHECK = {
  title: "Re-check it yourself",
  hint: "Same account, same answer.",
  account: "Account",
  owner: "Owner program",
  field: "Field",
  value: "Value",
  slot: "Chain slot when read",
  exponent: "Exponent · confidence",
  anyRpc: "Any RPC works. The public devnet endpoint is rate-limited.",
  command: "Command",
  copy: "Copy",
  copied: "Copied.",
  copyBlocked: "The browser blocked copying: select the text and copy it.",
  run: "Re-check through this site's RPC",
  running: "Reading…",
  recorded: "Recorded by the program",
  reread: "Read again now",
  matches: "Same value: the account still shows what the program recorded.",
  consistent: "Consistent: the field moved only the way it can, and the result still holds.",
  differs: "Different: compare through another RPC before you trust either.",
  cannot: (note: string) => `A later read can't show the recorded value: ${note}.`,
  failed: "The re-check could not read through this RPC. Try again, or run a command below through another one.",
} as const;

export const POT = {
  title: "Split and pot",
  bakers: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,
  noEntries: "No entries yet",
  onSide: (sol: string, side: string) => `${sol} SOL on ${side}`,
  prize: (sol: string) => `+ ${sol} SOL prize from the opening, on no side`,
  noPrize: "No prize: the team opened it for free.",
  pot: "Pot",
  empty: "No entries yet. The first wallet pays no fee if the pot ends one-sided.",
  oneSided: (full: string, empty: string) =>
    `Only ${full} has entries so far. If ${empty} stays empty, every entry is refunded: the first wallet in full, the others less the one-sided fee.`,
} as const;

export const ACTIVITY = {
  title: "Recent entries",
  hint: (n: number) => `From the campaign's last ${n} transactions, read on-chain`,
  history: "YES chance after each entry",
  point: (n: number, pct: number) => `after entry ${n}, ${pct}%`,
  firstEntry: "entry 1",
  lastEntry: (n: number) => `entry ${n}`,
  endLabel: (pct: number) => `YES ${pct}%`,
  readout: (n: number) => ` · after entry ${n}`,
  none: "No entries yet.",
  failed: "The recent entries could not be read now.",
  row: (side: string, sol: string) => `${side} ${sol} SOL`,
  refresh: "Read again",
} as const;
