/**
 * Purpose: the campaigns the team unlisted after a report (C-10; proposal §2.7), read on the server when the site is
 *          built from content/unlisted.json: a list of `{ "id": "<the campaign's u64 id>", "reason": "<public text>",
 *          "at": "<ISO UTC time>" }`, changed only by a commit with two people's review, as the void log is. Unlisting
 *          is display only: the home page hides the campaign; its page, its entries, its result and its payouts stay.
 *          A malformed file fails the build rather than unlisting the wrong campaign or none.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { personalDataIn } from "@brot/sdk/schemas";
import { contentDir } from "../../lib/content";

export type Unlisted = { id: string; reason: string; at: string };

const U64 = /^(0|[1-9]\d{0,19})$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

/** The checked list, or a thrown error naming the first entry that is not one. */
export function parseUnlisted(text: string): Unlisted[] {
  const list: unknown = JSON.parse(text);
  if (!Array.isArray(list)) throw new Error("content/unlisted.json must be a JSON array");
  return list.map((item, i) => {
    const e = item as Record<string, unknown>;
    const keys = Object.keys(e ?? {})
      .sort()
      .join(",");
    if (keys !== "at,id,reason") throw new Error(`unlisted[${i}]: exactly id, reason and at`);
    if (typeof e.id !== "string" || !U64.test(e.id) || BigInt(e.id) > 18_446_744_073_709_551_615n)
      throw new Error(`unlisted[${i}].id: a campaign's u64 id, as a string`);
    if (typeof e.reason !== "string" || e.reason.trim().length === 0 || e.reason.length > 280)
      throw new Error(`unlisted[${i}].reason: public text, 1 to 280 characters`);
    const personal = personalDataIn(e.reason);
    if (personal) throw new Error(`unlisted[${i}].reason holds ${personal}`);
    if (typeof e.at !== "string" || !ISO.test(e.at)) throw new Error(`unlisted[${i}].at: an ISO UTC time`);
    return { id: e.id, reason: e.reason, at: e.at };
  });
}

export function loadUnlisted(file: string = join(contentDir(), "unlisted.json")): Unlisted[] {
  return parseUnlisted(readFileSync(file, "utf8"));
}
