/**
 * Purpose: the review's F2 on the SDK's `recheck` (Sprint 16): a resolution in a v1 transaction is found through a
 *          relay that relays versions 0 and 1 (the relay's rule since this fix); after the cut-off moved, an event of
 *          another publish time than the campaign's is skipped as stale and never compared; and a newer transaction
 *          the RPC cannot return, the node's -32015 to a version-0 reader or a 429, leaves the answer incomplete instead
 *          of compared with the older event. Each case is a real resolve and a real cut-off move in LiteSVM, served by
 *          the fake RPC with the version and the answer a node gives.
 * Version: 0.1.0
 * Sprint:  16 (the red-team review's F2)
 */
import { afterEach, describe, expect, test } from "bun:test";

import { recheck, searchResolvedEvent } from "@brot/sdk/read";
import { createSolanaRpc } from "@solana/kit";

import { anyAddress, PRICE_TARGET, priceCampaign, resolveIx, resolveWorld, setBtcPrice } from "../brot/resolve-support";
import { START_TIME } from "../brot/setup";
import { startFakeRpc, type FakeRpc } from "./fake-rpc";
import { sendAsRpc } from "./rpc-shape";

let rpc: FakeRpc | null = null;
afterEach(() => rpc?.close());

const TOUCH = PRICE_TARGET + 1_000n;

/** A price campaign resolved YES on a proof published at START_TIME - 5, then moved back to one at START_TIME - 30. */
async function movedCutoff() {
  const w = await resolveWorld();
  const c = await priceCampaign(w);
  const [late, early] = [await anyAddress(), await anyAddress()];
  setBtcPrice(w, late, TOUCH, START_TIME - 5n);
  const first = await sendAsRpc(w, [resolveIx(c, late)]);
  setBtcPrice(w, early, TOUCH, START_TIME - 30n);
  const moved = await sendAsRpc(w, [resolveIx(c, early)]);
  expect([first.ok, moved.ok]).toEqual([true, true]);
  return { w, c, late, early, first: first.tx, moved: moved.tx };
}

describe("recheck after the review's F2", () => {
  test("a v1 resolution through a relay of versions 0 and 1 is found, with no fall back to 0", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    const proof = await anyAddress();
    setBtcPrice(w, proof, TOUCH, START_TIME - 5n);
    const sent = await sendAsRpc(w, [resolveIx(c, proof)]);
    rpc = startFakeRpc(w, "node", [0, 1]);
    rpc.record(sent.tx, 1);
    expect(await recheck(c.campaign, rpc.url)).toMatchObject({ account: proof, reread: TOUCH, matches: true });
  });

  test("a moved cut-off: the first proof's event is stale and never compared; the move's event is", async () => {
    const { w, c, early, first, moved } = await movedCutoff();
    rpc = startFakeRpc(w);
    rpc.record(first); // a node that has not returned the move: only the first proof's event, of another publish time
    const stale = await recheck(c.campaign, rpc.url);
    expect(stale).toMatchObject({ reread: null, matches: null, consistent: null });
    expect(stale.note).toContain("another publish time");
    rpc.record(moved);
    expect(await recheck(c.campaign, rpc.url)).toMatchObject({ account: early, reread: TOUCH, matches: true });
  });

  test("a newer transaction the RPC cannot return makes the answer incomplete, never the older event", async () => {
    const { w, c, first, moved } = await movedCutoff();
    // A relay of version 0 only: the search falls back to 0, and the move, a v1 transaction, is -32015.
    rpc = startFakeRpc(w, "node", [0]);
    rpc.record(first, 0);
    rpc.record(moved, 1);
    const behind = await recheck(c.campaign, rpc.url);
    expect([behind.matches, behind.reread]).toEqual([null, null]);
    expect(behind.note).toContain("incomplete");
    expect(behind.note).toContain("-32015");
    rpc.close();
    // A 429 on the newer transaction: incomplete too, and the search names the transaction, not the RPC's URL.
    rpc = startFakeRpc(w);
    rpc.record(first);
    rpc.record(moved);
    rpc.throttle(moved.transaction.signatures[0]!);
    const found = await searchResolvedEvent(createSolanaRpc(rpc.url), c.campaign);
    expect(found.found).toBeNull();
    expect(found.incomplete).toContain(`${moved.transaction.signatures[0]} could not be read`);
    expect(found.incomplete).toContain("HTTP 429");
    expect(found.incomplete).not.toContain("127.0.0.1");
  });
});
