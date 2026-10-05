// Direction G · Casino (the gambling register on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js.
(() => {
  const { icon, money, data, market, mount, sparkline } = window.BakedApp;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.outerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 16);
  });

  const SUITS = { Burn: "♥", Renounce: "♠", Lock: "♣", Immutable: "♦", Stake: "★" };
  const suit = (cat) => SUITS[cat] || "♠";
  // What one USDC on a side pays back if that side wins.
  const mult = (price) => `×${(100 / price).toFixed(2)}`;

  // Ticker: the activity list twice over, so the loop has no seam.
  const wins = data.activity
    .map((a) => {
      const m = market(a.market);
      return `<span>★ <b>${a.who}</b> ${a.verb} ${a.side} on ${m.name} · <i>${money(a.amount)}</i> · ${a.ago} ago</span>`;
    })
    .join("");
  document.getElementById("ticker").innerHTML = wins + wins;

  // Jackpot: every market's volume, counted up once on load.
  const pot = data.markets.reduce((sum, m) => sum + m.volume, 0);
  const jackpot = document.getElementById("jackpot");
  if (reduce) {
    jackpot.textContent = money(pot);
  } else {
    const t0 = performance.now();
    const roll = (t) => {
      const k = Math.min(1, (t - t0) / 1600);
      jackpot.textContent = money(Math.round(pot * (1 - (1 - k) ** 3)));
      if (k < 1) requestAnimationFrame(roll);
    };
    requestAnimationFrame(roll);
  }

  // Principles and steps as playing cards. The rank and suit sit in the corners via data-rank.
  const playing = (p, rank, tilt, attrs = "") =>
    `<div class="card-play" data-rank="${rank}" style="--tilt:${tilt}deg${rank.includes("♥") ? ";--suit-color:#c8102e" : ""}" ${attrs}><h3>${p.title}</h3><p>${p.body}</p></div>`;
  document.getElementById("steps").innerHTML = data.steps
    .map((s, i) => playing(s, "7&#10;♣", [-1.5, 1, -1][i]))
    .join("");
  document.getElementById("principles").innerHTML = data.principles
    .map((p, i) =>
      playing(
        p,
        ["A&#10;♠", "K&#10;♥", "Q&#10;♣"][i],
        [-2, 1.5, -1][i],
        `data-perch="principle-${i}" data-perch-x="0.86" data-perch-size="0.75"`,
      ),
    )
    .join("");

  // Countdowns: mock deadlines counted from page load, so the clocks tick like a "last call" board.
  const T0 = Date.now();
  const until = (m) => T0 + m.days * 864e5 - ((m.id * 37) % 600) * 6e4;
  const two = (n) => String(n).padStart(2, "0");
  function left(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400);
    return `${d ? `${d}d ` : ""}${two(Math.floor((s % 86400) / 3600))}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`;
  }
  const countdown = (m) => `<span class="countdown" data-until="${until(m)}">${left(until(m) - Date.now())}</span>`;
  setInterval(() => {
    document.querySelectorAll("[data-until]").forEach((el) => {
      el.textContent = left(Number(el.dataset.until) - Date.now());
    });
  }, 1000);

  const chips = (m, side, size = "") => `
    <div class="chips">
      <button class="chip yes ${size} ${side === "YES" ? "is-on" : ""}" data-open="${m.id}" data-side="YES" data-mood="approve"><span>Yes<small>${m.yes}¢</small></span></button>
      <button class="chip no ${size} ${side === "NO" ? "is-on" : ""}" data-open="${m.id}" data-side="NO" data-mood="skeptical"><span>No<small>${100 - m.yes}¢</small></span></button>
    </div>`;

  // Slot reels: each digit is a strip of 0–9 three times over that spins down to its value.
  const STRIP = Array.from({ length: 30 }, (_, i) => `<i>${i % 10}</i>`).join("");
  const reels = (n, label) =>
    `<span class="reels" role="img" aria-label="${label}"><span class="reel sym">$</span>${String(n)
      .split("")
      .map((d, i) => `<span class="reel"><span class="strip" style="--d:${d};--i:${i}">${STRIP}</span></span>`)
      .join("")}</span>`;

  // Each market is a felt table; the mascot stands on its rim.
  function card(m, state) {
    const saved = state.saved.has(m.id);
    return `
    <article class="table" data-perch="market-${m.id}" data-perch-x="0.84" data-perch-size="0.74" ${m.resolved ? 'data-perch-pose="approve" data-perch-say="Fine. It checks out."' : ""}>
      <div class="table-top"><span class="cat">${suit(m.cat)} ${m.cat} · ${m.name}</span>${m.resolved ? "" : countdown(m)}</div>
      <button class="table-title" data-open="${m.id}">${m.title}</button>
      ${
        m.resolved
          ? '<div class="winner"><b>YES wins</b><span>Paid 1:1 in USDC</span></div>'
          : `<div class="odds-line"><span class="pays"><small>YES pays</small><b>${mult(m.yes)}</b></span><strong>${m.yes}%</strong></div>${chips(m, null, "sm")}`
      }
      <div class="table-foot"><span>${money(m.volume)} pot</span><span>${m.proof}</span>
        <button class="save" data-save="${m.id}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${m.name} market">${icon("bookmark", 16)}</button>
      </div>
    </article>`;
  }

  function detail(m, state) {
    const s = sparkline(m.history, 600, 160);
    return `
    <button class="back" data-action="home">${icon("arrow-left")} Back to the floor</button>
    <div class="detail">
      <div>
        <span class="eyebrow">${suit(m.cat)} ${m.cat} · ${m.name}</span>
        <h2>${m.title}</h2>
        <p class="note">Example market · Preview values, not live account data</p>
        <section class="rules" data-perch="proof" data-perch-x="0.86" data-perch-size="1.2" data-perch-pose="point" data-perch-say="No dealer. Read the account.">
          <h3>${icon("eye", 22)} House rules: the chain decides</h3>
          <div class="readout">
            <div><small>${m.field} now</small><b>${m.current}</b></div>
            <div><small>Target</small><b>${m.target}</b></div>
          </div>
          ${m.progress ? `<div class="bar" role="img" aria-label="${m.progress}% of the way to the target"><span style="width:${m.progress}%"></span></div>` : ""}
          <div class="rows">
            <div><span>Account read</span><b>${m.address} ↗</b></div>
            <div><span>Last call</span><b>${m.deadline}</b></div>
            <div><span>Who calls it</span><b>${m.resolved ? "Resolved YES" : "Anyone, the moment the account says so"}</b></div>
          </div>
        </section>
        <section class="chart">
          <h3>YES price · ${m.yes}¢</h3>
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" aria-label="YES price history">
            <path d="${s.area}" fill="rgba(246,196,69,.16)"/><path d="${s.line}" fill="none" stroke="#f6c445" stroke-width="3"/>
          </svg>
        </section>
      </div>
      <aside class="slip" data-perch="order" data-perch-x="0.2" data-perch-pose="${state.side === "YES" ? "deadpan" : "skeptical"}">
        <h3>${m.resolved ? "Cash out" : `Betting slip · ${state.side}`}</h3>
        ${chips(m, state.side)}
        <label for="amount">Your stake · USDC</label>
        <input id="amount" data-role="amount" type="number" min="0" value="10" inputmode="decimal">
        <div class="stack" aria-label="Add to stake">
          ${[5, 25, 100].map((n) => `<button class="chip sm stake" data-stake="${n}" aria-label="Add ${n} USDC"><span>+${n}</span></button>`).join("")}
        </div>
        <p class="payout" data-role="estimate"></p>
        <button class="gold-btn" data-action="wallet" data-mood="tapping">Place bet</button>
        <p class="small">Design preview · No transactions</p>
      </aside>
    </div>`;
  }

  // Mosaic: hot tables in the marquee, next games as tickets, last call with live clocks.
  const slide = (m, i, n) => `
    <article class="slide">
      <div class="slide-main">
        <span class="slide-cat">${suit(m.cat)} ${m.cat} · Table ${i + 1} of ${n}</span>
        <button class="slide-title" data-open="${m.id}">${m.title}</button>
        <div class="slot">${reels(m.volume, `${money(m.volume)} in the pot`)}<span class="slot-label">in the<br>pot</span></div>
        <span class="pays"><small>YES pays</small><b>${mult(m.yes)}</b></span>
        <div class="slide-meta"><span>Last call in ${countdown(m)}</span><span><b>${m.proof}</b></span></div>
        ${chips(m)}
      </div>
      <div class="wheel-wrap">
        <div class="wheel"></div>
        <div class="wheel-hub"><b>${m.yes}%</b><small>YES</small></div>
      </div>
    </article>`;
  const upcoming = (u) => `
    <div class="ticket">
      <span aria-hidden="true">${suit(u.cat)}</span>
      <div class="ticket-text"><b>${u.title}</b><span>${u.cat} · doors open ${u.opens} · ${money(u.budget)} pot</span></div>
      <button class="reserve" data-action="notify">Reserve</button>
    </div>`;
  const closing = (m) => `
    <button class="call-row" data-open="${m.id}">
      <span class="mult">${mult(m.yes)}</span>
      <span class="call-text"><b>${m.title}</b>${countdown(m)}</span>
      <strong>${m.yes}%</strong>
    </button>`;
  window.BakedMosaic.mount({ slide, upcoming, closing });

  // Stake chips add to the amount; "Place bet" throws confetti. Nothing is sent anywhere.
  const COLORS = ["#f6c445", "#e3263b", "#ff3ea5", "#36f1ff", "#fff8e7"];
  function confetti(x, y) {
    if (reduce) return;
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("i");
      const angle = Math.random() * Math.PI * 2;
      const reach = 80 + Math.random() * 180;
      p.className = "confetti";
      p.style.cssText = `left:${x}px;top:${y}px;background:${COLORS[i % COLORS.length]};--dx:${Math.round(Math.cos(angle) * reach)}px;--dy:${Math.round(Math.sin(angle) * reach + 160)}px;--r:${Math.round(Math.random() * 720 - 360)}deg`;
      p.addEventListener("animationend", () => p.remove());
      document.body.appendChild(p);
    }
  }
  document.addEventListener("click", (e) => {
    const stake = e.target.closest("[data-stake]");
    const bet = e.target.closest(".slip [data-action='wallet']");
    if (stake) {
      const input = document.querySelector('[data-role="amount"]');
      input.value = (Number(input.value) || 0) + Number(stake.dataset.stake);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (bet) {
      const r = bet.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2);
    }
  });

  window.BakedPet.init({
    size: 88,
    pixelated: true,
    quips: [
      "The house doesn't decide.",
      "No dealer. Just an account.",
      "Luck isn't a resolver.",
      "I don't do lucky.",
      "Read the account.",
      "Fine. It checks out.",
    ],
  });
  mount({ id: "G", card, detail });
})();
