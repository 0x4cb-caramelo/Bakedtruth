/**
 * Purpose: the Hermes VM the React Native check runs JavaScript on: Hermes v0.13.0's Linux CLI, the
 *          newest Hermes release that publishes a runnable VM, downloaded once, checked by SHA-256
 *          before it is extracted and again after, and refused at any other version.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 *
 * React Native 0.87.1 ships Hermes 1.0.0 (bytecode 98) through the `hermes-compiler` npm package,
 * which holds the compiler only (`hermesc` refuses `-exec`). Its source is tag
 * `hermes-v250829098.0.17` of facebook/hermes; no release publishes a VM built from it. So the
 * check compiles every bundle with that hermesc, and runs the JavaScript on this older VM, which
 * reports "Hermes release version: 0.12.0" (bytecode 96) and cannot load bytecode 98. A VM built
 * from the shipping tag can be passed as `HERMES_EXACT_VM` to run the compiled bytecode itself
 * (knowledge-base/tecnologia/sdk-react-native.md). Both hashes were computed on 2026-10-09 from
 * the release asset; the release publishes no checksum of its own.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const HERMES_VM = {
  release: "v0.13.0",
  url: "https://github.com/facebook/hermes/releases/download/v0.13.0/hermes-cli-linux.tar.gz",
  archiveSha256: "aead6eb0b8f563bb022354352eae32dad96c933330b6c1941b6db17674ca68ae",
  binarySha256: "ae13b09993b46ae44d85880cc2adebf76290adb52ee0f7fad9f0dde270a2eb08",
  /** What the binary itself reports: the v0.13.0 release did not bump its version string. */
  reports: "Hermes release version: 0.12.0",
  bytecode: 96,
};

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function expectHash(path, expected, what) {
  const actual = sha256(readFileSync(path));
  if (actual !== expected) throw new Error(`${what}: SHA-256 ${actual}, expected ${expected}`);
}

/** `-version` of a Hermes binary: its release line and its bytecode version. */
export function hermesVersion(binary) {
  const text = execFileSync(binary, ["-version"], { encoding: "utf8" });
  const release = /Hermes release version: (\S+)/.exec(text)?.[1] ?? "unknown";
  const bytecode = Number(/HBC bytecode version: (\d+)/.exec(text)?.[1] ?? NaN);
  return { release, bytecode };
}

/**
 * The pinned VM, under `<cacheDir>/<release>/hermes`: reused when its hash still matches, otherwise
 * downloaded, the archive's hash checked before `tar` sees it, and only the `hermes` binary taken.
 */
export async function pinnedHermesVm(cacheDir) {
  const dir = join(cacheDir, HERMES_VM.release);
  const binary = join(dir, "hermes");
  if (existsSync(binary) && sha256(readFileSync(binary)) === HERMES_VM.binarySha256) return binary;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const archive = join(dir, "hermes-cli-linux.tar.gz");
  const response = await fetch(HERMES_VM.url, { redirect: "follow" });
  if (!response.ok) throw new Error(`download ${HERMES_VM.url}: HTTP ${response.status}`);
  writeFileSync(`${archive}.part`, new Uint8Array(await response.arrayBuffer()));
  renameSync(`${archive}.part`, archive);
  expectHash(archive, HERMES_VM.archiveSha256, "Hermes CLI archive");
  execFileSync("tar", ["-xzf", archive, "-C", dir, "./hermes"]);
  expectHash(binary, HERMES_VM.binarySha256, "Hermes VM binary");
  chmodSync(binary, 0o755);
  const { release, bytecode } = hermesVersion(binary);
  if (`Hermes release version: ${release}` !== HERMES_VM.reports || bytecode !== HERMES_VM.bytecode) {
    throw new Error(`the pinned VM reports ${release} (bytecode ${bytecode})`);
  }
  rmSync(archive);
  return binary;
}
