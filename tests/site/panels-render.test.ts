/**
 * Purpose: blocks of the site rendered with its React on the server. The entry panel's sides: each button holds only
 *          "YES" or "NO", and the line under it (the chance, then the estimate per 1, or the refund while alone)
 *          describes it to screen readers. A card's sides: the word alone in the button, what 1 SOL returns under it,
 *          one link for both. A graduation campaign's proof details: the pool and the token's mint (its CA), each linked
 *          to the explorer and copied by its own button, while the title names the curve by its ticker. Filter:
 *          `bun test tests/ -t "panels render"`. Needs the SBF build.
 * Version: 0.1.1 (a card's sides)
 * Sprint:  the sixth kind's site, after 05
 *
 * The components are imported by a computed path, so the tests' typecheck does not follow them into the site's TSX
 * (the site typechecks them with its own configuration).
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";

import { decodeCampaign } from "@brot/sdk/read";

import { loadCampaignPage } from "../../app/features/campaign-page/load";
import { proofOf } from "../../app/features/campaign-page/proof";
import { toCard } from "../../app/features/campaigns/model";
import { PANEL } from "../../app/features/entry/copy";
import { perOne } from "../../app/features/entry/estimate";
import type { Campaign } from "../../app/lib/api-client";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { setFixture } from "../brot/readers";
import { campaignOn } from "../brot/resolve-support";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { rawOf } from "./support";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;
type Render = (component: unknown, props: Record<string, unknown>) => string;
let render: Render;
let SidePicker: unknown;
let ProofPanel: unknown;
let CampaignCard: unknown;
let chain: FakeChain | null = null;

beforeAll(async () => {
  const react = await import(site("node_modules/react/index.js"));
  const server = await import(site("node_modules/react-dom/server.node.js"));
  render = (component, props) => server.renderToStaticMarkup(react.createElement(component, props));
  SidePicker = (await import(site("features/entry/side-picker.tsx"))).SidePicker;
  ProofPanel = (await import(site("features/campaign-page/proof-panel.tsx"))).ProofPanel;
  CampaignCard = (await import(site("features/campaigns/campaign-card.tsx"))).CampaignCard;
});
afterAll(() => chain?.close());

const VIEWS = [
  { side: "yes", chance: 62, perOne: "2.8826", alone: false },
  { side: "no", chance: 38, perOne: null, alone: true },
];
const NOW = 1_800_000_000n;
const SOL = 1_000_000_000n;

/** A campaign as the read API lists it: an open BTC/USD campaign with no entry, unless `over` says otherwise. */
const listed = (over: Partial<Campaign> = {}): Campaign => ({
  address: "FmDoXD1qx2ZfLr71WjrHHxFhLqDRkA6s24je1YfCj1Ho",
  id: "7",
  state: "open",
  kind: "PriceTouch",
  status: "Open",
  outcome: "Unresolved",
  creator: "creator",
  creator_is_team: true,
  pool_yes: "0",
  pool_no: "0",
  prize_lamports: "0",
  entries_close_at: "1800500000",
  deadline_at: "1800900000",
  review_ends_at: null,
  resolved_at: "0",
  target: "8366041574000",
  metric_account: "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
  feed_id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  direction: "Above",
  price_exponent: -8,
  opens_at: "1799000000",
  entries_count: 0,
  fee_bps: 1000,
  one_sided_fee_bps: 100,
  creator_share_bps: 100,
  ...over,
});

describe("panels render", () => {
  test("each side's button holds only its word; its chance and estimate sit under it and describe it", () => {
    const html = render(SidePicker, { value: "yes", views: VIEWS, onChange: () => undefined });
    const buttons = [...html.matchAll(/<button([^>]*)>([^<]*)<\/button>/g)];
    expect(buttons.map((b) => b[2])).toEqual(["YES", "NO"]);
    expect(buttons[0][1]).toContain('aria-pressed="true"');
    expect(buttons[1][1]).toContain('aria-pressed="false"');
    const lines = [...html.matchAll(/<p id="([^"]+)" class="side-est">(.*?)<\/p>/g)];
    expect(lines.map((l) => l[2])).toEqual([
      '<b>62%</b><span aria-hidden="true">·</span>est. 2.8826 per 1',
      '<b>38%</b><span aria-hidden="true">·</span>refund if alone',
    ]);
    // Each line describes its own button, by an id unique to the panel.
    for (const [i, line] of lines.entries()) expect(buttons[i][1]).toContain(`aria-describedby="${line[1]}"`);
    expect(new Set(lines.map((l) => l[1])).size).toBe(2);
    // An empty pot: no chance yet, and nothing to estimate.
    const empty = render(SidePicker, {
      value: "no",
      views: VIEWS.map((v) => ({ ...v, chance: null, perOne: null, alone: false })),
      onChange: () => undefined,
    });
    expect([...empty.matchAll(/class="side-est">(.*?)<\/p>/g)].map((l) => l[1])).toEqual(["", ""]);
  });

  test("a card's YES and NO hold only their word; what 1 SOL returns sits under each, in the same link", () => {
    const card = toCard(listed({ pool_yes: String((16n * SOL) / 10n), pool_no: String(SOL), entries_count: 2 }), NOW);
    const html = render(CampaignCard, { card, now: NOW, reading: null, saved: false, onToggle: () => undefined });
    const cells = [...html.matchAll(/<a ([^>]*class="side-cell"[^>]*)>(.*?)<\/a>/g)];
    expect(cells.map((c) => /href="([^"]+)"/.exec(c[1])?.[1])).toEqual([
      `/c/${card.id}?side=yes`,
      `/c/${card.id}?side=no`,
    ]);
    expect(cells.map((c) => c[2])).toEqual([
      `<span class="side-btn yes">YES</span><span class="side-est">${PANEL.perOne(perOne(card.estYesBps!))}</span>`,
      `<span class="side-btn no">NO</span><span class="side-est">${PANEL.perOne(perOne(card.estNoBps!))}</span>`,
    ]);
    // A campaign with no entry: the words alone, never "Join YES", and the note under both.
    const empty = render(CampaignCard, { card: toCard(listed(), NOW), now: NOW, reading: null, saved: false });
    expect([...empty.matchAll(/<span class="side-btn (?:yes|no)">([^<]*)<\/span>/g)].map((m) => m[1])).toEqual([
      "YES",
      "NO",
    ]);
    expect(empty).not.toContain('class="side-est"');
    expect(empty).toContain("No entries yet");
  });

  test("a graduation campaign's proof details: the pool and the token's mint, each linked and copied", async () => {
    const w = await openingWorld();
    const pool = setFixture(w.client, "dbc-pool-stage0").address;
    const c = await campaignOn(w, P.ReaderKind.DbcGraduated, pool, 85n * P.SOL);
    chain = startFakeChain(w);
    const id = decodeCampaign(rawOf(w, c.campaign)).id;
    const data = await loadCampaignPage(createSolanaRpc(chain.url), id, null);
    if (!data) throw new Error("the campaign page did not load");
    const html = render(ProofPanel, { data, proof: proofOf(data.campaign, data.metric, data.chain) });
    expect(html).toContain("Account read");
    expect(html).toContain('title="mxGZ5hpgCENm94f19rp8NoBd14E4YLXVe4ZFJXQP8S6"');
    expect(html).toContain('aria-label="Copy Account read"');
    expect(html).toContain("Token mint (CA)");
    expect(html).toContain('title="6PW26Tqsuc6qeNK6Cp7mWj1KuM1X7NUCG97x6MJHBAGS"');
    expect(html).toContain("6PW2…BAGS");
    expect(html).toContain('aria-label="Copy Token mint (CA)"');
  });
});
