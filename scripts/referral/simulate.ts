/**
 * Purpose: the credit check the prepare command gives the routine (Sprint 14, lane L14R; second review, R2): each
 *          line's transfer as the signing file sends it (a System Program transfer from the operations wallet, then the
 *          payout memo) simulated at `finalized` with signatures not verified and the blockhash replaced, so a line the
 *          runtime would refuse (a read-only key, a program, an account it cannot credit) is held for a person instead
 *          of failing in the signing file. The transaction is built only to be simulated: unsigned, never sent. It
 *          lives here, with the commands, because the indexer itself never builds a transaction.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Instruction,
} from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";

import type { CreditCheck } from "../../services/indexer/src/referral/credit";
import { MEMO_PREFIX } from "../../services/indexer/src/referral/rules";

const SYSTEM_PROGRAM = address("11111111111111111111111111111111");
const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const json = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === "bigint" ? `${v}` : v));

/** `SystemInstruction::Transfer` of `lamports` from `from` to `to`, and the payout memo after it. */
export function payoutInstructions(from: string, to: string, lamports: bigint, memo: string): Instruction[] {
  const data = new Uint8Array(12);
  new DataView(data.buffer).setUint32(0, 2, true);
  new DataView(data.buffer).setBigUint64(4, lamports, true);
  const accounts = [
    { address: address(from), role: AccountRole.WRITABLE_SIGNER },
    { address: address(to), role: AccountRole.WRITABLE },
  ];
  return [
    { programAddress: SYSTEM_PROGRAM, accounts, data },
    { programAddress: MEMO_PROGRAM, data: new TextEncoder().encode(memo) },
  ];
}

/** Simulates each line's payout from `ops`; answers each wallet whose transfer would fail, with the error. */
export function simulationCheck(rpc: SolanaRpc, ops: string, timeoutMs = 20_000): CreditCheck {
  return async (lines) => {
    const signal = () => AbortSignal.timeout(timeoutMs);
    const { value: lifetime } = await rpc
      .getLatestBlockhash({ commitment: "finalized" })
      .send({ abortSignal: signal() });
    const refused = new Map<string, string>();
    for (const line of lines) {
      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayer(address(ops), m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
        (m) =>
          appendTransactionMessageInstructions(
            payoutInstructions(ops, line.wallet, line.amount, `${MEMO_PREFIX}:0:0`),
            m,
          ),
      );
      const wire = getBase64EncodedWireTransaction(compileTransaction(message));
      const config = {
        encoding: "base64",
        sigVerify: false,
        replaceRecentBlockhash: true,
        commitment: "finalized",
      } as const;
      const { value } = await rpc.simulateTransaction(wire, config).send({ abortSignal: signal() });
      if (value.err !== null) refused.set(line.wallet, `its transfer fails in simulation: ${json(value.err)}`);
    }
    return refused;
  };
}
