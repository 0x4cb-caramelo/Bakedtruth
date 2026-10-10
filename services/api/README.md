# Read API (Sprint 08, hackathon MVP)

A read-only service for the site: the campaign list and each campaign, from a chain snapshot kept in memory. The site
never calls the RPC for lists; this service does, once every 15 s by default.

## Endpoints (`/api/v1`, GET only)

| Path                  | Returns                                                                                                                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/health`             | `status` (`starting`, `ok`, `stale`), `as_of_slot`, `taken_at`, `campaigns_total`, `last_refresh_error` (an error name, never a URL)                                                                                                                |
| `/campaigns`          | `campaigns` with `total`, `offset`, `limit`, `as_of_slot`, `chain_time`. Filters: `state` = `open`, `closed`, `in_review`, `paid`, `void`, `active` (open or closed), `resolved` (in review, paid or void); `limit` 1 to 100 (default 50); `offset` |
| `/campaigns/:address` | one campaign, or 404                                                                                                                                                                                                                                |

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

The SQLite indexer and its history, the activity, the leaderboard, points, price and names routes, the zod DTOs, the
relay (`brot-rpc`), and a public address. Those are the rest of Sprint 08 (`docs/sprints/sprint-08-indexer-api-points.md`).
The state "closed because the outcome is knowable" needs each metric account, so a campaign shows Open until its entries
close by time or epoch.

Tests: `bun test services/api` (no cluster).
