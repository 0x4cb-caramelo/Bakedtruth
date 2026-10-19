/**
 * Purpose: the left half of the home page's mosaic, the "Open now" carousel of the top-ranked campaigns that take
 *          entries: each slide has its chance, pot bar, YES/NO shortcuts and estimates, and a proof panel where the old
 *          chart was (value now against the target, "If read now", the account read, who reads it, the two moments).
 *          The partner seal is a chip (placement A) or a band (?seal=band, L-24). Phones get the standard cards.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. The carousel is a scroll-snap track: arrows, dots and a
 *          Pause button on desktop, a swipe row with a peek on phones. It moves by itself only for a mouse without
 *          reduced motion, stops on hover and focus, and never announces an automatic change (DD a11y problem 2).
 */
import { esc, LAMPORTS, pct, short, value } from "../format.js";
import { chance, estimate } from "../model.js";
import { card } from "../ui/card.js";
import { icon } from "../ui/icons.js";
import { chancePair, kindLabel, kindTile, liveVsTarget, moment, moments, potLine, seal, splitBar } from "../ui/parts.js";
import { emptyBlock, errorBlock, skelSlide } from "./home-parts.js";

const CREATOR = "Whoever opened this campaign can control the result and may have an entry on YES or NO.";
const PLAY = `<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5z"/></svg>`;

/** "est. 2.47 per 1", floored exactly as the card writes it (spec 1.3), or null when the other side is empty. */
function per1(c, side) {
  const e = estimate(c, side, LAMPORTS);
  return e?.mode === "split" ? `est. ${(Math.floor(e.multiple * 100) / 100).toFixed(2)} per 1` : null;
}

/** The YES/NO shortcuts and the line under them, for a two-sided, one-sided or empty pot (spec 3.4, notices 16-17). */
function sides(c) {
  const ch = chance(c);
  const btn = (s, sub) =>
    `<a class="side-btn ${s}" href="#/c/${c.id}?side=${s}" data-mood="${s === "yes" ? "approve" : "skeptical"}"><span>${ch ? "" : "Join "}${s.toUpperCase()}</span><span class="per">${sub}</span></a>`;
  if (!ch) return [btn("yes", ""), btn("no", ""), "No entries yet. If the pot stays one-sided, the first wallet gets its entry back in full."];
  const lone = ch.yes === 1 ? "yes" : ch.no === 1 ? "no" : null;
  if (lone) {
    const [L, E] = lone === "yes" ? ["YES", "NO"] : ["NO", "YES"];
    const sub = (s) => (s === lone ? `refund if ${E} stays empty` : `be first · ${per1(c, s)}`);
    const note = `Only ${L} has entries so far. If ${E} stays empty, every entry is refunded: the first wallet in full, the others minus 1%.`;
    return [btn("yes", sub("yes")), btn("no", sub("no")), note];
  }
  const cut = c.creatorShareBps ? "Brot's 10% of the losing side and the creator's 1%" : "Brot's 10% of the losing side";
  const note = `Estimates, not promises: what 1 SOL returns if that side wins, prize included, net of ${cut}. They change with every entry.`;
  return [btn("yes", per1(c, "yes")), btn("no", per1(c, "no")), note];
}

/** Where the old chart was: value now against the target, "If read now", the account, who reads it, the moments. */
function proof(c) {
  const v = c.live?.value;
  const above = c.direction !== "below";
  const met = v != null && (above ? v >= c.target : v <= c.target);
  const gap = Math.abs(c.target - (v ?? 0));
  const share = c.kind !== "price" && above && v != null ? Math.min(1, v / c.target) : null; // spec 1.7 #11
  const now = v == null ? "No reading yet"
    : `If read now: <b class="${met ? "y" : "n"}">${met ? "YES" : "NO"}</b>${met ? "" : ` · ${value(gap, c.unit)} to go (${above ? "+" : "−"}${pct(gap / v, 1)})`}`;
  const bar = share === null ? ""
    : `<div class="home-bar" role="progressbar" aria-label="${esc(c.field)}: share of the target" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(share * 100)}" aria-valuetext="${pct(share)} of the target"><span style="width:${pct(share, 1)}"></span></div>`;
  const flagged = c.creatorJoined ? ` The creator's wallet has an entry on ${c.creatorJoined.toUpperCase()}.` : "";
  const by = c.partner ? `Brot team for ${esc(c.partner.name)} (free)` : c.creatorIsTeam ? "Brot team (free)" : `<span class="mono">${short(c.creator)}</span> (paid)`;
  const facts = `<dl class="rows home-facts"><div><dt>Opened by</dt><dd>${by}</dd></div><div><dt>Account</dt><dd class="mono" title="${esc(c.account)}">${short(c.account)}</dd></div>
      <div><dt>Last read</dt><dd>${c.live ? moment(c.live.at) : "No reading yet"}</dd></div><div><dt>Who reads it</dt><dd>Brot's service; anyone can re-check</dd></div></dl>`;
  return `<div class="home-proof">
      <p class="home-proof-head">${icon("eye", 15)}<span>On-chain read</span><span class="home-acct" title="${esc(c.account)}">${esc(c.accountName ?? short(c.account))}</span></p>
      ${liveVsTarget(c)}<p class="home-ifnow">${now}</p>${bar}${facts}${moments(c)}
      ${c.kind === "price" ? "" : `<p class="home-creator">${icon("alert", 14)}<span>${CREATOR}${flagged}</span></p>`}</div>`;
}

/** One slide. With `band` the partner seal is a strip across the top (placement B) instead of a chip (A). */
function slide(c, i, n, band) {
  const ch = chancePair(c);
  const raw = chance(c);
  const [yes, no, note] = sides(c);
  const strip = c.partner && band
    ? `<p class="home-band">${icon("sparkle", 14)}<span>Launch partner · <a href="${esc(c.partner.url)}" rel="noopener">${esc(c.partner.name)}${icon("arrow-up-right", 12)}</a></span><span>highlight ends ${moment(c.partner.highlightUntil)}</span></p>`
    : "";
  const pair = ch
    ? `<div class="home-chance"><span class="y"><small>YES</small><strong class="num">${ch.yes}</strong></span>${raw.yes === 1 || raw.no === 1 ? '<span class="chip">One-sided so far</span>' : ""}<span class="n"><small>NO</small><strong class="num">${ch.no}</strong></span></div>`
    : `<p class="home-chance none">No entries yet</p>`;
  return `<article class="home-slide${strip ? " has-band" : ""}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${n}" data-pos="${c.partner && !band ? "Launch partner · " : ""}" data-title="${esc(c.sentence)}">
    ${strip}<div class="home-slide-main">
      <div class="home-slide-head">${kindTile(c)}<span class="card-kind"><b>${kindLabel(c)}</b><span>${esc(c.asset)}</span></span>${band ? "" : seal(c)}</div>
      <a class="home-slide-title" href="#/c/${c.id}">${esc(c.sentence)}</a>
      ${pair}${splitBar(c)}<div class="home-sides">${yes}${no}</div><p class="home-note">${note}</p>
      <p class="home-pot">${potLine(c)} · ${c.bakers} baker${c.bakers === 1 ? "" : "s"}</p>
    </div>${proof(c)}<div class="home-slide-card">${card(c)}</div></article>`; // phones show the card instead (spec 3.2)
}

/** The carousel's box. `list` is already in ranking order; `mode` is live, loading, error or empty. */
export function feature(list, mode, band) {
  const n = list.length;
  const pager = mode === "live" && n > 1
    ? `<span class="home-pos" data-pos aria-hidden="true">1 of ${n}</span><div class="home-pager"><button type="button" class="icon-btn home-play" data-play hidden></button>
      <button type="button" class="icon-btn" data-step="-1" aria-label="Previous campaign">${icon("arrow-left", 15)}</button><span class="home-dots">${list
        .map((c, k) => `<button type="button" data-dot="${k}" aria-label="Campaign ${k + 1} of ${n}: ${esc(c.asset)}" aria-current="${k === 0}"></button>`)
        .join("")}</span><button type="button" class="icon-btn" data-step="1" aria-label="Next campaign">${icon("arrow-right", 15)}</button></div>`
    : "";
  const body = mode === "loading" ? skelSlide() : mode === "error" ? errorBlock()
    : n ? `<div class="home-track" data-track>${list.map((c, i) => slide(c, i, n, band)).join("")}</div>`
    : emptyBlock("No open campaigns right now.", `<a class="btn" href="#/open">${icon("plus", 15)}Open a campaign</a>`);
  return `<section class="home-feature" data-carousel aria-roledescription="carousel" aria-labelledby="home-open-now"${mode === "loading" ? ' aria-busy="true"' : ""}
      data-perch="home-feature" data-perch-x="0.9" data-perch-size="1" data-perch-say="Open now.">
    <div class="home-feature-head"><h2 id="home-open-now">${icon("trending", 15)}Open now</h2>${pager}</div>${body}
    <p class="sr-only" data-say aria-live="off"></p></section>`;
}

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const mouse = matchMedia("(hover: hover) and (pointer: fine)");
let at = 0; // the slide in view: a save or a wallet switch redraws the screen, and the carousel stays put
let held = false; // the Pause button's choice, kept across redraws

/** Runs the carousel under `root`. Returns the cleanup the router calls before the next draw. */
export function mountCarousel(root, interval = 5500) {
  const track = root?.querySelector("[data-track]");
  if (!track) return () => {};
  const slides = [...track.children];
  const n = slides.length;
  const [pos, say, play] = ["[data-pos]", "[data-say]", "[data-play]"].map((s) => root.querySelector(s));
  const dots = [...root.querySelectorAll("[data-dot]")];
  const canAuto = n > 1 && mouse.matches && !reduce.matches; // spec 5.4: never on phones or with reduced motion
  let timer = 0, hover = false, focus = false, steerUntil = 0, raf = 0;
  const x = (k) => slides[k].offsetLeft - slides[0].offsetLeft; // where slide k sits in the scroll

  // Only the slide in view takes focus and reaches screen readers; the others are inert until they come in.
  function mark(i, announce) {
    at = i;
    slides.forEach((s, k) => s.toggleAttribute("inert", k !== i));
    dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
    if (pos) pos.textContent = `${slides[i].dataset.pos}${i + 1} of ${n}`;
    if (announce) say.textContent = `${i + 1} of ${n}: ${slides[i].dataset.title}`;
  }
  function go(i, announce = true) {
    const k = (i + n) % n;
    steerUntil = performance.now() + 900; // the scroll this causes is ours, not a swipe
    track.scrollTo({ left: x(k), behavior: reduce.matches ? "auto" : "smooth" });
    mark(k, announce);
  }
  function sync() {
    clearInterval(timer);
    const running = canAuto && !held && !hover && !focus;
    say.setAttribute("aria-live", running ? "off" : "polite");
    if (running) timer = setInterval(() => go(at + 1, false), interval);
    if (!play) return;
    play.hidden = !canAuto;
    play.setAttribute("aria-label", held ? "Play the slides" : "Pause the slides");
    play.innerHTML = held ? PLAY : icon("pause", 14);
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step], [data-dot], [data-play]");
    if (!b) return;
    if (b === play) return (held = !held), sync();
    go(b.dataset.dot !== undefined ? Number(b.dataset.dot) : at + Number(b.dataset.step));
  });
  // A swipe or a trackpad scroll: whichever slide sits nearest the start becomes the current one.
  track.addEventListener("scroll", () => {
    if (performance.now() < steerUntil) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const d = (j) => Math.abs(x(j) - track.scrollLeft);
      const k = slides.reduce((best, s, j) => (d(j) < d(best) ? j : best), 0);
      if (k !== at) mark(k, false);
    });
  }, { passive: true });
  root.addEventListener("pointerenter", () => ((hover = true), sync()));
  root.addEventListener("pointerleave", () => ((hover = false), sync()));
  // Focus stops it; the Pause/Play button itself does not, so Play works from the keyboard (APG carousel).
  root.addEventListener("focusin", (e) => ((focus = e.target !== play), sync()));
  root.addEventListener("focusout", (e) => root.contains(e.relatedTarget) || ((focus = false), sync()));
  at = Math.min(at, n - 1);
  track.scrollLeft = x(at);
  mark(at, false);
  sync();
  return () => (clearInterval(timer), cancelAnimationFrame(raf));
}
