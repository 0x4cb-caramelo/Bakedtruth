# Brot Markets — audit package

**Status:** draft for the Sprint 16 freeze, written on 2026-10-13 against `main` at
`395efa5b9f84cb0eda8876728df6da06aef21c20` (worktree branch `sprint-17-audit-fixes`). Every `file:line` in this package
points at that commit. The release candidate the two firms read is cut at the freeze; its identifiers go in the block
below, and the line numbers are re-checked against it before the package is sent (see "Before sending").

Labels used throughout: **[to verify]** marks a statement nobody has checked yet; `<<FILL AT FREEZE: …>>` marks a value
only the freeze can give. Nothing else in this package is a guess.

Paths: `src/…`, `Cargo.toml` and the Rust tests `tests/<name>.rs` are under `programs/brot-markets/`; every other path
(`tests/brot/`, `tests/sdk/`, `scripts/`, `docs/`, `.github/`, …) starts at the repository root; a bare `….test.ts` name
is under `tests/brot/`; `:N` repeats the file just named. `SCOPE.md` ("Paths") states the convention in full.

## What is in the package

| File | What it answers |
|---|---|
| `README.md` (this file) | What the program is; the release candidate; how to build and test; where the negative test of each check lives (T24) and how `scripts/checks-mutation.mjs` proves each check's test fails without it (X0.9) |
| [`SCOPE.md`](SCOPE.md) | What is in scope, item by item, with `file:line` and error codes: the 22 instructions, the ten creation rules of TP §3.4.10, the Pyth-priced opening, every creation parameter and its ceiling, the six reader kinds, entries, resolution, the review window, settlement and the reserve path, the fees and the creator share, `VoidReason`, the `checks` module, powers and the pause, events, the invariants I1–I15; the known open items before the freeze; Sprint 14 and 15 placeholders; what is out of scope and why |
| [`THREAT-MODEL.md`](THREAT-MODEL.md) | Assets, actors, trust boundaries, and each attack class per instruction with its mitigation and its test; the accepted risks the founder decided |
| [`PINOCCHIO.md`](PINOCCHIO.md) | Pinocchio's own audits, the version they covered, and the versions this program pins (they differ) |
| [`FIX-WORKFLOW.md`](FIX-WORKFLOW.md) | How a finding becomes a fix: intake, severity, the reproducing test, the branch, the gates, the firm's confirmation, the new hash, the public report |

Suggested reading order for a firm: this file, `SCOPE.md` §1–§3, `THREAT-MODEL.md`, then the code in the order of
`SCOPE.md` §4 onward. The `checks` module (`programs/brot-markets/src/checks.rs` and `checks/`) is the newest risk in the
program (TP §3.4.17, §13): Anchor used to generate these checks, here they are written by hand.

## The program in one paragraph

`brot-markets` (`programs/brot-markets`, 99 Rust files, 9,709 lines at `395efa5`) is a Solana program on Pinocchio
0.11.2 (`programs/brot-markets/Cargo.toml:30`) that holds users' SOL, **with no cap** of any kind (D-h). A campaign is a
YES/NO question that one third-party account answers, read by one of six closed reader kinds
(`src/state/enums.rs:19-26`). Any wallet opens a campaign by paying US$500 in SOL at the Pyth SOL/USD price minus its
confidence (90% becomes a prize, 10% an opening fee held until the outcome); a team key opens free. Bakers join YES or
NO with SOL; the SOL sits in a data-less, program-owned PDA per campaign (`["vault", campaign]`) and every balance is
bookkept in account fields, never read from a vault (I15). Any wallet resolves (top level only), a six-hour review
window follows, then a snapshot fixes the payout mode (`Split`, `OneSided`, `Refund`) and every payout goes to a stored
key, sent by any wallet. Brot keeps 10% of the losing side (`fee_bps`), the creator 1% of the entries
(`creator_share_bps`). Every instruction that succeeds emits its event by self-CPI (two for the team's confirm and
void). The program is unaudited and runs on devnet only
(`5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`).

## Release candidate (the lead fills this block at the freeze)

| Item | Value |
|---|---|
| Git tag | `<<FILL AT FREEZE: tag name>>` |
| Commit (full SHA) | `<<FILL AT FREEZE>>` |
| Crate version (`programs/brot-markets/Cargo.toml:3`) | `<<FILL AT FREEZE>>` (`0.0.3` at `395efa5`) |
| Mainnet program id (`declare_id!`, `src/lib.rs:23`) | `<<FILL AT FREEZE: the fresh mainnet id>>` (today the devnet id; see note 2) |
| Event authority for that id (`src/constants.rs:32`, bump at `:34`) | `<<FILL AT FREEZE>>`; `tests/layout.rs:75-79` fails if it is not the canonical PDA of the id |
| Cargo features of the audited binary | `mainnet` only. `drill` and `stake-at-least` cannot be built with it (`src/constants.rs:142-145`, `:168-169`) |
| Binary `brot_markets.mainnet.so`: sha256 and size | `<<FILL AT FREEZE>>` |
| IDL `brot_markets.json` for mainnet: sha256 | `<<FILL AT FREEZE>>` |
| CI run (id and URL) that built it | `<<FILL AT FREEZE>>` |
| Provenance attestation | `<<FILL AT FREEZE: output of gh attestation verify … --repo 0x4cb-caramelo/Bakedtruth>>` |
| `solana-verify build` command, and the executable hash of two runs | `<<FILL AT FREEZE>>` (must equal the CI sha256; Sprint 16 DoD) |
| `Cargo.lock` sha256 | `<<FILL AT FREEZE>>` |
| Toolchain | Rust 1.89.0 (`rust-toolchain.toml`), Solana CLI 3.1.10 and platform-tools v1.52 (TP §14.4 C14), shank-cli 0.4.9 |
| Mainnet `admin_initialize_config` arguments (admin, fee recipient, `CreationParams`) | `<<FILL AT FREEZE: the values Sprint 16 records>>`; they are not in the binary but decide its behaviour (SCOPE §5) |

Notes for the lead:

1. **No `mainnet` SBF binary exists today.** CI builds only the default features (`package.json:19`,
   `.github/workflows/ci.yml:103-106`) and publishes that binary as `programs-<sha>` from `main`
   (`ci.yml:201-218`). The `mainnet` feature is compiled only for host tests and clippy (`ci.yml:135-138`, `:153-156`).
   Building and publishing `brot_markets.mainnet.so` is carried over to Sprint 16
   (`docs/sprints/sprint-16-hardening.md`, "Carried over"). A plausible build line, not run here **[to verify]**:
   `cargo build-sbf --manifest-path programs/brot-markets/Cargo.toml --sbf-out-dir <dir> --features mainnet -- --locked`
   (`cargo build-sbf --help` of Solana CLI 3.1.10 lists `--features` and `--sbf-out-dir`), then rename the output.
2. **The program id must be final before the freeze.** TP §3.4.19 plans a fresh mainnet id kept unpublished until its
   deploy (a funded ProgramData address makes an id undeployable). Changing it changes `src/lib.rs:23` and the event
   authority constant and bump (`src/constants.rs:32-34`), so the binary hash changes: the audited commit must already
   carry the mainnet id.
3. **`solana-verify` commands, as Solana's documentation writes them** (read 2026-10-13,
   https://solana.com/docs/programs/verified-builds); how to pass `--features mainnet` is **[to verify]** (the page
   shows `-- --features …` only in one example):

   ```bash
   solana-verify build --library-name brot_markets                      # plus the mainnet feature [to verify]
   solana-verify get-executable-hash target/deploy/brot_markets.so
   solana-verify get-program-hash -u $NETWORK_URL $PROGRAM_ID            # after the deploy (Sprint 18)
   solana-verify verify-from-repo -u $NETWORK_URL --program-id $PROGRAM_ID https://github.com/$REPO_PATH \
     --commit-hash $COMMIT_HASH --library-name brot_markets --mount-path $MOUNT_PATH
   ```

   The tool's README lists a Pinocchio example, `examples/hello_world_pinocchio`
   (https://github.com/Ellipsis-Labs/solana-verifiable-build, read 2026-10-13); whether it builds this crate is Sprint
   16's open item **[to verify]**.

## Build and test

From `CLAUDE.md` and `docs/SPRINTS.md` §4. The test suites load `target/deploy/brot_markets.so` (and `cpi_proxy.so`),
so build first.

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install --frozen-lockfile
bun run build:program      # cargo build-sbf for brot-markets and the test-only cpi-proxy, then the Shank IDL and Codama client
bun run test               # bun test tests/ app/ : LiteSVM, in process (instructions, refusals, slot matrix, randomized I1–I15)
bun run test:rust          # cargo test -p brot-markets --features no-entrypoint : host tests and Mollusk on the SBF binary
SBF_OUT_DIR=$PWD/target/deploy cargo test --locked -p brot-markets --features no-entrypoint,mainnet   # T12, the mainnet constants
cargo fmt --all -- --check
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
bun scripts/slot-matrix-check.ts           # the slot matrix still matches the IDL (CI: ci.yml:130-131)
bun run scripts/surfpool/price-touch.ts    # the price reader on a Surfpool 1.6.0 mainnet fork (CI: ci.yml:166-192)
node scripts/checks-mutation.mjs --plan    # the X0.9 plan; without --plan it rebuilds once per mutant (by hand, never in CI)
```

Single tests: `bun test tests/ -t "<describe or test name>"`; `cargo test -p brot-markets --features no-entrypoint --test
<file> <name>`. What runs where:

| Suite | Engine | Where |
|---|---|---|
| Host tests (pure functions, readers on captured mainnet bytes, the `checks` functions on runtime-shaped buffers) | `cargo test` | `programs/brot-markets/tests/*.rs` (88 files) |
| The `checks` negatives on the real SBF binary | Mollusk 0.14.0 (`Cargo.toml:49`) | `tests/checks_mollusk.rs`, `tests/checks_mollusk_init.rs`, `tests/stake_at_least_mollusk.rs` |
| Instructions, refusals, slot matrix, randomized I1–I15 | LiteSVM (npm `litesvm` ^1.5.0) | `tests/brot/*.test.ts` (47 files) |
| SDK parity with the program (a mirror of `math/`, the opening and join rules, the event decoder) | LiteSVM behind a local RPC | `tests/sdk/*.test.ts` |
| Third-party layouts | captured mainnet bytes, SHA-256 pinned | `tests/fixtures/`, `tests/fixtures/index.json`, `tests/fixtures.test.ts` |

Known limits of the engines: LiteSVM's npm package and Surfpool answer 0 to `sol_get_epoch_stake`, so the `StakeAtLeast`
YES path is shown only in Mollusk (`tests/stake_at_least_mollusk.rs`); `solana-test-validator` 3.1.10 needs AVX2, absent
on the development machine, so local rehearsals run on Surfpool (`CLAUDE.md`, "Gotchas"; TP §3.4.19).

## The `checks` module: where each negative test is (T24), and how the mutation script proves it (X0.9)

TP §3.4.17 asks that every check have a negative test that feeds the wrong account and is refused (T24), and that the
test be shown to fail when the check is removed (X0.9). Each check carries a `// X0.9 <id>` marker right before its
refusal (`src/checks.rs:12-13`).

| Check (marker id) | Code | Host test | Mollusk test (SBF binary) | LiteSVM test (SBF binary) | In the mutation plan |
|---|---|---|---|---|---|
| `owned_by` | `src/checks.rs:48-51` | `tests/checks_host.rs:25` | `tests/checks_mollusk.rs:59` | `tests/brot/checks.test.ts:26` | `scripts/checks-mutation.mjs:41` |
| `signer` | `src/checks.rs:54-57` | `tests/checks_host.rs:35` | `tests/checks_mollusk.rs:67` | `checks.test.ts:32`; pre-funded path `checks-init.test.ts:76` | `:42` |
| `writable` | `src/checks.rs:60-63` | `tests/checks_host.rs:44` | `tests/checks_mollusk.rs:76` | `checks.test.ts:38` | `:43` |
| `len` | `src/checks.rs:66-69` | `tests/checks_host.rs:53` | `tests/checks_mollusk.rs:108`, `:125` | `checks.test.ts:62`, `:71` | `:44-45` |
| `tag` | `src/checks.rs:73-75` | `tests/checks_host.rs:64` | `tests/checks_mollusk.rs:87`, `:94` | `checks.test.ts:44`, `:50` | `:46-48` |
| `tag_version` | `src/checks.rs:76-78` | `tests/checks_host.rs:76` | `tests/checks_mollusk.rs:101` | `checks.test.ts:56` | `:49-50` |
| `pda` (`pda_address`) | `src/checks.rs:94-103` | `tests/checks_host.rs:86` | `tests/checks_mollusk.rs:135` | `checks.test.ts:77`, `:86` | `:51-52` |
| `canonical_pda` | `src/checks.rs:108-118` | `tests/checks_host.rs:113` | `tests/checks_mollusk_init.rs:62` | `checks-init.test.ts:20` | `:53` |
| `system_program` | `src/checks.rs:121-125` | `tests/checks_host.rs:138` | `tests/checks_mollusk_init.rs:73` | `checks-init.test.ts:28` | `:54` |
| `create_pda_account` | `src/checks.rs:132-148` | `tests/checks_host_accounts.rs:103`, `:115` | `tests/checks_mollusk_init.rs:112`, `:121`, `:152` | `checks-init.test.ts:64`, `:70`, `:98` | `:60-62` |
| `distinct` | `src/checks.rs:153-156` | `tests/checks_host.rs:149` | `tests/checks_mollusk_init.rs:160` | `checks-init.test.ts:90` | `:63` |
| `event_accounts` (authority) | `src/checks.rs:160-167` | `tests/checks_host.rs:162` | `tests/checks_mollusk.rs:144` | `checks.test.ts:101` | `:64-65` |
| `event_program` | `src/checks.rs:168-170` | `tests/checks_host.rs:162` | `tests/checks_mollusk.rs:152` | `checks.test.ts:107` | `:66-67` |
| `top_level` | `src/checks/top_level.rs:16-22` | none (no stack on the host, `:30-33`) | none | `tests/brot/resolve-refuses.test.ts:53` (a resolve forwarded by `tests/programs/cpi-proxy`) | `:68` |
| `upgrade_authority` | `src/checks/upgrade.rs:17-30` | `tests/checks_host_accounts.rs:50`, `:58`, `:69` | `tests/checks_mollusk_init.rs:81`, `:90`, `:105` | `checks-init.test.ts:34`, `:47`, `:58` | `:55-57` |
| `upgrade_authority_key` | `src/checks/upgrade.rs:31-33` | `tests/checks_host_accounts.rs:50` | `tests/checks_mollusk_init.rs:81` | `checks-init.test.ts:34` | `:58-59` |
| `close_account_lamports` | `src/checks/close.rs:17-23` | `tests/checks_close_paying.rs:23`, `:35`, `:50`, `:63` | none | `tests/brot/close-revival.test.ts:27` | **absent** (gap G-1) |
| `paying_vault_distinct` | `src/checks/paying.rs:14-25` | `tests/checks_close_paying.rs:87` | none | slot-matrix alias cases (below) | **absent** (gap G-1) |
| `vault_of` (no marker) | `src/checks/paying.rs:29-37` | `tests/settle_d_collect_prize.rs:90`, `tests/settle_d_close_sweep.rs:96` | none | slot matrix | no marker |
| The loaders `state::load`, `load_mut`, `init` (no marker) | `src/state/mod.rs:49-105`, `src/state/campaign/loaders.rs:15-47` | `tests/checks_host_loaders.rs:28`, `:60`, `:87` | through every Mollusk test above | through every LiteSVM test | no marker |

**How `scripts/checks-mutation.mjs` proves it.** For each marker id in its plan (`scripts/checks-mutation.mjs:40-69`),
the script inserts `if true { return Ok(()); }` (for `canonical_pda`, `return Ok(bump)`) right after the `// X0.9 <id>`
line (`:93-101`), rebuilds the program with `cargo build-sbf` (`:119`, `:183-185`), runs that check's twin tests in
Mollusk (`:31`, `:123-137`) and in LiteSVM through Bun's JUnit report (`:32`, `:138-153`), and restores the source byte
for byte, also on error or Ctrl-C (`:105-110`, `:186`). A row marked `fail` must fail with the check removed; a row
marked `keeps` must still pass, because another check refuses that input the same way (`:37-39`). Before any mutant,
every test must be green on the unmutated build, or the run stops with exit 2 (`:165-176`). Exit 0 means every mutant
behaved as planned (`:198`); `--plan` prints the plan without building (`:159-163`).

**Recorded runs.** 2026-10-08, the fifteen Sprint 02 checks, exit 0, with what each test got when its check was removed
(`docs/sprints/sprint-02-pot-core.md:371-397`); 2026-10-09, the same plus `top_level`, exit 0
(`docs/sprints/sprint-03-readers-resolution.md:364-369`). The script runs by hand only (`scripts/checks-mutation.mjs:9`);
no run is recorded after Sprint 04 added `checks/close.rs` and `checks/paying.rs`, whose markers the script does not
read (`SOURCES` at `:26` lists `checks.rs`, `checks/top_level.rs`, `checks/upgrade.rs` only). See `SCOPE.md` gap G-1.

**Call sites, not only bodies.** X0.9 proves that each check's body refuses; it does not prove that every instruction
calls it on every slot (the Sprint 02 review: `docs/sprints/sprint-02-pot-core.md:477-481`, finding 3 at `:510`). A
one-off run on 2026-10-08 removed 21 call sites one at a time and saw each one's test fail
(`docs/sprints/sprint-02-pot-core.md:400-404`); that script was not kept in the repository. Since Sprint 04 the call
sites are covered by the slot matrix: 373 cases generated from the IDL (`tests/brot/slot-matrix.gen.ts:404-427`, by
`scripts/slot-matrix.ts`), one per signer left unsigned, writable slot passed read-only, stranger account, account of
each other program type, and aliased pair of writable slots, each of which must be refused with its own `BrotError`
while no lamport of the instruction's accounts moves (`tests/brot/slot-matrix.test.ts:22-52`). CI fails if the matrix no
longer matches the IDL (`ci.yml:130-131`). The explicit comparisons with stored keys (the `has_one` of Anchor) live in the
instructions, not in `checks`; `SCOPE.md` §13 lists each with its test.

## Before sending

- [ ] Fill the release-candidate block, and record the same values in `CHANGELOG.md` and the session log.
- [ ] Re-check every `file:line` of this package against the candidate commit (they cite `395efa5`).
- [ ] Extend `scripts/checks-mutation.mjs` to `checks/close.rs` and `checks/paying.rs`, rerun it on the candidate, and
      record the table (gap G-1).
- [ ] Decide each item of `SCOPE.md` §17 ("Known open items before the freeze"): fixed in the candidate, or sent to the
      firms as a known issue.
- [ ] Fill or delete the "Sprint 14 (pending)" and "Sprint 15 (pending)" sections of `SCOPE.md`.
- [ ] Send each firm this folder, the candidate's tag, the binary and its hash, the IDL, and read access to the
      repository at the tag.
