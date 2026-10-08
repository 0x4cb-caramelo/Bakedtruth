# Sprint 03 — Readers and resolution; Anchor leaves the workspace

**Status:** planned · **Branch:** `sprint-03-readers-resolution` · **Dates:** none, by the founder's decision

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

- [ ] `readers/` holds one file per reader, under 200 lines: `spl_mint.rs` (`SupplyAtMost`), `damm_v2.rs`
      (`DammV2LockedAtLeast`), `stake_pool.rs` (`StakePoolTvlAtLeast`), `vote_stake.rs` (`StakeAtLeast`),
      `price_touch.rs` (`PriceTouch`) and `cursor.rs`. Each exposes `validate_at_creation`, `outcome_knowable` and
      `try_resolve`, and checks owner and layout before reading. `ReaderKind` is closed at five.
- [ ] Each reader passes on the real accounts of `tests/fixtures/*.bin`. A truncated, stretched or zeroed account
      returns an error, never a panic.
- [ ] Each ported reader gives the same result as the original in `pred-provable` on the same account, run before
      the original leaves. Ported files keep the MIT notice.
- [ ] **`user_open_campaign` for the other four kinds** refuses rows 1 to 3 of TP §3.4.10 with their own
      errors: a kind outside the five; an account the reader rejects (owner, size, discriminator); a target already
      met or too close to the current value, with the minimum distance per kind set and recorded here [AC]. A
      Token-2022 mint is refused for the burn kind. `StakeAtLeast` stays closed until a devnet YES is recorded; how (a
      kind switch in `GlobalConfig` or a build flag) is decided here [AC].
- [ ] **The epoch kinds and the duration rule** [AC] (TP §3.4.8). The proposal's parameter sketch gives
      `StakePoolTvlAtLeast` and `StakeAtLeast` an `epoch` and no `deadline_at`, while the 3-to-90-day rule and the
      entry close need times. The TP's working reading [INF] is built and tested unless the sprint records another: the
      creator also passes `deadline_at`; the epoch must start before it; entries close at the earlier of
      `entries_close_at` and the epoch's start; a missed epoch voids as `MissedWindow`.
- [ ] **`resolve_campaign`** accepts only a top-level call (`checks::top_level`, with its negative test), records
      `InReview`, `outcome`, `observed_value` and `review_ends_at = now + 6 h`, and emits `CampaignResolved` with the
      value read; for a price campaign, also `publish_time`, `posted_slot` and the proof account.
- [ ] **The resolution table of TP §3.4.6 as test cases:** `Yes` before the deadline; `No` after it; `met_late`;
      `Void` for `MissedWindow`, `UnreadableAccount` and `StaleFeed`.
- [ ] **The price split** (proposal §2.5, TP §3.4.8). Joining a price campaign accepts only the sponsored account,
      derived on-chain from the push-oracle id, shard 0 and the campaign's feed: owner `rec2HH…`, 134 bytes, Full
      verification, the right feed, age at most the campaign's `max_age` (copied from `campaign_max_age` at opening,
      never below 30 s); it refuses when price plus confidence reaches the target. A YES proof accepts any Full
      `rec2HH…` account of the feed whose `publish_time` is inside the campaign's window, at most 60 s old, within a
      bound on `Clock::slot − posted_slot` whose value is set here [AC], with price minus confidence across the target
      in the campaign's direction.
- [ ] **`StaleFeed` (D7):** after the deadline with no proof, the outcome is NO, unless the sponsored feed's last
      update before the deadline is older than `deadline − max_age`; then the campaign is voided with `StaleFeed`.
      The program sees only the account's `publish_time` and `prev_publish_time`, so it can prove staleness only when
      at most one update landed after the deadline; otherwise it records NO and the indexer's feed history lets the
      team void within the window (TP §3.4.6). The exact test is written here [AC].
- [ ] Price math runs in `i128` or through `try_from`, and is tested with a negative price, the largest confidence,
      an unexpected exponent and a `publish_time` ahead of the cluster clock (no overflow, no refusal of a good price).
- [ ] `user_join_campaign` refuses once `outcome_knowable` says the outcome is known (BR-06).
- [ ] A test on a live cluster or in Surfpool shows that the sponsored account only moves forward (the receiver
      declares `UpdatesNotMonotonic`; the code was not read) [AC].
- [ ] **Surfpool 1.6.0** is pinned in CI with the binary's SHA-256 checked, and the price reader runs inside an
      instruction against its `PriceUpdateV2` model, with a scenario that moves the price across the target. Whether
      it simulates epoch stake is recorded. This is the criterion Sprint 01 carried here.
- [ ] A mainnet `PriceUpdateV2` is captured by `scripts/capture-fixtures.ts`, with its SHA-256 in `index.json`.
- [ ] The list of sponsored feeds that stay fresh on devnet and on mainnet is recorded in `knowledge-base/` (64 were
      sponsored on mainnet and only SOL and BTC fresh on devnet in one snapshot of 2026-10-07 [F]).
- [ ] **Alpenglow on devnet** is checked and recorded: confirmed against finalized, the leader-set Clock timestamp, the
      slot time, and the drift of `unix_timestamp` against wall time (TP §14.4 C12, C23). Deadlines and the 60 s proof
      window are retested, and proof and SOL/USD freshness are bounded by slot as well as by time.
- [ ] The `StakeAtLeast` YES path is tested in the Rust `litesvm` crate with `set_epoch_stake`, if it works there
      [AC]; otherwise it stays devnet-only (Sprint 05). Sprint 02 found that `litesvm` 0.17.0, which itself declares
      Rust 1.89, needs `solana-program-runtime` 4.3.0 (Agave 4.3), which declares Rust 1.97.1, above the pinned 1.89:
      use the newest version that builds under 1.89 (0.16 [AC]), or record a Rust bump first.
- [ ] The Lighthouse program id is recorded for the relay's allowlist of Sprint 08 [AC].
- [ ] **`pred-provable` leaves, in one commit:** `programs/pred-provable`, `tests/pred-provable.test.ts`, the Anchor
      parts of `tests/helpers.ts`, `target/idl/pred_provable.json`, `target/types/pred_provable.ts` and `Anchor.toml`.
      `Cargo.lock` holds no `anchor-lang` or `anchor-spl`. Whether `brot-markets` needs the `solana-epoch-stake` pin
      is decided and recorded (proposal §5.4).
- [ ] **CI drops the Anchor toolchain:** no Anchor CLI install, no `anchor build`, no `pred-provable` clippy line; the
      IDL check covers the Shank output and the generated client only. `build:program`, `sync-idl`, `test:rust` and
      `deploy:devnet` in `package.json` no longer name `pred-provable`, and the root package's name and description stop
      describing it (TP §14.1). The app keeps its committed copy of the old IDL until Sprint 09, and
      `cd app && bun run build` still passes [INF].
- [ ] **`CLAUDE.md` follows** (proposal §6): the build commands with `cargo build-sbf`, Shank and Codama; the Anchor
      CLI line, the Anchor gotchas, the USDC notes and the `pred-provable` architecture go; the `init-if-needed` rule
      is restated for Pinocchio; Bun 1.4.2.
- [ ] Each item of "Carried over" below is done, or decided in writing with the reason.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

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

Filled in during the sprint and at closure.
