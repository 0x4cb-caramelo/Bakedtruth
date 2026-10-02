import { BorshAccountsCoder, Program, type Idl } from "@anchor-lang/core";
import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  createClient,
  createTransactionMessage,
  generateKeyPairSigner,
  getAddressEncoder,
  getProgramDerivedAddress,
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
import { PublicKey, type TransactionInstruction } from "@solana/web3.js";

import idl from "../target/idl/pred_provable.json";
import type { PredProvable } from "../target/types/pred_provable";

export const PROGRAM_ID = address(idl.address);
export const TOKEN_PROGRAM_ID = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const LOADER_V3_ID = address("BPFLoaderUpgradeab1e11111111111111111111111");
export const SOL = 1_000_000_000n;

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
  return client;
}

export async function fundedSigner(client: TestClient, sol = 10n): Promise<KeyPairSigner> {
  const signer = await generateKeyPairSigner();
  client.svm.airdrop(signer.address, lamports(sol * SOL));
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

export async function marketPda(sponsor: Address, marketId: bigint): Promise<Address> {
  const id = new Uint8Array(8);
  new DataView(id.buffer).setBigUint64(0, marketId, true);
  const [pda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: ["market", getAddressEncoder().encode(sponsor), id],
  });
  return pda;
}

export async function positionPda(market: Address, owner: Address): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: ["position", getAddressEncoder().encode(market), getAddressEncoder().encode(owner)],
  });
  return pda;
}

export async function programDataPda(programId: Address): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: LOADER_V3_ID,
    seeds: [getAddressEncoder().encode(programId)],
  });
  return pda;
}

export function fetchMarket(client: TestClient, market: Address) {
  const account = client.svm.getAccount(market);
  if (!account.exists) throw new Error(`market ${market} not found`);
  return coder.decode("Market", Buffer.from(account.data));
}

export function balance(client: TestClient, who: Address): bigint {
  return client.svm.getBalance(who) ?? 0n;
}

// --- State injection -------------------------------------------------------------------
// @solana/spl-token helpers need a real RPC, so SPL and loader accounts are written
// directly into the SVM with the exact byte layout the program parses.

/** SPL Token Mint (82 bytes). `authority = null` means the mint authority is revoked. */
export function setMint(client: TestClient, mint: Address, supply: bigint, authority: Address | null) {
  const data = new Uint8Array(82);
  const view = new DataView(data.buffer);
  if (authority) {
    view.setUint32(0, 1, true);
    data.set(getAddressEncoder().encode(authority), 4);
  }
  view.setBigUint64(36, supply, true);
  data[44] = 6; // decimals
  data[45] = 1; // is_initialized
  client.svm.setAccount({
    address: mint,
    data,
    executable: false,
    lamports: lamports(SOL),
    programAddress: TOKEN_PROGRAM_ID,
    space: 82n,
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
