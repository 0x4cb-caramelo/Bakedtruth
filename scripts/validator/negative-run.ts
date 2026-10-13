/**
 * Purpose: the slot matrix and one paid opening on a local validator (Sprint 05 DoD: "the negative tests, the slot
 *          tests and one paid opening run once on a real validator", because Mollusk 0.14 and npm LiteSVM 1.5 are
 *          not the cluster's runtime). Every case of tests/brot/slot-matrix.gen.ts is sent, unchanged, against
 *          the baseline its instruction gets here, and must fail with its own error and move no lamport; the
 *          baselines are checked by simulation first, and the paid opening is sent and charged as the SDK says.
 * Version: 0.1.2 (Sprint 14: the contest is enabled, so its baseline must pass; the referral and the dispute's
 *          baselines, negative-baselines-14.ts; Sprint 15: the sealed entry's, negative-baselines-sealed.ts)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; 14 (lane INV14); 15 (lane INV15)
 *
 * `bun run scripts/validator/negative-run.ts` (offline surfnet, loopback-only namespace). Surfpool is not Agave's
 * validator either: see knowledge-base notes; `solana-test-validator` needs a CPU with AVX2 to start.
 */
import { type Instruction } from "@solana/kit";

import { SOL_USD_ACCOUNT, chargeOpening, decodeCampaign, decodeGlobalConfig, configAddress } from "@brot/sdk/read";
import { SLOT_MATRIX } from "../../tests/brot/slot-matrix.gen";
import { mutate } from "../../tests/brot/slot-matrix-mutate";

import { isolateOrExit } from "./isolate";
import { CONFIG_BASELINES, funded, type Build, type Env } from "./negative-baselines";
import { SETTLE_BASELINES } from "./negative-baselines-settle";
import { BASELINES_14 } from "./negative-baselines-14";
import { SEALED_BASELINES } from "./negative-baselines-sealed";
import { shimWorld } from "./negative-world";
import { account, balance, clock, send } from "./rpc";
import { simulate } from "./simulate";
import { refreshPrices, startLocalWorld } from "./world";
import { OPEN_RULES, type RuleCase } from "./negative-open";
import { JOIN_RULES } from "./negative-join";
import { EXTRA_RULES } from "./negative-extra";

isolateOrExit(import.meta.path);

const counts = { cases: 0, passed: 0, failed: 0, skipped: 0, rules: 0, rulesPassed: 0 };
const failures: string[] = [];

/** The cases of `name` against its baseline: each refused with its own error, no lamport of the slots moved. */
async function runCases(env: Env, name: string, build: Build) {
  const cases = SLOT_MATRIX.filter((c) => c.ix === name);
  const { ix, after } = await build(env);
  const sanity = await simulate(env.rpc, env.payer, [ix]);
  if (!sanity.ok) {
    counts.skipped += cases.length;
    failures.push(
      `${name}: baseline ${sanity.ok ? "accepted" : `refused (${sanity.error})`}; ${cases.length} cases not run`,
    );
    return after?.();
  }
  const accounts = (ix.accounts ?? []).map((a) => a.address);
  let passed = 0;
  for (const c of cases) {
    const label = `${name} ${c.cat} ${c.name}${c.src ? ` (${c.src})` : ""}${c.with !== undefined ? ` (with ${c.with})` : ""}`;
    const mutated: Instruction = await mutate(env.sw.w, ix, c);
    await env.sw.flush();
    const before = await Promise.all(accounts.map((a) => balance(env.rpc, a)));
    const sent = await send(env.rpc, env.payer, [mutated]);
    const afterBalances = await Promise.all(accounts.map((a) => balance(env.rpc, a)));
    counts.cases++;
    const moved = before.some((b, k) => b !== afterBalances[k]);
    if (sent.ok || sent.error !== c.expect || moved) {
      counts.failed++;
      failures.push(
        `${label}: expected ${c.expect}, got ${sent.ok ? "success" : sent.error}${moved ? ", moved lamports" : ""}`,
      );
    } else passed++;
  }
  counts.passed += passed;
  console.log(`  ${name}: ${passed}/${cases.length} cases refused with their own error`);
  await after?.();
}

/** One paid opening sent for real, charged what the SDK computes from the same SOL/USD account and clock. */
async function paidOpening(env: Env) {
  const [, build] = CONFIG_BASELINES.find(([name]) => name === "UserOpenCampaign")!;
  const { ix } = await build(env);
  const config = decodeGlobalConfig((await account(env.rpc, await configAddress()))!);
  const solUsd = (await account(env.rpc, SOL_USD_ACCOUNT))!;
  const clk = await clock(env.rpc);
  const expected = chargeOpening({
    params: config.params,
    isTeam: false,
    openingUsd: 500n,
    maxLamports: 10n ** 10n,
    solUsd,
    clock: clk,
  });
  const sent = await send(env.rpc, env.payer, [ix]);
  const stored = sent.ok ? decodeCampaign((await account(env.rpc, ix.accounts![2].address))!) : null;
  const ok = stored?.openingPaidLamports === expected.paid && stored?.prizeLamports === expected.prize;
  console.log(
    `  paid opening: ${sent.ok ? `charged ${stored?.openingPaidLamports} lamports` : sent.error}; SDK ${expected.paid} -> ${ok ? "equal" : "DIFFERENT"}`,
  );
  if (!ok) failures.push(`paid opening: program ${stored?.openingPaidLamports ?? sent.error}, SDK ${expected.paid}`);
}

/** The rule refusals: each case named after the error it must return, from fresh prices. */
async function runRules(env: Env, label: string, rules: RuleCase[]) {
  let passed = 0;
  for (const rule of rules) {
    await refreshPrices(env.rpc);
    const sent = await rule.run(env).catch((error: Error) => ({ ok: false, error: `threw: ${error.message}` }));
    if (!sent.ok && sent.error === rule.name) passed++;
    else failures.push(`${label} ${rule.name}: got ${sent.ok ? "success" : sent.error}`);
  }
  counts.rules += rules.length;
  counts.rulesPassed += passed;
  console.log(`  ${label}: ${passed}/${rules.length} refusals with their own error`);
}

async function main() {
  const world = await startLocalWorld(undefined, 100);
  try {
    const rpc = world.rpc;
    const env: Env = {
      rpc,
      sw: await shimWorld(rpc),
      payer: await funded(rpc, 1_000n),
      upgradeAuthority: world.upgradeAuthority,
      admin: await funded(rpc),
      feeRecipient: await funded(rpc, 1n),
      team: [await funded(rpc), await funded(rpc)],
    };
    const baselines = [...CONFIG_BASELINES, ...SETTLE_BASELINES, ...BASELINES_14, ...SEALED_BASELINES];
    console.log(`slot matrix: ${SLOT_MATRIX.length} cases over ${baselines.length} instructions`);
    for (const [name, build] of baselines) await runCases(env, name, build);
    await paidOpening(env);
    console.log("rule refusals:");
    await runRules(env, "user_open_campaign", OPEN_RULES);
    await runRules(env, "user_join_campaign", JOIN_RULES);
    await runRules(env, "valve, entry and stake pool (last: moves the clock)", EXTRA_RULES);
    console.log(
      `\ncases run ${counts.cases}, refused as expected ${counts.passed}, failed ${counts.failed}, not run ${counts.skipped}`,
    );
    console.log(`rule refusals run ${counts.rules}, with their own error ${counts.rulesPassed}`);
    if (failures.length) console.log(`failures:\n  ${failures.join("\n  ")}`);
    if (failures.length) process.exitCode = 1;
  } finally {
    world.surfnet.stop();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
