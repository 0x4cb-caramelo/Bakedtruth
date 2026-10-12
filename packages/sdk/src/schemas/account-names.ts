/**
 * Purpose: the reviewed account names of `content/account-names.json` (A-11; TP §3.4.10 "Display names"): a JSON array
 *          of `{ "address", "kind", "name" }`, each address once, a kind the program reads by account (burn, lock,
 *          pool, stake; price accounts are named by Pyth's pinned list), and a short plain name, never a person, a link
 *          or a handle. A name is not a gate (D-i). Shared by the site's creation box, the read API's /api/v1/names
 *          and the app; a file that breaks a rule throws, naming the first entry. Moved from the site in Sprint 08.
 * Version: 0.1.0
 * Sprint:  19 (the creation box); 08 (shared through the SDK)
 */
import { isAddress } from "@solana/kit";

import { personalDataIn } from "./void-log";

export type AccountNameKind = "burn" | "lock" | "pool" | "stake";
export type AccountName = { address: string; kind: AccountNameKind; name: string };

const KINDS = new Set<string>(["burn", "lock", "pool", "stake"]);
/** Letters, digits, spaces and a few marks, 1 to 32 characters: a name, never a sentence or a link. */
const NAME = /^[A-Za-z0-9][A-Za-z0-9 .$–\-/]{0,31}$/;

/** The checked list, or a thrown error naming the first entry that is not one. */
export function parseAccountNames(text: string): AccountName[] {
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
    return { address: e.address, kind: e.kind as AccountNameKind, name: e.name };
  });
}
