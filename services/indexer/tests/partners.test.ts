/**
 * Purpose: content/partners.json and its checks (Sprint 08 DoD "content/partners.json", "a JSON Schema check in CI
 *          covers content/*.json"), no cluster: the SDK's parse accepts the committed empty file and a full partner,
 *          and refuses each broken rule; the committed JSON Schema, applied by `jsonSchemaProblems`, refuses what it
 *          can say, and a keyword it cannot apply throws; scripts/check-content-schema.ts passes the repository's
 *          content/ and fails a stale, missing or orphan schema and a file that breaks either check; the indexer's
 *          loader keeps the last good list when the file goes missing or breaks.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { jsonSchemaProblems, parsePartners, partnersJsonSchema, type Partner } from "@brot/sdk/schemas";

import { checkContent, schemaText } from "../../../scripts/check-content-schema";
import { createPartners } from "../src/partners";

const ROOT = join(import.meta.dir, "../../..");
const dir = mkdtempSync(join(tmpdir(), "brot-indexer-partners-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const T = 1_800_000_000;
const GOOD: Partner[] = [
  {
    partner: "example-dao",
    name: "Example DAO",
    link: "https://x.com/exampledao",
    seal: "example-dao.svg",
    campaigns: [{ id: "42", opensAt: String(T), highlightFrom: String(T), highlightUntil: String(T + 72 * 3_600) }],
  },
  { partner: "sponsor", name: "Sponsor", campaigns: [] },
];
const text = (value: unknown) => JSON.stringify(value);
const withCampaign = (over: Record<string, string>) => [
  { ...GOOD[0], campaigns: [{ ...GOOD[0].campaigns[0], ...over }] },
];

describe("content/partners.json", () => {
  test("the committed file is empty and parses; a full partner and a sponsor with no campaign parse", () => {
    expect(parsePartners(readFileSync(join(ROOT, "content/partners.json"), "utf8"))).toEqual([]);
    expect(parsePartners(text(GOOD))).toEqual(GOOD);
  });

  test("each broken rule is refused, naming its place", () => {
    for (const [bad, place] of [
      [[GOOD[0], { ...GOOD[1], partner: "example-dao" }], "partners[1].partner"],
      [[GOOD[0], { ...GOOD[1], campaigns: GOOD[0].campaigns }], "partners[1].campaigns[0]"],
      [withCampaign({ highlightUntil: String(T + 72 * 3_600 + 1) }), "partners[0].campaigns[0].highlightUntil"],
      [withCampaign({ highlightUntil: String(T) }), "partners[0].campaigns[0].highlightUntil"],
      [withCampaign({ id: "18446744073709551616" }), "partners[0].campaigns[0].id"],
      [[{ ...GOOD[0], name: "example.org" }], "partners[0].name"],
      [[{ ...GOOD[0], name: "Ann @ann" }], "partners[0].name"],
      [[{ ...GOOD[0], link: "https://user@x.com/a" }], "partners[0].link"],
      [[{ ...GOOD[0], link: "https://x.com/a?ref=1" }], "partners[0].link"],
      [[{ ...GOOD[0], link: "http://x.com/a" }], "partners[0].link"],
      [[{ ...GOOD[0], seal: "seal.gif" }], "partners[0].seal"],
      [[{ ...GOOD[0], wallet: "x" }], "partners[0]"],
    ] as const)
      expect(() => parsePartners(text(bad))).toThrow(`${place}:`);
  });

  test("the committed JSON Schema refuses what a schema can say; a keyword it cannot apply throws", () => {
    const schema = JSON.parse(readFileSync(join(ROOT, "content/partners.schema.json"), "utf8"));
    expect(schemaText(schema)).toBe(schemaText(partnersJsonSchema()));
    expect(jsonSchemaProblems(schema, GOOD)).toEqual([]);
    expect(jsonSchemaProblems(schema, [{ ...GOOD[0], wallet: "x" }]).join()).toContain("wallet");
    expect(jsonSchemaProblems(schema, [{ ...GOOD[1], partner: "Upper" }]).join()).toContain("0.partner");
    expect(jsonSchemaProblems(schema, [{ partner: "p", name: "P" }]).join()).toContain("0.campaigns");
    expect(jsonSchemaProblems(schema, {})).not.toEqual([]);
    expect(() => jsonSchemaProblems({ if: { type: "string" }, then: { minLength: 2 } }, "x")).toThrow();
  });
});

describe("the content check (scripts/check-content-schema.ts)", () => {
  test("the repository's content/ passes: partners.json is checked, the files with no schema are listed", () => {
    const results = checkContent(join(ROOT, "content"));
    expect(results.filter((r) => r.status === "failed")).toEqual([]);
    expect(results.find((r) => r.file === "partners.json")?.status).toBe("ok");
  });

  test("a stale, missing or orphan schema, or a file that breaks either check, fails; --write mends the schema", () => {
    const at = (name: string) => join(dir, name);
    writeFileSync(at("partners.json"), text(GOOD));
    writeFileSync(at("other.json"), "[]");
    const status = () => Object.fromEntries(checkContent(dir).map((r) => [r.file, r.status]));
    expect(status()).toEqual({ "other.json": "unchecked", "partners.json": "failed" });
    expect(checkContent(dir, { write: true }).find((r) => r.file === "partners.json")?.status).toBe("ok");
    writeFileSync(at("partners.schema.json"), schemaText({ ...partnersJsonSchema(), title: "edited" }));
    expect(
      checkContent(dir)
        .find((r) => r.file === "partners.json")
        ?.problems.join(),
    ).toContain("stale");
    checkContent(dir, { write: true });
    writeFileSync(at("partners.json"), text([{ ...GOOD[0], extra: 1 }]));
    expect(status()["partners.json"]).toBe("failed");
    writeFileSync(at("partners.json"), text([GOOD[0], { ...GOOD[1], partner: "example-dao" }]));
    expect(
      checkContent(dir)
        .find((r) => r.file === "partners.json")
        ?.problems.join(),
    ).toContain("partners[1].partner");
    writeFileSync(at("lonely.schema.json"), "{}");
    expect(status()["lonely.schema.json"]).toBe("failed");
  });
});

describe("the indexer's partners loader", () => {
  test("a missing file is named; a broken one keeps the last good list; no file configured is an empty list", () => {
    const file = join(dir, "loader.json");
    const partners = createPartners(file);
    expect([partners.current(), partners.lastError()]).toEqual([[], "NotFound"]);
    writeFileSync(file, text(GOOD));
    partners.refresh();
    expect([partners.current().length, partners.lastError()]).toEqual([2, null]);
    writeFileSync(file, "[{");
    partners.refresh();
    expect([partners.current().length, partners.lastError()]).toEqual([2, "SyntaxError"]);
    expect([createPartners(null).current(), createPartners(null).lastError()]).toEqual([[], null]);
  });
});
