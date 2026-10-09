/**
 * Purpose: the wallet button in the top bar and its flows: connect (a wallet list, or "Use Installed Wallet" on
 *          Android, proposal §3.4), connecting, connected with the short address and the SOL balance, no SOL, the
 *          wrong network, and the menu (copy, explorer, my entries, disconnect). Nothing connects: it is a demo.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { esc, short, sol } from "../format.js";
import { DEMO_WALLET, set, state, walletBalance } from "../state.js";
import { icon } from "./icons.js";
import { dialog, menu, toast } from "./layer.js";

const WALLETS = [
  ["Phantom", "Detected"],
  ["Solflare", "Detected"],
  ["Backpack", "Not installed"],
];

/** The button's HTML for the current state. */
function button() {
  if (state.wallet === "off")
    return `<button class="cta" data-wallet-connect><span>${icon("wallet", 15)}${state.android ? "Use Installed Wallet" : "Connect wallet"}</span></button>`;
  if (state.wallet === "connecting")
    return `<button class="cta" disabled aria-busy="true"><span>Connecting…</span></button>`;
  const warn = state.wallet !== "on";
  const label = state.wallet === "wrongnet" ? "Wrong network" : sol(walletBalance());
  // On narrow phones the warning shortens, so the bar never pushes the menu off screen.
  const shown = state.wallet === "wrongnet" ? `<span class="long">Wrong network</span><span class="short">Switch</span>` : label;
  return `<button class="wallet-on ${warn ? "warn" : ""}" data-wallet-menu aria-haspopup="menu" aria-expanded="false"
      aria-label="Wallet ${short(DEMO_WALLET.address)}, ${label}">
      <span class="dot" aria-hidden="true"></span><span class="addr">${short(DEMO_WALLET.address)}</span>
      <span class="bal">${shown}</span>${icon("chevron-down", 14)}</button>`;
}

const MENU = () => `
  <div class="menu-head"><b>${short(DEMO_WALLET.address)}</b>${DEMO_WALLET.name} · Devnet · ${sol(walletBalance())}</div>
  ${state.wallet === "nosol" ? `<p class="help">This wallet has no SOL. On devnet, test SOL is free from a faucet.</p>` : ""}
  ${state.wallet === "wrongnet" ? `<p class="help error">Your wallet is on mainnet. Switch it to Devnet to join or open.</p>` : ""}
  <button role="menuitem" data-copy>${icon("copy")}Copy address</button>
  <a role="menuitem" href="#" data-explorer>${icon("external")}View on explorer</a>
  <a role="menuitem" href="#/entries">${icon("receipt")}My entries</a>
  <button role="menuitem" data-disconnect>${icon("x")}Disconnect</button>`;

/** The wallet list. On Android Chrome the installed wallet answers through Mobile Wallet Adapter. */
export function connectDialog() {
  const rows = WALLETS.map(
    ([name, note]) => `<button class="btn wide between" data-pick="${esc(name)}" ${note === "Not installed" ? "disabled" : ""}>
      <span>${esc(name)}</span><span class="t-caption">${note}</span></button>`,
  ).join("");
  dialog({
    title: "Connect a wallet",
    body: `<div class="stack">
      ${state.android ? `<button class="cta wide" data-pick="Installed"><span>${icon("phone", 16)}Use Installed Wallet</span></button><p class="help">Opens the wallet app on this phone: Seed Vault, Solflare or Phantom.</p>` : rows}
      <div class="notice">${icon("shield", 18)}<p>Brot Markets never asks for your seed phrase and cannot move your SOL. Every entry is a transaction you read and sign in your wallet.</p></div>
      <p class="t-caption">Devnet only. Your wallet must be set to Devnet.</p></div>`,
    mount(body, close) {
      body.querySelectorAll("[data-pick]").forEach((b) =>
        b.addEventListener("click", () => {
          close();
          set({ wallet: "connecting" });
          setTimeout(() => set({ wallet: "on" }), 900);
        }),
      );
    },
  });
}

/** Draws the button into every [data-wallet] slot and wires it. */
export function renderWallet() {
  document.querySelectorAll("[data-wallet]").forEach((slot) => {
    slot.innerHTML = button();
    slot.querySelector("[data-wallet-connect]")?.addEventListener("click", connectDialog);
    slot.querySelector("[data-wallet-menu]")?.addEventListener("click", (e) =>
      menu(e.currentTarget, MENU(), (el, close) => {
        el.querySelector("[data-copy]")?.addEventListener("click", () => (close(), toast("Address copied.", { kind: "ok" })));
        el.querySelector("[data-explorer]")?.addEventListener("click", (ev) => (ev.preventDefault(), close(), toast("The explorer opens in a new tab on the real site.")));
        el.querySelector("[data-disconnect]")?.addEventListener("click", () => (close(), set({ wallet: "off" })));
      }),
    );
  });
}
