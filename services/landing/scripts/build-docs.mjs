/**
 * Purpose: builds docs.brot.markets (services/landing/docs-site/*.html) from the pages in docs/wiki/, the reviewed
 *          text. Edit a page there, or the menu below, then run `node services/landing/scripts/build-docs.mjs`; the docs
 *          tests fail when a page and its text disagree. A link to a .md page that is not in the menu stops the build.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-08
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { layout } from "./docs-layout.mjs";
import { convert, frontmatter, inline } from "./markdown.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const WIKI = join(repo, "docs", "wiki");
const OUT = join(repo, "services", "landing", "docs-site");

/** The menu, in reading order. Each page is a file under docs/wiki/, without ".md". */
const SECTIONS = [
  {
    title: "Start here",
    pages: ["start-here/what-is-brot", "start-here/why-the-chain-decides", "start-here/where-we-are"],
  },
  {
    title: "How it works",
    pages: ["how-it-works/the-pot", "how-it-works/life-of-a-market", "how-it-works/how-a-market-is-decided"],
  },
  { title: "Markets", pages: ["market-types"] },
];
const LEGAL = {
  title: "Legal",
  items: [
    { title: "Terms of Service", href: "https://brot.markets/terms" },
    { title: "Privacy Policy", href: "https://brot.markets/privacy" },
  ],
};

const pages = SECTIONS.flatMap((s) =>
  s.pages.map((id) => {
    const source = `docs/wiki/${id}.md`;
    const { meta, body } = frontmatter(readFileSync(join(WIKI, `${id}.md`), "utf8"));
    if (!meta.title || !meta.description) throw new Error(`${source}: title and description are required`);
    const bite = body.match(/^> \*\*In one bite:\*\* ([\s\S]*?)\n\n/m);
    if (!bite) throw new Error(`${source}: no "In one bite" line`);
    return { id, source, href: `/${id}`, body, ...meta, bite: bite[1].replace(/\n> ?/g, " ") };
  }),
);
const ids = new Set(pages.map((p) => p.id));
const nav = [
  ...SECTIONS.map((s) => ({ title: s.title, items: s.pages.map((id) => pages.find((p) => p.id === id)) })),
  LEGAL,
];

/** Turns "../how-it-works/the-pot.md" on page "start-here/x" into "/how-it-works/the-pot". */
function linkFrom(id) {
  return (href) => {
    if (/^https?:|^#/.test(href)) return href;
    const [file, hash = ""] = href.split("#");
    const target = posix.normalize(posix.join(posix.dirname(id), file)).replace(/\.md$/, "");
    if (!ids.has(target)) throw new Error(`docs/wiki/${id}.md links to ${href}, which is not in the menu`);
    return `/${target}${hash ? `#${hash}` : ""}`;
  };
}

const write = (file, html) => {
  mkdirSync(dirname(join(OUT, file)), { recursive: true });
  writeFileSync(join(OUT, file), html);
  console.log(file, html.length, "bytes");
};

pages.forEach((p, n) => {
  const body = convert(p.body, { link: linkFrom(p.id), ids: true });
  const html = layout({ ...p, nav, body, prev: pages[n - 1], next: pages[n + 1], generatedFrom: p.source });
  write(`${p.id}.html`, html);
});

const cards = SECTIONS.map(
  (s) =>
    `<h2>${s.title}</h2>\n<div class="docs-cards">` +
    s.pages
      .map((id) => pages.find((p) => p.id === id))
      .map(
        (p) =>
          `<a class="docs-card" href="${p.href}"><strong>${p.title}</strong><span>${inline(p.bite[0].toUpperCase() + p.bite.slice(1))}</span></a>`,
      )
      .join("") +
    "</div>",
).join("\n");
const home = `<div class="doc-hero">
  <img src="/img/baked-point.webp" alt="Baked, the Brot Markets bread roll, pointing the way" width="140" height="140" />
  <div>
    <h1>Brot Markets docs</h1>
    <p class="meta">How Brot Markets works, in plain English. The serious part, with a few crumbs.</p>
  </div>
</div>
<p class="crumb"><strong>Where we are:</strong> markets aren't open yet. The first ones open on Solana devnet, with
test USDC worth nothing, and the program is not audited. <a href="/start-here/where-we-are">More on that</a>.</p>
${cards}`;
write(
  "index.html",
  layout({
    title: "Brot Markets docs",
    description: "How Brot Markets works: the pot, how markets are decided by on-chain data, and the market types.",
    href: "/",
    nav,
    body: home,
    next: pages[0],
    generatedFrom: "docs/wiki/ (the menu in build-docs.mjs)",
  }),
);
write(
  "404.html",
  layout({
    title: "Page not found",
    description: "This page isn't in the Brot Markets docs.",
    href: "/404",
    nav,
    body: `<h1>Not baked yet</h1>\n<p>There's no page here. Baked looked twice. Try the <a href="/">docs home</a>.</p>`,
    generatedFrom: "services/landing/scripts/build-docs.mjs",
  }),
);
