/**
 * Purpose: the motion of the deck at /pitch: it decides what plays when a slide arrives or is left (the scenes are
 *          in scenes.js and exits.js), starts the product demo and the finale, and holds the switch that turns it off.
 * Version: 0.3.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * Three rules, from the founder's review of 2026-10-07 (docs/business/_review/plano-do-pitch3.md): a transition lasts
 * 1.5 seconds at most, the next slide change cancels whatever is playing, and the "M" key or the bar button turns all
 * motion off. The "N" key is the setting in between. With "reduce motion" on, or with the slides stacked on a phone,
 * nothing moves either.
 * It listens to the "slidechange" event that deck.js sends.
 */
import { startDemo, stopDemo } from "./demo.js?v=3";
import { EXITS } from "./exits.js?v=2";
import { finale, resetFinale } from "./finale.js?v=1";
import { SCENES, plain, settled } from "./scenes.js?v=7";
import { preload } from "./sprites.js?v=1";

const EASE = "cubic-bezier(.2,.8,.2,1)";
const NEXT_KEYS = ["ArrowRight", "ArrowDown", "PageDown", " "];
const root = document.documentElement;
const still = matchMedia("(prefers-reduced-motion: reduce)");
const button = document.querySelector("[data-motion]");
const liteButton = document.querySelector("[data-lite]");
let mode = "full";
let before = "full"; // the setting "M" goes back to
let timers = [];
let ticking = [];
let kept = [];
let leaving = null; // the function that changes the slide, while an exit scene plays
let heard = false;

const calm = () => still.matches || root.classList.contains("stack") || root.classList.contains("calm");
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const keep = (thing) => (kept.push(thing), thing);
/** Repeats `fn`. Returns the function that stops it; the next slide change stops it too. */
function every(fn, ms) {
  const id = setInterval(fn, ms);
  ticking.push(id);
  return () => clearInterval(id);
}

/** Undoes everything a scene started: timers, what it added or changed, its animations, the finale and the demo. */
function cancelAll() {
  timers.forEach(clearTimeout);
  ticking.forEach(clearInterval);
  timers = [];
  ticking = [];
  for (const thing of kept) (thing.cancel || thing.remove).call(thing);
  kept = [];
  leaving = null;
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

const stage = {
  enter,
  keep,
  later,
  every,
  get lite() {
    return mode === "lite";
  },
};

/** `how` is "forward", "back" or "open" (the page opened on this slide: nothing runs in, the slide plays its own). */
function arrive(slide, how) {
  cancelAll();
  if (calm()) return settled(stage, slide);
  const scene = SCENES[slide.dataset.label];
  if (scene) scene(stage, slide, how);
  else if (how !== "open") plain(stage, slide, how === "forward");
  if (slide.querySelector("[data-demo]")) later(() => startDemo(slide), how === "open" ? 400 : 950);
  if (slide.querySelector("[data-badge]")) later(() => finale(slide), how === "open" ? 600 : 1000);
}

document.addEventListener("slidechange", (event) => {
  const { slide, index, previousIndex, reason } = event.detail || {};
  if (!slide) return;
  heard = true;
  const opening = reason === "init" || previousIndex < 0;
  arrive(slide, opening ? "open" : index >= previousIndex ? "forward" : "back");
});

/** True when the event is the presenter asking for the next slide, the way deck.js reads it. */
function asksNext(event) {
  const target = event.target.closest ? event.target : document.body;
  if (event.type === "keydown") {
    if (event.ctrlKey || event.metaKey || event.altKey || !NEXT_KEYS.includes(event.key)) return false;
    return !(event.key === " " && target.closest("button, a"));
  }
  if (target.closest("[data-next]")) return true;
  if (target.closest("a, button, [data-demo], [data-egg]")) return false;
  return Boolean(target.closest("[data-deck]")) && event.clientX >= innerWidth / 3;
}

/** Plays the exit scene of the slide being left, then lets the deck move on. A second "next" skips the scene. */
function beforeLeaving(event) {
  if (!asksNext(event)) return;
  const skip = leaving;
  if (!skip && calm()) return;
  const slides = Array.from(document.querySelectorAll(".slide"));
  const slide = document.querySelector("[data-deck-active]");
  const exit = slide && EXITS[slide.dataset.label];
  const next = slides.indexOf(slide) + 1;
  if (!skip && (!exit || next >= slides.length)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (skip) {
    cancelAll();
    return skip();
  }
  leaving = () => {
    leaving = null;
    location.hash = `#${next + 1}`;
  };
  exit(stage, slide, () => leaving && leaving());
}
document.addEventListener("keydown", beforeLeaving, true);
document.addEventListener("click", beforeLeaving, true);

/**
 * Three settings. "full": every scene. "lite", the "N" key: only the scenes the founder picked on 2026-10-07 (scenes.js
 * reads stage.lite). "off", the "M" key: nothing moves. Changing it puts the slide on screen in its new state at rest.
 */
function setMode(next) {
  if (next === "off" && mode !== "off") before = mode;
  mode = next;
  root.classList.toggle("calm", mode === "off");
  if (button) button.setAttribute("aria-pressed", String(mode !== "off"));
  if (liteButton) liteButton.setAttribute("aria-pressed", String(mode === "lite"));
  const active = document.querySelector("[data-deck-active]");
  if (active) arrive(active, "open");
}
const toggleOff = () => setMode(mode === "off" ? before : "off");
const toggleLite = () => setMode(mode === "lite" ? "full" : "lite");
if (button) button.addEventListener("click", toggleOff);
if (liteButton) liteButton.addEventListener("click", toggleLite);
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === "m") toggleOff();
  if (key === "n") toggleLite();
});
const asked = new URLSearchParams(location.search).get("motion");
if (asked === "off" || asked === "lite") setMode(asked);

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

preload();
// If the stage announced the opening slide before this script was listening, pick it up here.
const active = document.querySelector("[data-deck-active]");
if (!heard && active) arrive(active, "open");
