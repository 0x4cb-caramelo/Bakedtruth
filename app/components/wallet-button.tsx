/**
 * Purpose: the top bar's wallet control (Sprint 09, S1), in the approved prototype's look (prototype-lab/campaigns,
 *          ui/wallet.js): "Connect" as the primary button connects only from that click, through the
 *          installed wallet the site registered (MWA on Android, or an installed browser wallet). Connected, a chip
 *          shows the short address and the SOL balance, amber when the wallet has no SOL, and opens a menu: the
 *          faucet link on devnet when there is no SOL, copy the address, the explorer, my entries, and Disconnect.
 * Version: 0.2.0 (the UI overhaul: the prototype's chip and menu; 0.1.1 moved the connection to use-installed-wallet.ts)
 * Sprint:  09 (site shell, theme and wallet)
 */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChevronDown, Copy, ExternalLink, Receipt, Wallet, X } from "lucide-react";

import { cx } from "@/components/ui/cx";
import { CLUSTER, explorerAddress } from "@/lib/config";
import { useInstalledWallet } from "@/features/wallet/use-installed-wallet";
import { useSolBalance } from "@/features/wallet/use-sol-balance";
import { walletView, FAUCET_URL } from "@/features/wallet/wallet-state";

export function WalletButton() {
  const { disconnect, connected, publicKey } = useWallet();
  const { installed, connecting, connectInstalled } = useInstalledWallet();
  const lamports = useSolBalance();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => !box.current?.contains(event.target as Node) && setOpen(false);
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (!connected) {
    return (
      <button
        type="button"
        className="cta"
        onClick={connectInstalled}
        disabled={!installed || connecting}
        aria-busy={connecting || undefined}
      >
        <span>
          <Wallet className="size-[15px]" aria-hidden="true" />
          {installed ? (
            "Connect"
          ) : (
            <>
              <span className="long">No installed wallet found</span>
              <span className="short">No wallet found</span>
            </>
          )}
        </span>
      </button>
    );
  }
  const view = walletView({ address: publicKey?.toBase58() ?? null, lamports, cluster: CLUSTER });
  if (view.kind !== "connected") return null;
  const balance = view.sol === null ? "SOL …" : `${view.sol} SOL`;
  const address = shorten(view.address);
  const close = () => setOpen(false);
  return (
    <div ref={box}>
      <button
        type="button"
        className={cx("wallet-on", view.noSol && "warn")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Wallet ${address}, ${balance}`}
        onClick={() => setOpen((was) => !was)}
      >
        <span className="dot" aria-hidden="true" />
        <span className="addr">{address}</span>
        <span className="bal">{balance}</span>
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </button>
      {open ? (
        <div className="menu" role="menu">
          <div className="menu-head">
            <b>{address}</b>Devnet · {balance}
          </div>
          {view.noSol ? (
            <>
              <p className="help">This wallet has no SOL. On devnet, test SOL is free from a faucet.</p>
              <a role="menuitem" href={view.faucetUrl ?? FAUCET_URL} target="_blank" rel="noreferrer" onClick={close}>
                <ExternalLink className="size-4" aria-hidden="true" />
                Get devnet SOL
              </a>
            </>
          ) : null}
          <button role="menuitem" type="button" onClick={() => void navigator.clipboard?.writeText(view.address).then(close)}>
            <Copy className="size-4" aria-hidden="true" />
            Copy address
          </button>
          <a role="menuitem" href={explorerAddress(view.address)} target="_blank" rel="noreferrer" onClick={close}>
            <ExternalLink className="size-4" aria-hidden="true" />
            View on explorer
          </a>
          <Link role="menuitem" href="/my-entries" onClick={close}>
            <Receipt className="size-4" aria-hidden="true" />
            My entries
          </Link>
          <button role="menuitem" type="button" onClick={() => (close(), void disconnect())}>
            <X className="size-4" aria-hidden="true" />
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}

const shorten = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;
