/**
 * Purpose: `validateOpenCampaign`, the SDK's mirror of `user_open_campaign`'s rules (TP 3.4.10) for the
 *          preview: from the arguments, the config, the chain's clock and the accounts the opening
 *          reads, the first refusal the program would return, in its order, with its error and row; or
 *          what the opening will store and charge. The program decides (A-10).
 * Version: 0.1.1 (the sixth kind: the curve config after the nine slots, its build switch and floor)
 * Sprint:  05 (SDK)
 *
 * Order, as programs/brot-markets/src/instructions/campaigns/open_campaign.rs runs it: the argument
 * sizes (row 9); row 1; the canonical arguments and the feed list; the config (row 8: the pause and
 * the valve); the terms the creator saw; row 5; rows 2 to 4 in the kind's reader; row 7, the payment;
 * row 10, the new accounts. tests/sdk/validate-open-*.test.ts feed the program's own refused cases to both,
 * the slot and data-format ones aside (the SDK's builders cannot produce them).
 */
import { BrotRefusal, isRefusal, refuse } from "../errors";
import {
  DBC_MIN_GRADUATION_LAMPORTS,
  OperatingLevel,
  PROGRAM_ID,
  ReaderKind,
  SOL_USD_ACCOUNT,
  SYSTEM_PROGRAM_ID,
} from "../constants";
import { isTeamKey, type GlobalConfig } from "../accounts";
import { sponsoredPriceAddress } from "../pdas";
import { MAINNET_EPOCH_SCHEDULE, type EpochSchedule } from "../chain/epoch";
import { checkDuration, entriesCloseAt, REAL_SCHEDULE, type ScheduleConstants } from "../math/schedule";
import { chargeOpening, type ChainClock, type FetchedAccount, type Payment } from "../quote";
import { canonicalArguments, checkArgumentSizes, openingKind, type OpenArgs } from "./open-rules";
import { validateKind } from "./kinds";
import { rowOf } from "./rows";
import type { FeedCluster } from "../feeds";

export type { OpenArgs } from "./open-rules";

/** An account by its owner and data length, or `null` when it does not exist. */
export type AccountShape = { owner: string; dataLength: number } | null;

export type OpenCampaignCheckInput = {
  /** The signing wallet: a team key opens free with no creator share. */
  signer: string;
  args: OpenArgs;
  /** The decoded `GlobalConfig`, or `null` if it does not exist. */
  config: GlobalConfig | null;
  /** The chain's clock (Clock sysvar), never the device's (A-7). */
  clock: ChainClock & { epoch: bigint };
  /** The account placed in the metric slot, as fetched (`null`: it does not exist). */
  metricAddress: string;
  metric: FetchedAccount | null;
  /** The sponsored SOL/USD account as fetched (`null`: it does not exist). Read only for a paid opening. */
  solUsd: FetchedAccount | null;
  /** The campaign PDA and its vault as they stand now (row 10). */
  campaignAccount: AccountShape;
  vaultAccount: AccountShape;
  /**
   * The build of the target cluster: its feed list, whether `StakeAtLeast` opens, whether `DbcGraduated` opens (every
   * build but mainnet's, the default here), its floor on a curve's threshold (85 SOL; 1 SOL in a drill build), its
   * schedule.
   */
  build?: {
    feeds?: FeedCluster;
    stakeAtLeastOpens?: boolean;
    dbcGraduatedOpens?: boolean;
    dbcMinGraduationLamports?: bigint;
    schedule?: ScheduleConstants;
  };
  epochSchedule?: EpochSchedule;
  /** `StakeAtLeast` only: the vote account's stake in the current epoch. */
  voteStake?: bigint | null;
  /** `DbcGraduated` only: the account placed after the nine slots (the pool's config), as fetched (`null`: absent). */
  curveConfigAddress?: string;
  curveConfig?: FetchedAccount | null;
};

/** What the opening will store and charge, or the first refusal with its row of TP 3.4.10. */
export type OpenCampaignCheck =
  | { ok: true; isTeam: boolean; entriesCloseAt: bigint; priceExponent: number; payment: Payment }
  | { ok: false; refusal: BrotRefusal; row: number | null };

const absent = (address: string): FetchedAccount => ({ address, owner: SYSTEM_PROGRAM_ID, data: new Uint8Array() });

/** Row 10 for one new account (`checks::create_pda_account`). */
function requireCreatable(account: AccountShape): void {
  if (account === null) return;
  if (account.owner === PROGRAM_ID) refuse("AlreadyInitialized");
  if (account.owner !== SYSTEM_PROGRAM_ID) refuse("WrongOwner");
  if (account.dataLength !== 0) refuse("AlreadyInitialized");
}

async function check(input: OpenCampaignCheckInput): Promise<Extract<OpenCampaignCheck, { ok: true }>> {
  const { args, config, clock } = input;
  const build = input.build ?? {};
  checkArgumentSizes(args);
  const kind = openingKind(args.kind, build.stakeAtLeastOpens ?? false, build.dbcGraduatedOpens ?? true);
  const direction = canonicalArguments(kind, args, build.feeds ?? "devnet");
  if (config === null) return refuse("WrongOwner");
  if (config.operatingLevel === OperatingLevel.EntriesHalted) refuse("OpenWhilePaused");
  if (args.openingUsd > 0n && config.openCampaigns >= config.params.maxOpenCampaigns) refuse("TooManyOpenCampaigns");
  if (args.expectedParamsVersion !== config.paramsVersion) refuse("CreationParamsChanged");
  const schedule = build.schedule ?? REAL_SCHEDULE;
  checkDuration(clock.unixTimestamp, args.deadlineAt, schedule);
  const closeAt = entriesCloseAt(clock.unixTimestamp, args.deadlineAt, schedule);
  const priceExponent = validateKind({
    kind,
    metric: input.metric ?? absent(input.metricAddress),
    sponsoredAddress: kind === ReaderKind.PriceTouch ? await sponsoredPriceAddress(args.feedId) : null,
    feedId: args.feedId,
    direction,
    target: args.target,
    maxAge: config.params.campaignMaxAge,
    epoch: args.epoch,
    deadlineAt: args.deadlineAt,
    clock,
    epochSchedule: input.epochSchedule ?? MAINNET_EPOCH_SCHEDULE,
    voteStake: input.voteStake ?? null,
    curveConfig:
      input.curveConfigAddress === undefined ? null : (input.curveConfig ?? absent(input.curveConfigAddress)),
    dbcMinGraduationLamports: build.dbcMinGraduationLamports ?? DBC_MIN_GRADUATION_LAMPORTS.real,
  });
  const isTeam = isTeamKey(config, input.signer);
  const payment = chargeOpening({
    params: { ...config.params, openingFeeUsd: BigInt(config.params.openingFeeUsd) },
    isTeam,
    openingUsd: args.openingUsd,
    maxLamports: args.maxLamports,
    solUsd: input.solUsd ?? absent(SOL_USD_ACCOUNT),
    clock,
  });
  requireCreatable(input.campaignAccount);
  requireCreatable(input.vaultAccount);
  return { ok: true, isTeam, entriesCloseAt: closeAt, priceExponent, payment };
}

/**
 * The preview's verdict on an opening: what the program would store and charge, or the first refusal
 * the program would return for the same inputs, with its row of TP 3.4.10.
 */
export async function validateOpenCampaign(input: OpenCampaignCheckInput): Promise<OpenCampaignCheck> {
  try {
    return await check(input);
  } catch (error) {
    if (isRefusal(error)) return { ok: false, refusal: error, row: rowOf(error.errorName) };
    throw error;
  }
}
