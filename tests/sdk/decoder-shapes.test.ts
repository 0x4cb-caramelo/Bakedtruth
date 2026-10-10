/**
 * Purpose: the decoder reads an inner instruction whichever way the node wrote it (Sprint 05 review, M1
 *          and L6): compiled with indexes (`getTransaction`, `json`), partially decoded with addresses
 *          (`simulateTransaction`), or parsed by the node (the System Program's, skipped). Rule 2 holds by
 *          address too; malformed entries are skipped without throwing; data longer than the largest
 *          event is refused before it is decoded; `prepareJoin`'s simulation reports the event in both.
 *          Filter: `bun test tests/ -t "decoder reads both shapes"`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, getBase58Decoder, getBase58Encoder } from "@solana/kit";

import {
  decodeTransactionEvents,
  EVENT_AUTHORITY,
  EVENT_IX_TAG,
  EVENTS,
  innerInstructionEvent,
  MAX_EVENT_BASE58,
  PROGRAM_ID,
  Side,
  type RpcCompiledInstruction,
  type RpcInnerInstruction,
  type RpcPartiallyDecodedInstruction,
  type RpcTransaction,
} from "@brot/sdk/read";
import { prepareJoin } from "@brot/sdk/tx";

import { initConfig, newId, openedCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { createWorld, fundedWallet } from "../brot/setup";
import { startFakeRpc, type FakeRpc } from "./fake-rpc";
import { sendAsRpc } from "./rpc-shape";

let rpc: FakeRpc | null = null;
afterEach(() => rpc?.close());

/** A paid opening, landed, as `getTransaction` writes it (indexes). */
async function landedOpening(): Promise<RpcTransaction> {
  const w = await createWorld();
  await initConfig(w);
  const ix = await I.openCampaignIx(await fundedWallet(w), {
    id: newId(),
    feedId: P.BTC_USD_FEED_ID,
    target: 9_400_000_000_000n,
    deadlineAt: w.client.svm.getClock().unixTimestamp + 7n * P.DAY,
    openingUsd: 500n,
    maxLamports: 10n * P.SOL,
  });
  const sent = await sendAsRpc(w, [ix]);
  expect(sent.ok).toBe(true);
  return sent.tx;
}

/** `tx` with each inner instruction written as a node writes a simulation's: parsed or by address. */
function asNode(tx: RpcTransaction): RpcTransaction {
  const keys = tx.transaction.message.accountKeys;
  const instructions = (list: readonly RpcInnerInstruction[]) =>
    list.map((ix) => {
      const { programIdIndex, accounts, data } = ix as RpcCompiledInstruction;
      const programId = keys[programIdIndex];
      return programId === P.SYSTEM_PROGRAM_ID
        ? { programId, program: "system", parsed: { type: "createAccount", info: {} }, stackHeight: 2 }
        : { programId, accounts: accounts.map((i) => keys[i]), data, stackHeight: 2 };
    });
  const groups = (tx.meta?.innerInstructions ?? []).map((g) => ({
    index: g.index,
    instructions: instructions(g.instructions),
  }));
  return { ...tx, meta: { ...tx.meta!, innerInstructions: groups } };
}

const withGroup = (tx: RpcTransaction, instructions: readonly unknown[]) =>
  ({ ...tx, meta: { ...tx.meta!, innerInstructions: [{ index: 0, instructions }] } }) as RpcTransaction;

describe("decoder reads both shapes", () => {
  test("the same events, keys included, from the compiled shape and the node's", async () => {
    const tx = await landedOpening();
    const compiled = decodeTransactionEvents(tx);
    expect(compiled.map((e) => [e.name, e.key.innerIndex])).toEqual([["CampaignOpened", 3]]);
    expect(decodeTransactionEvents(asNode(tx))).toEqual(compiled);
  });

  test("rule 2 by address: another program, another account, a second account, a cut payload", async () => {
    const node = asNode(await landedOpening());
    const event = node.meta!.innerInstructions![0].instructions[3] as RpcPartiallyDecodedInstruction;
    const cut = getBase58Decoder().decode(getBase58Encoder().encode(event.data).slice(0, -1));
    const forgeries = [
      { ...event, programId: P.SYSTEM_PROGRAM_ID },
      { ...event, accounts: [P.BTC_USD_ACCOUNT] },
      { ...event, accounts: [EVENT_AUTHORITY, P.BTC_USD_ACCOUNT] },
      { ...event, data: cut },
    ];
    for (const forgery of forgeries) expect(decodeTransactionEvents(withGroup(node, [forgery]))).toEqual([]);
    expect(decodeTransactionEvents(withGroup(node, [event])).map((e) => e.name)).toEqual(["CampaignOpened"]);
  });

  test("malformed entries are skipped, not thrown, and the inner index still counts them", async () => {
    const node = asNode(await landedOpening());
    const event = node.meta!.innerInstructions![0].instructions[3];
    const junk = [null, 7, {}, { programId: PROGRAM_ID }, { programId: PROGRAM_ID, accounts: "x", data: "y" }];
    const decoded = decodeTransactionEvents(
      withGroup(node, [...junk, { programIdIndex: 99, accounts: 1, data: 2 }, event]),
    );
    expect(decoded.map((e) => [e.name, e.key.innerIndex])).toEqual([["CampaignOpened", 6]]);
  });

  test("data longer than the largest event is refused before base58 decoding", () => {
    const largest = EVENTS.reduce((a, b) => (b.decoder.fixedSize > a.decoder.fixedSize ? b : a));
    const bytes = Uint8Array.of(
      EVENT_IX_TAG,
      largest.discriminator,
      ...new Uint8Array(largest.decoder.fixedSize).fill(0xff),
    );
    expect(getBase58Decoder().decode(bytes).length).toBeLessThanOrEqual(MAX_EVENT_BASE58);
    // Decoding 100,000 base58 characters takes tens of seconds; refused by length, this returns at once.
    for (const length of [MAX_EVENT_BASE58 + 1, 100_000]) {
      const ix = { programId: PROGRAM_ID, accounts: [EVENT_AUTHORITY], data: "2".repeat(length) };
      expect(innerInstructionEvent(ix, [])).toBeNull();
    }
  });

  test("prepareJoin's simulation reports the event whichever shape the node writes", async () => {
    for (const shape of ["node", "compiled"] as const) {
      const w = await openingWorld();
      const { campaign } = await openedCampaign(w, w.creator);
      rpc = startFakeRpc(w, shape);
      const baker = { rpc: createSolanaRpc(rpc.url), baker: w.creator, campaign, side: Side.Yes, amount: P.SOL };
      const prepared = await prepareJoin(baker);
      expect(prepared.ok && prepared.simulation.events.map((e) => e.name)).toEqual(["EntryAdded"]);
      rpc.close();
      rpc = null;
    }
  });
});
