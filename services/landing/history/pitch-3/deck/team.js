/**
 * Purpose: the curtains of the Team slide of /pitch3: the mascot runs in, pulls the rope of each curtain in turn,
 *          showing one person at a time, and runs off. Without motion the curtains are simply open.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * Longer than the other scenes (about two seconds): like the closing finale, it is one of the deck's big moments.
 */
import { running, spot, sprite } from "./sprites.js?v=1";

// Where the raised fist is inside the "grabbing the rope" frame, as a share of the frame's height.
const FIST = { x: 1.375, y: 0.075 };
const HEIGHT = 300;

export function curtains(stage, slide) {
  const members = Array.from(slide.querySelectorAll("[data-member]"));
  if (!members.length) return;
  for (const member of members) member.classList.add("is-closed");
  stage.keep({ remove: () => members.forEach((member) => member.classList.remove("is-closed")) });
  // It stands where its fist reaches the knob at the end of each rope.
  const stops = members.map((member) => {
    const knob = spot(member.querySelector("[data-knob]"), slide);
    return { x: knob.x + knob.w / 2 - FIST.x * HEIGHT, y: knob.y + knob.h / 2 - FIST.y * HEIGHT };
  });
  const bun = sprite(slide, "runA", { x: 0, y: stops[0].y, h: HEIGHT });
  stage.keep(bun.box);
  const at = (x) => ({ transform: `translateX(${x}px)` });
  let here = -HEIGHT * 1.5;
  let stop = () => {};
  const runTo = (x, ms) => {
    bun.show("runA");
    stop = running(stage, bun.img, 90);
    bun.box.animate([at(here), at(x)], { duration: ms, easing: "linear", fill: "forwards" });
    here = x;
  };
  bun.box.animate([at(here)], { duration: 1, fill: "forwards" });
  let t = 120;
  members.forEach((member, i) => {
    const ms = i ? 200 : 300;
    stage.later(() => runTo(stops[i].x, ms), t);
    t += ms;
    stage.later(() => {
      stop();
      bun.show("ropeGrab");
    }, t);
    t += 80;
    stage.later(() => {
      bun.show("ropePull");
      member.classList.remove("is-closed");
    }, t);
    t += 250;
  });
  stage.later(() => runTo(1960, 260), t);
}
