/**
 * Purpose: the words of the public record (Sprint 12; BR-45; English per L-01, route `/record` confirmed by the
 *          founder): what the record holds, how to check a record against the chain, each record's fields, and what
 *          each team reason means for the opening fee (P-4). Since Sprint 13, the live check of the powers table's keys
 *          (BR-41; the table itself is content/powers.md).
 * Version: 0.2.0 (Sprint 13: the keys, read live)
 * Sprint:  12 (site: my entries and campaign states); 13
 */
export const RECORD = {
  title: "Public record",
  intro:
    "Every void the team records, with its reason and the team's own words, and every correction to one. The program voids a campaign by itself when it cannot read the result: a missed reading, an unreadable account or a stale price feed. Inside the 6-hour review, a team key can then record the cause, which decides who keeps the 10% opening fee. A team key can never void or change a YES or a NO.",
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

export const KEYS = {
  title: "Check the keys yourself",
  intro: "Read now from the chain, through this site's RPC: the program's upgrade authority and its config's keys.",
  role: "Role",
  published: "This page",
  chain: "On-chain now",
  same: "Same",
  differs: "Differs",
  reading: "Reading the chain…",
  failed: "The chain could not be read now. The addresses above are as published.",
  stale: "A key changed since this page was written. The chain is right; the table above is out of date.",
  none: "None",
} as const;
