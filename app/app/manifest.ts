/**
 * Purpose: the installable PWA, manifest only (Sprint 13 DoD, S2; TP §3.6): the name, the start page, standalone
 *          display, the dark theme's colours and the icons scripts/pwa-icons.ts draws. No service worker, which would
 *          bring back the stale-file problem the landing already hit (commit 8e4684d): an installed site loads the
 *          network's current files every time. Served from the site's own origin (the CSP's default-src 'self').
 * Version: 0.1.2 (the start page, scope and icons under the base path; 0.1.1, the brand's dark page colour)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import type { MetadataRoute } from "next";

import { asset, BASE_PATH } from "@/lib/base-path";
import { BRAND } from "@/lib/brand";

/** The dark theme's page colour (app/styles/tokens.css, `--bg`); dark is the default theme. */
const DARK = "#10151c";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "Brot",
    description: `${BRAND.tagline}. Devnet: test SOL only.`,
    // Under the base path the site is served from (/dev0x on brot.markets), never the domain's root, which is the landing.
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: DARK,
    theme_color: DARK,
    icons: [
      { src: asset("/icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: asset("/icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: asset("/icons/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
