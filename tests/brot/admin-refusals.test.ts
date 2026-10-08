/**
 * Purpose: every refusal of the admin and team instructions with its exact error (X0.7): a signer
 *          without the role, the team rules, the zero keys, each creation parameter past its
 *          bound, and a bad slot or bad data in every config instruction.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); lane B
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner, type Instruction } from "@solana/kit";

import { ALL_CEILINGS, ALL_FLOORS, expectRefused, lookAlikeConfig, OUT_OF_RANGE, ZERO } from "./admin-helpers";
import type { BrotErrorName } from "./errors";
import { DEFAULT_PARAMS, initConfig, readConfig, setTeam } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { createWorld, expectOk, fundedWallet, send } from "./setup";

describe("admin instructions", () => {
  test("every admin instruction refuses a signer that is not the admin, a team key included", async () => {
    const w = await createWorld();
    const { admin, feeRecipient } = await initConfig(w);
    const [member] = await setTeam(w, admin, 1);
    expectOk(await send(w, [await I.pauseEntriesIx(member)])); // so that a resume would otherwise run
    const stranger = await fundedWallet(w);
    for (const who of [stranger, member]) {
      const instructions: [string, Instruction][] = [
        ["set_team", await I.setTeamIx(who, [who.address])],
        ["set_creation_params", await I.setCreationParamsIx(who, ALL_CEILINGS)],
        ["set_fee_recipient", await I.setFeeRecipientIx(who, who.address)],
        ["transfer_admin", await I.transferAdminIx(who, who.address)],
        ["resume_entries", await I.resumeEntriesIx(who)],
      ];
      for (const [name, ix] of instructions) await expectRefused(w, name, ix, "NotAdmin");
    }
    // Nothing changed: the same admin, team, recipient and parameters, and still paused.
    const c = await readConfig(w);
    expect([c.admin, c.pending_admin, c.team_len, c.fee_recipient]).toEqual([
      admin.address,
      ZERO,
      1,
      feeRecipient.address,
    ]);
    expect([c.params, c.operating_level]).toEqual([DEFAULT_PARAMS, P.OperatingLevel.EntriesHalted]);
  });

  test("the pause refuses a key that is not on the team, the admin's included", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    await setTeam(w, admin, 2);
    const stranger = await fundedWallet(w);
    await expectRefused(w, "a stranger", await I.pauseEntriesIx(stranger), "NotTeamMember");
    await expectRefused(w, "the admin", await I.pauseEntriesIx(admin), "NotTeamMember");
    expect((await readConfig(w)).operating_level).toBe(P.OperatingLevel.Normal);
  });

  test("set_team refuses a sixth key, a zero key, a key twice and a key past team_len", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const keys = await Promise.all([1, 2, 3, 4, 5].map(async () => (await generateKeyPairSigner()).address));
    const [k0, k1] = keys;
    await expectRefused(w, "six keys", await I.setTeamIx(admin, keys, 6), "TeamTooLarge");
    await expectRefused(w, "a zero key", await I.setTeamIx(admin, [k0, ZERO]), "ZeroAddress");
    await expectRefused(w, "a key twice", await I.setTeamIx(admin, [k0, k1, k0]), "DuplicateTeamKey");
    await expectRefused(w, "a key past team_len", await I.setTeamIx(admin, [k0, k1], 1), "TeamSlotNotEmpty");
    expect((await readConfig(w)).team_len).toBe(0);
    expectOk(await send(w, [await I.setTeamIx(admin, keys)]));
  });

  test("set_fee_recipient refuses the zero key, and accept_admin refuses when nothing is pending", async () => {
    const w = await createWorld();
    const { admin, feeRecipient } = await initConfig(w);
    await expectRefused(w, "zero recipient", await I.setFeeRecipientIx(admin, ZERO), "ZeroAddress");
    expect((await readConfig(w)).fee_recipient).toBe(feeRecipient.address);
    await expectRefused(w, "nothing pending", await I.acceptAdminIx(admin), "NoPendingAdmin");
  });

  test("set_creation_params refuses each parameter past its bound with its own error", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    for (const [label, change, error] of OUT_OF_RANGE) {
      await expectRefused(w, label, await I.setCreationParamsIx(admin, { ...DEFAULT_PARAMS, ...change }), error);
    }
    expect((await readConfig(w)).params).toEqual(DEFAULT_PARAMS);
    // Every bound itself passes: all the floors at once, then all the ceilings.
    for (const params of [ALL_FLOORS, ALL_CEILINGS]) {
      expectOk(await send(w, [await I.setCreationParamsIx(admin, params)]));
      expect((await readConfig(w)).params).toEqual(params);
    }
  });

  test("initialize refuses a zero admin, a zero fee recipient and each parameter past its bound", async () => {
    const w = await createWorld();
    const someone = (await fundedWallet(w)).address;
    const init = (over: Partial<Parameters<typeof I.initializeConfigIx>[0]>) =>
      I.initializeConfigIx({
        authority: w.upgradeAuthority,
        admin: someone,
        feeRecipient: someone,
        params: DEFAULT_PARAMS,
        ...over,
      });
    await expectRefused(w, "zero admin", await init({ admin: ZERO }), "ZeroAddress");
    await expectRefused(w, "zero fee recipient", await init({ feeRecipient: ZERO }), "ZeroAddress");
    for (const [label, change, error] of OUT_OF_RANGE) {
      await expectRefused(w, label, await init({ params: { ...DEFAULT_PARAMS, ...change } }), error);
    }
    expect(w.client.svm.getAccount(await P.configPda()).exists).toBe(false);
    expectOk(await send(w, [await init({})]));
  });

  test("every config instruction refuses a bad slot or bad data with that slot's own error", async () => {
    const w = await createWorld();
    const { admin, feeRecipient } = await initConfig(w);
    const [member] = await setTeam(w, admin, 1);
    const lookAlike = await lookAlikeConfig(w, admin.address);
    const wallet = feeRecipient.address; // an account the System Program owns
    const instructions: [string, Instruction][] = [
      ["set_team", await I.setTeamIx(admin, [member.address])],
      ["set_creation_params", await I.setCreationParamsIx(admin, DEFAULT_PARAMS)],
      ["set_fee_recipient", await I.setFeeRecipientIx(admin, wallet)],
      ["transfer_admin", await I.transferAdminIx(admin, member.address)],
      ["accept_admin", await I.acceptAdminIx(member)],
      ["pause_entries", await I.pauseEntriesIx(member)],
      ["resume_entries", await I.resumeEntriesIx(admin)],
    ];
    for (const [name, ix] of instructions) {
      const bad: [string, Instruction, BrotErrorName][] = [
        ["unsigned signer", I.withSlot(ix, 0, { role: AccountRole.READONLY }), "MissingSignature"],
        ["read-only config", I.withSlot(ix, 1, { role: AccountRole.READONLY }), "NotWritable"],
        ["a wallet as config", I.withSlot(ix, 1, { address: wallet }), "WrongOwner"],
        ["a look-alike config", I.withSlot(ix, 1, { address: lookAlike }), "PdaMismatch"],
        ["another event authority", I.withSlot(ix, 2, { address: wallet }), "WrongEventAuthority"],
        ["another program", I.withSlot(ix, 3, { address: P.SYSTEM_PROGRAM_ID }), "WrongProgramAccount"],
        ["one byte too many", I.withData(ix, Uint8Array.of(...ix.data!, 0)), "BadInstructionData"],
      ];
      for (const [label, tampered, error] of bad) await expectRefused(w, `${name}, ${label}`, tampered, error);
    }
    const c = await readConfig(w);
    expect([c.admin, c.pending_admin, c.team_len, c.operating_level]).toEqual([
      admin.address,
      ZERO,
      1,
      P.OperatingLevel.Normal,
    ]);
  });
});
