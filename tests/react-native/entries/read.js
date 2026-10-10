/**
 * Purpose: the read half under Hermes: every export of `@brot/sdk/read` loaded as an app loads it on
 *          first use, the runtime's globals reported, and the config PDA derived twice: with no
 *          `crypto` (Hermes has none), which Kit refuses, and with a SHA-256 digest installed, which
 *          must give the address run.mjs derives in Node.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 */
import * as read from "@brot/sdk/read";

import { installSha256Digest } from "./digest-shim";

const GLOBALS = ["crypto", "TextEncoder", "TextDecoder", "fetch", "WebSocket", "EventTarget", "AbortController"];

const describe = (error) => {
  const code = error && error.context && error.context.__code;
  const message = String((error && error.message) || error)
    .split("\n")[0]
    .slice(0, 160);
  return code === undefined ? message : `Kit error ${code}: ${message}`;
};

console.log(`read: module loaded, ${Object.keys(read).length} exports`);
console.log(`read: globals ${GLOBALS.map((name) => `${name}=${typeof globalThis[name]}`).join(" ")}`);

read
  .configAddress()
  .then(
    (address) => console.log(`read: config PDA derived WITHOUT crypto.subtle = ${address}`),
    (error) => {
      console.log(`read: config PDA without crypto.subtle refused (${describe(error)})`);
      installSha256Digest();
      return read.configAddress().then((address) => console.log(`read: config PDA with a SHA-256 digest = ${address}`));
    },
  )
  .catch((error) => console.log(`read: FAILED ${describe(error)}`));
