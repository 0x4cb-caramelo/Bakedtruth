/**
 * Purpose: the creation box at /abrir (Sprint 19; spec 3.12 of Sprint -1, prototype-lab/campaigns/js/screens/open*.js):
 *          any wallet opens an On-Chain Campaign inside the rules. 1 What and 2 Details build the sentence from typed
 *          slots; 3 Preview, sticky beside them on a wide screen, shows what the transaction carries; 4 Cost prices it at
 *          Pyth's SOL/USD; on a phone a sticky bar keeps the total and the button. The program decides: the box mirrors
 *          its refusals (A-10), shows the deterministic summary of the very bytes (A-3), and never opens twice (T17).
 *          A prefilled box says so and never signs by itself.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useMemo } from "react";
import { feedsOf } from "@brot/sdk/read";

import { Notice } from "@/components/ui/notice";
import { useInstalledWallet } from "@/features/wallet/use-installed-wallet";
import { KIND_NAME } from "../campaign-page/copy";
import { issuesAt } from "./check";
import { BOX } from "./copy";
import { CostSection } from "./cost-section";
import { DetailsSection } from "./details-section";
import { templateOf } from "./kinds";
import type { KnownName } from "./names";
import { OpenAction } from "./open-action";
import { OpenSheet } from "./open-sheet";
import type { Prefilled } from "./prefill";
import { partsOf, previewFacts } from "./preview";
import { feedOptions, slotReadOf } from "./preview-parts";
import { PreviewSection } from "./preview-section";
import { FEED_CLUSTER } from "./reads";
import type { Suggestion } from "./search";
import { useOpenBox } from "./use-open-box";
import { useOpenFlow } from "./use-open-flow";
import { WhatSection } from "./what-section";

const LISTED = feedsOf(FEED_CLUSTER).map(([hex, symbol]) => ({ hex, symbol: symbol.replace(/^Crypto\./, "") }));

export function OpenBox({ prefill, names }: { prefill: Prefilled; names: KnownName[] }) {
  const box = useOpenBox(prefill.draft);
  const { draft, setDraft, world, check, wallet, store } = box;
  const installed = useInstalledWallet();
  const flow = useOpenFlow({ wallet, store, draw: box.pageIdNow, redraw: box.redraw, onLanded: box.refresh });
  const sources = useMemo(() => ({ feeds: LISTED, names }), [names]);
  const feeds = useMemo(() => feedOptions(world), [world]);
  const slot = slotReadOf(draft, box.accounts, box.accountsRead, world?.clock.epoch ?? null);
  const inputs = { draft, check, world, slot, names, wallet };
  const facts = previewFacts(inputs);
  const t = templateOf(draft.kind);
  const team = check?.isTeam ?? false;
  const review = () => {
    if (check?.choice && world) void flow.review(check.choice, world.clock.unixTimestamp);
  };
  const onPick = (s: Suggestion) =>
    setDraft((d) => ({
      ...d,
      kind: s.kind,
      feedHex: s.kind === "price" ? (s.feedHex ?? d.feedHex) : d.feedHex,
      account: s.kind === "price" ? "" : (s.account ?? (s.kind === d.kind ? d.account : "")),
      target: s.target ?? "",
    }));
  const action = (bar: boolean) => (
    <OpenAction
      check={check}
      connected={wallet !== null}
      wallet={installed}
      preparing={flow.flow.step === "preparing"}
      onReview={review}
      bar={bar}
    />
  );
  const boxIssues = check ? issuesAt(check, "box") : [];
  return (
    <div className="space-y-4 pb-24 min-[861px]:pb-0" data-testid="open-box">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{team ? BOX.kickerTeam : BOX.kicker}</p>
        <h1 className="font-display text-4xl font-bold">{BOX.title}</h1>
        <p className="max-w-3xl text-sm text-dim">{team ? BOX.ledeTeam : BOX.lede}</p>
      </header>
      {prefill.fromLink ? <Notice tone="info">{BOX.fromLink}</Notice> : null}
      {boxIssues.map((issue) => (
        <Notice key={issue.tag} tone={issue.level === "refuse" || issue.level === "block" ? "warn" : "info"}>
          <span data-refusal={issue.refusal}>{issue.text}</span>
        </Notice>
      ))}
      <div className="grid grid-cols-1 items-start gap-4 [grid-template-areas:'what'_'details'_'preview'_'cost'] min-[861px]:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)] min-[861px]:[grid-template-areas:'what_preview'_'details_preview'_'cost_preview']">
        <WhatSection
          kind={draft.kind}
          sources={sources}
          issues={check ? issuesAt(check, "kind") : []}
          onPick={onPick}
          onKind={(kind) => setDraft((d) => ({ ...d, kind, account: "", target: "", epoch: "" }))}
        />
        <DetailsSection
          draft={draft}
          setDraft={setDraft}
          check={check}
          parts={partsOf(inputs)}
          feeds={feeds}
          slotRead={slot}
          names={names}
          valueNow={facts.now.value}
          chainNow={world?.clock.unixTimestamp ?? null}
          epochNow={world?.clock.epoch ?? null}
          entriesClose={facts.entriesClose}
          onCheckAgain={box.refresh}
        />
        <PreviewSection facts={facts} footer={action(false)} />
        <CostSection
          draft={draft}
          setDraft={setDraft}
          check={check}
          world={world}
          wallet={wallet}
          balance={box.balance}
        />
      </div>
      {action(true)}
      <OpenSheet
        flow={flow.flow}
        review={{
          sentence: facts.sentence,
          account: facts.account,
          targetText: facts.now.target ?? "",
          persists: store.persists,
        }}
        context={{ owner: t.owner, kind: KIND_NAME[draft.kind] }}
        onSign={() => void flow.sign()}
        onAgain={() => (flow.reset(), review())}
        onAnyway={() => flow.flow.step === "recent" && void flow.prepare(flow.flow.choice)}
        onCheck={() => flow.flow.step === "failed" && flow.flow.resume && void flow.resume(flow.flow.resume)}
        onClose={flow.reset}
      />
    </div>
  );
}
