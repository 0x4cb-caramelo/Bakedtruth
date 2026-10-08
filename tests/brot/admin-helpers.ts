/**
 * Purpose: what the admin test files share: the zero key, the one-event check, the ConfigChanged
 *          snapshot check against the stored config, a look-alike config, and each creation
 *          parameter one step past its bound with the error it must get.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); lane B
 */
import { expect } from "bun:test";
import { address, generateKeyPairSigner, lamports, type Address, type Instruction } from "@solana/kit";

import type { BrotErrorName } from "./errors";
import { DEFAULT_PARAMS, readConfig } from "./flows";
import { encode } from "./layouts";
import * as P from "./program";
import { expectError, send, type Sent, type World } from "./setup";
import { GLOBAL_CONFIG } from "./structs";

/** The all-zero key: "no key" in `pending_admin` and in every team slot past `team_len`. */
export const ZERO = address("11111111111111111111111111111111");

type Ok = Extract<Sent, { ok: true }>;

/** The data of the one event `sent` emitted, which must be `name`. */
export function onlyEvent(sent: Ok, name: string) {
  expect(sent.events.map((e) => e.name)).toEqual([name]);
  return sent.events[0].data;
}

/** `sent` emitted one ConfigChanged for `change`, signed by `signer`, carrying the stored config. */
export async function expectSnapshot(w: World, sent: Ok, change: number, signer: Address) {
  const event = onlyEvent(sent, "ConfigChanged");
  const c = await readConfig(w);
  const stored = {
    admin: c.admin,
    pending_admin: c.pending_admin,
    fee_recipient: c.fee_recipient,
    team_len: c.team_len,
    team: c.team,
    params: c.params,
  };
  expect(event).toEqual({ change, signer, ...stored });
  return event;
}

/** Sends `ix` and expects the program error `name`; `label` says which case failed. */
export async function expectRefused(w: World, label: string, ix: Instruction, name: BrotErrorName) {
  try {
    expectError(await send(w, [ix]), name);
  } catch (error) {
    throw new Error(`${label}: ${(error as Error).message}`);
  }
}

/**
 * A copy of the real config at another address, owned by the program and naming `attacker` as
 * admin, pending admin and only team key: what a forged config would look like.
 */
export async function lookAlikeConfig(w: World, attacker: Address) {
  const real = await readConfig(w);
  const forged = { ...real, admin: attacker, pending_admin: attacker, team_len: 1, team: [attacker] };
  const at = (await generateKeyPairSigner()).address;
  w.client.svm.setAccount({
    address: at,
    data: encode(GLOBAL_CONFIG, forged),
    executable: false,
    lamports: lamports(P.SOL),
    programAddress: P.PROGRAM_ID,
    space: 400n,
  });
  return at;
}

/** Each creation parameter one step past a bound, and the error that names it (TP section 3.4.1). */
export const OUT_OF_RANGE: [string, Record<string, unknown>, BrotErrorName][] = [
  ["opening fee of 0 US$", { opening_fee_usd: 0n }, "OpeningFeeUsdOutOfRange"],
  ["opening fee of 5,001 US$", { opening_fee_usd: 5_001n }, "OpeningFeeUsdOutOfRange"],
  ["prize share of 89.99%", { opening_prize_bps: 8_999 }, "OpeningPrizeBpsOutOfRange"],
  ["prize share of 100.01%", { opening_prize_bps: 10_001 }, "OpeningPrizeBpsOutOfRange"],
  ["fee of 10.01%", { fee_bps: 1_001 }, "FeeBpsAboveCeiling"],
  ["one-sided fee of 1.01%", { one_sided_fee_bps: 101 }, "OneSidedFeeBpsAboveCeiling"],
  ["creator share of 1.01%", { creator_share_bps: 101 }, "CreatorShareBpsAboveCeiling"],
  ["no open campaign allowed", { max_open_campaigns: 0 }, "MaxOpenCampaignsOutOfRange"],
  ["10,001 open campaigns", { max_open_campaigns: 10_001 }, "MaxOpenCampaignsOutOfRange"],
  ["minimum entry of 999,999 lamports", { min_entry_lamports: 999_999n }, "MinEntryOutOfRange"],
  ["minimum entry above 1 SOL", { min_entry_lamports: 1_000_000_001n }, "MinEntryOutOfRange"],
  ["SOL/USD feed id of zeros", { sol_usd_feed_id: new Uint8Array(32) }, "SolUsdFeedIdZero"],
  ["SOL/USD price age of 0 s", { max_price_age: 0 }, "MaxPriceAgeOutOfRange"],
  ["SOL/USD price age of 301 s", { max_price_age: 301 }, "MaxPriceAgeOutOfRange"],
  ["SOL/USD confidence of 0", { max_price_conf_bps: 0 }, "MaxPriceConfOutOfRange"],
  ["SOL/USD confidence of 1.01%", { max_price_conf_bps: 101 }, "MaxPriceConfOutOfRange"],
  ["join-time price age of 29 s", { campaign_max_age: 29 }, "CampaignMaxAgeOutOfRange"],
  ["join-time price age of 301 s", { campaign_max_age: 301 }, "CampaignMaxAgeOutOfRange"],
];

/** Every floor at once, and every ceiling at once: both are valid parameters. */
export const ALL_FLOORS = {
  ...DEFAULT_PARAMS,
  opening_fee_usd: 1n,
  opening_prize_bps: 9_000,
  fee_bps: 0,
  one_sided_fee_bps: 0,
  creator_share_bps: 0,
  max_open_campaigns: 1,
  min_entry_lamports: 1_000_000n,
  max_price_age: 1,
  max_price_conf_bps: 1,
  campaign_max_age: 30,
};
export const ALL_CEILINGS = {
  ...DEFAULT_PARAMS,
  opening_fee_usd: 5_000n,
  opening_prize_bps: 10_000,
  fee_bps: 1_000,
  one_sided_fee_bps: 100,
  creator_share_bps: 100,
  max_open_campaigns: 10_000,
  min_entry_lamports: 1_000_000_000n,
  max_price_age: 300,
  max_price_conf_bps: 100,
  campaign_max_age: 300,
};
