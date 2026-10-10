/**
 * Purpose: the web smoke's Playwright configuration (Sprint 11; @playwright/test 1.63.0, pinned in package.json, whose
 *          Chromium is build 1243): the site built against the local chain on 127.0.0.1:4240, one worker (the chain is
 *          shared and some steps move it), and two widths: a desktop and an Android phone of about 412 CSS px. Run it
 *          through `bun run e2e` (tests/e2e/run.ts), which starts the chain and the site first.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  outputDir: "../../target/e2e-results",
  use: { baseURL: "http://127.0.0.1:4240", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "phone-412", use: { viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true } },
  ],
});
