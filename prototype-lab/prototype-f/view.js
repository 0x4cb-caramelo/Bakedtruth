// Direction F · Tape² (C's look on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js.
(() => {
  const { icon, money, data, market, mount } = window.BakedApp;

  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.outerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 16);
  });

  // Ticker: the activity list twice over, so the loop has no seam.
  const items = data.activity
    .map((a) => {
      const m = market(a.market);
      return `<span><b>${a.who}</b> ${a.verb} <b class="${a.side === "YES" ? "y" : "n"}">${a.side}</b> · ${money(a.amount)} · ${m.name} · ${a.ago} ago</span>`;
    })
    .join("");
  document.getElementById("ticker").innerHTML = items + items;

  document.getElementById("steps").innerHTML = data.steps
    .map((s) => `<div><h3>${s.title}</h3><p>${s.body}</p></div>`)
    .join("");
  document.getElementById("principles").innerHTML = data.principles
    .map(
      (p, i) =>
        `<div data-perch="principle-${i}" data-perch-x="0.88" data-perch-size="0.75"><h3>${p.title}</h3><p>${p.body}</p></div>`,
    )
    .join("");

  const blocks = (pct, n, label) => {
    const on = Math.round((pct / 100) * n);
    return `<div class="blocks" role="img" aria-label="${label}">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? "on" : i === on ? "next" : ""}"></i>`).join("")}</div>`;
  };

  const odds = (m, side) => `
    <div class="odds">
      <button class="yes ${side === "YES" ? "is-on" : ""}" data-open="${m.id}" data-side="YES" data-mood="approve"><span>Yes</span><span>${m.yes}¢</span></button>
      <button class="no ${side === "NO" ? "is-on" : ""}" data-open="${m.id}" data-side="NO" data-mood="skeptical"><span>No</span><span>${100 - m.yes}¢</span></button>
    </div>`;

  // Rows put the mascot on the rail beside them, pointing in.
  function card(m, state) {
    const saved = state.saved.has(m.id);
    return `
    <article class="row" data-perch="market-${m.id}" data-perch-x="0" data-perch-dx="-44" data-perch-edge="bottom" data-perch-dy="-8" data-perch-size="0.8" data-perch-pose="${m.resolved ? "approve" : "point"}">
      <div class="token" style="--tb:${m.bg};--tt:${m.tone}">${m.icon}</div>
      <div>
        <button class="row-title" data-open="${m.id}">${m.title}</button>
        <div class="row-sub"><span class="cat">${m.cat}</span><span>${m.resolved ? "Resolved today" : `${m.days}d left`}</span><span>${money(m.volume)} vol.</span><span>${m.proof}</span></div>
      </div>
      ${blocks(m.progress ?? m.yes, 12, m.progress ? `${m.progress}% of the way to the target` : `YES at ${m.yes} cents`)}
      <strong class="pct">${m.yes}%</strong>
      ${m.resolved ? '<div class="resolved">Resolved YES</div>' : odds(m)}
      <button class="save" data-save="${m.id}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${m.name} market">${icon("bookmark", 16)}</button>
    </article>`;
  }

  // Price history as a stepped line, like a tape print.
  function steps(history, w, h) {
    const max = Math.max(...history);
    const min = Math.min(...history);
    const span = max - min || 1;
    const dx = w / history.length;
    const y = (v) => (h - 8 - ((v - min) / span) * (h - 16)).toFixed(1);
    let d = `M0 ${y(history[0])}`;
    history.forEach((v, i) => (d += ` V${y(v)} H${((i + 1) * dx).toFixed(1)}`));
    return { line: d, area: `${d} V${h} H0 Z` };
  }

  function detail(m, state) {
    const s = steps(m.history, 600, 150);
    return `
    <button class="back" data-action="home">${icon("arrow-left")} Back to the tape</button>
    <div class="detail">
      <div>
        <span class="eyebrow">${m.cat} · ${m.name}</span>
        <h2>${m.title}</h2>
        <p class="note">Example market · Preview values, not live account data</p>
        <section class="proof" data-perch="proof" data-perch-x="0.86" data-perch-size="1.35" data-perch-pose="point" data-perch-say="Read the account.">
          <h3>${icon("eye", 20)} On-chain proof</h3>
          <div class="readout">
            <div><small>${m.field} now</small><b>${m.current}</b></div>
            <div><small>Target</small><b>${m.target}</b></div>
          </div>
          ${m.progress ? blocks(m.progress, 24, `${m.progress}% of the way to the target`).replace('class="blocks"', 'class="blocks big"') : ""}
          <div class="rows">
            <div><span>Account read</span><b>${m.address} ↗</b></div>
            <div><span>Deadline</span><b>${m.deadline}</b></div>
            <div><span>Resolution</span><b>${m.resolved ? "Resolved YES" : "Anyone, the moment the account says so"}</b></div>
          </div>
        </section>
        <section class="chart">
          <h3>YES price · ${m.yes}¢</h3>
          <svg viewBox="0 0 600 150" preserveAspectRatio="none" aria-label="YES price history">
            <path d="${s.area}" fill="rgba(61,220,151,.14)"/><path d="${s.line}" fill="none" stroke="#3ddc97" stroke-width="2"/>
          </svg>
        </section>
      </div>
      <aside class="order" data-perch="order" data-perch-x="0.22" data-perch-pose="${state.side === "YES" ? "deadpan" : "skeptical"}">
        <h3>${m.resolved ? "Redemption" : `Buy ${state.side}`}</h3>
        ${odds(m, state.side)}
        <label for="amount">Amount · USDC</label>
        <input id="amount" data-role="amount" type="number" min="0" value="10" inputmode="decimal">
        <p data-role="estimate"></p>
        <button class="btn" data-action="wallet" data-mood="tapping">Connect wallet</button>
        <p>Design preview · No transactions</p>
      </aside>
    </div>`;
  }

  // Tracing beam: the lit stretch of rail follows the row under the pointer.
  const tape = document.getElementById("tape");
  const beam = document.getElementById("beam");
  tape.addEventListener("pointerover", (e) => {
    const row = e.target.closest(".row");
    if (!row) return;
    beam.style.setProperty("--by", `${row.offsetTop}px`);
    beam.style.setProperty("--bh", `${row.offsetHeight}px`);
  });

  // Mosaic: trading carousel, upcoming and closing soon.
  function slide(m, i, n) {
    const s = steps(m.history, 600, 220);
    const pct = m.progress ?? m.yes;
    const label = m.progress ? `${m.progress}% of the way to the target` : `YES at ${m.yes} cents`;
    return `
    <article class="slide">
      <div class="slide-main">
        <div class="slide-top"><div class="token" style="--tb:${m.bg};--tt:${m.tone}">${m.icon}</div><span>${m.cat} · ${i + 1}/${n}</span></div>
        <button class="slide-title" data-open="${m.id}">${m.title}</button>
        <div class="slide-num"><b>${m.yes}%</b><span>YES · ${money(m.volume)} vol. · ${m.days}d left</span></div>
        ${blocks(pct, 24, label).replace('class="blocks"', 'class="blocks big"')}
        <p class="slide-proof">${m.proof}</p>
        ${odds(m)}
      </div>
      <svg class="slide-chart" viewBox="0 0 600 220" preserveAspectRatio="none" aria-label="YES price history">
        <path d="${s.area}" fill="rgba(106,168,255,.14)"/><path d="${s.line}" fill="none" stroke="#6aa8ff" stroke-width="2"/>
      </svg>
    </article>`;
  }
  const upcoming = (u) => `
    <div class="side-row">
      <div class="token sm" style="--tb:${u.bg};--tt:${u.tone}">${u.icon}</div>
      <div class="side-text"><b>${u.title}</b><span>${u.cat} · opens ${u.opens} · ${money(u.budget)}</span></div>
      <button class="btn alt small" data-action="notify">Notify</button>
    </div>`;
  const closing = (m) => `
    <button class="side-row" data-open="${m.id}">
      <div class="token sm" style="--tb:${m.bg};--tt:${m.tone}">${m.icon}</div>
      <div class="side-text"><b>${m.title}</b><span>${m.cat} · ${money(m.volume)} vol.</span></div>
      <span class="side-right"><strong>${m.yes}%</strong><em>${m.days}d left</em></span>
    </button>`;
  window.BakedMosaic.mount({ slide, upcoming, closing });

  // Cell field: grid squares light up under the pointer and fade out in steps.
  const canvas = document.getElementById("cells");
  const ctx = canvas.getContext("2d");
  const CELL = 32;
  const lit = new Map();
  let running = false;
  function paint() {
    const w = innerWidth;
    const h = innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(106,168,255,.05)";
    for (let x = 0; x < w; x += CELL) ctx.fillRect(x, 0, 1, h);
    for (let y = 0; y < h; y += CELL) ctx.fillRect(0, y, w, 1);
    for (const [key, v] of lit) {
      const [cx, cy] = key.split(",").map(Number);
      ctx.fillStyle = `rgba(106,168,255,${(Math.ceil(v * 5) / 5) * 0.22})`;
      ctx.fillRect(cx * CELL + 1, cy * CELL + 1, CELL - 1, CELL - 1);
      v <= 0.03 ? lit.delete(key) : lit.set(key, v - 0.03);
    }
    running = lit.size > 0;
    if (running) requestAnimationFrame(paint);
  }
  addEventListener(
    "pointermove",
    (e) => {
      const cx = Math.floor(e.clientX / CELL);
      const cy = Math.floor(e.clientY / CELL);
      lit.set(`${cx},${cy}`, 1);
      if (Math.random() < 0.5)
        lit.set(`${cx + (Math.random() < 0.5 ? -1 : 1)},${cy + (Math.random() < 0.5 ? -1 : 1)}`, 0.5);
      if (!running) {
        running = true;
        requestAnimationFrame(paint);
      }
    },
    { passive: true },
  );
  addEventListener("resize", paint);
  paint();

  window.BakedPet.init({ size: 80, stepped: true, pixelated: true });
  mount({ id: "F", card, detail });
})();
