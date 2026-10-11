/**
 * Purpose: "campaign states" in the web smoke (Sprint 12 DoD; `bun run e2e -- --grep "campaign states"`): the built
 *          site in Chromium against the program in LiteSVM. Every public state shows on its campaign page with the
 *          report link (L-13); "My entries" shows, for the test wallet, a received total equal to its settlement events
 *          after a whole cycle; and "Receive" pays the wallet's reserved creator share through the injected wallet,
 *          after which the total grows by exactly that share. No page opens a WebSocket.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { expect, test, type Page } from "@playwright/test";

import { exactSol } from "../../app/features/campaign-page/copy-states";
import { control, openCampaign } from "./helpers";

type Made = { id: string; address: string };

const state = (page: Page) => page.locator("section[aria-labelledby='state-title']");

/** Connects the injected wallet from the header (a settled campaign shows no entry panel). */
async function connectFromHeader(page: Page) {
  await page.getByRole("button", { name: "Use Installed Wallet" }).first().click();
  await expect(page.getByRole("button", { name: /^Wallet / })).toBeVisible(); // the top bar's chip, once connected
}

test.describe("campaign states", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "the states run once, at desktop width"));

  test("every public state shows on its campaign page, with where to report a wrong result", async ({ page }) => {
    const sockets: string[] = [];
    page.on("websocket", (ws) => sockets.push(ws.url()));
    const cases: [string, string, RegExp][] = [
      ["closed", "Entries closed", /Entries closed on schedule/],
      ["review", "In review", /Result read: YES[\s\S]*left/],
      ["contested", "Contested", /Payout is paused/],
      ["split-waiting", "Result: YES", /Waiting for payout/],
      ["one-sided", "Result: NO", /less 1%, rounded up to the lamport/],
      ["empty", "Result: NO", /Nobody entered this campaign/],
      ["void-stale", "Voided", /price feed stopped updating before the deadline/],
      ["void-house", "Voided", /the 10% opening fee goes back too/i],
    ];
    for (const [name, title, body] of cases) {
      const made = await control<Made>("/state", { name });
      await page.goto(`/c/${made.id}`);
      await expect(state(page).getByRole("heading", { name: title })).toBeVisible();
      await expect(state(page)).toContainText(body);
      if (name !== "closed") {
        await expect(state(page).getByRole("link", { name: "x.com/brotmarkets" })).toHaveAttribute(
          "href",
          "https://x.com/brotmarkets",
        );
      }
    }
    expect(sockets).toEqual([]);
  });

  test("my entries shows what the events say was received, and Receive pays a reserved share once", async ({
    page,
  }) => {
    const baker = await control<Made & { expected: string }>("/cycle-baker");
    const creator = await control<Made & { reserved: string }>("/cycle-creator");
    expect(BigInt(baker.expected)).toBeGreaterThan(0n);
    expect(BigInt(creator.reserved)).toBeGreaterThan(0n);

    await openCampaign(page, creator.id);
    await connectFromHeader(page);
    const mine = page.locator("section[aria-labelledby='mine-title']");
    await expect(mine).toContainText("Kept in the vault for you");
    await mine.getByRole("button", { name: `Receive ${exactSol(BigInt(creator.reserved))} SOL` }).click();
    await expect(mine).toContainText(`${exactSol(BigInt(creator.reserved))} SOL received, now in your wallet.`);

    const { received } = await control<{ received: string }>("/received");
    expect(BigInt(received)).toBe(BigInt(baker.expected) + BigInt(creator.reserved));
    await page.goto("/my-entries");
    await connectFromHeader(page);
    await expect(page.getByTestId("received-total")).toHaveText(`${exactSol(BigInt(received))} SOL`);
    await expect(page.locator(`li[data-campaign='${baker.address}']`)).toContainText(/Received: \d/);
  });
});
