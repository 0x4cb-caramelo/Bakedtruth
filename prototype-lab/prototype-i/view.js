// Direction I · Blocks (Tape read as a block explorer, on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js.
(() => {
  const { icon, money, data, market, mount } = window.BakedApp;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Ticker: the activity list twice over, so the loop has no seam.
  const items = data.activity
    .map((a) => {
      const m = market(a.market);
      return `<span><b>${a.who}</b> ${a.verb} <b class="${a.side === "YES" ? "y" : "n"}">${a.side}</b> ${money(a.amount)} · ${m.name} · ${a.ago} ago</span>`;
    })
    .join("");
  document.getElementById("ticker").innerHTML = items + items;

  document.getElementById("steps").innerHTML = data.steps
    .map((s) => `<div class="panel"><h3>${s.title}</h3><p>${s.body}</p></div>`)
    .join("");
  document.getElementById("principles").innerHTML = data.principles
    .map(
      (p, i) =>
        `<div class="panel" data-perch="principle-${i}" data-perch-x="0.88" data-perch-size="0.75"><h3>${p.title}</h3><p>${p.body}</p></div>`,
    )
    .join("");

  const blocks = (m, n, big = "") => {
    const pct = m.progress ?? m.yes;
    const on = Math.round((pct / 100) * n);
    const label = m.progress ? `${m.progress}% of the way to the target` : `YES at ${m.yes} cents`;
    return `<div class="blocks ${big}" role="img" aria-label="${label}">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? "on" : i === on ? "next" : ""}"></i>`).join("")}</div>`;
  };
  const token = (m, size = "") => `<div class="token ${size}" style="--tb:${m.bg};--tt:${m.tone}">${m.icon}</div>`;
  const odds = (m, side) => `
    <div class="odds">
      <button class="yes ${side === "YES" ? "is-on" : ""}" data-open="${m.id}" data-side="YES" data-mood="approve"><span>YES</span><span>${m.yes}¢</span></button>
      <button class="no ${side === "NO" ? "is-on" : ""}" data-open="${m.id}" data-side="NO" data-mood="skeptical"><span>NO</span><span>${100 - m.yes}¢</span></button>
    </div>`;

  // A block on the chain: the account it reads comes first, like a hash in an explorer.
  function card(m, state) {
    const saved = state.saved.has(m.id);
    return `
    <article class="blk" data-perch="market-${m.id}" data-perch-x="0" data-perch-dx="-44" data-perch-edge="bottom" data-perch-dy="-8" data-perch-size="0.8" data-perch-pose="${m.resolved ? "approve" : "point"}">
      <div class="addr"><small>reads</small>${m.address}</div>
      <div class="blk-main">
        <button class="blk-title" data-open="${m.id}">${m.title}</button>
        <div class="blk-sub"><span class="cat">${m.cat}</span><span>${m.resolved ? "resolved today" : `${m.days}d left`}</span><span>${money(m.volume)} vol.</span><span>${m.proof}</span></div>
      </div>
      ${blocks(m, 12)}
      <strong class="pct">${m.yes}%</strong>
      ${m.resolved ? '<div class="resolved">RESOLVED YES</div>' : odds(m)}
      <button class="save" data-save="${m.id}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${m.name} market">${icon("bookmark", 16)}</button>
    </article>`;
  }

  // Price history as a stepped line, like a tape print.
  function stepped(history, w, h) {
    const max = Math.max(...history);
    const min = Math.min(...history);
    const span = max - min || 1;
    const dx = w / history.length;
    const y = (v) => (h - 10 - ((v - min) / span) * (h - 20)).toFixed(1);
    let d = `M0 ${y(history[0])}`;
    history.forEach((v, i) => (d += ` V${y(v)} H${((i + 1) * dx).toFixed(1)}`));
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="YES price history"><path d="${d} V${h} H0 Z" fill="rgba(167,139,250,.14)"/><path d="${d}" fill="none" stroke="#a78bfa" stroke-width="2"/></svg>`;
  }

  function detail(m, state) {
    return `
    <button class="back" data-action="home">${icon("arrow-left", 14)} back to the chain</button>
    <div class="detail">
      <div>
        <span class="eyebrow">${m.cat} · ${m.name}</span>
        <h2>${m.title}</h2>
        <p class="note">Example market · Preview values, not live account data</p>
        <section class="proof panel" data-perch="proof" data-perch-x="0.86" data-perch-size="1.3" data-perch-pose="point" data-perch-say="Read the account.">
          <h3>${icon("eye", 20)} On-chain proof</h3>
          <div class="readout">
            <div><small>${m.field} now</small><b>${m.current}</b></div>
            <div><small>Target</small><b>${m.target}</b></div>
          </div>
          ${m.progress ? blocks(m, 24, "big") : ""}
          <div class="rows">
            <div><span>account_read</span><b class="hash">${m.address} ↗</b></div>
            <div><span>deadline</span><b>${m.deadline}</b></div>
            <div><span>resolution</span><b>${m.resolved ? "Resolved YES" : "Anyone, the moment the account says so"}</b></div>
          </div>
        </section>
        <section class="chart panel">
          <h3>YES price · ${m.yes}¢</h3>
          ${stepped(m.history, 600, 150)}
        </section>
      </div>
      <aside class="order panel" data-perch="order" data-perch-x="0.22" data-perch-pose="${state.side === "YES" ? "deadpan" : "skeptical"}">
        <h3>${m.resolved ? "Redemption" : `Buy ${state.side}`}</h3>
        ${odds(m, state.side)}
        <label for="amount">amount · USDC</label>
        <input id="amount" data-role="amount" type="number" min="0" value="10" inputmode="decimal">
        <p data-role="estimate"></p>
        <button class="btn wide" data-action="wallet" data-mood="tapping">Connect wallet</button>
        <p class="small">Design preview · No transactions</p>
      </aside>
    </div>`;
  }

  // Tracing beam: the lit stretch of rail follows the block under the pointer.
  const chain = document.getElementById("chain");
  const beam = document.getElementById("beam");
  chain.addEventListener("pointerover", (e) => {
    const row = e.target.closest(".blk");
    if (!row) return;
    beam.style.setProperty("--by", `${row.offsetTop}px`);
    beam.style.setProperty("--bh", `${row.offsetHeight}px`);
  });

  // Mosaic: trading carousel, upcoming and closing soon.
  const slide = (m, i, n) => `
    <article class="slide">
      <div class="slide-main">
        <div class="slide-top">${token(m)}<span>${m.cat} · block ${i + 1}/${n}</span></div>
        <button class="slide-title" data-open="${m.id}" aria-label="${m.title}">${m.title}</button>
        <div class="slide-num"><b>${m.yes}%</b><span>YES · ${money(m.volume)} vol. · ${m.days}d left</span></div>
        ${blocks(m, 24, "big")}
        <p class="reads">reads <b>${m.address}</b> · ${m.proof}</p>
        ${odds(m)}
      </div>
      <div class="slide-chart">${stepped(m.history, 600, 260)}</div>
    </article>`;
  const upcoming = (u) => `
    <div class="side-row">
      ${token(u, "sm")}
      <div class="side-text"><b>${u.title}</b><span>${u.cat} · opens ${u.opens} · ${money(u.budget)}</span></div>
      <button class="btn alt small" data-action="notify">Notify</button>
    </div>`;
  const closing = (m) => `
    <button class="side-row" data-open="${m.id}">
      ${token(m, "sm")}
      <div class="side-text"><b>${m.title}</b><span>${m.cat} · ${money(m.volume)} vol.</span></div>
      <span class="side-right"><strong>${m.yes}%</strong><em>${m.days}d left</em></span>
    </button>`;

  // Decode: a new slide's title resolves out of hex noise, left to right.
  const HEX = "0123456789abcdef";
  let decoding = 0;
  function decode(m, track) {
    cancelAnimationFrame(decoding);
    const el = track.querySelector(".slide-title");
    if (reduce || !el) return;
    const t0 = performance.now();
    const step = (now) => {
      const done = Math.floor(((now - t0) / 520) * m.title.length);
      el.textContent = [...m.title]
        .map((ch, i) => (i < done || ch === " " ? ch : HEX[Math.floor(Math.random() * 16)]))
        .join("");
      if (done < m.title.length) decoding = requestAnimationFrame(step);
    };
    decoding = requestAnimationFrame(step);
  }
  window.BakedMosaic.mount({ slide, upcoming, closing, onShow: decode });

  // Backdrop: a grid of cells in WGSL. A slow wave crosses it, single cells flicker, and the cells
  // around the pointer light up. Brightness is quantised so it steps instead of fading.
  const WGSL = `
fn hash(p: vec2f) -> f32 { return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453); }
fn paint(uv: vec2f) -> vec4f {
  let cell = 28.0;
  let px = uv * u.res;
  let id = floor(px / cell);
  let f = fract(px / cell);
  let t = u.time;
  let wave = sin(id.x * 0.21 + t * 0.6) * sin(id.y * 0.27 - t * 0.4);
  let flick = step(0.985, hash(id + vec2f(floor(t * 2.0))));
  let near = exp(-distance(px, u.mouse * u.res) / 140.0);
  var a = max(0.0, wave) * 0.1 + flick * 0.35 + near * 0.55;
  a = floor(a * 5.0) / 5.0;
  let inside = step(0.05, f.x) * step(0.05, f.y);
  let alpha = clamp(a * inside * 0.5 + (1.0 - inside) * 0.05, 0.0, 1.0);
  let col = mix(vec3f(0.65, 0.55, 0.98), vec3f(0.37, 0.95, 0.66), near);
  return vec4f(col * alpha, alpha);
}`;
  // Canvas 2D stand-in: the same grid, lit only around the pointer.
  function cells2d(canvas, mouse, fit) {
    const ctx = canvas.getContext("2d");
    const CELL = 28;
    (function draw() {
      if (!reduce) requestAnimationFrame(draw);
      fit();
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(167,139,250,.05)";
      for (let x = 0; x < w; x += CELL) ctx.fillRect(x, 0, 1, h);
      for (let y = 0; y < h; y += CELL) ctx.fillRect(0, y, w, 1);
      if (mouse.x < 0) return;
      const cx = Math.floor((mouse.x * w) / CELL);
      const cy = Math.floor((mouse.y * h) / CELL);
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const d = Math.hypot(dx, dy);
          if (d > 3.3) continue;
          ctx.fillStyle = `rgba(167,139,250,${(Math.ceil((1 - d / 3.4) * 5) / 5) * 0.24})`;
          ctx.fillRect((cx + dx) * CELL + 1, (cy + dy) * CELL + 1, CELL - 1, CELL - 1);
        }
      }
    })();
  }
  window.BakedShader.mount(document.getElementById("gpu"), WGSL, cells2d).then((mode) => {
    document.getElementById("renderer").textContent =
      mode === "webgpu" ? "Backdrop: WebGPU shader" : "Backdrop: Canvas 2D (no WebGPU here)";
  });

  window.BakedPet.init({ size: 80, stepped: true, pixelated: true });
  mount({ id: "I", card, detail });
})();
