/**
 * Purpose: the money invariants with the sealed entry (Sprint 15; TP 3.4.13, the sponsor fee in the bookkeeping), per
 *          campaign, from the model and the chain. The vault never holds a fee: invariant-checks.ts's I1 and I15 count
 *          only entry parts. Here: each SealedFee holds its rent, its bookkept fee and SOL sent by hand, and its books
 *          are the sponsor's sealed entries (I1, I15, I2); `sealed_fees_open` counts the live ones and none is live
 *          once the campaign is closed (I6); each settled fee went where the cause sends it (I5), only to its sponsor
 *          or the fee vault, once (I8); in a split the creator share's base is the entry parts, never a fee (I12).
 * Version: 0.1.0 (with Sprint 14 in one branch: the chain view from invariant-view.ts, the SealedFees beside the
 *          campaign's model)
 * Sprint:  15 (the lead's harness, lane INV15)
 */
import type { Harness } from "./invariant-harness";
import { HOUSE_REASONS, sumOf, type ModelCampaign } from "./invariant-model";
import { liveSealed, sealedOf } from "./invariant-sealed-model";
import type { ChainView } from "./invariant-view";
import { decode } from "./layouts";
import * as P from "./program";
import { balance } from "./setup";
import { SEALED_FEE } from "./structs-14-15";

type Check = (c: ModelCampaign, v: ChainView, h: Harness) => string | null;

/** I1 and I15 for each SealedFee, with I2 for its books: the model's lamports, at least rent + fee, the sums stored. */
const sealedBooks: Check = (c, _v, h) => {
  for (const s of sealedOf(c).values()) {
    const held = balance(h.w, s.address);
    if (held !== s.lamports) return `SealedFee of ${s.sponsor} holds ${held}, the model ${s.lamports}`;
    const account = h.w.client.svm.getAccount(s.address);
    const ours = account.exists && account.programAddress === P.PROGRAM_ID;
    if (s.state !== "live") {
      if (ours) return `SealedFee of ${s.sponsor} is ${s.state} but the program still owns it`;
      continue;
    }
    if (!ours) return `the live SealedFee of ${s.sponsor} is not the program's`;
    if (held < h.rent.sealed + s.fee) return `SealedFee of ${s.sponsor} holds ${held}, below its rent and fee`;
    const d = decode(SEALED_FEE, account.data);
    const want = [6, s.campaign, s.sponsor, s.fee, s.entry, s.usd, s.count];
    const have = [d.tag, d.campaign, d.sponsor, d.fee_lamports, d.entry_lamports, d.usd_total, d.sealed_count];
    if (have.some((x, i) => x !== want[i])) return `SealedFee of ${s.sponsor} stores ${have}, the model ${want}`;
    const parts = sumOf(c.joins.filter((j) => j.sealed && j.baker === s.sponsor));
    if (parts !== s.entry) return `SealedFee of ${s.sponsor} books ${s.entry} of entries, its sealed joins ${parts}`;
  }
  return null;
};

/** I6: the campaign counts its live SealedFees, and close never leaves one behind. */
const sealedOpen: Check = (c, v) => {
  const live = liveSealed(c).length;
  if (c.closed) return live === 0 ? null : `closed with ${live} SealedFees still live`;
  if (!v.campaign) return null;
  const open = Number(v.campaign.sealed_fees_open);
  return open === live ? null : `sealed_fees_open is ${open}, the model has ${live} live`;
};

/** I5 and I8: a settled fee went to its sponsor on a house failure and to the fee vault otherwise, once; the rent to the
 * sponsor; SOL sent by hand to the fee vault. Nobody else is paid from a SealedFee. */
const sealedPaid: Check = (c) => {
  const refund = c.snapshot?.mode === "Refund" && HOUSE_REASONS.has(c.voidReason);
  for (const s of sealedOf(c).values()) {
    if (s.state !== "settled") {
      if (s.paid.length > 0) return `SealedFee of ${s.sponsor} paid out before it was settled`;
      continue;
    }
    const fees = s.paid.filter((p) => p.part === "fee");
    if (fees.length !== 1 || s.paid.length !== 3) return `SealedFee of ${s.sponsor} settled ${fees.length} times`;
    if (fees[0].amount !== s.fee) return `SealedFee of ${s.sponsor} paid a fee of ${fees[0].amount}, it held ${s.fee}`;
    for (const p of s.paid) {
      const to = p.part === "rent" || (p.part === "fee" && refund) ? s.sponsor : "fee";
      if (p.to !== to) return `the ${p.part} of ${s.sponsor}'s SealedFee went to ${p.to}, not ${to}`;
    }
  }
  return null;
};

/** I12: in a split, V and P are the entries' parts, and the creator share is the model's on them (a fee never counts). */
const shareBase: Check = (c, v) => {
  const s = c.snapshot;
  if (!s || s.mode !== "Split" || !v.campaign) return null;
  const chain = [v.campaign.winning_total, v.campaign.losing_total, v.campaign.creator_share];
  const model = [s.winning, s.losing, s.fromPot + s.fromFee];
  if (chain.some((x, i) => x !== model[i]))
    return `chain V, P and share ${chain.join("/")}, the model ${model.join("/")}`;
  const fromFee = v.campaign.creator_share_from_fee;
  return fromFee === s.fromFee ? null : `chain share from the fee ${fromFee}, the model ${s.fromFee}`;
};

export const SEALED_CHECKS: [string, Check][] = [
  ["1/15 SealedFee", sealedBooks],
  ["6 SealedFee", sealedOpen],
  ["5/8 SealedFee", sealedPaid],
  ["12 base", shareBase],
];
