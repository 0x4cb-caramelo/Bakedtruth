/**
 * Purpose: what a wallet received, summed from the program's settlement events and nothing else (Sprint 12 DoD: the
 *          sum on screen equals the wallet's `EntrySettled` and `CreatorShareSettled` events): as a baker (each entry's
 *          payout, refund or zero), as a creator (the 1%, paid or claimed from a reserve), and as whoever opened (the
 *          prize, and the opening fee refunded on a house-failure void, from `PrizeSettled`). Each event counts once.
 *          Also what the wallet put in, by side, from its `EntryAdded` events, for an entry the program has closed.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * An entry's rent comes back with its payout but is not in `EntrySettled.amount`: it was the wallet's own deposit,
 * not a payout, so it is not counted as received.
 */
import { Side, uniqueEvents, type DecodedEvent } from "@brot/sdk/read";

import { namesWallet } from "./history";

export type Received = {
  /** `EntrySettled.amount`: the entry's payout from the pot (zero for a losing entry). */
  asBaker: bigint;
  /** `CreatorShareSettled.amount`: the creator's 1%. */
  asCreator: bigint;
  /** `PrizeSettled`: the prize back to whoever opened, and the opening fee on a house-failure void. */
  prize: bigint;
  openingFee: bigint;
  /** Whether a settlement of this wallet's entry was seen (a zero payout included). */
  entrySettled: boolean;
};

export const NOTHING: Received = { asBaker: 0n, asCreator: 0n, prize: 0n, openingFee: 0n, entrySettled: false };

export const totalOf = (r: Received): bigint => r.asBaker + r.asCreator + r.prize + r.openingFee;

export type ReceivedSummary = { byCampaign: Map<string, Received>; total: bigint };

/** What `wallet` received, by campaign and in all, from `events` (any order; duplicates dropped). */
export function receivedBy(wallet: string, events: readonly DecodedEvent[]): ReceivedSummary {
  const byCampaign = new Map<string, Received>();
  const add = (campaign: string, change: Partial<Received>) => {
    const was = byCampaign.get(campaign) ?? NOTHING;
    byCampaign.set(campaign, {
      asBaker: was.asBaker + (change.asBaker ?? 0n),
      asCreator: was.asCreator + (change.asCreator ?? 0n),
      prize: was.prize + (change.prize ?? 0n),
      openingFee: was.openingFee + (change.openingFee ?? 0n),
      entrySettled: was.entrySettled || (change.entrySettled ?? false),
    });
  };
  for (const event of uniqueEvents(events)) {
    if (!namesWallet(event, wallet)) continue;
    if (event.name === "EntrySettled") add(event.data.campaign, { asBaker: event.data.amount, entrySettled: true });
    if (event.name === "CreatorShareSettled") add(event.data.campaign, { asCreator: event.data.amount });
    if (event.name === "PrizeSettled") {
      add(event.data.campaign, { prize: event.data.prizeReturned, openingFee: event.data.openingFeeReturned });
    }
  }
  let total = 0n;
  for (const received of byCampaign.values()) total += totalOf(received);
  return { byCampaign, total };
}

export type Put = { yes: bigint; no: bigint };

/** What `wallet` put into each campaign, by side, from its `EntryAdded` events (each once). */
export function putBy(wallet: string, events: readonly DecodedEvent[]): Map<string, Put> {
  const put = new Map<string, Put>();
  for (const event of uniqueEvents(events)) {
    if (event.name !== "EntryAdded" || event.data.baker !== wallet) continue;
    const was = put.get(event.data.campaign) ?? { yes: 0n, no: 0n };
    put.set(
      event.data.campaign,
      event.data.side === Side.Yes
        ? { ...was, yes: was.yes + event.data.amount }
        : { ...was, no: was.no + event.data.amount },
    );
  }
  return put;
}
