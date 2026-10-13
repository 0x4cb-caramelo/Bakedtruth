/**
 * Purpose: the alert the indexer feeds (Sprint 08 DoD "The alerts the indexer feeds"), no cluster: an entry by the
 *          creator's own wallet raises one journal line in the keeper's shape on a burn, lock, stake or graduation
 *          campaign whose result is not final, and none on a price campaign, a final one or a closed one; entries in
 *          the file before the watch started never alert, so a restart repeats nothing; a detail key that looks like a
 *          secret, or would overwrite the line's own fields, is refused, and a repeat within 15 minutes is dropped.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";

import { createAlerter, creatorEntryWatch } from "../src/alerts";
import { openStore } from "../src/db/store";
import { addCampaign, addEntry, AT, LAMPORTS } from "./rows";

describe("the creator's own entry alert", () => {
  test("raised on a kind its creator can control while the result is not final; once; never for history", () => {
    const store = openStore(":memory:");
    const old = addCampaign(store, { address: AT(2), kind: "SupplyAtMost" });
    addEntry(store, old, old.creator, "Yes", LAMPORTS, { is_creator: 1 }); // before the watch: history
    const lines: string[] = [];
    const watch = creatorEntryWatch(
      store,
      createAlerter({ emit: (line) => lines.push(line), now: () => 1_800_000_000_000 }),
    );
    expect(watch.check()).toBe(0);

    const burn = addCampaign(store, { address: AT(3), id: "3", kind: "SupplyAtMost" });
    const lock = addCampaign(store, { address: AT(4), id: "4", kind: "DammV2LockedAtLeast", status: "InReview" });
    const price = addCampaign(store, { address: AT(5), id: "5" });
    const settled = addCampaign(store, { address: AT(6), id: "6", kind: "StakePoolTvlAtLeast", status: "Settled" });
    const curve = addCampaign(store, { address: AT(7), id: "7", kind: "DbcGraduated", status: "Contested" });
    for (const c of [burn, lock, price, settled, curve])
      addEntry(store, c, c.creator, "No", 2n * LAMPORTS, { is_creator: 1 });
    addEntry(store, burn, AT(8), "Yes", LAMPORTS); // anyone else: nothing
    expect(watch.check()).toBe(3);
    expect(watch.check()).toBe(0);
    const raised = lines.map((l) => JSON.parse(l));
    expect(raised.map((a) => a.campaign)).toEqual([AT(3), AT(4), AT(7)]);
    expect(raised[0]).toMatchObject({
      ...{ event: "alert", kind: "creator_own_entry", transports: "journal", ts: "2027-01-15T08:00:00.000Z" },
      ...{ opening: 1, id: "3", reader: "SupplyAtMost", side: "No", lamports: String(2n * LAMPORTS) },
    });
    expect(raised[0].key).toBe(`${raised[0].signature}:0:0`);
    store.close();
  });

  test("the alerter refuses a secret-like detail and drops a repeat within 15 minutes", () => {
    let now = 0;
    const lines: string[] = [];
    const alerter = createAlerter({ emit: (line) => lines.push(line), now: () => now });
    expect(() => alerter.alert("creator_own_entry", "k", { rpc_url: "x" })).toThrow("looks like a secret");
    expect(() => alerter.alert("creator_own_entry", "k", { kind: "x" })).toThrow("overwrite");
    expect(alerter.alert("creator_own_entry", "k", { side: "Yes" })).toBe(true);
    now = 14 * 60_000;
    expect(alerter.alert("creator_own_entry", "k", { side: "Yes" })).toBe(false);
    now = 15 * 60_000;
    expect(alerter.alert("creator_own_entry", "k", { side: "Yes" })).toBe(true);
    expect(lines).toHaveLength(2);
  });
});
