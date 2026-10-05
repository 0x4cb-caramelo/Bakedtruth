// Direction K · Desk (Ledger² for a full-time trader). Only what K adds lives here: the Ledger² blocks come from ../shared/ledger.js.
(() => {
  const { money, data, mount, render } = window.BakedApp;
  const L = window.BakedLedger;
  L.chrome();

  let mode = "table"; // "table" | "cards"
  let range = "all"; // "all" | "recent"

  // Summary strip. "Oracles: 0" is the product's whole argument, so it sits with the numbers.
  const open = data.markets.filter((m) => !m.resolved);
  document.getElementById("pulse").innerHTML = [
    ["Total volume", money(data.markets.reduce((sum, m) => sum + m.volume, 0))],
    ["Open markets", open.length],
    ["Closing in 48h", open.filter((m) => m.days <= 2).length],
    ["Resolved by a read", data.markets.length - open.length],
    ["Oracles involved", '<b class="zero">0</b>'],
  ]
    .map(
      ([label, value]) =>
        `<div><small>${label}</small>${String(value).startsWith("<") ? value : `<b>${value}</b>`}</div>`,
    )
    .join("");

  document.getElementById("feed").innerHTML = data.activity.map(L.trade).join("");

  // One market as a table row. Columns match #thead.
  const row = (m, state) => `
    <article class="trow">
      <div class="trow-market">${L.token(m, "sm")}
        <div><button class="trow-title" data-open="${m.id}">${m.title}</button><span class="trow-proof">${m.cat} · ${m.proof}</span></div>
      </div>
      <strong class="pct">${m.yes}%</strong>
      ${L.delta(m).html}
      <span class="num">${money(m.volume)}</span>
      <span class="num">${m.resolved ? "—" : `${m.days}d`}</span>
      ${m.resolved ? '<div class="resolved">Resolved YES</div>' : L.odds(m)}
      ${L.save(m, state)}
    </article>`;
  const card = (m, state) => (mode === "table" ? row(m, state) : L.card(m, state));

  function detail(m, state) {
    const history = range === "recent" ? m.history.slice(-6) : m.history;
    const here = data.activity.filter((a) => a.market === m.id);
    return `
    ${L.back()}
    <div class="detail">
      <div>
        ${L.heading(m)}
        ${L.proof(m)}
        <section class="chart">
          <div class="chart-head">
            <h3>YES price · ${m.yes}¢ ${L.delta(m).html}</h3>
            <div class="seg" role="group" aria-label="Chart range">
              <button data-range="recent" aria-pressed="${range === "recent"}">Recent</button>
              <button data-range="all" aria-pressed="${range === "all"}">All</button>
            </div>
          </div>
          ${L.chart(history)}
        </section>
        <section class="box"><h3>Market activity</h3>${L.trades(here)}</section>
        <section class="box"><h3>Related markets</h3>${L.related(m)}</section>
      </div>
      ${L.order(m, state, {
        extra: `<div class="quick" aria-label="Quick amounts">${[10, 50, 100, 500].map((n) => `<button data-amount="${n}">$${n}</button>`).join("")}</div>`,
      })}
    </div>`;
  }

  // The list layout follows `mode`; the header row only makes sense above the table.
  const grid = document.getElementById("grid");
  const thead = document.getElementById("thead");
  function after() {
    grid.classList.toggle("is-table", mode === "table");
    thead.hidden = mode !== "table" || grid.children.length === 0;
    document
      .querySelectorAll("[data-mode]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-mode],[data-range],[data-amount]");
    if (!t) return;
    if (t.dataset.amount) {
      const input = document.querySelector('[data-role="amount"]');
      input.value = t.dataset.amount;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    if (t.dataset.mode) mode = t.dataset.mode;
    if (t.dataset.range) range = t.dataset.range;
    render();
  });

  L.effects();
  window.BakedMosaic.mount({ slide: L.slide, upcoming: L.upcoming, closing: L.closing });
  window.BakedPet.init({ size: 84 });
  mount({ id: "K", card, detail, after });
})();
