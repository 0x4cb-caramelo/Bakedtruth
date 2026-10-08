/**
 * Purpose: the common paths every test file starts from: a config initialised with the founder's
 *          values, a team, a paid or free price campaign opened on BTC/USD, an entry.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); frozen at the sprint's opening with the program's contract
 */
import { type Address, type KeyPairSigner } from "@solana/kit";

import * as I from "./instructions";
import { decode } from "./layouts";
import * as P from "./program";
import { accountData, expectOk, fundedWallet, now, send, type World } from "./setup";
import { CAMPAIGN, ENTRY, GLOBAL_CONFIG } from "./structs";

/** The creation parameters of the founder's decisions, with the [AC] devnet values of Sprint 02. */
export const DEFAULT_PARAMS = {
  opening_fee_usd: 500n, // D-b
  opening_prize_bps: 9_000, // D-b
  fee_bps: 1_000, // P1 section 3.3
  one_sided_fee_bps: 100, // P1 section 3.5
  creator_share_bps: 100, // D-g
  max_open_campaigns: 1_000, // [AC] the keeper's design load (X1.8)
  min_entry_lamports: 10_000_000n, // P-5
  sol_usd_feed_id: P.SOL_USD_FEED_ID, // D-f
  max_price_age: 120, // [AC] devnet: at least 90 s (TP section 3.4.1)
  max_price_conf_bps: 50, // [INF] 0.5%, as for price campaigns
  campaign_max_age: 120, // [AC] devnet: at least 90 s; never below 30 s
};

/** Initialises the config with `DEFAULT_PARAMS` (or `params`), signed by the upgrade authority. */
export async function initConfig(w: World, params: Record<string, unknown> = DEFAULT_PARAMS) {
  const admin = await fundedWallet(w);
  const feeRecipient = await fundedWallet(w, 1n);
  const ix = await I.initializeConfigIx({
    authority: w.upgradeAuthority,
    admin: admin.address,
    feeRecipient: feeRecipient.address,
    params,
  });
  expectOk(await send(w, [ix]));
  return { admin, feeRecipient };
}

/** Sets `count` fresh team keys and returns them. */
export async function setTeam(w: World, admin: KeyPairSigner, count = 2) {
  const team = await Promise.all(Array.from({ length: count }, () => fundedWallet(w)));
  expectOk(
    await send(w, [
      await I.setTeamIx(
        admin,
        team.map((t) => t.address),
      ),
    ]),
  );
  return team;
}

/** BTC/USD in the captured devnet account: 85,212.33806870 US$ (exponent −8). */
export const BTC_PRICE = 8_521_233_806_870n;
/** SOL/USD in the captured devnet account: 119.21844516 US$ (exponent −8). */
export const SOL_PRICE = 11_921_844_516n;

let nextId = 1n;
/** A fresh campaign id; real clients draw it at random (T17). */
export const newId = () => nextId++;

/**
 * Opens a price campaign: BTC/USD above 110% of its captured price, seven days from now, paying
 * US$500 with a generous `max_lamports`, unless `over` says otherwise.
 */
export async function openPriceCampaign(w: World, creator: KeyPairSigner, over: Partial<I.OpenArgs> = {}) {
  const args: I.OpenArgs = {
    id: newId(),
    feedId: P.BTC_USD_FEED_ID,
    direction: P.Direction.Above,
    target: (BTC_PRICE * 11n) / 10n,
    deadlineAt: now(w.client) + 7n * P.DAY,
    openingUsd: 500n,
    maxLamports: 10n * P.SOL,
    ...over,
  };
  const sent = await send(w, [await I.openCampaignIx(creator, args)]);
  const campaign = await P.campaignPda(args.id);
  return { sent, args, campaign, vault: await P.vaultPda(campaign) };
}

/** `openPriceCampaign` that must succeed. */
export async function openedCampaign(w: World, creator: KeyPairSigner, over: Partial<I.OpenArgs> = {}) {
  const opened = await openPriceCampaign(w, creator, over);
  expectOk(opened.sent);
  return opened;
}

/** Joins `campaign` (whose metric account is read from it) with `amount` lamports on `side`. */
export async function join(w: World, baker: KeyPairSigner, campaign: Address, a: I.JoinArgs) {
  const metric = readCampaign(w, campaign).metric_account as Address;
  return send(w, [await I.joinCampaignIx(baker, campaign, metric, a)]);
}

export const readConfig = async (w: World) => decode(GLOBAL_CONFIG, accountData(w, await P.configPda()));
export const readCampaign = (w: World, campaign: Address) => decode(CAMPAIGN, accountData(w, campaign));
export const readEntry = async (w: World, campaign: Address, baker: Address) =>
  decode(ENTRY, accountData(w, await P.entryPda(campaign, baker)));

/** `ceil(usd × 10^(9 − e) ÷ p)`: the lamports a paid opening costs (TP section 3.4.16). */
export function openingLamports(usd: bigint, price: bigint, exponent = -8) {
  const numerator = usd * 10n ** BigInt(9 - exponent);
  return (numerator + price - 1n) / price;
}
