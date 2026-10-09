/**
 * Purpose: run a rehearsal script inside a network namespace that has only loopback (`unshare -rn`), so the
 *          local cluster and the script can talk on 127.0.0.1 and nothing else can leave the machine: no
 *          devnet, no mainnet, no version check. The guarantee comes from the kernel, not from a URL check.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Call `isolateOrExit(import.meta.path)` first thing: outside the namespace it re-runs the same script inside
 * one and exits with its status; inside (BROT_ISOLATED=1) it returns. Where unprivileged user namespaces are
 * not allowed (some CI images), it stops with the reason; `--no-isolation` skips it explicitly, and the
 * script then still refuses any non-local RPC.
 */
import { spawnSync } from "node:child_process";

/** True once the process runs inside the loopback-only namespace. */
export const isIsolated = () => process.env.BROT_ISOLATED === "1";

export function isolateOrExit(scriptPath: string): void {
  if (isIsolated() || process.argv.includes("--no-isolation")) return;
  const args = process.argv.slice(2);
  const inner = 'ip link set lo up 2>/dev/null; exec "$0" run "$@"';
  const result = spawnSync("unshare", ["-rn", "sh", "-c", inner, process.execPath, scriptPath, ...args], {
    stdio: "inherit",
    env: { ...process.env, BROT_ISOLATED: "1" },
  });
  if (result.error) {
    console.error(`cannot isolate the network (${result.error.message}); rerun with --no-isolation to go without`);
    process.exit(2);
  }
  process.exit(result.status ?? 1);
}
