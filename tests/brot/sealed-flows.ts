/**
 * Purpose: the whole life of a campaign that carries a sealed entry, on the program (Sprint 15): resolved YES by a
 *          touching sponsored price, NO after the deadline, or voided by a stale feed (an outside cause) and, when a
 *          team key records it so, by a house failure; every baker's joins tallied; finalized after the window; then
 *          each settlement instruction in turn, measured by the lamports each destination receives.
 * Version: 0.0.1
 * Sprint:  15 (lane L15). Needs the SBF build.
 */
import type { Address, KeyPairSigner } from "@solana/kit";

import { BTC_PRICE, readCampaign, readEntry } from "./flows";
import { setBtc } from "./invariant-harness";
import * as S from "./instructions-settlement";
import { resolveWith } from "./price-support";
import * as P from "./program";
import { settleSealedFee } from "./sealed-support";
import { balance, expectOk, now, send, setTime, type Sent, type World } from "./setup";

/** The YES price: the default campaign's target (110% of BTC/USD) crossed by 1%, with no band. */
const TOUCH = (BTC_PRICE * 11n * 101n) / (10n * 100n);

export type Outcome = "yes" | "no" | "stale";

/** Resolves `campaign` (the default BTC/USD campaign): a touch published after every join, or after the deadline a
 * fresh untouched price (NO) or one older than `deadline − 600 s` (a stale feed: Void, an outside cause). */
export async function resolve(w: World, campaign: Address, outcome: Outcome) {
  const deadline = readCampaign(w, campaign).deadline_at as bigint;
  if (outcome === "yes") {
    setTime(w.client, now(w.client) + 60n);
    setBtc(w, TOUCH, now(w.client) - 5n);
  } else {
    setTime(w.client, deadline + 61n);
    setBtc(w, BTC_PRICE, outcome === "no" ? deadline + 30n : deadline - P.STALE_FEED_MIN_SECONDS - 1n);
  }
  return expectOk(await resolveWith(w, campaign));
}

/** `tally_late_joins` for each baker: every Join of its Entry, in index order. */
export async function tallyAll(w: World, campaign: Address, bakers: Address[]) {
  for (const baker of bakers) {
    const count = Number((await readEntry(w, campaign, baker)).join_count);
    const joins = await Promise.all(Array.from({ length: count }, (_, i) => P.joinPda(campaign, baker, i)));
    const entry = await P.entryPda(campaign, baker);
    expectOk(await send(w, [S.tallyLateJoinsIx(baker, campaign, entry, joins)]));
  }
}

/** The snapshot once the six-hour window has ended (`finalize_campaign`, any wallet). */
export async function finalize(w: World, campaign: Address) {
  setTime(w.client, (readCampaign(w, campaign).review_ends_at as bigint) + 1n);
  return expectOk(await send(w, [S.finalizeCampaignIx(campaign, await P.configPda())]));
}

/** A team key records the automatic void as the house's failure, inside the window: the snapshot runs with it. */
export async function voidAsHouseFailure(w: World, team: KeyPairSigner, campaign: Address) {
  const args = { reason: P.VoidReason.TeamHouseFailure, noteHash: new Uint8Array(32).fill(5) };
  return expectOk(await send(w, [S.teamVoidCampaignIx(team, await P.configPda(), campaign, args)]));
}

/** What `send` moved to each of `who`, the lamports after less the lamports before. */
export async function moved(w: World, who: Address[], act: () => Promise<Sent>) {
  const before = who.map((a) => balance(w, a));
  const sent = expectOk(await act());
  return { sent, gains: who.map((a, i) => balance(w, a) - before[i]) };
}

export const settleEntry = async (w: World, campaign: Address, baker: Address) =>
  send(w, [S.settleEntryIx(await P.entryPda(campaign, baker), campaign, await P.vaultPda(campaign), baker)]);
export const collectFee = async (w: World, campaign: Address) =>
  send(w, [S.collectFeeIx(campaign, await P.vaultPda(campaign), await P.feeVaultPda())]);
export const settlePrize = async (w: World, campaign: Address, creator: Address) =>
  send(w, [S.settlePrizeIx(campaign, await P.vaultPda(campaign), creator)]);
export const closeCampaign = async (w: World, campaign: Address, rentPayer: Address) =>
  send(w, [S.closeCampaignIx(campaign, await P.vaultPda(campaign), rentPayer, await P.feeVaultPda())]);
export { settleSealedFee };
