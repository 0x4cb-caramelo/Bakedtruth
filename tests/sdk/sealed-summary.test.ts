/**
 * Purpose: the summary of the sealed entry's two instructions (Sprint 15; A-3): both are trusted only as the IDL shapes
 *          them; a sealed entry says its campaign, side, sponsor, US$, the most it takes (`max_lamports`, entry and
 *          fee together) and the SOL price below which that bound refuses it, where each part goes, its guards and its
 *          rents; the fee's settlement says where the fee can go and takes nothing from a signer. Needs no binary.
 *          Filter: `bun test tests/ -t "the summary says what a sealed entry signs"`.
 * Version: 0.1.0
 * Sprint:  15 (lane L15)
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner, type Instruction } from "@solana/kit";

import { campaignAddress, Side } from "@brot/sdk/read";
import * as T from "@brot/sdk/tx";

import * as P from "../brot/program";

const one = (ix: Instruction) => T.summarizeInstructions([ix]).items[0];

async function built(expectedEntryTotal = 0n) {
  const sponsor = await generateKeyPairSigner();
  const campaign = await campaignAddress(9n);
  const sealed = await T.buildSponsorJoinCampaign({
    sponsor,
    campaign,
    metricAccount: P.BTC_USD_ACCOUNT,
    side: Side.No,
    entryUsd: 750n,
    maxLamports: 9n * P.SOL,
    minReturnBps: 9_500,
    expectedEntryTotal,
    joinIndex: expectedEntryTotal === 0n ? 0 : 2,
  });
  const settle = await T.buildSettleSealedFee({ campaign, sponsor: sponsor.address });
  return { sponsor, campaign, sealed, settle };
}

describe("the summary says what a sealed entry signs", () => {
  test("a sealed entry is trusted and said in words, with the most it can take from the sponsor", async () => {
    const { sponsor, campaign, sealed } = await built();
    const item = one(sealed);
    expect(item).toMatchObject({ name: "SponsorJoinCampaign", trusted: true, lamportsAtMost: 9n * P.SOL });
    for (const said of [
      `Sealed entry in campaign ${campaign} on NO from ${sponsor.address}: US$750`,
      "at most 9.000000000 SOL in all",
      // US$750 for at most 9 SOL: a SOL/USD price under US$83.33 would cost more than the bound.
      "refused if Pyth's SOL/USD price less its confidence is below US$83.33 when it lands",
      "the entry part joins the pot",
      "back to the sponsor only on a void the house caused",
      "refused if the return estimate is below 95.00% or the entry total is not 0.000000000 SOL",
      "the rents of the entry, of the join's record and of the sponsor's SealedFee",
    ])
      expect(item.text).toContain(said);
    const later = one((await built(5n * P.SOL)).sealed);
    expect(later.text).toContain("the rent of the join's record, and of the sponsor's SealedFee on its first sealed");
  });

  test("the fee's settlement is trusted, says where the fee can go, and takes nothing from a signer", async () => {
    const { sponsor, campaign, settle } = await built();
    const item = one(settle);
    expect(item).toMatchObject({ name: "SettleSealedFee", trusted: true, lamportsAtMost: 0n });
    expect(item.text).toBe(
      `Settle ${sponsor.address}'s held fee on campaign ${campaign}: back to that sponsor on a void the house caused, else to Brot's fee vault; the SealedFee closes, its rent back to the sponsor`,
    );
  });

  test("a sealed entry or a settlement not shaped as the IDL says is not trusted", async () => {
    const { sealed, settle } = await built();
    const longer = { ...sealed, data: Uint8Array.of(...sealed.data!, 0) };
    const readOnlyFee = {
      ...sealed,
      accounts: sealed.accounts!.map((a, i) => (i === 8 ? { ...a, role: AccountRole.READONLY } : a)),
    };
    const extra = {
      ...settle,
      accounts: [...settle.accounts!, { address: P.SYSTEM_PROGRAM_ID, role: AccountRole.WRITABLE }],
    };
    for (const ix of [longer, readOnlyFee, extra]) expect(one(ix as Instruction)).toMatchObject({ trusted: false });
    expect(one(readOnlyFee as Instruction).text).toContain("account 9 is read-only, not writable");
  });
});
