// Where the mascot may stand. A page declares perches as data attributes on any element:
//
//   data-perch="unique-id"        required; the mascot stands on the element's top edge
//   data-perch-x="0.85"           where along the edge, 0..1 (default 0.5)
//   data-perch-dx="-44"           pixels to shift sideways, e.g. to stand beside the element
//   data-perch-edge="bottom"      stand level with the bottom edge instead of on top
//   data-perch-dy="6"             pixels to sink (+) or lift (-) the feet
//   data-perch-size="0.8"         scale for this spot
//   data-perch-pose="skeptical"   resting pose here (default deadpan)
//   data-perch-say="Prove it."    what it says when it lands
//
// Browser-only (reads layout), but free of React so it can be reasoned about on its own.

export type Point = { x: number; y: number };
export type Anchor = Point & { s: number; r: DOMRect };

const num = (value: string | undefined, fallback: number) => (value === undefined ? fallback : parseFloat(value));

/** The feet position a perch offers, in viewport coordinates. */
export function anchor(el: HTMLElement): Anchor {
  const r = el.getBoundingClientRect();
  const d = el.dataset;
  // On phones it stays small so it never covers the copy it stands next to.
  const size = num(d.perchSize, 1);
  const s = innerWidth < 700 ? Math.min(size, 1) * 0.6 : size;
  return {
    x: r.left + r.width * num(d.perchX, 0.5) + num(d.perchDx, 0),
    y: (d.perchEdge === "bottom" ? r.bottom : r.top) + num(d.perchDy, 0),
    s,
    r,
  };
}

/** Whether the mascot, at `size` px tall, would fit on this perch right now. */
export function visible(el: HTMLElement, size: number): boolean {
  if (!el.isConnected || el.closest("[hidden]")) return false;
  const a = anchor(el);
  if (!a.r.width && !a.r.height) return false;
  const h = size * a.s;
  return a.y - h > 0 && a.y < innerHeight - 2 && a.x > h * 0.5 && a.x < innerWidth - h * 0.5;
}

/** How strongly a perch attracts the pointer: zero inside its element, growing with distance. */
export function score(el: HTMLElement, p: Point): number {
  const a = anchor(el);
  const dx = Math.max(a.r.left - p.x, 0, p.x - a.r.right);
  const dy = Math.max(a.r.top - p.y, 0, p.y - a.r.bottom);
  return Math.hypot(dx, dy) + 0.08 * Math.hypot(a.x - p.x, a.y - p.y);
}

/** The visible perch that best matches the pointer. */
export function choose(size: number, p: Point): HTMLElement | null {
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const el of document.querySelectorAll<HTMLElement>("[data-perch]")) {
    if (!visible(el, size)) continue;
    const s = score(el, p);
    if (s < bestScore) {
      best = el;
      bestScore = s;
    }
  }
  return best;
}
