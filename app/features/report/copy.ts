/**
 * Purpose: the words of "Report this campaign" (C-10; Sprint 13; D-m vocabulary; English per L-01): where a report
 *          goes, what the team can do about it (unlist the campaign from the home page; it stays on-chain with its
 *          link, and its entries, result and payouts do not change, proposal §2.7), and the line a campaign the team
 *          unlisted shows. No line says it "pays": on devnet nothing pays out by itself yet. Where a report leads is
 *          the founder's answer 5a ([Q], Sprint 13, 2026-10-10): the same X account as a wrong result (L-13), one
 *          constant.
 * Version: 0.2.0 (the Sprint 13 copy and legal reviews: no line promises a payout; a direct message rather than a
 *          public post)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { REPORT } from "../campaign-page/copy-states";

export const REPORT_CAMPAIGN = {
  /** [Q], answered 5a: the same channel as L-13 (https://x.com/brotmarkets). A plain link, never an X script. */
  url: REPORT.url,
  link: "Report this campaign",
  where: (id: string) =>
    `on X, at x.com/brotmarkets: send us a direct message, or mention us, with this page's link (campaign ${id}).`,
  remedy:
    "If a campaign is misleading or abusive, the team can unlist it from the home page. It stays on-chain with its link, and its entries, result and payouts do not change.",
  unlisted: "The team unlisted this campaign from the home page. Its entries, result and payouts do not change.",
  reason: (text: string) => `Reason: ${text}`,
} as const;
