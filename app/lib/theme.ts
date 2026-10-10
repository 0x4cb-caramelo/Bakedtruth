/**
 * Purpose: the site's theme: the storage key, the script that sets data-theme before the first paint, and the reads and
 *          writes the theme button needs. Dark is the default and is used whenever the stored value is missing,
 *          unreadable or not a known theme. Storage can throw (private windows, blocked site data), so every access
 *          is guarded.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */

export const THEME_KEY = "brot-theme";
export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "dark";

export const isTheme = (value: unknown): value is Theme => value === "dark" || value === "light";

/** Inline script for <head>, before the stylesheet: sets data-theme on <html> from the stored choice, dark otherwise. */
export const THEME_HEAD_SCRIPT = `(function(){var t="${DEFAULT_THEME}";try{var s=localStorage.getItem("${THEME_KEY}");if(s==="light"||s==="dark")t=s;}catch(e){}document.documentElement.setAttribute("data-theme",t);})();`;

/** The stored theme, or the default when storage is missing or throws. */
export function readStoredTheme(): Theme {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return isTheme(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Applies a theme to <html> and remembers it; a failed write still applies the theme for this page. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage is blocked: the choice lasts until the page reloads.
  }
}
