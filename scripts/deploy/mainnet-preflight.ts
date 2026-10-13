/**
 * Purpose: what the mainnet deploy reads before it plans anything, sending nothing (Sprint 18): the binary and its
 *          SHA-256, how the declared program id, its ProgramData and the config stand (a funded ProgramData kills the
 *          id for good), the two Squads multisigs the founder chose (M-1, 2026-10-13: each 2 of 3 with every
 *          permission and no config authority, the same three members, the upgrade one without a lock until step 9
 *          and then 24 h, the admin one never locked) and their vaults, and whether the session payer and the upgrade
 *          vault hold what the plan spends.
 * Version: 0.2.0 (two multisigs)
 * Sprint:  18 (mainnet), lane L18
 *
 * The standings and their meaning are the devnet deploy's (scripts/deploy/preflight.ts, rehearsed 2026-10-09).
 */
import { existsSync, readFileSync } from "node:fs";

import type { Address } from "@solana/kit";

import { ACCOUNT_LEN, formatSol, PROGRAM_ID } from "@brot/sdk/read";

import { balance, rentFor, type Rpc } from "../validator/rpc";
import { readStandings, standingProblem } from "./preflight";
import { readMultisig, UPGRADE_TIME_LOCK_SECONDS, vaultAddress, type MultisigState } from "./mainnet-squads";

/** The binary named by `--so` and its SHA-256: the hash the operator types at `--execute`. */
export function readBinary(path: string | undefined) {
  if (!path || !existsSync(path)) throw new Error(`--so names the reviewed brot_markets.mainnet.so; got ${path}`);
  const bytes = readFileSync(path);
  return { path, length: bytes.length, sha256: new Bun.CryptoHasher("sha256").update(bytes).digest("hex") };
}

/** The declared id must be deployable here; `resume` when the program is already deployed (steps 6 and 7 left). */
export async function checkProgramId(rpc: Rpc, resume: boolean) {
  const standings = await readStandings(rpc);
  console.log(
    `program ${PROGRAM_ID}: ${standings.program}; ProgramData ${standings.programData}; config ${standings.config}`,
  );
  const problem = standingProblem(standings, resume);
  if (problem) throw new Error(problem);
  return standings;
}

const ALL_PERMISSIONS = 7; // Initiate | Vote | Execute
const DEFAULT_KEY = "11111111111111111111111111111111";

/** Why the multisig is not the one the runbook asks for, or null. Pure. */
export function multisigProblem(m: MultisigState): string | null {
  if (m.threshold !== 2 || m.members.length !== 3) return `${m.threshold} of ${m.members.length}, not 2 of 3`;
  if (m.members.some((member) => member.mask !== ALL_PERMISSIONS)) return "a member lacks a permission";
  if (m.configAuthority !== DEFAULT_KEY) return `a config authority (${m.configAuthority}) can change it alone`;
  return null;
}

/** Why the two multisigs are not the pair the founder chose (M-1, M-2), or null. Pure. */
export function pairProblem(upgrade: MultisigState, admin: MultisigState): string | null {
  const members = (m: MultisigState) =>
    m.members
      .map((member) => member.key)
      .sort()
      .join();
  if (members(upgrade) !== members(admin)) return "the two multisigs do not have the same three members";
  if (admin.timeLock !== 0) return `the admin multisig has a ${admin.timeLock} s time lock; it must have none (M-1)`;
  if (upgrade.timeLock !== 0 && upgrade.timeLock !== UPGRADE_TIME_LOCK_SECONDS) {
    return `the upgrade multisig's lock is ${upgrade.timeLock} s: 0 until step 9, then ${UPGRADE_TIME_LOCK_SECONDS} (M-2)`;
  }
  return null;
}

async function readOne(rpc: Rpc, multisig: Address, role: string) {
  const state = await readMultisig(rpc, multisig);
  const vault = await vaultAddress(multisig, 0);
  console.log(`${role} multisig ${multisig}: ${state.threshold} of ${state.members.length}, lock ${state.timeLock} s`);
  console.log(`  members ${state.members.map((m) => m.key).join(", ")}; vault ${vault}`);
  const problem = multisigProblem(state);
  if (problem) throw new Error(`the ${role} multisig ${multisig}: ${problem}`);
  return { multisig, state, vault };
}

/** Both multisigs read and checked: the upgrade one takes the upgrade authority, the admin one `admin` and the fees. */
export async function checkMultisigs(rpc: Rpc, upgradeMultisig: Address, adminMultisig: Address) {
  if (upgradeMultisig === adminMultisig) throw new Error("one multisig named twice: the founder chose two (M-1)");
  const upgrade = await readOne(rpc, upgradeMultisig, "upgrade");
  const admin = await readOne(rpc, adminMultisig, "admin");
  const problem = pairProblem(upgrade.state, admin.state);
  if (problem) throw new Error(problem);
  if (upgrade.state.timeLock > 0) console.log("  the upgrade multisig is already locked: step 7a waits its 24 h");
  return { upgrade, admin };
}

/** The session payer pays the buffer (refunded at the deploy), ProgramData and the program account, plus fees. */
export async function checkFunds(
  rpc: Rpc,
  a: { payer: Address; vault: Address; elfLength: number; deploying: boolean },
) {
  const fees = 20_000_000n; // the buffer's writes at the priority fee, with room: 0.02 SOL
  const rents = await Promise.all([a.elfLength + 37, a.elfLength + 45, 36].map((size) => rentFor(rpc, size)));
  const payerNeeds = a.deploying ? rents.reduce((sum, r) => sum + r, fees) : 0n;
  const vaultNeeds = (await rentFor(rpc, ACCOUNT_LEN.globalConfig)) + (await rentFor(rpc, ACCOUNT_LEN.feeVault));
  for (const [who, label, needs] of [
    [a.payer, "session payer", payerNeeds],
    [a.vault, "upgrade multisig's vault (the config's and the fee vault's rents)", vaultNeeds],
  ] as const) {
    const holds = await balance(rpc, who);
    console.log(`  ${label} ${who} needs ${formatSol(needs)} SOL and holds ${formatSol(holds)}`);
    if (holds < needs)
      throw new Error(`the ${label} holds ${formatSol(holds)} SOL; the plan needs ${formatSol(needs)}`);
  }
}
