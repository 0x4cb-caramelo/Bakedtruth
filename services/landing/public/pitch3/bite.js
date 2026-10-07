/**
 * Purpose: the mascot's bite on the earnings slide of /pitch3: it runs to a loaf and takes a thin slice, which is the
 *          fee. The hidden surprise: a click on the mascot or on the loaf makes it bite again.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 */
import { running, sprite } from "./sprites.js?v=1";

const FLOOR = 1040; // where the feet stand, in the slide's coordinates
const MONO = "font:600 34px/1 'IBM Plex Mono',monospace";

/** `runIn` is true when the slide just arrived going forward: it runs to the loaf. Otherwise it is already there. */
export function bite(stage, slide, { runIn }) {
  // The loaf is flipped so that its bitten end is the one next to the mascot's mouth.
  const loaf = sprite(slide, runIn ? "loaf" : "loafBitten", { x: 548, y: FLOOR - 150, h: 150, flip: true, z: 19 });
  const bun = sprite(slide, runIn ? "runA" : "chew", { x: 250, y: FLOOR - 230, h: 230 });
  stage.keep(loaf.box);
  stage.keep(bun.box);

  const pop = () => {
    const tag = document.createElement("span");
    tag.textContent = "35 USDC";
    tag.style.cssText = `position:absolute;left:600px;top:${FLOOR - 220}px;${MONO};color:#eea546;pointer-events:none;z-index:21;`;
    slide.append(stage.keep(tag));
    const rise = [
      { opacity: 0, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(-16px)", offset: 0.3 },
      { opacity: 0, transform: "translateY(-64px)" },
    ];
    tag.animate(rise, { duration: 1100, easing: "ease-out", fill: "forwards" });
  };
  const chomp = () => {
    bun.show("bite");
    stage.later(() => {
      loaf.show("loafBitten");
      bun.show("chew");
      pop();
    }, 220);
  };

  if (runIn) {
    const arrive = [{ transform: "translateX(-620px)" }, { transform: "none" }];
    bun.box.animate(arrive, { duration: 520, easing: "cubic-bezier(.3,.6,.4,1)" });
    const stop = running(stage, bun.img, 100);
    stage.later(() => {
      stop();
      chomp();
    }, 520);
  }

  for (const el of [bun.box, loaf.box]) {
    el.dataset.egg = "";
    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";
    el.addEventListener("click", (event) => {
      event.stopPropagation(); // not a "next slide" click
      loaf.show("loaf");
      chomp();
    });
  }
}
