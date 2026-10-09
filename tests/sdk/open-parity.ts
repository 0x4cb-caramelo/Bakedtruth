/**
 * Purpose: the parity harness of A-10 / X0.7 (SDK half): one opening fed to both `validateOpenCampaign`
 *          (from the world's accounts and clock, read before anything is sent) and the program in
 *          LiteSVM, and the two verdicts compared: the same refusal, or both accepting with the same
 *          charge and entry close.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { expect } from "bun:test";
import type { Address, KeyPairSigner } from "@solana/kit";

import {
  decodeGlobalConfig,
  errorName,
  SYSTEM_PROGRAM_ID,
  validateOpenCampaign,
  type FetchedAccount,
  type OpenCampaignCheck,
} from "@brot/sdk/read";

import type { BrotErrorName } from "../brot/errors";
import { readCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { openArgs } from "../brot/opening";
import * as P from "../brot/program";
import { send, type World } from "../brot/setup";

type Slots = { metric?: Address; solUsd?: Address };

/** An account as the SDK reads it; one that does not exist reads as the System Program's, empty. */
function fetched(w: World, address: Address): FetchedAccount {
  const account = w.client.svm.getAccount(address);
  if (!account.exists) return { address, owner: SYSTEM_PROGRAM_ID, data: new Uint8Array() };
  return { address, owner: account.programAddress, data: new Uint8Array(account.data) };
}

function shape(w: World, address: Address) {
  const account = w.client.svm.getAccount(address);
  return account.exists ? { owner: account.programAddress as string, dataLength: account.data.length } : null;
}

/** The SDK's verdict on `args`, from what the world holds now. */
export async function sdkVerdict(w: World, signer: KeyPairSigner, args: I.OpenArgs, slots: Slots = {}) {
  const metricAddress = slots.metric ?? (await P.sponsoredPriceAccount(args.feedId));
  const config = w.client.svm.getAccount(await P.configPda());
  const clock = w.client.svm.getClock();
  const schedule = w.client.svm.getEpochSchedule();
  const campaign = await P.campaignPda(args.id);
  return validateOpenCampaign({
    signer: signer.address,
    args: {
      id: args.id,
      kind: args.kind ?? P.ReaderKind.PriceTouch,
      direction: args.direction ?? P.Direction.Above,
      feedId: args.feedId,
      target: args.target,
      deadlineAt: args.deadlineAt,
      openingUsd: args.openingUsd,
      maxLamports: args.maxLamports,
      epoch: args.epoch ?? 0n,
      expectedParamsVersion: args.expectedParamsVersion ?? 0,
    },
    config: config.exists ? decodeGlobalConfig({ owner: config.programAddress, data: config.data }) : null,
    clock: { unixTimestamp: clock.unixTimestamp, slot: clock.slot, epoch: clock.epoch },
    metricAddress,
    metric: fetched(w, metricAddress),
    solUsd: fetched(w, slots.solUsd ?? P.SOL_USD_ACCOUNT),
    campaignAccount: shape(w, campaign),
    vaultAccount: shape(w, await P.vaultPda(campaign)),
    build: { feeds: "devnet", stakeAtLeastOpens: false },
    epochSchedule: {
      slotsPerEpoch: schedule.slotsPerEpoch,
      leaderScheduleSlotOffset: schedule.leaderScheduleSlotOffset,
      warmup: schedule.warmup,
      firstNormalEpoch: schedule.firstNormalEpoch,
      firstNormalSlot: schedule.firstNormalSlot,
    },
  });
}

const verdictName = (check: OpenCampaignCheck) => (check.ok ? "accepted" : check.refusal.errorName);

/** The refusal names this harness has seen both sides agree on, for the coverage line of each file. */
export const agreed = new Set<string>();

/**
 * Builds the opening `over` (on top of tests/brot/opening.ts's default), asks the SDK, sends it to the
 * program, and expects both to give `expected` (a refusal name, or "accepted"). On an accepted opening
 * the SDK's charge and entry close must be what the program stored.
 */
export async function expectParity(
  w: World,
  signer: KeyPairSigner,
  expected: BrotErrorName | "accepted",
  over: Partial<I.OpenArgs> = {},
  slots: Slots = {},
) {
  const args = openArgs(w, over);
  const sdk = await sdkVerdict(w, signer, args, slots);
  const sent = await send(w, [await I.openCampaignIx(signer, args, slots)]);
  const program = sent.ok ? "accepted" : (errorName(sent.code ?? -1) ?? `code ${sent.code}`);
  expect({ program, sdk: verdictName(sdk) }).toEqual({ program: expected, sdk: expected });
  if (sdk.ok && sent.ok) {
    const stored = readCampaign(w, await P.campaignPda(args.id));
    expect({
      paid: sdk.payment.paid,
      prize: sdk.payment.prize,
      fee: sdk.payment.fee,
      price: sdk.payment.price,
      close: sdk.entriesCloseAt,
      exponent: sdk.priceExponent,
    }).toEqual({
      paid: stored.opening_paid_lamports,
      prize: stored.prize_lamports,
      fee: stored.opening_fee_lamports,
      price: stored.opening_price,
      close: stored.entries_close_at,
      exponent: stored.price_exponent,
    });
  }
  agreed.add(expected);
  return { args, sdk, sent };
}
