"use client";

import { useState, type ReactNode } from "react";
import { ArrowRightLeft, Layers, Loader2, ShoppingCart, Trophy, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { formatBps, formatUnits, formatUsdc, parseUnits, type ClockInfo } from "@/lib/format";
import { useSendTransaction, useTokenBalances, type MarketEntry } from "@/lib/hooks";
import { buyViaPoolIxs, buyYesIx, marketKeys, mintPairIx, redeemIx } from "@/lib/instructions";
import * as lib from "@/lib/market";
import { useProgram } from "@/lib/program";
import { big, hasPool, kindOf, phaseOf, statusOf } from "@/lib/view";
import { Panel } from "@/components/ui";
import { WalletButton } from "@/components/wallet-button";

type Tab = "sale" | "pool" | "pair";
/** Slippage allowed on pool swaps: 1%. */
const SLIPPAGE_BPS = 100n;

const TABS: { id: Tab; label: string; icon: typeof ShoppingCart }[] = [
  { id: "sale", label: "Buy YES", icon: ShoppingCart },
  { id: "pool", label: "Pool", icon: ArrowRightLeft },
  { id: "pair", label: "Mint pair", icon: Layers },
];

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium tabular-nums text-zinc-200">{value}</span>
    </div>
  );
}

function AmountInput({
  value,
  onChange,
  symbol,
  onMax,
}: {
  value: string;
  onChange: (value: string) => void;
  symbol: string;
  onMax?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2.5 focus-within:border-emerald-400/50">
      <input
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-xl font-semibold tabular-nums text-zinc-100 outline-none placeholder:text-zinc-700"
        aria-label={`Amount in ${symbol}`}
      />
      {onMax && (
        <button
          type="button"
          onClick={onMax}
          className="rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-white/10"
        >
          Max
        </button>
      )}
      <span className="text-sm font-medium text-zinc-400">{symbol}</span>
    </div>
  );
}

function Submit({ label, disabled, busy, onClick }: { label: string; disabled: string | null; busy: boolean; onClick: () => void }) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled !== null || busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {label}
      </button>
      {disabled && <p className="text-center text-xs text-zinc-500">{disabled}</p>}
    </div>
  );
}

export function ActionPanel({ entry, clock, onChange }: { entry: MarketEntry; clock: ClockInfo | null; onChange: () => void }) {
  const program = useProgram();
  const { publicKey } = useWallet();
  const { send, pending } = useSendTransaction();
  const [tab, setTab] = useState<Tab>("sale");
  const [side, setSide] = useState<lib.Side>("yes");
  const [text, setText] = useState("");

  const { account, reading } = entry;
  const keys = marketKeys(entry.address, account.metricAccount);
  const balances = useTokenBalances(publicKey, [lib.USDC_MINT, keys.yesMint, keys.noMint]);
  const balance = (mint: { toBase58(): string }) => balances.data?.get(mint.toBase58()) ?? 0n;
  const usdc = balance(lib.USDC_MINT);

  const status = statusOf(account);
  // The program halts the sale and the pool once a ratchet goal is met; stake halts at its epoch.
  const goalMet = reading?.type !== "unavailable" && reading?.met === true && kindOf(account) !== "stakeAtLeast";
  const tradingOpen = status === "active" && phaseOf(account, clock) === "trading" && !goalMet;
  const tradingClosedReason = goalMet ? "Goal met: trading is halted until resolution." : "Trading is closed for this market.";

  const done = async (signature: string | null) => {
    if (!signature) return;
    setText("");
    balances.refresh();
    onChange();
  };

  // --- Resolved: redeem the winning side ---------------------------------------------------
  if (status !== "active") {
    const winningMint = status === "yes" ? keys.yesMint : keys.noMint;
    const held = balance(winningMint);
    const redeem = async () => {
      const ixs = [
        lib.createAtaIdempotentIx(publicKey!, publicKey!, lib.USDC_MINT),
        await redeemIx(program, keys, publicKey!, winningMint),
      ];
      await done(await send(`Redeem ${formatUsdc(held)} ${status.toUpperCase()}`, ixs));
    };
    return (
      <Panel title="Redeem" icon={Trophy}>
        <p className="text-sm text-zinc-400">
          {status.toUpperCase()} won. Each {status.toUpperCase()} token redeems for 1 USDC; the other side is worthless.
        </p>
        <div className="mt-4 space-y-2 rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <Row label={`Your ${status.toUpperCase()}`} value={publicKey ? formatUsdc(held) : "—"} />
          <Row label="Redeems for" value={publicKey ? `${formatUsdc(held)} USDC` : "—"} />
        </div>
        <div className="mt-4">
          {publicKey ? (
            <Submit
              label="Redeem"
              busy={pending !== null}
              disabled={held === 0n ? `No ${status.toUpperCase()} to redeem in this wallet.` : null}
              onClick={redeem}
            />
          ) : (
            <WalletButton />
          )}
        </div>
      </Panel>
    );
  }

  // --- Open market: sale, pool, pairs ---------------------------------------------------------
  const amount = parseUnits(text, lib.USDC_DECIMALS);
  const priceBps = account.yesPriceBps;
  const pool: lib.Pool = { yes: big(account.poolYes), no: big(account.poolNo) };

  let disabled: string | null = null;
  let summary: ReactNode = null;
  let action: (() => Promise<void>) | null = null;
  let actionLabel = "";
  let max: bigint | null = null;

  if (tab === "sale") {
    const saleMax = lib.maxSaleAmount(big(account.budget), priceBps);
    const affordable = (usdc * lib.BPS_DENOMINATOR) / BigInt(priceBps);
    max = saleMax < affordable ? saleMax : affordable;
    const cost = amount ? lib.salePrice(amount, priceBps) : 0n;
    actionLabel = "Buy YES";
    summary = (
      <>
        <Row label="Sale price" value={formatBps(priceBps)} />
        <Row label="You pay" value={`${formatUsdc(cost)} USDC`} />
        <Row label="Pays out if YES" value={`${formatUsdc(amount ?? 0n)} USDC`} />
        <Row label="Left in the sale" value={`${formatUnits(saleMax, 6, 2)} YES`} />
      </>
    );
    if (!tradingOpen) disabled = tradingClosedReason;
    else if (saleMax === 0n) disabled = "The sale is sold out. Buy through the pool or mint pairs.";
    else if (!amount) disabled = "Enter how many YES to buy.";
    else if (amount < lib.MIN_STAKE) disabled = "The minimum purchase is 1 YES.";
    else if (amount > saleMax) disabled = "The sponsor's budget cannot cover that many.";
    else if (cost > usdc) disabled = "Not enough USDC.";
    action = async () => {
      await done(await send(`Buy ${formatUsdc(amount!)} YES`, [await buyYesIx(program, keys, publicKey!, amount!)]));
    };
  } else if (tab === "pool") {
    max = usdc;
    const quote = amount ? lib.buyQuote(side, amount, pool) : null;
    const minOut = quote ? (quote.swapOut * (lib.BPS_DENOMINATOR - SLIPPAGE_BPS)) / lib.BPS_DENOMINATOR : 0n;
    const label = side.toUpperCase();
    actionLabel = `Buy ${label}`;
    summary = (
      <>
        <Row label="Pool YES price" value={hasPool(account) ? formatBps(lib.poolYesPriceBps(pool) ?? 0) : "No liquidity"} />
        <Row label="You receive" value={quote ? `≈ ${formatUnits(quote.tokensOut, 6, 4)} ${label}` : "—"} />
        <Row
          label="Average price"
          value={quote && quote.tokensOut > 0n ? formatBps(Number((amount! * lib.BPS_DENOMINATOR) / quote.tokensOut)) : "—"}
        />
        <Row label="Max slippage" value={formatBps(Number(SLIPPAGE_BPS))} />
      </>
    );
    if (!tradingOpen) disabled = tradingClosedReason;
    else if (!hasPool(account)) disabled = "The pool has no liquidity yet.";
    else if (!amount) disabled = "Enter how much USDC to spend.";
    else if (amount < lib.MIN_STAKE) disabled = "The minimum is 1 USDC.";
    else if (amount > usdc) disabled = "Not enough USDC.";
    else if (quote!.swapOut === 0n) disabled = "Amount too small for the pool.";
    action = async () => {
      const ixs = await buyViaPoolIxs(program, keys, publicKey!, side, amount!, minOut);
      await done(await send(`Buy ${label} through the pool`, ixs));
    };
  } else {
    max = usdc;
    actionLabel = "Mint pair";
    summary = (
      <>
        <Row label="You deposit" value={`${formatUsdc(amount ?? 0n)} USDC`} />
        <Row label="You receive" value={`${formatUsdc(amount ?? 0n)} YES + ${formatUsdc(amount ?? 0n)} NO`} />
      </>
    );
    if (!amount) disabled = "Enter how much USDC to deposit.";
    else if (amount < lib.MIN_STAKE) disabled = "The minimum is 1 USDC.";
    else if (amount > usdc) disabled = "Not enough USDC.";
    action = async () => {
      await done(await send(`Mint ${formatUsdc(amount!)} pairs`, [await mintPairIx(program, keys, publicKey!, amount!)]));
    };
  }

  const blurb: Record<Tab, string> = {
    sale: "Buy YES at the sponsor's fixed price. The sponsor's budget pays the rest of each token, so it redeems for 1 USDC if the goal is met.",
    pool: "Mint a pair and swap the other side into the pool, in one transaction. Prices move with the pool.",
    pair: "Deposit USDC for the same number of YES and NO. A pair is always worth its USDC; burn it back any time before resolution.",
  };

  return (
    <Panel title="Trade" icon={Wallet}>
      <div role="tablist" className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-zinc-950/60 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setText("");
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition ${
              tab === id ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs leading-relaxed text-zinc-500">{blurb[tab]}</p>

      {tab === "pool" && (
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-zinc-950/60 p-1 text-sm">
          {(["yes", "no"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={`rounded-md py-1.5 font-medium transition ${
                side === s
                  ? s === "yes"
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-rose-400/15 text-rose-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Buy {s.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <AmountInput
        value={text}
        onChange={setText}
        symbol={tab === "sale" ? "YES" : "USDC"}
        onMax={publicKey && max !== null && max > 0n ? () => setText(formatUnits(max, 6).replace(/,/g, "")) : undefined}
      />

      <div className="my-4 space-y-2 rounded-xl border border-white/5 bg-white/[0.03] p-4">{summary}</div>

      {publicKey ? (
        <Submit label={actionLabel} busy={pending !== null} disabled={disabled} onClick={() => void action?.()} />
      ) : (
        <div className="flex justify-center">
          <WalletButton />
        </div>
      )}

      {publicKey && (
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center text-xs">
          {[
            ["USDC", usdc],
            ["YES", balance(keys.yesMint)],
            ["NO", balance(keys.noMint)],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-zinc-500">{label as string}</p>
              <p className="mt-0.5 font-medium tabular-nums text-zinc-200">{formatUnits(value as bigint, 6, 2)}</p>
            </div>
          ))}
        </div>
      )}
      {publicKey && balances.data && usdc === 0n && (
        <p className="mt-3 text-center text-xs text-zinc-500">
          No USDC in this wallet.{" "}
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300">
            Get devnet USDC
          </a>
        </p>
      )}
    </Panel>
  );
}
