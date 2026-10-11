/**
 * Purpose: the mandatory notices of the creation box at /abrir (Sprint 19 DoD; BR-26; TP §3.4.10), listed with the
 *          screens that must show them and the components that draw them, joined to the site's list in registry.ts so
 *          tests/site/notices.test.ts checks them with the rest. The words come from their copy files.
 * Version: 0.3.0 (the Sprint 19 legal review: the devnet line, where the prize goes, what devnet does not send, the
 *          public opening; the copy review: a team key's variants, the creator notice on every kind but price)
 * Sprint:  19 (site: open a campaign)
 */
import { BOX, PREVIEW } from "../open-campaign/copy";
import { NO_ENTRY_RULE, NO_TAKE_BACK, OPEN_DEVNET, PRIZE_FATE, RETURNS_DEVNET } from "../open-campaign/copy-money";
import { SHEET } from "../open-campaign/copy-sheet";
import type { MandatoryNotice } from "./registry";

const BOX_FILE = "features/open-campaign/open-box.tsx";
const COST_FILE = "features/open-campaign/cost-section.tsx";
const PREVIEW_FILE = "features/open-campaign/preview-section.tsx";
const REVIEW_FILE = "features/open-campaign/open-review.tsx";

export const OPEN_NOTICES: readonly MandatoryNotice[] = [
  {
    id: "creator-opening",
    source: "BR-26; BP-14 as recommended (P-9): said to the creator before opening any campaign but a price one",
    text: PREVIEW.creatorNotice,
    screens:
      "the creation box's preview of a burn, lock, stake pool or validator stake campaign, and its review sheet, with who else can move the number",
    drawnBy: [
      { file: PREVIEW_FILE, uses: "PREVIEW.creatorNotice" },
      { file: REVIEW_FILE, uses: "PREVIEW.creatorNotice" },
    ],
  },
  {
    id: "no-entry",
    source: "TP §3.4.10, a campaign with no entries (the founder's answer, 2026-10-09); Sprint 19's risks",
    text: NO_ENTRY_RULE,
    screens:
      "the creation box, next to the price, in its preview and in its review sheet, before paying (not a team key's free opening)",
    drawnBy: [
      { file: COST_FILE, uses: "NO_ENTRY_RULE" },
      { file: PREVIEW_FILE, uses: "NO_ENTRY_RULE" },
      { file: REVIEW_FILE, uses: "NO_ENTRY_RULE" },
    ],
  },
  {
    id: "no-take-back",
    source: "P1 §3.10 (no early exit), for the opening's prize",
    text: NO_TAKE_BACK,
    screens: "the creation box's preview and its review sheet, for a paid opening",
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
  {
    id: "devnet-opening",
    source: "BR-47; the Sprint 19 legal review (M1): an opening is paid in test SOL; the program is not audited",
    text: OPEN_DEVNET,
    screens: "the creation box, by the price, and its review sheet, on devnet",
    drawnBy: [
      { file: COST_FILE, uses: "OPEN_DEVNET" },
      { file: REVIEW_FILE, uses: "OPEN_DEVNET" },
    ],
  },
  {
    id: "prize-fate",
    source: "TP §3.4.16; the Sprint 19 legal review (M3): where the prize goes in the usual case",
    text: PRIZE_FATE,
    screens: "the review sheet of a paid opening",
    drawnBy: [{ file: REVIEW_FILE, uses: "PRIZE_FATE" }],
  },
  {
    id: "returns-devnet",
    source: "the founder's devnet payout wording (2026-10-10); the Sprint 19 legal review (M3)",
    text: RETURNS_DEVNET,
    screens: "the creation box, by the price, and its review sheet, on devnet (a team key's own words: only the rent)",
    drawnBy: [
      { file: COST_FILE, uses: "RETURNS_DEVNET" },
      { file: REVIEW_FILE, uses: "RETURNS_DEVNET" },
    ],
  },
  {
    id: "public-opening",
    source: "TP §8, question 9; the Sprint 19 legal review (M5): an opening is public and permanent, said before it",
    text: SHEET.public,
    screens: "the review sheet of every opening",
    drawnBy: [{ file: REVIEW_FILE, uses: "SHEET.public" }],
  },
];
