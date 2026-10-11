/**
 * Purpose: A-8 in the web smoke (the founder's answer of 2026-10-10): the program is upgraded while a page built for its
 *          previous deploy is open (the site was built against the local chain, whose ProgramData says slot 0). The
 *          page never asks the wallet to sign: an upgrade before the review stops the review, and one between the
 *          review and the wallet stops the signature. The failure counts down and reloads, each reload in the tab
 *          waiting longer; once the deploy is the site's again (here it is put back, as a rebuilt site would match the
 *          new one), an entry goes in. Once, at desktop width.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; A-8)
 */
import { expect, test, type Page } from "@playwright/test";

import { choose, connect, control, openCampaign, panel, sheet } from "./helpers";

const SOL = 1_000_000_000n;
const UPGRADED = "Brot's program was just updated";
type Campaign = { id: string; address: string };

/** A campaign whose NO side already holds 1 SOL. */
async function twoSided(): Promise<Campaign> {
  const campaign = await control<Campaign>("/campaign");
  await control("/join", { campaign: campaign.address, side: "no", amount: String(SOL), as: "other" });
  return campaign;
}

const heading = (page: Page, name: string) => sheet(page).getByRole("heading", { name });
const review = (page: Page) => panel(page).getByRole("button", { name: "Review entry" }).click();
const reloads = (page: Page) => page.evaluate(() => sessionStorage.getItem("brot-a8-reloads"));
/** After a reload the panel offers the wallet again (the sheet is gone with the old page). */
const reloaded = (page: Page) =>
  expect(panel(page).getByRole("button", { name: "Connect", exact: true })).toBeVisible({ timeout: 20_000 });

test.describe("signing pauses during an upgrade (A-8)", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "A-8 runs once, at desktop width"));
  test.afterEach(() => control("/deploy", { slot: "0" }));

  test("an upgrade before the review: no summary, a countdown, a reload, then an entry", async ({ page }) => {
    const c = await twoSided();
    const { wallet } = await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "YES", "0.1");
    await control("/deploy", { slot: "7" });
    await review(page);
    await expect(heading(page, UPGRADED)).toBeVisible();
    await expect(sheet(page).getByText(/^Reloading in [1-5] s\.$/)).toBeVisible();
    await expect(sheet(page).getByText("Nothing was charged.")).toBeVisible();
    await expect(sheet(page).getByText("Check before you sign")).toHaveCount(0);
    // The site for the program's new deploy is out (here: the deploy put back); the page reloads by itself.
    await control("/deploy", { slot: "0" });
    await reloaded(page);
    expect(await reloads(page)).toBe("1");
    await connect(page);
    await choose(page, "YES", "0.1");
    await review(page);
    await expect(heading(page, "Check before you sign")).toBeVisible();
    expect(await reloads(page)).toBeNull(); // a check that passed starts the back-off over
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, "You're in")).toBeVisible();
    expect(await control("/entry", { campaign: c.address, baker: wallet })).toEqual({
      yes: String(SOL / 10n),
      no: "0",
    });
  });

  test("an upgrade between the review and the wallet: nothing is signed, and each reload waits longer", async ({
    page,
  }) => {
    const c = await twoSided();
    const { wallet } = await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "NO", "0.1");
    await review(page);
    await expect(heading(page, "Check before you sign")).toBeVisible();
    await control("/deploy", { slot: "8" });
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, UPGRADED)).toBeVisible();
    // The wallet answers every request in this test: an empty entry shows it was never asked.
    expect(await control("/entry", { campaign: c.address, baker: wallet })).toEqual({ yes: "0", no: "0" });
    await sheet(page).getByRole("button", { name: "Reload now" }).click();
    await reloaded(page);
    expect(await reloads(page)).toBe("1");
    // Still the old deploy's site: the next pause waits 30 s, not 5.
    await connect(page);
    await choose(page, "NO", "0.1");
    await review(page);
    await expect(heading(page, UPGRADED)).toBeVisible();
    await expect(sheet(page).getByText(/^Reloading in (30|29|28) s\.$/)).toBeVisible();
    await sheet(page).getByRole("button", { name: "Close" }).first().click();
    expect(await control("/entry", { campaign: c.address, baker: wallet })).toEqual({ yes: "0", no: "0" });
  });
});
