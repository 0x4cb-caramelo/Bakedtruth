/**
 * Purpose: scripts/team/resolution-post.ts writes a resolution post from its template (Sprint 13 DoD; BR-33): read from
 *          the program in LiteSVM behind the recording RPC through whole cycles, the post names the campaign, the
 *          result the program recorded, the value read and the target, the review window or the void's public reason,
 *          and the account anyone can re-check. It refuses a campaign with no result, promises no payout and no time,
 *          posts nothing, and fits X's 280 characters as X counts them (a link is 23). Filter: `bun test tests/ -t "resolution post"`.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createSolanaRpc } from "@solana/kit";

import { Side } from "@brot/sdk/read";

import { POST_LIMIT, readForPost, resolutionPost, xLength } from "../../scripts/team/resolution-post";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import { runCycle, SOL } from "../site/cycle-run";
import { startFakeChain, type FakeChain } from "../site/fake-chain";
import { injectState } from "../site/state-world";

let w: OpeningWorld;
let chain: FakeChain;
beforeAll(async () => {
  w = await openingWorld();
  chain = startFakeChain(w);
});
afterAll(() => chain.close());

const postFor = async (id: bigint, site?: string) => {
  const read = await readForPost(createSolanaRpc(chain.url), id);
  return resolutionPost(read.campaign, read.address, read.chain, { cluster: "devnet", site });
};

describe("resolution post", () => {
  test("a NO in review: the result, the value and the target, the review's end, the account to re-check", async () => {
    const run = await runCycle(
      w,
      (b) => [
        { who: b[0], side: Side.Yes, amount: SOL },
        { who: b[1], side: Side.No, amount: SOL },
      ],
      {
        how: "no",
        stopAt: "review",
        chain,
      },
    );
    const post = await postFor(run.id, "https://site.example");
    expect(post).toContain(`Campaign ${run.id}: BTC/USD reaches`);
    expect(post).toContain("Read on-chain: NO. Value read:");
    expect(post).toContain("Target:");
    expect(post).toContain("Final after the 6-hour review, at");
    expect(post).toContain(`https://explorer.solana.com/address/${run.campaign}?cluster=devnet`);
    expect(post).toContain(`https://site.example/c/${run.id}`);
    expect(post).toContain("Devnet, test SOL. Not audited yet.");
    expect(xLength(post)).toBeLessThanOrEqual(POST_LIMIT);
    expect(post).not.toMatch(/automatic|paid in|minutes|within|guarantee|profit/i);
    expect(post).not.toContain("{{");
  });

  test("a void: its public reason and the refund; a final result says so; no site, no page line", async () => {
    const stale = await postFor((await injectState(w, "void-stale")).id);
    expect(stale).toContain("Read on-chain: voided. The price feed stopped updating");
    expect(stale).toContain("Every entry is refunded in full.");
    expect(stale).toContain("The result is final.");
    expect(stale).not.toContain("/c/");
    expect(stale).not.toContain("Every entry is refunded rather than"); // the reason's first sentence only
    expect(xLength(stale)).toBeLessThanOrEqual(POST_LIMIT);
  });

  test("a campaign whose result was not read is refused; the template posts nothing by itself", async () => {
    const open = await injectState(w, "closed");
    await expect(postFor(open.id)).rejects.toThrow("the result has not been read");
    const script = readFileSync("scripts/team/resolution-post.ts", "utf8");
    expect(script).not.toMatch(/api\.x\.com|api\.twitter\.com|fetch\(/);
  });
});
