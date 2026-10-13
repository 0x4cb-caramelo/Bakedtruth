/**
 * Purpose: the referral basis over hand-built event streams, through the real ingest and a scripted RPC (Sprint 14,
 *          lane L14R; TP §3.4.11, §3.4.16), no cluster: a winning entry earns `(fee − from_fee) × entry ÷ V` once it
 *          is paid and the fee collected, and the referrer 20% of it; a link in the first entry's slot or after it
 *          earns nothing; the 90 days end at the first entry's time plus 90 days; a one-sided pot's 1%, a void and a
 *          late join (refunded whole) earn nothing; a payout, a V or a fee that is not the snapshot's is held, a fee
 *          not yet collected waits, a gap holds. Filter: `bun test services/indexer -t referral`.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { describe, expect, test } from "bun:test";

import { Campaign } from "./referral-campaign";
import { Chain, DAY, indexed, SOL, wallet } from "./referral-chain";

const [R, F, B, D] = [wallet(1), wallet(2), wallet(3), wallet(4)];

/** A two-sided pot the referee wins: R on YES with `mine`, B on YES with `other`, D on NO with `losing`. */
function won(chain: Chain, n: number, referee: string, mine: bigint, other: bigint, losing: bigint) {
  const c = new Campaign(chain, n);
  c.join(referee as never, "yes", mine);
  if (other > 0n) c.join(B, "yes", other);
  c.join(D, "no", losing);
  return c;
}

describe("referral basis", () => {
  test("a winning entry earns (fee − from_fee) × entry ÷ V once paid and collected; the referrer gets 20%", async () => {
    const chain = new Chain();
    chain.link(R, F);
    const c = won(chain, 1, R, 2n * SOL, SOL, 3n * SOL);
    c.finalize("yes");
    const x = await indexed(chain);
    expect(x.referral(R)).toMatchObject({ referrer: F, status: "active", basis: "0", referrer_share: "0" });
    expect(x.entries(R)).toMatchObject([{ state: "unsettled", counted: String(2n * SOL), basis: "0" }]);
    c.settle();
    await x.refresh();
    const s = c.snapshot;
    // P = 3 SOL, fee 0.3 SOL, V = 3 SOL: the referee's 2 SOL carry two thirds of what Brot kept.
    expect([s.feeTotal, s.creatorShareFromFee, s.winningTotal]).toEqual([300_000_000n, 0n, 3n * SOL]);
    expect(x.entries(R)).toMatchObject([
      { state: "payable", reason: null, settle_mode: "Split", basis: "200000000", referrer_share: "40000000" },
    ]);
    expect(x.entries(R)[0]).toMatchObject({ winning_total: String(3n * SOL), fee_total: "300000000", from_fee: "0" });
    expect(x.referral(R)).toMatchObject({ basis: "200000000", referrer_share: "40000000", held: 0 });
    expect(x.referral(B)).toBeNull();
  });

  test("from_fee comes off the basis (a hand-made snapshot: the viability rule keeps it zero in every split)", async () => {
    const chain = new Chain();
    chain.link(R, F);
    const c = won(chain, 1, R, 2n * SOL, SOL, 3n * SOL);
    c.finalize("yes", { edit: (e) => void (e.name === "CampaignFinalized" && (e.data.fromFee = 100_000_000n)) });
    c.settle({
      edit: (e) => void (e.name === "FeeCollected" && (e.data.amount = (e.data.amount as bigint) - 100_000_000n)),
    });
    const x = await indexed(chain);
    // (0.3 − 0.1) SOL × 2 ÷ 3, rounded down.
    expect(x.entries(R)).toMatchObject([{ state: "payable", basis: "133333333", referrer_share: "26666666" }]);
  });

  test("a link in the first entry's slot or after it earns nothing; one before it does; a second link is ignored", async () => {
    const chain = new Chain();
    const [R1, R2, R3, R4] = [wallet(11), wallet(12), wallet(13), wallet(14)];
    chain.link(R3, F);
    const c = new Campaign(chain, 1);
    const first = c.join(R1, "yes", SOL);
    chain.link(R1, F, { slot: first.slot, time: first.time });
    c.join(R2, "yes", SOL);
    chain.link(R2, F);
    c.join(R3, "yes", SOL);
    chain.link(R3, wallet(99));
    c.join(D, "no", 3n * SOL);
    c.finalize("yes");
    c.settle();
    const x = await indexed(chain);
    expect(x.referral(R1)).toMatchObject({ status: "late", first_entry_slot: first.slot, linked_slot: first.slot });
    expect(x.referral(R1)).toMatchObject({ basis: "0", referrer_share: "0", rebate: "0" });
    expect(x.entries(R1)).toEqual([]);
    expect(x.referral(R2)).toMatchObject({ status: "late", basis: "0" });
    expect(x.referral(R3)).toMatchObject({ status: "active", referrer: F, basis: "100000000" });
    chain.link(R4, F);
    await x.refresh();
    expect(x.referral(R4)).toMatchObject({ status: "awaiting_entry", first_entry_slot: null, entered: "0" });
  });

  test("the 90 days: a join before the window's end counts, one at the end does not", async () => {
    const chain = new Chain();
    chain.link(R, F);
    const t0 = chain.time + 1_000;
    const times = [t0, t0 + 90 * DAY - 1, t0 + 90 * DAY];
    times.forEach((time, n) => {
      const c = new Campaign(chain, n + 1);
      c.join(R, "yes", SOL, { time });
      c.join(D, "no", 2n * SOL);
      c.finalize("yes");
      c.settle();
    });
    const x = await indexed(chain);
    expect(x.referral(R)).toMatchObject({ first_entry_time: t0, window_ends_at: t0 + 90 * DAY });
    // Each pot: R alone on YES with 1 SOL against 2 SOL, a fee of 0.2 SOL, all of it on R's entry.
    expect(x.entries(R).map((e) => [e.state, e.counted, e.basis])).toEqual([
      ["payable", String(SOL), "200000000"],
      ["payable", String(SOL), "200000000"],
      ["payable", "0", "0"],
    ]);
    expect(x.referral(R)).toMatchObject({ basis: "400000000", referrer_share: "80000000" });
  });

  test("a one-sided pot's 1%, a void and a late join earn nothing", async () => {
    const chain = new Chain();
    chain.link(R, F);
    const one = new Campaign(chain, 1);
    one.join(B, "yes", SOL);
    one.join(R, "yes", 3n * SOL);
    one.finalize("yes");
    one.settle();
    const voided = won(chain, 2, R, SOL, 0n, 2n * SOL);
    voided.finalize("void");
    voided.settle();
    const late = won(chain, 3, R, SOL, SOL, 2n * SOL);
    late.join(R, "yes", SOL / 2n, { late: true });
    late.finalize("yes");
    late.settle();
    const x = await indexed(chain);
    const paid = x.store.db.query("SELECT paid FROM settlements WHERE recipient = ? AND campaign = ?");
    expect(paid.get(R, one.address)).toEqual({ paid: "2970000000" }); // the 1% was charged
    const [e1, e2, e3] = x.entries(R);
    expect(e1).toMatchObject({ settle_mode: "OneSided", state: "no_fee", basis: "0", rebate_basis: "0" });
    expect(e2).toMatchObject({ settle_mode: "Refund", state: "no_fee", basis: "0" });
    // V = 2 SOL early, fee 0.2 SOL: only R's early 1 SOL counts; its late 0.5 SOL came back whole.
    expect(e3).toMatchObject({ state: "payable", entered: "1500000000", counted: String(SOL), basis: "100000000" });
    expect(x.referral(R)).toMatchObject({ entered: "5500000000", basis: "100000000", referrer_share: "20000000" });
  });

  test("checked against the campaign: a payout, V or fee not the snapshot's is held; no fee waits; a gap holds", async () => {
    const chain = new Chain();
    const refs = [21, 22, 23, 24, 25].map(wallet);
    refs.forEach((r) => chain.link(r, F));
    const add = (e: { name: string; data: Record<string, unknown> }, name: string, field: string, by: bigint) =>
      void (e.name === name && (e.data[field] = (e.data[field] as bigint) + by));
    const payout = won(chain, 1, refs[0], SOL, 0n, 2n * SOL);
    payout.finalize("yes");
    payout.settle({ edit: (e) => add(e, "EntrySettled", "amount", e.data.baker === refs[0] ? 1n : 0n) });
    const v = won(chain, 2, refs[1], SOL, 0n, 2n * SOL);
    v.finalize("yes", { edit: (e) => add(e, "CampaignFinalized", "winningTotal", 1n) });
    v.settle();
    const fee = won(chain, 3, refs[2], SOL, 0n, 2n * SOL);
    fee.finalize("yes");
    fee.settle({ edit: (e) => add(e, "FeeCollected", "amount", -1n) });
    const waiting = won(chain, 4, refs[3], SOL, 0n, 2n * SOL);
    waiting.finalize("yes");
    waiting.settle({ noFee: true });
    const gap = new Campaign(chain, 5);
    gap.join(refs[4], "yes", SOL);
    gap.skip();
    gap.join(D, "no", 2n * SOL);
    gap.finalize("yes");
    gap.settle();
    const x = await indexed(chain);
    expect(refs.map((r) => [x.entries(r)[0].state, x.entries(r)[0].reason, x.referral(r).held])).toEqual([
      ["held", "the payout is not the snapshot's", 1],
      ["held", "the early winning entries do not add up to the snapshot's V", 1],
      ["held", "the fee collected is not fee − from_fee", 1],
      ["unsettled", null, 0],
      ["held", "a gap in the campaign's events", 1],
    ]);
    for (const r of refs) expect(x.referral(r)).toMatchObject({ basis: "0", referrer_share: "0" });
  });
});
