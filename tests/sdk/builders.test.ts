/**
 * Purpose: every builder of `@brot/sdk/tx` against the test kit's hand-written builder of the same
 *          instruction (which tests/brot/idl.test.ts checks against the IDL and every LiteSVM test sends):
 *          the same data bytes and the same slots with the same roles, for all 22 instructions. Needs
 *          no binary.
 * Version: 0.1.1
 * Sprint:  05 (SDK); the scaffold of Sprints 14–15 (2026-10-13) names its five stubs, which have no builder yet;
 *          lane L15 adds the sealed entry's two
 */
import { describe, expect, test } from "bun:test";
import { generateKeyPairSigner, type Instruction } from "@solana/kit";

import * as T from "@brot/sdk/tx";
import { IDL } from "../brot/idl";
import { DEFAULT_PARAMS } from "../brot/flows";
import { camel } from "../brot/idl";
import * as I from "../brot/instructions";
import * as IL from "../brot/instructions-14-15";
import * as IS from "../brot/instructions-settlement";
import * as P from "../brot/program";

const shape = (ix: Instruction) => ({
  program: ix.programAddress,
  data: Array.from(ix.data ?? []),
  accounts: (ix.accounts ?? []).map((a) => [a.address, a.role]),
});
/**
 * The scaffold's stubs of Sprints 14–15 (2026-10-13): in the IDL, refused by the program, with no SDK builder until
 * their lanes. Each lane deletes its own name when it adds the builder and its pair below.
 */
const NO_BUILDER_YET: string[] = [];
const params = Object.fromEntries(
  Object.entries(DEFAULT_PARAMS).map(([k, v]) => [camel(k), v]),
) as unknown as T.CreationParamsArgs;

describe("sdk builders match the test kit", () => {
  test("all 22 instructions: data and slots", async () => {
    const who = await generateKeyPairSigner();
    const other = (await generateKeyPairSigner()).address;
    const id = 77n;
    const campaign = await P.campaignPda(id);
    const [config, vault, feeVault] = [await P.configPda(), await P.vaultPda(campaign), await P.feeVaultPda()];
    const open = {
      id,
      kind: P.ReaderKind.PriceTouch,
      direction: P.Direction.Below,
      feedId: P.BTC_USD_FEED_ID,
      target: 7_000_000_000_000n,
      deadlineAt: 1_800_000_000n,
      openingUsd: 750n,
      maxLamports: 9n * P.SOL,
      epoch: 0n,
      expectedParamsVersion: 3,
    };
    const join = { side: P.Side.No, amount: 25_000_000n, minReturnBps: 12_345, expectedEntryTotal: 10_000_000n };
    const sealed = {
      side: P.Side.Yes,
      entryUsd: 750n,
      maxLamports: 9n * P.SOL,
      minReturnBps: 7,
      expectedEntryTotal: 3n,
      expectedParamsVersion: 4,
    };
    const pairs: [Promise<Instruction> | Instruction, Promise<Instruction> | Instruction][] = [
      [
        T.buildInitializeConfig({ authority: who, admin: other, feeRecipient: other, params }),
        I.initializeConfigIx({ authority: who, admin: other, feeRecipient: other, params: DEFAULT_PARAMS }),
      ],
      [T.buildSetTeam({ admin: who, team: [other, who.address] }), I.setTeamIx(who, [other, who.address])],
      [T.buildSetCreationParams({ admin: who, params }), I.setCreationParamsIx(who, DEFAULT_PARAMS)],
      [T.buildSetFeeRecipient({ admin: who, feeRecipient: other }), I.setFeeRecipientIx(who, other)],
      [T.buildTransferAdmin({ admin: who, newAdmin: other }), I.transferAdminIx(who, other)],
      [T.buildAcceptAdmin({ newAdmin: who }), I.acceptAdminIx(who)],
      [T.buildPauseEntries({ teamMember: who }), I.pauseEntriesIx(who)],
      [T.buildResumeEntries({ admin: who }), I.resumeEntriesIx(who)],
      [T.buildOpenCampaign({ creator: who, args: open }), I.openCampaignIx(who, open)],
      [
        T.buildJoinCampaign({ baker: who, campaign, metricAccount: P.BTC_USD_ACCOUNT, ...join, joinIndex: 4 }),
        I.joinCampaignIx(who, campaign, P.BTC_USD_ACCOUNT, { ...join, joinIndex: 4 }),
      ],
      [
        T.buildResolveCampaign({ campaign, metricAccount: P.BTC_USD_ACCOUNT, proofAccount: other }),
        I.resolveCampaignIx(campaign, P.BTC_USD_ACCOUNT, other),
      ],
      [T.buildTeamConfirmResult({ teamMember: who, campaign }), IS.teamConfirmResultIx(who, config, campaign)],
      [
        T.buildTeamVoidCampaign({ teamMember: who, campaign, reason: 5, noteHash: new Uint8Array(32).fill(9) }),
        IS.teamVoidCampaignIx(who, config, campaign, { reason: 5, noteHash: new Uint8Array(32).fill(9) }),
      ],
      [T.buildTeamOpenContest({ teamMember: who, campaign }), IS.teamOpenContestIx(who, config, campaign)],
      [T.buildFinalizeCampaign({ campaign }), IS.finalizeCampaignIx(campaign, config)],
      [
        T.buildTallyLateJoins({ campaign, baker: other, from: 1, to: 3 }),
        IS.tallyLateJoinsIx(other, campaign, await P.entryPda(campaign, other), [
          await P.joinPda(campaign, other, 1),
          await P.joinPda(campaign, other, 2),
        ]),
      ],
      [
        T.buildSettleEntry({ campaign, baker: other }),
        IS.settleEntryIx(await P.entryPda(campaign, other), campaign, vault, other),
      ],
      [T.buildSettleCreatorShare({ campaign, creator: other }), IS.settleCreatorShareIx(campaign, vault, other)],
      [T.buildCollectFee({ campaign }), IS.collectFeeIx(campaign, vault, feeVault)],
      [T.buildSettlePrize({ campaign, recipient: other }), IS.settlePrizeIx(campaign, vault, other)],
      [T.buildCloseCampaign({ campaign, rentPayer: other }), IS.closeCampaignIx(campaign, vault, other, feeVault)],
      [T.buildSweepFees({ feeRecipient: other }), IS.sweepFeesIx(config, feeVault, other)],
      [T.buildUserLinkReferrer({ referee: who, referrer: other }), IL.userLinkReferrerIx(who, other)],
      // Sprint 14, lane L14B: the contest's re-read and the admin's decision.
      [
        T.buildRereadCampaign({ campaign, metricAccount: P.BTC_USD_ACCOUNT, proofAccount: other }),
        IL.rereadCampaignIx(campaign, config, P.BTC_USD_ACCOUNT, other),
      ],
      [
        T.buildAdminDecideContest({
          admin: who,
          campaign,
          decision: P.ContestDecision.Void,
          voidReason: P.VoidReason.TeamHouseFailure,
          noteHash: new Uint8Array(32).fill(5),
        }),
        IL.adminDecideContestIx(who, config, campaign, {
          decision: P.ContestDecision.Void,
          voidReason: P.VoidReason.TeamHouseFailure,
          noteHash: new Uint8Array(32).fill(5),
        }),
      ],
      // Lane L15 (Sprint 15): the sealed entry and its fee's settlement.
      [
        T.buildSponsorJoinCampaign({
          sponsor: who,
          campaign,
          metricAccount: P.BTC_USD_ACCOUNT,
          ...sealed,
          joinIndex: 4,
        }),
        IL.sponsorJoinCampaignIx(who, campaign, P.BTC_USD_ACCOUNT, { ...sealed, joinIndex: 4 }),
      ],
      [
        T.buildSettleSealedFee({ campaign, sponsor: other }),
        IL.settleSealedFeeIx(await P.sealedFeePda(campaign, other), campaign, other, feeVault),
      ],
    ];
    expect(NO_BUILDER_YET.filter((name) => !IDL.instructions.some((ix) => ix.name === name))).toEqual([]);
    expect(pairs.length).toBe(IDL.instructions.length - NO_BUILDER_YET.length);
    for (const [sdk, kit] of pairs) expect(shape(await sdk)).toEqual(shape(await kit));
  });

  test("an opening of another kind names its metric account; the team gets five slots; ids are random u64", async () => {
    const who = await generateKeyPairSigner();
    const args = { id: 1n, kind: P.ReaderKind.SupplyAtMost, target: 1n, deadlineAt: 1n, openingUsd: 0n };
    await expect(
      T.buildOpenCampaign({ creator: who, args: { ...args, maxLamports: 0n, expectedParamsVersion: 0 } }),
    ).rejects.toThrow("metric account");
    await expect(T.buildSetTeam({ admin: who, team: Array(6).fill(who.address) })).rejects.toThrow("at most 5");
    const ids = new Set(Array.from({ length: 64 }, () => T.randomCampaignId()));
    expect(ids.size).toBe(64);
    for (const id of ids) expect(id >= 0n && id < 1n << 64n).toBe(true);
  });
});
