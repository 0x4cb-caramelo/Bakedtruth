/**
 * Purpose: the Android app's WebView is told apart by the marker the web shell appends to its user agent, and
 *          Solflare opens on the site's network (never mainnet-beta for the devnet site, as a tester's connect did).
 * Version: 0.1.0
 * Sprint:  the Solana Mobile submission (2026-10-15)
 */
import { describe, expect, test } from "bun:test";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { isWebShell, solflareNetworkOf, WEB_SHELL_MARKER } from "./web-shell";

const WEBVIEW =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 " +
  "Chrome/129.0.6668.100 Mobile Safari/537.36";
const CHROME_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36";

describe("the Android app's WebView", () => {
  test("is the web shell when the shell's marker ends the user agent", () => {
    expect(isWebShell(`${WEBVIEW} ${WEB_SHELL_MARKER}`)).toBe(true);
  });

  test("Chrome on Android and a plain WebView are not the shell", () => {
    expect(isWebShell(CHROME_ANDROID)).toBe(false);
    expect(isWebShell(WEBVIEW)).toBe(false);
  });
});

describe("Solflare's network", () => {
  test("follows the site's cluster", () => {
    expect(solflareNetworkOf("devnet")).toBe(WalletAdapterNetwork.Devnet);
    expect(solflareNetworkOf("testnet")).toBe(WalletAdapterNetwork.Testnet);
    expect(solflareNetworkOf("mainnet-beta")).toBe(WalletAdapterNetwork.Mainnet);
  });

  test("the local cluster and an unknown name open on devnet, never mainnet-beta", () => {
    expect(solflareNetworkOf("local")).toBe(WalletAdapterNetwork.Devnet);
    expect(solflareNetworkOf("mainnet")).toBe(WalletAdapterNetwork.Devnet);
  });
});
