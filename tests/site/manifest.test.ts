/**
 * Purpose: the PWA is the manifest and its icons only (Sprint 13 DoD, S2): the manifest names the site, opens at "/"
 *          standalone in the dark theme's colour, and lists icons that exist at the sizes it says; no service worker is
 *          registered anywhere in the site. Filter: `bun test tests/ -t "pwa manifest only"`.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;

/** A PNG's width and height, from its IHDR chunk. */
function pngSize(file: string): string {
  const bytes = readFileSync(file);
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

describe("pwa manifest only", () => {
  test("the manifest opens the site standalone, dark, with icons that exist at their stated sizes", async () => {
    const manifest = (await import(site("app/manifest.ts"))).default();
    expect(manifest).toMatchObject({ name: "Brot Markets", start_url: "/", display: "standalone" });
    expect(manifest.theme_color).toBe("#10141b");
    expect(readFileSync(site("styles/tokens.css"), "utf8")).toContain(`--bg: ${manifest.theme_color};`);
    for (const icon of manifest.icons) {
      const file = site(`public${icon.src}`);
      expect(existsSync(file)).toBe(true);
      expect(pngSize(file)).toBe(icon.sizes);
    }
    expect(manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable")).toBe(true);
    expect(pngSize(site("app/apple-icon.png"))).toBe("180x180");
  });

  test("no service worker anywhere in the site", () => {
    const sources = [...new Bun.Glob("app/**/*.{ts,tsx,js,mjs}").scanSync({ cwd: "." })].filter(
      (f) => !f.includes("node_modules") && !f.includes("/.next/"),
    );
    for (const file of sources)
      expect(`${file}: ${/serviceWorker|navigator\.sw\b/.test(readFileSync(file, "utf8"))}`).toBe(`${file}: false`);
    expect(existsSync(site("public/sw.js"))).toBe(false);
  });
});
