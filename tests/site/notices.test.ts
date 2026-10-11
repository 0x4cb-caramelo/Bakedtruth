/**
 * Purpose: every mandatory notice is on its screen (Sprint 13 DoD; BR-47, P1 §4.6): each notice of
 *          app/features/notices/registry.ts is drawn by the component it names, and the screens are rendered with the
 *          site's React on the server: the two notices of every screen in the layout; the lock, estimate, fee and
 *          one-sided notices before signing; the creator notice on a burn campaign's page and not on a price
 *          campaign's; the review rule and "Waiting for payout" in their states; BP-5's line on How it works; L-09's on
 *          the leaderboard; since Sprint 19, the creation box's preview (the creator notice on a burn campaign and not on
 *          a price one, with who else can move the number, the no-entry rule, no taking it back) and its review sheet of
 *          a prepared opening (every notice before signing; a team key's free opening without the prize's). No notice
 *          promises an automatic payout or a time. The web smoke checks the same on the built site.
 *          Filter: `bun test tests/ -t "every mandatory notice is on its screen"`.
 * Version: 0.3.0 (Sprint 19: the creation box and its review sheet)
 * Sprint:  13 (site: ranking, notices and copy); 19
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createSolanaRpc } from "@solana/kit";
import { bytesToHex } from "@brot/sdk/read";

import { MANDATORY_NOTICES } from "../../app/features/notices/registry";
import { loadCampaignPage, type PageData } from "../../app/features/campaign-page/load";
import { proofOf } from "../../app/features/campaign-page/proof";
import { PREVIEW } from "../../app/features/open-campaign/copy";
import { RETURNS_DEVNET_TEAM } from "../../app/features/open-campaign/copy-money";
import { EMPTY_DRAFT } from "../../app/features/open-campaign/draft";
import { previewFacts } from "../../app/features/open-campaign/preview";
import { prepareOpening } from "../../app/features/open-campaign/submit";
import { BTC_PRICE, newId } from "../brot/flows";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import * as R from "../brot/readers";
import { anyAddress, campaignOn } from "../brot/resolve-support";
import { now } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { injectState } from "./state-world";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;
const notice = (id: string) => MANDATORY_NOTICES.find((n) => n.id === id)!.text;
type Render = (component: unknown, props?: Record<string, unknown>) => string;
let render: Render;
let C: Record<string, unknown> = {};
let w: OpeningWorld;
let chain: FakeChain;

/** Text without markup, entities decoded, so a sentence split by an element still matches. */
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

beforeAll(async () => {
  const react = await import(site("node_modules/react/index.js"));
  const server = await import(site("node_modules/react-dom/server.node.js"));
  const { WalletContext } = await import(site("node_modules/@solana/wallet-adapter-react/lib/esm/index.js"));
  const none = { publicKey: null, connected: false, wallets: [], wallet: null, sendTransaction: async () => "" };
  render = (component, props = {}) =>
    text(
      server.renderToStaticMarkup(
        react.createElement(WalletContext.Provider, { value: none }, react.createElement(component, props)),
      ),
    );
  C = {
    SiteNotice: (await import(site("components/site-notice.tsx"))).SiteNotice,
    EntryNotices: (await import(site("features/entry/entry-notices.tsx"))).EntryNotices,
    StatePanel: (await import(site("features/campaign-page/state-panel.tsx"))).StatePanel,
    CampaignHeader: (await import(site("features/campaign-page/campaign-header.tsx"))).CampaignHeader,
    HowPage: (await import(site("features/how/how-page.tsx"))).HowPage,
    LeaderboardPage: (await import(site("features/leaderboard/leaderboard.tsx"))).LeaderboardPage,
    PreviewSection: (await import(site("features/open-campaign/preview-section.tsx"))).PreviewSection,
    OpenReview: (await import(site("features/open-campaign/open-review.tsx"))).OpenReview,
  };
  w = await openingWorld();
  chain = startFakeChain(w);
});
afterAll(() => chain.close());

async function page(id: bigint): Promise<PageData> {
  const data = await loadCampaignPage(createSolanaRpc(chain.url), id, null);
  if (!data) throw new Error("no campaign");
  return data;
}

describe("every mandatory notice is on its screen", () => {
  test("each notice has words and a screen, and the component it names draws it", () => {
    expect(MANDATORY_NOTICES.length).toBeGreaterThanOrEqual(15);
    for (const n of MANDATORY_NOTICES) {
      expect(`${n.id}: ${n.text.length > 0 && n.screens.length > 0}`).toBe(`${n.id}: true`);
      for (const d of n.drawnBy)
        expect(`${n.id} in ${d.file}: ${readFileSync(site(d.file), "utf8").includes(d.uses)}`).toBe(
          `${n.id} in ${d.file}: true`,
        );
    }
  });

  test("every screen: the devnet and not-audited notices, mounted once in the root layout", () => {
    const html = render(C.SiteNotice);
    expect(html).toContain(notice("devnet"));
    expect(html).toContain(notice("unaudited"));
    expect(readFileSync(site("app/layout.tsx"), "utf8")).toContain("<SiteNotice />");
  });

  test("before signing: the lock (L-03's devnet words), the estimate, the fee and the one-sided refund", () => {
    const html = render(C.EntryNotices, { feeBps: 1_000, creatorShareBps: 100, oneSidedFeeBps: 100, large: null });
    for (const id of ["lock", "estimate", "fee", "one-sided"])
      expect(`${id}: ${html.includes(notice(id))}`).toBe(`${id}: true`);
    expect(notice("lock")).toEndWith("on devnet that is not automatic yet, and no time is promised.");
  });

  test("the creator notice on a burn campaign's page, and not on a price campaign's", async () => {
    const mint = await anyAddress();
    R.setRawAccount(w.client, mint, R.mintBytes({ supply: 1_000_000n, mintAuthority: null }), P.SPL_TOKEN_PROGRAM_ID);
    const id = 9_000_001n;
    await campaignOn(w, P.ReaderKind.SupplyAtMost, mint, 990_000n, { id });
    const burn = await page(id);
    const header = (data: PageData) =>
      render(C.CampaignHeader, { data, proof: proofOf(data.campaign, data.metric, data.chain), sentence: "s" });
    expect(header(burn)).toContain(notice("creator"));
    const price = await page((await injectState(w, "closed")).id);
    expect(header(price)).not.toContain(notice("creator"));
  });

  test('in review, the rule that promises no time; paid and waiting, "Waiting for payout"; a wrong result\'s channel', async () => {
    const panel = async (name: "review" | "split-waiting") => {
      const data = await page((await injectState(w, name)).id);
      return render(C.StatePanel, {
        data,
        proof: proofOf(data.campaign, data.metric, data.chain),
        entriesTaken: true,
        note: null,
      });
    };
    const review = await panel("review");
    expect(review).toContain(notice("review"));
    expect(review).toContain(notice("report-result"));
    expect(await panel("split-waiting")).toContain(notice("waiting"));
    for (const n of MANDATORY_NOTICES)
      expect(`${n.id}: ${/paid automatically|in minutes|within \d+ (hours|minutes)/i.test(n.text)}`).toBe(
        `${n.id}: false`,
      );
  });

  test("the creation box: the creator notice on a burn campaign's preview, not on a price one's; the no-entry rule", () => {
    const preview = (kind: "burn" | "price") => {
      const draft = { ...EMPTY_DRAFT, kind, account: kind === "burn" ? P.SOL_USD_ACCOUNT : "" };
      const slot = { status: "checking" } as const;
      const facts = previewFacts({ draft, check: null, world: null, slot, names: [], wallet: null });
      return render(C.PreviewSection, { facts, footer: null });
    };
    const burn = preview("burn");
    expect(burn).toContain(notice("creator-opening"));
    expect(burn).toContain(PREVIEW.othersCanPush.burn);
    expect(notice("creator-opening")).toContain(notice("creator"));
    expect(preview("price")).not.toContain(notice("creator"));
    for (const id of ["no-entry", "no-take-back"]) expect(`${id}: ${burn.includes(notice(id))}`).toBe(`${id}: true`);
  });

  test("the review sheet of an opening: every notice before signing; a team key's free one drops the prize's", async () => {
    const rpc = createSolanaRpc(chain.url);
    const sheet = async (creator: string, openingUsd: bigint) => {
      const choice = {
        kind: P.ReaderKind.PriceTouch,
        feedId: bytesToHex(P.BTC_USD_FEED_ID),
        target: (BTC_PRICE * 11n) / 10n,
        deadlineAt: now(w.client) + 7n * P.DAY,
        openingUsd,
      };
      const prepared = ready(await prepareOpening({ rpc, creator, choice, id: newId() }));
      const props = { ready: prepared, choice, metric: P.BTC_USD_ACCOUNT, names: [], persists: true, refreshed: false };
      return render(C.OpenReview, { ...props, onBack: () => undefined, onSign: () => undefined });
    };
    const paid = await sheet(w.creator.address, 500n);
    const ids = ["devnet-opening", "prize-fate", "no-take-back", "no-entry", "returns-devnet", "public-opening"];
    for (const id of ids) expect(`${id}: ${paid.includes(notice(id))}`).toBe(`${id}: true`);
    const free = await sheet(w.team.address, 0n);
    for (const id of ["prize-fate", "no-take-back", "no-entry", "returns-devnet"])
      expect(`${id}: ${free.includes(notice(id))}`).toBe(`${id}: false`);
    for (const id of ["devnet-opening", "public-opening"])
      expect(`${id}: ${free.includes(notice(id))}`).toBe(`${id}: true`);
    expect(free).toContain(RETURNS_DEVNET_TEAM);
  });

  test("How it works says BP-5's line; the leaderboard says what points are worth (L-09)", () => {
    expect(render(C.HowPage)).toContain(notice("no-human"));
    const board = render(C.LeaderboardPage);
    expect(board).toContain(notice("points-worth"));
    expect(board).toContain(notice("leave-ranking"));
  });
});
