/**
 * Purpose: the mascot's scenes of the deck at /pitch4, by the slide that arrives: what plays when it comes going
 *          forward, going back, or when the page opens on it. A slide with no scene gets the plain run.
 * Version: 0.5.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * A scene is `scene(stage, slide, how)`, with `how` being "forward", "back" or "open". `stage` comes from motion.js:
 * stage.enter(slide, forward) is the slide's usual entrance; stage.keep(thing) registers an element, an animation or
 * a `{ remove }` to be undone on the next slide change; stage.later(fn, ms) and stage.every(fn, ms) are timers
 * cancelled the same way. A scene, with the exit before it (exits.js), lasts 1.5 seconds at most; the curtains of the
 * Team slide and the closing finale are the two longer moments.
 */
import { bite } from "./bite.js?v=2";
import { pull, pulled as leverDown } from "./lever.js?v=1";
import { partners } from "./partners.js?v=3";
import { run } from "./runner.js?v=1";
import { running, sprite } from "./sprites.js?v=1";
import { curtains, photos } from "./team.js?v=2";

/** The usual arrival: the slide's entrance and the plain run. */
export function plain(stage, slide, forward, options) {
  stage.enter(slide, forward);
  run(stage, slide, forward, options);
}

/** Solution: the slide comes in from the right, pulled by the mascot that grabbed it on the slide before. */
function pulled(stage, slide) {
  const h = 430;
  const w = h * 1.5;
  // It goes on the canvas around the slide, not inside it: a slide that is moving hides whatever is outside its box.
  const bun = sprite(slide.parentElement, "pull", { x: -0.78 * w, y: 1080 - h - 24, h });
  stage.keep(bun.box);
  const travel = [{ transform: "translateX(1920px)" }, { transform: "none" }];
  const pace = { duration: 820, easing: "cubic-bezier(.2,.8,.2,1)" };
  stage.keep(slide.animate(travel, pace));
  bun.box.animate(travel, pace);
  // With the slide in place, it lets go and leaves through the left edge.
  const leave = [{ transform: "none" }, { transform: `translateX(${-0.3 * w}px)` }];
  stage.later(() => bun.box.animate(leave, { duration: 140, fill: "forwards" }), 820);
}

/** Market: the big circle rolls in from the right with the mascot running on top, then it jumps off. */
function tamBall(stage, slide) {
  const wrap = slide.querySelector("[data-tam-wrap]");
  const ball = slide.querySelector("[data-tam]");
  if (!wrap || !ball) return run(stage, slide, true);
  const rider = sprite(wrap, "runA", { x: -5, y: -322, h: 340, flip: true });
  stage.keep(rider.box);
  running(stage, rider.img, 100);
  const roll = { duration: 1050, easing: "cubic-bezier(.2,.7,.3,1)" };
  stage.keep(wrap.animate([{ transform: "translateX(1500px)" }, { transform: "none" }], roll));
  stage.keep(ball.animate([{ transform: "rotate(540deg)" }, { transform: "none" }], roll));
  const off = [
    { transform: "none" },
    { transform: "none", offset: 0.7 },
    { transform: "translate(-260px,-150px)", offset: 0.84 },
    { transform: "translate(-700px,520px)", opacity: 0 },
  ];
  rider.box.animate(off, { duration: 1500, easing: "linear", fill: "forwards" });
}

/**
 * `stage.lite` is the lighter setting (the "N" key). The founder's list of what plays in it, of 2026-10-07: the whole
 * change from the cover to the Problem slide; the Solution slide pulled in, and its demo; on Sponsors only the glow;
 * nothing on How we earn; the circle and its rider on Market; the partners count on Growth; all of Team; all of
 * Close. Where a slide plays nothing it still comes in with its usual entrance.
 */
export const SCENES = {
  Title(stage, slide, how) {
    if (how === "open") return;
    if (stage.lite) stage.enter(slide, how === "forward");
    else plain(stage, slide, how === "forward");
  },
  Solution(stage, slide, how) {
    if (how === "forward") pulled(stage, slide);
    else if (how === "back") stage.lite ? stage.enter(slide, false) : plain(stage, slide, false);
  },
  "Open a market"(stage, slide, how) {
    // v4: the Sponsors and Creators slides in one. The mascot pulls the lever; in the lighter setting the lever moves
    // on its own, and "the chain" glows in both.
    if (how === "back" && !stage.lite) plain(stage, slide, false);
    else if (how !== "open") stage.enter(slide, how === "forward");
    pull(stage, slide, { withMascot: !stage.lite, wait: how === "open" ? 300 : 700 });
  },
  "How we earn"(stage, slide, how) {
    if (how !== "open") stage.enter(slide, how === "forward");
    if (stage.lite) return;
    if (how === "back") run(stage, slide, false);
    bite(stage, slide, { runIn: how === "forward" });
  },
  Market(stage, slide, how) {
    if (how === "back") return stage.lite ? stage.enter(slide, false) : plain(stage, slide, false);
    if (how === "forward") {
      stage.enter(slide, true);
      tamBall(stage, slide);
    }
  },
  Growth(stage, slide, how) {
    // The mascot with three smaller ones behind it: the community coming along. Not in the lighter setting.
    if (how !== "open" && stage.lite) stage.enter(slide, how === "forward");
    else if (how !== "open") plain(stage, slide, how === "forward", { followers: 3, ms: 1100 });
    partners(stage, slide);
  },
  Team(stage, slide, how) {
    if (how === "open") return photos(slide);
    stage.enter(slide, how === "forward");
    curtains(stage, slide);
  },
};

/** What a slide shows when nothing moves: the states a scene would have reached. */
export function settled(stage, slide) {
  partners(stage, slide, { animate: false });
  leverDown(slide);
  photos(slide);
}
