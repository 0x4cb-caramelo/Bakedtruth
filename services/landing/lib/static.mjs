/**
 * Purpose: serves the files under public/ for the "coming soon" site, with clean URLs and no way out of that folder.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 */
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const WEEK = 60 * 60 * 24 * 7;
const YEAR = 60 * 60 * 24 * 365;

function cacheFor(ext) {
  if (ext === ".woff2") return `public, max-age=${YEAR}, immutable`;
  if (ext === ".webp" || ext === ".png" || ext === ".svg") return `public, max-age=${WEEK}`;
  // Pages, styles and scripts change with each deploy and are small: always revalidate.
  return "no-cache";
}

function fileAt(path) {
  try {
    const stat = statSync(path);
    return stat.isFile() ? stat : null;
  } catch {
    return null;
  }
}

/**
 * Maps a URL path to a file under `root`. Returns { redirect } for a folder asked without the final slash,
 * { path, stat } for a file, or null when nothing matches or the path tries to leave the folder.
 */
export function resolveStatic(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes("\0") || decoded.includes("\\")) return null;
  const target = normalize(join(root, decoded));
  if (target !== root && !target.startsWith(root + sep)) return null;

  if (decoded.endsWith("/")) {
    const index = join(target, "index.html");
    const stat = fileAt(index);
    return stat ? { path: index, stat } : null;
  }
  const direct = fileAt(target);
  if (direct) return { path: target, stat: direct };
  // "/privacy" answers with privacy.html; "/pitch" is a folder and goes to "/pitch/" so relative assets resolve.
  const page = fileAt(`${target}.html`);
  if (page) return { path: `${target}.html`, stat: page };
  if (fileAt(join(target, "index.html"))) {
    // Built from the validated location, never from the text the visitor sent: exactly one leading slash, so the
    // answer cannot point at another host ("//example.com/").
    const parts = target.slice(root.length).split(sep).filter(Boolean);
    return { redirect: `/${parts.map(encodeURIComponent).join("/")}/` };
  }
  return null;
}

/**
 * Answers GET and HEAD for a static file. Returns false when the path is not a file, so the caller sends the 404.
 * `status` lets the caller serve the not-found page with its own code.
 */
export function serveStatic(root, req, res, urlPath, status = 200) {
  const found = resolveStatic(root, urlPath);
  if (!found) return false;
  if (found.redirect) {
    res.writeHead(308, { Location: found.redirect });
    res.end();
    return true;
  }
  const ext = extname(found.path);
  const modified = found.stat.mtime.toUTCString();
  if (status === 200 && req.headers["if-modified-since"] === modified) {
    res.writeHead(304);
    res.end();
    return true;
  }
  res.writeHead(status, {
    "Content-Type": TYPES[ext] ?? "application/octet-stream",
    "Content-Length": found.stat.size,
    "Cache-Control": cacheFor(ext),
    "Last-Modified": modified,
  });
  if (req.method === "HEAD") {
    res.end();
    return true;
  }
  createReadStream(found.path).pipe(res);
  return true;
}
