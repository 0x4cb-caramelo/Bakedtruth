/**
 * Purpose: the words of the "Connect a wallet" list (the approved prototype's connectDialog, ui/wallet.js): its title,
 *          what each wallet's state says, the reassurance under the list and what the list says when a wallet does
 *          not connect. A copy file, so the vocabulary test reads it.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet), in the UI overhaul
 */
export const PICKER = {
  title: "Connect a wallet",
  detected: "Detected",
  ready: "Ready",
  missing: "Not installed",
  connecting: "Connecting…",
  safe: "Brot Markets never asks for your seed phrase and cannot move your SOL. Every entry is a transaction you read and sign in your wallet.",
  devnet: "Devnet only. Your wallet must be set to Devnet.",
  failed: (name: string, reason: string) => `${name} did not connect: ${reason}`,
  unknown: "the wallet gave no reason.",
} as const;
