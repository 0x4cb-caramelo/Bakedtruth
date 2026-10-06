/**
 * Purpose: runs the pitch deck at /pitch: scales the 1920 x 1080 slides to the window and moves between them by
 *          keyboard, click, swipe and the address (#3 opens slide 3).
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 *
 * Replaces the 10 MB self-unpacking bundle the deck was exported in. No dependency, nothing stored, nothing sent.
 */
(function () {
  const WIDTH = 1920;
  const HEIGHT = 1080;
  const root = document.documentElement;
  const deck = document.querySelector("[data-deck]");
  const slides = Array.from(deck.querySelectorAll(".slide"));
  if (!slides.length) return;

  const frames = slides.map((slide, i) => {
    // frame (the size of the scaled slide) > scaler (carries the scale) > slide. The slide itself has no transform,
    // so deck-motion.js can animate it without undoing the scale.
    const frame = document.createElement("div");
    frame.className = "frame";
    const scaler = document.createElement("div");
    scaler.className = "scaler";
    slide.before(frame);
    scaler.append(slide);
    frame.append(scaler);
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${i + 1} of ${slides.length}: ${slide.dataset.label || ""}`);
    return frame;
  });
  root.classList.add("js");

  const count = document.querySelector("[data-count]");
  const prev = document.querySelector("[data-prev]");
  const next = document.querySelector("[data-next]");
  const full = document.querySelector("[data-full]");
  const upright = matchMedia("(max-width: 700px) and (orientation: portrait)");
  const clamp = (n) => Math.min(slides.length - 1, Math.max(0, n));
  const fromHash = () => clamp((parseInt(location.hash.slice(1), 10) || 1) - 1);
  let index = fromHash();
  let shown = -1;

  function layout() {
    const stack = upright.matches;
    root.classList.toggle("stack", stack);
    const scale = stack ? root.clientWidth / WIDTH : Math.min(root.clientWidth / WIDTH, window.innerHeight / HEIGHT);
    deck.style.setProperty("--scale", String(scale));
    deck.style.setProperty("--w", `${WIDTH * scale}px`);
    deck.style.setProperty("--h", `${HEIGHT * scale}px`);
  }

  /** Shows one slide and tells deck-motion.js about it. `reason` is "init" on load and "nav" afterwards. */
  function show(target, reason = "nav") {
    const previousIndex = shown;
    index = clamp(target);
    if (index === shown) return;
    shown = index;
    frames.forEach((frame, i) => frame.classList.toggle("on", i === index));
    slides.forEach((slide, i) => slide.toggleAttribute("data-deck-active", i === index));
    count.textContent = `${index + 1} / ${slides.length}`;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    if (location.hash !== `#${index + 1}`) history.replaceState(null, "", `#${index + 1}`);
    const detail = { slide: slides[index], index, previousIndex, reason };
    document.dispatchEvent(new CustomEvent("slidechange", { detail }));
  }

  const KEYS = {
    ArrowRight: () => show(index + 1),
    ArrowDown: () => show(index + 1),
    PageDown: () => show(index + 1),
    " ": () => show(index + 1),
    ArrowLeft: () => show(index - 1),
    ArrowUp: () => show(index - 1),
    PageUp: () => show(index - 1),
    Home: () => show(0),
    End: () => show(slides.length - 1),
    f: () => toggleFull(),
  };

  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
  }

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || root.classList.contains("stack")) return;
    if (event.target.closest("button, a") && (event.key === " " || event.key === "Enter")) return;
    const action = KEYS[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  });

  // A click on the slide moves forward; on its left third, back. Links inside a slide keep working.
  deck.addEventListener("click", (event) => {
    if (root.classList.contains("stack") || event.target.closest("a, button")) return;
    show(event.clientX < window.innerWidth / 3 ? index - 1 : index + 1);
  });

  let touchX = null;
  deck.addEventListener("touchstart", (event) => (touchX = event.touches[0].clientX), { passive: true });
  deck.addEventListener(
    "touchend",
    (event) => {
      if (touchX === null || root.classList.contains("stack")) return;
      const moved = event.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(moved) > 50) show(moved < 0 ? index + 1 : index - 1);
    },
    { passive: true },
  );

  // The controls fade out when the pointer rests, so they never sit on top of a slide during a talk.
  const bar = document.querySelector("[data-bar]");
  let idleTimer;
  function wake() {
    bar.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => bar.classList.add("idle"), 2500);
  }
  for (const type of ["mousemove", "touchstart", "keydown"]) document.addEventListener(type, wake, { passive: true });
  wake();

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  full.addEventListener("click", toggleFull);
  window.addEventListener("resize", layout);
  window.addEventListener("hashchange", () => show(fromHash()));
  upright.addEventListener("change", layout);

  layout();
  show(index, "init");
})();
