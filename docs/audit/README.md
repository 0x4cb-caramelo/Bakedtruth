# Brot Markets — audit package

**Status:** draft for the Sprint 16 freeze, written on 2026-10-13 against `main` at `395efa5` and brought up to date
the same day for Sprints 14 and 15: every `file:line` in this package points at `main` at
`8af10e28128d940acab8e8bf7d9aca53b5d067bc` (worktree branch `sprint-17-rc-prep`). Sprint 16's pre-freeze hardening is
PR #93 (branch `sprint-16-prefreeze`, head `fcedeaf`, CI green, not on `main` yet); where it changes a rule the package
names its commit and cites the files it rewrites by function, not by line. The release candidate the two firms read is
cut at the freeze; its identifiers go in the block below, and the line numbers are re-checked against it before the
package is sent (see "Before sending").

Labels used throughout: **[to verify]** marks a statement nobody has checked yet; `<<FILL AT FREEZE: …>>` marks a value
only the freeze can give. Nothing else in this package is a guess.

Paths: `src/…`, `Cargo.toml` and the Rust tests `tests/<name>.rs` are under `programs/brot-markets/`; every other path
(`tests/brot/`, `tests/sdk/`, `scripts/`, `services/`, `docs/`, `.github/`, …) starts at the repository root; a bare
`….test.ts` name is under `tests/brot/`; `:N` repeats the file just named; `file.rs::name` names a function without a
line. `SCOPE.md` ("Paths") states the convention in full.

## What is in the package

| File | What it answers |
|---|---|
| `README.md` (this file) | What the program is; the release candidate and what the freeze fills; how to build and test; where the negative test of each check lives (T24) and how `scripts/checks-mutation.mjs` proves each check's test fails without it (X0.9) |
| [`SCOPE.md`](SCOPE.md) | What is in scope, item by item, with `file:line` and error codes: the 27 instructions, the ten creation rules of TP §3.4.10, the Pyth-priced opening, every creation parameter and its ceiling, the six reader kinds, entries and the join core, resolution, the review window, settlement and the reserve path, the fees and the creator share, `VoidReason`, the `checks` module and the stored-key comparisons, powers and the pause, events, the invariants I1–I15; the known open items before the freeze, with what the pre-freeze hardening closed; Sprint 14 (the referral link and the two-stage contest) and Sprint 15 (the sealed entry); what is out of scope and why |
| [`THREAT-MODEL.md`](THREAT-MODEL.md) | Assets, actors, trust boundaries, and each attack class per instruction with its mitigation and its test, the contest's, the referral's and the sealed entry's included; the accepted risks the founder decided |
| [`PINOCCHIO.md`](PINOCCHIO.md) | Pinocchio's own audits, the version they covered, and the versions this program pins (they differ) |
| [`FIX-WORKFLOW.md`](FIX-WORKFLOW.md) | How a finding becomes a fix: intake, severity, the reproducing test, the branch, the gates, the firm's confirmation, the new hash, the public report |

Suggested reading order for a firm: this file, `SCOPE.md` §1–§3, `THREAT-MODEL.md`, then the code in the order of
`SCOPE.md` §4 onward. The `checks` module (`programs/brot-markets/src/checks.rs` and `checks/`) is the newest risk in the
program (TP §3.4.17, §13): Anchor used to generate these checks, here they are written by hand.

## The program in one paragraph

`brot-markets` (`programs/brot-markets`, 117 Rust files, 11,703 lines at `8af10e2`) is a Solana program on Pinocchio
0.11.2 (`programs/brot-markets/Cargo.toml:30`) that holds users' SOL, **with no cap** of any kind (D-h). A campaign is a
YES/NO question that one third-party account answers, read by one of six closed reader kinds
(`src/state/enums.rs:20-27`). Any wallet opens a campaign by paying US$500 in SOL at the Pyth SOL/USD price minus its
confidence (90% becomes a prize, 10% an opening fee held until the outcome); a team key opens free. Bakers join YES or
NO with SOL; a sponsor may join sealed, with at least US$500 priced the same way, its 90% in the pot and its 10% held
apart in its own account. The SOL sits in a data-less, program-owned PDA per campaign (`["vault", campaign]`) and every
balance is bookkept in account fields, never read from a vault (I15). Any wallet resolves (top level only), a six-hour
review window follows, in which a team key may confirm, re-label an automatic void, or open a two-stage contest that the
re-read or the admin closes, never inverting the result and never holding the payout more than 78 hours after the
resolution; then a snapshot fixes the payout mode (`Split`, `OneSided`, `Refund`) and every payout goes to a stored key,
sent by any wallet. Brot keeps 10% of the losing side (`fee_bps`), the creator 1% of the entries
(`creator_share_bps`). A referee may record once who referred it; the referral payout is off-chain. Every instruction
that succeeds emits its event by self-CPI (23 kinds). The program is unaudited and runs on devnet only
(`5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`).

## Release candidate (the lead fills this block at the freeze)

| Item | Value |
|---|---|
| Git tag | `<<FILL AT FREEZE: tag name>>` |
| Commit (full SHA) | `<<FILL AT FREEZE>>` |
| Crate version (`programs/brot-markets/Cargo.toml:3`) | `<<FILL AT FREEZE>>` (`0.0.3` at `8af10e2`) |
| Mainnet program id (`declare_id!`, `src/lib.rs:23`) | `<<FILL AT FREEZE: the fresh mainnet id>>` (today the devnet id; see note 2) |
| Event authority for that id (`src/constants.rs:37`, bump at `:39`) | `<<FILL AT FREEZE>>`; `tests/layout.rs:75-79` fails if it is not the canonical PDA of the id |
| Cargo features of the audited binary | `mainnet` only (`MAINNET_FEATURES`, `.github/workflows/ci.yml:22-25`). `drill` and `stake-at-least` cannot be built with it (`src/constants.rs:147-150`, `:173-174`) |
| Binary `brot_markets.mainnet.so`: sha256 and size | `<<FILL AT FREEZE: from the candidate's programs-mainnet-<sha> artifact and its SHA256SUMS>>` |
| IDL `brot_markets.mainnet.json`: sha256 | `<<FILL AT FREEZE: the same artifact>>` |
| CI run (id and URL) that built it | `<<FILL AT FREEZE: the push to main of the candidate commit>>` |
| Verifiable build: the two `solana-verify` builds and the tested binary | `<<FILL AT FREEZE: the "Verifiable build is reproducible and tested" job of that run>>` (`ci.yml:369-443`; `docs/technical/verifiable-build.md`, "Reproduce the published hash") |
| Provenance attestation | `<<FILL AT FREEZE: output of gh attestation verify … --repo 0x4cb-caramelo/Bakedtruth, or "not attested" and why>>`: the job runs only once the repository is public (`ci.yml:504-511`) |
| `Cargo.lock` sha256 | `<<FILL AT FREEZE>>` |
| Toolchain | Rust 1.89.0 (`rust-toolchain.toml`), Solana CLI 3.1.10 and platform-tools v1.52 (TP §14.4 C14), shank-cli 0.4.9, solana-verify 0.5.2 (`scripts/ci/verifiable-build.sh:13`) |
| Mainnet `admin_initialize_config` arguments (admin, fee recipient, `CreationParams`) | `<<FILL AT FREEZE: the values Sprint 16 records>>`; they are not in the binary but decide its behaviour (SCOPE §5) |

**What the freeze fills, in this order** (each step needs the one before it):

1. Merge the pre-freeze hardening (PR #93) and decide every item of `SCOPE.md` §17: fixed in the candidate, or sent to
   the firms as a known issue.
2. Put the mainnet program id in the code (`src/lib.rs:23`, with the event authority constant and bump,
   `src/constants.rs:37-39`; note 2). It changes the binary, so it comes before any hash.
3. Cut the candidate on `main`; record the tag, the full SHA, the crate version and the `Cargo.lock` sha256.
4. From the CI run of that push to `main`: the run id and URL, `brot_markets.mainnet.so`'s sha256 and size and
   `brot_markets.mainnet.json`'s sha256 from the `programs-mainnet-<sha>` artifact, and the verifiable-build job that
   compared two `solana-verify` builds with the tested binary.
5. The provenance attestation, or "not attested" with the reason, while the repository is private.
6. The mainnet `admin_initialize_config` arguments Sprint 16 records.
7. Re-check every `file:line` of the package against the tag, turn the `file.rs::name` citations into lines, rerun
   `scripts/checks-mutation.mjs` on the candidate and record its table ("Before sending").

Notes for the lead:

1. **A `mainnet` SBF binary exists since Sprint 16's CI (PR #87).** Every run builds the `mainnet` variant
   (`.github/workflows/ci.yml:113-117`), runs the host and Mollusk tests on it (`:176-182`) and two LiteSVM tests that a
   drill build fails (`:184-198`); a push to `main` builds both variants twice with `solana-verify`, requires the two
   builds and the tested binaries to be byte for byte equal (`:369-443`), and publishes `programs-<sha>` and
   `programs-mainnet-<sha>` (`:445-502`). `main`'s run at `8af10e2` (38491785973) passed every job and published
   `programs-mainnet-8af10e2…`; its provenance job was skipped, the repository being private. The LiteSVM suites still
   run the default binary, which differs from the mainnet one in the feed list and `DBC_GRADUATED_OPENS` only
   (`SCOPE.md` §1, G-8).
2. **The program id must be final before the freeze.** TP §3.4.19 plans a fresh mainnet id kept unpublished until its
   deploy (a funded ProgramData address makes an id undeployable). Changing it changes `src/lib.rs:23` and the event
   authority constant and bump (`src/constants.rs:37-39`), so the binary hash changes: the audited commit must already
   carry the mainnet id. The published mainnet build still declares the devnet id (`docs/technical/verifiable-build.md`,
   "What CI builds and publishes"; `SCOPE.md` G-9).
3. **`solana-verify`, as CI runs it** (`scripts/ci/verifiable-build.sh:63`, `:69`; `docs/technical/verifiable-build.md:80-83`):

   ```bash
   solana-verify build --library-name brot_markets --base-image "$IMAGE"                       # devnet
   solana-verify build --library-name brot_markets --base-image "$IMAGE" -- --features mainnet  # mainnet
   solana-verify get-executable-hash <the .so>
   solana-verify get-program-hash -u $NETWORK_URL $PROGRAM_ID            # after the deploy (Sprint 18)
   ```

   The image is pinned by digest in the script; the reproduction steps are in `docs/technical/verifiable-build.md`
   ("Reproduce the published hash").

## Build and test

From `CLAUDE.md`, `docs/SPRINTS.md` §4 and CI. The test suites load `target/deploy/brot_markets.so` (and
`cpi_proxy.so`), so build first.

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install --frozen-lockfile
bun run build:program      # cargo build-sbf for brot-markets and the test-only cpi-proxy, then the Shank IDL and Codama client
bun run test               # bun test tests/ app/ services/ : LiteSVM, in process (instructions, refusals, slot matrix, randomized I1–I15)
bun run test:rust          # cargo test -p brot-markets --features no-entrypoint : host tests and Mollusk on the SBF binary
cargo build-sbf --manifest-path programs/brot-markets/Cargo.toml --sbf-out-dir target/mainnet --features mainnet -- --locked
SBF_OUT_DIR=$PWD/target/mainnet cargo test --locked -p brot-markets --features no-entrypoint,mainnet   # T12, on the mainnet binary
cargo fmt --all -- --check
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
bun scripts/slot-matrix-check.ts           # the slot matrix still matches the IDL (CI: ci.yml:150-151)
bun run scripts/surfpool/price-touch.ts    # the price reader on a Surfpool 1.6.0 mainnet fork (CI: ci.yml:205-231)
node scripts/checks-mutation.mjs --plan    # the X0.9 plan; without --plan it rebuilds once per mutant (by hand, never in CI)
```

Single tests: `bun test tests/ -t "<describe or test name>"`; `cargo test -p brot-markets --features no-entrypoint --test
<file> <name>`. What runs where:

| Suite | Engine | Where |
|---|---|---|
| Host tests (pure functions, readers on captured mainnet bytes, the `checks` and contest rules on runtime-shaped buffers) | `cargo test` | `programs/brot-markets/tests/*.rs` (85 test files, 107 `.rs` files with their support modules) |
| The `checks` negatives and the Sprint 14–15 instructions on the real SBF binary | Mollusk 0.14.0 (`Cargo.toml:49`) | `tests/checks_mollusk.rs`, `tests/checks_mollusk_init.rs`, `tests/stake_at_least_mollusk.rs`, `tests/contest_mollusk_*.rs`, `tests/referral_link.rs`, `tests/referral_refusals.rs`, `tests/sealed_entry.rs`, `tests/sealed_settle.rs` |
| Instructions, refusals, slot matrix, randomized I1–I15 | LiteSVM (npm `litesvm` ^1.5.0) | `tests/brot/*.test.ts` (63 files) |
| SDK parity with the program (a mirror of `math/`, the opening and join rules, the event decoder) | LiteSVM behind a local RPC | `tests/sdk/*.test.ts` (41 files) |
| Third-party layouts | captured mainnet bytes, SHA-256 pinned | `tests/fixtures/`, `tests/fixtures/index.json`, `tests/fixtures.test.ts` |

Known limits of the engines: LiteSVM's npm package and Surfpool answer 0 to `sol_get_epoch_stake`, so the `StakeAtLeast`
YES path is shown only in Mollusk (`tests/stake_at_least_mollusk.rs`); `solana-test-validator` 3.1.10 needs AVX2, absent
on the development machine, so local rehearsals run on Surfpool (`CLAUDE.md`, "Gotchas"; TP §3.4.19).

## The `checks` module: where each negative test is (T24), and how the mutation script proves it (X0.9)

TP §3.4.17 asks that every check have a negative test that feeds the wrong account and is refused (T24), and that the
test be shown to fail when the check is removed (X0.9). Each check carries a `// X0.9 <id>` marker right before its
refusal (`src/checks.rs:12-13`); since Sprints 14 and 15 the rules of the new instructions carry them too, in their own
modules. The last column counts the id's rows in `PLAN` (`scripts/checks-mutation.mjs:80-165` at `8af10e2`; find a row
by its id, since the branch moves the lines): `fail` rows must fail with the check removed, `keeps` rows must still
pass because another check refuses that input the same way.

**Sprint 02–04 checks** (`src/checks.rs`, `src/checks/`):

| Check (marker id) | Code | Host test | Mollusk test (SBF binary) | LiteSVM test (SBF binary) | `PLAN` rows |
|---|---|---|---|---|---|
| `owned_by` | `src/checks.rs:48-51` | `tests/checks_host.rs:25` | `tests/checks_mollusk.rs:59` | `tests/brot/checks.test.ts:26` | 1 |
| `signer` | `src/checks.rs:54-57` | `tests/checks_host.rs:35` | `tests/checks_mollusk.rs:67` | `checks.test.ts:32`; pre-funded path `checks-init.test.ts:76` | 3 (2 on the link) |
| `writable` | `src/checks.rs:60-63` | `tests/checks_host.rs:44` | `tests/checks_mollusk.rs:76` | `checks.test.ts:38` | 3 (2 on the link) |
| `len` | `src/checks.rs:66-69` | `tests/checks_host.rs:53` | `tests/checks_mollusk.rs:108`, `:125` | `checks.test.ts:62`, `:71` | 2 (1 `keeps`) |
| `tag` | `src/checks.rs:73-75` | `tests/checks_host.rs:64` | `tests/checks_mollusk.rs:87`, `:94` | `checks.test.ts:44`, `:50` | 3 |
| `tag_version` | `src/checks.rs:76-78` | `tests/checks_host.rs:76` | `tests/checks_mollusk.rs:101` | `checks.test.ts:56` | 2 (1 `keeps`) |
| `pda` (`pda_address`) | `src/checks.rs:94-103` | `tests/checks_host.rs:86` | `tests/checks_mollusk.rs:135` | `checks.test.ts:77`, `:86` | 2 |
| `canonical_pda` | `src/checks.rs:108-118` | `tests/checks_host.rs:113` | `tests/checks_mollusk_init.rs:62` | `checks-init.test.ts:20` | 2 (1 on the link) |
| `system_program` | `src/checks.rs:121-125` | `tests/checks_host.rs:138` | `tests/checks_mollusk_init.rs:73` | `checks-init.test.ts:28` | 2 (1 on the link) |
| `create_pda_account` | `src/checks.rs:132-148` | `tests/checks_host_accounts.rs:103`, `:115` | `tests/checks_mollusk_init.rs:112`, `:121`, `:152` | `checks-init.test.ts:64`, `:70`, `:98` | 7 (4 on the link) |
| `distinct` | `src/checks.rs:153-156` | `tests/checks_host.rs:149` | `tests/checks_mollusk_init.rs:160`; `tests/sealed_settle.rs:170` | `checks-init.test.ts:90` | 2 (1 on `settle_sealed_fee`) |
| `event_accounts` (authority) | `src/checks.rs:160-167` | `tests/checks_host.rs:162` | `tests/checks_mollusk.rs:144` | `checks.test.ts:101` | 4 (2 on the link) |
| `event_program` | `src/checks.rs:168-170` | `tests/checks_host.rs:162` | `tests/checks_mollusk.rs:152` | `checks.test.ts:107` | 4 (2 on the link; 2 `keeps`) |
| `top_level` | `src/checks/top_level.rs:17-21` | none (no stack on the host, `:29-32`) | none | `tests/brot/resolve-refuses.test.ts:53` (a resolve forwarded by `tests/programs/cpi-proxy`); `tests/brot/contest-reread.test.ts:69` (a re-read, the same way) | 2 |
| `upgrade_authority` | `src/checks/upgrade.rs:17-30` | `tests/checks_host_accounts.rs:50`, `:58`, `:69` | `tests/checks_mollusk_init.rs:81`, `:90`, `:105` | `checks-init.test.ts:34`, `:47`, `:58` | 3 |
| `upgrade_authority_key` | `src/checks/upgrade.rs:31-33` | `tests/checks_host_accounts.rs:50` | `tests/checks_mollusk_init.rs:81` | `checks-init.test.ts:34` | 2 (1 `keeps`) |
| `close_account_lamports` | `src/checks/close.rs:17-23` | `tests/checks_close_paying.rs:23`, `:35`, `:50`, `:63` | none | `tests/brot/close-revival.test.ts:27` | none at `8af10e2` (G-1); 1 on the branch (`5f5cfd1`) |
| `paying_vault_distinct` | `src/checks/paying.rs:14-25` | `tests/checks_close_paying.rs:87` | none | slot-matrix alias cases (below) | none at `8af10e2` (G-1); 1 on the branch (`5f5cfd1`) |
| `vault_of` (no marker) | `src/checks/paying.rs:29-37` | `tests/settle_d_collect_prize.rs:90`, `tests/settle_d_close_sweep.rs:96` | none | slot matrix | no marker |
| The loaders `state::load`, `load_mut`, `init` (no marker) | `src/state/mod.rs:56-112`, `src/state/campaign/loaders.rs:15-47` | `tests/checks_host_loaders.rs:28`, `:60`, `:87` | through every Mollusk test above | through every LiteSVM test | no marker |

The link's rows on the shared checks (`signer`, `writable`, `canonical_pda`, `system_program`, `create_pda_account`,
`event_accounts`, `event_program`) use `tests/referral_refusals.rs:50-134` and `tests/referral_link.rs:30-116` in
Mollusk and `tests/brot/referral-refuses.test.ts:33-124` and `referral-link.test.ts:29-51` in LiteSVM.

**Sprint 14: the referral link and the contest** (paths under `src/instructions/`; host tests in
`tests/contest_rules.rs`, `resolution/contest_decision.rs`, `resolution/contest_reread.rs`, `contest_timelock.rs`):

| Check (marker id) | Code | Error | Mollusk test | LiteSVM test | `PLAN` rows |
|---|---|---|---|---|---|
| `referrer_not_zero` | `referral/rules.rs:16` | `InvalidReferrer` 6153 | `tests/referral_refusals.rs:120` | `referral-refuses.test.ts:99` | 1 |
| `referrer_not_referee` | `referral/rules.rs:18` | `InvalidReferrer` 6153 | `tests/referral_refusals.rs:126` | `referral-refuses.test.ts:104` | 2 (1 `keeps`) |
| `contest_act` | `resolution/contest_rules.rs:35` | `BadInstructionData` 6021 | `tests/contest_mollusk_act.rs:84`; host `:35` | `contest-act.test.ts:52` | 2 |
| `contest_already_open` | `resolution/contest_rules.rs:53` | `ContestAlreadyOpen` 6177 | `tests/contest_mollusk_act.rs:62`; host `:35` | `contest-act.test.ts:24` | 2 |
| `contest_not_open` | `resolution/contest_rules.rs:48` | `NotContested` 6160 | `tests/contest_mollusk_act.rs:74`; host `:35` | `contest-act.test.ts:44` | 2 |
| `contest_team_key` | `resolution/contest_rules.rs:63` | `NotTeamMember` 6023 | `tests/contest_mollusk_open.rs:54`; `tests/contest_mollusk_escalate.rs:72` | `contest-open.test.ts:57` | 2 |
| `contest_window` | `resolution/contest_rules.rs:70` | `TeamKeyOutsideReview` 6091, `ContestOutsideReview` 6095 | `tests/contest_mollusk_open.rs:64`, `:75` | `contest-open.test.ts:57` | 2 |
| `contest_tallied` | `resolution/contest_rules.rs:101` | `NotTallied` 6114 | `tests/contest_mollusk_open.rs:85` | `contest-open.test.ts:57` | 1 |
| `escalate_stage` | `resolution/contest_rules.rs:78` | `WrongContestStage` 6161 | `tests/contest_mollusk_escalate.rs:83` | `contest-escalate.test.ts:60` | 1 |
| `escalate_deadline` | `resolution/contest_rules.rs:82` | `ContestDeadlinePassed` 6162 | `tests/contest_mollusk_escalate.rs:90` | `contest-escalate.test.ts:60` | 1 |
| `reread_timelock` | `resolution/contest_rules.rs:92` | `RereadBeforeTimelock` 6176 | `tests/contest_mollusk_reread.rs:74` | `contest-reread.test.ts:176` | 1 |
| `reread_metric` | `resolution/contest_rules.rs:111` | `MetricAccountMismatch` 6045 | `tests/contest_mollusk_reread.rs:186` | `contest-reread.test.ts:158` | 1 |
| `contest_status` | `resolution/contest_rules.rs:121` | `NotContested` 6160 | `tests/contest_mollusk_reread.rs:163`; `tests/contest_mollusk_decide.rs:98` | `contest-reread.test.ts:158`; `contest-decide.test.ts:151` | 2 |
| `contest_stage` | `resolution/contest_rules.rs:125` | `WrongContestStage` 6161 | `tests/contest_mollusk_reread.rs:178`; `tests/contest_mollusk_decide.rs:109` | `contest-reread.test.ts:158`; `contest-decide.test.ts:151` | 2 |
| `decide_deadline` | `resolution/contest_rules.rs:135` | `ContestDeadlinePassed` 6162 | `tests/contest_mollusk_decide.rs:118` | `contest-decide.test.ts:151` | 1 |
| `lapse_stage` | `resolution/contest_rules.rs:166` | `CampaignNotInReview` 6116 | `tests/contest_mollusk_decide.rs:174` | none | 1 |
| `lapse_deadline` | `resolution/contest_rules.rs:170` | `ContestNotLapsed` 6163 | `tests/contest_mollusk_decide.rs:167`, `:182` | `contest-worst-case.test.ts:124`; `contest-decide.test.ts:181` | 2 |
| `reread_proof` | `resolution/contest_rules.rs:181` | the reader's own | `tests/contest_mollusk_bounds.rs:44` | `contest-proof.test.ts:62` | 1 |
| `decide_admin` | `resolution/contest_rules.rs:191` | `NotAdmin` 6022 | `tests/contest_mollusk_decide.rs:89` | `contest-decide.test.ts:142` | 1 |
| `decide_confirm_reason` | `resolution/contest_decision.rs:21` | `ConfirmWithVoidReason` 6175 | `tests/contest_mollusk_decide.rs:127` | `contest-decide.test.ts:151` | 1 |
| `decide_void_reason` | `resolution/contest_decision.rs:27` | `VoidReasonNotForTeam` 6094 | `tests/contest_mollusk_decide.rs:127` | `contest-decide.test.ts:151` | 1 |

**Sprint 15: the sealed entry** (paths under `src/instructions/`):

| Check (marker id) | Code | Error | Mollusk test | LiteSVM test | `PLAN` rows |
|---|---|---|---|---|---|
| `sealed_terms` | `entries/sealed_charge.rs:30` | `CreationParamsChanged` 6090 | `tests/sealed_entry.rs:78` | `sealed-entry.test.ts:175` | 1 |
| `sealed_floor` | `sealed_charge.rs:58` | `SealedEntryBelowFloor` 6170 | `tests/sealed_entry.rs:90` | `sealed-entry.test.ts:124` | 1 |
| `sealed_max_lamports` | `sealed_charge.rs:66` | `SealedEntryAboveMaxLamports` 6171 | `tests/sealed_entry.rs:102` | `sealed-entry.test.ts:124` | 1 |
| `sealed_fee_distinct` | `entries/sealed_fee_account.rs:48` | `DuplicateAccount` 6015 | `tests/sealed_entry.rs:109` | `sealed-settle.test.ts:130` | 1 |
| `sealed_fee_keys` | `sealed_fee_account.rs:93` | `SealedFeeMismatch` 6173 | `tests/sealed_entry.rs:120` | `sealed-settle.test.ts:130` | 1 |
| `sealed_fee_settled` | `settlement/settle_sealed_fee.rs:125` | `AlreadySettled` 6107 | `tests/sealed_settle.rs:159` | `sealed-settle.test.ts:95` | 1 |
| `sealed_fee_campaign` | `settle_sealed_fee.rs:145` | `SealedFeeMismatch` 6173 | `tests/sealed_settle.rs:127` | `sealed-settle.test.ts:62` | 1 |
| `sealed_fee_sponsor` | `settle_sealed_fee.rs:152` | `WrongSponsor` 6174 | `tests/sealed_settle.rs:144` | `sealed-settle.test.ts:62` | 1 |
| `sealed_fee_finalized` | `settle_sealed_fee.rs:163` | `NotFinalized` 6106 | `tests/sealed_settle.rs:115` | `sealed-settle.test.ts:49` | 1 |
| `sealed_fees_open` | `settlement/close_campaign.rs:135` | `SealedFeesOpen` 6172 | `tests/sealed_settle.rs:189` | `sealed-outcomes.test.ts:80` | 1 |

**The pre-freeze branch** (PR #93, not on `main`; `5f5cfd1` adds these rows and sources, and the two Sprint 04 rows
above; the files are cited by function because the branch rewrites them):

| Check (marker id) | Code | Error | Tests (by name) | `PLAN` rows |
|---|---|---|---|---|
| `tally_cutoff_final` | `settlement/tally_late_joins.rs::require_cutoff_final` | `CutoffNotFinal` 6178 | host `prefreeze_tally_waits_until_the_proof_is_over_60_seconds_old` (`tests/prefreeze_tally.rs`); LiteSVM "the tally of a YES price result waits until its proof is over 60 s old, to the second", "a partial tally cannot keep a join early once an earlier proof moves the cut-off back" (`tests/brot/prefreeze-partial-tally.test.ts`) | 2 |
| `tally_join_slots` | `tally_late_joins.rs::check_join_slots` | `NotWritable` 6007, `DuplicateAccount` 6015 | LiteSVM "tally: a read-only Join slot, or one aliased with a named slot, is refused before any load" (`tests/brot/prefreeze-tally-refusals.test.ts`) | 1 |
| `vault_booked_change` | `settlement/bookkeeping.rs::VaultWatch` (`check`) | `InvariantViolated` 6101 | host `prefreeze_vault_watch_refuses_a_payout_the_books_do_not_record`, `…_refuses_a_flag_the_vault_did_not_follow`, `…_counts_changes_and_a_reserve_stays_in_the_vault` (`tests/prefreeze_vault.rs`) | 3 |
| `move_both_sides` | `settlement/collect_fee/moves.rs::moved_exactly` | `InvariantViolated` 6101 | host `prefreeze_vault_move_refuses_the_same_account_on_both_sides` | 1 |
| `close_books_covered` | `settlement/bookkeeping.rs::require_books_covered` | `InvariantViolated` 6101 | host `prefreeze_close_refuses_a_vault_below_what_the_books_hold` | 1 |

**How `scripts/checks-mutation.mjs` proves it.** For each marker id in its plan (`scripts/checks-mutation.mjs:80-165`),
the script finds the marker in exactly one of its `SOURCES` (`:26-37`, ten files at `8af10e2`) and inserts
`if true { return Ok(()); }` (for `canonical_pda`, `return Ok(bump)`) right after the `// X0.9 <id>` line
(`:189-197`), rebuilds the program with `cargo build-sbf` (`:215`, `:279-281`), runs that check's twin tests in Mollusk
(`RUST_TARGETS`, `:42-55`; `:219-233`) and in LiteSVM through Bun's JUnit report (`TS_FILES`, `:56-72`; `:234-249`), and
restores the source byte for byte, also on error or Ctrl-C (`:201-206`, `:282`). A row marked `fail` must fail with the
check removed; a row marked `keeps` must still pass, because another check refuses that input the same way (`:77-79`).
Before any mutant, every test must be green on the unmutated build, or the run stops with exit 2 (`:261-272`). Exit 0
means every mutant behaved as planned (`:294`); `--plan` prints the plan without building (`:255-259`). At `8af10e2`,
`--plan` finds every marker of the plan once.

**Recorded runs.** 2026-10-08, the fifteen Sprint 02 checks, exit 0, with what each test got when its check was removed
(`docs/sprints/sprint-02-pot-core.md:371-397`); 2026-10-09, the same plus `top_level`, exit 0
(`docs/sprints/sprint-03-readers-resolution.md:364-369`). Sprint 14: the two referral rules and, after D2, the
dispute's 17 ids (with `top_level` under the re-read's test) in 37 cases, each failing as it must; then S1's three new
ids, all nine cases; the link's rows on Sprint 02's shared checks have no recorded run
(`docs/sprints/sprint-14-referral-second-read.md:220-222`, `:229-231`). Sprint 15: the ten new checks, each one's Mollusk
and LiteSVM tests failing without it, and the new `distinct` test (`docs/sprints/sprint-15-sponsorship.md:157-158`).
The pre-freeze branch: its seven ids, 11 of 11 tests failing without their checks (`5f5cfd1`). The script runs by hand
only (`scripts/checks-mutation.mjs:9`); no run covers the whole plan on one commit yet, which is the freeze's step 7.

**Call sites, not only bodies.** X0.9 proves that each check's body refuses; it does not prove that every instruction
calls it on every slot (the Sprint 02 review: `docs/sprints/sprint-02-pot-core.md:477-481`, finding 3 at `:510`). A
one-off run on 2026-10-08 removed 21 call sites one at a time and saw each one's test fail
(`docs/sprints/sprint-02-pot-core.md:400-404`); that script was not kept in the repository. Since Sprint 04 the call
sites are covered by the slot matrix: 504 cases at `8af10e2`, generated from the IDL for all 27 instructions
(`tests/brot/slot-matrix.gen.ts:535-563`, by `scripts/slot-matrix.ts`), one per signer left unsigned, writable slot passed
read-only, stranger account, account of each other program type, and aliased pair of writable slots, each of which must
be refused with its own `BrotError` while no lamport of the instruction's accounts moves
(`tests/brot/slot-matrix.test.ts:24-55`). The branch adds `tally_late_joins`'s first `Join` slot, 9 cases (513). CI
fails if the matrix no longer matches the IDL (`ci.yml:150-151`). The explicit comparisons with stored keys (the
`has_one` of Anchor) live in the instructions; `SCOPE.md` §13 lists each with its test.

## Before sending

- [ ] Fill the release-candidate block in the order above, and record the same values in `CHANGELOG.md` and the session
      log.
- [ ] Re-check every `file:line` of this package against the candidate commit (they cite `8af10e2`). The pre-freeze
      branch rewrites five paths cited here by function (`settlement/tally_late_joins.rs`, `settlement/bookkeeping.rs`,
      `settlement/collect_fee/`, `resolution/resolve_campaign.rs` with `resolve_campaign/`, `src/math/invariant.rs`)
      and moves lines in `close_campaign.rs`, `collect_fee.rs`, `settle_entry.rs`, `settle_creator_share.rs`,
      `settle_prize.rs`, the end of `src/error.rs`, `scripts/checks-mutation.mjs`, `tests/brot/slot-matrix.gen.ts`,
      `late-entries.test.ts`, `close-reserve.test.ts`, `invariant-window.ts` and `invariant-contest.ts`.
- [ ] Rerun `scripts/checks-mutation.mjs` over the whole plan on the candidate (the branch closes G-1), and record the
      table.
- [ ] Decide each item of `SCOPE.md` §17 ("Known open items before the freeze"): fixed in the candidate, or sent to the
      firms as a known issue; once PR #93 is merged, turn its "closed on the branch" items into closed ones.
- [ ] Send each firm this folder, the candidate's tag, the binary and its hash, the IDL, and read access to the
      repository at the tag.
