/**
 * Purpose: the site's wallet control (Sprint 09, S1): "Use Installed Wallet" connects only from that click, through the
 *          installed wallet the site registered (MWA on Android, or an installed browser wallet). Connected, it shows the
 *          short address, the SOL balance, the faucet link when the wallet has no SOL on devnet, and Disconnect.
 * Version: 0.1.1 (the connection moved to features/wallet/use-installed-wallet.ts, shared with the entry panel)
 * Sprint:  09 (site shell, theme and wallet)
 */
"use client";

import { useWallet } from "@solana/wallet-adapter-react";

import { CLUSTER } from "@/lib/config";
import { useInstalledWallet } from "@/features/wallet/use-installed-wallet";
import { useSolBalance } from "@/features/wallet/use-sol-balance";
import { walletView, FAUCET_URL } from "@/features/wallet/wallet-state";

export function WalletButton() {
  const { disconnect, connected, publicKey } = useWallet();
  const { installed, connecting, connectInstalled } = useInstalledWallet();
  const lamports = useSolBalance();

  if (!connected) {
    return (
      <button
        type="button"
        onClick={connectInstalled}
        disabled={!installed || connecting}
        className="rounded border-2 border-line px-3 py-1 text-sm text-ink disabled:opacity-50"
      >
        {installed ? "Use Installed Wallet" : "No installed wallet found"}
      </button>
    );
  }

  const view = walletView({ address: publicKey?.toBase58() ?? null, lamports, cluster: CLUSTER });
  if (view.kind !== "connected") return null;
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="font-mono text-ink">{shorten(view.address)}</span>
      <span className="text-dim">{view.sol === null ? "SOL …" : `${view.sol} SOL`}</span>
      {view.noSol && view.faucetUrl && (
        <a href={view.faucetUrl ?? FAUCET_URL} target="_blank" rel="noreferrer" className="text-brand underline">
          Get devnet SOL
        </a>
      )}
      <button
        type="button"
        onClick={() => void disconnect()}
        className="rounded border-2 border-line px-3 py-1 text-ink"
      >
        Disconnect
      </button>
    </div>
  );
}

const shorten = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;
