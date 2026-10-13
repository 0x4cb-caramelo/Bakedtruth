/**
 * Purpose: the partner report (BR-30; L-24 answered 4a, Sprint 13; TP §3.5 KPIs and §6, "a team export without
 *          addresses"; Sprint 08 DoD): for each campaign content/partners.json names, its result, its entries and
 *          distinct wallets per side, its SOL per side and whether it ended one-sided, as one plain-text file per
 *          partner campaign, never an address (the campaign is its id and its opening time); and per partner, the
 *          volume and the distinct wallets across its campaigns, for the KPIs. From the indexer's finalized rows only.
 *          A named campaign the file does not hold, or one no team key opened (P-3), is said so in its report.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { formatSol, formatUtc } from "@brot/sdk/read";
import type { Partner } from "@brot/sdk/schemas";

import type { Store } from "./db/store";

export type CampaignFigures = {
  partner: string;
  name: string;
  id: string;
  opensAt: string;
  /** The indexer's file holds this opening. */
  found: boolean;
  kind: string | null;
  status: string | null;
  outcome: string | null;
  settleMode: string | null;
  voidReason: string | null;
  closed: boolean;
  openedByTeam: boolean | null;
  entries: { yes: number; no: number };
  wallets: { yes: number; no: number; all: number };
  lamports: { yes: bigint; no: bigint };
  /** Entries made by the key that opened it (flagged `is_creator`): counted above too. */
  openerEntries: number;
};

export type PartnerTotals = {
  partner: string;
  campaigns: number;
  found: number;
  entries: number;
  wallets: number;
  volume: string;
};

type Row = {
  address: string;
  opening: number;
  kind: string;
  status: string;
  outcome: string;
  settle_mode: string | null;
};
type More = { void_reason: string | null; closed: number; creator_is_team: number };
type Entry = { baker: string; side: string; amount: string; is_creator: number };

/** Each partner campaign's figures, and each partner's totals; the bakers never leave this function. */
export function partnerFigures(store: Store, partners: readonly Partner[]) {
  const campaigns: CampaignFigures[] = [];
  const totals: PartnerTotals[] = [];
  const findRow = store.db.query("SELECT * FROM campaigns WHERE id = ? AND opens_at = ?");
  const entriesOf = store.db.query(
    "SELECT baker, side, amount, is_creator FROM entries WHERE campaign = ? AND opening = ?",
  );
  for (const p of partners) {
    const everyone = new Set<string>();
    let [found, count, volume] = [0, 0, 0n];
    for (const c of p.campaigns) {
      const row = findRow.get(c.id, Number(c.opensAt)) as (Row & More) | null;
      const entries = row ? (entriesOf.all(row.address, row.opening) as Entry[]) : [];
      const side = (s: string) => entries.filter((e) => e.side === s);
      const wallets = (list: Entry[]) => new Set(list.map((e) => e.baker)).size;
      const sum = (list: Entry[]) => list.reduce((t, e) => t + BigInt(e.amount), 0n);
      for (const e of entries) everyone.add(e.baker);
      found += row ? 1 : 0;
      count += entries.length;
      volume += sum(entries);
      campaigns.push({
        ...{ partner: p.partner, name: p.name, id: c.id, opensAt: c.opensAt, found: row !== null },
        ...{ kind: row?.kind ?? null, status: row?.status ?? null, outcome: row?.outcome ?? null },
        ...{ settleMode: row?.settle_mode ?? null, voidReason: row?.void_reason ?? null, closed: row?.closed === 1 },
        openedByTeam: row ? row.creator_is_team === 1 : null,
        entries: { yes: side("Yes").length, no: side("No").length },
        wallets: { yes: wallets(side("Yes")), no: wallets(side("No")), all: wallets(entries) },
        lamports: { yes: sum(side("Yes")), no: sum(side("No")) },
        openerEntries: entries.filter((e) => e.is_creator === 1).length,
      });
    }
    totals.push({
      partner: p.partner,
      campaigns: p.campaigns.length,
      found,
      entries: count,
      wallets: everyone.size,
      volume: volume.toString(),
    });
  }
  return { campaigns, totals };
}

/** The report's file name: the partner's key, the campaign's id and its opening time. */
export const reportFileName = (f: CampaignFigures) => `${f.partner}-${f.id}-${f.opensAt}.txt`;

const RESULT: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Void: "void: every entry refunded",
  Unresolved: "not yet",
};

/** One campaign's report, plain text, no address. `asOf` is the indexer's freshness. */
export function reportText(f: CampaignFigures, asOf: { as_of_slot: string; chain_time: string | null }): string {
  const head = [
    "Brot Markets: partner campaign report",
    `Partner: ${f.name}`,
    `Campaign: #${f.id}, opened ${formatUtc(BigInt(f.opensAt))}`,
  ];
  const time = asOf.chain_time === null ? "" : ` (chain time ${formatUtc(BigInt(asOf.chain_time))})`;
  const foot = [`As of slot ${asOf.as_of_slot}${time}, from the program's finalized events.`];
  if (!f.found)
    return [
      ...head,
      "Not found in the indexer's file: check the id and opening time in content/partners.json.",
      ...foot,
      "",
    ].join("\n");
  const sol = (n: bigint) => `${formatSol(n)} SOL`;
  const ended = f.settleMode === null ? "not finalized yet" : f.settleMode === "OneSided" ? "yes" : "no";
  const lines = [
    ...head,
    `Kind: ${f.kind}`,
    `Status: ${f.status}${f.closed ? " (account closed after payout)" : ""}`,
    `Result: ${RESULT[f.outcome ?? ""] ?? f.outcome}${f.voidReason && f.voidReason !== "None" ? ` (${f.voidReason})` : ""}`,
    `Ended one-sided: ${ended}`,
    `Entries: ${f.entries.yes + f.entries.no} (YES ${f.entries.yes}, NO ${f.entries.no})`,
    `Distinct wallets: ${f.wallets.all} (YES ${f.wallets.yes}, NO ${f.wallets.no})`,
    `Entered: ${sol(f.lamports.yes + f.lamports.no)} (YES ${sol(f.lamports.yes)}, NO ${sol(f.lamports.no)})`,
    ...(f.openerEntries > 0 ? [`Of these, entries by the key that opened it: ${f.openerEntries}`] : []),
    ...(f.openedByTeam ? [] : ["Warning: no team key opened this campaign (P-3): check content/partners.json."]),
    ...foot,
    "",
  ];
  return lines.join("\n");
}
