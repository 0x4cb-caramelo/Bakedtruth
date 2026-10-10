/**
 * Purpose: the wallet's view, as pure logic: disconnected; connected with its address and SOL balance; connected with
 *          no SOL, which offers the devnet faucet only on devnet. Money is lamports (bigint) and never a float.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */
export const FAUCET_URL = "https://faucet.solana.com";

/** Below this balance a transfer's fee and the rent are not covered: 0.005 SOL. An assumption to confirm. */
export const NO_SOL_FLOOR = 5_000_000n;

export type WalletView =
  | { kind: "disconnected" }
  | { kind: "connected"; address: string; sol: string | null; noSol: boolean; faucetUrl: string | null };

const LAMPORTS_PER_SOL = 1_000_000_000n;

/** SOL with four decimals, truncated (not rounded), from lamports. */
export function formatSol(lamports: bigint): string {
  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = (lamports % LAMPORTS_PER_SOL).toString().padStart(9, "0").slice(0, 4);
  return `${whole}.${fraction}`;
}

export function walletView(input: { address: string | null; lamports: bigint | null; cluster: string }): WalletView {
  if (!input.address) return { kind: "disconnected" };
  const noSol = input.lamports !== null && input.lamports < NO_SOL_FLOOR;
  return {
    kind: "connected",
    address: input.address,
    sol: input.lamports === null ? null : formatSol(input.lamports),
    noSol,
    faucetUrl: noSol && input.cluster === "devnet" ? FAUCET_URL : null,
  };
}
