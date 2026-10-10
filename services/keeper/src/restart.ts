/**
 * Purpose: POST /restart of the primary keeper. A request is accepted only when its HMAC-SHA256 over
 *          `${timestamp}\n${body}` matches (constant-time compare) and its timestamp is within 60 s of now.
 *          An accepted request writes the flag file that a root-owned systemd path unit watches; the keeper
 *          itself never restarts anything. A refusal writes nothing and names no secret or signature.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { writeFile } from "node:fs/promises";

export const RESTART_PATH = "/restart";

const MAX_SKEW_S = 60;

export function signRestart(secret: Uint8Array, timestamp: string, body: string): string {
  return createHmac("sha256", secret).update(`${timestamp}\n${body}`).digest("hex");
}

export function verifyRestart(input: {
  secret: Uint8Array;
  timestamp: string | null;
  signature: string | null;
  body: string;
  now: number;
}): { ok: true } | { ok: false; reason: string } {
  if (!input.timestamp || !input.signature) return { ok: false, reason: "missing headers" };
  const seconds = Number(input.timestamp);
  if (!/^\d+$/.test(input.timestamp) || Math.abs(input.now / 1000 - seconds) > MAX_SKEW_S) {
    return { ok: false, reason: "stale or future timestamp" };
  }
  const expected = Buffer.from(signRestart(input.secret, input.timestamp, input.body), "utf8");
  const given = Buffer.from(input.signature, "utf8");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: "bad signature" };
  }
  return { ok: true };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const writeFlag = (path: string, text: string) => writeFile(path, text, { mode: 0o600 });

export async function handleRestart(
  request: Request,
  deps: {
    secret: Uint8Array;
    flagPath: string;
    now: () => number;
    write?: (path: string, text: string) => Promise<void>;
  },
): Promise<Response> {
  if (request.method !== "POST") return json(405, { error: "method not allowed" });
  const body = await request.text();
  const timestamp = request.headers.get("x-brot-timestamp");
  const verdict = verifyRestart({
    secret: deps.secret,
    timestamp,
    signature: request.headers.get("x-brot-signature"),
    body,
    now: deps.now(),
  });
  if (!verdict.ok) return json(401, { error: verdict.reason });
  await (deps.write ?? writeFlag)(deps.flagPath, timestamp ?? "");
  return json(202, { accepted: true });
}
