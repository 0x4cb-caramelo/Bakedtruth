// Ledger² building blocks shared by directions K, L and M: prototype-d's templates and effects,
// so each of those view files holds only what it adds. D itself does not use this file.
//
// Expects the markup of prototype-d/index.html: #dots, #grid, #steps, #principles.
window.BakedLedger = (() => {
  const { icon, money, sparkline, data } = window.BakedApp;

  /** Inline the icons and fill the two static rows (steps and principles). */
  function chrome() {
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
  }

  // data-cat lets a direction colour the token by category instead of using the market's own colours.
  const token = (m, size = "") =>
    `<div class="token ${size}" data-cat="${m.cat}" style="--tb:${m.bg};--tt:${m.tone}">${m.icon}</div>`;
  const odds = (m, side) => `
    <div class="odds">
      <button class="yes ${side === "YES" ? "is-on" : ""}" data-open="${m.id}" data-side="YES" data-mood="approve"><span>Yes</span><span>${m.yes}¢</span></button>
      <button class="no ${side === "NO" ? "is-on" : ""}" data-open="${m.id}" data-side="NO" data-mood="skeptical"><span>No</span><span>${100 - m.yes}¢</span></button>
    </div>`;
  const bar = (m) =>
    m.progress
      ? `<div class="bar" role="progressbar" aria-label="${m.name} goal progress" aria-valuenow="${m.progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${m.progress}%"></span></div>`
      : "";
  const evidence = (m) => `
    <div class="evidence">
      <div class="evidence-line"><span>${icon("eye", 14)} On-chain proof</span>${m.progress ? `<b>${m.progress}% complete</b>` : ""}</div>
      <div>${m.proof}</div>
      ${bar(m)}
    </div>`;
  const save = (m, state) => {
    const saved = state.saved.has(m.id);
    return `<button class="save" data-save="${m.id}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${m.name} market">${icon("bookmark", 15)}</button>`;
  };

  /** Move of the YES price across the recorded history, in points: `d` and a ready-made chip. */
  function delta(m) {
    const d = m.history[m.history.length - 1] - m.history[0];
    const cls = d > 0 ? "up" : d < 0 ? "down" : "";
    return { d, html: `<span class="delta ${cls}">${d > 0 ? "▲" : d < 0 ? "▼" : "■"} ${Math.abs(d)} pts</span>` };
  }

  /** D's card. `head` and `middle` replace its top rows, `extra` goes above the proof. */
  function card(m, state, { head, middle, extra = "" } = {}) {
    const s = sparkline(m.history, 200, 34);
    return `
    <article class="card" data-perch="market-${m.id}" data-perch-x="0.86" data-perch-size="0.74" ${m.resolved ? 'data-perch-pose="approve" data-perch-say="Fine. It checks out."' : ""}>
      ${head ?? `<div class="card-head">${token(m)}<button class="card-title" data-open="${m.id}">${m.title}</button></div>`}
      ${
        middle ??
        `<div class="chance"><span>${m.cat} · ${m.resolved ? "Resolved" : "YES price"}</span><strong>${m.yes}%</strong></div>
      <svg class="spark" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true">
        <path d="${s.area}" fill="rgba(79,125,255,.10)"/><path d="${s.line}" fill="none" stroke="#7b9ae9" stroke-width="1.5"/>
      </svg>`
      }
      ${m.resolved ? '<div class="resolved">Resolved YES · Redemption available</div>' : odds(m)}
      ${extra}
      ${evidence(m)}
      <div class="card-foot">
        <span>${money(m.volume)} vol.</span><span>·</span><span>${m.resolved ? "Resolved today" : `${m.days}d left`}</span>
        ${save(m, state)}
      </div>
    </article>`;
  }

  /** A price history as an SVG line over its fill. */
  function chart(history, w = 600, h = 150) {
    const s = sparkline(history, w, h, 6);
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="YES price history">
      <path d="${s.area}" fill="rgba(36,199,143,.10)"/><path d="${s.line}" fill="none" stroke="#24c78f" stroke-width="2"/>
    </svg>`;
  }

  const back = (label = "Back to markets") =>
    `<button class="back" data-action="home">${icon("arrow-left")} ${label}</button>`;
  const heading = (m) => `
    <span class="eyebrow">${m.cat} · ${m.name}</span>
    <h2>${m.title}</h2>
    <div class="note">Example market · Preview values, not live account data</div>`;
  const proof = (m, extra = "") => `
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
      ${extra}
    </section>`;
  const CONNECT =
    '<button class="cta wide" data-action="wallet" data-mood="tapping"><span>Connect wallet</span></button>';
  /** The trade panel. `extra` goes under the amount field; `cta` replaces the connect button. */
  const order = (m, state, { extra = "", cta = CONNECT } = {}) => `
    <aside class="order" data-perch="order" data-perch-x="0.22" data-perch-size="0.9" data-perch-pose="${state.side === "YES" ? "deadpan" : "skeptical"}">
      <h3>${m.resolved ? "Redemption" : `Buy ${state.side}`}</h3>
      ${odds(m, state.side)}
      <label for="amount">Amount · USDC</label>
      <input id="amount" data-role="amount" type="number" min="0" value="10" inputmode="decimal">
      ${extra}
      <p data-role="estimate"></p>
      ${cta}
      <p>Design preview · No transactions</p>
    </aside>`;

  /** D's carousel slide. `extra` goes under the Yes / No buttons. */
  function slide(m, i, n, extra = "") {
    const s = sparkline(m.history, 600, 200, 6);
    return `
    <article class="slide">
      <div class="slide-main">
        <div class="card-head">
          ${token(m)}
          <div><span class="eyebrow">${m.cat} · ${i + 1} of ${n}</span>
          <button class="slide-title" data-open="${m.id}">${m.title}</button></div>
        </div>
        <div class="chance"><span>YES price ${delta(m).html}</span><strong>${m.yes}%</strong></div>
        ${odds(m)}
        ${extra}
        ${evidence(m)}
        <div class="card-foot"><span>${money(m.volume)} vol.</span><span>·</span><span>${m.days}d left</span></div>
      </div>
      <svg class="slide-chart" viewBox="0 0 600 200" preserveAspectRatio="none" aria-label="YES price history">
        <path d="${s.area}" fill="rgba(79,125,255,.12)"/><path d="${s.line}" fill="none" stroke="#8fb0ff" stroke-width="2"/>
      </svg>
    </article>`;
  }
  const upcoming = (u) => `
    <div class="side-row">
      ${token(u, "sm")}
      <div class="side-text"><b>${u.title}</b><span>${u.cat} · opens ${u.opens} · ${money(u.budget)} budget</span></div>
      <button class="notify" data-action="notify">Notify</button>
    </div>`;
  const closing = (m) => `
    <button class="side-row" data-open="${m.id}">
      ${token(m, "sm")}
      <div class="side-text"><b>${m.title}</b><span>${m.cat} · ${money(m.volume)} vol.</span></div>
      <span class="side-right"><strong>${m.yes}%</strong><em>${m.resolved ? "resolved" : `${m.days}d left`}</em></span>
    </button>`;

  /** One line of the activity feed. */
  const trade = (a) => {
    const m = window.BakedApp.market(a.market);
    return `<div class="trade"><b>${a.who}</b><span>${a.verb}</span><b class="${a.side === "YES" ? "side-y" : "side-n"}">${a.side}</b><span>${money(a.amount)}</span><button data-open="${m.id}">${m.name}</button><em>${a.ago} ago</em></div>`;
  };
  const trades = (list) =>
    list.length ? list.map(trade).join("") : '<p class="quiet">No trades recorded for this market yet.</p>';
  /** Other markets in the same category; the busiest ones if the category has no other. */
  function related(m) {
    const others = data.markets.filter((o) => o.id !== m.id);
    const same = others.filter((o) => o.cat === m.cat);
    return (same.length ? same : others.sort((a, b) => b.volume - a.volume)).slice(0, 3).map(closing).join("");
  }

  /** Card spotlight on #grid and the dot field on #dots, as in D. */
  function effects() {
    const grid = document.getElementById("grid");
    grid.addEventListener("pointermove", (e) => {
      for (const el of grid.children) {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    });
    const canvas = document.getElementById("dots");
    const ctx = canvas.getContext("2d");
    const GAP = 24;
    let mouse = { x: -999, y: -999 };
    let queued = false;
    function draw() {
      queued = false;
      // The dot colour comes from the direction's stylesheet: "r, g, b" in --dot-rgb. Read on every
      // draw, so a direction that switches theme (N) only has to trigger one.
      const rgb = getComputedStyle(document.documentElement).getPropertyValue("--dot-rgb").trim() || "150, 175, 235";
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
          ctx.fillStyle = `rgba(${rgb},${0.07 + near * 0.5})`;
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
  }

  return {
    chrome,
    token,
    odds,
    bar,
    evidence,
    save,
    delta,
    card,
    chart,
    back,
    heading,
    proof,
    order,
    slide,
    upcoming,
    closing,
    trade,
    trades,
    related,
    effects,
  };
})();
