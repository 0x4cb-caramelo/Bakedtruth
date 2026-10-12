# brot-rpc, the `/rpc` relay (Sprint 08)

The only path from a browser or the app to a paid RPC account (TP §3.5, T14; A-5: no client holds a key). It relays
one JSON-RPC 2.0 call per POST, and only the calls Brot's clients make: the eleven methods of
`docs/technical/relay-allowlist.md`, the trace of Sprints 11 to 19, with the arguments the trace saw. It runs on
`127.0.0.1:4202`, behind the tunnel's `/rpc` route, with its own unit (`deploy/vps/brot-rpc.service`), its own
identity and its own provider account, so `/rpc` traffic can never starve the keeper or the read API.

## What it checks, in order

0. **The tunnel's secret:** with `RELAY_TUNNEL_SECRET_FILE` set, a call without Cloudflare's `x-brot-tunnel` header
   (or with another value, compared in constant time) is refused, so no local process can pose as a visitor and forge
   `cf-connecting-ip` or `cf-ipcountry`.
1. **The body:** at most 8 KB (`RELAY_BODY_MAX`); a batch (a JSON array) is refused.
2. **The method:** one of `getAccountInfo`, `getMultipleAccounts`, `getBalance`, `getBlockHeight`,
   `getLatestBlockhash`, `getMinimumBalanceForRentExemption`, `getSignatureStatuses`, `getSignaturesForAddress`,
   `getTransaction`, `simulateTransaction`, `sendTransaction`. Every subscription, `getProgramAccounts` and the rest
   are refused before the upstream sees them.
3. **The arguments** (`src/allowlist.ts`): addresses and signatures in base58, at most 100 accounts and 16 statuses per
   call, `limit` up to 1,000, the options the trace used and no other (`simulateTransaction`'s `accounts` option, which
   would return any account's data, is refused), base64 for accounts and transactions, `json` for `getTransaction`;
   every option's value typed before it is read (a commitment is one of three strings, a flag a boolean, a slot a
   whole number, `maxRetries` at most 5, `maxSupportedTransactionVersion` 0).
4. **A transaction's programs** (`src/transaction.ts`): every top-level instruction belongs to this program,
   ComputeBudget or Lighthouse; the System Program only as the program's own CPI; never a program named through a
   lookup table.
5. **The country gate:** a join or an opening is refused when Cloudflare's `CF-IPCountry` is on
   `GEO_BLOCK_COUNTRIES`. **The list is empty, so nothing is blocked** (the founder, 2026-10-11). Filling it is the
   founder's decision (K-11, C-11), and only once the header is shown to reach the server through the tunnel (TP §14.4
   C9). On Android the wallet submits through its own RPC, so the gate covers simulation there, not submission.
6. **The client's token bucket** (`src/limits.ts`): keyed by `cf-connecting-ip`, an IPv6 address by its /64, with a
   second bucket per /48 eight times as wide, so one customer's /64s cannot each start full; weighted per method (a
   working guess until each provider's credit weights are measured, TP C32 [AC]); in memory only, swept every ten
   seconds, so an IP leaves memory about a minute after its last call.
7. **The short cache:** a metric account (another program's) or a sysvar for `RELAY_CACHE_MS` (1.5 s by default), the
   rent table for a minute; **never** the program's own accounts (a page acts on its config, campaigns and entries: the
   web smoke through the relay saw a cached config keep showing a pause that had ended), a missing account,
   ProgramData, a signature status, the block height or a blockhash, which the retry guard decides on.
8. **The daily budget:** at most `RELAY_DAILY_BUDGET` credits a UTC day, every client together, a tenth of it kept for
   the signing path (`sendTransaction`, `simulateTransaction`, statuses, heights, blockhashes), so a flood of reads
   still leaves bakers able to sign; a cached answer spends none. One source could still spend the reads' share: the
   Cloudflare rate rule on `/rpc` is a precondition of the route (`deploy/vps/README.md`, "The relay").

Then the upstream. Account answers are cut by owner (`src/accounts.ts`, D-i: there is no list of accounts): an
account owned by the program, a reader's program (the Pyth receiver, SPL Token, Meteora DAMM v2, SPL Stake Pool,
Vote) or the Sysvar program comes back whole; any other comes back with its owner and size but no data, so the
creation box can still say whose it is. The program's ProgramData is the one exception by address (A-8): only as a
slice of offset 0 and at most 45 bytes.

## Answers

JSON-RPC 2.0, the client's own `id`. Refusals are JSON-RPC errors: `-32700` not JSON, `-32600` not a call, a batch or a
body too large (HTTP 413), `-32601` a method not relayed, `-32602` arguments or options not relayed, `-32001` too many
requests (HTTP 429), `-32002` the daily budget spent (HTTP 503), `-32003` a program the relay does not carry, `-32004`
a join or an opening from a blocked country, `-32000` the network busy or not answering (HTTP 503 or 502), `-32603`
anything that threw (HTTP 500), with no detail of the upstream and never a stack trace (the server runs with
`development: false`); a call without the tunnel's header, HTTP 403. The upstream's own JSON-RPC errors pass as they
are. `GET /healthz`, the operator's check on the server: the budget left, the cache's and the buckets' sizes. It needs
no tunnel header, and a request that came through Cloudflare (`cf-connecting-ip` set) never gets it.

**Privacy.** The relay keeps the client's IP only as a bucket's key, in memory, and drops an idle bucket; it logs one
line a minute with counts by outcome and the budget left, never the upstream URL, an IP, a header or a parameter.

## Run

```bash
cp services/rpc/.env.example /path/outside/repo/rpc.env   # fill it there, never in the repository
set -a; . /path/outside/repo/rpc.env; set +a
bun services/rpc/src/main.ts
curl -s http://127.0.0.1:4202/healthz
```

Not yet: the unit installed on the server, the tunnel's `/rpc` route, the relay's own RPC account with its spending
limit (D4), Cloudflare's two rules, and the site pointed at `/rpc` (`NEXT_PUBLIC_RPC_URL`). Those are the founder's
steps, in the order of `deploy/vps/README.md` ("The relay").

Tests: `bun test services/rpc`, with an in-process fake upstream and no cluster.
