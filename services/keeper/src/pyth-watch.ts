/**
 * Purpose: the Pyth upgrade watch (Sprint 07, carried item "the watchdog also watches Pyth"; TP §3.5, the chain
 *          watch): the price reader trusts Pyth's receiver (`rec2HH…`, which owns every price account) and the
 *          sponsored accounts its push oracle (`pyt2F…`) writes. Each program's ProgramData records its last deploy
 *          slot and its upgrade authority; the watch reads both (45 bytes each, one `getMultipleAccounts`, decoded by
 *          the SDK's `readProgramData`) and raises `pyth_program_changed` when either differs from the deploy
 *          recorded for the cluster, then takes the new reading as the reference until the process restarts.
 * Version: 0.1.0
 * Sprint:  07 carry-over
 *
 * The recorded deploys were read on 2026-10-13 through the public RPCs and equal the table of
 * knowledge-base/tecnologia/pyth-leitor-de-preco.md §1.8 (2026-10-05). A changed program is the team's to review;
 * after the review, the constant here is updated in a reviewed change. On a local cluster nothing is recorded, so the
 * first reading is the reference. The receiver's configuration (data sources, minimum signatures) is not watched:
 * its account layout was not verified in this repository.
 */
import {
  BPF_LOADER_UPGRADEABLE_ID,
  PYTH_PUSH_ORACLE_ID,
  PYTH_RECEIVER_ID,
  readProgramData,
  type ProgramDeploy,
  type SolanaRpc,
} from "@brot/sdk/read";
import { address, getAddressEncoder, getBase64Encoder, getProgramDerivedAddress, type Address } from "@solana/kit";

import type { Alerter } from "./alert";

export const PYTH_PROGRAMS = { receiver: PYTH_RECEIVER_ID, pushOracle: PYTH_PUSH_ORACLE_ID } as const;
export type PythName = keyof typeof PYTH_PROGRAMS;
export type Reading = ProgramDeploy | { error: string };
export type PythReport = Record<PythName, { slot: string; upgradeAuthority: string | null } | { error: string }>;

const DEVNET_AUTHORITY = address("upg8KLALUN7ByDHiBu4wEbMDTC6UnSVFSYfTyGfXuzr");
const MAINNET_AUTHORITY = address("6oXTdojyfDS8m5VtTaYB9xRCxpKGSvKJFndLUPV3V3wT");

export const KNOWN_DEPLOYS: Record<"devnet" | "mainnet", Record<PythName, ProgramDeploy>> = {
  devnet: {
    receiver: { slot: 460_336_311n, upgradeAuthority: DEVNET_AUTHORITY },
    pushOracle: { slot: 460_336_332n, upgradeAuthority: DEVNET_AUTHORITY },
  },
  mainnet: {
    receiver: { slot: 417_825_260n, upgradeAuthority: MAINNET_AUTHORITY },
    pushOracle: { slot: 417_825_281n, upgradeAuthority: MAINNET_AUTHORITY },
  },
};

/** A program's ProgramData under the upgradeable loader: `[program]`. */
export async function programDataOf(program: Address): Promise<Address> {
  const seeds = [getAddressEncoder().encode(program)];
  return (await getProgramDerivedAddress({ programAddress: BPF_LOADER_UPGRADEABLE_ID, seeds }))[0];
}

/** Both programs' last deploy, or why it could not be read (a missing account, another owner, another layout). */
export async function readPythDeploys(rpc: SolanaRpc): Promise<Record<PythName, Reading>> {
  const names = Object.keys(PYTH_PROGRAMS) as PythName[];
  const addresses = await Promise.all(names.map((name) => programDataOf(PYTH_PROGRAMS[name])));
  const slice = { offset: 0, length: 45 };
  const { value } = await rpc
    .getMultipleAccounts(addresses, { encoding: "base64", dataSlice: slice, commitment: "confirmed" })
    .send();
  const out = {} as Record<PythName, Reading>;
  names.forEach((name, i) => {
    const account = value[i];
    if (!account) return void (out[name] = { error: "ProgramData missing" });
    try {
      out[name] = readProgramData(account.owner, new Uint8Array(getBase64Encoder().encode(account.data[0])));
    } catch (error) {
      out[name] = { error: error instanceof Error ? error.message : String(error) };
    }
  });
  return out;
}

const same = (a: Reading, b: Reading) =>
  "error" in a || "error" in b
    ? "error" in a && "error" in b && a.error === b.error
    : a.slot === b.slot && a.upgradeAuthority === b.upgradeAuthority;

const shown = (r: Reading) => ("error" in r ? r : { slot: r.slot.toString(), upgradeAuthority: r.upgradeAuthority });

export type PythWatch = { check(rpc: SolanaRpc): Promise<PythReport> };

export function createPythWatch(cluster: string, alerter: Alerter): PythWatch {
  const known = cluster === "devnet" || cluster === "mainnet" ? KNOWN_DEPLOYS[cluster] : null;
  const reference: Partial<Record<PythName, Reading>> = known ? { ...known } : {};
  return {
    async check(rpc) {
      const now = await readPythDeploys(rpc);
      for (const name of Object.keys(now) as PythName[]) {
        const before = reference[name];
        const current = now[name];
        if (before && !same(before, current)) {
          const was = shown(before);
          const is = shown(current);
          alerter.alert("pyth_program_changed", name, {
            program: PYTH_PROGRAMS[name],
            expectedSlot: "slot" in was ? was.slot : null,
            expectedAuthority: "slot" in was ? was.upgradeAuthority : null,
            slot: "slot" in is ? is.slot : null,
            authority: "slot" in is ? is.upgradeAuthority : null,
            error: "error" in is ? is.error : null,
          });
        }
        reference[name] = current;
      }
      return { receiver: shown(now.receiver), pushOracle: shown(now.pushOracle) };
    },
  };
}
