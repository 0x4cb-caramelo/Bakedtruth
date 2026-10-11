/**
 * Purpose: the mandatory notices of the creation box at /abrir (Sprint 19 DoD; BR-26; TP §3.4.10), listed with the
 *          screens that must show them and the components that draw them, joined to the site's list in registry.ts so
 *          tests/site/notices.test.ts checks them with the rest. The words come from their copy files.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { BOX, NO_ENTRY_RULE, NO_TAKE_BACK, PREVIEW } from "../open-campaign/copy";
import type { MandatoryNotice } from "./registry";

const BOX_FILE = "features/open-campaign/open-box.tsx";
const PREVIEW_FILE = "features/open-campaign/preview-section.tsx";
const REVIEW_FILE = "features/open-campaign/open-review.tsx";

export const OPEN_NOTICES: readonly MandatoryNotice[] = [
  {
    id: "creator-opening",
    source: "BR-26; BP-14 as recommended (P-9): said to the creator before opening a burn, lock or stake campaign",
    text: PREVIEW.creatorNotice,
    screens: "the creation box's preview of a burn, lock or stake campaign, and its review sheet",
    drawnBy: [
      { file: PREVIEW_FILE, uses: "PREVIEW.creatorNotice" },
      { file: REVIEW_FILE, uses: "CREATOR_NOTICE" },
    ],
  },
  {
    id: "no-entry",
    source: "TP §3.4.10, a campaign with no entries (the founder's answer, 2026-10-09); Sprint 19's risks",
    text: NO_ENTRY_RULE,
    screens: "the creation box, next to the price, in its preview and in its review sheet, before paying",
    drawnBy: [
      { file: "features/open-campaign/cost-section.tsx", uses: "NO_ENTRY_RULE" },
      { file: PREVIEW_FILE, uses: "NO_ENTRY_RULE" },
      { file: REVIEW_FILE, uses: "NO_ENTRY_RULE" },
    ],
  },
  {
    id: "no-take-back",
    source: "P1 §3.10 (no early exit), for the opening's prize",
    text: NO_TAKE_BACK,
    screens: "the creation box's preview and its review sheet",
    drawnBy: [
      { file: PREVIEW_FILE, uses: "NO_TAKE_BACK" },
      { file: REVIEW_FILE, uses: "NO_TAKE_BACK" },
    ],
  },
  {
    id: "link-never-signs",
    source: "proposal §3.8; TP §3.6, links prefill and never sign",
    text: BOX.fromLink,
    screens: "the creation box, when a link filled it",
    drawnBy: [{ file: BOX_FILE, uses: "BOX.fromLink" }],
  },
];
