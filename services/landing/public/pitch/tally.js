/**
 * Purpose: the two things around the demo card of /pitch that follow the examples: the text on the left of the
 *          Solution slide, which changes with the example (a "beat"), and the balance under the card, which adds up
 *          what the visitor won or lost in each of the four.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-10
 *
 * `alive` is asked before anything delayed is written: a demo that was stopped or restarted must not touch the page.
 */
const SWAP_MS = 300;
const COUNT_MS = 600;

/** "+90.00", "−50.00", "+0.00". */
export const signed = (n) => `${n < 0 ? "−" : "+"}${Math.abs(n).toFixed(2)}`;

const beatsOf = (demo) => Array.from(demo.closest(".slide").querySelectorAll("[data-beat]"));

/** Shows the beat called `name`: the one on screen fades out, then the new one fades in. */
export function beat(demo, name, alive = () => true) {
  const beats = beatsOf(demo);
  const next = beats.find((el) => el.dataset.beat === name);
  const current = beats.find((el) => !el.hidden);
  if (!next || next === current) return;
  current.classList.add("is-away");
  setTimeout(() => {
    if (!alive()) return;
    current.hidden = true;
    current.classList.remove("is-away");
    next.classList.add("is-away");
    next.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove("is-away")));
  }, SWAP_MS);
}

/** Back to the first beat, at once. */
export function firstBeat(demo) {
  beatsOf(demo).forEach((el, i) => {
    el.hidden = i !== 0;
    el.classList.remove("is-away");
  });
}

const balanceOf = (demo) => demo.parentElement.querySelector("[data-balance]");

/** Writes the result of example `i` (0 to 3) on its chip and counts the balance to the new total. */
export function credit(demo, i, amount, alive = () => true) {
  const box = balanceOf(demo);
  if (!box) return;
  const chip = box.querySelectorAll("[data-step]")[i];
  chip.textContent = `${i + 1} · ${signed(amount)}`;
  chip.className = amount > 0.004 ? "is-win" : amount < -0.004 ? "is-loss" : "is-flat";
  const total = box.querySelector("[data-total]");
  const from = Number(box.dataset.sum || 0);
  const to = from + amount;
  box.dataset.sum = String(to);
  const began = performance.now();
  const tick = (now) => {
    if (!alive()) return;
    const k = Math.min(1, (now - began) / COUNT_MS);
    const value = from + (to - from) * k;
    total.textContent = `${signed(value)} SOL`;
    total.className = value > 0.004 ? "is-up" : value < -0.004 ? "is-down" : "";
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** The balance before the first example: nothing won, nothing lost. */
export function clearBalance(demo) {
  const box = balanceOf(demo);
  if (!box) return;
  box.dataset.sum = "0";
  const total = box.querySelector("[data-total]");
  total.textContent = "0.00 SOL";
  total.className = "";
  box.querySelectorAll("[data-step]").forEach((chip, i) => {
    chip.textContent = String(i + 1);
    chip.className = "";
  });
}
