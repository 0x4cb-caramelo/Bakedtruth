// Direction M · Vault (Ledger² seen from a connected wallet). Only what M adds lives here: the Ledger² blocks come from ../shared/ledger.js.
(() => {
  const { icon, money, data, market, mount, render } = window.BakedApp;
  const L = window.BakedLedger;
  L.chrome();

  // The wallet is a local flag. Nothing here talks to a wallet, signs or sends anything.
  let connected = false;
  const W = data.wallet;
  const usd = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const signed = (n) => `<span class="${n >= 0 ? "pos" : "neg"}">${n >= 0 ? "+" : "−"}${usd(Math.abs(n))}</span>`;
  const priceOf = (p) => (p.side === "YES" ? market(p.market).yes : 100 - market(p.market).yes);
  const value = (p) => (p.shares * priceOf(p)) / 100;
  const pnl = (p) => value(p) - (p.shares * p.avg) / 100;
  const position = (id) => (connected ? W.positions.find((p) => p.market === id) : undefined);
  const side = (p) => `<b class="${p.side === "YES" ? "side-y" : "side-n"}">${p.side}</b>`;

  const toast = document.getElementById("toast");
  let toastTimer = 0;
  function say(text) {
    toast.textContent = text;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 3200);
  }

  // Header chip and portfolio bar follow the flag.
  function paintWallet() {
    document.body.classList.toggle("is-connected", connected);
    document.getElementById("wallet-label").textContent = connected ? "Disconnect" : "Connect wallet";
    const chip = document.getElementById("wallet-chip");
    const bar = document.getElementById("portfolio");
    chip.hidden = bar.hidden = !connected;
    if (!connected) return;
    chip.innerHTML = `<i></i><b>${W.address}</b><span>${usd(W.usdc)} USDC</span>`;
    const held = W.positions.reduce((sum, p) => sum + value(p), 0);
    bar.innerHTML = `
      <div><small>Cash · USDC</small><b>${usd(W.usdc)}</b></div>
      <div><small>In ${W.positions.length} positions</small><b>${usd(held)}</b></div>
      <div><small>Unrealised</small><b>${signed(W.positions.reduce((sum, p) => sum + pnl(p), 0))}</b></div>
      <div class="positions">${W.positions
        .map(
          (p) =>
            `<button class="pos-chip" data-open="${p.market}" data-side="${p.side}"><b>${market(p.market).name}</b>${side(p)}<span>${p.shares}</span>${signed(pnl(p))}</button>`,
        )
        .join("")}</div>`;
  }

  // What the sponsor put up, and what that makes one YES worth to whoever gets the goal done.
  const bounty = (m) => {
    const s = data.sponsors[m.id];
    return `<div class="bounty"><span>Sponsor <b>${s.who}</b> funded <b>${money(s.budget)}</b></span><span>YES at <b>${m.yes}¢</b> redeems for <b>$1.00</b></span></div>`;
  };

  const card = (m, state) => {
    const p = position(m.id);
    return L.card(m, state, {
      extra: `${p ? `<span class="mine">You hold ${p.shares} ${p.side}</span>` : ""}${m.resolved ? "" : bounty(m)}`,
    });
  };

  // Lifecycle: an open market sits on step 1; a resolved one has only redemption left.
  const life = (m) => {
    const steps = [
      ["Trading open", "Buy YES or NO against the pool"],
      ["Goal met on-chain", `${m.field} reads ${m.target}`],
      ["Anyone resolves", "One transaction, no vote"],
      ["Redeem 1:1", "Each winning token pays 1 USDC"],
    ];
    const now = m.resolved ? 3 : 0;
    return `<div class="life">${steps.map(([t, d], i) => `<div class="${i < now ? "done" : i === now ? "now" : ""}"><b>${t}</b>${d}</div>`).join("")}</div>`;
  };
  const resolver = data.activity.find((a) => a.verb === "resolved");
  const resolve = (m) =>
    m.resolved
      ? `<div class="resolve"><button disabled>Resolved YES</button><small>Resolved by ${resolver.who}, ${resolver.ago} ago. It cannot be reopened.</small></div>`
      : `<div class="resolve"><button disabled>Resolve market</button><small>Unlocks for anyone the moment the account meets the target, or once the deadline passes. No permission needed.</small></div>`;

  function detail(m, state) {
    const p = position(m.id);
    const s = data.sponsors[m.id];
    const cta = connected
      ? `<button class="cta wide" data-tx data-mood="tapping"><span>${m.resolved ? "Redeem" : `Buy ${state.side}`}</span></button>`
      : '<button class="cta wide" data-wallet data-mood="tapping"><span>Connect wallet</span></button>';
    return `
    ${L.back()}
    <div class="detail">
      <div>
        ${L.heading(m)}
        ${life(m)}
        ${L.proof(m, resolve(m))}
        <section class="chart"><div class="chart-head"><h3>YES price · ${m.yes}¢ ${L.delta(m).html}</h3></div>${L.chart(m.history)}</section>
      </div>
      <div class="aside-stack">
        ${L.order(m, state, { cta })}
        ${
          p
            ? `<section class="box"><h3>Your position</h3>
          <dl class="facts"><dt>Holding</dt><dd>${p.shares} ${side(p)}</dd><dt>Average entry</dt><dd>${p.avg}¢</dd><dt>Value now</dt><dd>${usd(value(p))}</dd><dt>Unrealised</dt><dd>${signed(pnl(p))}</dd></dl>
          ${m.resolved ? '<button class="redeem" data-tx>Redeem 1:1 in USDC</button>' : ""}</section>`
            : ""
        }
        <section class="box"><h3>${icon("vault", 16)} Sponsor and vault</h3>
          <dl class="facts"><dt>Sponsor</dt><dd>${s.who}</dd><dt>Budget funded</dt><dd>${money(s.budget)} USDC</dd><dt>Locked until</dt><dd>${m.resolved ? "Released" : m.deadline}</dd><dt>Backing</dt><dd>1 USDC per YES</dd></dl>
        </section>
      </div>
    </div>`;
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-wallet]")) {
      connected = !connected;
      paintWallet();
      render();
      say(connected ? "Mock wallet connected. Nothing real is linked." : "Wallet disconnected.");
    } else if (e.target.closest("[data-tx]")) {
      say("Transaction preview: nothing was signed or sent.");
    }
  });

  L.effects();
  window.BakedMosaic.mount({
    slide: (m, i, n) => L.slide(m, i, n, bounty(m)),
    upcoming: L.upcoming,
    closing: L.closing,
  });
  window.BakedPet.init({ size: 84 });
  paintWallet();
  mount({ id: "M", card, detail });
})();
