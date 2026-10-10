/**
 * Purpose: the relay's allowlist is taken from a trace of the real client (Sprint 11 DoD; proposal §2.6): the campaign
 *          page's reads, the entry's preparation, the hand-off and its watch, the activity and the re-check run against
 *          the program in LiteSVM behind a recording RPC, and every method they call must be in the table of
 *          docs/technical/relay-allowlist.md. No subscription is ever opened: the client polls.
 *          Filter: `bun test tests/ -t "the client's rpc trace"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createSolanaRpc } from "@solana/kit";

import { recheck } from "@brot/sdk/read";

import { readActivity } from "../../app/features/campaign-page/activity";
import { loadCampaignPage } from "../../app/features/campaign-page/load";
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
});
