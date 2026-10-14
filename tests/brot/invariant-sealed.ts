/**
 * Purpose: the randomized test's sealed entry (Sprint 15; TP section 3.4.12) and SOL sent by hand to a SealedFee, each
 *          with its expected refusal and balance changes, and their draws. A sealed entry is a join on the sponsor's
 *          Entry (the first-baker rule applies) whose 10% is held in the sponsor's SealedFee, never in the vault. The
 *          refusals follow the program's order: sponsor_join_campaign.rs, join_core.rs, then sealed_charge.rs. The
 *          floor, the split, the SOL/USD bounds and the signed version are the config's at planning time.
 * Version: 0.1.0 (with Sprint 14 in one branch: the events and their seq through invariant-run.ts, the Join's
 *          address kept for the tally, labels in the trace)
 * Sprint:  15 (the lead's harness, lane INV15; the creation rules' version signed, red team L2 of lane L15)
 */
import { readConfig } from "./flows";
import { sponsorJoinCampaignIx } from "./instructions-14-15";
import {
  clock,
  expectFields,
  refreshBase,
  refreshSol,
  sealedAt,
  type Harness,
  type Plan,
  type Rng,
} from "./invariant-harness";
import { sumOf } from "./invariant-model";
import {
  blankSealed,
  liveSealed,
  sealedOf,
  sealedPrice,
  sealedRefusal,
  sealedTerms,
  type HandSealedOp,
  type SealedOp,
  type SealedQuirk,
} from "./invariant-sealed-model";
import { systemTransferIx } from "./join-campaign-support";
import * as P from "./program";
import { balance, setPriceAccount } from "./setup";

export async function planSealed(h: Harness, op: SealedOp): Promise<Plan> {
  const c = h.camps[op.c];
  const sponsor = h.bakers[op.sponsor];
  const { campaign, vault } = h.addrs[op.c];
  const t = clock(h);
  const mine = c.joins.filter((j) => j.baker === sponsor.address);
  const address = await sealedAt(h, campaign, sponsor.address);
  const before = sealedOf(c).get(sponsor.address);
  const terms = sealedTerms(await readConfig(h.w));
  const bound = (op.price * terms.confBps) / 10_000n;
  const conf = op.quirk === "wide" ? bound + 1n : (bound * op.confShare) / 1_000n;
  const { charged, paid, entry, fee } = sealedPrice(op.usd, op.price, conf, terms.prizeBps);
  const max = op.quirk === "under" ? paid - 1n : op.quirk === "exact" ? paid : 100n * P.SOL;
  // The SealedFee is created on the sponsor's first sealed entry, topped up to its rent when funded in advance.
  const create = before?.state !== "live";
  const funded = before?.lamports ?? 0n;
  const rentPaid = create && funded < h.rent.sealed ? h.rent.sealed - funded : 0n;
  const spent = paid + (mine.length === 0 ? h.rent.entry : 0n) + h.rent.join + rentPaid;
  // A sponsor that cannot pay waits (no transaction), as an opening does: no refusal the model does not name.
  if (balance(h.w, sponsor.address) < spent + P.SOL) {
    return { ixs: [], deltas: new Map(), label: "sealed-unfunded", apply: () => undefined };
  }
  refreshBase(h.w);
  const publish = op.quirk === "stale" ? t - terms.maxAge - 1n : t - 5n;
  setPriceAccount(h.w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", {
    price: op.price,
    conf,
    publishTime: publish,
  });
  const error = sealedRefusal(h, op, t, terms, paid, max);
  const ix = await sponsorJoinCampaignIx(sponsor, campaign, P.BTC_USD_ACCOUNT, {
    side: op.side,
    entryUsd: op.usd,
    maxLamports: max,
    expectedEntryTotal: sumOf(mine) + (op.quirk === "total" ? 1n : 0n),
    expectedParamsVersion: terms.version + (op.quirk === "version" ? 1 : 0),
    joinIndex: mine.length,
  });
  const join = await P.joinPda(campaign, sponsor.address, mine.length);
  const first = (c.joins[0]?.baker ?? sponsor.address) === sponsor.address;
  // Worked out now: invariant-run.ts applies the plan to the model before it verifies the events.
  const feeTotal = (before?.fee ?? 0n) + fee;
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
    // EntryAdded as any join, then SealedFeeHeld; invariant-run.ts checks their seqs follow the campaign's (X0.4).
    events: ["EntryAdded", "SealedFeeHeld"],
    verify: ([added, held]) => {
      expectFields(added, { baker: [sponsor.address], amount: [entry], side: [op.side], is_first: [first ? 1 : 0] });
      expectFields(held, {
        campaign: [campaign],
        sponsor: [sponsor.address],
        entry_usd: [op.usd, "entryUsd"],
        paid: [paid],
        entry_lamports: [entry, "entryLamports"],
        fee_lamports: [fee, "feeLamports"],
        fee_total: [feeTotal, "feeTotal"],
        price: [charged],
        exponent: [-8],
        publish_time: [publish, "publishTime"],
      });
    },
    apply: () => {
      c.seq += 2n;
      c.joins.push({ baker: sponsor.address, side: op.side, amount: entry, at: t, address: join, sealed: true });
      const s = before ?? blankSealed(address, campaign, sponsor.address);
      s.lamports += (create ? rentPaid : 0n) + fee;
      s.state = "live";
      s.fee += fee;
      s.entry += entry;
      s.usd += op.usd;
      s.count += 1;
      sealedOf(c).set(sponsor.address, s);
    },
  };
}

/** SOL sent by hand to a SealedFee's address: swept to the fee vault at settlement, or part of the rent at creation. */
export async function planHandSealed(h: Harness, op: HandSealedOp): Promise<Plan> {
  const c = h.camps[op.c];
  const sponsor = h.bakers[op.sponsor].address;
  const { campaign } = h.addrs[op.c];
  const address = await sealedAt(h, campaign, sponsor);
  const s = sealedOf(c).get(sponsor);
  // An empty address takes no less than a data-less account's rent: the runtime refuses a smaller transfer.
  const amount = (s?.lamports ?? 0n) === 0n && op.amount < h.rent.wallet ? op.amount + h.rent.wallet : op.amount;
  return {
    ixs: [systemTransferIx(h.bank, address, amount)],
    deltas: new Map<string, bigint>([
      [address, amount],
      [h.bank.address, -amount],
    ]),
    label: `handSealed-${s?.state ?? "funded"}`,
    apply: () => {
      const model = s ?? blankSealed(address, campaign, sponsor);
      model.lamports += amount;
      sealedOf(c).set(sponsor, model);
    },
  };
}

const QUIRKS: [number, SealedQuirk][] = [
  [0.08, "stale"],
  [0.15, "wide"],
  [0.25, "under"],
  [0.3, "exact"],
  [0.38, "total"],
  [0.46, "version"],
];

/** A sealed entry: most go to a campaign still taking entries; a third carry a quirk the program refuses. */
export function drawSealed(h: Harness, r: Rng, open: number[]): SealedOp | null {
  const t = clock(h);
  const taking = open.filter((i) => h.camps[i].phase === "Open" && t < h.camps[i].entriesCloseAt);
  const pool = taking.length > 0 && r.next() < 0.85 ? taking : open;
  if (pool.length === 0) return null;
  const price = r.big(80n * 10n ** 8n, 300n * 10n ** 8n);
  const roll = r.next();
  const quirk = QUIRKS.find(([below]) => roll < below)?.[1] ?? "none";
  return {
    k: "sealed",
    c: r.pick(pool),
    sponsor: r.int(0, h.bakers.length - 1),
    side: r.next() < 0.5 ? 0 : 1,
    usd: r.next() < 0.1 ? r.pick([0n, 1n, 499n]) : r.big(500n, 1_500n),
    price,
    confShare: r.big(0n, 1_000n),
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
