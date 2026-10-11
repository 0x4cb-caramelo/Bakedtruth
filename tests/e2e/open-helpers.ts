/**
 * Purpose: what the creation box's smoke tests share (Sprint 19): the link that prefills a paid BTC/USD opening, the
 *          box and its button as locators, the connection through "Use Installed Wallet", "Review and sign" up to the
 *          summary (answering the guard's recent-opening question when an earlier test opened one), the campaign id
 *          the summary names, and lamports written as the box writes them.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { expect, type Page } from "@playwright/test";

import { sheet } from "./helpers";

/** 110% of the captured BTC/USD price (85,212.34): far enough from the band, and not met. */
export const TARGET = "93733.57";
export const link = (extra = "") => `/abrir?t=price-touch&feed=BTC/USD&target=${TARGET}&days=7${extra}`;
export const box = (page: Page) => page.getByTestId("open-box");
export const reviewButton = (page: Page) => box(page).getByRole("button", { name: "Review and sign" });
export const heading = (page: Page, name: string) => sheet(page).getByRole("heading", { name });
/** Lamports as the box writes them: SOL with every decimal, the trailing zeros dropped. */
export const exact = (lamports: string) =>
  `${BigInt(lamports) / 1_000_000_000n}.${(BigInt(lamports) % 1_000_000_000n).toString().padStart(9, "0")}`.replace(
    /\.?0+$/,
    "",
  );

export type Opened = {
  creator: string;
  creatorIsTeam: boolean;
  paid: string;
  prize: string;
  fee: string;
  creatorShareBps: number;
  matchesFormula: boolean;
  splitHolds: boolean;
};

export async function connectBox(page: Page) {
  await box(page).getByRole("button", { name: "Use Installed Wallet" }).click();
  await expect(box(page).getByText(/^Balance \d/)).toBeVisible();
}

/**
 * "Review and sign" up to the summary. A browser with no saved record (every test starts with empty storage) is first
 * shown the wallet's opening of the last half hour, when an earlier test made one: that is the guard's cleared-storage
 * witness, tested on its own in open-guard.e2e.ts, so here the creator chooses to open a new one.
 */
export async function review(page: Page) {
  await reviewButton(page).click();
  const recent = heading(page, "You opened a campaign recently");
  const summary = heading(page, "Check before you sign");
  await expect(recent.or(summary)).toBeVisible();
  if (await recent.isVisible()) await sheet(page).getByRole("button", { name: "Open a new one" }).click();
  await expect(summary).toBeVisible();
}

/** The campaign id the sheet's summary names ("Open campaign #<id> on …"), from the bytes the wallet will sign. */
export async function idInSheet(page: Page): Promise<string> {
  const text = await sheet(page)
    .getByText(/Open campaign #\d+ on/)
    .innerText();
  return (/#(\d+)/.exec(text) as RegExpExecArray)[1];
}
