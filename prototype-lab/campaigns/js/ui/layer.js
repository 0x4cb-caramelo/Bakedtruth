/**
 * Purpose: what floats above a screen: the dialog (a bottom sheet on phones), the small menus anchored to a button,
 *          and toasts. The dialog traps focus, closes on Escape or on the scrim, and gives focus back to the
 *          control that opened it.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { icon, inlineIcons } from "./icons.js";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
let open = null;

/**
 * Opens a dialog. `body` is HTML; `mount(el, close)` wires it. Returns `close`. Only one at a time: a new one
 * replaces the old, as the entry flow moves from the summary to the signing state.
 */
export function dialog({ title, body, label, mount, onClose }) {
  const opener = open?.opener ?? document.activeElement;
  if (open) open.close({ restore: false });
  const scrim = document.createElement("div");
  scrim.className = "scrim";
  scrim.innerHTML = `
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div class="dialog-head">
        <h2 id="dialog-title">${title}</h2>
        <button class="icon-btn" data-close aria-label="Close">${icon("x", 18)}</button>
      </div>
      <div class="dialog-body">${body}</div>
    </section>`;
  if (label) scrim.querySelector(".dialog").setAttribute("aria-label", label);
  document.body.append(scrim);
  inlineIcons(scrim);
  document.body.style.overflow = "hidden";

  const close = ({ restore = true } = {}) => {
    scrim.remove();
    document.body.style.overflow = "";
    removeEventListener("keydown", onKey, true);
    if (open?.scrim === scrim) open = null;
    onClose?.();
    if (restore && opener?.isConnected) opener.focus();
  };
  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      const items = [...scrim.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const [first, last] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
    }
  }
  addEventListener("keydown", onKey, true);
  scrim.addEventListener("click", (e) => {
    if (e.target === scrim || e.target.closest("[data-close]")) close();
  });
  open = { scrim, close, opener };
  mount?.(scrim.querySelector(".dialog-body"), close);
  (scrim.querySelector("[autofocus]") ?? scrim.querySelector(".dialog-body " + FOCUSABLE.split(",")[1]) ?? scrim.querySelector("[data-close]")).focus();
  return close;
}

/** Closes whatever dialog is open. */
export const closeDialog = () => open?.close();

/** A menu under `anchor`. Clicking outside or pressing Escape closes it. */
export function menu(anchor, html, mount) {
  document.querySelectorAll(".menu[data-floating]").forEach((m) => m.remove());
  const el = document.createElement("div");
  el.className = "menu";
  el.dataset.floating = "";
  el.setAttribute("role", "menu");
  el.innerHTML = html;
  inlineIcons(el);
  anchor.parentElement.append(el);
  anchor.setAttribute("aria-expanded", "true");
  const close = () => {
    el.remove();
    anchor.setAttribute("aria-expanded", "false");
    removeEventListener("click", outside, true);
    removeEventListener("keydown", key, true);
  };
  const outside = (e) => !el.contains(e.target) && !anchor.contains(e.target) && close();
  const key = (e) => e.key === "Escape" && (close(), anchor.focus());
  setTimeout(() => addEventListener("click", outside, true));
  addEventListener("keydown", key, true);
  mount?.(el, close);
  el.querySelector("button, a")?.focus();
  return close;
}

/** A toast in the corner (the bottom on phones); it leaves after `ms`. Announced politely. */
export function toast(html, { kind = "info", ms = 4200 } = {}) {
  let box = document.querySelector(".toasts");
  if (!box) {
    box = document.createElement("div");
    box.className = "toasts";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    document.body.append(box);
  }
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.innerHTML = `${icon(kind === "ok" ? "check" : kind === "warn" ? "alert" : "info", 18)}<div>${html}</div>`;
  box.append(el);
  setTimeout(() => el.remove(), ms);
}
