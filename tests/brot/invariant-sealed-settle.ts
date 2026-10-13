/**
 * Purpose: the randomized test's `settle_sealed_fee` (Sprint 15; TP sections 3.4.7, 3.4.12): any wallet settles a
 *          sponsor's held fee once the campaign is finalized; the fee goes back to the sponsor on a void the house
 *          caused and to the fee vault otherwise (P-4), the rent goes back to the sponsor, what was sent by hand goes
 *          to the fee vault, and the account closes. Never paused (I10′). Its draw names a live fee most of the time,
 *          and sometimes another wallet in the sponsor's slot (the refund and the rent go nowhere else).
 * Version: 0.0.1
 * Sprint:  15 (the lead's harness, lane INV15)
 */
import type { BrotErrorName } from "./errors";
import { settleSealedFeeIx } from "./instructions-14-15";
import { type Harness, type Plan, type Rng } from "./invariant-harness";
import { HOUSE_REASONS } from "./invariant-model";
import { eventSeq, expectFields, liveSealed, sealedAt, type SealedSettleOp } from "./invariant-sealed-model";
import type { Sent } from "./setup";

/**
 * settle_sealed_fee.rs, in order: a SealedFee the System Program owns with no data was closed by an earlier call, or
 * never created (`AlreadySettled`); the stored sponsor (`WrongSponsor`); then the campaign finalized (`NotFinalized`).
 */
export async function planSealedSettle(h: Harness, op: SealedSettleOp): Promise<Plan> {
  const c = h.camps[op.c];
  const sponsor = h.bakers[op.sponsor].address;
  const thief = op.thief === null ? null : h.bakers[op.thief].address;
  const { campaign } = h.addrs[op.c];
  const address = await sealedAt(campaign, sponsor);
  const s = c.sealed.get(sponsor);
  const live = s?.state === "live";
  const finalized = c.snapshot !== null && (c.phase === "Settling" || c.phase === "Settled");
  const error: BrotErrorName | undefined = !live
    ? "AlreadySettled"
    : thief !== null
      ? "WrongSponsor"
      : !finalized
        ? "NotFinalized"
        : undefined;
  const lamports = live ? s.lamports : 0n;
  const fee = live ? s.fee : 0n;
  // The fee follows the cause (P-4): back to the sponsor only on a void the house caused.
  const refunded = c.snapshot?.mode === "Refund" && HOUSE_REASONS.has(c.voidReason);
  const rest = lamports - fee;
  const rent = rest < h.rent.sealed ? rest : h.rent.sealed;
  const surplus = rest - rent;
  const toSponsor = rent + (refunded ? fee : 0n);
  const toFeeVault = surplus + (refunded ? 0n : fee);
  const deltas = new Map<string, bigint>([
    [address, -lamports],
    [sponsor, toSponsor],
    [h.feeVault, toFeeVault],
  ]);
  if (thief !== null) deltas.set(thief, 0n);
  const seq = error === undefined ? eventSeq(h, campaign) : 0n;
  const check = (sent: Extract<Sent, { ok: true }>) => {
    const names = sent.events.map((e) => e.name).join(" ");
    if (names !== "SealedFeeSettled") throw new Error(`sealedSettle: the events are ${names}`);
    const [settled] = sent.events.map((e) => e.data);
    expectFields("sealedSettle", [
      ["SealedFeeSettled.seq", settled.seq, seq],
      ["SealedFeeSettled.campaign", settled.campaign, campaign],
      ["SealedFeeSettled.sponsor", settled.sponsor, sponsor],
      ["SealedFeeSettled.fee_lamports", settled.fee_lamports, fee],
      ["SealedFeeSettled.refunded", settled.refunded, refunded],
      ["Campaign.event_seq", eventSeq(h, campaign), seq + 1n],
    ]);
  };
  return {
    ixs: [settleSealedFeeIx(address, campaign, thief ?? sponsor, h.feeVault)],
    error,
    deltas,
    check,
    tag: `${refunded ? "refunded" : "kept"}${h.paused ? " paused" : ""}`,
    apply: () => {
      if (!s) return;
      s.state = "settled";
      s.lamports = 0n;
      s.paid.push(
        { part: "fee", to: refunded ? sponsor : "fee", amount: fee },
        { part: "rent", to: sponsor, amount: rent },
        { part: "surplus", to: "fee", amount: surplus },
      );
      h.feeVaultModel += toFeeVault;
    },
  };
}

/** A settlement of a held fee: most name a sponsor whose fee is live; a fifth put another wallet in the sponsor's slot. */
export function drawSealedSettle(h: Harness, r: Rng, index: number): SealedSettleOp {
  const live = liveSealed(h.camps[index]).map((s) => h.bakers.findIndex((b) => b.address === s.sponsor));
  const sponsor = live.length > 0 && r.next() < 0.85 ? r.pick(live) : r.int(0, h.bakers.length - 1);
  const thief = r.next() < 0.2 ? (sponsor + r.int(1, h.bakers.length - 1)) % h.bakers.length : null;
  return { k: "sealedSettle", c: index, sponsor, thief };
}
