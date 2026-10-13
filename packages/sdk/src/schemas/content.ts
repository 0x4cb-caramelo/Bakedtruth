/**
 * Purpose: a value checked against a committed JSON Schema (Sprint 08: the CI check of content/*.json, TP §4 "Content
 *          files"), with no library beyond zod: the schema becomes a zod schema through zod's own `fromJSONSchema`
 *          (zod is pinned, 4.6.5; its documentation calls the function semi-experimental, so the tests check it on good
 *          and bad files), and a keyword it cannot represent throws instead of being skipped, so a schema is never
 *          half-applied. Rules a JSON Schema cannot say stay in each file's own zod parse (partners.ts).
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { z } from "zod";

/** Every way `value` breaks `schema`, as `path: message` (`(root)` for the value itself); empty when it conforms. */
export function jsonSchemaProblems(schema: unknown, value: unknown): string[] {
  const check = z.fromJSONSchema(schema as Parameters<typeof z.fromJSONSchema>[0]);
  const result = check.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => `${issue.path.map(String).join(".") || "(root)"}: ${issue.message}`);
}
