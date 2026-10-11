/**
 * Purpose: starts the prototype: icons, the theme switch (saved as `brot-theme`), the wallet button, the phone menu,
 *          the search box, the site-wide notices, the effects, the mascot and the router. When a state switch
 *          moves, the wallet and the current screen redraw in place.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { startEffects } from "./effects.js";
import { draw, go, start } from "./router.js";
import { state, subscribe } from "./state.js";
import { icon, inlineIcons } from "./ui/icons.js";
import { dialog } from "./ui/layer.js";
import { siteNotices } from "./ui/notices.js";
import { renderWallet } from "./ui/wallet.js";

inlineIcons();

// Theme: the <head> script already applied the saved or requested one; dark is the default.
const root = document.documentElement;
const toggle = document.querySelector("[data-theme-toggle]");
const labelTheme = () => toggle.setAttribute("aria-label", `Switch to the ${root.dataset.theme === "dark" ? "light" : "dark"} theme`);
export function flipTheme() {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("brot-theme", root.dataset.theme);
  } catch {
    // Private mode: the choice just does not persist.
  }
  labelTheme();
  dispatchEvent(new Event("brot:theme"));
}
toggle.addEventListener("click", flipTheme);
labelTheme();

// The skip link focuses the screen without touching the hash, which the router owns.
document.querySelector("[data-skip]").addEventListener("click", (e) => {
  e.preventDefault();
  (document.querySelector("#main h1") ?? document.getElementById("main")).focus();
});

// Search: Enter goes to the full list with the query; the list screen reads it from the hash.
const search = document.querySelector("[data-search]");
search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") go(`/campaigns?q=${encodeURIComponent(search.value.trim())}`);
});
document.querySelector("[data-action=search]").addEventListener("click", () =>
  dialog({
    title: "Search",
    body: `<label class="field"><span class="label">Campaigns, assets or addresses</span>
      <input class="input" type="search" data-q autofocus placeholder="SOL, burn, DemoPool…" /></label>`,
    mount(body, close) {
      body.querySelector("[data-q]").addEventListener("keydown", (e) => {
        if (e.key === "Enter") (close(), go(`/campaigns?q=${encodeURIComponent(e.target.value.trim())}`));
      });
    },
  }),
);

// Phone menu: every link of the top bar and the footer, and the theme switch, in one sheet.
const LINKS = [
  ["#/", "grid", "Campaigns"],
  ["#/abrir", "plus", "Open a campaign"],
  ["#/entries", "receipt", "My entries"],
  ["#/leaderboard", "trophy", "Leaderboard"],
  ["#/how", "info", "How it works"],
  ["#/fees", "scale", "Fees"],
  ["#/record", "users", "Who can do what"],
];
document.querySelector("[data-action=menu]").addEventListener("click", () =>
  dialog({
    title: "Menu",
    body: `<nav class="phone-nav" aria-label="Menu">
      ${LINKS.map(([href, ic, text]) => `<a href="${href}">${icon(ic, 18)}${text}</a>`).join("")}
      <hr /><button type="button" data-flip>${icon(root.dataset.theme === "dark" ? "sun" : "moon", 18)}Switch to the ${root.dataset.theme === "dark" ? "light" : "dark"} theme</button>
      <hr /><a href="https://docs.brot.markets" rel="noopener">${icon("external", 18)}Docs</a>
      <a href="https://brot.markets/privacy" rel="noopener">${icon("external", 18)}Privacy</a></nav>`,
    mount(body, close) {
      body.querySelectorAll("a[href^='#']").forEach((a) => a.addEventListener("click", () => close({ restore: false })));
      body.querySelector("[data-flip]").addEventListener("click", () => (flipTheme(), close()));
    },
  }),
);

renderWallet();
siteNotices();
subscribe(() => {
  renderWallet();
  siteNotices();
  draw({ keepScroll: true });
});
startEffects();
start();
import("./mascot/mascot.js");

// For the review page: report the switches that are on, so a screenshot says which state it shows.
if (location.search) console.info("Prototype state", { ...state, saved: [...state.saved] });
