/**
 * Purpose: the rocket setting of the two Market slides of /pitch (the bar's rocket button, the "R" key). In place of
 *          the mascot on foot: on "Market" it gets into a lambo and drives the four measured months; on "Projection"
 *          it gets out, puts a helmet on and rides a rocket along the scenario until it hits the moon.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-10
 *
 * The founder asked for it on 2026-10-10 as an extra setting: the full and the lighter settings stay as they were.
 * The nine drawings are his (docs/product/tothemoon), cut to transparent WebP. Each is a square frame; SEATS says how
 * big it is on the slide and which point of it sits on the tip of the line. The chart, its figures and the words of
 * the two slides are the same in every setting: only what travels the line changes.
 */
import { draw, end } from "./chart.js?v=2";
import { chartOf, smooth, tween, words } from "./market.js?v=3";

const FILES = {
  beside: "20-lambo-ao-lado",
  enter: "21-lambo-entrando",
  cruise: "22-lambo-dirigindo",
  fast: "23-lambo-acelerando",
  exit: "24-lambo-saindo",
  helmet: "25-capacete",
  rocket: "26-foguete",
  panic: "27-foguete-panico",
  crash: "28-batendo-na-lua",
};
// pose: the frame's side on the slide (px), the anchor's x and y in it (fractions), its height over the line (px).
// The lambo's anchor is on the ground just behind the front wheel; the rocket's is the middle of its body.
const SEATS = {
  beside: [340, 0.62, 0.745, 121],
  enter: [340, 0.63, 0.742, 164],
  cruise: [340, 0.66, 0.722, 101],
  fast: [421, 0.717, 0.735, 147],
  exit: [440, 0.56, 0.86, 245],
  helmet: [440, 0.56, 0.86, 245],
  rocket: [395, 0.65, 0.66, 0],
  panic: [417, 0.66, 0.62, 0],
  crash: [540, 0.5, 0.58, 0],
};
// How many degrees the rocket points up in its two flying drawings, and down in the one where it hits.
const NOSE = { rocket: 12, panic: 28, crash: -26 };
const BEAT_MS = 650; // each standing pose: beside the car, getting in, getting out, the helmet
const LEG_MS = 700; // one month of the drive
const REST_MS = 300; // the stop at each month
const FLIGHT_MS = 4800; // the 25 months of the flight
const clamp = (n) => Math.min(1, Math.max(0, n));
const file = (pose) => new URL(`img/${FILES[pose]}.webp`, import.meta.url).href;

/** What chart.js needs to put a pose on the tip of the line. `turn` is in degrees, clockwise. */
function seat(pose, turn = 0) {
  const [size, ax, ay, over] = SEATS[pose];
  return { src: file(pose), size, ax, ay, over, turn };
}

/** Asks for the nine drawings. Called when the setting is turned on, so the other settings never download them. */
export function load() {
  for (const pose of Object.keys(FILES)) new Image().src = file(pose);
}

/** The two slides at rest in this setting: the lambo parked on September, the rocket on the moon. */
export function landed(slide) {
  const chart = chartOf(slide);
  if (!chart) return;
  const far = chart.dataset.chart === "far";
  draw(chart, far ? { k: 1, ride: seat("crash") } : { reach: 3, ride: seat("cruise") });
}

/** Market: it looks at the lambo, gets in and drives from June to September, a month at a time. */
export function drive(stage, slide) {
  const chart = chartOf(slide);
  if (!chart) return;
  const put = (pose, reach = 0, turn = 0) => draw(chart, { reach, ride: seat(pose, turn) });
  put("beside");
  stage.later(() => put("enter"), 900);
  stage.later(() => put("cruise"), 900 + BEAT_MS);
  let month = 0;
  const leg = () => {
    const from = month++;
    const last = month === 3;
    const { slope } = end({ reach: from + 1 });
    // The car leans into the slope in the middle of each month and is level again where it stops.
    const lean = (p) => -slope * Math.sin(Math.PI * p) ** 0.6;
    const step = (p) => put(last && p === 1 ? "cruise" : "fast", from + smooth(p), lean(p));
    tween(stage, LEG_MS, step, () => !last && stage.later(leg, REST_MS));
  };
  stage.later(leg, 900 + BEAT_MS + 400);
}

/** Projection, arriving from Market: out of the lambo, helmet on, and the rocket follows the line to the moon. */
export function liftOff(stage, slide) {
  const chart = chartOf(slide);
  if (!chart) return;
  draw(chart, { reach: 3, ride: seat("exit") });
  stage.later(() => draw(chart, { reach: 3, ride: seat("helmet") }), BEAT_MS);
  const start = 2 * BEAT_MS;
  words(stage, slide, start + FLIGHT_MS + 350);

  // The moon waits at the edge of the slide before the rocket gets there: the last drawing, showing only its far
  // side (five.css masks the rest), exactly where that drawing lands.
  const [size, ax, ay] = SEATS.crash;
  const at = end({ k: 1 });
  const moon = stage.keep(document.createElement("img"));
  moon.className = "chart-moon";
  moon.alt = "";
  moon.src = file("crash");
  moon.style.cssText = `left:${at.x - size * ax}px;top:${at.y - size * ay}px;width:${size}px;height:${size}px;`;
  chart.append(moon);
  moon.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: start + FLIGHT_MS * 0.3, fill: "both" });

  const fly = (p) => {
    if (p === 1) return;
    const k = Math.max(0.0001, p);
    const pose = p > 0.72 ? "panic" : "rocket";
    // It points along the line; over the last months it noses over, towards the angle it hits the moon at.
    const dive = smooth(clamp((p - 0.8) / 0.2));
    const turn = (NOSE[pose] - end({ k }).slope) * (1 - dive) + (NOSE[pose] - NOSE.crash) * dive;
    draw(chart, { k, ride: seat(pose, turn) });
  };
  const hit = () => {
    draw(chart, { k: 1, ride: seat("crash") });
    const jolt = ["0,0", "-16px,9px", "13px,-7px", "-8px,5px", "5px,-2px", "0,0"].map((by) => ({
      transform: `translate(${by})`,
    }));
    stage.keep(chart.animate(jolt, { duration: 420, easing: "ease-out" }));
  };
  stage.later(() => tween(stage, FLIGHT_MS, fly, hit), start);
}
