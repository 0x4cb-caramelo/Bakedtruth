/**
 * Purpose: the 404 screen: a path that matches no route, or a campaign id that does not exist. Baked sulks, and
 *          there is one way back to the campaigns.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { esc } from "../format.js";

export default ({ path = "", id } = {}) => ({
  title: "Not found",
  html: `<section class="pg-404">
    <img src="img/baked-sulking.webp" alt="" width="190" height="120" />
    <h1 class="t-title">Nothing here</h1>
    <p class="t-small">${id ? `No campaign has the id <span class="mono">${esc(id)}</span>. It may never have been opened, or the link lost a digit.` : `The page <span class="mono">${esc(path)}</span> does not exist.`}</p>
    <a class="cta" href="#/"><span>See the campaigns</span></a>
  </section>`,
});
