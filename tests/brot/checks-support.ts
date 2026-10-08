/**
 * Purpose: helpers of the checks negatives in LiteSVM: rewrite or place one account (owner, bytes,
 *          lamports), a PDA at a bump below the canonical one, another program's ProgramData, and
 *          a world with the config initialised and an `admin_set_team` ready to tamper with.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane A
 */
import { createHash } from "node:crypto";

import {
  generateKeyPairSigner,
  getAddressDecoder,
  getAddressEncoder,
  getProgramDerivedAddress,
  isOffCurveAddress,
  lamports,
  type Address,
} from "@solana/kit";

import { DEFAULT_PARAMS, initConfig } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { createWorld, fundedWallet, type World } from "./setup";

export const text = (s: string) => new TextEncoder().encode(s);

/** A fresh address that no program here owns or derives. */
export const anyAddress = async () => (await generateKeyPairSigner()).address;

/** Writes the account at `address` again with another owner, other bytes or other lamports. */
export function rewrite(w: World, address: Address, change: { owner?: Address; data?: Uint8Array }) {
  const account = w.client.svm.getAccount(address);
  if (!account.exists) throw new Error(`no account at ${address}`);
  const data = change.data ?? new Uint8Array(account.data);
  const programAddress = change.owner ?? account.programAddress;
  w.client.svm.setAccount({
    address,
    data,
    executable: false,
    lamports: account.lamports,
    programAddress,
    space: BigInt(data.length),
  });
}

/** Puts an account at `address`, whatever was there. */
export function place(w: World, address: Address, a: { owner: Address; lamports: bigint; data?: Uint8Array }) {
  const data = a.data ?? new Uint8Array();
  const account = { address, data, executable: false, lamports: lamports(a.lamports), space: BigInt(data.length) };
  w.client.svm.setAccount({ ...account, programAddress: a.owner });
}

/** sha256(seeds, bump, program, "ProgramDerivedAddress"): the address at one bump, on or off the curve. */
function addressAtBump(seeds: Uint8Array[], bump: number, programAddress: Address) {
  const hash = createHash("sha256");
  for (const seed of seeds) hash.update(seed);
  hash.update(Uint8Array.of(bump)).update(new Uint8Array(getAddressEncoder().encode(programAddress)));
  return getAddressDecoder().decode(new Uint8Array(hash.update("ProgramDerivedAddress").digest()));
}

/** A PDA of `seeds` under the program at the highest valid bump below the canonical one. */
export async function nonCanonicalPda(seeds: Uint8Array[], programAddress: Address = P.PROGRAM_ID) {
  const [canonicalAddress, canonical] = await getProgramDerivedAddress({ programAddress, seeds });
  if (addressAtBump(seeds, canonical, programAddress) !== canonicalAddress)
    throw new Error("PDA hash disagrees with kit");
  for (let bump = canonical - 1; bump >= 0; bump--) {
    const candidate = addressAtBump(seeds, bump, programAddress);
    if (isOffCurveAddress(candidate)) return candidate;
  }
  throw new Error("no valid bump below the canonical one");
}

/** The ProgramData address of `program` under the upgradeable loader. */
export const programDataOf = async (program: Address) =>
  (await getProgramDerivedAddress({ programAddress: P.LOADER_V3_ID, seeds: [getAddressEncoder().encode(program)] }))[0];

/** A world before initialisation, with `admin_initialize_config` signed by the upgrade authority. */
export async function uninitialised() {
  const w = await createWorld();
  const admin = await fundedWallet(w);
  const feeRecipient = await fundedWallet(w, 1n);
  const params = DEFAULT_PARAMS;
  const init = await I.initializeConfigIx({
    authority: w.upgradeAuthority,
    admin: admin.address,
    feeRecipient: feeRecipient.address,
    params,
  });
  return { w, admin, feeRecipient, init };
}

/** A world with the config initialised and an `admin_set_team` naming one fresh key. */
export async function configured() {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const setTeam = await I.setTeamIx(admin, [await anyAddress()]);
  return { w, admin, setTeam, config: await P.configPda(), feeVault: await P.feeVaultPda() };
}
