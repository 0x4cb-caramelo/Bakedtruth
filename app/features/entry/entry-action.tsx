/**
 * Purpose: the entry panel's one button, the one that fits the moment: entries paused, waiting for a fresh price,
 *          "Connect", the devnet faucet when the wallet cannot cover the entry, or "Review entry" (disabled
 *          while the program would refuse the entry or while it is being prepared). Nothing here signs.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { Button } from "@/components/ui/button";
import { CLUSTER } from "@/lib/config";
import { FAUCET_URL } from "@/features/wallet/wallet-state";
import { PANEL } from "./copy";

export function EntryAction(a: {
  paused: boolean;
  stale: boolean;
  connected: boolean;
  wallet: { installed: boolean; connecting: boolean; connectInstalled: () => void };
  /** The wallet holds too little for the entry, the rents and the fee. */
  short: boolean;
  canReview: boolean;
  preparing: boolean;
  onReview: () => void;
}) {
  if (a.paused) {
    return (
      <Button wide disabled>
        {PANEL.paused}
      </Button>
    );
  }
  if (a.stale) {
    return (
      <Button wide disabled>
        {PANEL.waitingPrice}
      </Button>
    );
  }
  if (!a.connected) {
    const { installed, connecting, connectInstalled } = a.wallet;
    return (
      <Button wide disabled={!installed || connecting} onClick={connectInstalled}>
        {connecting ? PANEL.connecting : installed ? PANEL.connect : PANEL.noWallet}
      </Button>
    );
  }
  if (a.short && CLUSTER === "devnet") {
    return (
      <a
        href={FAUCET_URL}
        target="_blank"
        rel="noreferrer"
        className="block rounded-sm bg-cta-bg px-4 py-2.5 text-center text-sm font-semibold text-on-accent hover:bg-cta-hover"
      >
        {PANEL.faucet}
      </a>
    );
  }
  return (
    <Button wide disabled={!a.canReview || a.short || a.preparing} onClick={a.onReview}>
      {a.preparing ? PANEL.preparing : PANEL.review}
    </Button>
  );
}
