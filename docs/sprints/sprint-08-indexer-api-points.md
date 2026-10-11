# Sprint 08 — Indexer, API, relay and points

**Status:** in progress. The **hackathon MVP** (founder, 2026-10-10), the read API for Lucas's screens, is merged
(branch `sprint-08-read-api`). The **second part** (2026-10-11, branch `sprint-08-price-names-relay`): `/api/v1/names`,
`/api/v1/price` and `brot-rpc`, merged by PR #69, not deployed. The **indexer's first slice** (2026-10-11, branch
`sprint-08-indexer`): the SQLite file, the ingest, the projections, the points and the rebuild, built and tested, not
deployed · **Dates:** none, by the founder's decision

## Hackathon MVP scope (founder, 2026-10-10)

Lucas needs to list active and resolved campaigns without RPC calls in the browser. So the MVP is `services/api`, a
read-only service that takes a snapshot of the chain every 15 s, keeps it in memory and serves `/api/v1/health`,
`/api/v1/campaigns` (filter `state`, `limit`, `offset`) and `/api/v1/campaigns/:address`. Not in the MVP, and carried
to later sprints: the SQLite indexer and its ingestion, the activity, history, leaderboard, points, price and names
routes, the zod DTOs, `brot-rpc`, the partner file, and the Cloudflare cache rule. Its hosting is open: it runs on
loopback, and a public address needs a tunnel route, which the founder has set aside for now.

| | |
|---|---|
| Technical Plan block | B7 (TP §3.5, §4, §6, §8; Appendix B) |
| Depends on | Sprint 05; Sprint 06 to publish on the server |
| Requirements covered | BR-04 (the display price), BR-19 (the partner highlight), BR-26 (the creator's own-entry flag), BR-28 (the country gate in the relay), BR-29, BR-30, BR-31, BR-34, BR-35 (the volume measure), BR-44 |

## Goal

Give the site and the app what they cannot read straight from the chain: the activity, the history of each pot,
what each wallet received, the ranking, the points and the KPIs. The indexer is a small SQLite copy of the chain,
rebuilt from scratch if the file is lost, plus two evidence tables that are snapshotted. Next to it, `brot-rpc` is the
only path from a client to a paid RPC account, and it relays only what Brot's clients need.

## Definition of done

- [ ] `services/indexer/src` has `ingest.ts`, `db/` (SQLite in WAL mode through `bun:sqlite`, behind a small adapter,
      with one writer), `ranking.ts`, `points.ts`, `price.ts`, the KPIs and `api/` (TP §3.2). **Slice 1 (2026-10-11):**
      `ingest.ts`, `db/` and `points.ts`, with the listing, the projections and the rebuild beside them.
- [ ] **Ingestion** (proposal §2.7): `getSignaturesForAddress` for the program at `finalized`, paged back to the
      checkpoint and processed oldest first; `logsSubscribe` mentioning the program only as a wake-up hint; failed
      transactions skipped; events decoded by the SDK under the four decoder rules, lookup tables included; one SQLite
      transaction per signature (`INSERT OR IGNORE` on signature, top-level index and inner index; projections;
      checkpoint). A gap in a campaign's `seq` refetches that campaign's signatures. **Built (2026-10-11)** but the
      `logsSubscribe` wake-up: the ingest polls (`INDEXER_POLL_MS`, 15 s).
- [x] Tables of TP §4 and Appendix B: `events`, `campaigns`, `entries`, `settlements`, `points`, `checkpoints`, and the
      evidence table `feed_history`. **Done (2026-10-11)** (`services/indexer/src/db/schema.ts`); a campaign is keyed by
      (address, opening), since a closed id can open again; `feed_history` is written from a later slice.
- [x] **Rebuild:** deleting the file and rebuilding gives the same content as the live file, and its totals equal the
      on-chain `Campaign` accounts and vault balances (X1.3). **Done (2026-10-11)** (`tests/indexer/cycles.test.ts`).
- [ ] **`/api/v1`,** read-only (TP §6): the campaign list and each campaign, its activity and its history, the recent
      activity across campaigns (`/api/v1/activity`), a wallet's entries, the leaderboard, `/names`, `/price` and
      `/health`, under the D6 names. DTOs are zod schemas in the SDK's own `schemas` entry point
      (`@brot/sdk/schemas`; `read` and `tx` never import zod, a lint rule since Sprint 05), with contract tests. Every response carries `chain_time`; lists carry `as_of_slot`; `/health`
      returns `program_last_deploy_slot`, `schema_version`, `cluster` and `entries_allowed`. **Slice 2 (2026-10-11),
      in the indexer:** a campaign's activity and chance, `/api/v1/activity` and a wallet's entries, with their zod
      schemas in `@brot/sdk/schemas` (`indexer.ts`) and contract tests; the campaign list, the leaderboard, names,
      price and health stay in `services/api` until the indexer takes them over.
- [ ] Amounts are lamport strings, addresses base58, times Unix seconds in UTC. An unknown query parameter returns 400.
      An error returns `{ "error": { "code", "message" } }`, never a stack trace.
- [x] **`/api/v1/price`** serves SOL's price in US$, fetched every few minutes, with its source and time. It never
      reaches the program (D-f). **Done (2026-10-11)** on Pyth SOL/USD only: Ronaldo dropped CoinGecko the same day
      (2b), after the legal review found no plan whose terms can be met, so the planned CoinGecko source with Pyth as
      fallback is gone from the code.
- [x] **`/api/v1/names`** serves `content/account-names.json` (names reviewed by two people, A-11). **Done
      (2026-10-11)**, with the program's listed feeds and their sponsored accounts.
- [ ] **`content/partners.json`** exists, linking each launch partner's campaign (opened by a team key, P-3) to the
      partner, with its highlight dates; the ranking reads it. Sprint 10 adds the seal's display fields and Sprint 15
      the sponsors'. A JSON Schema check in CI covers `content/*.json`.
- [ ] A Cloudflare Cache Rule on `/api/v1`, with a cache key of the known parameters and `s-maxage` of 2–10 s, is
      shown to cache [AC].
- [ ] **Ranking and listing** (proposal §2.7): partner campaigns first during their 72-hour highlight; then two-sided
      campaigns by entries and time left; then one-sided ones; a campaign with no entry 24 hours after opening is
      unlisted from the home page and stays reachable. No rank input a creator can pay for, the prize included (X1.9).
- [ ] **Creator columns and KPIs** without personal data: `creator_is_team`; a flag on entries made by the creator's
      own wallet; campaigns opened by non-team wallets; paid openings per month (the N of P2 §5.2); two-sided,
      one-sided and empty campaigns; their share of volume; the 30-day return, the one-sided share, per-partner
      figures and campaigns resolved without error.
- [ ] **Points** (Q7): 1 point per campaign entered on the right side, never by volume.
- [ ] **The partner report** gives volume and wallet counts per partner, with no addresses.
- [ ] **`brot-rpc`** runs as its own unit with its own RPC account and a hard spending limit (T14), under the rules
      of proposal §2.6: allowlisted reads (the program's accounts, the caller's balance, the Pyth feeds, and metric
      accounts only when a reader accepts their owner); allowlisted methods; `sendTransaction` and
      `simulateTransaction` only for brot_markets, ComputeBudget and known wallet-assertion programs (the Lighthouse
      id recorded in Sprint 03); no batches; bodies of at most 8 KB; a weighted token bucket per IP and per IPv6 /64;
      a short-TTL cache; a daily credit budget; a join or opening refused when `CF-IPCountry` is on `GEO_BLOCK`.
      **Built (2026-10-11)** (`services/rpc/`), the country list empty by the founder's answer; **waiting** for the
      founder: the RPC account and its limit (D4), the unit installed, the tunnel's `/rpc` route, the site pointed at it.
- [x] `brot-rpc` refuses a foreign-program transaction, a batch, an oversized body, a join or opening from a blocked
      country, and a read of an account whose owner no reader accepts (X1.7, tests). **Done (2026-10-11)**
      (`services/rpc/tests/`); the last answers the account's owner and size with no data, as the allowlist allows, so
      the creation box can still say whose it is.
- [x] Rate limits are keyed on `cf-connecting-ip`, and per /64 for IPv6, in memory. No IP reaches a disk or a log.
      **Done (2026-10-11)** in the relay, with a sweep every ten seconds (an IP leaves memory about a minute after its
      last call).
- [ ] **Evidence and snapshots:** `feed_history` records every update of each sponsored feed with an open campaign; a
      nightly `VACUUM INTO` snapshot reaches VM 2 (T16).
- [ ] The alerts the indexer feeds (an entry by the creator's own wallet on a burn, lock or stake campaign; the gap
      between CoinGecko and Pyth is gone with 2b) reach Sprint 07's alert path, each with its runbook [INF].
- [ ] `brot-indexer.service` on `127.0.0.1:4201` and `brot-rpc.service` on `127.0.0.1:4202`, each with its own
      identity, credentials, `MemoryMax` and `CPUQuota`. The tunnel's main host routes `/api/v1` to 4201 and `/rpc` to
      4202 (TP §12); the domain itself still serves the landing until Sprint 09.
- [ ] Whether the visitor's country reaches the server through the tunnel (`CF-IPCountry`) is checked and recorded
      (TP §14.4 C9 [AC]); the relay's country gate depends on it.
- [ ] The public devnet faucet's limit is read and recorded (TP §14.4 C5 [AC]): it is the only brake on many wallets
      farming points.
- [ ] **Measured:** 20 entries made by the smoke script appear in the activity within 90 s (X1.4); `/api/v1/campaigns`
      p99 at or under 300 ms at the origin with 20 concurrent clients (X1.5); the failover drill of Sprint 07 repeated
      under `/rpc` load, with the standby taking over and the email in both inboxes (X1.2, in full); the per-method
      credit weights of each RPC account, recorded.
- [ ] The privacy audit is done (gate 5).
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The indexer with finalized ingestion (M), ranking and KPIs (M), the price history (S).
- The read API with its new endpoints (S), the Cache Rule (S).
- `brot-rpc` (M).
- Points, the partner report, the units and the `.env.example` files.

## Out of scope

The `referrals` table and the referral payout ledger (Sprint 14). Any write through the API, any sign-in, any admin
route: none exists. Visit analytics. The relay's allowlist refined from a trace of the real client (Sprint 11).

## Founder decisions that block the sprint

- **Answered:** Q7 (the working default of TP v0.0.1: 1 point per campaign entered on the right side, for devnet);
  D-e (CoinGecko for display and reports), replaced by 2b below.
- **Open: D4** for the indexer's RPC account and the relay's RPC account (with a hard spending limit).
- **Answered 2026-10-11 (Ronaldo):** the second part covers names, price, then the relay; the price from CoinGecko with
  Pyth as fallback, once a legal check of CoinGecko's terms allows it (it does not yet: off by default); the relay's
  country gate built but blocking nothing ("dont block nothing yet").
- **Answered 2026-10-11 (Ronaldo), after the legal review's questions:** **2b**, no CoinGecko: the display price is
  Pyth's, "native to Solana", and avoids the terms (the legal review of 2026-10-11 had read CoinGecko's terms of 5 Sept
  2025: "Powered by CoinGecko" on every plan, no use "for or to promote gambling", no re-distributed access, binding
  user terms first; none could be met); **3a**, the site moves to the relay the day the relay is installed, with the
  privacy text live the same day; **4a**, on devnet a US$ value shows only where it sets a cost in test SOL (the
  opening), never as a pot's value.

## Agents and skills

- **Agents:** `technical-security-red-team-agent` (the relay, the limits, the error messages); `dev-product-agent`;
  `legal-compliance-agent` (the privacy audit, CoinGecko's terms); `coordinator-agent`.
- **Skills:** `privacy-audit`, `sprint-management`, `cost-watchdog` (the RPC accounts and CoinGecko),
  `secrets-discipline`, `secrets-scan`, `codemap`, `verify-build-works`, `release-check`.

## Security gates

- The shared-server rules, as in Sprint 06. The other project's PostgreSQL is not used.
- The database decides no money (K-05), and the indexer and the relay import only the SDK's `read` half.
- No client receives a paid key (A-5): only `brot-rpc` reaches a provider for clients.
- `privacy-audit` before closing: the nine questions of TP §8, checked against the code.
- `secrets-scan` at closure.

## Tests

`bun test` for ingestion, the rebuild, each route, the limits, the error format, ranking and the relay rules; a
devnet comparison of the database's totals with the `Campaign` accounts.

```bash
bun test services/indexer
bun test services/rpc
bun run --cwd services/indexer rebuild && bun run --cwd services/indexer verify     # to add
bun run smoke:devnet -- --entries 20 --assert-activity-within 90                    # to add
bunx autocannon@<pinned> -d 30 -c 20 -j http://127.0.0.1:4201/api/v1/campaigns | jq '.latency.p99'
systemd-analyze security brot-indexer.service brot-rpc.service
```

## Carried over

From Sprint 05 (`docs/sprints/sprint-05-sdk-devnet-cycle.md`, "Record and retrospective").

- **`CampaignFinalized` from the team's finalizing paths: done on 2026-10-09** (PR #44, merged): `team_confirm_result`
  and `team_void_campaign` emit their own event, then `CampaignFinalized` with the next seq, built by the same
  `snapshot::finalized_event` as `finalize_campaign`. The indexer can follow events for every finalized campaign; the
  smoke expects the two events (`scripts/validator/cycle-settle.ts`).
- **The import rules reach the services.** `read-services-import-read-only` cannot fire before `services/indexer`
  exists; when it does, plant a violation in `tests/sdk/boundaries.test.ts`, and add dependency-cruiser `reachable`
  rules, since the rules see direct imports only.

## Risks

- Many wallets can inflate the points ranking. Reduces: points by correct calls, never by volume; the Seeker Genesis
  Token stays an optional signal outside the MVP (proposal §3.7).
- `bun:sqlite` with one writer and several readers (TP C8). Reduces: WAL mode and the adapter.
- Seconds of delay on screen, because data passes through the database. A baker sees their own pending transaction
  through its signature status (proposal §2.7).
- RPC credit weights per method are unverified [AC]; `/rpc` grows with visitors. Reduces: one account per service and
  a hard limit on the relay's.
- Rebuilding assumes the RPC keeps archival history; the nightly snapshot covers the evidence tables.

## Expected artifacts

`services/indexer/`, `services/rpc/`, the units in `deploy/vps/`, `content/account-names.json`, `content/partners.json`
and the JSON Schemas, the `.env.example` files, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** the indexer, the `/api/v1` read API, the `brot-rpc` relay, points and KPIs.
- **Session log:** the measured credit weights; the CoinGecko plan; the privacy audit's result.

## Record and retrospective

### The second part (2026-10-11, branch `sprint-08-price-names-relay`)

- **`/api/v1/names`** (`services/api/src/names.ts`): the reviewed names of `content/account-names.json`, checked by the
  SDK's `parseAccountNames` (moved from the site, so the site, the API and the app share one set of rules), and the
  program's 17 devnet feeds with their sponsored accounts. A missing or broken file keeps the last good list, and
  health names the error.
- **`/api/v1/price`** (`price.ts`, `price-source.ts`): SOL in US$ for display only, from Pyth SOL/USD; source, times,
  staleness and the attribution in each answer; a failed read keeps the last price; none older than a day. CoinGecko's
  `simple/price` was built first behind `API_COINGECKO=on`, with Pyth as fallback, and removed after 2b (below).
- **`brot-rpc`** (`services/rpc/`): the eleven methods of the trace with their arguments and options; transactions
  with only the program, ComputeBudget and Lighthouse at the top level; account answers cut by owner, an unaccepted
  owner's account answered with its owner and size but no data, ProgramData only as a 45-byte slice; a token bucket
  per IP and per IPv6 /64, swept every ten seconds so an IP leaves memory about a minute after its last call; a daily
  budget; a short cache for other programs' accounts and the sysvars only; the country gate built with an empty
  list; counts-only logs. The unit `deploy/vps/brot-rpc.service` is written, not installed.
- **The SDK:** the read half gained ComputeBudget (moved from `tx`), Lighthouse and the join and open discriminators,
  checked against the generated client (`tests/sdk/contract-relay.test.ts`); the boundaries test plants the import
  rule's violation in the relay too. The root typecheck, which CI runs, covers `services/` now.
- **The web smoke through the relay** (`E2E_RELAY=1`): the first run found a real defect, a cached `GlobalConfig` that
  kept showing a pause that had ended after a reload, and a harness bug; with both fixed, the whole smoke passes
  through the relay, as without it.
- **A race in a Sprint 12 scene**, seen once in the smoke without the relay: after "Receive", the success line lasts
  only until the page reads the chain again, and on the local chain that read can finish before the check looks. The
  scene now checks what stays, the share paid and no button left (`tests/e2e/states.e2e.ts`). CI does not run the web
  smoke, so it never failed there.
- **The relay's health check** answered 403 once the tunnel's secret was set, so step 6 of the server procedure could
  not pass without typing the secret. `GET /healthz` now answers on the server without it, and never a request that
  came through Cloudflare (`cf-connecting-ip` set).
- **The relay's Bun binary.** The security review's fix (M5) gave the relay the keeper's binary through a shared
  group, but that binary sits in `brot`'s home, `/var/lib/brot-markets` (`0750`, with the waitlist), which the
  relay's user cannot enter: the unit would not have started. The relay now runs its own root-owned copy of the pinned
  binary (`/usr/local/lib/brot-rpc/bun`, compared byte for byte with `cmp`), and nothing of the running keeper
  changes.

- **The founder's answers (Ronaldo, 2026-10-11), applied in PR #69:** 2b, no CoinGecko, so its source, its settings,
  the gap between sources and `attribution_url` left the code and `/api/v1/price` reads Pyth only; 3a, the site moves
  to the relay the day it is installed; 4a, on devnet US$ only where it sets a cost (the plan, Sprint 10's carried
  item and Sprint 18 updated). He approved `content/README.md` as a reviewer; since the change was made at his
  request, the `content/` rule's second person is still Lucas or Bernardo (open).

**Reviews:** the legal and privacy review (`docs/legal/2026-10-11-sprint-08-legal-review.md`) turned CoinGecko off by
default and asked for the relay's timed sweep (R1), both applied; its policy text waits for the day the site moves to
the relay. The security review (`technical-security-red-team-agent`) found nothing high and six medium items, all
applied: a hostile option value (or, in the read API, `?state=constructor`) could make the service answer with a full
stack trace (now typed options, a catch-all and `development: false`, the keeper's health server too); a local process
could forge Cloudflare's headers (now a secret header the tunnel adds); one source could spend the shared daily budget
(now a /48 bucket and a reserve for the signing path, with Cloudflare's rate rule a precondition of the route); the
unit could not run the Bun binary as its own user, and its key sat in the environment (now `LoadCredential=`, and the
relay's own root-owned copy of the pinned binary; the shared group first written could not reach the keeper's, as
above). Its four low items too: typed options, the 8 KB socket limit, no `*` CORS origin, a cap on
CoinGecko's answer.

### The third part: the indexer (2026-10-11, branch `sprint-08-indexer`, slice 1)

- **The file** (`services/indexer/src/db/`): bun:sqlite in WAL mode, one writer, the schema version in
  `PRAGMA user_version`; a file of another version, or one that is not the indexer's, is refused, never migrated.
  Appendix B's tables, with three changes the chain forced: `campaigns` is keyed by (address, opening), since a closed
  campaign's id, and so its address, can carry a new campaign; `signatures` keeps each listed signature's place in the
  chain (`ord`), since a slot holds many transactions; each event keeps its own bytes (`raw`), which the SDK decodes
  again exactly. `settlements` has no `reserved`: a reserved creator share emits no event, so every row is a payment.
- **The ingest** (`ingest.ts`, `listing.ts`): the program's signatures at `finalized`, newest first and paged back to
  the checkpoint (a node that ignores `until` is cut there; a short page does not end the listing); read oldest first;
  one SQLite transaction per signature with its events (`INSERT OR IGNORE`), the projections of the campaigns it
  touches and its state. A transaction the node answers null for holds the later ones for up to five tries, then is
  skipped and counted; a call that fails (a timeout, a node down) only stops the refresh, so an outage never makes it
  skip; a gap in a campaign's `seq` lists that campaign's own signatures again, each refresh until it closes, with one
  more read of a skipped one.
- **The projections** (`project.ts`, `campaign-row.ts`): each address rebuilt whole from its events, split into
  openings at each `CampaignOpened` and folded in `seq` order the way the program moves its account; entries with the
  creator's own wallet flagged; a settlement for each payout to a baker, the creator or whoever opened.
- **The points** (`points.ts`, `live.ts`): the SDK's `pointsTable` over every event and the live accounts judged by
  `campaignNow`, which moved from the read API's leaderboard into the SDK so both use one rule.
- **The rebuild** (`rebuild.ts`): the whole history into a new file; it refuses an existing path.
- **Tests:** 10 with no cluster (the file; the ingest against a scripted RPC) and 6 on LiteSVM (four whole cycles; each
  live row against its account and vault; a closed campaign that paid out what it took in; each baker's settlement is
  what reached the wallet; the rebuild equals the live file; a second refresh changes nothing; the points equal the
  leaderboard's). The LiteSVM run found that `EntryAdded.isFirst` marks the pot's first baker (Q3), not a wallet's
  first entry, so the open entries are counted by wallet.
- **Not in this slice:** the `/api/v1` routes over the file, the zod DTOs, the ranking and `content/partners.json`, the
  KPIs and the partner report, `feed_history` and the nightly snapshot, the alerts, `logsSubscribe` and the unit.

### Slice 2: the read routes (2026-10-11, same branch, after the merges of #69, #70 and #71)

- **The branch, replayed.** Slice 1's three commits were replayed on `main` after PR #71 (`92f86f7`); the old base is
  kept locally as `sprint-08-indexer-5bf3636`. Draft PR #72.
- **The schemas** (`packages/sdk/src/schemas/indexer.ts`): an entry, a settlement and any other event as one
  discriminated union; a campaign's activity; the split after each entry; the recent entries; a wallet's entries; the
  error. The read API's conventions: lamports and slots as decimal strings, addresses base58, `as_of_slot` and
  `chain_time` on every answer.
- **The queries** (`services/indexer/src/api/queries.ts`): chain order is (slot, place, instruction, inner), so a
  signature listed late for a gap still sorts by its slot; the other events are those that are neither an entry nor a
  settlement row; `as_of_slot` is the last slot read in full (a pending signature holds it back).
- **The routes and the server** (`routes.ts`, `server.ts`): GET only; an unknown parameter, a bad address or number is
  a 400, an unknown campaign or opening a 404, never cached; answers cached 5 s at the edge (`s-maxage=5`); served from
  the ingest's own handle on `127.0.0.1:4201`, with `/healthz`.
- **Tests:** the routes over a hand-built file, each answer parsed by its schema (the contract), every refusal; the
  settings and the running server; and on LiteSVM, the routes over the four cycles (each live split ends at its
  account's pools, each activity opens with `CampaignOpened` and holds each entry once, each baker's entries and what
  reached it). The hand-built test found the recent entries coming oldest first: a single `DESC` turned only the last
  column of the order. The cycles moved to `tests/indexer/cycles-world.ts`, shared by both LiteSVM files.
- **Open:** who reaches the routes from outside. The live read API (`services/api`, `brot.markets/api/v1`) does not
  serve them yet: it can call the indexer on loopback for these four paths, or the tunnel can send them to port 4201.
