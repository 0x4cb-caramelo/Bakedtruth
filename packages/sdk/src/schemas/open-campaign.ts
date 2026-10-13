/**
 * Purpose: the zod schema of an opening's input (TP Appendix B, written here as Sprint 05 must), shared by
 *          the SDK, the site, the app and the preview: what a creator may choose, per kind, as JSON-safe
 *          strings, and its conversion to the SDK's `OpenArgs`. No field carries text (D-j); the fees,
 *          the share, the price and the template are the program's, never the input's.
 * Version: 0.1.1 (the sixth kind: `DbcGraduated` names its pool, and its target is the curve's threshold)
 * Sprint:  05 (SDK); the read API's schemas join in Sprint 08
 *
 * Its own entry point, `@brot/sdk/schemas`, so `read` and `tx` stay free of zod: zod 4's ESM build uses
 * `export * as`, which React Native 0.87.1's Babel preset does not transform (Expo's preset does, through
 * `@babel/plugin-transform-export-namespace-from`; knowledge-base/tecnologia/sdk-react-native.md).
 *
 * Departs from the sketch in one place, as the program does: every kind passes `deadlineAt`, the epoch
 * kinds too (row 5 holds for every kind; Sprint 03). Amounts and ids are decimal strings, so no JSON
 * number loses precision. Range checks beyond the types are the program's rules, mirrored by
 * `validateOpenCampaign`, not repeated here. A `DbcGraduated` input has no target: the program takes only
 * the curve's own threshold, which the caller reads from the pool's config and hands to `toOpenArgs`.
 */
import { address } from "@solana/kit";
import { z } from "zod";

import { hexToBytes } from "../read/bytes";
import { Direction, ReaderKind } from "../read/constants";
import { I128_MAX, I128_MIN, I64_MAX, U64_MAX } from "../read/math/integers";
import type { OpenArgs } from "../read/validate/open-rules";

const integer = (min: bigint, max: bigint) =>
  z
    .string()
    .regex(/^-?\d+$/)
    .refine((v) => BigInt(v) >= min && BigInt(v) <= max, "out of range");
const U64String = integer(0n, U64_MAX);
const I128String = integer(I128_MIN, I128_MAX);
const UnixSeconds = integer(0n, I64_MAX);
const Base58 = z.string().refine((v) => {
  try {
    address(v);
    return true;
  } catch {
    return false;
  }
}, "not a base58 address");
const Hex32 = z.string().regex(/^[0-9a-f]{64}$/);

export const OpenCampaignParams = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("PriceTouch"),
      feedId: Hex32,
      direction: z.enum(["above", "below"]),
      target: I128String,
      deadlineAt: UnixSeconds,
    })
    .strict(),
  z.object({ kind: z.literal("SupplyAtMost"), mint: Base58, target: I128String, deadlineAt: UnixSeconds }).strict(),
  z
    .object({ kind: z.literal("DammV2LockedAtLeast"), pool: Base58, target: I128String, deadlineAt: UnixSeconds })
    .strict(),
  z
    .object({
      kind: z.literal("StakePoolTvlAtLeast"),
      pool: Base58,
      target: I128String,
      epoch: U64String,
      deadlineAt: UnixSeconds,
    })
    .strict(),
  z
    .object({
      kind: z.literal("StakeAtLeast"),
      voteAccount: Base58,
      target: I128String,
      epoch: U64String,
      deadlineAt: UnixSeconds,
    })
    .strict(),
  z.object({ kind: z.literal("DbcGraduated"), pool: Base58, deadlineAt: UnixSeconds }).strict(),
]);

export const OpenCampaignInput = z
  .object({
    /** Drawn once by the client and saved before signing: the retry guard (T17). */
    id: U64String,
    params: OpenCampaignParams,
    /** Whole US$; absent for a team key's free opening (P-3). */
    openingUsd: U64String.optional(),
    /** The bound the creator signs (T25); absent when nothing is paid. */
    maxLamports: U64String.optional(),
  })
  .strict();

export type OpenCampaignInput = z.infer<typeof OpenCampaignInput>;

/**
 * A parsed input as the SDK's `OpenArgs` and the metric account it names (the price kind's is derived).
 * `curveThreshold`: `DbcGraduated` only, the `migration_quote_threshold` of the pool's config, its target.
 */
export function toOpenArgs(input: OpenCampaignInput, expectedParamsVersion: number, curveThreshold?: bigint) {
  const p = input.params;
  const metricAccount =
    p.kind === "SupplyAtMost"
      ? p.mint
      : p.kind === "DammV2LockedAtLeast" || p.kind === "StakePoolTvlAtLeast" || p.kind === "DbcGraduated"
        ? p.pool
        : p.kind === "StakeAtLeast"
          ? p.voteAccount
          : null;
  if (p.kind === "DbcGraduated" && curveThreshold === undefined) {
    throw new RangeError("DbcGraduated takes the curve's threshold as its target");
  }
  const args: OpenArgs = {
    id: BigInt(input.id),
    kind: ReaderKind[p.kind],
    direction: p.kind === "PriceTouch" && p.direction === "below" ? Direction.Below : Direction.Above,
    feedId: p.kind === "PriceTouch" ? hexToBytes(p.feedId) : new Uint8Array(32),
    target: p.kind === "DbcGraduated" ? (curveThreshold as bigint) : BigInt(p.target),
    deadlineAt: BigInt(p.deadlineAt),
    openingUsd: BigInt(input.openingUsd ?? "0"),
    maxLamports: BigInt(input.maxLamports ?? "0"),
    epoch: "epoch" in p ? BigInt(p.epoch) : 0n,
    expectedParamsVersion,
  };
  return { args, metricAccount: metricAccount === null ? null : address(metricAccount) };
}
