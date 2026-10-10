/**
 * Purpose: the site's Next.js settings: the security headers and the Content-Security-Policy (Sprint 09, X2.5). The
 *          policy allows the page's own origin and the one RPC origin the browser reads from (NEXT_PUBLIC_RPC_URL);
 *          nothing else. No third-party script and no framing by another origin.
 * Version: 0.2.0
 * Sprint:  09 (site shell, theme and wallet)
 */
import type { NextConfig } from "next";

const rpcOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com").origin;
  } catch {
    return "https://api.devnet.solana.com";
  }
})();
const wsOrigin = rpcOrigin.replace(/^http/, "ws");

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${rpcOrigin} ${wsOrigin}`,
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
