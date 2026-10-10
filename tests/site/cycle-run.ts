/**
 * Purpose: one campaign's life run end to end through the recording RPC (cycle.ts), stopping where a test needs it:
 *          in review (just resolved), settling (finalized, nothing paid), or closed (every payout sent, the account
 *          closed). Records each baker's balance and Entry deposit before settlement, so a test can compare what a
 *          page says was received with the SOL that reached the wallet.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { lamports, type Address, type KeyPairSigner } from "@solana/kit";

import { entryAddress, Side, VoidReason } from "@brot/sdk/read";
import { buildTeamVoidCampaign } from "@brot/sdk/tx";

import type { OpeningWorld } from "../brot/opening";
import { balance, fundedWallet } from "../brot/setup";
import { finalizeVia, joinVia, landVia, openVia, resolveVia, settleVia } from "./cycle";
import { startFakeChain, type FakeChain } from "./fake-chain";

export const SOL = 1_000_000_000n;
export type Bet = { who: KeyPairSigner; side: Side; amount: bigint };

export type CycleOptions = {
  /** How the program resolves it: NO after the deadline, or a stale-feed void. */
  how: "no" | "stale";
  /** A team key then voids the automatic void with this reason (finalizing it at once). */
  teamVoid?: "TeamHouseFailure" | "TeamOutsideCause";
  stopAt: "review" | "settling" | "closed";
  /** The creator's wallet is emptied before settlement, so a small share is reserved instead of paid. */
  emptyCreator?: boolean;
};

export type Cycle = {
  chain: FakeChain;
  campaign: Address;
  id: bigint;
  bakers: KeyPairSigner[];
  keeper: KeyPairSigner;
  placed: Bet[];
  /** A wallet's balance change across settlement, and what its Entry held just before (rent and tallied joins). */
  delta: (wallet: string) => bigint;
  deposit: (wallet: string) => bigint;
};

export async function runCycle(
  w: OpeningWorld,
  bets: (bakers: KeyPairSigner[]) => Bet[],
  options: CycleOptions,
): Promise<Cycle> {
  const chain = startFakeChain(w);
  const keeper = await fundedWallet(w);
  const bakers = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
  const { id, campaign } = await openVia(w, chain, w.creator);
  const placed = bets(bakers);
  for (const bet of placed) await joinVia(w, chain, bet.who, campaign, bet.side, bet.amount);
  await resolveVia(w, chain, keeper, campaign, options.how);
  const joined = [...new Set(placed.map((b) => b.who.address))];
  const before = new Map<string, bigint>();
  const deposits = new Map<string, bigint>();
  const base = { chain, campaign, id, bakers, keeper, placed };
  const result: Cycle = {
    ...base,
    delta: (a) => balance(w, a as Address) - (before.get(a) ?? 0n),
    deposit: (a) => deposits.get(a) ?? 0n,
  };
  if (options.stopAt === "review") return result;
  if (options.teamVoid) {
    const reason = VoidReason[options.teamVoid];
    const ix = await buildTeamVoidCampaign({ teamMember: w.team, campaign, reason, noteHash: new Uint8Array(32) });
    // The team's void tallies nothing: every baker's joins are tallied first, as finalize needs.
    await finalizeVia(w, chain, keeper, campaign, joined, { tallyOnly: true });
    await landVia(chain, w.team, [ix]);
  } else {
    await finalizeVia(w, chain, keeper, campaign, joined);
  }
  if (options.emptyCreator) {
    w.client.svm.setAccount({
      address: w.creator.address,
      data: new Uint8Array(0),
      executable: false,
      lamports: lamports(0n),
      programAddress: "11111111111111111111111111111111" as Address,
      space: 0n,
    });
  }
  for (const a of [...bakers.map((b) => b.address), w.creator.address]) before.set(a, balance(w, a));
  for (const a of joined) deposits.set(a, balance(w, await entryAddress(campaign, a)));
  if (options.stopAt === "settling") return result;
  const settled = await settleVia(w, chain, keeper, campaign, joined);
  if (!options.emptyCreator) await landVia(chain, keeper, [await settled.close()]);
  return result;
}
