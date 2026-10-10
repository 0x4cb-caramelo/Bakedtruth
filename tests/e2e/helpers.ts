/**
 * Purpose: what the web smoke's tests share on the runner's side: calls to the chain's control endpoint, the page
 *          opened with the injected wallet and the runner's answer for it (sign and send, refuse, send and never
 *          answer, never answer), the entry panel and the sheet as locators, and the per-1 figure written as the panel
 *          writes it, to compare the screen with the SDK's estimate.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { expect, type Page } from "@playwright/test";
import { getBase58Encoder } from "@solana/kit";

import { injectWallet } from "./wallet";

const CONTROL = "http://127.0.0.1:4243";

export async function control<T = Record<string, string>>(path: string, body: Record<string, string> = {}): Promise<T> {
  const response = await fetch(CONTROL + path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
  const json = (await response.json()) as T & { error?: string };
  if (!response.ok || json.error) throw new Error(`control ${path}: ${json.error ?? response.status}`);
  return json;
}

/** "answer": sign, send, return; "refuse": a person says no; "no-answer": send, then lose the answer; "hang": never answer. */
export type WalletMode = "answer" | "refuse" | "no-answer" | "hang";

export type Opened = { wallet: string; mode: { current: WalletMode } };

/** Opens `/c/{id}` with the test wallet installed; `mode.current` decides what the wallet does when asked to sign. */
export async function openCampaign(page: Page, id: string, query = ""): Promise<Opened> {
  const { address } = await control<{ address: string }>("/wallet");
  const mode = { current: "answer" as WalletMode };
  await page.exposeFunction("__e2eSignAndSend", async (wire: string) => {
    if (mode.current === "refuse") throw new Error("User rejected the request.");
    if (mode.current === "hang") return new Promise<string>(() => undefined);
    const { signature } = await control<{ signature: string }>("/sign-and-send", { wire });
    if (mode.current === "no-answer") throw new Error("The wallet session closed before it answered.");
    return Buffer.from(getBase58Encoder().encode(signature)).toString("base64");
  });
  await page.addInitScript(injectWallet, { address, publicKey: Array.from(getBase58Encoder().encode(address)) });
  await page.goto(`/c/${id}${query}`);
  return { wallet: address, mode };
}

export const panel = (page: Page) => page.locator("section[aria-labelledby='entry-title']");
export const sheet = (page: Page) => page.getByRole("dialog");

/** Connects through the panel's "Use Installed Wallet" and waits for the balance. */
export async function connect(page: Page) {
  await panel(page).getByRole("button", { name: "Use Installed Wallet" }).click();
  await expect(panel(page).getByText(/^Balance \d/)).toBeVisible();
}

/** Picks a side and an amount in the panel. */
export async function choose(page: Page, side: "YES" | "NO", amount: string) {
  await panel(page)
    .getByRole("button", { name: new RegExp(`^${side}`) })
    .click();
  await panel(page).getByLabel("Amount (SOL)").fill(amount);
}

/** The panel's per-1 figure for basis points: up to four decimals, at least two, never rounded up. */
export function perOne(bps: bigint): string {
  let fraction = (bps % 10_000n).toString().padStart(4, "0");
  while (fraction.length > 2 && fraction.endsWith("0")) fraction = fraction.slice(0, -1);
  return `${bps / 10_000n}.${fraction}`;
}

/** The founder's L-03 text (2026-10-10), in its devnet wording (Sprint 12, answer 2a), shown before every signature. */
export const LOCK_NOTICE =
  "Your entry stays locked until the campaign ends. You cannot take it out before then. Payouts go to your wallet after the result is read; on devnet that is not automatic yet, and no time is promised.";
