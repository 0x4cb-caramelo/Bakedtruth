/**
 * Purpose: what the mascot does on a slide of /pitch before the deck leaves it, when the presenter moves forward.
 *          An exit is short, and it ends by calling `go`, which is what changes the slide.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * motion.js catches the "next" key or click, plays the exit and then lets the deck move on. A second "next" while an
 * exit plays skips it. An exit and the scene that follows it last 1.5 seconds together, at most.
 */
import { wordsAway } from "./market.js?v=2";
import { place, running, sprite, url } from "./sprites.js?v=1";

/** Cover: the mascot leaves its sticker, drops to the floor and runs off to the right. The empty sticker stays. */
function leaveSticker(stage, slide, go) {
  const sticker = slide.querySelector("[data-sticker]");
  if (!sticker) return go();
  const at = place(sticker, slide);
  sticker.src = url("emptySticker");
  stage.keep({ remove: () => (sticker.src = url("fullSticker")) });
  const h = at.h * 0.68; // about the size it has inside the sticker
  const bun = sprite(slide, "fall", { x: at.x + at.w / 2 - h * 0.75, y: at.y, h });
  stage.keep(bun.box);
  const down = 1060 - h - at.y;
  const drop = [
    { transform: "none" },
    { transform: `translateY(${down}px)`, offset: 0.78 },
    { transform: `translateY(${down}px) scale(1.14,0.84)`, offset: 0.9 },
    { transform: `translateY(${down}px)` },
  ];
  bun.box.animate(drop, { duration: 320, easing: "cubic-bezier(.5,0,1,.7)", fill: "forwards" });
  stage.later(() => {
    bun.show("runA");
    running(stage, bun.img, 100);
    const away = [
      { transform: `translateY(${down}px)` },
      { transform: `translate(${1920 - at.x + 300}px,${down}px) scale(0.8)` },
    ];
    bun.box.animate(away, { duration: 280, easing: "ease-in", fill: "forwards" });
  }, 320);
  stage.later(go, 600);
}

/** Problem: it peeks in from the right edge, looks at the audience, then turns and grabs the next slide. */
function peekAndGrab(stage, slide, go) {
  const h = 430;
  const w = h * 1.5;
  const bun = sprite(slide, "front", { x: 1920, y: 1080 - h - 24, h });
  stage.keep(bun.box);
  const shift = (x) => ({ transform: `translateX(${x * w}px)` });
  bun.box.animate([shift(0), shift(-0.55)], { duration: 200, easing: "ease-out", fill: "forwards" });
  stage.later(() => {
    bun.show("grab");
    bun.box.animate([shift(-0.55), shift(-0.84), shift(-0.74)], {
      duration: 180,
      easing: "ease-out",
      fill: "forwards",
    });
  }, 380);
  stage.later(go, 580);
}

/** Exits by the label of the slide being left. A slide with no exit changes at once. */
export const EXITS = {
  Title: leaveSticker,
  Problem: peekAndGrab,
  Market: wordsAway, // v5.1: its words go, and the same chart goes on to the projection
};
