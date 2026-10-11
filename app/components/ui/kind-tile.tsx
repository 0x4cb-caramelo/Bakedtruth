/**
 * Purpose: the campaign's kind as a letter tile on the kind's own colour, with its name beside it in the screens. The five kinds (P1 §4.2) map from the program's reader kinds in the SDK's TP table.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import { cx } from "./cx";

export type KindName = "price" | "burn" | "lock" | "pool" | "stake";

const TONE: Record<KindName, string> = {
  price: "bg-k-price-bg text-k-price-fg",
  burn: "bg-k-burn-bg text-k-burn-fg",
  lock: "bg-k-lock-bg text-k-lock-fg",
  pool: "bg-k-pool-bg text-k-pool-fg",
  stake: "bg-k-stake-bg text-k-stake-fg",
};

// The approved prototype's letters (prototype-lab/campaigns, ui/parts.js): $ for a price, P for a pool, V for a validator.
const LETTER: Record<KindName, string> = { price: "$", burn: "B", lock: "L", pool: "P", stake: "V" };

export function KindTile({ kind, small, className }: { kind: KindName; small?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "grid shrink-0 place-items-center rounded-sm font-display font-bold",
        small ? "size-[30px] text-base" : "size-10 text-[21px]",
        TONE[kind],
        className,
      )}
    >
      {LETTER[kind]}
    </span>
  );
}
