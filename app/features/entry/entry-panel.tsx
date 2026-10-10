/**
 * Purpose: the entry panel of the campaign page (Sprint 11; spec 3.6 of Sprint -1): YES or NO, the amount in SOL (the
 *          campaign's minimum, 0.01 SOL under P-5), the estimate net of the fee and the creator's share with the entry
 *          counted (the SDK's number), the rents, the notices a baker reads before signing, and one button that fits
 *          the wallet: connect, devnet faucet, paused, waiting for a fresh price, or "Review entry". Nothing here signs:
 *          the review and the signature are use-entry-flow.ts's, behind the SDK's preparation (A-3).
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { OperatingLevel, formatUtc } from "@/lib/brot";
import { CLUSTER } from "@/lib/config";
import { useInstalledWallet } from "@/features/wallet/use-installed-wallet";
import { useSolBalance } from "@/features/wallet/use-sol-balance";
import { FAUCET_URL, walletView } from "@/features/wallet/wallet-state";
import type { PageData } from "@/features/campaign-page/load";
import type { Proof } from "@/features/campaign-page/proof";
import { LAMPORTS_PER_SOL, parseSol, sol4, solText } from "./amount";
import { AmountField } from "./amount-field";
import { PANEL } from "./copy";
import { EstimateBlock } from "./entry-estimate";
import { EntryNotices } from "./entry-notices";
import { EntrySheet } from "./entry-sheet";
import { chance, estimateEntry, lowersItsSide, perOne, type EntrySide, type JoinInputs } from "./estimate";
import { SidePicker } from "./side-picker";
import { useEntryFlow } from "./use-entry-flow";
import { BASE_FEE, useRents } from "./use-rents";

export type Prefill = { side?: EntrySide; amount?: bigint };

const safely = (inputs: JoinInputs | null, side: EntrySide, amount: bigint) => {
  try {
    return inputs ? estimateEntry(inputs, side, amount) : null;
  } catch {
    return null;
  }
};

export function EntryPanel({
  data,
  proof,
  sentence,
  prefill,
  onLanded,
}: {
  data: PageData;
  proof: Proof;
  sentence: string;
  prefill: Prefill;
  onLanded: () => void;
}) {
  const { publicKey, connected } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const connect = useInstalledWallet();
  const [landings, setLandings] = useState(0);
  const balance = useSolBalance(landings);
  const rents = useRents();
  const [side, setSide] = useState<EntrySide>(prefill.side ?? "yes");
  const [text, setText] = useState(prefill.amount ? solText(prefill.amount) : "1");
  const [fromLink, setFromLink] = useState(prefill.amount !== undefined);
  const amountRef = useRef<HTMLInputElement>(null);
  const flow = useEntryFlow({
    campaign: data.address,
    wallet,
    onLanded: () => (setLandings((n) => n + 1), onLanded()),
  });

  const c = data.campaign;
  const inputs = data.metric
    ? { campaign: c, config: data.config, entry: data.mine, metric: data.metric, chain: data.chain }
    : null;
  const amount = parseSol(text);
  const estimate = amount !== null ? safely(inputs, side, amount) : null;
  const smallest = safely(inputs, side, c.minEntryLamports);
  const large =
    estimate?.ok && smallest?.ok && lowersItsSide(estimate.bps, smallest.bps)
      ? { mine: perOne(estimate.bps), small: perOne(smallest.bps) }
      : null;
  const odds = chance(c.poolYes, c.poolNo);
  const views = (["yes", "no"] as const).map((s) => {
    const one = safely(inputs, s, LAMPORTS_PER_SOL);
    const alone = (s === "yes" ? c.poolNo : c.poolYes) === 0n;
    return { side: s, chance: odds ? odds[s] : null, perOne: one?.ok && !alone ? perOne(one.bps) : null, alone };
  });
  const rent = rents ? rents.join + (data.mine ? 0n : rents.entry) : null;
  const spare = balance !== null && rent !== null ? balance - rent - BASE_FEE : null;
  const short = amount !== null && spare !== null && amount > spare;
  const shown = walletView({ address: wallet, lamports: balance, cluster: CLUSTER });
  const noSol = shown.kind === "connected" && shown.noSol;
  const paused = data.config.operatingLevel !== OperatingLevel.Normal;
  const stale = proof.price !== null && !proof.price.fresh;
  const context = {
    asset: proof.price?.symbol ?? null,
    maxAge: c.maxAge,
    minEntry: solText(c.minEntryLamports),
    need:
      amount !== null && rent !== null
        ? { amount: sol4(amount, "up"), rents: sol4(rent, "up"), fee: sol4(BASE_FEE, "up") }
        : undefined,
  };
  const facts = {
    sentence,
    campaignId: c.id.toString(),
    feeBps: c.feeBps,
    creatorShareBps: c.creatorShareBps,
    oneSidedFeeBps: c.oneSidedFeeBps,
    fromLink,
    firstEntry: !data.mine,
    large,
  };
  const review = () =>
    wallet && amount !== null && flow.review({ campaign: data.address, baker: wallet, side, amount });
  const onText = (next: string) => (setText(next), setFromLink(false));

  return (
    <section aria-labelledby="entry-title" className="space-y-3 rounded-md border border-line bg-panel p-4">
      <h2
        id="entry-title"
        className="m-0 flex flex-wrap items-baseline justify-between gap-2 font-display text-2xl font-bold"
      >
        {PANEL.title}
        <span className="font-sans text-xs font-normal text-muted">{PANEL.closes(formatUtc(c.entriesCloseAt))}</span>
      </h2>
      <SidePicker value={side} views={views} onChange={setSide} />
      <AmountField
        text={text}
        onText={onText}
        fromLink={fromLink}
        minEntry={c.minEntryLamports}
        balance={balance}
        connected={connected}
        spare={spare}
        inputRef={amountRef}
      />
      <EstimateBlock
        estimate={estimate}
        side={side}
        amount={amount}
        oneSidedFeeBps={c.oneSidedFeeBps}
        context={context}
      />
      {rent !== null ? (
        <p className="m-0 text-xs text-muted">
          {data.mine ? PANEL.rentAgain(sol4(rent, "up")) : PANEL.rentFirst(sol4(rent, "up"))}
        </p>
      ) : null}
      <EntryNotices
        feeBps={c.feeBps}
        creatorShareBps={c.creatorShareBps}
        oneSidedFeeBps={c.oneSidedFeeBps}
        large={large}
      />
      {noSol || short ? <p className="m-0 rounded-sm bg-notice-bg px-3 py-2 text-xs">{PANEL.noSol}</p> : null}
      {paused ? (
        <Button wide disabled>
          {PANEL.paused}
        </Button>
      ) : stale ? (
        <Button wide disabled>
          {PANEL.waitingPrice}
        </Button>
      ) : !connected ? (
        <Button wide disabled={!connect.installed || connect.connecting} onClick={connect.connectInstalled}>
          {connect.connecting ? PANEL.connecting : connect.installed ? PANEL.connect : PANEL.noWallet}
        </Button>
      ) : (noSol || short) && CLUSTER === "devnet" ? (
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="block rounded-sm bg-cta-bg px-4 py-2.5 text-center text-sm font-semibold text-on-accent hover:bg-cta-hover"
        >
          {PANEL.faucet}
        </a>
      ) : (
        <Button wide disabled={!estimate?.ok || short || flow.state.step === "preparing"} onClick={review}>
          {flow.state.step === "preparing" ? PANEL.preparing : PANEL.review}
        </Button>
      )}
      <EntrySheet
        state={flow.state}
        facts={facts}
        context={context}
        onSign={flow.sign}
        onAgain={() => (flow.state.step === "failed" ? flow.review(flow.state.choice) : flow.reset())}
        onAmount={() => (flow.reset(), amountRef.current?.focus())}
        onClose={flow.reset}
      />
    </section>
  );
}
