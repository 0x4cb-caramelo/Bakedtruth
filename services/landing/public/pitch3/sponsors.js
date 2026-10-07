/**
 * Purpose: the mascot on the Sponsors slide of /pitch3: it swings in on a rope, lets go where the slide's own mascot
 *          stands, and from then on points at the last step, the one the chain answers.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 */
import { spot, sprite, url } from "./sprites.js?v=1";

// Where the closed fist is inside the "hanging" frame, as a share of the frame's height (measured on the drawing).
const FIST = { x: 0.344, y: 0.069 };
const ROPE = 520;
const FROM = 62; // degrees: it comes from the upper left
const TO = -28; //  and lets go a little past the lowest point

/** The slide's own mascot raises its arm and points, again and again. The page flips it, so it points left. */
export function pointing(stage, slide) {
  const img = slide.querySelector("[data-pointer]");
  if (!img) return;
  const show = (pose) => (img.src = url(pose));
  const beat = () => {
    show("pointA");
    stage.later(() => show("pointB"), 170);
    stage.later(() => show("pointC"), 340);
    stage.later(() => show("pointB"), 1500);
    stage.later(() => show("pointA"), 1660);
  };
  beat();
  stage.every(beat, 3200);
  stage.keep({ remove: () => show("pointB") });
}

/** It swings across the slide hanging from a rope and drops on the mascot's spot. `then` runs when it has landed. */
export function swingIn(stage, slide, then) {
  const target = slide.querySelector("[data-pointer]");
  if (!target) return then();
  const at = spot(target, slide);
  const h = at.h;
  const rad = (TO * Math.PI) / 180;
  // The pivot is placed so that, at the end of the swing, the fist is right above the mascot's spot.
  const pivot = { x: at.x + FIST.x * h + ROPE * Math.sin(rad), y: at.y - 70 - ROPE * Math.cos(rad) };
  const arm = document.createElement("div");
  arm.style.cssText = `position:absolute;left:${pivot.x}px;top:${pivot.y}px;width:0;height:0;z-index:20;transform-origin:0 0;pointer-events:none;`;
  const rope = document.createElement("div");
  rope.style.cssText = `position:absolute;left:-3px;top:0;width:6px;height:${ROPE}px;border-radius:3px;background:#1b1611;`;
  arm.append(rope);
  slide.append(stage.keep(arm));
  // The frame hangs from the end of the rope by its fist.
  sprite(arm, "hang", { x: -FIST.x * h, y: ROPE - FIST.y * h, h });
  target.style.opacity = "0";
  stage.keep({ remove: () => (target.style.opacity = "") });
  const swing = [{ transform: `rotate(${FROM}deg)` }, { transform: `rotate(${TO}deg)` }];
  arm.animate(swing, { duration: 820, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" });
  stage.later(() => {
    arm.remove();
    target.style.opacity = "";
    target.src = url("drop");
    const land = [
      { transform: "translateY(-70px) scaleX(-1)" },
      { transform: "translateY(0) scaleX(-1)", offset: 0.7 },
      { transform: "translateY(0) scale(-1.1,0.88)", offset: 0.85 },
      { transform: "translateY(0) scaleX(-1)" },
    ];
    target.animate(land, { duration: 300, easing: "ease-in" });
    stage.later(then, 320);
  }, 820);
}
