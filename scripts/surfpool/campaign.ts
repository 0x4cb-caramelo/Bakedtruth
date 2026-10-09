/**
 * Purpose: the program's steps the price-touch run takes on a surfnet, with the test kit's builders
 *          and layouts: funded throwaway wallets, the config and the team, a free team opening on a
 *          price feed, a resolution, the decoded accounts, and the checks that name what failed.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution): the Surfpool run of the price reader
 */
import { generateKeyPairSigner, type Address, type KeyPairSigner } from "@solana/kit";

import { BrotError } from "../../tests/brot/errors";
import { DEFAULT_PARAMS } from "../../tests/brot/flows";
import * as I from "../../tests/brot/instructions";
import { decode, type Layout } from "../../tests/brot/layouts";
import * as P from "../../tests/brot/program";
import { CAMPAIGN, GLOBAL_CONFIG } from "../../tests/brot/structs";
import { account, send, setAccount, type Rpc, type Sent } from "./rpc";

/** A fresh keypair, made in memory and never written anywhere, holding `sol` SOL on the surfnet. */
export async function fundedSigner(rpc: Rpc, sol: bigint): Promise<KeyPairSigner> {
  const signer = await generateKeyPairSigner();
  await setAccount(rpc, signer.address, { lamports: sol * P.SOL });
  return signer;
}

const errorNames = new Map<number, string>(Object.entries(BrotError).map(([name, code]) => [code, name]));

/** `NotResolvableYet (6072)`, or the raw error when it is not one of the program's codes. */
export function describeFailure(sent: Sent): string {
  if (sent.ok) return "success";
  if (sent.code !== null) return `${errorNames.get(sent.code) ?? "custom"} (${sent.code})`;
  return JSON.stringify(sent.err);
}

/** Throws with the step, the error and the program's logs unless the transaction succeeded. */
export function expectOk(sent: Sent, step: string): Sent {
  if (!sent.ok) throw new Error(`${step}: expected success, got ${describeFailure(sent)}\n${sent.logs.join("\n")}`);
  return sent;
}

/** Throws unless `actual` equals `expected` (compared as strings, so bigint, number and address mix). */
export function expectEqual(label: string, actual: unknown, expected: unknown) {
  if (String(actual) !== String(expected)) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

export function expectThat(holds: boolean, message: string) {
  if (!holds) throw new Error(message);
}

async function decoded(rpc: Rpc, address: Address, layout: Layout) {
  const found = await account(rpc, address);
  if (!found) throw new Error(`${address} does not exist on the surfnet`);
  return decode(layout, found.data);
}
export const readConfig = async (rpc: Rpc) => decoded(rpc, await P.configPda(), GLOBAL_CONFIG);
export const readCampaign = (rpc: Rpc, campaign: Address) => decoded(rpc, campaign, CAMPAIGN);

/**
 * `admin_initialize_config` signed by the upgrade authority with the founder's parameters
 * (tests/brot/flows.ts), then `admin_set_team` with one team key. Returns the admin and the key.
 */
export async function configureProgram(rpc: Rpc, authority: KeyPairSigner) {
  const admin = await generateKeyPairSigner();
  const feeRecipient = await generateKeyPairSigner();
  const init = await I.initializeConfigIx({
    authority,
    admin: admin.address,
    feeRecipient: feeRecipient.address,
    params: DEFAULT_PARAMS,
  });
  expectOk(await send(rpc, authority, [init]), "admin_initialize_config");
  const teamKey = await fundedSigner(rpc, 1n);
  expectOk(await send(rpc, authority, [await I.setTeamIx(admin, [teamKey.address])]), "admin_set_team");
  return { admin, teamKey };
}

/** A random campaign id, as real clients draw it (T17). */
export function randomId(): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return new DataView(bytes.buffer).getBigUint64(0, true);
}

/**
 * `user_open_campaign` by a team key with `opening_usd` 0: free, so the SOL/USD slot is not read.
 * The metric slot is the sponsored account of `feedId`, derived by the kit as the program does.
 */
export async function openTeamPriceCampaign(
  rpc: Rpc,
  payer: KeyPairSigner,
  creator: KeyPairSigner,
  a: { feedId: Uint8Array; direction: number; target: bigint; deadlineAt: bigint },
) {
  const config = await readConfig(rpc);
  const args: I.OpenArgs = {
    id: randomId(),
    kind: P.ReaderKind.PriceTouch,
    direction: a.direction,
    feedId: a.feedId,
    target: a.target,
    deadlineAt: a.deadlineAt,
    openingUsd: 0n,
    maxLamports: 0n,
    expectedParamsVersion: Number(config.params_version),
  };
  const sent = await send(rpc, payer, [await I.openCampaignIx(creator, args)]);
  return { sent, args, campaign: await P.campaignPda(args.id) };
}

/** `resolve_campaign` with the metric account and the account offered as the YES proof. */
export const resolveCampaign = (rpc: Rpc, payer: KeyPairSigner, campaign: Address, metric: Address, proof: Address) =>
  send(rpc, payer, [I.resolveCampaignIx(campaign, metric, proof)]);
