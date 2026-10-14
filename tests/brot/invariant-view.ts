/**
 * Purpose: the chain side of the randomized test's checks: one campaign as the program holds it (its account, its
 *          vault's balance and the entries of the bakers who joined), with the config and the fee vault read once per
 *          pass. Split out of invariant-harness.ts.
 * Version: 0.1.0
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14: fewer reads, the config and fee vault once per pass)
 */
import { entryOf, type Harness } from "./invariant-harness";
import { decode } from "./layouts";
import { balance } from "./setup";
import { CAMPAIGN, ENTRY } from "./structs";

/** The chain side of one campaign, as the invariant checks read it. */
export type ChainView = {
  vault: bigint;
  campaign: Record<string, any> | null;
  entries: Map<string, { amount_yes: bigint; amount_no: bigint }>;
  config: Record<string, any>;
  feeVault: bigint;
};

/**
 * Campaign `index` on chain; the config and the fee vault's balance are read once per pass by the caller. Only the
 * entries of bakers who joined are read: no other wallet can hold one (a refused join writes nothing).
 */
export async function chainView(
  h: Harness,
  index: number,
  config: Record<string, any>,
  feeVault: bigint,
): Promise<ChainView> {
  const { campaign, vault } = h.addrs[index];
  const c = h.w.client.svm.getAccount(campaign);
  const entries = new Map<string, { amount_yes: bigint; amount_no: bigint }>();
  for (const baker of new Set(h.camps[index].joins.map((j) => j.baker))) {
    const account = h.w.client.svm.getAccount(await entryOf(h, campaign, baker));
    if (account.exists) {
      const d = decode(ENTRY, account.data);
      entries.set(baker, { amount_yes: d.amount_yes, amount_no: d.amount_no });
    }
  }
  return {
    vault: balance(h.w, vault),
    campaign: c.exists ? decode(CAMPAIGN, c.data) : null,
    entries,
    config,
    feeVault,
  };
}
