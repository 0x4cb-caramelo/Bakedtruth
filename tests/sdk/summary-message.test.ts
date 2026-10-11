/**
 * Purpose: the summary of the bytes a wallet signs (Sprint 05 review, M5) and of what they say (M3, L1, L10):
 *          `summarizeMessage` decodes the compiled message itself, so an instruction added after the
 *          preparation shows up, with its fee; it refuses lookup tables, a version it never builds, bytes past
 *          the message and a fee payer other than the signer. Every value an admin act signs is printed; a
 *          join names its campaign; an opening names its target in the feed's units, its creator, the SOL price
 *          below which it is refused and its terms; no input makes the summary throw.
 *          Filter: `bun test tests/ -t "the summary reads the signed bytes"`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, expect, test } from "bun:test";
import {
  appendTransactionMessageInstructions,
  blockhash,
  compileTransaction,
  compressTransactionMessageUsingAddressLookupTables,
  createTransactionMessage,
  generateKeyPairSigner,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";

import { campaignAddress, Direction, ReaderKind, Side, type Campaign } from "@brot/sdk/read";
import * as T from "@brot/sdk/tx";

import { DEFAULT_PARAMS, sdkParams } from "../brot/flows";
import * as P from "../brot/program";

const LIFETIME = { blockhash: blockhash("11111111111111111111111111111111"), lastValidBlockHeight: 0n };
const messageOf = (payer: TransactionSigner, ...ixs: Instruction[]) =>
  pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(payer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(LIFETIME, m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
const price = (micro: bigint): Instruction => ({
  programAddress: T.COMPUTE_BUDGET_PROGRAM_ID,
  data: Uint8Array.from([3, ...Array.from({ length: 8 }, (_, i) => Number((micro >> BigInt(8 * i)) & 0xffn))]),
});
const aJoin = async (baker: TransactionSigner, expectedEntryTotal = 0n, campaign?: Address) =>
  T.buildJoinCampaign({
    baker,
    campaign: campaign ?? (await campaignAddress(7n)),
    metricAccount: P.BTC_USD_ACCOUNT,
    side: Side.Yes,
    amount: P.SOL / 10n,
    minReturnBps: 10_000,
    expectedEntryTotal,
    joinIndex: 0,
  });
const OPEN = {
  id: 9n,
  kind: ReaderKind.PriceTouch,
  direction: Direction.Above,
  feedId: P.BTC_USD_FEED_ID,
  target: 12_000_000_000_000n,
  deadlineAt: 1_800_086_400n,
  openingUsd: 500n,
  maxLamports: 4_236_154_621n,
  epoch: 0n,
  expectedParamsVersion: 1,
};
const TERMS = { version: 1, feeBps: 1_000, oneSidedFeeBps: 100, creatorShareBps: 100, openingPrizeBps: 9_000 };

describe("the summary reads the signed bytes", () => {
  test("an instruction added after the preparation shows up, with its fee", async () => {
    const baker = await generateKeyPairSigner();
    const join = await aJoin(baker);
    const plain = T.summarizeMessage(messageOf(baker, join), { signer: baker.address });
    expect([plain.trusted, plain.feePayer, plain.signatures, plain.networkFeeAtMost]).toEqual([
      true,
      baker.address,
      1,
      5_000n,
    ]);
    expect(plain.lines[0]).toBe(`Paid by ${baker.address}: network fee at most 0.000005000 SOL (1 signature)`);
    const bytes = compileTransaction(messageOf(baker, price(100_000n), join)).messageBytes;
    const added = T.summarizeMessage(bytes, { signer: baker.address });
    expect([added.trusted, added.priorityFeeAtMost, added.networkFeeAtMost]).toEqual([true, 140_000n, 145_000n]);
    expect(added.lines[0]).toContain("and the priority fee");
    const transfer = { programAddress: P.SYSTEM_PROGRAM_ID, data: new Uint8Array(12) };
    expect(T.summarizeMessage(messageOf(baker, join, transfer)).trusted).toBe(false);
  });

  test("refused: lookup tables, another version, bytes past the message, another fee payer", async () => {
    const [baker, other] = await Promise.all([generateKeyPairSigner(), generateKeyPairSigner()]);
    const join = await aJoin(baker);
    const table = (await generateKeyPairSigner()).address;
    const compressed = compressTransactionMessageUsingAddressLookupTables(messageOf(baker, join), {
      [table]: [join.accounts![1].address],
    });
    expect(T.summarizeMessage(compressed).lines).toEqual([
      "The message loads accounts from address lookup tables, which this SDK never builds: do not sign",
    ]);
    const v1 = pipe(
      createTransactionMessage({ version: 1 }),
      (m) => setTransactionMessageFeePayerSigner(baker, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(LIFETIME, m),
      (m) => appendTransactionMessageInstructions([join], m),
    );
    expect(T.summarizeMessage(v1).lines[0]).toStartWith("A version-1 transaction message");
    const bytes = compileTransaction(messageOf(baker, join)).messageBytes;
    for (const junk of [Uint8Array.of(...bytes, 0), Uint8Array.of(1, 2, 3), new Uint8Array()]) {
      expect(T.summarizeMessage(junk).trusted).toBe(false);
    }
    const paidByOther = T.summarizeMessage(messageOf(other, join), { signer: baker.address });
    expect([paidByOther.trusted, paidByOther.signatures]).toEqual([false, 2]);
    expect(paidByOther.lines[0]).toEndWith(`the signing wallet is ${baker.address}: do not sign`);
  });

  test("every value an admin act signs is in its words", async () => {
    const [admin, other] = await Promise.all([generateKeyPairSigner(), generateKeyPairSigner()]);
    const params = sdkParams(DEFAULT_PARAMS);
    const words = async (ix: Promise<Instruction>) => T.summarizeInstructions([await ix]).lines[0];
    expect(await words(T.buildSetFeeRecipient({ admin, feeRecipient: other.address }))).toContain(
      `swept to ${other.address}`,
    );
    expect(await words(T.buildTransferAdmin({ admin, newAdmin: other.address }))).toContain(`Name ${other.address}`);
    expect(await words(T.buildSetTeam({ admin, team: [admin.address, other.address] }))).toContain(
      `${admin.address}, ${other.address}`,
    );
    expect(await words(T.buildSetTeam({ admin, team: [] }))).toContain("none (then nobody can pause entries)");
    const setParams = await words(T.buildSetCreationParams({ admin, params }));
    for (const part of [
      "paid openings US$500, 90.00% of the payment as prize",
      "Brot's fee 10.00% of the losing side",
      "the creator's share 1.00% of the entries",
      "entries from 0.010000000 SOL",
      "prices at most 120 s old, confidence within 0.50%",
    ]) {
      expect(setParams).toContain(part);
    }
    const init = T.buildInitializeConfig({
      authority: admin,
      admin: admin.address,
      feeRecipient: other.address,
      params,
    });
    expect(await words(init)).toContain(`admin ${admin.address}, fee recipient ${other.address}`);
  });

  test("a join names its campaign; an opening its target, creator, refusal price and terms; nothing throws", async () => {
    const baker = await generateKeyPairSigner();
    const campaign = await campaignAddress(7n);
    const join = await aJoin(baker, 0n, campaign);
    expect(T.summarizeInstructions([join]).lines[0]).toContain(
      `Join campaign ${campaign} on YES with 0.100000000 SOL from ${baker.address}`,
    );
    expect(T.summarizeInstructions([join]).lines[0]).toContain("the rents of the entry and of the join's record");
    expect(T.summarizeInstructions([await aJoin(baker, P.SOL)]).lines[0]).toContain(
      "plus the rent of the join's record",
    );
    const read = {
      ...OPEN,
      id: 7n,
      priceExponent: -8,
      metricAccount: P.BTC_USD_ACCOUNT,
      entriesCloseAt: 1_800_000_000n,
    };
    const campaigns = new Map([[campaign as string, read as unknown as Campaign]]);
    expect(T.summarizeInstructions([join], { context: { campaigns } }).lines[0]).toContain(
      "(#7: the price of Crypto.BTC/USD [feed e62df6c8…] at or above 120000.00000000 [raw 12000000000000, exponent -8]; entries close 2027-01-15 08:00:00 UTC, deadline 2027-01-16 08:00:00 UTC)",
    );
    const open = await T.buildOpenCampaign({ creator: baker, args: OPEN });
    const terms = { ...TERMS, minEntryLamports: 10_000_000n };
    const opening = T.summarizeInstructions([open], { context: { priceExponent: -8, terms } }).lines[0];
    for (const part of [
      "Open campaign #9 on the price of Crypto.BTC/USD [feed e62df6c8…] at or above 120000.00000000",
      `created by ${baker.address}, who pays US$500, at most 4.236154621 SOL into its vault`,
      "(refused if Pyth's SOL/USD price less its confidence is below US$118.03 when it lands)",
      "under creation terms version 1: Brot's fee 10.00% of the losing side; the creator's share 1.00% of the entries",
    ]) {
      expect(opening).toContain(part);
    }
    const stale = T.summarizeInstructions([open], { context: { terms: { ...terms, version: 2 } } }).lines[0];
    expect([stale.includes("Brot's fee"), stale.includes("(raw: the feed's exponent was not read)")]).toEqual([
      false,
      true,
    ]);
    const far = await T.buildOpenCampaign({ creator: baker, args: { ...OPEN, deadlineAt: 1n << 62n } });
    expect(T.summarizeInstructions([far]).lines[0]).toContain(
      "4611686018427387904 Unix seconds (beyond any calendar date)",
    );
  });
});
