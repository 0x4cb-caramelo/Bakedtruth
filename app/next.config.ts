/**
 * Purpose: the site's Next.js settings: the security headers and the Content-Security-Policy (Sprint 09, X2.5). The
 *          policy allows the page's own origin, the one RPC origin the browser reads from (NEXT_PUBLIC_RPC_URL), and the
 *          read API (NEXT_PUBLIC_API_URL); nothing else. No third-party script and no framing by another origin.
 * Version: 0.3.0 (Sprint 11: the build refuses an RPC URL with a key in its query or credentials, A-5)
 * Sprint:  09 (site shell, theme and wallet)
 */
import type { NextConfig } from "next";

// A-5: no client holds a paid key. NEXT_PUBLIC_* values ship in the bundle (and the re-check panel prints the RPC URL),
// so a URL carrying a key in its query or its credentials stops the build. A key hidden in a path cannot be told apart.
(() => {
  const raw = process.env.NEXT_PUBLIC_RPC_URL;
  if (!raw) return;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return;
  }
  if (url.search || url.username || url.password) {
    throw new Error("NEXT_PUBLIC_RPC_URL must not carry a key (query string or credentials): it ships to every browser");
  }
})();

const rpcOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com").origin;
  } catch {
    return "https://api.devnet.solana.com";
  }
})();
const wsOrigin = rpcOrigin.replace(/^http/, "ws");
// The read API (Sprint 08) is the site's only other origin; its address is public configuration, never a secret.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4220").origin;
  } catch {
    return "http://127.0.0.1:4220";
  }
})();

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${rpcOrigin} ${wsOrigin} ${apiOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
