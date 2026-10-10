/**
 * Purpose: makes Baked, the mascot, live on the campaigns prototype: it stands on declared perches, hops to the one
 *          nearest to where the pointer rests, reacts to what is under the pointer and answers when poked.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08
 *
 * Copied from services/landing/public/mascot.js (the behaviour live on brot.markets) with only the import paths and
 * the quips changed. It reads the perches on every frame, so screens that re-render need nothing. Perch markup:
 *   data-perch="id"  required; it stands on the element's top edge     data-perch-x="0.85"  where along it, 0..1
 *   data-perch-size="0.8"  scale here     data-perch-pose="skeptical"  resting pose     data-perch-say="Prove it."
 * Mood markup: data-mood="approve" changes the pose while the pointer is over that element.
 */
import { createBody } from "./body.js";
import { createSenses } from "./senses.js";

const SIZE = 84;
const DWELL_MS = 170; // how long the pointer must favour a perch before the hop
const MIN_STAY_MS = 520;
const TOP_INSET = 66; // the sticky top bar: it never stands behind it
const QUIPS = [
  "Prove it.",
  "I only believe accounts.",
  "Not audited. Stay sharp.",
  "Devnet. Test SOL only.",
  "Still baking.",
];

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const body = createBody({ size: SIZE, base: "img/baked-" });
const senses = createSenses();
const saidAt = new Map();

let perch = null;
let hop = null;
let at = null; // last drawn feet position { x, y, s }
let facing = 1;
let candidate = null;
let candidateSince = 0;
let lastDecision = 0;
let landedAt = 0;
let squashUntil = 0;
let quip = 0;

function anchor(el) {
  const r = el.getBoundingClientRect();
  const d = el.dataset;
  const own = parseFloat(d.perchSize ?? 1);
  // On phones it stays small so it never covers the copy it stands next to.
  const s = innerWidth < 700 ? Math.min(own, 1) * 0.6 : own;
  return { x: r.left + r.width * parseFloat(d.perchX ?? 0.5), y: r.top, s, r };
}

function visible(el) {
  if (!el.isConnected || el.closest("[hidden]")) return false;
  const a = anchor(el);
  if (!a.r.width && !a.r.height) return false;
  const h = body.height(a.s);
  return a.y - h > TOP_INSET && a.y < innerHeight - 2 && a.x > h * 0.5 && a.x < innerWidth - h * 0.5;
}

/** How strongly a perch attracts the pointer: zero inside its element, growing with distance. */
function score(el) {
  const a = anchor(el);
  const { x, y } = senses.pointer;
  const dx = Math.max(a.r.left - x, 0, x - a.r.right);
  const dy = Math.max(a.r.top - y, 0, y - a.r.bottom);
  return Math.hypot(dx, dy) + 0.08 * Math.hypot(a.x - x, a.y - y);
}

function choose() {
  let best = null;
  let bestScore = Infinity;
  for (const el of document.querySelectorAll("[data-perch]")) {
    if (!visible(el)) continue;
    const s = score(el);
    if (s < bestScore) [best, bestScore] = [el, s];
  }
  return best;
}

function land(now) {
  hop = null;
  landedAt = now;
  squashUntil = now + 170;
  const text = perch.dataset.perchSay;
  // The same line is not repeated within 15 seconds.
  if (text && now - (saidAt.get(text) ?? -1e9) > 15000) {
    saidAt.set(text, now);
    body.say(text);
  }
}

function startHop(to, now) {
  const target = anchor(to);
  perch = to;
  candidate = null;
  body.hush();
  if (!at || reduce) {
    at = { x: target.x, y: target.y, s: target.s };
    land(now);
    return;
  }
  const dist = Math.hypot(target.x - at.x, target.y - at.y);
  hop = { from: { ...at }, t0: now, ms: clamp(260 + dist * 0.55, 300, 820), arc: clamp(30 + dist * 0.22, 36, 150) };
  if (Math.abs(target.x - at.x) > 8) facing = target.x < at.x ? -1 : 1;
}

/** Hops when the pointer has favoured another perch for long enough. A sweep across the page does not drag it. */
function decide(now) {
  if (hop || now - lastDecision < 100) return;
  if (now - senses.lastMove > 1200 && now - senses.lastScroll > 400) return;
  lastDecision = now;
  const best = choose();
  if (!best || best === perch) {
    candidate = null;
  } else if (best !== candidate) {
    candidate = best;
    candidateSince = now;
  } else if (now - candidateSince > DWELL_MS && now - landedAt > MIN_STAY_MS && score(best) + 36 < score(perch)) {
    startHop(best, now);
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  if (!perch || !visible(perch)) {
    const next = choose();
    if (!next) {
      body.hide();
      perch = hop = null;
      return;
    }
    if (next !== perch) startHop(next, now);
  }
  decide(now);

  const target = anchor(perch);
  let sx = 1;
  let sy = 1;
  if (hop) {
    const t = (now - hop.t0) / hop.ms;
    if (t >= 1) {
      at = { x: target.x, y: target.y, s: target.s };
      land(now);
    } else {
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      at = {
        x: hop.from.x + (target.x - hop.from.x) * e,
        y: hop.from.y + (target.y - hop.from.y) * e - hop.arc * 4 * e * (1 - e),
        s: hop.from.s + (target.s - hop.from.s) * e,
      };
      sy = 1 + 0.14 * Math.sin(Math.PI * t);
      sx = 1 - 0.08 * Math.sin(Math.PI * t);
    }
  } else {
    at = { x: target.x, y: target.y, s: target.s };
    const { x } = senses.pointer;
    if (now - senses.lastMove < 1500 && Math.abs(x - at.x) > 70) facing = x < at.x ? -1 : 1;
  }
  if (now < squashUntil) {
    const k = (squashUntil - now) / 170;
    sy = 1 - 0.2 * k;
    sx = 1 + 0.16 * k;
  }
  body.draw(at, facing, sx, sy);
  body.setPose(hop ? "deadpan" : senses.restingPose(now, perch));
}

// Poke: a click on the mascot itself, unless there is a control underneath.
document.addEventListener("click", (event) => {
  if (!body.hit(event.clientX, event.clientY) || event.target.closest("button,a,input,select,label")) return;
  const now = performance.now();
  body.say(QUIPS[quip++ % QUIPS.length], 2600);
  squashUntil = now + 170;
  senses.impatientUntil = now + 1400;
  senses.lastActivity = now;
});

// Other scripts can make it speak: document.dispatchEvent(new CustomEvent("baked:say", { detail: "Fine." })).
document.addEventListener("baked:say", (event) => {
  body.say(String(event.detail || ""), 3200);
  senses.mood = "approve";
  senses.moodUntil = performance.now() + 3200;
  senses.lastActivity = performance.now();
});

requestAnimationFrame(frame);
