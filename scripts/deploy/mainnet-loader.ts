/**
 * Purpose: the loader-v3 steps of the mainnet deploy, as Solana CLI commands with every key and the RPC named, and
 *          the reads that check each one landed as planned: the buffer written by the session payer, its authority
 *          moved to the hardware wallet and its bytes checked under that authority, the program deployed from the
 *          buffer (the upgrade authority signs once, on the device), the program's bytes and authority read back,
 *          then the upgrade authority handed to the multisig vault. Never loader v4, never `--final`.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * Why a buffer: `solana program deploy <file>` makes the upgrade authority sign every buffer write (about 170 for
 * this binary), which no hardware wallet should be asked to approve. The CLI's output is printed with the RPC URL
 * replaced by its origin, so a provider's key never reaches a log.
 */
import { spawnSync } from "node:child_process";

import { getAddressDecoder, type Address } from "@solana/kit";

import { BPF_LOADER_UPGRADEABLE_ID } from "@brot/sdk/read";

import { account, type Rpc } from "../validator/rpc";
import { assertLoaderV3Deploy, DEPLOY_CU_PRICE, DEPLOY_SIGN_ATTEMPTS } from "./checks";
import { originOf } from "./mainnet-cluster";

export type LoaderStep = { label: string; argv: string[] };
type Common = { payer: string; url: string };

const sending = (url: string) => ["--url", url, "--commitment", "confirmed"];
const retried = [
  "--use-rpc",
  "--max-sign-attempts",
  DEPLOY_SIGN_ATTEMPTS,
  "--with-compute-unit-price",
  DEPLOY_CU_PRICE,
];

/** The session payer writes the binary into a new buffer it holds the authority of. */
export const writeBufferStep = (a: Common & { so: string; bufferKeypair: string }): LoaderStep => ({
  label: "write the binary into a buffer (session payer)",
  argv: ["solana", "program", "write-buffer", a.so, "--buffer", a.bufferKeypair, "--buffer-authority", a.payer].concat(
    ["--keypair", a.payer, "--fee-payer", a.payer],
    sending(a.url),
    retried,
  ),
});

/** The buffer's authority moves to the upgrade authority: from here only the device can deploy or change it. */
export const setBufferAuthorityStep = (a: Common & { buffer: Address; newAuthority: Address }): LoaderStep => ({
  label: "hand the buffer to the upgrade authority",
  argv: ["solana", "program", "set-buffer-authority", a.buffer, "--buffer-authority", a.payer].concat(
    ["--new-buffer-authority", a.newAuthority, "--keypair", a.payer],
    sending(a.url),
  ),
});

/** The first deploy, from the buffer: the program keypair and the upgrade authority sign one transaction. */
export function deployFromBufferStep(
  a: Common & { buffer: Address; programKeypair: string; upgradeAuthority: string },
): LoaderStep {
  const argv = ["solana", "program", "deploy", "--buffer", a.buffer, "--program-id", a.programKeypair]
    .concat(["--upgrade-authority", a.upgradeAuthority, "--fee-payer", a.payer, "--keypair", a.payer])
    .concat(sending(a.url), retried);
  assertLoaderV3Deploy(argv);
  return { label: "deploy from the buffer (loader v3; the device signs)", argv };
}

/** The upgrade authority moves to the multisig's vault, a PDA that cannot co-sign (hence the skip flag). */
export function setUpgradeAuthorityStep(
  a: Common & { program: Address; upgradeAuthority: string; newAuthority: Address },
): LoaderStep {
  const argv = ["solana", "program", "set-upgrade-authority", a.program, "--new-upgrade-authority", a.newAuthority]
    .concat(["--skip-new-upgrade-authority-signer-check", "--upgrade-authority", a.upgradeAuthority])
    .concat(["--keypair", a.payer], sending(a.url));
  if (argv.includes("--final")) throw new Error("refusing --final: the program must stay upgradeable by the multisig");
  return { label: "hand the upgrade authority to the multisig vault (the device signs)", argv };
}

/** Runs a step; its output is printed with the RPC URL cut to its origin. Throws on a non-zero exit. */
export function runStep(step: LoaderStep, url: string): string {
  console.log(`  $ ${step.argv.map((arg) => (arg === url ? originOf(url) : arg)).join(" ")}`);
  const ran = spawnSync(step.argv[0], step.argv.slice(1), { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const output = `${ran.stdout ?? ""}${ran.stderr ?? ""}`.split(url).join(originOf(url)).trim();
  if (output) console.log(output.replace(/^/gm, "    "));
  if (ran.status !== 0)
    throw new Error(`${step.label}: exited ${ran.status} (see deploy/mainnet/README.md, "Abort points")`);
  return output;
}

const sha256 = (bytes: Uint8Array) => new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
const optionKey = (data: Uint8Array, at: number) =>
  data[at] === 1 ? getAddressDecoder().decode(data.subarray(at + 1, at + 33)) : null;

/** A loader-v3 buffer (tag 1): its authority and the bytes after its 37-byte header. */
export async function readBuffer(rpc: Rpc, buffer: Address) {
  const found = await account(rpc, buffer);
  if (!found || found.owner !== BPF_LOADER_UPGRADEABLE_ID) throw new Error(`${buffer} is not a loader-v3 buffer`);
  if (new DataView(found.data.buffer, found.data.byteOffset).getUint32(0, true) !== 1) {
    throw new Error(`${buffer} is not in the Buffer state`);
  }
  return { authority: optionKey(found.data, 4), bytes: found.data.subarray(37) };
}

/** A loader-v3 program (tag 2) and its ProgramData (tag 3): the authority, the deploy slot, the bytes. */
export async function readProgram(rpc: Rpc, program: Address) {
  const found = await account(rpc, program);
  if (!found?.executable || found.owner !== BPF_LOADER_UPGRADEABLE_ID) throw new Error(`${program}: not loader v3`);
  const programData = getAddressDecoder().decode(found.data.subarray(4, 36));
  const data = (await account(rpc, programData))?.data;
  if (!data || new DataView(data.buffer, data.byteOffset).getUint32(0, true) !== 3) {
    throw new Error(`${programData} is not ${program}'s ProgramData`);
  }
  const slot = new DataView(data.buffer, data.byteOffset).getBigUint64(4, true);
  return { programData, slot, authority: optionKey(data, 12), bytes: data.subarray(45) };
}

export type Expected = { authority: Address; sha256: string; length: number };

/** The bytes under `who` hash to the binary's SHA-256 and the rest is zeros; the authority is the expected one. */
function same(who: string, got: { authority: Address | null; bytes: Uint8Array }, want: Expected) {
  if (got.authority !== want.authority) throw new Error(`${who}: authority ${got.authority}, not ${want.authority}`);
  const head = got.bytes.subarray(0, want.length);
  if (sha256(head) !== want.sha256) throw new Error(`${who}: bytes hash ${sha256(head)}, not ${want.sha256}`);
  if (got.bytes.subarray(want.length).some((b) => b !== 0)) throw new Error(`${who}: bytes past the binary`);
  console.log(`  ${who}: authority ${want.authority}, bytes = the binary (sha256 ${want.sha256})`);
}

export const checkBuffer = async (rpc: Rpc, buffer: Address, want: Expected) =>
  same(`buffer ${buffer}`, await readBuffer(rpc, buffer), want);

export const checkProgram = async (rpc: Rpc, program: Address, want: Expected) =>
  same(`program ${program} (loader v3)`, await readProgram(rpc, program), want);
