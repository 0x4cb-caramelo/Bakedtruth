/**
 * Purpose: the signed-bytes summary of `user_link_referrer` (Sprint 14): trusted only as the IDL shapes it (33 bytes
 *          of data, five accounts, the referee a writable signer and the link writable, nothing after them), and said
 *          in words from its own bytes: the referrer, the referee, once and for good, and the link's rent, which is
 *          never returned. Needs no binary.
 *          Filter: `bun test tests/ -t "the summary of a referral link"`.
 * Version: 0.1.1 (review fix F7 of Sprint 14, lane L14B: the rent counted in lamportsAtMost and named)
 * Sprint:  14 (referral), lane L14A
 */
import { describe, expect, test } from "bun:test";
import {
  AccountRole,
  appendTransactionMessageInstructions,
  blockhash,
  compileTransaction,
  createTransactionMessage,
  generateKeyPairSigner,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  type Instruction,
} from "@solana/kit";

import * as T from "@brot/sdk/tx";

const withRole = (ix: Instruction, index: number, role: AccountRole): Instruction => ({
  ...ix,
  accounts: ix.accounts!.map((a, i) => (i === index ? { ...a, role } : a)),
});
const textOf = (ix: Instruction) => T.summarizeInstructions([ix]).items[0].text;

async function aLink() {
  const [referee, referrer] = [await generateKeyPairSigner(), (await generateKeyPairSigner()).address];
  return { referee, referrer, ix: await T.buildUserLinkReferrer({ referee, referrer }) };
}

describe("the summary of a referral link", () => {
  test("a link the SDK builds is trusted and said in words from its bytes", async () => {
    const { referee, referrer, ix } = await aLink();
    const summary = T.summarizeInstructions([ix]);
    expect(summary.trusted).toBe(true);
    const [item] = summary.items;
    expect(item.name).toBe("UserLinkReferrer");
    expect(item.text).toBe(
      `Record ${referrer} as the wallet that referred ${referee.address}, once and for good (no instruction changes or removes the link); ${referee.address} pays the rent of the link's account, at most 0.001559040 SOL, which is never returned`,
    );
    // Review fix F7: the rent never comes back, so it counts in what the link takes from the referee's wallet. With
    // no cluster figure read, the runtime's default rent bounds it: (96 + 128) bytes × 6,960 lamports.
    expect([item.lamportsAtMost, summary.lamportsAtMost]).toEqual([1_559_040n, 1_559_040n]);
  });

  test("a link names and counts the rent the screen read from its cluster", async () => {
    const { referee, ix } = await aLink();
    // Devnet's rent on 2026-10-08 (TP 3.4.4): 5,080 lamports a byte, so 1,137,920 for the link's 96 bytes.
    const [item] = T.summarizeInstructions([ix], { context: { linkRent: 1_137_920n } }).items;
    expect(item.text).toContain(`${referee.address} pays the rent of the link's account, 0.001137920 SOL, which is`);
    expect(item.lamportsAtMost).toBe(1_137_920n);
  });

  test("a link of another shape is not trusted", async () => {
    const { ix } = await aLink();
    expect(textOf(withRole(ix, 1, AccountRole.READONLY))).toContain("account 2 is read-only, not writable");
    expect(textOf(withRole(ix, 0, AccountRole.WRITABLE))).toContain("account 1 is writable, not writable signer");
    expect(textOf(withRole(ix, 0, AccountRole.READONLY_SIGNER))).toContain(
      "account 1 is read-only signer, not writable signer",
    );
    expect(textOf(withRole(ix, 2, AccountRole.WRITABLE))).toContain("account 3 is writable, not read-only");
    const trailing = { ...ix, accounts: [...ix.accounts!, { ...ix.accounts![1] }] };
    expect(textOf(trailing)).toContain("carries accounts the instruction does not take");
    const short = { ...ix, accounts: ix.accounts!.slice(0, -1) };
    expect(T.summarizeInstructions([short]).trusted).toBe(false);
    const longer = { ...ix, data: Uint8Array.of(...ix.data!, 0) };
    expect(textOf(longer)).toContain("the data is not the instruction's size");
    const shorter = { ...ix, data: ix.data!.slice(0, -1) };
    expect(T.summarizeInstructions([shorter]).trusted).toBe(false);
  });

  test("the bytes a referee signs: trusted when the referee pays the fee, refused for another signer", async () => {
    const { referee, ix } = await aLink();
    const lifetime = { blockhash: blockhash("11111111111111111111111111111111"), lastValidBlockHeight: 0n };
    const message = pipe(
      createTransactionMessage({ version: 0 }),
      (m) => setTransactionMessageFeePayerSigner(referee, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
      (m) => appendTransactionMessageInstructions([ix], m),
    );
    const bytes = compileTransaction(message).messageBytes;
    const signed = T.summarizeMessage(bytes, { signer: referee.address });
    expect([signed.trusted, signed.signatures, signed.feePayer]).toEqual([true, 1, referee.address]);
    expect(signed.lines[1]).toContain(`as the wallet that referred ${referee.address}`);
    const other = (await generateKeyPairSigner()).address;
    expect(T.summarizeMessage(bytes, { signer: other }).trusted).toBe(false);
  });
});
