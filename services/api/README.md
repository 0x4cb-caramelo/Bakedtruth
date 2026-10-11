# Read API (Sprint 08, hackathon MVP; the leaderboard, Sprint 13)

A read-only service for the site: the campaign list and each campaign, from a chain snapshot kept in memory, and the
devnet leaderboard, from the program's own history. The site never calls the RPC for lists; this service does, once
every 15 s by default.

## Endpoints (`/api/v1`, GET only)

| Path                  | Returns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/health`             | `status` (`starting`, `ok`, `stale`), `as_of_slot`, `taken_at`, `campaigns_total`, `last_refresh_error` (an error name, never a URL)                                                                                                                                                                                                                                                                                                                                                         |
| `/campaigns`          | `campaigns` with `total`, `offset`, `limit`, `as_of_slot`, `chain_time`. Filters: `state` = `open`, `closed`, `in_review`, `paid`, `void`, `active` (open or closed), `resolved` (in review, paid or void); `limit` 1 to 100 (default 50); `offset`                                                                                                                                                                                                                                          |
| `/campaigns/:address` | one campaign, or 404                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `/leaderboard`        | devnet points (Sprint 13): `rows` (`rank`, `wallet`, `points`, `entered`) of the wallets with points, with `total`, `offset`, `limit`, `complete`, `rule`, `both_sides_score` (false: the founder's answer 3a, which also leaves out refunded pots and the creator's own wallet on a burn, lock or stake campaign), `as_of_slot`, `chain_time`. `limit` 1 to 100 (default 50); `offset`. No `wallet` parameter, and no success rate (the privacy review). 503 until the history's first read |

Health also says `leaderboard_complete` (`null` with no history; `false` while transactions wait for a later refresh or
after a failed one) and `leaderboard_skipped` (transactions that never read back after five tries).

**The leaderboard's source (Sprint 13, until the indexer):** every signature of the program at `finalized`, paged back
to the first, and each landed transaction read once and decoded by the SDK; only the events the points rule reads are
kept, in memory, in the order the signatures were listed. It runs on its own loop, so it never holds the campaign
snapshot, with a timeout on every call. A refresh asks only for signatures newer than the last one listed, remembers
every signature it listed, and reads at most `API_HISTORY_PER_REFRESH` transactions (default 200); one that does not
read back goes to the back of the queue and is skipped after five tries. A first start on a long history takes several
refreshes. A restart reads the history again. Set `API_HISTORY_RPC_URL` to read the history through another RPC (or
another key), so its bursts never spend the snapshot's rate limit: the public devnet RPC answers 429 under load, and a
429 on the snapshot turns health "stale", which hides the entry panel.

The rule is the SDK's `pointsTable`: 1 point per campaign entered on the side that won, once the result is final (the
6-hour review ended without a contest, or the campaign settled; a YES on a price campaign only once it settles, since
its late entries are known then). Each `CampaignOpened` starts a new campaign at its address, since a closed
campaign's id can be opened again.

**Leaving the ranking** (the privacy review, TP §8.2). A wallet's owner asks on X. The team asks for a message signed
by that wallet, for example `solana sign-offchain-message "Remove <address> from the Brot devnet leaderboard"`, and
checks it with `solana verify-offchain-signature` before adding the address to the file named by
`API_LEADERBOARD_HIDDEN`: a JSON array of base58 addresses, on the server, outside the repository, never committed and
never served (a public list of who asked to leave would itself disclose them). The API reads it again on every refresh;
a file that does not parse keeps the last good list. The chain itself cannot be changed; the ranking is Brot's view.

Amounts are lamport strings, times Unix seconds, addresses base58. An unknown parameter or a bad value is a 400
`{"error": {"code": "bad_query", "message": ...}}`. A request before the first snapshot is a 503.

## Run

```bash
cp services/api/.env.example /path/outside/repo/api.env   # fill it there, never in the repository
set -a; . /path/outside/repo/api.env; set +a
bun services/api/src/main.ts
curl -s http://127.0.0.1:4220/api/v1/health
```

## Not in this MVP

The SQLite indexer and its stored history, the activity, price and names routes, the zod DTOs, the
relay (`brot-rpc`), and a public address. Those are the rest of Sprint 08 (`docs/sprints/sprint-08-indexer-api-points.md`).
The state "closed because the outcome is knowable" needs each metric account, so a campaign shows Open until its entries
close by time or epoch.

Tests: `bun test services/api` (no cluster); the leaderboard against the program in LiteSVM: `bun test tests/api`.
