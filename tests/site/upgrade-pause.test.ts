/**
 * Purpose: A-8 on the site (the founder's answers of 2026-10-10: ProgramData read through the site's RPC; the floor at
 *          1%): the entry's preparation passes the deploy the site was built for and the 1% floor; an upgrade, or a
 *          site that knows no deploy, stops it before the wallet as "nothing was sent", with its own message and the
 *          way out (a reload); and the back-off between reloads grows, falls back to the longest wait when the count
 *          cannot be kept, and starts over once a check passes. Against the program in LiteSVM.
 *          Filter: `bun test tests/ -t "signing pauses during an upgrade"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; A-8)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";

import { ProgramDataRefused, ProgramUpgraded } from "@brot/sdk/read";

import { failureCopy } from "../../app/features/entry/copy-failures";
import { fromError, nothingSent } from "../../app/features/entry/failures";
import { FLOOR_BPS, prepareEntry } from "../../app/features/entry/submit";
import {
  countReload,
  deployConfirmed,
  RELOAD_DELAYS_S,
  reloadDelay,
  type ReloadCount,
} from "../../app/features/entry/upgrade-pause";
import { openedCampaign } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fundedWallet, setUpgradeAuthority } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { memoryStore, refusingStore } from "./support";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

describe("signing pauses during an upgrade", () => {
  test("the site's preparation signs the 1% floor for its deploy, and stops when the program is upgraded", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    chain = startFakeChain(w);
    const rpc = createSolanaRpc(chain.url);
    const baker = await fundedWallet(w);
    const choice = { rpc, campaign: campaign as string, baker: baker.address as string, side: "yes" as const };
    const entry = { ...choice, amount: P.SOL / 10n };
    // The world's program was deployed at slot 0: a site built for it prepares, with the founder's floor.
    const prepared = ready(await prepareEntry({ ...entry, deploySlot: 0n }));
    expect(FLOOR_BPS).toBe(100);
    expect(BigInt(prepared.minReturnBps)).toBe((prepared.check.estimateBps * 9_900n) / 10_000n);
    // An upgrade lands at slot 9: the same site stops before reading anything else, and so does one with no deploy.
    setUpgradeAuthority(w.client, await P.programDataPda(), w.upgradeAuthority.address, 9n);
    const upgraded = await prepareEntry({ ...entry, deploySlot: 0n }).catch((error) => error);
    expect(upgraded).toBeInstanceOf(ProgramUpgraded);
    expect([upgraded.deployedAt, upgraded.builtFor]).toEqual([9n, 0n]);
    const unknown = await prepareEntry({ ...entry, deploySlot: null }).catch((error) => error);
    expect([unknown.deployedAt, unknown.builtFor]).toEqual([9n, null]);
    // Each says so in its own words, as nothing sent; only the upgrade reloads.
    const failures = [fromError(upgraded), fromError(unknown), fromError(new ProgramDataRefused("Missing"))];
    expect(failures.map((f) => f.key)).toEqual(["programUpgraded", "versionUnknown", "versionUnknown"]);
    expect(failures.every(nothingSent)).toBe(true);
    expect(failures.map((f) => f.code)).toEqual([null, null, null]);
    expect([failureCopy("programUpgraded").way, failureCopy("versionUnknown").way]).toEqual(["reload", "close"]);
  });

  test("the back-off grows with each reload, waits the longest when it cannot count, and starts over", () => {
    const store = memoryStore();
    const waits: number[] = [];
    for (let i = 0; i < 6; i++) {
      waits.push(reloadDelay(store));
      countReload(store);
    }
    expect(RELOAD_DELAYS_S).toEqual([5, 30, 120, 600]);
    expect(waits).toEqual([5, 30, 120, 600, 600, 600]);
    deployConfirmed(store);
    expect(reloadDelay(store)).toBe(5);
    // No storage, storage that throws, or a count someone else wrote: the longest wait, and nothing throws.
    const longest = RELOAD_DELAYS_S[RELOAD_DELAYS_S.length - 1];
    expect(reloadDelay(null)).toBe(longest);
    const refusing: ReloadCount = refusingStore();
    expect(reloadDelay(refusing)).toBe(longest);
    expect(() => countReload(refusing)).not.toThrow();
    expect(() => deployConfirmed(refusing)).not.toThrow();
    store.map.set("brot-a8-reloads", "soon");
    expect(reloadDelay(store)).toBe(longest);
    countReload(store);
    expect(reloadDelay(store)).toBe(longest);
  });
});
