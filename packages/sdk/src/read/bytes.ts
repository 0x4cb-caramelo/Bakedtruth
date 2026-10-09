/**
 * Purpose: small byte helpers the SDK shares, written without `Buffer`, `TextEncoder` or any Node or
 *          DOM API, so they run the same in a browser, in Bun and under React Native's engine.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */

/** Bytes from 2n hex characters (an optional `0x` prefix is accepted). */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) throw new RangeError(`not hex: ${hex}`);
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(2 * i, 2 * i + 2), 16);
  return out;
}

/** Lower-case hex of `bytes`, no prefix. */
export function bytesToHex(bytes: Uint8Array | ReadonlyArray<number>): string {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

/** The two byte arrays hold the same bytes. */
export function bytesEqual(a: Uint8Array | ReadonlyArray<number>, b: Uint8Array | ReadonlyArray<number>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** True when every byte is zero (an unused feed id, an empty note hash). */
export const allZero = (bytes: Uint8Array | ReadonlyArray<number>): boolean => bytes.every((byte) => byte === 0);
