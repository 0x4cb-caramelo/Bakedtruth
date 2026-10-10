/**
 * Purpose: writes content/void-log/record.schema.json, the JSON Schema of a void-log record, from the zod schema in
 *          packages/sdk/src/schemas/void-log.ts (Sprint 12: the record's public format). `--check` fails when the
 *          committed file differs, which tests/site/void-log.test.ts also checks in CI.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 *   bun run scripts/void-log-schema.ts           # write it
 *   bun run scripts/void-log-schema.ts --check   # compare only
 */
import { readFileSync, writeFileSync } from "node:fs";

import { voidLogJsonSchema } from "@brot/sdk/schemas";

export const SCHEMA_PATH = "content/void-log/record.schema.json";

export const schemaText = (): string => `${JSON.stringify(voidLogJsonSchema(), null, 2)}\n`;

if (import.meta.main) {
  const text = schemaText();
  if (process.argv.includes("--check")) {
    const committed = readFileSync(SCHEMA_PATH, "utf8");
    if (committed !== text) {
      console.error(`${SCHEMA_PATH} is stale: run bun run scripts/void-log-schema.ts and commit it`);
      process.exit(1);
    }
    console.log(`${SCHEMA_PATH} is current`);
  } else {
    writeFileSync(SCHEMA_PATH, text);
    console.log(`wrote ${SCHEMA_PATH}`);
  }
}
