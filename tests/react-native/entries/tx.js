/**
 * Purpose: the transaction half under Hermes: every export of `@brot/sdk/tx` loaded as an app loads it
 *          on first use; the random campaign id refused with no `crypto.getRandomValues` (Hermes has
 *          none); and one builder, `sweep_fees`, run once a SHA-256 digest exists, whose config slot
 *          run.mjs compares with the PDA it derives in Node.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 *
 * An error while any module initialises is uncaught, so the VM exits non-zero and the check fails.
 */
import * as tx from "@brot/sdk/tx";

import { installSha256Digest } from "./digest-shim";

/** Any valid address: the fee recipient is not read, only placed in its slot. */
const FEE_RECIPIENT = "Vote111111111111111111111111111111111111111";

console.log(`tx: module loaded, ${Object.keys(tx).length} exports`);
try {
  console.log(`tx: random campaign id drawn WITHOUT crypto.getRandomValues = ${tx.randomCampaignId()}`);
} catch (error) {
  console.log(`tx: random campaign id without crypto.getRandomValues refused (${error && error.message})`);
}

installSha256Digest();
tx.buildSweepFees({ feeRecipient: FEE_RECIPIENT })
  .then((ix) => {
    const slots = ix.accounts.length;
    console.log(`tx: sweep_fees built with a SHA-256 digest: ${slots} slots, ${ix.data.length} data bytes`);
    console.log(`tx: sweep_fees config slot = ${ix.accounts[0].address}`);
  })
  .catch((error) => console.log(`tx: FAILED ${error && error.message}`));
