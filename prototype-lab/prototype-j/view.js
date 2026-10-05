// Direction J · Orbit (Ledger's cards and Tape's blocks around a 3D outcome coin, on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js.
(() => {
  const { icon, money, data, mount, sparkline } = window.BakedApp;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.outerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 16);
  });

  document.getElementById("steps").innerHTML = data.steps
    .map((s) => `<div class="tile panel"><h3>${s.title}</h3><p>${s.body}</p></div>`)
    .join("");
  document.getElementById("principles").innerHTML = data.principles
    .map(
      (p, i) =>
        `<div class="tile panel" data-perch="principle-${i}" data-perch-x="0.88" data-perch-size="0.72"><h3>${p.title}</h3><p>${p.body}</p></div>`,
    )
    .join("");

  const token = (m, size = "") => `<span class="token ${size}" style="--tb:${m.bg};--tt:${m.tone}">${m.icon}</span>`;
  const blocks = (m, n, big = "") => {
    const pct = m.progress ?? m.yes;
    const on = Math.round((pct / 100) * n);
    const label = m.progress ? `${m.progress}% of the way to the target` : `YES at ${m.yes} cents`;
    return `<div class="blocks ${big}" role="img" aria-label="${label}">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? "on" : i === on ? "next" : ""}"></i>`).join("")}</div>`;
  };
  const odds = (m, side) => `
    <div class="odds pop">
      <button class="yes ${side === "YES" ? "is-on" : ""}" data-open="${m.id}" data-side="YES" data-mood="approve"><span>Yes</span><span>${m.yes}¢</span></button>
      <button class="no ${side === "NO" ? "is-on" : ""}" data-open="${m.id}" data-side="NO" data-mood="skeptical"><span>No</span><span>${100 - m.yes}¢</span></button>
    </div>`;

  // The outcome coin: YES on one face, NO on the other, a stack of discs for the edge, two orbits.
  // A hosted Spline scene could replace .stage here; this one is CSS 3D so the lab stays offline-safe.
  const RIM = Array.from({ length: 9 }, (_, i) => `<span class="rim" style="--z:${i * 2 - 8}"></span>`).join("");
  const coin = (m) => `
    <div class="scene" role="img" aria-label="Outcome coin: YES ${m.yes} cents, NO ${100 - m.yes} cents">
      <div class="scene-floor"></div>
      <div class="stage">
        <div class="orbit"><i></i></div>
        <div class="orbit two"><i></i></div>
        <div class="coin">${RIM}
          <div class="face yes"><small>YES</small><b>${m.yes}¢</b></div>
          <div class="face no"><small>NO</small><b>${100 - m.yes}¢</b></div>
        </div>
      </div>
    </div>`;

  function card(m, state) {
    const saved = state.saved.has(m.id);
    return `
    <article class="mk" data-perch="market-${m.id}" data-perch-x="0.9" data-perch-size="0.74" ${m.resolved ? 'data-perch-pose="approve" data-perch-say="Fine. It checks out."' : ""}>
      <div class="mk-head">${token(m, "sm")}<span class="cat">${m.cat}</span><span>${m.resolved ? "Resolved today" : `${m.days}d left`}</span>
        <button class="save" data-save="${m.id}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${m.name} market">${icon("bookmark", 16)}</button>
      </div>
      <button class="mk-title pop" data-open="${m.id}">${m.title}</button>
      <div class="mk-body">
        <div class="mk-prob pop"><b>${m.yes}%</b><small>chance of YES</small></div>
        <div class="mk-meter">${blocks(m, 16)}<span>${m.proof}</span></div>
      </div>
      ${m.resolved ? '<div class="resolved pop">Resolved YES</div>' : odds(m)}
      <div class="mk-foot"><span>${money(m.volume)} vol.</span><span>${m.address} ↗</span></div>
    </article>`;
  }

  function detail(m, state) {
    const s = sparkline(m.history, 600, 160);
    return `
    <button class="link back" data-action="home">${icon("arrow-left", 14)} All markets</button>
    <div class="detail">
      <div>
        <span class="eyebrow">${m.cat} · ${m.name}</span>
        <h2>${m.title}</h2>
        <p class="note">Example market · Preview values, not live account data</p>
        <section class="proof panel" data-perch="proof" data-perch-x="0.88" data-perch-size="1.15" data-perch-pose="point" data-perch-say="It's a read. Not a vote.">
          <h3>${icon("eye", 20)} On-chain proof</h3>
          <div class="readout">
            <div><small>${m.field} now</small><b>${m.current}</b></div>
            <div><small>Target</small><b>${m.target}</b></div>
          </div>
          ${m.progress ? blocks(m, 24, "big") : ""}
          <div class="rows">
            <div><span>Account read</span><b class="addr">${m.address} ↗</b></div>
            <div><span>Deadline</span><b>${m.deadline}</b></div>
            <div><span>Resolution</span><b>${m.resolved ? "Resolved YES" : "Anyone, the moment the account says so"}</b></div>
          </div>
        </section>
        <section class="chart panel">
          <h3>YES price · ${m.yes}¢</h3>
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" aria-label="YES price history">
            <path d="${s.area}" fill="rgba(106,168,255,.14)"/><path d="${s.line}" fill="none" stroke="#6aa8ff" stroke-width="2.5"/>
          </svg>
        </section>
      </div>
      <aside class="order panel" data-perch="order" data-perch-x="0.22" data-perch-size="0.9" data-perch-pose="${state.side === "YES" ? "deadpan" : "skeptical"}">
        <h3>${m.resolved ? "Redemption" : `Buy ${state.side}`}</h3>
        ${odds(m, state.side)}
        <label for="amount">Amount · USDC</label>
        <input id="amount" data-role="amount" type="number" min="0" value="10" inputmode="decimal">
        <p data-role="estimate"></p>
        <button class="btn wide" data-action="wallet" data-mood="tapping">Connect wallet</button>
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
        <div class="slide-num"><b>${m.yes}%</b><span>YES · ${money(m.volume)} vol. · ${m.days}d left</span></div>
        ${blocks(m, 24, "big")}
        <p class="proofline">${icon("eye", 14)} Reads <b>${m.address}</b> · ${m.proof}</p>
        ${odds(m)}
      </div>
      ${coin(m)}
    </article>`;
  const upcoming = (u) => `
    <div class="side-row">
      ${token(u, "sm")}
      <div class="side-text"><b>${u.title}</b><span>${u.cat} · opens ${u.opens} · ${money(u.budget)}</span></div>
      <button class="mini" data-action="notify">Notify</button>
    </div>`;
  const closing = (m) => `
    <button class="side-row" data-open="${m.id}">
      ${token(m, "sm")}
      <div class="side-text"><b>${m.title}</b><span>${m.cat} · ${money(m.volume)} vol.</span></div>
      <span class="side-right"><strong>${m.yes}%</strong><em>${m.days}d left</em></span>
    </button>`;
  window.BakedMosaic.mount({ slide, upcoming, closing });

  // The pointer tilts the coin's stage. The variables live on the carousel so they survive slide changes.
  const carousel = document.querySelector('[data-role="carousel"]');
  carousel.addEventListener(
    "pointermove",
    (e) => {
      if (reduce) return;
      const r = carousel.getBoundingClientRect();
      carousel.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 34).toFixed(1));
      carousel.style.setProperty("--rx", (((e.clientY - r.top) / r.height - 0.5) * -22).toFixed(1));
    },
    { passive: true },
  );

  // 3D cards: each market leans toward the pointer and settles back when it leaves.
  const grid = document.querySelector('[data-role="grid"]');
  grid.addEventListener(
    "pointermove",
    (e) => {
      const el = e.target.closest(".mk");
      if (!el || reduce) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.classList.add("is-tilt");
      el.style.setProperty("--ry", ((px - 0.5) * 9).toFixed(2));
      el.style.setProperty("--rx", ((py - 0.5) * -7).toFixed(2));
      el.style.setProperty("--gx", `${(px * 100).toFixed(0)}%`);
      el.style.setProperty("--gy", `${(py * 100).toFixed(0)}%`);
    },
    { passive: true },
  );
  grid.addEventListener("pointerout", (e) => {
    const el = e.target.closest(".mk");
    if (!el || el.contains(e.relatedTarget)) return;
    el.classList.remove("is-tilt");
    el.style.setProperty("--rx", 0);
    el.style.setProperty("--ry", 0);
  });

  // Starfield: fixed stars that twinkle and shift a little against the pointer.
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const drift = { x: 0, y: 0, tx: 0, ty: 0 };
  let stars = [];
  function seed() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    stars = Array.from({ length: Math.min(140, Math.round((innerWidth * innerHeight) / 11000)) }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      depth: 0.3 + Math.random() * 0.7,
      phase: Math.random() * 6.28,
      warm: Math.random() < 0.18,
    }));
  }
  function draw(now) {
    if (!reduce) requestAnimationFrame(draw);
    drift.x += (drift.tx - drift.x) * 0.05;
    drift.y += (drift.ty - drift.y) * 0.05;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const alpha = (0.25 + 0.35 * Math.sin(now / 900 + s.phase) ** 2) * s.depth;
      ctx.fillStyle = s.warm ? `rgba(242,169,78,${alpha})` : `rgba(170,200,255,${alpha})`;
      const size = s.depth > 0.8 ? 2 : 1;
      ctx.fillRect(s.x + drift.x * s.depth, s.y + drift.y * s.depth, size, size);
    }
  }
  addEventListener(
    "pointermove",
    (e) => {
      drift.tx = (e.clientX / innerWidth - 0.5) * -26;
      drift.ty = (e.clientY / innerHeight - 0.5) * -18;
    },
    { passive: true },
  );
  addEventListener("resize", seed);
  seed();
  draw(performance.now());

  window.BakedPet.init({ size: 84 });
  mount({ id: "J", card, detail });
})();
