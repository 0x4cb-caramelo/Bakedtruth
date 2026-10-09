/**
 * Purpose: what the price kind's LiteSVM tests share: a captured update's fields read from its
 *          bytes, a fresh address holding a price update (the YES proof slot accepts any address),
 *          `resolve_campaign` sent with it, and the outcome recorded with its `CampaignResolved`.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution), lane C
 */
import { generateKeyPairSigner, type Address } from "@solana/kit";

import { readCampaign } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { fixtureBytes, setFixture } from "./readers";
import { expectOk, PRICE_OFFSETS, send, setPriceAccount, type Sent, type World } from "./setup";

/** The fields of a captured `PriceUpdateV2` the program reads, from the fixture's own bytes. */
export function capturedPrice(fixture: string) {
  const view = new DataView(fixtureBytes(fixture).buffer);
  return {
    price: view.getBigInt64(PRICE_OFFSETS.price, true),
    conf: view.getBigUint64(PRICE_OFFSETS.conf, true),
    publishTime: view.getBigInt64(PRICE_OFFSETS.publishTime, true),
    postedSlot: view.getBigUint64(PRICE_OFFSETS.postedSlot, true),
  };
}

type PriceChange = Parameters<typeof setPriceAccount>[3];

/** A fresh address holding the captured BTC/USD devnet update with `change`, as a `post_update` account would. */
export async function proofAccount(w: World, change: PriceChange, fixture = "pyth-btc-usd-devnet"): Promise<Address> {
  const at = (await generateKeyPairSigner()).address;
  setPriceAccount(w.client, at, fixture, change);
  return at;
}

/** A fresh address holding a captured update exactly as captured, owner included. */
export async function capturedProof(w: World, fixture: string): Promise<Address> {
  const at = (await generateKeyPairSigner()).address;
  setFixture(w.client, fixture, { at });
  return at;
}

/** `resolve_campaign` with `metric` (the campaign's sponsored account) and `proof` (the metric itself if none). */
export const resolveWith = (w: World, campaign: Address, proof?: Address, metric: Address = P.BTC_USD_ACCOUNT) =>
  send(w, [I.resolveCampaignIx(campaign, metric, proof ?? metric)]);

/** What a resolution recorded: the campaign's fields and its `CampaignResolved` event. */
export function recorded(w: World, campaign: Address, sent: Sent) {
  const event = expectOk(sent).events.find((e) => e.name === "CampaignResolved");
  if (!event) throw new Error("resolve_campaign emitted no CampaignResolved event");
  return { campaign: readCampaign(w, campaign), event: event.data };
}
