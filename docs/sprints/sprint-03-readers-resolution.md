# Sprint 03 — Readers and resolution; Anchor leaves the workspace

**Status:** done, merged into `main` with PR #40 on 2026-10-09; tagged `sprint-03` · **Branch:** `sprint-03-readers-resolution` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B3 (TP §3.4.6, §3.4.8, §3.4.10 for the other four kinds; §3.2 and §10 for the frozen program leaving) |
| Depends on | Sprints 01 and 02 |
| Requirements covered | BR-01 and BR-02 for the other four kinds; BR-05, BR-06 (the lock on the fact), BR-21, BR-22, BR-23 (the program reads and compares), BR-39 |

## Goal

The program reads the result by itself. The four readers of `pred-provable` are ported to Pinocchio next to the price
reader; `user_open_campaign` accepts all five kinds; `resolve_campaign` records the outcome and opens the six-hour
window; joining locks once the outcome is knowable. The price reader gets its split: on joining, only the sponsored
account; for a YES, any fully verified account of the feed; and a stale feed voids instead of turning to NO (D7).
Then the frozen program leaves, and Anchor with it.

## Definition of done

Each item carries its evidence: a test name or filter, a command and its result, or a commit. "Record and
retrospective", at the end of this file, holds the tables (lanes, measurements, parity, X0.9, reviews).

- [x] `readers/` holds one file per reader, under 200 lines: `spl_mint.rs` (`SupplyAtMost`), `damm_v2.rs`
      (`DammV2LockedAtLeast`), `stake_pool.rs` (`StakePoolTvlAtLeast`), `vote_stake.rs` (`StakeAtLeast`),
      `price_touch.rs` (`PriceTouch`) and `cursor.rs`. Each exposes `validate_at_creation`, `outcome_knowable` and
      `try_resolve`, and checks owner and layout before reading. `ReaderKind` is closed at five.
      Evidence: `programs/brot-markets/src/readers/` (also `mod.rs`, the dispatcher; `shared.rs`, the fact table and
      the minimum distance; `epoch.rs`, the schedule; `price_update.rs`, the Pyth layout; `price_touch/{rules,target,
      proof}.rs`). No file above 200 lines; `ReaderKind::try_from` refuses a sixth byte (`UnknownReaderKind`).
- [x] Each reader passes on the real accounts of `tests/fixtures/*.bin`. A truncated, stretched or zeroed account
      returns an error, never a panic.
      Evidence: host tests `readers_spl_mint`, `readers_damm_v2`, `readers_stake_pool`, `readers_vote_stake`,
      `price_reader` (`*_are_errors_never_panics`, `reads_the_real_*`); `bun test tests/ -t "readers match fixtures"`
      (11 LiteSVM tests on the captured bytes written into the cluster).
- [x] Each ported reader gives the same result as the original in `pred-provable` on the same account, run before
      the original leaves. Ported files keep the MIT notice.
      Evidence: `bun test tests/parity/` at `c1dafa9`, 62 of 62, with every difference asserted with its reason; the
      two tables are kept in [`sprint-03-parity.md`](sprint-03-parity.md), because the suite left with the original.
      The MIT notice is in the header of the four ported files.
- [x] **`user_open_campaign` for the other four kinds** refuses rows 1 to 3 of TP §3.4.10 with their own
      errors: a kind outside the five; an account the reader rejects (owner, size, discriminator); a target already
      met or too close to the current value, with the minimum distance per kind set and recorded here [AC]. A
      Token-2022 mint is refused for the burn kind. `StakeAtLeast` stays closed until a devnet YES is recorded; how (a
      kind switch in `GlobalConfig` or a build flag) is decided here [AC].
      Evidence: `bun test tests/ -t "open campaign refuses"` (the other four kinds: 9 tests; `opens the other four
      kinds`: 3). Minimum distance: 1% of the current value for every kind (`MIN_DISTANCE_BPS_*`, `constants.rs`),
      measured from the edge of the confidence band for the price kind; a target at or below zero on an "at least"
      kind is already met [AC]. `StakeAtLeast` is closed by the build feature `stake-at-least`, off in every build and
      refused together with `mainnet` at compile time (`ReaderKindNotOpen`); no key can open it [AC].
- [x] **The epoch kinds and the duration rule** [AC] (TP §3.4.8). The TP's working reading [INF] is built and tested:
      the creator also passes `deadline_at`; the epoch must start before it; entries close at the earlier of
      `entries_close_at` and the epoch's start; a missed epoch voids as `MissedWindow`.
      Evidence: `readers/epoch.rs` (the `EpochSchedule` sysvar through `sol_get_sysvar`; `first_slot` matches
      Agave's over about 3,000 epochs of 7 schedules), `stake_pool.rs`, `vote_stake.rs`; host `readers_epoch`,
      `readers_stake_pool`, `readers_vote_stake` (18 tests); `bun test tests/ -t "readers match fixtures: the epoch
      kinds"`. The epoch must be in the future (`EpochAlreadyStarted`) and start, at 500 ms per slot
      (`EPOCH_START_SLOW_SLOT_MS` [AC]), no later than the deadline (`EpochAfterDeadline`). The join lock is
      `clock.epoch >= E`. A stake-pool snapshot of E read after the deadline counts; one overwritten by E + 1, or never
      written, voids as `MissedWindow` (the frozen program said NO).
- [x] **`resolve_campaign`** accepts only a top-level call (`checks::top_level`, with its negative test), records
      `InReview`, `outcome`, `observed_value` and `review_ends_at = now + 6 h`, and emits `CampaignResolved` with the
      value read; for a price campaign, also `publish_time`, `posted_slot` and the proof account.
      Evidence: `instructions/resolution/resolve_campaign.rs` and `resolve_campaign/record.rs`; `checks/top_level.rs`
      (`sol_get_stack_height`); `bun test tests/ -t "resolve refuses a cpi"` through the test-only program
      `tests/programs/cpi-proxy` (6071, nothing changes; the same instruction sent directly succeeds);
      `bun test tests/ -t "resolve refuses"` (11 other refusals); host `resolve_record` (the bytes written, nothing
      written on overflow). X0.9 for `top_level`: `scripts/checks-mutation.mjs`, 2026-10-09, exit 0.
- [x] **The resolution table of TP §3.4.6 as test cases:** `Yes` before the deadline; `No` after it; `met_late`;
      `Void` for `MissedWindow`, `UnreadableAccount` and `StaleFeed`.
      Evidence: `bun test tests/ -t "resolution table"` (15 LiteSVM tests: YES for supply, DAMM, price and stake
      pool; NO for supply, price and stake pool; `met_late`; three `MissedWindow`; two `UnreadableAccount`;
      `StaleFeed`; two `NotResolvableYet`); host `readers_shared::the_resolution_table_of_the_irreversible_facts`.
- [x] **The price split** (proposal §2.5, TP §3.4.8). Joining a price campaign accepts only the sponsored account,
      derived on-chain from the push-oracle id, shard 0 and the campaign's feed: owner `rec2HH…`, 134 bytes, Full
      verification, the right feed, age at most the campaign's `max_age` (copied from `campaign_max_age` at opening,
      never below 30 s); it refuses when price plus confidence reaches the target. A YES proof accepts any Full
      `rec2HH…` account of the feed whose `publish_time` is inside the campaign's window, at most 60 s old, within a
      bound on `Clock::slot − posted_slot` whose value is set here [AC], with price minus confidence across the target
      in the campaign's direction.
      Evidence: `readers/price_touch/{rules,proof}.rs`; `bun test tests/ -t "price join accepts only the sponsored
      account"`, `-t "yes proof window"`; host `price_join` (11), `price_proof` (11), `price_math` (6). Slot bound
      [AC]: `Clock::slot − posted_slot <= ceil(age_seconds × 1000 / MIN_SLOT_MS)` with `MIN_SLOT_MS` = 100, a posted
      slot ahead of the clock counting as now; the same rule at opening (SOL/USD and the campaign's feed), at join and
      for the proof (`price_touch::rules::posted_within`). A proof's exponent must equal the stored one.
- [x] **`StaleFeed` (D7):** after the deadline with no proof, the outcome is NO, unless the sponsored feed's last
      update before the deadline is older than `deadline − max_age`; then the campaign is voided with `StaleFeed`.
      The exact test is written here [AC].
      Evidence: `price_touch/proof.rs`; host `price_stale_feed` (11); the LiteSVM `StaleFeed` row of the resolution
      table. The exact test [AC]: after `deadline + 60 s` with no valid proof, the sponsored account is read; if its
      `publish_time <= deadline` **and** `publish_time < deadline − max_age`, Void `StaleFeed`; otherwise NO. The TP's
      sketch with `prev_publish_time` could not be built: in all five captured accounts that field is `publish_time −
      1`, Pythnet's previous aggregate, not the account's previous write [F]. NO is recorded only from `deadline + 60
      s` (`PROOF_DELAY_SECONDS`), so nobody records NO in front of a valid YES proof [AC].
- [x] Price math runs in `i128` or through `try_from`, and is tested with a negative price, the largest confidence,
      an unexpected exponent and a `publish_time` ahead of the cluster clock (no overflow, no refusal of a good price).
      Evidence: host `price_math`, `price_target`, `price_reader::extreme_times_give_an_answer_never_a_panic`,
      `readers_shared::min_distance_overflows_into_an_error_never_a_panic`. Clippy denies unchecked arithmetic and
      truncating casts in the crate.
- [x] `user_join_campaign` refuses once `outcome_knowable` says the outcome is known (BR-06).
      Evidence: `instructions/entries/join_lock.rs`; `bun test tests/ -t "join refuses once the outcome is knowable"`
      (10 tests, the five kinds and an unreadable metric account, which refuses the join).
- [x] A test on a live cluster or in Surfpool shows that the sponsored account only moves forward [AC].
      Evidence: lane R, `knowledge-base/tecnologia/pyth-leitor-de-preco.md`, "Sprint 03": the receiver's source and
      the live watch of the SOL/USD and BTC/USD sponsored accounts on devnet and mainnet (what was observed and its
      limits are in the note).
- [x] **Surfpool 1.6.0** is pinned in CI with the binary's SHA-256 checked, and the price reader runs inside an
      instruction against its `PriceUpdateV2` model, with a scenario that moves the price across the target. Whether
      it simulates epoch stake is recorded.
      Evidence: `.github/workflows/ci.yml` ("Install Surfpool", archive and binary SHA-256 checked before anything is
      extracted or run; "Price reader on Surfpool"); `scripts/surfpool/price-touch.ts`. Locally on 1.5.0, on the
      integrated binary: a team campaign on SOL/USD opened, resolution refused before the move (`ProofDoesNotTouch`),
      the price moved across the target, `resolve_campaign` recorded YES, `CampaignResolved` seq 1 with the proof
      (record below). Surfpool does not simulate epoch stake, in 1.5.0 or 1.6.0 [F]. Its Pyth model serves the legacy
      receiver's account, not the upgraded one this program trusts; the script registers the `rec2HH…` IDL itself.
- [x] A mainnet `PriceUpdateV2` is captured by `scripts/capture-fixtures.ts`, with its SHA-256 in `index.json`.
      Evidence: `tests/fixtures/pyth-sol-usd-mainnet.bin` and `pyth-btc-usd-mainnet.bin` (slot 454,743,014), in
      `tests/fixtures/index.json`; `tests/fixtures.test.ts`.
- [x] The list of sponsored feeds that stay fresh on devnet and on mainnet is recorded in `knowledge-base/`.
      Evidence: `knowledge-base/tecnologia/pyth-feeds-patrocinados.md` (lane R), with `scripts/pyth-sponsored-feeds.ts`.
- [x] **Alpenglow on devnet** is checked and recorded: confirmed against finalized, the leader-set Clock timestamp, the
      slot time, and the drift of `unix_timestamp` against wall time (TP §14.4 C12, C23). Deadlines and the 60 s proof
      window are retested, and proof and SOL/USD freshness are bounded by slot as well as by time.
      Evidence: `knowledge-base/tecnologia/alpenglow-devnet.md` (lane R), with `scripts/devnet-clock-probe.ts`; the
      slot bound above; the verdict on `MIN_SLOT_MS` and `EPOCH_START_SLOW_SLOT_MS` in the record below.
- [x] The `StakeAtLeast` YES path is tested in the Rust `litesvm` crate with `set_epoch_stake`, if it works there
      [AC]; otherwise it stays devnet-only (Sprint 05).
      Evidence: tested in Mollusk 0.14.0, already pinned, which injects epoch stake (`mollusk.epoch_stake`,
      `mollusk-svm-0.14.0/src/lib.rs`): `programs/brot-markets/tests/stake_at_least_mollusk.rs`, the first YES of
      this kind in any test. The `litesvm` crate was not added: 0.16 would bring a second Agave tree to the lockfile
      for the same result [AC].
- [x] The Lighthouse program id is recorded for the relay's allowlist of Sprint 08 [AC].
      Evidence: `knowledge-base/tecnologia/lighthouse.md`: `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95` on both
      clusters, verified by OtterSec, frozen on mainnet [F].
- [x] **`pred-provable` leaves, in one commit:** `programs/pred-provable`, `tests/pred-provable.test.ts`, the Anchor
      parts of `tests/helpers.ts`, `target/idl/pred_provable.json`, `target/types/pred_provable.ts` and `Anchor.toml`.
      `Cargo.lock` holds no `anchor-lang` or `anchor-spl`. Whether `brot-markets` needs the `solana-epoch-stake` pin
      is decided and recorded (proposal §5.4).
      Evidence: commit `c8ffa8b` (lane G, merged in `b46a56d`), plus the parity suite in the commit that follows.
      `Cargo.lock` loses 175 packages and bumps none; `rg anchor-lang Cargo.lock` finds nothing. `brot-markets` reads
      `sol_get_epoch_stake`, `sol_get_stack_height` and `sol_get_sysvar` through `pinocchio::syscalls`
      (`solana-define-syscall` 5.2.0): no `solana-epoch-stake` crate, no pin [F].
- [x] **CI drops the Anchor toolchain:** no Anchor CLI install, no `anchor build`, no `pred-provable` clippy line; the
      IDL check covers the Shank output and the generated client only. `build:program`, `sync-idl`, `test:rust` and
      `deploy:devnet` in `package.json` no longer name `pred-provable`, and the root package's name and description stop
      describing it (TP §14.1). The app keeps its committed copy of the old IDL until Sprint 09, and
      `cd app && bun run build` still passes [INF].
      Evidence: `.github/workflows/ci.yml` (the Program job: no `ANCHOR_VERSION`, no `NO_DNA`; the IDL preview, the
      stale check and the artifact name `packages/sdk/src/idl` and `brot_markets.so` only); `package.json` is
      `brot-markets`, with `sync-idl` and `deploy:devnet` removed (`smoke:devnet` and `seed:devnet` still drive the
      old devnet deployment through `app/lib`, until Sprint 09). `cd app && bun run build` in the record below.
- [x] **`CLAUDE.md` follows** (proposal §6): the build commands with `cargo build-sbf`, Shank and Codama; the Anchor
      CLI line, the Anchor gotchas, the USDC notes and the `pred-provable` architecture go; the `init-if-needed` rule
      is restated for Pinocchio; Bun 1.4.2.
      Evidence: commit `bf18ba2` (lane G) and the status line fixed at integration.
- [x] Each item of "Carried over" below is done, or decided in writing with the reason.
      Evidence: "Carried over, item by item" in the record below.
- [x] Common closure (`docs/SPRINTS.md`, section 4): checks, secrets scan, codemap, changelog and session log, the
      reviews, the pull request, the merge into `main` and the tag.
      Evidence: items 1 to 5 done. The standard checks pass locally on `edc230c` (2026-10-09): `bun run
      build:program` with no IDL drift, `bun run test` 262 pass, `bun run test:rust` 255, the `mainnet` test 256,
      `cargo fmt --check`, clippy with `no-entrypoint` and `no-entrypoint,mainnet`, `bunx tsc --noEmit`, `bun run
      lint`, the app's lint and build, the landing's tests, `codemap.js --check`, `os-self-test` (the three warnings it
      gives predate this sprint), `npm run test:os`; and in CI, run 37893268607, green. `ci-secret-scan.js
      origin/main` is clean; `Cargo.lock` holds no `anchor-lang` or `anchor-spl`. CHANGELOG, both session logs, the
      reviews and PR #40 are below. Item 6: merged into `main` with PR #40 on 2026-10-09 by Ronaldo, with the freedom
      the founder gave him, and tagged `sprint-03`.

## Deliverables

- The five readers on Pinocchio, and rows 1 to 3 of TP §3.4.10 for the other four kinds (S).
- `resolve_campaign`, the price split, the slot bounds and `StaleFeed` (M).
- The Surfpool run; the mainnet price fixture; the note on sponsored feeds; the Alpenglow check (S).
- The workspace, CI and `CLAUDE.md` without Anchor and without `pred-provable` (S).

## Out of scope

Confirming, voiding by hand, contesting, settling and paying (Sprint 04). The keeper's price task and Hermes (06).
The second read (07 and 14). Token-2022 and the locked-tokens kind (phase 1.2). Mainnet price campaigns open only once
the keeper can post its own proofs (D4, Sprint 16).

## Founder decisions that block the sprint

- **Q1, answered (the working default of TP v0.0.1):** B, any wallet may trigger resolution and payout; it chooses no
  outcome, amount or destination. No public resolve button.
- **Q4, answered:** a YES is the price proved on-chain within 60 s (the working default of TP v0.0.1); the maximum
  price age is set per campaign, with a 30 s floor (the founder's answer of 2026-10-05).
- **D7, taken as approved with the proposal:** `StaleFeed` voids a price campaign whose feed went stale.
- None open.

## Agents and skills

- **Agents:** `technical-security-red-team-agent` (owner, layout and panic in each reader; the price split; the
  freshness bounds); `dev-product-agent`; `bug-triage-agent` (any divergence between a ported reader and its
  original); `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review` (the price reader), `codemap`, `verify-build-works`,
  `decision-log`, `secrets-scan`.

## Security gates

- No generic reader. Each reader checks owner and layout before reading.
- `resolve_campaign` refuses a CPI.
- Only the upgraded Pyth receiver (`rec2HH…`) is trusted, and joining accepts only the sponsored account.
- Ported files keep the MIT notice.
- `secrets-scan` at closure.

## Tests

`bun run test:rust` with the captured accounts; `bun run test` for resolution and the join lock; Surfpool for the
price reader. Filters to add in this sprint:

```bash
bun test tests/ -t "readers match fixtures"
bun test tests/ -t "ported reader matches pred-provable"           # runs before pred-provable leaves
bun test tests/ -t "open campaign refuses"                         # extended to the other four kinds
bun test tests/ -t "resolve refuses a cpi"
bun test tests/ -t "resolution table"                              # Yes, No, met_late, MissedWindow, UnreadableAccount, StaleFeed
bun test tests/ -t "price join accepts only the sponsored account"
bun test tests/ -t "yes proof window"
bun test tests/ -t "join refuses once the outcome is knowable"
```

## Carried over

From the price-reader proof of Sprint 01 (`docs/sprints/sprint-01-foundation.md`;
`knowledge-base/tecnologia/pyth-leitor-de-preco.md`), re-read against proposal §2.5.

- **The Surfpool read Sprint 01 did not do** is a criterion above. Surfpool has binaries for Linux and macOS only, so
  it runs in CI.
- **`price_touch.rs` reads only.** It checks owner, size, discriminator, full verification and the expected feed,
  which is a required parameter; it does not check age, which the caller must. Instructions use
  `read_price_account`, which takes owner and bytes from the same account.
- **Split the account accepted on joining from the one accepted as proof.** Decided by the approved proposal: the
  sponsored account on joining, any Full account of the feed as proof (above).
- **`price − confidence` needs wider types:** `price` is `i64` and may be negative, `conf` is `u64`. Above.
- **The Pyth governance risk** is in TP §13. The watchdog watches the receiver in Sprint 07, and who controls it on
  mainnet is Sprint 16's. Here, the price kind's design counts with it.
- **A mainnet price account among the fixtures.** Above.
- **`publish_time` may be ahead of the cluster clock.** Above.
- **The maximum price age is a per-campaign parameter**, answered by the founder (30 s floor). Devnet's sponsored
  account updates every 62–64 s [F], so devnet price campaigns use at least 90 s (proposal §2.5).
- **The list of sponsored feeds** limits which assets a price campaign can name. Above.
- **Only the upgraded receiver (`rec2HH…`) is accepted.** Unchanged.

From Sprint 02 and its reviews (`docs/sprints/sprint-02-pot-core.md`, "Reviews"; 2026-10-08).

- **`outcome_knowable` and `try_resolve` replace `ReaderNotReady`** (6070), the code every kind returns today.
- **Codes of its own for the SOL/USD read:** an owner, layout, verification or feed refusal on the SOL/USD account
  surfaces the reader's codes (6001 to 6004), not row 7's. Decide whether row 7 gets four codes; new codes are
  appended from the first free number.
- **Which feeds a price campaign may name, before row 2 is extended** (all three reviewers; a founder decision). The
  price kind accepts any feed whose shard-0 sponsored account is Full, fresh and within 0.5%; TP §3.4.8 ("price of a
  large asset") and §3.4.10 ("only the price kind is out of any creator's reach") are not enforced by that. First
  check on devnet whether the push oracle lets any payer create the shard-0 account of an unsponsored feed. Then
  either a compiled, append-only list of feed ids with its own error and a test that a fresh, valid, unlisted feed is
  refused, or the TP and BP claims narrowed to what the code enforces.
- **Row 3, both ends:** refuse a target the price can never reach (`Below` with `target ≤ 0`, an `Above` far past any
  price) and set the minimum distance per kind (C45), with negative tests one tick past the band and at the far side.
  Today a `Below` target of 1 opens.
- **The future-publish bound is shared:** an opening refuses a price published more than 60 s ahead of the clock
  (`MAX_PRICE_CLOCK_LEAD_SECONDS`, Sprint 02 review); the join lock and the YES proof reuse the rule, with the slot
  bound above.
- **A reading whose exponent differs from the stored `price_exponent`** is refused, at the join lock and as proof.
- **The terms the creator saw:** `max_lamports` bounds the lamports, not the prize share or the creator share, which
  an admin change between preview and signature can move. While the argument layout is unreleased (before Sprint 05's
  SDK), decide whether `OpenCampaignArgs` carries an expected `params_version` (or the two values) and refuses on a
  mismatch, or record it as an accepted risk.
- **Founder decisions asked in PR #30, built here if he says yes:** charge the opening at `p − conf` instead of `p`
  (it removes the creator's choice of the highest recent update, worth up to about 1% at the 300 s age ceiling); the
  SOL/USD feed id as a compiled constant instead of a config value only checked non-zero; and a separate budget for
  free team openings, so that one leaked team key cannot fill `max_open_campaigns` for up to 90 days.

## Risks

- `StakeAtLeast` has never returned YES in a test: LiteSVM's npm package returns zero epoch stake [F]. The kind stays
  closed until a devnet YES (Sprint 05).
- A short touch can go uncaptured; with no key, devnet resolves only when the sponsored account shows the touch, which
  is weak against erasure (proposal §2.5). Mainnet waits for the keyed keeper.
- Alpenglow's rollout dates disagree between sources [AC]; slot time and timestamp rules may change under the tests.
- With `pred-provable` gone, the current site has no program behind it until Sprint 09. The app build must still pass.

## Expected artifacts

`programs/brot-markets/src/readers/`, `instructions/resolution/resolve_campaign.rs`, the tests in `tests/` and
`programs/brot-markets/tests/`, the new fixture and `index.json`, the IDL, `.github/workflows/ci.yml`, `package.json`,
`CLAUDE.md`, the note in `knowledge-base/tecnologia/`, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** five readers and resolution; the frozen program and Anchor removed.
- **Session log:** the price-reader numbers and why; how `StakeAtLeast` stays closed; the Alpenglow finding; the
  Surfpool result.

## Record and retrospective

### How it ran (2026-10-09)

- **Wave 0, serial:** the branch from `main` (`ec8d24d`, Sprint 02 merged in PR #35); the six founder questions
  checked against every record and left open, with the code's working reading for each; three facts found and
  recorded before any lane started (`prev_publish_time` is Pythnet's previous aggregate; Mollusk 0.14 injects epoch
  stake; Pinocchio exposes the three syscalls); the frozen contract (`0c71cd9`, `2d162df`, `7706db9`): the reader
  traits with `ChainTime`, `readers/shared.rs`, the `resolve_campaign` interface (discriminator 10), `Campaign.epoch`
  and `GlobalConfig.params_version` out of the reserved bytes, `OpenCampaignArgs` from 82 to 94 bytes, errors 6071 to
  6090, the test-only `cpi-proxy` program, and the TypeScript kit (`tests/brot/readers.ts`, `campaigns.ts`). Every
  Sprint 02 test passed on the contract (303 TypeScript, 146 Rust).
- **Wave 1, in parallel:** eight lanes, one agent and one git worktree each, taken from the sprint branch and not from
  `main` (the Sprint 02 retrospective); no SBF build in any lane. Lane G (the Anchor removal) was prepared in its own
  worktree during the wave and merged last, after the parity run.
- **Wave 2, serial:** the merges in the order E, F, D, S, C, A, B, with no conflict; two Sprint 02 tests that open
  campaigns after a parameter change got the parameters version (`28d9598`); the two points lane A raised were fixed
  in the integrator's files (`d08014f`: the minimum distance divides before it multiplies; a target at or below zero
  on an "at least" kind is already met), and the second was applied to the epoch kinds (`2cbadb5`). Then the full
  build and every suite, the parity run, the measurements, the Surfpool scenario, the X0.9 run, lane G, the parity
  suite removed with the original, and CI.
- **Wave 3:** see "Reviews" below.

| Lane | Subagent | Files | Tests added | Result | Notes |
|---|---|---|---|---|---|
| A, irreversible facts | general-purpose | `readers/spl_mint.rs`, `damm_v2.rs`; `readers_support/` | 21 host, 11 LiteSVM, 31 parity | All pass | Found `min_distance` overflowing above about 1.7 × 10³⁴ and the zero-target refusal; both fixed at integration |
| B, epoch kinds | general-purpose | `readers/epoch.rs`, `stake_pool.rs`, `vote_stake.rs`; `epoch_support/` | 18 host, 4 Mollusk (the `StakeAtLeast` YES), 17 LiteSVM, 31 parity | All pass | `first_slot` checked against Agave's over ~3,000 epochs × 7 schedules; vote layout from `solana-vote-interface` 4.0.4 |
| C, the price split | general-purpose | `readers/price_touch.rs` and `price_touch/{rules,target,proof}.rs`; `price_support/` | 78 host, 12 LiteSVM | All pass | Five flipped boundary comparisons all caught; raised the negative-price proof question |
| D, resolution | general-purpose | `resolution/resolve_campaign.rs`, `resolve_campaign/record.rs`; `scripts/checks-mutation.mjs` | 4 host, 27 LiteSVM | All pass | A decision of `Unresolved` is refused as `NotResolvableYet`, so `InReview` always holds YES, NO or Void |
| E, the join lock | general-purpose | `entries/join_lock.rs`, `join_campaign.rs` | 10 LiteSVM | All pass | — |
| F, the opening | general-purpose | `campaigns/open_campaign.rs`, `open_campaign/rules.rs`, `admin/set_creation_params.rs` | 8 host, 12 LiteSVM; 6 Sprint 02 tests changed | All pass | Found the shared-target-dir reuse between worktrees (gotcha in `CLAUDE.md`) |
| R, cluster facts | research-agent | `scripts/pyth-sponsored-feeds.ts`, `devnet-clock-probe.ts`, `push-oracle-probe.ts`; three notes and one section in `knowledge-base/tecnologia/` | — | Recorded | Stopped once at the usage limit and resumed from its runs; see "Lane R" below |
| S, Surfpool | general-purpose | `scripts/surfpool/{price-touch,surfnet,…}.ts`, the CI step, `knowledge-base/tecnologia/surfpool.md` | the scenario | Pass on 1.5.0 locally; 1.6.0 in CI | Surfpool's Pyth model serves the legacy receiver; no epoch stake in either version |
| G, the Anchor removal | the orchestrator | 31 files; `Cargo.lock` −175 packages, none bumped; `CLAUDE.md`; CI; `package.json` | — | Merged after the parity run | `tests/parity/` removed with it; its tables in `sprint-03-parity.md` |

**Totals.** Before the Anchor removal (`2cbadb5`): `bun run test:rust` 252 pass; `bun run test` 458 pass (62 of them
the parity suite, 138 the frozen program's). After it: `bun run test:rust` 252 pass; `bun run test` 258 pass, all for
the new program; clippy clean with `no-entrypoint`, `no-entrypoint,mainnet` and `no-entrypoint,stake-at-least`; the
eight filters of this file match passing tests (11, 62 before the removal, 12, 1, 15, 2, 4 and 10). After the review
fixes (`17dcb1c`) and the merge of `main` (`edc230c`): `bun run test` 262 pass, `bun run test:rust` 255, the `mainnet`
test 256.

### Measurements

| Instruction (LiteSVM, integrated binary) | Compute units |
|---|---|
| `resolve_campaign`: `SupplyAtMost` YES; `DammV2LockedAtLeast` YES; `StakePoolTvlAtLeast` YES | 2,251; 2,271; 2,502 |
| `resolve_campaign`: `PriceTouch` YES with a proof; `PriceTouch` NO; `StakeAtLeast` Void (`MissedWindow`) | 2,404; 2,327; 2,160 |
| `user_join_campaign`, first (creates the `Entry`) and second, with the join lock | 8,782; 4,605 (Sprint 02: 4,285) |
| `user_open_campaign`, paid (US$500, BTC/USD campaign), with the params version and the slot bounds | 24,759 (Sprint 02: 20,084 to 23,043) |
| `user_open_campaign`, free (team key, BTC/USD campaign) | 17,740 (Sprint 02: 13,043 to 16,019) |

The integrated binary measured above is 93,216 bytes (Sprint 02: 67,984), SHA-256
`9e5128bef04c288c0aa22ed81499fe829cc68abe73b49ef72a602dd0280033d7`, with no stack-frame warning from `cargo
build-sbf`; after the review fixes (`17dcb1c`) it is 93,480 bytes, SHA-256
`a12a8921b0b84b7a5f2dbe1bd4bb8712bb0215037b90ba678db35a8c4dc8ed54`. The IDL did not change between the contract
(`7706db9`), the integrated program and the fixes: no lane and no review altered the interface. No account changed
size.

### Surfpool (the criterion carried from Sprint 01)

Run on 2026-10-09 with Surfpool 1.5.0 (SHA-256 `5c1b2915…ad067a`) forking mainnet through the public RPC, the
integrated binary installed keylessly as `6G2d7Cv…`: the config initialised by the upgrade authority; the
`PriceUpdateV2` IDL registered for `rec2HH…` (Surfpool keys its own model to the legacy `rec5EK…`); SOL/USD's sponsored
account forked at 110.47 (conf 0.019, 2 s old) and re-stamped through the model with the surfnet's clock; a free team
campaign "SOL/USD above 115.99" opened; `resolve_campaign` refused before the move (`ProofDoesNotTouch`, 6085); the
model moved the price to 118.32 four slots later; `resolve_campaign` recorded YES with that value, in review for six
hours, and `CampaignResolved` seq 1 named the proof, 2 s and 0 slots old. CI runs the same script on 1.6.0, whose
archive hash equals the digest GitHub publishes for the asset (the release has no checksum file).

### X0.9: removing each check makes its test fail

`node scripts/checks-mutation.mjs --jobs 3` on the integrated program (2026-10-09, exit 0): the fifteen rows of the
Sprint 02 table again, plus `top_level`, whose mutant lets a resolution forwarded by `cpi-proxy` through, so
`top_level: a resolve forwarded by another program` fails. The script now finds markers in `checks.rs` and
`checks/top_level.rs` and restores both.

### Parity with the frozen program

62 of 62 at `c1dafa9`, the last commit with both programs. Every difference between the original and the port is one
of eight wanted ones (`met_late`, `UnreadableAccount` after the deadline, the 1% distance, SPL option tags, the
`MissedWindow` voids, a zeroed vote account, `StakeAtLeast` closed), each asserted with its source in the suite. The
two tables and the list are in [`sprint-03-parity.md`](sprint-03-parity.md).

### The [AC] values, confirmed or not by lane R

Lane R measured both clusters on 2026-10-09 through the public RPCs (`scripts/devnet-clock-probe.ts`,
`scripts/push-oracle-probe.ts`, `scripts/pyth-sponsored-feeds.ts`; the runs are summarised here, the notes are in
`knowledge-base/tecnologia/`). What the numbers say about the two rows the opening log left "to confirm" [F]:

| Measure | Devnet | Mainnet | Verdict |
|---|---|---|---|
| Slot time, `getRecentPerformanceSamples`, one-minute samples | 720 minutes: 231.7 to 244.9 ms, median 239; no minute under 100 ms or over 500 ms | 263 minutes: 259.7 to 281.7 ms, median 267.9; none under 100 or over 500 | **`MIN_SLOT_MS` = 100 confirmed**: the slot bound (`seconds × 1,000 / 100`) is at least 2.3× looser than any measured minute, so it never refuses a good price; **`EPOCH_START_SLOW_SLOT_MS` = 500 confirmed**: no average came within 1.8× of it |
| Slot time over 60 s windows (wall clock against slot deltas) | 269 windows: 230.4 to 244.3 ms | 150 windows: 259.9 to 281.8 ms | Same |
| Epoch averages (`Clock` and the five previous epochs) | 234.5 to 238.9 ms | 267.2 to 268.7 ms | Same; the epoch-start rule's worst case is nearly 2× the measured |
| SIMD-0525 (`reduce_slot_time_to_*`) | 350, 300, 250 and 200 ms gates active since 2026-08 | the 200 ms gate active since 2026-10-08 06:28 UTC | The target slot is 200 ms on both clusters while the measured slot is 239 and 268 ms: the 100 ms bound keeps a 2× margin against the target itself |
| Alpenglow (SIMD-0326) | active since slot 504,144,000 (2026-09-25); genesis certificate and nanosecond clock accounts present | absent (never requested) | Devnet runs Alpenglow; mainnet does not yet (TP §14.4 C12, C23) |
| `Clock.unix_timestamp` against wall time | 299 polls: −2.4 to +0.6 s, median −0.7 | 180 polls: −2.0 to −0.9 s, median −1.0 | The 60 s proof age, the 60 s wait after the deadline and `MAX_PRICE_CLOCK_LEAD_SECONDS` (60 s) are 25× the worst drift seen; a deadline lands within about 2 s of wall time |
| Confirmed minus finalized slots | 0 (−2 to 0) | 31 to 33 | Under Alpenglow confirmation is finality; on mainnet a resolver reading `confirmed` sees about 32 slots (8 to 9 s) before finality |
| Sponsored accounts (SOL/USD, BTC/USD), 12 minutes, 240 polls each | 14 updates seen on each; 8 to 65 s apart, median 62 to 63; 0 regressions of `publish_time` or `posted_slot` | 143 updates on each; 5 to 6 s apart; 0 regressions | **"Only moves forward" observed [AC]**: within the 12 minutes watched, no field decreased; devnet's heartbeat is about one minute, mainnet's about five seconds |
| Push-oracle transactions | 1,000 recent: 0 failed; of 60 fetched on SOL/USD, 40 wrote, 19 made no push-oracle call, **1 was skipped as not newer** (succeeded without writing) | 5,000 recent: 0 failed; 60 fetched on SOL/USD, 29 written by one payer, 30 with no push-oracle call | An older update is skipped, not refused: the account cannot be moved back by a transaction that succeeds |
| Who writes the sponsored accounts | three fee payers on SOL/USD in the window (45, 11 and 4 of 60) | one fee payer (29 of 60), plus 30 reads through Lighthouse `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95` | Anyone with a signed Hermes update can push to the sponsored account (founder question 1 stays open: it is about which feeds, not who writes) |

The devnet heartbeat (62 to 65 s) is also the number behind the `StaleFeed` floor from the reviews: 600 s is nine
times the longest gap seen. The shard-0 scan of unsponsored feeds was finished: on mainnet, 183 shard-0 accounts, 120
of them outside Pyth's list, 78 created by one non-Pyth payer and 102 without an update in the window measured
(`knowledge-base/tecnologia/pyth-feeds-patrocinados.md`, section 1). The source read of the push oracle and the
receiver at a pinned commit was not finished in Sprint 03; Sprint 04 does it (its note section, "Sprint 04: the push
oracle's update rule").

### Deviations from the plan, and why

- **`StaleFeed` is not the TP's sketch.** The TP read `prev_publish_time` as the account's previous write; in every
  captured account it is `publish_time − 1`, Pythnet's previous aggregate [F]. The test built: after `deadline + 60
  s`, `publish_time <= deadline` and `< deadline − max(max_age, STALE_FEED_MIN_SECONDS)` voids; otherwise NO, and
  the indexer's history lets the team void within the window (TP §3.4.6). The 600 s floor came from the reviews
  (below): devnet's heartbeat is 62 to 64 s, so a `max_age` near it made the outcome depend on when the resolver
  arrived.
- **NO for the price kind waits 60 s after the deadline** (`PROOF_DELAY_SECONDS`, equal to the proof's maximum age):
  without the wait anyone could record NO ahead of a valid proof of a touch in the deadline's last seconds. The
  two values must stay equal for the argument to hold.
- **The `StakeAtLeast` YES runs in Mollusk**, not in the `litesvm` crate the sprint named: Mollusk 0.14, already
  pinned, injects epoch stake; `litesvm` 0.16 would add a second Agave tree for the same result.
- **`StakeAtLeast` is closed by a build feature** (`stake-at-least`), not by a `GlobalConfig` switch: no key gains a
  power; opening the kind is a reviewed code change after the devnet YES (Sprint 05).
- **Row 3 at both ends for prices:** `Above` at most 10× the price, `Below` at least a tenth and never zero or less;
  a `Below` target of 1 no longer opens (Sprint 02's finding).
- **A target at or below zero on an "at least" kind is `TargetAlreadyTouched`**, not `TargetUnreachable`: any value is
  at least zero, so the truthful refusal is "already met". A negative supply target stays `TargetUnreachable`.
- **`min_distance` divides before it multiplies** (`|value| / 10,000 × bps + the remainder's share`, rounded up),
  after lane A found the first form overflowing i128 above about 1.7 × 10³⁴.
- **`expected_params_version`** is in `OpenCampaignArgs` (a Sprint 02 review item decided here): the argument layout
  is unreleased until Sprint 05, so the protection comes free and covers the fee, the one-sided fee, the creator
  share, the prize split, the opening price and the join's price age at once. `admin_set_creation_params` raises the
  version on every successful call.
- **Four SOL/USD codes** (6086 to 6089) instead of the reader's own, so an error at opening says which of the two
  Pyth accounts failed (Sprint 02 review X0.7).
- **Unused arguments must be zero** (`UnusedArgumentNotZero`): a `feed_id` on a burn campaign would be 32 bytes of
  free text nobody reads (D-j).
- **The epoch-kind join lock is the epoch's start** (`clock.epoch >= E`): Agave's stake syscall reads the snapshot
  saved at the epoch's first block, so the value is fixed from then.
- **`tests/parity/` left with the original.** The sprint file said the check "runs before the original leaves"; it
  also depended on `tests/helpers.ts` and the Anchor client. Its output is kept in `sprint-03-parity.md`.
- **The lanes' worktrees shared one `CARGO_TARGET_DIR`** at first, and cargo can reuse another worktree's
  `brot-markets` library (same unit hash). Lane F found it; the lanes were warned and the integration got its own
  target directory, where every number above was produced. Recorded in `CLAUDE.md`.

### Carried over, item by item

| Item | Decision |
|---|---|
| The Surfpool read Sprint 01 did not do | Done (above) |
| `price_touch.rs` reads only; age is the caller's | The reader now has the three entry points; `price_update.rs` keeps the read, `price_touch/rules.rs` the age, slot and confidence checks, used by the opening, the join lock and the proof |
| Split the join account from the proof account | Built (the price split) |
| `price − confidence` in wider types | i128 everywhere (`price_math`) |
| The Pyth governance risk | Unchanged; TP §13, Sprint 07 and 16 |
| A mainnet price account among the fixtures | Captured (SOL and BTC, slot 454,743,014) |
| `publish_time` ahead of the cluster clock | Bounded at 60 s (`MAX_PRICE_CLOCK_LEAD_SECONDS`), shared by the three paths |
| The maximum price age per campaign, 30 s floor | `max_age` copied at opening from `campaign_max_age`, within 30 to 300 s |
| The list of sponsored feeds | Recorded (`pyth-feeds-patrocinados.md`); which feeds a campaign may name is the founder's question 1 |
| Only the upgraded receiver | Unchanged (`PYTH_RECEIVER_ID`) |
| `outcome_knowable` and `try_resolve` replace `ReaderNotReady` | Done; 6070 is unused and not reused |
| Codes of its own for the SOL/USD read | Four codes, 6086 to 6089 |
| Which feeds a price campaign may name | Not decided here: a money rule the founder has not answered. Lane R's finding on who can create a shard-0 account is in `pyth-feeds-patrocinados.md`; the code accepts any feed whose sponsored account passes the checks. Answered on 2026-10-09: our own compiled list, starting from Pyth's official sponsored list; built in Sprint 04 |
| Row 3, both ends | Built (above) |
| The future-publish bound is shared | Built (`price_touch::rules`) |
| A reading whose exponent differs from the stored one | Refused at the join lock and as proof (`PriceExponentChanged`) |
| The terms the creator saw | `expected_params_version` (above) |
| `p − conf`, the SOL/USD constant, the free-opening budget | Not built: founder decisions, open during the sprint. Answered on 2026-10-09: all three yes, the team's openings outside `max_open_campaigns` and unlimited; built in Sprint 04 |

### Carried to Sprints 04 and 05

- The founder's seven questions (the six of the opening plus the join-after-touch fix the reviews raised; the
  negative-price proof was decided by the reviews and built), with the code's working reading for each, in
  `session-log/2026-10-09-sprint-03-abertura-contrato-e-valores.md`,
  `session-log/2026-10-09-sprint-03-integracao-e-revisoes.md` and the reviews below. Answered on 2026-10-09
  (`session-log/2026-10-09-respostas-do-fundador-e-mescla-da-sprint-03.md`); Sprint 04 builds them.
- Sprint 04: confirming, voiding by hand (`StaleFeed` after an update landed; `MissedWindow`), contesting, settling,
  paying; the review window (`review_ends_at`) is already written by `resolve_campaign`.
- Sprint 05: the devnet YES of `StakeAtLeast` and the reviewed change that turns `stake-at-least` on; the SDK's
  preview of the opening (the 1% distance, the far bound, the epoch's latest start, the params version) so a
  creator sees a refusal before signing; `smoke:devnet` and `seed:devnet` rewritten for the new program.
- Sprint 06: the keeper's proof task, which is the only way a short touch gets proved on mainnet (D4).
- Sprint 08: Lighthouse `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95` for the relay's allowlist.

### Retrospective

- **What worked:** worktrees from the sprint branch, not from `main`; the contract first, with the Sprint 02 suites
  green on it, so eight lanes wrote 150 tests without a binary and all passed on the first integrated run; a
  test-only program (`cpi-proxy`) as the only honest way to show a CPI refusal; writing campaigns straight into the
  test cluster so resolution tests did not wait for the opening lane; reading the fixtures before designing
  (`prev_publish_time`) instead of after.
- **What did not:** a shared `CARGO_TARGET_DIR` across worktrees; the X0.9 run holding the only binary, which
  blocked every other check for its duration; the session hit its usage limit twice, once with the reviews and the
  research lane mid-run (resumed from their saved runs and transcripts, nothing re-measured). The main checkout was
  briefly switched to a stale `main` and restored at once.
- **For Sprint 04:** one target directory per worktree from the start; the parity-style table (original | ported |
  reason) as the format for any rule that changes a recorded outcome; the review window and the payout need the
  randomized invariant test (gate 1) before any service sprint.

### Reviews (Wave 3)

Four reviewers read the integrated program at `c1dafa9` from a frozen worktree: security red team, devil's advocate,
an independent reader with no brief beyond the technical plan, and product. None found a way to move SOL out of a
pot, out of the treasury or out of a baker's entry. Their findings, consolidated, and what was done with each:

| # | Finding | Raised by | Severity | What was done |
|---|---|---|---|---|
| F1 | **Join after the touch.** The join lock reads the sponsored account (one update a minute); the YES proof accepts any Full account at most 60 s old. Between the two, a baker who sees a touch in a freshly posted account joins YES and resolves YES, even in one transaction | security, devil, independent | High | **Not coded: a money rule.** Three fixes were proposed (a proximity buffer at the join lock; `last_entry_at` on the campaign; refunding, in Sprint 04, entries dated after the proof's `publish_time`), each changing who wins. Founder question 8, with a recommendation (the buffer now, the refund flag in Sprint 04). The indexer can already compare each entry's time with the proof's `publish_time` |
| F2 | **`StaleFeed` turned on the resolver's timing.** The threshold was the campaign's `max_age` (30 s floor) while devnet publishes every 62 to 64 s: the same campaign could void or record NO depending on the second it was resolved, and a NO baker could post an update after D to force NO | security, devil, independent | Medium | **Fixed** (`17dcb1c`): the threshold is `max(max_age, STALE_FEED_MIN_SECONDS = 600)` [AC]; host and LiteSVM tests at the edge, and one for a missed heartbeat at every `max_age`. The liveness-proof alternative (anyone posts a fresh update as a NO proof) is recorded for the founder with D7 |
| F3 | **An exponent change mid-campaign forced NO.** Every proof of the window was refused with `PriceExponentChanged`, and the sponsored account then recorded NO | security, devil | Medium | **Fixed**: after the window a sponsored exponent other than the stored one voids (`UnreadableAccount`), checked before the stale test; host and LiteSVM tests |
| F4 | **A non-positive proof price.** A negative price signed by Pyth proved YES for a `Below` campaign | all four | Low | **Fixed**: `price <= 0` is refused as a proof in both directions (`PriceNonPositive`, the opening's error); founder question 7 is closed by the reviews |
| F5 | **`NotResolvableYet` was unreachable for the price kind.** The instruction always passed a proof, so a caller with nothing to offer got `ProofDoesNotTouch` for whatever filled the slot | independent | Low | **Fixed**: the program's own address in the proof slot means no proof; LiteSVM test at D + 60 |
| F6 | After the window, every read error of the sponsored account is one void reason (`UnreadableAccount`) | independent | Record | The reason is for the team's review; the error itself is in the indexer's read. Unchanged |
| F7 | The 1% distance is buyable for the stake-pool kind (a large deposit moves the pool's TVL) | devil, product | Record | Kept at 1%: the distance guards the opening, not the outcome; the written risk is TP §3.4.10 and the disclosure is Sprint 16's |
| F8 | The 10× far bound and the 1% near bound leave a wide middle where a price campaign is a coin toss or a gift | devil | Record | By design: the creator prices the campaign, the bakers price the odds. Noted for the opening preview (Sprint 05) |
| F9 | `params_version` rises only through `admin_set_creation_params`, not through every config write | independent | Record | Intended: the version covers the terms a creator reads before signing; the other fields are not terms |
| F10 | `CampaignResolved` omits `conf` | independent | Record | The event names the account and the publish time; the indexer reads the band from the account's history. Unchanged |
| F11 | The slot backstop (`MIN_SLOT_MS` 100) is loose against devnet's measured slot | independent | Record | Lane R's measurement decides (the [AC] table above); the backstop guards against a stopped clock, not against drift |
| F12 | A `StakeAtLeast` campaign can be opened when the measured epoch's stake is already predictable | security | Record | The kind stays closed (`stake-at-least` feature); the devnet YES and the opening rule are Sprint 05's |
| F13 | A stake pool whose keeper stops cranking voids as `MissedWindow`, and the bakers lose nothing but their time | product | Record | The keeper's crank is Sprint 06's; the void refunds every entry (Sprint 04) |
| P1 to P4 | Product: the opening preview must show the refusals before signing; the proof window needs a plain explanation on the campaign page; the review window needs a visible countdown; the void reasons need copy | product | Record | Sprints 05 (preview), 09 (copy) and 06 (the keeper's proof task, so a short touch is proved on mainnet) |

The fixes added three Rust tests (255 in all) and changed three TypeScript files; `bun run test` counts 262 after
them (the tests have not changed since); the IDL is unchanged. The X0.9 run was not
repeated: no check in `checks.rs` or `checks/top_level.rs` was touched. Every finding that changes a rule (F2, F3,
F4, F5) is in `CHANGELOG.md` under *Fixed*; F1 is in *Em aberto* as question 8.
