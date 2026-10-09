/**
 * Purpose: the approved prototype's two effects, the dot field that brightens around the pointer and the spotlight
 *          that follows the pointer across the card grid, plus the top bar's border once the page scrolls.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. From prototype-lab/shared/ledger.js (`effects`); both
 *          stay off with prefers-reduced-motion and the dot field draws only on pointer movement.
 */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Dots on a 24 px grid; the colour is read from --dot-rgb on every draw, so a theme switch only redraws. */
function dots() {
  const canvas = document.getElementById("dots");
  const ctx = canvas.getContext("2d");
  const GAP = 24;
  let mouse = { x: -999, y: -999 };
  let queued = false;
  function paint() {
    queued = false;
    const rgb = getComputedStyle(document.documentElement).getPropertyValue("--dot-rgb").trim() || "150, 175, 235";
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const [w, h] = [innerWidth, innerHeight];
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) [canvas.width, canvas.height] = [w * dpr, h * dpr];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (let y = GAP / 2; y < h; y += GAP) {
      for (let x = GAP / 2; x < w; x += GAP) {
        const near = reduce ? 0 : Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / 190);
        ctx.fillStyle = `rgba(${rgb},${0.07 + near * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + near * 1.2, 0, 6.283);
        ctx.fill();
      }
    }
  }
  const queue = () => queued || ((queued = true), requestAnimationFrame(paint));
  addEventListener("pointermove", (e) => ((mouse = { x: e.clientX, y: e.clientY }), queue()), { passive: true });
  addEventListener("resize", queue);
  addEventListener("brot:theme", queue);
  paint();
}

/** The spotlight: every .card inside a .grid-cards follows the pointer with --mx/--my. */
function spotlight() {
  if (reduce) return;
  document.addEventListener(
    "pointermove",
    (e) => {
      const grid = e.target.closest?.(".grid-cards");
      if (!grid) return;
      for (const el of grid.children) {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    },
    { passive: true },
  );
}

function topBorder() {
  const top = document.querySelector(".top");
  const update = () => top.classList.toggle("scrolled", scrollY > 4);
  addEventListener("scroll", update, { passive: true });
  update();
}

export function startEffects() {
  dots();
  spotlight();
  topBorder();
}
