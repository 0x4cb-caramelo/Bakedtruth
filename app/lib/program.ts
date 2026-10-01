"use client";

import { useMemo } from "react";
import { AnchorProvider, Program, type Idl } from "@anchor-lang/core";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

// Synced from target/ by `bun run sync-idl` after `anchor build`.
import idl from "./idl/pred_provable.json";
import type { PredProvable } from "./idl/pred_provable";

/** Typed Anchor client bound to the connected wallet; null until a wallet connects. */
export function useProgram(): Program<PredProvable> | null {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    return new Program<PredProvable>(idl as Idl, provider);
  }, [connection, wallet]);
}
