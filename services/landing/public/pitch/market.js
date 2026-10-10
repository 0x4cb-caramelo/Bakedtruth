/**
 * Purpose: what moves on the two Market slides of /pitch, which share one chart (chart.js). "Market": the mascot runs
 *          from June to September 2026, a month at a time, and stops. Leaving it, the words on the right go.
 *          "Projection": the same chart pulls back while the mascot climbs, month after month, to October 2028.
 * Version: 0.2.0 · Sprint: out of band (landing page), 2026-10-10
 *
 * v5.1, as the founder asked on 2026-10-10: no turn of the slide and no bars. The next slide opens on the frame the
 * one before it ended on, so the change of slide is not seen. With motion off each slide is its last frame.
 */
import { draw } from "./chart.js?v=1";

const EASE = "cubic-bezier(.2,.8,.2,1)";
const MONTH_MS = 640; // one month of the run on the first slide
const REST_MS = 300; // the stop at each month
const CLIMB_MS = 4400; // the 25 months of the second slide
const smooth = (p) => p * p * (3 - 2 * p);
const chartOf = (slide) => slide.querySelector("[data-chart]");

/** Calls `fn` with 0 to 1 over `ms`, then `done`. The next slide change stops it. */
function tween(stage, ms, fn, done) {
  let live = true;
  stage.keep({ cancel: () => (live = false) });
  const began = performance.now();
  const tick = (now) => {
    if (!live) return;
    const p = Math.min(1, (now - began) / ms);
    fn(p);
    if (p < 1) requestAnimationFrame(tick);
    else if (done) done();
  };
  requestAnimationFrame(tick);
}

/** The slide's chart as it is when nothing moves: the four months on "Market", the two years on "Projection". */
export function still(slide) {
  const chart = chartOf(slide);
  if (chart) draw(chart, chart.dataset.chart === "far" ? { k: 1 } : { reach: 3 });
}

/** Market: the mascot runs from June to September, one month at a time, and stops there. */
export function months(stage, slide) {
  const chart = chartOf(slide);
  if (!chart) return;
  draw(chart, { reach: 0 });
  let month = 0;
  const leg = () => {
    const from = month++;
    const step = (p) => draw(chart, { reach: from + smooth(p), run: p < 1 });
    tween(stage, MONTH_MS, step, () => month < 3 && stage.later(leg, REST_MS));
  };
  stage.later(leg, 900);
}

/** The exit of Market: the words on the right go, and the deck moves on to the same chart on the next slide. */
export function wordsAway(stage, slide, go) {
  still(slide);
  const words = slide.querySelector("[data-mk-words]");
  if (words) stage.keep(words.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }));
  stage.later(go, 300);
}

/** Projection, arriving from Market: the chart pulls back as the mascot climbs to the flag. */
export function pullBack(stage, slide) {
  const chart = chartOf(slide);
  if (!chart) return;
  draw(chart, { reach: 3 });
  const fade = (selector, frames, timing) => {
    const el = slide.querySelector(selector);
    if (el) stage.keep(el.animate(frames, { easing: EASE, fill: "backwards", ...timing }));
  };
  // The title of the slide before is still there for a moment, then gives way to this one's.
  fade("[data-title-was]", [{ opacity: 1 }, { opacity: 0 }], { duration: 500 });
  fade("[data-title-now]", [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 250 });
  fade("[data-proj-note]", [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 300 });
  const pop = [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }];
  fade("[data-flag]", pop, { duration: 380, delay: 400 + CLIMB_MS });
  const climb = (p) => draw(chart, { k: Math.max(0.0001, p), run: p < 1 });
  stage.later(() => tween(stage, CLIMB_MS, climb), 400);
}

// Both charts are drawn as soon as the page is read, so a slide that is never played (the phone's stacked view, the
// print) still has its chart.
for (const chart of document.querySelectorAll("[data-chart]")) still(chart.closest(".slide"));
