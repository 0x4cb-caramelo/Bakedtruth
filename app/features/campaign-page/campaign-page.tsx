/**
 * Purpose: the campaign page at /c/[id] (Sprint 11; spec 3.5 of Sprint -1): the header, the proof, the pot, the recent
 *          entries, the re-check panel, and the entry panel, or the state card once entries close or when the site takes
 *          none (K-11). Two columns on a wide screen, the panel sticky on the right; under 860 px one column in the
 *          spec's phone order, so the reading order follows what is seen. Everything reads the chain through the SDK.
 * Version: 0.3.0 (Sprint 13: "Report this campaign" in every state, C-10; 0.2.0, Sprint 12's states)
 * Sprint:  11 (site: campaign page and entry); 12 (site: my entries and campaign states); 13
 */
"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { bytesToHex, Direction, ReaderKind } from "@/lib/brot";
import { sentenceOf } from "@/features/campaigns/sentence";
import { EntryPanel, type Prefill } from "@/features/entry/entry-panel";
import { ReportCampaign } from "@/features/report/report-campaign";
import type { Unlisted } from "@/features/report/unlisted";
import { ActivityPanel } from "./activity-panel";
import { CampaignHeader } from "./campaign-header";
import { PAGE } from "./copy";
import { campaignIdFrom, type PageData } from "./load";
import { PayoutPanel } from "./payout-panel";
import { PotPanel } from "./pot-panel";
import { proofOf } from "./proof";
import { ProofPanel } from "./proof-panel";
import { RecheckPanel } from "./recheck-panel";
import { Report, StatePanel } from "./state-panel";
import { useCampaignPage, useEntriesAllowed } from "./use-campaign-page";
import { noteFor, type VoidNote } from "./void-note";

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

export function CampaignPage({
  idParam,
  prefill,
  notes,
  unlisted,
}: {
  idParam: string;
  prefill: Prefill;
  notes: VoidNote[];
  unlisted: Unlisted | null;
}) {
  const id = campaignIdFrom(idParam);
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { state, reload } = useCampaignPage(id, wallet);
  const allowed = useEntriesAllowed();
  const phone = usePhone();
  const [round, setRound] = useState(0);
  const [busy, setBusy] = useState(false);
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
    return state.closed ? (
      <EmptyState
        title={PAGE.closedAccount}
        action={
          <>
            <Report />
            <ReportCampaign id={idParam} unlisted={unlisted} />
          </>
        }
      >
        {PAGE.closedAccountText}
      </EmptyState>
    ) : (
      <EmptyState title={PAGE.notFound}>{PAGE.notFoundText(idParam)}</EmptyState>
    );
  }
  if (state.status === "error") {
    return <EmptyState title={PAGE.loadFailed}>{PAGE.loadFailedText}</EmptyState>;
  }

  const { data } = state;
  const proof = proofOf(data.campaign, data.metric, data.chain);
  const title = sentence(data);
  // While an entry is under way the panel stays, so its result shows even if entries close meanwhile.
  const taking = (data.view.state === "Open" && allowed === true) || busy;
  const blocks = {
    head: <CampaignHeader key="head" data={data} proof={proof} sentence={title} />,
    proof: <ProofPanel key="proof" data={data} proof={proof} />,
    pot: <PotPanel key="pot" data={data} />,
    activity: <ActivityPanel key="activity" campaign={data.address} round={round} />,
    recheck: <RecheckPanel key="recheck" data={data} proof={proof} />,
    panel: taking ? (
      <EntryPanel
        key="panel"
        data={data}
        proof={proof}
        sentence={title}
        prefill={prefill}
        onChange={landed}
        onBusy={setBusy}
      />
    ) : (
      <StatePanel
        key="panel"
        data={data}
        proof={proof}
        entriesTaken={allowed !== false}
        note={noteFor(data.campaign, data.address, notes)}
      />
    ),
    mine: <PayoutPanel key="mine" data={data} wallet={wallet} round={round} onChange={landed} />,
    report: <ReportCampaign key="report" id={data.campaign.id.toString()} unlisted={unlisted} />,
  };
  const stale = state.failed ? <p className="m-0 text-xs text-warn">{PAGE.loadFailedText}</p> : null;
  if (phone) {
    return (
      <div className="space-y-4">
        {stale}
        {[
          blocks.head,
          blocks.pot,
          blocks.panel,
          blocks.mine,
          blocks.proof,
          blocks.activity,
          blocks.recheck,
          blocks.report,
        ]}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
      <div className="space-y-4">
        {stale}
        {[blocks.head, blocks.proof, blocks.pot, blocks.activity, blocks.recheck, blocks.report]}
      </div>
      <div className="sticky top-4 space-y-4">{[blocks.panel, blocks.mine]}</div>
    </div>
  );
}
