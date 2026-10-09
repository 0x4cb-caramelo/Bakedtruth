/**
 * Purpose: a team key opens free (P-3, I12, I14): no lamports move but the two rents, the campaign
 *          stores a zero creator share and no opening price, the SOL/USD slot is neither checked
 *          nor read (so a stale feed does not stop the team), there is no `partner` argument, and
 *          the team key must sign even when someone funded both accounts in advance.
 * Version: 0.0.3
 * Sprint:  02 (pot core on Pinocchio), lane D; 03 (a reachable target, row 3's far side), lane F.
 *          Runs after the SBF build.
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, getAddressEncoder, type Instruction } from "@solana/kit";

import { place } from "./checks-support";
import { readCampaign, readConfig, SOL_PRICE } from "./flows";
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
    const below = (SOL_PRICE * 9n) / 10n;
    const onSol = { openingUsd: 0n, feedId: P.SOL_USD_FEED_ID, direction: P.Direction.Below, target: below };
    expectOk((await tryOpen(w, w.team, onSol)).sent);
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: START_TIME - 121n });
    expectError((await tryOpen(w, w.team, onSol)).sent, "PriceStale");
  });

  test("an unsigned team key is refused, even with the campaign and vault funded in advance", async () => {
    // A free opening whose two rents are already there takes no lamport from the creator: the
    // signature is all that stops anyone from opening in a team key's name.
    const w = await openingWorld();
    const tamper = async (ix: Instruction, args: I.OpenArgs) => {
      const campaign = await P.campaignPda(args.id);
      place(w, campaign, { owner: P.SYSTEM_PROGRAM_ID, lamports: rents(w).campaign });
      place(w, await P.vaultPda(campaign), { owner: P.SYSTEM_PROGRAM_ID, lamports: rents(w).vault });
      return I.withSlot(ix, 0, { role: AccountRole.WRITABLE });
    };
    const { sent, campaign } = await tryOpen(w, w.team, { openingUsd: 0n, maxLamports: 0n }, { tamper });
    expectError(sent, "MissingSignature");
    const account = w.client.svm.getAccount(campaign);
    expect(account.exists && [account.programAddress, account.data.length]).toEqual([P.SYSTEM_PROGRAM_ID, 0]);
    expect((await readConfig(w)).open_campaigns).toBe(0);
  });

  test("takes no partner argument: a key appended to the arguments is refused", async () => {
    const w = await openingWorld();
    const partner = getAddressEncoder().encode(w.creator.address);
    const withPartner = (ix: Instruction) => I.withData(ix, Uint8Array.of(...(ix.data ?? []), ...partner));
    const sent = await tryOpen(w, w.team, { openingUsd: 0n }, { tamper: withPartner });
    expectError(sent.sent, "BadInstructionData");
  });
});
