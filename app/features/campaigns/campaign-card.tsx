/**
 * Purpose: one campaign's card in the list (Sprint 10): the kind, the sentence, the state, the pot in SOL, the chance per
 *          side (none for an empty pot), the estimated return per side (labelled as an estimate), the two moments (entries
 *          close, deadline), the review clock, the save button, and the notice on burn, lock and stake campaigns (BR-26).
 *          There is no redemption here.
 * Version: 0.2.0 (Sprint 12: the state chip and line, state-line.ts)
 * Sprint:  10 (site: campaign list); 12
 */
import Link from "next/link";

import { SplitBar } from "@/components/ui/split-bar";
import { StateChip } from "@/components/ui/state-chip";
import { formatUtc } from "@/lib/brot";
import { formatSol as formatSolFour } from "@/features/wallet/wallet-state";
import type { Card } from "./model";
import { KIND_LABEL } from "./sentence";

const sol = (lamports: bigint) => `${formatSolFour(lamports)} SOL`;

const NOTICE = "The creator can control the result, and may have entered YES or NO.";

export function CampaignCard({ card, saved, onToggle }: { card: Card; saved: boolean; onToggle: () => void }) {
  const hasChance = card.yesShare !== null;
  const yesPct = hasChance ? Math.round((card.yesShare ?? 0) * 100) : null;
  const noPct = yesPct === null ? null : 100 - yesPct;
  return (
    <article className="rounded-md border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-dim">
        <span>{KIND_LABEL[card.kind] ?? card.kind}</span>
        <StateChip state={card.chip} />
        {!card.listed && <span>Not on the home page: no entries in its first 24 hours.</span>}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={saved}
          className="ml-auto rounded border border-line px-2 py-0.5 text-ink"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <Link href={`/c/${card.id}`} className="mt-2 block text-lg font-bold text-ink hover:underline">
        {card.title}
      </Link>
      <p className="mt-1 text-sm text-dim">
        Pot {sol(card.potLamports)}
        {card.prizeLamports > 0n ? ` · prize ${sol(card.prizeLamports)}` : ""} · {card.entries}{" "}
        {card.entries === 1 ? "entry" : "entries"}
      </p>
      <div className="mt-3">
        {hasChance ? (
          <>
            <SplitBar yes={Number(card.yesLamports)} no={Number(card.noLamports)} prize={Number(card.prizeLamports)} />
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-ink">YES {yesPct}%</span>
              <span className="text-ink">NO {noPct}%</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-dim">No entries yet</p>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-dim">
        {card.stateLine === null ? (
          <>
            {card.estYesBps !== null && (
              <span>If YES wins: ×{(Number(card.estYesBps) / 10_000).toFixed(2)} (estimate)</span>
            )}
            {card.estNoBps !== null && (
              <span>If NO wins: ×{(Number(card.estNoBps) / 10_000).toFixed(2)} (estimate)</span>
            )}
            {card.entriesCloseAt !== null && <span>Entries close {formatUtc(card.entriesCloseAt)}</span>}
            {card.deadlineAt !== null && <span>Deadline {formatUtc(card.deadlineAt)}</span>}
          </>
        ) : (
          <span className="col-span-2" data-testid="card-state">
            {card.stateLine}
          </span>
        )}
      </div>
      {card.kind !== "PriceTouch" && <p className="mt-2 text-xs text-dim">{NOTICE}</p>}
    </article>
  );
}
