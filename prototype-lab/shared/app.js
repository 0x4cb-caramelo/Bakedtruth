// Shared prototype logic: state, filtering, routing and event wiring. No markup lives here:
// each direction passes its own `card` and `detail` templates to BakedApp.mount().
//
// Hooks a direction's HTML can use:
//   data-category, data-status, data-save, data-open (+ data-side), data-action
//   data-role = search | sort | grid | count | empty | detail | amount | estimate | explain | notice | notice-text
//   data-screen = home | detail
window.BakedApp = (() => {
  const D = window.BAKED;
  const state = {
    category: "All",
    status: "Active",
    sort: "volume",
    query: "",
    saved: new Set(),
    side: "YES",
    marketId: null,
    explain: false,
  };
  let view = {};

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    "arrow-up-right": '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    vault:
      '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5V7M12 17v-1.5M8.5 12H7M17 12h-1.5"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.800-1.200 8-4.500 8-9V6z"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
  };
  const icon = (name, size = 16) =>
    `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  const money = (n) => "$" + n.toLocaleString("en-US");
  const market = (id) => D.markets.find((m) => m.id === Number(id));

  function list() {
    const q = state.query.trim().toLowerCase();
    const out = D.markets.filter(
      (m) =>
        (state.category === "All" || m.cat === state.category) &&
        (!q || [m.title, m.cat, m.name, m.address].join(" ").toLowerCase().includes(q)) &&
        (state.status === "Resolved"
          ? m.resolved
          : state.status === "Saved"
            ? state.saved.has(m.id)
            : state.status === "Closing soon"
              ? !m.resolved && m.days <= 2
              : !m.resolved),
    );
    const by = {
      deadline: (a, b) => a.days - b.days,
      yes: (a, b) => b.yes - a.yes,
      volume: (a, b) => b.volume - a.volume,
    };
    return out.sort(by[state.sort]);
  }

  /** What an order of `amount` USDC buys. Preview arithmetic only. */
  function estimate(m, side, amount) {
    const price = side === "YES" ? m.yes : 100 - m.yes;
    if (m.resolved || price <= 0) return { price, shares: 0, text: "Trading closed" };
    const shares = Math.max(0, Number(amount) || 0) / (price / 100);
    return {
      price,
      shares,
      text: `${shares.toFixed(2)} ${side} at ${price}¢ · pays ${money(Number(shares.toFixed(2)))} if ${side}`,
    };
  }

  /** SVG path data for a price history: `line` for the stroke, `area` for the fill under it. */
  function sparkline(history, w, h, pad = 2) {
    const max = Math.max(...history, 1);
    const min = Math.min(...history, 0);
    const span = max - min || 1;
    const pts = history.map((v, i) => [
      pad + (i * (w - pad * 2)) / (history.length - 1),
      h - pad - ((v - min) / span) * (h - pad * 2),
    ]);
    const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return { line, area: `${line} L${w - pad} ${h} L${pad} ${h} Z`, last: pts[pts.length - 1] };
  }

  function updateEstimate() {
    const amount = $('[data-role="amount"]');
    const out = $('[data-role="estimate"]');
    const m = market(state.marketId);
    if (amount && out && m) out.textContent = estimate(m, state.side, amount.value).text;
  }

  function notice(text) {
    const box = $('[data-role="notice"]');
    if (!box) return;
    box.hidden = false;
    $('[data-role="notice-text"]', box).textContent = text;
  }

  function render() {
    const home = state.marketId == null;
    $$("[data-screen]").forEach((el) => (el.hidden = (el.dataset.screen === "home") !== home));
    $$("[data-category]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.category === state.category)));
    $$("[data-status]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.status === state.status)));
    const explain = $('[data-role="explain"]');
    if (explain) explain.hidden = !state.explain;

    if (home) {
      const items = list();
      const grid = $('[data-role="grid"]');
      if (grid) grid.innerHTML = items.map((m, i) => view.card(m, state, i)).join("");
      $$('[data-role="count"]').forEach(
        (c) => (c.textContent = `${items.length} ${items.length === 1 ? "market" : "markets"}`),
      );
      const empty = $('[data-role="empty"]');
      if (empty) empty.hidden = items.length !== 0;
    } else {
      $('[data-role="detail"]').innerHTML = view.detail(market(state.marketId), state);
      updateEstimate();
    }
    if (view.after) view.after(state);
    if (window.BakedPet) window.BakedPet.refresh();
  }

  function parseHash() {
    const m = location.hash.match(/^#\/m\/(\d+)(?:\/(YES|NO))?/);
    state.marketId = m && market(m[1]) ? Number(m[1]) : null;
    state.side = (m && m[2]) || "YES";
  }

  function go(hash) {
    if (location.hash === hash || (hash === "#/" && !location.hash)) {
      parseHash();
      render();
    } else {
      location.hash = hash;
    }
  }

  function onClick(e) {
    const t = e.target.closest("[data-category],[data-status],[data-save],[data-open],[data-action]");
    if (!t) return;
    const d = t.dataset;
    if (d.category) {
      state.category = d.category;
      go("#/");
    } else if (d.status) {
      state.status = d.status;
      render();
    } else if (d.save) {
      const id = Number(d.save);
      state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
      render();
    } else if (d.open) {
      go(`#/m/${d.open}/${d.side || "YES"}`);
    } else if (d.action === "home") {
      go("#/");
    } else if (d.action === "explain") {
      state.explain = !state.explain;
      go("#/");
    } else if (d.action === "wallet") {
      notice("Wallet connection is shown for layout review. No wallet or transaction is connected.");
    } else if (d.action === "sponsor") {
      notice("Sponsor flow: choose a goal, set its target and deadline, then fund the USDC budget.");
    } else if (d.action === "notify") {
      notice("Upcoming market: you would get a reminder when its sale opens.");
    } else if (d.action === "dismiss") {
      $('[data-role="notice"]').hidden = true;
    } else if (d.action === "reset") {
      Object.assign(state, { category: "All", status: "Active", query: "" });
      $$('[data-role="search"]').forEach((i) => (i.value = ""));
      render();
    }
  }

  function onInput(e) {
    if (e.target.matches('[data-role="search"]')) {
      state.query = e.target.value;
      go("#/");
    } else if (e.target.matches('[data-role="amount"]')) {
      updateEstimate();
    }
  }

  /** Small fixed switcher between the lab's directions. Not part of any design. */
  function labNav(current) {
    const links = [
      ["../index.html", "Lab"],
      ["../prototype-a/index.html", "A · Ledger"],
      ["../prototype-b/index.html", "B · Oven"],
      ["../prototype-c/index.html", "C · Tape"],
      ["../prototype-d/index.html", "D · Ledger²"],
      ["../prototype-e/index.html", "E · Oven²"],
      ["../prototype-f/index.html", "F · Tape²"],
      ["../prototype-g/index.html", "G · Casino"],
      ["../prototype-h/index.html", "H · Prism"],
      ["../prototype-i/index.html", "I · Blocks"],
      ["../prototype-j/index.html", "J · Orbit"],
      ["../prototype-k/index.html", "K · Desk"],
      ["../prototype-l/index.html", "L · Arena"],
      ["../prototype-m/index.html", "M · Vault"],
      ["../prototype-n/index.html", "N · Ledger² Light"],
    ];
    const here = (label) => label.startsWith(`${current} ·`);
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Prototype lab");
    nav.style.cssText =
      "position:fixed;left:12px;bottom:12px;z-index:200;display:flex;flex-wrap:wrap;max-width:calc(100vw - 24px);gap:2px;padding:3px;background:#000c;border:1px solid #fff3;border-radius:6px;font:500 11px/1 system-ui,sans-serif";
    nav.innerHTML = links
      .map(
        ([href, label]) =>
          `<a href="${href}" style="padding:6px 8px;border-radius:4px;text-decoration:none;color:${here(label) ? "#000" : "#fffc"};background:${here(label) ? "#fff" : "transparent"}">${label}</a>`,
      )
      .join("");
    document.body.appendChild(nav);
  }

  function mount(v) {
    view = v;
    labNav(v.id || "");
    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput);
    document.addEventListener("change", (e) => {
      if (e.target.matches('[data-role="sort"]')) {
        state.sort = e.target.value;
        render();
      }
    });
    window.addEventListener("hashchange", () => {
      const was = state.marketId;
      parseHash();
      render();
      if (state.marketId !== was) window.scrollTo({ top: 0 });
    });
    parseHash();
    render();
  }

  return { mount, render, state, data: D, icon, money, market, list, estimate, sparkline };
})();
