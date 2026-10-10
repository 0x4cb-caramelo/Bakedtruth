/**
 * Purpose: the installable PWA, manifest only (Sprint 13 DoD, S2; TP §3.6): the name, the start page, standalone
 *          display, the dark theme's colours and the icons scripts/pwa-icons.ts draws. No service worker, which would
 *          bring back the stale-file problem the landing already hit (commit 8e4684d): an installed site loads the
 *          network's current files every time. Served from the site's own origin (the CSP's default-src 'self').
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import type { MetadataRoute } from "next";

import { BRAND } from "@/lib/brand";

/** The dark theme's page colour (app/styles/tokens.css, `--bg`); dark is the default theme. */
const DARK = "#10141b";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "Brot",
    description: `${BRAND.tagline}. Devnet: test SOL only.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: DARK,
    theme_color: DARK,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
