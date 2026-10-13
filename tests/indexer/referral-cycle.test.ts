/**
 * Purpose: the referral end to end in LiteSVM (Sprint 14, lane L14R; TP §3.4.11): the real `user_link_referrer` and a
 *          whole campaign through the SDK's builders behind the recording RPC, ingested at `finalized`. A link in an
 *          earlier slot than the referee's first entry counts; in one transaction, a link counts only when its
 *          instruction runs before the join. Each winning entry's basis is `(fee − from_fee) × entry ÷ V`, the three
 *          read from the live `Campaign` account before it closed. The weekly routine prepares the batch with the
 *          cluster's own rent minimum (LiteSVM's 890,880, read from the RPC), carries the transfer below it, and
 *          records the transfer an operations wallet then sent with its memo, by its signature; the public report
 *          lists wallets and amounts; a rebuild from the chain holds the same referral rows. Since the second review:
 *          each line simulated first (a sysvar's credit fails, a wallet's passes) and the cluster's genesis hash read.
 *          Filter: `bun test tests/indexer -t "referral cycle"`. Needs the SBF build.
 * Version: 0.1.1 (the simulation and the genesis hash)
 * Sprint:  14 (referral, lane L14R)
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSolanaRpc, generateKeyPairSigner, type Address, type KeyPairSigner } from "@solana/kit";
import { decodeCampaign, Side, type Campaign, type SolanaRpc } from "@brot/sdk/read";
import { buildJoinCampaign, buildUserLinkReferrer } from "@brot/sdk/tx";

import { dump, openStore, type Store } from "../../services/indexer/src/db/store";
import { createIngest } from "../../services/indexer/src/ingest";
import { rebuild } from "../../services/indexer/src/rebuild";
import { openLedger } from "../../services/indexer/src/referral/ledger";
import { publicReport } from "../../services/indexer/src/referral/report";
import { prepareBatch, recordPayouts, type Prepared } from "../../services/indexer/src/referral/routine";
import { payoutInstructions, simulationCheck } from "../../scripts/referral/simulate";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { setClock } from "../brot/readers";
import { balance, fundedWallet } from "../brot/setup";
import { finalizeVia, joinVia, landVia, openVia, resolveVia, settleVia } from "../site/cycle";
import { startFakeChain, type FakeChain } from "../site/fake-chain";
import { rawOf } from "../site/support";

const SOL = 1_000_000_000n;
const CLOCK = "SysvarC1ock11111111111111111111111111111111" as Address;
/** The test chain has no genesis: a stand-in the routine reads and the signing file embeds. */
const GENESIS = "TestChainGenesis111111111111111111111111111";
type Row = Record<string, unknown>;

let w: OpeningWorld;
let chain: FakeChain;
let store: Store;
let dir: string;
let ingest: ReturnType<typeof createIngest>;
let live: Campaign;
let [A, B, C]: KeyPairSigner[] = [];
let [F, F2]: Address[] = [];
let beforePayout: { A: Row[]; C: Row[] };
let prepared: Prepared;
let payout: string;
let verdicts: Map<string, string>;
const ledger = openLedger(":memory:");

const referral = (s: Store, referee: Address) =>
  s.db.query("SELECT * FROM referrals WHERE referee = ?").get(referee) as Row;
const entries = (s: Store, referee: Address) =>
  s.db.query("SELECT * FROM referral_entries WHERE referee = ?").all(referee) as Row[];
/** A baker's first join, built for a transaction that carries another instruction too. */
const firstJoin = (baker: KeyPairSigner, campaign: Address, amount: bigint) =>
  buildJoinCampaign({
    ...{ baker, campaign, metricAccount: decodeCampaign(rawOf(w, campaign)).metricAccount, side: Side.No, amount },
    ...{ minReturnBps: 0, expectedEntryTotal: 0n, joinIndex: 0 },
  });
/** The test chain's RPC, answering the genesis hash too. */
const withGenesis = (rpc: SolanaRpc): SolanaRpc =>
  new Proxy(rpc, {
    get: (target, name) =>
      name === "getGenesisHash" ? () => ({ send: async () => GENESIS }) : Reflect.get(target, name),
  });

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "brot-referral-cycle-"));
  w = await openingWorld();
  chain = startFakeChain(w);
  const keeper = await fundedWallet(w);
  [A, B, C] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
  const D = await fundedWallet(w);
  [F, F2] = [(await generateKeyPairSigner()).address, (await generateKeyPairSigner()).address]; // empty wallets
  setClock(w.client, { slot: 10n });
  await landVia(chain, A, [await buildUserLinkReferrer({ referee: A, referrer: F })]);
  setClock(w.client, { slot: 20n });
  const { campaign } = await openVia(w, chain, w.creator);
  await joinVia(w, chain, A, campaign, Side.No, SOL);
  await landVia(chain, B, [
    await firstJoin(B, campaign, SOL),
    await buildUserLinkReferrer({ referee: B, referrer: F }),
  ]);
  await landVia(chain, C, [
    await buildUserLinkReferrer({ referee: C, referrer: F2 }),
    await firstJoin(C, campaign, SOL / 50n),
  ]);
  await joinVia(w, chain, D, campaign, Side.Yes, 3n * SOL);
  await resolveVia(w, chain, keeper, campaign, "no");
  const bakers = [A, B, C, D].map((x) => x.address);
  await finalizeVia(w, chain, keeper, campaign, bakers);
  live = decodeCampaign(rawOf(w, campaign));
  store = openStore(join(dir, "live.sqlite"));
  ingest = createIngest(createSolanaRpc(chain.url), store);
  expect(await ingest.refresh()).toMatchObject({ skipped: 0, gaps: [], referralError: null });
  beforePayout = { A: entries(store, A.address), C: entries(store, C.address) };
  const settled = await settleVia(w, chain, keeper, campaign, bakers);
  await landVia(chain, keeper, [await settled.close()]);
  expect(await ingest.refresh()).toMatchObject({ skipped: 0, gaps: [], referralError: null });
  const ops = await fundedWallet(w);
  const rpc = withGenesis(createSolanaRpc(chain.url));
  const canCredit = simulationCheck(rpc, ops.address);
  verdicts = await canCredit([CLOCK, P.PROGRAM_ID, F].map((wallet) => ({ wallet, amount: SOL })));
  prepared = await prepareBatch({ rpc, indexer: store, ledger, ops: ops.address, dryRun: false, now: 0, canCredit });
  const line = prepared.plan.send[0];
  payout = await landVia(chain, ops, payoutInstructions(ops.address, line.wallet, line.amount, "brot-referral:1:1"));
  await recordPayouts({ rpc, ledger, ops: ops.address });
}, 180_000);

afterAll(() => {
  chain.close();
  store.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("referral cycle in LiteSVM", () => {
  test("the links: an earlier slot counts; in one transaction, only the link that runs before the join", () => {
    expect(referral(store, A.address)).toMatchObject({ referrer: F, status: "active", linked_slot: 10 });
    expect(referral(store, A.address)).toMatchObject({ first_entry_slot: 20 });
    expect(referral(store, B.address)).toMatchObject({ status: "late", linked_slot: 20, first_entry_slot: 20 });
    expect(referral(store, C.address)).toMatchObject({ referrer: F2, status: "active", linked_slot: 20 });
    expect(entries(store, B.address)).toEqual([]);
  });

  test("each winning entry's basis is (fee − from_fee) × entry ÷ V, as the live Campaign account held them", () => {
    const kept = live.feeTotal - live.creatorShareFromFee;
    expect([live.winningTotal, live.feeTotal, live.creatorShareFromFee]).toEqual([2_020_000_000n, 300_000_000n, 0n]);
    const fromAccount = { winning_total: `${live.winningTotal}`, fee_total: `${live.feeTotal}` };
    for (const rows of [beforePayout.A, beforePayout.C])
      expect(rows).toMatchObject([{ state: "unsettled", ...fromAccount, from_fee: "0", basis: "0" }]);
    const basisA = (kept * SOL) / live.winningTotal;
    const basisC = (kept * (SOL / 50n)) / live.winningTotal;
    expect([basisA, basisC]).toEqual([148_514_851n, 2_970_297n]);
    expect(entries(store, A.address)).toMatchObject([{ state: "payable", ...fromAccount, basis: `${basisA}` }]);
    expect(entries(store, C.address)).toMatchObject([{ state: "payable", basis: `${basisC}` }]);
    expect(referral(store, A.address)).toMatchObject({ referrer_share: "29702970" });
    expect(referral(store, C.address)).toMatchObject({ referrer_share: "594059" });
  });

  test("the routine: the RPC's rent minimum, the small one carried, the transfer recorded by its signature", () => {
    expect(prepared.plan.rentMin).toBe(890_880n);
    expect(prepared.plan.send.map((l) => [l.idx, l.wallet, l.amount])).toEqual([[1, F, 29_702_970n]]);
    expect(prepared.plan.carried.map((l) => [l.idx, l.wallet, l.amount, l.balance])).toEqual([[2, F2, 594_059n, 0n]]);
    expect(prepared.script).toContain(`send 1 ${F} 0.029702970`);
    expect(balance(w, F)).toBe(29_702_970n);
    const rows = ledger.db.query("SELECT idx, wallet, status, signature FROM referral_payouts ORDER BY idx").all();
    expect(rows).toEqual([
      { idx: 1, wallet: F, status: "landed", signature: payout },
      { idx: 2, wallet: F2, status: "carried", signature: null },
    ]);
    const report = ["Brot Markets: referral payouts, in SOL", "", "Paid", `${F} 0.029702970`, "", "Pending"];
    expect(publicReport(ledger, 1)).toBe([...report, `${F2} 0.000594059`, ""].join("\n"));
  });

  test("R2: the simulation refuses a sysvar's credit and passes a wallet's; the batch's line was checked", () => {
    // The runtime credits a program account (only the static guard, credit.ts, holds one: a program is not a wallet).
    expect([...verdicts.keys()]).toEqual([CLOCK]);
    expect(verdicts.get(CLOCK)).toStartWith("its transfer fails in simulation: ");
    expect(prepared.plan).toMatchObject({ checked: true, held: [], genesis: GENESIS });
    expect(prepared.script).toContain(`GENESIS=${GENESIS}\n`);
  });

  test("a rebuild from the chain holds the same referral rows; a second refresh changes nothing", async () => {
    const before = dump(store);
    expect(before.referrals.length).toBe(3);
    const rebuilt = await rebuild(createSolanaRpc(chain.url), join(dir, "rebuilt.sqlite"));
    expect(rebuilt.complete).toBe(true);
    expect(dump(rebuilt.store)).toEqual(before);
    rebuilt.store.close();
    expect(await ingest.refresh()).toMatchObject({ listed: 0, processed: 0, referralError: null });
    expect(dump(store)).toEqual(before);
  });
});
