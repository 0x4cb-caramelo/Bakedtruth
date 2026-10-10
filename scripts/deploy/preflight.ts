/**
 * Purpose: what the deploy checks on the cluster and on this machine before it plans anything (Sprint 05 deploy
 *          review, F4, F5, F8, F11): how the program id, its ProgramData and the config stand, and what each
 *          standing means; that the fee payer and the upgrade authority hold what the plan spends; the Solana CLI's
 *          version; that this is not the server; the cluster named only `local` or `devnet`.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Anyone can send lamports to a public address. Rehearsed on the offline surfnet (2026-10-09): a funded config
 * address is taken over by `admin_initialize_config`; a funded program address makes `solana program deploy`
 * fail until the program keypair's holder moves the lamports out; a funded ProgramData address makes it fail for
 * good ("Create Account ... already in use"), since no key can move a loader address's lamports.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import {
  ACCOUNT_LEN,
  BPF_LOADER_UPGRADEABLE_ID,
  PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  configAddress,
  formatSol,
  programDataAddress,
} from "@brot/sdk/read";

import type { ClusterName } from "../validator/clusters";
import { account, balance, rentFor, type Account, type Rpc } from "../validator/rpc";

/** An address: absent; funded (System Program, lamports, no data); a loader-v3 program; this program's; other. */
export type Standing = "absent" | "funded" | "program" | "ours" | "other";
export type Standings = { program: Standing; programData: Standing; config: Standing };

export function standing(found: Account | null): Standing {
  if (!found) return "absent";
  if (found.owner === SYSTEM_PROGRAM_ID && found.data.length === 0) return "funded";
  if (found.owner === BPF_LOADER_UPGRADEABLE_ID && found.executable) return "program";
  if (found.owner === PROGRAM_ID) return "ours";
  return "other";
}

export async function readStandings(rpc: Rpc): Promise<Standings> {
  const [program, programData, config] = await Promise.all([
    account(rpc, PROGRAM_ID),
    account(rpc, await programDataAddress()),
    account(rpc, await configAddress()),
  ]);
  return { program: standing(program), programData: standing(programData), config: standing(config) };
}

/** Why the standings forbid a first deploy (`resume` false) or a resume, or `null`. */
export function standingProblem(s: Standings, resume: boolean): string | null {
  if (s.program === "funded") {
    return "someone funded the program address, so the deploy cannot create it: move the lamports out with the program keypair (solana transfer --from <its backup> <fee payer> ALL --url <the cluster>), then run again";
  }
  if (s.program === "absent" && s.programData !== "absent") {
    return "the program id's ProgramData address is already in use: the loader cannot create it and no key can empty it, so this id can never be deployed on this cluster; the program needs a new id";
  }
  if (s.program === "other") return "the program address holds an account that is not a loader-v3 program";
  if (!resume && s.program === "program") {
    return "the program is already deployed here: --resume finishes its initialization; nothing redeploys it";
  }
  if (resume && s.program !== "program") return "the program is not deployed here: nothing to resume";
  if (s.config === "other") return "the config address holds an account that is not this program's";
  if (s.program === "absent" && s.config === "ours") return "a config exists for a program that is not deployed";
  return null;
}

/** What the plan spends from each key, checked against what each holds; one line per key. */
export async function checkBalances(
  rpc: Rpc,
  a: { feePayer: string; authority: string; elfLength: number; deploying: boolean; initializing: boolean },
): Promise<string[]> {
  const need = new Map<string, bigint>();
  const add = (who: string, lamports: bigint) => need.set(who, (need.get(who) ?? 0n) + lamports);
  if (a.deploying) {
    // The buffer (37-byte header; refunded at the end), ProgramData (45-byte header), the program (36 bytes), and
    // up to 0.01 SOL of fees for the buffer's writes.
    const rents = await Promise.all([a.elfLength + 37, a.elfLength + 45, 36].map((size) => rentFor(rpc, size)));
    add(a.feePayer, rents.reduce((sum, r) => sum + r, 0n) + 10_000_000n);
  }
  if (a.initializing) {
    // `admin_initialize_config`: the upgrade authority pays the config's and the fee vault's rents.
    add(a.authority, (await rentFor(rpc, ACCOUNT_LEN.globalConfig)) + (await rentFor(rpc, ACCOUNT_LEN.feeVault)));
    add(a.feePayer, 20_000n);
  }
  const lines: string[] = [];
  for (const [who, lamports] of need) {
    const holds = await balance(rpc, who);
    lines.push(`${who} needs ${formatSol(lamports)} SOL and holds ${formatSol(holds)}`);
    if (holds < lamports)
      throw new Error(`${who} holds ${formatSol(holds)} SOL; the plan needs ${formatSol(lamports)}`);
  }
  return lines;
}

/** The Solana CLI the deploy was rehearsed with: 3.1.x. */
export function checkSolanaCli(): string {
  const result = spawnSync("solana", ["--version"], { encoding: "utf8" });
  const version = (result.stdout ?? "").trim();
  if (result.status !== 0 || !/^solana-cli 3\.1\./.test(version)) {
    throw new Error(`the deploy needs Solana CLI 3.1.x (rehearsed with 3.1.10); found ${version || "none"}`);
  }
  return version;
}

/** The deploy never runs on the server (TP §12), where these folders exist. */
export function refuseServer(folders = ["/srv/brot-markets", "/etc/brot-markets"]): void {
  if (folders.some((folder) => existsSync(folder))) {
    throw new Error("this machine looks like the server: the deploy runs on the upgrade key holder's own machine");
  }
}

/** `--cluster`: `local` or `devnet`, nothing else. */
export function parseCluster(value: unknown): ClusterName {
  if (value === "local" || value === "devnet") return value;
  throw new Error(`--cluster must be local or devnet, not ${String(value)}`);
}

/** A URL as it may be printed: its origin, without a path or a query that could carry a provider's key. */
export const shownUrl = (url: string): string => new URL(url).origin;
