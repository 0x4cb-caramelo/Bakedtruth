/**
 * Purpose: the split and the pot (P1 §3.1–3.2; spec 3.5): each side's chance (its share of the entries; none for an
 *          empty pot, L-05) and its total in SOL, the bar, the prize that belongs to no side, the whole pot, the number
 *          of entries, and the note an empty or one-sided pot needs. The wallet's own entry moved to payout-panel.tsx
 *          (Sprint 12).
 * Version: 0.2.0
 * Sprint:  11 (site: campaign page and entry); 12
 */
import { Vault } from "lucide-react";

import { SplitBar } from "@/components/ui/split-bar";
import { sol4 } from "@/features/entry/amount";
import { chance } from "@/features/entry/estimate";
import { POT } from "./copy";
import type { PageData } from "./load";

export function PotPanel({ data }: { data: PageData }) {
  const c = data.campaign;
  const odds = chance(c.poolYes, c.poolNo);
  const pot = c.poolYes + c.poolNo + c.prizeLamports;
  const open = data.view.state === "Open";
  const note = !open
    ? null
    : c.poolYes + c.poolNo === 0n
      ? POT.empty
      : c.poolYes === 0n || c.poolNo === 0n
        ? POT.oneSided(c.poolYes > 0n ? "YES" : "NO", c.poolYes > 0n ? "NO" : "YES")
        : null;
  const side = (name: "yes" | "no", lamports: bigint) => (
    <div className={name === "yes" ? "text-yes-fg" : "text-no-fg"}>
      <small className="block text-xs font-semibold">{name.toUpperCase()}</small>
      <b className="font-display text-3xl tabular-nums">{odds ? `${odds[name]}%` : "–"}</b>
      <span className="block text-xs text-muted">{POT.onSide(sol4(lamports), name.toUpperCase())}</span>
    </div>
  );
  return (
    <section aria-labelledby="pot-title" className="space-y-3 rounded-md border border-line bg-panel p-4">
      <h2 id="pot-title" className="m-0 flex items-center gap-2 font-display text-2xl font-bold">
        <Vault className="size-5" aria-hidden="true" />
        <span className="flex-1">{POT.title}</span>
        <span className="font-sans text-xs font-normal text-muted">{POT.bakers(c.entriesOpen)}</span>
      </h2>
      {odds ? (
        <div className="grid grid-cols-2 gap-3">{[side("yes", c.poolYes), side("no", c.poolNo)]}</div>
      ) : (
        <p className="m-0 text-sm text-muted">{POT.noEntries}</p>
      )}
      <SplitBar yes={Number(c.poolYes)} no={Number(c.poolNo)} prize={Number(c.prizeLamports)} />
      <p className="m-0 text-xs text-muted">{c.prizeLamports > 0n ? POT.prize(sol4(c.prizeLamports)) : POT.noPrize}</p>
      <p className="m-0 flex items-baseline justify-between text-sm">
        <span className="text-muted">{POT.pot}</span>
        <b className="font-display text-2xl tabular-nums">{sol4(pot)} SOL</b>
      </p>
      {note ? <p className="m-0 text-xs text-muted">{note}</p> : null}
    </section>
  );
}
