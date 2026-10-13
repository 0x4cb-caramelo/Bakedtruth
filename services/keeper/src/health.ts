/**
 * Purpose: GET /healthz on a loopback address only (TP §3.5, "Health"): the keeper's last full cycle (what it tried,
 *          its SOL balance, the pending settlement work, `open_campaigns` against `max_open_campaigns`, the SOL held
 *          in the vaults, Pyth's programs), the mode and the settlement switch, the cycle count and the last cycle's
 *          error, if any. Every number that can pass 2^53 is a string, so the JSON never loses a lamport. Read-only;
 *          it never triggers work. POST /restart is routed only when a restart handler is given (the primary in
 *          Sprint 07); every other path answers 404.
 * Version: 0.3.0 (Sprint 07 carry-over: the pending items and max_open_campaigns usage, Sprint 06 DoD)
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
  /** primary or standby. */
  mode?: string;
  /** KEEPER_SETTLE: whether this keeper settles and pays (off by default). */
  settle?: "on" | "off";
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
    // No development error page, whatever NODE_ENV says: a throw never shows a stack trace (Sprint 08 security review).
    development: false,
    fetch(request) {
      const { pathname } = new URL(request.url);
      if (pathname === "/healthz") return Response.json(state());
      if (pathname === RESTART_PATH && restart) return restart(request);
      return new Response("not found", { status: 404 });
    },
  });
}
