/**
 * Purpose: serves the Sprint -1 campaign screens under /dev0x/ (the team's preview, unlisted: noindex, no link from the
 *          site) from prototype-lab/campaigns, with a CSP that allows only what that prototype uses.
 * Version: 0.1.0 · Sprint: -1 (design system preview for the team), 2026-10-10
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveStatic, serveStatic } from "./static.mjs";

export const PREFIX = "/dev0x";

/** True for /dev0x and everything under it. */
export function isCampaigns(path) {
  return path === PREFIX || path.startsWith(`${PREFIX}/`);
}

/**
 * The prototype's one inline script (the theme, before first paint) is allowed by its hash, so scripts need no
 * 'unsafe-inline'. Styles come from its files; only the style attributes its code writes are inline. Nothing is
 * fetched from another origin: the links out are plain navigations, which this policy does not restrict. The screens
 * index and the share card frame the prototype's own pages, so it may frame itself ('self'), and no one else may.
 */
export function campaignsCsp(root) {
  let hash = "";
  try {
    const html = readFileSync(join(root, "index.html"), "utf8");
    const inline = html.match(/<script>([\s\S]*?)<\/script>/);
    if (inline) hash = ` 'sha256-${createHash("sha256").update(inline[1]).digest("base64")}'`;
  } catch {
    // No index.html: the route answers 404 anyway, and the tests fail if the hash goes missing.
  }
  return [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    `script-src 'self'${hash}`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
  ].join("; ");
}

/**
 * Answers /dev0x and the files under it. The prototype's links are relative, so /dev0x goes to /dev0x/ (302) and a
 * folder without its slash goes to the slash (308). Paths are checked by resolveStatic, which keeps them under root.
 */
export function serveCampaigns(req, res, path, root) {
  if (path === PREFIX) {
    res.writeHead(302, { Location: `${PREFIX}/` }).end();
    return;
  }
  const rest = path.slice(PREFIX.length);
  const found = resolveStatic(root, rest);
  if (found?.redirect) {
    res.writeHead(308, { Location: `${PREFIX}${found.redirect}` }).end();
    return;
  }
  if (!serveStatic(root, req, res, rest)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(req.method === "HEAD" ? undefined : "Not found");
  }
}
