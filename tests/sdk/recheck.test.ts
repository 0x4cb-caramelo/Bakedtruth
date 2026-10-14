/**
 * Purpose: BR-23: `recheck(campaign, rpcUrl)` re-reads, through an RPC endpoint the caller chooses (here a
 *          local one backed by the LiteSVM world), the account and field the program read to resolve a
 *          campaign, and returns it beside the recorded value: equal right after resolution, and the
 *          documented `null` or mismatch once the account has moved on, still `consistent` when the field
 *          moved the only way it can. The event search pages newest first past newer and malformed answers, and
 *          reads a resolution sent in any transaction version the cluster serves.
 * Version: 0.1.2 (Sprint 16: a resolution in a v1 transaction; a relay that relays version 0 only)
 * Sprint:  05 (SDK); 16 (lane L16P)
 */
import { afterEach, describe, expect, test } from "bun:test";

import { MAX_TRANSACTION_VERSION, recheck, type RpcTransaction } from "@brot/sdk/read";

import * as P from "../brot/program";
import * as R from "../brot/readers";
import {
  anyAddress,
  at,
  DEADLINE,
  EPOCH,
  PRICE_TARGET,
  priceCampaign,
  resolve,
  resolveIx,
  resolveWorld,
  setBtcPrice,
  stakePoolCampaign,
  supplyCampaign,
} from "../brot/resolve-support";
import { expectOk, START_TIME } from "../brot/setup";
import { startFakeRpc, type FakeRpc } from "./fake-rpc";
import { sendAsRpc } from "./rpc-shape";

let rpc: FakeRpc | null = null;
afterEach(() => rpc?.close());

describe("recheck reads the same account through any rpc", () => {
  test("a burn: the supply the program recorded, then a later burn below it", async () => {
    const w = await resolveWorld();
    const c = await supplyCampaign(w, 1_000_000n, 990_000n);
    const burnTo = (supply: bigint) =>
      R.setRawAccount(w.client, c.metric, R.mintBytes({ supply, mintAuthority: null }), P.SPL_TOKEN_PROGRAM_ID);
    burnTo(980_000n);
    expectOk(await resolve(w, c));
    rpc = startFakeRpc(w);
    const first = await recheck(c.campaign, rpc.url);
    expect(first).toMatchObject({
      account: c.metric,
      field: "supply",
      recorded: 980_000n,
      reread: 980_000n,
      matches: true,
      consistent: true,
    });
    burnTo(970_000n);
    // A later burn: not the recorded value, but the only way a revoked mint's supply can move.
    expect(await recheck(c.campaign, rpc.url)).toMatchObject({ reread: 970_000n, matches: false, consistent: true });
  });

  test("a stake pool: the measured epoch's snapshot, until the pool writes the next one", async () => {
    const w = await resolveWorld();
    const c = await stakePoolCampaign(w, { updated: EPOCH, snapshot: 5n * P.SOL, target: 4n * P.SOL });
    expectOk(await resolve(w, c));
    rpc = startFakeRpc(w);
    expect(await recheck(c.campaign, rpc.url)).toMatchObject({
      recorded: 5n * P.SOL,
      reread: 5n * P.SOL,
      matches: true,
      consistent: true,
    });
    R.setFixture(w.client, "stakepool-jitosol", {
      mutate: (_, view) => view.setBigUint64(R.STAKE_POOL_OFFSETS.lastUpdateEpoch, EPOCH + 1n, true),
    });
    expect(await recheck(c.campaign, rpc.url)).toMatchObject({ reread: null, matches: null, consistent: null });
  });

  test("a price YES: the proof account found through the CampaignResolved event, then overwritten", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    const proof = await anyAddress();
    const touch = PRICE_TARGET + 1_000n;
    setBtcPrice(w, proof, touch, START_TIME - 5n);
    const sent = await sendAsRpc(w, [resolveIx(c, proof)]);
    expect(sent.ok).toBe(true);
    rpc = startFakeRpc(w);
    rpc.record(sent.tx);
    expect(await recheck(c.campaign, rpc.url)).toMatchObject({
      account: proof,
      field: "price",
      recorded: touch,
      reread: touch,
      matches: true,
    });
    setBtcPrice(w, proof, touch + 1n, START_TIME - 1n);
    expect(await recheck(c.campaign, rpc.url)).toMatchObject({ reread: null, matches: null });
  });

  test("the event is found past newer and malformed transactions, a page at a time", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    const proof = await anyAddress();
    setBtcPrice(w, proof, PRICE_TARGET + 1_000n, START_TIME - 5n);
    const sent = await sendAsRpc(w, [resolveIx(c, proof)]);
    rpc = startFakeRpc(w);
    rpc.record(sent.tx);
    // Five newer transactions on the campaign, each one an answer the decoder cannot read.
    for (let i = 0; i < 5; i++) {
      const junk = { ...sent.tx, transaction: { ...sent.tx.transaction, signatures: [`junk${i}`] } };
      rpc.record({ ...junk, meta: { err: null, innerInstructions: "junk" } } as unknown as RpcTransaction);
    }
    expect(await recheck(c.campaign, rpc.url, { pageSize: 2 })).toMatchObject({ account: proof, matches: true });
    expect(await recheck(c.campaign, rpc.url, { pageSize: 2, maxSignatures: 4 })).toMatchObject({ matches: null });
  });

  test("a resolution sent in a v1 transaction is found; a relay of version 0 only still finds a v0 one", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    const proof = await anyAddress();
    const touch = PRICE_TARGET + 1_000n;
    setBtcPrice(w, proof, touch, START_TIME - 5n);
    const sent = await sendAsRpc(w, [resolveIx(c, proof)]);
    // The node serves the resolution as a v1 transaction: only a reader asking for version 1 or more gets it.
    expect(MAX_TRANSACTION_VERSION).toBe(1);
    rpc = startFakeRpc(w);
    rpc.record(sent.tx, 1);
    const found = { account: proof, field: "price", recorded: touch, reread: touch, matches: true };
    expect(await recheck(c.campaign, rpc.url)).toMatchObject(found);
    rpc.close();
    // A relay that relays version 0 only refuses the option (invalid params): the search asks for 0 from then on.
    rpc = startFakeRpc(w, "node", [0]);
    rpc.record(sent.tx, 0);
    expect(await recheck(c.campaign, rpc.url)).toMatchObject(found);
  });

  test("a void records nothing to re-read; an unresolved campaign is refused", async () => {
    const w = await resolveWorld();
    const missed = await stakePoolCampaign(w, { updated: EPOCH - 1n, snapshot: P.SOL, target: 4n * P.SOL });
    at(w, DEADLINE + 1n, EPOCH - 1n);
    expectOk(await resolve(w, missed));
    const open = await supplyCampaign(w, 1_000_000n, 990_000n);
    rpc = startFakeRpc(w);
    expect(await recheck(missed.campaign, rpc.url)).toMatchObject({ field: "none", reread: null, matches: null });
    await expect(recheck(open.campaign, rpc.url)).rejects.toThrow("not resolved");
  });
});
