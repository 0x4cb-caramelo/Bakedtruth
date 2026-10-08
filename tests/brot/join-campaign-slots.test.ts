/**
 * Purpose: the slot checks of `user_join_campaign` in the order of checks.rs, each with its own
 *          error: signer and writable flags, the three pairs that must differ, the System Program,
 *          the event slots, the config, the vault's owner and address and the size of the arguments.
 * Version: 0.0.2
 * Sprint:  02 (pot core on Pinocchio), lane E. Needs the SBF build: runs from the integration on.
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, type Address } from "@solana/kit";

import { place } from "./checks-support";
import type { BrotErrorName } from "./errors";
import { openedCampaign, readCampaign } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { balance, expectError, expectOk, fundedWallet, send } from "./setup";
import { joinWorld, snapshot } from "./join-campaign-support";

type SlotChange = Parameters<typeof I.withSlot>[2];

describe("join refuses", () => {
  test("a slot that fails its check, each with its own error, and moves nothing", async () => {
    const { w, creator, campaign, vault, metric } = await joinWorld();
    const baker = await fundedWallet(w);
    const stranger = await fundedWallet(w, 1n);
    const otherVault = (await openedCampaign(w, creator)).vault;
    const ix = await I.joinCampaignIx(baker, campaign, metric, { side: P.Side.Yes, amount: P.SOL });
    const entry = ix.accounts![4].address as Address;
    const cases: [number, SlotChange, BrotErrorName][] = [
      [0, { role: AccountRole.WRITABLE }, "MissingSignature"],
      [0, { role: AccountRole.READONLY_SIGNER }, "NotWritable"],
      [2, { role: AccountRole.READONLY }, "NotWritable"],
      [3, { role: AccountRole.READONLY }, "NotWritable"],
      [4, { role: AccountRole.READONLY }, "NotWritable"],
      [3, { address: campaign }, "DuplicateAccount"],
      [4, { address: vault }, "DuplicateAccount"],
      [4, { address: campaign }, "DuplicateAccount"],
      [6, { address: P.PROGRAM_ID }, "WrongSystemProgram"],
      [7, { address: stranger.address }, "WrongEventAuthority"],
      [8, { address: P.SYSTEM_PROGRAM_ID }, "WrongProgramAccount"],
      [1, { address: stranger.address }, "WrongOwner"],
      [3, { address: otherVault }, "PdaMismatch"],
    ];
    const kept = { baker: balance(w, baker.address), vault: balance(w, vault), campaign: readCampaign(w, campaign) };
    for (const [slot, change, error] of cases) {
      expectError(await send(w, [I.withSlot(ix, slot, change)]), error);
    }
    const data = ix.data!;
    expectError(await send(w, [I.withData(ix, data.slice(0, -1))]), "BadInstructionData");
    expectError(await send(w, [I.withData(ix, Uint8Array.of(...data, 0))]), "BadInstructionData");

    expect(snapshot(w, entry).owner).toBeNull();
    expect({ baker: balance(w, baker.address), vault: balance(w, vault), campaign: readCampaign(w, campaign) }).toEqual(
      kept,
    );
    expectOk(await send(w, [ix]));
  });

  test("a vault at its own address that the program does not own: WrongOwner, and nothing moves", async () => {
    const { w, campaign, vault, metric } = await joinWorld();
    const baker = await fundedWallet(w);
    place(w, vault, { owner: P.SYSTEM_PROGRAM_ID, lamports: balance(w, vault) });
    const before = { baker: balance(w, baker.address), vault: balance(w, vault) };
    const ix = await I.joinCampaignIx(baker, campaign, metric, { side: P.Side.Yes, amount: P.SOL });
    expectError(await send(w, [ix]), "WrongOwner");
    expect({ baker: balance(w, baker.address), vault: balance(w, vault) }).toEqual(before);
  });
});
