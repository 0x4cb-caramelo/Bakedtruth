"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { formatBps, formatUnits, formatUsdc, parseUnits, type ClockInfo } from "@/lib/format";
import { useSendTransaction, type MarketEntry } from "@/lib/hooks";
import { burnPairIx, buyViaPoolIxs, buyYesIx, marketKeys, mintPairIx, swapIx } from "@/lib/instructions";
import * as lib from "@/lib/market";
import { questionText } from "@/lib/metric";
import { useProgram } from "@/lib/program";
import { big, hasPool, kindOf, phaseOf, statusOf, yesPrice } from "@/lib/view";
import { Card } from "@/components/primitives";

type Mode = "buy" | "sell" | "pairs";
export type Balances = { usdc: bigint; yes: bigint; no: bigint; loaded: boolean };

/** Slippage allowed on pool swaps: 1%. */
const SLIPPAGE = 100n;
const N = lib.BPS_DENOMINATOR;
const min = (a: bigint, b: bigint) => (a < b ? a : b);
const cents = (bps: number) => `${Math.round(bps / 100)}¢`;
const usd = (base: bigint) => `$${formatUnits(base, 6, 2)}`;

function Row({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`text-right tabular-nums ${strong ? "text-2xl font-bold text-yes" : "font-medium text-ink"}`}>{value}</span>
    </div>
  );
}

export function TradeCard({
  entry,
  clock,
  side,
  onSide,
  balances,
  onDone,
}: {
  entry: MarketEntry;
  clock: ClockInfo | null;
  side: lib.Side;
  onSide: (side: lib.Side) => void;
  balances: Balances;
  onDone: () => void;
}) {
  const program = useProgram();
  const { send, pending, publicKey } = useSendTransaction();
  const { setVisible } = useWalletModal();
  const [mode, setMode] = useState<Mode>("buy");
  const [pairAction, setPairAction] = useState<"mint" | "burn">("mint");
  const [text, setText] = useState("");

  const { account, reading } = entry;
  const keys = marketKeys(entry.address, account.metricAccount);
  const status = statusOf(account);
  const goalMet = reading?.type !== "unavailable" && reading?.met === true && kindOf(account) !== "stakeAtLeast";
  const open = status === "active" && phaseOf(account, clock) === "trading" && !goalMet;
  const closedReason = goalMet ? "Goal met: trading is halted until someone resolves." : "Trading is closed for this market.";

  const price = yesPrice(account).bps;
  const sidePrice = side === "yes" ? price : 10_000 - price;
  const pool: lib.Pool = { yes: big(account.poolYes), no: big(account.poolNo) };
  const held = side === "yes" ? balances.yes : balances.no;
  const amount = parseUnits(text, 6);

  let rows: ReactNode = null;
  let disabled: string | null = null;
  let label = "";
  let run: (() => Promise<unknown>) | null = null;
  let chips: { label: string; value: bigint }[] = [];
  let unit = "$";

  if (mode === "buy") {
    const saleMax = lib.maxSaleAmount(big(account.budget), account.yesPriceBps);
    const saleShares =
      side === "yes" && open && amount ? min((amount * N) / BigInt(account.yesPriceBps), saleMax) : 0n;
    const poolQuote = open && hasPool(account) && amount && amount >= lib.MIN_STAKE ? lib.buyQuote(side, amount, pool) : null;
    const useSale = saleShares >= lib.MIN_STAKE && (!poolQuote || saleShares >= poolQuote.tokensOut);
    const shares = useSale ? saleShares : (poolQuote?.tokensOut ?? 0n);
    const cost = useSale ? lib.salePrice(saleShares, account.yesPriceBps) : (amount ?? 0n);
    label = `Buy ${side.toUpperCase()}`;
    chips = [1n, 5n, 10n, 25n].map((d) => ({ label: `+$${d}`, value: (amount ?? 0n) + d * 1_000_000n }));
    rows = (
      <>
        <Row label="Odds" value={`${formatBps(sidePrice)} chance`} />
        <Row label="Route" value={shares === 0n ? "—" : useSale ? `Sponsor sale @ ${cents(account.yesPriceBps)}` : "Pool"} />
        <Row label="Shares" value={shares === 0n ? "—" : formatUnits(shares, 6, 2)} />
        <Row label="Avg price" value={shares === 0n ? "—" : `${((Number(cost) / Number(shares)) * 100).toFixed(1)}¢`} />
        <Row
          label={
            <span>
              Payout if {side.toUpperCase()}
              <span className="block text-xs text-dim">You pay {usd(cost)}</span>
            </span>
          }
          value={usd(shares)}
          strong
        />
      </>
    );
    if (!open) disabled = closedReason;
    else if (side === "no" && !hasPool(account)) disabled = "No NO liquidity yet. Mint a pair under PAIRS to hold NO.";
    else if (!amount) disabled = "Enter an amount.";
    else if (shares === 0n)
      disabled = hasPool(account) || saleMax >= lib.MIN_STAKE ? "Amount too small: the minimum is 1 share or $1 through the pool." : "Sold out, and the pool has no liquidity.";
    else if (cost > balances.usdc) disabled = "Not enough USDC.";
    run = async () => {
      if (useSale) return send(`Buy ${formatUsdc(saleShares)} YES`, [await buyYesIx(program, keys, publicKey!, saleShares)]);
      const minOut = (poolQuote!.swapOut * (N - SLIPPAGE)) / N;
      return send(`Buy ${side.toUpperCase()} for ${usd(amount!)}`, await buyViaPoolIxs(program, keys, publicKey!, side, amount!, minOut));
    };
  } else if (mode === "sell") {
    unit = "";
    const quote = hasPool(account) && amount ? lib.sellQuote(side, amount, pool) : null;
    const minOut = quote ? (quote.swapOut * (N - SLIPPAGE)) / N : 0n;
    const proceeds = quote ? min(amount! - quote.swapIn, minOut) : 0n;
    label = `Sell ${side.toUpperCase()}`;
    chips = [
      { label: "25%", value: held / 4n },
      { label: "50%", value: held / 2n },
      { label: "Max", value: held },
    ];
    rows = (
      <>
        <Row label={`Your ${side.toUpperCase()}`} value={formatUnits(held, 6, 2)} />
        <Row label="Avg price" value={quote && amount ? `${((Number(proceeds) / Number(amount)) * 100).toFixed(1)}¢` : "—"} />
        <Row label="You receive at least" value={usd(proceeds)} strong />
      </>
    );
    if (!open) disabled = `${closedReason} Hold to resolution, or burn pairs under PAIRS.`;
    else if (!hasPool(account)) disabled = "The pool has no liquidity to sell into.";
    else if (!amount) disabled = "Enter how many shares to sell.";
    else if (amount > held) disabled = `You hold ${formatUnits(held, 6, 2)} ${side.toUpperCase()}.`;
    else if (proceeds === 0n || quote!.swapIn === 0n) disabled = "Amount too small for the pool.";
    run = async () =>
      send(`Sell ${formatUnits(amount!, 6, 2)} ${side.toUpperCase()}`, [
        await swapIx(program, keys, publicKey!, side, quote!.swapIn, minOut),
        await burnPairIx(program, keys, publicKey!, proceeds),
      ]);
  } else {
    const pairs = min(balances.yes, balances.no);
    if (pairAction === "mint") {
      label = "Mint pairs";
      chips = [1n, 5n, 10n].map((d) => ({ label: `+$${d}`, value: (amount ?? 0n) + d * 1_000_000n }));
      rows = <Row label="You receive" value={`${formatUsdc(amount ?? 0n)} YES + ${formatUsdc(amount ?? 0n)} NO`} />;
      if (status !== "active") disabled = "The market is resolved.";
      else if (!amount) disabled = "Enter how much USDC to deposit.";
      else if (amount < lib.MIN_STAKE) disabled = "The minimum is $1.";
      else if (amount > balances.usdc) disabled = "Not enough USDC.";
      run = async () => send(`Mint ${formatUsdc(amount!)} pairs`, [await mintPairIx(program, keys, publicKey!, amount!)]);
    } else {
      unit = "";
      label = "Burn pairs";
      chips = [{ label: "Max", value: pairs }];
      rows = (
        <>
          <Row label="Pairs you hold" value={formatUnits(pairs, 6, 2)} />
          <Row label="You receive" value={usd(amount ?? 0n)} strong />
        </>
      );
      if (status !== "active") disabled = "The market is resolved: redeem the winning side instead.";
      else if (!amount) disabled = "Enter how many pairs to burn.";
      else if (amount > pairs) disabled = `You hold ${formatUnits(pairs, 6, 2)} pairs.`;
      run = async () => send(`Burn ${formatUsdc(amount!)} pairs`, [await burnPairIx(program, keys, publicKey!, amount!)]);
    }
  }

  const submit = async () => {
    if (!run) return;
    if (await run()) {
      setText("");
      onDone();
    }
  };

  const sideButton = (s: lib.Side) => {
    const on = side === s;
    const bps = s === "yes" ? price : 10_000 - price;
    return (
      <button
        key={s}
        type="button"
        onClick={() => onSide(s)}
        className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
          on
            ? s === "yes"
              ? "bg-yes text-page"
              : "bg-no text-page"
            : "bg-raised text-muted hover:text-ink"
        }`}
      >
        {s.toUpperCase()} {cents(bps)}
      </button>
    );
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between border-b border-line">
        <div className="flex gap-5">
          {(["buy", "sell", "pairs"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setText("");
              }}
              className={`relative pb-3 text-sm font-bold tracking-wider transition ${
                mode === m ? "text-ink" : "text-dim hover:text-muted"
              }`}
            >
              {m.toUpperCase()}
              {mode === m && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ink" />}
            </button>
          ))}
        </div>
        <span className="pb-3 text-xs font-semibold tracking-wider text-dim">USDC</span>
      </div>

      <p className="mb-3 line-clamp-2 text-sm font-semibold text-ink">{questionText(account, reading, entry.name)}</p>

      {mode === "pairs" ? (
        <div className="mb-4 flex gap-1 rounded-lg bg-raised p-1">
          {(["mint", "burn"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setPairAction(a);
                setText("");
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
                pairAction === a ? "bg-surface text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {a === "mint" ? "Mint YES + NO" : "Burn for USDC"}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-4 flex gap-2">{(["yes", "no"] as const).map(sideButton)}</div>
      )}

      <label className="flex items-center justify-between gap-3 rounded-xl border border-line bg-page px-4 py-3 focus-within:border-brand/60">
        <span className="text-sm text-muted">{unit ? "Dollars" : "Shares"}</span>
        <span className="flex min-w-0 items-baseline gap-0.5 text-right text-2xl font-bold text-ink">
          {unit && <span className={amount ? "" : "text-dim"}>{unit}</span>}
          <input
            inputMode="decimal"
            placeholder="0"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-w-0 bg-transparent text-right tabular-nums outline-none placeholder:text-dim"
            style={{ width: `${Math.max(1, text.length) + 0.5}ch` }}
            aria-label={unit ? "Amount in dollars" : "Amount in shares"}
          />
        </span>
      </label>
      {chips.length > 0 && (
        <div className="mt-2 flex justify-end gap-1.5">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setText(formatUnits(c.value, 6).replace(/,/g, ""))}
              className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-muted hover:border-muted hover:text-ink"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="my-4 space-y-2.5">{rows}</div>

      {publicKey ? (
        <button
          type="button"
          onClick={() => void submit()}
          disabled={disabled !== null || pending !== null}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition disabled:cursor-not-allowed disabled:bg-raised disabled:text-dim ${
            mode === "buy" ? (side === "yes" ? "bg-yes text-page hover:brightness-110" : "bg-no text-page hover:brightness-110") : "bg-brand text-white hover:bg-brand-strong"
          }`}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {label}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="h-12 w-full rounded-xl bg-brand text-[15px] font-bold text-white transition hover:bg-brand-strong"
        >
          Connect wallet to trade
        </button>
      )}
      {publicKey && disabled && <p className="mt-2 text-center text-xs text-dim">{disabled}</p>}
      {publicKey && balances.loaded && balances.usdc === 0n && (
        <p className="mt-3 text-center text-xs text-dim">
          No USDC in this wallet.{" "}
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="text-brand hover:underline">
            Get devnet USDC
          </a>
        </p>
      )}
    </Card>
  );
}
