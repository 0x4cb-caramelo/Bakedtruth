# services/indexer — the indexer (Sprint 08, slice 1)

A copy of what the program did, in one SQLite file the indexer can rebuild from the chain (TP §4, Appendix B; proposal
§2.7). It reads only the chain and stores nothing about a visitor. The read API's routes, the ranking, the KPIs, the
evidence writer for `feed_history`, the snapshot, the alerts and the unit come in later slices.

## What it does

- **Lists** the program's signatures at `finalized`, newest first, back to its checkpoint (the newest signature listed),
  and keeps each with its place in the chain (`ord`). A failed transaction is kept as done and never read.
- **Reads** the pending ones oldest first (`getTransaction`, JSON, version 0) and decodes their events with the SDK's
  `decodeTransactionEvents`, under its four decoder rules, address lookup tables included.
- **Writes** each signature in one SQLite transaction: its events (`INSERT OR IGNORE` on the signature, the top-level
  index and the inner index), the projections of every campaign it touches, and the signature's own state.
- **Waits** when the node answers null for a transaction, so the chain's order holds; after five such answers it skips
  it and counts it. A call that fails (a timeout, a 429, a node down) only stops the refresh: an outage never costs a
  try. A campaign whose `seq` has a gap gets its own signatures listed and read again, once per refresh until it
  closes.
- **Points** come from the SDK's rule (`pointsTable`) over every event and what the live accounts say now
  (`campaignNow`), the same inputs `/api/v1/leaderboard` uses.

## Tables

| Table | Holds |
|---|---|
| `signatures` | Every listed signature: slot, place in the chain, failed or not, `pending`, `done` or `skipped` |
| `events` | Every event: key, slot, place, block time, name, campaign, opening, `seq`, JSON payload and its own bytes |
| `campaigns` | One row per opening of a campaign address (a closed id can open again): terms, status, pools, times |
| `entries` | Every `EntryAdded`, with the creator's own wallet flagged and both pools after it |
| `settlements` | Every payout that reached a wallet: a baker's, the creator's share, the prize back to whoever opened |
| `points` | Devnet points per wallet, with the campaigns entered and decided |
| `checkpoints` | The newest signature listed for the program |
| `feed_history` | Evidence (A-4), not rebuildable: created now, written from a later slice |

A file carries its schema version in `PRAGMA user_version`; a file of another version is refused, never migrated:
rebuild it.

## Run

```bash
INDEXER_RPC_URL=... INDEXER_DB_PATH=/path/outside/repo/indexer.sqlite bun services/indexer/src/main.ts
INDEXER_RPC_URL=... bun services/indexer/src/rebuild.ts /path/outside/repo/rebuilt.sqlite   # a new file only
```

`INDEXER_RPC_URL` carries the provider's key: keep it out of the repository and the logs (the indexer logs counts and
named errors only). `INDEXER_POLL_MS` (default 15000) and `INDEXER_TIMEOUT_MS` (default 20000) are optional.

## Tests

`bun test services/indexer` (no cluster: the file, the ingest against a scripted RPC) and `bun test tests/indexer`
(the program in LiteSVM: whole cycles, each live row against its account and vault, the rebuild, the points).
