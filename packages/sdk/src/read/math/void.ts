/**
 * Purpose: what a void, and a pot with no entry, returns to whoever opened and what Brot keeps.
 *          Mirrors programs/brot-markets/src/math/void.rs (TP 3.4.7, P-4, founder answer 8).
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * The 10% opening fee follows the cause: back to the opener on a house failure, kept by Brot on an
 * outside cause. The prize always goes back to the opener. Entries are not here: a void refunds every
 * entry whole, from its own amount.
 */
import { VoidReason } from "../../idl/generated/types";
import { argU64, toU64 } from "./integers";

/** Who caused the void: the house (the team or the window) or a cause outside it. */
export type VoidClass = "HouseFailure" | "OutsideCause";

/** The class of a stored reason (`VoidClass::of`); `null` for `None`, which is not a void. */
export function voidClassOf(reason: VoidReason): VoidClass | null {
  switch (reason) {
    case VoidReason.None:
      return null;
    case VoidReason.MissedWindow:
    case VoidReason.TeamHouseFailure:
      return "HouseFailure";
    case VoidReason.UnreadableAccount:
    case VoidReason.StaleFeed:
    case VoidReason.TeamOutsideCause:
      return "OutsideCause";
    default:
      throw new RangeError(`no VoidReason ${reason as number}`);
  }
}

/** The part of the held money that is not an entry: what the opener gets back and what Brot keeps. */
export type OpenerReturn = { toOpener: bigint; brotKeeps: bigint };

/** A void: the prize back; the opening fee back too on a house failure, kept otherwise (`void_return`). */
export function voidReturn(voidClass: VoidClass, prize: bigint, openingFee: bigint): OpenerReturn {
  argU64(prize, "prize");
  argU64(openingFee, "openingFee");
  return voidClass === "HouseFailure"
    ? { toOpener: toU64(prize + openingFee), brotKeeps: 0n }
    : { toOpener: prize, brotKeeps: openingFee };
}

/** A pot with no entry, and a `OneSided` pot: the prize back, the opening fee kept (`kept_opening_return`). */
export function keptOpeningReturn(prize: bigint, openingFee: bigint): OpenerReturn {
  return { toOpener: argU64(prize, "prize"), brotKeeps: argU64(openingFee, "openingFee") };
}
