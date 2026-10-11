/**
 * Purpose: "open a campaign" in the web smoke (Sprint 19 DoD; `bun run e2e -- --grep "open a campaign"`): the creation
 *          box at /abrir in Chromium at desktop width and at 412 CSS px, with the injected test wallet, against the
 *          program in LiteSVM: a paid opening from a link (the box says a link filled it, never signs by itself, shows
 *          the summary of the bytes, and the campaign stores the very charge the box quoted, split 90/10, I14), and a
 *          team key's free opening; and the search as a search bar (a typed campaign completed, Enter fills the box,
 *          a target the price already passed offered the one way it opens, a question outside the grammar). The
 *          refusals and the retry guard are in open-guard.e2e.ts.
 * Version: 0.3.0 (the UI overhaul: the search; 0.2.0, the refusals and the guard moved to open-guard.e2e.ts)
 * Sprint:  19 (site: open a campaign)
 */
import { expect, test } from "@playwright/test";

import { control, openWithWallet, sheet } from "./helpers";
import { box, connectBox, exact, heading, idInSheet, link, review, reviewButton, type Opened } from "./open-helpers";

test.describe("open a campaign", () => {
  test("a paid opening from a link: the box's quote is what the program stores", async ({ page }) => {
    const sockets: string[] = [];
    page.on("websocket", (ws) => sockets.push(ws.url()));
    const opened = await openWithWallet(page, link());
    await expect(
      box(page).getByText("Filled from a link. Check every field: a link never signs anything."),
    ).toBeVisible();
    await expect(page.getByTestId("open-sentence")).toHaveText("BTC/USD reaches $93,733.57");
    await connectBox(page);
    await expect(reviewButton(page)).toBeEnabled();
    const quoted = await box(page).getByTestId("charge-line").locator("b").innerText();
    await review(page);
    const id = await idInSheet(page);
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, "Opened. Your campaign is live.")).toBeVisible();
    const stored = await control<Opened>("/opened", { id });
    expect(stored).toMatchObject({
      creator: opened.wallet,
      creatorIsTeam: false,
      creatorShareBps: 100,
      matchesFormula: true,
      splitHolds: true,
    });
    expect(quoted).toBe(`${exact(stored.paid)} SOL`);
    await sheet(page).getByRole("link", { name: "Go to the campaign" }).click();
    await expect(page).toHaveURL(new RegExp(`/c/${id}$`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText("BTC/USD reaches $93,733.57");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(sockets).toEqual([]);
  });

  test("a team key opens free: no payment, no prize and no creator share", async ({ page }) => {
    await control("/team-wallet", { on: "1" });
    try {
      await openWithWallet(page, link());
      await connectBox(page);
      await expect(box(page).getByTestId("team-note")).toBeVisible();
      await expect(box(page).getByTestId("charge-line")).toHaveCount(0);
      await review(page);
      await expect(sheet(page).getByText("Free (team key)")).toBeVisible();
      const id = await idInSheet(page);
      await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
      await expect(heading(page, "Opened. Your campaign is live.")).toBeVisible();
      expect(await control<Opened>("/opened", { id })).toMatchObject({
        creatorIsTeam: true,
        paid: "0",
        prize: "0",
        creatorShareBps: 0,
      });
    } finally {
      await control("/team-wallet", { on: "0" });
    }
  });

  test("the search completes what is typed into a campaign the chain can check, as a search bar does", async ({
    page,
  }) => {
    await page.goto("/abrir");
    const query = box(page).getByRole("combobox", { name: "What should the chain answer?" });
    await query.click();
    // An empty box starts with an example a fair way off the live price: BTC/USD is at 85,212 on this chain.
    await expect(box(page).getByRole("option", { name: /BTC\/USD reaches \$110,000/ })).toBeVisible();
    await query.fill("BTC 120k in 30 days");
    const top = box(page).getByRole("option").first();
    await expect(top).toContainText("BTC/USD reaches $120,000");
    await expect(top).toContainText("deadline in 30 days");
    await query.press("Enter");
    await expect(page.getByTestId("open-sentence")).toHaveText("BTC/USD reaches $120,000");
    const target = box(page).getByLabel("Target (US$)");
    await expect(target).toBeFocused();
    await expect(target).toHaveValue("120000");
    await expect(box(page).getByRole("button", { name: "30 days" })).toHaveAttribute("aria-pressed", "true");
    // A target the price already passed is offered the one way it can open.
    await query.fill("BTC reaches 50000");
    await expect(box(page).getByRole("option").first()).toContainText("BTC/USD falls to $50,000");
    await query.fill("will it rain tomorrow");
    await expect(box(page).getByText("We can't check this on-chain.", { exact: true })).toBeVisible();
    await expect(box(page).getByRole("option")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
