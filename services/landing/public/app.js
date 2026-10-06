/**
 * Purpose: browser script of the "coming soon" site: picks the theme before first paint and sends the waitlist forms.
 *          The mascot is a separate script, mascot.js.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 *
 * Theme rule, from docs/product/DESIGN-DIRECTION.md: ?theme=dark|light wins, then the stored choice, then light.
 * The only thing kept in the browser is that choice ("baked-theme"). No cookie, no analytics.
 */
(function () {
  const root = document.documentElement;
  const THEME_KEY = "baked-theme";

  function storedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }
  const asked = new URLSearchParams(location.search).get("theme");
  root.dataset.theme = (asked || storedTheme()) === "dark" ? "dark" : "light";

  const MESSAGES = {
    invalid_email: "That doesn't look like an email address.",
    too_many_requests: "Too many tries. Wait a minute and try again.",
    waitlist_closed: "The list is closed for now. Follow @brotmarkets on X instead.",
    fallback: "Couldn't save that. Try again in a moment.",
  };

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok === true, error: data.error };
  }

  function wireTheme() {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    const label = () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      button.setAttribute("aria-label", `Switch to the ${next} theme`);
      button.title = `Switch to the ${next} theme`;
    };
    label();
    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, root.dataset.theme);
      } catch {
        // Private mode: the choice lasts for this page only.
      }
      label();
    });
  }

  /** Wires one form. `path` is the endpoint; `onDone` runs after the server confirmed. */
  function wireForm(form, path, onDone) {
    const message = form.querySelector("[data-join-msg]");
    const button = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();
      message.classList.remove("ok");
      if (!email.includes("@")) {
        message.textContent = MESSAGES.invalid_email;
        return;
      }
      button.disabled = true;
      message.textContent = "";
      try {
        const body = { email, consent: true, company: String(data.get("company") || "") };
        const result = await postJson(path, body);
        if (result.ok) onDone(form, message);
        else message.textContent = MESSAGES[result.error] || MESSAGES.fallback;
      } catch {
        message.textContent = MESSAGES.fallback;
      } finally {
        button.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireTheme();
    const join = document.querySelector("form[data-join]");
    if (join) {
      wireForm(join, "/api/leads", (form) => {
        const done = document.querySelector("[data-joined]");
        form.hidden = true;
        done.hidden = false;
        done.focus();
        // The mascot (mascot.js) listens for this and approves.
        document.dispatchEvent(new CustomEvent("baked:say", { detail: "Fine. You're in." }));
      });
    }
    const leave = document.querySelector("form[data-leave]");
    if (leave) {
      wireForm(leave, "/api/leads/remove", (form, message) => {
        form.reset();
        message.classList.add("ok");
        message.textContent = "Done. If that address was on the list, it has been deleted.";
      });
    }
  });
})();
