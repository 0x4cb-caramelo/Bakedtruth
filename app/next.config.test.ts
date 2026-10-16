/**
 * Purpose: the site's Content-Security-Policy lets the page reach the Mobile Wallet Adapter's socket on the phone
 *          (ws://localhost:<port>), which it refused before 2026-10-15, and keeps the rest of the policy closed.
 * Version: 0.1.0
 * Sprint:  the Solana Mobile submission (2026-10-15)
 */
import { describe, expect, test } from "bun:test";
import config from "./next.config";

const policy = async () => {
  const settings = await config("test");
  const [rules] = await settings.headers!();
  return rules!.headers.find((h) => h.key === "Content-Security-Policy")!.value;
};

describe("the Content-Security-Policy", () => {
  test("lets the page connect to the MWA wallet's socket on the phone", async () => {
    const connect = (await policy()).split("; ").find((d) => d.startsWith("connect-src "));
    expect(connect?.split(" ")).toContain("ws://localhost:*");
  });

  test("keeps the rest closed", async () => {
    const csp = await policy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});
