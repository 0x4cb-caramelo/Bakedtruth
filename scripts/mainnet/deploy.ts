/**
 * Purpose: the deploy steps of the runbook (4 to 6) rehearsed on the mainnet fork with the `mainnet` binary and
 *          throwaway keys, through the same step builders and read-backs as scripts/deploy/mainnet-deploy.ts: the
 *          session payer writes a buffer, hands it to the upgrade authority (a key file standing for the hardware
 *          wallet Ronaldo holds on the day, M-4), the program is deployed from the buffer and read back, and the
 *          upgrade authority goes to the upgrade multisig's vault. Run twice: by the CLI at a throwaway id, and at the
 *          declared id.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * The declared id's keypair is not on this machine, so there the program account is created as the System Program's
 * `CreateAccount` would leave it (36 zero bytes owned by loader v3, rent-exempt), and the loader's own
 * `DeployWithMaxDataLen` deploys the buffer into it. Everything after that is the loader's doing, not a cheat.
 */
import { join } from "node:path";

import { AccountRole, type Address, type Instruction, type KeyPairSigner } from "@solana/kit";

import {
  BPF_LOADER_UPGRADEABLE_ID,
  COMPUTE_BUDGET_PROGRAM_ID,
  PROGRAM_ID,
  programDataAddress,
  SYSTEM_PROGRAM_ID,
} from "@brot/sdk/read";

import * as L from "../deploy/mainnet-loader";
import { expectOk, rentFor, send, type Rpc } from "../validator/rpc";
import { writeThrowawayKeypair } from "../validator/keys";
import { setAccount } from "./fork";

export type Binary = { path: string; sha256: string; length: number };
export type DeployKeys = {
  dir: string;
  payer: { path: string; signer: KeyPairSigner };
  hardware: { path: string; signer: KeyPairSigner };
};

const RENT_SYSVAR = "SysvarRent111111111111111111111111111111111" as Address;
const CLOCK_SYSVAR = "SysvarC1ock11111111111111111111111111111111" as Address;
const u64le = (n: number) => Array.from({ length: 8 }, (_, i) => Number((BigInt(n) >> BigInt(8 * i)) & 0xffn));

/** Writes a buffer of `binary` and hands it to the stand-in hardware wallet; checks its bytes under that authority. */
async function bufferFor(rpc: Rpc, k: DeployKeys, binary: Binary, name: string): Promise<Address> {
  const bufferKeypair = join(k.dir, `${name}-buffer.json`);
  const buffer = (await writeThrowawayKeypair(bufferKeypair)).address;
  const common = { payer: k.payer.path, url: rpc.url };
  L.runStep(L.writeBufferStep({ ...common, so: binary.path, bufferKeypair }), rpc.url);
  L.runStep(L.setBufferAuthorityStep({ ...common, buffer, newAuthority: k.hardware.signer.address }), rpc.url);
  await L.checkBuffer(rpc, buffer, { ...binary, authority: k.hardware.signer.address });
  return buffer;
}

/** The CLI's first deploy from a buffer at a throwaway id, then the upgrade authority handed to `vault`. */
export async function deployWithCli(rpc: Rpc, k: DeployKeys, binary: Binary, vault: Address): Promise<Address> {
  const programKeypair = join(k.dir, "throwaway-program.json");
  const program = (await writeThrowawayKeypair(programKeypair)).address;
  const buffer = await bufferFor(rpc, k, binary, "cli");
  const deploy = { payer: k.payer.path, url: rpc.url, buffer, programKeypair, upgradeAuthority: k.hardware.path };
  L.runStep(L.deployFromBufferStep(deploy), rpc.url);
  await L.checkProgram(rpc, program, { ...binary, authority: k.hardware.signer.address });
  await handOver(rpc, k, binary, program, vault);
  return program;
}

/** `set-upgrade-authority` to the vault by the stand-in hardware wallet, read back. */
async function handOver(rpc: Rpc, k: DeployKeys, binary: Binary, program: Address, vault: Address) {
  const step = { payer: k.payer.path, url: rpc.url, program, upgradeAuthority: k.hardware.path, newAuthority: vault };
  L.runStep(L.setUpgradeAuthorityStep(step), rpc.url);
  await L.checkProgram(rpc, program, { ...binary, authority: vault });
}

/** The loader's `DeployWithMaxDataLen` (tag 2), with the accounts in the loader interface's order. */
async function deployIx(
  payer: KeyPairSigner,
  authority: KeyPairSigner,
  buffer: Address,
  maxLen: number,
): Promise<Instruction> {
  const accounts = [
    { address: payer.address, role: AccountRole.WRITABLE_SIGNER, signer: payer },
    { address: await programDataAddress(), role: AccountRole.WRITABLE },
    { address: PROGRAM_ID, role: AccountRole.WRITABLE },
    { address: buffer, role: AccountRole.WRITABLE },
    { address: RENT_SYSVAR, role: AccountRole.READONLY },
    { address: CLOCK_SYSVAR, role: AccountRole.READONLY },
    { address: SYSTEM_PROGRAM_ID, role: AccountRole.READONLY },
    { address: authority.address, role: AccountRole.READONLY_SIGNER, signer: authority },
  ];
  return { programAddress: BPF_LOADER_UPGRADEABLE_ID, accounts, data: Uint8Array.from([2, 0, 0, 0, ...u64le(maxLen)]) };
}

/** At the declared id: the program account as `CreateAccount` leaves it, the loader's deploy, the handover. */
export async function deployAtDeclaredId(rpc: Rpc, k: DeployKeys, binary: Binary, vault: Address) {
  const buffer = await bufferFor(rpc, k, binary, "declared");
  await setAccount(rpc, PROGRAM_ID, {
    lamports: await rentFor(rpc, 36),
    data: new Uint8Array(36),
    owner: BPF_LOADER_UPGRADEABLE_ID,
  });
  const limit: Instruction = { programAddress: COMPUTE_BUDGET_PROGRAM_ID, data: Uint8Array.of(2, 0x80, 0x1a, 0x06, 0) };
  const ix = await deployIx(k.payer.signer, k.hardware.signer, buffer, binary.length);
  const sent = expectOk(await send(rpc, k.payer.signer, [limit, ix]), "DeployWithMaxDataLen at the declared id");
  console.log(`  loader v3 deployed ${PROGRAM_ID} from ${buffer} (${sent.signature.slice(0, 16)}…)`);
  await L.checkProgram(rpc, PROGRAM_ID, { ...binary, authority: k.hardware.signer.address });
  await handOver(rpc, k, binary, PROGRAM_ID, vault);
}
