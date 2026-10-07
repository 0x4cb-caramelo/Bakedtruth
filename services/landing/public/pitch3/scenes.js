/**
 * Purpose: the mascot's scenes of the deck at /pitch3: what it does when a given slide arrives, beyond the plain run,
 *          and the finale of the closing slide. A scene is a function; motion.js calls it and cleans up after it.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * A scene gets `stage` from motion.js: stage.run(slide, forward, options) is the plain run, stage.pose(i) is one of
 * the preloaded mascot images, stage.keep(thing) registers an element or an animation to be removed on the next
 * slide change, stage.later(fn, ms) is a timer cancelled the same way. Scenes last 1.5 seconds at most.
 * Scenes still to come, waiting for new drawings, are listed in docs/business/_review/plano-do-pitch3.md, block C.
 */
const EASE = "cubic-bezier(.2,.8,.2,1)";
let finaleSlide = null;

/** Market slide: the big circle rolls in from the right with the mascot running on top, then it hops off. */
function tamBall(stage, slide) {
  const wrap = slide.querySelector("[data-tam-wrap]");
  const ball = slide.querySelector("[data-tam]");
  const source = stage.pose(1);
  if (!wrap || !ball || !source) return stage.run(slide, true);
  const rider = document.createElement("img");
  rider.alt = "";
  rider.src = source.currentSrc || source.src;
  rider.style.cssText =
    "position:absolute;left:50%;bottom:100%;width:330px;margin-left:-165px;margin-bottom:-34px;" +
    "image-rendering:pixelated;pointer-events:none;transform-origin:50% 100%;";
  wrap.append(stage.keep(rider));
  const roll = { duration: 1050, easing: "cubic-bezier(.2,.7,.3,1)" };
  stage.keep(wrap.animate([{ transform: "translateX(1500px)" }, { transform: "none" }], roll));
  stage.keep(ball.animate([{ transform: "rotate(540deg)" }, { transform: "none" }], roll));
  // It runs in place on top of the rolling ball, then jumps off to the left and leaves the slide.
  const steps = [];
  for (let i = 0; i <= 6; i++)
    steps.push({ transform: `translateY(${i % 2 ? -26 : 0}px) scaleX(-1)`, offset: (i / 6) * 0.7 });
  steps.push({ transform: "translate(-260px,-150px) scaleX(-1)", offset: 0.84 });
  steps.push({ transform: "translate(-700px,520px) scaleX(-1)", offset: 1, opacity: 0 });
  stage.keep(rider.animate(steps, { duration: 1500, easing: "linear", fill: "forwards" }));
}

/** Growth slide: the mascot runs across with three smaller ones behind it, the community coming along. */
function queue(stage, slide, forward) {
  stage.run(slide, forward, { followers: 3, ms: 1200 });
}

/** Scenes by the label of the slide that arrives. A slide with no scene gets the plain run. */
export const SCENES = {
  Market: (stage, slide, forward) => (forward ? tamBall(stage, slide) : stage.run(slide, forward)),
  Growth: queue,
};

/** Closing slide: the badge lands, blinks twice, gives a thumbs-up with sparkles and points at the code. */
export function finale(slide) {
  if (!slide.hasAttribute("data-deck-active")) return;
  const badge = slide.querySelector("[data-badge]");
  const arrow = slide.querySelector("[data-arrow]");
  if (!badge || !arrow) return;
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
  arrow.animate(arrive, { duration: 400, delay: 2200, easing: EASE, fill: "forwards" });
  const nudge = frames(["translateX(0)", "translateX(14px)", "translateX(0)"]);
  arrow.animate(nudge, { duration: 520, delay: 2650, iterations: 3, easing: "ease-in-out", composite: "add" });
  finaleSlide = slide;
}

/** Undoes the finale, so the closing slide plays it again the next time it arrives. */
export function resetFinale() {
  if (!finaleSlide) return;
  for (const el of finaleSlide.querySelectorAll("[data-badge],[data-arrow]")) {
    for (const animation of el.getAnimations()) animation.cancel();
  }
  finaleSlide = null;
}
