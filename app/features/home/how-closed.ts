/**
 * Purpose: whether this browser closed the home page's "How it works" (a per-viewer convenience, kept in localStorage
 *          like the theme): the storage key, the script that marks <html> before the first paint, so a closed block
 *          never flashes in and out for a returning visitor, and the close itself. The page renders the block for
 *          everyone and cards.css hides it under the mark, so the server and the browser never disagree. Storage can
 *          throw (private windows, blocked site data): the block then closes for this page only. Every step stays at
 *          /how-it-works, in the top bar.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), the home page's polish after the UI overhaul
 */
export const HOW_KEY = "brot-home-how";
export const HOW_ATTR = "data-home-how";
export const HOW_CLOSED = "closed";

/** Inline script for <head>: marks <html> when this browser closed "How it works"; anything else leaves it open. */
export const HOW_HEAD_SCRIPT = `(function(){try{if(localStorage.getItem("${HOW_KEY}")==="${HOW_CLOSED}")document.documentElement.setAttribute("${HOW_ATTR}","${HOW_CLOSED}");}catch(e){}})();`;

/** Hides the block now and remembers it; a failed write still hides it until the page reloads. */
export function closeHow(): void {
  document.documentElement.setAttribute(HOW_ATTR, HOW_CLOSED);
  try {
    window.localStorage.setItem(HOW_KEY, HOW_CLOSED);
  } catch {
    // Storage is blocked: the block stays closed until the page reloads.
  }
}
