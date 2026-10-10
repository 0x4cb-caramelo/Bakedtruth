/**
 * Purpose: one door to the mock data: every campaign by id, the listed ones in ranking order (TP §3.5: the partner
 *          highlight first), and the demo wallet's history and the ranking.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { OPEN } from "./campaigns.js";
import { DONE } from "./campaigns-done.js";

export { ENTRIES, RANKING, RANKING_AT, RECEIPTS, RESERVED } from "./wallet.js";
export { SOL_USD } from "./campaigns.js";

export const CAMPAIGNS = [...OPEN, ...DONE];
const BY_ID = new Map(CAMPAIGNS.map((c) => [c.id, c]));

/** The campaign with this id, or undefined (the 404 screen handles it). */
export const byId = (id) => BY_ID.get(String(id));

/** Listed campaigns in the indexer's order: highlighted partners first, then by rank. */
export const listed = () =>
  CAMPAIGNS.filter((c) => c.listed)
    .slice()
    .sort((a, b) => (b.partner ? 1 : 0) - (a.partner ? 1 : 0) || (a.rank ?? 99) - (b.rank ?? 99));
