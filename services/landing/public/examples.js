/**
 * Purpose: plays the example campaigns of the home page: four made-up examples in a loop, one card at a time. A
 *          pointer reads the campaign and joins a side with 0.5 SOL, then the card says how the chain resolved it and
 *          where the pot went. The mechanic is the /pitch demo's (pitch/demo.js); the examples and the words are this
 *          page's, and the arithmetic is the program's rule, as on the site's fee page: Brot keeps 10% of the losing
 *          side, the creator gets 1% of the entries, both taken from the pot.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-12
 *
 * Each example's numbers are in the page (data-yes, data-no, data-pick and data-outcome on its card), so the page
 * without this script still shows the first one. Nothing here is read from the chain, and the cards say so.
 */
export const STAKE = 0.5; // SOL: the platform has no other currency
const FEE = 0.1; // of the losing side
const CREATOR = 0.01; // of the entries
const SPEED = 0.8; // the pace the founder chose for the deck's demo (2026-10-10)
const CANCELLED = Symbol("cancelled");

/** The pot after the visitor's entry, and who gets what once the chain has answered. */
export function settle(example) {
  const yes = example.yes + (example.pick === "yes" ? STAKE : 0);
  const no = example.no + (example.pick === "no" ? STAKE : 0);
  const pot = yes + no;
  const winning = example.outcome === "yes" ? yes : no;
  const brot = (pot - winning) * FEE;
  const creator = pot * CREATOR;
  const winners = pot - brot - creator;
  const won = example.pick === example.outcome;
  return { yes, no, pot, brot, creator, winners, won, net: won ? (STAKE / winning) * winners - STAKE : -STAKE };
}

/** YES's share of the pot, as the percentage a card shows. NO's is the rest. */
export const share = (yes, no) => Math.round((yes / (yes + no)) * 100);

const numbers = (card) => ({
  yes: Number(card.dataset.yes),
  no: Number(card.dataset.no),
  pick: card.dataset.pick,
  outcome: card.dataset.outcome,
});
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const part = (card, name) => card.querySelector(`[data-ex-${name}]`);

/** Writes the two percentages and the bar of a card. */
function show(card, yes, no) {
  const percent = share(yes, no);
  card.querySelector('[data-side="yes"] b').textContent = `${percent}%`;
  card.querySelector('[data-side="no"] b').textContent = `${100 - percent}%`;
  card.querySelector(".bar i").style.width = `${percent}%`;
}

/** A card as the page first showed it: nothing joined, nothing resolved. */
function reset(card) {
  const example = numbers(card);
  card.classList.remove("is-picked", "is-resolved", "is-won", "is-lost");
  for (const side of card.querySelectorAll("[data-side]")) side.classList.remove("is-picked");
  const line = part(card, "line");
  line.dataset.first ??= line.textContent;
  line.textContent = line.dataset.first;
  show(card, example.yes, example.no);
}

/** The visitor's entry goes in: the shares move, and the line says what was joined. */
function join(card, result) {
  const { pick } = numbers(card);
  card.classList.add("is-picked");
  card.querySelector(`[data-side="${pick}"]`).classList.add("is-picked");
  show(card, result.yes, result.no);
  part(card, "line").textContent = `You joined ${pick.toUpperCase()} with ${STAKE} SOL`;
}

/** The chain answers: what the visitor won or lost, and where every SOL of the pot went. */
function resolve(card, result) {
  const face = part(card, "face");
  face.src = face.src.replace(/baked-[a-z]+/, `baked-${result.won ? "approve" : "sulking"}`);
  part(card, "amount").textContent = result.won
    ? `You won +${result.net.toFixed(2)} SOL`
    : `You lost ${STAKE.toFixed(2)} SOL`;
  const sol = (amount) => amount.toFixed(2);
  part(card, "pot").textContent =
    `Pot ${Number(sol(result.pot))} SOL: ${sol(result.brot)} to Brot, ${sol(result.creator)} to the creator, ` +
    `${sol(result.winners)} to the side that was right.`;
  card.classList.add("is-resolved", result.won ? "is-won" : "is-lost");
}

async function play(box, token) {
  const cards = [...box.querySelectorAll("[data-ex]")];
  const cursor = box.querySelector("[data-ex-cursor]");
  /** Waits, and keeps waiting while the tab is hidden or the pointer rests on the card: that is how a visitor stops it. */
  const pause = async (ms) => {
    await sleep(ms / SPEED);
    while (!token.dead && (document.hidden || box.matches(":hover"))) await sleep(300);
    if (token.dead) throw CANCELLED;
  };
  let at = { x: box.offsetWidth * 0.9, y: box.offsetHeight * 0.92 };
  const move = async (target, ms = 650, dx = 0) => {
    const frame = box.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const to = { x: rect.left - frame.left + rect.width / 2 + dx, y: rect.top - frame.top + rect.height / 2 };
    const frames = [{ transform: `translate(${at.x}px,${at.y}px)` }, { transform: `translate(${to.x}px,${to.y}px)` }];
    cursor.animate(frames, { duration: ms / SPEED, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
    at = to;
    await pause(ms);
  };

  for (const card of cards) reset(card);
  cursor.animate([{ transform: `translate(${at.x}px,${at.y}px)` }], { duration: 1, fill: "forwards" });
  await pause(900);
  for (let i = 0; ; i = (i + 1) % cards.length) {
    const card = cards[i];
    const before = cards.find((other) => other !== card && other.classList.contains("is-on"));
    if (before) {
      reset(card);
      before.classList.replace("is-on", "is-gone");
      card.classList.add("is-on");
      await pause(600);
      before.classList.remove("is-gone");
    }
    cursor.classList.add("is-on");
    const question = card.querySelector("h2");
    await move(question, 450, -question.offsetWidth * 0.3);
    await move(question, 900, question.offsetWidth * 0.3);
    const side = card.querySelector(`[data-side="${card.dataset.pick}"]`);
    await move(side);
    side.animate([{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }], 220);
    await pause(260);
    const result = settle(numbers(card));
    join(card, result);
    await pause(1300);
    cursor.classList.remove("is-on");
    resolve(card, result);
    await pause(3800);
  }
}

/** Starts the examples found in the page. With reduced motion asked for, the first card stays as it is. */
export function startExamples(root = document) {
  const box = root.querySelector("[data-examples]");
  if (!box || matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const token = { dead: false };
  play(box, token).catch((error) => {
    if (error !== CANCELLED) throw error;
  });
  return token;
}

if (typeof document !== "undefined") startExamples();
