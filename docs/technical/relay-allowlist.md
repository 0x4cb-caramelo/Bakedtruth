# The `/rpc` relay's allowlist, from a trace of the site

Sprint 11, 2026-10-10. The Technical Plan (§3.5) and the architecture proposal (§2.6) say the relay `brot-rpc` takes its
final allowlist "from a trace of the real client in Sprint 11". This is that trace, for Sprint 08's relay, which is not
built yet: until it is, the browser reads the RPC named by `NEXT_PUBLIC_RPC_URL` directly (the public devnet endpoint
by default, with no key).

**How it was taken.** `tests/site/relay-trace.test.ts` runs the site's own code against the program in LiteSVM behind
a recording JSON-RPC endpoint (`tests/site/fake-chain.ts`): the campaign page's reads (`load.ts`), the entry's
preparation (the SDK's `prepareJoin`), the hand-off to a stand-in wallet and the retry guard's watch (`submit.ts`,
`watch.ts`), the recent entries (`activity.ts`) and the SDK's `recheck`. The test fails when the client calls a method
this table does not list, or when a row the client's code should call was not seen. The rows marked "Wallet adapter"
are called by `@solana/wallet-adapter-react`'s web3.js connection, outside that trace.

**No WebSocket.** The client polls `getSignatureStatuses` and `getBlockHeight` every two seconds; no `*Subscribe`
method appears in the trace. The site's old `confirmTransaction` call (`app/lib/hooks.ts:228`) left with the old app in
Sprint 09.

## Methods

| Method | Called by | What it may read or carry |
|---|---|---|
| `getAccountInfo` | Page, SDK preparation, guard, recheck | The program's accounts (`Campaign`, `GlobalConfig`, `Entry`, owner `5Rx8…n8o`); the Clock sysvar; a metric account whose owner is one of the five readers' programs (Pyth receiver `rec2HH…`, SPL Token, Meteora DAMM v2, SPL Stake Pool, Vote); an `Entry` that does not exist yet answers `null`. Encoding `base64`, commitment `confirmed` |
| `getMultipleAccounts` | Page | The same accounts, up to three per call (campaign and config; then metric, the wallet's entry, the creator's entry) |
| `getLatestBlockhash` | SDK preparation | Commitment `confirmed`; its `lastValidBlockHeight` is what the retry guard saves |
| `simulateTransaction` | SDK preparation | One transaction whose top-level instructions are the program's (`user_join_campaign`); `sigVerify: false`, `replaceRecentBlockhash: true`, `innerInstructions: true`, encoding `base64` |
| `getMinimumBalanceForRentExemption` | SDK preparation | The sizes of a `Join` (96 bytes) and an `Entry` (116 bytes) |
| `sendTransaction` | Wallet adapter, and the trace's stand-in wallet | Only when a wallet lacks `signAndSendTransaction`: the adapter then sends the signed bytes through this RPC. The same program rule as `simulateTransaction`, plus known wallet-assertion programs such as Lighthouse (its id is to be confirmed, [E69]). A wallet with `signAndSendTransaction` (MWA's `sign_and_send_transactions`) sends through its own RPC, which the relay cannot gate |
| `getSignatureStatuses` | Guard | One signature per call, the one the wallet returned |
| `getBlockHeight` | Guard | Commitment `finalized`: past the saved `lastValidBlockHeight`, a join can no longer land |
| `getSignaturesForAddress` | Activity, recheck | A campaign account of the program; `limit` 20 for the activity; the SDK's recheck pages up to 1,000 at a time and stops at 10,000 |
| `getTransaction` | Activity, recheck | Signatures the previous call returned; encoding `json`, `maxSupportedTransactionVersion: 0`, commitment `confirmed` |
| `getBalance` | Wallet adapter | The connected wallet's own address |

## Not on the list

Every `*Subscribe` method (no WebSocket), `getProgramAccounts` (the read API lists campaigns, not the browser),
`requestAirdrop` (the faucet is a link), `getRecentPrioritizationFees` (the SDK sets no priority fee; the proposal lists
it for the keeper), and batches (one method per request).

## For the relay (Sprint 08)

- Account reads are allowed by owner, as the proposal says (D-i: no list of accounts): the relay returns an account only
  when its owner is the program, a reader's program, or a sysvar the client reads (Clock), and `null` when it does not
  exist.
- The re-check panel's commands go to whatever RPC a visitor chooses, not necessarily the relay; they use
  `getAccountInfo` with a `dataSlice`, and `getVoteAccounts` for the stake kind.
- The content security policy (`app/next.config.ts`) still allows the RPC's WebSocket origin. Nothing in the client
  opens it. Removing it is safe for this client; the deferred mobile tests should first check that Mobile Wallet
  Adapter on Android Chrome, which talks to the wallet app through a local WebSocket, is not blocked by `connect-src`.
