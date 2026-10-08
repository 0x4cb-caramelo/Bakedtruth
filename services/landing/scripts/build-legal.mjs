/**
 * Purpose: builds public/terms.html and public/privacy.html from docs/legal/TERMS-OF-SERVICE.md and PRIVACY-POLICY.md,
 *          the reviewed texts. Edit those files, then run `node services/landing/scripts/build-legal.mjs`; the page
 *          tests fail when a page and its text disagree. Reads only the small Markdown those two files use.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-08
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const LINKS = { "PRIVACY-POLICY.md": "/privacy", "TERMS-OF-SERVICE.md": "/terms" };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
      const url = LINKS[href] ?? href;
      return /^https?:/.test(url) ? `<a href="${url}" rel="noopener">${text}</a>` : `<a href="${url}">${text}</a>`;
    });

function convert(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const block = (test) => {
    const taken = [];
    while (i < lines.length && test(lines[i])) taken.push(lines[i++]);
    return taken;
  };
  while (i < lines.length) {
    const line = lines[i];
    const heading = line.match(/^(#{1,3}) (.+)$/);
    const simple = !line.trim()
      ? ""
      : heading
        ? `<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`
        : line === "---"
          ? "<hr />"
          : null;
    if (simple !== null) {
      if (simple) out.push(simple);
      i++;
      continue;
    }
    if (line.startsWith(">")) {
      const text = block((l) => l.startsWith(">"))
        .map((l) => l.replace(/^>\s?/, ""))
        .join(" ");
      out.push(`<p class="crumb">${inline(text)}</p>`);
      continue;
    }
    if (line.startsWith("|")) {
      const rows = block((l) => l.startsWith("|")).filter((l) => !/^\|[\s|:-]+\|$/.test(l));
      const cells = (l) =>
        l
          .slice(1, -1)
          .split("|")
          .map((c) => inline(c.trim()));
      const [head, ...body] = rows;
      out.push(
        `<div class="table"><table><thead><tr>${cells(head)
          .map((c) => `<th>${c}</th>`)
          .join("")}</tr></thead><tbody>` +
          body
            .map(
              (r) =>
                `<tr>${cells(r)
                  .map((c) => `<td>${c}</td>`)
                  .join("")}</tr>`,
            )
            .join("") +
          "</tbody></table></div>",
      );
      continue;
    }
    const listItem = /^(- |\d+\. )/;
    if (listItem.test(line)) {
      const ordered = /^\d/.test(line);
      const items = [];
      while (i < lines.length && (listItem.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        if (listItem.test(lines[i])) items.push(lines[i].replace(listItem, ""));
        else items[items.length - 1] += " " + lines[i].trim();
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</${tag}>`);
      continue;
    }
    const para = block((l) => l.trim() && !/^(#|>|\||- |\d+\. |---$)/.test(l));
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pages = [
  {
    md: "docs/legal/TERMS-OF-SERVICE.md",
    out: "terms.html",
    title: "Terms of Service",
    description:
      "The rules of Brot Markets, short and in plain English: who can use it, how markets work and are decided, fees, and what we control.",
    img: "baked-terms.webp",
    alt: "Baked, the Brot Markets bread roll, holding a checklist",
  },
  {
    md: "docs/legal/PRIVACY-POLICY.md",
    out: "privacy.html",
    title: "Privacy Policy",
    description:
      "What Brot Markets keeps about you, why, for how long, and how to leave. Short, because we keep almost nothing.",
    img: "baked-privacy.webp",
    alt: "Baked, the Brot Markets bread roll, behind a shield with a padlock",
  },
];
const LEAVE = `<h3 id="leave">Leave the waitlist</h3>
<p>Type the address you used. It is deleted at once, with no confirmation email and no questions.</p>
<form class="join" data-leave novalidate>
  <label for="email">Email to delete</label>
  <div class="join-row">
    <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
    <button class="cta" type="submit"><span>Delete my email</span></button>
  </div>
  <p class="form-msg" data-join-msg role="alert" aria-live="polite"></p>
</form>`;

for (const p of pages) {
  let body = convert(readFileSync(`${repo}/${p.md}`, "utf8"));
  const updated = body.match(/<p><strong>Brot Markets<\/strong> · (Last updated: [^<]+)<\/p>/);
  if (!updated) throw new Error(`no date line in ${p.md}`);
  body = body.replace(`<h1>${p.title}</h1>\n`, "").replace(updated[0], "");
  body = body.replace(/^\n+/, "");
  if (p.out === "privacy.html") {
    if (!body.includes("<h2>6. Security</h2>")) throw new Error("privacy: no section 6");
    body = body.replace("<h2>6. Security</h2>", `${LEAVE}\n<h2>6. Security</h2>`);
    body = body.replace("type your email at brot.markets/privacy", 'type your email <a href="#leave">below</a>');
  }
  const html = `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${p.title} — Brot Markets</title>
    <meta name="description" content="${p.description}" />
    <link rel="canonical" href="https://brot.markets/${p.out.replace(".html", "")}" />
    <link rel="icon" type="image/png" href="img/favicon.png" />
    <script src="app.js?v=2"></script>
    <link rel="stylesheet" href="styles.css?v=3" />
  </head>
  <body>
    <header class="top">
      <div class="wrap">
        <a class="brand" href="/" aria-label="Brot Markets, home">
          <img src="img/baked-deadpan.webp" alt="" width="58" height="37" />
          <span>brot<b>.markets</b></span>
        </a>
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

    <main>
      <!-- Generated from ${p.md}, the reviewed text. Edit that file and run services/landing/scripts/build-legal.mjs. -->
      <article class="wrap doc legal">
        <div class="doc-hero">
          <img src="img/${p.img}" alt="${p.alt}" width="140" height="140" />
          <div>
            <h1>${p.title}</h1>
            <p class="meta">${updated[1]}</p>
          </div>
        </div>
${body}
      </article>
    </main>

    <footer>
      <div class="wrap">
        <p>Brot Markets is in a test phase on Solana devnet, with test tokens. The program is not audited.</p>
        <nav aria-label="Footer">
          <a href="/">Home</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="https://x.com/brotmarkets" rel="noopener">X</a>
          <span>© 2026 Brot Markets</span>
        </nav>
      </div>
    </footer>
  </body>
</html>
`;
  writeFileSync(`${repo}/services/landing/public/${p.out}`, html);
  console.log(p.out, html.length, "bytes");
}
