/**
 * Purpose: a minimal `crypto.subtle.digest("SHA-256")` for the Hermes CLI, which has no `crypto` at
 *          all, so the check can show that PDA derivation is the one thing the SDK's read path needs
 *          from Web Crypto, and that with SHA-256 alone it gives the program's real addresses.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 *
 * Not a polyfill for the app: it implements one algorithm, nothing else of `crypto`. The app chooses
 * its own (knowledge-base/tecnologia/sdk-react-native.md lists what it needs and when).
 */
import { sha256 } from "@noble/hashes/sha2.js";

export function installSha256Digest() {
  const digest = async (algorithm, data) => {
    const name = typeof algorithm === "string" ? algorithm : algorithm && algorithm.name;
    if (name !== "SHA-256") throw new Error(`the shim digests SHA-256 only, not ${name}`);
    const bytes = ArrayBuffer.isView(data)
      ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
      : new Uint8Array(data);
    const hash = sha256(bytes);
    return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
  };
  globalThis.crypto = { subtle: { digest } };
}
