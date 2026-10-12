/**
 * Purpose: the five templates of the creation box (D-k; P1 §4.2; TP §3.4.10 row 1), one per kind: its reader kind, the
 *          template id a link may name, what the account slot is, the program that must own it, the target's unit, and
 *          whether the kind opens in this build. `StakeAtLeast` stays closed until its devnet YES (TP §3.4.10 row 1: no
 *          build enables `stake-at-least` yet), so the box shows it and says when it opens, and never sends it. The words
 *          a creator reads (the slot, the owner) come from copy.ts.
 * Version: 0.2.0 (the Sprint 19 copy review: the words moved to copy.ts)
 * Sprint:  19 (site: open a campaign)
 */
import { creatorCanControl, ReaderKind } from "@brot/sdk/read";

import type { KindName } from "../campaign-page/proof";
import { KIND_WORDS } from "./copy";

/**
 * Whether this build of the program opens `StakeAtLeast` (the `stake-at-least` feature; off in every build today).
 * Before turning it on, pass the vote account's current epoch stake (RPC `getVoteAccounts`) to `checkBox` and to the
 * SDK's preparation: without it the SDK's mirror throws instead of refusing (the Sprint 19 adversarial review, L9).
 */
export const STAKE_AT_LEAST_OPENS = false;

/** How a target is typed: a price in US$, a raw whole number (a supply, a liquidity), or SOL. */
export type TargetUnit = "usd" | "raw" | "sol";

export type Template = {
  kind: KindName;
  readerKind: ReaderKind;
  /** The id a prefill link names (`?t=`); never stored, never sent. */
  id: string;
  /** What the account slot holds; the price kind's account is derived from its feed. */
  slot: string | null;
  /** The program the reader checks first (owner), in words. */
  owner: string;
  unit: TargetUnit;
  /** Read at the start of a named epoch. */
  epoch: boolean;
  /** "now" opens in this build; "after-devnet-yes" waits for a YES recorded on devnet. */
  opens: "now" | "after-devnet-yes";
  /** The words the typeahead matches, lower case. */
  words: readonly string[];
};

export const TEMPLATES: readonly Template[] = [
  {
    kind: "price",
    readerKind: ReaderKind.PriceTouch,
    id: "price-touch",
    slot: KIND_WORDS.price.slot,
    owner: KIND_WORDS.price.owner,
    unit: "usd",
    epoch: false,
    opens: "now",
    words: ["price", "touch", "reach", "hit", "fall", "drop", "above", "below", "usd", "dollar", "pyth", "feed"],
  },
  {
    kind: "burn",
    readerKind: ReaderKind.SupplyAtMost,
    id: "supply-burn",
    slot: KIND_WORDS.burn.slot,
    owner: KIND_WORDS.burn.owner,
    unit: "raw",
    epoch: false,
    opens: "now",
    words: ["supply", "burn", "burned", "burning", "token", "mint", "circulating"],
  },
  {
    kind: "lock",
    readerKind: ReaderKind.DammV2LockedAtLeast,
    id: "meteora-lock",
    slot: KIND_WORDS.lock.slot,
    owner: KIND_WORDS.lock.owner,
    unit: "raw",
    epoch: false,
    opens: "now",
    words: ["lock", "locked", "liquidity", "lp", "meteora", "damm", "pool", "permanent"],
  },
  {
    kind: "pool",
    readerKind: ReaderKind.StakePoolTvlAtLeast,
    id: "stake-pool",
    slot: KIND_WORDS.pool.slot,
    owner: KIND_WORDS.pool.owner,
    unit: "sol",
    epoch: true,
    opens: "now",
    words: ["stake", "pool", "staking", "lst", "tvl", "deposit", "epoch"],
  },
  {
    kind: "stake",
    readerKind: ReaderKind.StakeAtLeast,
    id: "validator-stake",
    slot: KIND_WORDS.stake.slot,
    owner: KIND_WORDS.stake.owner,
    unit: "sol",
    epoch: true,
    opens: STAKE_AT_LEAST_OPENS ? "now" : "after-devnet-yes",
    words: ["validator", "vote", "stake", "staked", "delegate", "delegation", "epoch", "active"],
  },
];

export const templateOf = (kind: KindName): Template => TEMPLATES.find((t) => t.kind === kind) as Template;
export const templateById = (id: string | null | undefined): Template | null =>
  TEMPLATES.find((t) => t.id === id) ?? null;

/** Every kind but price (burn, lock, stake pool, validator stake): whoever opened can push the number (BR-26, BP-14). */
export const creatorCanPush = (kind: KindName): boolean => creatorCanControl(templateOf(kind).readerKind);
