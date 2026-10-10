/**
 * Purpose: the powers table (BR-41), read on the server when the site is built from content/powers.md and parsed into
 *          blocks (markdown.ts). Its keys table must name the four roles with a base58 address each; anything else
 *          fails the build, so the page never publishes a table that lost a key.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { contentDir } from "@/lib/content";
import { parseMarkdown, publishedKeys, type Block } from "./markdown";

export const ROLES = ["Upgrade authority", "Admin", "Fee recipient", "Team key"] as const;
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export type Powers = { blocks: Block[]; keys: Record<string, string> };

export function loadPowers(file: string = join(contentDir(), "powers.md")): Powers {
  return parsePowers(readFileSync(file, "utf8"));
}

/** The parsed table, or a thrown error naming the role whose address is missing. */
export function parsePowers(text: string): Powers {
  const blocks = parseMarkdown(text);
  const keys = publishedKeys(blocks);
  for (const role of ROLES)
    if (!BASE58.test(keys[role] ?? "")) throw new Error(`content/powers.md: the keys table has no address for ${role}`);
  return { blocks, keys };
}
