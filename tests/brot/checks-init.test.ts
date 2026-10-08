/**
 * Purpose: the checks negatives in LiteSVM through `admin_initialize_config`: non-canonical bumps,
 *          a look-alike System Program, the upgrade authority, a second initialisation, an address
 *          another program owns, one account in two slots and an unsigned authority whose accounts
 *          were funded in advance (T24; `-t "checks refuse"`); and the config and fee vault still
 *          created when their addresses were funded in advance.
 * Version: 0.0.2
 * Sprint:  02 (pot core on Pinocchio), lane A
 */
import { describe, expect, test } from "bun:test";
import { AccountRole } from "@solana/kit";

import { anyAddress, nonCanonicalPda, place, programDataOf, rewrite, text, uninitialised } from "./checks-support";
import { DEFAULT_PARAMS, initConfig } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { balance, expectError, expectOk, fundedWallet, rentFor, send, setUpgradeAuthority } from "./setup";

describe("checks refuse", () => {
  test("canonical_pda: a non-canonical config or fee vault", async () => {
    const { w, init } = await uninitialised();
    const config = await nonCanonicalPda([text("config")]);
    expectError(await send(w, [I.withSlot(init, 1, { address: config })]), "PdaMismatch");
    const feeVault = await nonCanonicalPda([text("fee_vault")]);
    expectError(await send(w, [I.withSlot(init, 2, { address: feeVault })]), "PdaMismatch");
  });

  test("system_program: a look-alike System Program", async () => {
    const { w, init } = await uninitialised();
    const lookAlike = I.withSlot(init, 4, { address: await anyAddress() });
    expectError(await send(w, [lookAlike]), "WrongSystemProgram");
  });

  test("upgrade_authority: any other signer", async () => {
    const { w, admin, feeRecipient } = await uninitialised();
    const impostor = await fundedWallet(w);
    const params = DEFAULT_PARAMS;
    const ix = await I.initializeConfigIx({
      authority: impostor,
      admin: admin.address,
      feeRecipient: feeRecipient.address,
      params,
    });
    expectError(await send(w, [ix]), "UpgradeAuthorityMismatch");
  });

  test("upgrade_authority: the ProgramData of another program or owner", async () => {
    const { w, init } = await uninitialised();
    // Another program's ProgramData, naming this program's upgrade authority.
    const other = await programDataOf(await anyAddress());
    setUpgradeAuthority(w.client, other, w.upgradeAuthority.address);
    expectError(await send(w, [I.withSlot(init, 3, { address: other })]), "WrongProgramData");
    // This program's ProgramData bytes, owned by someone other than the upgradeable loader.
    rewrite(w, await P.programDataPda(), { owner: P.SYSTEM_PROGRAM_ID });
    expectError(await send(w, [init]), "WrongProgramData");
  });

  test("upgrade_authority: an immutable program", async () => {
    const { w, init } = await uninitialised();
    setUpgradeAuthority(w.client, await P.programDataPda(), null);
    expectError(await send(w, [init]), "WrongProgramData");
  });

  test("create: a second initialization", async () => {
    const { w, init } = await uninitialised();
    await initConfig(w);
    expectError(await send(w, [init]), "AlreadyInitialized");
  });

  test("create: an address another program owns", async () => {
    const { w, init } = await uninitialised();
    place(w, await P.configPda(), { owner: await anyAddress(), lamports: rentFor(w, 0) });
    expectError(await send(w, [init]), "WrongOwner");
  });

  test("signer: an unsigned upgrade authority, with the config and fee vault funded in advance", async () => {
    // Funded in advance, neither account needs a lamport from the authority: the signature is all
    // that stops anyone from naming the upgrade authority's address and choosing the admin.
    const { w, init } = await uninitialised();
    const [config, feeVault] = [await P.configPda(), await P.feeVaultPda()];
    place(w, config, { owner: P.SYSTEM_PROGRAM_ID, lamports: rentFor(w, 400) });
    place(w, feeVault, { owner: P.SYSTEM_PROGRAM_ID, lamports: rentFor(w, 0) });
    expectError(await send(w, [I.withSlot(init, 0, { role: AccountRole.WRITABLE })]), "MissingSignature");
    for (const address of [config, feeVault]) {
      const account = w.client.svm.getAccount(address);
      expect(account.exists && [account.programAddress, account.data.length]).toEqual([P.SYSTEM_PROGRAM_ID, 0]);
    }
  });

  test("distinct: the config as the fee vault", async () => {
    const { w, init } = await uninitialised();
    const twice = I.withSlot(init, 2, { address: await P.configPda() });
    expectError(await send(w, [twice]), "DuplicateAccount");
  });
});

describe("checks accept", () => {
  test("create: a config and a fee vault funded in advance", async () => {
    // One lamport on the config, below its minimum; twice the minimum on the fee vault.
    const { w, init } = await uninitialised();
    const [config, feeVault] = [await P.configPda(), await P.feeVaultPda()];
    const vaultFunds = 2n * rentFor(w, 0);
    place(w, config, { owner: P.SYSTEM_PROGRAM_ID, lamports: 1n });
    place(w, feeVault, { owner: P.SYSTEM_PROGRAM_ID, lamports: vaultFunds });
    const before = balance(w, w.upgradeAuthority.address);
    expectOk(await send(w, [init]));
    const created = w.client.svm.getAccount(config);
    const vault = w.client.svm.getAccount(feeVault);
    if (!created.exists || !vault.exists) throw new Error("an account was not created");
    expect([created.programAddress, created.data.length, BigInt(created.lamports)]).toEqual([
      P.PROGRAM_ID,
      400,
      rentFor(w, 400),
    ]);
    expect([created.data[0], created.data[1]]).toEqual([P.AccountTag.GlobalConfig, 1]);
    expect([vault.programAddress, vault.data.length, BigInt(vault.lamports)]).toEqual([P.PROGRAM_ID, 0, vaultFunds]);
    // The upgrade authority paid only the config's top-up.
    expect(before - balance(w, w.upgradeAuthority.address)).toBe(rentFor(w, 400) - 1n);
  });
});
