/**
 * Purpose: the slot matrix's baselines on one surfnet, in an order that keeps each one's state: one valid
 *          instruction per instruction of the config, the pause, the opening, the join and the resolution,
 *          mirroring tests/brot/slot-matrix-fixtures.ts, and the steps that set the state up before and restore
 *          it after its cases. The review and settlement baselines are in negative-baselines-settle.ts.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { address, generateKeyPairSigner, type Instruction, type KeyPairSigner } from "@solana/kit";

import { injectCampaign } from "../../tests/brot/campaigns";
import { BTC_PRICE, DEFAULT_PARAMS } from "../../tests/brot/flows";
import * as I from "../../tests/brot/instructions";
import * as P from "../../tests/brot/program";
import * as R from "../../tests/brot/readers";

import { base, type ShimWorld } from "./negative-world";
import { airdrop, clock, expectOk, send, type Rpc } from "./rpc";
import { refreshPrices, SOL } from "./world";

export type Env = {
  rpc: Rpc;
  sw: ShimWorld;
  payer: KeyPairSigner;
  upgradeAuthority: KeyPairSigner;
  admin: KeyPairSigner;
  feeRecipient: KeyPairSigner;
  team: KeyPairSigner[];
};
/** A valid instruction, and what restores the cluster after its cases (or carries the run forward). */
export type Baseline = { ix: Instruction; after?: () => Promise<void> };
export type Build = (env: Env) => Promise<Baseline>;

export async function funded(rpc: Rpc, sol = 20n): Promise<KeyPairSigner> {
  const signer = await generateKeyPairSigner();
  await airdrop(rpc, signer.address, sol * SOL);
  return signer;
}

const sendOk = async (env: Env, ix: Instruction, label: string) =>
  void expectOk(await send(env.rpc, env.payer, [ix]), label);
const ZERO = address("11111111111111111111111111111111");

/** The default paid opening of the kit: BTC/USD above 110% of the captured price, seven days, US$500. */
export async function btcOpening(env: Env, creator: KeyPairSigner, id: bigint) {
  await refreshPrices(env.rpc);
  const now = (await clock(env.rpc)).unixTimestamp;
  const args = { id, feedId: P.BTC_USD_FEED_ID, direction: P.Direction.Above, target: (BTC_PRICE * 11n) / 10n };
  return I.openCampaignIx(creator, { ...args, deadlineAt: now + 7n * P.DAY, openingUsd: 500n, maxLamports: 10n * SOL });
}

let nextOpenId = 9_000_000n;

/** The config and opening baselines, in the order they must run. */
export const CONFIG_BASELINES: [string, Build][] = [
  [
    "AdminInitializeConfig",
    async (env) => {
      const params = {
        authority: env.upgradeAuthority,
        admin: env.admin.address,
        feeRecipient: env.feeRecipient.address,
      };
      const ix = await I.initializeConfigIx({ ...params, params: DEFAULT_PARAMS });
      return { ix, after: () => sendOk(env, ix, "initialize") };
    },
  ],
  [
    "AdminSetTeam",
    async (env) => {
      const ix = await I.setTeamIx(
        env.admin,
        env.team.map((t) => t.address),
      );
      return { ix, after: () => sendOk(env, ix, "set team") };
    },
  ],
  ["AdminSetCreationParams", async (env) => ({ ix: await I.setCreationParamsIx(env.admin, DEFAULT_PARAMS) })],
  [
    "AdminSetFeeRecipient",
    async (env) => ({ ix: await I.setFeeRecipientIx(env.admin, (await funded(env.rpc)).address) }),
  ],
  ["AdminTransferAdmin", async (env) => ({ ix: await I.transferAdminIx(env.admin, (await funded(env.rpc)).address) })],
  [
    "AdminAcceptAdmin",
    async (env) => {
      const next = await funded(env.rpc);
      await sendOk(env, await I.transferAdminIx(env.admin, next.address), "transfer admin");
      const cancel = async () => sendOk(env, await I.transferAdminIx(env.admin, ZERO), "cancel the pending admin");
      return { ix: await I.acceptAdminIx(next), after: cancel };
    },
  ],
  ["TeamPauseEntries", async (env) => ({ ix: await I.pauseEntriesIx(env.team[0]) })],
  [
    "AdminResumeEntries",
    async (env) => {
      await sendOk(env, await I.pauseEntriesIx(env.team[0]), "pause");
      const ix = await I.resumeEntriesIx(env.admin);
      return { ix, after: () => sendOk(env, ix, "resume") };
    },
  ],
  ["UserOpenCampaign", async (env) => ({ ix: await btcOpening(env, await funded(env.rpc), nextOpenId++) })],
  [
    "UserJoinCampaign",
    async (env) => {
      const id = nextOpenId++;
      await sendOk(env, await btcOpening(env, await funded(env.rpc), id), "an opening to join");
      await refreshPrices(env.rpc);
      const baker = await funded(env.rpc);
      const campaign = await P.campaignPda(id);
      return { ix: await I.joinCampaignIx(baker, campaign, P.BTC_USD_ACCOUNT, { side: P.Side.Yes, amount: SOL }) };
    },
  ],
  [
    "ResolveCampaign",
    async (env) => {
      const mint = (await generateKeyPairSigner()).address;
      R.setRawAccount(env.sw.w.client, mint, R.mintBytes({ supply: 5n, mintAuthority: null }), P.SPL_TOKEN_PROGRAM_ID);
      const c = await base(env.rpc, {
        kind: P.ReaderKind.SupplyAtMost,
        metric: mint,
        target: 10n,
        extra: { event_seq: 2n },
      });
      const { campaign } = await injectCampaign(env.sw.w.client, c);
      await env.sw.flush();
      return { ix: I.resolveCampaignIx(campaign, mint) };
    },
  ],
];
