"use client";

import { Loader2, Trophy } from "lucide-react";

import { formatUnits, formatUsdc, type ClockInfo } from "@/lib/format";
import { useSendTransaction, type MarketEntry } from "@/lib/hooks";
import { marketKeys, redeemIx, withdrawBudgetIx } from "@/lib/instructions";
import * as lib from "@/lib/market";
import { useProgram } from "@/lib/program";
import { big, statusOf } from "@/lib/view";
import { Card } from "@/components/primitives";
import type { Balances } from "@/components/market/trade-card";

function Action({ label, onClick, busy, tone = "brand" }: { label: string; onClick: () => void; busy: boolean; tone?: "brand" | "yes" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition disabled:opacity-60 ${
        tone === "yes" ? "bg-yes text-page hover:brightness-110" : "bg-brand text-white hover:bg-brand-strong"
      }`}
    >
      {busy && <Loader2 className="size-4 animate-spin" />}
      {label}
    </button>
  );
}

/** The connected wallet's YES/NO/USDC, redemption once resolved, and the sponsor's withdrawals. */
export function PositionCard({
  entry,
  clock,
  balances,
  onDone,
}: {
  entry: MarketEntry;
  clock: ClockInfo | null;
  balances: Balances;
  onDone: () => void;
}) {
  const program = useProgram();
  const { send, pending, publicKey } = useSendTransaction();
  const { account } = entry;
  const keys = marketKeys(entry.address, account.metricAccount);
  const status = statusOf(account);

  if (!publicKey) {
    return <Card className="p-5 text-sm text-dim">Connect a wallet to see your position.</Card>;
  }

  const winning = status === "yes" ? balances.yes : status === "no" ? balances.no : 0n;
  const redeem = async () => {
    const mint = status === "yes" ? keys.yesMint : keys.noMint;
    const ixs = [lib.createAtaIdempotentIx(publicKey, publicKey, lib.USDC_MINT), await redeemIx(program, keys, publicKey, mint)];
    if (await send(`Redeem ${formatUsdc(winning)} ${status.toUpperCase()}`, ixs)) onDone();
  };

  // Sponsor: the unspent budget once the sale is closed or nothing sold, its NO once NO wins.
  const isSponsor = account.sponsor.equals(publicKey);
  const budget = big(account.budget);
  const sponsorNo = big(account.sponsorNo);
  const saleClosed = (clock !== null && clock.slot >= Number(account.cutoffSlot.toString())) || status !== "active" || sponsorNo === 0n;
  const withdrawable = (saleClosed ? budget : 0n) + (status === "no" ? sponsorNo : 0n);
  const withdraw = async () => {
    if (await send(`Withdraw ${formatUsdc(withdrawable)} USDC`, [await withdrawBudgetIx(program, keys, publicKey)])) onDone();
  };

  const cell = (label: string, value: bigint, tone: string) => (
    <div className="rounded-xl bg-raised/60 p-3">
      <p className="text-xs text-dim">{label}</p>
      <p className={`mt-0.5 text-lg font-bold tabular-nums ${tone}`}>{formatUnits(value, 6, 2)}</p>
    </div>
  );

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-bold tracking-wider text-dim">YOUR POSITION</h3>
      <div className="grid grid-cols-3 gap-2">
        {cell("YES", balances.yes, "text-yes")}
        {cell("NO", balances.no, "text-no")}
        {cell("USDC", balances.usdc, "text-ink")}
      </div>
      {status === "active" && (balances.yes > 0n || balances.no > 0n) && (
        <p className="mt-3 text-xs text-dim">
          Pays <span className="text-yes">${formatUnits(balances.yes, 6, 2)}</span> if YES,{" "}
          <span className="text-no">${formatUnits(balances.no, 6, 2)}</span> if NO.
        </p>
      )}
      {status !== "active" && (
        <div className="mt-4 rounded-xl border border-yes/30 bg-yes/5 p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-yes">
            <Trophy className="size-4" /> {status.toUpperCase()} won
          </p>
          <p className="mt-1 text-xs text-muted">
            {winning > 0n
              ? `Your ${formatUsdc(winning)} ${status.toUpperCase()} redeem for ${formatUsdc(winning)} USDC.`
              : `No ${status.toUpperCase()} to redeem in this wallet.`}
          </p>
          {winning > 0n && <Action label="Redeem" onClick={() => void redeem()} busy={pending !== null} tone="yes" />}
        </div>
      )}
      {isSponsor && (
        <div className="mt-4 border-t border-line pt-4 text-sm">
          <p className="font-semibold text-ink">You sponsor this market</p>
          <p className="mt-1 text-xs text-muted">
            Budget left {formatUsdc(budget)} USDC · NO booked {formatUsdc(sponsorNo)}
          </p>
          {withdrawable > 0n ? (
            <Action label={`Withdraw ${formatUsdc(withdrawable)} USDC`} onClick={() => void withdraw()} busy={pending !== null} />
          ) : (
            <p className="mt-2 text-xs text-dim">
              {status === "active" ? "The budget unlocks at the cutoff." : "Nothing left to withdraw."}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
