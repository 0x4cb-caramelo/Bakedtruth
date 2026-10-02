"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { PublicKey, Transaction, type TransactionInstruction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { explorerTx } from "./config";
import type { ClockInfo } from "./format";
import idl from "./idl/pred_provable.json";
import { ataAddress } from "./market";
import { fetchReadings, parseTokenAmount, type Reading } from "./metric";
import { useProgram } from "./program";
import { big, type MarketAccount } from "./view";
import { useToast } from "@/components/toast";

export type Polled<T> = { data: T | undefined; error: Error | undefined; loading: boolean; refresh: () => void };

/**
 * Runs `fetcher` now and every `intervalMs` while `key` stays the same (null pauses it). Data from
 * a previous key is never returned, and a refresh keeps showing the current data while it loads.
 */
export function usePolling<T>(key: string | null, fetcher: () => Promise<T>, intervalMs: number): Polled<T> {
  const [state, setState] = useState<{ key: string | null; data?: T; error?: Error }>({ key: null });
  const [nonce, setNonce] = useState(0);
  const load = useEffectEvent(fetcher);

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    const run = async () => {
      try {
        const data = await load();
        if (!cancelled) setState({ key, data });
      } catch (error) {
        if (!cancelled) {
          setState((s) => ({ key, data: s.key === key ? s.data : undefined, error: error as Error }));
        }
      }
    };
    void run();
    const id = setInterval(run, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [key, intervalMs, nonce]);

  const current = key !== null && state.key === key;
  return {
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    loading: key !== null && !current,
    refresh: useCallback(() => setNonce((n) => n + 1), []),
  };
}

/** Current slot and epoch, with the cluster's recent ms per slot for turning slots into times. */
export function useClock(): ClockInfo | null {
  const { connection } = useConnection();
  const { data } = usePolling(
    "clock",
    async () => {
      const [info, samples] = await Promise.all([connection.getEpochInfo(), connection.getRecentPerformanceSamples(10)]);
      const slots = samples.reduce((sum, s) => sum + s.numSlots, 0);
      const seconds = samples.reduce((sum, s) => sum + s.samplePeriodSecs, 0);
      return {
        slot: info.absoluteSlot,
        epoch: info.epoch,
        msPerSlot: slots > 0 ? (seconds * 1000) / slots : 400,
        observedAt: Date.now(),
      };
    },
    15_000,
  );
  return data ?? null;
}

export type MarketEntry = { address: PublicKey; account: MarketAccount; reading?: Reading };

/** Every market, newest first, each with its KPI reading (batched reads). */
export function useMarkets() {
  const program = useProgram();
  return usePolling(
    "markets",
    async (): Promise<MarketEntry[]> => {
      const all = await program.account.market.all();
      const readings = await fetchReadings(program.provider.connection, all);
      return all
        .map(({ publicKey, account }) => ({ address: publicKey, account, reading: readings.get(publicKey.toBase58()) }))
        .sort((a, b) => (big(b.account.marketId) > big(a.account.marketId) ? 1 : -1));
    },
    20_000,
  );
}

/** One market and its reading, refreshed every few seconds; `null` data if the account does not exist. */
export function useMarket(address: string) {
  const program = useProgram();
  return usePolling(
    `market:${address}`,
    async (): Promise<MarketEntry | null> => {
      const key = new PublicKey(address);
      const account = await program.account.market.fetchNullable(key);
      if (!account) return null;
      const readings = await fetchReadings(program.provider.connection, [{ publicKey: key, account }], {
        withStake: true,
      });
      return { address: key, account, reading: readings.get(address) };
    },
    8_000,
  );
}

/** `owner`'s associated-account balance for each mint, in base units (0 when the account is missing). */
export function useTokenBalances(owner: PublicKey | null, mints: PublicKey[]) {
  const { connection } = useConnection();
  const key = owner ? `balances:${owner.toBase58()}:${mints.map((m) => m.toBase58()).join(",")}` : null;
  return usePolling(
    key,
    async () => {
      const infos = await connection.getMultipleAccountsInfo(mints.map((mint) => ataAddress(owner!, mint)));
      return new Map(mints.map((mint, i) => [mint.toBase58(), parseTokenAmount(infos[i] ?? null) ?? 0n]));
    },
    10_000,
  );
}

const PROGRAM_ERRORS = new Map(idl.errors.map((e) => [e.name, e.msg]));
const PROGRAM_ERROR_CODES = new Map(idl.errors.map((e) => [e.code, e.msg]));

/** Messages and logs from an error and its nested `error`/`cause` (wallet adapters wrap them). */
function errorText(error: unknown, depth = 0): string[] {
  if (depth > 3 || error === null || error === undefined) return [];
  if (typeof error !== "object") return [String(error)];
  const e = error as Record<string, unknown>;
  const lines = typeof e.message === "string" ? [e.message] : [];
  for (const logs of [e.logs, e.transactionLogs]) if (Array.isArray(logs)) lines.push(...logs.map(String));
  return [...lines, ...errorText(e.error, depth + 1), ...errorText(e.cause, depth + 1)];
}

/** A short, human message for a failed transaction, using the program's own error messages. */
export function describeError(error: unknown): string {
  const text = errorText(error).join("\n");
  const anchor = text.match(/Error Code: (\w+)/);
  if (anchor) return PROGRAM_ERRORS.get(anchor[1]!) ?? anchor[1]!;
  const custom = text.match(/custom program error: 0x([0-9a-f]+)/i);
  if (custom) {
    const code = parseInt(custom[1]!, 16);
    return PROGRAM_ERROR_CODES.get(code) ?? `Program error ${code}`;
  }
  if (/reject/i.test(text)) return "Request rejected in the wallet.";
  if (/insufficient (funds|lamports)/i.test(text)) return "Insufficient funds for this transaction.";
  return text.split("\n")[0]?.slice(0, 200) || "Transaction failed.";
}

/** Signs with the connected wallet, sends, waits for confirmation and reports the result as a toast. */
export function useSendTransaction() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const toast = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const send = useCallback(
    async (label: string, instructions: TransactionInstruction[]) => {
      if (!publicKey) return null;
      setPending(label);
      try {
        const { context, value } = await connection.getLatestBlockhashAndContext("confirmed");
        const tx = new Transaction({ feePayer: publicKey, ...value }).add(...instructions);
        const signature = await sendTransaction(tx, connection, { minContextSlot: context.slot });
        const result = await connection.confirmTransaction({ signature, ...value }, "confirmed");
        if (result.value.err) throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`);
        toast({ kind: "success", title: label, description: "Confirmed on-chain.", href: explorerTx(signature) });
        return signature;
      } catch (error) {
        toast({ kind: "error", title: `${label} failed`, description: describeError(error) });
        return null;
      } finally {
        setPending(null);
      }
    },
    [connection, publicKey, sendTransaction, toast],
  );

  return { send, pending, connected: publicKey !== null, publicKey };
}
