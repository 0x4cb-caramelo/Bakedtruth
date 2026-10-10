/**
 * Purpose: scripts/team/resolution-post.ts writes a resolution post from its template (Sprint 13 DoD; BR-33): read from
 *          the program in LiteSVM behind the recording RPC through whole cycles, the post names the campaign, the
 *          result the program recorded, the value read and the target, the review window or the void's public reason,
 *          and the account anyone can re-check. It refuses a campaign with no result, promises no payout and no time,
 *          posts nothing, and fits X's 280 characters as X counts them (a link is 23). Filter: `bun test tests/ -t "resolution post"`.
 * Version: 0.2.0 (the Sprint 13 reviews: a price NO says why, one link, the devnet line before it, a 20-digit id)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createSolanaRpc } from "@solana/kit";

import { Side, Status, VoidReason } from "@brot/sdk/read";

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

/** The largest u64 id, as a real campaign's random id can be: a post must fit even then. */
const LONG_ID = 18_446_744_073_709_551_615n;

describe("resolution post", () => {
  test("a price NO in review: why it is NO, the review's end, the devnet line, one link; it fits with a 20-digit id", async () => {
    const run = await runCycle(
      w,
      (b) => [
        { who: b[0], side: Side.Yes, amount: SOL },
        { who: b[1], side: Side.No, amount: SOL },
      ],
      { how: "no", stopAt: "review", chain },
    );
    const post = await postFor(run.id, "https://site.example");
    expect(post).toContain(`Campaign ${run.id}: BTC/USD reaches`);
    expect(post).toContain("Read on-chain: NO. No YES proof was recorded before the deadline.");
    expect(post).toContain("Review ends ");
    expect(post).toContain(`https://site.example/c/${run.id}`);
    expect(post).not.toContain("explorer.solana.com"); // the page has the re-check panel
    expect(post).toContain("Devnet test SOL, no real value. Not audited yet.");
    expect(post.indexOf("Devnet")).toBeLessThan(post.indexOf("https://")); // the notice is never the line cut last
    expect(post).not.toMatch(/automatic|paid in|minutes|within|guarantee|profit|is refunded/i);
    expect(post).not.toContain("{{");
    const read = await readForPost(createSolanaRpc(chain.url), run.id);
    const long = resolutionPost({ ...read.campaign, id: LONG_ID }, read.address, read.chain, {
      cluster: "devnet",
      site: "https://site.example",
    });
    expect(xLength(long)).toBeLessThanOrEqual(POST_LIMIT);
    // Without a site, the post links the account on the explorer instead.
    expect(await postFor(run.id)).toContain(
      `Check it: https://explorer.solana.com/address/${run.campaign}?cluster=devnet`,
    );
  });

  test("a void: its short public reason, the refund as a rule, final; it fits with a 20-digit id, in review too", async () => {
    const id = (await injectState(w, "void-stale")).id;
    const stale = await postFor(id);
    expect(stale).toContain("Read on-chain: voided. The price feed stopped updating before the deadline.");
    expect(stale).toContain("Entries come back in full.");
    expect(stale).toContain("The result is final.");
    expect(stale).not.toContain("/c/");
    expect(stale).not.toContain("can't be proven"); // the post's short reason; the page has the full one
    const read = await readForPost(createSolanaRpc(chain.url), id);
    const long = resolutionPost({ ...read.campaign, id: LONG_ID }, read.address, read.chain, {
      cluster: "devnet",
      site: "https://site.example",
    });
    expect(xLength(long)).toBeLessThanOrEqual(POST_LIMIT);
    // The longest common case: an automatic void (the longest short reason) still in its review window.
    const inReview = resolutionPost(
      {
        ...read.campaign,
        id: LONG_ID,
        status: Status.InReview,
        voidReason: VoidReason.StaleFeed,
        reviewEndsAt: read.chain.unixTimestamp + 3_600n,
      },
      read.address,
      read.chain,
      { cluster: "devnet", site: "https://site.example" },
    );
    expect(inReview).toContain("Review ends ");
    expect(xLength(inReview)).toBeLessThanOrEqual(POST_LIMIT);
  });

  test("a campaign whose result was not read is refused; the template posts nothing by itself", async () => {
    const open = await injectState(w, "closed");
    await expect(postFor(open.id)).rejects.toThrow("the result has not been read");
    const script = readFileSync("scripts/team/resolution-post.ts", "utf8");
    expect(script).not.toMatch(/api\.x\.com|api\.twitter\.com|fetch\(/);
    expect(script).toContain("xLength(post)"); // the CLI counts as X does
  });
});
