/**
 * Purpose: the drift check (X0.6): the hand-written test kit (struct layouts, events, instruction
 *          builders, error codes) against the Shank IDL that `bun run idl` writes from the program.
 *          Needs no program binary. When it fails, fix the kit or the program, never the IDL.
 * Version: 0.0.3
 * Sprint:  02 (pot core on Pinocchio), lane F; `resolve_campaign` in 03; the scaffold of Sprints 14–15
 *          (2026-10-13): its two accounts, five instructions and `ContestDecision`
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { generateKeyPairSigner, isSignerRole, isWritableRole, type Address, type Instruction } from "@solana/kit";

import { PROGRAM_ID as BROT_MARKETS_PROGRAM_ID } from "@brot/sdk/read";
import { BrotError } from "./errors";
import { EVENTS } from "./events";
import { DEFAULT_PARAMS } from "./flows";
import { camelLayout, enumVariants, IDL, idlLayout } from "./idl";
import * as I from "./instructions";
import * as IL from "./instructions-14-15";
import * as IS from "./instructions-settlement";
import { layoutSize, type Layout } from "./layouts";
import * as P from "./program";
import * as S from "./structs";
import * as SL from "./structs-14-15";

type Signer = Awaited<ReturnType<typeof generateKeyPairSigner>>;
/** An error's name and code. */
type Code = [string, number];
type Builder = { args: Layout | null; build: (who: Signer) => Promise<Instruction> };

const CAMPAIGN_ID = 7n;
const metric = P.BTC_USD_ACCOUNT;
const openArgs = {
  id: CAMPAIGN_ID,
  feedId: P.BTC_USD_FEED_ID,
  target: 1n,
  deadlineAt: 1n,
  openingUsd: 500n,
  maxLamports: 1n,
};

/** Each instruction of the IDL, by name, with the kit's builder and argument layout. */
const BUILDERS: Record<string, Builder> = {
  AdminInitializeConfig: {
    args: S.INITIALIZE_CONFIG_ARGS,
    build: (who) =>
      I.initializeConfigIx({ authority: who, admin: who.address, feeRecipient: who.address, params: DEFAULT_PARAMS }),
  },
  AdminSetTeam: { args: S.SET_TEAM_ARGS, build: (who) => I.setTeamIx(who, [who.address]) },
  AdminSetCreationParams: { args: S.CREATION_PARAMS, build: (who) => I.setCreationParamsIx(who, DEFAULT_PARAMS) },
  AdminSetFeeRecipient: { args: S.SET_FEE_RECIPIENT_ARGS, build: (who) => I.setFeeRecipientIx(who, who.address) },
  AdminTransferAdmin: { args: S.TRANSFER_ADMIN_ARGS, build: (who) => I.transferAdminIx(who, who.address) },
  AdminAcceptAdmin: { args: null, build: (who) => I.acceptAdminIx(who) },
  TeamPauseEntries: { args: null, build: (who) => I.pauseEntriesIx(who) },
  AdminResumeEntries: { args: null, build: (who) => I.resumeEntriesIx(who) },
  UserOpenCampaign: { args: S.OPEN_CAMPAIGN_ARGS, build: (who) => I.openCampaignIx(who, openArgs) },
  UserJoinCampaign: {
    args: S.JOIN_CAMPAIGN_ARGS,
    build: async (who) => I.joinCampaignIx(who, await P.campaignPda(CAMPAIGN_ID), metric, { side: 0, amount: 1n }),
  },
  ResolveCampaign: { args: null, build: async () => I.resolveCampaignIx(await P.campaignPda(CAMPAIGN_ID), metric) },
  TeamConfirmResult: {
    args: null,
    build: async (who) => IS.teamConfirmResultIx(who, await P.configPda(), await P.campaignPda(CAMPAIGN_ID)),
  },
  TeamVoidCampaign: {
    args: S.TEAM_VOID_CAMPAIGN_ARGS,
    build: async (who) =>
      IS.teamVoidCampaignIx(who, await P.configPda(), await P.campaignPda(CAMPAIGN_ID), {
        reason: 1,
        noteHash: new Uint8Array(32),
      }),
  },
  TeamOpenContest: {
    args: null,
    build: async (who) => IS.teamOpenContestIx(who, await P.configPda(), await P.campaignPda(CAMPAIGN_ID)),
  },
  FinalizeCampaign: {
    args: null,
    build: async () => IS.finalizeCampaignIx(await P.campaignPda(CAMPAIGN_ID), await P.configPda()),
  },
  SettleEntry: {
    args: null,
    build: async (who) => {
      const campaign = await P.campaignPda(CAMPAIGN_ID);
      return IS.settleEntryIx(
        await P.entryPda(campaign, who.address),
        campaign,
        await P.vaultPda(campaign),
        who.address,
      );
    },
  },
  SettleCreatorShare: {
    args: null,
    build: async (who) => {
      const campaign = await P.campaignPda(CAMPAIGN_ID);
      return IS.settleCreatorShareIx(campaign, await P.vaultPda(campaign), who.address);
    },
  },
  CollectFee: {
    args: null,
    build: async () => {
      const campaign = await P.campaignPda(CAMPAIGN_ID);
      return IS.collectFeeIx(campaign, await P.vaultPda(campaign), await P.feeVaultPda());
    },
  },
  SettlePrize: {
    args: null,
    build: async (who) => {
      const campaign = await P.campaignPda(CAMPAIGN_ID);
      return IS.settlePrizeIx(campaign, await P.vaultPda(campaign), who.address);
    },
  },
  CloseCampaign: {
    args: null,
    build: async (who) => {
      const campaign = await P.campaignPda(CAMPAIGN_ID);
      return IS.closeCampaignIx(campaign, await P.vaultPda(campaign), who.address, await P.feeVaultPda());
    },
  },
  TallyLateJoins: {
    args: null,
    build: async (who) => {
      const campaign = await P.campaignPda(CAMPAIGN_ID);
      return IS.tallyLateJoinsIx(who.address, campaign, await P.entryPda(campaign, who.address), []);
    },
  },
  SweepFees: {
    args: null,
    build: async (who) => IS.sweepFeesIx(await P.configPda(), await P.feeVaultPda(), who.address),
  },
  UserLinkReferrer: { args: SL.LINK_REFERRER_ARGS, build: (who) => IL.userLinkReferrerIx(who, who.address) },
  RereadCampaign: {
    args: null,
    build: async () => IL.rereadCampaignIx(await P.campaignPda(CAMPAIGN_ID), await P.configPda(), metric),
  },
  AdminDecideContest: {
    args: SL.DECIDE_CONTEST_ARGS,
    build: async (who) =>
      IL.adminDecideContestIx(who, await P.configPda(), await P.campaignPda(CAMPAIGN_ID), {
        decision: P.ContestDecision.Void,
        voidReason: P.VoidReason.TeamHouseFailure,
        noteHash: new Uint8Array(32),
      }),
  },
  SponsorJoinCampaign: {
    args: SL.SPONSOR_JOIN_ARGS,
    build: async (who) =>
      IL.sponsorJoinCampaignIx(who, await P.campaignPda(CAMPAIGN_ID), metric, {
        side: 0,
        entryUsd: 500n,
        maxLamports: 1n,
      }),
  },
  SettleSealedFee: {
    args: null,
    build: async (who) => {
      const campaign = await P.campaignPda(CAMPAIGN_ID);
      const sealedFee = await P.sealedFeePda(campaign, who.address);
      return IL.settleSealedFeeIx(sealedFee, campaign, who.address, await P.feeVaultPda());
    },
  },
};

/** The address each named slot must hold; signing slots hold the signer. */
async function expectedAddresses(who: Address): Promise<Record<string, Address>> {
  const campaign = await P.campaignPda(CAMPAIGN_ID);
  const signers = ["authority", "admin", "newAdmin", "teamMember", "creator", "baker", "referee", "sponsor"];
  return {
    ...Object.fromEntries(signers.map((name) => [name, who])),
    config: await P.configPda(),
    feeVault: await P.feeVaultPda(),
    programData: await P.programDataPda(),
    systemProgram: P.SYSTEM_PROGRAM_ID,
    eventAuthority: P.EVENT_AUTHORITY,
    program: P.PROGRAM_ID,
    campaign,
    vault: await P.vaultPda(campaign),
    entry: await P.entryPda(campaign, who),
    metricAccount: metric,
    proofAccount: metric,
    solUsdPrice: P.SOL_USD_ACCOUNT,
    // Sprint 04: the payee slots of the settlement instructions are the test wallet, which is also the
    // stored baker, creator, rent payer and fee recipient in these fixtures.
    recipient: who,
    join: await P.joinPda(campaign, who, 0),
    rentPayer: who,
    feeRecipient: who,
    // Sprints 14 and 15: the referee's link, and the sponsor's held fee (the sponsor is the test wallet).
    referralLink: await P.referralLinkPda(who),
    sealedFee: await P.sealedFeePda(campaign, who),
  };
}

const screaming = (name: string) => name.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase() as keyof typeof P.IX;
const byValue = (values: Record<string, number>) =>
  Object.entries(values)
    .sort(([, a], [, b]) => a - b)
    .map(([name]) => name);

describe("idl matches the test kit", () => {
  test("names the program and its address, which the sdk reads", () => {
    expect(IDL.name).toBe("brot_markets");
    expect(IDL.metadata).toEqual({ origin: "shank", address: P.PROGRAM_ID });
    expect(BROT_MARKETS_PROGRAM_ID).toBe(P.PROGRAM_ID);
  });

  test("accounts have the hand-written layouts", () => {
    const names = ["Campaign", "Entry", "GlobalConfig", "Join", "ReferralLink", "SealedFee"];
    expect(IDL.accounts.map((a) => a.name).sort()).toEqual(names);
    expect(idlLayout("GlobalConfig")).toEqual(camelLayout(S.GLOBAL_CONFIG));
    expect(idlLayout("Campaign")).toEqual(camelLayout(S.CAMPAIGN));
    expect(idlLayout("Entry")).toEqual(camelLayout(S.ENTRY));
    expect(idlLayout("Join")).toEqual(camelLayout(S.JOIN));
    expect(idlLayout("ReferralLink")).toEqual(camelLayout(SL.REFERRAL_LINK));
    expect(idlLayout("SealedFee")).toEqual(camelLayout(SL.SEALED_FEE));
    expect(idlLayout("CreationParams")).toEqual(camelLayout(S.CREATION_PARAMS));
  });

  test("every event is an IDL type with the hand-written layout", () => {
    for (const [name, event] of Object.entries(EVENTS)) expect(idlLayout(name)).toEqual(camelLayout(event.layout));
  });

  test("instructions: discriminator, argument layout, accounts in order with their flags", async () => {
    expect(IDL.instructions.map((ix) => ix.name).sort()).toEqual(Object.keys(BUILDERS).sort());
    const who = await generateKeyPairSigner();
    const addresses = await expectedAddresses(who.address);
    for (const idlIx of IDL.instructions) {
      const { args, build } = BUILDERS[idlIx.name];
      const ix = await build(who);
      const discriminator = idlIx.discriminant.value;
      expect([idlIx.name, idlIx.discriminant.type, ix.data?.[0], P.IX[screaming(idlIx.name)]]).toEqual([
        idlIx.name,
        "u8",
        discriminator,
        discriminator,
      ]);
      const defined = idlIx.args.map((a) => (typeof a.type === "object" && "defined" in a.type ? a.type.defined : "?"));
      expect([idlIx.name, defined.length]).toEqual([idlIx.name, args ? 1 : 0]);
      if (args) expect(idlLayout(defined[0])).toEqual(camelLayout(args));
      expect([idlIx.name, ix.data?.length]).toEqual([idlIx.name, 1 + (args ? layoutSize(args) : 0)]);
      const kit = (ix.accounts ?? []).map((a) => [a.address, isWritableRole(a.role), isSignerRole(a.role)]);
      const idl = idlIx.accounts.map((a) => [addresses[a.name] ?? `unknown slot ${a.name}`, a.isMut, a.isSigner]);
      expect([idlIx.name, kit]).toEqual([idlIx.name, idl]);
    }
  });

  test("enums keep the kit's order, from zero", () => {
    const kit = { ReaderKind: P.ReaderKind, Status: P.Status, Side: P.Side, Direction: P.Direction };
    const more = { OperatingLevel: P.OperatingLevel, ConfigChange: P.ConfigChange, ContestDecision: P.ContestDecision };
    for (const [name, values] of Object.entries({ ...kit, ...more })) {
      const tags: number[] = Object.values(values).sort((a, b) => a - b);
      expect([name, tags]).toEqual([name, enumVariants(name).map((_, i) => i)]);
      expect([name, enumVariants(name)]).toEqual([name, byValue(values)]);
    }
  });

  test("errors: error.rs, errors.ts and the IDL list the same codes, each with a message", () => {
    const source = readFileSync("programs/brot-markets/src/error.rs", "utf8");
    const rust = [...source.matchAll(/^\s*(\w+) = (\d+),$/gm)].map(([, name, code]): Code => [name, Number(code)]);
    const idl = (IDL.errors ?? []).map((e): Code => [e.name, e.code]);
    const idlNames = new Set(idl.map(([name]) => name));
    // A variant without #[error("...")] compiles but Shank leaves it out of the IDL.
    expect({ withoutMessage: rust.filter(([name]) => !idlNames.has(name)) }).toEqual({ withoutMessage: [] });
    expect(idl).toEqual(rust);
    expect(Object.entries(BrotError) as Code[]).toEqual(rust);
    expect((IDL.errors ?? []).filter((e) => e.msg.trim() === "")).toEqual([]);
  });
});
