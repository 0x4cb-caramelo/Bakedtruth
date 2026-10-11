/**
 * Purpose: the pieces of the creation box's preview that read what the box fetched, as pure values (Sprint 19): the
 *          listed feeds with their state read live (TP §3.4.10 row 4) and a feed's price now, a raw amount with its
 *          unit, the account slot's state (row 2), and the list card the campaign will have with no entry yet, built
 *          from the arguments the transaction carries.
 * Version: 0.2.0
 * Sprint:  19 (site: open a campaign)
 */
import type { FetchedAccount, OpenArgs } from "@brot/sdk/read";

import { formatTarget } from "../campaigns/sentence";
import type { Card } from "../campaigns/model";
import { ageText } from "../campaign-page/format";
import { accountState, feedState, type AccountState } from "./account-check";
import { KIND_WORDS, SLOTS } from "./copy";
import { refusalCopy } from "./copy-refusals";
import type { Draft } from "./draft";
import type { BoxWorld } from "./reads";

/** A price in US$ with the feed's own exponent, as the page writes a target. */
export const usd = (price: bigint, exponent: number) => `US$${formatTarget(price, exponent)}`;
/** Basis points as a short percentage: 1,000 → "10%", 50 → "0.5%". */
export const pct = (bps: number) => `${bps / 100}%`;

/** A raw amount with its unit (the copy review, M8): burn and lock targets are raw units, not tokens. */
export const withUnit = (kind: Draft["kind"], text: string) =>
  KIND_WORDS[kind].unit && kind !== "pool" && kind !== "stake" ? `${text} ${KIND_WORDS[kind].unit}` : text;

/** The feed's price now, when its sponsored account is fresh enough to back a campaign (row 4). */
export function priceReading(world: BoxWorld | null, feedHex: string | null) {
  if (!world?.config) return null;
  const feed = world.feeds.find((f) => f.hex === feedHex);
  const state = feed ? feedState(feed.account, feed.hex, world.clock, world.config.params.campaignMaxAge) : null;
  return state?.ok ? state.reading : null;
}
export type PriceReading = NonNullable<ReturnType<typeof priceReading>>;

/** One listed feed in the asset slot: its symbol, its price now, its state (row 4) and whether it can back a campaign. */
export type FeedOption = { hex: string; symbol: string; price: string | null; tag: string; usable: boolean };

/** The account slot's read: still checking, failed, or the reader's answer. */
export type SlotRead = { status: "checking" } | { status: "failed" } | { status: "read"; state: AccountState };

/** The listed feeds as the asset slot shows them: usable ones first, each with its price and state now. */
export function feedOptions(world: BoxWorld | null): FeedOption[] {
  if (!world?.config) return [];
  const maxAge = world.config.params.campaignMaxAge;
  const options = world.feeds.map((f): FeedOption => {
    const state = feedState(f.account, f.hex, world.clock, maxAge);
    if (state.ok)
      return {
        hex: f.hex,
        symbol: f.symbol,
        price: usd(state.reading.price, state.reading.exponent),
        tag: SLOTS.fresh(ageText(state.ageSeconds)),
        usable: true,
      };
    const tag = state.problem === "missing" ? SLOTS.noAccount : refusalCopy(state.problem).tag;
    return { hex: f.hex, symbol: f.symbol, price: null, tag, usable: false };
  });
  return options.sort((a, b) => Number(b.usable) - Number(a.usable) || a.symbol.localeCompare(b.symbol));
}

/** The account slot's state: checking until the read for this exact address is back, then the reader's answer. */
export function slotReadOf(
  draft: Draft,
  accounts: { metric: FetchedAccount | null } | null,
  read: boolean,
  epoch: bigint | null,
): SlotRead {
  if (draft.kind === "price" || !read) return { status: "checking" };
  if (accounts === null) return { status: "failed" };
  return { status: "read", state: accountState(draft.kind, accounts.metric, epoch ?? 0n) };
}

/** The list's card for the campaign the arguments open, before any entry (spec 3.12, "as it will appear"). */
export function cardOf(a: {
  args: OpenArgs;
  kind: string;
  title: string;
  asset: string | null;
  creator: string | null;
  team: boolean;
  prize: bigint;
  opensAt: bigint | null;
  entriesClose: bigint | null;
}): Card {
  return {
    id: a.args.id.toString(),
    address: "",
    kind: a.kind,
    state: "open",
    title: a.title,
    asset: a.asset,
    creator: a.creator ?? "",
    creatorIsTeam: a.team,
    potLamports: 0n,
    yesLamports: 0n,
    noLamports: 0n,
    prizeLamports: a.team ? 0n : a.prize,
    yesShare: null,
    entries: 0,
    group: 2,
    listed: true,
    opensAt: a.opensAt,
    entriesCloseAt: a.entriesClose,
    deadlineAt: a.args.deadlineAt,
    reviewEndsAt: null,
    estYesBps: null,
    estNoBps: null,
    chip: "open",
    stateLine: null,
  };
}
