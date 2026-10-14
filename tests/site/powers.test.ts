/**
 * Purpose: the powers table (BR-41, Sprint 13 DoD): content/powers.md is published on /record with who holds each key
 *          and the limit of each power (P4 §4.2), its four roles each name a base58 address, nothing in it becomes HTML,
 *          and the page's live check reads the same roles from the program (ProgramData's upgrade authority, the
 *          config's admin, fee recipient and team keys) through an RPC, here the program in LiteSVM.
 *          Filter: `bun test tests/ -t "powers table"`.
 * Version: 0.2.2 (Sprint 14, lane L14B: the stage-2 decision mapped to its own row; the scaffold of 2026-10-13 mapped two)
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

  test("every instruction that acts on the program has its row; a new one fails here until the table names it", () => {
    // Each instruction file under these folders, mapped to the row that says who may call it; helpers map to null.
    const ROW: Record<string, string | null> = {
      "admin/accept_admin": "Change the team keys, the fee recipient or the admin",
      "admin/transfer_admin": "Change the team keys, the fee recipient or the admin",
      "admin/set_team": "Change the team keys, the fee recipient or the admin",
      "admin/set_fee_recipient": "Change the team keys, the fee recipient or the admin",
      "admin/set_creation_params": "Change the creation parameters",
      "admin/pause_entries": "Pause new entries and openings",
      "admin/resume_entries": "Resume after a pause",
      "admin/initialize_config": "Replace the program", // once, by the upgrade authority, at deploy
      "admin/shared": null,
      "campaigns/open_campaign": "Open a campaign, paying",
      "resolution/resolve_campaign": "Resolve, settle and pay",
      "resolution/team_confirm_result": "Confirm a result in review",
      "resolution/team_void_campaign": "Record the cause of an automatic void",
      "resolution/team_open_contest": "Open a contest",
      "resolution/team_shared": null,
      "resolution/void_reason": null,
      "resolution/window": null,
      "settlement/tally_late_joins": "Resolve, settle and pay",
      "settlement/finalize_campaign": "Resolve, settle and pay",
      "settlement/settle_entry": "Resolve, settle and pay",
      "settlement/settle_creator_share": "Resolve, settle and pay",
      "settlement/settle_prize": "Resolve, settle and pay",
      "settlement/collect_fee": "Resolve, settle and pay",
      "settlement/close_campaign": "Resolve, settle and pay",
      "settlement/sweep_fees": "Move Brot's fees",
      "settlement/bookkeeping": null,
      "settlement/rules": null,
      "settlement/snapshot": null,
      // The scaffold of Sprints 14–15 (2026-10-13): any wallet, and the program chooses every result and destination.
      "resolution/reread_campaign": "Resolve, settle and pay",
      "settlement/settle_sealed_fee": "Resolve, settle and pay",
      // Sprint 14, lane L14B: the admin's decision at a contest's second stage (a new row: the founders' review).
      "resolution/admin_decide_contest": "Decide a contest at its second stage",
      "resolution/contest_decision": null,
      "resolution/contest_reread": null,
      "resolution/contest_rules": null,
    };
    // A stub that refuses every call until its lane, which maps it above and names its power in content/powers.md (a
    // new row needs the founders).
    const PENDING: string[] = [];
    const dir = `${import.meta.dir}/../../programs/brot-markets/src/instructions`;
    const files = ["admin", "campaigns", "resolution", "settlement"].flatMap((folder) =>
      [...new Bun.Glob("*.rs").scanSync({ cwd: `${dir}/${folder}` })]
        .filter((f) => f !== "mod.rs")
        .map((f) => `${folder}/${f.replace(/\.rs$/, "")}`),
    );
    expect(files.filter((f) => !(f in ROW) && !PENDING.includes(f))).toEqual([]);
    expect(PENDING.filter((f) => !files.includes(f) || f in ROW)).toEqual([]);
    const { blocks } = loadPowers();
    const table = blocks.find((b) => b.kind === "table" && b.head[0] === "Power");
    const powers = table?.kind === "table" ? table.rows.map((r) => r[0]) : [];
    for (const row of new Set(Object.values(ROW).filter((r): r is string => r !== null)))
      expect(`${row}: ${powers.includes(row)}`).toBe(`${row}: true`);
    expect(powers).toContain("Open a campaign without paying");
    expect(powers).toContain("Move or take a baker's entry");
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
