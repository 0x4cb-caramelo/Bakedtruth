/**
 * Purpose: the team's exports from the indexer's file (Sprint 08; TP §6, "the partner report has no public route; it
 *          is a team export without addresses"): the KPIs as JSON on stdout (kpis.ts), and the partner report as one
 *          text file per partner campaign of content/partners.json (partner-report.ts). The file is opened read-only,
 *          so an export runs beside the live ingest (WAL) and never writes it. The 30-day return is judged at the
 *          file's own chain time (the last finalized block it read), or the machine's clock for a file with none.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Run (on the server, as the indexer's user):
 *   bun services/indexer/src/export.ts kpis <indexer.sqlite> [partners.json]
 *   bun services/indexer/src/export.ts partners <indexer.sqlite> <out dir> [partners.json]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePartners, type Partner } from "@brot/sdk/schemas";

import { freshness } from "./api/queries";
import { openStore, type Store } from "./db/store";
import { computeKpis } from "./kpis";
import { partnerFigures, reportFileName, reportText } from "./partner-report";

export const DEFAULT_PARTNERS = fileURLToPath(new URL("../../../content/partners.json", import.meta.url));

/** The chain time the file was read up to, else the machine's clock (Unix seconds). */
export const fileTime = (store: Store): number => {
  const t = freshness(store).chain_time;
  return t === null ? Math.floor(Date.now() / 1_000) : Number(t);
};

/** Writes one report per partner campaign into `dir`; returns the file names. */
export function writePartnerReports(store: Store, partners: readonly Partner[], dir: string): string[] {
  mkdirSync(dir, { recursive: true });
  const asOf = freshness(store);
  return partnerFigures(store, partners).campaigns.map((f) => {
    writeFileSync(join(dir, reportFileName(f)), reportText(f, asOf), { mode: 0o640 });
    return reportFileName(f);
  });
}

if (import.meta.main) {
  const [what, db, third, fourth] = process.argv.slice(2);
  const usage =
    "usage: export.ts kpis <indexer.sqlite> [partners.json] | partners <indexer.sqlite> <out dir> [partners.json]";
  if ((what !== "kpis" && what !== "partners") || !db || (what === "partners" && !third)) throw new Error(usage);
  const partners = parsePartners(readFileSync((what === "kpis" ? third : fourth) ?? DEFAULT_PARTNERS, "utf8"));
  const store = openStore(db, { readonly: true });
  try {
    if (what === "kpis") console.log(JSON.stringify(computeKpis(store, partners, fileTime(store)), null, 2));
    else
      console.log(
        JSON.stringify({ event: "partner-reports", files: writePartnerReports(store, partners, third).length }),
      );
  } finally {
    store.close();
  }
}
