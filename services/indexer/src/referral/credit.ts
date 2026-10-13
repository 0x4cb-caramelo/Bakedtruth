/**
 * Purpose: whether a payout line can be credited at all (Sprint 14, lane L14R; second review, R2): a referee may name
 *          any address as its referrer, and a line the runtime always refuses would stop every batch behind it. The
 *          static guard, always on: the runtime demotes reserved keys (every sysvar, the builtin and native programs,
 *          the precompiles) to read-only, so a transfer can never credit one; an executable account is a program, not
 *          a wallet; the incinerator burns what it receives; and the operations wallet would pay itself. The routine
 *          then asks a `CreditCheck` (scripts/referral/simulate.ts simulates each transfer at `finalized`) about the
 *          rest. A line refused either way is held for a person: carried, listed in the summary, never in the script.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */

/** Ids a transfer can never credit, or must not: builtin and native programs, precompiles, the incinerator. */
export const UNCREDITABLE: ReadonlySet<string> = new Set([
  "11111111111111111111111111111111",
  "1nc1nerator11111111111111111111111111111111",
  "AddressLookupTab1e1111111111111111111111111",
  "BPFLoader1111111111111111111111111111111111",
  "BPFLoader2111111111111111111111111111111111",
  "BPFLoaderUpgradeab1e11111111111111111111111",
  "ComputeBudget111111111111111111111111111111",
  "Config1111111111111111111111111111111111111",
  "Ed25519SigVerify111111111111111111111111111",
  "Feature111111111111111111111111111111111111",
  "KeccakSecp256k11111111111111111111111111111",
  "LoaderV411111111111111111111111111111111111",
  "NativeLoader1111111111111111111111111111111",
  "Secp256r1SigVerify1111111111111111111111111",
  "Stake11111111111111111111111111111111111111",
  "StakeConfig11111111111111111111111111111111",
  "Vote111111111111111111111111111111111111111",
  "ZkE1Gama1Proof11111111111111111111111111111",
  "ZkTokenProof1111111111111111111111111111111",
]);

/** Asks whether each line's transfer would land; answers each wallet that would not, with why. */
export type CreditCheck = (lines: readonly { wallet: string; amount: bigint }[]) => Promise<Map<string, string>>;

/** Why `wallet` can never be credited by the operations wallet `ops`, or `null` when nothing static says so. */
export function staticRefusal(wallet: string, account: { executable: boolean } | null, ops: string): string | null {
  if (wallet.startsWith("Sysvar")) return "a sysvar: the runtime never lets a transfer credit it";
  if (UNCREDITABLE.has(wallet)) return "a builtin program, a precompile or the incinerator: never credited";
  if (account?.executable) return "an executable account: a program, not a wallet";
  if (wallet === ops) return "the operations wallet itself";
  return null;
}
