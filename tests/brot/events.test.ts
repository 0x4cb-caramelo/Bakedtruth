/**
 * Purpose: the events round-trip (T4, X0.4): every instruction of Sprint 02 emits exactly one event
 *          by self-CPI, decoded from its inner instruction; campaign events carry the campaign and a
 *          contiguous seq from 0; a forged top-level call of the event instruction is refused; a
 *          failed transaction keeps nothing and leaves no gap. Logs what one emit costs.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane F
 */
import { describe, expect, test } from "bun:test";
import {
  AccountRole,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayerSigner,
  signTransactionMessageWithSigners,
  type Address,
  type Instruction,
  type KeyPairSigner,
} from "@solana/kit";
import { isFailedTransaction } from "@solana/kit-plugin-litesvm";
import { ComputeBudget } from "litesvm";

import { EVENTS } from "./events";
import { DEFAULT_PARAMS, initConfig, openedCampaign, readCampaign, setTeam, nextJoinIndex } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { createWorld, expectError, expectOk, fundedWallet, send, type World } from "./setup";

const SOL = P.SOL;

/** Sends `ix` alone and returns its only event, failing unless there is exactly one, named `name`. */
async function onlyEvent(w: World, ix: Instruction, name: string) {
  const sent = expectOk(await send(w, [ix]));
  expect(sent.events.map((e) => e.name)).toEqual([name]);
  return { event: sent.events[0].data, computeUnits: sent.computeUnits, logs: sent.logs };
}

/** The compute units the event's own frame (stack height 2) consumed, from the program logs. */
function innerFrameUnits(logs: string[]): number {
  const start = logs.findIndex((line) => line === `Program ${P.PROGRAM_ID} invoke [2]`);
  const consumed = logs.slice(start).find((line) => line.startsWith(`Program ${P.PROGRAM_ID} consumed `));
  return Number(/consumed (\d+) of/.exec(consumed ?? "")?.[1] ?? NaN);
}

/** Sends `ixs` like setup.ts `send`, but returns LiteSVM's own result, failed or not. */
async function sendRaw(w: World, ixs: Instruction[]) {
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(w.client.payer, m),
    (m) => w.client.svm.setTransactionMessageLifetimeUsingLatestBlockhash(m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  const result = w.client.svm.sendTransaction(await signTransactionMessageWithSigners(message));
  w.client.svm.expireBlockhash();
  return result;
}

const joinIx = (
  baker: KeyPairSigner,
  campaign: Address,
  metric: Address,
  side: number,
  amount: bigint,
  before = 0n,
  joinIndex = 0,
) => I.joinCampaignIx(baker, campaign, metric, { side, amount, expectedEntryTotal: before, joinIndex });

describe("events round-trip", () => {
  test("every instruction of the sprint emits exactly one event", async () => {
    const w = await createWorld();
    const [admin, feeRecipient, member, newAdmin, creator, baker] = await Promise.all(
      Array.from({ length: 6 }, () => fundedWallet(w)),
    );
    const units: Record<string, bigint> = {};
    const init = await I.initializeConfigIx({
      authority: w.upgradeAuthority,
      admin: admin.address,
      feeRecipient: feeRecipient.address,
      params: DEFAULT_PARAMS,
    });
    const initialized = await onlyEvent(w, init, "ConfigInitialized");
    expect([initialized.event.signer, initialized.event.admin, initialized.event.fee_recipient]).toEqual([
      w.upgradeAuthority.address,
      admin.address,
      feeRecipient.address,
    ]);
    units.admin_initialize_config = initialized.computeUnits;

    const changes: [string, Instruction, number, KeyPairSigner][] = [
      ["admin_set_team", await I.setTeamIx(admin, [member.address]), P.ConfigChange.Team, admin],
      [
        "admin_set_creation_params",
        await I.setCreationParamsIx(admin, { ...DEFAULT_PARAMS, max_open_campaigns: 999 }),
        P.ConfigChange.CreationParams,
        admin,
      ],
      ["admin_set_fee_recipient", await I.setFeeRecipientIx(admin, baker.address), P.ConfigChange.FeeRecipient, admin],
      ["admin_transfer_admin", await I.transferAdminIx(admin, newAdmin.address), P.ConfigChange.PendingAdmin, admin],
      ["admin_accept_admin", await I.acceptAdminIx(newAdmin), P.ConfigChange.Admin, newAdmin],
    ];
    for (const [name, ix, change, signer] of changes) {
      const changed = await onlyEvent(w, ix, "ConfigChanged");
      expect([name, changed.event.change, changed.event.signer]).toEqual([name, change, signer.address]);
      units[name] = changed.computeUnits;
    }

    const paused = await onlyEvent(w, await I.pauseEntriesIx(member), "EntriesPaused");
    expect(paused.event.signer).toBe(member.address);
    const resumed = await onlyEvent(w, await I.resumeEntriesIx(newAdmin), "EntriesResumed");
    expect(resumed.event.signer).toBe(newAdmin.address);
    units.team_pause_entries = paused.computeUnits;
    units.admin_resume_entries = resumed.computeUnits;

    // One `admin_set_creation_params` ran above, so the parameters are at version 1 (Sprint 03).
    const { campaign, sent } = await openedCampaign(w, creator, { expectedParamsVersion: 1 });
    expect(expectOk(sent).events.map((e) => e.name)).toEqual(["CampaignOpened"]);
    units.user_open_campaign = expectOk(sent).computeUnits;
    const metric = readCampaign(w, campaign).metric_account as Address;
    const added = await onlyEvent(w, await joinIx(baker, campaign, metric, P.Side.Yes, SOL / 50n), "EntryAdded");
    expect([added.event.campaign, added.event.baker]).toEqual([campaign, baker.address]);
    units.user_join_campaign = added.computeUnits;
    console.log("compute units per instruction, one emit each:", units);
  });

  test("campaign events carry the campaign and a contiguous seq from 0", async () => {
    const w = await createWorld();
    await initConfig(w);
    const [creator, a, b] = await Promise.all([fundedWallet(w), fundedWallet(w), fundedWallet(w)]);
    const { campaign, sent } = await openedCampaign(w, creator);
    expect(expectOk(sent).events.map((e) => [e.name, e.data.campaign, e.data.seq, e.data.creator])).toEqual([
      ["CampaignOpened", campaign, 0n, creator.address],
    ]);
    const metric = readCampaign(w, campaign).metric_account as Address;
    const entries: [KeyPairSigner, number, bigint, bigint][] = [
      [a, P.Side.Yes, SOL / 50n, 0n],
      [b, P.Side.No, (3n * SOL) / 100n, 0n],
      [a, P.Side.No, SOL / 100n, SOL / 50n],
    ];
    const seen: unknown[][] = [];
    for (const [baker, side, amount, before] of entries) {
      const joinIndex = await nextJoinIndex(w, campaign, baker.address);
      const { event } = await onlyEvent(
        w,
        await joinIx(baker, campaign, metric, side, amount, before, joinIndex),
        "EntryAdded",
      );
      seen.push([event.campaign, event.seq, event.baker, event.side, event.amount, event.pool_yes, event.pool_no]);
      if (seen.length === 3) expect([event.entry_yes, event.entry_no]).toEqual([SOL / 50n, SOL / 100n]);
    }
    expect(seen).toEqual([
      [campaign, 1n, a.address, P.Side.Yes, SOL / 50n, SOL / 50n, 0n],
      [campaign, 2n, b.address, P.Side.No, (3n * SOL) / 100n, SOL / 50n, (3n * SOL) / 100n],
      [campaign, 3n, a.address, P.Side.No, SOL / 100n, SOL / 50n, SOL / 25n],
    ]);
    expect(readCampaign(w, campaign).event_seq).toBe(4n);
  });

  test("a forged top-level call of the event instruction is refused", async () => {
    const w = await createWorld();
    const impostor = await fundedWallet(w);
    const data = Uint8Array.of(P.IX.EMIT_EVENT, EVENTS.EntryAdded.discriminator, ...new Uint8Array(114));
    const forged = (accounts: Instruction["accounts"]): Instruction => ({
      programAddress: P.PROGRAM_ID,
      accounts,
      data,
    });
    const authority = { address: P.EVENT_AUTHORITY, role: AccountRole.READONLY };
    // Naming the authority is not signing for it; only the program can, through `emit`.
    expectError(
      await send(w, [forged([authority, { address: P.PROGRAM_ID, role: AccountRole.READONLY }])]),
      "WrongEventAuthority",
    );
    const signing = { address: impostor.address, role: AccountRole.READONLY_SIGNER, signer: impostor };
    expectError(await send(w, [forged([signing, authority])]), "WrongEventAuthority");
    expectError(await send(w, [forged([])]), "WrongEventAuthority");
  });

  test("a failed transaction keeps no event and leaves no gap in the seq", async () => {
    const w = await createWorld();
    await initConfig(w);
    const [creator, a, b] = await Promise.all([fundedWallet(w), fundedWallet(w), fundedWallet(w)]);
    const { campaign } = await openedCampaign(w, creator);
    const metric = readCampaign(w, campaign).metric_account as Address;
    // The first join would emit seq 1; the second is below the minimum, so both are undone.
    const good = await joinIx(a, campaign, metric, P.Side.Yes, SOL / 50n);
    const result = await sendRaw(w, [good, await joinIx(b, campaign, metric, P.Side.No, 1n)]);
    expect(isFailedTransaction(result)).toBe(true);
    const recorded = isFailedTransaction(result) ? result.meta().innerInstructions().flat().length : -1;
    console.log(`failed transaction: LiteSVM still lists ${recorded} inner instruction(s); decoders skip it (rule 1)`);
    expect(readCampaign(w, campaign).event_seq).toBe(1n);
    expect([readCampaign(w, campaign).pool_yes, readCampaign(w, campaign).pool_no]).toEqual([0n, 0n]);
    const { event } = await onlyEvent(w, good, "EntryAdded");
    expect(event.seq).toBe(1n);
  });

  test("one emit: the event frame and the runtime's charge per CPI (logged)", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const [member] = await setTeam(w, admin, 1);
    const paused = await onlyEvent(w, await I.pauseEntriesIx(member), "EntriesPaused");
    const inner = innerFrameUnits(paused.logs);
    const invoke = new ComputeBudget().invokeUnits;
    console.log(
      `one emit (team_pause_entries): event frame ${inner} CU, plus ${invoke} CU the runtime charges ` +
        `the caller per CPI; the whole instruction ${paused.computeUnits} CU`,
    );
    expect(inner).toBeGreaterThan(0);
  });
});
