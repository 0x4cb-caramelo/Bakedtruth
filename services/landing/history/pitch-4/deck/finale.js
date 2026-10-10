/**
 * Purpose: the finale of the closing slide of /pitch4: the badge lands, blinks twice, gives a thumbs-up with
 *          sparkles and points at the code. The timings are the ones of the founder's own deck.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 */
const EASE = "cubic-bezier(.2,.8,.2,1)";
let played = null;

export function finale(slide) {
  if (!slide.hasAttribute("data-deck-active")) return;
  const badge = slide.querySelector("[data-badge]");
  const arrow = slide.querySelector("[data-arrow]"); // gone in v4, at the mentors' request; the code stands alone
  if (!badge) return;
  const frames = (list) => list.map((transform) => ({ transform }));
  badge.animate(frames(["translateY(0)", "translateY(-18px)", "translateY(0) scale(1.03,0.97)", "none"]), {
    duration: 420,
    easing: EASE,
  });
  const lid = (scale, offset) => ({ transform: `rotate(-7deg) scaleY(${scale})`, offset });
  const blink = [lid(0), lid(1, 0.45), lid(1, 0.55), lid(0)];
  for (const el of slide.querySelectorAll("[data-lid]")) {
    el.animate(blink, { duration: 220, delay: 500, easing: "ease-in-out" });
    el.animate(blink, { duration: 220, delay: 820, easing: "ease-in-out" });
  }
  const wiggle = ["none", "rotate(-6deg) scale(1.06)", "rotate(5deg) scale(1.06)", "rotate(-3deg) scale(1.04)", "none"];
  badge.animate(frames(wiggle), { duration: 700, delay: 1250, easing: "ease-in-out" });
  const dirs = [[60, -90], [110, -20], [-30, -110], [90, 60]]; // prettier-ignore
  slide.querySelectorAll("[data-spark]").forEach((el, i) => {
    const [dx, dy] = dirs[i % dirs.length];
    const burst = [
      { opacity: 0, transform: "translate(0,0) scale(.4)" },
      { opacity: 1, transform: `translate(${dx * 0.6}px,${dy * 0.6}px) scale(1.2)`, offset: 0.4 },
      { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(.6)` },
    ];
    el.animate(burst, { duration: 650, delay: 1350 + i * 40, easing: "ease-out" });
  });
  const lean = frames(["none", "translateX(18px) rotate(4deg)", "translateX(6px) rotate(1.5deg)"]);
  badge.animate(lean, { duration: 600, delay: 2100, easing: EASE, fill: "forwards" });
  const arrive = [{ opacity: 0, transform: "translateX(-40px)" }, { opacity: 1, transform: "translateX(0)" }]; // prettier-ignore
  if (arrow) {
    arrow.animate(arrive, { duration: 400, delay: 2200, easing: EASE, fill: "forwards" });
    const nudge = frames(["translateX(0)", "translateX(14px)", "translateX(0)"]);
    arrow.animate(nudge, { duration: 520, delay: 2650, iterations: 3, easing: "ease-in-out", composite: "add" });
  }
  played = slide;
}

/** Undoes the finale, so the closing slide plays it again the next time it arrives. */
export function resetFinale() {
  if (!played) return;
  for (const el of played.querySelectorAll("[data-badge],[data-arrow]")) {
    for (const animation of el.getAnimations()) animation.cancel();
  }
  played = null;
}
