"use client";

import dynamic from "next/dynamic";

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting…",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Connect",
} as const;

// The wallet button reads window state, so it must not render on the server.
export const WalletButton = dynamic(
  async () => {
    const { BaseWalletMultiButton } = await import("@solana/wallet-adapter-react-ui");
    return function WalletButton() {
      return <BaseWalletMultiButton labels={LABELS} />;
    };
  },
  { ssr: false, loading: () => <div className="h-10 w-24 rounded-[0.625rem] bg-brand/40" /> },
);
