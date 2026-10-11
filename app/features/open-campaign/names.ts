/**
 * Purpose: the reviewed account names (A-11; TP §3.4.10 "Display names"), read on the server from
 *          content/account-names.json when the site is built: a list of `{ "address": "<base58>", "kind": "burn" |
 *          "lock" | "pool" | "stake", "name": "<short public name>" }`, changed only by a commit two people review.
 *          A name is not a gate (D-i): any account the reader accepts can still be used and shows its shortened
 *          address. The typeahead searches these and the pinned Pyth feeds; nothing a creator types becomes a name.
 *          The plan's `/api/v1/names` (Sprint 08) does not exist, so the page reads the file itself on each request (it
 *          is dynamic: it reads the link's query). A malformed file throws here; the page then goes on with no names, and
 *          tests/site/open-draft.test.ts fails on it before a merge.
 * Version: 0.1.1 (the Sprint 19 adversarial review: the header says when the file is read)
 * Sprint:  19 (site: open a campaign)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { isAddress } from "@solana/kit";
import { personalDataIn } from "@brot/sdk/schemas";

import { contentDir } from "../../lib/content";
import type { KindName } from "../campaign-page/proof";

export type KnownName = { address: string; kind: Exclude<KindName, "price">; name: string };

const KINDS = new Set(["burn", "lock", "pool", "stake"]);
/** Letters, digits, spaces and a few marks, 1 to 32 characters: a name, never a sentence or a link. */
const NAME = /^[A-Za-z0-9][A-Za-z0-9 .$–\-/]{0,31}$/;

/** The checked list, or a thrown error naming the first entry that is not one. */
export function parseNames(text: string): KnownName[] {
  const list: unknown = JSON.parse(text);
  if (!Array.isArray(list)) throw new Error("content/account-names.json must be a JSON array");
  const seen = new Set<string>();
  return list.map((item, i) => {
    const e = item as Record<string, unknown>;
    const keys = Object.keys(e ?? {})
      .sort()
      .join(",");
    if (keys !== "address,kind,name") throw new Error(`account-names[${i}]: exactly address, kind and name`);
    if (typeof e.address !== "string" || !isAddress(e.address))
      throw new Error(`account-names[${i}].address: a Solana address`);
    if (typeof e.kind !== "string" || !KINDS.has(e.kind))
      throw new Error(`account-names[${i}].kind: burn, lock, pool or stake (price accounts are named by Pyth's list)`);
    if (typeof e.name !== "string" || !NAME.test(e.name))
      throw new Error(`account-names[${i}].name: 1 to 32 plain characters`);
    const personal = personalDataIn(e.name);
    if (personal) throw new Error(`account-names[${i}].name holds ${personal}`);
    if (seen.has(e.address)) throw new Error(`account-names[${i}].address is named twice`);
    seen.add(e.address);
    return { address: e.address, kind: e.kind as KnownName["kind"], name: e.name };
  });
}

export function loadNames(file: string = join(contentDir(), "account-names.json")): KnownName[] {
  return parseNames(readFileSync(file, "utf8"));
}
