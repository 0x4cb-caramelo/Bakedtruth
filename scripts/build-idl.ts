/**
 * Purpose: writes the brot-markets IDL with the pinned shank-cli into packages/sdk/src/idl, then
 *          renders the Codama spike client from it (T9). `bun run idl`; also the last program
 *          step of `bun run build:program`.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane F
 *
 * Shank reads the program's source and compiles nothing, so this needs no SBF toolchain: any
 * machine with shank-cli 0.4.9 regenerates the IDL that CI compares with the committed one. The
 * binary is looked up in $SHANK, then target/tools/bin/shank (the repository's ignored tool
 * folder), then PATH; any other version is refused, because the IDL is checked byte for byte.
 */
import { existsSync } from "node:fs";

import { describeRender, IDL_PATH, PACKAGE_FOLDER, renderCodamaClient } from "./codama-spike";

export const SHANK_VERSION = "0.4.9";
const CRATE_ROOT = "programs/brot-markets";
const LOCAL_SHANK = "target/tools/bin/shank";
const INSTALL = `cargo install --locked --version ${SHANK_VERSION} --root target/tools shank-cli`;

function shankBinary(): string {
  if (process.env.SHANK) return process.env.SHANK;
  return existsSync(LOCAL_SHANK) ? LOCAL_SHANK : "shank";
}

/** Runs `command`, returning its stdout; throws with its stderr when it fails or is missing. */
function run(command: string[]): string {
  const result = Bun.spawnSync(command, { stdout: "pipe", stderr: "pipe" });
  if (!result.success) throw new Error(`${command.join(" ")} failed:\n${result.stderr.toString()}`);
  return result.stdout.toString();
}

function checkedShank(): string {
  const shank = shankBinary();
  let version: string;
  try {
    version = run([shank, "--version"]).trim();
  } catch {
    throw new Error(`shank-cli not found at "${shank}". Install it with:\n  ${INSTALL}`);
  }
  if (version !== `shank-cli ${SHANK_VERSION}`) {
    throw new Error(`expected shank-cli ${SHANK_VERSION}, found "${version}". Install it with:\n  ${INSTALL}`);
  }
  return shank;
}

if (import.meta.main) {
  const shank = checkedShank();
  run([shank, "idl", "--crate-root", CRATE_ROOT, "--out-dir", PACKAGE_FOLDER]);
  console.log(`shank-cli ${SHANK_VERSION}: ${CRATE_ROOT} -> ${IDL_PATH}`);
  console.log(describeRender(await renderCodamaClient()));
}
