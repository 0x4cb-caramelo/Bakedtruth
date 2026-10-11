/**
 * Purpose: "open a campaign: refusals and the retry guard" in the web smoke (Sprint 19 DoD), once at desktop width:
 *          three refusals each with its own message on the box (a target already met, a deadline too soon, a stale
 *          SOL/USD price that holds paid openings), and the retry guard (T17, A-9): an answer lost across a reload, an
 *          expired attempt and the rebuilt opening on the same id; a browser whose storage was cleared is shown the
 *          wallet's recent opening before a second payment; two openings from one page, each on its own id; a wallet
 *          that sends and never answers; and a deadline typed by hand, date first or time first.
 * Version: 0.2.0 (the Sprint 19 reviews: the new words; a stale SOL/USD said once, and the opening not priced)
 * Sprint:  19 (site: open a campaign)
 */
import { expect, test } from "@playwright/test";

import { control, openWithWallet, sheet } from "./helpers";
import { box, connectBox, heading, idInSheet, link, review, reviewButton, TARGET, type Opened } from "./open-helpers";

test.describe("open a campaign: refusals and the retry guard", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "these run once, at desktop width"));

  test("three refusals, each with its own message: a target met, a deadline too soon, a stale SOL/USD", async ({
    page,
  }) => {
    await openWithWallet(page, link().replace(TARGET, "50000"));
    await connectBox(page);
    await expect(box(page).getByText(/^Already met: the campaign would be decided the moment it opens/)).toBeVisible();
    await expect(box(page).getByRole("button", { name: "Already met" })).toBeDisabled();

    const { unix } = await control<{ unix: string }>("/now");
    await page.goto(link().replace("&days=7", `&deadline=${BigInt(unix) + 2n * 86_400n}`));
    await connectBox(page);
    await expect(box(page).getByText("The deadline must be at least 3 days away.")).toBeVisible();
    await expect(box(page).getByRole("button", { name: "Deadline too soon" })).toBeDisabled();

    await control("/sol-price", { age: "500" });
    try {
      await page.goto(link());
      await connectBox(page);
      // Said once, above the sections (the copy review, S20).
      await expect(box(page).getByText(/^Pyth's SOL\/USD price is older than the program accepts/)).toBeVisible();
      await expect(box(page).getByTestId("money").getByText("Not priced yet")).toBeVisible();
      await expect(box(page).getByRole("button", { name: "Price on hold" })).toBeDisabled();
    } finally {
      await control("/sol-price", { age: "5" });
    }
  });

  test("the retry guard: no answer, a reload, an expired attempt, then one opening on the same id", async ({
    page,
  }) => {
    const opened = await openWithWallet(page, link());
    await connectBox(page);
    opened.mode.current = "hang";
    await review(page);
    const first = await idInSheet(page);
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, "Approve in your wallet")).toBeVisible();
    await page.reload();
    await connectBox(page);
    await expect(heading(page, "Checking whether your campaign opened…")).toBeVisible();
    await control("/block-height", { height: "1000001" });
    await expect(heading(page, "It didn't open")).toBeVisible();
    await control("/block-height", { height: "999850" });
    opened.mode.current = "answer";
    await sheet(page).getByRole("button", { name: "Review again" }).click();
    await expect(heading(page, "Check before you sign")).toBeVisible();
    expect(await idInSheet(page)).toBe(first);
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, "Opened. Your campaign is live.")).toBeVisible();
    expect(await control<Opened>("/opened", { id: first })).toMatchObject({
      creator: opened.wallet,
      matchesFormula: true,
    });
  });

  test("storage cleared: the wallet's recent opening is offered before a second payment", async ({ page }) => {
    await openWithWallet(page, link());
    await connectBox(page);
    await review(page);
    const id = await idInSheet(page);
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, "Opened. Your campaign is live.")).toBeVisible();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await connectBox(page);
    await reviewButton(page).click();
    await expect(heading(page, "You opened a campaign recently")).toBeVisible();
    await expect(sheet(page).getByText(`This wallet opened campaign ${id} less than a minute ago.`)).toBeVisible();
    await sheet(page).getByRole("link", { name: "Go to it" }).click();
    await expect(page).toHaveURL(new RegExp(`/c/${id}$`));
  });

  test("two openings from one page: the second draws its own id and opens", async ({ page }) => {
    await openWithWallet(page, link());
    await connectBox(page);
    await review(page);
    const first = await idInSheet(page);
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, "Opened. Your campaign is live.")).toBeVisible();
    await page.keyboard.press("Escape");
    await review(page);
    const second = await idInSheet(page);
    expect(second).not.toBe(first);
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, "Opened. Your campaign is live.")).toBeVisible();
  });

  test("a date typed before its time, or a time before its date, is kept until both make a moment", async ({
    page,
  }) => {
    await openWithWallet(page, link());
    const date = box(page).getByLabel("Date (your time zone)");
    const time = box(page).getByLabel("Time (your time zone)");
    const inUtc = box(page).getByText(/^In UTC:/);
    await expect(inUtc).toBeVisible(); // the link's 7 days, once the chain's clock is read
    const typed = await time.inputValue();
    await date.fill("");
    await expect(inUtc).toHaveCount(0);
    await expect(time).toHaveValue(typed); // the time stays while the date is typed again
    const { unix } = await control<{ unix: string }>("/now");
    const day = await page.evaluate(
      (ms) => {
        const d = new Date(ms);
        const two = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
      },
      (Number(unix) + 10 * 86_400) * 1_000,
    );
    await date.fill(day);
    await expect(inUtc).toBeVisible();
    await time.fill("");
    await date.fill("");
    await time.fill("09:30"); // the time first, with no date yet
    await expect(time).toHaveValue("09:30");
    await date.fill(day);
    await expect(inUtc).toBeVisible();
    await expect(time).toHaveValue("09:30");
  });

  test("a wallet that sends and never answers: the opening is found by its id", async ({ page }) => {
    const opened = await openWithWallet(page, link());
    await connectBox(page);
    opened.mode.current = "no-answer";
    await review(page);
    const id = await idInSheet(page);
    await sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
    await expect(heading(page, "Opened. Your campaign is live.")).toBeVisible();
    expect(await control<Opened>("/opened", { id })).toMatchObject({ creator: opened.wallet });
  });
});
