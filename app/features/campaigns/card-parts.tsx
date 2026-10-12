/**
 * Purpose: the small pieces the approved prototype's cards, rows and slides share (ui/parts.js): the kind tile with its
 *          letter on the kind's colour ($, B, L, P, V), the kind's label, and the state chip with its dot and words,
 *          never colour alone. The chip's words are the app's own (components/ui/state-chip.tsx, Sprint 12).
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import { cx } from "@/components/ui/cx";
import type { KindName } from "@/features/campaign-page/proof";
import type { Card } from "./model";
import { kindName } from "./readings";
import type { CardChip } from "./state-line";

export const KINDS: Record<KindName, { label: string; long: string; tile: string }> = {
  price: { label: "Price", long: "Price of a large asset", tile: "$" },
  burn: { label: "Supply burn", long: "Token supply burned", tile: "B" },
  lock: { label: "Locked liquidity", long: "Liquidity locked on Meteora", tile: "L" },
  pool: { label: "Stake pool", long: "Size of a stake pool", tile: "P" },
  stake: { label: "Validator stake", long: "Stake on a validator", tile: "V" },
};

export const kindLabel = (card: Pick<Card, "kind">): string => KINDS[kindName(card)].label;

export function KindTile({ kind, small, className }: { kind: KindName; small?: boolean; className?: string }) {
  return (
    <span className={cx("kind-tile", small && "sm", `kind-${kind}`, className)} aria-hidden="true">
      {KINDS[kind].tile}
    </span>
  );
}

export const KindTileOf = ({ card, small }: { card: Pick<Card, "kind">; small?: boolean }) => (
  <KindTile kind={kindName(card)} small={small} />
);

const CHIP: Record<CardChip, { cls: string; label: string }> = {
  open: { cls: "state-open", label: "Open" },
  closed: { cls: "state-closed", label: "Closed" },
  in_review: { cls: "state-review", label: "In review" },
  contested: { cls: "state-contest", label: "Contested" },
  final: { cls: "state-paid", label: "Result final" },
  paid: { cls: "state-paid", label: "Paid" },
  void: { cls: "state-void", label: "Void" },
};

export function CardChipView({ chip }: { chip: CardChip }) {
  return <span className={cx("chip state", CHIP[chip].cls)}>{CHIP[chip].label}</span>;
}
