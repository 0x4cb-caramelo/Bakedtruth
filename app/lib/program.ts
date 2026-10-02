"use client";

import { useMemo } from "react";
import { Program, type Idl, type Provider } from "@anchor-lang/core";
import { useConnection } from "@solana/wallet-adapter-react";

// Synced from target/ by `bun run sync-idl` after `anchor build`.
import idl from "./idl/pred_provable.json";
import type { PredProvable } from "./idl/pred_provable";

/**
 * Typed Anchor client on the app's connection. It reads accounts and builds instructions; the
 * wallet adapter signs and sends them, so it works before a wallet connects.
 */
export function useProgram(): Program<PredProvable> {
  const { connection } = useConnection();
  return useMemo(() => new Program<PredProvable>(idl as Idl, { connection } as Provider), [connection]);
}
