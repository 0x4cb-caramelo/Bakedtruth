/**
 * Purpose: the first deploy of brot-markets to devnet from CI's artifact, and its initialization in the same
 *          session (TP §10, §12; deploy/devnet/README.md): the artifact by run id, bound to the reviewed commit
 *          and to this checkout's IDL, with SHA256SUMS checked; the program keypair from its backup and at the
 *          declared id; `solana program deploy` on the upgradeable loader (v3); then `admin_initialize_config`
 *          and `admin_set_team`, each read back. Dry run by default.
 * Version: 0.1.2
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * `--execute` needs the binary's SHA-256 the dry run printed and the typed program id; an admin who is not the
 * upgrade authority and not present is typed too. The binary comes only from CI, by run id. `--resume` finishes
 * a deploy that landed while its initialization did not. Every key file sits outside any Git work tree. Nothing
 * here runs until the founder has chosen the deploy path and who holds the upgrade key (README).
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

import { address, type KeyPairSigner } from "@solana/kit";

import { PROGRAM_ID } from "@brot/sdk/read";

import { openCluster } from "../validator/clusters";
import { loadKeypair } from "../validator/keys";
import { downloadArtifact } from "./artifact";
import { checkCheckout, checkExpectedCommit, checkExpectedSha, checkIdl } from "./binding";
import { checkKeypairLocation, checkProgramAddress, deployArgv, idlAddress } from "./checks";
import { finishDeploy } from "./finish";
import { parseTeam, readInitParams } from "./initialize";
import * as F from "./preflight";

const { values: o } = parseArgs({
  options: {
    "run-id": { type: "string" },
    "expect-commit": { type: "string" },
    "expect-sha256": { type: "string" },
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
    resume: { type: "boolean", default: false },
    "team-later": { type: "boolean", default: false },
    execute: { type: "boolean", default: false },
  },
});

const ROOT = resolve(import.meta.dir, "../..");
const need = (name: keyof typeof o) => {
  const value = o[name];
  if (typeof value !== "string" || value === "") throw new Error(`--${name} is required`);
  return value;
};
const keyAt = async (path: string, label: string) => {
  const real = checkKeypairLocation(path, ROOT, label);
  return { real, signer: await loadKeypair(real) };
};

async function main() {
  console.log(`${F.checkSolanaCli()}`);
  F.refuseServer();
  const cluster = F.parseCluster(o.cluster);
  const artifact = downloadArtifact(need("run-id"), mkdtempSync(join(tmpdir(), "brot-artifact-")));
  checkExpectedCommit(o["expect-commit"], artifact.run.headSha);
  checkCheckout(ROOT, artifact.run.headSha);
  if (idlAddress(artifact.idlPath) !== PROGRAM_ID) throw new Error("the artifact's IDL declares another program id");
  checkIdl(ROOT, artifact.idlPath);
  console.log(
    `artifact of run ${artifact.run.databaseId}, main at ${artifact.run.headSha}: sha256 ${artifact.soSha256}`,
  );

  const program = o.resume ? null : await keyAt(need("program-keypair"), "program keypair");
  if (program) checkProgramAddress(program.signer.address, PROGRAM_ID);
  const authority = await keyAt(need("upgrade-authority"), "upgrade authority");
  const payer = o["fee-payer"] ? await keyAt(o["fee-payer"], "fee payer") : authority;
  const admin = address(o.admin ?? authority.signer.address);
  let adminSigner: KeyPairSigner | null = admin === authority.signer.address ? authority.signer : null;
  if (o["admin-keypair"]) adminSigner = (await keyAt(o["admin-keypair"], "admin")).signer;
  if (adminSigner && adminSigner.address !== admin) {
    throw new Error(`--admin-keypair is ${adminSigner.address}, not the --admin ${admin}: refusing`);
  }
  if (!adminSigner && !o["team-later"]) {
    throw new Error("the admin's key is not here to set the team: pass --admin-keypair, or --team-later to leave it");
  }
  if ([authority.signer, payer.signer, adminSigner].some((k) => k?.address === PROGRAM_ID)) {
    throw new Error("a signing key is the program id itself: refusing");
  }
  const feeRecipient = address(need("fee-recipient"));
  const team = parseTeam(need("team"));
  if (team.length < 1 || team.length > 5) throw new Error("--team takes one to five public keys");
  const params = readInitParams(o.params!);

  const rpc = await openCluster(need("url"), cluster);
  const standings = await F.readStandings(rpc);
  console.log(`program ${standings.program}, its ProgramData ${standings.programData}, config ${standings.config}`);
  const problem = F.standingProblem(standings, o.resume);
  if (problem) throw new Error(problem);
  const balances = await F.checkBalances(rpc, {
    feePayer: payer.signer.address,
    authority: authority.signer.address,
    elfLength: Bun.file(artifact.soPath).size,
    deploying: !o.resume,
    initializing: standings.config !== "ours",
  });
  for (const line of balances) console.log(`  ${line}`);
  const paths = { so: artifact.soPath, upgradeAuthority: authority.real, feePayer: payer.real };
  const argv = program ? deployArgv({ ...paths, programKeypair: program.real }, rpc.url) : null;
  const shown = argv?.map((arg) => (arg === rpc.url ? F.shownUrl(rpc.url) : arg)).join(" ");
  console.log(
    `plan on ${cluster} (${F.shownUrl(rpc.url)}):\n  1. ${shown ?? "resume: no deploy; the deployed bytes checked"}`,
  );
  console.log(
    `  2. admin_initialize_config: admin ${admin}, fee recipient ${feeRecipient} (the upgrade authority pays the rents)`,
  );
  console.log(`  3. admin_set_team: ${team.join(", ")}${adminSigner ? "" : " (left to the admin: --team-later)"}`);
  if (!o.execute) {
    return console.log(
      `dry run: nothing was sent. To run it: the same command, --execute --expect-sha256 ${artifact.soSha256}`,
    );
  }
  checkExpectedSha(o["expect-sha256"], artifact.soSha256);
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const typed = await prompt.question(`Type the program id to run the plan on ${cluster}: `);
    if (typed.trim() !== PROGRAM_ID) throw new Error("the typed id does not match: stopped before sending anything");
    if (admin !== authority.signer.address && !o["admin-keypair"]) {
      const typedAdmin = await prompt.question("Type the admin's public key, from the admin's own record: ");
      if (typedAdmin.trim() !== admin)
        throw new Error("the typed admin is not --admin: stopped before sending anything");
    }
  } finally {
    prompt.close();
  }
  if (argv) {
    const deployed = spawnSync(argv[0], argv.slice(1), { stdio: "inherit" });
    if (deployed.status !== 0)
      throw new Error(`solana program deploy exited ${deployed.status}: see the README's table`);
  }
  const plan = { rpc, feePayer: payer.signer, upgradeAuthority: authority.signer, admin, adminSigner, feeRecipient };
  const finished = await finishDeploy({ ...plan, team, params, artifact });
  console.log(finished === "done" ? "deployed, initialized and team set." : "initialized; the admin sets the team.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
