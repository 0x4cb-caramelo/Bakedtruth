/**
 * Purpose: the one chart behind the two Market slides of /pitch: World's four measured months and, after them, our
 *          two-year scenario, drawn at any point between the close view (slide 4) and the wide one (slide 5).
 * Version: 0.2.0 · Sprint: out of band (landing page), 2026-10-10
 *
 * `draw(el, { reach, k, run, ride })` is the interface. `reach` (0 to 3) is how far the measured line has been drawn,
 * in months from June 2026. `k` (0 to 1) is how far the view has pulled back, and with it how far the scenario has
 * been drawn. `run` puts the mascot in its running frames. The mascot stands on the tip of what is drawn. `ride`, of
 * the rocket setting (moon.js), is another drawing put on the tip in the mascot's place: `{ src, size, ax, ay, over,
 * turn }`. `end()` says where the tip is and how steep the line is there.
 *
 * MEASURED is fact: World's monthly volume (DefiLlama; business plan v0.0.4, Part 2, section 2.3). August is higher
 * than September, and the line shows it. TARGET is NOT fact: it is the figure on the slide's flag, a scenario of ours
 * (5% of the category's US$ 21.7 billion in 30 days), and the slide says so under the chart.
 */
import { url } from "./sprites.js?v=1";

const SVG = "http://www.w3.org/2000/svg";
const MEASURED = [1.14, 13.22, 22.2, 15.44]; // US$ millions a month: June, July, August and September 2026
const TARGET = 1085;
const LAST = 28; // October 2028, with June 2026 as month 0
const NAMES = ["JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY"];
const YEARS = [
  [0, "2026"],
  [7, "2027"],
  [19, "2028"],
];
// The chart's own coordinates, inside its 1700 x 600 box: where June sits, the floor, and how tall and wide it gets.
const X0 = 70;
const FLOOR = 520;
const TALL = 440;
const NEAR = 860;
const FAR = 1480;
const BUN = 150;
const charts = new WeakMap();
const clamp = (n) => Math.min(1, Math.max(0, n));

/** The scenario at month `t`: the same growth every month, from September's figure to TARGET at the last month. */
const scenario = (t) => MEASURED[3] * (TARGET / MEASURED[3]) ** ((t - 3) / (LAST - 3));

/** The value on the line at month `t`: measured up to September, straight between months, and the scenario after. */
function value(t) {
  if (t >= 3) return scenario(t);
  const i = Math.floor(t);
  return MEASURED[i] + (MEASURED[i + 1] - MEASURED[i]) * (t - i);
}

function make(parent, tag, name, text) {
  const node = document.createElementNS(SVG, tag);
  node.setAttribute("class", name);
  if (text) node.textContent = text;
  parent.append(node);
  return node;
}

function build(el) {
  const svg = el.querySelector("svg");
  svg.replaceChildren();
  const axis = make(svg, "line", "chart-axis");
  for (const [name, at] of Object.entries({ x1: 40, x2: 1660, y1: FLOOR, y2: FLOOR })) axis.setAttribute(name, at);
  const parts = {
    scenario: make(svg, "path", "chart-line is-scenario"),
    line: make(svg, "path", "chart-line"),
    ticks: Array.from({ length: LAST + 1 }, (_, m) => make(svg, "text", "chart-tick", NAMES[m % 12])),
    years: YEARS.map(([month, label]) => ({ month, text: make(svg, "text", "chart-year", label) })),
    dots: MEASURED.map(() => make(svg, "circle", "chart-dot")),
    tags: MEASURED.map((v) => make(svg, "text", "chart-value", `$${v.toFixed(1)}M`)),
    today: make(svg, "text", "chart-today", `$${MEASURED[3].toFixed(1)}M a month`),
    bun: document.createElement("img"),
    frame: "",
  };
  parts.bun.className = "chart-bun";
  parts.bun.alt = "";
  el.append(parts.bun);
  charts.set(el, parts);
  return parts;
}

/** The view of a draw: how far the line goes (`tip`, in months) and where a month and a value fall in the box. */
function view(reach, k) {
  const tip = k > 0 ? 3 + (LAST - 3) * k : reach;
  const span = Math.max(3, tip);
  const wide = NEAR + (FAR - NEAR) * k;
  const top = Math.max(25.8, scenario(span) / 0.86); // the tip stays at 86% of the height while the view pulls back
  return { tip, x: (t) => X0 + (t / span) * wide, y: (v) => FLOOR - (v / top) * TALL };
}

/** Where the drawn line ends, in the chart's own box, and how steep it is there, in degrees (uphill is positive). */
export function end({ reach = 3, k = 0 } = {}) {
  const { tip, x, y } = view(reach, k);
  const back = Math.max(tip > 3 ? 3 : 0, tip - 0.2); // a little behind the tip, on the same stretch of the line
  const rise = y(value(back)) - y(value(tip));
  const slope = tip > back ? (Math.atan2(rise, x(tip) - x(back)) * 180) / Math.PI : 0;
  return { x: x(tip), y: y(value(tip)), slope };
}

export function draw(el, { reach = 3, k = 0, run = false, ride = null } = {}) {
  const c = charts.get(el) || build(el);
  const { tip, x, y } = view(reach, k);
  const at = (t) => `${x(t).toFixed(1)} ${y(value(t)).toFixed(1)}`;
  const set = (node, attrs) => Object.entries(attrs).forEach(([name, n]) => node.setAttribute(name, n.toFixed(1)));

  const until = Math.min(3, tip);
  let measured = `M${at(0)}`;
  for (let m = 1; m <= until; m++) measured += ` L${at(m)}`;
  if (until % 1) measured += ` L${at(until)}`;
  c.line.setAttribute("d", measured);
  let ahead = "";
  if (tip > 3) {
    ahead = `M${at(3)}`;
    for (let t = 3.25; t < tip; t += 0.25) ahead += ` L${at(t)}`;
    ahead += ` L${at(tip)}`;
  }
  c.scenario.setAttribute("d", ahead);

  // A month's name appears when the line reaches it; the names shrink as more of them have to fit.
  const shown = (month) => (month <= tip + 0.05 ? "1" : "0");
  c.ticks.forEach((text, month) => {
    set(text, { x: x(month), y: FLOOR + 40 });
    text.style.fontSize = `${24 - 7 * k}px`;
    text.style.opacity = shown(month);
  });
  for (const { month, text } of c.years) {
    set(text, { x: x(month), y: FLOOR + 72 });
    text.style.opacity = shown(month);
  }
  MEASURED.forEach((v, i) => {
    set(c.dots[i], { cx: x(i), cy: y(v), r: 9 - 4 * k });
    c.dots[i].style.opacity = shown(i);
    // The figure sits over its point, and over the mascot's head while the mascot stands on that point.
    const lift = ((ride ? ride.over : BUN) + 6) * clamp(1 - Math.abs(tip - i) * 1.6);
    set(c.tags[i], { x: x(i), y: y(v) - 26 - lift });
    c.tags[i].style.opacity = String(Number(shown(i)) * (1 - clamp(k * 6)));
  });
  set(c.today, { x: x(3) + 18, y: y(MEASURED[3]) - 22 });
  c.today.style.opacity = String(clamp((k - 0.5) * 4));

  // The mascot stands on the tip, feet on the line. A ride sits there by its own anchor instead, turned as it asks.
  const pose = run ? (Math.floor(performance.now() / 110) % 2 ? "runA" : "runB") : "front";
  const frame = ride ? ride.src : url(pose);
  if (c.frame !== frame) c.bun.src = c.frame = frame;
  const [w, h, ax, ay] = ride ? [ride.size, ride.size, ride.ax, ride.ay] : [BUN * 1.5, BUN, 0.5, 1];
  Object.assign(c.bun.style, {
    width: `${w}px`,
    height: `${h}px`,
    left: `${x(tip) - w * ax}px`,
    top: `${y(value(tip)) - h * ay}px`,
    transformOrigin: `${ax * 100}% ${ay * 100}%`,
    transform: ride && ride.turn ? `rotate(${ride.turn.toFixed(2)}deg)` : "",
  });
}
