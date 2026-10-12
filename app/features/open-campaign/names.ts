/**
 * Purpose: the reviewed account names (A-11; TP §3.4.10 "Display names"), read on the server from
 *          content/account-names.json: a list of `{ "address": "<base58>", "kind": "burn" |
 *          "lock" | "pool" | "stake", "name": "<short public name>" }`, changed only by a commit two people review.
 *          A name is not a gate (D-i): any account the reader accepts can still be used and shows its shortened
 *          address. The typeahead searches these and the pinned Pyth feeds; nothing a creator types becomes a name.
 *          The page reads the file itself on each request (it is dynamic: it reads the link's query); the rules are the
 *          SDK's `parseAccountNames`, which the read API's /api/v1/names applies too (Sprint 08). A malformed file
 *          throws here; the page then goes on with no names, and tests/site/open-draft.test.ts fails on it first.
 * Version: 0.2.0 (Sprint 08: the rules moved to the SDK, shared with /api/v1/names)
 * Sprint:  19 (site: open a campaign); 08
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseAccountNames, type AccountName } from "@brot/sdk/schemas";

import { contentDir } from "../../lib/content";

export type KnownName = AccountName;

/** The checked list, or a thrown error naming the first entry that is not one (the SDK's, shared with the API). */
export const parseNames = parseAccountNames;

export function loadNames(file: string = join(contentDir(), "account-names.json")): KnownName[] {
  return parseNames(readFileSync(file, "utf8"));
}
