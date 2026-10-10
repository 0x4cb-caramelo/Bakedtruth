/**
 * Purpose: a campaign's whole life driven through the site tests' recording RPC (fake-chain.ts), so every transaction
 *          is in the RPC's history and a wallet's page can read its own events back: a paid BTC/USD opening by a
 *          non-team wallet, joins, the resolution (NO after the deadline, or a stale-feed void), each baker's tally,
 *          finalize after the six-hour window, and the permissionless settlement (entries, creator share, prize, fee,
 *          close). Each step is the SDK's builder against the program in LiteSVM; nothing is injected.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import {
  AccountRole,
  appendTransactionMessageInstructions,
  createSolanaRpc,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Address,
  type Instruction,
  type KeyPairSigner,
} from "@solana/kit";

import { decodeCampaign, decodeEntry, entryAddress, entryTotal, Side } from "@brot/sdk/read";
import {
  buildCloseCampaign,
  buildCollectFee,
  buildFinalizeCampaign,
  buildJoinCampaign,
  buildOpenCampaign,
  buildResolveCampaign,
  buildSettleCreatorShare,
  buildSettleEntry,
  buildSettlePrize,
  buildTallyLateJoins,
} from "@brot/sdk/tx";

import { BTC_PRICE, newId } from "../brot/flows";
import * as P from "../brot/program";
import { setPriceAccount, setTime, type World } from "../brot/setup";
import type { FakeChain } from "./fake-chain";
import { rawOf } from "./support";

export type Landed = { signature: string; err: unknown };

/** Signs `ixs` with `payer` (and any other signer the instructions carry) and lands them through the chain's RPC. */
export async function sendVia(chain: FakeChain, payer: KeyPairSigner, ixs: Instruction[]): Promise<Landed> {
  const rpc = createSolanaRpc(chain.url);
  const { value } = await rpc.getLatestBlockhash({ commitment: "confirmed" }).send();
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(payer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(value, m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  const signed = await signTransactionMessageWithSigners(message);
  const signature = await rpc.sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64" }).send();
  const { value: statuses } = await rpc.getSignatureStatuses([signature]).send();
  return { signature, err: statuses[0]?.err ?? null };
}

/** `sendVia` that must land. */
export async function landVia(chain: FakeChain, payer: KeyPairSigner, ixs: Instruction[]): Promise<string> {
  const landed = await sendVia(chain, payer, ixs);
  if (landed.err !== null) {
    throw new Error(
      `expected success, got ${JSON.stringify(landed.err, (_, v) => (typeof v === "bigint" ? `${v}` : v))}`,
    );
  }
  return landed.signature;
}

/** A paid opening (US$500) of BTC/USD above 110% of its captured price, seven days out, by `creator`. */
export async function openVia(w: World, chain: FakeChain, creator: KeyPairSigner) {
  const args = {
    id: newId(),
    kind: P.ReaderKind.PriceTouch,
    direction: P.Direction.Above,
    feedId: P.BTC_USD_FEED_ID,
    target: (BTC_PRICE * 11n) / 10n,
    deadlineAt: w.client.svm.getClock().unixTimestamp + 7n * P.DAY,
    openingUsd: 500n,
    maxLamports: 10n * P.SOL,
    epoch: 0n,
    expectedParamsVersion: 0,
  };
  await landVia(chain, creator, [await buildOpenCampaign({ creator, args })]);
  return { id: args.id, campaign: await P.campaignPda(args.id) };
}

/** One join of `amount` lamports on `side`, signed and paid by `baker`. */
export async function joinVia(
  w: World,
  chain: FakeChain,
  baker: KeyPairSigner,
  campaign: Address,
  side: Side,
  amount: bigint,
) {
  const held = w.client.svm.getAccount(await entryAddress(campaign, baker.address));
  const entry =
    held.exists && held.data.length > 0 ? decodeEntry(rawOf(w, await entryAddress(campaign, baker.address))) : null;
  const ix = await buildJoinCampaign({
    baker,
    campaign,
    metricAccount: decodeCampaign(rawOf(w, campaign)).metricAccount,
    side,
    amount,
    minReturnBps: 0,
    expectedEntryTotal: entryTotal(entry),
    joinIndex: entry?.joinCount ?? 0,
  });
  return landVia(chain, baker, [ix]);
}

/**
 * Past the deadline and the 60-second proof delay, with the sponsored BTC/USD account either published after the
 * deadline below the target (`no`: the program records NO) or last published long before it (`stale`: Void, StaleFeed).
 */
export async function resolveVia(
  w: World,
  chain: FakeChain,
  keeper: KeyPairSigner,
  campaign: Address,
  how: "no" | "stale",
) {
  const c = decodeCampaign(rawOf(w, campaign));
  setTime(w.client, c.deadlineAt + 120n);
  const publishTime = how === "no" ? c.deadlineAt + 100n : c.deadlineAt - 3n * P.HOUR;
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", {
    price: BTC_PRICE,
    conf: 0n,
    publishTime,
    postedSlot: w.client.svm.getClock().slot,
  });
  return landVia(chain, keeper, [buildResolveCampaign({ campaign, metricAccount: c.metricAccount })]);
}

/** Every baker's joins tallied, then (unless `tallyOnly`) the window run out and the campaign finalized. */
export async function finalizeVia(
  w: World,
  chain: FakeChain,
  keeper: KeyPairSigner,
  campaign: Address,
  bakers: Address[],
  options: { tallyOnly?: boolean } = {},
) {
  for (const baker of bakers) {
    const entry = decodeEntry(rawOf(w, await entryAddress(campaign, baker)));
    if (entry.joinsTallied === entry.joinCount) continue;
    const ix = await buildTallyLateJoins({ campaign, baker, from: entry.joinsTallied, to: entry.joinCount });
    await landVia(chain, keeper, [ix]);
  }
  if (options.tallyOnly) return null;
  const c = decodeCampaign(rawOf(w, campaign));
  setTime(w.client, c.reviewEndsAt + 1n);
  return landVia(chain, keeper, [await buildFinalizeCampaign({ campaign })]);
}

/** The keeper's work after finalize: each entry, then the creator share, the prize, Brot's fee and the close. */
export async function settleVia(
  w: World,
  chain: FakeChain,
  keeper: KeyPairSigner,
  campaign: Address,
  bakers: Address[],
) {
  for (const baker of bakers) await landVia(chain, keeper, [await buildSettleEntry({ campaign, baker })]);
  const c = decodeCampaign(rawOf(w, campaign));
  const shared = await sendVia(chain, keeper, [await buildSettleCreatorShare({ campaign, creator: c.creator })]);
  await landVia(chain, keeper, [await buildSettlePrize({ campaign, recipient: c.creator })]);
  await landVia(chain, keeper, [await buildCollectFee({ campaign })]);
  return { creatorShare: shared, close: () => buildCloseCampaign({ campaign, rentPayer: c.rentPayer }) };
}

/** A plain System Program transfer of `lamports` from `from` to `to`: a stranger's transaction that names `to`. */
export function transferIx(from: KeyPairSigner, to: Address, lamports: bigint): Instruction {
  const data = new Uint8Array(12);
  const view = new DataView(data.buffer);
  view.setUint32(0, 2, true); // SystemInstruction::Transfer
  view.setBigUint64(4, lamports, true);
  return {
    programAddress: "11111111111111111111111111111111" as Address,
    accounts: [
      { address: from.address, role: AccountRole.WRITABLE_SIGNER, signer: from },
      { address: to, role: AccountRole.WRITABLE },
    ],
    data,
  } as Instruction;
}
