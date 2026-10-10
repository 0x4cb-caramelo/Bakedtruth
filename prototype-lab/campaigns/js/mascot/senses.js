/**
 * Purpose: what Baked, the mascot, notices on the campaigns prototype: where the pointer rests, scrolling, keyboard
 *          focus, how long the visitor has been still, and which element sets its mood.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08
 *
 * Copied unchanged from services/landing/public/mascot-senses.js. Nothing here is stored or sent.
 */

/** Starts listening. Returns the live state that mascot.js reads on every frame. */
export function createSenses() {
  const senses = {
    pointer: { x: innerWidth * 0.72, y: innerHeight * 0.4, seen: false },
    lastMove: -1e9,
    lastScroll: -1e9,
    lastActivity: performance.now(),
    impatientUntil: 0,
    mood: null,
    moodUntil: 0,

    /** The pose to hold while standing still on `perch`. */
    restingPose(now, perch) {
      if (senses.mood && now < senses.moodUntil) return senses.mood;
      if (now < senses.impatientUntil) return "tapping";
      const idle = now - senses.lastActivity;
      if (idle > 22000) return "sulking";
      if (idle > 9000) return "tired";
      return (perch && perch.dataset.perchPose) || "deadpan";
    },
  };
  let fast = 0;
  let moodEl = null;

  addEventListener(
    "pointermove",
    (event) => {
      // A finger dragging the page is not a pointer resting somewhere: touch moves it by scroll and focus instead.
      if (event.pointerType === "touch") return;
      const now = performance.now();
      const dt = Math.max(1, now - senses.lastMove);
      const speed = Math.hypot(event.clientX - senses.pointer.x, event.clientY - senses.pointer.y) / dt;
      // Sustained frantic movement makes it tap its foot.
      fast = speed > 2.6 ? fast + 1 : Math.max(0, fast - 1);
      if (fast > 16) {
        senses.impatientUntil = now + 1600;
        fast = 0;
      }
      senses.pointer.x = event.clientX;
      senses.pointer.y = event.clientY;
      senses.pointer.seen = true;
      senses.lastMove = senses.lastActivity = now;
    },
    { passive: true },
  );

  addEventListener(
    "scroll",
    () => {
      senses.lastScroll = senses.lastActivity = performance.now();
      if (!senses.pointer.seen) {
        senses.pointer.x = innerWidth * 0.72;
        senses.pointer.y = innerHeight * 0.4;
      }
    },
    { passive: true, capture: true },
  );

  document.addEventListener("pointerover", (event) => {
    const el = event.target.closest && event.target.closest("[data-mood]");
    if (!el) return;
    moodEl = el;
    senses.mood = el.dataset.mood;
    senses.moodUntil = Infinity;
  });
  document.addEventListener("pointerout", (event) => {
    if (!moodEl || moodEl.contains(event.relatedTarget)) return;
    moodEl = null;
    senses.moodUntil = performance.now() + 450;
  });

  // Keyboard users drive it with focus.
  document.addEventListener("focusin", (event) => {
    if (!event.target.getBoundingClientRect || event.target.matches(":hover")) return;
    const r = event.target.getBoundingClientRect();
    senses.pointer.x = r.left + r.width / 2;
    senses.pointer.y = r.top + r.height / 2;
    senses.lastMove = senses.lastActivity = performance.now();
  });
  addEventListener("keydown", () => (senses.lastActivity = performance.now()));

  return senses;
}
