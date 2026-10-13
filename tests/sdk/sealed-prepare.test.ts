/**
 * Purpose: A-3 for the sealed entry (Sprint 15; red team L4), end to end against the program's state (LiteSVM behind a
 *          local RPC endpoint): re-read, checked, quoted, built, summarised from the bytes the wallet signs and
 *          simulated by `prepareSealedEntry`, then signed and landed; a retry with the saved entry total is refused
 *          once the first landed (A-9); a refusal stops at the check in the program's order (the pause before the
 *          price); a change of the creation rules after the preparation refuses the signed entry, and a retry that
 *          passes the saved terms back stops at the check (second red-team pass, L-a); on a SOL/USD campaign the one
 *          account is read once (I-b); a sponsor the cluster cannot charge is not ready.
 *          Filter: `bun test tests/ -t "a sealed entry is prepared"`.
 * Version: 0.1.1
 * Sprint:  15 (lane L15). Needs the SBF build.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, signTransactionMessageWithSigners, type Instruction } from "@solana/kit";

import { ACCOUNT_LEN, Side } from "@brot/sdk/read";
import { prepareSealedEntry, type PreparedSealedEntry } from "@brot/sdk/tx";

import { DEFAULT_PARAMS, readCampaign, SOL_CHARGED, SOL_PRICE } from "../brot/flows";
import * as I from "../brot/instructions";
import * as P from "../brot/program";
import { readSealedFee, sealedCharge, sealedWorld } from "../brot/sealed-support";
import { expectError, expectOk, fundedWallet, rentFor, send, setPriceAccount, START_TIME } from "../brot/setup";
import { startFakeRpc, type FakeRpc } from "./fake-rpc";

let rpc: FakeRpc | null = null;
afterEach(() => rpc?.close());

/** The prepared entry when ready; otherwise a failure that names the stage and the error that stopped it. */
function ready(prepared: PreparedSealedEntry): Extract<PreparedSealedEntry, { ok: true }> {
  if (prepared.ok) return prepared;
  const why =
    prepared.stage === "check"
      ? prepared.check.refusal.errorName
      : (prepared.simulation.errorName ?? String(prepared.simulation.err));
  throw new Error(`not ready, stopped at the ${prepared.stage}: ${why}`);
}
const refusal = (prepared: PreparedSealedEntry) =>
  prepared.ok || prepared.stage !== "check" ? null : prepared.check.refusal.errorName;

/** A world with its campaign (`over` its opening), and the preparation through an RPC that records each account read. */
async function preparing(over: Parameters<typeof sealedWorld>[0] = {}) {
  const world = await sealedWorld(over);
  rpc = startFakeRpc(world.w);
  const reads: string[] = [];
  const base = createSolanaRpc(rpc.url);
  const client = new Proxy(base, {
    get(target, method, receiver) {
      const call = Reflect.get(target, method, receiver);
      if (method !== "getAccountInfo") return call;
      return (at: string, config: unknown) => (reads.push(at), call.call(target, at, config));
    },
  });
  const prepare = (more: Partial<Parameters<typeof prepareSealedEntry>[0]> = {}) =>
    prepareSealedEntry({
      rpc: client,
      sponsor: world.sponsor,
      campaign: world.campaign,
      side: Side.Yes,
      entryUsd: 500n,
      ...more,
    });
  return { ...world, prepare, reads };
}

describe("a sealed entry is prepared, then signed", () => {
  test("the quote, max_lamports, the estimate, the whole debit, the signed bytes, then what landed", async () => {
    const { w, campaign, vault, sponsor, prepare } = await preparing();
    const prepared = ready(await prepare());
    const { paid, entry, fee } = sealedCharge(500n);
    expect(prepared.check.charge).toMatchObject({ paid, entry, fee });
    expect(prepared.check).toMatchObject({
      isFirst: true,
      expectedEntryTotal: 0n,
      joinIndex: 0,
      createsSealedFee: true,
    });
    expect([prepared.expectedEntryTotal, prepared.expectedParamsVersion]).toEqual([0n, 0]);
    expect(prepared.maxLamports).toBe(paid + (paid * 100n + 9_999n) / 10_000n);
    expect(BigInt(prepared.minReturnBps)).toBe((prepared.check.estimateBps * 9_900n) / 10_000n);
    const rents = rentFor(w, ACCOUNT_LEN.join) + rentFor(w, ACCOUNT_LEN.entry) + rentFor(w, ACCOUNT_LEN.sealedFee);
    expect(prepared.debit).toEqual({
      payment: paid,
      maxPayment: prepared.maxLamports,
      rents,
      networkFee: 5_000n,
      total: paid + rents + 5_000n,
      maxTotal: prepared.maxLamports + rents + 5_000n,
    });
    expect(prepared.simulation.events.map((e) => e.name)).toEqual(["EntryAdded", "SealedFeeHeld"]);
    const { summary } = prepared;
    expect([summary.trusted, summary.feePayer]).toEqual([true, sponsor.address]);
    for (const words of ["Crypto.BTC/USD", "under creation rules version 0", "; 10.00% of it is Brot's fee"]) {
      expect(summary.lines[1]).toContain(words);
    }
    const signed = await signTransactionMessageWithSigners(prepared.message);
    expect(signed.messageBytes).toEqual(prepared.transaction.messageBytes);
    expect(w.client.svm.sendTransaction(signed).toString()).not.toContain("err");
    expect(readCampaign(w, campaign).pool_yes).toBe(entry);
    expect((await readSealedFee(w, campaign, sponsor.address)).fee_lamports).toBe(fee);
    expect(w.client.svm.getAccount(vault).exists).toBe(true);
  });

  test("a retry that passes the saved entry total is refused once the first sealed entry landed (A-9)", async () => {
    const { w, prepare } = await preparing();
    const first = ready(await prepare());
    w.client.svm.sendTransaction(await signTransactionMessageWithSigners(first.message));
    expect(refusal(await prepare({ expectedEntryTotal: first.expectedEntryTotal }))).toBe("EntryTotalMismatch");
    // Without the saved total, a new preparation reads the landed one and would add a second sealed entry.
    const again = ready(await prepare());
    expect([again.expectedEntryTotal, again.check.createsSealedFee]).toEqual([sealedCharge(500n).entry, false]);
  });

  test("a refusal stops at the check, in the program's order: the pause before the price, then the floor", async () => {
    const { w, team, prepare } = await preparing();
    expect(refusal(await prepare({ entryUsd: 499n }))).toBe("SealedEntryBelowFloor");
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: START_TIME - 121n });
    expect(refusal(await prepare())).toBe("SolUsdStale");
    expectOk(await send(w, [await I.pauseEntriesIx(team[0])]));
    expect(refusal(await prepare())).toBe("JoinWhilePaused");
  });

  test("the creation rules change between the preparation and the landing: the signed entry is refused", async () => {
    const { w, admin, sponsor, campaign, prepare } = await preparing();
    const prepared = ready(await prepare());
    expectOk(await send(w, [await I.setCreationParamsIx(admin, { ...DEFAULT_PARAMS, opening_prize_bps: 9_500 })]));
    // The prepared instruction, with the arguments it was signed with (the kit's `send` renews the blockhash).
    const signedIx = prepared.message.instructions[0] as Instruction;
    expectError(await send(w, [signedIx]), "CreationParamsChanged");
    expect(w.client.svm.getAccount(await P.sealedFeePda(campaign, sponsor.address)).exists).toBe(false);
    // Prepared again, it reads the new version and says the new split.
    const renewed = ready(await prepare());
    expect(renewed.expectedParamsVersion).toBe(1);
    expect(renewed.summary.lines[1]).toContain("; 5.00% of it is Brot's fee");
  });

  test("a retry keeps the terms approved: a version that moved stops at the check; the bound is never exceeded", async () => {
    const { w, admin, prepare } = await preparing();
    // Approved at version 0 (a 10% fee); the answer never comes; the admin moves the split to 95/5 (version 1).
    const first = ready(await prepare());
    expectOk(await send(w, [await I.setCreationParamsIx(admin, { ...DEFAULT_PARAMS, opening_prize_bps: 9_500 })]));
    const saved = {
      expectedEntryTotal: first.expectedEntryTotal,
      expectedParamsVersion: first.expectedParamsVersion,
      maxLamports: first.maxLamports,
    };
    expect(refusal(await prepare(saved))).toBe("CreationParamsChanged");
    // Shown the new terms again, the sponsor approves version 1; a saved bound is a ceiling, never raised.
    const { paid } = sealedCharge(500n);
    const renewed = ready(await prepare({ ...saved, expectedParamsVersion: 1, maxLamports: paid }));
    expect([renewed.maxLamports, renewed.debit.maxPayment, renewed.expectedParamsVersion]).toEqual([paid, paid, 1]);
    expect(refusal(await prepare({ ...saved, expectedParamsVersion: 1, maxLamports: paid - 1n }))).toBe(
      "SealedEntryAboveMaxLamports",
    );
  });

  test("on a SOL/USD campaign the one account is read once and serves both the lock and the price", async () => {
    const { w, campaign, prepare, reads } = await preparing({
      feedId: P.SOL_USD_FEED_ID,
      target: (SOL_PRICE * 11n) / 10n,
    });
    expect(readCampaign(w, campaign).metric_account).toBe(P.SOL_USD_ACCOUNT);
    const prepared = ready(await prepare());
    expect(reads.filter((at) => at === P.SOL_USD_ACCOUNT)).toHaveLength(1);
    expect(prepared.check.charge).toMatchObject({ paid: sealedCharge(500n).paid, price: SOL_CHARGED });
    expect(prepared.simulation.events.map((e) => e.name)).toEqual(["EntryAdded", "SealedFeeHeld"]);
    expect(
      w.client.svm.sendTransaction(await signTransactionMessageWithSigners(prepared.message)).toString(),
    ).not.toContain("err");
  });

  test("a sponsor the cluster cannot charge is not ready, though the SDK's checks passed", async () => {
    const { w, campaign, prepare } = await preparing();
    const poor = await fundedWallet(w, 1n);
    const prepared = await prepare({ sponsor: poor, campaign });
    if (prepared.ok || prepared.stage !== "simulation") throw new Error("expected the simulation stage");
    expect([prepared.simulation.ok, prepared.summary.trusted]).toEqual([false, true]);
  });
});
