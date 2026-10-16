/**
 * Purpose: the wallets the site lists, by where it runs. Inside the Android app (the Solana Mobile web shell, a
 *          WebView) only the Mobile Wallet Adapter connects: Solflare's adapter opens its web connect page there and
 *          Phantom's only links to an install, so the two are left out. Elsewhere Solflare opens on the site's
 *          network, since without one its SDK opens on mainnet-beta.
 * Version: 0.1.0
 * Sprint:  the Solana Mobile submission (2026-10-15), after a tester's connect opened Solflare on mainnet-beta
 */
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

/** What the shell appends to the WebView's user agent; `@solana-mobile/wallet-standard-mobile` 0.6 registers MWA
 *  inside a WebView only when it reads the same marker. */
export const WEB_SHELL_MARKER = "Solana Mobile Web Shell";

export const isWebShell = (userAgent: string) => userAgent.includes(WEB_SHELL_MARKER);

/** Solflare's network for the site's cluster. Devnet and the local cluster (Solflare has no local network) open on
 *  devnet, and so does an unknown name, as the site's own cluster setting defaults to devnet (lib/config.ts). */
export function solflareNetworkOf(cluster: string): WalletAdapterNetwork {
  if (cluster === "mainnet-beta") return WalletAdapterNetwork.Mainnet;
  if (cluster === "testnet") return WalletAdapterNetwork.Testnet;
  return WalletAdapterNetwork.Devnet;
}
