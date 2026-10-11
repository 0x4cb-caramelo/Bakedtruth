// Baked, the mascot, as a page resident. It does not follow the cursor freely: it hops to the
// perch (see perches.ts) nearest to where the pointer has settled, after a short dwell, stays
// glued to that perch while the page scrolls, and finds another when it leaves the screen.
// Poses follow context: `data-mood` under the pointer, frantic movement, idle time.
// Styles live in app/globals.css under `.bk-pet`.

import { fitBubble } from "./bubble";
import { anchor, choose, score, visible, type Point } from "./perches";

export const POSES = ["deadpan", "skeptical", "impatient", "tapping", "tired", "sulking", "approve", "point"] as const;
export type Pose = (typeof POSES)[number];

export type MascotOptions = {
  /** Folder that holds `<pose>.png`, e.g. "/mascot/". */
  base: string;
  /** Height in px at perch size 1. */
  size: number;
  /** Hop in discrete steps on a 4px grid (pixel-art feel). */
  stepped: boolean;
  quips: readonly string[];
};
export type MascotHandle = { refresh: () => void; stop: () => void };

const RATIO = 440 / 280; // sprite canvas; feet on the bottom edge
const DWELL = 170;
const MIN_STAY = 520;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function startMascot(opts: MascotOptions): MascotHandle {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.createElement("div");
  root.className = "bk-pet";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML =
    '<div class="bk-pet-shadow"></div><div class="bk-pet-flip"><div class="bk-pet-squash"><div class="bk-pet-body"></div></div></div><div class="bk-pet-say"></div>';
  const flip = root.querySelector<HTMLElement>(".bk-pet-flip")!;
  const squash = root.querySelector<HTMLElement>(".bk-pet-squash")!;
  const bubble = root.querySelector<HTMLElement>(".bk-pet-say")!;
  const body = root.querySelector<HTMLElement>(".bk-pet-body")!;
  const imgs = new Map<Pose, HTMLImageElement>();
  for (const name of POSES) {
    const img = new Image();
    img.src = `${opts.base}${name}.png`;
    img.alt = "";
    img.draggable = false;
    body.appendChild(img);
    imgs.set(name, img);
  }
  document.body.appendChild(root);

  const pointer: Point = { x: innerWidth * 0.72, y: innerHeight * 0.4 };
  let pointerSeen = false;
  let perch: HTMLElement | null = null;
  let perchId: string | undefined;
  let hop: { from: Point & { s: number }; t0: number; ms: number; arc: number } | null = null;
  let at: (Point & { s: number }) | null = null;
  let pose: Pose | null = null;
  let facing = 1;
  let lastMove = -1e9;
  let lastScroll = -1e9;
  let lastActivity = performance.now();
  let lastDecision = 0;
  let candidate: HTMLElement | null = null;
  let candidateSince = 0;
  let landedAt = 0;
  let squashUntil = 0;
  let impatientUntil = 0;
  let fast = 0;
  let mood: Pose | null = null;
  let moodEl: HTMLElement | null = null;
  let moodUntil = 0;
  let sayTimer = 0;
  let quip = 0;
  let raf = 0;
  const saidAt = new Map<string, number>();

  const setPose = (name: Pose) => {
    if (name === pose) return;
    if (pose) imgs.get(pose)?.classList.remove("is-on");
    imgs.get(name)?.classList.add("is-on");
    pose = name;
  };

  const say = (text: string | undefined, ms = 2400) => {
    if (!text) return;
    bubble.textContent = text;
    bubble.classList.toggle("is-below", !!at && at.y - opts.size * at.s < 56);
    bubble.classList.add("is-on");
    fitBubble(bubble);
    clearTimeout(sayTimer);
    sayTimer = window.setTimeout(() => bubble.classList.remove("is-on"), ms);
  };

  const land = (now: number) => {
    hop = null;
    landedAt = now;
    squashUntil = now + 170;
    const text = perch?.dataset.perchSay;
    if (text && now - (saidAt.get(text) ?? -1e9) > 15_000) {
      saidAt.set(text, now);
      say(text);
    }
  };

  const startHop = (to: HTMLElement, now: number) => {
    const target = anchor(to);
    perch = to;
    perchId = to.dataset.perch;
    candidate = null;
    bubble.classList.remove("is-on");
    if (!at || reduce) {
      at = { x: target.x, y: target.y, s: target.s };
      land(now);
      return;
    }
    const dist = Math.hypot(target.x - at.x, target.y - at.y);
    hop = { from: { ...at }, t0: now, ms: clamp(260 + dist * 0.55, 300, 820), arc: clamp(30 + dist * 0.22, 36, 150) };
    if (Math.abs(target.x - at.x) > 8) facing = target.x < at.x ? -1 : 1;
  };

  const restingPose = (now: number): Pose => {
    if (mood && now < moodUntil) return mood;
    if (now < impatientUntil) return "tapping";
    const idle = now - lastActivity;
    if (idle > 22_000) return "sulking";
    if (idle > 9_000) return "tired";
    const p = perch?.dataset.perchPose as Pose | undefined;
    return p && imgs.has(p) ? p : "deadpan";
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (perch && !perch.isConnected && perchId) {
      perch = document.querySelector<HTMLElement>(`[data-perch="${perchId}"]`) ?? perch;
    }
    if (!perch || !visible(perch, opts.size)) {
      const next = choose(opts.size, pointer);
      if (!next) {
        root.classList.remove("is-on");
        perch = null;
        hop = null;
        return;
      }
      if (next !== perch) startHop(next, now);
    }
    // Has the pointer earned a hop?
    if (!hop && now - lastDecision > 100 && (now - lastMove < 1200 || now - lastScroll < 400)) {
      lastDecision = now;
      const best = choose(opts.size, pointer);
      if (best && best !== perch) {
        if (best !== candidate) {
          candidate = best;
          candidateSince = now;
        } else if (
          now - candidateSince > DWELL &&
          now - landedAt > MIN_STAY &&
          score(best, pointer) + 36 < score(perch!, pointer)
        ) {
          startHop(best, now);
        }
      } else candidate = null;
    }

    const target = anchor(perch!);
    let sx = 1;
    let sy = 1;
    if (hop) {
      let t = (now - hop.t0) / hop.ms;
      if (t >= 1) {
        at = { x: target.x, y: target.y, s: target.s };
        land(now);
      } else {
        if (opts.stepped) t = Math.round(t * 7) / 7;
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
      if (now - lastMove < 1500 && Math.abs(pointer.x - at.x) > 70) facing = pointer.x < at.x ? -1 : 1;
    }
    if (now < squashUntil) {
      const k = (squashUntil - now) / 170;
      sy = 1 - 0.2 * k;
      sx = 1 + 0.16 * k;
    }
    const h = opts.size * at!.s;
    const w = h * RATIO;
    let x = at!.x - w / 2;
    let y = at!.y - h + h * 0.035;
    if (opts.stepped) {
      x = Math.round(x / 4) * 4;
      y = Math.round(y / 4) * 4;
    }
    root.style.width = `${w}px`;
    root.style.height = `${h}px`;
    root.style.transform = `translate3d(${x}px,${y}px,0)`;
    flip.style.transform = `scaleX(${facing})`;
    squash.style.transform = `scale(${sx},${sy})`;
    setPose(hop ? "deadpan" : restingPose(now));
    root.classList.add("is-on");
  };

  const abort = new AbortController();
  const on = { signal: abort.signal, passive: true } as const;
  window.addEventListener(
    "pointermove",
    (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const now = performance.now();
      const speed = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) / Math.max(1, now - lastMove);
      fast = speed > 2.6 ? fast + 1 : Math.max(0, fast - 1);
      if (fast > 16) {
        impatientUntil = now + 1600;
        fast = 0;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointerSeen = true;
      lastMove = lastActivity = now;
    },
    on,
  );
  window.addEventListener(
    "scroll",
    () => {
      lastScroll = lastActivity = performance.now();
      if (!pointerSeen) Object.assign(pointer, { x: innerWidth * 0.72, y: innerHeight * 0.4 });
    },
    { ...on, capture: true },
  );
  window.addEventListener("keydown", () => (lastActivity = performance.now()), on);
  document.addEventListener(
    "pointerover",
    (e) => {
      const el = (e.target as Element).closest?.<HTMLElement>("[data-mood]");
      if (!el) return;
      moodEl = el;
      mood = (imgs.has(el.dataset.mood as Pose) ? el.dataset.mood : null) as Pose | null;
      moodUntil = Infinity;
    },
    on,
  );
  document.addEventListener(
    "pointerout",
    (e: PointerEvent) => {
      if (moodEl && !moodEl.contains(e.relatedTarget as Node | null)) {
        moodEl = null;
        moodUntil = performance.now() + 450;
      }
    },
    on,
  );
  // Keyboard users drive it with focus.
  document.addEventListener(
    "focusin",
    (e) => {
      const el = e.target as HTMLElement;
      if (!el.getBoundingClientRect || el.matches(":hover")) return;
      const r = el.getBoundingClientRect();
      Object.assign(pointer, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      lastMove = lastActivity = performance.now();
    },
    on,
  );
  // Poke: a click on the mascot itself, unless a control is underneath.
  document.addEventListener(
    "click",
    (e) => {
      const r = root.getBoundingClientRect();
      const inside =
        e.clientX > r.left + r.width * 0.2 &&
        e.clientX < r.right - r.width * 0.2 &&
        e.clientY > r.top &&
        e.clientY < r.bottom;
      if (!inside || (e.target as Element).closest("button,a,input,select,label")) return;
      const now = performance.now();
      say(opts.quips[quip++ % opts.quips.length], 2600);
      squashUntil = now + 170;
      impatientUntil = now + 1400;
      lastActivity = now;
    },
    { signal: abort.signal },
  );

  raf = requestAnimationFrame(frame);
  return {
    refresh: () => {
      lastScroll = performance.now();
    },
    stop: () => {
      cancelAnimationFrame(raf);
      clearTimeout(sayTimer);
      abort.abort();
      root.remove();
    },
  };
}
