/**
 * Purpose: the second read of a PRICE campaign (proposal §2.11, Sprint 07): the sponsored or proof price account is
 *          read through the primary's RPC and through RPC B, each through the SDK's price reader (owner first, then
 *          the bytes), and the price, confidence, exponent, publish time and feed are compared. A difference is a
 *          mismatch for the review queue. Other kinds are out of this slice (their metric re-read is not built).
 * Version: 0.1.1 (superseded in the standby's pass by second-check.ts, which reads the proof transaction itself)
 * Sprint:  07 (standby keeper and watchdog)
 *
 * Since the Sprint 07 carry-over the standby's pass no longer calls this: it compares a resolution with the signed
 * message of the transaction that wrote its proof, and the other kinds through the SDK's `recheck`. This comparison
 * of two providers' current reading of an account stays, with its tests, as a probe of provider agreement.
 *
 * Caveat: the feed publishes about every 62 s, so two reads can see different publish times for honest reasons. A
 * different publish time is therefore `match: null` (not checked), never a mismatch. With the same publish time, a
 * difference is re-read at B once after `retryMs`; only a difference that survives is a mismatch. A decode refusal
 * or a missing account is also `match: null`.
 */
import { getBase64Encoder, type Address } from "@solana/kit";
import { ReaderKind, readPriceUpdate, type PriceReading, type SolanaRpc } from "@brot/sdk/read";

export type SecondReadResult = { match: true } | { match: false; detail: string } | { match: null; detail: string };

/** True for a campaign whose outcome is a price touch: the only kind this slice re-reads. */
export const isPriceCampaign = (campaign: { kind: ReaderKind }): boolean => campaign.kind === ReaderKind.PriceTouch;

type Fetched = { owner: string; data: Uint8Array } | null;

async function fetchAccount(rpc: SolanaRpc, account: Address): Promise<Fetched> {
  const { value } = await rpc.getAccountInfo(account, { encoding: "base64" }).send();
  if (!value) return null;
  return { owner: value.owner, data: new Uint8Array(getBase64Encoder().encode(value.data[0])) };
}

/** The reading, or a reason it could not be taken (a refusal of the reader, named by its message). */
function readAt(account: Fetched, feedId: Uint8Array): PriceReading | string {
  if (!account) return "account missing";
  try {
    return readPriceUpdate(account.owner, account.data, feedId);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

const sameReading = (a: PriceReading, b: PriceReading) =>
  a.price === b.price &&
  a.conf === b.conf &&
  a.exponent === b.exponent &&
  a.publishTime === b.publishTime &&
  a.feedId.every((byte, i) => byte === b.feedId[i]);

const detailOf = (a: PriceReading, b: PriceReading) =>
  `primary price ${a.price} conf ${a.conf} publish ${a.publishTime}; RPC B price ${b.price} conf ${b.conf} publish ${b.publishTime}`;

export async function secondRead(
  rpcA: SolanaRpc,
  rpcB: SolanaRpc,
  metricAccount: Address,
  feedId: Uint8Array,
  retryMs = 2_000,
): Promise<SecondReadResult> {
  const [fromA, fromB] = await Promise.all([fetchAccount(rpcA, metricAccount), fetchAccount(rpcB, metricAccount)]);
  const a = readAt(fromA, feedId);
  const b = readAt(fromB, feedId);
  if (typeof a === "string" || typeof b === "string") {
    return {
      match: null,
      detail: `not checked: primary ${typeof a === "string" ? a : "ok"}, RPC B ${typeof b === "string" ? b : "ok"}`,
    };
  }
  if (sameReading(a, b)) return { match: true };
  if (a.publishTime !== b.publishTime) {
    return { match: null, detail: "not checked: the feed published between the two reads" };
  }
  await new Promise((done) => setTimeout(done, retryMs));
  const again = readAt(await fetchAccount(rpcB, metricAccount), feedId);
  if (typeof again === "string") return { match: null, detail: `not checked: RPC B on retry ${again}` };
  if (sameReading(a, again)) return { match: true };
  return { match: false, detail: `${detailOf(a, again)} (differs after a ${retryMs} ms re-read at RPC B)` };
}
