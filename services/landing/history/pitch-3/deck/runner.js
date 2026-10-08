/**
 * Purpose: the mascot's plain run across a slide of /pitch3, used where a slide has no scene of its own. It runs
 *          along the bottom, in the direction of the slide change, alone or with smaller ones behind it.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 */
import { running, url } from "./sprites.js?v=1";

export function run(stage, slide, forward, { followers = 0, ms = 900 } = {}) {
  const r = slide.getBoundingClientRect();
  if (!r.width) return;
  // Laid over the slide and clipped to it: the runner enters and leaves through the slide's own edges.
  const lane = document.createElement("div");
  lane.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;pointer-events:none;overflow:hidden;z-index:30;`;
  document.body.append(stage.keep(lane));
  for (let n = 0; n <= followers; n++) {
    const height = r.height * (n ? 0.17 : 0.3);
    const width = height * 1.5;
    const img = document.createElement("img");
    img.alt = "";
    img.src = url("runA");
    const shadow = `drop-shadow(0 ${height * 0.03}px ${height * 0.04}px rgba(0,0,0,.35))`;
    img.style.cssText = `position:absolute;left:0;bottom:${r.height * 0.02}px;width:${width}px;height:${height}px;image-rendering:pixelated;filter:${shadow};`;
    lane.append(img);
    const from = forward ? -width : r.width;
    const to = forward ? r.width : -width;
    const facing = forward ? "" : " scaleX(-1)";
    const frames = [{ transform: `translateX(${from}px)${facing}` }, { transform: `translateX(${to}px)${facing}` }];
    img.animate(frames, { duration: ms, delay: n * 90, easing: "linear", fill: "both" });
    running(stage, img, n ? 100 : 120);
  }
  stage.later(() => lane.remove(), ms + followers * 90 + 60);
}
