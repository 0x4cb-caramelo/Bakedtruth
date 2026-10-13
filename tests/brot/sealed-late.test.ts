/**
 * Purpose: today's rule for a LATE sealed entry, pinned so a change is deliberate (the coordinator's closure review;
 *          red team L1, a founder question still open). A YES price campaign: the price touches, the sponsored account
 *          does not show it yet, so the join lock admits a sealed YES entry after the touch; the campaign resolves YES
 *          with a proof published before the entry, the tally marks its join late, finalize gives `Split`. The entry
 *          part (90%) comes back to the sponsor whole, as any late entry; the 10% follows the settle mode, to the fee
 *          vault; and every lamport of the campaign's accounts is accounted for, to close.
 *          Filter: `bun test tests/ -t "a late sealed entry gets its 90% back whole"`.
 * Version: 0.1.0
 * Sprint:  15 (lane L15). Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import { BTC_PRICE, join, readCampaign, readEntry } from "./flows";
import * as S from "./instructions-settlement";
import { refreshSol, setBtc } from "./invariant-harness";
import { BTC_CONF } from "./opening";
import { proofAccount, resolveWith } from "./price-support";
import * as P from "./program";
import {
  closeCampaign,
  collectFee,
  finalize,
  moved,
  settleEntry,
  settlePrize,
  settleSealedFee,
  tallyAll,
} from "./sealed-flows";
import { sealedCharge, sealedEntry, sealedWorld } from "./sealed-support";
import { ENTRY_LEN, JOIN_LEN } from "./join-campaign-support";
import { balance, expectOk, fundedWallet, now, rentFor, send, setTime } from "./setup";

const SOL = P.SOL;

describe("a late sealed entry, today's rule", () => {
  test("a late sealed entry gets its 90% back whole and its 10% follows the mode, until the founder decides", async () => {
    const { w, creator, campaign, vault, sponsor } = await sealedWorld();
    const [ana, bruno] = [await fundedWallet(w), await fundedWallet(w)];
    const feeVault = await P.feeVaultPda();
    const sealedFee = await P.sealedFeePda(campaign, sponsor.address);
    const people = [creator.address, sponsor.address, ana.address, bruno.address];
    const accounts = async (): Promise<Address[]> => [
      ...people,
      campaign,
      vault,
      feeVault,
      sealedFee,
      ...(await Promise.all(people.slice(1).map((b) => P.entryPda(campaign, b)))),
      ...(await Promise.all(people.slice(1).map((b) => P.joinPda(campaign, b, 0)))),
    ];
    const held = async () => (await accounts()).reduce((sum, a) => sum + balance(w, a), 0n);
    const before = await held();
    const sponsorBefore = balance(w, sponsor.address);

    // Early entries on both sides, so the pot splits.
    expectOk(await join(w, ana, campaign, { side: P.Side.Yes, amount: SOL }));
    expectOk(await join(w, bruno, campaign, { side: P.Side.No, amount: 2n * SOL }));
    // The price touches at t: a fully verified update proves it, but the sponsored account still shows the old price.
    const target = readCampaign(w, campaign).target as bigint;
    const touchedAt = now(w.client) + 30n;
    setTime(w.client, touchedAt + 10n);
    const proof = await proofAccount(w, { price: target + BTC_CONF, publishTime: touchedAt });
    setBtc(w, BTC_PRICE, now(w.client) - 5n);
    refreshSol(w);
    // So the join lock admits a sealed YES entry after the touch.
    expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes }));
    const { entry, fee } = sealedCharge(500n);

    expectOk(await resolveWith(w, campaign, proof));
    expect(readCampaign(w, campaign)).toMatchObject({ outcome: P.Outcome.Yes, publish_time: touchedAt });
    await tallyAll(w, campaign, [sponsor.address, ana.address, bruno.address]);
    expect((await readEntry(w, campaign, sponsor.address)).late_yes).toBe(entry);
    await finalize(w, campaign);
    const c = readCampaign(w, campaign);
    expect([c.settle_mode, c.late_yes, c.winning_total, c.losing_total]).toEqual([1, entry, SOL, 2n * SOL]); // Split

    // The entry part comes back whole, with the rents of its Entry and its Join, as any late entry's.
    const refunded = await moved(w, [sponsor.address], () => settleEntry(w, campaign, sponsor.address));
    expect(refunded.gains[0]).toBe(entry + rentFor(w, ENTRY_LEN) + rentFor(w, JOIN_LEN));
    expectOk(await settleEntry(w, campaign, ana.address));
    expectOk(await settleEntry(w, campaign, bruno.address));
    // The 10% follows the mode: Split sends it to the fee vault, not back to the sponsor.
    const settled = await moved(w, [sponsor.address, feeVault], () => settleSealedFee(w, campaign, sponsor.address));
    expect(settled.gains[1]).toBe(fee);
    expect(settled.sent.events[0].data).toMatchObject({ fee_lamports: fee, refunded: false });
    expectOk(await collectFee(w, campaign));
    expectOk(await settlePrize(w, campaign, creator.address));
    expectOk(await send(w, [S.settleCreatorShareIx(campaign, vault, creator.address)]));
    expectOk(await closeCampaign(w, campaign, creator.address));

    // Every lamport accounted for: the campaign's accounts are closed, and what they held is with the people and the
    // fee vault. The sponsor's whole cost of its late sealed entry is the 10% fee: the entry and every rent came back.
    for (const a of [campaign, vault, sealedFee]) expect(balance(w, a)).toBe(0n);
    expect(await held()).toBe(before);
    expect(sponsorBefore - balance(w, sponsor.address)).toBe(fee);
  });
});
