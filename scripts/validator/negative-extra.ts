/**
 * Purpose: the last three refusals of the negative run, each needing a state the others must not see: the valve
 *          (`TooManyOpenCampaigns`, the creation parameters changed then restored), an `Entry` of another campaign
 *          at the baker's address (`EntryMismatch`), and a stake pool that stopped updating
 *          (`StakePoolNotUpdating`, after the cluster's clock moves to a later epoch, so it runs last).
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { generateKeyPairSigner, getAddressEncoder, getProgramDerivedAddress, type Address } from "@solana/kit";

import { DEFAULT_PARAMS } from "../../tests/brot/flows";
import * as I from "../../tests/brot/instructions";
import { encode } from "../../tests/brot/layouts";
import * as P from "../../tests/brot/program";
import { ENTRY } from "../../tests/brot/structs";

import { funded } from "./negative-baselines";
import { open, type RuleCase } from "./negative-open";
import { account, clock, send } from "./rpc";
import { setAccount } from "./surfnet";
import { FIXTURES, SOL } from "./world";

const POOL = FIXTURES["stakepool-jitosol"][0] as Address;
/** Offset of a stake pool's `last_update_epoch` (readers/stake_pool.rs). */
const LAST_UPDATE_EPOCH_AT = 274;

export const EXTRA_RULES: RuleCase[] = [
  {
    name: "TooManyOpenCampaigns",
    run: async (env) => {
      await send(env.rpc, env.payer, [
        await I.setCreationParamsIx(env.admin, { ...DEFAULT_PARAMS, max_open_campaigns: 1 }),
      ]);
      const sent = await open(env);
      await send(env.rpc, env.payer, [await I.setCreationParamsIx(env.admin, DEFAULT_PARAMS)]);
      return sent;
    },
  },
  {
    name: "EntryMismatch",
    run: async (env) => {
      const id = 13_000_000n;
      await open(env, { id });
      const campaign = await P.campaignPda(id);
      const baker = await funded(env.rpc);
      const key = getAddressEncoder();
      const seeds = [new TextEncoder().encode("entry"), key.encode(campaign), key.encode(baker.address)];
      const [entry, bump] = await getProgramDerivedAddress({ programAddress: P.PROGRAM_ID, seeds });
      const other = (await generateKeyPairSigner()).address;
      const fields = { tag: P.AccountTag.Entry, version: 1, bump, campaign: other, baker: baker.address };
      await setAccount(env.rpc, entry, { lamports: SOL, data: encode(ENTRY, fields), owner: P.PROGRAM_ID });
      const ix = await I.joinCampaignIx(baker, campaign, P.BTC_USD_ACCOUNT, { side: P.Side.Yes, amount: SOL / 10n });
      return send(env.rpc, env.payer, [ix]);
    },
  },
  {
    name: "StakePoolNotUpdating",
    run: async (env) => {
      const pool = (await account(env.rpc, POOL))!;
      const data = Uint8Array.from(pool.data);
      new DataView(data.buffer).setBigUint64(LAST_UPDATE_EPOCH_AT, 0n, true);
      await setAccount(env.rpc, POOL, { lamports: pool.lamports, data, owner: pool.owner });
      // Surfpool 1.5: after this travel the Clock sysvar reads slot 0 (getEpochInfo says 2,160,000), so the program
      // places epoch 6's latest start 2,592,000 slots × 0.5 s ≈ 15 days ahead: the deadline is 20 days.
      await env.rpc.call("surfnet_timeTravel", [{ absoluteEpoch: 5 }]);
      const now = (await clock(env.rpc)).unixTimestamp;
      const args = { kind: P.ReaderKind.StakePoolTvlAtLeast, feedId: new Uint8Array(32), target: 1n, epoch: 6n };
      return open(env, { ...args, deadlineAt: now + 20n * P.DAY }, { metric: POOL });
    },
  },
];
