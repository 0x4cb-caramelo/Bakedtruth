/**
 * Purpose: waitlist store for the "coming soon" page: validates an email and keeps one line per lead in a JSONL file.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 *
 * What is kept per lead: the email, the time, the consent text version and the source. Nothing else: no IP, no
 * user agent. The privacy answers behind this are in docs/technical/TECHNICAL-PLAN.md, section 8.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/** Version of the consent sentence shown under the form. Bump it when that sentence changes. */
export const CONSENT_VERSION = "v1-2026-10-05";

const MAX_EMAIL_LENGTH = 254;
const EMAIL_SHAPE = /^[^\s@"<>(),;:\\]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

/** Returns the trimmed, lowercased address, or null when it is not shaped like an email. */
export function normalizeEmail(raw) {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > MAX_EMAIL_LENGTH) return null;
  if (!EMAIL_SHAPE.test(email)) return null;
  if (email.split("@")[0].length > 64) return null;
  return email;
}

function readLeads(file) {
  if (!existsSync(file)) return [];
  const leads = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const lead = JSON.parse(line);
      if (typeof lead.email === "string") leads.push(lead);
    } catch {
      // A torn line (power loss mid-append) is skipped, not fatal: the other leads still load.
    }
  }
  return leads;
}

/**
 * Opens the store. `max` caps the number of leads so a flood cannot fill the disk of a shared server.
 * The file is created with mode 0600: only the service user reads it.
 */
export function createLeadStore(file, { max = 50_000, now = () => new Date() } = {}) {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const known = new Set(readLeads(file).map((lead) => lead.email));

  return {
    count: () => known.size,

    /** Returns "added", "exists" or "full". Callers answer the visitor the same way for the first two. */
    add(email, source = "landing") {
      if (known.has(email)) return "exists";
      if (known.size >= max) return "full";
      const lead = { email, at: now().toISOString(), consent: CONSENT_VERSION, source };
      appendFileSync(file, `${JSON.stringify(lead)}\n`, { mode: 0o600 });
      known.add(email);
      return "added";
    },

    /** Deletes the lead for good. */
    remove(email) {
      if (!known.has(email)) return false;
      rewrite(readLeads(file).filter((lead) => lead.email !== email));
      known.delete(email);
      return true;
    },

    /** Deletes every lead older than `maxAgeMs`: the retention promised on the privacy page. Returns how many. */
    purgeOlderThan(maxAgeMs) {
      const cutoff = now().getTime() - maxAgeMs;
      const leads = readLeads(file);
      const kept = leads.filter((lead) => !(Date.parse(lead.at) < cutoff));
      if (kept.length === leads.length) return 0;
      rewrite(kept);
      known.clear();
      for (const lead of kept) known.add(lead.email);
      return leads.length - kept.length;
    },
  };

  /** Rewrites the file through a temporary one, so a crash mid-write cannot truncate the list. */
  function rewrite(leads) {
    const temp = `${file}.tmp`;
    writeFileSync(temp, leads.map((lead) => `${JSON.stringify(lead)}\n`).join(""), { mode: 0o600 });
    renameSync(temp, file);
  }
}
