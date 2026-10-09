/**
 * Purpose: the Surfpool run of the price reader, the criterion Sprint 01 carried to Sprint 03: on a
 *          mainnet fork, a team campaign is opened on SOL/USD's sponsored account; resolving it is
 *          refused while the price has not crossed the target; a scenario then moves the price across
 *          it and `resolve_campaign` records YES with its `CampaignResolved` event.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution)
 *
 * Run `bun run scripts/surfpool/price-touch.ts` after `bun run build:program`, with `surfpool` on
 * PATH (or SURFPOOL_BIN). CI installs 1.6.0 pinned by SHA-256 and sets SURFPOOL_EXPECTED_VERSION.
 * Any failed check exits 1 and nothing is skipped. Why each step looks the way it does (the model,
 * the clock, the IDL) is in knowledge-base/tecnologia/surfpool.md.
 */
import * as P from "../../tests/brot/program";
import * as C from "./campaign";
import { installProgram } from "./install";
import * as M from "./pyth-model";
import { expectNoYesYet, expectYes } from "./resolution-checks";
import { clock, type Rpc } from "./rpc";
import { startSurfnet, type Surfnet } from "./surfnet";

/** The target sits 5% above the price at opening; the move lands 2% past the target. */
const TARGET_PERCENT = 105n;
const MOVE_PERCENT = 102n;
/** The move is scheduled this many slots after its registration, on the scenario's timeline. */
const MOVE_AFTER_SLOTS = 4;
const SOL_USD = P.SOL_USD_ACCOUNT;

const say = (step: string, message: string) => console.log(`[${step}] ${message}`);
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/** Waits until the surfnet's clock reads past `unixTimestamp`, so a stamp lands after the opening. */
async function clockPast(rpc: Rpc, unixTimestamp: bigint, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while ((await clock(rpc)).unixTimestamp <= unixTimestamp) {
    if (Date.now() > deadline) throw new Error(`the surfnet's clock stayed at or before ${unixTimestamp}`);
    await sleep(200);
  }
}

async function run(s: Surfnet) {
  const { rpc } = s;
  say("surfpool", `${s.version} at ${s.binary} (sha256 ${s.binarySha256}), fork of ${s.datasource}, ${rpc.url}`);

  // The program at its declared id, the config by its upgrade authority, one team key.
  const authority = await C.fundedSigner(rpc, 10n);
  const installed = await installProgram(rpc, authority.address);
  say("program", `${P.PROGRAM_ID} installed keylessly: ${installed.bytes} bytes, sha256 ${installed.sha256}`);
  const { admin, teamKey } = await C.configureProgram(rpc, authority);
  const config = await C.readConfig(rpc);
  C.expectEqual("config.admin", config.admin, admin.address);
  C.expectEqual("config.team[0]", config.team[0], teamKey.address);
  say("config", `initialised by upgrade authority ${authority.address}; team key ${teamKey.address}`);

  // Surfpool's model on the upgraded receiver, and SOL/USD's sponsored account as the fork serves it.
  const path = await M.adoptModelForUpgradedReceiver(rpc);
  say("model", `PriceUpdateV2 IDL for ${P.PYTH_RECEIVER_ID}: ${path} (Surfpool keys its own to rec5EK…)`);
  const forked = await M.readPriceUpdate(rpc, SOL_USD);
  M.expectUpgradedSolUsd(forked, "forked");
  const lag = (await clock(rpc)).unixTimestamp - forked.publishTime;
  say("model", `${SOL_USD} forked: price ${forked.price} e${forked.exponent}, conf ${forked.conf}, ${lag} s old`);

  // Re-fetched from mainnet by the model, then fresh by the surfnet's clock (which is not the wall
  // clock), with a 0.05% confidence so a wide live band cannot flake the run.
  const p0 = forked.price;
  const conf = p0 / 2_000n > 0n ? p0 / 2_000n : 1n;
  const label = "fresh for the opening";
  const fresh = await M.stampPrice(rpc, { label, address: SOL_USD, price: p0, conf, fetchBeforeUse: true });
  M.expectUpgradedSolUsd(fresh.update, label);
  const stamped = `publish_time ${fresh.values.publishTime}, posted_slot ${fresh.values.postedSlot}`;
  say("model", `re-fetched and stamped through the model by the surfnet's clock: ${stamped}, conf ${conf}`);

  const target = (p0 * TARGET_PERCENT) / 100n;
  const deadlineAt = (await clock(rpc)).unixTimestamp + 7n * P.DAY;
  const terms = { feedId: P.SOL_USD_FEED_ID, direction: P.Direction.Above, target, deadlineAt };
  const opened = await C.openTeamPriceCampaign(rpc, authority, teamKey, terms);
  C.expectOk(opened.sent, "user_open_campaign");
  const campaign = await C.readCampaign(rpc, opened.campaign);
  C.expectEqual("campaign.status", campaign.status, P.Status.Open);
  C.expectEqual("campaign.metric_account", campaign.metric_account, SOL_USD);
  C.expectEqual("campaign.target", campaign.target, target);
  C.expectEqual("campaign.price_exponent", campaign.price_exponent, forked.exponent);
  C.expectEqual("campaign.creator_is_team", campaign.creator_is_team, true);
  const openedEvent = opened.sent.events.find((e) => e.name === "CampaignOpened");
  C.expectThat(openedEvent?.data.seq === 0n, "user_open_campaign emitted no CampaignOpened with seq 0");
  say("open", `team campaign ${opened.campaign}: SOL/USD above ${target} (price ${p0}), free; CampaignOpened`);

  // Before the move: a proof valid in all but the touch, published inside the campaign's window.
  await clockPast(rpc, campaign.opens_at as bigint);
  const below = await M.stampPrice(rpc, {
    label: "inside the window, below the target",
    address: SOL_USD,
    price: p0,
    conf,
  });
  M.expectUpgradedSolUsd(below.update, "below the target");
  const refused = await C.resolveCampaign(rpc, authority, opened.campaign, SOL_USD, SOL_USD);
  await expectNoYesYet(rpc, refused, opened.campaign);
  say("before", `price ${p0} published ${below.values.publishTime}: resolve refused, ${C.describeFailure(refused)}`);

  // The move: one override on the scenario's timeline, MOVE_AFTER_SLOTS slots out, across the target.
  const moved = (target * MOVE_PERCENT) / 100n;
  C.expectThat(moved - conf > target, "the moved price minus its confidence must cross the target");
  const move = await M.stampPrice(rpc, {
    label: "across the target",
    address: SOL_USD,
    price: moved,
    conf,
    afterSlots: MOVE_AFTER_SLOTS,
  });
  M.expectUpgradedSolUsd(move.update, "across the target");
  C.expectThat(move.waitedForItsSlot, "the move showed before its slot: the scenario timeline was not exercised");
  say("move", `registered at slot ${move.registeredAt} for +${MOVE_AFTER_SLOTS}, seen at ${move.seenAt}: ${moved}`);

  const sent = await C.resolveCampaign(rpc, authority, opened.campaign, SOL_USD, SOL_USD);
  const yes = await expectYes(rpc, sent, opened.campaign, SOL_USD, move.values);
  say(
    "yes",
    `resolve_campaign recorded YES, observed ${yes.event.observed_value}, in review until ${yes.event.review_ends_at}`,
  );
  say("yes", `CampaignResolved seq 1: proof ${SOL_USD}, ${yes.age} s and ${yes.lag} slots old`);
}

const surfnet = await startSurfnet().catch((error: Error) => {
  console.error(`[fail] ${error.message}`);
  process.exit(1);
});
try {
  await run(surfnet);
  say("pass", "the price reader ran inside user_open_campaign and resolve_campaign on Surfpool's model");
  surfnet.stop();
  process.exit(0);
} catch (error) {
  console.error(`[fail] ${error instanceof Error ? error.message : String(error)}`);
  const tail = surfnet.log().trim();
  if (tail) console.error(`--- surfpool output (tail) ---\n${tail}`);
  surfnet.stop();
  process.exit(1);
}
