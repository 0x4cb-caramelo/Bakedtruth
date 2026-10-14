/**
 * Purpose: "before the first entry" by chain order (Sprint 14, lane L14R; the lead's rule of 2026-10-13), over
 *          hand-built event streams through the real ingest, no cluster: in one transaction, the link counts only when
 *          its instruction runs before the join's, both ways; in one slot across two transactions, only the block's
 *          own order decides, both ways, whatever order the listing gave; while the block cannot be read the link is
 *          undecided and earns nothing, then it is read once and decided; the positions read are rebuilt the same. A
 *          block of a newer transaction version (-32015) is skipped and named, its link undecided until it reads, and
 *          every block is asked for at the SDK's MAX_TRANSACTION_VERSION (Sprint 16, the review's F1).
 *          Filter: `bun test services/indexer -t referral`.
 * Version: 0.2.0 (Sprint 16: a block of a newer version)
 * Sprint:  14 (referral, lane L14R); 16
 */
import { describe, expect, test } from "bun:test";
import { MAX_TRANSACTION_VERSION } from "@brot/sdk/read";

import { dump } from "../src/db/store";
import { rebuild } from "../src/rebuild";
import { noLive } from "./fake-chain";
import { Campaign } from "./referral-campaign";
import { Chain, indexed, rpcOf, SOL, wallet } from "./referral-chain";

const [F, D] = [wallet(2), wallet(4)];
const [A, B] = [wallet(41), wallet(42)];

/** A campaign A and B both join on YES, with D against them, finalized YES and paid out. */
function settledWith(chain: Chain, c: Campaign) {
  c.join(D, "no", 2n * SOL);
  c.finalize("yes");
  c.settle();
}

describe("referral chain order", () => {
  test("one transaction: the link counts only when its instruction runs first, both ways", async () => {
    const chain = new Chain();
    const c = new Campaign(chain, 1);
    const first = chain.together(() => {
      chain.link(A, F);
      return c.join(A, "yes", SOL);
    });
    const second = chain.together(() => {
      c.join(B, "yes", SOL);
      return chain.link(B, F);
    });
    settledWith(chain, c);
    const x = await indexed(chain);
    expect(x.referral(A)).toMatchObject({ status: "active", linked_slot: first.slot, first_entry_slot: first.slot });
    expect(x.referral(B)).toMatchObject({ status: "late", linked_slot: second.slot, first_entry_slot: second.slot });
    // V = 2 SOL, fee 0.2 SOL: A's half is 0.1 SOL; B's link came after its entry and earns nothing.
    expect(x.referral(A)).toMatchObject({ basis: "100000000", referrer_share: "20000000" });
    expect(x.referral(B)).toMatchObject({ basis: "0", referrer_share: "0" });
    expect(x.blockReads).toEqual([]); // the instructions decided: no block read
  });

  test("one slot, two transactions: the block's order decides, both ways, not the listing's", async () => {
    const chain = new Chain();
    const c = new Campaign(chain, 1);
    // A: the join lands first in the listing, the link second; the block says the link ran first.
    const joinA = c.join(A, "yes", SOL);
    const linkA = chain.link(A, F, { slot: joinA.slot, time: joinA.time });
    chain.blocks.set(joinA.slot, ["other", linkA.signature, "more", joinA.signature]);
    // B: the link lands first in the listing, the join second; the block says the join ran first.
    const linkB = chain.link(B, F);
    const joinB = c.join(B, "yes", SOL, { slot: linkB.slot, time: linkB.time });
    chain.blocks.set(linkB.slot, [joinB.signature, linkB.signature]);
    settledWith(chain, c);
    const x = await indexed(chain);
    expect(x.referral(A)).toMatchObject({ status: "active", basis: "100000000" });
    expect(x.referral(B)).toMatchObject({ status: "late", basis: "0" });
    expect(x.blockReads.sort()).toEqual([joinA.slot, linkB.slot].sort());
    const positions = x.store.db.query("SELECT signature, slot, position FROM tx_positions ORDER BY slot, position");
    expect(positions.all()).toEqual([
      { signature: linkA.signature, slot: joinA.slot, position: 1 },
      { signature: joinA.signature, slot: joinA.slot, position: 3 },
      { signature: joinB.signature, slot: linkB.slot, position: 0 },
      { signature: linkB.signature, slot: linkB.slot, position: 1 },
    ]);
  });

  test("a block not read yet leaves the link undecided, earning nothing; it is read once, then decided", async () => {
    const chain = new Chain();
    const c = new Campaign(chain, 1);
    const linkA = chain.link(A, F);
    c.join(A, "yes", SOL, { slot: linkA.slot, time: linkA.time });
    settledWith(chain, c);
    chain.blockDown = true;
    const x = await indexed(chain);
    expect(x.referral(A)).toMatchObject({ status: "undecided", basis: "0", referrer_share: "0", rebate: "0" });
    expect(x.entries(A)).toEqual([]);
    chain.blockDown = false;
    await x.refresh();
    expect(x.referral(A)).toMatchObject({ status: "active", basis: "200000000", referrer_share: "40000000" });
    const before = dump(x.store);
    await x.refresh();
    expect(x.blockReads).toEqual([linkA.slot, linkA.slot]); // once while down, once read: never again
    expect(dump(x.store)).toEqual(before);
    const rebuilt = await rebuild(rpcOf(chain).rpc, ":memory:", { readLive: noLive });
    expect(dump(rebuilt.store)).toEqual(before);
    rebuilt.store.close();
  });

  test("a block of a newer transaction version is skipped and named; its link stays undecided until it reads", async () => {
    const chain = new Chain();
    const c = new Campaign(chain, 1);
    const linkA = chain.link(A, F);
    c.join(A, "yes", SOL, { slot: linkA.slot, time: linkA.time });
    settledWith(chain, c);
    chain.blockNewer = true;
    const x = await indexed(chain);
    expect(x.referral(A)).toMatchObject({ status: "undecided", basis: "0", referrer_share: "0", rebate: "0" });
    chain.blockNewer = false;
    await x.refresh();
    expect(x.referral(A)).toMatchObject({ status: "active", basis: "200000000", referrer_share: "40000000" });
    expect(x.blockVersions).toEqual([MAX_TRANSACTION_VERSION, MAX_TRANSACTION_VERSION]);
  });
});
