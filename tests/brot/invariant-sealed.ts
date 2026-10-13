/**
 * Purpose: the randomized test's sealed entry (Sprint 15; TP section 3.4.12) and SOL sent by hand to a SealedFee, each
 *          with its expected refusal and balance changes, and their draws. A sealed entry is a join on the sponsor's
 *          Entry (the first-baker rule applies) whose 10% is held in the sponsor's SealedFee, never in the vault. The
 *          refusals follow the program's order: sponsor_join_campaign.rs, join_core.rs, then sealed_charge.rs.
 * Version: 0.0.1
 * Sprint:  15 (the lead's harness, lane INV15)
 */
import type { BrotErrorName } from "./errors";
import { sponsorJoinCampaignIx } from "./instructions-14-15";
import { clock, refreshBase, refreshSol, type Harness, type Plan, type Rng } from "./invariant-harness";
import { sumOf } from "./invariant-model";
import {
  blankSealed,
  CONF_BPS,
  eventSeq,
  expectFields,
  FLOOR_USD,
  liveSealed,
  sealedAt,
  sealedPrice,
  type HandSealedOp,
  type SealedOp,
  type SealedQuirk,
} from "./invariant-sealed-model";
import { systemTransferIx } from "./join-campaign-support";
import * as P from "./program";
import { balance, setPriceAccount, type Sent } from "./setup";

/** The program's refusal of a sealed entry, in its order: the join's rules, the pause before the price (I10′), the charge. */
function refusal(h: Harness, op: SealedOp, t: bigint, paid: bigint, max: bigint): BrotErrorName | undefined {
  const c = h.camps[op.c];
  if (c.phase !== "Open") return "CampaignNotOpen";
  if (t >= c.entriesCloseAt) return "EntriesClosed";
  if (h.paused) return "JoinWhilePaused";
  if (op.usd < FLOOR_USD) return "SealedEntryBelowFloor";
  if (op.quirk === "stale") return "SolUsdStale";
  if (op.quirk === "wide") return "SolUsdConfidenceTooWide";
  if (paid > max) return "SealedEntryAboveMaxLamports";
  // The campaign's minimum cannot refuse a US$500 entry part; the signed entry total is checked at the Entry.
  return op.quirk === "total" ? "EntryTotalMismatch" : undefined;
}

export async function planSealed(h: Harness, op: SealedOp): Promise<Plan> {
  const c = h.camps[op.c];
  const sponsor = h.bakers[op.sponsor];
  const { campaign, vault } = h.addrs[op.c];
  const t = clock(h);
  const mine = c.joins.filter((j) => j.baker === sponsor.address);
  const address = await sealedAt(campaign, sponsor.address);
  const before = c.sealed.get(sponsor.address);
  const { charged, paid, entry, fee } = sealedPrice(op.usd, op.price, op.conf);
  const max = op.quirk === "under" ? paid - 1n : op.quirk === "exact" ? paid : 100n * P.SOL;
  // The SealedFee is created on the sponsor's first sealed entry, topped up to its rent when funded in advance.
  const create = before?.state !== "live";
  const funded = before?.lamports ?? 0n;
  const rentPaid = create && funded < h.rent.sealed ? h.rent.sealed - funded : 0n;
  const spent = paid + (mine.length === 0 ? h.rent.entry : 0n) + h.rent.join + rentPaid;
  // A sponsor that cannot pay waits (no transaction), as an opening does: no refusal the model does not name.
  if (balance(h.w, sponsor.address) < spent + P.SOL) {
    return { ixs: [], deltas: new Map(), tag: "skipped", apply: () => undefined };
  }
  refreshBase(h.w);
  const publish = op.quirk === "stale" ? t - 121n : t - 5n;
  setPriceAccount(h.w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", {
    price: op.price,
    conf: op.conf,
    publishTime: publish,
  });
  const error = refusal(h, op, t, paid, max);
  const ix = await sponsorJoinCampaignIx(sponsor, campaign, P.BTC_USD_ACCOUNT, {
    side: op.side,
    entryUsd: op.usd,
    maxLamports: max,
    expectedEntryTotal: sumOf(mine) + (op.quirk === "total" ? 1n : 0n),
    joinIndex: mine.length,
  });
  const seq = error === undefined ? eventSeq(h, campaign) : 0n;
  const first = (c.joins[0]?.baker ?? sponsor.address) === sponsor.address;
  // EntryAdded as any join, then SealedFeeHeld, with contiguous seqs (TP 3.4.14).
  const check = (sent: Extract<Sent, { ok: true }>) => {
    const names = sent.events.map((e) => e.name).join(" ");
    if (names !== "EntryAdded SealedFeeHeld") throw new Error(`sealed: the events are ${names}`);
    const [added, held] = sent.events.map((e) => e.data);
    expectFields("sealed", [
      ["EntryAdded.seq", added.seq, seq],
      ["EntryAdded.baker", added.baker, sponsor.address],
      ["EntryAdded.amount", added.amount, entry],
      ["EntryAdded.side", added.side, op.side],
      ["EntryAdded.is_first", added.is_first, first],
      ["SealedFeeHeld.seq", held.seq, seq + 1n],
      ["SealedFeeHeld.campaign", held.campaign, campaign],
      ["SealedFeeHeld.sponsor", held.sponsor, sponsor.address],
      ["SealedFeeHeld.entry_usd", held.entry_usd, op.usd],
      ["SealedFeeHeld.paid", held.paid, paid],
      ["SealedFeeHeld.entry_lamports", held.entry_lamports, entry],
      ["SealedFeeHeld.fee_lamports", held.fee_lamports, fee],
      ["SealedFeeHeld.fee_total", held.fee_total, (before?.fee ?? 0n) + fee],
      ["SealedFeeHeld.price", held.price, charged],
      ["SealedFeeHeld.exponent", held.exponent, -8],
      ["SealedFeeHeld.publish_time", held.publish_time, publish],
      ["Campaign.event_seq", eventSeq(h, campaign), seq + 2n],
    ]);
  };
  return {
    ixs: [ix],
    error,
    // The vault gains the entry part only; the SealedFee the fee (and its rent); the fee vault nothing (I1, I15).
    deltas: new Map<string, bigint>([
      [vault, entry],
      [sponsor.address, -spent],
      [address, fee + rentPaid],
      [h.feeVault, 0n],
    ]),
    after: () => refreshSol(h.w),
    check,
    apply: () => {
      c.joins.push({ baker: sponsor.address, side: op.side, amount: entry, at: t, sealed: true });
      const s = before ?? blankSealed(address, campaign, sponsor.address);
      s.lamports += (create ? rentPaid : 0n) + fee;
      s.state = "live";
      s.fee += fee;
      s.entry += entry;
      s.usd += op.usd;
      s.count += 1;
      c.sealed.set(sponsor.address, s);
    },
  };
}

/** SOL sent by hand to a SealedFee's address: swept to the fee vault at settlement, or part of the rent at creation. */
export async function planHandSealed(h: Harness, op: HandSealedOp): Promise<Plan> {
  const c = h.camps[op.c];
  const sponsor = h.bakers[op.sponsor].address;
  const { campaign } = h.addrs[op.c];
  const address = await sealedAt(campaign, sponsor);
  const s = c.sealed.get(sponsor);
  // An empty address takes no less than a data-less account's rent: the runtime refuses a smaller transfer.
  const amount = (s?.lamports ?? 0n) === 0n && op.amount < h.rent.wallet ? op.amount + h.rent.wallet : op.amount;
  return {
    ixs: [systemTransferIx(h.bank, address, amount)],
    deltas: new Map<string, bigint>([
      [address, amount],
      [h.bank.address, -amount],
    ]),
    tag: s?.state ?? "funded",
    apply: () => {
      const model = s ?? blankSealed(address, campaign, sponsor);
      model.lamports += amount;
      c.sealed.set(sponsor, model);
    },
  };
}

const QUIRKS: [number, SealedQuirk][] = [
  [0.08, "stale"],
  [0.15, "wide"],
  [0.25, "under"],
  [0.3, "exact"],
  [0.38, "total"],
];

/** A sealed entry: most go to a campaign still taking entries; a third carry a quirk the program refuses. */
export function drawSealed(h: Harness, r: Rng, open: number[]): SealedOp | null {
  const t = clock(h);
  const taking = open.filter((i) => h.camps[i].phase === "Open" && t < h.camps[i].entriesCloseAt);
  const pool = taking.length > 0 && r.next() < 0.85 ? taking : open;
  if (pool.length === 0) return null;
  const price = r.big(80n * 10n ** 8n, 300n * 10n ** 8n);
  const tight = (price * CONF_BPS) / 10_000n;
  const roll = r.next();
  const quirk = QUIRKS.find(([below]) => roll < below)?.[1] ?? "none";
  return {
    k: "sealed",
    c: r.pick(pool),
    sponsor: r.int(0, h.bakers.length - 1),
    side: r.next() < 0.5 ? 0 : 1,
    usd: r.next() < 0.1 ? r.pick([0n, 1n, 499n]) : r.big(500n, 1_500n),
    price,
    conf: quirk === "wide" ? tight + 1n : r.big(0n, tight),
    quirk,
  };
}

/** SOL by hand to a SealedFee: most to a live one; the rest to a sponsor's address before (or after) its account. */
export function drawHandSealed(h: Harness, r: Rng, open: number[]): HandSealedOp {
  const holding = open.filter((i) => liveSealed(h.camps[i]).length > 0);
  const c = holding.length > 0 && r.next() < 0.6 ? r.pick(holding) : r.pick(open);
  const live = liveSealed(h.camps[c]).map((s) => h.bakers.findIndex((b) => b.address === s.sponsor));
  const sponsor = live.length > 0 && r.next() < 0.6 ? r.pick(live) : r.int(0, h.bakers.length - 1);
  // Small amounts too, so that a creation funded below its rent is topped up by the sponsor.
  const amount = r.next() < 0.5 ? r.big(1n, h.rent.sealed) : r.big(1n, 500_000_000n);
  return { k: "handSealed", c, sponsor, amount };
}
