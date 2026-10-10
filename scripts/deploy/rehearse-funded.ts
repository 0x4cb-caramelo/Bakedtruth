/**
 * Purpose: rehearse what a stranger's lamports do to a deploy (Sprint 05 deploy review, F4), on the offline
 *          surfnet, with the real `solana program deploy` at throwaway ids: a funded ProgramData address makes the
 *          deploy fail for good; a funded program address makes it fail until the program keypair's holder moves
 *          the lamports out, after which it deploys. The preflight names each case before anything is sent.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";

import { getAddressEncoder, getProgramDerivedAddress } from "@solana/kit";

import { BPF_LOADER_UPGRADEABLE_ID } from "@brot/sdk/read";

import { writeThrowawayKeypair } from "../validator/keys";
import { account, airdrop, type Rpc } from "../validator/rpc";
import { deployArgv } from "./checks";
import { standing, standingProblem } from "./preflight";

const programDataOf = async (program: string) =>
  (
    await getProgramDerivedAddress({
      programAddress: BPF_LOADER_UPGRADEABLE_ID,
      seeds: [getAddressEncoder().encode(program as never)],
    })
  )[0];

/** The preflight's verdict on a throwaway id, as it would be for the declared one. */
async function preflight(rpc: Rpc, program: string): Promise<string | null> {
  const [p, d] = await Promise.all([account(rpc, program), account(rpc, await programDataOf(program))]);
  return standingProblem({ program: standing(p), programData: standing(d), config: "absent" }, false);
}

const lastLine = (r: { stdout: string; stderr: string }) =>
  `${r.stderr}${r.stdout}`
    .split("\n")
    .filter((l) => /in use|Error/.test(l))
    .pop() ?? "failed";

export async function rehearseFundedAddresses(rpc: Rpc, tmp: string, so: string, authorityPath: string) {
  const authority = { path: authorityPath };
  const deploy = (programPath: string) => {
    const argv = deployArgv(
      { so, programKeypair: programPath, upgradeAuthority: authority.path, feePayer: authority.path },
      rpc.url,
    );
    return spawnSync(argv[0], argv.slice(1), { encoding: "utf8" });
  };

  const blockedPath = join(tmp, "blocked-program.json");
  const blocked = await writeThrowawayKeypair(blockedPath);
  await airdrop(rpc, await programDataOf(blocked.address), 1_000_000n);
  const named = await preflight(rpc, blocked.address);
  if (!named?.includes("can never be deployed")) throw new Error("the preflight missed a funded ProgramData address");
  const first = deploy(blockedPath);
  if (first.status === 0) throw new Error("a funded ProgramData address did not block the deploy");
  console.log(`  refused as expected (a funded ProgramData address, for good): ${lastLine(first).trim()}`);

  const fundedPath = join(tmp, "funded-program.json");
  const funded = await writeThrowawayKeypair(fundedPath);
  await airdrop(rpc, funded.address, 1_000_000n);
  if (!(await preflight(rpc, funded.address))?.includes("move the lamports out")) {
    throw new Error("the preflight missed a funded program address");
  }
  const second = deploy(fundedPath);
  if (second.status === 0) throw new Error("a funded program address did not block the deploy");
  console.log(`  refused as expected (a funded program address): ${lastLine(second).trim()}`);
  const holder = (await account(rpc, funded.address))!;
  const drain = spawnSync(
    "solana",
    ["transfer", "--from", fundedPath, "--fee-payer", authority.path, "--allow-unfunded-recipient"].concat([
      (await writeThrowawayKeypair(join(tmp, "sink.json"))).address,
      "ALL",
      "--url",
      rpc.url,
      "--commitment",
      "confirmed",
    ]),
    { encoding: "utf8" },
  );
  if (drain.status !== 0) throw new Error(`moving ${holder.lamports} lamports out failed: ${drain.stderr}`);
  const third = deploy(fundedPath);
  if (third.status !== 0) throw new Error(`the deploy failed after the lamports were moved out: ${lastLine(third)}`);
  console.log(
    "  the program keypair's holder moved the lamports out (solana transfer ... ALL); the deploy then landed",
  );
}
