// Captures the mainnet accounts the resolver tests decode into tests/fixtures: real bytes, so the tests
// exercise the layouts the third-party programs actually write. Re-run it after an upstream upgrade
// (`bun run scripts/capture-fixtures.ts`; MAINNET_RPC_URL overrides the RPC) and review the diff.

import { mkdirSync, writeFileSync } from "node:fs";
import { Connection, PublicKey } from "@solana/web3.js";

const OUT = new URL("../tests/fixtures/", import.meta.url).pathname;
const RPC_URL = process.env.MAINNET_RPC_URL ?? "https://api.mainnet-beta.solana.com";

/** name -> [address, what it is]. The address is where the bytes live on mainnet. */
const FIXTURES: Record<string, [string, string]> = {
  "stakepool-jitosol": ["Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb", "JitoSOL SPL stake pool, fees all unset"],
  "stakepool-bsol": ["stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi", "bSOL SPL stake pool, same layout"],
  "damm-sol-usdc": ["8Pm2kZpnxD3hoMmt4bjStX2Pw2Z9abpbHzZxMPqxPmie", "Meteora DAMM v2 SOL-USDC pool, 0.02% locked"],
  "damm-ft8fd9": ["Ft8FD9gg1TdawhWijNzdkpYTiVL8ETfY6gAwS24bwYio", "Meteora DAMM v2 pool, 59.7% of liquidity locked"],
  "metadata-usdc": ["5x38Kp4hvdomTCnCrAny4UtMUt5rQBdB6px2K1Ui45Wq", "Metaplex metadata of USDC: mutable, no creators"],
  "metadata-wif": ["C1BpuaMytZAbSCFf9WM2gm6fAm54Yh1gh32ieptrp12B", "Metaplex metadata of WIF: immutable, no creators"],
  "metadata-smb-1301": [
    "91tCv8sG8esgP5dVQ9WchuzBmojXbdaqxMxA16qt6CnE",
    "Metaplex pNFT SMB #1301: immutable, 3 creators",
  ],
  "metadata-madlads-1725": [
    "2zjfABAdNg7SuqvwpPR3jFH3p91SjH4LKsGfBQ2hdrc7",
    "Metaplex pNFT Mad Lads #1725: mutable, 2 creators",
  ],
};

const connection = new Connection(RPC_URL, "confirmed");
const names = Object.keys(FIXTURES);
const { context, value } = await connection.getMultipleAccountsInfoAndContext(
  names.map((name) => new PublicKey(FIXTURES[name]![0])),
);

mkdirSync(OUT, { recursive: true });
const index: Record<string, { address: string; owner: string; length: number; slot: number; note: string }> = {};
names.forEach((name, i) => {
  const info = value[i];
  if (!info) throw new Error(`${name} (${FIXTURES[name]![0]}) does not exist on this cluster`);
  writeFileSync(`${OUT}${name}.bin`, info.data);
  index[name] = {
    address: FIXTURES[name]![0],
    owner: info.owner.toBase58(),
    length: info.data.length,
    slot: context.slot,
    note: FIXTURES[name]![1],
  };
  console.log(`${name}: ${info.data.length} bytes, owner ${info.owner.toBase58()}`);
});
writeFileSync(`${OUT}index.json`, `${JSON.stringify(index, null, 2)}\n`);
console.log(`wrote ${names.length} fixtures at slot ${context.slot}`);
