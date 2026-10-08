#!/usr/bin/env node
/**
 * Purpose: the X0.9 evidence for the checks module: removes each check of
 *          programs/brot-markets/src/checks.rs in turn, rebuilds the program with cargo build-sbf,
 *          and shows that the check's own negative tests (Mollusk and LiteSVM) fail without it.
 *          checks.rs is restored byte for byte after each mutant, on error and on Ctrl-C.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane A. Run by hand, never by CI: it builds the program.
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECKS = join(ROOT, "programs/brot-markets/src/checks.rs");
const DEPLOY = join(ROOT, "target/deploy");
const SO = join(DEPLOY, "brot_markets.so");
const SAVED = join(ROOT, "target/checks-mutation/brot_markets.so");
const RUST_TARGETS = ["checks_mollusk", "checks_mollusk_init"];
const TS_FILES = ["tests/brot/checks.test.ts", "tests/brot/checks-init.test.ts"];
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
`;

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const jobs = option("--jobs") ?? "2";
const only = option("--only")?.split(",");
const log = (line) => process.stderr.write(`${line}\n`);
const original = readFileSync(CHECKS);

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

/** checks.rs with the early return after the marker of `id`; throws unless the marker is there once. */
function mutate(id) {
  const lines = original.toString("utf8").split("\n");
  const at = lines.flatMap((line, i) => (line.trim() === `// X0.9 ${id}` ? [i] : []));
  if (at.length !== 1) throw new Error(`marker "// X0.9 ${id}" is in checks.rs ${at.length} times`);
  const indent = lines[at[0]].match(/^\s*/)[0];
  lines.splice(at[0] + 1, 0, `${indent}if true { ${statement(id)}; } // X0.9 mutant`);
  return lines.join("\n");
}
const mutants = new Map(ids.map((id) => [id, mutate(id)]));

let savedSo = false; // the unmutated binary, saved by this run, goes back to target/deploy at the end
function restore() {
  if (!readFileSync(CHECKS).equals(original)) writeFileSync(CHECKS, original);
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
    const lines = run("bun", ["test", ...TS_FILES, "-t", ts.map(escape).join("|")]).out.split("\n");
    for (const name of ts) {
      const line = new RegExp(`^\\((pass|fail)\\) .*> ${escape(name)}( \\[|$)`);
      const at = lines.findIndex((l) => line.test(l.trim()));
      const result = at < 0 ? "not run" : lines[at].trim().startsWith("(pass)") ? "pass" : "fail";
      const error = result === "fail" ? lines.slice(0, at).findLast((l) => l.startsWith("error:")) : undefined;
      outcome[name] = { result, got: error?.match(/got (.*)/)?.[1] ?? error?.slice(7) };
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
  writeFileSync(CHECKS, mutants.get(id));
  const mine = selected.filter((t) => t.id === id);
  const outcome = build().status === 0 ? runTests(mine) : {};
  writeFileSync(CHECKS, original);
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
