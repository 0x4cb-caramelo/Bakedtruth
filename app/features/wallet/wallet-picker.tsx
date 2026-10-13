/**
 * Purpose: "Connect" opens this list (the approved prototype's "Connect a wallet" dialog, ui/wallet.js): every wallet
 *          the browser has, detected ones first and the missing ones greyed, and the one a person picks is selected
 *          and connected (S1: only from that click; no auto-connect). What the wallet answers when it does not connect
 *          shows here, never swallowed: a refusal, a locked wallet or the wrong network used to look like nothing. On
 *          Android the Mobile Wallet Adapter is one of the rows. One list for the whole site, opened by every Connect.
 *          The rows wait for hydration: on the server every adapter is "Unsupported", so a list built there differed
 *          from the browser's first render (React #418) and made the whole page render again.
 * Version: 0.1.1 (the rows after hydration; 0.1.0, the UI overhaul)
 * Sprint:  09 (site shell, theme and wallet), in the UI overhaul; the 2026-10-13 hydration fix
 */
"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { useIsClient } from "@/lib/use-is-client";
import { PICKER } from "./copy";

const Picker = createContext<{ open: () => void }>({ open: () => undefined });

/** Opens the "Connect a wallet" list. */
export const useWalletPicker = () => useContext(Picker);

const RANK: Record<WalletReadyState, number> = {
  [WalletReadyState.Installed]: 0,
  [WalletReadyState.Loadable]: 1,
  [WalletReadyState.NotDetected]: 2,
  [WalletReadyState.Unsupported]: 3,
};

const reasonOf = (error: unknown) => (error instanceof Error && error.message ? error.message : PICKER.unknown);

export function WalletPickerProvider({ children }: { children: ReactNode }) {
  const { wallets, wallet, select, connect, connected, connecting } = useWallet();
  const [open, setOpen] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  // The wallet a person picked: `select()` is asynchronous, so the connection starts once it is the selected one.
  const wanted = useRef<string | null>(null);

  const start = (name: string) =>
    connect().catch((error: unknown) => setFailure(PICKER.failed(name, reasonOf(error))));

  useEffect(() => {
    const name = wanted.current;
    if (!name || !wallet || wallet.adapter.name !== name || connected || connecting) return;
    wanted.current = null;
    void start(name);
    // `start` closes over `connect`, which is in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, connected, connecting, connect]);

  const pick = (name: string) => {
    setFailure(null);
    // A wallet already selected (remembered from an earlier visit) does not change on select(): connect it now.
    if (wallet?.adapter.name === name) return void start(name);
    wanted.current = name;
    select(name as Parameters<typeof select>[0]);
  };

  const client = useIsClient();
  const rows = client
    ? [...wallets]
        .filter((w) => w.readyState !== WalletReadyState.Unsupported)
        .sort((a, b) => RANK[a.readyState] - RANK[b.readyState])
    : [];
  return (
    <Picker.Provider value={{ open: () => (setFailure(null), setOpen(true)) }}>
      {children}
      <Dialog open={open && !connected} title={PICKER.title} onClose={() => setOpen(false)}>
        <div className="stack">
          {rows.map((w) => {
            const usable = w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable;
            const busy = connecting && wallet?.adapter.name === w.adapter.name;
            return (
              <button
                key={w.adapter.name}
                type="button"
                className="btn wide between"
                disabled={!usable || connecting}
                onClick={() => pick(w.adapter.name)}
              >
                <span className="inline-flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the wallet's own data-URI icon */}
                  <img src={w.adapter.icon} alt="" width={22} height={22} className="rounded" />
                  {w.adapter.name}
                </span>
                <span className="t-caption">
                  {busy
                    ? PICKER.connecting
                    : w.readyState === WalletReadyState.Installed
                      ? PICKER.detected
                      : w.readyState === WalletReadyState.Loadable
                        ? PICKER.ready
                        : PICKER.missing}
                </span>
              </button>
            );
          })}
          {failure ? (
            <p role="alert" className="notice danger">
              <AlertTriangle className="size-4" aria-hidden="true" />
              <span>{failure}</span>
            </p>
          ) : null}
          <div className="notice">
            <ShieldCheck className="size-[18px]" aria-hidden="true" />
            <p>{PICKER.safe}</p>
          </div>
          <p className="t-caption">{PICKER.devnet}</p>
        </div>
      </Dialog>
    </Picker.Provider>
  );
}
