/**
 * Purpose: the randomized test's money moved by hand and by the wallets: SOL sent by hand to a vault or a campaign,
 *          a creator's wallet emptied (a credit below the reserve then has nowhere to land) or funded again, and the
 *          fee vault swept to `fee_recipient`, each with its expected refusal, balance changes and events.
 * Version: 0.1.0
 * Sprint:  14 (lane INV14; the planners as Sprint 14 left them); 15 (moved out of invariant-ops.ts unchanged, which the
 *          sealed entry took past 200 lines; lane INV15)
 */
import { type Address } from "@solana/kit";

import { readConfig } from "./flows";
import type { Harness, Plan } from "./invariant-harness";
import { sweepFeesIx } from "./instructions-settlement";
import { systemTransferIx } from "./join-campaign-support";
import * as P from "./program";
import { balance } from "./setup";

export function planHand(h: Harness, index: number, to: "vault" | "campaign", amount: bigint): Plan {
  const { campaign, vault } = h.addrs[index];
  const target = to === "vault" ? vault : campaign;
  return {
    ixs: [systemTransferIx(h.bank, target, amount)],
    deltas: new Map<string, bigint>([
      [target, amount],
      [h.bank.address, -amount],
    ]),
    apply: () => {
      const c = h.camps[index];
      if (to === "vault") c.handSent += amount;
      else c.handSentCampaign += amount;
    },
  };
}

/** Empties a creator's wallet: a credit below the reserve then has nowhere to land (Q2). */
export function planDrain(h: Harness, creatorIndex: number): Plan {
  const creator = h.creators[creatorIndex];
  const amount = balance(h.w, creator.address);
  return {
    ixs: [systemTransferIx(creator, h.sink, amount)],
    deltas: new Map<string, bigint>([
      [creator.address, -amount],
      [h.sink, amount],
    ]),
    apply: () => {
      h.drained.add(creator.address);
    },
  };
}

/** Funds a creator with enough for about twenty paid openings, so a wallet once drained opens again. */
export function planFund(h: Harness, creatorIndex: number): Plan {
  const creator = h.creators[creatorIndex];
  const amount = 100n * P.SOL;
  return {
    ixs: [systemTransferIx(h.bank, creator.address, amount)],
    deltas: new Map<string, bigint>([
      [creator.address, amount],
      [h.bank.address, -amount],
    ]),
    apply: () => {
      h.drained.delete(creator.address);
    },
  };
}

export async function planSweep(h: Harness): Promise<Plan> {
  const config = await readConfig(h.w);
  const recipient = config.fee_recipient as Address;
  const surplus = h.feeVaultModel - h.rent.vault;
  return {
    ixs: [sweepFeesIx(await P.configPda(), h.feeVault, recipient)],
    error: surplus > 0n ? undefined : "NothingToSweep",
    deltas: new Map<string, bigint>([
      [h.feeVault, -surplus],
      [recipient, surplus],
    ]),
    events: ["FeesSwept"],
    apply: () => {
      h.feeVaultModel -= surplus;
    },
  };
}
