/**
 * Purpose: the screens index for review (#/screens): every route and every state in one place, with links that set
 *          the switches (wallet, pause, stale price, country, valve), every campaign card in every state, and the
 *          phone previews (each screen at 412 and 360 px in frames). It is for the founder's approval, not the site.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { byId, CAMPAIGNS } from "../data/index.js";
import { stateQuery, toggleSaved } from "../state.js";
import { card, wireCards } from "../ui/card.js";

const SCREENS = [
  ["Home", "#/"],
  ["All campaigns", "#/campaigns"],
  ["Campaign · open", "#/c/8231904417"],
  ["Campaign · partner, free", "#/c/1093327781"],
  ["Campaign · entries close within the hour", "#/c/5521098834"],
  ["Campaign · creator joined (burn)", "#/c/7710042256"],
  ["Campaign · one-sided pot", "#/c/3348810927"],
  ["Campaign · no entries yet", "#/c/6402937718"],
  ["Campaign · closed", "#/c/9087411203"],
  ["Campaign · in review", "#/c/4419928305"],
  ["Campaign · contested", "#/c/2276510493"],
  ["Campaign · paid YES", "#/c/6650183342"],
  ["Campaign · paid NO", "#/c/8813370026"],
  ["Campaign · one side only, refunded", "#/c/1187634450"],
  ["Campaign · voided, outside cause", "#/c/5039917762"],
  ["Campaign · voided, our failure", "#/c/7302281195"],
  ["Campaign · unlisted after a report", "#/c/9931045570"],
  ["Open a campaign", "#/abrir"],
  ["My entries", "#/entries"],
  ["Leaderboard", "#/leaderboard"],
  ["Fees", "#/fees"],
  ["Who can do what", "#/record"],
  ["How it works", "#/how"],
  ["Share card", "#/card/8231904417"],
  ["Share card · resolved", "#/card/6650183342"],
  ["Not found", "#/c/1"],
];

const SWITCHES = [
  ["Wallet off", { wallet: "off" }],
  ["Android: Use Installed Wallet", { wallet: "off", android: "1" }],
  ["Connected", { wallet: "on" }],
  ["No SOL", { wallet: "nosol" }],
  ["Wrong network", { wallet: "wrongnet" }],
  ["Entries paused", { wallet: "on", paused: "1" }],
  ["Stale SOL/USD price", { stale: "1" }],
  ["Country blocked", { geo: "1" }],
  ["Valve full", { valve: "1" }],
  ["Light theme", { theme: "light" }],
];

const PARTNER = byId("1093327781");
const PHONES = [
  ["Home", "#/", 412],
  ["Campaign, open", "#/c/8231904417", 412],
  ["Campaign, in review", "#/c/4419928305", 360],
  ["Open a campaign", "#/abrir", 412],
  ["My entries", "#/entries", 360],
  ["Campaign, paid", "#/c/6650183342", 360],
];

const query = (extra) => {
  const q = new URLSearchParams(extra).toString();
  return q ? `?${q}` : "";
};

export default () => ({
  title: "All screens",
  html: `
  <div class="page-head"><div><p class="t-kicker">Design review · Sprint -1</p><h1 class="t-title">Every screen and state</h1></div>
    <a class="btn" href="#/">Back to the site</a></div>
  <section class="pg-review">
    <h2 class="t-section">Screens</h2>
    <ul class="pg-links">${SCREENS.map(([t, h]) => `<li><a href="${stateQuery()}${h}" data-full="${h}">${t}</a></li>`).join("")}</ul>
    <h2 class="t-section">Switches</h2>
    <p class="t-small">Each link reloads the site with one state on. They combine in the address bar: <span class="mono">?wallet=on&amp;paused=1</span>.</p>
    <ul class="pg-links">${SWITCHES.map(([t, q]) => `<li><a href="${query(q)}#/screens">${t}</a></li>`).join("")}</ul>
    <h2 class="t-section">Partner seal: pick a placement (L-24)</h2>
    <p class="t-small">A launch partner's campaign is opened free by a team key and highlighted for 72 hours. A: a chip next to the state. B: a band across the top of the card.</p>
    <div class="pg-compare">
      <figure><figcaption>A · chip</figcaption>${card(PARTNER, { seal: "chip" })}</figure>
      <figure><figcaption>B · band</figcaption>${card(PARTNER, { seal: "band" })}</figure></div>
    <h2 class="t-section">On a phone</h2>
    <p class="t-small">Each frame is the real page at a phone's width: 412 px (a common Android phone) and 360 px (a narrow one).</p>
    <div class="pg-phones">${PHONES.map(([t, h, w]) => `<figure><figcaption>${t} · ${w} px</figcaption>
      <iframe src="./${stateQuery()}${h}" width="${w}" height="760" loading="lazy" title="${t} at ${w} px"></iframe></figure>`).join("")}</div>
    <h2 class="t-section">Every card</h2>
    <div class="grid-cards">${CAMPAIGNS.map((c) => card(c)).join("")}</div>
  </section>`,
  mount(main) {
    wireCards(main, toggleSaved);
    // A link to a screen keeps the current switches: the query must change the page, not just the hash.
    main.querySelectorAll("[data-full]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        location.href = `${location.pathname}${location.search}${a.dataset.full}`;
      }),
    );
  },
});
