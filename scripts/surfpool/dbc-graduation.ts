/**
 * Purpose: the Surfpool run of the graduation kind (`DbcGraduated`) on a real Meteora DBC curve: on a mainnet fork, a
 *          team campaign opens on a stage-0 pool priced in SOL with its config after the nine slots; two bakers join
 *          YES and NO; resolving is refused while the curve is open; a wallet completes the curve with DBC's own
 *          swap, which stamps the second it completed; a third join is refused; `resolve_campaign` records YES; the
 *          joins are tallied, the team confirms, and the YES baker is paid the pot.
 * Version: 0.0.1
 * Sprint:  the sixth kind, after 05 (docs/technical/meteora-readers-plan.md section 4.6)
 *
 * Run `bun run scripts/surfpool/dbc-graduation.ts` after `bun run build:program`, with `surfpool` on PATH (or
 * SURFPOOL_BIN). DBC_POOL names another stage-0 pool; the default is the captured fixture's
 * (tests/fixtures/dbc-pool-stage0.bin), a launch whose curve has stayed open. The fork is local: nothing is sent to
 * any cluster. Every step is checked, and any failed check exits 1.
 */
import { address, type Address, type KeyPairSigner } from "@solana/kit";

import { decodeEntry, entryAddress, ReaderKind, Side } from "@brot/sdk/read";
import {
  buildJoinCampaign,
  buildOpenCampaign,
  buildResolveCampaign,
  buildSettleEntry,
  buildTallyLateJoins,
  buildTeamConfirmResult,
} from "@brot/sdk/tx";

import { BrotError } from "../../tests/brot/errors";
import * as P from "../../tests/brot/program";
import * as C from "./campaign";
import { completeCurveIxs, readCurve } from "./dbc";
import { installProgram } from "./install";
import { account, clock, send, type Rpc } from "./rpc";
import { startSurfnet, type Surfnet } from "./surfnet";

const POOL = address(process.env.DBC_POOL ?? "mxGZ5hpgCENm94f19rp8NoBd14E4YLXVe4ZFJXQP8S6");
const ENTRY = P.SOL;
const say = (step: string, message: string) => console.log(`[${step}] ${message}`);
const sol = (lamports: bigint) => `${lamports / P.SOL}.${(lamports % P.SOL).toString().padStart(9, "0")} SOL`;

/** A first join of `amount` on `side` by `baker`. */
const joinIx = (baker: KeyPairSigner, campaign: Address, side: Side, amount: bigint) =>
  buildJoinCampaign({
    baker,
    campaign,
    metricAccount: POOL,
    side,
    amount,
    minReturnBps: 0,
    expectedEntryTotal: 0n,
    joinIndex: 0,
  });

/** Settles `baker`'s entry and returns what the baker gained, and the Entry's rent within it. */
async function settled(rpc: Rpc, payer: KeyPairSigner, campaign: Address, baker: Address) {
  const entry = await account(rpc, await entryAddress(campaign, baker));
  if (!entry) throw new Error(`no entry for ${baker}`);
  const before = (await account(rpc, baker))!.lamports;
  C.expectOk(await send(rpc, payer, [await buildSettleEntry({ campaign, baker })]), "settle_entry");
  return { gain: (await account(rpc, baker))!.lamports - before, rent: entry.lamports };
}

async function run(s: Surfnet) {
  const { rpc } = s;
  say("surfpool", `${s.version} (sha256 ${s.binarySha256}), fork of ${s.datasource}, ${rpc.url}`);
  const authority = await C.fundedSigner(rpc, 10n);
  const installed = await installProgram(rpc, authority.address);
  say("program", `${P.PROGRAM_ID} installed: ${installed.bytes} bytes, sha256 ${installed.sha256}`);
  const { teamKey } = await C.configureProgram(rpc, authority);

  // The curve as mainnet holds it now: open, priced in SOL, at least 85 SOL, at least 10% of it still missing.
  const curve = await readCurve(rpc, POOL);
  say(
    "curve",
    `${POOL}: stage ${curve.stage}, ${sol(curve.raised)} raised of ${sol(curve.threshold)}, config ${curve.config}`,
  );
  C.expectThat(
    curve.stage === 0,
    `${POOL} is past its curve (stage ${curve.stage}): pass another stage-0 pool as DBC_POOL`,
  );
  C.expectThat(curve.threshold >= P.DBC_MIN_GRADUATION_LAMPORTS, `the curve's threshold is below 85 SOL`);
  C.expectThat(curve.threshold - curve.raised >= curve.threshold / 10n, "less than 10% of the curve is still missing");

  // A team key's free opening, the pool's config after the nine slots.
  const deadlineAt = (await clock(rpc)).unixTimestamp + 7n * P.DAY;
  const expectedParamsVersion = Number((await C.readConfig(rpc)).params_version);
  const args = { id: C.randomId(), kind: ReaderKind.DbcGraduated, target: curve.threshold, deadlineAt };
  const open = { ...args, openingUsd: 0n, maxLamports: 0n, expectedParamsVersion };
  const opening = await buildOpenCampaign({
    creator: teamKey,
    args: open,
    metricAccount: POOL,
    curveConfig: curve.config,
  });
  const opened = C.expectOk(await send(rpc, authority, [opening]), "user_open_campaign");
  const campaign = await P.campaignPda(args.id);
  const stored = await C.readCampaign(rpc, campaign);
  C.expectEqual("campaign.kind", stored.kind, ReaderKind.DbcGraduated);
  C.expectEqual("campaign.target", stored.target, curve.threshold);
  C.expectThat(
    opened.events.some((e) => e.name === "CampaignOpened"),
    "no CampaignOpened event",
  );
  say(
    "open",
    `campaign ${campaign}: does this curve graduate by ${new Date(Number(deadlineAt) * 1000).toISOString()}?`,
  );

  // Two bakers, one on each side.
  const [yes, no, late] = [await C.fundedSigner(rpc, 3n), await C.fundedSigner(rpc, 3n), await C.fundedSigner(rpc, 3n)];
  C.expectOk(await send(rpc, yes, [await joinIx(yes, campaign, Side.Yes, ENTRY)]), "join YES");
  C.expectOk(await send(rpc, no, [await joinIx(no, campaign, Side.No, ENTRY)]), "join NO");
  say("join", `${yes.address} on YES and ${no.address} on NO, ${sol(ENTRY)} each`);

  // While the curve is open there is nothing to record.
  const early = await send(rpc, authority, [buildResolveCampaign({ campaign, metricAccount: POOL })]);
  C.expectThat(early.code === BrotError.NotResolvableYet, `resolve before graduation: ${C.describeFailure(early)}`);
  C.expectEqual("campaign.status after the refusal", (await C.readCampaign(rpc, campaign)).status, P.Status.Open);
  say("before", `resolve refused while the curve is open: ${C.describeFailure(early)}`);

  // A wallet buys the rest of the curve with DBC's own swap: the program completes it and stamps the second.
  const buyer = await C.fundedSigner(rpc, curve.threshold / P.SOL + 50n);
  const budget = curve.threshold + curve.threshold / 5n;
  const bought = C.expectOk(await send(rpc, buyer, await completeCurveIxs(buyer, curve, budget)), "DBC swap2");
  const done = await readCurve(rpc, POOL);
  C.expectThat(done.stage >= 1, `the swap left the curve at stage ${done.stage}`);
  C.expectThat(done.raised >= curve.threshold, `the swap raised ${sol(done.raised)}, short of the threshold`);
  C.expectThat(done.stamp > 0n && done.stamp <= deadlineAt, `the curve stamped ${done.stamp}`);
  const curveLog = bought.logs.find((l) => l.includes("Program log: Instruction: Swap2")) ?? "Swap2";
  say("graduate", `${curveLog.trim()} landed: stage ${done.stage}, ${sol(done.raised)} raised, stamped ${done.stamp}`);

  // Entries lock the moment the curve completes.
  const locked = await send(rpc, late, [await joinIx(late, campaign, Side.Yes, ENTRY)]);
  C.expectThat(locked.code === BrotError.OutcomeKnowable, `a join after graduation: ${C.describeFailure(locked)}`);
  say("lock", `a join after graduation is refused: ${C.describeFailure(locked)}`);

  // The program reads the pool and records YES from its stamp.
  const resolved = C.expectOk(
    await send(rpc, authority, [buildResolveCampaign({ campaign, metricAccount: POOL })]),
    "resolve",
  );
  const after = await C.readCampaign(rpc, campaign);
  C.expectEqual("campaign.outcome", after.outcome, P.Outcome.Yes);
  C.expectEqual("campaign.observed_value", after.observed_value, done.raised);
  C.expectEqual("campaign.met_late", after.met_late, false);
  const event = resolved.events.find((e) => e.name === "CampaignResolved")?.data;
  C.expectEqual("event.read_account", event?.read_account, POOL);
  C.expectEqual("event.kind", event?.kind, ReaderKind.DbcGraduated);
  say("yes", `resolve_campaign recorded YES, observed ${sol(done.raised)}, in review until ${after.review_ends_at}`);

  // Each baker's joins tallied, the team's confirmation, then the payouts.
  for (const baker of [yes, no]) {
    const entry = decodeEntry((await account(rpc, await entryAddress(campaign, baker.address)))!);
    const tally = await buildTallyLateJoins({
      campaign,
      baker: baker.address,
      from: entry.joinsTallied,
      to: entry.joinCount,
    });
    C.expectOk(await send(rpc, authority, [tally]), "tally_late_joins");
  }
  C.expectOk(await send(rpc, authority, [await buildTeamConfirmResult({ teamMember: teamKey, campaign })]), "confirm");
  const final = await C.readCampaign(rpc, campaign);
  const won = await settled(rpc, authority, campaign, yes.address);
  const lost = await settled(rpc, authority, campaign, no.address);
  C.expectEqual("YES baker's payout", won.gain - won.rent, final.distributable);
  C.expectEqual("NO baker's payout", lost.gain - lost.rent, 0n);
  say("paid", `YES baker paid ${sol(won.gain - won.rent)} (both entries less Brot's fee); NO baker paid nothing`);
}

const surfnet = await startSurfnet().catch((error: Error) => {
  console.error(`[fail] ${error.message}`);
  process.exit(1);
});
try {
  await run(surfnet);
  say("pass", "the graduation reader ran on a real Meteora DBC curve, from the opening to the payout");
  surfnet.stop();
  process.exit(0);
} catch (error) {
  console.error(`[fail] ${error instanceof Error ? error.message : String(error)}`);
  const tail = surfnet.log().trim();
  if (tail) console.error(`--- surfpool output (tail) ---\n${tail}`);
  surfnet.stop();
  process.exit(1);
}
