/**
 * Purpose: the campaign page at /c/[id] (Sprint 11; spec 3.5 of Sprint -1): the header, the proof, the pot, the recent
 *          entries, the re-check panel, and the entry panel, or the state card once entries close or when the site takes
 *          none (K-11). Two columns on a wide screen, the panel sticky on the right; under 860 px one column in the
 *          spec's phone order, so the reading order follows what is seen. Everything reads the chain through the SDK.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { bytesToHex, Direction, ReaderKind } from "@/lib/brot";
import { sentenceOf } from "@/features/campaigns/sentence";
import { EntryPanel, type Prefill } from "@/features/entry/entry-panel";
import { ActivityPanel } from "./activity-panel";
import { CampaignHeader } from "./campaign-header";
import { PAGE } from "./copy";
import { campaignIdFrom, type PageData } from "./load";
import { PotPanel, YourEntry } from "./pot-panel";
import { proofOf } from "./proof";
import { ProofPanel } from "./proof-panel";
import { RecheckPanel } from "./recheck-panel";
import { StateCard } from "./state-card";
import { useCampaignPage, useEntriesAllowed } from "./use-campaign-page";

const PHONE = "(max-width: 860px)";
const subscribe = (notify: () => void) => {
  const query = matchMedia(PHONE);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const usePhone = () =>
  useSyncExternalStore(
    subscribe,
    () => matchMedia(PHONE).matches,
    () => false,
  );

const sentence = (data: PageData) =>
  sentenceOf({
    kind: ReaderKind[data.campaign.kind],
    direction: Direction[data.campaign.direction],
    feedIdHex: bytesToHex(data.campaign.feedId),
    target: data.campaign.target.toString(),
    priceExponent: data.campaign.priceExponent,
    metricAccount: data.campaign.metricAccount,
  });

export function CampaignPage({ idParam, prefill }: { idParam: string; prefill: Prefill }) {
  const id = campaignIdFrom(idParam);
  const { publicKey } = useWallet();
  const { state, reload } = useCampaignPage(id, publicKey?.toBase58() ?? null);
  const allowed = useEntriesAllowed();
  const phone = usePhone();
  const [round, setRound] = useState(0);
  const landed = useCallback(() => (setRound((n) => n + 1), reload()), [reload]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-3" aria-busy="true">
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (state.status === "missing") {
    return <EmptyState title={PAGE.notFound}>{PAGE.notFoundText(idParam)}</EmptyState>;
  }
  if (state.status === "error") {
    return <EmptyState title={PAGE.loadFailed}>{PAGE.loadFailedText}</EmptyState>;
  }

  const { data } = state;
  const proof = proofOf(data.campaign, data.metric, data.chain);
  const title = sentence(data);
  const taking = data.view.state === "Open" && allowed === true;
  const blocks = {
    head: <CampaignHeader key="head" data={data} proof={proof} sentence={title} />,
    proof: <ProofPanel key="proof" data={data} proof={proof} />,
    pot: <PotPanel key="pot" data={data} />,
    activity: <ActivityPanel key="activity" campaign={data.address} round={round} />,
    recheck: <RecheckPanel key="recheck" data={data} proof={proof} />,
    panel: taking ? (
      <EntryPanel key="panel" data={data} proof={proof} sentence={title} prefill={prefill} onLanded={landed} />
    ) : (
      <StateCard key="panel" data={data} entriesTaken={allowed !== false} />
    ),
    mine: <YourEntry key="mine" entry={data.mine} />,
  };
  const stale = state.failed ? <p className="m-0 text-xs text-warn">{PAGE.loadFailedText}</p> : null;
  if (phone) {
    return (
      <div className="space-y-4">
        {stale}
        {[blocks.head, blocks.pot, blocks.panel, blocks.mine, blocks.proof, blocks.activity, blocks.recheck]}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
      <div className="space-y-4">
        {stale}
        {[blocks.head, blocks.proof, blocks.pot, blocks.activity, blocks.recheck]}
      </div>
      <div className="sticky top-4 space-y-4">{[blocks.panel, blocks.mine]}</div>
    </div>
  );
}
