/**
 * Purpose: the summary trusts this program's instructions only as the IDL shapes them (Sprint 05 review, L11):
 *          every instruction the SDK builds, all 22 kinds, is trusted; a trailing account, a changed role or a
 *          missing signature is not; `tally_late_joins` takes plain writable joins after its slots; and the fee
 *          payer may fill a plain slot as a writable signer, as when a baker settles their own entry.
 *          Filter: `bun test tests/ -t "the summary checks each instruction's shape"`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner, type Instruction } from "@solana/kit";

import { campaignAddress, ContestStage, Direction, ReaderKind, Side, VoidReason } from "@brot/sdk/read";
import * as T from "@brot/sdk/tx";

import { DEFAULT_PARAMS, sdkParams } from "../brot/flows";
import * as P from "../brot/program";

const withRole = (ix: Instruction, index: number, role: AccountRole): Instruction => ({
  ...ix,
  accounts: ix.accounts!.map((a, i) => (i === index ? { ...a, role } : a)),
});

async function everyBuilt() {
  const [admin, team, baker, other] = await Promise.all([1, 2, 3, 4].map(() => generateKeyPairSigner()));
  const campaign = await campaignAddress(9n);
  const params = sdkParams(DEFAULT_PARAMS);
  const args = {
    id: 9n,
    kind: ReaderKind.PriceTouch,
    direction: Direction.Above,
    feedId: P.BTC_USD_FEED_ID,
    target: 1n,
    deadlineAt: 2_000_000_000n,
    openingUsd: 500n,
    maxLamports: P.SOL,
    epoch: 0n,
    expectedParamsVersion: 0,
  };
  const join = { baker, campaign, metricAccount: P.BTC_USD_ACCOUNT, side: Side.No, amount: P.SOL };
  return {
    baker,
    campaign,
    built: await Promise.all([
      T.buildInitializeConfig({ authority: admin, admin: admin.address, feeRecipient: other.address, params }),
      T.buildSetTeam({ admin, team: [team.address] }),
      T.buildSetCreationParams({ admin, params }),
      T.buildSetFeeRecipient({ admin, feeRecipient: other.address }),
      T.buildTransferAdmin({ admin, newAdmin: other.address }),
      T.buildAcceptAdmin({ newAdmin: other }),
      T.buildPauseEntries({ teamMember: team }),
      T.buildResumeEntries({ admin }),
      T.buildOpenCampaign({ creator: baker, args }),
      T.buildJoinCampaign({ ...join, minReturnBps: 0, expectedEntryTotal: 0n, joinIndex: 0 }),
      T.buildResolveCampaign({ campaign, metricAccount: P.BTC_USD_ACCOUNT }),
      T.buildTeamConfirmResult({ teamMember: team, campaign }),
      T.buildTeamVoidCampaign({
        teamMember: team,
        campaign,
        reason: VoidReason.TeamOutsideCause,
        noteHash: new Uint8Array(32),
      }),
      T.buildTeamOpenContest({ teamMember: team, campaign, stage: ContestStage.Stage1 }),
      T.buildFinalizeCampaign({ campaign }),
      T.buildSettleEntry({ campaign, baker: baker.address }),
      T.buildSettleCreatorShare({ campaign, creator: baker.address }),
      T.buildCollectFee({ campaign }),
      T.buildSettlePrize({ campaign, recipient: baker.address }),
      T.buildCloseCampaign({ campaign, rentPayer: baker.address }),
      T.buildSweepFees({ feeRecipient: other.address }),
      T.buildTallyLateJoins({ campaign, baker: baker.address, from: 0, to: 2 }),
    ]),
  };
}

describe("the summary checks each instruction's shape", () => {
  test("every instruction the SDK builds is trusted: all 22 kinds", async () => {
    const { built } = await everyBuilt();
    const names = built.map((ix) => T.summarizeInstructions([ix]).items[0]);
    expect(new Set(names.map((item) => item.name)).size).toBe(22);
    expect(names.filter((item) => !item.trusted).map((item) => item.text)).toEqual([]);
  });

  test("a trailing account, a changed role or a missing signature is refused", async () => {
    const { built } = await everyBuilt();
    const join = built[9];
    const trailing = { ...join, accounts: [...join.accounts!, { ...join.accounts![0] }] };
    expect(T.summarizeInstructions([trailing]).items[0].text).toContain(
      "carries accounts the instruction does not take",
    );
    expect(T.summarizeInstructions([withRole(join, 1, AccountRole.WRITABLE)]).items[0].text).toContain(
      "account 2 is writable, not read-only",
    );
    expect(T.summarizeInstructions([withRole(join, 0, AccountRole.WRITABLE)]).items[0].text).toContain(
      "account 1 is writable, not writable signer",
    );
    const short = { ...join, accounts: join.accounts!.slice(0, -1) };
    expect(T.summarizeInstructions([short]).trusted).toBe(false);
  });

  test("tally takes plain writable joins; the fee payer may fill a plain slot as a writable signer", async () => {
    const { built, baker } = await everyBuilt();
    const tally = built[21];
    expect(tally.accounts!.length).toBe(7);
    expect(T.summarizeInstructions([withRole(tally, 6, AccountRole.WRITABLE_SIGNER)]).trusted).toBe(false);
    const settle = built[15];
    const own = withRole(
      settle,
      settle.accounts!.findIndex((a) => a.address === baker.address),
      AccountRole.WRITABLE_SIGNER,
    );
    expect(T.summarizeInstructions([own]).trusted).toBe(false);
    expect(T.summarizeInstructions([own], { feePayer: baker.address }).trusted).toBe(true);
  });
});
