"use client";
// Purpose: the theme switch (dark by default). It flips data-theme, saves the choice in localStorage under brot-theme,
// and does nothing else. The state is read from the attribute the head script set, so the server and the first
// render agree on "dark". Storage can be blocked, so every access is guarded. Sprint -1, TP §3.6.
import { useSyncExternalStore } from "react";
import { THEME_KEY } from "@/lib/theme";

type Theme = "dark" | "light";

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);

  function flip() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage blocked: the switch still works for this page view.
    }
  }

  const label = theme === "dark" ? "Switch to the light theme" : "Switch to the dark theme";
  return (
    <button
      type="button"
      onClick={flip}
      aria-label={label}
      title={label}
      className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-(--r-sm) border border-(--field-line) text-(--muted) hover:text-(--text)"
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
