/**
 * Purpose: the prototype's hash router: each route of TP §3.6 maps to a screen module loaded on first use. A
 *          screen is `export default (params) => ({ title, html, mount(main) })`. On every change the router
 *          writes the screen, sets the title, marks the current link, scrolls up and moves focus to the heading.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Hash routes only because the prototype is static; the
 *          real site uses the same paths without the "#".
 */
import { inlineIcons } from "./ui/icons.js";

// English paths (spec 1.8, L-01); the first names of the prototype stay as aliases. `/abrir` is D6's name; `/open`
// is the English one the founder is asked about.
const ROUTES = [
  ["/", () => import("./screens/home.js")],
  ["/campaigns", () => import("./screens/list.js")],
  ["/all", () => import("./screens/list.js")],
  ["/c/:id", () => import("./screens/campaign.js")],
  ["/abrir", () => import("./screens/open.js")],
  ["/open", () => import("./screens/open.js")],
  ["/entries", () => import("./screens/me.js")],
  ["/me", () => import("./screens/me.js")],
  ["/leaderboard", () => import("./screens/ranking.js")],
  ["/ranking", () => import("./screens/ranking.js")],
  ["/fees", () => import("./screens/fees.js")],
  ["/record", () => import("./screens/powers.js")],
  ["/powers", () => import("./screens/powers.js")],
  ["/how", () => import("./screens/how.js")],
  ["/card/:id", () => import("./screens/share-card.js")],
  ["/error", () => import("./screens/error.js")],
  ["/screens", () => import("./screens/review.js")],
];
const NOT_FOUND = () => import("./screens/not-found.js");

/** The path after "#", without the query: "#/c/42?x=1" → "/c/42". */
export const currentPath = () => (location.hash.replace(/^#/, "").split("?")[0] || "/");

function match(path) {
  for (const [pattern, load] of ROUTES) {
    const keys = [];
    const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)"))}$`);
    const m = path.match(re);
    if (m) return { load, params: Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
  }
  return { load: NOT_FOUND, params: { path } };
}

let drawing = 0;
let cleanup = null;

/** Draws the screen for the current hash. `keepScroll` redraws in place (a switch moved, not a navigation). */
export async function draw({ keepScroll = false } = {}) {
  const ticket = ++drawing;
  const path = currentPath();
  const { load, params } = match(path);
  const screen = (await load()).default(params);
  if (ticket !== drawing) return; // a newer navigation won
  const main = document.getElementById("main");
  if (typeof cleanup === "function") cleanup();
  main.innerHTML = screen.html;
  inlineIcons(main);
  cleanup = screen.mount?.(main) ?? null;
  document.title = screen.title ? `${screen.title} · Brot Markets` : "Brot Markets · On-Chain Campaigns";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const on = a.getAttribute("href") === `#${path}` || (a.dataset.nav === "home" && path === "/");
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (!keepScroll) {
    scrollTo({ top: 0 });
    const heading = main.querySelector("h1");
    if (heading) heading.tabIndex = -1;
    (heading ?? main).focus({ preventScroll: true });
  }
}

export function start() {
  addEventListener("hashchange", () => draw());
  draw();
}

/** Navigates in code (after a confirmed opening, for example). */
export const go = (path) => {
  location.hash = `#${path}`;
};
