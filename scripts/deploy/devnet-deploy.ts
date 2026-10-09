/**
 * Purpose: the first deploy of brot-markets to devnet from CI's artifact, and its initialization in the same
 *          session (TP §10, §12; deploy/devnet/README.md): the artifact by run id with SHA256SUMS checked, the
 *          program keypair from its backup and at the declared id, `solana program deploy` on the upgradeable
 *          loader (v3), then `admin_initialize_config` and `admin_set_team`, each read back. Dry run by default.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * `--execute` also asks the operator to type the program id. Nothing here runs until the founder has chosen
 * the deploy path and who holds the upgrade key (README, "Decisions that gate deploy day").
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

import { address, getAddressDecoder, type Address } from "@solana/kit";

import { BPF_LOADER_UPGRADEABLE_ID, PROGRAM_ID, configAddress, programDataAddress } from "@brot/sdk/read";

import { account, type Rpc } from "../validator/rpc";
import { openCluster, type ClusterName } from "../validator/clusters";
import { loadKeypair } from "../validator/keys";
import { downloadArtifact } from "./artifact";
import {
  checkKeypairLocation,
  checkProgramAddress,
  deployArgv,
  idlAddress,
  sha256File,
  verifyArtifactDir,
} from "./checks";
import { initializeConfig, parseTeam, readInitParams, setTeam } from "./initialize";

const { values: o } = parseArgs({
  options: {
    "run-id": { type: "string" },
    "artifact-dir": { type: "string" },
    "program-keypair": { type: "string" },
    "upgrade-authority": { type: "string" },
    "fee-payer": { type: "string" },
    admin: { type: "string" },
    "admin-keypair": { type: "string" },
    "fee-recipient": { type: "string" },
    team: { type: "string" },
    params: { type: "string", default: "deploy/devnet/init-params.json" },
    url: { type: "string" },
    cluster: { type: "string", default: "local" },
    execute: { type: "boolean", default: false },
  },
});

const need = (name: keyof typeof o) => {
  const value = o[name];
  if (typeof value !== "string" || value === "") throw new Error(`--${name} is required`);
  return value;
};

/** The program account and its ProgramData after the deploy: loader v3, our authority, the artifact's bytes. */
async function verifyDeployed(rpc: Rpc, upgradeAuthority: Address, soPath: string, soSha256: string) {
  const program = await account(rpc, PROGRAM_ID);
  if (!program?.executable || program.owner !== BPF_LOADER_UPGRADEABLE_ID) throw new Error("not a loader-v3 program");
  const data = (await account(rpc, await programDataAddress()))?.data;
  if (!data || data[12] !== 1) throw new Error("ProgramData records no upgrade authority");
  const authority = getAddressDecoder().decode(data.subarray(13, 45));
  if (authority !== upgradeAuthority)
    throw new Error(`upgrade authority is ${authority}, expected ${upgradeAuthority}`);
  const elfLength = Bun.file(soPath).size;
  const deployedSha = new Bun.CryptoHasher("sha256").update(data.subarray(45, 45 + elfLength)).digest("hex");
  if (deployedSha !== soSha256) throw new Error(`deployed bytes hash ${deployedSha}, artifact ${soSha256}`);
  console.log(`  program ${PROGRAM_ID}: loader v3, authority ${authority}, bytes = artifact (${soSha256})`);
}

async function main() {
  const artifact = o["run-id"]
    ? downloadArtifact(o["run-id"], mkdtempSync(join(tmpdir(), "brot-artifact-")))
    : verifyArtifactDir(need("artifact-dir"));
  if (idlAddress(artifact.idlPath) !== PROGRAM_ID) throw new Error("the artifact's IDL declares another program id");
  console.log(
    `artifact verified: brot_markets.so sha256 ${artifact.soSha256} (${sha256File(artifact.soPath) === artifact.soSha256})`,
  );

  const programKeypair = checkKeypairLocation(need("program-keypair"), process.cwd());
  checkProgramAddress((await loadKeypair(programKeypair)).address, PROGRAM_ID);
  const authorityPath = need("upgrade-authority");
  const upgradeAuthority = await loadKeypair(authorityPath);
  const feePayerPath = o["fee-payer"] ?? authorityPath;
  const feePayer = await loadKeypair(feePayerPath);
  const admin = address(o.admin ?? upgradeAuthority.address);
  const feeRecipient = address(need("fee-recipient"));
  const team = parseTeam(need("team"));
  if (team.length < 1 || team.length > 5) throw new Error("--team takes one to five public keys");
  const params = readInitParams(o.params!);

  const rpc = await openCluster(need("url"), o.cluster as ClusterName);
  if (await account(rpc, PROGRAM_ID))
    throw new Error(`${PROGRAM_ID} already exists here: this script is the first deploy only`);
  if (await account(rpc, await configAddress())) throw new Error("a config already exists: refusing");
  const argv = deployArgv(
    { so: artifact.soPath, programKeypair, upgradeAuthority: authorityPath, feePayer: feePayerPath },
    rpc.url,
  );
  console.log(
    `plan:\n  1. ${argv.join(" ")}\n  2. admin_initialize_config: admin ${admin}, fee recipient ${feeRecipient}`,
  );
  console.log(`  3. admin_set_team: ${team.join(", ")} (signed by the admin)`);
  if (!o.execute) return console.log("dry run: nothing was sent. Add --execute to deploy.");

  const answer = await createInterface({ input: process.stdin, output: process.stdout }).question(
    `Type the program id to deploy and initialize it now on ${o.cluster}: `,
  );
  if (answer.trim() !== PROGRAM_ID) throw new Error("the typed id does not match: stopped before sending anything");
  const deployed = spawnSync(argv[0], argv.slice(1), { stdio: "inherit" });
  if (deployed.status !== 0) throw new Error(`solana program deploy exited ${deployed.status}`);
  await verifyDeployed(rpc, upgradeAuthority.address, artifact.soPath, artifact.soSha256);
  await initializeConfig(rpc, feePayer, { authority: upgradeAuthority, admin, feeRecipient, params });
  const adminSigner =
    admin === upgradeAuthority.address
      ? upgradeAuthority
      : o["admin-keypair"] && (await loadKeypair(o["admin-keypair"]));
  if (!adminSigner || adminSigner.address !== admin) {
    console.log(
      `the admin (${admin}) must now set the team: bun run scripts/team/set-team.ts --team ${team.join(",")}`,
    );
    console.log("until then nobody can pause entries (TP §3.4.9)");
    return;
  }
  await setTeam(rpc, feePayer, adminSigner, team);
  console.log("deployed, initialized and team set in one session.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
