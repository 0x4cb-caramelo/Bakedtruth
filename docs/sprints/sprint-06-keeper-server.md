# Sprint 06 — Server and primary keeper (Bun check first)

**Status:** closed 2026-10-10 for the Hackathon MVP by the founder's decision; its open code items are built since
2026-10-13 (settlement behind `KEEPER_SETTLE`; batched reads; transaction landing; `/healthz`; the unit with its own
identity) and merged with PR #88 (`88a00f9`). The real resolve was observed: the keeper resolved the test campaign
`FmDo…` on its own on 2026-10-11, and since 2026-10-13 19:03 UTC the keeper runs under the existing unit with
`KEEPER_SETTLE=on` and has settled the two campaigns that were waiting ("After closure" below); release `88a00f9` until
2026-10-14 00:46 UTC, then `8af10e2`, which also settles sealed fees and re-reads contests (`deploy/vps/README.md`). Not tagged: blocked by
the founder (the tag), the server owner (one identity per unit; the new unit is not installed), D4 (the Hermes stream)
and P-7 (the conversion runbook) · **Branch:** `sprint-06-keeper-server` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B6, first half (TP §3.5, §7, §10, §11, §12) |
| Depends on | Sprint 05 |
| Requirements covered | BR-04 (the SOL refill runbook), BR-13 (automatic payout and the daily retry), BR-14 (a SOL-only keeper), BR-24 (the primary service) |

## Goal

Resolution and payout happen on their own. Before anything else, Bun 1.4.2 is checked on the shared server (D-p).
Then `brot-keeper` runs there: every 60 seconds it reads the open campaigns in batches, resolves what it can,
finalizes after the window, settles in batches and retries reserved credits, holding and spending only SOL. The units
move to one identity each, with secrets loaded as credentials, so that code running in one service cannot read
another's keys.

## Definition of done

- [x] **First step, on the server as the service user:** glibc 2.17 or newer, kernel 5.6 or newer recommended, SSE4.2
      in the CPU flags; the Bun 1.4.2 binary's checksum matches the pinned one. The result is recorded. If it fails,
      D-p goes back to the founder before anything else (proposal §2.1, TP C8). **Passed 2026-10-10**, as the `brot`
      user in `/var/lib/brot-markets/bun-check/` (nothing system-wide): Ubuntu's glibc 2.35, kernel 5.15.0-191, SSE4.2
      and AVX2 in the CPU flags; the zip matches the release's `SHASUMS256.txt` (`deploy/vps/bun-1.4.2.sha256`);
      `bun --version` prints 1.4.2 and `ldd` shows only the system's libc. The binary's SHA-256 is
      `a83d263767d839e4d2649ca8e35d07159c7afc99afdc96d731ced29e056dda0c`.
- [ ] `services/keeper/src` has `loop.ts`, `tasks/`, `health.ts`, `signer.ts`, `rpc.ts` and `landing.ts` (TP §3.2). The
      keeper keeps no state: it re-reads the chain each cycle, decides with the SDK's `read` half, builds with `tx`, and
      simulates before sending.
- [ ] **Its tasks** (proposal §1.7): resolve; `tally_late_joins` for every baker of a campaign with entries (the
      program refuses confirm and finalize with `NotTallied` until then, TP §3.4.19); `finalize_campaign` after
      `review_ends_at`; `settle_entry` in simulated
      batches, then `settle_creator_share`; a daily retry of reserved credits; then `collect_fee`, `settle_prize`,
      `close_campaign` and `sweep_fees`. Each is idempotent. The keeper never creates an account for anyone.
- [ ] **Batched reads:** every open campaign's metric account, 100 per `getMultipleAccounts`. **Price per feed, not
      per campaign** (proposal §2.5): with a Hermes key, it streams the feeds of open price campaigns, posts the signed
      update to its own account and resolves every touched campaign of that feed; with no key, it resolves when the
      sponsored account shows a touch, on devnet only.
- [ ] **Transaction landing** (proposal §2.6): simulate with `replaceRecentBlockhash` and drop failing instructions
      from a batch; set the compute limit from the simulation with a margin, under 1.4M; set the priority fee from
      `getRecentPrioritizationFees` over the written accounts, clamped between a configured floor and ceiling; send
      with `maxRetries: 0` and rebroadcast the same bytes every 2 s until `lastValidBlockHeight`; confirm with
      `getSignatureStatuses`.
- [ ] `GET /healthz` returns the last full cycle, the SOL balance, the pending items and the open campaigns against
      `max_open_campaigns`.
- [ ] `bun test services/keeper` covers: resolve, finalize, settle in batches, drop the failing instruction, retry a
      reserved credit, and never send to a destination the program did not fix.
- [ ] **Load:** with 1,000 open campaigns on Surfpool, one keeper cycle completes within 60 s (X1.8).
- [ ] **Per-unit identities** (T13, proposal §2.10), with the server owner's agreement recorded: `DynamicUser=yes` or
      one user per service; secrets through `LoadCredential=` from root-only `0600` files, never in the environment;
      `ProtectProc=invisible` and `ProcSubset=pid`; the landing unit's sandbox on every unit; `MemoryMax` and
      `CPUQuota`. `systemd-analyze security` scores are recorded per unit. No unit can read another's credentials
      (X1.6).
- [ ] The tunnel token leaves the unit's environment for a credential and is rotated; an alert on unknown connectors
      is set up [AC: the Cloudflare notification to use].
- [ ] `ss -ltn` shows port 4210 on `127.0.0.1` only. No new public port.
- [ ] `deploy/vps/push-deploy.sh` ships the Git package over SSH, builds the release in `releases/<sha>`, rolls back
      when health does not answer, and refuses a Bun binary whose checksum differs (X1.10). `deploy/vps/README.md`
      says where each secret lives and how to rotate it.
- [ ] **Runbooks:** the SOL refill of the keeper wallet from `fee_recipient` (a multisig transfer on mainnet, a
      team-held key on devnet), triggered by the low-SOL signal; the program upgrade, with clients and services
      tolerating both IDLs during the public wait. The monthly conversion half waits for P-7.
- [ ] **A Bun soak test** of the keeper passes and is recorded (X1.10).
- [ ] **A devnet campaign resolves and pays with nobody triggering anything,** using the drill constants (X1.1).
- [ ] After each change on the server, the neighbours' services are still up.
- [ ] Each item of "Carried over" below is done, or decided in writing with the reason.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The Bun check on the server, first (S).
- The keeper with batched reads and price per feed (M), and its transaction landing.
- Per-unit identities, credentials and the tunnel-token rotation (M).
- `deploy/vps/` with units, the deploy script and the runbooks; the soak test (S).
- The keeper's RPC provider chosen (T5, within D4).

## Out of scope

The standby, the watchdog, `POST /restart` and the email alerts (Sprint 07). The indexer and the relay (08). The site
(09). A paid Hermes plan (D4, before mainnet price campaigns, Sprint 16).

## Founder decisions that block the sprint

- **Answered 2026-10-10: D4 for the keeper's RPC account is Helius.** The key is a credential on the server and never
  in the repository. The starting tier is the proposal's Helius Developer (US$49 a month, for devnet); it is sized
  by credits measured in this sprint, not by the proposal's estimate. Q8 is folded into D4.
- **Open: the server owner's agreement** to one identity per unit, which changes the house pattern of one user per
  project (proposal §2.10).
- **Open: P-7 (treasury),** for the monthly conversion half of the SOL runbook. The refill half does not wait.
- **If the Bun check fails:** D-p goes back to the founder.
- **Answered:** Q11 (the domain is bought and on Cloudflare); the Hermes key waits for measurement ("ok",
  2026-10-05), and paid openings need no Pyth plan, since the SOL/USD account is free to read (D4).

## Direction of 2026-10-10

Given when the sprint was opened; it narrows the order of work and does not remove any item above.

- **Real values.** The keeper runs against the program already on devnet (`5Rx8…n8o`, deployed with the real
  constants, Sprint 05). The drill-constants run of X1.1 is not the target; the devnet run below is the real one.
- **Helius RPC** for the keeper (see the decision above).
- **MVP happy path first.** Order: one open campaign, its joins, its resolution, the finalize after the review window,
  the settlement and the payouts, all done by the keeper with nobody triggering anything, on devnet. The Bun check on
  the server comes before any of it, as the sprint says.
- **Later in this sprint, not claimed by the happy-path run:** the error paths beyond the tests listed, the load run
  of 1,000 campaigns, the Bun soak test, the per-unit identities and the tunnel-token rotation, the `deploy/vps/`
  script with its rollback. Each stays open in the list above until it is done or decided in writing.

## Agents and skills

- **Agents:** `technical-security-red-team-agent` (keys, the tunnel, the units, the credentials); `dev-product-agent`;
  `bug-triage-agent`; `coordinator-agent`.
- **Skills:** `sprint-management`, `secrets-discipline`, `secrets-scan`, `cost-watchdog` (the RPC plan),
  `verify-build-works`, `codemap`, `decision-log`, `release-check`.

## Security gates

- **Shared server:** no Docker, sudo or SSH for service identities; ports only on `127.0.0.1`; secrets only in
  root-owned files loaded as credentials; nothing installed system-wide.
- Restarts, `apt upgrade` and firewall changes only with notice to the other side. The other project's tunnel,
  database and email are not touched.
- The keeper wallet holds only SOL for network fees and has no privilege on-chain; it never receives fees
  automatically (A-1).
- The devnet `fee_recipient` and admin keys live on team machines, never on the server (proposal §2.10).
- The Sprint 04 randomized test is green on the deployed version (gate 1). `secrets-scan` at closure.

## Tests

`bun test services/keeper` with a simulated cluster; the load run on Surfpool; the drill on devnet with the real
service.

```bash
# first step, on the server as the service user
ldd --version | head -1; uname -r; grep -m1 -o -w sse4_2 /proc/cpuinfo
sha256sum -c deploy/vps/bun-1.4.2.sha256 && bun --version
bun test services/keeper
bun run scripts/load/open-campaigns.ts --campaigns 1000 --cluster surfpool   # to add: one cycle under 60 s
curl -fsS http://127.0.0.1:4210/healthz
systemd-analyze security brot-keeper.service
```

## Carried over

From the price-reader proof of Sprint 01 (`knowledge-base/tecnologia/pyth-leitor-de-preco.md`), re-read against
proposal §2.5.

- **Pyth's price service (Hermes) has required a key since 2026-08-26.** The Free plan has no API access, and
  Starter costs US$500 a month (proposal §2.5, E51). Posting our own proofs needs it; the key is a secret, loaded as
  a credential. Devnet runs without it, and mainnet price campaigns wait for it (D4).
- **Measure before building the publishing task.** The sponsored account updated every 5–11 s on mainnet and every
  62–64 s on devnet, in a one-to-two-minute sample. The keyed path stays behind a configuration switch [INF], and
  the measurement over days is recorded here.
- **The receiver charges zero lamports per update** on both clusters (Sprint 01). Posting costs the transaction fee
  and the account's rent.

From Sprint 03 and its record, "Carried to Sprints 04 and 05", and the founder's answers of 2026-10-09.

- **The keeper's proof task** is the only way a short touch gets proved on mainnet (D4, TP §3.4.8). Its design follows
  the Sprint 03 proof window (60 s, the slot bound).
- **Question 1, follow-up:** more Pyth feeds join the compiled list (Sprint 04) from this sprint on, and only once our
  own keeper keeps the feed's sponsored account updated. A feed joins the list only then; the list stays
  append-only, and the change is a reviewed code change.

From Sprint 05 (`docs/sprints/sprint-05-sdk-devnet-cycle.md`, "Record and retrospective").

- **The negative run on Agave's runtime.** Sprint 05 ran it on Surfpool `--offline` (LiteSVM), since
  `solana-test-validator` 3.1.10 needs AVX2 and the development machine lacks it. A CI job on GitHub's runners runs it
  on `solana-test-validator`, with the admin, resolve and settlement refusal suites too; the states the run writes by
  `surfnet_setAccount` come from `--account` preloads or real instructions instead.
- **A week of devnet price and clock data** (from Sprint 02's reviews, not done in Sprint 05): SOL/USD age, confidence
  and cadence, and `unix_timestamp` against wall time, in `knowledge-base/`, before mainnet values are set.
- **A runbook line for a Pyth migration** (from Sprint 02's reviews, not written in Sprint 05): the receiver, the push
  oracle and the shard are compiled constants, so a move by Pyth stops every price opening until an upgrade.
- **Drill or real constants on devnet.** This sprint's X1.1 asks for the drill constants; Sprint 05 deployed the real
  ones (`5Rx8…n8o`, Ronaldo's decision of 2026-10-09). A drill build needs its own artifact, then an upgrade or a second
  program.
- **The epoch turn on devnet** (the one devnet check Sprint 05 left): a `StakePoolTvlAtLeast` campaign opened on the
  deployed program before an epoch turn and resolved after it. It needs a stake pool on devnet (`seed:devnet` takes
  `--stake-pool`); devnet's epochs last about 28 hours at 235 ms slots.

## Risks

- Bun 1.4.2 may not run on the server's CPU or kernel (TP C8). Reduces: the check comes first; SQLite sits behind a
  small adapter, so a failed check reopens D-p without rewriting services.
- The server is shared. Reduces: limits per unit; if needed, only the `brot-*` units are stopped.
- One identity per unit changes the house pattern; without the owner's agreement, the tunnel token stays readable by
  every process of the same user (proposal §2.10).
- Without a Hermes key, a baker on NO can erase a short touch before the keeper resolves; devnet only.

## Expected artifacts

`services/keeper/`, `deploy/vps/` (units, `push-deploy.sh`, the checksum file, `README.md`, the runbooks),
`scripts/load/open-campaigns.ts`, `services/keeper/.env.example` with no values, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** the primary keeper live on devnet; per-unit identities on the server.
- **Session log:** the Bun check's result; what was installed and created on the server and the notice given; the
  owner's agreement; the RPC provider (T5) and its cost.

## Closure (2026-10-10, founder's decision)

The founder considers the sprint closed for the Hackathon MVP: the keeper is running and polling on the server, and the
logic is sound. The founder accepts that the on-chain resolve has not been observed; the test campaign `FmDo…` resolves
when its BTC/USD target is touched. The items below are not built. Each destination is a proposal, not yet approved by the
founder:

- The finalize, settlement and payout tasks, batched reads, and the Hermes price stream: Sprint 04's tasks wait for
  Sprint 14 and 16; the Hermes plan waits for D4 before mainnet (Sprint 16).
- Per-unit identities and the tunnel-token rotation: Sprint 16 (the server owner's agreement is still open).
- The Bun soak test and the load run of 1,000 campaigns: Sprint 16.
- The `deploy/vps` rollback script (`push-deploy.sh`): Post-Hackathon; the server was updated by hand on 2026-10-10.

### After closure: the real resolve and the unattended payout (2026-10-11 and 2026-10-13)

- **The real resolve was observed.** The keeper resolved `FmDoXD1qx2ZfLr71WjrHHxFhLqDRkA6s24je1YfCj1Ho` on its own on
  2026-10-11 at 15:59:17 UTC (`23agRJq8nJtzUjNy…`), with nobody triggering it; the server's journal and the chain show it.
- **The payout, unattended, on devnet.** On 2026-10-13, at Ronaldo's request, the keeper code of PR #88 (release
  `88a00f9`) went live under the existing unit with `KEEPER_SETTLE=on`, after a dry run on port 4239; the unit
  restarted at 19:03 UTC. The keeper then settled the two campaigns that were waiting: `FmDo…` (finalize `5Z5zdkN5…`,
  prize and fee `ZqDWtcrs…`, close `647Zc7S2…`) and `G6Un…` (finalize `3dRvL3Lz…`, prize and fee `4Ev4MJCH…`, close
  `4XEdx7xh…`). The release, the backup of the settings and the rollback are in `deploy/vps/README.md`.
- **Still open.** The new unit with its own identity is not installed: it waits for the server owner. The keeper
  read the public devnet RPC, which answered 429s (one on the confirmation poll of a transaction that landed); later
  the same day, at Ronaldo's request, its RPC became Helius devnet, the founder's D4 choice of 2026-10-10, with the
  key only in the server's settings file.

## Record and retrospective

Written 2026-10-10, before closure, at the founder's request to wrap up. **Not closed:** the closure gate
(`docs/SPRINTS.md`, section 4) is not met, and 17 of the 18 Definition-of-Done items are still open.

- **Done:** the Bun check on the server (passed, with the pinned hash); the keeper MVP in `services/keeper` (lists the
  open campaigns, simulates `resolve_campaign`, sends only what the program accepts, `/healthz` on loopback); the
  server unit `brot-keeper` (restarts on failure, sandboxed, port 4210 on loopback); the `ProofStale` diagnosis (the
  60 s proof window against devnet's 63 s price update), and the cycle set to 15 s; the test campaign `FmDo…` open on
  devnet.
- **Not done, and it would be a false claim to say otherwise:** no real `resolve_campaign` has been sent yet, because no
  price has touched the target of `FmDo…` (about 1.3% away at opening, four-day deadline). The happy path is running but
  unproven end to end. Also open: the finalization and settlement tasks; batched reads; the Hermes proof refresh (needs
  a key); per-unit identities; tunnel-token rotation; the Bun soak and load tests; the `deploy/vps` rollback script; the
  Carried-over list.
- **Decisions to record:** the RPC is the public devnet URL until the founder pastes the Helius Free Tier URL on the
  server; the server runs this branch's commit, not `main`; the cycle is 15 s on the server and 60 s in the code.
- **Retrospective:** the proof window is the real constraint, not the RPC or the key. A 429 after a send does not mean
  failure: check the signer's recent transactions before retrying.

### 2026-10-13, the carry-over (lane L07 of the lead's run, branch `sprint-07-keeper-carryover`)

Built and tested, not installed: settlement behind `KEEPER_SETTLE` (off unless exactly "on"): tally (a YES price
result only after its window, so the cut-off can still move to an earlier proof), finalize, `settle_entry` in batches,
the creator share, the prize, the fee, close and sweep, every destination the stored one, every lamport checked against
the SDK's math on LiteSVM (Split, OneSided, Refund by an outside cause, a house-failure void, a reserved creator share);
batched reads (one `getProgramAccounts`, `getMultipleAccounts` by 100: 1,000 open campaigns cost 14 RPC calls a cycle,
measured in process); landing (the compute limit from the simulation, a bounded priority fee, rebroadcast until the
blockhash expires, a failing instruction dropped from its batch); `/healthz` with pending work, `max_open_campaigns`
usage, exposure and the settle switch; the unit with its own user and `LoadCredential=` (the steps are in its header;
not to be copied to the server before them). 131 keeper tests pass. Open: the server owner's agreement and the
install; the founder's switch; concurrent landing for the Surfpool 1,000-campaign run (X1.8); `scripts/team/confirm.ts`
does not tally first.
