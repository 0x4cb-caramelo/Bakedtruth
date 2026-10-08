/**
 * Purpose: a team key opens free (P-3, I12, I14): no lamports move but the two rents, the campaign
 *          stores a zero creator share and no opening price, the SOL/USD slot is neither checked
 *          nor read (so a stale feed does not stop the team), and there is no `partner` argument.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane D. Runs after the SBF build (Wave 2).
 */
import { describe, expect, test } from "bun:test";
import { getAddressEncoder, type Instruction } from "@solana/kit";

import { readCampaign, readConfig } from "./flows";
import * as I from "./instructions";
import { openingWorld, rents, tryOpen } from "./opening";
import * as P from "./program";
import { balance, expectError, expectOk, setPriceAccount, START_TIME } from "./setup";

/** What a free opening stores in the opening group: nothing paid, no price read. */
const NOTHING_PAID = {
  opening_usd: 0n,
  opening_paid_lamports: 0n,
  opening_price: 0n,
  opening_price_exponent: 0,
  opening_price_publish_time: 0n,
  prize_lamports: 0n,
  opening_fee_lamports: 0n,
};

describe("team opening pays nothing", () => {
  test("moves no lamports besides rent and stores a zero creator share", async () => {
    const w = await openingWorld();
    const before = balance(w, w.team.address);
    const { sent, campaign, vault } = await tryOpen(w, w.team, { openingUsd: 0n, maxLamports: 0n });
    const ok = expectOk(sent);
    const rent = rents(w);
    expect(before - balance(w, w.team.address)).toBe(rent.campaign + rent.vault);
    expect(balance(w, vault)).toBe(rent.vault);
    expect(balance(w, campaign)).toBe(rent.campaign);

    const team = { creator: w.team.address, creator_is_team: true, creator_share_bps: 0 };
    // The fees are still copied: a free campaign charges bakers like any other (row 6).
    const fees = { fee_bps: 1_000, one_sided_fee_bps: 100 };
    expect(readCampaign(w, campaign)).toMatchObject({ ...team, ...fees, ...NOTHING_PAID, rent_payer: w.team.address });
    const event = ok.events.find((e) => e.name === "CampaignOpened");
    expect(event?.data).toMatchObject({ ...team, ...fees, ...NOTHING_PAID, campaign, seq: 0n });
    expect((await readConfig(w)).open_campaigns).toBe(1);
    console.log(`T19: a free team opening (BTC/USD campaign) used ${ok.computeUnits} compute units`);
  });

  test("still opens when SOL/USD is stale, while a paid opening is refused", async () => {
    const w = await openingWorld();
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: START_TIME - 3_600n });
    expectOk((await tryOpen(w, w.team, { openingUsd: 0n })).sent);
    expectError((await tryOpen(w, w.creator)).sent, "SolUsdStale");
  });

  test("the SOL/USD slot is not read: any account will do", async () => {
    const w = await openingWorld();
    const slots = { solUsd: P.SYSTEM_PROGRAM_ID };
    expectOk((await tryOpen(w, w.team, { openingUsd: 0n }, { slots })).sent);
    // The campaign's own price is still checked when the campaign is on SOL/USD itself.
    const onSol = { openingUsd: 0n, feedId: P.SOL_USD_FEED_ID, direction: P.Direction.Below, target: 1n };
    expectOk((await tryOpen(w, w.team, onSol)).sent);
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: START_TIME - 121n });
    expectError((await tryOpen(w, w.team, onSol)).sent, "PriceStale");
  });

  test("takes no partner argument: a key appended to the arguments is refused", async () => {
    const w = await openingWorld();
    const partner = getAddressEncoder().encode(w.creator.address);
    const withPartner = (ix: Instruction) => I.withData(ix, Uint8Array.of(...(ix.data ?? []), ...partner));
    const sent = await tryOpen(w, w.team, { openingUsd: 0n }, { tamper: withPartner });
    expectError(sent.sent, "BadInstructionData");
  });
});
