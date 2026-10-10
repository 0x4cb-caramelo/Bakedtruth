/**
 * Purpose: what the campaign page reads through the RPC, against the program in LiteSVM: the campaign at the route's
 *          u64 id (nothing at an unknown one), its public state against chain time with the join lock, the connected
 *          wallet's entry and the creator's own (BR-26's flag); and the recent entries with the chance after each
 *          (L-23), decoded from the `EntryAdded` events of transactions the site's flow sent.
 *          Filter: `bun test tests/ -t "what the campaign page reads"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, type KeyPairSigner } from "@solana/kit";

import { chanceHistory, readActivity } from "../../app/features/campaign-page/activity";
import { campaignIdFrom, loadCampaignPage } from "../../app/features/campaign-page/load";
import type { EntrySide } from "../../app/features/entry/estimate";
import { handToWallet, pendingOf, prepareEntry } from "../../app/features/entry/submit";
import { openedCampaign } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fundedWallet } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { memoryStore, testWallet } from "./support";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

/** An entry made the way the panel makes it: prepared by the SDK, handed to a wallet, watched until it lands. */
async function enter(url: string, campaign: string, baker: KeyPairSigner, side: EntrySide, amount: bigint) {
  const rpc = createSolanaRpc(url);
  const choice = { campaign, baker: baker.address as string, side, amount };
  const prepared = ready(await prepareEntry({ rpc, ...choice }));
  const store = memoryStore();
  const outcome = await handToWallet({
    rpc,
    ready: prepared,
    pending: pendingOf(prepared, choice),
    send: testWallet(baker, url),
    store,
  });
  if (outcome.kind !== "landed") throw new Error(`the entry did not land: ${JSON.stringify(outcome)}`);
}

describe("what the campaign page reads", () => {
  test("the campaign at its id, its state against chain time, and nothing at an unknown id", async () => {
    const w = await openingWorld();
    const { args, campaign } = await openedCampaign(w, w.creator);
    chain = startFakeChain(w);
    const rpc = createSolanaRpc(chain.url);
    const page = await loadCampaignPage(rpc, args.id, null);
    expect(page).toMatchObject({
      address: campaign,
      knowable: false,
      readProblem: null,
      mine: null,
      creatorEntry: null,
    });
    expect(page!.campaign.id).toBe(args.id);
    expect(page!.view.state).toBe("Open");
    expect(page!.chain.unixTimestamp).toBe(w.client.svm.getClock().unixTimestamp);
    expect(await loadCampaignPage(rpc, 987_654_321n, null)).toBeNull();
  });

  test("the wallet's own entry, and the creator's entry from the creator's wallet (BR-26)", async () => {
    const w = await openingWorld();
    const { args, campaign } = await openedCampaign(w, w.creator);
    chain = startFakeChain(w);
    const baker = await fundedWallet(w);
    await enter(chain.url, campaign, baker, "yes", P.SOL);
    await enter(chain.url, campaign, w.creator, "no", 2n * P.SOL);
    const page = await loadCampaignPage(createSolanaRpc(chain.url), args.id, baker.address);
    expect([page!.mine?.amountYes, page!.mine?.amountNo]).toEqual([P.SOL, 0n]);
    expect([page!.creatorEntry?.amountYes, page!.creatorEntry?.amountNo]).toEqual([0n, 2n * P.SOL]);
    expect([page!.campaign.poolYes, page!.campaign.poolNo]).toEqual([P.SOL, 2n * P.SOL]);
  });

  test("the recent entries and the chance after each, from the chain's events (L-23)", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    chain = startFakeChain(w);
    const [a, b] = [await fundedWallet(w), await fundedWallet(w)];
    await enter(chain.url, campaign, a, "yes", P.SOL);
    await enter(chain.url, campaign, b, "no", 2n * P.SOL);
    const items = await readActivity(createSolanaRpc(chain.url), campaign);
    expect(items.map((i) => [i.side, i.amount, i.baker, i.poolYes, i.poolNo])).toEqual([
      ["yes", P.SOL, a.address, P.SOL, 0n],
      ["no", 2n * P.SOL, b.address, P.SOL, 2n * P.SOL],
    ]);
    expect(items[0].seq < items[1].seq).toBe(true);
    expect(chanceHistory(items)).toEqual([100, 33.3]);
  });

  test("the route's id is a decimal u64, and nothing else", () => {
    expect(campaignIdFrom("1")).toBe(1n);
    expect(campaignIdFrom("18446744073709551615")).toBe(18_446_744_073_709_551_615n);
    for (const bad of ["", "-1", "1.5", "0x10", "abc", "18446744073709551616", "1".repeat(21)]) {
      expect(campaignIdFrom(bad)).toBeNull();
    }
  });
});
