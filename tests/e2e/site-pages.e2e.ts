/**
 * Purpose: "site pages and notices" in the web smoke (Sprint 13 DoD; `bun run e2e -- --grep "site pages"`): the built
 *          site in Chromium against the program in LiteSVM, at desktop width and at 412 px. Every route shows the devnet
 *          and not-audited notices; the fee page shows P1 §1.2's worked example; "How it works" opens from the top bar
 *          on a phone without sideways scrolling, and the mascot's bubble stays inside the screen; the record publishes
 *          the powers table and checks its keys against the chain; every campaign page has "Report this campaign";
 *          after a whole cycle the leaderboard ranks the test wallet as "You", from the read API's own route; the
 *          site sends its security headers (X2.5), loads no third-party script (K-10) and serves the PWA manifest
 *          with its icons and no service worker.
 * Version: 0.2.0 (the Sprint 13 reviews: the first-entry line, the too-small refund, the leave line, no hit rate)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { expect, test, type Page } from "@playwright/test";

import { AUDIT_NOTICE, TEST_NOTICE } from "../../app/components/copy-site";
import { PANEL, SHEET } from "../../app/features/entry/copy";
import { choose, connect, control, openCampaign, panel, sheet } from "./helpers";

const ROUTES = ["/", "/leaderboard", "/record", "/fees", "/how-it-works", "/my-entries", "/abrir"];
const desktopOnly = (name: string) => test.skip(name !== "desktop", "runs once, at desktop width");

async function noSidewaysScroll(page: Page) {
  const [scroll, inner] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scroll).toBeLessThanOrEqual(inner);
}

test.describe("site pages and notices", () => {
  test("every route shows the devnet and not-audited notices", async ({ page }) => {
    const made = await control<{ id: string }>("/state", { name: "review" });
    for (const route of [...ROUTES, `/c/${made.id}`]) {
      await page.goto(route);
      const notice = page.getByRole("note").filter({ hasText: TEST_NOTICE });
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(AUDIT_NOTICE);
      await noSidewaysScroll(page);
    }
  });

  test("the fee page works P1 §1.2's example through", async ({ page }) => {
    await page.goto("/fees");
    for (const text of ["9.5 SOL", "1.583 per 1", "14 SOL: 2.333 per 1", "9.6 SOL: 1.6 per 1", "Refund policy"])
      await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  });

  test("How it works opens from the top bar, and the mascot's bubble stays on the screen", async ({ page }, info) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "How it works" }).click();
    await expect(page.getByRole("heading", { name: "Six steps, from opening to payout" })).toBeVisible();
    for (const step of ["Open", "Join", "Entries close", "The chain is read", "6-hour review", "Payout"])
      await expect(page.getByRole("heading", { name: step, exact: true })).toBeVisible();
    await expect(page.getByText("No human picks the winner.")).toBeVisible();
    await noSidewaysScroll(page);
    if (info.project.name !== "phone-412") return;
    const mascot = page.locator(".bk-pet.is-on");
    await expect(mascot).toBeVisible();
    const box = (await mascot.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.6);
    const bubble = page.locator(".bk-pet-say.is-on");
    await expect(bubble).toBeVisible();
    const b = (await bubble.boundingBox())!;
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test("the record publishes who can do what and checks each key against the chain", async ({ page }) => {
    await page.goto("/record");
    await expect(page.getByRole("heading", { name: "Who can do what" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Replace the program", exact: true })).toBeVisible();
    const live = page.getByTestId("live-keys");
    // The smoke's chain has its own keys, not devnet's: the check must say the published table differs.
    await expect(live.locator("[data-role='Admin']")).toHaveText("Differs");
    await expect(live).toContainText("The chain is right");
  });

  test("every campaign page has Report this campaign, in every state", async ({ page }) => {
    for (const name of ["closed", "review", "split-waiting", "void-stale"]) {
      const made = await control<{ id: string }>("/state", { name });
      await page.goto(`/c/${made.id}`);
      const report = page.getByTestId("report-campaign");
      await expect(report.getByRole("link", { name: "Report this campaign" })).toHaveAttribute(
        "href",
        "https://x.com/brotmarkets",
      );
      await expect(report).toContainText(`(campaign ${made.id})`);
      await expect(report).not.toContainText("pays as usual");
    }
  });

  test("after a whole cycle the leaderboard ranks the test wallet, as You", async ({ page }, info) => {
    desktopOnly(info.project.name);
    await control("/cycle-baker");
    const { wallet } = await openCampaign(page, (await control<{ id: string }>("/state", { name: "closed" })).id);
    await page.goto("/leaderboard");
    await page.getByRole("button", { name: "Use Installed Wallet" }).first().click();
    await expect(page.getByRole("button", { name: "Disconnect" })).toBeVisible();
    const row = page.locator(`tr[data-wallet='${wallet}']`);
    await expect(row).toBeVisible();
    await expect(row).toContainText("You");
    await expect(page.getByTestId("leaderboard-you")).toContainText(/#\d+ · \d+ points?/);
    await expect(page.getByText("Points only count on devnet.")).toBeVisible();
    await expect(page.getByTestId("leaderboard-leave")).toContainText("To leave it, send us a direct message on X");
    await expect(page.getByText("Hit rate")).toHaveCount(0);
  });

  test("before a first entry the sheet says entries are public and a wallet that scores is ranked", async ({
    page,
  }, info) => {
    desktopOnly(info.project.name);
    const c = await control<{ id: string }>("/campaign");
    await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "YES", "0.5");
    await panel(page).getByRole("button", { name: "Review entry" }).click();
    await expect(sheet(page).getByText(SHEET.public)).toBeVisible();
    await sheet(page).getByRole("button", { name: "Back" }).click();
  });

  test("a pot whose losing side is too small to pay the fees shows the refund, not the split", async ({
    page,
  }, info) => {
    desktopOnly(info.project.name);
    const c = await control<{ id: string; address: string }>("/campaign");
    await control("/join", { campaign: c.address, side: "yes", amount: "1000000000" });
    await control("/join", { campaign: c.address, side: "no", amount: "10000000" });
    await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "YES", "0.01");
    await expect(panel(page).getByText(PANEL.tooSmall("NO", 100))).toBeVisible();
    await expect(panel(page).getByText("If YES wins: est. 0.0099 SOL back on your 0.0100 SOL")).toBeVisible();
  });

  test("security headers, no third-party script, and the manifest with its icons and no service worker", async ({
    page,
    request,
  }, info) => {
    desktopOnly(info.project.name);
    const home = await request.get("/");
    const headers = home.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    await page.goto("/");
    const scripts = await page
      .locator("script[src]")
      .evaluateAll((all) => all.map((s) => (s as HTMLScriptElement).src));
    for (const src of scripts) expect(new URL(src).origin).toBe(new URL(page.url()).origin);
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest).toMatchObject({ name: "Brot Markets", start_url: "/", display: "standalone" });
    for (const icon of manifest.icons) expect((await request.get(icon.src)).status()).toBe(200);
    expect(await page.evaluate(() => navigator.serviceWorker?.getRegistrations().then((r) => r.length) ?? 0)).toBe(0);
  });
});
