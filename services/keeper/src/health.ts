/**
 * Purpose: GET /healthz on a loopback address only: the keeper's last full cycle (open campaigns, what it tried,
 *          its SOL balance), the cycle count and the last cycle's error, if any. Read-only; it never triggers work.
 *          POST /restart is routed only when a restart handler is given (the primary in Sprint 07); every other
 *          path answers 404.
 * Version: 0.2.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import type { CycleReport } from "./cycle";
import { RESTART_PATH } from "./restart";

export type KeeperState = {
  cluster: string;
  startedAt: string;
  cycles: number;
  last: CycleReport | null;
  lastError: string | null;
};

export function startHealth(
  host: string,
  port: number,
  state: () => KeeperState,
  restart?: (request: Request) => Promise<Response>,
) {
  return Bun.serve({
    hostname: host,
    port,
    fetch(request) {
      const { pathname } = new URL(request.url);
      if (pathname === "/healthz") return Response.json(state());
      if (pathname === RESTART_PATH && restart) return restart(request);
      return new Response("not found", { status: 404 });
    },
  });
}
