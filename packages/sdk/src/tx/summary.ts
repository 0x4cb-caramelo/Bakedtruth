/**
 * Purpose: the deterministic summary of a transaction before the wallet signs it (A-3): each instruction
 *          decoded from its own bytes (never from the inputs it was built from) and said in words, the
 *          most lamports it can take from the signers, and a flag on anything this SDK did not build: an
 *          unknown program, a malformed instruction, or a System Program transfer.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * Pure code, no model and no network: the same instructions always give the same text.
 */
import { type Instruction } from "@solana/kit";

import {
  BrotMarketsInstruction,
  identifyBrotMarketsInstruction,
  parseBrotMarketsInstruction,
} from "../idl/generated/programs";
import { PROGRAM_ID, ReaderKind, Side, SYSTEM_PROGRAM_ID, VoidReason } from "../read/constants";
import { bytesToHex } from "../read/bytes";
import { formatBps, formatSol, formatUtc } from "../read/format";
import { DATA_SIZE, describeOther } from "./summary-other";

export type SummaryItem = {
  index: number;
  name: string;
  text: string;
  /** Built by this SDK for this program, or a compute-budget setting. */
  trusted: boolean;
  /** The most lamports this instruction can move out of a signer's wallet, rents and fees apart. */
  lamportsAtMost: bigint;
};

export type TransactionSummary = { items: SummaryItem[]; trusted: boolean; lamportsAtMost: bigint; lines: string[] };

type Parsed = ReturnType<typeof parseBrotMarketsInstruction>;

function describeBrot(parsed: Parsed): { text: string; lamports: bigint } {
  const d = parsed.data as Record<string, any>;
  const a = parsed.accounts as Record<string, { address: string }>;
  switch (parsed.instructionType) {
    case BrotMarketsInstruction.UserOpenCampaign: {
      const what =
        d.kind === ReaderKind.PriceTouch
          ? `price of feed ${bytesToHex(d.feedId).slice(0, 8)}… ${d.direction === 0 ? "at or above" : "at or below"} ${d.target}`
          : `${ReaderKind[d.kind]} of ${a.metricAccount.address}, target ${d.target}`;
      const pays =
        d.openingUsd === 0n
          ? "free (team key)"
          : `US$${d.openingUsd}, at most ${formatSol(d.maxLamports)} SOL into its vault`;
      return {
        text: `Open campaign #${d.id} on the ${what}, deadline ${formatUtc(d.deadlineAt)}; pays ${pays}, plus the rents of the campaign and its vault (returned at close)`,
        lamports: d.openingUsd === 0n ? 0n : d.maxLamports,
      };
    }
    case BrotMarketsInstruction.UserJoinCampaign:
      return {
        text: `Join campaign ${a.campaign.address} on ${Side[d.side]} with ${formatSol(d.amount)} SOL from ${a.baker.address}; refused if the return estimate is below ${formatBps(d.minReturnBps)} or the entry total is not ${formatSol(d.expectedEntryTotal)} SOL; plus the rent of the join's record`,
        lamports: d.amount,
      };
    case BrotMarketsInstruction.TeamVoidCampaign:
      return {
        text: `Void campaign ${a.campaign.address} (${VoidReason[d.reason]}), note hash ${bytesToHex(d.noteHash)}`,
        lamports: 0n,
      };
    default:
      return { text: describeOther(parsed.instructionType, a), lamports: 0n };
  }
}

/** The data is exactly the instruction's size, as the program requires (`BadInstructionData` otherwise). */
const exactSize = (ix: Instruction, parsed: Parsed) => ix.data?.length === DATA_SIZE[parsed.instructionType];

function itemOf(ix: Instruction, index: number): SummaryItem {
  const base = { index, trusted: false, lamportsAtMost: 0n };
  if (ix.programAddress === PROGRAM_ID) {
    let parsed: Parsed;
    try {
      identifyBrotMarketsInstruction(ix.data ?? new Uint8Array());
      parsed = parseBrotMarketsInstruction(ix as never);
    } catch {
      return { ...base, name: "unknown", text: "Malformed Brot Markets instruction: do not sign" };
    }
    if (!exactSize(ix, parsed)) return { ...base, name: "unknown", text: "Malformed instruction: do not sign" };
    const { text, lamports } = describeBrot(parsed);
    return {
      index,
      name: BrotMarketsInstruction[parsed.instructionType],
      text,
      trusted: true,
      lamportsAtMost: lamports,
    };
  }
  if (ix.programAddress === "ComputeBudget111111111111111111111111111111") {
    return { ...base, name: "computeBudget", text: "Compute budget setting", trusted: true };
  }
  const what = ix.programAddress === SYSTEM_PROGRAM_ID ? "System Program instruction" : `program ${ix.programAddress}`;
  return { ...base, name: "unknown", text: `A ${what} this SDK did not build: do not sign` };
}

/** The summary of `instructions`, in order. `trusted` only when every one is. */
export function summarizeInstructions(instructions: readonly Instruction[]): TransactionSummary {
  const items = instructions.map(itemOf);
  return {
    items,
    trusted: items.every((item) => item.trusted),
    lamportsAtMost: items.reduce((sum, item) => sum + item.lamportsAtMost, 0n),
    lines: items.map((item) => `${item.index + 1}. ${item.text}`),
  };
}
