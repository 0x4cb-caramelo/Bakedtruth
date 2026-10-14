/**
 * Purpose: the web smoke's control routes for Sprint 12 ("campaign states"): a campaign written in any public state
 *          (tests/site/state-world.ts); a whole cycle with the smoke's test wallet as a winning baker, every payout
 *          sent and the campaign closed; and a cycle with the test wallet as a paying creator whose 1% is reserved
 *          (its wallet emptied before settlement, then funded again). Each cycle runs on the smoke's chain and then
 *          puts the clock and the two price accounts back, so later tests find the world as they expect it. The
 *          amounts the screen must show come from the wallet's settlement events, read here independently.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { createSolanaRpc, lamports, type KeyPairSigner } from "@solana/kit";

import {
  decodeCampaign,
  decodeTransactionEvents,
  Side,
  type RpcTransaction,
  MAX_TRANSACTION_VERSION,
} from "@brot/sdk/read";

import type { OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fundedWallet, setPriceAccount, setTime } from "../brot/setup";
import { runCycle } from "../site/cycle-run";
import type { FakeChain } from "../site/fake-chain";
import { injectState, type StateName } from "../site/state-world";
import { rawOf } from "../site/support";

type Body = Record<string, string>;
const SOL = 1_000_000_000n;

/** What the wallet received, summed from the settlement events of every transaction that names it. */
async function receivedFromEvents(chain: FakeChain, wallet: string): Promise<bigint> {
  const rpc = createSolanaRpc(chain.url);
  let sum = 0n;
  for (const s of await rpc.getSignaturesForAddress(wallet as never, { limit: 1_000 }).send()) {
    const tx = await rpc
      .getTransaction(s.signature, { encoding: "json", maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION })
      .send();
    for (const e of decodeTransactionEvents(tx as unknown as RpcTransaction)) {
      if (e.name === "EntrySettled" && e.data.baker === wallet) sum += e.data.amount;
      if (e.name === "CreatorShareSettled" && e.data.creator === wallet) sum += e.data.amount;
      if (e.name === "PrizeSettled" && e.data.recipient === wallet)
        sum += e.data.prizeReturned + e.data.openingFeeReturned;
    }
  }
  return sum;
}

export function stateRoutes(a: { w: OpeningWorld; chain: FakeChain; wallet: KeyPairSigner }) {
  const { w, chain, wallet } = a;
  /** Runs `body` and puts the clock and both price accounts back as they were, fresh at that time. */
  async function keepingTime<T>(body: () => Promise<T>): Promise<T> {
    const t0 = w.client.svm.getClock().unixTimestamp;
    try {
      return await body();
    } finally {
      setTime(w.client, t0);
      const fresh = { publishTime: t0 - 5n, postedSlot: w.client.svm.getClock().slot };
      setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", fresh);
      setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", fresh);
    }
  }
  return {
    "/state": async ({ name }: Body) => {
      const { id, campaign } = await injectState(w, name as StateName);
      return { id: id.toString(), address: campaign };
    },
    "/cycle-baker": () =>
      keepingTime(async () => {
        const others = [await fundedWallet(w), await fundedWallet(w)];
        const run = await runCycle(
          w,
          ([ana, bruno, me]) => [
            { who: ana, side: Side.Yes, amount: SOL / 2n },
            { who: me, side: Side.No, amount: (3n * SOL) / 10n },
            { who: bruno, side: Side.No, amount: SOL / 5n },
          ],
          { how: "no", stopAt: "closed", chain, bakers: [...others, wallet] },
        );
        return {
          id: run.id.toString(),
          address: run.campaign,
          expected: (await receivedFromEvents(chain, wallet.address)).toString(),
        };
      }),
    "/cycle-creator": () =>
      keepingTime(async () => {
        const run = await runCycle(
          w,
          ([ana, bruno]) => [
            { who: ana, side: Side.Yes, amount: 10_000_000n },
            { who: bruno, side: Side.No, amount: 10_000_000n },
          ],
          { how: "no", stopAt: "closed", chain, creator: wallet, emptyCreator: true },
        );
        const reserved = decodeCampaign(rawOf(w, run.campaign)).creatorShareReserved;
        // The creator funds the wallet again, so it can pay the fee and take the reserve.
        w.client.svm.airdrop(wallet.address, lamports(100n * SOL));
        return { id: run.id.toString(), address: run.campaign, reserved: reserved.toString() };
      }),
    "/received": async () => ({ received: (await receivedFromEvents(chain, wallet.address)).toString() }),
  };
}
