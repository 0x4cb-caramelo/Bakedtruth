/**
 * Purpose: the first half of the smoke cycle (Sprint 05, X0.2 and X0.5): a burn campaign's mint (classic SPL
 *          Token, authority revoked), the opening preview with the whole debit, a paid opening by a wallet
 *          outside the team checked lamport by lamport, the retried opening refused on its id, and joins whose
 *          `min_return_bps` is exactly the SDK's estimate, so the program refuses the join if the SDK is off.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { generateKeyPairSigner, type Address, type KeyPairSigner } from "@solana/kit";

import {
  ACCOUNT_LEN,
  ReaderKind,
  SOL_USD_ACCOUNT,
  SPL_TOKEN_PROGRAM_ID,
  Side,
  campaignAddress,
  decodeCampaign,
  decodeEntry,
  entryAddress,
  entryTotal,
  estimateReturnBps,
  openingDebit,
  openingQuote,
  vaultAddress,
} from "@brot/sdk/read";
import { buildJoinCampaign, buildOpenCampaign, randomCampaignId } from "@brot/sdk/tx";

import { check, sol, type Session } from "../devnet";
import { account, balance, clock, expectOk, expectRefusal, rentFor, send } from "./rpc";
import * as T from "./spl-token";

const DAY = 86_400n;

/** A fresh classic SPL Token mint holding `supply` in `owner`'s token account, its mint authority revoked. */
export async function burnMint(s: Session, owner: KeyPairSigner, supply: bigint) {
  const [mint, holding] = [await generateKeyPairSigner(), await generateKeyPairSigner()];
  const mintRent = await rentFor(s.rpc, T.MINT_LEN);
  const holdingRent = await rentFor(s.rpc, T.TOKEN_ACCOUNT_LEN);
  const ixs = [
    T.createAccountIx(s.payer, mint, mintRent, T.MINT_LEN, SPL_TOKEN_PROGRAM_ID),
    T.initializeMintIx(mint.address, 0, owner.address),
    T.createAccountIx(s.payer, holding, holdingRent, T.TOKEN_ACCOUNT_LEN, SPL_TOKEN_PROGRAM_ID),
    T.initializeTokenAccountIx(holding.address, mint.address, owner.address),
    T.mintToIx(mint.address, holding.address, owner, supply),
    T.revokeMintAuthorityIx(mint.address, owner),
  ];
  expectOk(await send(s.rpc, s.payer, ixs), "the burn mint");
  const data = (await account(s.rpc, mint.address))!.data;
  const revoked = new DataView(data.buffer, data.byteOffset).getUint32(0, true) === 0;
  check(revoked && T.mintSupply(data) === supply, `mint ${mint.address}: supply ${supply}, mint authority revoked`);
  return { mint: mint.address, holding: holding.address };
}

/** The opening preview: the quote at the current SOL/USD account and the whole debit, rents and fee on top. */
export async function previewOpening(s: Session, openingUsd: bigint) {
  await s.freshPrices();
  const config = await s.config();
  const solUsd = (await account(s.rpc, SOL_USD_ACCOUNT))!;
  const quote = openingQuote({ params: config.params, openingUsd, solUsd, clock: await clock(s.rpc) });
  const [campaignRent, vaultRent] = [await rentFor(s.rpc, ACCOUNT_LEN.campaign), await rentFor(s.rpc, 0)];
  const debit = openingDebit({
    payment: quote.paid,
    maxPayment: quote.maxLamports,
    campaignRent,
    vaultRent,
    networkFee: 5_000n,
  });
  console.log(`  preview: US$${openingUsd} at ${quote.price}e${quote.exponent} = ${sol(quote.paid)} into the vault`);
  console.log(
    `    prize ${sol(quote.prize)}, opening fee ${sol(quote.fee)}; max_lamports signed ${sol(quote.maxLamports)}`,
  );
  console.log(
    `    rents on top: campaign ${sol(campaignRent)} + vault ${sol(vaultRent)}; network fee ${sol(debit.networkFee)}`,
  );
  console.log(`    whole debit now ${sol(debit.total)}, at most ${sol(debit.maxTotal)}`);
  return { config, quote, debit };
}

/** A paid `SupplyAtMost` opening by `creator`, checked against the preview; then its retry, refused. */
export async function openPaidBurnCampaign(s: Session, creator: KeyPairSigner, mint: Address, target: bigint) {
  const { config, quote, debit } = await previewOpening(s, 500n);
  const now = (await clock(s.rpc)).unixTimestamp;
  const args = {
    id: randomCampaignId(),
    kind: ReaderKind.SupplyAtMost,
    target,
    deadlineAt: now + 3n * DAY + 3_600n,
    openingUsd: 500n,
    maxLamports: quote.maxLamports,
    expectedParamsVersion: config.paramsVersion,
  };
  const ix = await buildOpenCampaign({ creator, args, metricAccount: mint });
  const before = await balance(s.rpc, creator.address);
  const sent = expectOk(await send(s.rpc, creator, [ix]), "user_open_campaign");
  const campaign = await campaignAddress(args.id);
  const stored = decodeCampaign((await account(s.rpc, campaign))!);
  check(sent.events.map((e) => e.name).join() === "CampaignOpened", "one event: CampaignOpened (decoded by the SDK)");
  check(stored.openingPaidLamports === quote.paid, `charged ${sol(stored.openingPaidLamports)} = the SDK's quote`);
  check(stored.prizeLamports === quote.prize && stored.openingFeeLamports === quote.fee, "90/10 split = the SDK's");
  const spent = before - (await balance(s.rpc, creator.address));
  const expected = quote.paid + debit.campaignRent + debit.vaultRent + sent.fee;
  check(spent === expected, `the creator's whole debit ${sol(spent)} = payment + two rents + fee`);
  check(
    (await balance(s.rpc, await vaultAddress(campaign))) === debit.vaultRent + quote.paid,
    "the vault holds rent + payment",
  );
  const retry = await send(s.rpc, creator, [await buildOpenCampaign({ creator, args, metricAccount: mint })]);
  expectRefusal(retry, "AlreadyInitialized", "the retried opening");
  check(true, "a retried opening with the same id fails (AlreadyInitialized): nothing charged twice (X0.5)");
  return { campaign, id: args.id };
}

/** A join whose `min_return_bps` is the SDK's estimate exactly, and whose retry guard is the entry's total. */
export async function joinAtEstimate(
  s: Session,
  baker: KeyPairSigner,
  campaign: Address,
  metric: Address,
  side: Side,
  amount: bigint,
) {
  const c = decodeCampaign((await account(s.rpc, campaign))!);
  const entryAccount = await account(s.rpc, await entryAddress(campaign, baker.address));
  const entry =
    entryAccount && entryAccount.owner !== "11111111111111111111111111111111" ? decodeEntry(entryAccount) : null;
  const isFirst = (entry?.isFirst ?? false) || c.poolYes + c.poolNo === 0n;
  const [mine, other] = side === Side.Yes ? [c.poolYes, c.poolNo] : [c.poolNo, c.poolYes];
  const estimate = estimateReturnBps({
    amount,
    sideAfter: mine + amount,
    other,
    prize: c.prizeLamports,
    feeBps: c.feeBps,
    oneSidedFeeBps: c.oneSidedFeeBps,
    creatorShareBps: c.creatorShareBps,
    isFirst,
  });
  const minReturnBps = Number(estimate > 0xffff_ffffn ? 0xffff_ffffn : estimate);
  const expectedEntryTotal = entryTotal(entry);
  const joinIndex = entry?.joinCount ?? 0;
  const build = () =>
    buildJoinCampaign({
      baker,
      campaign,
      metricAccount: metric,
      side,
      amount,
      minReturnBps,
      expectedEntryTotal,
      joinIndex,
    });
  const sent = expectOk(await send(s.rpc, baker, [await build()]), `join ${Side[side]}`);
  check(
    sent.events.map((e) => e.name).join() === "EntryAdded",
    `${Side[side]} ${sol(amount)} joined at min_return_bps = SDK estimate ${estimate}`,
  );
  return { retry: build };
}
