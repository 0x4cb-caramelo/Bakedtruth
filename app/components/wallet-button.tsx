"use client";

import dynamic from "next/dynamic";

// The wallet button reads window state, so it must not render on the server.
export const WalletButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);
