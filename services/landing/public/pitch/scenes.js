/**
 * Purpose: the mascot's scenes of the deck at /pitch, by the slide that arrives: what plays when it comes going
 *          forward, going back, or when the page opens on it. A slide with no scene gets the plain run.
 * Version: 0.7.0 · Sprint: out of band (landing page), 2026-10-10
 *
 * A scene is `scene(stage, slide, how)`, with `how` being "forward", "back" or "open". `stage` comes from motion.js:
 * stage.enter(slide, forward) is the slide's usual entrance; stage.keep(thing) registers an element, an animation or
 * a `{ remove }` to be undone on the next slide change; stage.later(fn, ms) and stage.every(fn, ms) are timers
 * cancelled the same way. A scene, with the exit before it (exits.js), lasts 1.5 seconds at most; the curtains of the
 * Team slide, the climb of the Projection slide and the closing finale are the longer moments.
 *
 * v5 (2026-10-10): the "How we earn" slide and its bite are gone, folded into the Solution demo. v5.1, the same day:
 * the "Open a market" slide and its lever are gone too, and Market is two slides over one chart (market.js).
 */

import { months, pullBack, still } from "./market.js?v=3";
import { drive, landed, liftOff } from "./moon.js?v=1";
import { partners } from "./partners.js?v=3";
import { run } from "./runner.js?v=1";
import { sprite } from "./sprites.js?v=1";
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

/** A Market slide's chart at rest: the mascot on the tip or, in the rocket setting, the lambo and the moon. */
const rest = (stage, slide) => (stage.rocket ? landed : still)(slide);

/**
 * `stage.rocket` is the rocket setting (the "R" key): every scene of the full setting, with the two Market slides
 * played by moon.js. `stage.lite` is the lighter setting (the "N" key). The founder's list of what plays in it, of
 * 2026-10-07: the whole change from the cover to the Problem slide; the Solution slide pulled in, and its demo; the
 * partners count on Growth; all of Team; all of Close. The two Market slides of v5 play in both settings: they are
 * the chart itself. Where a slide plays nothing it still comes in with its usual entrance.
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
  Market(stage, slide, how) {
    // The mascot is in the chart here, so there is no plain run across the slide.
    if (how !== "open") stage.enter(slide, how === "forward");
    if (how === "back") rest(stage, slide);
    else (stage.rocket ? drive : months)(stage, slide);
  },
  Projection(stage, slide, how) {
    // Coming from Market it does not "arrive": it opens on Market's last frame and the chart pulls back.
    if (how === "forward") return (stage.rocket ? liftOff : pullBack)(stage, slide);
    if (how === "back") stage.enter(slide, false);
    rest(stage, slide);
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
  rest(stage, slide);
  photos(slide);
}
