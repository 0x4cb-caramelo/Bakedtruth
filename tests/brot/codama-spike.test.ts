/**
 * Purpose: the Codama spike (T9): the Kit client rendered from the Shank IDL
 *          (packages/sdk/src/idl/generated) against the hand-written kit. Without the program: every
 *          instruction encodes to the kit's bytes and slots, every account and event decodes as the
 *          kit decodes it. With the program (Wave 2): admin_set_team built by Codama runs in LiteSVM
 *          and Codama's generated fetch decodes GlobalConfig as tests/brot/structs.ts does.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane F
 */
import { describe, expect, test } from "bun:test";
import { address, generateKeyPairSigner, type Instruction, type ReadonlyUint8Array } from "@solana/kit";

import * as C from "../../packages/sdk/src/idl/generated";
import { EVENTS } from "./events";
import { DEFAULT_PARAMS, initConfig } from "./flows";
import { camel, IDL, normalized, sampleBytes } from "./idl";
import * as I from "./instructions";
import { decode, type Layout } from "./layouts";
import * as P from "./program";
import { accountData, createWorld, expectOk, fundedWallet, send } from "./setup";
import * as S from "./structs";

/** The all-zero key, which fills the unused team slots. */
const ZERO = address("11111111111111111111111111111111");
const params = Object.fromEntries(
  Object.entries(DEFAULT_PARAMS).map(([key, value]) => [camel(key), value]),
) as unknown as C.CreationParamsArgs;

/** What the program sees of an instruction: its data and its slots with their roles. */
const shape = (ix: Instruction) => ({
  data: Array.from(ix.data ?? []),
  accounts: (ix.accounts ?? []).map((a) => [a.address, a.role]),
});

// Any of Codama's fixed-size codecs; `any` lets one list hold accounts and events alike.
type AnyCodec = { encode(value: any): ReadonlyUint8Array; decode(bytes: Uint8Array): unknown };

describe("codama client matches the test kit", () => {
  test("every instruction encodes to the kit's data and slots", async () => {
    const who = await generateKeyPairSigner();
    const [config, feeVault, programData] = [await P.configPda(), await P.feeVaultPda(), await P.programDataPda()];
    const id = 7n;
    const campaign = await P.campaignPda(id);
    const vault = await P.vaultPda(campaign);
    const entry = await P.entryPda(campaign, who.address);
    const metricAccount = P.BTC_USD_ACCOUNT;
    const open = {
      id,
      feedId: P.BTC_USD_FEED_ID,
      target: -5n,
      deadlineAt: 1_800_000_000n,
      openingUsd: 750n,
      epoch: 3n,
      expectedParamsVersion: 2,
    };
    const join = { amount: 25_000_000n, minReturnBps: 12_345, expectedEntryTotal: 10_000_000n };
    const accounts = { config, campaign, vault, metricAccount };
    const pairs: [Instruction, Instruction][] = [
      [
        C.getAdminInitializeConfigInstruction({
          authority: who,
          config,
          feeVault,
          programData,
          admin: who.address,
          feeRecipient: who.address,
          params,
        }),
        await I.initializeConfigIx({
          authority: who,
          admin: who.address,
          feeRecipient: who.address,
          params: DEFAULT_PARAMS,
        }),
      ],
      [
        C.getAdminSetTeamInstruction({ admin: who, config, teamLen: 1, team: [who.address, ZERO, ZERO, ZERO, ZERO] }),
        await I.setTeamIx(who, [who.address]),
      ],
      [
        C.getAdminSetCreationParamsInstruction({ admin: who, config, creationParams: params }),
        await I.setCreationParamsIx(who, DEFAULT_PARAMS),
      ],
      [
        C.getAdminSetFeeRecipientInstruction({ admin: who, config, feeRecipient: who.address }),
        await I.setFeeRecipientIx(who, who.address),
      ],
      [
        C.getAdminTransferAdminInstruction({ admin: who, config, newAdmin: who.address }),
        await I.transferAdminIx(who, who.address),
      ],
      [C.getAdminAcceptAdminInstruction({ newAdmin: who, config }), await I.acceptAdminIx(who)],
      [C.getTeamPauseEntriesInstruction({ teamMember: who, config }), await I.pauseEntriesIx(who)],
      [C.getAdminResumeEntriesInstruction({ admin: who, config }), await I.resumeEntriesIx(who)],
      [
        C.getUserOpenCampaignInstruction({
          creator: who,
          ...accounts,
          solUsdPrice: P.SOL_USD_ACCOUNT,
          ...open,
          kind: C.ReaderKind.PriceTouch,
          direction: C.Direction.Below,
          maxLamports: 9n * P.SOL,
        }),
        await I.openCampaignIx(who, { ...open, direction: P.Direction.Below, maxLamports: 9n * P.SOL }),
      ],
      [
        C.getUserJoinCampaignInstruction({ baker: who, ...accounts, entry, side: C.Side.No, ...join }),
        await I.joinCampaignIx(who, campaign, metricAccount, { side: P.Side.No, ...join }),
      ],
      [
        C.getResolveCampaignInstruction({ campaign, metricAccount, proofAccount: P.SOL_USD_ACCOUNT }),
        I.resolveCampaignIx(campaign, metricAccount, P.SOL_USD_ACCOUNT),
      ],
    ];
    expect(pairs.length).toBe(IDL.instructions.length);
    for (const [codama, kit] of pairs) {
      expect(shape(codama)).toEqual(shape(kit));
      const name = C.BrotMarketsInstruction[C.identifyBrotMarketsInstruction(codama.data ?? new Uint8Array())];
      expect(kit.data?.[0]).toBe(IDL.instructions.find((ix) => ix.name === name)?.discriminant.value);
    }
  });

  test("every account and event decodes as the kit decodes it and encodes back to its bytes", () => {
    const cases: [string, Layout, AnyCodec][] = [
      ["GlobalConfig", S.GLOBAL_CONFIG, C.getGlobalConfigCodec()],
      ["Campaign", S.CAMPAIGN, C.getCampaignCodec()],
      ["Entry", S.ENTRY, C.getEntryCodec()],
      ["CreationParams", S.CREATION_PARAMS, C.getCreationParamsCodec()],
      ["ConfigInitialized", EVENTS.ConfigInitialized.layout, C.getConfigInitializedCodec()],
      ["ConfigChanged", EVENTS.ConfigChanged.layout, C.getConfigChangedCodec()],
      ["EntriesPaused", EVENTS.EntriesPaused.layout, C.getEntriesPausedCodec()],
      ["EntriesResumed", EVENTS.EntriesResumed.layout, C.getEntriesResumedCodec()],
      ["CampaignOpened", EVENTS.CampaignOpened.layout, C.getCampaignOpenedCodec()],
      ["EntryAdded", EVENTS.EntryAdded.layout, C.getEntryAddedCodec()],
      ["CampaignResolved", EVENTS.CampaignResolved.layout, C.getCampaignResolvedCodec()],
    ];
    for (const [name, layout, codec] of cases) {
      const bytes = sampleBytes(name);
      const value = codec.decode(bytes);
      expect([name, normalized(value)]).toEqual([name, normalized(decode(layout, bytes))]);
      expect([name, Array.from(codec.encode(value))]).toEqual([name, Array.from(bytes)]);
    }
  });
});

describe("codama spike round-trip", () => {
  test("admin_set_team built by codama runs, and codama fetches GlobalConfig as the kit decodes it", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const team = [await fundedWallet(w), await fundedWallet(w)];
    const config = await P.configPda();
    const members = [...team.map((t) => t.address), ZERO, ZERO, ZERO];
    const ix = C.getAdminSetTeamInstruction({ admin, config, teamLen: team.length, team: members });
    const sent = expectOk(await send(w, [ix]));
    expect(sent.events.map((e) => e.name)).toEqual(["ConfigChanged"]);
    const fetched = await C.fetchGlobalConfig(w.client.rpc, config);
    expect(normalized(fetched.data)).toEqual(normalized(decode(S.GLOBAL_CONFIG, accountData(w, config))));
    expect([fetched.data.teamLen, fetched.data.team.slice(0, 2), fetched.data.admin]).toEqual([
      2,
      team.map((t) => t.address),
      admin.address,
    ]);
    console.log(`codama spike: admin_set_team ran in ${sent.computeUnits} CU; GlobalConfig fetched by codama`);
  });
});
