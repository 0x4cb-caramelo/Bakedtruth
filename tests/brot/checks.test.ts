/**
 * Purpose: the checks negatives in LiteSVM through `admin_set_team` and `user_join_campaign`: the
 *          config under another owner, unsigned and read-only slots, a wrong tag or layout version,
 *          a zeroed, short or long config, look-alike PDAs and wrong event slots, each refused with
 *          its exact error (T24; `bun test tests/ -t "checks refuse"`). X0.9 reruns them per check.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane A
 */
import { describe, test } from "bun:test";
import { AccountRole, type Address } from "@solana/kit";

import { anyAddress, configured, place, rewrite } from "./checks-support";
import { initConfig, openedCampaign, readCampaign } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { accountData, createWorld, expectError, fundedWallet, rentFor, send } from "./setup";

/** The config's bytes with byte `index` set to `value`. */
const withByte = (bytes: Uint8Array, index: number, value: number) => {
  const copy = new Uint8Array(bytes);
  copy[index] = value;
  return copy;
};

describe("checks refuse", () => {
  test("owned_by: the config under another owner", async () => {
    const { w, config, setTeam } = await configured();
    rewrite(w, config, { owner: await anyAddress() });
    expectError(await send(w, [setTeam]), "WrongOwner");
  });

  test("signer: an unsigned admin", async () => {
    const { w, setTeam } = await configured();
    const unsigned = I.withSlot(setTeam, 0, { role: AccountRole.READONLY });
    expectError(await send(w, [unsigned]), "MissingSignature");
  });

  test("writable: a read-only config", async () => {
    const { w, setTeam } = await configured();
    const readOnly = I.withSlot(setTeam, 1, { role: AccountRole.READONLY });
    expectError(await send(w, [readOnly]), "NotWritable");
  });

  test("tag: the tag of another account type", async () => {
    const { w, config, setTeam } = await configured();
    rewrite(w, config, { data: withByte(accountData(w, config), 0, P.AccountTag.Campaign) });
    expectError(await send(w, [setTeam]), "WrongTag");
  });

  test("tag: a zeroed config", async () => {
    const { w, config, setTeam } = await configured();
    rewrite(w, config, { data: new Uint8Array(accountData(w, config).length) });
    expectError(await send(w, [setTeam]), "WrongTag");
  });

  test("tag_version: another layout version", async () => {
    const { w, config, setTeam } = await configured();
    rewrite(w, config, { data: withByte(accountData(w, config), 1, 2) });
    expectError(await send(w, [setTeam]), "WrongLayoutVersion");
  });

  test("len: a short and a long config", async () => {
    const { w, config, setTeam } = await configured();
    const bytes = new Uint8Array(accountData(w, config));
    rewrite(w, config, { data: bytes.slice(0, bytes.length - 1) });
    expectError(await send(w, [setTeam]), "WrongLength");
    rewrite(w, config, { data: Uint8Array.of(...bytes, 0) });
    expectError(await send(w, [setTeam]), "WrongLength");
  });

  test("len: the data-less fee vault as the config", async () => {
    // A real account of the program in the wrong slot: owner right, length wrong.
    const { w, feeVault, setTeam } = await configured();
    expectError(await send(w, [I.withSlot(setTeam, 1, { address: feeVault })]), "WrongLength");
  });

  test("pda: a look-alike config", async () => {
    // The config's own bytes, owned by the program, at an address that is not the config PDA.
    const { w, config, setTeam } = await configured();
    const lookAlike = await anyAddress();
    const data = new Uint8Array(accountData(w, config));
    place(w, lookAlike, { owner: P.PROGRAM_ID, lamports: rentFor(w, data.length), data });
    expectError(await send(w, [I.withSlot(setTeam, 1, { address: lookAlike })]), "PdaMismatch");
  });

  test("pda: a look-alike campaign at join", async () => {
    // A real campaign's bytes elsewhere, with a data-less program account at its vault address.
    const w = await createWorld();
    await initConfig(w);
    const { campaign } = await openedCampaign(w, await fundedWallet(w));
    const lookAlike = await anyAddress();
    const data = new Uint8Array(accountData(w, campaign));
    place(w, lookAlike, { owner: P.PROGRAM_ID, lamports: rentFor(w, data.length), data });
    place(w, await P.vaultPda(lookAlike), { owner: P.PROGRAM_ID, lamports: rentFor(w, 0) });
    const metric = readCampaign(w, campaign).metric_account as Address;
    const entry = { side: P.Side.Yes, amount: 10_000_000n };
    const ix = await I.joinCampaignIx(await fundedWallet(w), lookAlike, metric, entry);
    expectError(await send(w, [ix]), "PdaMismatch");
  });

  test("event_accounts: a wrong event authority", async () => {
    const { w, setTeam } = await configured();
    const wrong = I.withSlot(setTeam, 2, { address: await anyAddress() });
    expectError(await send(w, [wrong]), "WrongEventAuthority");
  });

  test("event_program: a wrong program slot", async () => {
    const { w, setTeam } = await configured();
    const wrong = I.withSlot(setTeam, 3, { address: await anyAddress() });
    expectError(await send(w, [wrong]), "WrongProgramAccount");
  });
});
