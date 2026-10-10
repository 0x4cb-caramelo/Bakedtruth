/**
 * Purpose: the site's Next.js settings: the security headers and the Content-Security-Policy (Sprint 09, X2.5). The
 *          policy allows the page's own origin, the one RPC origin the browser reads from (NEXT_PUBLIC_RPC_URL), and the
 *          read API (NEXT_PUBLIC_API_URL); nothing else. No third-party script and no framing by another origin. And
 *          A-8: the program deploy a build is for, baked into the bundle as NEXT_PUBLIC_PROGRAM_DEPLOY_SLOT.
 * Version: 0.4.0 (Sprint 11: A-8's deploy slot; the build refuses an RPC URL with a key, A-5)
 * Sprint:  09 (site shell, theme and wallet)
 */
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import { deploySlotFrom, readProgramDeploy, rpcFor } from "@brot/sdk/read";

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
    throw new Error(
      "NEXT_PUBLIC_RPC_URL must not carry a key (query string or credentials): it ships to every browser",
    );
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

/**
 * A-8: the program deploy (ProgramData's slot) this build is for. Given in NEXT_PUBLIC_PROGRAM_DEPLOY_SLOT, or read once
 * through the site's RPC when the site is built or served in development (the build's workers load this file again and
 * find it in the environment). A failed read leaves it empty: that build does not sign until it is built again. Build
 * the site again after every program upgrade; until then the old bundle pauses signing.
 */
async function deploySlot(phase: string): Promise<string> {
  const given = process.env.NEXT_PUBLIC_PROGRAM_DEPLOY_SLOT;
  if (given !== undefined) return deploySlotFrom(given) === null ? "" : given;
  if (phase !== PHASE_PRODUCTION_BUILD && phase !== PHASE_DEVELOPMENT_SERVER) return "";
  let slot = "";
  try {
    slot = (
      await readProgramDeploy(rpcFor(process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com"))
    ).slot.toString();
    console.log(`A-8: this build is for the program deploy at slot ${slot}`);
  } catch (error) {
    console.warn(
      `A-8: the program's deploy could not be read (${error instanceof Error ? error.name : "error"}); this build will not sign`,
    );
  }
  process.env.NEXT_PUBLIC_PROGRAM_DEPLOY_SLOT = slot;
  return slot;
}

export default async function config(phase: string): Promise<NextConfig> {
  return { ...nextConfig, env: { NEXT_PUBLIC_PROGRAM_DEPLOY_SLOT: await deploySlot(phase) } };
}
