/**
 * Purpose: the words of "Receive", the one claim on the site (a reserved creator share; D-m vocabulary; English per
 *          L-01): the button, its steps, and one message per way it can fail, each with a way out.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import type { ClaimFailure } from "./claim";

export const CLAIM = {
  button: (sol: string) => `Receive ${sol} SOL`,
  preparing: "Checking it can be received…",
  wallet: "Confirm in your wallet…",
  confirming: "Receiving…",
  done: (sol: string) => `${sol} SOL received, now in your wallet.`,
  connect: "Connect the creator's wallet to receive it.",
  again: "Try again",
  signs: "Your wallet signs and pays the network fee. The program sends the amount only to the creator's wallet.",
} as const;

export const CLAIM_FAILURE: Record<ClaimFailure, string> = {
  NotFinalized: "The result is not final yet, so nothing can be received.",
  WrongCreator: "Only the wallet that opened this campaign can receive its creator share.",
  CreatorShareNotDue: "This campaign has no creator share to receive.",
  NothingReserved: "There is nothing left to receive: the share has already been sent.",
  WalletBelowMinimum: "This wallet needs more SOL first.",
  programUpgraded: "Brot's program was just updated. Nothing was signed; the page reloads to load the new version.",
  versionUnknown:
    "The site could not check which version of Brot's program is live, so it asks your wallet to sign nothing now. Try again.",
  simulationFailed: "The network refused it in a test run, so nothing was sent. Try again in a moment.",
  refusedInWallet: "You declined it in your wallet. Nothing was sent.",
  walletNoAnswer:
    "The wallet did not answer. If it sent the transaction, the page shows the share as received after a reload; trying again cannot pay it twice.",
  failedOnChain: "It reached the network and failed, costing the network fee. Reload the page to see what is left.",
  notLanded: "It did not reach the network in time. Nothing was received; try again.",
  network: "Can't reach Solana right now. Try again.",
};

export const floorText = (sol: string) => `Add at least ${sol} SOL to this wallet first, then press Receive.`;
