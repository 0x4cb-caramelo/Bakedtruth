// Direction A · Ledger. Templates and effects; state and wiring live in ../shared/app.js.
(() => {
  const { icon, money, sparkline, data, mount } = window.BakedApp;

  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.outerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 16);
  });

  document.getElementById("steps").innerHTML = data.steps
    .map((s) => `<div><h3>${s.title}</h3><p>${s.body}</p></div>`)
    .join("");
  document.getElementById("principles").innerHTML = data.principles
    .map(
      (p, i) =>
        `<div data-perch="principle-${i}" data-perch-x="0.9" data-perch-size="0.7"><span class="ic-box">${icon(["eye", "vault", "shield"][i], 18)}</span><div><h3>${p.title}</h3><p>${p.body}</p></div></div>`,
    )
    .join("");

  const odds = (m, side) => `
    <div class="odds">
      <button class="yes ${side === "YES" ? "is-on" : ""}" data-open="${m.id}" data-side="YES" data-mood="approve"><span>Yes</span><span>${m.yes}¢</span></button>
      <button class="no ${side === "NO" ? "is-on" : ""}" data-open="${m.id}" data-side="NO" data-mood="skeptical"><span>No</span><span>${100 - m.yes}¢</span></button>
    </div>`;

  const bar = (m) =>
    m.progress
      ? `<div class="bar" role="progressbar" aria-label="${m.name} goal progress" aria-valuenow="${m.progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${m.progress}%"></span></div>`
      : "";

  function card(m, state) {
    const s = sparkline(m.history, 200, 34);
    const saved = state.saved.has(m.id);
    return `
    <article class="card" data-perch="market-${m.id}" data-perch-x="0.86" data-perch-size="0.74" ${m.resolved ? 'data-perch-pose="approve" data-perch-say="Fine. It checks out."' : ""}>
      <div class="card-head">
        <div class="token" style="--tb:${m.bg};--tt:${m.tone}">${m.icon}</div>
        <button class="card-title" data-open="${m.id}">${m.title}</button>
      </div>
      <div class="chance"><span>${m.cat} · ${m.resolved ? "Resolved" : "YES price"}</span><strong>${m.yes}%</strong></div>
      <svg class="spark" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true">
        <path d="${s.area}" fill="rgba(79,125,255,.10)"/><path d="${s.line}" fill="none" stroke="#7b9ae9" stroke-width="1.5"/>
      </svg>
      ${m.resolved ? '<div class="resolved">Resolved YES · Redemption available</div>' : odds(m)}
      <div class="evidence">
        <div class="evidence-line"><span>${icon("eye", 14)} On-chain proof</span>${m.progress ? `<b>${m.progress}% complete</b>` : ""}</div>
        <div>${m.proof}</div>
        ${bar(m)}
      </div>
      <div class="card-foot">
        <span>${money(m.volume)} vol.</span><span>·</span><span>${m.resolved ? "Resolved today" : `${m.days}d left`}</span>
        <button class="save" data-save="${m.id}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${m.name} market">${icon("bookmark", 15)}</button>
      </div>
    </article>`;
  }

  function detail(m, state) {
    const s = sparkline(m.history, 600, 150, 6);
    return `
    <button class="back" data-action="home">${icon("arrow-left")} Back to markets</button>
    <div class="detail">
      <div>
        <span class="eyebrow">${m.cat} · ${m.name}</span>
        <h2>${m.title}</h2>
        <div class="note">Example market · Preview values, not live account data</div>
        <section class="proof" data-perch="proof" data-perch-x="0.88" data-perch-size="1.1" data-perch-pose="point" data-perch-say="It's a read. Not a vote.">
          <h3>${icon("eye", 18)} On-chain proof</h3>
          <div class="read-values">
            <div><small>${m.field} now</small><b>${m.current}</b></div>
            <div><small>Target</small><b class="dim">${m.target}</b></div>
          </div>
          ${bar(m)}
          <div class="rows">
            <div><span>Account read</span><b>${m.address} ↗</b></div>
            <div><span>Deadline</span><b>${m.deadline}</b></div>
            <div><span>Resolution</span><b>${m.resolved ? "Resolved YES" : "Anyone, the moment the account says so"}</b></div>
          </div>
        </section>
        <section class="chart">
          <h3>YES price · ${m.yes}¢</h3>
          <svg viewBox="0 0 600 150" preserveAspectRatio="none" aria-label="YES price history">
            <path d="${s.area}" fill="rgba(36,199,143,.10)"/><path d="${s.line}" fill="none" stroke="#24c78f" stroke-width="2"/>
          </svg>
        </section>
      </div>
      <aside class="order" data-perch="order" data-perch-x="0.22" data-perch-size="0.9" data-perch-pose="${state.side === "YES" ? "deadpan" : "skeptical"}">
        <h3>${m.resolved ? "Redemption" : `Buy ${state.side}`}</h3>
        ${odds(m, state.side)}
        <label for="amount">Amount · USDC</label>
        <input id="amount" data-role="amount" type="number" min="0" value="10" inputmode="decimal">
        <p data-role="estimate"></p>
        <button class="cta wide" data-action="wallet" data-mood="tapping"><span>Connect wallet</span></button>
        <p>Design preview · No transactions</p>
      </aside>
    </div>`;
  }

  // Card spotlight: every card learns where the pointer is, in its own coordinates.
  const grid = document.getElementById("grid");
  grid.addEventListener("pointermove", (e) => {
    for (const el of grid.children) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  });

  // Dot field: a quiet grid that wakes up around the pointer.
  const canvas = document.getElementById("dots");
  const ctx = canvas.getContext("2d");
  const GAP = 24;
  let mouse = { x: -999, y: -999 };
  let queued = false;
  function draw() {
    queued = false;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (let y = GAP / 2; y < h; y += GAP) {
      for (let x = GAP / 2; x < w; x += GAP) {
        const near = Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / 190);
        ctx.fillStyle = `rgba(${130 + near * 40},${155 + near * 40},${215 + near * 40},${0.07 + near * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + near * 1.2, 0, 6.283);
        ctx.fill();
      }
    }
  }
  const queue = () => queued || ((queued = true), requestAnimationFrame(draw));
  addEventListener("pointermove", (e) => ((mouse = { x: e.clientX, y: e.clientY }), queue()), { passive: true });
  addEventListener("resize", queue);
  draw();

  // The hero's "live read" ticks toward its target so the page shows what a read looks like.
  const now = document.getElementById("read-now");
  const readBar = document.getElementById("read-bar");
  let supply = 640000;
  setInterval(() => {
    supply = supply <= 520000 ? 640000 : supply - Math.round(200 + Math.random() * 900);
    now.textContent = supply.toLocaleString("en-US");
    readBar.style.width = `${Math.min(100, ((1000000 - supply) / 500000) * 100).toFixed(1)}%`;
  }, 2600);

  window.BakedPet.init({ size: 84 });
  mount({ id: "A", card, detail });
})();
