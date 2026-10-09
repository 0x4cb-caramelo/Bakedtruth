/**
 * Purpose: fetch the program CI built, by run id and never by name (Sprint 00's carried item): the run must be
 *          a completed, successful run of the CI workflow on `main` (the only branch that publishes
 *          `programs-<sha>`), the artifact is downloaded into an empty folder, and its SHA256SUMS is checked
 *          before anything reads the binary.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * `bun run scripts/deploy/artifact.ts <run id> <empty folder>` downloads and verifies, and prints the binary's
 * SHA-256; it never deploys. Read-only on GitHub (`gh`, logged in as the operator).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";

import { verifyArtifactDir } from "./checks";

export const REPO = "0x4cb-caramelo/Bakedtruth";

export type CiRun = {
  databaseId: number;
  headBranch: string;
  headSha: string;
  status: string;
  conclusion: string;
  event: string;
  workflowName: string;
  url: string;
};

function gh(args: string[]): string {
  const result = spawnSync("gh", [...args, "--repo", REPO], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`gh ${args.join(" ")} failed: ${result.stderr || result.error?.message}`);
  return result.stdout;
}

/** The run, refused unless it is a completed, successful CI run on main, from a push or a manual dispatch. */
export function checkedRun(runId: string): CiRun {
  if (!/^\d+$/.test(runId)) throw new Error(`a run id is a number, not ${JSON.stringify(runId)}`);
  const fields = "databaseId,headBranch,headSha,status,conclusion,event,workflowName,url";
  const run = JSON.parse(gh(["run", "view", runId, "--json", fields])) as CiRun;
  const problems = [
    run.workflowName !== "CI" && `workflow ${run.workflowName}`,
    run.headBranch !== "main" && `branch ${run.headBranch}`,
    run.status !== "completed" && `status ${run.status}`,
    run.conclusion !== "success" && `conclusion ${run.conclusion}`,
    !["push", "workflow_dispatch"].includes(run.event) && `event ${run.event}`,
  ].filter(Boolean);
  if (problems.length) throw new Error(`run ${runId} is not a successful CI run on main: ${problems.join(", ")}`);
  return run;
}

/** Downloads `programs-<head sha>` of the run into `dir` (which must be empty) and verifies SHA256SUMS. */
export function downloadArtifact(runId: string, dir: string) {
  const run = checkedRun(runId);
  if (existsSync(dir) && readdirSync(dir).length > 0) throw new Error(`${dir} is not empty`);
  mkdirSync(dir, { recursive: true });
  gh(["run", "download", runId, "--name", `programs-${run.headSha}`, "--dir", dir]);
  return { run, ...verifyArtifactDir(dir) };
}

if (import.meta.main) {
  const [runId, dir] = process.argv.slice(2);
  if (!runId || !dir) {
    console.error("usage: bun run scripts/deploy/artifact.ts <run id> <empty folder>");
    process.exit(2);
  }
  try {
    const got = downloadArtifact(runId, dir);
    console.log(`run ${got.run.databaseId} (${got.run.url}), main at ${got.run.headSha}`);
    console.log(`SHA256SUMS verified; brot_markets.so sha256 ${got.soSha256}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
