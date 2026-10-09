/**
 * Purpose: the prototype's state: the wallet in each of its states, the switches that show the site-wide notices
 *          (entries paused, a stale SOL/USD price, the country switch, the full valve), the saved campaigns, and a
 *          tiny publish/subscribe so screens redraw when a switch moves.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Every switch can be set from the address bar, so a
 *          reviewer can open any state directly: ?wallet=on&paused=1&stale=1&geo=1&valve=1&android=1&theme=light.
 */
import { LAMPORTS } from "./format.js";

/** Wallet states the design covers (sprint--1 file, Deliverables): off, connecting, on, nosol, wrongnet. */
export const WALLET_STATES = ["off", "connecting", "on", "nosol", "wrongnet"];

/** The demo wallet. Its address is obviously fake; nothing here is a key. */
export const DEMO_WALLET = {
  address: "DemoBaker7Yx3mQ9vKf2Lw8Rt5Hn4Jc6Pz1Sd9QpK",
  balance: 12.48 * LAMPORTS,
  name: "Phantom",
};

const params = new URLSearchParams(location.search);
const flag = (name) => params.get(name) === "1";

export const state = {
  wallet: WALLET_STATES.includes(params.get("wallet")) ? params.get("wallet") : "off",
  /** Android Chrome shows "Use Installed Wallet" (proposal §3.4; TP §3.6, rule 3). */
  android: flag("android") || /Android/i.test(navigator.userAgent),
  paused: flag("paused"),
  stalePrice: flag("stale"),
  geoBlocked: flag("geo"),
  valveFull: flag("valve"),
  saved: new Set(),
};

/** True when the wallet is connected, whatever its balance or network. */
export const connected = () => ["on", "nosol", "wrongnet"].includes(state.wallet);

/** The SOL the demo wallet holds in its current state. */
export const walletBalance = () => (state.wallet === "nosol" ? 0 : DEMO_WALLET.balance);

const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Changes the state and redraws whatever listens. */
export function set(patch) {
  Object.assign(state, patch);
  for (const fn of listeners) fn(state);
}

/** Saved campaigns live only in this tab (the real site keeps them in localStorage, L-16). */
export function toggleSaved(id) {
  if (state.saved.has(id)) state.saved.delete(id);
  else state.saved.add(id);
  set({});
}

/** The query string that reproduces the current switches, for links in the screens index. */
export function stateQuery(extra = {}) {
  const q = new URLSearchParams();
  if (state.wallet !== "off") q.set("wallet", state.wallet);
  for (const [k, v] of Object.entries({ paused: state.paused, stale: state.stalePrice, geo: state.geoBlocked, valve: state.valveFull }))
    if (v) q.set(k, "1");
  for (const [k, v] of Object.entries(extra)) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
}
