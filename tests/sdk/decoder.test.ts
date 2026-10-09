/**
 * Purpose: the decoder rules (TP 3.4.14; proposal 2.3) on transactions sent in LiteSVM and read back in
 *          the RPC's shape: a failed transaction is skipped; only this program's inner instructions,
 *          signed by its event authority, are read (an event forged through another program is refused
 *          by the program itself; bytes in a log, a top-level instruction, another program or another
 *          account slot are never read); indexes resolve through `loadedAddresses`; each event is keyed
 *          by (signature, top-level index, inner index) and duplicates collapse.
 *          Filter: `bun test tests/ -t "decoder rejects foreign, failed and duplicate events"`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner, getBase58Decoder, getBase58Encoder, type Instruction } from "@solana/kit";

import { decodeTransactionEvents, uniqueEvents, type RpcTransaction } from "@brot/sdk/read";

import { initConfig, newId, openPriceCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import * as P from "../brot/program";
import { createWorld, fundedWallet, type World } from "../brot/setup";
import { sendAsRpc, setLookupTable } from "./rpc-shape";

const joinIx = async (w: World, campaign: string, side: number, amount: bigint) =>
  I.joinCampaignIx(await fundedWallet(w), campaign as never, P.BTC_USD_ACCOUNT, { side, amount });

/** A world with a config and one opened campaign, and the opening's transaction as the RPC shows it. */
async function opened() {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const creator = await fundedWallet(w);
  const id = newId();
  const ix = await I.openCampaignIx(creator, {
    id,
    feedId: P.BTC_USD_FEED_ID,
    target: 9_400_000_000_000n,
    deadlineAt: w.client.svm.getClock().unixTimestamp + 7n * P.DAY,
    openingUsd: 500n,
    maxLamports: 10n * P.SOL,
  });
  const sent = await sendAsRpc(w, [ix]);
  expect(sent.ok).toBe(true);
  return { w, admin, campaign: await P.campaignPda(id), tx: sent.tx };
}

/** A copy of `tx` with its inner instructions replaced. */
const withInner = (tx: RpcTransaction, groups: NonNullable<NonNullable<RpcTransaction["meta"]>["innerInstructions"]>) =>
  ({ ...tx, meta: { ...tx.meta!, innerInstructions: groups } }) as RpcTransaction;

describe("decoder rejects foreign, failed and duplicate events", () => {
  test("an opening and two joins in one transaction decode, keyed by signature, top-level and inner index", async () => {
    const { w, campaign, tx } = await opened();
    const [event] = decodeTransactionEvents(tx);
    // After the System Program's creation of the campaign and the vault, and the payment's transfer.
    expect([event.name, event.key.ixIndex, event.key.innerIndex]).toEqual(["CampaignOpened", 0, 3]);
    expect(event.key.signature).toBe(tx.transaction.signatures[0]);
    expect((event.data as { campaign: string }).campaign).toBe(campaign);
    const joins = await sendAsRpc(w, [await joinIx(w, campaign, 0, P.SOL / 10n), await joinIx(w, campaign, 1, P.SOL)]);
    const events = decodeTransactionEvents(joins.tx);
    // Each join creates the Entry and the Join and moves the entry before its event: inner index 3.
    expect(events.map((e) => [e.name, e.key.ixIndex, e.key.innerIndex, (e.data as { seq: bigint }).seq])).toEqual([
      ["EntryAdded", 0, 3, 1n],
      ["EntryAdded", 1, 3, 2n],
    ]);
  });

  test("a failed transaction is skipped whole, though its inner instructions hold the event", async () => {
    const { w, campaign } = await opened();
    const good = await joinIx(w, campaign, 0, P.SOL / 10n);
    const bad = await I.joinCampaignIx(await fundedWallet(w), campaign, P.BTC_USD_ACCOUNT, {
      side: 1,
      amount: P.SOL,
      expectedEntryTotal: 5n,
    });
    const sent = await sendAsRpc(w, [good, bad]);
    expect(sent.ok).toBe(false);
    expect(decodeTransactionEvents(sent.tx)).toEqual([]);
    // The failed transaction's metadata still holds the first join's event: with `err` null the same
    // bytes decode, so only rule 1 kept them out.
    expect(sent.tx.meta?.innerInstructions?.length).toBeGreaterThan(0);
    const counterfactual = { ...sent.tx, meta: { ...sent.tx.meta!, err: null } } as RpcTransaction;
    expect(decodeTransactionEvents(counterfactual).map((e) => e.name)).toEqual(["EntryAdded"]);
  });

  test("a forged event: refused by the program through another program; never read elsewhere", async () => {
    const { w, tx } = await opened();
    const proxy = (await generateKeyPairSigner()).address;
    w.client.svm.addProgramFromFile(proxy, P.CPI_PROXY_SO);
    const forged: Instruction = {
      programAddress: proxy,
      accounts: [
        { address: P.PROGRAM_ID, role: AccountRole.READONLY },
        { address: P.EVENT_AUTHORITY, role: AccountRole.READONLY },
      ],
      data: Uint8Array.of(0xff, 2, ...new Uint8Array(32).fill(7)),
    };
    const sent = await sendAsRpc(w, [forged]);
    expect(sent.ok).toBe(false);
    expect(sent.logs.join("\n")).toContain(`custom program error: 0x${(6016).toString(16)}`);
    expect(decodeTransactionEvents(sent.tx)).toEqual([]);
    const ix = tx.meta!.innerInstructions![0].instructions[decodeTransactionEvents(tx)[0].key.innerIndex];
    const keys = tx.transaction.message.accountKeys;
    const other = keys.indexOf(P.SYSTEM_PROGRAM_ID);
    const notAuthority = keys.indexOf(P.BTC_USD_ACCOUNT);
    const forgeries = [
      { ...ix, programIdIndex: other },
      { ...ix, accounts: [notAuthority] },
      { ...ix, accounts: [...ix.accounts, notAuthority] },
      { ...ix, data: getBase58Decoder().decode(getBase58Encoder().encode(ix.data).slice(0, -1)) },
    ];
    for (const forgery of forgeries) {
      expect(decodeTransactionEvents(withInner(tx, [{ index: 0, instructions: [forgery] }]))).toEqual([]);
    }
    // Event bytes in the logs or in a top-level instruction are not part of what the decoder reads.
    const noInner = withInner(tx, []);
    expect(
      decodeTransactionEvents({
        ...noInner,
        meta: { ...noInner.meta!, logMessages: ["Program data: forged"] },
      } as never),
    ).toEqual([]);
  });

  test("duplicates: a transaction read twice yields each event once; two events in one top-level instruction stay two", async () => {
    const { tx } = await opened();
    const once = decodeTransactionEvents(tx);
    expect(uniqueEvents([...once, ...decodeTransactionEvents(tx)])).toEqual(once);
    const eventIx = tx.meta!.innerInstructions![0].instructions[once[0].key.innerIndex];
    const doubled = withInner(tx, [{ index: 0, instructions: [eventIx, eventIx] }]);
    const both = uniqueEvents(decodeTransactionEvents(doubled));
    expect(both.map((e) => [e.key.ixIndex, e.key.innerIndex])).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });

  test("an event emitted inside another program's call, and one whose authority sits in a lookup table", async () => {
    const { w, admin } = await opened();
    const proxy = (await generateKeyPairSigner()).address;
    w.client.svm.addProgramFromFile(proxy, P.CPI_PROXY_SO);
    const pause = await I.setTeamIx(admin, [admin.address]);
    const wrapped: Instruction = {
      programAddress: proxy,
      accounts: [{ address: P.PROGRAM_ID, role: AccountRole.READONLY }, ...(pause.accounts ?? [])],
      data: pause.data,
    };
    const nested = await sendAsRpc(w, [wrapped]);
    expect(nested.ok).toBe(true);
    expect(decodeTransactionEvents(nested.tx).map((e) => [e.name, e.key.ixIndex, e.key.innerIndex])).toEqual([
      ["ConfigChanged", 0, 1],
    ]);
    const table = (await generateKeyPairSigner()).address;
    const listed = [P.EVENT_AUTHORITY, await P.configPda()];
    setLookupTable(w, table, listed);
    const viaTable = await sendAsRpc(w, [await I.setTeamIx(admin, [admin.address])], { [table]: listed });
    expect(viaTable.ok).toBe(true);
    expect(viaTable.tx.transaction.message.accountKeys).not.toContain(P.EVENT_AUTHORITY);
    expect(decodeTransactionEvents(viaTable.tx).map((e) => e.name)).toEqual(["ConfigChanged"]);
    const unresolved = { ...viaTable.tx, meta: { ...viaTable.tx.meta!, loadedAddresses: null } } as RpcTransaction;
    expect(decodeTransactionEvents(unresolved)).toEqual([]);
  });
});
