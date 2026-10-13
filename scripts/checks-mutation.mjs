#!/usr/bin/env node
/**
 * Purpose: the X0.9 evidence for the checks module: removes each check of
 *          programs/brot-markets/src/checks.rs and its submodules (checks/top_level.rs) in turn,
 *          rebuilds the program with cargo build-sbf, and shows that the check's own negative tests
 *          (Mollusk and LiteSVM) fail without it. Each source is restored byte for byte after each
 *          mutant, on error and on Ctrl-C.
 * Version: 0.0.2
 * Sprint:  02 (pot core on Pinocchio), lane A; `top_level` in 03, lane D. Run by hand, never by CI.
 *
 * Usage:  node scripts/checks-mutation.mjs [--plan] [--only id,id] [--jobs N]
 *   --plan  checks the `// X0.9 <id>` markers and prints the plan; builds and runs nothing.
 * Output: a Markdown table on stdout (check | mutation | test | result); progress on stderr.
 * Exit:   0 when every "fail" test failed and every "keeps" test passed; 1 otherwise; 2 when a
 *         test is not green on the unmutated build, which would make the evidence meaningless.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { junitCases, unxml } from "./bun-junit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// checks.rs and its submodules: each `// X0.9 <id>` marker is in exactly one of them.
const SOURCES = ["checks.rs", "checks/top_level.rs", "checks/upgrade.rs", "instructions/referral/rules.rs", "instructions/resolution/contest_rules.rs", "instructions/resolution/contest_decision.rs"].map((file) => join(ROOT, "programs/brot-markets/src", file));
const DEPLOY = join(ROOT, "target/deploy");
const SO = join(DEPLOY, "brot_markets.so");
const SAVED = join(ROOT, "target/checks-mutation/brot_markets.so");
const JUNIT = join(ROOT, "target/checks-mutation/junit.xml");
const RUST_TARGETS = ["checks_mollusk", "checks_mollusk_init", "referral_link", "referral_refusals", "contest_mollusk_open", "contest_mollusk_reread", "contest_mollusk_decide", "contest_mollusk_bounds"];
const TS_FILES = [
  "tests/brot/checks.test.ts",
  "tests/brot/checks-init.test.ts",
  "tests/brot/resolve-refuses.test.ts",
  "tests/brot/referral-link.test.ts",
  "tests/brot/referral-refuses.test.ts",
  "tests/brot/contest-open.test.ts",
  "tests/brot/contest-reread.test.ts",
  "tests/brot/contest-decide.test.ts",
  "tests/brot/contest-worst-case.test.ts",
  "tests/brot/contest-proof.test.ts",
];
const PATH = `${process.env.HOME}/.bun/bin:${process.env.PATH}`;
// Mollusk and LiteSVM both run the binary this script builds; logs off and no colours to parse.
const ENV = { ...process.env, PATH, BROT_MARKETS_SO: SO, RUST_LOG: "off", NO_COLOR: "1" };

// Each mutant puts `if true { return Ok(()); }` (canonical_pda: the found bump) right after its
// `// X0.9 <id>` line. One line per pair of twin tests: <id> <fail|keeps> <Mollusk test> | <LiteSVM
// test> ("-": none). A "keeps" test must still pass: another check refuses that input the same way.
const PLAN = `
owned_by              fail  owned_by_refuses_the_config_under_another_owner | owned_by: the config under another owner
signer                fail  signer_refuses_an_unsigned_admin | signer: an unsigned admin
writable              fail  writable_refuses_a_read_only_config | writable: a read-only config
len                   fail  len_refuses_the_data_less_fee_vault_as_the_config | len: the data-less fee vault as the config
len                   keeps len_refuses_a_short_and_a_long_config | len: a short and a long config
tag                   fail  tag_refuses_another_account_types_tag | tag: the tag of another account type
tag                   fail  tag_refuses_a_zeroed_config | tag: a zeroed config
tag                   fail  tag_version_refuses_another_layout_version | tag_version: another layout version
tag_version           fail  tag_version_refuses_another_layout_version | tag_version: another layout version
tag_version           keeps tag_refuses_a_zeroed_config | tag: a zeroed config
pda                   fail  pda_refuses_a_look_alike_config | pda: a look-alike config
pda                   fail  - | pda: a look-alike campaign at join
canonical_pda         fail  canonical_pda_refuses_a_non_canonical_config_or_fee_vault | canonical_pda: a non-canonical config or fee vault
system_program        fail  system_program_refuses_a_look_alike | system_program: a look-alike System Program
upgrade_authority     fail  upgrade_authority_refuses_any_other_signer | upgrade_authority: any other signer
upgrade_authority     fail  upgrade_authority_refuses_program_data_that_is_not_this_programs | upgrade_authority: the ProgramData of another program or owner
upgrade_authority     fail  upgrade_authority_refuses_an_immutable_program | upgrade_authority: an immutable program
upgrade_authority_key fail  upgrade_authority_refuses_any_other_signer | upgrade_authority: any other signer
upgrade_authority_key keeps upgrade_authority_refuses_an_immutable_program | upgrade_authority: an immutable program
create_pda_account    fail  create_refuses_a_second_initialization | create: a second initialization
create_pda_account    fail  create_refuses_an_address_another_program_owns | create: an address another program owns
create_pda_account    fail  create_tops_up_a_config_and_a_fee_vault_funded_in_advance | create: a config and a fee vault funded in advance
distinct              fail  distinct_refuses_the_config_as_the_fee_vault | distinct: the config as the fee vault
event_accounts        fail  event_accounts_refuse_a_wrong_event_authority | event_accounts: a wrong event authority
event_accounts        fail  event_program_refuses_a_wrong_program_slot | event_program: a wrong program slot
event_program         fail  event_program_refuses_a_wrong_program_slot | event_program: a wrong program slot
event_program         keeps event_accounts_refuse_a_wrong_event_authority | event_accounts: a wrong event authority
top_level             fail  - | top_level: a resolve forwarded by another program
referrer_not_zero     fail  link_refuses_the_zero_referrer | link: the zero address as the referrer
referrer_not_referee  fail  link_refuses_the_referee_as_its_own_referrer | link: the referee as its own referrer
referrer_not_referee  keeps link_refuses_the_zero_referrer | link: the zero address as the referrer
signer                fail  link_refuses_an_unsigned_referee | link: an unsigned referee
signer                fail  link_refuses_an_unsigned_referee_whose_link_was_funded_in_advance | link: an unsigned referee whose link was funded in advance
writable              fail  link_refuses_a_read_only_referee | link: a read-only referee
writable              fail  link_refuses_a_read_only_link | link: a read-only link
canonical_pda         fail  link_refuses_a_look_alike_a_non_canonical_or_another_referees_link | link: a look-alike, a non-canonical or another referee's link
system_program        fail  link_refuses_a_look_alike_system_program | link: a look-alike System Program
create_pda_account    fail  link_records_the_referrer_once_with_the_referees_rent | link: the referee's link records the referrer, the time and the slot, with the referee's rent
create_pda_account    fail  link_tops_up_a_link_funded_in_advance | link: an address funded in advance is topped up and linked
create_pda_account    fail  link_refuses_another_programs_account_or_a_system_account_with_data_at_the_link | link: another program's account, or a System account with data, at the link
create_pda_account    fail  link_refuses_a_second_link_to_any_referrer | link: a second link, to any referrer
event_accounts        fail  link_refuses_wrong_event_accounts | link: a wrong event authority
event_accounts        fail  - | link: a wrong program slot
event_program         fail  link_refuses_wrong_event_accounts | link: a wrong program slot
event_program         keeps - | link: a wrong event authority
contest_team_key      fail  contest_team_key_refuses_a_stranger_and_the_admin | contest opens: each refusal has its own error and writes nothing
contest_window        fail  contest_window_refuses_a_campaign_not_in_review | contest opens: each refusal has its own error and writes nothing
contest_window        fail  contest_window_refuses_at_the_instant_the_window_closes | -
contest_tallied       fail  contest_tallied_refuses_while_an_entry_is_untallied | contest opens: each refusal has its own error and writes nothing
reread_metric         fail  contest_reread_metric_refuses_another_account | contest reread: each refusal has its own error and writes nothing
contest_status        fail  contest_status_refuses_a_campaign_not_contested | contest reread: each refusal has its own error and writes nothing
contest_status        fail  contest_status_refuses_a_decision_on_a_campaign_not_contested | contest decide: each refusal has its own error and writes nothing
contest_stage         fail  contest_stage_refuses_a_reread_at_stage_two | contest reread: each refusal has its own error and writes nothing
contest_stage         fail  contest_stage_refuses_a_decision_at_stage_one | contest decide: each refusal has its own error and writes nothing
decide_deadline       fail  decide_deadline_refuses_from_the_deadline_on | contest decide: each refusal has its own error and writes nothing
lapse_stage           fail  lapse_stage_refuses_a_contest_with_no_stage | -
reread_proof          fail  reread_proof_offered_and_refused_by_the_reader_refuses_the_reread | contest proof: an offered proof the reader refuses refuses the re-read with the reader's error
lapse_deadline        fail  lapse_deadline_refuses_one_second_before | contest worst case is 55 hours with the keeper down for a week: the unread stage 1 lapses
lapse_deadline        fail  lapse_of_an_unread_stage_one_comes_48_hours_after_its_deadline | contest lapse: finalize takes stage 2 from its deadline on, and an unread stage 1 48 hours after its own
decide_admin          fail  decide_admin_refuses_a_team_key_and_a_stranger | contest decide: a stranger and a team key cannot decide
decide_confirm_reason fail  decide_arguments_are_refused_each_with_its_own_error | contest decide: each refusal has its own error and writes nothing
decide_void_reason    fail  decide_arguments_are_refused_each_with_its_own_error | contest decide: each refusal has its own error and writes nothing
top_level             fail  - | top_level: a re-read forwarded by another program
`;

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const jobs = option("--jobs") ?? "2";
const only = option("--only")?.split(",");
const log = (line) => process.stderr.write(`${line}\n`);
const originals = new Map(SOURCES.map((file) => [file, readFileSync(file)]));

const tests = PLAN.trim()
  .split("\n")
  .flatMap((line) => {
    const [, id, keeps, rust, ts] = line.match(/^(\S+)\s+(fail|keeps)\s+(\S+) \| (.+)$/);
    const must = keeps === "keeps" ? "pass" : "fail";
    const twins = [
      { id, must, kind: "Mollusk", name: rust },
      { id, must, kind: "LiteSVM", name: ts },
    ];
    return twins.filter((t) => t.name !== "-");
  });
const ids = [...new Set(tests.map((t) => t.id))].filter((id) => !only || only.includes(id));
const statement = (id) => (id === "canonical_pda" ? "return Ok(bump)" : "return Ok(())");

/** The source holding `id`'s marker, with the early return after it; throws unless it is there once. */
function mutate(id) {
  const marked = (file, lines) =>
    lines.flatMap((line, i) => (line.trim() === `// X0.9 ${id}` ? [{ file, lines, i }] : []));
  const found = SOURCES.flatMap((file) => marked(file, originals.get(file).toString("utf8").split("\n")));
  if (found.length !== 1) throw new Error(`marker "// X0.9 ${id}" is in the checks ${found.length} times`);
  const { file, lines, i } = found[0];
  lines.splice(i + 1, 0, `${lines[i].match(/^\s*/)[0]}if true { ${statement(id)}; } // X0.9 mutant`);
  return { file, text: lines.join("\n") };
}
const mutants = new Map(ids.map((id) => [id, mutate(id)]));

let savedSo = false; // the unmutated binary, saved by this run, goes back to target/deploy at the end
function restore() {
  for (const [file, bytes] of originals) if (!readFileSync(file).equals(bytes)) writeFileSync(file, bytes);
  if (savedSo && existsSync(SAVED)) copyFileSync(SAVED, SO);
}
process.on("exit", restore);
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => process.exit(130));

function run(command, argv) {
  const result = spawnSync(command, argv, { cwd: ROOT, env: ENV, encoding: "utf8", maxBuffer: 1 << 28 });
  if (result.signal) process.exit(130);
  if (result.error) throw result.error;
  return { status: result.status, out: `${result.stdout}\n${result.stderr}`.replace(/\x1b\[[0-9;]*m/g, "") };
}
const manifest = ["--manifest-path", "programs/brot-markets/Cargo.toml"];
const build = () => run("cargo", ["build-sbf", ...manifest, "--sbf-out-dir", DEPLOY, "--jobs", jobs]);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Runs `list` and returns, by test name, { result: pass | fail | not run, got }. */
function runTests(list) {
  const outcome = {};
  const rust = list.filter((t) => t.kind === "Mollusk").map((t) => t.name);
  if (rust.length) {
    const targets = RUST_TARGETS.flatMap((target) => ["--test", target]);
    const cargo = ["test", "-j", jobs, "-p", "brot-markets", "--features", "no-entrypoint", ...targets];
    const { out } = run("cargo", [...cargo, "--no-fail-fast", "--", "--exact", ...rust]);
    for (const name of rust) {
      const section = out.split(`---- ${name} stdout ----`)[1];
      const failed = section !== undefined || new RegExp(`^test ${name} \\.\\.\\. FAILED`, "m").test(out);
      const passed = new RegExp(`^test ${name} \\.\\.\\. ok$`, "m").test(out);
      const got = section?.match(/got (.*)/)?.[1];
      outcome[name] = { result: failed ? "fail" : passed ? "pass" : "not run", got };
    }
  }
  const ts = list.filter((t) => t.kind === "LiteSVM").map((t) => t.name);
  if (ts.length) {
    // Bun names each test only on a terminal; the JUnit file lists every test wherever it runs.
    mkdirSync(dirname(JUNIT), { recursive: true });
    writeFileSync(JUNIT, "");
    const filter = ts.map(escape).join("|");
    run("bun", ["test", ...TS_FILES, "-t", filter, "--reporter=junit", `--reporter-outfile=${JUNIT}`]);
    const cases = junitCases(readFileSync(JUNIT, "utf8"));
    for (const name of ts) {
      const body = cases.get(name);
      const result =
        body === undefined || body.includes("<skipped") ? "not run" : body.includes("<failure") ? "fail" : "pass";
      const message = body?.match(/<failure[^>]*message="([^"]*)"/)?.[1];
      outcome[name] = { result, got: message && unxml(message).match(/got (.*)/)?.[1] };
    }
  }
  return outcome;
}

const mutation = (id) => `\`if true { ${statement(id)}; }\``;
const selected = tests.filter((t) => ids.includes(t.id));
if (args.includes("--plan")) {
  console.log("| check | mutation | test | must |\n|---|---|---|---|");
  for (const t of selected) console.log(`| ${t.id} | ${mutation(t.id)} | ${t.kind} \`${t.name}\` | ${t.must} |`);
  process.exit(0);
}

log("baseline: building the unmutated program");
const clean = build();
if (clean.status !== 0) throw new Error(`the unmutated program does not build:\n${clean.out.slice(-3000)}`);
mkdirSync(dirname(SAVED), { recursive: true });
copyFileSync(SO, SAVED);
savedSo = true;
const unique = [...new Map(selected.map((t) => [t.name, t])).values()];
const baseline = runTests(unique);
const red = unique.filter((t) => baseline[t.name].result !== "pass");
for (const t of red)
  log(`not green unmutated: ${t.kind} ${t.name}: ${baseline[t.name].result} ${baseline[t.name].got ?? ""}`);
if (red.length) process.exit(2);

const rows = [];
let proven = true;
for (const id of ids) {
  log(`mutant ${id}: building and running its tests`);
  const { file, text } = mutants.get(id);
  writeFileSync(file, text);
  const mine = selected.filter((t) => t.id === id);
  const outcome = build().status === 0 ? runTests(mine) : {};
  writeFileSync(file, originals.get(file));
  for (const t of mine) {
    const { result, got } = outcome[t.name] ?? { result: "build failed" };
    proven &&= result === t.must;
    const said = result === "fail" ? `fails${got ? `, got ${got}` : ""}` : result === "pass" ? "passes" : result;
    const verdict = result !== t.must ? "NOT AS EXPECTED" : t.must === "fail" ? "as it must" : "kept by another check";
    const text = `${said} (${verdict})`.replace(/\|/g, "\\|").slice(0, 160);
    rows.push(`| ${id} | ${mutation(id)} | ${t.kind} \`${t.name}\` | ${text} |`);
  }
}
restore();
console.log(`| check | mutation | test | result |\n|---|---|---|---|\n${rows.join("\n")}`);
process.exit(proven ? 0 : 1);
