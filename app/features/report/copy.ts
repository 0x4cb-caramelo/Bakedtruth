/**
 * Purpose: the words of "Report this campaign" (C-10; Sprint 13; D-m vocabulary; English per L-01): where a report goes,
 *          what the team can do about it (unlist the campaign from the home page; it stays on-chain, resolves and pays,
 *          proposal §2.7), and the line a campaign the team unlisted shows. Where a report leads is a founder question
 *          ([Q], Sprint 13): built as recommended, the same X account as a wrong result (L-13), from one constant.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { REPORT } from "../campaign-page/copy-states";

export const REPORT_CAMPAIGN = {
  /** [Q], open: the same channel as L-13 (https://x.com/brotmarkets), as recommended. A plain link, never an X script. */
  url: REPORT.url,
  link: "Report this campaign",
  where: (id: string) => `on X, at x.com/brotmarkets. Mention campaign ${id}.`,
  remedy:
    "If a campaign is misleading or abusive, the team can unlist it from the home page. It stays on-chain, keeps its link, resolves and pays as usual.",
  unlisted:
    "The team unlisted this campaign from the home page after a report. It stays on-chain, resolves and pays as usual.",
  reason: (text: string) => `Reason: ${text}`,
} as const;
