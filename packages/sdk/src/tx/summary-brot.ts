/**
 * Purpose: the summary of this program's own instructions (A-3). The structure is checked against the IDL
 *          first: the exact data size, the exact account count, each slot's signer and writable role (Sprint 05
 *          review, L11). Then each instruction is said in words from its own bytes, with what it can move out of
 *          a signer's wallet: a join names its campaign, side, amount, guards and rents; an opening names its
 *          target in the feed's units, its deadline, its creator, what it pays, the SOL price below which the
 *          payment is refused, and the terms it binds (review, M3 and L7).
 * Version: 0.1.4 (an instruction the summary does not describe yet is refused by name; the sealed entry, said by
 *          ./summary-sealed.ts, lane L15)
 * Sprint:  05 (SDK); the scaffold of Sprints 14–15 (2026-10-13); 15 (lane L15)
 *
 * The context (the campaign a join points at; an opening's price exponent and terms) is what the screen read
 * through its RPC. Without it the summary still says everything the bytes hold, in raw units.
 */
import { AccountRole, type Address, type Instruction } from "@solana/kit";

import idl from "../idl/brot_markets.json";
import {
  BrotMarketsInstruction as B,
  identifyBrotMarketsInstruction,
  parseBrotMarketsInstruction,
} from "../idl/generated/programs";
import type { Campaign } from "../read/accounts";
import { bytesToHex, type Bytes } from "../read/bytes";
import { Direction, ReaderKind, Side, VoidReason } from "../read/constants";
import { feedSymbol } from "../read/feeds";
import { formatBps, formatScaled, formatSol, formatUsdCents, formatUtc } from "../read/format";
import { DATA_SIZE, describeOther } from "./summary-other";
import { describeSealedEntry } from "./summary-sealed";

/** What the screen read, so the summary can name it in words. */
export type SummaryContext = {
  /** The campaign at each address a join points at, as read. */
  campaigns?: ReadonlyMap<string, Campaign>;
  /** An opening on the price kind: the price account's exponent (`validateOpenCampaign`'s `priceExponent`). */
  priceExponent?: number;
  /** An opening: the config's terms, shown when their version is the one the opening binds. */
  terms?: {
    version: number;
    feeBps: number;
    oneSidedFeeBps: number;
    creatorShareBps: number;
    openingPrizeBps: number;
    minEntryLamports: bigint;
  };
};

export type BrotItem = { name: string; text: string; trusted: boolean; lamportsAtMost: bigint };

const ROLE_NAMES = ["read-only", "writable", "read-only signer", "writable signer"];
const ROLES: ReadonlyMap<string, readonly AccountRole[]> = new Map(
  idl.instructions.map((ix): [string, AccountRole[]] => [
    ix.name,
    ix.accounts.map((a) => ((a.isSigner ? 2 : 0) | (a.isMut ? 1 : 0)) as AccountRole),
  ]),
);

/**
 * What may follow the listed accounts: a tally's joins, plain writable; a graduation opening's pool config, alone
 * and read-only; nothing for any other instruction.
 */
function extraProblem(type: B, kind: unknown, extra: readonly { role: AccountRole }[]): string | null {
  if (type === B.UserOpenCampaign && kind === ReaderKind.DbcGraduated) {
    const one = extra.length === 1 && extra[0].role === AccountRole.READONLY;
    return one ? null : "a graduation opening takes one read-only config after the listed accounts";
  }
  if (type !== B.TallyLateJoins && extra.length > 0) return "it carries accounts the instruction does not take";
  if (extra.some((a) => a.role !== AccountRole.WRITABLE))
    return "an account after the listed ones is not plain writable";
  return null;
}

/** Why `ix` is not shaped as the IDL says, or `null`. The fee payer may fill any slot as a writable signer. */
function structureProblem(ix: Instruction, parsed: Parsed, feePayer: Address | undefined): string | null {
  const type = parsed.instructionType;
  const size = DATA_SIZE[type];
  if (size === undefined) return "the summary does not describe this instruction yet";
  if (ix.data?.length !== size) return "the data is not the instruction's size";
  const expected = ROLES.get(B[type]) ?? [];
  const accounts = ix.accounts ?? [];
  if (accounts.length < expected.length) return "accounts are missing";
  const extra = extraProblem(type, (parsed.data as { kind?: unknown }).kind, accounts.slice(expected.length));
  if (extra) return extra;
  for (let i = 0; i < expected.length; i++) {
    const { address, role } = accounts[i];
    if (role === expected[i] || (address === feePayer && role === AccountRole.WRITABLE_SIGNER)) continue;
    return `account ${i + 1} is ${ROLE_NAMES[role]}, not ${ROLE_NAMES[expected[i]]}`;
  }
  return null;
}

type Target = { kind: ReaderKind; direction: Direction; feedId: Bytes; target: bigint; epoch: bigint };

/** What a campaign reads, in words; a price target scaled by the feed's exponent when it is known. */
function what(t: Target, metric: string, exponent: number | undefined): string {
  if (t.kind === ReaderKind.DbcGraduated) {
    return `DbcGraduated of Meteora curve ${metric}: YES if it completes by the deadline (threshold ${formatSol(t.target)} SOL)`;
  }
  if (t.kind !== ReaderKind.PriceTouch) {
    const epoch =
      t.kind === ReaderKind.StakePoolTvlAtLeast || t.kind === ReaderKind.StakeAtLeast ? ` in epoch ${t.epoch}` : "";
    return `${ReaderKind[t.kind]} of ${metric}, target ${t.target}${epoch}`;
  }
  const hex = bytesToHex(t.feedId);
  const side = t.direction === Direction.Above ? "at or above" : "at or below";
  const value =
    exponent === undefined
      ? `${t.target} (raw: the feed's exponent was not read)`
      : `${formatScaled(t.target, exponent)} [raw ${t.target}, exponent ${exponent}]`;
  return `the price of ${feedSymbol(hex) ?? "an unlisted feed"} [feed ${hex.slice(0, 8)}…] ${side} ${value}`;
}

function payment(usd: bigint, maxLamports: bigint): string {
  if (usd === 0n) return "nothing (free openings are a team key's; any other signer is refused)";
  const most = `US$${usd}, at most ${formatSol(maxLamports)} SOL into its vault`;
  if (maxLamports === 0n) return most;
  return `${most} (refused if Pyth's SOL/USD price less its confidence is below ${formatUsdCents((usd * 100_000_000_000n) / maxLamports)} when it lands)`;
}

function terms(version: number, paid: boolean, t: SummaryContext["terms"]): string {
  if (!t || t.version !== version) return `under creation rules version ${version}`;
  const prize = paid ? `; ${formatBps(t.openingPrizeBps)} of the payment becomes the prize` : "";
  return `under creation rules version ${version}: Brot's fee ${formatBps(t.feeBps)} of the losing side; the creator's share ${formatBps(t.creatorShareBps)} of the entries (none for a team key); a one-sided pot's fee ${formatBps(t.oneSidedFeeBps)}; entries from ${formatSol(t.minEntryLamports)} SOL${prize}`;
}

/** The campaign a join or a sealed entry points at, in words, when the screen read it; nothing otherwise. */
function about(ctx: SummaryContext, campaign: string): string {
  const c = ctx.campaigns?.get(campaign);
  if (!c) return "";
  const exponent = c.kind === ReaderKind.PriceTouch ? c.priceExponent : undefined;
  return ` (#${c.id}: ${what(c, c.metricAccount, exponent)}; entries close ${formatUtc(c.entriesCloseAt)}, deadline ${formatUtc(c.deadlineAt)})`;
}

type Parsed = ReturnType<typeof parseBrotMarketsInstruction>;

function describe(parsed: Parsed, ctx: SummaryContext, ix: Instruction): { text: string; lamports: bigint } {
  const d = parsed.data as Record<string, any>;
  const a = parsed.accounts as Record<string, { address: string }>;
  switch (parsed.instructionType) {
    case B.UserOpenCampaign: {
      const exponent = d.kind === ReaderKind.PriceTouch ? ctx.priceExponent : undefined;
      const paid = d.openingUsd !== 0n;
      const curve = d.kind === ReaderKind.DbcGraduated ? ` with its curve config ${ix.accounts?.[9]?.address}` : "";
      return {
        text: `Open campaign #${d.id} on ${what(d as Target, a.metricAccount.address, exponent)}${curve}, deadline ${formatUtc(d.deadlineAt)}; created by ${a.creator.address}, who pays ${payment(d.openingUsd, d.maxLamports)}, plus the rents of the campaign and its vault (returned at close); ${terms(d.expectedParamsVersion, paid, ctx.terms)}`,
        lamports: paid ? d.maxLamports : 0n,
      };
    }
    case B.UserJoinCampaign: {
      const rents =
        d.expectedEntryTotal === 0n
          ? "the rents of the entry and of the join's record"
          : "the rent of the join's record";
      return {
        text: `Join campaign ${a.campaign.address}${about(ctx, a.campaign.address)} on ${Side[d.side].toUpperCase()} with ${formatSol(d.amount)} SOL from ${a.baker.address}; refused if the return estimate is below ${formatBps(d.minReturnBps)} or the entry total is not ${formatSol(d.expectedEntryTotal)} SOL; plus ${rents} (returned to the baker when the campaign settles)`,
        lamports: d.amount,
      };
    }
    case B.SponsorJoinCampaign:
      return describeSealedEntry(d, a, about(ctx, a.campaign.address), ctx.terms);
    case B.TeamVoidCampaign:
      return {
        text: `Void campaign ${a.campaign.address} (${VoidReason[d.reason]}), note hash ${bytesToHex(d.noteHash)}`,
        lamports: 0n,
      };
    default:
      return { text: describeOther(parsed.instructionType, a, d), lamports: 0n };
  }
}

/** One of this program's instructions in the summary: trusted only when shaped as the IDL says. */
export function summarizeBrot(ix: Instruction, ctx: SummaryContext, feePayer?: Address): BrotItem {
  const refused = (why: string): BrotItem => ({
    name: "unknown",
    text: `Malformed Brot Markets instruction (${why}): do not sign`,
    trusted: false,
    lamportsAtMost: 0n,
  });
  try {
    identifyBrotMarketsInstruction(ix.data ?? new Uint8Array());
    const parsed = parseBrotMarketsInstruction(ix as never);
    const problem = structureProblem(ix, parsed, feePayer);
    if (problem) return refused(problem);
    const { text, lamports } = describe(parsed, ctx, ix);
    return { name: B[parsed.instructionType], text, trusted: true, lamportsAtMost: lamports };
  } catch {
    return refused("its bytes do not decode as one of the program's instructions");
  }
}
