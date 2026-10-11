export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

/**
 * The privacy page every footer links (the founder's answer 9a, 2026-10-10): today the landing's, with the waitlist's
 * leave form. A plain link to another origin; when this site takes the landing's address, the page moves here.
 */
export const PRIVACY_URL = "https://brot.markets/privacy";

/** Cluster name for explorer links (`devnet`, `testnet` or `mainnet-beta`). */
export const CLUSTER = process.env.NEXT_PUBLIC_CLUSTER ?? "devnet";

const explorer = (path: string) =>
  `https://explorer.solana.com/${path}${CLUSTER === "mainnet-beta" ? "" : `?cluster=${CLUSTER}`}`;
export const explorerAddress = (address: string) => explorer(`address/${address}`);
export const explorerTx = (signature: string) => explorer(`tx/${signature}`);
