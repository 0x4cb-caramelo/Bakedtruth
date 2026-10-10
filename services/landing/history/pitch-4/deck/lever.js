/**
 * Purpose: the lever of the "Open a market" slide of the v4 deck: the mascot pulls it down, the initial seed climbs
 *          from $500 to $10,000 and the market climbs the site. The mentors' idea of 2026-10-08.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-08
 *
 * Without motion the lever rests pulled down, at the top of the range (pulled()). The lighter setting moves the lever
 * and the numbers without the mascot.
 */
import { spot, sprite } from "./sprites.js?v=1";

// Where the fists are inside each frame, as a share of the frame's height: raised in "grabbing the rope" (see
// team.js), at the chest in "pulling the rope" (measured on the drawing, 2026-10-08).
const FIST = { ropeGrab: { x: 1.375, y: 0.075 }, ropePull: { x: 1.0, y: 0.68 } };
const HEIGHT = 200;
const TRAVEL = 230; // how far the knob goes down, the same as `.lever.is-pulled .lever-knob` in the page
const FROM = 500;
const TO = 10000;
const RANKS = [9, 1];
const money = (n) => `$${n.toLocaleString("en-US")}`;

/** Shows the lever at the end of its pull: the state of the slide when nothing moves. */
export function pulled(slide) {
  const lever = slide.querySelector("[data-lever]");
  if (!lever) return;
  lever.classList.add("is-pulled");
  lever.querySelector("[data-lever-amount]").textContent = money(TO);
  lever.querySelector("[data-lever-rank]").textContent = `#${RANKS[1]}`;
}

/** Puts the lever back up, at $500. */
function reset(lever) {
  lever.classList.remove("is-pulled");
  lever.querySelector("[data-lever-amount]").textContent = money(FROM);
  lever.querySelector("[data-lever-rank]").textContent = `#${RANKS[0]}`;
}

/** `withMascot` is false in the lighter setting. `wait` is when the pull starts, in ms from now. */
export function pull(stage, slide, { withMascot, wait }) {
  const lever = slide.querySelector("[data-lever]");
  if (!lever) return;
  reset(lever);
  stage.keep({ remove: () => reset(lever) });
  const knob = lever.querySelector("[data-lever-knob]");
  const fill = lever.querySelector("[data-lever-fill]");
  const amount = lever.querySelector("[data-lever-amount]");
  const rank = lever.querySelector("[data-lever-rank]");
  const ms = 900;
  const ease = "cubic-bezier(.45,0,.3,1)";

  let bun = null;
  const at = spot(knob, slide);
  // The frame's corner that puts the fist of `pose` on the knob's centre.
  const hold = (pose) => ({
    x: at.x + at.w / 2 - FIST[pose].x * HEIGHT,
    y: at.y + at.h / 2 - FIST[pose].y * HEIGHT,
  });
  if (withMascot) {
    bun = sprite(slide, "ropeGrab", { ...hold("ropeGrab"), h: HEIGHT });
    stage.keep(bun.box);
    const drop = [
      { opacity: 0, transform: "translateY(-40px)" },
      { opacity: 1, transform: "none" },
    ];
    bun.box.animate(drop, { duration: 220, delay: Math.max(0, wait - 260), easing: "ease-out", fill: "backwards" });
  }

  stage.later(() => {
    if (bun) {
      // A new frame, so the box moves to keep the fist on the knob, then goes down with it.
      bun.show("ropePull");
      const { x, y } = hold("ropePull");
      bun.box.style.left = `${x}px`;
      bun.box.style.top = `${y}px`;
    }
    const down = [{ transform: "none" }, { transform: `translateY(${TRAVEL}px)` }];
    stage.keep(knob.animate(down, { duration: ms, easing: ease, fill: "forwards" }));
    if (bun) bun.box.animate(down, { duration: ms, easing: ease, fill: "forwards" });
    const up = [{ height: "6%" }, { height: "100%" }];
    stage.keep(fill.animate(up, { duration: ms, easing: ease, fill: "forwards" }));
    const start = performance.now();
    const stop = stage.every(() => {
      const t = Math.min(1, (performance.now() - start) / ms);
      const p = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // close to the knob's easing
      amount.textContent = money(Math.round((FROM + (TO - FROM) * p) / 100) * 100);
      rank.textContent = `#${Math.round(RANKS[0] - (RANKS[0] - RANKS[1]) * p)}`;
      if (t === 1) stop();
    }, 30);
  }, wait);
}
