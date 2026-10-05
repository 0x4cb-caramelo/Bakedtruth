// Direction H · Prism (Ledger's desk in glass, on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js.
(() => {
  const { icon, money, data, mount, sparkline } = window.BakedApp;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.outerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 16);
  });

  const tile = (t, name, attrs = "") =>
    `<div class="tile" ${attrs}><span class="ic-box">${icon(name, 18)}</span><div><h3>${t.title}</h3><p>${t.body}</p></div></div>`;
  document.getElementById("steps").innerHTML = data.steps
    .map((s, i) => tile(s, ["vault", "trending", "check"][i]))
    .join("");
  document.getElementById("principles").innerHTML = data.principles
    .map((p, i) =>
      tile(p, ["eye", "vault", "shield"][i], `data-perch="principle-${i}" data-perch-x="0.9" data-perch-size="0.7"`),
    )
    .join("");

  const token = (m, size = "") => `<span class="token ${size}" style="--tb:${m.bg};--tt:${m.tone}">${m.icon}</span>`;
  const odds = (m, side) => `
    <div class="odds">
      <button class="yes ${side === "YES" ? "is-on" : ""}" data-open="${m.id}" data-side="YES" data-mood="approve"><span>Yes</span><span>${m.yes}¢</span></button>
      <button class="no ${side === "NO" ? "is-on" : ""}" data-open="${m.id}" data-side="NO" data-mood="skeptical"><span>No</span><span>${100 - m.yes}¢</span></button>
    </div>`;

  // Price history as a line over a fading fill. `id` keeps each gradient unique on the page.
  function chart(history, w, h, id) {
    const s = sparkline(history, w, h, 3);
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="YES price history">
      <defs>
        <linearGradient id="fill-${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3fe0c5" stop-opacity=".32"/><stop offset="1" stop-color="#3fe0c5" stop-opacity="0"/></linearGradient>
        <linearGradient id="line-${id}"><stop stop-color="#4f8dff"/><stop offset="1" stop-color="#3fe0c5"/></linearGradient>
      </defs>
      <path d="${s.area}" fill="url(#fill-${id})"/><path d="${s.line}" fill="none" stroke="url(#line-${id})" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`;
  }

  function ring(pct) {
    const c = 2 * Math.PI * 52;
    return `<svg class="ring" viewBox="0 0 120 120" role="img" aria-label="YES at ${pct} percent">
      <defs><linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4f8dff"/><stop offset="1" stop-color="#3fe0c5"/></linearGradient></defs>
      <circle class="ring-bg" cx="60" cy="60" r="52"/>
      <circle class="ring-fg" cx="60" cy="60" r="52" stroke="url(#ring-g)" stroke-dasharray="${((pct / 100) * c).toFixed(1)} ${c.toFixed(1)}"/>
      <text x="60" y="69" text-anchor="middle">${pct}%</text>
    </svg>`;
  }

  const verified = (m) => `<span class="verified">${icon("eye", 14)} Reads <b>${m.address}</b> · ${m.proof}</span>`;

  function card(m, state) {
    const saved = state.saved.has(m.id);
    return `
    <article class="card" data-perch="market-${m.id}" data-perch-x="0.86" data-perch-size="0.74" ${m.resolved ? 'data-perch-pose="approve" data-perch-say="Fine. It checks out."' : ""}>
      <div class="card-top">${token(m, "sm")}<span class="cat">${m.cat}</span><span>${m.resolved ? "Resolved today" : `${m.days}d left`}</span>
        <button class="save" data-save="${m.id}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${m.name} market">${icon("bookmark", 16)}</button>
      </div>
      <button class="card-title" data-open="${m.id}">${m.title}</button>
      <div class="card-mid"><div class="prob"><b>${m.yes}%</b><small>chance of YES</small></div><div class="spark">${chart(m.history, 120, 40, `c${m.id}`)}</div></div>
      <div class="track" role="img" aria-label="YES ${m.yes} percent, NO ${100 - m.yes} percent"><span style="width:${m.yes}%"></span></div>
      ${m.resolved ? '<div class="resolved">Resolved YES · read on-chain</div>' : odds(m)}
      <div class="card-foot"><span>${money(m.volume)} vol.</span><span>${m.address} ↗</span></div>
    </article>`;
  }

  function detail(m, state) {
    return `
    <button class="link back" data-action="home">${icon("arrow-left", 14)} All markets</button>
    <div class="detail">
      <div>
        <span class="eyebrow">${m.cat} · ${m.name}</span>
        <h2>${m.title}</h2>
        <p class="note">Example market · Preview values, not live account data</p>
        <section class="proof glass" data-perch="proof" data-perch-x="0.88" data-perch-size="1.1" data-perch-pose="point" data-perch-say="It's a read. Not a vote.">
          <h3>${icon("eye", 18)} On-chain proof</h3>
          <div class="readout">
            <div><small>${m.field} now</small><b>${m.current}</b></div>
            <div><small>Target</small><b>${m.target}</b></div>
          </div>
          ${m.progress ? `<div class="bar" role="img" aria-label="${m.progress}% of the way to the target"><span style="width:${m.progress}%"></span></div>` : ""}
          <div class="rows">
            <div><span>Account read</span><b class="addr">${m.address} ↗</b></div>
            <div><span>Deadline</span><b>${m.deadline}</b></div>
            <div><span>Resolution</span><b>${m.resolved ? "Resolved YES" : "Anyone, the moment the account says so"}</b></div>
          </div>
        </section>
        <section class="chart glass">
          <h3>YES price · ${m.yes}¢</h3>
          ${chart(m.history, 600, 170, "detail")}
        </section>
      </div>
      <aside class="order glass" data-perch="order" data-perch-x="0.22" data-perch-size="0.9" data-perch-pose="${state.side === "YES" ? "deadpan" : "skeptical"}">
        <h3>${m.resolved ? "Redemption" : `Buy ${state.side}`}</h3>
        ${odds(m, state.side)}
        <label for="amount">Amount · USDC</label>
        <input id="amount" data-role="amount" type="number" min="0" value="10" inputmode="decimal">
        <p data-role="estimate"></p>
        <button class="cta wide" data-action="wallet" data-mood="tapping"><span>Connect wallet</span></button>
        <p class="small">Design preview · No transactions</p>
      </aside>
    </div>`;
  }

  // Mosaic: trading carousel, upcoming and closing soon.
  const slide = (m, i, n) => `
    <article class="slide">
      <div class="slide-main">
        <div class="slide-top">${token(m)}<span>${m.cat} · ${m.name} · ${i + 1}/${n}</span></div>
        <button class="slide-title" data-open="${m.id}">${m.title}</button>
        <div class="gauge">${ring(m.yes)}
          <div class="gauge-meta"><span>Volume <b>${money(m.volume)}</b></span><span>Closes in <b>${m.days}d</b></span><span>Deadline <b>${m.deadline}</b></span></div>
        </div>
        ${verified(m)}
        ${odds(m)}
      </div>
      <div class="slide-chart">
        <header><span>YES price</span><b>${m.yes}¢</b></header>
        ${chart(m.history, 600, 240, "slide")}
      </div>
    </article>`;
  const upcoming = (u) => `
    <div class="side-row">
      ${token(u, "sm")}
      <div class="side-text"><b>${u.title}</b><span>${u.cat} · opens ${u.opens} · ${money(u.budget)} budget</span></div>
      <button class="mini" data-action="notify">Notify</button>
    </div>`;
  const closing = (m) => `
    <button class="side-row" data-open="${m.id}">
      ${token(m, "sm")}
      <div class="side-text"><b>${m.title}</b><span>${m.cat} · ${money(m.volume)} vol.</span></div>
      <span class="side-right"><strong>${m.yes}%</strong><em>${m.days}d left</em></span>
    </button>`;
  window.BakedMosaic.mount({ slide, upcoming, closing });

  // Card spotlight: the glow sits where the pointer is on each card.
  document.addEventListener(
    "pointermove",
    (e) => {
      const el = e.target.closest?.(".card");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true },
  );

  // Constellation: drifting nodes joined when close, and to the pointer when it is near.
  const canvas = document.getElementById("net");
  const ctx = canvas.getContext("2d");
  const pointer = { x: -999, y: -999 };
  let nodes = [];
  function seed() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const n = Math.min(70, Math.round((innerWidth * innerHeight) / 26000));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }
  function link(a, b, reach, alpha) {
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > reach) return;
    ctx.strokeStyle = `rgba(110,190,255,${(1 - d / reach) * alpha})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  function draw() {
    if (!reduce) requestAnimationFrame(draw);
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    nodes.forEach((p, i) => {
      p.x = (p.x + p.vx + w) % w;
      p.y = (p.y + p.vy + h) % h;
      for (let k = i + 1; k < nodes.length; k++) link(p, nodes[k], 130, 0.16);
      link(p, pointer, 190, 0.5);
      ctx.fillStyle = "rgba(150,210,255,.45)";
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    });
  }
  addEventListener("pointermove", (e) => Object.assign(pointer, { x: e.clientX, y: e.clientY }), { passive: true });
  addEventListener("resize", seed);
  seed();
  draw();

  window.BakedPet.init({ size: 84 });
  mount({ id: "H", card, detail });
})();
