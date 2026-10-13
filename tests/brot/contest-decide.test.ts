/**
 * Purpose: stage 2 of a contest on the binary (Sprint 14, lane L14B): the admin confirms or voids (`ContestClosed`,
 *          then `CampaignFinalized`), the opening fee following the void's cause; "decide contest never inverts" over
 *          every decision and reason for a stored YES, NO and void; a stranger and a team key cannot decide; each
 *          refusal with its own error; the lapse of stage 2 at its deadline and of an unread stage 1 48 hours after
 *          its own (fix F3); the pause blocks neither. Filter: `-t "contest decide"`, `-t "decide contest never inverts"`.
 * Version: 0.1.1 (review fix F3)
 * Sprint:  14 (lane L14B). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import { buildPauseEntries } from "@brot/sdk/tx";

import * as C from "./contest-support";
import { readCampaign } from "./flows";
import * as IL from "./instructions-14-15";
import * as IS from "./instructions-settlement";
import * as P from "./program";
import { layoutSize } from "./layouts";
import { anyAddress, at, expectRefused, type Injected } from "./resolve-support";
import { balance, expectOk, rentFor, send } from "./setup";
import { ENTRY } from "./structs";

const ENDS = C.NOW + C.HOUR;
const { Yes, No, Void } = P.Outcome;
const { Confirm } = P.ContestDecision;
const VOID = P.ContestDecision.Void;
const { None, StaleFeed, TeamHouseFailure, TeamOutsideCause } = P.VoidReason;
const PRIZE = 900_000_000n;
const OPENING = 100_000_000n;

/** Returns the prize and collects the fee: what the creator and the fee vault each received. */
async function opener(cw: C.ContestWorld, c: Injected) {
  const [creator, feeVault] = [readCampaign(cw.w, c.campaign).creator as Address, await P.feeVaultPda()];
  const before = [balance(cw.w, creator), balance(cw.w, feeVault)];
  expectOk(await send(cw.w, [IS.settlePrizeIx(c.campaign, c.vault, creator)]));
  expectOk(await send(cw.w, [IS.collectFeeIx(c.campaign, c.vault, feeVault)]));
  return [balance(cw.w, creator) - before[0], balance(cw.w, feeVault) - before[1]];
}

describe("contest decide", () => {
  test("contest decide: the admin confirms, and ContestClosed comes before CampaignFinalized", async () => {
    const cw = await C.contestWorld();
    const c = await C.contested(cw, 2, ENDS);
    const sent = expectOk(await C.decide(cw, c, Confirm));
    expect(sent.events.map((e) => [e.name, e.data.seq])).toEqual([
      ["ContestClosed", C.SEQ],
      ["CampaignFinalized", C.SEQ + 1n],
    ]);
    expect(sent.events[0].data).toEqual({
      campaign: c.campaign,
      seq: C.SEQ,
      signer: cw.admin.address,
      decision: Confirm,
      void_reason: None,
      note_hash: C.NOTE,
    });
    const after = readCampaign(cw.w, c.campaign);
    expect([after.status, after.outcome, after.settle_mode, after.event_seq]).toEqual([
      P.Status.Settling,
      No,
      1,
      C.SEQ + 2n,
    ]);
    expect(sent.events[1].data.settle_mode).toBe(1);
  });

  test("contest decide: an admin void refunds every entry, and the opening fee follows the cause", async () => {
    for (const [reason, refunded] of [
      [TeamHouseFailure, true],
      [TeamOutsideCause, false],
    ] as const) {
      const cw = await C.contestWorld();
      // Two entries (2 SOL on YES, 1 SOL on NO), the prize and the opening fee held in the vault.
      const holds = { prize_lamports: PRIZE, opening_fee_lamports: OPENING, first_baker: await anyAddress() };
      const c = await C.contested(cw, 2, ENDS, holds);
      C.fundVault(cw.w, c.vault, PRIZE + OPENING);
      const { yes, no } = await C.entries(cw, c);
      expectOk(await C.decide(cw, c, VOID, reason));
      const after = readCampaign(cw.w, c.campaign);
      expect([after.status, after.outcome, after.void_reason, after.settle_mode]).toEqual([
        P.Status.Settling,
        Void,
        reason,
        3,
      ]);
      expect(after.void_note_hash).toEqual(C.NOTE);
      const kept = [balance(cw.w, yes.address), balance(cw.w, no.address)];
      for (const baker of [yes, no]) {
        const entry = await P.entryPda(c.campaign, baker.address);
        expectOk(await send(cw.w, [IS.settleEntryIx(entry, c.campaign, c.vault, baker.address)]));
      }
      const rent = rentFor(cw.w, layoutSize(ENTRY));
      expect([balance(cw.w, yes.address), balance(cw.w, no.address)]).toEqual([
        kept[0] + 2n * P.SOL + rent,
        kept[1] + P.SOL + rent,
      ]);
      expect(await opener(cw, c)).toEqual(refunded ? [PRIZE + OPENING, 0n] : [PRIZE, OPENING]);
    }
  });

  test("contest decide: a void of a pot with no entry keeps the opening fee (founder answer 8)", async () => {
    const cw = await C.contestWorld();
    const empty = { pool_yes: 0n, pool_no: 0n, entries_open: 0, prize_lamports: PRIZE, opening_fee_lamports: OPENING };
    const c = await C.contested(cw, 2, ENDS, empty);
    C.fundVault(cw.w, c.vault, PRIZE + OPENING);
    expectOk(await C.decide(cw, c, VOID, TeamHouseFailure));
    // Nothing to settle: Settled at once, out of the contest (the edge Contested to Settled).
    expect(readCampaign(cw.w, c.campaign).status).toBe(P.Status.Settled);
    expect(await opener(cw, c)).toEqual([PRIZE, OPENING]);
  });

  test("decide contest never inverts: no decision records a YES or NO other than the stored one", async () => {
    const cw = await C.contestWorld();
    let decided = 0;
    for (const stored of [Yes, No, Void]) {
      for (const decision of [Confirm, VOID, 2, 255]) {
        for (let reason = 0; reason <= 5; reason++) {
          const c = await C.contested(cw, 2, ENDS, {
            outcome: stored,
            void_reason: stored === Void ? StaleFeed : None,
          });
          const before = readCampaign(cw.w, c.campaign);
          const sent = await send(cw.w, [C.decideRaw(cw, c, decision, reason)]);
          const after = readCampaign(cw.w, c.campaign);
          if (!sent.ok) {
            expect([after.outcome, after.void_reason]).toEqual([before.outcome, before.void_reason]);
            continue;
          }
          decided++;
          // The stored outcome stands, with its reason, or the campaign is voided with the admin's: never inverted.
          const expected = decision === Confirm ? [stored, before.void_reason] : [Void, reason];
          expect([after.outcome, after.void_reason]).toEqual(expected);
        }
      }
    }
    // Per stored outcome: one confirm (no reason) and four voids (the team's reasons).
    expect(decided).toBe(15);
  });

  test("contest decide: a stranger and a team key cannot decide", async () => {
    const cw = await C.contestWorld();
    const c = await C.contested(cw, 2, ENDS);
    const args = { decision: Confirm, voidReason: None, noteHash: C.NOTE };
    for (const signer of [cw.outsider, cw.team]) {
      await expectRefused(cw.w, c, IL.adminDecideContestIx(signer, cw.config, c.campaign, args), "NotAdmin");
    }
  });

  test("contest decide: each refusal has its own error and writes nothing", async () => {
    const cw = await C.contestWorld();
    const cases = [
      [await C.reviewed(cw), Confirm, None, "NotContested"],
      [await C.contested(cw, 1, ENDS), Confirm, None, "WrongContestStage"],
      [await C.contested(cw, 2, ENDS), Confirm, TeamHouseFailure, "ConfirmWithVoidReason"],
      [await C.contested(cw, 2, ENDS), VOID, None, "VoidReasonNotForTeam"],
      [await C.contested(cw, 2, ENDS), VOID, P.VoidReason.UnreadableAccount, "VoidReasonNotForTeam"],
      [await C.contested(cw, 2, ENDS), 2, None, "InvalidContestDecision"],
      [await C.contested(cw, 2, ENDS), VOID, 6, "BadInstructionData"],
    ] as const;
    for (const [c, decision, reason, error] of cases) {
      await expectRefused(cw.w, c, C.decideRaw(cw, c, decision, reason), error);
    }
    const late = await C.contested(cw, 2, ENDS);
    at(cw.w, ENDS); // stage 2's deadline: the stored result stands from here on
    await expectRefused(cw.w, late, C.decideRaw(cw, late, Confirm, None), "ContestDeadlinePassed");
  });

  test("contest decide: the pause never blocks a decision or the lapse", async () => {
    const cw = await C.contestWorld();
    expectOk(await send(cw.w, [await buildPauseEntries({ teamMember: cw.team })]));
    const decided = await C.contested(cw, 2, ENDS);
    expectOk(await C.decide(cw, decided, VOID, TeamOutsideCause));
    const lapsed = await C.contested(cw, 2, ENDS);
    at(cw.w, ENDS);
    expectOk(await send(cw.w, [IS.finalizeCampaignIx(lapsed.campaign, cw.config)]));
    expect(readCampaign(cw.w, lapsed.campaign).status).toBe(P.Status.Settling);
  });

  test("contest lapse: finalize takes stage 2 from its deadline on, and an unread stage 1 48 hours after its own", async () => {
    const cw = await C.contestWorld();
    const stage1 = await C.contested(cw, 1, ENDS);
    const c = await C.contested(cw, 2, ENDS);
    at(cw.w, ENDS - 1n);
    await expectRefused(cw.w, c, IS.finalizeCampaignIx(c.campaign, cw.config), "ContestNotLapsed");
    at(cw.w, ENDS);
    // Review fix F3: stage 1 lapses where the latest stage 2 would end, not at its own deadline.
    await expectRefused(cw.w, stage1, IS.finalizeCampaignIx(stage1.campaign, cw.config), "ContestNotLapsed");
    const sent = expectOk(await send(cw.w, [IS.finalizeCampaignIx(c.campaign, cw.config)]));
    expect(sent.events.map((e) => [e.name, e.data.seq])).toEqual([["CampaignFinalized", C.SEQ]]);
    const after = readCampaign(cw.w, c.campaign);
    expect([after.status, after.outcome, after.settle_mode]).toEqual([P.Status.Settling, No, 1]);
    at(cw.w, ENDS + C.STAGE2_SECONDS - 1n);
    await expectRefused(cw.w, stage1, IS.finalizeCampaignIx(stage1.campaign, cw.config), "ContestNotLapsed");
    at(cw.w, ENDS + C.STAGE2_SECONDS);
    expectOk(await send(cw.w, [IS.finalizeCampaignIx(stage1.campaign, cw.config)]));
    expect(readCampaign(cw.w, stage1.campaign)).toMatchObject({ status: P.Status.Settling, outcome: No });
  });
});
