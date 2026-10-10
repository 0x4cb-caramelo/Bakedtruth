/**
 * Purpose: "Report this campaign" (C-10, Sprint 13 DoD): the link goes where reports go (the founder's [Q], built as
 *          recommended: the same X account as L-13), as a plain link; the remedy is unlisting, and the campaign stays
 *          on-chain with its entries, result and payouts unchanged; content/unlisted.json is checked as strictly as the
 *          void log (a bad entry fails the build, a reason may hold no personal data, each entry names one opening);
 *          and the site finds content/ or refuses to build.
 *          Filter: `bun test tests/ -t "report this campaign"`.
 * Version: 0.2.0 (the Sprint 13 reviews: the opening time, no "pays", a list that parses rather than an empty one)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";

import { contentDir } from "../../app/lib/content";
import { REPORT } from "../../app/features/campaign-page/copy-states";
import { REPORT_CAMPAIGN } from "../../app/features/report/copy";
import { loadUnlisted, parseUnlisted } from "../../app/features/report/unlisted";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;
let render: (props: Record<string, unknown>) => string;

beforeAll(async () => {
  const react = await import(site("node_modules/react/index.js"));
  const server = await import(site("node_modules/react-dom/server.node.js"));
  const { ReportCampaign } = await import(site("features/report/report-campaign.tsx"));
  render = (props) => server.renderToStaticMarkup(react.createElement(ReportCampaign, props));
});

const entry = (more: Record<string, unknown> = {}) => ({
  id: "42",
  opensAt: "1800000000",
  reason: "Misleading name.",
  at: "2026-10-10T18:00:00Z",
  ...more,
});

describe("report this campaign", () => {
  test("a plain link to the same X account as a wrong result, with the campaign's number and the remedy", () => {
    expect(REPORT_CAMPAIGN.url).toBe("https://x.com/brotmarkets");
    expect(REPORT_CAMPAIGN.url).toBe(REPORT.url);
    const html = render({ id: "42", unlisted: null });
    expect(html).toContain('href="https://x.com/brotmarkets"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Report this campaign");
    expect(html).toContain("send us a direct message, or mention us, with this page&#x27;s link (campaign 42)");
    expect(html).toContain("its entries, result and payouts do not change");
    expect(html).not.toMatch(/pays as usual|resolves and pays/);
    expect(html).not.toContain("<script");
  });

  test("an unlisted campaign says so, with the team's reason; nothing about it changes on-chain", () => {
    const html = render({ id: "42", unlisted: entry() });
    expect(html).toContain("The team unlisted this campaign from the home page");
    expect(html).toContain("Reason: Misleading name.");
  });

  test("the committed list parses; a bad entry or personal data in a reason is refused, never skipped", () => {
    expect(Array.isArray(loadUnlisted(join(contentDir(), "unlisted.json")))).toBe(true); // parses, whatever it holds
    expect(parseUnlisted(JSON.stringify([entry()]))).toEqual([entry()]);
    for (const bad of [
      {},
      [entry({ id: 42 })],
      [entry({ id: "-1" })],
      [entry({ id: "18446744073709551616" })],
      [entry({ reason: "" })],
      [entry({ reason: "Reported by @someone" })],
      [entry({ reason: "See brot.markets" })],
      [entry({ at: "yesterday" })],
      [entry({ opensAt: undefined })],
      [entry({ opensAt: "soon" })],
      [entry({ extra: 1 })],
    ])
      expect(() => parseUnlisted(JSON.stringify(bad))).toThrow();
  });

  test("the site finds content/ from app/ or the root, and refuses to build without it", () => {
    expect(contentDir(join(process.cwd(), "app"))).toBe(join(process.cwd(), "content"));
    expect(contentDir(process.cwd())).toBe(join(process.cwd(), "content"));
    expect(() => contentDir(join(process.cwd(), "packages", "sdk"))).toThrow("content/ was not found");
  });
});
