/**
 * Purpose: the two writes the deploy makes in the same session as the deploy itself (TP §3.4.3, §7; Sprint 05):
 *          `admin_initialize_config`, signed by the program's upgrade authority, then `admin_set_team`, signed
 *          by the admin. Each is checked by reading the config back, field by field.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Whoever runs the initialization first becomes admin, so it follows the deploy at once; initialization leaves
 * the team empty, so nobody can pause until `admin_set_team`. The values come from deploy/devnet/init-params.json.
 */
import { readFileSync } from "node:fs";

import { address, type Address, type TransactionSigner } from "@solana/kit";

import { configAddress, decodeGlobalConfig, hexToBytes, teamOf, type GlobalConfig } from "@brot/sdk/read";
import { buildInitializeConfig, buildSetTeam, type CreationParamsArgs } from "@brot/sdk/tx";

import { account, expectOk, send, type Rpc } from "../validator/rpc";

const NUMBER_FIELDS = [
  "openingPrizeBps",
  "feeBps",
  "oneSidedFeeBps",
  "creatorShareBps",
  "maxOpenCampaigns",
  "maxPriceAge",
  "maxPriceConfBps",
  "campaignMaxAge",
] as const;

/** Reads the reviewed creation parameters; every field must be present and an integer. */
export function readInitParams(path: string): CreationParamsArgs {
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const int = (name: string) => {
    const value = raw[name];
    if (typeof value !== "number" || !Number.isInteger(value)) throw new Error(`${path}: ${name} must be an integer`);
    return value;
  };
  const params = {
    openingFeeUsd: BigInt(int("openingFeeUsd")),
    minEntryLamports: BigInt(int("minEntryLamports")),
    solUsdFeedId: hexToBytes(String(raw.solUsdFeedId)),
  } as Record<string, unknown>;
  for (const name of NUMBER_FIELDS) params[name] = int(name);
  return params as unknown as CreationParamsArgs;
}

/** The config as stored, or null before initialization. */
export async function readConfig(rpc: Rpc): Promise<GlobalConfig | null> {
  const found = await account(rpc, await configAddress());
  return found ? decodeGlobalConfig(found) : null;
}

/** A value in comparable form: integers as decimal strings, byte arrays as plain arrays. */
const plain = (value: unknown): unknown =>
  typeof value === "number" || typeof value === "bigint"
    ? BigInt(value).toString()
    : value instanceof Uint8Array
      ? Array.from(value)
      : Array.isArray(value)
        ? value.map(plain)
        : value;

function same(label: string, actual: unknown, expected: unknown) {
  const [a, e] = [JSON.stringify(plain(actual)), JSON.stringify(plain(expected))];
  if (a !== e) throw new Error(`${label}: stored ${a}, expected ${e}`);
}

/** `admin_initialize_config`, then the stored config compared with what was asked. */
export async function initializeConfig(
  rpc: Rpc,
  payer: TransactionSigner,
  plan: { authority: TransactionSigner; admin: Address; feeRecipient: Address; params: CreationParamsArgs },
): Promise<GlobalConfig> {
  if (await readConfig(rpc)) throw new Error("the config already exists: this program was initialized before");
  const ix = await buildInitializeConfig(plan);
  const sent = expectOk(await send(rpc, payer, [ix]), "admin_initialize_config");
  same(
    "events",
    sent.events.map((e) => e.name),
    ["ConfigInitialized"],
  );
  const config = (await readConfig(rpc))!;
  same("admin", config.admin, plan.admin);
  same("fee recipient", config.feeRecipient, plan.feeRecipient);
  for (const [key, value] of Object.entries(plan.params)) {
    same(`params.${key}`, (config.params as Record<string, unknown>)[key], value);
  }
  same("team", config.teamLen, 0);
  console.log(`  config initialized (${sent.signature}); admin ${config.admin}`);
  return config;
}

/** `admin_set_team`, then the stored team compared with the keys asked. */
export async function setTeam(rpc: Rpc, payer: TransactionSigner, admin: TransactionSigner, team: Address[]) {
  const sent = expectOk(await send(rpc, payer, [await buildSetTeam({ admin, team })]), "admin_set_team");
  same(
    "events",
    sent.events.map((e) => e.name),
    ["ConfigChanged"],
  );
  const config = (await readConfig(rpc))!;
  same("team", teamOf(config), team);
  console.log(`  team set (${sent.signature}): ${team.join(", ")}`);
  return config;
}

/** Comma-separated public keys, each checked as an address (no key is ever read from a secret here). */
export const parseTeam = (list: string): Address[] =>
  list
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean)
    .map((key) => address(key));
