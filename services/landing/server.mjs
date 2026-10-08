/**
 * Purpose: HTTP entry of the "coming soon" site (landing page, /pitch, waitlist API) and of docs.brot.markets (the
 *          docs. host, from docs-site/), bound to localhost behind the project's Cloudflare tunnel.
 * Version: 0.2.0 · Sprint: out of band (landing page), 2026-10-05; docs host 2026-10-08
 *
 * Run: `node services/landing/server.mjs`. No dependencies. Configuration comes from the environment
 * (see .env.example): PORT, HOST, SITE_ORIGIN, LEADS_FILE.
 */
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { handleLeadApi } from "./lib/api.mjs";
import { createLeadStore } from "./lib/leads.mjs";
import { createRateLimiter } from "./lib/rate-limit.mjs";
import { resolveStatic, serveStatic } from "./lib/static.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DAY_MS = 24 * 60 * 60 * 1000;
// The privacy page promises twelve months. Change the two together.
const RETENTION_MS = 365 * DAY_MS;

// The decks keep their author's inline styles, so /pitch and /pitch2 allow style attributes. Nothing else does.
const CSP_BASE =
  "default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
const CSP_SITE = `${CSP_BASE}; style-src 'self'; script-src 'self'`;
const CSP_PITCH = `${CSP_BASE}; style-src 'self' 'unsafe-inline'; script-src 'self'`;

/** True for the deck and its later versions: /pitch, /pitch2, /pitch3 and what is under them. */
function isPitch(path) {
  return /^\/pitch\d*(\/|$)/.test(path);
}

// What the docs host borrows from the site's folder: the theme script, the styles, the fonts and the images.
const SHARED = /^\/(img|fonts)\/|^\/(styles\.css|app\.js)$/;

function setSecurityHeaders(res, path, docs) {
  res.setHeader("Content-Security-Policy", isPitch(path) ? CSP_PITCH : CSP_SITE);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000");
  // The deck is reachable by link only until the founder approves each row of the redaction table in PITCH.md.
  if (isPitch(path)) res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  // The docs stay out of search engines until the founder approves them for indexing (docs/wiki/README.md).
  if (docs) res.setHeader("X-Robots-Tag", "noindex, nofollow");
}

function sendNotFound(root, req, res) {
  if (resolveStatic(root, "/404.html")) {
    serveStatic(root, req, res, "/404.html", 404);
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(req.method === "HEAD" ? undefined : "Not found");
}

/** Builds the request handler. Tests call this with a temporary folder and their own store. */
export function createApp({ root, docsRoot, store, limiter, allowedOrigins, siteOrigin, log = () => {} }) {
  const canonical = siteOrigin ? new URL(siteOrigin) : null;
  const docsHost = canonical && docsRoot ? `docs.${canonical.host}` : null;
  // The docs host answers pages from docsRoot and only the shared files from root; never the waitlist API.
  function serveDocs(req, res, path) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    if (path !== "/404.html" && serveStatic(docsRoot, req, res, path)) return;
    if (SHARED.test(path) && serveStatic(root, req, res, path)) return;
    sendNotFound(docsRoot, req, res);
  }

  return async function app(req, res) {
    let path;
    let search;
    try {
      ({ pathname: path, search } = new URL(req.url, "http://localhost"));
    } catch {
      res.writeHead(400).end();
      return;
    }
    const onDocs = docsHost !== null && req.headers.host === docsHost;
    setSecurityHeaders(res, path, onDocs);
    // One address for the site: "www" goes to the bare domain. The target is ours; only path and query are kept.
    if (canonical && req.headers.host === `www.${canonical.host}`) {
      res.writeHead(301, { Location: `${canonical.origin}${path}${search}` }).end();
      return;
    }
    try {
      if (path === "/healthz") {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
        res.end("ok");
        return;
      }
      if (onDocs) {
        serveDocs(req, res, path);
        return;
      }
      if (await handleLeadApi(req, res, path, { store, limiter, allowedOrigins, log })) return;
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, { Allow: "GET, HEAD" }).end();
        return;
      }
      // The earlier decks are kept in history/, not served (founder, 2026-10-08). Links already sent to /pitch2,
      // /pitch3 or /pitch4 land on the current deck. Temporary on purpose: browsers do not keep a 302.
      if (/^\/pitch[2-9]\d*(\/|$)/.test(path)) {
        res.writeHead(302, { Location: "/pitch/" }).end();
        return;
      }
      if (path !== "/404.html" && serveStatic(root, req, res, path)) return;
      sendNotFound(root, req, res);
    } catch (error) {
      // The visitor gets no detail; the log gets the message, which never includes a request body.
      log(`request failed: ${error instanceof Error ? error.message : "unknown error"}`);
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Something went wrong");
    }
  };
}

function start() {
  const port = Number(process.env.PORT ?? 4200);
  const host = process.env.HOST ?? "127.0.0.1";
  const siteOrigin = process.env.SITE_ORIGIN ?? `http://localhost:${port}`;
  const leadsFile = process.env.LEADS_FILE ?? join(HERE, "data", "leads.jsonl");
  const log = (message) => console.log(`${new Date().toISOString()} ${message}`);

  const store = createLeadStore(leadsFile);
  const purge = () => {
    const removed = store.purgeOlderThan(RETENTION_MS);
    if (removed) log(`retention: ${removed} lead(s) older than twelve months deleted (total ${store.count()})`);
  };
  purge();
  setInterval(purge, DAY_MS).unref();

  const app = createApp({
    root: join(HERE, "public"),
    docsRoot: join(HERE, "docs-site"),
    store,
    limiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    allowedOrigins: [siteOrigin, `http://${host}:${port}`, `http://localhost:${port}`],
    siteOrigin,
    log,
  });
  const server = createServer(app);
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.listen(port, host, () => log(`landing listening on http://${host}:${port} for ${siteOrigin}`));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) start();
