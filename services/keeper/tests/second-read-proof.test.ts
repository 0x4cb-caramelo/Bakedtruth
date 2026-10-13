/**
 * Purpose: the proof transaction of a price resolution, read from recorded devnet answers (no live RPC): the push
 *          oracle's `update_price_feed` carries exactly what the sponsored account holds at its `posted_slot`; the
 *          receiver's `post_update` is read too, with its update account; another account, another program or a
 *          short message reads as nothing; the block at the posted slot leads to the one transaction that wrote the
 *          account, and a slot with no such transaction is said plainly. The other kinds' second read maps the SDK's
 *          `recheck` to match, mismatch, or not checked (final when nothing can ever be compared).
 * Version: 0.1.0
 * Sprint:  07 carry-over (the second read: the proof transaction and the other kinds)
 */
import { describe, expect, test } from "bun:test";
import { address, type Address } from "@solana/kit";
import { ReaderKind, type Recheck, type SolanaRpc } from "@brot/sdk/read";

import { findProofUpdate, messageFor, parsePriceMessage } from "../src/proof-tx";
import { checkOther } from "../src/second-check";
import { BLOCK, INDEX, RECEIVER_TX, WRITER_TX, storedReading } from "./kit/proof-fixtures";

const ACCOUNT = address(INDEX.account);

describe("the Pyth update instruction", () => {
  test("the push oracle's update carries exactly what the account holds at its posted slot", () => {
    const stored = storedReading();
    expect(stored.postedSlot).toBe(BigInt(INDEX.postedSlot));
    expect(WRITER_TX().slot).toBe(INDEX.postedSlot);
    const { postedSlot, ...fields } = stored;
    expect(messageFor(WRITER_TX(), ACCOUNT)).toEqual(fields);
  });

  test("the receiver's post_update is read, with the update account it creates (its 5th account)", () => {
    const tx = RECEIVER_TX();
    const keys: string[] = tx.transaction.message.accountKeys;
    const update = address(keys[tx.transaction.message.instructions[0].accounts[4]]!);
    const message = messageFor(tx, update);
    expect(message && Buffer.from(message.feedId).toString("hex")).toBe(
      "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", // SOL/USD
    );
    expect(message?.exponent).toBe(-8);
  });

  test("another account, or a message too short or of another type, reads as nothing", () => {
    const tx = WRITER_TX();
    expect(messageFor(tx, address(tx.transaction.message.accountKeys[0]))).toBeNull();
    expect(parsePriceMessage(new Uint8Array(96))).toBeNull();
    const wrongType = new Uint8Array(12 + 85);
    new DataView(wrongType.buffer).setUint32(8, 85, true);
    wrongType[12] = 1;
    expect(parsePriceMessage(wrongType)).toBeNull();
  });
});

/** RPC B answering the recorded block and transactions only. */
function recordedRpc(transactions: Record<string, unknown>) {
  return {
    getBlock: (slot: bigint) => ({ send: async () => (Number(slot) === INDEX.postedSlot ? BLOCK() : null) }),
    getTransaction: (signature: string) => ({ send: async () => transactions[signature] ?? null }),
  } as unknown as SolanaRpc;
}

describe("findProofUpdate", () => {
  test("the block at the posted slot leads to the transaction that wrote the account", async () => {
    const rpc = recordedRpc({ [INDEX.writers[0]!]: WRITER_TX() });
    const found = await findProofUpdate(rpc, BigInt(INDEX.postedSlot), ACCOUNT);
    expect(found).toMatchObject({ signature: INDEX.writers[0], message: { publishTime: BigInt(INDEX.publishTime) } });
  });

  test("a slot whose block is missing, or that holds no readable writer, is said plainly", async () => {
    const rpc = recordedRpc({});
    expect(await findProofUpdate(rpc, BigInt(INDEX.postedSlot) + 1n, ACCOUNT)).toEqual({
      error: `slot ${INDEX.postedSlot + 1} has no block at this RPC`,
    });
    const none = await findProofUpdate(rpc, BigInt(INDEX.postedSlot), ACCOUNT);
    expect("error" in none && none.error).toContain("1 wrote it");
  });
});

describe("checkOther (the other kinds, through recheck)", () => {
  const base: Recheck = {
    campaign: "11111111111111111111111111111112" as Address,
    kind: ReaderKind.SupplyAtMost,
    outcome: 1,
    account: "mint",
    field: "supply",
    recorded: 990n,
    reread: 990n,
    matches: true,
    consistent: true,
    note: "a burn only lowers the supply",
    asOf: { slot: 1n, epoch: 1n, unixTimestamp: 1n },
  };
  const at = base.campaign;

  test("consistent is a match, inconsistent a mismatch with both values", async () => {
    expect(await checkOther(async () => base, at)).toMatchObject({ match: true });
    const raised = await checkOther(async () => ({ ...base, reread: 1_000n, matches: false, consistent: false }), at);
    expect(raised).toMatchObject({ match: false });
    expect(raised.detail).toContain("supply recorded 990, re-read 1000");
  });

  test("not readable now is retried; a void that read nothing, or the epoch stake, is never comparable", async () => {
    const unread = { ...base, reread: null, matches: null, consistent: null };
    expect(await checkOther(async () => unread, at)).toMatchObject({ match: null, final: false });
    expect(await checkOther(async () => ({ ...unread, field: "none" }), at)).toMatchObject({ final: true });
    const stake = { ...unread, kind: ReaderKind.StakeAtLeast, field: "epoch stake" };
    expect(await checkOther(async () => stake, at)).toMatchObject({ final: true });
  });
});
