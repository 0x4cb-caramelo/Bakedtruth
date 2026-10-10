/**
 * Purpose: draws Baked, the mascot, on the campaigns prototype: the sprite with its eight poses, the shadow and the
 *          speech bubble. It knows nothing about where to stand; mascot.js decides that.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08
 *
 * Copied from services/landing/public/mascot-body.js. One change: near the window's edges the bubble slides back
 * inside (a Sprint -1 definition-of-done item; the live site cuts it). The styles are in css/mascot.css (.bk-pet).
 */
export const POSES = ["deadpan", "skeptical", "impatient", "tapping", "tired", "sulking", "approve", "point"];

/** Sprite canvas, with the feet on the bottom edge. */
const RATIO = 440 / 280;

function part(className) {
  const el = document.createElement("div");
  el.className = className;
  return el;
}

/** Builds the mascot's elements. `size` is its height in pixels at scale 1; `base` is the image path prefix. */
export function createBody({ size, base }) {
  const root = part("bk-pet");
  root.setAttribute("aria-hidden", "true");
  const flip = part("bk-pet-flip");
  const squash = part("bk-pet-squash");
  const body = part("bk-pet-body");
  const bubble = part("bk-pet-say");
  squash.append(body);
  flip.append(squash);
  root.append(part("bk-pet-shadow"), flip, bubble);

  const imgs = {};
  for (const name of POSES) {
    const img = new Image();
    img.src = `${base}${name}.webp`;
    img.alt = "";
    img.draggable = false;
    body.append(img);
    imgs[name] = img;
  }
  document.body.append(root);

  let pose = "";
  let sayTimer = 0;

  return {
    height: (scale) => size * scale,

    setPose(name) {
      if (name === pose || !imgs[name]) return;
      if (imgs[pose]) imgs[pose].classList.remove("is-on");
      imgs[name].classList.add("is-on");
      pose = name;
    },

    say(text, ms = 2400) {
      if (!text) return;
      bubble.textContent = text;
      bubble.classList.add("is-on");
      clearTimeout(sayTimer);
      sayTimer = setTimeout(() => bubble.classList.remove("is-on"), ms);
    },

    hush: () => bubble.classList.remove("is-on"),

    /** Places the feet at (x, y) at the given scale, facing left (-1) or right (1), stretched by sx and sy. */
    draw(at, facing, sx, sy) {
      const h = size * at.s;
      const w = h * RATIO;
      // Near the top of the window the bubble goes under the mascot, so it is never cut off. Decided here and not in
      // say(): the first line is spoken before the first frame is drawn.
      bubble.classList.toggle("is-below", at.y - h < 56);
      // The bubble is centred on the mascot; near either edge it slides back inside the window (Sprint -1 fix).
      const bw = bubble.offsetWidth;
      const left = at.x - bw / 2;
      const room = Math.max(8, Math.min(left, innerWidth - 8 - bw));
      bubble.style.setProperty("--say-dx", `${Math.round(room - left)}px`);
      root.style.width = `${w}px`;
      root.style.height = `${h}px`;
      root.style.transform = `translate3d(${at.x - w / 2}px,${at.y - h + h * 0.035}px,0)`;
      flip.style.transform = `scaleX(${facing})`;
      squash.style.transform = `scale(${sx},${sy})`;
      root.classList.add("is-on");
    },

    hide: () => root.classList.remove("is-on"),

    /** True when a click at (x, y) lands on the mascot's body, not on the empty sides of its sprite. */
    hit(x, y) {
      const r = root.getBoundingClientRect();
      return x > r.left + r.width * 0.2 && x < r.right - r.width * 0.2 && y > r.top && y < r.bottom;
    },
  };
}
