/**
 * Purpose: the powers table (BR-41, Sprint 13 DoD): content/powers.md is published on /record with who holds each key
 *          and the limit of each power (P4 §4.2), its four roles each name a base58 address, nothing in it becomes HTML,
 *          and the page's live check reads the same roles from the program (ProgramData's upgrade authority, the
 *          config's admin, fee recipient and team keys) through an RPC, here the program in LiteSVM.
 *          Filter: `bun test tests/ -t "powers table"`.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";

import { parseMarkdown, publishedKeys } from "../../app/features/record/markdown";
import { loadPowers, parsePowers, ROLES } from "../../app/features/record/load-powers";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import { startFakeChain, type FakeChain } from "./fake-chain";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;
let html = "";
let readKeys: (rpc: unknown) => Promise<Record<string, string[]>>;
let w: OpeningWorld;
let chain: FakeChain;

beforeAll(async () => {
  const react = await import(site("node_modules/react/index.js"));
  const server = await import(site("node_modules/react-dom/server.node.js"));
  const { PowersView } = await import(site("features/record/powers-view.tsx"));
  html = server.renderToStaticMarkup(react.createElement(PowersView, { blocks: loadPowers().blocks }));
  readKeys = (await import(site("features/record/live-keys.tsx"))).readKeys;
  w = await openingWorld();
  chain = startFakeChain(w);
});
afterAll(() => chain.close());

describe("powers table", () => {
  test("content/powers.md names an address for every role and a limit for every power", () => {
    const { keys, blocks } = loadPowers();
    expect(Object.keys(keys)).toEqual([...ROLES]);
    const powers = blocks.find((b) => b.kind === "table" && b.head[0] === "Power");
    expect(powers?.kind).toBe("table");
    const rows = powers?.kind === "table" ? powers.rows : [];
    for (const power of ["Replace the program", "Pause new entries and openings", "Move or take a baker's entry"])
      expect(rows.some((r) => r[0] === power)).toBe(true);
    for (const row of rows) expect(row[1].length).toBeGreaterThan(0);
    expect(rows.find((r) => r[0] === "Move or take a baker's entry")?.[1]).toBe("Nobody");
  });

  test("the page draws it as text, with each key linked to the explorer and no HTML from the file", () => {
    expect(html).toContain("Who can do what");
    expect(html).toContain("Replace the program");
    expect(html).toContain("explorer.solana.com/address/6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq");
    const sneaky = parseMarkdown("# T\n\nA <script>alert(1)</script> line with `code`.\n");
    expect(sneaky).toEqual([
      { kind: "h1", text: "T" },
      { kind: "p", text: "A <script>alert(1)</script> line with `code`." },
    ]);
    expect(html).not.toContain("<script");
  });

  test("a keys table that lost a role's address fails the build", () => {
    const text = "| Role | Address |\n| --- | --- |\n| Admin | `nope` |\n";
    expect(publishedKeys(parseMarkdown(text))).toEqual({ Admin: "nope" });
    expect(() => parsePowers(text)).toThrow("no address for Upgrade authority");
  });

  test("the live check reads each role from the program", async () => {
    const keys = await readKeys(createSolanaRpc(chain.url));
    expect(keys["Upgrade authority"]).toEqual([w.upgradeAuthority.address]);
    expect(keys.Admin).toEqual([w.admin.address]);
    expect(keys["Team key"]).toEqual([w.team.address]);
    expect(keys["Fee recipient"]).toHaveLength(1);
  });
});
