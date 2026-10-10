/**
 * Purpose: every public state of the campaign page renders what the chain says (Sprint 12 DoD), one case per state:
 *          a campaign account in that state is written into the program's world, read by the page's own loader
 *          through the recording RPC, and the state panel and the wallet's payout panel are rendered with the site's
 *          React on the server. The words are copy-states.ts; the amounts are the SDK's mirror of the program.
 *          Filter: `bun test tests/ -t "every public state renders"`.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * The components are imported by a computed path, so the tests' typecheck does not follow them into the site's TSX
 * (the site typechecks them with its own configuration).
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createSolanaRpc, type Address } from "@solana/kit";

import { entryOwed, VoidReason } from "@brot/sdk/read";

import { exactSol, REPORT, STATES, VOID_REASON, WAITING } from "../../app/features/campaign-page/copy-states";
import { stateChip } from "../../app/features/campaign-page/format";
import { loadCampaignPage, type PageData } from "../../app/features/campaign-page/load";
import { chipOf } from "../../app/features/campaigns/state-line";
import { proofOf } from "../../app/features/campaign-page/proof";
import { injectEntry } from "../brot/campaigns";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fundedWallet } from "../brot/setup";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { injectState, NOTE_HASH, type StateName } from "./state-world";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;
type Render = (component: unknown, props: Record<string, unknown>) => string;
let render: Render;
let renderDisconnected: Render;
let StatePanel: unknown;
let PayoutPanel: unknown;
let StateChip: unknown;
let w: OpeningWorld;
let chain: FakeChain;

beforeAll(async () => {
  const react = await import(site("node_modules/react/index.js"));
  const server = await import(site("node_modules/react-dom/server.node.js"));
  render = (component, props) => server.renderToStaticMarkup(react.createElement(component, props));
  // A wallet context with nothing connected, as the site's provider gives before a wallet connects.
  const { WalletContext } = await import(site("node_modules/@solana/wallet-adapter-react/lib/esm/index.js"));
  const disconnected = {
    publicKey: null,
    connected: false,
    wallets: [],
    wallet: null,
    sendTransaction: async () => "",
  };
  renderDisconnected = (component, props) =>
    server.renderToStaticMarkup(
      react.createElement(WalletContext.Provider, { value: disconnected }, react.createElement(component, props)),
    );
  StatePanel = (await import(site("features/campaign-page/state-panel.tsx"))).StatePanel;
  PayoutPanel = (await import(site("features/campaign-page/payout-panel.tsx"))).PayoutPanel;
  StateChip = (await import(site("components/ui/state-chip.tsx"))).StateChip;
  w = await openingWorld();
  chain = startFakeChain(w);
});
afterAll(() => chain.close());

const SOL_HALF = 500_000_000n;

/** A campaign in state `name`, read back as the page reads it. */
const pageIn = async (name: StateName, extra: Record<string, unknown> = {}) =>
  read((await injectState(w, name, extra)).id);

async function read(id: bigint, wallet: string | null = null): Promise<PageData> {
  const page = await loadCampaignPage(createSolanaRpc(chain.url), id, wallet);
  if (!page) throw new Error("no campaign");
  return page;
}

const panel = (data: PageData, note: unknown = null) =>
  render(StatePanel, { data, proof: proofOf(data.campaign, data.metric, data.chain), entriesTaken: true, note });

/** Text without markup, so a sentence split by an element still matches. */
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

describe("every public state renders", () => {
  test("closed on time, and closed because the answer is already on-chain", async () => {
    const onTime = text(panel(await pageIn("closed")));
    expect(onTime).toContain(STATES.closed);
    expect(onTime).toContain("Entries closed on schedule");
    const known = text(panel(await pageIn("knowable")));
    expect(known).toContain(STATES.closedKnowable);
    expect(known).not.toContain(REPORT.link);
  });

  test("in review: the result, the value read, the target, the account, the clock, the rule and the report link", async () => {
    const html = text(panel(await pageIn("review")));
    const words = [STATES.review, STATES.resultRead("YES"), STATES.valueRead, STATES.target, P.BTC_USD_ACCOUNT];
    for (const w of [...words, "03:00:00 left", STATES.reviewRule, REPORT.link]) expect(html).toContain(w);
    expect(html).not.toMatch(/minutes|automatically/i);
  });

  test("contested: the payout paused and the new deadline", async () => {
    const html = text(panel(await pageIn("contested")));
    for (const words of [STATES.contested, STATES.contestedText, "The check is set to end"])
      expect(html).toContain(words);
  });

  test("paid: a split waiting for payout, a one-sided pot paid out, and a pot nobody entered", async () => {
    const split = text(panel(await pageIn("split-waiting")));
    for (const words of [STATES.paid("YES"), STATES.split("YES"), WAITING]) expect(split).toContain(words);
    const oneSided = text(panel(await pageIn("one-sided")));
    for (const words of [STATES.oneSided, STATES.prizeBack, STATES.allPaid]) expect(oneSided).toContain(words);
    const empty = text(panel(await pageIn("empty")));
    expect(empty).toContain(STATES.empty);
    expect(empty).toContain(STATES.emptyPaid);
  });

  test("void: the public reason, the team's note, the refunds, and the opening fee by cause", async () => {
    const house = await injectState(w, "void-house");
    const note = {
      file: "x.md",
      campaign: house.campaign,
      reason: "TeamHouseFailure",
      text: "Our keeper missed it.",
      sha256: NOTE_HASH,
    };
    const h = text(panel(await read(house.id), note));
    const words = [STATES.void, VOID_REASON[VoidReason.TeamHouseFailure], "Our keeper missed it.", STATES.refunded];
    for (const w of [...words, STATES.prizeBack, STATES.feeRefunded, WAITING, REPORT.link]) expect(h).toContain(w);
    const outside = text(panel(await pageIn("void-outside")));
    expect(outside).toContain(STATES.feeKept);
    expect(outside).toContain(STATES.allPaid);
    const stale = text(panel(await pageIn("void-stale")));
    expect(stale).toContain("price feed stopped updating before the deadline");
    expect(stale).toContain("rather than the campaign resolving NO");
    const empty = text(panel(await pageIn("void-empty")));
    expect(empty).toContain(STATES.feeKeptEmpty);
    expect(empty).not.toContain(STATES.feeRefunded);
  });

  test("the wallet's payout: the exact amount waiting, and the creator's reserved share", async () => {
    const baker = await fundedWallet(w);
    const snap = { winning_total: 600_000_000n, distributable: 955_000_000n, creator_share: 1_000_000n };
    const reserve = { creator_share_settled: 1, creator_share_reserved: 1_000_000n };
    const { id, campaign } = await injectState(w, "split-waiting", { ...snap, ...reserve });
    await injectEntry(w.client, { campaign: campaign as Address, baker: baker.address, amountYes: 250_000_000n });
    const data = await read(id, baker.address);
    const owed = entryOwed(data.campaign, data.mine!).amount;
    const props = { data, wallet: baker.address, round: 0, onChange: () => {} };
    expect(text(render(PayoutPanel, props))).toContain(`${WAITING}: ${exactSol(owed)} SOL`);
    const creator = { ...props, data: await read(id, w.creator.address), wallet: w.creator.address };
    const asCreator = text(renderDisconnected(PayoutPanel, creator));
    expect(asCreator).toContain("Kept in the vault for you");
    expect(asCreator).toContain("Connect the creator's wallet to receive it.");
  });

  test("in review, an entry with a join not yet tallied shows an estimate, not an exact amount (security review M3)", async () => {
    const baker = await fundedWallet(w);
    const { id, campaign } = await injectState(w, "review");
    await injectEntry(w.client, {
      campaign: campaign as Address,
      baker: baker.address,
      amountYes: SOL_HALF,
      joinCount: 1,
    });
    const data = await read(id, baker.address);
    const html = text(render(PayoutPanel, { data, wallet: baker.address, round: 0, onChange: () => {} }));
    expect(html).toContain("If this result stands: est.");
    expect(html).toContain("until every join is tallied");
    await injectEntry(w.client, {
      campaign: campaign as Address,
      baker: baker.address,
      amountYes: SOL_HALF,
      joinCount: 1,
      joinsTallied: 1,
    });
    const tallied = text(
      render(PayoutPanel, { data: await read(id, baker.address), wallet: baker.address, round: 0, onChange: () => {} }),
    );
    expect(tallied).toMatch(/If this result stands: \d/);
  });

  test("the chip says Paid only once the entries are paid out, and Result final before (founder's answer 3a)", async () => {
    expect(stateChip((await pageIn("split-waiting")).view)).toBe("final");
    expect(stateChip((await pageIn("one-sided")).view)).toBe("paid");
    expect(stateChip((await pageIn("void-stale")).view)).toBe("void");
    expect(chipOf({ state: "paid", status: "Settling" })).toBe("final");
    expect(chipOf({ state: "paid", status: "Settled" })).toBe("paid");
    expect(text(render(StateChip, { state: "final" }))).toBe("Result final");
  });
});
