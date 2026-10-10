/**
 * Purpose: the summary bounds what a compute budget can cost (Sprint 05 review, H1): the unit limit and price
 *          decoded, `ceil(price × limit / 10^6)` counted in what the signer pays (the limit clamped to, and
 *          bounded by, 1,400,000 units), a fee above the cap untrusted; and every compute-budget instruction
 *          this SDK does not read, or a second one of a kind, refused.
 *          Filter: `bun test tests/ -t "the summary bounds a compute budget"`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner, type Instruction } from "@solana/kit";

import { campaignAddress, Side } from "@brot/sdk/read";
import { buildJoinCampaign, COMPUTE_BUDGET_PROGRAM_ID, summarizeInstructions } from "@brot/sdk/tx";

import * as P from "../brot/program";

/** A compute-budget instruction: a tag and a little-endian integer of `size` bytes. */
function budget(tag: number, size: number, value: bigint): Instruction {
  const data = new Uint8Array(1 + size);
  data[0] = tag;
  for (let i = 0; i < size; i++) data[1 + i] = Number((value >> BigInt(8 * i)) & 0xffn);
  return { programAddress: COMPUTE_BUDGET_PROGRAM_ID, data };
}
const limit = (units: bigint) => budget(2, 4, units);
const price = (microLamports: bigint) => budget(3, 8, microLamports);

const aJoin = async () =>
  buildJoinCampaign({
    baker: await generateKeyPairSigner(),
    campaign: await campaignAddress(7n),
    metricAccount: P.BTC_USD_ACCOUNT,
    side: Side.Yes,
    amount: P.SOL / 10n,
    minReturnBps: 10_000,
    expectedEntryTotal: 0n,
    joinIndex: 0,
  });

describe("the summary bounds a compute budget", () => {
  test("a priority fee is decoded, bounded, counted and capped", async () => {
    const join = await aJoin();
    const modest = summarizeInstructions([limit(200_000n), price(1_000n), join]);
    expect([modest.trusted, modest.priorityFeeAtMost, modest.lamportsAtMost]).toEqual([true, 200n, P.SOL / 10n + 200n]);
    expect(modest.lines[1]).toContain("at most 0.000000200 SOL");
    // No limit set: bounded by the runtime's 1,400,000 units. A larger limit is clamped to it.
    expect(summarizeInstructions([price(1_000n), join]).priorityFeeAtMost).toBe(1_400n);
    expect(summarizeInstructions([limit(5_000_000n), price(1n), join]).priorityFeeAtMost).toBe(2n);
    // The review's probe: 1,400 SOL of priority fee once stood behind a trusted summary of a 0.1 SOL join.
    const drain = [limit(1_400_000n), price(1_000_000_000_000n), join];
    const refused = summarizeInstructions(drain);
    expect([refused.trusted, refused.priorityFeeAtMost]).toEqual([false, 1_400_000_000_000n]);
    expect(refused.items[1].text).toContain("above the cap of 0.001000000 SOL: do not sign");
    expect(summarizeInstructions(drain, { priorityFeeCap: 1_400_000_000_000n }).trusted).toBe(true);
  });

  test("an instruction this SDK does not read, a malformed one, or a second of a kind is refused", async () => {
    const join = await aJoin();
    const raw = (...data: number[]): Instruction => ({
      programAddress: COMPUTE_BUDGET_PROGRAM_ID,
      data: Uint8Array.from(data),
    });
    const payer = { address: join.accounts![0].address, role: AccountRole.WRITABLE_SIGNER };
    const cases: Instruction[] = [
      raw(0x77),
      budget(1, 4, 256n * 1024n), // RequestHeapFrame
      budget(4, 4, 64n * 1024n), // SetLoadedAccountsDataSizeLimit
      raw(3, 1, 0, 0, 0, 0, 0, 0), // a unit price one byte short
      { ...price(1n), accounts: [payer] },
    ];
    for (const ix of cases) {
      const summary = summarizeInstructions([ix, join]);
      expect([summary.trusted, summary.items[0].trusted]).toEqual([false, false]);
      expect(summary.items[0].text).toEndWith("do not sign");
    }
    const twice = summarizeInstructions([price(1n), price(2n), join]);
    expect([twice.trusted, twice.items[1].text]).toEqual([
      false,
      "A second compute-unit price, which the cluster refuses: do not sign",
    ]);
  });
});
