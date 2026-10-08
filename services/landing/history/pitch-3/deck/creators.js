/**
 * Purpose: the mascots of the Creators slide of /pitch3: one drops on the card of the creator's share and gives its
 *          thumbs up; two smaller ones come up from behind the other cards, because anyone can open a market.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * The one with the thumbs up is in the page itself ([data-creator]), so it is there when nothing moves. The cards
 * are stacked above the small ones (the grid has a z-index), which is what lets them hide behind a card.
 */
import { spot, sprite, url } from "./sprites.js?v=1";

const PEEK = { h: 190, up: 112 }; // the small ones: the frame's height, and how much of it shows above the card
const WHERE = [0.66, 0.24]; // where each one comes up, as a share of its card's width
const SPRING = "cubic-bezier(.3,1.5,.5,1)";
const FALL = 400;

/** Two small ones rise from behind the first two cards, `wait` ms from now, one after the other. */
function peekers(stage, slide, wait) {
  slide.querySelectorAll("[data-creator-card]").forEach((card, n) => {
    const at = spot(card, slide);
    const x = at.x + at.w * WHERE[n % 2] - PEEK.h * 0.75;
    const bun = sprite(slide, "front", { x, y: at.y - PEEK.up, h: PEEK.h, flip: n % 2 === 1, z: 0 });
    stage.keep(bun.box);
    // Unseen while it waits: the card in front of it is still fading in.
    const down = `translateY(${PEEK.up + 8}px)`;
    const rise = [
      { opacity: 0, transform: down },
      { opacity: 1, transform: down, offset: 0.04 },
      { opacity: 1, transform: "none" },
    ];
    bun.box.animate(rise, { duration: 340, delay: wait + n * 160, easing: SPRING, fill: "backwards" });
  });
}

/**
 * Full motion. `drop` is true when the slide just arrived going forward: the mascot falls on its card, `wait` ms from
 * now, and the small ones come up as it lands. Otherwise it is already there and only the small ones come up.
 */
export function creators(stage, slide, { drop, wait }) {
  const rest = slide.querySelector("[data-creator]");
  peekers(stage, slide, drop ? wait + FALL + 20 : wait);
  if (!rest || !drop) return;
  const at = spot(rest, slide);
  const bun = sprite(slide, "fall", { x: at.x, y: at.y, h: at.h, flip: true });
  stage.keep(bun.box);
  rest.style.opacity = "0";
  stage.keep({ remove: () => (rest.style.opacity = "") });
  const fall = [{ transform: `translateY(${-(at.y + at.h + 40)}px)` }, { transform: "none" }];
  bun.box.animate(fall, { duration: FALL, delay: wait, easing: "cubic-bezier(.5,0,.9,.6)", fill: "backwards" });
  stage.later(() => {
    bun.show("front");
    const squash = [{ transform: "scale(1.12,0.84)" }, { transform: "none" }];
    bun.box.animate(squash, { duration: 180, easing: "ease-out" });
  }, wait + FALL);
  stage.later(
    () => {
      bun.box.remove();
      rest.style.opacity = "";
    },
    wait + FALL + 220,
  );
}

/** The lighter setting: the mascot is already on its card, and gives its thumbs up once the slide is in. */
export function approve(stage, slide) {
  const rest = slide.querySelector("[data-creator]");
  if (!rest) return;
  const up = rest.src;
  rest.src = url("front");
  stage.keep({ remove: () => (rest.src = up) });
  stage.later(() => {
    rest.src = up;
    // The page flips it, so it looks at the cards: the hop keeps the flip.
    const hop = ["translateY(0)", "translateY(-16px)", "translateY(0)"].map((move) => ({
      transform: `${move} scaleX(-1)`,
    }));
    rest.animate(hop, { duration: 260, easing: "ease-out" });
  }, 900);
}
