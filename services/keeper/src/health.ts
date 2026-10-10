/**
 * Purpose: GET /healthz on a loopback address only: the keeper's last full cycle (open campaigns, what it tried,
 *          its SOL balance), the cycle count and the last cycle's error, if any. Read-only; it never triggers work.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 */
import type { CycleReport } from "./cycle";

export type KeeperState = {
  cluster: string;
  startedAt: string;
  cycles: number;
  last: CycleReport | null;
  lastError: string | null;
};

export function startHealth(host: string, port: number, state: () => KeeperState) {
  return Bun.serve({
    hostname: host,
    port,
    fetch(request) {
      if (new URL(request.url).pathname !== "/healthz") return new Response("not found", { status: 404 });
      return Response.json(state());
    },
  });
}
