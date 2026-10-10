/**
 * Purpose: rehearse every step of the devnet deploy on a local offline surfnet, inside a loopback-only network
 *          namespace: the artifact check (and its refusal of a changed byte), the program keypair checks, a real
 *          `solana program deploy` on the upgradeable loader at a throwaway address, why the declared id is
 *          required (that binary at another address fails at its event), and the deploy's second half at the
 *          declared id as `devnet-deploy.ts` and its `--resume` run it (scripts/deploy/finish.ts): the deployed
 *          bytes and upgrade authority checked, `admin_initialize_config` (over a config address a stranger
 *          funded) then `admin_set_team`, read back, a repeated resume ending at once; and what a stranger's
 *          lamports do at a program's addresses (scripts/deploy/rehearse-funded.ts).
 * Version: 0.1.2
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * `bun run scripts/deploy/rehearse.ts`. The binary is the local build (target/deploy), which never goes to a
 * cluster: only CI's artifact does (deploy/devnet/README.md). Exits 0 only when every step behaves as expected.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, copyFileSync, cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { generateKeyPairSigner, getAddressEncoder, getProgramDerivedAddress, type Address } from "@solana/kit";

import { BPF_LOADER_UPGRADEABLE_ID, configAddress, PROGRAM_ID } from "@brot/sdk/read";
import { buildInitializeConfig } from "@brot/sdk/tx";

import { isolateOrExit } from "../validator/isolate";
import { writeThrowawayKeypair } from "../validator/keys";
import { account, airdrop, expectRefusal, send } from "../validator/rpc";
import { PROGRAM_SO, SOL, startLocalWorld } from "../validator/world";
import {
  assertLoaderV3Deploy,
  checkKeypairLocation,
  checkProgramAddress,
  deployArgv,
  sha256File,
  verifyArtifactDir,
} from "./checks";
import { finishDeploy } from "./finish";
import { rehearseFundedAddresses } from "./rehearse-funded";
import { readInitParams } from "./initialize";

isolateOrExit(import.meta.path);

/** Runs `attempt` and requires it to throw; prints the reason. */
function refused(label: string, attempt: () => unknown) {
  try {
    attempt();
  } catch (error) {
    return console.log(`  refused as expected (${label}): ${(error as Error).message.split("\n")[0]}`);
  }
  throw new Error(`${label} was not refused`);
}

/** `refused` for an async attempt. */
async function refusedAsync(label: string, attempt: () => Promise<unknown>) {
  const reason = await attempt().then(
    () => null,
    (error: Error) => error.message.split("\n")[0],
  );
  if (reason === null) throw new Error(`${label} was not refused`);
  console.log(`  refused as expected (${label}): ${reason}`);
}

/** A local artifact folder shaped like CI's `programs-<sha>`, from the local build. */
function localArtifact(tmp: string) {
  const dir = join(tmp, "artifact");
  mkdirSync(dir);
  copyFileSync(PROGRAM_SO, join(dir, "brot_markets.so"));
  copyFileSync("packages/sdk/src/idl/brot_markets.json", join(dir, "brot_markets.json"));
  const sums = ["brot_markets.json", "brot_markets.so"].map((f) => `${sha256File(join(dir, f))}  ${f}`);
  writeFileSync(join(dir, "SHA256SUMS"), `${sums.join("\n")}\n`);
  return dir;
}

async function main() {
  const tmp = mkdtempSync(join(tmpdir(), "brot-rehearsal-"));
  const params = readInitParams("deploy/devnet/init-params.json");
  console.log("1. artifact: SHA256SUMS checked before anything reads the binary");
  const dir = localArtifact(tmp);
  const artifact = verifyArtifactDir(dir);
  console.log(`  verified: brot_markets.so ${artifact.soSha256}`);
  cpSync(dir, join(tmp, "tampered"), { recursive: true });
  appendFileSync(join(tmp, "tampered", "brot_markets.so"), "\0");
  refused("a changed byte", () => verifyArtifactDir(join(tmp, "tampered")));

  console.log("2. program keypair: from the backup, at the declared id; loader v3 only");
  refused("a keypair under target/deploy/", () => checkKeypairLocation("target/deploy/brot_markets-keypair.json", "."));
  const throwawayPath = join(tmp, "throwaway-program.json");
  const throwaway = await writeThrowawayKeypair(throwawayPath);
  checkKeypairLocation(throwawayPath, ".");
  refused("an address other than the declared id", () => checkProgramAddress(throwaway.address, PROGRAM_ID));
  const flags = { so: artifact.soPath, programKeypair: throwawayPath, upgradeAuthority: "a.json", feePayer: "a.json" };
  refused("--final", () => assertLoaderV3Deploy([...deployArgv(flags, "http://127.0.0.1:1"), "--final"]));
  refused("loader v4", () => assertLoaderV3Deploy(["solana", "program-v4", "deploy", artifact.soPath]));

  const world = await startLocalWorld();
  const { rpc } = world;
  try {
    console.log("3. solana program deploy (loader v3) at a throwaway address, with deployArgv's flags");
    const authorityPath = join(tmp, "upgrade-authority.json");
    const authority = await writeThrowawayKeypair(authorityPath);
    await airdrop(rpc, authority.address, 20n * SOL);
    const argv = deployArgv({ ...flags, upgradeAuthority: authorityPath, feePayer: authorityPath }, rpc.url);
    const deployed = spawnSync(argv[0], argv.slice(1), { encoding: "utf8" });
    if (deployed.status !== 0) throw new Error(`deploy failed: ${deployed.stderr}${deployed.stdout}`);
    const program = await account(rpc, throwaway.address);
    if (program?.owner !== BPF_LOADER_UPGRADEABLE_ID || !program.executable) throw new Error("not a loader-v3 program");
    const encoder = getAddressEncoder();
    const [programData] = await getProgramDerivedAddress({
      programAddress: BPF_LOADER_UPGRADEABLE_ID,
      seeds: [encoder.encode(throwaway.address)],
    });
    const data = (await account(rpc, programData))!.data;
    const elf = data.subarray(45, 45 + Bun.file(artifact.soPath).size);
    const bytesMatch = new Bun.CryptoHasher("sha256").update(elf).digest("hex") === artifact.soSha256;
    const authorityMatch = data[12] === 1 && encoder.encode(authority.address).every((b, i) => data[13 + i] === b);
    console.log(
      `  ${throwaway.address}: loader v3, our upgrade authority ${authorityMatch}, bytes = artifact ${bytesMatch}`,
    );
    if (!bytesMatch || !authorityMatch) throw new Error("the deployed program is not the artifact under our authority");
    console.log("3b. a stranger's lamports at a program's addresses (the preflight names each case)");
    await rehearseFundedAddresses(rpc, tmp, artifact.soPath, authorityPath);

    console.log("4. the same binary at another id cannot initialize: its event authority belongs to the declared id");
    const pda = async (seed: string) =>
      (await getProgramDerivedAddress({ programAddress: throwaway.address, seeds: [seed] }))[0];
    const ix = await buildInitializeConfig({
      authority,
      admin: authority.address,
      feeRecipient: authority.address,
      params,
    });
    const slots = [await pda("config"), await pda("fee_vault"), programData];
    const accounts = (ix.accounts ?? []).map((meta, i) =>
      i >= 1 && i <= 3 ? { ...meta, address: slots[i - 1] } : i === 6 ? { ...meta, address: throwaway.address } : meta,
    );
    const wrong = await send(rpc, authority, [{ ...ix, programAddress: throwaway.address as Address, accounts }]);
    if (wrong.ok) throw new Error("initialization at a wrong id succeeded");
    console.log(`  refused as expected: ${JSON.stringify(wrong.err)}`);

    console.log("5. at the declared id, as the deploy's second half and a resume run it: bytes, then init and team");
    // A stranger funded the config address first: the program takes the account over.
    await airdrop(rpc, await configAddress(), 1_000_000n);
    const admin = await generateKeyPairSigner();
    await airdrop(rpc, admin.address, 2n * SOL);
    const keys = await Promise.all([generateKeyPairSigner(), generateKeyPairSigner(), generateKeyPairSigner()]);
    const feeRecipient = (await generateKeyPairSigner()).address;
    const finish = {
      rpc,
      feePayer: world.upgradeAuthority,
      upgradeAuthority: world.upgradeAuthority,
      admin: admin.address,
      adminSigner: admin,
      feeRecipient,
      team: keys.map((k) => k.address),
      params,
      artifact,
    };
    const tampered = join(tmp, "tampered", "brot_markets.so");
    const other = { ...finish, artifact: { soPath: tampered, soSha256: sha256File(tampered) } };
    await refusedAsync("deployed bytes that are not the artifact's", () => finishDeploy(other));
    await refusedAsync("another upgrade authority", () => finishDeploy({ ...finish, upgradeAuthority: admin }));
    if ((await finishDeploy(finish)) !== "done") throw new Error("the deploy's second half did not finish");
    const plan = { authority: world.upgradeAuthority, admin: admin.address, feeRecipient, params };
    const again = await send(rpc, world.upgradeAuthority, [await buildInitializeConfig(plan)]);
    expectRefusal(again, "AlreadyInitialized", "a second initialization");
    console.log("  refused as expected (a second initialization): AlreadyInitialized");
    if ((await finishDeploy(finish)) !== "done") throw new Error("a resume of a finished deploy did not end at once");
    const elsewhere = { ...finish, feeRecipient: admin.address };
    await refusedAsync("a resume whose plan differs from the stored config", () => finishDeploy(elsewhere));
    console.log("rehearsal: every step behaved as the deploy expects");
  } finally {
    world.surfnet.stop();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
