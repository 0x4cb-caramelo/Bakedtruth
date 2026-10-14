/**
 * Purpose: the site's readers of the program's transactions on a real v1 transaction (Sprint 16, the review's F1),
 *          served as devnet served it (tests/fixtures/tx-v1): the events of a transaction, the campaign's activity and
 *          the failed program of a landed transaction each ask for the SDK's MAX_TRANSACTION_VERSION and read it; a
 *          transaction a node cannot return in that version (-32015) is `null`, kept as unread, never guessed.
 * Version: 0.1.0
 * Sprint:  16 (the review's F1)
 */
import { afterAll, describe, expect, test } from "bun:test";
import {
  createSolanaRpc,
  SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION,
  SolanaError,
} from "@solana/kit";
import { MAX_TRANSACTION_VERSION, type SolanaRpc } from "@brot/sdk/read";

import { readActivity } from "../../app/features/campaign-page/activity";
import { failedProgram } from "../../app/features/entry/landed";
import { eventsIn } from "../../app/features/my-entries/events-in";
import { serveV1, V1 } from "../sdk/tx-v1-node";

const node = serveV1();
afterAll(() => node.close());
const rpc = createSolanaRpc(node.url);
const sig = V1.index.signature;

describe("the site's transaction readers ask for every version the cluster serves", () => {
  test("a real v1 transaction reads: its events, the activity, the program whose instruction failed", async () => {
    expect(await eventsIn(rpc, sig)).toEqual([]); // read, and not this program's
    expect(await readActivity(rpc, "4MxEr7W5f9xtajcTTpTTd5wfdBmwrF72j2NMg6YzXgMo")).toEqual([]);
    const failed = await failedProgram(rpc, sig, { InstructionError: [0, { Custom: 1 }] });
    expect(failed).toBe("4MxEr7W5f9xtajcTTpTTd5wfdBmwrF72j2NMg6YzXgMo");
    expect(node.asked).toEqual([MAX_TRANSACTION_VERSION, MAX_TRANSACTION_VERSION, MAX_TRANSACTION_VERSION]);
  });

  test("a transaction of a version this client cannot read is null: unread, never guessed", async () => {
    const newer = {
      getTransaction: () => ({
        send: async () => {
          throw new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION, {
            __serverMessage: "Transaction version (2) is not supported by the requesting client.",
          });
        },
      }),
    } as unknown as SolanaRpc;
    expect(await eventsIn(newer, sig)).toBeNull();
  });
});
