/**
 * Purpose: the JSON Schema check of content/ (TP §4 "Content files", §3.1's data contracts; Sprint 08 DoD): every
 *          `content/<name>.json` beside a `content/<name>.schema.json` must conform to it, checked by the SDK's
 *          `jsonSchemaProblems`; a schema with no file beside it is an error, and a file with no schema is listed as
 *          unchecked. A schema the SDK generates from its zod (GENERATED) must also equal what the SDK writes now, and
 *          the file must pass the SDK's own parse, which holds the rules a JSON Schema cannot say (no personal data,
 *          nothing listed twice). `--write` writes the generated schemas first. Exits 1 on any problem.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 *   bun run scripts/check-content-schema.ts           # check (the CI step)
 *   bun run scripts/check-content-schema.ts --write   # write the generated schemas, then check
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { jsonSchemaProblems, parsePartners, partnersJsonSchema } from "@brot/sdk/schemas";

type Generated = { schema: () => unknown; parse: (text: string) => unknown };

/** The content files whose schema the SDK generates from its zod, with the SDK's own parse. */
export const GENERATED: Readonly<Record<string, Generated>> = {
  "partners.json": { schema: partnersJsonSchema, parse: parsePartners },
};

export type ContentResult = { file: string; status: "ok" | "unchecked" | "failed"; problems: string[] };

export const schemaText = (schema: unknown): string => `${JSON.stringify(schema, null, 2)}\n`;
const schemaOf = (file: string) => file.replace(/\.json$/, ".schema.json");
const why = (caught: unknown) => (caught instanceof Error ? caught.message : String(caught));

/** One content file against its schema, its generated text and the SDK's parse. */
function checkFile(dir: string, file: string, generated: Generated | undefined): ContentResult {
  const schemaPath = join(dir, schemaOf(file));
  if (!existsSync(schemaPath))
    return generated
      ? { file, status: "failed", problems: [`${schemaOf(file)} is missing: run with --write`] }
      : { file, status: "unchecked", problems: [] };
  const problems: string[] = [];
  const schemaRaw = readFileSync(schemaPath, "utf8");
  const text = readFileSync(join(dir, file), "utf8");
  if (generated && schemaRaw !== schemaText(generated.schema()))
    problems.push(`${schemaOf(file)} is stale: run bun run scripts/check-content-schema.ts --write and commit it`);
  try {
    problems.push(...jsonSchemaProblems(JSON.parse(schemaRaw), JSON.parse(text)));
  } catch (caught) {
    problems.push(`not checkable: ${why(caught)}`);
  }
  if (generated && problems.length === 0) {
    try {
      generated.parse(text);
    } catch (caught) {
      problems.push(why(caught));
    }
  }
  return { file, status: problems.length === 0 ? "ok" : "failed", problems };
}

/** Every top-level content file, in name order; `write` first rewrites the generated schemas. */
export function checkContent(dir: string, options: { write?: boolean } = {}): ContentResult[] {
  const names = readdirSync(dir).sort();
  const files = names.filter((f) => f.endsWith(".json") && !f.endsWith(".schema.json"));
  if (options.write)
    for (const [file, g] of Object.entries(GENERATED))
      if (files.includes(file)) writeFileSync(join(dir, schemaOf(file)), schemaText(g.schema()));
  const results = files.map((file) => checkFile(dir, file, GENERATED[file]));
  for (const schema of names.filter((f) => f.endsWith(".schema.json")))
    if (!files.includes(schema.replace(/\.schema\.json$/, ".json")))
      results.push({ file: schema, status: "failed", problems: ["a schema with no content file beside it"] });
  return results;
}

if (import.meta.main) {
  const results = checkContent("content", { write: process.argv.includes("--write") });
  for (const r of results) {
    console.log(`${r.status === "ok" ? "ok" : r.status === "unchecked" ? "--" : "FAIL"}  content/${r.file}`);
    for (const p of r.problems) console.log(`      ${p}`);
  }
  if (results.some((r) => r.status === "failed")) process.exit(1);
}
