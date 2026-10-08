/**
 * Purpose: the HTML around each page of docs.brot.markets: header, side menu (a drop-down on phones), previous and
 *          next links, footer. build-docs.mjs fills it. Styles: public/styles.css (the site's) plus docs-site/docs.css.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-08
 */
export const ORIGIN = "https://docs.brot.markets";

function menu(nav, current) {
  return nav
    .map(
      (section) =>
        `<p class="docs-nav-h">${section.title}</p><ul>` +
        section.items
          .map((it) => {
            const here = it.href === current ? ' aria-current="page"' : "";
            const ext = /^https?:/.test(it.href) ? ' rel="noopener"' : "";
            return `<li><a href="${it.href}"${here}${ext}>${it.title}</a></li>`;
          })
          .join("") +
        "</ul>",
    )
    .join("\n");
}

function step(page, label) {
  if (!page) return "<span></span>";
  return `<a class="docs-step" href="${page.href}"><small>${label}</small>${page.title}</a>`;
}

/** One whole document. `href` is the page's own path ("/" for the home page). */
export function layout({ title, description, href, nav, body, prev, next, generatedFrom }) {
  const list = menu(nav, href);
  const steps =
    prev || next
      ? `<nav class="docs-steps" aria-label="Previous and next">${step(prev, "Previous")}${step(next, "Next")}</nav>`
      : "";
  return `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title === "Brot Markets docs" ? title : `${title} — Brot Markets docs`}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${ORIGIN}${href}" />
    <link rel="icon" type="image/png" href="/img/favicon.png" />
    <script src="/app.js?v=2"></script>
    <link rel="stylesheet" href="/styles.css?v=3" />
    <link rel="stylesheet" href="/docs.css?v=1" />
  </head>
  <body>
    <header class="top">
      <div class="wrap">
        <a class="brand" href="/" aria-label="Brot Markets docs, home">
          <img src="/img/baked-deadpan.webp" alt="" width="58" height="37" />
          <span>brot<b>.markets</b></span>
          <em class="docs-tag">docs</em>
        </a>
        <a class="top-link" href="https://brot.markets" rel="noopener">brot.markets</a>
        <button class="theme" type="button" data-theme-toggle aria-label="Switch to the dark theme">
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke-linejoin="round" />
          </svg>
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>
      </div>
    </header>

    <main class="wrap docs-grid">
      <!-- Generated from ${generatedFrom}. Edit the text there and run services/landing/scripts/build-docs.mjs. -->
      <nav class="docs-nav" aria-label="Documentation">
${list}
      </nav>
      <details class="docs-menu">
        <summary>Contents</summary>
${list}
      </details>
      <article class="doc legal docs-page">
${body}
${steps}
      </article>
    </main>

    <footer>
      <div class="wrap">
        <p>Brot Markets is in a test phase on Solana devnet, with test tokens. The program is not audited.</p>
        <nav aria-label="Footer">
          <a href="https://brot.markets" rel="noopener">brot.markets</a>
          <a href="https://brot.markets/terms" rel="noopener">Terms</a>
          <a href="https://brot.markets/privacy" rel="noopener">Privacy</a>
          <a href="https://x.com/brotmarkets" rel="noopener">X</a>
          <span>© 2026 Brot Markets</span>
        </nav>
      </div>
    </footer>
  </body>
</html>
`;
}
