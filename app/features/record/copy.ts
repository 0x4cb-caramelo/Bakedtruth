/**
 * Purpose: the words of the public record (Sprint 12; BR-45; English per L-01, route `/record` confirmed by the
 *          founder): what the record holds, how to check a record against the chain, each record's fields, and what
 *          each team reason means for the opening fee (P-4).
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
export const RECORD = {
  title: "Public record",
  intro:
    "Every void the team records, with its reason and the team's own words, and every correction to one. A team key can void a campaign only after the program voided it by itself (a missed reading, an unreadable account or a stale price feed), and only inside the 6-hour review; it can never void or change a YES or a NO.",
  check:
    "Each record's SHA-256 is of exactly its file's bytes, and a void's is stored in the campaign on-chain, so anyone can check that the text was not changed. Records are never edited: a correction is a new record.",
  automatic: "Voids the program records by itself show their reason on the campaign's page.",
  empty: "No voids or corrections recorded yet.",
  void: "Void",
  correction: "Correction",
  campaign: "Campaign",
  corrects: "Corrects",
  reason: "Reason",
  teamKey: "Team key",
  written: "Written",
  sha256: "SHA-256",
  skipped: (n: number) =>
    `${n} ${n === 1 ? "file does" : "files do"} not follow the record's format and are not shown.`,
} as const;

export const TEAM_REASON: Record<string, string> = {
  TeamHouseFailure: "Brot's fault: the 10% opening fee goes back to whoever opened it, unless nobody had entered.",
  TeamOutsideCause: "A cause outside Brot: Brot keeps the 10% opening fee.",
};
