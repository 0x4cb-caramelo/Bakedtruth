/**
 * Purpose: what the referral tests share in LiteSVM: a world with a funded referee and referrer, the link sent through
 *          the SDK's builder, the link read back through the SDK's decoder (checked against the kit's own layout), and
 *          an account's owner, lamports and bytes, to show that nothing changed it.
 * Version: 0.1.0
 * Sprint:  14 (referral), lane L14A
 */
import { expect } from "bun:test";
import { type Address, type KeyPairSigner } from "@solana/kit";

import { decodeReferralLink, referralLinkAddress } from "@brot/sdk/read";
import { buildUserLinkReferrer } from "@brot/sdk/tx";

import { normalized } from "./idl";
import { decode } from "./layouts";
import * as P from "./program";
import { setClock } from "./readers";
import { createWorld, fundedWallet, send, type World } from "./setup";
import { REFERRAL_LINK } from "./structs-14-15";

/** The clock the link tests run at: a Unix time and a slot the link must record. */
export const LINK_TIME = 1_791_300_000n;
export const LINK_SLOT = 4_242n;

/** A fresh world whose clock reads `LINK_TIME` and `LINK_SLOT`, with a funded referee and referrer. */
export async function linkWorld() {
  const w = await createWorld();
  setClock(w.client, { unixTimestamp: LINK_TIME, slot: LINK_SLOT });
  const [referee, referrer] = [await fundedWallet(w), await fundedWallet(w)];
  return { w, referee, referrer, link: await referralLinkAddress(referee.address) };
}

/** `user_link_referrer` built by the SDK. */
export const linkIx = (referee: KeyPairSigner, referrer: Address) => buildUserLinkReferrer({ referee, referrer });

/** `user_link_referrer` built by the SDK, sent. */
export const link = async (w: World, referee: KeyPairSigner, referrer: Address) =>
  send(w, [await linkIx(referee, referrer)]);

/** The referee's link as the SDK decodes it (the loader's checks first), after the kit's layout agreed on every field. */
export async function readLink(w: World, referee: Address) {
  const address = await referralLinkAddress(referee);
  const account = w.client.svm.getAccount(address);
  if (!account.exists) throw new Error(`no link at ${address}`);
  const sdk = decodeReferralLink({ owner: account.programAddress, data: account.data });
  expect(normalized(sdk)).toEqual(normalized(decode(REFERRAL_LINK, account.data)));
  return { address, link: sdk, lamports: BigInt(account.lamports) };
}

/** An account's owner, lamports and bytes (a null owner: no account), to show that nothing changed it. */
export function snapshot(w: World, address: Address) {
  const account = w.client.svm.getAccount(address);
  if (!account.exists) return { owner: null as Address | null, lamports: 0n, data: [] as number[] };
  return {
    owner: account.programAddress as Address | null,
    lamports: BigInt(account.lamports),
    data: [...account.data],
  };
}

/** Nothing was created at the link's address: no account, or a plain System account with no data. */
export function expectNoLink(w: World, address: Address) {
  const account = w.client.svm.getAccount(address);
  if (account.exists) expect([account.programAddress, account.data.length]).toEqual([P.SYSTEM_PROGRAM_ID, 0]);
}
