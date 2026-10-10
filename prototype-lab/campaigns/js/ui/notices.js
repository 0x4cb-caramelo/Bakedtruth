/**
 * Purpose: the notices that apply to the whole site, drawn above every screen: entries and openings paused by the
 *          team (I10′: everything else keeps running), and entries unavailable in the visitor's country (K-11:
 *          results and payouts stay visible and are never blocked). Also the texts other screens reuse.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { state } from "../state.js";
import { icon } from "./icons.js";

export const TEXT = {
  paused:
    "<b>Entries and new campaigns are paused.</b> The team paused them while it checks something. Results, reviews, payouts and refunds keep running, and nothing already in a pot can be moved.",
  geo: "<b>Entries are not available in your country.</b> You can follow every campaign and its proof, and any payout still reaches your wallet.",
  stale:
    "<b>Paid openings are on hold.</b> The SOL/USD price from Pyth is more than 2 minutes old, so the US$500 cannot be priced. It usually updates within a minute. Entries are not affected.",
  valve:
    "<b>The number of open campaigns is at its limit for now.</b> New openings wait until some campaigns close. Entries in open campaigns are not affected.",
  devnet: "<b>Devnet.</b> Test SOL only, no real money. The program is not audited yet.",
};

/** One notice: `kind` is info, warn or danger; the icon and the bold lead say it without colour. */
export const notice = (kind, html, { role = "status" } = {}) =>
  `<div class="notice ${kind}" role="${role}">${icon(kind === "danger" ? "alert" : kind === "warn" ? "pause" : "info", 18)}<p>${html}</p></div>`;

export function siteNotices() {
  const slot = document.querySelector("[data-site-notices]");
  const list = [state.paused && notice("warn", TEXT.paused), state.geoBlocked && notice("info", TEXT.geo)].filter(Boolean);
  slot.innerHTML = list.length ? `<div class="site-notices-in">${list.join("")}</div>` : "";
}
