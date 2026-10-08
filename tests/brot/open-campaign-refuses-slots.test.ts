/**
 * Purpose: `user_open_campaign` refuses a wrong account in any of its nine slots, each with the
 *          error of the check that catches it (TP section 3.4.17): the creator's signature and
 *          write flag, the writable slots, the campaign and vault in one account, the System
 *          Program, the event slots, a config that is not the program's and look-alike PDAs.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane D. Runs after the SBF build (Wave 2).
 */
import { describe, test } from "bun:test";
import { AccountRole, generateKeyPairSigner } from "@solana/kit";

import * as I from "./instructions";
import { openingWorld, tryOpen, type OpeningWorld, type Tamper } from "./opening";
import * as P from "./program";
import { expectError, fundedWallet } from "./setup";
import type { BrotErrorName } from "./errors";

/** Slot indexes of `user_open_campaign` (programs/brot-markets/src/instructions/mod.rs). */
const SLOT = { creator: 0, config: 1, campaign: 2, vault: 3, systemProgram: 6, eventAuthority: 7, program: 8 };

const refused = async (w: OpeningWorld, name: BrotErrorName, tamper: Tamper) =>
  expectError((await tryOpen(w, w.creator, {}, { tamper })).sent, name);
const randomAddress = async () => (await generateKeyPairSigner()).address;

describe("open campaign refuses", () => {
  test("a creator that does not sign, or signs read-only", async () => {
    const w = await openingWorld();
    await refused(w, "MissingSignature", (ix) => I.withSlot(ix, SLOT.creator, { role: AccountRole.WRITABLE }));
    await refused(w, "NotWritable", (ix) => I.withSlot(ix, SLOT.creator, { role: AccountRole.READONLY_SIGNER }));
  });

  test("a read-only config, campaign or vault", async () => {
    const w = await openingWorld();
    for (const slot of [SLOT.config, SLOT.campaign, SLOT.vault]) {
      await refused(w, "NotWritable", (ix) => I.withSlot(ix, slot, { role: AccountRole.READONLY }));
    }
  });

  test("the campaign passed again as its own vault", async () => {
    const w = await openingWorld();
    await refused(w, "DuplicateAccount", async (ix, args) =>
      I.withSlot(ix, SLOT.vault, { address: await P.campaignPda(args.id) }),
    );
  });

  test("a look-alike System Program and event slots", async () => {
    const w = await openingWorld();
    const other = await randomAddress();
    await refused(w, "WrongSystemProgram", (ix) => I.withSlot(ix, SLOT.systemProgram, { address: other }));
    await refused(w, "WrongEventAuthority", (ix) => I.withSlot(ix, SLOT.eventAuthority, { address: other }));
    await refused(w, "WrongProgramAccount", (ix) => I.withSlot(ix, SLOT.program, { address: other }));
  });

  test("a config the program does not own", async () => {
    const w = await openingWorld();
    const stranger = await fundedWallet(w, 1n);
    await refused(w, "WrongOwner", (ix) => I.withSlot(ix, SLOT.config, { address: stranger.address }));
  });

  test("a campaign or a vault at another id's address", async () => {
    const w = await openingWorld();
    await refused(w, "PdaMismatch", async (ix, args) =>
      I.withSlot(ix, SLOT.campaign, { address: await P.campaignPda(args.id + 1_000_000n) }),
    );
    await refused(w, "PdaMismatch", async (ix, args) =>
      I.withSlot(ix, SLOT.vault, { address: await P.vaultPda(await P.campaignPda(args.id + 1_000_000n)) }),
    );
  });
});
