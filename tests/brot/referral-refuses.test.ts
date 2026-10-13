/**
 * Purpose: every refusal of `user_link_referrer` in LiteSVM, each with its exact error, no link created and no
 *          lamport taken from the referee: a second link, an unsigned referee (with its link funded in advance too:
 *          the one case where only the signature stops a wallet from choosing someone else's referrer), a read-only
 *          referee or link, a look-alike, non-canonical or another referee's link, another program's account or a
 *          System account with data at the link, a look-alike System Program, the zero or the referee's own address
 *          as the referrer, wrong event slots and arguments of another length (T24, X0.9).
 *          Filter: `bun test tests/ -t "link referrer refuses"`.
 * Version: 0.1.0
 * Sprint:  14 (referral), lane L14A. Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, getAddressEncoder, type Address, type Instruction, type KeyPairSigner } from "@solana/kit";

import { referralLinkAddress } from "@brot/sdk/read";

import { anyAddress, nonCanonicalPda, place, text } from "./checks-support";
import type { BrotErrorName } from "./errors";
import * as I from "./instructions";
import * as P from "./program";
import { expectNoLink, link, linkIx, linkWorld, readLink, snapshot } from "./referral-support";
import { balance, expectError, expectOk, rentFor, send, type World } from "./setup";

/** `ix` fails with `error`, no link is created at the referee's address and the referee keeps every lamport. */
async function refusedLink(w: World, referee: KeyPairSigner, ix: Instruction, error: BrotErrorName) {
  const before = balance(w, referee.address);
  expectError(await send(w, [ix]), error);
  expectNoLink(w, await referralLinkAddress(referee.address));
  expect(balance(w, referee.address)).toBe(before);
}

describe("link referrer refuses", () => {
  test("link: a second link, to any referrer", async () => {
    const { w, referee, referrer, link: address } = await linkWorld();
    expectOk(await link(w, referee, referrer.address));
    const kept = snapshot(w, address);
    for (const next of [referrer.address, await anyAddress()]) {
      expectError(await link(w, referee, next), "AlreadyInitialized");
    }
    expect(snapshot(w, address)).toEqual(kept);
    expect((await readLink(w, referee.address)).link.referrer).toBe(referrer.address);
  });

  test("link: an unsigned referee", async () => {
    const { w, referee, referrer } = await linkWorld();
    const unsigned = I.withSlot(await linkIx(referee, referrer.address), 0, { role: AccountRole.WRITABLE });
    await refusedLink(w, referee, unsigned, "MissingSignature");
  });

  test("link: an unsigned referee whose link was funded in advance", async () => {
    // Funded in advance, the link needs no lamport from the referee, so without the signature check any wallet
    // could name the referee's address and choose its referrer.
    const { w, referee, referrer, link: address } = await linkWorld();
    place(w, address, { owner: P.SYSTEM_PROGRAM_ID, lamports: rentFor(w, 96) });
    const unsigned = I.withSlot(await linkIx(referee, referrer.address), 0, { role: AccountRole.WRITABLE });
    await refusedLink(w, referee, unsigned, "MissingSignature");
    expect(snapshot(w, address)).toMatchObject({ owner: P.SYSTEM_PROGRAM_ID, lamports: rentFor(w, 96), data: [] });
  });

  test("link: a read-only referee", async () => {
    const { w, referee, referrer } = await linkWorld();
    const readOnly = I.withSlot(await linkIx(referee, referrer.address), 0, { role: AccountRole.READONLY_SIGNER });
    await refusedLink(w, referee, readOnly, "NotWritable");
  });

  test("link: a read-only link", async () => {
    const { w, referee, referrer } = await linkWorld();
    const readOnly = I.withSlot(await linkIx(referee, referrer.address), 1, { role: AccountRole.READONLY });
    await refusedLink(w, referee, readOnly, "NotWritable");
  });

  test("link: a look-alike, a non-canonical or another referee's link", async () => {
    const { w, referee, referrer } = await linkWorld();
    const seeds = [text("referral"), new Uint8Array(getAddressEncoder().encode(referee.address))];
    const others = await referralLinkAddress(referrer.address);
    for (const address of [await anyAddress(), await nonCanonicalPda(seeds), others] as Address[]) {
      const lookAlike = I.withSlot(await linkIx(referee, referrer.address), 1, { address });
      await refusedLink(w, referee, lookAlike, "PdaMismatch");
      expectNoLink(w, address);
    }
  });

  test("link: another program's account, or a System account with data, at the link", async () => {
    const { w, referee, referrer, link: address } = await linkWorld();
    const data = new Uint8Array(96);
    place(w, address, { owner: await anyAddress(), lamports: rentFor(w, 96), data });
    expectError(await link(w, referee, referrer.address), "WrongOwner");
    place(w, address, { owner: P.SYSTEM_PROGRAM_ID, lamports: rentFor(w, 96), data });
    expectError(await link(w, referee, referrer.address), "AlreadyInitialized");
    expect(snapshot(w, address)).toMatchObject({ owner: P.SYSTEM_PROGRAM_ID, data: [...data] });
  });

  test("link: a look-alike System Program", async () => {
    const { w, referee, referrer } = await linkWorld();
    const lookAlike = I.withSlot(await linkIx(referee, referrer.address), 2, { address: await anyAddress() });
    await refusedLink(w, referee, lookAlike, "WrongSystemProgram");
  });

  test("link: the zero address as the referrer", async () => {
    const { w, referee } = await linkWorld();
    await refusedLink(w, referee, await linkIx(referee, P.SYSTEM_PROGRAM_ID), "InvalidReferrer");
  });

  test("link: the referee as its own referrer", async () => {
    const { w, referee } = await linkWorld();
    await refusedLink(w, referee, await linkIx(referee, referee.address), "InvalidReferrer");
  });

  test("link: a wrong event authority", async () => {
    const { w, referee, referrer } = await linkWorld();
    const wrong = I.withSlot(await linkIx(referee, referrer.address), 3, { address: await anyAddress() });
    await refusedLink(w, referee, wrong, "WrongEventAuthority");
  });

  test("link: a wrong program slot", async () => {
    const { w, referee, referrer } = await linkWorld();
    const wrong = I.withSlot(await linkIx(referee, referrer.address), 4, { address: await anyAddress() });
    await refusedLink(w, referee, wrong, "WrongProgramAccount");
  });

  test("link: arguments of another length", async () => {
    const { w, referee, referrer } = await linkWorld();
    const ix = await linkIx(referee, referrer.address);
    for (const length of [0, 31, 33]) {
      const bytes = I.withData(ix, I.data(P.IX.USER_LINK_REFERRER, new Uint8Array(length).fill(7)));
      await refusedLink(w, referee, bytes, "BadInstructionData");
    }
  });
});
