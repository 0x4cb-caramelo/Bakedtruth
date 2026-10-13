/**
 * Purpose: `settle_sealed_fee` and the SealedFee slot of a sealed entry, on the program (Sprint 15): the fee waits for
 *          the campaign to be finalized; two sponsors' fees on one campaign, and one wallet that cannot settle,
 *          redirect or refund the other's (the destinations are the stored sponsor and the fee vault, whoever sends
 *          it); a second settle refused; lamports sent by hand swept to the fee vault, a SealedFee funded in advance
 *          created all the same; and a SealedFee slot that is not the sponsor's own refused before anything moves.
 * Version: 0.0.1
 * Sprint:  15 (lane L15). Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";
import { lamports } from "@solana/kit";
import { buildSettleSealedFee } from "@brot/sdk/tx";

import { join, openedCampaign } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { finalize, moved, resolve, settleSealedFee, tallyAll, voidAsHouseFailure } from "./sealed-flows";
import {
  placeSealedFee,
  SEALED_FEE_LEN,
  sealedCharge,
  sealedEntry,
  sealedEntryIx,
  sealedState,
  sealedWorld,
} from "./sealed-support";
import { balance, expectError, expectOk, fundedWallet, rentFor, send, type World } from "./setup";

const SOL = P.SOL;

/** Ana's and Bia's sealed YES of US$500 and Bruno's NO on one campaign, which a team key voids as a house failure. */
async function twoSponsors() {
  const { w, team, creator, campaign, sponsor: ana } = await sealedWorld();
  const [bia, bruno] = [await fundedWallet(w, 1_000n), await fundedWallet(w)];
  expectOk(await sealedEntry(w, ana, campaign, { side: P.Side.Yes }));
  expectOk(await sealedEntry(w, bia, campaign, { side: P.Side.Yes }));
  expectOk(await join(w, bruno, campaign, { side: P.Side.No, amount: SOL }));
  return { w, team, creator, campaign, ana, bia, bruno };
}

/** Sends `ixs` expecting `error`, and shows that no account `who` names changed its lamports. */
async function refusedMovingNothing(w: World, who: string[], ix: Parameters<typeof send>[1][number], error: string) {
  const before = who.map((a) => balance(w, a as never));
  expectError(await send(w, [ix]), error as never);
  expect(who.map((a) => balance(w, a as never))).toEqual(before);
}

describe("settle_sealed_fee", () => {
  test("the held fee waits for the campaign to be finalized", async () => {
    const { w, team, campaign, ana, bia, bruno } = await twoSponsors();
    const ix = await buildSettleSealedFee({ campaign, sponsor: ana.address });
    const sealedFee = await P.sealedFeePda(campaign, ana.address);
    const who = [sealedFee, ana.address, await P.feeVaultPda()];
    await refusedMovingNothing(w, who, ix, "NotFinalized"); // Open
    await resolve(w, campaign, "stale");
    await refusedMovingNothing(w, who, ix, "NotFinalized"); // InReview
    await tallyAll(w, campaign, [ana.address, bia.address, bruno.address]);
    await voidAsHouseFailure(w, team[0], campaign);
    expectOk(await send(w, [ix]));
  });

  test("two users: A cannot settle, redirect or refund B's sealed fee (destinations fixed)", async () => {
    const { w, team, creator, campaign, ana, bia, bruno } = await twoSponsors();
    const { fee } = sealedCharge(500n);
    const [anaFee, biaFee, feeVault] = [
      await P.sealedFeePda(campaign, ana.address),
      await P.sealedFeePda(campaign, bia.address),
      await P.feeVaultPda(),
    ];
    // While the campaign is open, Ana's sealed entry cannot write into Bia's SealedFee.
    const intoBia = I.withSlot(await sealedEntryIx(w, ana, campaign, { side: P.Side.Yes }), 8, { address: biaFee });
    await refusedMovingNothing(w, [ana.address, biaFee], intoBia, "PdaMismatch");
    const other = (await openedCampaign(w, creator)).campaign;
    await resolve(w, campaign, "stale");
    await tallyAll(w, campaign, [ana.address, bia.address, bruno.address]);
    await voidAsHouseFailure(w, team[0], campaign);

    // Ana tries to take Bia's refund, to point it at another campaign, or to receive it as the fee vault.
    const who = [anaFee, biaFee, ana.address, bia.address, feeVault];
    const bias = await buildSettleSealedFee({ campaign, sponsor: bia.address });
    await refusedMovingNothing(w, who, I.withSlot(bias, 2, { address: ana.address }), "WrongSponsor");
    await refusedMovingNothing(w, who, I.withSlot(bias, 1, { address: other }), "SealedFeeMismatch");
    await refusedMovingNothing(w, who, I.withSlot(bias, 3, { address: ana.address }), "WrongOwner");
    await refusedMovingNothing(w, who, I.withSlot(bias, 3, { address: await P.vaultPda(campaign) }), "PdaMismatch");
    const anas = await buildSettleSealedFee({ campaign, sponsor: ana.address });
    await refusedMovingNothing(w, who, I.withSlot(anas, 0, { address: biaFee }), "WrongSponsor");

    // Any wallet settles each fee: a house failure sends it, with the rent, to its own sponsor and nowhere else.
    const rent = rentFor(w, SEALED_FEE_LEN);
    const settled = await moved(w, [bia.address, ana.address, feeVault], () => send(w, [bias]));
    expect(settled.gains).toEqual([rent + fee, 0n, 0n]);
    expect((await moved(w, [ana.address, bia.address], () => send(w, [anas]))).gains).toEqual([rent + fee, 0n]);
  });

  test("a second settle is refused: AlreadySettled, and nothing moves", async () => {
    const { w, team, campaign, ana, bia, bruno } = await twoSponsors();
    await resolve(w, campaign, "stale");
    await tallyAll(w, campaign, [ana.address, bia.address, bruno.address]);
    await voidAsHouseFailure(w, team[0], campaign);
    expectOk(await settleSealedFee(w, campaign, ana.address));
    const ix = await buildSettleSealedFee({ campaign, sponsor: ana.address });
    const sealedFee = await P.sealedFeePda(campaign, ana.address);
    await refusedMovingNothing(w, [sealedFee, ana.address, await P.feeVaultPda()], ix, "AlreadySettled");
  });

  test("lamports sent by hand go to the fee vault; a SealedFee funded in advance is created all the same", async () => {
    const { w, campaign, sponsor } = await sealedWorld();
    const bruno = await fundedWallet(w);
    const { fee } = sealedCharge(500n);
    const rent = rentFor(w, SEALED_FEE_LEN);
    const sealedFee = await P.sealedFeePda(campaign, sponsor.address);
    // Someone funds the SealedFee's address before the first sealed entry: the sponsor then pays no rent for it.
    w.client.svm.airdrop(sealedFee, lamports(rent + SOL));
    const before = (await sealedState(w, sponsor.address, campaign)).sponsor;
    expectOk(await sealedEntry(w, sponsor, campaign, { side: P.Side.Yes }));
    const rents = before - balance(w, sponsor.address) - sealedCharge(500n).paid;
    expect(rents).toBe(rentFor(w, 116) + rentFor(w, 96));
    expect(balance(w, sealedFee)).toBe(rent + SOL + fee);
    expectOk(await join(w, bruno, campaign, { side: P.Side.No, amount: SOL }));
    await resolve(w, campaign, "yes");
    await tallyAll(w, campaign, [sponsor.address, bruno.address]);
    await finalize(w, campaign);
    // A split: the fee and the surplus to the fee vault, the rent to the sponsor; the account closes empty.
    const feeVault = await P.feeVaultPda();
    const settled = await moved(w, [sponsor.address, feeVault], () => settleSealedFee(w, campaign, sponsor.address));
    expect(settled.gains).toEqual([rent, fee + SOL]);
    expect(w.client.svm.getAccount(sealedFee).exists).toBe(false);
  });

  test("a sealed entry's SealedFee slot: another slot of the join, or a SealedFee that does not match, is refused", async () => {
    const { w, campaign, sponsor } = await sealedWorld();
    const kept = await sealedState(w, sponsor.address, campaign);
    const base = await sealedEntryIx(w, sponsor, campaign, { side: P.Side.Yes });
    for (const slot of [0, 2, 3, 4, 6]) {
      const aliased = I.withSlot(base, 8, { address: base.accounts![slot].address, role: base.accounts![8].role });
      expectError(await send(w, [aliased]), "DuplicateAccount");
    }
    // A SealedFee at the sponsor's address that names another campaign (no transaction writes one) is refused.
    await placeSealedFee(w, campaign, sponsor.address, 0n, { campaign: sponsor.address });
    expectError(await send(w, [base]), "SealedFeeMismatch");
    await placeSealedFee(w, campaign, sponsor.address, 0n, { sponsor: campaign });
    expectError(await send(w, [base]), "SealedFeeMismatch");
    expect({ ...(await sealedState(w, sponsor.address, campaign)), sealedFee: kept.sealedFee }).toEqual(kept);
  });
});
