/**
 * Purpose: one JSON line per event on stdout, with a time stamp. The RPC URL and the keypair never reach it: the
 *          caller passes only fields it has checked (an origin, a public address, a signature, a program error).
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 */
export function log(event: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...fields }));
}
