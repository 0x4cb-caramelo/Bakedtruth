/**
 * Purpose: the deploy's second half, shared by the first run and a resume (`devnet-deploy.ts --resume`): the
 *          program at the declared id read back (loader v3, the expected upgrade authority, the deployed bytes
 *          equal to CI's artifact), then `admin_initialize_config` and `admin_set_team`, each read back.
 * Version: 0.1.1
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * A resume is safe because only the upgrade authority can initialize (`admin_initialize_config` reads it from
 * ProgramData): nobody can take the admin role between a deploy that landed and an initialization that failed.
 * It is also idempotent (Sprint 05 deploy review, F5): a config that already holds the plan's values is left as
 * it is and the run goes on to the team; a config or a team that differs from the plan is refused, never changed.
 */
import { getAddressDecoder, type Address, type TransactionSigner } from "@solana/kit";

import { BPF_LOADER_UPGRADEABLE_ID, PROGRAM_ID, programDataAddress, teamOf } from "@brot/sdk/read";
import type { CreationParamsArgs } from "@brot/sdk/tx";

import { account, type Rpc } from "../validator/rpc";
import { configDifferences, initializeConfig, readConfig, setTeam } from "./initialize";

/** The binary that must be at the program id: its path and SHA-256, from a verified artifact. */
export type ArtifactBinary = { soPath: string; soSha256: string };

/** The program account and its ProgramData: loader v3, our authority, the artifact's bytes. */
export async function verifyDeployed(rpc: Rpc, upgradeAuthority: Address, artifact: ArtifactBinary) {
  const program = await account(rpc, PROGRAM_ID);
  if (!program?.executable || program.owner !== BPF_LOADER_UPGRADEABLE_ID) throw new Error("not a loader-v3 program");
  const data = (await account(rpc, await programDataAddress()))?.data;
  if (!data || data[12] !== 1) throw new Error("ProgramData records no upgrade authority");
  const authority = getAddressDecoder().decode(data.subarray(13, 45));
  if (authority !== upgradeAuthority)
    throw new Error(`upgrade authority is ${authority}, expected ${upgradeAuthority}`);
  const elfLength = Bun.file(artifact.soPath).size;
  const deployedSha = new Bun.CryptoHasher("sha256").update(data.subarray(45, 45 + elfLength)).digest("hex");
  if (deployedSha !== artifact.soSha256)
    throw new Error(`deployed bytes hash ${deployedSha}, artifact ${artifact.soSha256}`);
  console.log(`  program ${PROGRAM_ID}: loader v3, authority ${authority}, bytes = artifact (${artifact.soSha256})`);
}

export type FinishPlan = {
  rpc: Rpc;
  feePayer: TransactionSigner;
  upgradeAuthority: TransactionSigner;
  admin: Address;
  /** The admin's signer when the admin is present; otherwise the team step is printed for them. */
  adminSigner: TransactionSigner | null;
  feeRecipient: Address;
  team: Address[];
  params: CreationParamsArgs;
  artifact: ArtifactBinary;
};

/** Verifies the deployed program, initializes the config as planned and sets the team; `"team pending"` without the admin. */
export async function finishDeploy(p: FinishPlan): Promise<"done" | "team pending"> {
  await verifyDeployed(p.rpc, p.upgradeAuthority.address, p.artifact);
  const plan = { admin: p.admin, feeRecipient: p.feeRecipient, params: p.params };
  const existing = await readConfig(p.rpc);
  if (existing) {
    const differences = configDifferences(existing, plan);
    if (differences.length) throw new Error(`the config exists with another ${differences.join(", ")}: refusing`);
    console.log("  the config already holds the plan's values: going on to the team");
  } else {
    await initializeConfig(p.rpc, p.feePayer, { authority: p.upgradeAuthority, ...plan });
  }
  const stored = teamOf((await readConfig(p.rpc))!);
  if (stored.length > 0) {
    if (stored.join(",") !== p.team.join(",")) {
      throw new Error(`the team is set to other keys (${stored.join(", ")}): change it with scripts/team/set-team.ts`);
    }
    console.log("  the team is already the plan's: nothing to send");
    return "done";
  }
  if (!p.adminSigner || p.adminSigner.address !== p.admin) {
    console.log(
      `the admin (${p.admin}) must now set the team: bun run scripts/team/set-team.ts --team ${p.team.join(",")}`,
    );
    console.log("until then nobody can pause entries (TP §3.4.9)");
    return "team pending";
  }
  await setTeam(p.rpc, p.feePayer, p.adminSigner, p.team);
  return "done";
}
