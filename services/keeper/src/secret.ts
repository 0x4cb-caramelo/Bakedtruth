/**
 * Purpose: loads the HMAC secret of POST /restart from the file named by KEEPER_RESTART_SECRET_FILE (a systemd
 *          credential, root-owned, 0600). The file is read once at start; the value is never logged or echoed.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { readFile } from "node:fs/promises";

export async function loadRestartSecret(path: string): Promise<Uint8Array> {
  const text = (await readFile(path, "utf8")).trim();
  if (text.length < 32) throw new Error("the restart secret must be at least 32 characters");
  return new TextEncoder().encode(text);
}
