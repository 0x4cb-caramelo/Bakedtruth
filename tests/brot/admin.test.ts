/**
 * Purpose: the admin and team instructions on their success paths, each with its event decoded
 *          from the transaction (TP sections 3.4.3 and 3.4.14), and the two-step admin change.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); lane B
 */
import { describe, expect, test } from "bun:test";
import { getProgramDerivedAddress } from "@solana/kit";

import { expectSnapshot, onlyEvent, ZERO } from "./admin-helpers";
import { DEFAULT_PARAMS, initConfig, readConfig, setTeam } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { balance, createWorld, expectError, expectOk, fundedWallet, rentFor, send } from "./setup";

describe("admin instructions", () => {
  test("initialize creates the config and the fee vault, paid by the upgrade authority", async () => {
    const w = await createWorld();
    const [admin, feeRecipient] = [await fundedWallet(w), await fundedWallet(w, 1n)];
    const before = balance(w, w.upgradeAuthority.address);
    const ix = await I.initializeConfigIx({
      authority: w.upgradeAuthority,
      admin: admin.address,
      feeRecipient: feeRecipient.address,
      params: DEFAULT_PARAMS,
    });
    const sent = expectOk(await send(w, [ix]));
    expect(onlyEvent(sent, "ConfigInitialized")).toEqual({
      signer: w.upgradeAuthority.address,
      admin: admin.address,
      fee_recipient: feeRecipient.address,
      params: DEFAULT_PARAMS,
    });

    const config = await readConfig(w);
    const [, bump] = await getProgramDerivedAddress({ programAddress: P.PROGRAM_ID, seeds: ["config"] });
    const [, feeVaultBump] = await getProgramDerivedAddress({ programAddress: P.PROGRAM_ID, seeds: ["fee_vault"] });
    expect(config).toEqual({
      tag: P.AccountTag.GlobalConfig,
      version: 1,
      bump,
      fee_vault_bump: feeVaultBump,
      operating_level: P.OperatingLevel.Normal,
      team_len: 0,
      admin: admin.address,
      pending_admin: ZERO,
      team: Array(5).fill(ZERO),
      fee_recipient: feeRecipient.address,
      params: DEFAULT_PARAMS,
      open_campaigns: 0,
      _reserved: new Uint8Array(64),
    });

    // Both accounts belong to the program, at their exact sizes and rent-exempt minimums (T19).
    for (const [at, size] of [
      [await P.configPda(), 400],
      [await P.feeVaultPda(), 0],
    ] as const) {
      const account = w.client.svm.getAccount(at);
      if (!account.exists) throw new Error(`${at} was not created`);
      expect([account.programAddress, account.data.length, balance(w, at)]).toEqual([
        P.PROGRAM_ID,
        size,
        rentFor(w, size),
      ]);
    }
    expect(before - balance(w, w.upgradeAuthority.address)).toBe(rentFor(w, 400) + rentFor(w, 0));
  });

  test("set_team replaces the whole list; a key left out can no longer pause", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const [a, b, c] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
    const sent = expectOk(await send(w, [await I.setTeamIx(admin, [a.address, b.address, c.address])]));
    const event = await expectSnapshot(w, sent, P.ConfigChange.Team, admin.address);
    expect([event.team_len, event.team]).toEqual([3, [a.address, b.address, c.address, ZERO, ZERO]]);

    const shrunk = expectOk(await send(w, [await I.setTeamIx(admin, [c.address])]));
    expect((await expectSnapshot(w, shrunk, P.ConfigChange.Team, admin.address)).team_len).toBe(1);
    expectError(await send(w, [await I.pauseEntriesIx(a)]), "NotTeamMember");
    // An empty team is valid: it removes every key, as after a leak (TP section 3.4.9).
    const emptied = expectOk(await send(w, [await I.setTeamIx(admin, [])]));
    expect((await expectSnapshot(w, emptied, P.ConfigChange.Team, admin.address)).team).toEqual(Array(5).fill(ZERO));
    expectError(await send(w, [await I.pauseEntriesIx(c)]), "NotTeamMember");
  });

  test("set_creation_params stores the new parameters and emits them", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const params = { ...DEFAULT_PARAMS, opening_fee_usd: 600n, fee_bps: 800, max_open_campaigns: 2 };
    const sent = expectOk(await send(w, [await I.setCreationParamsIx(admin, params)]));
    expect((await expectSnapshot(w, sent, P.ConfigChange.CreationParams, admin.address)).params).toEqual(params);
    expect((await readConfig(w)).open_campaigns).toBe(0);
  });

  test("set_fee_recipient points the fee vault's sweep at a new key", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const recipient = await fundedWallet(w, 1n);
    const sent = expectOk(await send(w, [await I.setFeeRecipientIx(admin, recipient.address)]));
    const event = await expectSnapshot(w, sent, P.ConfigChange.FeeRecipient, admin.address);
    expect(event.fee_recipient).toBe(recipient.address);
  });

  test("the admin changes in two steps, and only the named key can accept", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const [next, stranger] = [await fundedWallet(w), await fundedWallet(w)];
    const named = expectOk(await send(w, [await I.transferAdminIx(admin, next.address)]));
    const pending = await expectSnapshot(w, named, P.ConfigChange.PendingAdmin, admin.address);
    expect([pending.admin, pending.pending_admin]).toEqual([admin.address, next.address]);

    expectError(await send(w, [await I.acceptAdminIx(stranger)]), "NotPendingAdmin");
    expectError(await send(w, [await I.acceptAdminIx(admin)]), "NotPendingAdmin");
    // Until the named key accepts, the old admin still governs and the new one does not.
    expectOk(await send(w, [await I.setFeeRecipientIx(admin, stranger.address)]));
    expectError(await send(w, [await I.setFeeRecipientIx(next, next.address)]), "NotAdmin");

    const accepted = expectOk(await send(w, [await I.acceptAdminIx(next)]));
    const changed = await expectSnapshot(w, accepted, P.ConfigChange.Admin, next.address);
    expect([changed.admin, changed.pending_admin]).toEqual([next.address, ZERO]);
    expectError(await send(w, [await I.setFeeRecipientIx(admin, admin.address)]), "NotAdmin");
    expectOk(await send(w, [await I.setFeeRecipientIx(next, next.address)]));
    expectError(await send(w, [await I.acceptAdminIx(next)]), "NoPendingAdmin");
  });

  test("a pending change is replaced by a new transfer and cancelled by the zero key", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const [first, second] = [await fundedWallet(w), await fundedWallet(w)];
    expectOk(await send(w, [await I.transferAdminIx(admin, first.address)]));
    expectOk(await send(w, [await I.transferAdminIx(admin, second.address)]));
    expectError(await send(w, [await I.acceptAdminIx(first)]), "NotPendingAdmin");

    const cancelled = expectOk(await send(w, [await I.transferAdminIx(admin, ZERO)]));
    expect((await expectSnapshot(w, cancelled, P.ConfigChange.PendingAdmin, admin.address)).pending_admin).toBe(ZERO);
    expectError(await send(w, [await I.acceptAdminIx(second)]), "NoPendingAdmin");
    expect((await readConfig(w)).admin).toBe(admin.address);
  });

  test("one team key pauses, only the admin resumes, and each happens once", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const [member, other] = await setTeam(w, admin, 2);
    const paused = expectOk(await send(w, [await I.pauseEntriesIx(member)]));
    expect(onlyEvent(paused, "EntriesPaused")).toEqual({ signer: member.address });
    expect((await readConfig(w)).operating_level).toBe(P.OperatingLevel.EntriesHalted);
    expectError(await send(w, [await I.pauseEntriesIx(other)]), "AlreadyPaused");
    expectError(await send(w, [await I.resumeEntriesIx(member)]), "NotAdmin");

    const resumed = expectOk(await send(w, [await I.resumeEntriesIx(admin)]));
    expect(onlyEvent(resumed, "EntriesResumed")).toEqual({ signer: admin.address });
    expect((await readConfig(w)).operating_level).toBe(P.OperatingLevel.Normal);
    expectError(await send(w, [await I.resumeEntriesIx(admin)]), "NotPaused");
    // The pause can be used again after a resume.
    expectOk(await send(w, [await I.pauseEntriesIx(other)]));
  });
});
