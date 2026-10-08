/**
 * Purpose: initialisation by the program's upgrade authority only, read from its ProgramData
 *          account (TP section 7): other keys, an immutable program, a foreign ProgramData, a
 *          second initialisation, addresses funded in advance, bad slots, and the measured sizes,
 *          rent and compute units (T19).
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); lane B
 */
import { describe, expect, test } from "bun:test";
import {
  AccountRole,
  generateKeyPairSigner,
  getAddressEncoder,
  getProgramDerivedAddress,
  lamports,
  type Instruction,
  type KeyPairSigner,
} from "@solana/kit";

import { expectRefused } from "./admin-helpers";
import type { BrotErrorName } from "./errors";
import { DEFAULT_PARAMS, initConfig, readConfig } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { accountData, balance, createWorld, expectOk, fundedWallet, rentFor, send, setUpgradeAuthority } from "./setup";
import type { World } from "./setup";

/** `admin_initialize_config` signed by `authority`, naming a fresh key as admin and fee recipient. */
async function initIx(authority: KeyPairSigner) {
  const someone = (await generateKeyPairSigner()).address;
  return I.initializeConfigIx({ authority, admin: someone, feeRecipient: someone, params: DEFAULT_PARAMS });
}
const configExists = async (w: World) => w.client.svm.getAccount(await P.configPda()).exists;

describe("initialization only by the upgrade authority", () => {
  test("any other key is refused, even one that signs and pays", async () => {
    const w = await createWorld();
    const intruder = await fundedWallet(w);
    await expectRefused(w, "another key", await initIx(intruder), "UpgradeAuthorityMismatch");
    expect(await configExists(w)).toBe(false);
  });

  test("the authority is read from ProgramData: after a hand-over the old key is refused", async () => {
    const w = await createWorld();
    const successor = await fundedWallet(w);
    setUpgradeAuthority(w.client, await P.programDataPda(), successor.address);
    await expectRefused(w, "former authority", await initIx(w.upgradeAuthority), "UpgradeAuthorityMismatch");
    expectOk(await send(w, [await initIx(successor)]));
  });

  test("a ProgramData with no upgrade authority is refused", async () => {
    const w = await createWorld();
    setUpgradeAuthority(w.client, await P.programDataPda(), null);
    await expectRefused(w, "immutable program", await initIx(w.upgradeAuthority), "WrongProgramData");
    expect(await configExists(w)).toBe(false);
  });

  test("another program's ProgramData naming the signer is refused", async () => {
    const w = await createWorld();
    const intruder = await fundedWallet(w);
    const theirProgram = getAddressEncoder().encode((await generateKeyPairSigner()).address);
    const [theirs] = await getProgramDerivedAddress({ programAddress: P.LOADER_V3_ID, seeds: [theirProgram] });
    setUpgradeAuthority(w.client, theirs, intruder.address);
    const ix = I.withSlot(await initIx(intruder), 3, { address: theirs });
    await expectRefused(w, "foreign ProgramData", ix, "WrongProgramData");
    expect(await configExists(w)).toBe(false);
  });

  test("a second initialisation is refused and the first config stays as it was", async () => {
    const w = await createWorld();
    await initConfig(w);
    const before = accountData(w, await P.configPda());
    await expectRefused(w, "second initialisation", await initIx(w.upgradeAuthority), "AlreadyInitialized");
    expect(accountData(w, await P.configPda())).toEqual(before);
  });

  test("config and fee vault addresses funded in advance still initialise", async () => {
    const w = await createWorld();
    const [config, feeVault] = [await P.configPda(), await P.feeVaultPda()];
    // Below the config's rent-exempt minimum (topped up) and above the fee vault's (kept as is).
    w.client.svm.airdrop(config, lamports(1_000_000n));
    w.client.svm.airdrop(feeVault, lamports(2n * P.SOL));
    expect([balance(w, config), balance(w, feeVault)]).toEqual([1_000_000n, 2n * P.SOL]);
    const before = balance(w, w.upgradeAuthority.address);
    const { admin } = await initConfig(w);

    expect((await readConfig(w)).admin).toBe(admin.address);
    for (const [at, size] of [
      [config, 400],
      [feeVault, 0],
    ] as const) {
      const account = w.client.svm.getAccount(at);
      if (!account.exists) throw new Error(`${at} is gone`);
      expect([account.programAddress, account.data.length]).toEqual([P.PROGRAM_ID, size]);
    }
    expect([balance(w, config), balance(w, feeVault)]).toEqual([rentFor(w, 400), 2n * P.SOL]);
    expect(before - balance(w, w.upgradeAuthority.address)).toBe(rentFor(w, 400) - 1_000_000n);
  });
});

describe("admin instructions", () => {
  test("initialize refuses a bad slot or bad data with that slot's own error", async () => {
    const w = await createWorld();
    const base = await initIx(w.upgradeAuthority);
    const elsewhere = (await generateKeyPairSigner()).address;
    const bad: [string, Instruction, BrotErrorName][] = [
      ["unsigned authority", I.withSlot(base, 0, { role: AccountRole.WRITABLE }), "MissingSignature"],
      ["read-only authority", I.withSlot(base, 0, { role: AccountRole.READONLY_SIGNER }), "NotWritable"],
      ["read-only config", I.withSlot(base, 1, { role: AccountRole.READONLY }), "NotWritable"],
      ["read-only fee vault", I.withSlot(base, 2, { role: AccountRole.READONLY }), "NotWritable"],
      ["the config in both slots", I.withSlot(base, 2, { address: await P.configPda() }), "DuplicateAccount"],
      ["another system program", I.withSlot(base, 4, { address: elsewhere }), "WrongSystemProgram"],
      ["another event authority", I.withSlot(base, 5, { address: elsewhere }), "WrongEventAuthority"],
      ["another program", I.withSlot(base, 6, { address: P.SYSTEM_PROGRAM_ID }), "WrongProgramAccount"],
      ["a config off its PDA", I.withSlot(base, 1, { address: elsewhere }), "PdaMismatch"],
      ["a fee vault off its PDA", I.withSlot(base, 2, { address: elsewhere }), "PdaMismatch"],
      ["one byte too many", I.withData(base, Uint8Array.of(...base.data!, 0)), "BadInstructionData"],
      ["one byte too few", I.withData(base, base.data!.slice(0, -1)), "BadInstructionData"],
    ];
    for (const [label, ix, error] of bad) await expectRefused(w, label, ix, error);
    expect(await configExists(w)).toBe(false);
    expectOk(await send(w, [base])); // the untouched instruction was valid all along
  });

  test("measures the config, the fee vault and each admin instruction's compute units (T19)", async () => {
    const w = await createWorld();
    const [admin, next, member] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
    const units: Record<string, bigint> = {};
    const run = async (name: string, ix: Instruction) => {
      units[name] = expectOk(await send(w, [ix])).computeUnits;
    };
    const init = { authority: w.upgradeAuthority, admin: admin.address, feeRecipient: admin.address };
    await run("admin_initialize_config", await I.initializeConfigIx({ ...init, params: DEFAULT_PARAMS }));
    await run("admin_set_team", await I.setTeamIx(admin, [member.address]));
    await run("admin_set_creation_params", await I.setCreationParamsIx(admin, DEFAULT_PARAMS));
    await run("admin_set_fee_recipient", await I.setFeeRecipientIx(admin, next.address));
    await run("admin_transfer_admin", await I.transferAdminIx(admin, next.address));
    await run("admin_accept_admin", await I.acceptAdminIx(next));
    await run("team_pause_entries", await I.pauseEntriesIx(member));
    await run("admin_resume_entries", await I.resumeEntriesIx(next));

    const sizes = { GlobalConfig: 400, feeVault: 0 };
    const rent = Object.fromEntries(Object.entries(sizes).map(([name, size]) => [name, rentFor(w, size)]));
    expect(rent).toEqual({
      GlobalConfig: balance(w, await P.configPda()),
      feeVault: balance(w, await P.feeVaultPda()),
    });
    console.log("T19 sizes (bytes):", sizes, "rent-exempt minimum (lamports):", rent);
    console.log("T19 compute units per admin instruction:", units);
  });
});
