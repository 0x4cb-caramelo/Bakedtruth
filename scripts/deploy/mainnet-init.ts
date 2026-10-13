/**
 * Purpose: the deploy's second half on mainnet, done by the two multisigs the founder chose (M-1, 2026-10-13;
 *          deploy/mainnet/README.md, step 7): the upgrade multisig's vault, by then the upgrade authority, proposes
 *          `admin_initialize_config` (it signs and pays both rents; `fee_recipient` is the admin multisig's vault),
 *          `admin_set_team` and `admin_transfer_admin` to the admin vault, in one transaction, so the program is never
 *          initialized without a team that can pause; then the admin multisig's vault proposes `admin_accept_admin`.
 *          Built with the SDK, printed for the Squads CLI with each message's SHA-256, and checked back once executed.
 * Version: 0.2.0 (two multisigs: the locked one keeps the upgrade authority, the unlocked one takes `admin` and fees)
 * Sprint:  18 (mainnet), lane L18
 *
 * Why the upgrade vault initializes: `admin_initialize_config` must be signed by the upgrade authority the program
 * reads from ProgramData (checks/upgrade.rs), and on mainnet no key file ever holds it. The program refuses CPI only
 * for `resolve_campaign` (checks/top_level.rs), so a vault signs through Squads' `vault_transaction_execute`. Why two
 * steps for `admin`: only the admin vault can accept, so a wrong address leaves the upgrade vault as admin, never a
 * key nobody holds.
 */
import {
  appendTransactionMessageInstructions,
  blockhash,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getBase58Decoder,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
  type Instruction,
} from "@solana/kit";

import { OperatingLevel, teamOf } from "@brot/sdk/read";
import {
  buildAcceptAdmin,
  buildInitializeConfig,
  buildSetTeam,
  buildTransferAdmin,
  ZERO_ADDRESS,
  type CreationParamsArgs,
} from "@brot/sdk/tx";

import type { Rpc } from "../validator/rpc";
import { configDifferences, readConfig } from "./initialize";
import { readProgram } from "./mainnet-loader";
import { compileVaultMessage, UPGRADE_TIME_LOCK_SECONDS } from "./mainnet-squads";

/** The vaults (index 0) of the upgrade multisig (24 h lock) and of the admin multisig (no lock), and what to set. */
export type InitPlan = { upgradeVault: Address; adminVault: Address; team: Address[]; params: CreationParamsArgs };

/** Step 7a, the upgrade multisig's proposal: initialize, set the team, name the admin vault as the pending admin. */
export async function initInstructions(plan: InitPlan): Promise<Instruction[]> {
  const vault = createNoopSigner(plan.upgradeVault);
  const init = await buildInitializeConfig({
    authority: vault,
    admin: plan.upgradeVault,
    feeRecipient: plan.adminVault,
    params: plan.params,
  });
  const team = await buildSetTeam({ admin: vault, team: plan.team });
  return [init, team, await buildTransferAdmin({ admin: vault, newAdmin: plan.adminVault })];
}

/** Step 7b, the admin multisig's proposal: its vault accepts `admin`. */
export const acceptInstructions = async (plan: InitPlan): Promise<Instruction[]> => [
  await buildAcceptAdmin({ newAdmin: createNoopSigner(plan.adminVault) }),
];

const hex = (bytes: ArrayLike<number>) => Buffer.from(Uint8Array.from(bytes)).toString("hex");
const roleOf = (role: number) => ["readonly", "writable", "signer", "signer, writable"][role];

/** The same instructions as an unsigned legacy transaction paid by the vault, in base58: the shape solana-verify's
 * `export-pda-tx` hands the Squads app's TX Builder ("Import base58 encoded tx"). The blockhash is a placeholder. */
function unsignedBase58(vault: Address, ixs: Instruction[]): string {
  const lifetime = { blockhash: blockhash("11111111111111111111111111111111"), lastValidBlockHeight: 0n };
  const message = pipe(
    createTransactionMessage({ version: "legacy" }),
    (m) => setTransactionMessageFeePayer(vault, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  return getBase58Decoder().decode(getTransactionEncoder().encode(compileTransaction(message)));
}

/** What the signers approve: each instruction, the message's SHA-256, and the Squads CLI command that proposes it. */
export function printVaultMessage(title: string, multisig: Address, vault: Address, ixs: Instruction[]) {
  const { bytes, keys } = compileVaultMessage(vault, ixs);
  const digest = new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
  console.log(`\n${title}: a vault transaction of multisig ${multisig}, vault ${vault}`);
  ixs.forEach((ix, i) => {
    console.log(`  instruction ${i + 1}: program ${ix.programAddress}, data ${hex(ix.data ?? new Uint8Array())}`);
    for (const meta of ix.accounts ?? []) console.log(`    ${meta.address} (${roleOf(meta.role)})`);
  });
  console.log(`  message: ${bytes.length} bytes, ${keys.length} accounts, sha256 ${digest}`);
  console.log(
    "  each approver checks the proposal holds exactly these instructions (Squads shows them) before approving.",
  );
  console.log("  propose it with the Squads CLI (the bytes the rehearsal ran through Squads on a mainnet fork):");
  console.log(
    `  squads-multisig-cli vault-transaction-create --keypair usb://ledger?key=0 --multisig-pubkey ${multisig}`,
  );
  console.log(`    --vault-index 0 --transaction-message [${Array.from(bytes).join(", ")}]`);
  console.log(
    '  or in the Squads app, TX Builder, "Import base58 encoded tx" (not rehearsed: check it on devnet first):',
  );
  console.log(`    ${unsignedBase58(vault, ixs)}`);
  return { bytes, digest };
}

/** Steps 7a, 7b and 9, as the signers run them. */
export async function printMultisigSteps(upgradeMultisig: Address, adminMultisig: Address, plan: InitPlan) {
  const init = await initInstructions(plan);
  printVaultMessage("  7a. the upgrade multisig's proposal", upgradeMultisig, plan.upgradeVault, init);
  const accept = await acceptInstructions(plan);
  printVaultMessage("  7b. the admin multisig's proposal", adminMultisig, plan.adminVault, accept);
  console.log("\n  9. the upgrade multisig's lock (M-2), the session's last act:");
  console.log(
    `  squads-multisig-cli config-transaction-create --keypair usb://ledger?key=0 --multisig-pubkey ${upgradeMultisig}`,
  );
  console.log(`    --action "SetTimeLock ${UPGRADE_TIME_LOCK_SECONDS}"`);
}

/** What step 7 must leave: `admin` and `fee_recipient` the admin vault, the plan's values, the upgrade vault upgrading. */
export async function verifyInitialized(rpc: Rpc, plan: InitPlan, programId: Address): Promise<void> {
  const config = await readConfig(rpc);
  if (!config) throw new Error("the program is not initialized: step 7a has not executed");
  const want = { admin: plan.adminVault, feeRecipient: plan.adminVault, params: plan.params };
  const off = configDifferences(config, want);
  if (teamOf(config).join() !== plan.team.join()) off.push("team");
  if (config.pendingAdmin !== ZERO_ADDRESS) off.push("pending admin (step 7b has not executed)");
  if (config.operatingLevel !== OperatingLevel.Normal) off.push("operating level");
  if (off.length) throw new Error(`the stored config differs from the plan in: ${off.join(", ")}`);
  const program = await readProgram(rpc, programId);
  if (program.authority !== plan.upgradeVault) {
    throw new Error(`the upgrade authority is ${program.authority}, not the upgrade multisig's vault`);
  }
  console.log(`  config: admin and fee recipient ${plan.adminVault} (the admin multisig), the plan's parameters`);
  console.log(`    team ${plan.team.join(", ")}`);
  console.log(`  program ${programId}: upgrade authority ${plan.upgradeVault} (the upgrade multisig)`);
}
