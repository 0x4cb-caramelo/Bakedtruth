// Shared setup for the devnet scripts: connection, deployer, Anchor client, sending, and the raw SPL
// Token instructions the scripts need to set up test tokens.
//
// DEVNET_WALLET (default ~/.config/solana/pred-provable-devnet.json) is the payer and sponsor;
// DEVNET_RPC_URL overrides the RPC (point it at a Surfpool fork to rehearse).

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { AnchorProvider, Program, Wallet, type Idl } from "@anchor-lang/core";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type Signer,
} from "@solana/web3.js";

import idl from "../app/lib/idl/pred_provable.json";
import type { PredProvable } from "../app/lib/idl/pred_provable";
import * as lib from "../app/lib/market";

export const RPC_URL = process.env.DEVNET_RPC_URL ?? "https://api.devnet.solana.com";
const WALLET = process.env.DEVNET_WALLET ?? `${homedir()}/.config/solana/pred-provable-devnet.json`;
export const USDC = 1_000_000n;

export const connection = new Connection(RPC_URL, "confirmed");
export const deployer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(WALLET, "utf8"))));
/** A keypair derived from the deployer's secret: the same on every run, so its funds are never lost. */
export const derived = (role: string) =>
  Keypair.fromSeed(createHash("sha256").update(deployer.secretKey).update(role).digest());
export const provider = new AnchorProvider(connection, new Wallet(deployer), { commitment: "confirmed" });
export const program = new Program<PredProvable>(idl as Idl, provider);

// --- Small utilities ------------------------------------------------------------------------

export function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`check failed: ${message}`);
}

export function expectEqual(actual: bigint, expected: bigint, what: string) {
  check(actual === expected, `${what}: expected ${expected}, got ${actual}`);
}

export const explorer = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
export const fmt = (base: bigint) => `${Number(base) / 1e6}`;

/** Sends one transaction (deployer pays) and returns its signature and decoded program events. */
export async function send(label: string, ixs: TransactionInstruction[], signers: Signer[] = []) {
  const sig = await provider.sendAndConfirm(new Transaction().add(...ixs), signers);
  const tx = await connection.getTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  const events = lib.decodeEvents(tx?.meta?.logMessages ?? []);
  console.log(`  ✓ ${label}  [${events.map((e) => e.name).join(", ") || "no events"}]\n    ${explorer(sig)}`);
  return { sig, events };
}

/** Asserts that `ixs` fail in simulation with `error` in the logs (nothing is sent). */
export async function expectFailure(label: string, ixs: TransactionInstruction[], signers: Signer[], error: string) {
  const tx = new Transaction().add(...ixs);
  tx.feePayer = deployer.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(deployer, ...signers);
  const sim = await connection.simulateTransaction(tx);
  const logs = sim.value.logs?.join("\n") ?? "";
  check(sim.value.err && logs.includes(error), `${label}: expected ${error}, got ${JSON.stringify(sim.value.err)}`);
  console.log(`  ✓ ${label} fails with ${error}`);
}

export async function tokenAmount(account: PublicKey) {
  const info = await connection.getAccountInfo(account);
  return info ? info.data.readBigUInt64LE(64) : 0n;
}

export async function mintSupply(mint: PublicKey) {
  const info = await connection.getAccountInfo(mint);
  check(info, `mint ${mint.toBase58()} exists`);
  return info.data.readBigUInt64LE(36);
}

export const usdcOf = (owner: PublicKey) => tokenAmount(lib.ataAddress(owner, lib.USDC_MINT));

// --- Raw SPL Token instructions (layouts from spl-token) ------------------------------------

const splIx = (keys: [PublicKey, boolean, boolean][], data: Buffer) =>
  new TransactionInstruction({
    programId: lib.TOKEN_PROGRAM_ID,
    keys: keys.map(([pubkey, isSigner, isWritable]) => ({ pubkey, isSigner, isWritable })),
    data,
  });

const withAmount = (tag: number, amount: bigint, extra: number[] = []) => {
  const data = Buffer.alloc(9 + extra.length);
  data[0] = tag;
  data.writeBigUInt64LE(amount, 1);
  extra.forEach((byte, i) => (data[9 + i] = byte));
  return data;
};

/** InitializeMint2, 6 decimals, with an optional freeze authority. */
export const initializeMintIx = (mint: PublicKey, authority: PublicKey, freezeAuthority?: PublicKey) =>
  splIx(
    [[mint, false, true]],
    Buffer.concat([
      Buffer.from([20, 6]),
      authority.toBuffer(),
      freezeAuthority ? Buffer.concat([Buffer.from([1]), freezeAuthority.toBuffer()]) : Buffer.from([0]),
    ]),
  );
export const mintToIx = (mint: PublicKey, to: PublicKey, authority: PublicKey, amount: bigint) =>
  splIx(
    [
      [mint, false, true],
      [to, false, true],
      [authority, true, false],
    ],
    withAmount(7, amount),
  );
/** SetAuthority(MintTokens, None): nobody can ever mint again. */
export const revokeMintAuthorityIx = (mint: PublicKey, authority: PublicKey) =>
  splIx(
    [
      [mint, false, true],
      [authority, true, false],
    ],
    Buffer.from([6, 0, 0]),
  );
export const burnIx = (account: PublicKey, mint: PublicKey, owner: PublicKey, amount: bigint) =>
  splIx(
    [
      [account, false, true],
      [mint, false, true],
      [owner, true, false],
    ],
    withAmount(8, amount),
  );
export const closeAccountIx = (account: PublicKey, owner: PublicKey) =>
  splIx(
    [
      [account, false, true],
      [owner, false, true],
      [owner, true, false],
    ],
    Buffer.from([9]),
  );
export const usdcTransferIx = (from: PublicKey, to: PublicKey, amount: bigint) =>
  splIx(
    [
      [lib.ataAddress(from, lib.USDC_MINT), false, true],
      [lib.USDC_MINT, false, false],
      [lib.ataAddress(to, lib.USDC_MINT), false, true],
      [from, true, false],
    ],
    withAmount(12, amount, [lib.USDC_DECIMALS]),
  );
export const transferIx = (from: PublicKey, to: PublicKey, owner: PublicKey, amount: bigint) =>
  splIx(
    [
      [from, false, true],
      [to, false, true],
      [owner, true, false],
    ],
    withAmount(3, amount),
  );

/** Creates and initializes a 6-decimal SPL mint at `mint` (which must sign) with `authority`. */
export async function createMintIxs(mint: PublicKey, authority: PublicKey, freezeAuthority?: PublicKey) {
  return [
    SystemProgram.createAccount({
      fromPubkey: deployer.publicKey,
      newAccountPubkey: mint,
      lamports: await connection.getMinimumBalanceForRentExemption(82),
      space: 82,
      programId: lib.TOKEN_PROGRAM_ID,
    }),
    initializeMintIx(mint, authority, freezeAuthority),
  ];
}

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

/**
 * Metaplex CreateMetadataAccountV3 (name and symbol, no creators or collection), signed by the
 * mint authority. The deployer pays and stays update authority.
 */
export function createMetadataIx(mint: PublicKey, mintAuthority: PublicKey, name: string, symbol: string) {
  const metadata = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
  const text = (value: string) => {
    const bytes = Buffer.from(value);
    const out = Buffer.alloc(4 + bytes.length);
    out.writeUInt32LE(bytes.length);
    bytes.copy(out, 4);
    return out;
  };
  const data = Buffer.concat([
    Buffer.from([33]), // CreateMetadataAccountV3
    text(name),
    text(symbol),
    text(""), // uri
    Buffer.from([0, 0]), // seller fee basis points
    Buffer.from([0, 0, 0]), // creators, collection, uses: None
    Buffer.from([1]), // is_mutable
    Buffer.from([0]), // collection_details: None
  ]);
  return new TransactionInstruction({
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys: [
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: mintAuthority, isSigner: true, isWritable: false },
      { pubkey: deployer.publicKey, isSigner: true, isWritable: true },
      { pubkey: deployer.publicKey, isSigner: true, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}
