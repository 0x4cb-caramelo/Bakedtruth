import { BorshAccountsCoder, Program, type Idl } from "@anchor-lang/core";
import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  createClient,
  createTransactionMessage,
  generateKeyPairSigner,
  getAddressEncoder,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  signTransactionMessageWithSigners,
  type Address,
  type Instruction,
  type KeyPairSigner,
} from "@solana/kit";
import { litesvm, isFailedTransaction } from "@solana/kit-plugin-litesvm";
import { generatedSigner } from "@solana/kit-plugin-signer";
import { BN } from "@anchor-lang/core";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

import * as lib from "../app/lib/market";
import idl from "../target/idl/pred_provable.json";
import type { PredProvable } from "../target/types/pred_provable";

export const PROGRAM_ID = address(idl.address);
export const TOKEN_PROGRAM_ID = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const LOADER_V3_ID = address("BPFLoaderUpgradeab1e11111111111111111111111");
export const ATA_PROGRAM_ID = address("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
export const SYSTEM_PROGRAM_ID = address("11111111111111111111111111111111");
export const INCINERATOR = address("1nc1nerator11111111111111111111111111111111");
export const SOL = 1_000_000_000n;
/** The program's collateral mint, read from the IDL so it follows the build's cluster feature. */
export const USDC_MINT = address(idl.constants.find((c) => c.name === "USDC_MINT")!.value);
/** One whole USDC, and one whole outcome token: both use 6 decimals. */
export const USDC = 1_000_000n;

// The Anchor client is used only to encode instructions and decode accounts; it never
// touches a connection, so a stub provider is enough.
export const program = new Program<PredProvable>(idl as Idl, { connection: {} } as never);
const coder = new BorshAccountsCoder(idl as Idl);

export type TestClient = Awaited<ReturnType<typeof createTestClient>>;

export async function createTestClient() {
  const client = await createClient().use(generatedSigner()).use(litesvm());
  client.svm.addProgramFromFile(PROGRAM_ID, "target/deploy/pred_provable.so");
  // Pin the clock so tests can use absolute cutoff/deadline slots.
  client.svm.warpToSlot(1n);
  client.svm.airdrop(client.payer.address, lamports(100n * SOL));
  // USDC lives at a fixed address; balances are injected per signer by `fundedSigner`.
  setMint(client, USDC_MINT, 1_000_000_000n * USDC, null);
  return client;
}

/** A signer with SOL for fees and rent, and `usdc` whole USDC in its associated token account. */
export async function fundedSigner(client: TestClient, usdc = 10n): Promise<KeyPairSigner> {
  const signer = await generateKeyPairSigner();
  client.svm.airdrop(signer.address, lamports(SOL));
  setTokenAccount(client, await usdcAta(signer.address), {
    mint: USDC_MINT,
    owner: signer.address,
    amount: usdc * USDC,
  });
  return signer;
}

export const pk = (a: Address) => new PublicKey(a);

/** Converts a web3.js v1 instruction (from the Anchor builder) into a Kit instruction with signers attached. */
export function toKitInstruction(ix: TransactionInstruction, signers: KeyPairSigner[]): Instruction {
  return {
    programAddress: address(ix.programId.toBase58()),
    data: new Uint8Array(ix.data),
    accounts: ix.keys.map((k) => {
      const addr = address(k.pubkey.toBase58());
      const role = k.isSigner
        ? k.isWritable
          ? AccountRole.WRITABLE_SIGNER
          : AccountRole.READONLY_SIGNER
        : k.isWritable
          ? AccountRole.WRITABLE
          : AccountRole.READONLY;
      const signer = signers.find((s) => s.address === addr);
      return signer ? { address: addr, role, signer } : { address: addr, role };
    }),
  };
}

/**
 * Sends straight through the LiteSVM instance (instead of the plugin's planner) so a
 * failure surfaces the program logs, which carry the Anchor error name.
 */
export async function send(client: TestClient, ixs: TransactionInstruction[], signers: KeyPairSigner[] = []) {
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(client.payer, m),
    (m) => client.svm.setTransactionMessageLifetimeUsingLatestBlockhash(m),
    (m) =>
      appendTransactionMessageInstructions(
        ixs.map((ix) => toKitInstruction(ix, signers)),
        m,
      ),
  );
  const tx = await signTransactionMessageWithSigners(message);
  const result = client.svm.sendTransaction(tx);
  // Fresh blockhash so identical follow-up transactions are not rejected as duplicates.
  client.svm.expireBlockhash();
  if (isFailedTransaction(result)) {
    throw new Error(result.meta().logs().join("\n"));
  }
  return result;
}

// Addresses come from the app's client library, so the suite also checks its derivations.
const kit = (key: PublicKey) => address(key.toBase58());

export const marketPda = (sponsor: Address, marketId: bigint) => kit(lib.marketPda(pk(sponsor), marketId));

export function outcomeMints(market: Address): { yes: Address; no: Address } {
  return { yes: kit(lib.yesMintPda(pk(market))), no: kit(lib.noMintPda(pk(market))) };
}

export const vaultPda = (market: Address) => kit(lib.vaultPda(pk(market)));
export const lpMintPda = (market: Address) => kit(lib.lpMintPda(pk(market)));

/** Associated token account of `owner` for `mint` (classic SPL Token). */
export const ata = (owner: Address, mint: Address) => kit(lib.ataAddress(pk(owner), pk(mint)));

export const programDataPda = (programId: Address) => kit(lib.programDataPda(pk(programId)));

/** Where locked tokens go: the incinerator's associated token account for `mint`. */
export const incineratorAta = (mint: Address) => kit(lib.incineratorAta(pk(mint)));

/** The program's events in a transaction's logs, with u64s as bigint and pubkeys as addresses. */
export function eventsOf(result: { logs(): string[] }) {
  const plain = (value: unknown): unknown => {
    if (BN.isBN(value)) return BigInt((value as BN).toString());
    if (value instanceof PublicKey) return value.toBase58();
    return value;
  };
  return lib.decodeEvents(result.logs()).map(({ name, data }) => ({
    name,
    data: Object.fromEntries(Object.entries(data as object).map(([k, v]) => [k, plain(v)])),
  }));
}

export const usdcAta = (owner: Address) => ata(owner, USDC_MINT);

export function fetchMarket(client: TestClient, market: Address) {
  const account = client.svm.getAccount(market);
  if (!account.exists) throw new Error(`market ${market} not found`);
  return coder.decode("Market", Buffer.from(account.data));
}

/** Token amount held by an SPL token account, or `null` if the account does not exist. */
export function tokenBalance(client: TestClient, account: Address): bigint | null {
  const info = client.svm.getAccount(account);
  if (!info.exists || info.data.length === 0) return null;
  return new DataView(info.data.buffer, info.data.byteOffset).getBigUint64(64, true);
}

/** USDC held in `owner`'s associated token account. */
export async function usdcBalance(client: TestClient, owner: Address): Promise<bigint> {
  return tokenBalance(client, await usdcAta(owner)) ?? 0n;
}

export function mintSupply(client: TestClient, mint: Address): bigint {
  const info = client.svm.getAccount(mint);
  if (!info.exists) throw new Error(`mint ${mint} not found`);
  return new DataView(info.data.buffer, info.data.byteOffset).getBigUint64(36, true);
}

// --- Raw SPL instructions ----------------------------------------------------------------
// Built by hand (layouts from spl-token / spl-associated-token-account) to show that outcome
// tokens move with the standard programs, with no pred-provable instruction involved.

export const createAtaIdempotentIx = (payer: Address, owner: Address, mint: Address) =>
  lib.createAtaIdempotentIx(pk(payer), pk(owner), pk(mint));

export function splTransferIx(source: Address, destination: Address, owner: Address, amount: bigint) {
  const data = Buffer.alloc(9);
  data[0] = 3; // TokenInstruction::Transfer
  data.writeBigUInt64LE(amount, 1);
  return new TransactionInstruction({
    programId: pk(TOKEN_PROGRAM_ID),
    keys: [
      { pubkey: pk(source), isSigner: false, isWritable: true },
      { pubkey: pk(destination), isSigner: false, isWritable: true },
      { pubkey: pk(owner), isSigner: true, isWritable: false },
    ],
    data,
  });
}

export function splBurnIx(account: Address, mint: Address, owner: Address, amount: bigint) {
  const data = Buffer.alloc(9);
  data[0] = 8; // TokenInstruction::Burn
  data.writeBigUInt64LE(amount, 1);
  return new TransactionInstruction({
    programId: pk(TOKEN_PROGRAM_ID),
    keys: [
      { pubkey: pk(account), isSigner: false, isWritable: true },
      { pubkey: pk(mint), isSigner: false, isWritable: true },
      { pubkey: pk(owner), isSigner: true, isWritable: false },
    ],
    data,
  });
}

export function splCloseAccountIx(account: Address, destination: Address, owner: Address) {
  return new TransactionInstruction({
    programId: pk(TOKEN_PROGRAM_ID),
    keys: [
      { pubkey: pk(account), isSigner: false, isWritable: true },
      { pubkey: pk(destination), isSigner: false, isWritable: true },
      { pubkey: pk(owner), isSigner: true, isWritable: false },
    ],
    data: Buffer.from([9]), // TokenInstruction::CloseAccount
  });
}

// --- State injection -------------------------------------------------------------------
// @solana/spl-token helpers need a real RPC, so SPL and loader accounts are written
// directly into the SVM with the exact byte layout the program parses.

/** SPL Token Mint (82 bytes). A `null` authority means it is revoked. */
export function setMint(
  client: TestClient,
  mint: Address,
  supply: bigint,
  authority: Address | null,
  freezeAuthority: Address | null = null,
) {
  const data = new Uint8Array(82);
  const view = new DataView(data.buffer);
  if (authority) {
    view.setUint32(0, 1, true);
    data.set(getAddressEncoder().encode(authority), 4);
  }
  view.setBigUint64(36, supply, true);
  data[44] = 6; // decimals
  data[45] = 1; // is_initialized
  if (freezeAuthority) {
    view.setUint32(46, 1, true);
    data.set(getAddressEncoder().encode(freezeAuthority), 50);
  }
  client.svm.setAccount({
    address: mint,
    data,
    executable: false,
    lamports: lamports(SOL),
    programAddress: TOKEN_PROGRAM_ID,
    space: 82n,
  });
}

/** SPL Token Account (165 bytes), initialized, with optional delegate and close authority. */
export function setTokenAccount(
  client: TestClient,
  account: Address,
  opts: { mint: Address; owner: Address; amount: bigint; delegate?: Address; closeAuthority?: Address },
) {
  const data = new Uint8Array(165);
  const view = new DataView(data.buffer);
  data.set(getAddressEncoder().encode(opts.mint), 0);
  data.set(getAddressEncoder().encode(opts.owner), 32);
  view.setBigUint64(64, opts.amount, true);
  if (opts.delegate) {
    view.setUint32(72, 1, true);
    data.set(getAddressEncoder().encode(opts.delegate), 76);
  }
  data[108] = 1; // AccountState::Initialized
  if (opts.closeAuthority) {
    view.setUint32(129, 1, true);
    data.set(getAddressEncoder().encode(opts.closeAuthority), 133);
  }
  client.svm.setAccount({
    address: account,
    data,
    executable: false,
    lamports: lamports(SOL),
    programAddress: TOKEN_PROGRAM_ID,
    space: 165n,
  });
}

/**
 * Loader-v3 Program + ProgramData pair. The program account is written non-executable
 * so LiteSVM does not try to JIT the fake ELF; the resolver only checks the owner.
 */
export async function setUpgradeableProgram(client: TestClient, programId: Address, authority: Address | null) {
  const programData = await programDataPda(programId);

  const programBytes = new Uint8Array(36);
  new DataView(programBytes.buffer).setUint32(0, 2, true);
  programBytes.set(getAddressEncoder().encode(programData), 4);
  client.svm.setAccount({
    address: programId,
    data: programBytes,
    executable: false,
    lamports: lamports(SOL),
    programAddress: LOADER_V3_ID,
    space: 36n,
  });

  const dataBytes = new Uint8Array(45 + 64);
  const view = new DataView(dataBytes.buffer);
  view.setUint32(0, 3, true);
  if (authority) {
    dataBytes[12] = 1;
    dataBytes.set(getAddressEncoder().encode(authority), 13);
  }
  client.svm.setAccount({
    address: programData,
    data: dataBytes,
    executable: false,
    lamports: lamports(SOL),
    programAddress: LOADER_V3_ID,
    space: BigInt(dataBytes.length),
  });
  return programData;
}

/** Moves the clock to `epoch`, keeping the slot (the program reads both). */
export function setEpoch(client: TestClient, epoch: bigint) {
  const clock = client.svm.getClock();
  clock.epoch = epoch;
  client.svm.setClock(clock);
}

/** An account owned by the Vote program. LiteSVM reports no stake for it, so it reads 0. */
export function setVoteAccount(client: TestClient, vote: Address) {
  client.svm.setAccount({
    address: vote,
    data: new Uint8Array(3762),
    executable: false,
    lamports: lamports(SOL),
    programAddress: address("Vote111111111111111111111111111111111111111"),
    space: 3762n,
  });
}
