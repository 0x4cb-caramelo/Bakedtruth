/**
 * Purpose: A-10 and X0.7, the creation box's half (Sprint 19 DoD): every refusal of TP §3.4.10 rows 1 to 10 has its own
 *          message in the box's copy; then each refused case the box can be led into is built through the box itself (a
 *          draft, read through the site's RPC, checked by `checkBox` and the SDK's `validateOpenCampaign`), and the very
 *          arguments it would sign are sent straight to the program in LiteSVM, past the site, which refuses them with
 *          the same error. Two cases the box cannot stop by itself (the terms changed, the price moved past
 *          `max_lamports`) are refused by the program and then by the SDK on its re-read.
 *          Filter: `bun test tests/ -t "validateOpenCampaign refuses what the program refuses"`.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, type KeyPairSigner } from "@solana/kit";

import {
  BROT_ERROR_CODES,
  bytesToHex,
  rowOf,
  validateOpenCampaign,
  type BrotErrorName,
  type OpenArgs,
  type SolanaRpc,
} from "@brot/sdk/read";

import { checkBox, type BoxCheck } from "../../app/features/open-campaign/check";
import { REFUSALS, refusalCopy } from "../../app/features/open-campaign/copy-refusals";
import { accountOf, EMPTY_DRAFT, type Draft } from "../../app/features/open-campaign/draft";
import { readDraftAccounts, readWorld } from "../../app/features/open-campaign/reads";
import { BTC_PRICE, DEFAULT_PARAMS, newId, openedCampaign, SOL_PRICE } from "../brot/flows";
import * as I from "../brot/instructions";
import { BTC_CONF, openingWorld, STALE, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fixtureBytes, MINT_OFFSETS, setFixture } from "../brot/readers";
import { expectError, expectOk, send, setPriceAccount } from "../brot/setup";
import { startFakeChain, type FakeChain } from "./fake-chain";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

const BTC = bytesToHex(P.BTC_USD_FEED_ID);
const usd = (raw: bigint) => (Number(raw) / 1e8).toFixed(2);
const PRICE_DRAFT: Draft = {
  ...EMPTY_DRAFT,
  feedHex: BTC,
  target: usd((BTC_PRICE * 11n) / 10n),
  deadline: { days: 7 },
};

/** The box's verdict on `draft` for `signer`, read through the site's RPC, then its arguments sent to the program. */
async function boxThenProgram(w: OpeningWorld, signer: KeyPairSigner, draft: Draft, id = newId()) {
  chain?.close();
  chain = startFakeChain(w);
  const rpc = createSolanaRpc(chain.url);
  const [world, accounts] = await Promise.all([readWorld(rpc), readDraftAccounts(rpc, id, accountOf(draft))]);
  const check = await checkBox({
    draft,
    world,
    accounts,
    readFailed: false,
    id,
    wallet: signer.address,
    balance: null,
    siteAllows: true,
  });
  if (!check.args) throw new Error(`the box built no arguments: ${check.issues.map((i) => i.text).join(" | ")}`);
  const metric = accountOf(draft) ?? undefined;
  const program = async () => send(w, [await I.openCampaignIx(signer, check.args as I.OpenArgs, { metric })]);
  return { check, program, rpc };
}

/** The SDK's verdict on arguments the box built earlier, against the chain as it is now (the price kind's BTC/USD). */
async function sdkNow(rpc: SolanaRpc, signer: KeyPairSigner, args: OpenArgs) {
  const [world, accounts] = await Promise.all([readWorld(rpc), readDraftAccounts(rpc, args.id, null)]);
  const feed = world.feeds.find((f) => f.hex === BTC);
  return validateOpenCampaign({
    signer: signer.address,
    args,
    config: world.config,
    clock: world.clock,
    metricAddress: feed?.address ?? "",
    metric: feed?.account ?? null,
    solUsd: world.solUsd,
    campaignAccount: accounts.campaign,
    vaultAccount: accounts.vault,
    build: { feeds: "devnet" },
    epochSchedule: world.epochSchedule,
  });
}

function expectBoxRefusal(check: BoxCheck, name: BrotErrorName) {
  const refused = check.issues.find((i) => i.level === "refuse" && i.refusal !== undefined);
  expect(refused?.refusal).toBe(name);
  expect(refused?.row).toBe(rowOf(name));
  expect(refused?.text.length ?? 0).toBeGreaterThan(10);
  expect(REFUSALS[name]).toBeDefined();
}

type Case = {
  name: string;
  error: BrotErrorName;
  team?: boolean;
  draft: Partial<Draft>;
  setup?: (w: OpeningWorld) => unknown;
};

const usdc = (w: OpeningWorld) => setFixture(w.client, "mint-usdc").address;
const supplyOf = (name: string) => new DataView(fixtureBytes(name).buffer).getBigUint64(MINT_OFFSETS.supply, true);

const CASES: Case[] = [
  {
    name: "row 1: StakeAtLeast before its devnet YES",
    error: "ReaderKindNotOpen",
    draft: { kind: "stake", account: P.SYSTEM_PROGRAM_ID, epoch: "9999", target: "1000" },
  },
  {
    name: "row 2: a burn campaign on an account the SPL Token program does not own",
    error: "ReaderWrongOwner",
    draft: { kind: "burn", account: P.SOL_USD_ACCOUNT, target: "1000" },
  },
  { name: "row 4: a stale feed", error: "PriceStale", draft: {}, setup: staleBtc },
  { name: "row 3: a price target already met", error: "TargetAlreadyTouched", draft: { target: usd(BTC_PRICE / 2n) } },
  {
    name: "row 3: a price target within 1% of the band",
    error: "TargetTooClose",
    draft: { target: usd(((BTC_PRICE + BTC_CONF) * 1_005n) / 1_000n) },
  },
  { name: "row 5: a deadline 2 days away", error: "DurationTooShort", draft: { deadline: { days: 2 } } },
  { name: "row 5: a deadline 91 days away", error: "DurationTooLong", draft: { deadline: { days: 91 } } },
  { name: "row 7: US$499", error: "OpeningUsdBelowFee", draft: { usd: "499" } },
  {
    name: "row 7: a stale SOL/USD price blocks a paid opening",
    error: "SolUsdStale",
    draft: {},
    setup: (w) => setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: STALE }),
  },
  {
    name: "row 8: the pause stops a team key too",
    error: "OpenWhilePaused",
    team: true,
    draft: {},
    setup: async (w) => expectOk(await send(w, [await I.pauseEntriesIx(w.team)])),
  },
  { name: "row 8: the valve is full", error: "TooManyOpenCampaigns", draft: {}, setup: fullValve },
];

function staleBtc(w: OpeningWorld) {
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime: STALE });
}
async function fullValve(w: OpeningWorld) {
  const params = { ...DEFAULT_PARAMS, max_open_campaigns: 1 };
  expectOk(await send(w, [await I.setCreationParamsIx(w.admin, params)]));
  await openedCampaign(w, w.creator, { expectedParamsVersion: 1 });
}

describe("validateOpenCampaign refuses what the program refuses", () => {
  test("every refusal of rows 1 to 10 has its own message in the box's copy", () => {
    const named = (Object.keys(BROT_ERROR_CODES) as BrotErrorName[]).filter((name) => rowOf(name) !== null);
    expect(named.length).toBeGreaterThanOrEqual(35);
    expect(named.filter((name) => REFUSALS[name] === undefined)).toEqual([]);
  });

  for (const c of CASES) {
    test(`${c.name}: the box shows ${c.error}, and the program refuses the same arguments`, async () => {
      const w = await openingWorld();
      await c.setup?.(w);
      const { check, program } = await boxThenProgram(w, c.team ? w.team : w.creator, { ...PRICE_DRAFT, ...c.draft });
      expectBoxRefusal(check, c.error);
      expectError(await program(), c.error);
    });
  }

  test("row 2: a mint whose authority is live", async () => {
    const w = await openingWorld();
    const draft = {
      ...PRICE_DRAFT,
      kind: "burn" as const,
      account: usdc(w),
      target: String(supplyOf("mint-usdc") / 2n),
    };
    const { check, program } = await boxThenProgram(w, w.team, draft);
    expectBoxRefusal(check, "MintAuthorityLive");
    expectError(await program(), "MintAuthorityLive");
  });

  test("row 10: an id already open is refused; the box's guard reuses ids, the program refuses a repeat", async () => {
    const w = await openingWorld();
    const { args } = await openedCampaign(w, w.creator);
    const { check, program } = await boxThenProgram(w, w.creator, PRICE_DRAFT, args.id);
    expectBoxRefusal(check, "AlreadyInitialized");
    expectError(await program(), "AlreadyInitialized");
  });

  test("row 8: terms changed after the preview, and row 7: the price moved past max_lamports", async () => {
    const w = await openingWorld();
    const terms = await boxThenProgram(w, w.creator, PRICE_DRAFT);
    const args = terms.check.args as OpenArgs;
    expect(terms.check.verdict?.ok).toBe(true);
    expectOk(await send(w, [await I.setCreationParamsIx(w.admin, { ...DEFAULT_PARAMS, creator_share_bps: 40 })]));
    expectError(await terms.program(), "CreationParamsChanged");
    const changed = await sdkNow(terms.rpc, w.creator, args);
    expect(changed.ok ? null : changed.refusal.errorName).toBe("CreationParamsChanged");
    expect(refusalCopy("CreationParamsChanged").place).toBe("after");

    const moved = await boxThenProgram(w, w.creator, PRICE_DRAFT);
    expect(moved.check.verdict?.ok).toBe(true);
    // SOL/USD 2% lower: the same US$500 needs about 2% more lamports, past the quote's 1% margin.
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { price: (SOL_PRICE * 98n) / 100n });
    expectError(await moved.program(), "OpeningAboveMaxLamports");
    const late = await sdkNow(moved.rpc, w.creator, moved.check.args as OpenArgs);
    expect(late.ok ? null : late.refusal.errorName).toBe("OpeningAboveMaxLamports");
    expect(refusalCopy("OpeningAboveMaxLamports").place).toBe("after");
  });
});
