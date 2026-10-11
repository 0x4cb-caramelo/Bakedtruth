/**
 * Purpose: the words of an opening's sheet, from "Review and sign" to the campaign's link (spec 3.12 of Sprint -1; A-3;
 *          T17; D-m vocabulary; English per L-01): "Check before you sign" with every argument the transaction carries,
 *          the signing steps, the opened campaign, the retried opening that finds its campaign already open, the
 *          recent opening found when this browser kept no record, and one message for each way an opening fails that
 *          is not a program refusal (those are copy-refusals.ts's). What a failure cost reuses the entry's lines.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import type { FailureKey } from "../entry/failures";

export const SHEET = {
  title: "Check before you sign",
  sentence: "The sentence",
  network: "Network",
  program: "Program",
  id: "Campaign id",
  idNote: "Saved in this browser before signing, so a retry can't open it twice",
  idNotKept: "This browser can't keep it across a reload; the box still checks your wallet's recent openings first",
  kind: "Kind",
  account: "Account read",
  feed: "Feed id",
  direction: "Direction",
  target: "Target",
  targetRaw: (raw: string) => `${raw} as the program stores it`,
  epoch: "Epoch",
  deadline: "Deadline",
  closes: "Entries close",
  opening: (usd: string) => `Opening · ${usd}`,
  openingFree: "Opening",
  free: "Free (team key)",
  freeNote: "No prize, no creator share",
  prize: "Prize, on no side · 90%",
  fee: "Opening fee, held · 10%",
  most: "Most you'll pay (max_lamports)",
  mostNote: "The quote plus 1%: above it the program refuses",
  rent: "Rent of the two new accounts",
  rentNote: "Returned when the campaign closes",
  networkFee: "Network fee",
  total: "Total now",
  bytes: "What the wallet will sign, read from its bytes",
  walletDiffers: "If your wallet shows something different from this summary, reject it.",
  back: "Back",
  sign: "Sign in wallet",
  refreshed: "The price or the blockhash moved, so the box prepared the opening again. Check it once more.",
} as const;

export const STEPS = {
  title: "Approve in your wallet",
  wallet: (total: string) =>
    `Your wallet should show about ${total} SOL leaving this wallet for the Brot Markets program. If it shows anything else, reject it.`,
  confirming: "Sent. Waiting for devnet to confirm it.",
  finalizing: "Confirmed. Waiting for devnet to finalize it.",
  checking: "Checking whether your campaign opened…",
  checkingText: (blocks: string | null) =>
    `Looking it up by its id until the transaction can no longer land${blocks ? ` (${blocks} blocks left)` : ""}. Nothing is sent again.`,
  closable: "The id is saved: coming back looks the campaign up instead of opening it twice.",
  labels: ["Check", "Sign", "Confirm"],
} as const;

export const DONE = {
  title: "Opened. Your campaign is live.",
  final: "Finalized on devnet.",
  confirmedOnly: "Confirmed on devnet; finality is still on its way.",
  listed: "It shows in the list once the read API reads it again.",
  go: "Go to the campaign",
  charged: (sol: string, price: string) => `Charged ${sol} SOL at ${price}, the price the program read.`,
  share: "Share on X",
  shareText: (sentence: string) => `${sentence}. An On-Chain Campaign on Brot Markets (devnet, test SOL).`,
} as const;

export const ALREADY = {
  title: (id: string) => `It's open: campaign ${id}`,
  text: "This campaign is already open: your first transaction landed. Nothing was charged twice.",
  go: "Go to it",
} as const;

export const TAKEN = {
  title: "This id is taken",
  text: "Another wallet opened a campaign at the id this box drew, so yours could not open there. Nothing was charged. A new id is drawn when you try again.",
} as const;

export const RECENT = {
  title: "You opened a campaign a moment ago",
  text: (id: string, minutes: string) =>
    `This wallet opened campaign ${id} ${minutes} ago. If that was this campaign, go to it instead of paying again.`,
  go: "Go to it",
  anyway: "Open a new one",
} as const;

/** The failures that are not a program refusal, worded for an opening. */
export const FAIL: Partial<Record<FailureKey, { title: string; text: string }>> = {
  signatureRefused: { title: "You refused it in your wallet", text: "Nothing was sent." },
  transactionFailed: { title: "The transaction failed", text: "The campaign did not open." },
  networkDown: {
    title: "Can't reach Solana right now",
    text: "The page could not reach the network. Check your connection and try again.",
  },
  notLanded: {
    title: "It didn't open",
    text: "Your wallet gave no answer, and the transaction expired before it landed. Trying again reuses the same id, so it can't open twice.",
  },
  stillChecking: {
    title: "Still checking your opening",
    text: "The network stopped answering while the page checked whether your campaign opened. It may still have opened. Check again; nothing new is signed here until this one is settled.",
  },
  programUpgraded: {
    title: "Brot's program was just updated",
    text: "This page was built for the program's previous version, so it does not ask your wallet to sign. It reloads to get the page built for the new one.",
  },
  versionUnknown: {
    title: "This page can't confirm the program's version",
    text: "The page does not know which version of Brot's program it was built for, so it does not ask your wallet to sign.",
  },
  walletChanged: {
    title: "Your wallet changed",
    text: "The connected wallet is not the one this opening was prepared for. Review it again with the wallet you want to use.",
  },
  notEnoughSol: {
    title: "Not enough SOL",
    text: "Your wallet does not hold enough SOL for the opening, the rent of the two new accounts and the network fee.",
  },
};

export const failTitle = (refused: boolean) => (refused ? "The program refused the opening" : "Not opened");
