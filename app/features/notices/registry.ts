/**
 * Purpose: every mandatory notice that holds on devnet (BR-47; P1 §4.6; TP §3.6 "Notices and copy"; Sprint 13 DoD),
 *          each with the screens that must show it and the component that draws it, so one test checks them all
 *          (tests/site/notices.test.ts) and the web smoke looks for them on the real pages. The words come from their
 *          copy files: this list adds none. P1 §4.6's line on an automatic payout at the end of the 6-hour window is
 *          not here: on devnet nothing pays out by itself yet, so the founder replaced it (2026-10-10) with the review
 *          rule and "Waiting for payout", which promise no time.
 * Version: 0.3.0 (Sprint 19: the creation box's notices, registry-open.ts; 0.2.2, the footer's age line; 0.2.1,
 *          answer 9a: the footer's privacy link; 0.2.0, the Sprint 13 adversarial review)
 * Sprint:  13 (site: ranking, notices and copy); 19
 */
import { AGE_NOTICE, AUDIT_NOTICE, PRIVACY_LABEL, TEST_NOTICE } from "../../components/copy-site";
import { CREATOR_NOTICE } from "../campaign-page/copy";
import { REPORT, STATES, WAITING } from "../campaign-page/copy-states";
import { LOCK_NOTICE, NOTICES, SHEET } from "../entry/copy";
import { PRINCIPLE } from "../how/copy";
import { BOARD, POINTS_WORTH } from "../leaderboard/copy";
import { REPORT_CAMPAIGN } from "../report/copy";
import { OPEN_NOTICES } from "./registry-open";

export type MandatoryNotice = {
  id: string;
  /** Where the rule comes from. */
  source: string;
  text: string;
  /** The screens that must show it, in words. */
  screens: string;
  /** The component (under app/) that draws it, and the name it draws it by. */
  drawnBy: { file: string; uses: string }[];
};

export const MANDATORY_NOTICES: readonly MandatoryNotice[] = [
  {
    id: "devnet",
    source: "P1 §4.6; BR-47",
    text: TEST_NOTICE,
    screens: "every screen",
    drawnBy: [
      { file: "components/site-notice.tsx", uses: "TEST_NOTICE" },
      { file: "app/layout.tsx", uses: "<SiteNotice />" },
    ],
  },
  {
    id: "unaudited",
    source: 'BR-47 ("Programa ainda sem auditoria")',
    text: AUDIT_NOTICE,
    screens: "every screen",
    drawnBy: [
      { file: "components/site-notice.tsx", uses: "AUDIT_NOTICE" },
      { file: "app/layout.tsx", uses: "<SiteNotice />" },
    ],
  },
  {
    id: "privacy-link",
    source: "TP §8.2; the legal review (M5); the founder's answer 9a (2026-10-10)",
    text: PRIVACY_LABEL,
    screens: "every screen, in the footer, linking PRIVACY_URL (app/lib/config.ts)",
    drawnBy: [
      { file: "components/site-footer.tsx", uses: "href={PRIVACY_URL}" },
      { file: "app/layout.tsx", uses: "<SiteFooter />" },
    ],
  },
  {
    id: "adults",
    source: "the founder (2026-10-10): the age rule, which lived in the terms (down until Sprint 17)",
    text: AGE_NOTICE,
    screens: "every screen, in the footer",
    drawnBy: [
      { file: "components/site-footer.tsx", uses: "{AGE_NOTICE}" },
      { file: "app/layout.tsx", uses: "<SiteFooter />" },
    ],
  },
  {
    id: "lock",
    source: "L-03, the founder's devnet wording (2026-10-10); BR-12",
    text: LOCK_NOTICE,
    screens: "the entry panel and the review sheet, before signing",
    drawnBy: [
      { file: "features/entry/entry-notices.tsx", uses: "NOTICES.lock" },
      { file: "features/entry/entry-panel.tsx", uses: "<EntryNotices" },
      { file: "features/entry/entry-review.tsx", uses: "<EntryNotices" },
    ],
  },
  {
    id: "estimate",
    source: "BR-09; P1 §3.2",
    text: NOTICES.estimate,
    screens: "the entry panel and the review sheet, before signing",
    drawnBy: [
      { file: "features/entry/entry-notices.tsx", uses: "NOTICES.estimate" },
      { file: "features/entry/entry-panel.tsx", uses: "<EntryNotices" },
    ],
  },
  {
    id: "fee",
    source: "BR-09; P1 §3.3, §3.4",
    text: NOTICES.fee(1_000, 100),
    screens: "the entry panel and the review sheet, before signing",
    drawnBy: [
      { file: "features/entry/entry-notices.tsx", uses: "NOTICES.fee" },
      { file: "features/entry/entry-panel.tsx", uses: "<EntryNotices" },
    ],
  },
  {
    id: "one-sided",
    source: "BR-10; P1 §3.5",
    text: NOTICES.oneSided(100),
    screens: "the entry panel and the review sheet, before signing",
    drawnBy: [
      { file: "features/entry/entry-notices.tsx", uses: "NOTICES.oneSided" },
      { file: "features/entry/entry-panel.tsx", uses: "<EntryNotices" },
    ],
  },
  {
    id: "public-entries",
    source: "TP §8, question 8: entries are public and permanent, said before the first entry",
    text: SHEET.public,
    screens: "the review sheet of a wallet's first entry in a campaign",
    drawnBy: [{ file: "features/entry/entry-review.tsx", uses: "SHEET.public" }],
  },
  {
    id: "creator",
    source: "BR-26; BP-14 as recommended (P-9)",
    text: CREATOR_NOTICE,
    screens: "the page and the card of every burn, lock and stake campaign",
    drawnBy: [
      { file: "features/campaign-page/campaign-header.tsx", uses: "CREATOR_NOTICE" },
      { file: "features/campaigns/campaign-card.tsx", uses: "CREATOR_NOTICE" },
    ],
  },
  {
    id: "review",
    source: "P1 §4.5; the founder's devnet payout wording (2026-10-10), in place of P1 §4.6's",
    text: STATES.reviewRule,
    screens: "the campaign page while in review",
    drawnBy: [{ file: "features/campaign-page/state-panel.tsx", uses: "STATES.reviewRule" }],
  },
  {
    id: "waiting",
    source: "the founder's devnet payout wording (2026-10-10)",
    text: WAITING,
    screens: 'a paid campaign\'s page and "My entries", while payouts wait',
    drawnBy: [
      { file: "features/campaign-page/state-panel.tsx", uses: "STATES.waiting" },
      { file: "features/campaign-page/payout-panel.tsx", uses: "WAITING" },
      { file: "features/my-entries/entry-row.tsx", uses: "WAITING" },
    ],
  },
  {
    id: "report-result",
    source: "L-13 (https://x.com/brotmarkets)",
    text: REPORT.text,
    screens: "the campaign page, once the result is read",
    drawnBy: [{ file: "features/campaign-page/state-panel.tsx", uses: "REPORT.text" }],
  },
  {
    id: "report-campaign",
    source: "C-10; [Q] answered 5a (2026-10-10)",
    text: REPORT_CAMPAIGN.link,
    screens: "every campaign page, in every state",
    drawnBy: [{ file: "features/campaign-page/campaign-page.tsx", uses: "ReportCampaign" }],
  },
  {
    id: "no-human",
    source: "BP-5, approved (P-9; answer 6a, 2026-10-10)",
    text: PRINCIPLE,
    screens: "How it works",
    drawnBy: [{ file: "features/how/how-page.tsx", uses: "HOW.more" }],
  },
  {
    id: "leave-ranking",
    source: "TP §8.2, the privacy review (question 8; answer 8a): who runs the ranking, how to leave it, in 15 days",
    text: BOARD.leave,
    screens: "the leaderboard",
    drawnBy: [{ file: "features/leaderboard/leaderboard.tsx", uses: "BOARD.leave" }],
  },
  {
    id: "points-worth",
    source: "L-09, answered 2a (2026-10-10)",
    text: POINTS_WORTH,
    screens: "the leaderboard",
    drawnBy: [{ file: "features/leaderboard/leaderboard.tsx", uses: "BOARD.how" }],
  },
  ...OPEN_NOTICES,
];
