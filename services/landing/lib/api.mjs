/**
 * Purpose: the two waitlist endpoints of the "coming soon" site: join (POST /api/leads) and leave (/api/leads/remove).
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 *
 * Every input is checked here, whatever the form already checked in the browser. Joining twice and leaving a list
 * you were never on both answer "ok", so the endpoint cannot be used to find out whether an address is listed.
 */
import { normalizeEmail } from "./leads.mjs";

const MAX_BODY_BYTES = 2048;
const ROUTES = new Set(["/api/leads", "/api/leads/remove"]);

function send(res, status, body, headers = {}) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(text),
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(text);
}

/** Reads a small JSON body. Resolves to { tooLarge: true }, { invalid: true } or { value }. */
function readJson(req) {
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      resolve(result);
    };
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        finish({ tooLarge: true });
        return;
      }
      chunks.push(chunk);
    });
    req.on("error", () => finish({ invalid: true }));
    req.on("end", () => {
      try {
        const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        finish(value && typeof value === "object" && !Array.isArray(value) ? { value } : { invalid: true });
      } catch {
        finish({ invalid: true });
      }
    });
  });
}

/** The visitor's address as Cloudflare reports it. Used only as the limiter's key; never stored or logged. */
function visitorKey(req) {
  const fromEdge = req.headers["cf-connecting-ip"];
  return (typeof fromEdge === "string" && fromEdge) || req.socket.remoteAddress || "unknown";
}

/** Handles the waitlist routes. Returns false for any other path, so the caller can try static files. */
export async function handleLeadApi(req, res, path, { store, limiter, allowedOrigins, log = () => {} }) {
  if (!ROUTES.has(path)) return false;
  if (req.method !== "POST") {
    send(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
    return true;
  }
  // A browser always sends Origin on a POST. A page on another site cannot submit this form for a visitor.
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    send(res, 403, { error: "forbidden_origin" });
    return true;
  }
  if (!String(req.headers["content-type"] ?? "").startsWith("application/json")) {
    send(res, 415, { error: "json_required" });
    return true;
  }
  if (!limiter.allow(visitorKey(req))) {
    send(res, 429, { error: "too_many_requests" }, { "Retry-After": "60" });
    return true;
  }
  const body = await readJson(req);
  if (body.tooLarge) {
    send(res, 413, { error: "too_large" }, { Connection: "close" });
    return true;
  }
  if (body.invalid) {
    send(res, 400, { error: "invalid_json" });
    return true;
  }
  // "company" is a field no person sees. A filled one is a bot: answer ok and keep nothing.
  if (typeof body.value.company === "string" && body.value.company.trim() !== "") {
    send(res, 200, { ok: true });
    return true;
  }
  const email = normalizeEmail(body.value.email);
  if (!email) {
    send(res, 400, { error: "invalid_email" });
    return true;
  }
  if (path === "/api/leads/remove") {
    if (store.remove(email)) log(`lead removed (total ${store.count()})`);
    send(res, 200, { ok: true });
    return true;
  }
  if (body.value.consent !== true) {
    send(res, 400, { error: "consent_required" });
    return true;
  }
  const result = store.add(email);
  if (result === "full") {
    log("waitlist is full; lead refused");
    send(res, 503, { error: "waitlist_closed" });
    return true;
  }
  if (result === "added") log(`lead added (total ${store.count()})`);
  send(res, 200, { ok: true });
  return true;
}
