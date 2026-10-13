/**
 * Purpose: the cases of tests/site/open-refusals.test.ts (A-10, X0.7; Sprint 19): a paid BTC/USD draft as the creation
 *          box builds it, the box's verdict on a draft read through the site's RPC with its arguments then sent straight
 *          to the program, the SDK's verdict on arguments built earlier against the chain as it is now, and one refused
 *          case per row the box can be led into, each with the world it needs.
 * Version: 0.1.1 (the sixth kind: a graduation draft reads its pool's config and sends it after the nine slots)
 * Sprint:  19 (site: open a campaign); the sixth kind's site
 */
import { expect } from "bun:test";
import { createSolanaRpc, type KeyPairSigner } from "@solana/kit";

import {
  bytesToHex,
  rowOf,
  validateOpenCampaign,
  type BrotErrorName,
  type OpenArgs,
  type SolanaRpc,
} from "@brot/sdk/read";

import { checkBox, type BoxCheck } from "../../app/features/open-campaign/check";
import { REFUSALS } from "../../app/features/open-campaign/copy-refusals";
import { accountOf, EMPTY_DRAFT, type Draft } from "../../app/features/open-campaign/draft";
import { readDraftAccounts, readWorld } from "../../app/features/open-campaign/reads";
import { BTC_PRICE, DEFAULT_PARAMS, newId, openedCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { BTC_CONF, STALE, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fixtureBytes, MINT_OFFSETS, setFixture } from "../brot/readers";
import { expectOk, send, setPriceAccount } from "../brot/setup";
import { startFakeChain, type FakeChain } from "./fake-chain";

const chains: FakeChain[] = [];
/** Closes the local RPCs the cases opened. */
export const closeChains = () => chains.splice(0).forEach((c) => c.close());

export const BTC = bytesToHex(P.BTC_USD_FEED_ID);
export const usd = (raw: bigint) => (Number(raw) / 1e8).toFixed(2);
export const PRICE_DRAFT: Draft = {
  ...EMPTY_DRAFT,
  feedHex: BTC,
  target: usd((BTC_PRICE * 11n) / 10n),
  deadline: { days: 7 },
};

/** The box's verdict on `draft` for `signer`, read through the site's RPC, then its arguments sent to the program. */
export async function boxThenProgram(w: OpeningWorld, signer: KeyPairSigner, draft: Draft, id = newId()) {
  closeChains();
  const chain = startFakeChain(w);
  chains.push(chain);
  const rpc = createSolanaRpc(chain.url);
  const [world, accounts] = await Promise.all([
    readWorld(rpc),
    readDraftAccounts(rpc, id, accountOf(draft), draft.kind),
  ]);
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
  // A graduation campaign passes the config its pool names after the nine slots, as the SDK's builder does.
  const slots = { metric: accountOf(draft) ?? undefined, curveConfig: accounts.curveConfig?.address };
  const program = async () => send(w, [await I.openCampaignIx(signer, check.args as I.OpenArgs, slots)]);
  return { check, program, rpc };
}

/** The SDK's verdict on arguments the box built earlier, against the chain as it is now (the price kind's BTC/USD). */
export async function sdkNow(rpc: SolanaRpc, signer: KeyPairSigner, args: OpenArgs) {
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

export function expectBoxRefusal(check: BoxCheck, name: BrotErrorName) {
  const refused = check.issues.find((i) => i.level === "refuse" && i.refusal !== undefined);
  expect(refused?.refusal).toBe(name);
  expect(refused?.row).toBe(rowOf(name));
  expect(refused?.text.length ?? 0).toBeGreaterThan(10);
  expect(REFUSALS[name]).toBeDefined();
}

export type Case = {
  name: string;
  error: BrotErrorName;
  team?: boolean;
  draft: Partial<Draft>;
  setup?: (w: OpeningWorld) => unknown;
};

export const usdc = (w: OpeningWorld) => setFixture(w.client, "mint-usdc").address;
export const supplyOf = (name: string) =>
  new DataView(fixtureBytes(name).buffer).getBigUint64(MINT_OFFSETS.supply, true);

export const CASES: Case[] = [
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
