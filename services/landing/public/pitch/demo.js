/**
 * Purpose: plays the product demo on the Solution slide of /pitch: four examples in a row, each finished before the
 *          next begins. A pointer picks a side on three markets and the chain resolves each one: a win, a loss, then
 *          a market that shows the fee (example 3) and, on the same card, the creator's share (example 4). The text
 *          on the left of the slide and the balance under the card follow along (tally.js).
 * Version: 0.3.0 · Sprint: out of band (landing page), 2026-10-10
 *
 * Asked by the founder on 2026-10-10, after that night's review (docs/business/_review/revisao-do-pitch-2026-10-10.md):
 * the examples in sequence instead of a card flipping back and forth, and the "How we earn" slide folded into this
 * one. The arithmetic, and the open question of where the creator's 1% comes from, are in pot.js.
 */
import { BROT_NOTE, CREATOR_NOTE, STAKE, split } from "./pot.js?v=2";
import { beat, clearBalance, credit, firstBeat, signed } from "./tally.js?v=2";

const MARKETS = {
  a: { yes: 3, no: 7, pick: "yes", outcome: "yes" },
  b: { yes: 6, no: 4, pick: "no", outcome: "yes" },
  c: { yes: 5.5, no: 4, pick: "yes", outcome: "yes" }, // with the visitor's 0.5: 6 against 4, a pot of 10 SOL
};
const SPEED = 0.8; // the founder asked for the whole demo at 0.8 of its first pace (2026-10-10)
const SAME_MARKET = "EXAMPLE 4 · SAME MARKET, AND WHO OPENED IT";
const CANCELLED = Symbol("cancelled");
let run = null; // the demo that is playing: { el, dead }

/** Centre of `target` in the coordinates of the demo box: offsets, so the slide's scale does not matter. */
function spot(target, box) {
  let x = target.offsetWidth / 2;
  let y = target.offsetHeight / 2;
  for (let node = target; node && node !== box; node = node.offsetParent) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y };
}

function reset(el) {
  el.querySelector("[data-cursor]").classList.remove("is-on");
  for (const face of el.querySelectorAll("[data-face]")) {
    face.classList.remove("is-gone", "is-picked", "is-resolved", "is-won", "is-lost", "is-split", "has-creator");
    face.classList.toggle("is-on", face.dataset.face === "a");
    face.querySelector("[data-kick]").textContent = face.dataset.kicker;
    face.querySelector("[data-status]").textContent = face.dataset.info;
    for (const slice of face.querySelectorAll("[data-slice]")) slice.style.flex = "";
    for (const side of face.querySelectorAll("[data-side]")) {
      side.classList.remove("is-picked");
      side.querySelector("b").textContent = side.dataset.start;
    }
  }
  const note = el.closest(".slide").querySelector("[data-creator-note]");
  if (note) note.textContent = CREATOR_NOTE;
  firstBeat(el);
  clearBalance(el);
}

function pick(face, market) {
  const after = split(market);
  face.classList.add("is-picked");
  for (const side of face.querySelectorAll("[data-side]")) {
    side.classList.toggle("is-picked", side.dataset.side === market.pick);
    side.querySelector("b").textContent = `${after[side.dataset.side]}%`;
  }
  face.querySelector("[data-status]").textContent = `You picked ${market.pick.toUpperCase()} · ${STAKE} SOL`;
}

/** Examples 1 and 2: the card says who was right. Returns what the visitor won or lost. */
function resolve(face, market) {
  const { won, net } = split(market);
  face.classList.add("is-resolved", won ? "is-won" : "is-lost");
  // Two lines, so the amount never breaks in the middle (the style keeps the line break).
  const lost = `You lost\n${STAKE.toFixed(2)} SOL`;
  face.querySelector("[data-amount]").textContent = won ? `You won\n${signed(net)} SOL` : lost;
  face.querySelector("[data-mood]").src = won ? "../img/baked-approve.webp" : "../img/baked-sulking.webp";
  return net;
}

/** Examples 3 and 4: where every SOL of the pot went, first without and then with whoever opened the market. */
function share(face, market, withCreator) {
  const s = split(market, withCreator);
  face.classList.add("is-resolved", "is-split");
  face.classList.toggle("has-creator", withCreator);
  const write = (name, text) => (face.querySelector(`[data-${name}]`).textContent = text);
  write("brot", s.brot.toFixed(2));
  write("creator", s.creator.toFixed(2));
  write("winners", s.winners.toFixed(2));
  write("brot-note", withCreator ? BROT_NOTE : "10% of the losing side");
  write("status", `Resolved by the chain · you won ${signed(s.net)} SOL`);
  if (withCreator) write("kick", SAME_MARKET);
  const sizes = { win: s.winning, lose: s.winners - s.winning, creator: s.creator, brot: s.brot };
  for (const [slice, size] of Object.entries(sizes)) {
    face.querySelector(`[data-slice="${slice}"]`).style.flex = String(size);
  }
  return s.net;
}

async function play(el, token) {
  const cursor = el.querySelector("[data-cursor]");
  const face = (id) => el.querySelector(`[data-face="${id}"]`);
  const alive = () => !token.dead;
  const pause = (ms) =>
    new Promise((done) => setTimeout(done, ms / SPEED)).then(() => {
      if (token.dead) throw CANCELLED;
    });
  let at = { x: el.offsetWidth * 0.9, y: el.offsetHeight * 0.95 };
  const move = async (target, ms = 650, dx = 0) => {
    const to = spot(target, el);
    to.x += dx;
    const frames = [{ transform: `translate(${at.x}px,${at.y}px)` }, { transform: `translate(${to.x}px,${to.y}px)` }];
    cursor.animate(frames, { duration: ms / SPEED, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
    at = to;
    await pause(ms);
  };
  /** The card `id` comes in as the one before it leaves, and the pointer follows the question while it is read. */
  const bring = async (id, previous) => {
    face(previous).classList.replace("is-on", "is-gone");
    face(id).classList.add("is-on");
    await pause(600);
    const question = face(id).querySelector("[data-question]");
    await move(question, 450, -question.offsetWidth * 0.3);
    await move(question, 900, question.offsetWidth * 0.3);
  };
  const choose = async (id) => {
    const side = face(id).querySelector(`[data-side="${MARKETS[id].pick}"]`);
    await move(side);
    side.animate([{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }], 220);
    await pause(260);
    pick(face(id), MARKETS[id]);
    await pause(1000);
  };

  reset(el);
  cursor.animate([{ transform: `translate(${at.x}px,${at.y}px)` }], { duration: 1, fill: "forwards" });
  await pause(500);
  cursor.classList.add("is-on");
  // 1: a price market. The visitor picks YES and is right.
  await choose("a");
  credit(el, 0, resolve(face("a"), MARKETS.a), alive);
  await pause(2400);
  // 2: a sponsored market. The visitor picks NO and is wrong.
  await bring("b", "a");
  await choose("b");
  credit(el, 1, resolve(face("b"), MARKETS.b), alive);
  await pause(2400);
  // 3: the text on the left turns to the fee, and the card shows the pot being shared.
  beat(el, "earn", alive);
  await bring("c", "b");
  await choose("c");
  cursor.classList.remove("is-on");
  const feeOnly = share(face("c"), MARKETS.c, false);
  credit(el, 2, feeOnly, alive);
  await pause(4200);
  // 4: the same market, now with whoever opened it. The balance moves by what that costs the visitor, if anything.
  beat(el, "creator", alive);
  await pause(500);
  credit(el, 3, share(face("c"), MARKETS.c, true) - feeOnly, alive);
}

/** Starts the demo found inside `slide`. Playing it again restarts it from the first step. */
export function startDemo(slide) {
  const el = slide.querySelector("[data-demo]");
  if (!el) return;
  stopDemo();
  const token = { el, dead: false };
  run = token;
  play(el, token).catch((error) => {
    if (error !== CANCELLED) throw error;
  });
}

/** Stops the demo and puts the first card, the first text and an empty balance back. */
export function stopDemo() {
  if (!run) return;
  run.dead = true;
  for (const node of run.el.querySelectorAll("*")) for (const animation of node.getAnimations()) animation.cancel();
  reset(run.el);
  run = null;
}
