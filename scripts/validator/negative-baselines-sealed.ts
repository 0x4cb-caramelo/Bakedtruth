/**
 * Purpose: the slot matrix's baselines of the sealed entry (Sprint 15) on the surfnet, mirroring
 *          tests/brot/slot-matrix-fixtures-14-15.ts: `sponsor_join_campaign` on a paid BTC/USD campaign, as
 *          `user_join_campaign`'s, by a funded sponsor signing the config's creation-rules version; and
 *          `settle_sealed_fee` on a Settling split campaign with one held fee, its SealedFee written at its canonical
 *          PDA holding its rent and the fee (tests/brot/sealed-support.ts, `placeSealedFee`).
 * Version: 0.0.1
 * Sprint:  15 (the lead's harness, lane INV15)
 */
import { configAddress, decodeGlobalConfig } from "@brot/sdk/read";

import * as IL from "../../tests/brot/instructions-14-15";
import * as P from "../../tests/brot/program";
import { placeSealedFee } from "../../tests/brot/sealed-support";

import { btcOpening, funded, type Build, type Env } from "./negative-baselines";
import { settling } from "./negative-baselines-settle";
import { SNAPSHOT } from "./negative-world";
import { account, expectOk, send } from "./rpc";
import { refreshPrices, SOL } from "./world";

let nextId = 9_500_000n;

/** The creation rules' version the config holds, which a sponsor signs (`CreationParamsChanged` otherwise). */
async function paramsVersion(env: Env) {
  return decodeGlobalConfig((await account(env.rpc, await configAddress()))!).paramsVersion;
}

export const SEALED_BASELINES: [string, Build][] = [
  [
    "SponsorJoinCampaign",
    async (env) => {
      const id = nextId++;
      const opening = await btcOpening(env, await funded(env.rpc), id);
      expectOk(await send(env.rpc, env.payer, [opening]), "an opening to enter sealed");
      await refreshPrices(env.rpc);
      const sponsor = await funded(env.rpc, 100n);
      const args = {
        side: P.Side.Yes,
        entryUsd: 500n,
        maxLamports: 100n * SOL,
        expectedParamsVersion: await paramsVersion(env),
      };
      return { ix: await IL.sponsorJoinCampaignIx(sponsor, await P.campaignPda(id), P.BTC_USD_ACCOUNT, args) };
    },
  ],
  [
    "SettleSealedFee",
    async (env) => {
      const sponsor = await funded(env.rpc, 1n);
      const { campaign } = await settling(env, SNAPSHOT, { sealed_fees_open: 1 });
      const sealedFee = await placeSealedFee(env.sw.w, campaign, sponsor.address, SOL / 2n);
      await env.sw.flush();
      return { ix: IL.settleSealedFeeIx(sealedFee, campaign, sponsor.address, await P.feeVaultPda()) };
    },
  ],
];
