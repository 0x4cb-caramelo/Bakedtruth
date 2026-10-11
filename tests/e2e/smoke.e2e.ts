/**
 * Purpose: the web smoke (Sprint 11 DoD; `bun run e2e`): the built site in Chromium at desktop width and at 412 CSS px,
 *          with an injected Wallet Standard test wallet, against the program in LiteSVM: an entry on each side, the
 *          estimate on screen equal to the SDK's, the review sheet with the summary and the lock notice, and the
 *          receipt; then, once at desktop width, each failure the smoke can provoke with its own message, and the retry
 *          guard across a reload. The client's RPC methods stay on the relay's allowlist and no WebSocket opens.
 * Version: 0.1.2 (the UI overhaul: the top bar's balance follows the entries; the sheet's details folded)
 * Sprint:  11 (site: campaign page and entry)
 */
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { chipSol, choose, connect, control, LOCK_NOTICE, openCampaign, panel, perOne, sheet } from "./helpers";

const SOL = 1_000_000_000n;
type Campaign = { id: string; address: string; closes: string };

/** A campaign whose NO side already holds 1 SOL, so a YES entry has a two-sided estimate. */
async function twoSided(): Promise<Campaign> {
  const campaign = await control<Campaign>("/campaign");
  await control("/join", { campaign: campaign.address, side: "no", amount: String(SOL), as: "other" });
  return campaign;
}

const review = (page: Parameters<typeof panel>[0]) => panel(page).getByRole("button", { name: "Review entry" }).click();
const signIt = (page: Parameters<typeof panel>[0]) =>
  sheet(page).getByRole("button", { name: "Sign in wallet" }).click();
const heading = (page: Parameters<typeof panel>[0], name: string) => sheet(page).getByRole("heading", { name });

test("an entry on each side lands once, and the estimate on screen is the SDK's", async ({ page }) => {
  const sockets: string[] = [];
  page.on("websocket", (ws) => sockets.push(ws.url()));
  const c = await twoSided();
  const { wallet } = await openCampaign(page, c.id);
  await connect(page);
  await expect.poll(() => chipSol(page)).toBeGreaterThan(0);
  const before = await chipSol(page);
  await choose(page, "YES", "0.5");
  const { bps } = await control<{ bps: string }>("/estimate", {
    campaign: c.address,
    side: "yes",
    amount: String(SOL / 2n),
    baker: wallet,
  });
  await expect(panel(page).getByText(`est. ${perOne(BigInt(bps))} per 1.`)).toBeVisible();
  await review(page);
  await expect(heading(page, "Check before you sign")).toBeVisible();
  await sheet(page).getByText("Transaction details", { exact: true }).click(); // the guards and the bytes, folded
  for (const text of [/min_return_bps \d/, /Join campaign .* on YES with 0\.500000000 SOL/, LOCK_NOTICE])
    await expect(sheet(page).getByText(text)).toBeVisible();
  await signIt(page);
  await expect(heading(page, "You're in")).toBeVisible();
  await sheet(page).getByRole("button", { name: "Done" }).click();
  await choose(page, "NO", "0.25");
  await review(page);
  await signIt(page);
  await expect(heading(page, "You're in")).toBeVisible();
  await sheet(page).getByRole("button", { name: "Done" }).click();
  expect(await control("/entry", { campaign: c.address, baker: wallet })).toEqual({
    yes: String(SOL / 2n),
    no: String(SOL / 4n),
  });
  // Sprint 12: the wallet's own amounts are written exactly, to the lamport (copy-states.ts `exactSol`).
  await expect(page.getByText("You have YES 0.5 SOL and NO 0.25 SOL in this campaign.")).toBeVisible();
  await expect.poll(() => chipSol(page)).toBeLessThan(before - 0.75); // the top bar's balance follows the entries
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(sockets).toEqual([]);
});

test.describe("each failure with its own message", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "the failures run once, at desktop width"));

  test("below the minimum, and a refusal in the wallet", async ({ page }) => {
    const c = await twoSided();
    const opened = await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "YES", "0.001");
    await expect(panel(page).getByText("The minimum entry for this campaign is 0.01 SOL.").first()).toBeVisible();
    await expect(panel(page).getByRole("button", { name: "Review entry" })).toBeDisabled();
    await choose(page, "YES", "0.1");
    opened.mode.current = "refuse";
    await review(page);
    await signIt(page);
    await expect(heading(page, "You refused it in your wallet")).toBeVisible();
    await expect(sheet(page).getByText("Nothing was charged.")).toBeVisible();
  });

  test("other entries first: the return fell below the floor signed (6067)", async ({ page }) => {
    const c = await twoSided();
    await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "YES", "1");
    await review(page);
    await expect(heading(page, "Check before you sign")).toBeVisible();
    await control("/join", { campaign: c.address, side: "yes", amount: String(500n * SOL), as: "other" });
    await signIt(page);
    await expect(heading(page, "The estimate fell below what you accepted")).toBeVisible();
    await expect(sheet(page).getByText(/Program error 6067 ReturnBelowMinimum/)).toBeVisible();
    await expect(sheet(page).getByText("No SOL moved except the network fee.")).toBeVisible();
  });

  test("the entry changed since it was read (6066), and the network down", async ({ page }) => {
    const c = await twoSided();
    const { wallet } = await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "YES", "0.2");
    await review(page);
    await expect(heading(page, "Check before you sign")).toBeVisible();
    await control("/join", { campaign: c.address, side: "yes", amount: String(SOL / 10n), as: "wallet" });
    await signIt(page);
    await expect(heading(page, "Your entry changed since this page read it")).toBeVisible();
    await expect(sheet(page).getByText(/Program error 6066 EntryTotalMismatch/)).toBeVisible();
    expect(await control("/entry", { campaign: c.address, baker: wallet })).toEqual({
      yes: String(SOL / 10n),
      no: "0",
    });
    await sheet(page).getByRole("button", { name: "Close" }).first().click();
    const rpc = `${process.env.E2E_RPC_URL ?? "http://127.0.0.1:4241"}/**`; // the relay's port under E2E_RELAY=1
    await page.route(rpc, (route) => route.abort());
    await review(page);
    await expect(heading(page, "Can't reach Solana right now")).toBeVisible();
    await page.unroute(rpc);
  });

  test("entries paused, no fresh price, and not enough SOL", async ({ page }) => {
    const c = await twoSided();
    const { wallet } = await openCampaign(page, c.id);
    await control("/pause");
    await page.reload();
    await expect(panel(page).getByRole("button", { name: "Entries are paused" })).toBeDisabled();
    await control("/resume");
    await control("/price", { age: "500" });
    await page.reload();
    await expect(page.getByText(/^No fresh BTC\/USD price: the last one on-chain is 8 min 20 s old/)).toBeVisible();
    await expect(panel(page).getByRole("button", { name: "Waiting for a fresh price" })).toBeDisabled();
    await control("/price", { age: "5" });
    await control("/lamports", { address: wallet, amount: "1000000" });
    await page.reload();
    await connect(page);
    await expect(panel(page).getByRole("link", { name: "Get devnet SOL" })).toBeVisible();
    await control("/lamports", { address: wallet, amount: String(100n * SOL) });
  });

  test("entries closed: the panel gives way to the state card", async ({ page }) => {
    const c = await twoSided();
    const { unix } = await control<{ unix: string }>("/now");
    await openCampaign(page, c.id);
    await control("/clock", { unix: String(BigInt(c.closes) + 1n) });
    await page.reload();
    await expect(page.getByRole("heading", { name: "Entries closed" })).toBeVisible();
    await expect(panel(page)).toHaveCount(0);
    await control("/clock", { unix });
  });

  test("the retry guard: no answer, a reload, an expired attempt, then one entry", async ({ page }) => {
    const c = await twoSided();
    const opened = await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "YES", "0.3");
    opened.mode.current = "hang";
    await review(page);
    await signIt(page);
    await expect(sheet(page).getByText("Approve in your wallet.").first()).toBeVisible();
    await page.reload();
    await connect(page);
    await expect(heading(page, "Checking whether your entry landed…")).toBeVisible();
    await control("/block-height", { height: "1000001" });
    await expect(heading(page, "Your entry did not go in")).toBeVisible();
    await control("/block-height", { height: "999850" });
    opened.mode.current = "answer";
    await sheet(page).getByRole("button", { name: "Review again" }).click();
    await signIt(page);
    await expect(heading(page, "You're in")).toBeVisible();
    expect(await control("/entry", { campaign: c.address, baker: opened.wallet })).toEqual({
      yes: String((3n * SOL) / 10n),
      no: "0",
    });
  });

  test("a wallet that sends and never answers: the entry is found by the guard", async ({ page }) => {
    const c = await twoSided();
    const opened = await openCampaign(page, c.id);
    await connect(page);
    await choose(page, "NO", "0.2");
    opened.mode.current = "no-answer";
    await review(page);
    await signIt(page);
    await expect(heading(page, "You're in")).toBeVisible();
    await expect(
      sheet(page).getByText("Your entry account shows the entry. The wallet did not return its signature."),
    ).toBeVisible();
  });

  test("every RPC method the browser called is on the relay's allowlist", async () => {
    const doc = readFileSync("docs/technical/relay-allowlist.md", "utf8");
    const allowed = new Set([...doc.matchAll(/^\| `(\w+)` \|/gm)].map((m) => m[1]));
    const { methods } = await control<{ methods: string[] }>("/methods");
    console.log(`rpc methods seen: ${[...new Set(methods)].sort().join(", ")}`);
    expect([...new Set(methods)].filter((m) => !allowed.has(m))).toEqual([]);
  });
});
