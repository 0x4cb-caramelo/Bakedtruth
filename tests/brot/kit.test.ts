/**
 * Purpose: checks the test kit itself, without the program binary: addresses, layout sizes against
 *          the Rust structs, the codec, and the instruction shapes of the frozen contract.
 * Version: 0.0.5 (the sizes of the scaffold of Sprints 14–15, 2026-10-13)
 * Sprint:  02 (pot core on Pinocchio); the Sprint 03 sizes and `resolve_campaign`; Sprint 04's three events of a
 *          team-finalized campaign; the two accounts, three argument layouts and five events of Sprints 14–15
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner } from "@solana/kit";

import { openingLamports, DEFAULT_PARAMS } from "./flows";
import * as I from "./instructions";
import { decode, encode, layoutSize, offsetOf } from "./layouts";
import * as P from "./program";
import { EVENTS } from "./events";
import * as S from "./structs";
import * as SL from "./structs-14-15";

describe("test kit", () => {
  test("derives the program's and Pyth's addresses", async () => {
    expect(await P.eventAuthorityPda()).toBe(P.EVENT_AUTHORITY);
    expect(await P.sponsoredPriceAccount(P.SOL_USD_FEED_ID)).toBe(P.SOL_USD_ACCOUNT);
    expect(await P.sponsoredPriceAccount(P.BTC_USD_FEED_ID)).toBe(P.BTC_USD_ACCOUNT);
    expect(String(await P.programDataPda())).toBe("8Vy9jyzijx41ntzQHniZFUBA4jFvuwueFtNXUtGvUYGK");
    expect(String(await P.configPda())).toBe("GKM8TyXJXMcHqceY3F3AZnoUQAq15LLftkMzGLqH13bn");
  });

  test("layouts have the sizes of the Rust structs (programs/brot-markets/tests/layout.rs)", () => {
    expect(layoutSize(S.GLOBAL_CONFIG)).toBe(400);
    expect(layoutSize(S.CAMPAIGN)).toBe(512);
    expect(layoutSize(S.ENTRY)).toBe(116);
    expect(layoutSize(S.CREATION_PARAMS)).toBe(70);
    expect(layoutSize(S.INITIALIZE_CONFIG_ARGS)).toBe(134);
    expect(layoutSize(S.SET_TEAM_ARGS)).toBe(161);
    expect(layoutSize(S.OPEN_CAMPAIGN_ARGS)).toBe(94);
    expect(layoutSize(S.JOIN_CAMPAIGN_ARGS)).toBe(21);
    expect(layoutSize(SL.REFERRAL_LINK)).toBe(96);
    expect(layoutSize(SL.SEALED_FEE)).toBe(112);
    expect(layoutSize(SL.LINK_REFERRER_ARGS)).toBe(32);
    expect(layoutSize(SL.DECIDE_CONTEST_ARGS)).toBe(34);
    expect(layoutSize(SL.SPONSOR_JOIN_ARGS)).toBe(29);
    const events = Object.fromEntries(Object.entries(EVENTS).map(([n, e]) => [n, layoutSize(e.layout)]));
    expect(events).toEqual({
      ConfigInitialized: 166,
      ConfigChanged: 360,
      EntriesPaused: 32,
      EntriesResumed: 32,
      CampaignOpened: 263,
      EntryAdded: 114,
      CampaignResolved: 140,
      ResultConfirmed: 73,
      CampaignVoided: 105,
      CampaignFinalized: 97,
      ReferralLinked: 80,
      CampaignReread: 77,
      ContestClosed: 106,
      SealedFeeHeld: 132,
      SealedFeeSettled: 81,
    });
    expect(offsetOf(S.CAMPAIGN, "id")).toBe(16);
  });

  test("encodes and decodes every scalar, negative i128 included", () => {
    const values = { id: 7n, kind: 0, direction: 1, feed_id: P.BTC_USD_FEED_ID, target: -12345678901234567890n };
    const round = decode(S.OPEN_CAMPAIGN_ARGS, encode(S.OPEN_CAMPAIGN_ARGS, { ...values, deadline_at: -5n }));
    expect(round.target).toBe(-12345678901234567890n);
    expect(round.deadline_at).toBe(-5n);
    expect(round.direction).toBe(1);
    const params = decode(S.CREATION_PARAMS, encode(S.CREATION_PARAMS, DEFAULT_PARAMS));
    expect(params.min_entry_lamports).toBe(10_000_000n);
    expect(params.campaign_max_age).toBe(120);
  });

  test("prices the TP's worked example A", () => {
    // TP section 3.4.16: p = 10,927,000,000, e = -8, US$500 -> 4,575,821,360 lamports.
    expect(openingLamports(500n, 10_927_000_000n)).toBe(4_575_821_360n);
  });

  test("builds each instruction with its frozen slots and data size", async () => {
    const who = await generateKeyPairSigner();
    const init = await I.initializeConfigIx({
      authority: who,
      admin: who.address,
      feeRecipient: who.address,
      params: DEFAULT_PARAMS,
    });
    expect([init.accounts?.length, init.data?.length]).toEqual([7, 135]);
    const team = await I.setTeamIx(who, [who.address]);
    expect([team.accounts?.length, team.data?.length]).toEqual([4, 162]);
    const pause = await I.pauseEntriesIx(who);
    expect([pause.accounts?.length, pause.data?.length]).toEqual([4, 1]);
    const open = await I.openCampaignIx(who, {
      id: 1n,
      feedId: P.BTC_USD_FEED_ID,
      target: 1n,
      deadlineAt: 1n,
      openingUsd: 500n,
      maxLamports: 1n,
    });
    expect([open.accounts?.length, open.data?.length, open.data?.[0]]).toEqual([9, 95, P.IX.USER_OPEN_CAMPAIGN]);
    expect(open.accounts?.[4].address).toBe(P.BTC_USD_ACCOUNT);
    const joinIx = await I.joinCampaignIx(who, P.SOL_USD_ACCOUNT, P.BTC_USD_ACCOUNT, { side: 0, amount: 1n });
    expect([joinIx.accounts?.length, joinIx.data?.length]).toEqual([10, 22]);
    expect(joinIx.accounts?.[6].role).toBe(AccountRole.WRITABLE);
    expect(joinIx.accounts?.[8].address).toBe(P.EVENT_AUTHORITY);
    expect(joinIx.accounts?.[9].address).toBe(P.PROGRAM_ID);
    const resolveIx = I.resolveCampaignIx(P.SOL_USD_ACCOUNT, P.BTC_USD_ACCOUNT);
    expect([resolveIx.accounts?.length, resolveIx.data?.length, resolveIx.data?.[0]]).toEqual([5, 1, 10]);
    expect(resolveIx.accounts?.[2].address).toBe(P.BTC_USD_ACCOUNT);
  });
});
