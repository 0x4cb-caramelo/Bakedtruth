/**
 * Purpose: transaction landing, pure (Sprint 06 DoD; TP §3.5): the compute-unit limit from the simulation with its
 *          margin under 1.4M; the priority fee clamped by the floor, the configured ceiling, the kind's own ceiling
 *          and the lamport cap, read back by the SDK's own summary; the shared written accounts the fee query names;
 *          the failing instruction's index as Kit parses it; the batch packed by the wire limit; and the send loop:
 *          confirmed lands, `processed` does not count, a landed error fails, and an unseen transaction expires once
 *          the block height passes its `lastValidBlockHeight`. Fake RPCs; no cluster.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: transaction landing)
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner, type Address } from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";
import { buildSettleEntry, readComputeBudget } from "@brot/sdk/tx";

import { budgetInstructions, feeAtMost, mostUrgent, priorityPrice, sharedWritable, unitLimit } from "../src/budget";
import { failedIndex, packCount, TX_BYTES, wireSize, type Item } from "../src/landing";
import { messageWith, signAndSend } from "../src/send";
import { KEY } from "./kit/accounts";

const POLICY = { floor: 0n, ceiling: 1_000_000n, maxLamports: 1_000_000n };

describe("the compute budget", () => {
  test("the limit is the simulated units with a 30% margin (at least 5,000), never above 1.4M", () => {
    expect(unitLimit(10_000n, 1)).toBe(15_000n);
    expect(unitLimit(100_000n, 1)).toBe(130_000n);
    expect(unitLimit(1_300_000n, 1)).toBe(1_400_000n);
    expect(unitLimit(null, 3)).toBe(600_000n); // unknown: the runtime's own default, 200k per instruction
  });

  test("the fee is the recent 75th percentile, clamped by floor, ceilings and the lamport cap", () => {
    const recent = [0n, 10n, 20n, 5_000_000n];
    expect(priorityPrice("resolve", recent, 100_000n, POLICY)).toBe(1_000_000n); // the policy ceiling
    expect(priorityPrice("settleEntry", recent, 100_000n, POLICY)).toBe(100_000n); // the kind's own ceiling
    expect(priorityPrice("settleEntry", [], 100_000n, { ...POLICY, floor: 7n })).toBe(7n);
    // 1,000,000 µlamports × 1.4M units would be 1.4M lamports: cut to fit the cap of 1,000,000 lamports.
    const price = priorityPrice("resolve", [2_000_000n], 1_400_000n, POLICY);
    expect(price).toBe(714_285n);
    expect(feeAtMost(budgetInstructions(1_400_000n, price)) <= POLICY.maxLamports).toBe(true);
    expect(mostUrgent(["settleEntry", "resolve", "close"])).toBe("resolve");
  });

  test("the two instructions read back, through the SDK's summary, as exactly the limit and the price", () => {
    const budget = readComputeBudget(budgetInstructions(123_456n, 789n));
    expect({ limit: budget.limit, price: budget.price }).toEqual({ limit: 123_456n, price: 789n });
  });

  test("the fee query names the accounts every instruction writes, the fee payer excluded", async () => {
    const payer = KEY(1);
    const ix = (writable: Address[]) => ({
      programAddress: KEY(9),
      accounts: [
        { address: payer, role: AccountRole.WRITABLE_SIGNER },
        ...writable.map((address) => ({ address, role: AccountRole.WRITABLE })),
        { address: KEY(8), role: AccountRole.READONLY },
      ],
    });
    expect(sharedWritable([ix([KEY(2), KEY(3)]), ix([KEY(3), KEY(4)])], payer)).toEqual([KEY(3)]);
    expect(sharedWritable([], payer)).toEqual([]);
  });
});

describe("batches", () => {
  test("the failing instruction's index is read whether Kit gives a number or a bigint", () => {
    expect(failedIndex({ InstructionError: [3n, { Custom: 6107n }] })).toBe(3);
    expect(failedIndex({ InstructionError: [0, { Custom: 1 }] })).toBe(0);
    expect(failedIndex("AccountNotFound")).toBeNull();
    expect(failedIndex(null)).toBeNull();
  });

  test("a batch takes as many instructions as fit 1,232 bytes and the batch limit", async () => {
    const payer = await generateKeyPairSigner();
    const items: Item[] = [];
    for (let i = 0; i < 16; i++) {
      const ix = await buildSettleEntry({ campaign: KEY(20), baker: (await generateKeyPairSigner()).address });
      items.push({ key: `e${i}`, kind: "settleEntry", ix });
    }
    const fits = packCount(payer, items, 16);
    expect(
      wireSize(
        payer,
        items.slice(0, fits).map((i) => i.ix),
      ) <= TX_BYTES,
    ).toBe(true);
    expect(
      wireSize(
        payer,
        items.slice(0, fits + 1).map((i) => i.ix),
      ) > TX_BYTES,
    ).toBe(true);
    expect(packCount(payer, items, 4)).toBe(4);
  });
});

/** A fake RPC for the send loop: statuses and block heights come from the lists, one per call. */
function sendRpc(statuses: unknown[], heights: bigint[]) {
  const sent: string[] = [];
  let s = 0;
  let h = 0;
  const rpc = {
    sendTransaction: (wire: string) => ({ send: async () => (sent.push(wire), "sig") }),
    getSignatureStatuses: () => ({ send: async () => ({ value: [statuses[Math.min(s++, statuses.length - 1)]] }) }),
    getBlockHeight: () => ({ send: async () => heights[Math.min(h++, heights.length - 1)] }),
  } as unknown as SolanaRpc;
  return { rpc, sent };
}

describe("signAndSend", () => {
  const FAST = { rebroadcastMs: 0, maxWaitMs: 2_000 };
  const lifetime = { blockhash: "11111111111111111111111111111111" as never, lastValidBlockHeight: 100n };

  test("a confirmed status lands; a processed one does not count yet, and the same bytes go out again", async () => {
    const payer = await generateKeyPairSigner();
    const { rpc, sent } = sendRpc(
      [null, { err: null, confirmationStatus: "processed" }, { err: null, confirmationStatus: "confirmed" }],
      [10n],
    );
    const landed = await signAndSend(rpc, messageWith(payer, [], lifetime), FAST);
    expect(landed.ok).toBe(true);
    expect(sent.length).toBe(3);
    expect(new Set(sent).size).toBe(1);
  });

  test("a landed error fails with the cluster's error", async () => {
    const payer = await generateKeyPairSigner();
    const err = { InstructionError: [2n, { Custom: 6107n }] };
    const { rpc } = sendRpc([{ err, confirmationStatus: "confirmed" }], [10n]);
    const landed = await signAndSend(rpc, messageWith(payer, [], lifetime), FAST);
    expect(landed).toMatchObject({ ok: false, err });
  });

  test("an unseen transaction expires once the block height passes lastValidBlockHeight", async () => {
    const payer = await generateKeyPairSigner();
    const { rpc, sent } = sendRpc([null], [99n, 100n, 101n]);
    const landed = await signAndSend(rpc, messageWith(payer, [], lifetime), FAST);
    expect(landed.ok).toBe(false);
    if (landed.ok) return;
    expect(landed.error).toContain("expired: the block height passed 100");
    expect(sent.length).toBe(3);
  });
});
