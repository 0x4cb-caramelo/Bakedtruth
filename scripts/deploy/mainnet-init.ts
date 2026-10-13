/**
 * Purpose: the deploy's second half on mainnet, done by the multisig (deploy/mainnet/README.md, step 7): one vault
 *          transaction holding `admin_initialize_config` (the vault, by then the upgrade authority, signs it and pays
 *          both rents; `admin` and `fee_recipient` are the vault) and `admin_set_team` (the vault, now `admin`, names
 *          the team), so the program is never initialized without a team that can pause. Built with the SDK, printed
 *          for the Squads CLI with the message's SHA-256 that each signer compares before approving, and checked
 *          back field by field once executed.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * Why the vault initializes: `admin_initialize_config` must be signed by the upgrade authority the program reads
 * from ProgramData (checks/upgrade.rs), and on mainnet no key file ever holds it. The program refuses CPI only for
 * `resolve_campaign` (checks/top_level.rs), so the vault can sign through Squads' `vault_transaction_execute`.
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
import { buildInitializeConfig, buildSetTeam, type CreationParamsArgs } from "@brot/sdk/tx";

import type { Rpc } from "../validator/rpc";
import { configDifferences, readConfig } from "./initialize";
import { readProgram } from "./mainnet-loader";
import { compileVaultMessage } from "./mainnet-squads";

/** The vault initializes as admin; `admin` differs only when checking a config after option B moved it. */
export type InitPlan = {
  vault: Address;
  feeRecipient: Address;
  team: Address[];
  params: CreationParamsArgs;
  admin?: Address;
};

/** The two instructions of the initialization proposal, in order; the vault signs both through Squads. */
export async function initAndTeamInstructions(plan: InitPlan): Promise<Instruction[]> {
  const vault = createNoopSigner(plan.vault);
  const init = await buildInitializeConfig({
    authority: vault,
    admin: plan.vault,
    feeRecipient: plan.feeRecipient,
    params: plan.params,
  });
  return [init, await buildSetTeam({ admin: vault, team: plan.team })];
}

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

/** The config as the plan wants it, and the program's upgrade authority the vault: what step 7 must leave behind. */
export async function verifyInitialized(rpc: Rpc, plan: InitPlan, programId: Address): Promise<void> {
  const config = await readConfig(rpc);
  if (!config) throw new Error("the program is not initialized: the multisig's proposal has not executed");
  const admin = plan.admin ?? plan.vault;
  const off = configDifferences(config, { admin, feeRecipient: plan.feeRecipient, params: plan.params });
  if (teamOf(config).join() !== plan.team.join()) off.push("team");
  if (config.pendingAdmin !== "11111111111111111111111111111111") off.push("pending admin");
  if (config.operatingLevel !== OperatingLevel.Normal) off.push("operating level");
  if (off.length) throw new Error(`the stored config differs from the plan in: ${off.join(", ")}`);
  const program = await readProgram(rpc, programId);
  if (program.authority !== plan.vault) throw new Error(`the upgrade authority is ${program.authority}, not the vault`);
  console.log(`  config: admin ${admin}, fee recipient ${plan.feeRecipient}, the plan's parameters`);
  console.log(`    team ${plan.team.join(", ")}`);
  console.log(`  program ${programId}: upgrade authority ${plan.vault} (the multisig vault)`);
}
