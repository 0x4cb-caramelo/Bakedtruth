// Shared by the chat widget and the chat route: message shape, limits and the market summary
// the assistant sees. Framework-free.

import { formatDuration, formatBps, formatUsdc, slotTime, type ClockInfo } from "./format";
import { authorityWords, goalText, ruleText, type Reading } from "./metric";
import { big, closeSlot, hasPool, KIND_INFO, kindOf, phaseOf, statusOf, yesPrice, type MarketAccount } from "./view";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const CHAT_LIMITS = {
  /** Most messages replayed to the model per request. */
  maxMessages: 12,
  /** Longest single message, and longest page context, in characters. */
  maxMessageChars: 2_000,
  maxContextChars: 3_000,
  /** Cap on the reply, in tokens. */
  maxReplyTokens: 700,
};

/** What the assistant knows about the open market page, as plain text. */
export function marketSummary(
  entry: { address: { toBase58(): string }; account: MarketAccount; reading?: Reading; vault: bigint },
  clock: ClockInfo | null,
  question: string,
): string {
  const { account, reading } = entry;
  const kind = kindOf(account);
  const price = yesPrice(account);
  const lines = [
    `Market ${entry.address.toBase58()}`,
    `Question: ${question}`,
    `Goal: ${goalText(account, reading)} (${KIND_INFO[kind].label})`,
    `Rule: ${ruleText(account)}`,
    `Status: ${statusOf(account)}, phase: ${phaseOf(account, clock)}`,
    `YES price: ${formatBps(price.bps)} of its payout (${price.source === "pool" ? "guarded pool" : "sponsor sale"}); pays 1 USDC if YES wins`,
    `Sponsor sale price: ${formatBps(account.yesPriceBps)}; unspent budget: ${formatUsdc(big(account.budget))} USDC`,
    `Vault: ${formatUsdc(entry.vault)} USDC; pool: ${hasPool(account) ? "has liquidity" : "empty"}`,
    `Cutoff slot: ${account.cutoffSlot.toString()}; deadline slot: ${account.deadlineSlot.toString()}`,
  ];
  if (clock) {
    lines.push(
      `Current slot: ${clock.slot}; trading closes in about ${formatDuration(slotTime(closeSlot(account, clock), clock).deltaMs)}`,
    );
  }
  if (reading?.type === "quantity") {
    lines.push(
      `Metric now: ${reading.current} of target ${reading.target} (${reading.unit}, ${reading.decimals} decimals), met: ${reading.met}`,
    );
    if (reading.note) lines.push(`Metric note: ${reading.note}`);
  } else if (reading?.type === "authority") {
    const { subject, state } = authorityWords(reading);
    const holder = reading.authority ? ` (${reading.what.toLowerCase()} held by ${reading.authority})` : "";
    lines.push(`Metric now: ${subject} ${state}${holder}, met: ${reading.met}`);
  } else if (reading?.type === "unavailable") {
    lines.push(`Metric now: ${reading.reason}`);
  }
  return lines.join("\n");
}
