/**
 * Purpose: the re-check panel's commands (BR-23, "Anyone can re-check. Same account, same answer"; proposal §2.9): one
 *          JSON-RPC request that fetches the bytes the reader reads, at the reader's offsets, through any RPC; the
 *          Solana CLI's dump of the same account; and the SDK's `recheck(campaign, rpcUrl)` for a recorded result.
 *          Each command names only public data: the account, the campaign and an RPC URL with no key.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 *
 * Offsets follow the program's readers (programs/brot-markets/src/readers/*.rs) and the SDK's copies of them: a
 * `PriceUpdateV2` with Full verification has its price at byte 73; a classic mint its supply at 36 after the mint
 * authority's 36 bytes; a DAMM v2 pool its permanently locked liquidity at 552. A stake pool is Borsh with options,
 * so its field moves and the whole account is fetched; the epoch stake is a syscall, shown by `getVoteAccounts`.
 */
import type { KindName } from "./proof";

export type Command = { label: "curl" | "Solana CLI" | "SDK"; text: string };

/** The bytes each reader reads: [offset, length], or the whole account. */
export const SLICE: Record<KindName, readonly [number, number] | null> = {
  price: [73, 28], // price i64 · confidence u64 · exponent i32 · publish time i64
  burn: [0, 44], // mint authority COption (4 + 32) · supply u64 at 36
  lock: [552, 16], // permanent_lock_liquidity u128
  pool: null,
  stake: null,
};

/** How to read the fetched bytes, per kind. */
export const DECODE: Record<KindName, string> = {
  price: "Bytes 0–7: price (i64, little-endian) · 8–15: confidence · 16–19: exponent · 20–27: publish time.",
  burn: "Bytes 0–3: mint authority tag (0 = revoked, so the supply cannot grow) · 36–43: supply (u64, little-endian, base units).",
  lock: "Bytes 0–15: the liquidity locked for good (u128, little-endian). It only grows.",
  pool: "The pool's last_epoch_total_lamports (u64) follows its optional fields: the SDK's readStakePool walks them.",
  stake:
    "activatedStake is the vote account's stake this epoch, in lamports; the program reads it with sol_get_epoch_stake.",
};

const cliUrl = (rpcUrl: string, cluster: string) =>
  cluster === "devnet" && rpcUrl.includes("api.devnet.solana.com") ? "devnet" : rpcUrl;

/** The three commands for `kind`'s account, through `rpcUrl`. */
export function recheckCommands(a: {
  kind: KindName;
  account: string;
  campaign: string;
  rpcUrl: string;
  cluster: string;
}): Command[] {
  const slice = SLICE[a.kind];
  const body =
    a.kind === "stake"
      ? `{"jsonrpc":"2.0","id":1,"method":"getVoteAccounts","params":[{"votePubkey":"${a.account}","commitment":"confirmed"}]}`
      : `{"jsonrpc":"2.0","id":1,"method":"getAccountInfo","params":["${a.account}",{"encoding":"base64","commitment":"confirmed"${slice ? `,"dataSlice":{"offset":${slice[0]},"length":${slice[1]}}` : ""}}]}`;
  return [
    { label: "curl", text: `curl -s ${a.rpcUrl} \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}'` },
    {
      label: "Solana CLI",
      text:
        a.kind === "stake"
          ? `solana validators --url ${cliUrl(a.rpcUrl, a.cluster)} --output json`
          : `solana account ${a.account} --url ${cliUrl(a.rpcUrl, a.cluster)} --output json`,
    },
    {
      label: "SDK",
      text: `import { recheck } from "@brot/sdk/read";\n// once the result is recorded:\nawait recheck("${a.campaign}", "${a.rpcUrl}");`,
    },
  ];
}
