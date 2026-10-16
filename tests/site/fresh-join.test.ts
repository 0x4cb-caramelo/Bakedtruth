/**
 * Purpose: a join prepared again on "Sign" goes to the wallet without a second review only when its terms are the ones
 *          on screen (app/features/entry/fresh-join.ts): a new blockhash alone keeps them; a new floor, total, estimate,
 *          pot or summary line does not. And the check before the wallet: a fresh join goes as it is; a stale one is
 *          prepared again and goes on when only its blockhash moved, or comes back to the sheet when its terms did.
 *          Filter: `bun test tests/ -t "a join prepared again"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), the first-click fix
 */
import { describe, expect, test } from "bun:test";

import type { SolanaRpc } from "@brot/sdk/read";

import { FRESH_BLOCKS, freshJoin, sameTerms, type Preparation } from "../../app/features/entry/fresh-join";
import type { ReadyJoin } from "../../app/features/entry/submit";

const DEPLOY = 42n;

/** An RPC at `height` whose program was last deployed at DEPLOY (ProgramData: state 3, the slot, no authority). */
function rpcAt(height: bigint): SolanaRpc {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);
  view.setUint32(0, 3, true);
  view.setBigUint64(4, DEPLOY, true);
  const owner = "BPFLoaderUpgradeab1e11111111111111111111111";
  return {
    getBlockHeight: () => ({ send: async () => height }),
    getAccountInfo: () => ({
      send: async () => ({ value: { owner, data: [Buffer.from(data).toString("base64"), "base64"] } }),
    }),
  } as unknown as SolanaRpc;
}

/** The fields the sheet shows, around a blockhash that changes with every preparation. */
const join = (over: Record<string, unknown> = {}, blockhash = "hash-1"): ReadyJoin =>
  ({
    ok: true,
    stage: "ready",
    check: { isFirst: false, estimateBps: 133_172n },
    expectedEntryTotal: 0n,
    minReturnBps: 131_840,
    message: { lifetimeConstraint: { blockhash, lastValidBlockHeight: 1_000n } },
    simulation: { events: [{ name: "EntryAdded", data: { poolYes: 3_000_000_000n, poolNo: 800_000_000n } }] },
    summary: { lines: ["Paid by B: network fee at most 0.000005000 SOL (1 signature)", "1. Join NO with 0.1 SOL"] },
    debit: { amount: 100_000_000n, rents: 2_377_440n, networkFee: 5_000n, total: 102_382_440n },
    ...over,
  }) as unknown as ReadyJoin;

describe("a join prepared again", () => {
  test("keeps its terms when only the blockhash moved, so the same click goes on to the wallet", () => {
    expect(sameTerms(join(), join({}, "hash-2"))).toBe(true);
  });

  test("comes back to the sheet when anything it shows moved", () => {
    const moved: Record<string, unknown>[] = [
      { minReturnBps: 131_000 }, // another entry landed: the floor moved
      { check: { isFirst: false, estimateBps: 130_000n } },
      { check: { isFirst: true, estimateBps: 133_172n } },
      { expectedEntryTotal: 50_000_000n },
      { debit: { amount: 100_000_000n, rents: 1_000_000n, networkFee: 5_000n, total: 101_005_000n } },
      { simulation: { events: [{ name: "EntryAdded", data: { poolYes: 3_500_000_000n, poolNo: 800_000_000n } }] } },
      {
        summary: { lines: ["Paid by C: network fee at most 0.000005000 SOL (1 signature)", "1. Join NO with 0.1 SOL"] },
      },
    ];
    for (const over of moved)
      expect(`${JSON.stringify(Object.keys(over))}: ${sameTerms(join(), join(over, "hash-2"))}`).toBe(
        `${JSON.stringify(Object.keys(over))}: false`,
      );
  });
});

describe("a join prepared again, on Sign", () => {
  const shown = join();
  const left = (blocks: bigint) => 1_000n - blocks; // the height at which `blocks` are left on the shown blockhash
  const counting = (result: Preparation) => {
    const calls = { n: 0 };
    return { calls, prepare: async () => (calls.n++, result) };
  };

  test("a join with enough blocks left goes to the wallet as it is, without preparing again", async () => {
    const { calls, prepare } = counting({ prepared: join({}, "hash-2"), retry: false });
    const fresh = await freshJoin(rpcAt(left(FRESH_BLOCKS)), DEPLOY, shown, prepare);
    expect(fresh).toEqual({ kind: "go", ready: shown });
    expect(calls.n).toBe(0);
  });

  test("a stale join is prepared again, and the same click goes on when only the blockhash moved", async () => {
    const again = join({}, "hash-2");
    const { calls, prepare } = counting({ prepared: again, retry: true });
    const fresh = await freshJoin(rpcAt(left(FRESH_BLOCKS - 1n)), DEPLOY, shown, prepare);
    expect(fresh).toEqual({ kind: "go", ready: again, retry: true });
    expect(calls.n).toBe(1);
  });

  test("a stale join whose terms moved, or that the SDK now refuses, comes back to the sheet", async () => {
    const moved = { prepared: join({ minReturnBps: 120_000 }, "hash-2"), retry: false };
    expect(await freshJoin(rpcAt(left(10n)), DEPLOY, shown, counting(moved).prepare)).toEqual({
      kind: "again",
      ...moved,
    });
    const refusal = { prepared: { ok: false, stage: "check" }, retry: false } as unknown as Preparation;
    expect((await freshJoin(rpcAt(left(10n)), DEPLOY, shown, counting(refusal).prepare)).kind).toBe("again");
  });

  test("A-8 first: a program deployed again since the site was built stops it before anything is prepared", async () => {
    const { calls, prepare } = counting({ prepared: join({}, "hash-2"), retry: false });
    await expect(freshJoin(rpcAt(left(10n)), DEPLOY + 1n, shown, prepare)).rejects.toThrow("last deploy");
    expect(calls.n).toBe(0);
  });
});
