/**
 * Purpose: the wallet's view: disconnected, connected with a balance, no SOL (faucet on devnet only), the balance still
 *          loading, and the SOL formatting (four decimals, truncated).
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */
import { describe, expect, test } from "bun:test";
import { FAUCET_URL, formatSol, walletView } from "./wallet-state";

const ADDRESS = "3EgrFsDDBks8zG31rquNvtP1BR91BVArypwtiBg6XwMz";

describe("formatSol", () => {
  test("four decimals, truncated, no float", () => {
    expect(formatSol(1_500_000_000n)).toBe("1.5000");
    expect(formatSol(123_456_789n)).toBe("0.1234");
    expect(formatSol(0n)).toBe("0.0000");
  });
});

describe("walletView", () => {
  test("no address is disconnected", () => {
    expect(walletView({ address: null, lamports: null, cluster: "devnet" })).toEqual({ kind: "disconnected" });
  });

  test("a funded wallet shows its address and balance, with no faucet", () => {
    expect(walletView({ address: ADDRESS, lamports: 2_000_000_000n, cluster: "devnet" })).toEqual({
      kind: "connected",
      address: ADDRESS,
      sol: "2.0000",
      noSol: false,
      faucetUrl: null,
    });
  });

  test("no SOL on devnet offers the faucet", () => {
    const view = walletView({ address: ADDRESS, lamports: 0n, cluster: "devnet" });
    expect(view).toMatchObject({ kind: "connected", noSol: true, faucetUrl: FAUCET_URL });
  });

  test("no SOL on another cluster offers no faucet", () => {
    const view = walletView({ address: ADDRESS, lamports: 0n, cluster: "local" });
    expect(view).toMatchObject({ kind: "connected", noSol: true, faucetUrl: null });
  });

  test("a balance still loading is shown as unknown, not as no SOL", () => {
    expect(walletView({ address: ADDRESS, lamports: null, cluster: "devnet" })).toMatchObject({
      kind: "connected",
      sol: null,
      noSol: false,
      faucetUrl: null,
    });
  });
});
