/**
 * Purpose: writes the PWA's icons (Sprint 13 DoD, S2: the manifest and its icons, no service worker) from the mascot's
 *          deadpan pose on the dark theme's page colour: 192 and 512 px for the manifest, a 512 px maskable one with the
 *          mascot inside the safe zone, and the 180 px apple-icon for an iPhone's home screen. Drawn by the web smoke's
 *          pinned Chromium (@playwright/test 1.63.0), so it runs again the same way; the PNGs are committed.
 * Version: 0.1.1 (the brand's dark page colour, 2026-10-10)
 * Sprint:  13 (site: ranking, notices and copy)
 *
 * Run: bun run scripts/pwa-icons.ts
 */
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

/** The dark theme's page colour (app/styles/tokens.css, `--bg`). */
export const ICON_BACKGROUND = "#10151c";
const POSE = `data:image/png;base64,${readFileSync("app/public/mascot/deadpan.png").toString("base64")}`;

/** `inset` is the share of the side the mascot may fill: a maskable icon keeps it inside the central 80% safe zone. */
const ICONS = [
  { file: "app/public/icons/icon-192.png", size: 192, inset: 0.92 },
  { file: "app/public/icons/icon-512.png", size: 512, inset: 0.92 },
  { file: "app/public/icons/icon-maskable-512.png", size: 512, inset: 0.66 },
  { file: "app/app/apple-icon.png", size: 180, inset: 0.86 },
];

const browser = await chromium.launch();
try {
  for (const icon of ICONS) {
    const page = await browser.newPage({ viewport: { width: icon.size, height: icon.size } });
    const width = Math.round(icon.size * icon.inset);
    await page.setContent(
      `<body style="margin:0;width:${icon.size}px;height:${icon.size}px;display:grid;place-items:center;background:${ICON_BACKGROUND}">` +
        `<img src="${POSE}" style="width:${width}px;image-rendering:pixelated"></body>`,
    );
    await page.screenshot({ path: icon.file, omitBackground: false });
    await page.close();
    console.log(`wrote ${icon.file}`);
  }
} finally {
  await browser.close();
}
