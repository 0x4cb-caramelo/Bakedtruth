export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

/** Cluster name for explorer links (`devnet`, `testnet` or `mainnet-beta`). */
export const CLUSTER = process.env.NEXT_PUBLIC_CLUSTER ?? "devnet";

const explorer = (path: string) =>
  `https://explorer.solana.com/${path}${CLUSTER === "mainnet-beta" ? "" : `?cluster=${CLUSTER}`}`;
export const explorerAddress = (address: string) => explorer(`address/${address}`);
export const explorerTx = (signature: string) => explorer(`tx/${signature}`);
