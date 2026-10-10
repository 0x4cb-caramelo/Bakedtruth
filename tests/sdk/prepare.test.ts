/**
 * Purpose: A-3 end to end against the program's state (LiteSVM behind a local RPC endpoint): a join and a
 *          paid opening are re-read, checked, built, summarised from the bytes the wallet signs and simulated
 *          by `@brot/sdk/tx`, then signed and landed, and what landed is what the simulation and the summary
 *          said; a refusal stops before anything is built; the summary flags what the SDK did not build.
 * Version: 0.1.1
 * Sprint:  05 (SDK)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { AccountRole, createSolanaRpc, signTransactionMessageWithSigners, type Instruction } from "@solana/kit";

import { ACCOUNT_LEN, ReaderKind, Side, formatSol } from "@brot/sdk/read";
import { prepareJoin, prepareOpenCampaign, summarizeInstructions } from "@brot/sdk/tx";

import { BTC_PRICE, openedCampaign, readCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { expectOk, now, rentFor, send } from "../brot/setup";
import { startFakeRpc, type FakeRpc } from "./fake-rpc";
import { ready } from "./prepared";

let rpc: FakeRpc | null = null;
afterEach(() => rpc?.close());

describe("a transaction is checked, built, simulated and summarised before it is signed", () => {
  test("a join: the estimate, the minimum return, the whole debit, the signed bytes, then the landed event", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    rpc = startFakeRpc(w);
    const prepared = ready(
      await prepareJoin({ rpc: createSolanaRpc(rpc.url), baker: w.creator, campaign, side: Side.No, amount: P.SOL }),
    );
    expect(prepared.check).toMatchObject({ isFirst: true, expectedEntryTotal: 0n, joinIndex: 0 });
    expect(prepared.expectedEntryTotal).toBe(0n);
    expect(BigInt(prepared.minReturnBps)).toBe((prepared.check.estimateBps * 9_900n) / 10_000n);
    const rents = rentFor(w, ACCOUNT_LEN.join) + rentFor(w, ACCOUNT_LEN.entry);
    expect(prepared.debit).toEqual({ amount: P.SOL, rents, networkFee: 5_000n, total: P.SOL + rents + 5_000n });
    expect(prepared.simulation).toMatchObject({ ok: true, errorName: null });
    expect(prepared.simulation.events.map((e) => e.name)).toEqual(["EntryAdded"]);
    const { summary } = prepared;
    expect([summary.trusted, summary.feePayer, summary.networkFeeAtMost]).toEqual([true, w.creator.address, 5_000n]);
    expect(summary.lines[1]).toContain(`on NO with ${formatSol(P.SOL)} SOL`);
    expect(summary.lines[1]).toContain("Crypto.BTC/USD");
    expect(summary.lines[1]).toContain("the rents of the entry and of the join's record");
    // What the summary read is what the wallet signs: the message compiles to the same bytes.
    const signed = await signTransactionMessageWithSigners(prepared.message);
    expect(signed.messageBytes).toEqual(prepared.transaction.messageBytes);
    expect(w.client.svm.sendTransaction(signed).toString()).not.toContain("err");
    expect(readCampaign(w, campaign).pool_no).toBe(P.SOL);
  });

  test("a paid opening: the quote, max_lamports, the two rents on top, the words, then the stored charge", async () => {
    const w = await openingWorld();
    rpc = startFakeRpc(w);
    const prepared = ready(
      await prepareOpenCampaign({
        rpc: createSolanaRpc(rpc.url),
        creator: w.creator,
        choice: {
          kind: ReaderKind.PriceTouch,
          feedId: P.BTC_USD_FEED_ID,
          target: (BTC_PRICE * 11n) / 10n,
          deadlineAt: now(w.client) + 7n * P.DAY,
          openingUsd: 500n,
        },
      }),
    );
    const paid = prepared.check.payment.paid;
    expect(prepared.maxLamports).toBe(paid + (paid * 100n + 9_999n) / 10_000n);
    const rents = rentFor(w, ACCOUNT_LEN.campaign) + rentFor(w, ACCOUNT_LEN.vault);
    expect(prepared.debit.total).toBe(paid + rents + 5_000n);
    expect(prepared.debit.maxTotal).toBe(prepared.maxLamports + rents + 5_000n);
    expect(prepared.simulation.events.map((e) => e.name)).toEqual(["CampaignOpened"]);
    const line = prepared.summary.lines[1];
    for (const words of [`#${prepared.id}`, "Crypto.BTC/USD", `created by ${w.creator.address}`, "Brot's fee 10.00%"]) {
      expect(line).toContain(words);
    }
    expect(line).toMatch(/less its confidence is below US\$\d+\.\d\d when it lands/);
    const signed = await signTransactionMessageWithSigners(prepared.message);
    w.client.svm.sendTransaction(signed);
    const stored = readCampaign(w, await P.campaignPda(prepared.id));
    expect([stored.opening_paid_lamports, stored.prize_lamports]).toEqual([paid, prepared.check.payment.prize]);
  });

  test("a refusal stops before anything is built: a short deadline, a paused join", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    rpc = startFakeRpc(w);
    const short = await prepareOpenCampaign({
      rpc: createSolanaRpc(rpc.url),
      creator: w.creator,
      choice: {
        kind: ReaderKind.PriceTouch,
        feedId: P.BTC_USD_FEED_ID,
        target: (BTC_PRICE * 11n) / 10n,
        deadlineAt: now(w.client) + P.DAY,
        openingUsd: 500n,
      },
    });
    expect(short.ok || short.stage !== "check" ? null : [short.check.refusal.errorName, short.check.row]).toEqual([
      "DurationTooShort",
      5,
    ]);
    expectOk(await send(w, [await I.pauseEntriesIx(w.team)]));
    const paused = await prepareJoin({
      rpc: createSolanaRpc(rpc.url),
      baker: w.creator,
      campaign,
      side: Side.Yes,
      amount: P.SOL,
    });
    expect(paused.ok || paused.stage !== "check" ? null : paused.check.refusal.errorName).toBe("JoinWhilePaused");
  });

  test("the summary flags an instruction the SDK did not build, and malformed bytes", async () => {
    const w = await openingWorld();
    const join = await I.joinCampaignIx(w.creator, await P.campaignPda(1n), P.BTC_USD_ACCOUNT, {
      side: 0,
      amount: P.SOL,
    });
    const transfer: Instruction = {
      programAddress: P.SYSTEM_PROGRAM_ID,
      accounts: [{ address: w.creator.address, role: AccountRole.WRITABLE_SIGNER }],
      data: Uint8Array.of(2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
    };
    expect(summarizeInstructions([join]).trusted).toBe(true);
    const slipped = summarizeInstructions([join, transfer]);
    expect([slipped.trusted, slipped.items[1].text]).toEqual([
      false,
      "A System Program instruction this SDK did not build: do not sign",
    ]);
    const longer = { ...join, data: Uint8Array.of(...(join.data ?? []), 0) };
    expect(summarizeInstructions([longer]).items[0]).toMatchObject({ trusted: false, name: "unknown" });
    expect(summarizeInstructions([]).trusted).toBe(false);
  });
});
