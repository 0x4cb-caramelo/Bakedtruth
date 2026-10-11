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
    <div key={name} className={name === "yes" ? "cp-side-yes" : "cp-side-no"}>
      <small>{name.toUpperCase()}</small>
      <strong className="num">{odds ? `${odds[name]}%` : "–"}</strong>
      <span>{POT.onSide(sol4(lamports), name.toUpperCase())}</span>
    </div>
  );
  return (
    <section aria-labelledby="pot-title" className="panel">
      <h2 id="pot-title" className="panel-head">
        <Vault className="size-[15px]" aria-hidden="true" />
        {POT.title}
        <span className="hint">{POT.bakers(c.entriesOpen)}</span>
      </h2>
      {odds ? (
        <div className="cp-chance">{[side("yes", c.poolYes), side("no", c.poolNo)]}</div>
      ) : (
        <p className="cp-nochance">{POT.noEntries}</p>
      )}
      <SplitBar yes={Number(c.poolYes)} no={Number(c.poolNo)} prize={Number(c.prizeLamports)} />
      <p className="cp-prize">
        {c.prizeLamports > 0n ? <span className="cp-swatch" aria-hidden="true" /> : null}
        {c.prizeLamports > 0n ? POT.prize(sol4(c.prizeLamports)) : POT.noPrize}
      </p>
      <p className="cp-total">
        <span>{POT.pot}</span>
        <b className="num">{sol4(pot)} SOL</b>
      </p>
      {note ? <p className="cp-pot-note">{note}</p> : null}
    </section>
  );
}
