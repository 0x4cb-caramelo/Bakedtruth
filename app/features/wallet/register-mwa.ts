/**
 * Purpose: the explicit Mobile Wallet Adapter registration (S1, proposal §3.4). Registers the MWA wallet once, for
 *          the chain of the site's cluster (never the RPC URL's), with a relative icon. `register` is injectable so
 *          the chain can be tested without a browser; the default is the package's `registerMwa`.
 * Version: 0.1.1 (the icon under the base path)
 * Sprint:  09 (site shell, theme and wallet)
 */
import {
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  registerMwa,
} from "@solana-mobile/wallet-standard-mobile";

import { asset } from "@/lib/base-path";

export type SolanaChain = "solana:devnet" | "solana:localnet";
export type RegisterFn = typeof registerMwa;

/** The Wallet Standard chain for a cluster name. Throws on a cluster the site does not know. */
export function chainOf(cluster: string): SolanaChain {
  if (cluster === "devnet") return "solana:devnet";
  if (cluster === "local") return "solana:localnet";
  throw new Error(`no MWA chain for cluster "${cluster}"`);
}

export type RegisterOptions = { cluster: string; origin: string };

/** A registrar that registers at most once and returns the chain it registered. */
export function createMwaRegistrar(register: RegisterFn = registerMwa) {
  let done: SolanaChain | null = null;
  return function registerOnce({ cluster, origin }: RegisterOptions): SolanaChain {
    if (done) return done;
    const chain = chainOf(cluster);
    register({
      // The icon is relative to the origin: under the base path (/dev0x), the root's favicon is the landing's.
      appIdentity: { name: "Brot Markets", uri: origin, icon: asset("/favicon.ico").slice(1) },
      authorizationCache: createDefaultAuthorizationCache(),
      chains: [chain],
      chainSelector: createDefaultChainSelector(),
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    });
    done = chain;
    return chain;
  };
}

export const registerMwaOnce = createMwaRegistrar();
