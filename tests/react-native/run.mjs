/**
 * Purpose: the React Native check, end to end (Sprint 05, proposal section 3.2): bundles `@brot/sdk/read`,
 *          `@brot/sdk/tx` and the math-vector replay with Metro for Android, compiles each with the
 *          hermesc React Native 0.87.1 ships, runs them on a Hermes VM, and exits non-zero on any
 *          bundling or compile error, any module that fails to load, or any vector that differs.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 *
 * `npm ci --ignore-scripts` here and a root `bun install` first (the SDK and `@solana/kit` resolve from the root).
 * The JavaScript runs on the pinned Hermes v0.13.0 VM (hermes.mjs). `HERMES_EXACT_VM=<path>` adds a
 * run of the compiled bytecode itself on a VM of the shipping version, built from tag
 * `hermes-v250829098.0.17` (knowledge-base/tecnologia/sdk-react-native.md).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { bundleAndroid, compileHermes, describeSources, HERMESC, loadConfig } from "./bundle.mjs";
import { HERMES_VM, hermesVersion, pinnedHermesVm } from "./hermes.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const buildDir = join(here, "build");
const failures = [];
const fail = (message) => {
  failures.push(message);
  console.log(`FAIL ${message}`);
};
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KiB`;

/** The vector files, as text, into a JSON module Metro can bundle. */
function writeVectors() {
  const files = ["math-vectors.csv", "snapshot-vectors.csv"].filter((name) =>
    existsSync(join(repoRoot, "tests/vectors", name)),
  );
  const data = Object.fromEntries(
    files.map((name) => [name, readFileSync(join(repoRoot, "tests/vectors", name), "utf8")]),
  );
  mkdirSync(join(here, "generated"), { recursive: true });
  writeFileSync(join(here, "generated/vectors.json"), JSON.stringify(data));
  return files;
}

/** The address `configAddress()` must give: the PDA `["config"]` of the IDL's program id, in Node. */
async function expectedConfigAddress() {
  const { getProgramDerivedAddress } = await import("@solana/kit");
  const idl = JSON.parse(readFileSync(join(repoRoot, "packages/sdk/src/idl/brot_markets.json"), "utf8"));
  const [address] = await getProgramDerivedAddress({ programAddress: idl.metadata.address, seeds: ["config"] });
  return address;
}

/** Runs `args` on a Hermes VM; its output, or a failure when it exits non-zero. */
function runOnVm(vm, args, label) {
  const result = spawnSync(vm, args, { encoding: "utf8", timeout: 300_000 });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  for (const line of output.split("\n")) console.log(`  ${line}`);
  if (result.status !== 0) fail(`${label}: the VM exited with ${result.status ?? result.signal}`);
  return output;
}

function checkRead(output, expected, label) {
  const derived = /config PDA with a SHA-256 digest = (\S+)/.exec(output)?.[1];
  if (!/read: config PDA without crypto\.subtle refused/.test(output)) fail(`${label}: PDA derived with no crypto`);
  if (derived !== expected) fail(`${label}: config PDA ${derived ?? "missing"}, expected ${expected}`);
}

function checkTx(output, expected, label) {
  if (!/tx: random campaign id without crypto\.getRandomValues refused/.test(output))
    fail(`${label}: id drawn with no PRNG`);
  if (!/sweep_fees built with a SHA-256 digest: 5 slots, 1 data bytes/.test(output))
    fail(`${label}: sweep_fees not built`);
  const config = /sweep_fees config slot = (\S+)/.exec(output)?.[1];
  if (config !== expected) fail(`${label}: sweep_fees config slot ${config ?? "missing"}, expected ${expected}`);
}

function checkVectors(output, label) {
  const rows = Number(/vectors: (\d+) rows replayed/.exec(output)?.[1] ?? 0);
  const mismatches = /vectors: (\d+) mismatches/.exec(output)?.[1];
  if (rows < 10_000 || mismatches !== "0") fail(`${label}: ${rows} rows, ${mismatches ?? "?"} mismatches`);
}

const started = Date.now();
rmSync(buildDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });
const vectorFiles = writeVectors();
console.log(`vectors: ${vectorFiles.join(", ")}`);

const compiler = hermesVersion(HERMESC);
const config = await loadConfig(join(here, "metro.config.cjs"));
const entries = ["read", "tx", "vectors"];
for (const name of entries) {
  const js = join(buildDir, `${name}.android.js`);
  try {
    const bundle = await bundleAndroid(config, { entry: join(here, "entries", `${name}.js`), out: js, repoRoot });
    const sources = describeSources(bundle.sources);
    const builds = Object.entries(sources.builds)
      .map(([build, n]) => `${build} x${n}`)
      .join(", ");
    console.log(`metro ${name}: ${kb(bundle.bytes)}, ${sources.sdkFiles} SDK files, @solana builds: ${builds}`);
    if (Object.keys(sources.builds).some((build) => build !== "native.mjs")) fail(`${name}: a non-native Kit build`);
    const hbc = compileHermes(js, join(buildDir, `${name}.android.hbc`));
    console.log(`hermesc ${compiler.release} (bytecode ${compiler.bytecode}) ${name}: ${kb(hbc.bytes)}`);
  } catch (error) {
    fail(
      `${name}: ${String(error.message ?? error)
        .split("\n")
        .slice(0, 6)
        .join(" | ")}`,
    );
  }
}

const expected = await expectedConfigAddress();
const vm = await pinnedHermesVm(join(here, ".hermes"));
const vmLabel = `Hermes VM ${HERMES_VM.release} (reports ${hermesVersion(vm).release})`;
console.log(`${vmLabel}, JavaScript bundles:`);
if (existsSync(join(buildDir, "read.android.js")))
  checkRead(runOnVm(vm, [join(buildDir, "read.android.js")], "read"), expected, "read");
if (existsSync(join(buildDir, "tx.android.js")))
  checkTx(runOnVm(vm, [join(buildDir, "tx.android.js")], "tx"), expected, "tx");
if (existsSync(join(buildDir, "vectors.android.js")))
  checkVectors(runOnVm(vm, [join(buildDir, "vectors.android.js")], "vectors"), "vectors");

const exact = process.env.HERMES_EXACT_VM;
if (exact) {
  const version = hermesVersion(exact);
  console.log(`exact VM ${exact} (${version.release}, bytecode ${version.bytecode}), the compiled bytecode:`);
  if (version.bytecode !== compiler.bytecode)
    fail(`exact VM reads bytecode ${version.bytecode}, hermesc writes ${compiler.bytecode}`);
  else {
    checkRead(runOnVm(exact, ["-b", join(buildDir, "read.android.hbc")], "read (hbc)"), expected, "read (hbc)");
    checkTx(runOnVm(exact, ["-b", join(buildDir, "tx.android.hbc")], "tx (hbc)"), expected, "tx (hbc)");
    checkVectors(runOnVm(exact, ["-b", join(buildDir, "vectors.android.hbc")], "vectors (hbc)"), "vectors (hbc)");
  }
} else console.log("exact VM: not set (HERMES_EXACT_VM), the bytecode itself was compiled but not run");

const seconds = ((Date.now() - started) / 1000).toFixed(0);
console.log(
  failures.length === 0 ? `react-native check: ok in ${seconds} s` : `react-native check: ${failures.length} failures`,
);
process.exit(failures.length === 0 ? 0 : 1);
