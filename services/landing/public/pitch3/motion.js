/**
 * Purpose: the motion of the deck at /pitch3: each slide's entrance, the mascot's scene on a slide change (a run by
 *          default, a scene of its own where scenes.js has one), the product demo, and the switch that turns it off.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * Three rules, from the founder's review of 2026-10-07 (docs/business/_review/plano-do-pitch3.md): a transition lasts
 * 1.5 seconds at most, the next slide change cancels whatever is playing, and the "M" key or the bar button turns all
 * motion off. With "reduce motion" on, or with the slides stacked on a phone, nothing moves either.
 * It listens to the "slidechange" event that ../pitch/deck.js sends.
 */
import { startDemo, stopDemo } from "./demo.js?v=1";
import { SCENES, finale, resetFinale } from "./scenes.js?v=1";

const EASE = "cubic-bezier(.2,.8,.2,1)";
const root = document.documentElement;
const still = matchMedia("(prefers-reduced-motion: reduce)");
const button = document.querySelector("[data-motion]");
let timers = [];
let kept = [];
let heard = false;

const calm = () => still.matches || root.classList.contains("stack") || root.classList.contains("calm");
const pose = (i) => document.querySelector(`img[data-pose="${i}"]`);
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const keep = (thing) => (kept.push(thing), thing);

/** Stops everything a scene started: timers, the elements it added, its animations, the finale and the demo. */
function cancelAll() {
  timers.forEach(clearTimeout);
  timers = [];
  for (const thing of kept) (thing.cancel || thing.remove).call(thing);
  kept = [];
  resetFinale();
  stopDemo();
}

function enter(slide, forward) {
  const from = { opacity: 0, transform: `translateX(${forward ? 40 : -40}px)` };
  slide.animate([from, { opacity: 1, transform: "none" }], { duration: 520, easing: EASE });
  const items = [];
  for (const child of slide.children) {
    const kids = Array.from(child.children);
    if (child.tagName === "DIV" && kids.length > 1 && kids.length <= 6) items.push(...kids);
    else items.push(child);
  }
  items.forEach((el, i) => {
    const rise = [{ opacity: 0, transform: "translateY(36px)" }, { opacity: 1, transform: "none" }]; // prettier-ignore
    el.animate(rise, { duration: 560, delay: 120 + i * 70, easing: EASE, fill: "backwards" });
  });
}

/** The plain run: three hops across the bottom of the slide. `followers` smaller mascots may come behind it. */
function run(slide, forward, { followers = 0, ms = 1500 } = {}) {
  const r = slide.getBoundingClientRect();
  const poses = [0, 1, 2, 3].map(pose);
  if (!r.width || poses.some((img) => !img || !img.complete || !img.naturalWidth)) return;
  const wrap = document.createElement("div");
  wrap.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;pointer-events:none;overflow:hidden;z-index:30;`;
  document.body.append(keep(wrap));
  for (let n = 0; n <= followers; n++) {
    const size = r.height * (n ? 0.15 : 0.26);
    const width = size * 1.4;
    const bun = document.createElement("div");
    bun.style.cssText = `position:absolute;left:0;bottom:${r.height * 0.02}px;width:${width}px;height:${size}px;transform-origin:50% 100%;`;
    const img = document.createElement("img");
    img.alt = "";
    img.src = poses[n % 4].currentSrc || poses[n % 4].src;
    const shadow = `drop-shadow(0 ${size * 0.04}px ${size * 0.05}px rgba(0,0,0,.35))`;
    img.style.cssText = `width:100%;height:100%;object-fit:contain;display:block;image-rendering:pixelated;transform:scaleX(${forward ? 1 : -1});filter:${shadow};`;
    bun.append(img);
    wrap.append(bun);
    const x0 = forward ? -width : r.width;
    const x1 = forward ? r.width : -width;
    const lift = size * 0.75;
    const at = (k) => x0 + (x1 - x0) * (k / 3);
    const frames = [];
    for (let k = 0; k <= 3; k++) {
      if (k > 0)
        frames.push({ offset: (k - 0.5) / 3, transform: `translate(${at(k - 0.5)}px,${-lift}px) scale(0.95,1.08)` });
      frames.push({ offset: Math.max(0, k / 3 - 0.0001), transform: `translate(${at(k)}px,0) scale(1.12,0.86)` });
      if (k < 3)
        frames.push({
          offset: k / 3 + 0.05,
          transform: `translate(${at(k + 0.15)}px,${-lift * 0.4}px) scale(0.94,1.08)`,
        });
    }
    frames.sort((a, b) => a.offset - b.offset);
    frames[0].offset = 0;
    frames[frames.length - 1].offset = 1;
    bun.animate(frames, { duration: ms, delay: n * 100, easing: "linear", fill: "both" });
    // Only the one in front changes pose on each landing.
    if (!n) for (const k of [1, 2, 3]) later(() => (img.src = poses[k].currentSrc || poses[k].src), ms * (k / 3) - 40);
  }
  later(() => wrap.remove(), ms + followers * 100 + 60);
}

const stage = { run, pose, keep, later };

/** `opening` is true when the page opened on this slide: no entrance and no run, only what the slide itself plays. */
function arrive(slide, forward, opening) {
  cancelAll();
  if (calm()) return;
  if (slide.querySelector("[data-demo]")) later(() => startDemo(slide), opening ? 400 : 900);
  const closing = slide.querySelector("[data-badge]");
  if (opening) {
    if (closing) later(() => finale(slide), 600);
    return;
  }
  enter(slide, forward);
  const scene = SCENES[slide.dataset.label];
  if (scene) scene(stage, slide, forward);
  else run(slide, forward);
  if (closing) later(() => finale(slide), 1450);
}

document.addEventListener("slidechange", (event) => {
  const { slide, index, previousIndex, reason } = event.detail || {};
  if (!slide) return;
  heard = true;
  arrive(slide, index >= previousIndex, reason === "init" || previousIndex < 0);
});

function setCalm(on) {
  root.classList.toggle("calm", on);
  if (button) button.setAttribute("aria-pressed", String(!on));
  if (on) cancelAll();
}
if (button) button.addEventListener("click", () => setCalm(!root.classList.contains("calm")));
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.key.toLowerCase() !== "m") return;
  setCalm(!root.classList.contains("calm"));
});
if (new URLSearchParams(location.search).get("motion") === "off") setCalm(true);

// A click on the demo plays it again. Caught on the way down, so the stage does not read it as "next slide".
document.addEventListener(
  "click",
  (event) => {
    const demo = event.target.closest && event.target.closest("[data-demo]");
    if (!demo) return;
    event.stopPropagation();
    if (!calm()) startDemo(demo.closest(".slide"));
  },
  true,
);

// If the stage announced the opening slide before this script was listening, pick it up here.
const active = document.querySelector("[data-deck-active]");
if (!heard && active) arrive(active, true, true);
