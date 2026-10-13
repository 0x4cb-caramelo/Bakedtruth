/**
 * Purpose: the program's events: each name with its discriminator and the Codama decoder of its
 *          payload, and the decoding of one event's inner-instruction data `[0xFF, discriminator,
 *          payload]` (TP 3.4.14). Mirrors programs/brot-markets/src/events.rs and events/*.rs.
 * Version: 0.1.1
 * Sprint:  05 (SDK); the scaffold of Sprints 14–15 (2026-10-13) appends discriminators 18 to 22
 *
 * The IDL carries each event as a type but not its discriminator, so the table below is written by
 * hand; tests/sdk/contract-events.test.ts reads every `impl Event for X { const DISCRIMINATOR: u8 = n }` in
 * the program's source and compares, and checks each decoder's size against the Rust `zero_copy!`.
 * Discriminators are positional in the program: appended, never reused.
 */
import type { FixedSizeDecoder } from "@solana/kit";

import * as T from "../idl/generated/types";
import { EVENT_IX_TAG } from "./constants";

/** Every event's payload type, by name. */
export type EventPayloads = {
  ConfigInitialized: T.ConfigInitialized;
  ConfigChanged: T.ConfigChanged;
  EntriesPaused: T.EntriesPaused;
  EntriesResumed: T.EntriesResumed;
  CampaignOpened: T.CampaignOpened;
  EntryAdded: T.EntryAdded;
  CampaignResolved: T.CampaignResolved;
  ResultConfirmed: T.ResultConfirmed;
  CampaignVoided: T.CampaignVoided;
  ContestOpened: T.ContestOpened;
  CampaignFinalized: T.CampaignFinalized;
  EntrySettled: T.EntrySettled;
  CreatorShareSettled: T.CreatorShareSettled;
  FeeCollected: T.FeeCollected;
  PrizeSettled: T.PrizeSettled;
  CampaignClosed: T.CampaignClosed;
  FeesSwept: T.FeesSwept;
  LateTallied: T.LateTallied;
  ReferralLinked: T.ReferralLinked;
  CampaignReread: T.CampaignReread;
  ContestClosed: T.ContestClosed;
  SealedFeeHeld: T.SealedFeeHeld;
  SealedFeeSettled: T.SealedFeeSettled;
};

export type EventName = keyof EventPayloads;

/** One decoded event: its name and payload, typed together. */
export type BrotEvent = { [N in EventName]: { name: N; discriminator: number; data: EventPayloads[N] } }[EventName];

type Entry<N extends EventName> = { name: N; discriminator: number; decoder: FixedSizeDecoder<EventPayloads[N]> };
const entry = <N extends EventName>(name: N, discriminator: number, decoder: FixedSizeDecoder<EventPayloads[N]>) =>
  ({ name, discriminator, decoder }) as Entry<N>;

/** The events in discriminator order (events.rs and events/*.rs). */
export const EVENTS: readonly Entry<EventName>[] = [
  entry("ConfigInitialized", 0, T.getConfigInitializedDecoder()),
  entry("ConfigChanged", 1, T.getConfigChangedDecoder()),
  entry("EntriesPaused", 2, T.getEntriesPausedDecoder()),
  entry("EntriesResumed", 3, T.getEntriesResumedDecoder()),
  entry("CampaignOpened", 4, T.getCampaignOpenedDecoder()),
  entry("EntryAdded", 5, T.getEntryAddedDecoder()),
  entry("CampaignResolved", 6, T.getCampaignResolvedDecoder()),
  entry("ResultConfirmed", 7, T.getResultConfirmedDecoder()),
  entry("CampaignVoided", 8, T.getCampaignVoidedDecoder()),
  entry("ContestOpened", 9, T.getContestOpenedDecoder()),
  entry("CampaignFinalized", 10, T.getCampaignFinalizedDecoder()),
  entry("EntrySettled", 11, T.getEntrySettledDecoder()),
  entry("CreatorShareSettled", 12, T.getCreatorShareSettledDecoder()),
  entry("FeeCollected", 13, T.getFeeCollectedDecoder()),
  entry("PrizeSettled", 14, T.getPrizeSettledDecoder()),
  entry("CampaignClosed", 15, T.getCampaignClosedDecoder()),
  entry("FeesSwept", 16, T.getFeesSweptDecoder()),
  entry("LateTallied", 17, T.getLateTalliedDecoder()),
  entry("ReferralLinked", 18, T.getReferralLinkedDecoder()),
  entry("CampaignReread", 19, T.getCampaignRereadDecoder()),
  entry("ContestClosed", 20, T.getContestClosedDecoder()),
  entry("SealedFeeHeld", 21, T.getSealedFeeHeldDecoder()),
  entry("SealedFeeSettled", 22, T.getSealedFeeSettledDecoder()),
];

const BY_DISCRIMINATOR: ReadonlyMap<number, Entry<EventName>> = new Map(EVENTS.map((e) => [e.discriminator, e]));

/** The largest event's inner-instruction data, tag and discriminator included. */
export const MAX_EVENT_DATA = 2 + Math.max(...EVENTS.map((e) => e.decoder.fixedSize));

/**
 * The event in an inner instruction's data: `[0xFF, discriminator, payload]`, the payload exactly the
 * event's size. `null` for anything else (another tag, an unknown discriminator, a wrong length): a
 * byte string that is not exactly an event of this program is never read as one.
 */
export function decodeEventData(data: Uint8Array): BrotEvent | null {
  if (data.length < 2 || data[0] !== EVENT_IX_TAG) return null;
  const found = BY_DISCRIMINATOR.get(data[1]);
  if (!found || data.length !== 2 + found.decoder.fixedSize) return null;
  return { name: found.name, discriminator: found.discriminator, data: found.decoder.decode(data, 2) } as BrotEvent;
}

/** The campaign an event belongs to, for the campaign-scoped events (all but config, pause, sweep and referral). */
export function eventCampaign(event: BrotEvent): string | null {
  const data = event.data as { campaign?: string };
  return typeof data.campaign === "string" ? data.campaign : null;
}

/** The event's `seq` (contiguous per campaign from 0, X0.4), for the campaign-scoped events. */
export function eventSeq(event: BrotEvent): bigint | null {
  const data = event.data as { seq?: bigint };
  return typeof data.seq === "bigint" ? data.seq : null;
}
