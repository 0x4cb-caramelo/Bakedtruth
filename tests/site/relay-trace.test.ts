/**
 * Purpose: the relay's allowlist is taken from a trace of the real client (Sprint 11 DoD; proposal §2.6): the campaign
 *          page's reads, the entry's preparation, the hand-off and its watch, the activity and the re-check run against
 *          the program in LiteSVM behind a recording RPC, and every method they call must be in the table of
 *          docs/technical/relay-allowlist.md. No subscription is ever opened: the client polls. Sprint 12 adds the
 *          wallet's history, its entries, an entry's settlement, a closed campaign and the claim of a reserved share.
 *          Sprint 19 adds the creation box: its reads, the opening, the retry guard's recent opening and the watch.
 *          Filter: `bun test tests/ -t "the client's rpc trace"`.
 * Version: 0.3.0 (Sprint 19: the creation box)
 * Sprint:  11 (site: campaign page and entry); 12; 19
 */
import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createSolanaRpc, getBase64EncodedWireTransaction, lamports, signTransaction } from "@solana/kit";

import { recheck, Side } from "@brot/sdk/read";

import { readActivity } from "../../app/features/campaign-page/activity";
import { campaignClosed, loadCampaignPage } from "../../app/features/campaign-page/load";
import { claimTransaction, lastValidOf, prepareReceive, watchClaim } from "../../app/features/claim/claim";
import { readEntrySettlement, readWalletHistory } from "../../app/features/my-entries/history";
import { loadMyEntries } from "../../app/features/my-entries/load";
import { handToWallet, pendingOf, prepareEntry } from "../../app/features/entry/submit";
import { readDraftAccounts, readWorld } from "../../app/features/open-campaign/reads";
import { recentOpening } from "../../app/features/open-campaign/recent";
import { idFor } from "../../app/features/open-campaign/retry-guard";
import { handToWallet as handOpening, prepareOpening } from "../../app/features/open-campaign/submit";
import { BTC_PRICE, newId, openedCampaign } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fundedWallet, now } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { runCycle } from "./cycle-run";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { memoryStore, napThen, testWallet } from "./support";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

/** The methods of the doc's table: each row starts with the method in backticks; the third column says who calls it. */
function documented(): { method: string; caller: string }[] {
  const doc = readFileSync("docs/technical/relay-allowlist.md", "utf8");
  return [...doc.matchAll(/^\| `(\w+)` \| ([^|]+) \|/gm)].map((m) => ({ method: m[1], caller: m[2].trim() }));
}

describe("the client's rpc trace", () => {
  test("every method the site calls is on the relay's allowlist, and none subscribes", async () => {
    const w = await openingWorld();
    const { args, campaign } = await openedCampaign(w, w.creator);
    chain = startFakeChain(w);
    const rpc = createSolanaRpc(chain.url);
    const baker = await fundedWallet(w);
    const choice = {
      campaign: campaign as string,
      baker: baker.address as string,
      side: "yes" as const,
      amount: P.SOL,
    };
    await loadCampaignPage(rpc, args.id, baker.address);
    const prepared = ready(await prepareEntry({ rpc, ...choice, deploySlot: 0n })); // A-8: ProgramData read too
    const outcome = await handToWallet({
      rpc,
      ready: prepared,
      pending: pendingOf(prepared, choice),
      send: testWallet(baker, chain.url),
      store: memoryStore(),
    });
    expect(outcome.kind).toBe("landed");
    await readActivity(rpc, campaign);
    await recheck(campaign, chain.url).catch(() => null); // open: it reads the campaign, then says it is not resolved
    const seen = new Set(chain.methods);
    const allowed = documented();
    expect([...seen].filter((m) => !allowed.some((a) => a.method === m))).toEqual([]);
    expect([...seen].some((m) => /subscribe/i.test(m))).toBe(false);
    // Every row the client's own code calls was seen; the wallet adapter's rows are outside this trace.
    const fromSite = allowed.filter((a) => !a.caller.startsWith("Wallet adapter")).map((a) => a.method);
    expect(fromSite.filter((m) => !seen.has(m))).toEqual([]);
  });

  test("the Sprint 12 reads and the claim stay on the allowlist: history, entries, settlements, a closed campaign", async () => {
    const w = await openingWorld();
    const run = await runCycle(
      w,
      ([ana, bruno]) => [
        { who: ana, side: Side.Yes, amount: 10_000_000n },
        { who: bruno, side: Side.No, amount: 10_000_000n },
      ],
      { how: "no", stopAt: "closed", emptyCreator: true },
    );
    chain = run.chain;
    const before = chain.methods.length;
    const rpc = createSolanaRpc(chain.url);
    const [ana] = run.bakers;
    const history = await readWalletHistory(rpc, ana.address);
    await loadMyEntries(rpc, ana.address, [run.campaign]);
    expect((await readEntrySettlement(rpc, run.campaign, ana.address)).event).not.toBeNull();
    await loadCampaignPage(rpc, run.id, ana.address);
    expect(await campaignClosed(rpc, run.id + 1_000n)).toBe(false);
    expect(history.events.length).toBeGreaterThan(0);
    // The creator's reserved share: prepared (A-8 first), handed to a stand-in wallet, watched.
    w.client.svm.airdrop(w.creator.address, lamports(P.SOL));
    const prepared = await prepareReceive({ rpc, wallet: w.creator.address, campaign: run.campaign, deploySlot: 0n });
    if (!prepared.ok) throw new Error(`claim not prepared: ${prepared.failure}`);
    // The wallet is handed exactly the bytes the SDK summarised (security review L3).
    expect(new Uint8Array(claimTransaction(prepared.ready).message.serialize())).toEqual(
      new Uint8Array(prepared.ready.transaction.messageBytes),
    );
    const signed = await signTransaction([w.creator.keyPair], prepared.ready.transaction);
    const sig = await rpc.sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64" }).send();
    expect(await watchClaim(rpc, sig, lastValidOf(prepared.ready))).toBe("landed");
    const seen = new Set(chain.methods.slice(before));
    expect([...seen].filter((m) => !documented().some((a) => a.method === m))).toEqual([]);
    expect([...seen].some((m) => /subscribe|getProgramAccounts/i.test(m))).toBe(false);
  });
  test("the Sprint 19 creation box stays on the allowlist: its reads, the opening, the guard and its watch", async () => {
    const w = await openingWorld();
    chain = startFakeChain(w);
    const rpc = createSolanaRpc(chain.url);
    const store = memoryStore();
    const creator = w.creator.address as string;
    const record = idFor(store, creator, newId);
    const id = BigInt(record.id);
    await Promise.all([readWorld(rpc), readDraftAccounts(rpc, id, null)]);
    expect(await recentOpening(rpc, creator, now(w.client))).toBeNull();
    const choice = {
      kind: P.ReaderKind.PriceTouch,
      feedId: P.BTC_USD_FEED_ID,
      target: (BTC_PRICE * 11n) / 10n,
      deadlineAt: now(w.client) + 7n * P.DAY,
      openingUsd: 500n,
    };
    const prepared = ready(await prepareOpening({ rpc, creator, choice, id, deploySlot: 0n })); // A-8 first
    const outcome = await handOpening({
      rpc,
      ready: prepared,
      record,
      send: testWallet(w.creator, chain.url),
      store,
      watch: { sleep: napThen(() => {}) },
    });
    expect(outcome.kind).toBe("opened");
    expect((await recentOpening(rpc, creator, now(w.client)))?.id).toBe(id);
    const seen = new Set(chain.methods);
    expect([...seen].filter((m) => !documented().some((a) => a.method === m))).toEqual([]);
    expect([...seen].some((m) => /subscribe|getProgramAccounts/i.test(m))).toBe(false);
  });
});
