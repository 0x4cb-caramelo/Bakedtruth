/**
 * Purpose: the referee's rebate and the referral tables' rebuild, over hand-built event streams through the real ingest
 *          (Sprint 14, lane L14R; P1 §3.9, P-6), no cluster: the fee Brot kept on the referee's first 0.4576 SOL of
 *          entries, due once its entries reach 2.2879 SOL, capped at 0.05 SOL; the threshold crossed in one entry,
 *          the first 0.4576 SOL inside one larger join, a rebate known before the threshold and paid only after it,
 *          the cap; and both tables idempotent and rebuildable: a second refresh changes nothing, and a new file read
 *          from the same chain holds the same rows. Filter: `bun test services/indexer -t referral`.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { describe, expect, test } from "bun:test";

import { dump } from "../src/db/store";
import { rebuild } from "../src/rebuild";
import { REBATE_CAP_LAMPORTS } from "../src/referral/rules";
import { noLive } from "./fake-chain";
import { Campaign } from "./referral-campaign";
import { Chain, indexed, SOL, wallet } from "./referral-chain";

const [R, F, B, D] = [wallet(1), wallet(2), wallet(3), wallet(4)];

describe("referral rebate", () => {
  test("crossed in one entry: the fee kept on the first 0.4576 SOL of a larger join", async () => {
    const chain = new Chain();
    chain.link(R, F);
    const c = new Campaign(chain, 1);
    const first = c.join(R, "yes", 3n * SOL);
    c.join(B, "yes", SOL);
    c.join(D, "no", 4n * SOL);
    c.finalize("yes");
    c.settle();
    const x = await indexed(chain);
    // V = 4 SOL, fee 0.4 SOL: 0.4 × 0.4576 ÷ 4 = 0.04576 SOL, under the cap; and the referrer's 20% of 0.3 SOL.
    expect(x.referral(R)).toMatchObject({ entered: String(3n * SOL), rebate_reached_slot: first.slot });
    expect(x.referral(R)).toMatchObject({ rebate_basis: "45760000", rebate: "45760000" });
    expect(x.referral(R)).toMatchObject({ basis: "300000000", referrer_share: "60000000" });
  });

  test("known before the threshold, due only once the entries reach 2.2879 SOL", async () => {
    const chain = new Chain();
    chain.link(R, F);
    const a = new Campaign(chain, 1);
    a.join(R, "yes", 2n * SOL);
    a.join(D, "no", 2n * SOL);
    a.finalize("yes");
    a.settle();
    const x = await indexed(chain);
    expect(x.referral(R)).toMatchObject({ entered: String(2n * SOL), rebate_reached_slot: null });
    expect(x.referral(R)).toMatchObject({ rebate_basis: "45760000", rebate: "0" });
    const b = new Campaign(chain, 2);
    const crossing = b.join(R, "no", 287_900_000n); // 2.2879 SOL exactly: reached
    b.join(B, "yes", SOL);
    b.finalize("yes");
    b.settle();
    await x.refresh();
    expect(x.referral(R)).toMatchObject({ entered: "2287900000", rebate_reached_slot: crossing.slot });
    expect(x.referral(R)).toMatchObject({ rebate_basis: "45760000", rebate: "45760000" });
    expect(x.entries(R)[1]).toMatchObject({ state: "no_fee", basis: "0" }); // the losing entry
  });

  test("capped at 0.05 SOL", async () => {
    const chain = new Chain();
    chain.link(R, F);
    const a = new Campaign(chain, 1);
    a.join(R, "yes", SOL / 2n);
    a.join(D, "no", 10n * SOL);
    a.finalize("yes");
    a.settle();
    const b = new Campaign(chain, 2);
    b.join(R, "no", 2n * SOL);
    b.join(B, "yes", SOL);
    b.finalize("yes");
    b.settle();
    const x = await indexed(chain);
    // V = 0.5 SOL against 10 SOL: a fee of 1 SOL, of which the first 0.4576 SOL carry 0.9152 SOL.
    expect(x.referral(R)).toMatchObject({ rebate_basis: "915200000", rebate: String(REBATE_CAP_LAMPORTS) });
    expect(x.referral(R)).toMatchObject({ basis: String(SOL), referrer_share: "200000000" });
  });

  test("idempotent and rebuildable: a second refresh changes nothing; a new file from the chain is the same", async () => {
    const chain = new Chain();
    const late = wallet(30);
    chain.link(R, F);
    const c = new Campaign(chain, 1);
    c.join(R, "yes", 3n * SOL);
    c.join(late, "yes", SOL);
    chain.link(late, F);
    c.join(D, "no", 4n * SOL);
    c.finalize("yes");
    c.settle();
    chain.link(wallet(31), R);
    const open = new Campaign(chain, 2);
    open.join(R, "no", SOL);
    const x = await indexed(chain);
    const before = dump(x.store);
    expect(before.referrals.length).toBe(3);
    expect(before.referral_entries.length).toBe(2);
    await x.refresh();
    expect(dump(x.store)).toEqual(before);
    const rebuilt = await rebuild(x.rpc, ":memory:", { readLive: noLive });
    expect(rebuilt.complete).toBe(true);
    expect(dump(rebuilt.store)).toEqual(before);
    rebuilt.store.close();
  });
});
