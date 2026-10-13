/**
 * Purpose: the money invariants I1 to I15 (TP section 3.4.13) as small functions of the model state and
 *          the chain state. The randomized test runs them after every operation; a violation names the
 *          invariant and the values that broke it.
 * Version: 0.1.0 (Sprint 14: the creator share's reserve in I6 and I13; the campaign's record, invariant-state.ts)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14)
 */
import { booked, earlyJoins, joinedTotal, type ModelCampaign, sideTotal, sumOf } from "./invariant-model";
import { shareDue, winnersOf } from "./invariant-payouts";
import { payoutOf } from "./money-model";
import type { Harness } from "./invariant-harness";
import type { ChainView } from "./invariant-view";
import { countOpen } from "./invariant-open";
import { stateCheck } from "./invariant-state";

type Check = (c: ModelCampaign, v: ChainView, h: Harness) => string | null;
const ledgerTo = (c: ModelCampaign, kind: string) => c.ledger.filter((l) => l.kind === kind);

/** I1: the vault holds rent, the bookkept balance and the SOL sent by hand, and nothing else. */
const i1: Check = (c, v, h) => {
  if (c.closed) return null;
  const want = booked(c) + c.handSent;
  const have = v.vault - h.rent.vault;
  return have === want ? null : `vault minus rent is ${have}, the books and hand-sent SOL give ${want}`;
};

/** I2: the pools are the sums of the joins; hand-sent SOL is never in them. */
const i2: Check = (c, v) => {
  if (!v.campaign) return null;
  const yes = sideTotal(c.joins, 0);
  const no = sideTotal(c.joins, 1);
  if (v.campaign.pool_yes !== yes || v.campaign.pool_no !== no) {
    return `pools ${v.campaign.pool_yes}/${v.campaign.pool_no}, the joins ${yes}/${no}`;
  }
  for (const baker of new Set(c.joins.map((j) => j.baker))) {
    if (c.settled.has(baker)) continue;
    const entry = v.entries.get(baker);
    const mine = c.joins.filter((j) => j.baker === baker);
    if (!entry) return `baker ${baker} has joins and no Entry`;
    if (entry.amount_yes !== sideTotal(mine, 0) || entry.amount_no !== sideTotal(mine, 1)) {
      return `Entry of ${baker} holds ${entry.amount_yes}/${entry.amount_no}`;
    }
  }
  return null;
};

/** I3′: in Split the fee, the creator share and the winners' pot add back to V + P + R. */
const i3: Check = (c, v) => {
  const s = c.snapshot;
  if (!s || s.mode !== "Split") return null;
  const left = s.fee - s.fromFee + (s.fromPot + s.fromFee) + s.distributable;
  if (left !== s.winning + s.losing + c.prize) return `Split books ${left}, V+P+R is ${s.winning + s.losing + c.prize}`;
  if (v.campaign && (v.campaign.distributable !== s.distributable || v.campaign.fee_total !== s.fee)) {
    return `chain snapshot ${v.campaign.distributable}/${v.campaign.fee_total}, model ${s.distributable}/${s.fee}`;
  }
  // The entry payments include each late join's refund, which is not in the distributable (it came out of V and P).
  const paid = ledgerTo(c, "entry").reduce((n, l) => n + l.amount, 0n) - s.late;
  return paid <= s.distributable ? null : `winners paid ${paid} above the distributable ${s.distributable}`;
};

/** I4: OneSided pays back the entries less the one-sided fees, and the first baker gets its entry whole. */
const i4: Check = (c) => {
  const s = c.snapshot;
  if (!s || s.mode !== "OneSided" || c.settled.size !== new Set(c.joins.map((j) => j.baker)).size) return null;
  const paid = ledgerTo(c, "entry").reduce((n, l) => n + l.amount, 0n);
  if (paid + s.oneSidedFees !== joinedTotal(c))
    return `OneSided pays ${paid} and keeps ${s.oneSidedFees}, entries ${joinedTotal(c)}`;
  const first = ledgerTo(c, "entry").find((l) => l.to === s.firstBaker);
  const whole = sumOf(c.joins.filter((j) => j.baker === s.firstBaker));
  return !first || first.amount === whole ? null : `first baker got ${first.amount}, its entry was ${whole}`;
};

/** I5: Refund gives each entry back exactly; the prize and the opening fee follow the cause (checked in the ledger). */
const i5: Check = (c) => {
  const s = c.snapshot;
  if (!s || s.mode !== "Refund" || c.settled.size !== new Set(c.joins.map((j) => j.baker)).size) return null;
  for (const baker of c.settled) {
    const paid = ledgerTo(c, "entry").find((l) => l.to === baker)?.amount ?? 0n;
    const whole = sumOf(c.joins.filter((j) => j.baker === baker));
    if (paid !== whole) return `${baker} got ${paid} back, its entries were ${whole}`;
  }
  return null;
};

/** I6: when everything is settled and paid out, the dust is below the winners' count; closed, nothing is left. */
const i6: Check = (c, v, h) => {
  if (c.closed) {
    if (v.campaign !== null || v.vault !== 0n) return "closed campaign still holds lamports or data";
    return v.feeVault === h.feeVaultModel ? null : `fee vault ${v.feeVault}, the model ${h.feeVaultModel}`;
  }
  if (c.phase !== "Settled" || !c.feeMoved || !c.prizeSettled || (shareDue(c) > 0n && !c.shareSettled)) return null;
  // A creator share held for a wallet that could not take it is not dust: close pays it to the rent payer.
  const dust = booked(c) - c.reserved;
  if (dust < 0n) return `dust ${dust} is negative`;
  if (c.snapshot?.mode !== "Split") return dust === 0n ? null : `dust ${dust} outside Split`;
  return dust < BigInt(Math.max(1, winnersOf(c))) ? null : `dust ${dust} not below ${winnersOf(c)} winners`;
};

/** I8: each Entry is paid once, to its baker, and the only other payees are the creator and the fee vault. */
const i8: Check = (c, v) => {
  for (const l of c.ledger) {
    if (l.kind === "entry" && !c.joins.some((j) => j.baker === l.to)) return `entry paid to a stranger ${l.to}`;
    if ((l.kind === "share" || l.kind === "prize") && l.to !== c.creator) return `${l.kind} paid to ${l.to}`;
  }
  for (const baker of c.settled) if (v.entries.has(baker)) return `${baker} settled but its Entry is open`;
  return ledgerTo(c, "entry").length === c.settled.size ? null : "an Entry paid twice";
};

/** I11: in Split every winning entry gets back at least what it put in (D-g), and the pot covers V. */
const i11: Check = (c) => {
  const s = c.snapshot;
  if (!s || s.mode !== "Split") return null;
  if (s.distributable < s.winning) return `distributable ${s.distributable} below V ${s.winning}`;
  const side = c.outcome === "Yes" ? 0 : 1;
  for (const baker of c.settled) {
    const early = sideTotal(
      earlyJoins(c).filter((j) => j.baker === baker),
      side,
    );
    if (early > 0n && payoutOf(early, s.distributable, s.winning) < early) return `${baker} got less than its entry`;
  }
  return null;
};

/** I12: no creator share in OneSided, Refund, or any campaign a team key opened. */
const i12: Check = (c, v) => {
  if (!c.snapshot || (c.snapshot.mode === "Split" && !c.team)) return null;
  if (shareDue(c) !== 0n) return "a share is due outside Split";
  return !v.campaign || v.campaign.creator_share === 0n ? null : `chain creator share ${v.campaign.creator_share}`;
};

/** I13: the share is paid at most once, only to the creator, and from_fee never exceeds the fee. */
const i13: Check = (c, v) => {
  if (ledgerTo(c, "share").length > 1) return "the creator share was paid twice";
  if (ledgerTo(c, "share").some((l) => l.to !== c.creator)) return "the share went to someone else";
  if (v.campaign && v.campaign.creator_share_from_fee > v.campaign.fee_total) return "from_fee above the fee";
  if (v.campaign && v.campaign.creator_share_settled !== c.shareSettled) return "creator_share_settled disagrees";
  if (c.reserved > shareDue(c)) return `reserved ${c.reserved} above the share ${shareDue(c)}`;
  return null;
};

/** I14: a paid opening moves prize + fee into the vault; a team opening moves nothing but its rent. */
const i14: Check = (c, v) => {
  if (!v.campaign) return null;
  const paid = v.campaign.opening_paid_lamports;
  if (c.team) return paid === 0n && v.campaign.prize_lamports === 0n ? null : `team opening paid ${paid}`;
  return paid === v.campaign.prize_lamports + v.campaign.opening_fee_lamports && paid === c.prize + c.openingFee
    ? null
    : `opening paid ${paid}, prize and fee ${c.prize + c.openingFee}`;
};

/** I15: the vault never holds less than its books; the surplus is SOL sent by hand (I1 says exactly how much). */
const i15: Check = (c, v, h) => {
  if (c.closed) return null;
  const surplus = v.vault - h.rent.vault - booked(c);
  return surplus >= 0n ? null : `vault short by ${-surplus} of its books`;
};

const CHECKS: [number, Check][] = [
  [1, i1],
  [2, i2],
  [3, i3],
  [4, i4],
  [5, i5],
  [6, i6],
  [8, i8],
  [11, i11],
  [12, i12],
  [13, i13],
  [14, i14],
  [15, i15],
];

/** Runs the per-campaign invariants; throws naming the first one that fails. */
export function checkCampaign(c: ModelCampaign, v: ChainView, h: Harness, label: string) {
  for (const [n, check] of CHECKS) {
    const failure = check(c, v, h);
    if (failure) throw new Error(`I${n} (${label}): ${failure}`);
  }
  // Sprint 14: the record itself, so a contest step that rewrote the result, or a seq out of step, fails the run.
  const state = stateCheck(c, v);
  if (state) throw new Error(`state (${label}): ${state}`);
}

/** I6, I7 and I10′, about the whole world: the fee vault's books, the valve's count of the open paid campaigns, the pause. */
export function checkWorld(h: Harness, config: Record<string, any>, feeVault: bigint) {
  // The fee vault holds exactly what the model moved into it (collect, close) and out of it (sweep).
  if (feeVault !== h.feeVaultModel) throw new Error(`I6: fee vault ${feeVault}, the model ${h.feeVaultModel}`);
  const open = countOpen(h);
  if (Number(config.open_campaigns) !== open) {
    throw new Error(`I7: open_campaigns is ${config.open_campaigns}, the model has ${open} open`);
  }
  if (open > h.max) throw new Error(`I7: ${open} open campaigns above the valve ${h.max}`);
  if (config.operating_level !== (h.paused ? 1 : 0)) {
    throw new Error(`I10′: operating level ${config.operating_level}, the model paused ${h.paused}`);
  }
}
