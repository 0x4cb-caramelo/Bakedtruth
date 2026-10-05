// Direction L · Arena (Ledger² as a place to discover markets). Only what L adds lives here: the Ledger² blocks come from ../shared/ledger.js.
(() => {
  const { money, data, mount } = window.BakedApp;
  const L = window.BakedLedger;
  L.chrome();

  const open = data.markets.filter((m) => !m.resolved);

  // Categories show how many open markets they hold.
  document.querySelectorAll("[data-category]").forEach((b) => {
    const n = b.dataset.category === "All" ? open.length : open.filter((m) => m.cat === b.dataset.category).length;
    b.insertAdjacentHTML("beforeend", `<span class="n">${n}</span>`);
  });

  // Biggest moves: the four open markets whose YES price travelled furthest.
  document.getElementById("movers").innerHTML = [...open]
    .sort((a, b) => Math.abs(L.delta(b).d) - Math.abs(L.delta(a).d))
    .slice(0, 4)
    .map(
      (m) => `
      <button class="mover" data-open="${m.id}">
        ${L.token(m, "sm")}
        <span class="mover-text"><b>${m.title}</b>${L.delta(m).html}</span>
        <span class="mover-right"><strong>${m.yes}%</strong></span>
      </button>`,
    )
    .join("");

  // Chance gauge: a half ring, 0% on the left and 100% on the right.
  const ARC = Math.PI * 40;
  const gauge = (m) => `
    <svg class="gauge ${m.yes >= 50 ? "likely" : ""}" viewBox="0 0 100 62" role="img" aria-label="${m.yes}% chance of YES">
      <path class="track" d="M10 50 A40 40 0 0 1 90 50"/>
      <path class="fill" d="M10 50 A40 40 0 0 1 90 50" stroke-dasharray="${((m.yes / 100) * ARC).toFixed(1)} ${ARC.toFixed(1)}"/>
      <text x="50" y="48" text-anchor="middle">${m.yes}%</text>
      <text class="cap" x="50" y="60" text-anchor="middle">chance</text>
    </svg>`;

  const card = (m, state) =>
    L.card(m, state, {
      head: `<div class="card-head">${L.token(m)}<button class="card-title" data-open="${m.id}">${m.title}</button>${gauge(m)}</div>`,
      middle: `<div class="card-meta"><span>${m.cat} · ${m.name}</span>${L.delta(m).html}</div>`,
    });

  // The resolution rule in one sentence, built from the same fields the proof panel shows.
  const rule = (m) =>
    m.resolved
      ? `Resolved <b>YES</b>: ${m.field.toLowerCase()} read <b>${m.current}</b>. Every YES redeems for 1 USDC.`
      : `Resolves <b>YES</b> the moment ${m.field.toLowerCase()} reads <b>${m.target}</b>, by anyone, in the same transaction. If that has not happened by <b>${m.deadline}</b>, it resolves <b>NO</b>. Nobody votes and nobody can dispute it.`;

  function detail(m, state) {
    const here = data.activity.filter((a) => a.market === m.id);
    return `
    ${L.back()}
    <div class="detail">
      <div>
        ${L.heading(m)}
        ${L.proof(m)}
        <section class="box"><h3>How this resolves</h3><p class="rule">${rule(m)}</p></section>
        <section class="chart">
          <div class="chart-head"><h3>YES price · ${m.yes}¢ ${L.delta(m).html}</h3></div>
          ${L.chart(m.history)}
        </section>
        <section class="box"><h3>Recent trades</h3>${L.trades(here)}</section>
        <section class="box"><h3>More in ${m.cat}</h3>${L.related(m)}</section>
      </div>
      ${L.order(m, state)}
    </div>`;
  }

  document.getElementById("leaders").innerHTML =
    '<div class="leader head"><span>#</span><span>Trader</span><span>Profit</span><span>Volume</span><span>Wins</span></div>' +
    data.leaders
      .map(
        (t, i) => `
        <div class="leader ${i === 0 ? "first" : ""}">
          <span class="rank">${i + 1}</span><b>${t.who}</b>
          <span class="${t.profit >= 0 ? "pos" : "neg"}">${t.profit >= 0 ? "+" : "−"}${money(Math.abs(t.profit))}</span>
          <span>${money(t.volume)}</span><span>${t.wins}</span>
        </div>`,
      )
      .join("");
  document.getElementById("feed").innerHTML = data.activity.map(L.trade).join("");

  L.effects();
  window.BakedMosaic.mount({ slide: L.slide, upcoming: L.upcoming, closing: L.closing });
  window.BakedPet.init({ size: 84 });
  mount({ id: "L", card, detail });
})();
