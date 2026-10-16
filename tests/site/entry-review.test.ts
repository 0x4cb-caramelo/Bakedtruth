/**
 * Purpose: the sheet "Check before you sign" in its redesign of 2026-10-15, rendered with the site's React on the server
 *          from a prepared join: the side as a badge, what you pay (rounded up) against what comes back, the exact
 *          total on the wallet line and in the cost breakdown, the program's fields with their raw values, the amount
 *          on the button; and every notice the sheet must show, word for word (L-03 in its two sentences, which join
 *          back to the founder's text; the estimate, the fee, the refunds, devnet; the public line only before a first
 *          entry; a large entry's numbers).
 *          Filter: `bun test tests/ -t "the review sheet"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), the sheet's redesign
 *
 * The components are imported by a computed path, so the tests' typecheck does not follow them into the site's TSX.
 */
import { beforeAll, describe, expect, test } from "bun:test";

import { LOCK_LINES, LOCK_NOTICE, NOTICES, SHEET, leadOf } from "../../app/features/entry/copy";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;
let render: (props: Record<string, unknown>) => string;

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
  const { EntryReview } = await import(site("features/entry/entry-review.tsx"));
  render = (props) => text(server.renderToStaticMarkup(react.createElement(EntryReview, props)));
});

/** A first entry of 0.1 SOL on NO, as the SDK prepares it: the rents of the two records and the fee on top. */
const ready = {
  ok: true,
  stage: "ready",
  check: { isFirst: false, estimateBps: 133_172n },
  expectedEntryTotal: 0n,
  minReturnBps: 131_840,
  simulation: { events: [{ name: "EntryAdded", data: { poolYes: 3_000_000_000n, poolNo: 800_000_000n } }] },
  summary: { lines: ["join_campaign side NO amount 100000000"] },
  debit: { amount: 100_000_000n, rents: 2_377_440n, networkFee: 5_000n, total: 102_382_440n },
};
const facts = {
  sentence: "BTC/USD falls to $75,000",
  campaignId: "8503728720462556838",
  feeBps: 1_000,
  creatorShareBps: 100,
  oneSidedFeeBps: 100,
  prizeLamports: 0n,
  fromLink: false,
  firstEntry: true,
  persists: true,
  large: null as { mine: string; small: string } | null,
};
const props = (over: Partial<typeof facts> = {}) => ({
  ready,
  choice: { campaign: "c", baker: "b", side: "no", amount: 100_000_000n },
  facts: { ...facts, ...over },
  refreshed: false,
  onBack: () => {},
  onSign: () => {},
});

describe("the review sheet", () => {
  test("what you pay against what comes back, the side as a badge, and the amount on the button", () => {
    const html = render(props());
    expect(html).toContain("Campaign #8503…6838");
    expect(html).toContain(`${SHEET.yourSide}NO`);
    expect(html).toContain(`${SHEET.youPay}0.1024SOL`); // rounded up: what leaves the wallet
    expect(html).toContain(SHEET.rentBack("0.0024"));
    expect(html).toContain(`${SHEET.ifWins("NO")}1.3317SOL13.3172× your entry`);
    expect(html).toContain(SHEET.sign("0.1024"));
    expect(html).toContain(`${SHEET.walletShows} 0.10238244 SOL. ${SHEET.walletDiffers}`);
  });

  test("the exact cost, and the program's fields with their raw values", () => {
    const html = render(props());
    expect(html).toContain(`${SHEET.cost}0.10238244 SOL`);
    for (const exact of ["0.100000000", "0.002377440", "0.000005000"]) expect(html).toContain(exact);
    expect(html).toContain("expected_entry_total 0.000000000");
    expect(html).toContain(SHEET.guardNote("0"));
    expect(html).toContain(`${SHEET.floor}13.184×`);
    expect(html).toContain("min_return_bps 131,840");
    expect(html).toContain("join_campaign side NO amount 100000000");
  });

  test("every notice before signing, word for word; the public line only before a first entry", () => {
    expect(LOCK_LINES.flat().join(" ")).toBe(LOCK_NOTICE);
    const first = render(props());
    for (const part of LOCK_LINES.flat()) expect(first).toContain(part);
    for (const notice of [
      NOTICES.estimate,
      NOTICES.fee(1_000, 100),
      NOTICES.oneSided(100),
      NOTICES.devnet,
      SHEET.public,
    ])
      expect(first).toContain(notice);
    // The bold lead is the notice's own first words: split and joined again, nothing changes.
    for (const notice of [NOTICES.estimate, NOTICES.largeEntry, NOTICES.devnet, SHEET.public])
      expect(leadOf(notice).join(" ")).toBe(notice);
    const again = render(props({ firstEntry: false, persists: false }));
    expect(again).not.toContain(SHEET.public);
    expect(again).toContain(SHEET.notKept);
  });

  test('while "Sign" checks the join, both buttons hold and say so; a join prepared with new terms says it', () => {
    const busy = render({ ...props(), busy: true });
    expect(busy).toContain(SHEET.readying);
    expect(busy).not.toContain(SHEET.sign("0.1024"));
    expect(render(props())).not.toContain(SHEET.refreshed);
    expect(render({ ...props(), refreshed: true })).toContain(`${SHEET.refreshed}Back`);
  });

  test("a large entry shows its effect on its side's return, with the notice and its numbers", () => {
    const html = render(props({ large: { mine: "13.3172", small: "15.1359" } }));
    expect(html).toContain(SHEET.moves);
    expect(html).toContain("15.1359× → 13.3172×");
    expect(html).toContain(`${NOTICES.largeEntry} ${NOTICES.largeEntryNumbers("15.1359", "13.3172")}`);
    expect(render(props())).not.toContain(SHEET.moves);
  });
});
