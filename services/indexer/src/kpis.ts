/**
 * Purpose: the KPIs, without personal data (BR-31, BR-34; BP v0.0.4 P2 §2.5 and §6.3; TP §3.5; proposal §2.7 "the
 *          third demand test"; Sprint 08 DoD): openings by team and by other wallets, paid openings per UTC month (the
 *          N of P2 §5.2); for every campaign and for those opened by other wallets, how many are two-sided, one-sided
 *          or empty now, how they ended once finalized, their volume and its share; the one-sided share of the pots
 *          that ended with a result; the 30-day return (retention.ts); campaigns resolved without error; and each
 *          partner's volume and wallets (partner-report.ts). Counts and lamports only: no address in the output.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * The readings: volume is every entry's lamports (both pools, late joins included); "ended" is a finalized opening,
 * empty when it had no entry, else by the mode finalize stored; the one-sided share is OneSided over Split plus
 * OneSided; "without error" is a resolved campaign never contested and not voided for a house failure, which the
 * program itself names (MissedWindow, TeamHouseFailure: math/void.rs). "On time" (TP §3.5) needs a rule per kind and is
 * not computed yet.
 */
import type { Partner } from "@brot/sdk/schemas";

import { freshness } from "./api/queries";
import type { Store } from "./db/store";
import { partnerFigures, type PartnerTotals } from "./partner-report";
import { return30, type Return30 } from "./retention";

export type Slice = {
  campaigns: number;
  two_sided: number;
  one_sided: number;
  empty: number;
  ended_split: number;
  ended_one_sided: number;
  ended_refunded: number;
  ended_empty: number;
  volume: string;
  /** This slice's volume over every campaign's, in basis points, rounded down. */
  volume_share_bps: number;
};

export type Kpis = {
  as_of_slot: string;
  chain_time: string | null;
  /** The clock the 30-day return was judged at, Unix seconds. */
  judged_at: string;
  openings: { total: number; by_team: number; by_others: number; paid_by_month: { month: string; paid: number }[] };
  all: Slice;
  by_others: Slice;
  one_sided_share_bps: number;
  return_30d: Return30;
  resolution: {
    resolved: number;
    yes: number;
    no: number;
    void: Record<string, number>;
    house_failures: number;
    contested: number;
    without_error: number;
  };
  partners: PartnerTotals[];
};

type Row = {
  address: string;
  opening: number;
  creator_is_team: number;
  opening_paid_lamports: string;
  opens_at: number;
  pool_yes: string;
  pool_no: string;
  settle_mode: string | null;
  outcome: string;
  void_reason: string | null;
};

const HOUSE_FAILURES = new Set(["MissedWindow", "TeamHouseFailure"]);
const bps = (part: bigint, whole: bigint) => (whole === 0n ? 0 : Number((part * 10_000n) / whole));

function slice(rows: readonly Row[], allVolume: bigint): Slice {
  const s = { campaigns: rows.length, two_sided: 0, one_sided: 0, empty: 0 };
  const ended = { ended_split: 0, ended_one_sided: 0, ended_refunded: 0, ended_empty: 0 };
  let volume = 0n;
  for (const r of rows) {
    const [yes, no] = [BigInt(r.pool_yes), BigInt(r.pool_no)];
    volume += yes + no;
    if (yes > 0n && no > 0n) s.two_sided += 1;
    else if (yes + no > 0n) s.one_sided += 1;
    else s.empty += 1;
    if (r.settle_mode === null) continue;
    if (yes + no === 0n) ended.ended_empty += 1;
    else if (r.settle_mode === "Split") ended.ended_split += 1;
    else if (r.settle_mode === "OneSided") ended.ended_one_sided += 1;
    else ended.ended_refunded += 1;
  }
  return { ...s, ...ended, volume: volume.toString(), volume_share_bps: bps(volume, allVolume) };
}

/** Every KPI at chain time `now` (Unix seconds), with `partners` from content/partners.json. */
export function computeKpis(store: Store, partners: readonly Partner[], now: number): Kpis {
  const rows = store.db.query("SELECT * FROM campaigns").all() as Row[];
  const allVolume = rows.reduce((t, r) => t + BigInt(r.pool_yes) + BigInt(r.pool_no), 0n);
  const others = rows.filter((r) => r.creator_is_team === 0);
  const months = new Map<string, number>();
  for (const r of rows)
    if (BigInt(r.opening_paid_lamports) > 0n) {
      const month = new Date(r.opens_at * 1_000).toISOString().slice(0, 7);
      months.set(month, (months.get(month) ?? 0) + 1);
    }
  const all = slice(rows, allVolume);
  const keyed = (name: string) =>
    new Set(
      (
        store.db.query("SELECT DISTINCT campaign, opening FROM events WHERE name = ?").all(name) as {
          campaign: string;
          opening: number;
        }[]
      ).map((e) => `${e.campaign}#${e.opening}`),
    );
  const resolved = keyed("CampaignResolved");
  const contested = keyed("ContestOpened");
  const done = rows.filter((r) => resolved.has(`${r.address}#${r.opening}`));
  const voids: Record<string, number> = {};
  for (const r of done)
    if (r.outcome === "Void") voids[r.void_reason ?? "None"] = (voids[r.void_reason ?? "None"] ?? 0) + 1;
  const failed = done.filter(
    (r) => contested.has(`${r.address}#${r.opening}`) || HOUSE_FAILURES.has(r.void_reason ?? ""),
  ).length;
  return {
    ...freshness(store),
    judged_at: String(now),
    openings: {
      total: rows.length,
      by_team: rows.length - others.length,
      by_others: others.length,
      paid_by_month: [...months].sort().map(([month, paid]) => ({ month, paid })),
    },
    all,
    by_others: slice(others, allVolume),
    one_sided_share_bps: bps(BigInt(all.ended_one_sided), BigInt(all.ended_split + all.ended_one_sided)),
    return_30d: return30(store, now),
    resolution: {
      resolved: done.length,
      yes: done.filter((r) => r.outcome === "Yes").length,
      no: done.filter((r) => r.outcome === "No").length,
      void: voids,
      house_failures: done.filter((r) => HOUSE_FAILURES.has(r.void_reason ?? "")).length,
      contested: done.filter((r) => contested.has(`${r.address}#${r.opening}`)).length,
      without_error: done.length - failed,
    },
    partners: partnerFigures(store, partners).totals,
  };
}
