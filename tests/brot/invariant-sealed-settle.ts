/**
 * Purpose: the randomized test's `settle_sealed_fee` (Sprint 15; TP sections 3.4.7, 3.4.12): any wallet settles a
 *          sponsor's held fee once the campaign is finalized; the fee goes back to the sponsor on a void the house
 *          caused and to the fee vault otherwise (P-4), the rent goes back to the sponsor, what was sent by hand goes
 *          to the fee vault, and the account closes. Never paused (I10′). Its draw names a live fee most of the time,
 *          and sometimes another wallet in the sponsor's slot (the refund and the rent go nowhere else).
 * Version: 0.1.0 (with Sprint 14 in one branch: the event and its seq through invariant-run.ts, labels in the trace)
 * Sprint:  15 (the lead's harness, lane INV15)
 */
import type { BrotErrorName } from "./errors";
import { settleSealedFeeIx } from "./instructions-14-15";
import { expectFields, sealedAt, type Harness, type Plan, type Rng } from "./invariant-harness";
import { HOUSE_REASONS } from "./invariant-model";
import { liveSealed, sealedOf, type SealedSettleOp } from "./invariant-sealed-model";

/**
 * settle_sealed_fee.rs, in order: a SealedFee the System Program owns with no data was closed by an earlier call, or
 * never created (`AlreadySettled`); the stored sponsor (`WrongSponsor`); then the campaign finalized (`NotFinalized`).
 */
export async function planSealedSettle(h: Harness, op: SealedSettleOp): Promise<Plan> {
  const c = h.camps[op.c];
  const sponsor = h.bakers[op.sponsor].address;
  const thief = op.thief === null ? null : h.bakers[op.thief].address;
  const { campaign } = h.addrs[op.c];
  const address = await sealedAt(h, campaign, sponsor);
  const s = sealedOf(c).get(sponsor);
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
  return {
    ixs: [settleSealedFeeIx(address, campaign, thief ?? sponsor, h.feeVault)],
    error,
    deltas,
    label: `sealedSettle-${refunded ? "refunded" : "kept"}`,
    // One SealedFeeSettled; invariant-run.ts checks its seq follows the campaign's (X0.4).
    events: ["SealedFeeSettled"],
    verify: ([e]) =>
      expectFields(e, {
        campaign: [campaign],
        sponsor: [sponsor],
        fee_lamports: [fee, "feeLamports"],
        refunded: [refunded ? 1 : 0],
      }),
    apply: () => {
      if (!s) return;
      c.seq += 1n;
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
