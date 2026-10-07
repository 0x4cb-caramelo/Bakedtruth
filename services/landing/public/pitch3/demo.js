/**
 * Purpose: plays the product demo on the Solution slide of /pitch3: a pointer picks YES on one market and NO on
 *          another, the card flips between them, and each is resolved by the chain, one a win and one a loss.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * Every figure is an example, and the card says so. FEE is the one line to change when the fee rule is settled:
 * the deck says 3.5% of the pot; the business plan says 10% of the losing side ({ of: "losers", rate: 0.1 }).
 */
const FEE = { of: "pot", rate: 0.035 };
const STAKE = 50;
const MARKETS = {
  a: { yes: 300, no: 700, pick: "yes", outcome: "yes" },
  b: { yes: 600, no: 400, pick: "no", outcome: "yes" },
};
const CANCELLED = Symbol("cancelled");
let run = null; // the demo that is playing: { el, dead }

/** The pool after the visitor's stake, and what the visitor gets when the market resolves. */
function settle(market) {
  const yes = market.yes + (market.pick === "yes" ? STAKE : 0);
  const no = market.no + (market.pick === "no" ? STAKE : 0);
  const pot = yes + no;
  const winners = market.outcome === "yes" ? yes : no;
  const fee = (FEE.of === "pot" ? pot : pot - winners) * FEE.rate;
  const won = market.pick === market.outcome;
  const net = won ? (STAKE / winners) * (pot - fee) - STAKE : -STAKE;
  return { yes: Math.round((yes / pot) * 100), no: Math.round((no / pot) * 100), won, net };
}

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
  el.querySelector("[data-flip]").classList.remove("is-turned");
  el.querySelector("[data-cursor]").classList.remove("is-on");
  for (const face of el.querySelectorAll("[data-face]")) {
    face.classList.remove("is-picked", "is-resolved", "is-won", "is-lost");
    face.querySelector("[data-status]").textContent = face.dataset.info;
    for (const side of face.querySelectorAll("[data-side]")) {
      side.classList.remove("is-picked");
      side.querySelector("b").textContent = side.dataset.start;
    }
  }
}

function pick(face, market) {
  const after = settle(market);
  face.classList.add("is-picked");
  for (const side of face.querySelectorAll("[data-side]")) {
    side.classList.toggle("is-picked", side.dataset.side === market.pick);
    side.querySelector("b").textContent = `${after[side.dataset.side]}%`;
  }
  face.querySelector("[data-status]").textContent = `You picked ${market.pick.toUpperCase()} · ${STAKE} USDC`;
}

function resolve(face, market) {
  const { won, net } = settle(market);
  face.classList.add("is-resolved", won ? "is-won" : "is-lost");
  // Two lines, so the amount never breaks in the middle (the style keeps the line break).
  face.querySelector("[data-amount]").textContent = won
    ? `You won\n+${net.toFixed(2)} USDC`
    : `You lost\n${STAKE} USDC`;
  face.querySelector("[data-mood]").src = won ? "../img/baked-approve.webp" : "../img/baked-sulking.webp";
}

async function play(el, token) {
  const box = el;
  const flip = el.querySelector("[data-flip]");
  const cursor = el.querySelector("[data-cursor]");
  const face = (id) => el.querySelector(`[data-face="${id}"]`);
  const pause = (ms) =>
    new Promise((done) => setTimeout(done, ms)).then(() => {
      if (token.dead) throw CANCELLED;
    });
  let at = { x: box.offsetWidth * 0.9, y: box.offsetHeight * 0.95 };
  const move = async (target, ms = 650, dx = 0) => {
    const to = spot(target, box);
    to.x += dx;
    const frames = [{ transform: `translate(${at.x}px,${at.y}px)` }, { transform: `translate(${to.x}px,${to.y}px)` }];
    cursor.animate(frames, { duration: ms, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
    at = to;
    await pause(ms);
  };
  const click = async (target) => {
    target.animate([{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }], 220);
    await pause(260);
  };

  reset(el);
  cursor.animate([{ transform: `translate(${at.x}px,${at.y}px)` }], { duration: 1, fill: "forwards" });
  await pause(500);
  cursor.classList.add("is-on");
  // First market: pick YES.
  const yes = face("a").querySelector('[data-side="yes"]');
  await move(yes);
  await click(yes);
  pick(face("a"), MARKETS.a);
  await pause(1000);
  // The card turns to the second market. The pointer follows the question while it is read, then picks NO.
  flip.classList.add("is-turned");
  await pause(850);
  const question = face("b").querySelector("[data-question]");
  await move(question, 500, -question.offsetWidth * 0.3);
  await move(question, 1100, question.offsetWidth * 0.3);
  const no = face("b").querySelector('[data-side="no"]');
  await move(no);
  await click(no);
  pick(face("b"), MARKETS.b);
  await pause(1000);
  cursor.classList.remove("is-on");
  // Back to the first market, resolved by the chain: a win. Then the second: a loss.
  flip.classList.remove("is-turned");
  await pause(850);
  resolve(face("a"), MARKETS.a);
  await pause(2800);
  flip.classList.add("is-turned");
  await pause(850);
  resolve(face("b"), MARKETS.b);
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

/** Stops the demo and puts the card back on its first face. */
export function stopDemo() {
  if (!run) return;
  run.dead = true;
  for (const node of run.el.querySelectorAll("*")) for (const animation of node.getAnimations()) animation.cancel();
  reset(run.el);
  run = null;
}
