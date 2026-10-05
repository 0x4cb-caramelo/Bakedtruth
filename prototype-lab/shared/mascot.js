// Baked, the mascot, as a page resident.
//
// It does not follow the cursor freely. The page declares perches (fixed spots it is allowed to
// stand on) and the mascot hops to the perch closest to where the pointer is heading, after a
// short dwell so a sweep across the page does not drag it everywhere. It stays glued to its perch
// while the page scrolls, and looks for a new one when that perch leaves the screen.
//
// Perch markup, on any element:
//   data-perch="unique-id"        required; the mascot stands on this element's top edge
//   data-perch-x="0.85"           where along the edge, 0..1 (default 0.5)
//   data-perch-edge="bottom"      stand level with the element's bottom edge instead of on top
//   data-perch-dx="-44"           pixels to shift sideways, e.g. to stand beside the element
//   data-perch-dy="6"             pixels to sink (+) or lift (-) the feet
//   data-perch-size="0.8"         scale for this spot
//   data-perch-pose="skeptical"   resting pose here (default deadpan)
//   data-perch-say="Prove it."    what it says when it lands
//
// Mood markup, on any element: data-mood="approve" changes the pose while the pointer is over it.
window.BakedPet = (() => {
  const POSES = ["deadpan", "skeptical", "impatient", "tapping", "tired", "sulking", "approve", "point"];
  const RATIO = 440 / 280; // sprite canvas, feet on the bottom edge
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  let cfg, root, flip, squash, bubble;
  const imgs = {};
  let perch = null;
  let perchId = null;
  let hop = null;
  let at = null; // last drawn feet position {x, y, s}
  let pose = "";
  let facing = 1;
  const pointer = { x: 0, y: 0, seen: false };
  let lastMove = -1e9;
  let lastScroll = -1e9;
  let lastActivity = 0;
  let lastDecision = 0;
  let candidate = null;
  let candidateSince = 0;
  let landedAt = 0;
  let squashUntil = 0;
  let impatientUntil = 0;
  let fast = 0;
  let mood = null;
  let moodEl = null;
  let moodUntil = 0;
  let sayTimer = 0;
  let quip = 0;
  const saidAt = new Map();

  const CSS = `
.bk-pet{position:fixed;left:0;top:0;z-index:80;pointer-events:none;will-change:transform;opacity:0;transition:opacity .25s}
.bk-pet.is-on{opacity:1}
.bk-pet-flip,.bk-pet-squash,.bk-pet-body{position:absolute;inset:0}
.bk-pet-flip{transition:transform .16s}
.bk-pet-squash{transform-origin:50% 100%}
.bk-pet-body{transform-origin:50% 100%;animation:bk-pet-breathe 3.4s ease-in-out infinite}
.bk-pet-body img{position:absolute;inset:0;width:100%;height:100%;opacity:0;user-select:none}
.bk-pet-body img.is-on{opacity:1}
.bk-pet-shadow{position:absolute;left:30%;right:30%;bottom:-2%;height:8%;border-radius:50%;background:var(--pet-shadow,rgba(0,0,0,.5));filter:blur(3px)}
.bk-pet-say{position:absolute;left:50%;bottom:102%;transform:translate(-50%,6px);white-space:nowrap;padding:7px 10px;font:var(--pet-say-font,600 12px/1.2 system-ui,sans-serif);color:var(--pet-say-fg,#1b1206);background:var(--pet-say-bg,#f6e2c2);border:var(--pet-say-border,0);border-radius:var(--pet-say-radius,8px);box-shadow:var(--pet-say-shadow,0 6px 18px rgba(0,0,0,.35));opacity:0;transition:opacity .18s,transform .18s}
.bk-pet-say.is-on{opacity:1;transform:translate(-50%,0)}
.bk-pet-say.is-below{bottom:auto;top:104%}
@keyframes bk-pet-breathe{50%{transform:scaleY(1.03) scaleX(.988)}}
@media (prefers-reduced-motion:reduce){.bk-pet-body{animation:none}.bk-pet-flip{transition:none}}
`;

  function build() {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    root = document.createElement("div");
    root.className = "bk-pet";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div class="bk-pet-shadow"></div><div class="bk-pet-flip"><div class="bk-pet-squash"><div class="bk-pet-body"></div></div></div><div class="bk-pet-say"></div>';
    flip = root.querySelector(".bk-pet-flip");
    squash = root.querySelector(".bk-pet-squash");
    bubble = root.querySelector(".bk-pet-say");
    const body = root.querySelector(".bk-pet-body");
    for (const name of POSES) {
      const img = new Image();
      img.src = `${cfg.base}${name}.png`;
      img.alt = "";
      img.draggable = false;
      if (cfg.pixelated) img.style.imageRendering = "pixelated";
      body.appendChild(img);
      imgs[name] = img;
    }
    document.body.appendChild(root);
  }

  function anchor(el) {
    const r = el.getBoundingClientRect();
    const d = el.dataset;
    // On phones it stays small so it never covers the copy it stands next to.
    const s = innerWidth < 700 ? Math.min(parseFloat(d.perchSize ?? 1), 1) * 0.6 : parseFloat(d.perchSize ?? 1);
    return {
      x: r.left + r.width * parseFloat(d.perchX ?? 0.5) + parseFloat(d.perchDx ?? 0),
      y: (d.perchEdge === "bottom" ? r.bottom : r.top) + parseFloat(d.perchDy ?? 0),
      s,
      r,
    };
  }

  function visible(el) {
    if (!el.isConnected || el.closest("[hidden]")) return false;
    const a = anchor(el);
    if (!a.r.width && !a.r.height) return false;
    const h = cfg.size * a.s;
    return a.y - h > 0 && a.y < innerHeight - 2 && a.x > h * 0.5 && a.x < innerWidth - h * 0.5;
  }

  /** How strongly a perch attracts the pointer: zero inside its element, growing with distance. */
  function score(el) {
    const a = anchor(el);
    const dx = Math.max(a.r.left - pointer.x, 0, pointer.x - a.r.right);
    const dy = Math.max(a.r.top - pointer.y, 0, pointer.y - a.r.bottom);
    return Math.hypot(dx, dy) + 0.08 * Math.hypot(a.x - pointer.x, a.y - pointer.y);
  }

  function choose() {
    let best = null;
    let bestScore = Infinity;
    for (const el of document.querySelectorAll("[data-perch]")) {
      if (!visible(el)) continue;
      const s = score(el);
      if (s < bestScore) {
        best = el;
        bestScore = s;
      }
    }
    return best;
  }

  function setPose(name) {
    if (name === pose || !imgs[name]) return;
    if (imgs[pose]) imgs[pose].classList.remove("is-on");
    imgs[name].classList.add("is-on");
    pose = name;
  }

  function say(text, ms = 2400) {
    if (!text) return;
    bubble.textContent = text;
    bubble.classList.toggle("is-below", !!at && at.y - cfg.size * at.s < 56);
    bubble.classList.add("is-on");
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => bubble.classList.remove("is-on"), ms);
  }

  function startHop(to, now) {
    const target = anchor(to);
    perch = to;
    perchId = to.dataset.perch;
    candidate = null;
    bubble.classList.remove("is-on");
    if (!at || reduce) {
      at = { x: target.x, y: target.y, s: target.s };
      land(now);
      return;
    }
    const dist = Math.hypot(target.x - at.x, target.y - at.y);
    hop = {
      from: { ...at },
      t0: now,
      ms: clamp(260 + dist * 0.55, 300, 820),
      arc: clamp(30 + dist * 0.22, 36, 150),
    };
    if (Math.abs(target.x - at.x) > 8) facing = target.x < at.x ? -1 : 1;
  }

  function land(now) {
    hop = null;
    landedAt = now;
    squashUntil = now + 170;
    const text = perch.dataset.perchSay;
    if (text && now - (saidAt.get(text) ?? -1e9) > 15000) {
      saidAt.set(text, now);
      say(text);
    }
  }

  function restingPose(now) {
    if (mood && now < moodUntil) return mood;
    if (now < impatientUntil) return "tapping";
    const idle = now - lastActivity;
    if (idle > 22000) return "sulking";
    if (idle > 9000) return "tired";
    return (perch && perch.dataset.perchPose) || "deadpan";
  }

  function frame(now) {
    requestAnimationFrame(frame);

    // Keep or replace the current perch.
    if (perch && !perch.isConnected && perchId) {
      const same = document.querySelector(`[data-perch="${perchId}"]`);
      if (same) perch = same;
    }
    if (!perch || !visible(perch)) {
      const next = choose();
      if (!next) {
        root.classList.remove("is-on");
        perch = null;
        hop = null;
        return;
      }
      if (next !== perch) startHop(next, now);
    }

    // Decide whether the pointer has earned a hop.
    if (!hop && now - lastDecision > 100 && (now - lastMove < 1200 || now - lastScroll < 400)) {
      lastDecision = now;
      const best = choose();
      if (best && best !== perch) {
        if (best !== candidate) {
          candidate = best;
          candidateSince = now;
        } else if (
          now - candidateSince > cfg.dwell &&
          now - landedAt > cfg.minStay &&
          score(best) + 36 < score(perch)
        ) {
          startHop(best, now);
        }
      } else {
        candidate = null;
      }
    }

    // Where the feet are this frame.
    const target = anchor(perch);
    let sx = 1;
    let sy = 1;
    if (hop) {
      let t = (now - hop.t0) / hop.ms;
      if (t >= 1) {
        at = { x: target.x, y: target.y, s: target.s };
        land(now);
      } else {
        if (cfg.stepped) t = Math.round(t * 7) / 7;
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        at = {
          x: hop.from.x + (target.x - hop.from.x) * e,
          y: hop.from.y + (target.y - hop.from.y) * e - hop.arc * 4 * e * (1 - e),
          s: hop.from.s + (target.s - hop.from.s) * e,
        };
        sy = 1 + 0.14 * Math.sin(Math.PI * t);
        sx = 1 - 0.08 * Math.sin(Math.PI * t);
      }
    } else {
      at = { x: target.x, y: target.y, s: target.s };
      if (now - lastMove < 1500 && Math.abs(pointer.x - at.x) > 70) facing = pointer.x < at.x ? -1 : 1;
    }
    if (now < squashUntil) {
      const k = (squashUntil - now) / 170;
      sy = 1 - 0.2 * k;
      sx = 1 + 0.16 * k;
    }

    const h = cfg.size * at.s;
    const w = h * RATIO;
    let x = at.x - w / 2;
    let y = at.y - h + h * 0.035;
    if (cfg.stepped) {
      x = Math.round(x / 4) * 4;
      y = Math.round(y / 4) * 4;
    }
    root.style.width = `${w}px`;
    root.style.height = `${h}px`;
    root.style.transform = `translate3d(${x}px,${y}px,0)`;
    flip.style.transform = `scaleX(${facing})`;
    squash.style.transform = `scale(${sx},${sy})`;
    setPose(hop ? "deadpan" : restingPose(now));
    root.classList.add("is-on");
  }

  function listen() {
    addEventListener(
      "pointermove",
      (e) => {
        const now = performance.now();
        if (e.pointerType === "touch") return;
        const dt = Math.max(1, now - lastMove);
        const speed = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) / dt;
        // Sustained frantic movement makes it tap its foot.
        fast = speed > 2.6 ? fast + 1 : Math.max(0, fast - 1);
        if (fast > 16) {
          impatientUntil = now + 1600;
          fast = 0;
        }
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.seen = true;
        lastMove = lastActivity = now;
      },
      { passive: true },
    );
    addEventListener(
      "scroll",
      () => {
        lastScroll = lastActivity = performance.now();
        if (!pointer.seen) {
          pointer.x = innerWidth * 0.72;
          pointer.y = innerHeight * 0.4;
        }
      },
      { passive: true, capture: true },
    );
    document.addEventListener("pointerover", (e) => {
      const el = e.target.closest && e.target.closest("[data-mood]");
      if (el) {
        moodEl = el;
        mood = el.dataset.mood;
        moodUntil = Infinity;
      }
    });
    document.addEventListener("pointerout", (e) => {
      if (moodEl && !moodEl.contains(e.relatedTarget)) {
        moodEl = null;
        moodUntil = performance.now() + 450;
      }
    });
    // Keyboard users drive it with focus.
    document.addEventListener("focusin", (e) => {
      if (!e.target.getBoundingClientRect || e.target.matches(":hover")) return;
      const r = e.target.getBoundingClientRect();
      pointer.x = r.left + r.width / 2;
      pointer.y = r.top + r.height / 2;
      lastMove = lastActivity = performance.now();
    });
    addEventListener("keydown", () => (lastActivity = performance.now()));
    // Poke: a click on the mascot itself, unless there is a control underneath.
    document.addEventListener("click", (e) => {
      const r = root.getBoundingClientRect();
      const inside =
        e.clientX > r.left + r.width * 0.2 &&
        e.clientX < r.right - r.width * 0.2 &&
        e.clientY > r.top &&
        e.clientY < r.bottom;
      if (!inside || e.target.closest("button,a,input,select,label,[data-open]")) return;
      const now = performance.now();
      say(cfg.quips[quip++ % cfg.quips.length], 2600);
      squashUntil = now + 170;
      impatientUntil = now + 1400;
      lastActivity = now;
    });
  }

  function init(options = {}) {
    cfg = Object.assign(
      {
        size: 72,
        base: "../shared/mascot/",
        stepped: false,
        pixelated: false,
        dwell: 170,
        minStay: 520,
        quips: (window.BAKED && window.BAKED.quips) || [],
      },
      options,
    );
    pointer.x = innerWidth * 0.72;
    pointer.y = innerHeight * 0.4;
    lastActivity = performance.now();
    build();
    listen();
    requestAnimationFrame(frame);
  }

  /** Call after the page re-renders: the mascot re-evaluates where it stands. */
  function refresh() {
    lastScroll = performance.now();
  }

  return { init, refresh, say, poses: POSES };
})();
