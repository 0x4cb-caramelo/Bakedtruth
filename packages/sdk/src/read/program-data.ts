/**
 * Purpose: the program's last deploy (A-8), read from its ProgramData account under the upgradeable loader (loader v3),
 *          whose first 45 bytes are `[state u32 = 3 (ProgramData)][slot u64][Option<Pubkey> upgrade authority]`, the
 *          ELF following. A client built for one deploy compares that slot with the one it was built for and pauses
 *          signing on a mismatch (`assertDeploy`). Only those 45 bytes are fetched, as a data slice; never the ELF.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; A-8 by the founder's answer of 2026-10-10: read through the site's RPC,
 *          the public devnet one, until the `/rpc` relay exists)
 *
 * The layout is the loader's (`UpgradeableLoaderState::ProgramData`, bincode); scripts/deploy/finish.ts reads the same
 * bytes. Owner first, as every reader of this SDK: an account the loader does not own is never read.
 */
import { getAddressDecoder, getBase64Encoder, type Address } from "@solana/kit";

import { BPF_LOADER_UPGRADEABLE_ID } from "./constants";
import { programDataAddress } from "./pdas";
import type { SolanaRpc } from "./rpc";

/** `ProgramData::size_of_metadata()`: the state tag, the slot and the optional authority. */
export const PROGRAM_DATA_METADATA_LEN = 45;
const STATE_PROGRAM_DATA = 3;

export type ProgramDeploy = {
  /** The slot of the program's last deploy or upgrade. */
  slot: bigint;
  upgradeAuthority: Address | null;
};

export type ProgramDataProblem = "Missing" | "WrongOwner" | "WrongLength" | "NotProgramData" | "BadOption";

export class ProgramDataRefused extends Error {
  constructor(readonly problem: ProgramDataProblem) {
    super(`not the program's ProgramData: ${problem}`);
    this.name = "ProgramDataRefused";
  }
}

/** The deploy recorded in a ProgramData account's first bytes (at least 13; 45 with an authority). */
export function readProgramData(owner: string, data: Uint8Array): ProgramDeploy {
  if (owner !== BPF_LOADER_UPGRADEABLE_ID) throw new ProgramDataRefused("WrongOwner");
  if (data.length < 13) throw new ProgramDataRefused("WrongLength");
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (view.getUint32(0, true) !== STATE_PROGRAM_DATA) throw new ProgramDataRefused("NotProgramData");
  const slot = view.getBigUint64(4, true);
  if (data[12] === 0) return { slot, upgradeAuthority: null };
  if (data[12] !== 1) throw new ProgramDataRefused("BadOption");
  if (data.length < PROGRAM_DATA_METADATA_LEN) throw new ProgramDataRefused("WrongLength");
  return { slot, upgradeAuthority: getAddressDecoder().decode(data.subarray(13, PROGRAM_DATA_METADATA_LEN)) };
}

/** Reads the program's last deploy through `rpc`, fetching only ProgramData's first 45 bytes. */
export async function readProgramDeploy(rpc: SolanaRpc): Promise<ProgramDeploy> {
  const slice = { offset: 0, length: PROGRAM_DATA_METADATA_LEN };
  const { value } = await rpc
    .getAccountInfo(await programDataAddress(), { encoding: "base64", commitment: "confirmed", dataSlice: slice })
    .send();
  if (!value) throw new ProgramDataRefused("Missing");
  return readProgramData(value.owner, new Uint8Array(getBase64Encoder().encode(value.data[0])));
}

/** A-8: the program on the cluster is not the deploy this client was built for, or the client knows none. */
export class ProgramUpgraded extends Error {
  constructor(
    readonly deployedAt: bigint,
    readonly builtFor: bigint | null,
  ) {
    super(
      builtFor === null
        ? `this client does not know which deploy it was built for; the program's last deploy is slot ${deployedAt}`
        : `the program's last deploy is slot ${deployedAt}; this client was built for slot ${builtFor}`,
    );
    this.name = "ProgramUpgraded";
  }
}

/** Throws `ProgramUpgraded` unless the program's last deploy is the one `builtFor` names; else returns it. */
export async function assertDeploy(rpc: SolanaRpc, builtFor: bigint | null): Promise<ProgramDeploy> {
  const deploy = await readProgramDeploy(rpc);
  if (builtFor === null || deploy.slot !== builtFor) throw new ProgramUpgraded(deploy.slot, builtFor);
  return deploy;
}

/** A build's deploy slot from its configuration text: decimal digits only, else `null` (unknown). */
export const deploySlotFrom = (text: string | null | undefined): bigint | null =>
  typeof text === "string" && /^\d{1,20}$/.test(text) ? BigInt(text) : null;
