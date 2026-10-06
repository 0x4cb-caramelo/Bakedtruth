/**
 * Purpose: the motion of the pitch deck at /pitch: each slide's entrance, the mascot hopping across the bottom on a
 *          slide change, and the closing slide's finale (blink, thumbs-up sparkles, the arrow to the call to action).
 * Version: 0.2.0 · Sprint: out of band (landing page), 2026-10-05
 *
 * Ported from the script the founder's deck (v2) carried in its export, with the same timings. It listens to the
 * "slidechange" event that deck.js sends. With "reduce motion" on, or with the slides stacked on a phone, nothing
 * moves, and deck.css shows the arrow without the animation.
 */
(function () {
  const EASE = "cubic-bezier(.2,.8,.2,1)";
  const HOP_MS = 1500;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let hopEl = null;
  let timers = [];
  let finaleSlide = null;

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function enter(slide, forward) {
    const from = { opacity: 0, transform: `translateX(${forward ? 40 : -40}px)` };
    slide.animate([from, { opacity: 1, transform: "none" }], { duration: 520, easing: EASE });
    const items = [];
    for (const child of slide.children) {
      const kids = Array.from(child.children);
      if (child.tagName === "DIV" && kids.length > 1 && kids.length <= 6) items.push(...kids);
      else items.push(child);
    }
    items.forEach((el, i) => {
      el.animate(
        [
          { opacity: 0, transform: "translateY(36px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 560,
          delay: 120 + i * 70,
          easing: EASE,
          fill: "backwards",
        },
      );
    });
  }

  /** Three hops across the bottom of the slide, changing pose on each landing. */
  function hop(slide, forward) {
    if (hopEl) hopEl.remove();
    const r = slide.getBoundingClientRect();
    const poses = [0, 1, 2, 3].map((i) => document.querySelector(`img[data-pose="${i}"]`));
    if (!r.width || poses.some((img) => !img || !img.complete || !img.naturalWidth)) return;
    const size = r.height * 0.26;
    const width = size * 1.4;
    const wrap = document.createElement("div");
    wrap.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;pointer-events:none;overflow:hidden;z-index:30;`;
    const bun = document.createElement("div");
    bun.style.cssText = `position:absolute;left:0;bottom:${r.height * 0.02}px;width:${width}px;height:${size}px;transform-origin:50% 100%;`;
    const img = document.createElement("img");
    img.alt = "";
    img.src = poses[0].currentSrc || poses[0].src;
    const shadow = `drop-shadow(0 ${size * 0.04}px ${size * 0.05}px rgba(0,0,0,.35))`;
    img.style.cssText = `width:100%;height:100%;object-fit:contain;display:block;image-rendering:pixelated;transform:scaleX(${forward ? 1 : -1});filter:${shadow};`;
    bun.append(img);
    wrap.append(bun);
    document.body.append(wrap);
    hopEl = wrap;

    const x0 = forward ? -width : r.width;
    const x1 = forward ? r.width : -width;
    const lift = size * 0.75;
    const at = (k) => x0 + (x1 - x0) * (k / 3);
    const frames = [];
    for (let k = 0; k <= 3; k++) {
      if (k > 0)
        frames.push({ offset: (k - 0.5) / 3, transform: `translate(${at(k - 0.5)}px,${-lift}px) scale(0.95,1.08)` });
      frames.push({ offset: Math.max(0, k / 3 - 0.0001), transform: `translate(${at(k)}px,0) scale(1.12,0.86)` });
      if (k < 3) {
        frames.push({
          offset: Math.min(1, k / 3 + 0.05),
          transform: `translate(${at(k + 0.15)}px,${-lift * 0.4}px) scale(0.94,1.08)`,
        });
      }
    }
    frames.sort((a, b) => a.offset - b.offset);
    frames[0].offset = 0;
    frames[frames.length - 1].offset = 1;
    bun.animate(frames, { duration: HOP_MS, easing: "linear", fill: "both" });
    for (const [i, pose] of [1, 2, 3].entries()) {
      timers.push(setTimeout(() => (img.src = poses[pose].currentSrc || poses[pose].src), HOP_MS * ((i + 1) / 3) - 40));
    }
    timers.push(
      setTimeout(() => {
        wrap.remove();
        if (hopEl === wrap) hopEl = null;
      }, HOP_MS + 60),
    );
  }

  function finale(slide) {
    if (!slide.hasAttribute("data-deck-active")) return;
    const badge = slide.querySelector("[data-badge]");
    const arrow = slide.querySelector("[data-arrow]");
    if (!badge || !arrow) return;
    // Land: a little bounce as the runner arrives.
    const bounce = ["translateY(0)", "translateY(-18px)", "translateY(0) scale(1.03,0.97)", "none"];
    badge.animate(
      bounce.map((transform) => ({ transform })),
      { duration: 420, easing: EASE },
    );
    // Blink twice.
    const lid = (scale, offset) => ({ transform: `rotate(-7deg) scaleY(${scale})`, offset });
    const blink = [lid(0), lid(1, 0.45), lid(1, 0.55), lid(0)];
    for (const el of slide.querySelectorAll("[data-lid]")) {
      el.animate(blink, { duration: 220, delay: 500, easing: "ease-in-out" });
      el.animate(blink, { duration: 220, delay: 820, easing: "ease-in-out" });
    }
    // Thumbs up: a wiggle, and a burst of sparkles near the thumb.
    const wiggle = [
      "none",
      "rotate(-6deg) scale(1.06)",
      "rotate(5deg) scale(1.06)",
      "rotate(-3deg) scale(1.04)",
      "none",
    ];
    badge.animate(
      wiggle.map((transform) => ({ transform })),
      { duration: 700, delay: 1250, easing: "ease-in-out" },
    );
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
    // Point right: lean toward the call to action; the arrow comes in, nudges three times and stays.
    const lean = ["none", "translateX(18px) rotate(4deg)", "translateX(6px) rotate(1.5deg)"];
    badge.animate(
      lean.map((transform) => ({ transform })),
      { duration: 600, delay: 2100, easing: EASE, fill: "forwards" },
    );
    const arrive = [{ opacity: 0, transform: "translateX(-40px)" }, { opacity: 1, transform: "translateX(0)" }]; // prettier-ignore
    arrow.animate(arrive, { duration: 400, delay: 2200, easing: EASE, fill: "forwards" });
    const nudge = ["translateX(0)", "translateX(14px)", "translateX(0)"].map((transform) => ({ transform }));
    arrow.animate(nudge, { duration: 520, delay: 2650, iterations: 3, easing: "ease-in-out", composite: "add" });
    finaleSlide = slide;
  }

  function resetFinale() {
    if (!finaleSlide) return;
    for (const el of finaleSlide.querySelectorAll("[data-badge],[data-arrow]")) {
      for (const animation of el.getAnimations()) animation.cancel();
    }
    finaleSlide = null;
  }

  document.addEventListener("slidechange", (event) => {
    const { slide, index, previousIndex, reason } = event.detail || {};
    if (!slide || still.matches || document.documentElement.classList.contains("stack")) return;
    clearTimers();
    resetFinale();
    const hasFinale = slide.querySelector("[data-badge]");
    // Opened straight on a slide (a shared #8 link): no hop, but the closing slide still plays its finale.
    if (reason === "init" || previousIndex < 0) {
      if (hasFinale) timers.push(setTimeout(() => finale(slide), 600));
      return;
    }
    const forward = index >= previousIndex;
    enter(slide, forward);
    hop(slide, forward);
    if (hasFinale) timers.push(setTimeout(() => finale(slide), 1450));
  });
})();
