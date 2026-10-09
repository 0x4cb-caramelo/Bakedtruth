# Sprint 02 — Pot core on Pinocchio: config, paid opening, vault, entries

**Status:** merged into `main` in PR #35 on 2026-10-08 (PR #30 reviewed; no `sprint-02` tag yet) · **Branch:** `sprint-02-pot-core` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B2 (TP §3.4.1–3.4.4, §3.4.8 for the SOL/USD read, §3.4.9, §3.4.10, §3.4.14, §3.4.16 for the opening conversion, §3.4.17) |
| Depends on | Sprint 00. Not on 01, whose price reader it uses as it stands |
| Requirements covered | BR-01, BR-02 and BR-06 for the price kind; BR-04 (the 90/10 split, held); BR-05, BR-07, BR-08, BR-09 (the fee copied at opening), BR-12 (no exit instruction), BR-14, BR-16, BR-19 (free team openings), BR-39, BR-42 (the pause) |

## Goal

The program is rewritten on Pinocchio (D-o) and gains its configuration, its team, the campaign, the lamport vault
and the entry. Any wallet can open a price campaign by paying US$500 in SOL at the Pyth SOL/USD price, 90% bookkept as
the prize and 10% held for Brot (D-b, D-f, T23); a team key opens for free, with no creator share (P-3); any wallet
can join with at least 0.01 SOL (P-5). Every account check Anchor used to make is now written by hand, in one module,
with a test that fails when the check is removed. The program does not read results or pay yet.

## Definition of done

Each item carries its evidence: a test name or filter, a command and its result, or a commit. "Record and
retrospective", at the end of this file, holds the tables (lanes, sizes and rent, X0.9).

- [x] **Entry, recorded in `session-log/` at the opening:** the team's choices on T4, T9, T10–T12, T17–T19 and
      T23–T25 (proposal §4, Phase 0 entry); the D6 rename done before the first identifier, the copy first, then code
      and docs in one PR (proposal §5.2).
      Evidence: `session-log/2026-10-08-sprint-02-abertura-t-items-e-contrato.md`; the copy commit `c82be03` (the
      landing page) comes before the first identifier, in the contract commit `10fb4aa`.
- [x] **T15, first, before the Codama spike adds npm packages:** `bun.lock` resolves from `registry.npmjs.org`
      instead of `registry.npmmirror.com`, `bun install --frozen-lockfile` passes, and the two existing
      `trustedDependencies` entries (`sharp`, `unrs-resolver`) are reviewed and recorded (TP §14.4 C30).
      Evidence: commit `7d770ce`, the first of the sprint. A fresh-cache `bun install --frozen-lockfile --verbose`
      fetched 705 tarballs, all from `registry.npmjs.org`, every sha512 matching. `sharp` 0.35.5 has no install
      script and `unrs-resolver` 1.12.2's postinstall only re-fetches a binary bun already installs: both entries
      removed; the app's lint and build still pass.
- [x] **Day one:** Pinocchio 0.11.2, with its matching `pinocchio-system` [AC], builds in CI with `cargo build-sbf`
      under Rust 1.89 and Solana CLI 3.1.10. The result is recorded. If it does not build, the sprint stops there and
      the finding is reported before anything else [INF].
      Evidence: locally on day one, `pinocchio` 0.11.2 with `pinocchio-system` 0.6.1 (the matching pair: 0.6.1 asks
      for `pinocchio` 0.11) built with `cargo build-sbf` (Solana CLI 3.1.10, platform-tools v1.52, rustc 1.89.0). In
      CI: run 37849347333 on PR #30 (commit `21470da`), job Program, step "Build programs and IDLs" (Rust from
      `rust-toolchain.toml`, Solana CLI 3.1.10): success.
- [x] `programs/brot-markets` depends on neither `anchor-lang` nor `anchor-spl` and leaves `Anchor.toml`.
      `bun run build:program` builds it with `cargo build-sbf`, writes the Shank IDL and syncs it into
      `packages/sdk`; `anchor build` builds only `pred-provable`, until Sprint 03. `CLAUDE.md`'s build line says so
      (TP §14.1).
      Evidence: `programs/brot-markets/Cargo.toml`; `Anchor.toml` (`[workspace] exclude`); `package.json`
      `build:program`, run locally in 8 min 50 s: `pred_provable.so` 579,504 bytes, `brot_markets.so` 67,384 bytes,
      the Shank IDL and the Codama client regenerated with no diff; `CLAUDE.md`, Commands.
- [x] **The `checks` module** (TP §3.4.17) holds the checks of this sprint: owner, signer, writable, tag, PDA
      (re-derived with the stored bump), exact length, the System Program id, the upgrade authority at initialization,
      create, and `distinct`, which the TP adds as [NEW]: the same account is refused in two slots that must differ.
      Create tolerates an address funded in advance (top up, allocate, assign) and never re-initialises an account
      that carries a tag. The close check comes with the first instruction that closes an account (Sprint 04).
      Evidence: `programs/brot-markets/src/checks.rs` (`owned_by`, `signer`, `writable`, `len`, `tag`, `pda`,
      `canonical_pda`, `system_program`, `upgrade_authority`, `create_pda_account`, `distinct`, `event_accounts`).
      Since the reviews, `state::init` also refuses an account that carries a tag or a version (`AlreadyInitialized`,
      `init_writes_the_tag_once_and_refuses_an_account_that_carries_one`), whatever its caller checked.
- [x] **Every check has a negative test** (T24), and disabling the check makes that test fail, shown once per check
      and recorded in this file (X0.9).
      Evidence: 19 host tests (`tests/checks_host*.rs`), 23 Mollusk tests (`tests/checks_mollusk*.rs`, on the real
      binary), 21 LiteSVM tests (`bun test tests/ -t "checks refuse"`). Scope of the proof: the 15 refusals of
      `checks.rs` (`node scripts/checks-mutation.mjs`, exit 0, rerun after the review fixes), and 21 call sites and
      rules inside the instructions that the reviews named: every `checks::signer` call, every role check
      (`NotAdmin`, `NotTeamMember`, `NotPendingAdmin`), the join's `EntryMismatch` and vault owner, the `state::init`
      guard and the clock-lead bound (one-off run, table in Record). The other `checks::` call sites (about 50) are
      covered by their slot tests but were not mutated one by one; a generated slot matrix is carried to Sprint 04,
      before any instruction pays a wallet that does not sign.
- [x] **Accounts** of TP §3.4.1: `GlobalConfig` (`["config"]`); the fee vault (`["fee_vault"]`, data-less,
      program-owned, created at initialization); `Campaign` (`["campaign", id]`); the campaign vault
      (`["vault", campaign]`, a data-less program-owned PDA created with its rent-exempt minimum, 650,240 lamports
      [F]); and `Entry` (`["entry", campaign, baker]`, created on the baker's first join). Each account with data
      carries a type tag and an exact size; the real sizes and rent are measured and recorded (T19). No `CapState`,
      `AcceptedAccount`, `SponsorRequest` or `max_pot` exists.
      Evidence: `programs/brot-markets/src/state/`; `tests/layout.rs` pins the sizes (400, 512, 100 bytes); the
      sizes and rent table in Record.
- [x] **Instructions,** one per file, under 200 lines, each with a `Purpose:` header (TP §3.4.3):
      `admin_initialize_config`, `admin_set_team`, `admin_set_creation_params`, `admin_set_fee_recipient`,
      `admin_transfer_admin`, `admin_accept_admin`, `team_pause_entries`, `admin_resume_entries`, `user_open_campaign`
      for the price kind, and `user_join_campaign`.
      Evidence: `programs/brot-markets/src/instructions/`; the longest handler is 191 lines (`open_campaign.rs`).
- [x] Only the program's upgrade authority, checked against its ProgramData account, can run the initialization.
      Evidence: `bun test tests/ -t "initialization only by the upgrade authority"`; Mollusk
      `upgrade_authority_refuses_*`.
- [x] `admin_set_creation_params` changes the opening fee in US$, the prize share, the fee, the one-sided fee, the
      creator share, `max_open_campaigns`, `min_entry_lamports`, the SOL/USD feed and bounds, and
      `campaign_max_age`; each value stays under its code ceiling and applies to future campaigns only (test: an open
      campaign keeps its values). `MAX_FEE_BPS` (1,000) and `MAX_CREATOR_SHARE_BPS` (100) come from the sources; the
      ceilings of the other parameters and the devnet value of `max_open_campaigns` are written here and recorded
      [AC] (TP §3.4.1).
      Evidence: `tests/config_params.rs` (every bound, one error each); `bun test tests/ -t "creation params apply
      to future campaigns only"` (5 pass); the ceilings and the devnet values are recorded in the opening session log
      (C43), not here. **One exception, open for the founder:** `min_entry_lamports` is read from `GlobalConfig` at
      every join, so a change reaches open campaigns too (`tests/brot/admin-params.test.ts`). TP §3.4.1 says an open
      campaign keeps the values it copied, while TP §3.4.3 (the join reads "pause and minimum") implies the live
      read; the terms published at `/terms` promise the first ("An open market keeps the rules it opened with").
      The code keeps the live read until he answers.
- [x] **`user_open_campaign` refuses every row of TP §3.4.10 with its own error** (X0.7, program half): rows 1 to 10
      for the price kind; the other four kinds are refused until Sprint 03. For row 3, the price target must not be
      touched yet; the minimum distance per kind is set in Sprint 03 [AC]. The SOL/USD account is derived from
      `GlobalConfig.sol_usd_feed_id`, never trusted as passed. A price campaign copies `campaign_max_age` (never below
      30 s) from the config: the creator does not choose it (TP §3.4.8 [INF]). Test filter: `open campaign refuses`.
      Evidence: `bun test tests/ -t "open campaign refuses"`: 26 pass; row 10 by `-t "retried opening fails on its
      id"` (3 pass). Rows 6 and 9 hold by construction: the arguments have no fee, share or string field, and a byte
      more or less fails with `BadInstructionData` (tested), not with an error of their own.
- [x] **The paid opening** (TP §3.4.16): `opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)` in `u128` with
      checked math; `prize_lamports = floor(paid × 9,000 ÷ 10,000)`; `opening_fee_lamports = paid − prize`; all of it
      moves from the creator into the vault (I14, X0.8 first half). It is refused above `max_lamports` (T25), and
      when the SOL/USD account is older than `max_price_age` or wider than `max_price_conf_bps`. `opening_usd` above
      500 makes a larger prize at the same 90/10. Tested on the captured SOL/USD fixture.
      Evidence: `bun test tests/ -t "opening charges 500 dollars at the pyth price"`: 4 pass, one of them a campaign
      on SOL/USD itself (the same account in both price slots). At the captured price
      (US$119.21844516) US$500 is 4,193,981,891 lamports: prize 3,774,583,701, opening fee 419,398,190; the creator
      pays exactly that plus both rents. `tests/math_opening*.rs`: TP worked example A to the lamport.
- [x] **A team-key opening** without `opening_usd` moves no lamports besides rent, takes no `partner` argument and
      stores `creator_share_bps = 0` (P-3, I12); it still opens when SOL/USD is stale.
      Evidence: `bun test tests/ -t "team opening pays nothing"`: 5 pass; one shows that an unsigned team key is
      refused even when someone funded both accounts in advance, where the signature is the only guard.
- [x] **How a team key adds a prize** is not written in the sources (I14 and P1 §4.1 allow it; proposal Appendix B
      leaves `opening_usd` absent for a team key) [AC]. The working reading of TP §3.4.10 is built and tested: the team
      key passes `opening_usd` and pays like any wallet, at the same 90/10, keeping a zero creator share. The choice is
      recorded at the sprint's opening.
      Evidence: `bun test tests/ -t "team opening with a prize"`: 2 pass; opening session log, contract choice 9.
- [x] A retried opening with the same `id` fails on the existing account, and an address funded in advance does not
      block an opening (T17; X0.5, opening half).
      Evidence: `bun test tests/ -t "retried opening fails on its id"`: 3 pass.
- [x] **`user_join_campaign`** moves the entry from the baker's wallet to the vault by System Program CPI. It refuses
      outside `Open`, after `entries_close_at`, with the pause on, below `min_entry_lamports` (10,000,000), when
      `expected_entry_total` differs from the stored entry (T10; X0.5, entry half), and when the estimated return
      falls below `min_return_bps`. It marks `first_baker` when the pot was empty. One wallet may hold both sides
      (Q3).
      Evidence: `bun test tests/ -t "join refuses"`: 11 pass (one is a vault at its own address that the program does
      not own: `WrongOwner`); `bun test tests/ -t "join adds an entry"`: 3 pass.
- [x] **`math/schedule.rs`** computes `entries_close_at = deadline_at − clamp(5% × duration, 24 h, 7 days)` and
      refuses durations outside 3 to 90 days (D-k). The six rows of the P1 §3.6 table (3, 7, 14, 30, 60, 90 days)
      are test cases. The review window and the minimum duration have drill values behind a `drill` cargo feature;
      the `mainnet` feature refuses `drill`, and a CI step checks that the `mainnet` build carries the real values
      (T12, TP §3.4.1).
      Evidence: `tests/math_schedule.rs` (`entries_close_at_five_percent_of_the_duration`); `bun test tests/ -t
      "entries close at five percent of the duration"`; `cargo check --features no-entrypoint,mainnet,drill` fails
      with the `compile_error!`; CI step "Mainnet build carries the real values" runs
      `mainnet_build_carries_the_real_values` (run 37849347333: success); locally,
      `cargo test --locked -p brot-markets --features no-entrypoint,mainnet`: 147 pass.
- [x] Lamports sent by hand to a vault change neither `pool_yes`, `pool_no` nor `prize_lamports` (I15, first half).
      Evidence: `bun test tests/ -t "hand-sent lamports do not move the pot"`.
- [x] Two wallets: A cannot change, close or redirect B's `Entry`.
      Evidence: `bun test tests/ -t "two wallets"`.
- [x] With the pause on, only `user_join_campaign` and `user_open_campaign` fail; every other instruction of this
      sprint still runs (I10′, first half).
      Evidence: `bun test tests/ -t "pause stops only joins and openings"`.
- [x] **Events,** one per instruction: `ConfigInitialized`, `ConfigChanged`, `EntriesPaused`, `EntriesResumed`,
      `CampaignOpened`, `EntryAdded` (with both totals after the entry). By self-CPI if one event round-trips in
      LiteSVM on day one, otherwise `sol_log_data` until Sprint 04 (T4). Every campaign-scoped event carries the
      campaign and a contiguous `seq`. Whether npm `litesvm` exposes inner instructions is checked on day one [AC].
      Evidence: self-CPI (it round-tripped on day one; npm `litesvm` 1.5.0 exposes inner instructions, C16);
      `bun test tests/ -t "events round-trip"`.
- [x] **The Shank and Codama spike** (T9, size S): one account and one instruction rendered into a Kit client and
      round-tripped in LiteSVM. The result is recorded; the decision is Sprint 05's. If Codama fails, the IDL check
      covers the Shank output alone.
      Evidence: `packages/sdk/src/idl/brot_markets.json` and `packages/sdk/src/idl/generated/`; `bun test tests/ -t
      "codama spike round-trip"` and `-t "codama client matches the test kit"`. Codama works on Shank's IDL; the
      limits are in Record.
- [x] One error enum, one code per refusal; `constants.rs` carries no USDC, cap or pre-D6 name.
      Evidence: `programs/brot-markets/src/error.rs` (71 codes from 6000, each with its message in the IDL);
      `tests/brot/idl.test.ts` checks that `error.rs`, `tests/brot/errors.ts` and the IDL agree.
- [x] The committed IDL (and the generated client, if any) match CI's build (X0.6).
      Evidence: locally, `bun run build:program` regenerates both with no diff; in CI, run 37849347333, step "Check
      committed IDLs are up to date" (it covers `packages/sdk/src/idl`, the generated client included): success.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).
      Evidence: items 1 to 5 done (the standard checks pass locally and in CI; `secrets-scan` clean; `CODEMAP.md`
      regenerated in the same commit; CHANGELOG and both session logs; the coordinator's review and the adversarial
      reviews, in Reviews below). **Open, and not ours to close:** item 6, the merge into `main` and the `sprint-02`
      tag, which wait for the founder.

## Deliverables

- `programs/brot-markets` on Pinocchio: the `checks` module (M), the accounts, the instructions above,
  `math/schedule.rs` and `math/opening.rs`, the error enum and the events (S–M). The join's `min_return_bps` estimate
  needs the first functions of `math/fees.rs` and `math/payout.rs` (the fee and the creator share on the pot as it
  stands); Sprint 04 completes both files.
- `user_open_campaign` for the price kind (M) and the Pyth-priced opening (M), on the reader of
  `readers/price_touch.rs`; the lamport vault and SOL entries (M); the params and the D6 names (S).
- `ReaderKind` with its five variants and the reader interface (`validate_at_creation`, `outcome_knowable`,
  `try_resolve`); only the price reader is real.
- The Shank IDL in `packages/sdk/src/idl` and a note on the Codama spike (S).
- A measured table of account sizes and rent (T19).

## Out of scope

The other four kinds' creation checks, `resolve_campaign` and the join lock once the outcome is knowable (Sprint 03).
The window, settlement, payout, fees, the creator share, `VoidReason` and closing (04). The SDK and the devnet deploy
(05). Referral (14). The sealed entry and `sponsor_add_prize` (15). Entries closing less than 24 hours before the
deadline with a second team signature: it waits for traffic (P1 §3.6). Any field TP §3.4.1 reserves for later
sprints stays at zero, as in v0.0.1.

## Founder decisions that block the sprint

- **Answered:** D-a (SOL only); D-b (US$500 in SOL, 90/10); D-c and D-d (the team opens; launch partners open free);
  D-f (Pyth SOL/USD on-chain for the charge); D-h, D-i (no cap, no list); D-j (no free text); D-k (minimum opening
  rules); D-l (opening, opening fee and the 1% in the core); D-o (Pinocchio); P-3 (team and partners pay nothing and
  keep no 1%); P-5 (minimum entry 0.01 SOL).
- **Q3, the working default of TP v0.0.1:** both sides allowed; the first-baker exemption covers the first wallet's
  whole entry; the minimum is now 0.01 SOL (P-5).
- **Q12, answered on 2026-10-05:** the keys stay with Lucas and Ronaldo ("tem eu e o Ronaldo"). **Open:** confirm the
  reading that both hold team keys. Who holds the devnet upgrade key on deploy day is Sprint 05's.
- **D6, taken as approved with the proposal** (`docs/SPRINTS.md`, section 5). **Open:** confirm it.
- **C44, the team-key prize reading, built as the working reading** (a team key that adds a prize pays like any
  wallet, at least `opening_fee_usd`, 90/10, creator share 0). **Open:** confirm it.
- **Raised by the closure review and the reviews (2026-10-08), open:** whether `min_entry_lamports` reaches open
  campaigns (today it does; the TP says both); whether PR #27, the plan v0.1.0 this branch carries, is reviewed and
  merged first; and four decisions before Sprint 03 (see Reviews): which Pyth feeds a price campaign may name; a
  separate budget for free team openings; charging the opening at `p − conf`; the SOL/USD feed id as a compiled
  constant. R4 (a cheaper opening in the first three months) is not built.

## Agents and skills

- **Agents:** `dev-product-agent`; `technical-security-red-team-agent` (the `checks` module, roles, initialization, the
  bookkept vault, the opening conversion and its rounding); `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review` (the `checks` module and the opening price), `codemap`,
  `verify-build-works`, `decision-log`, `secrets-scan`.

## Security gates

- Signatures and roles exist before any instruction that moves SOL (TP §7).
- Every account the program treats as its own passes the `checks` module; each check has a negative test.
- No exit instruction, no emergency withdrawal, and no key that can move a baker's entry (A-1).
- The program never reads a vault's balance as the pot; every balance is bookkept, with checked math.
- Team keys and the devnet admin key stay off the repository and off the server. `secrets-scan` at closure.

## Tests

`bun run test` (LiteSVM, one test per instruction and per error); `bun run test:rust` (pure math, the `checks`
negatives with Mollusk, the price reader on fixtures). Filters to add in this sprint:

```bash
bun test tests/ -t "open campaign refuses"                        # one case per row of TP §3.4.10
bun test tests/ -t "checks refuse"                                # one negative case per check, distinct included
bun test tests/ -t "opening charges 500 dollars at the pyth price" # lamports, 90/10, max_lamports, stale price
bun test tests/ -t "team opening pays nothing"                    # no transfer, creator_share_bps = 0
bun test tests/ -t "team opening with a prize"                    # the working reading: 90/10, zero share [AC]
bun test tests/ -t "retried opening fails on its id"
bun test tests/ -t "join refuses"                                 # state, close, pause, minimum, expected total, return
bun test tests/ -t "hand-sent lamports do not move the pot"
bun test tests/ -t "entries close at five percent of the duration"
```

## Carried over

From the security review that closed Sprint 00 (`docs/sprints/sprint-00-setup.md`; TP §7.1), re-read for Pinocchio
and SOL.

- **"Record the USDC mint in the config and check it against `USDC_MINT`" no longer applies.** Money is SOL (D-a):
  there is no mint, no token account and no freeze authority, and `USDC_MINT` leaves with the `mainnet` feature's mint
  switch (proposal §2.4.6). What remains of the risk, a mainnet build carrying devnet values, moves to the drill
  constants: CI checks that the `mainnet` build carries the real window and minimum duration (T12). The SOL/USD feed
  and its bounds live in `GlobalConfig`, set by the admin, not in a compiled constant.
- **`init-if-needed` stays off, in a new form.** The Anchor flag disappears with Anchor. The rule becomes: never
  re-initialise an account that already carries a tag (proposal §2.1). Tests: a second initialization is refused; an
  address funded in advance is still created.
- **The `deny` lints stay** (`arithmetic_side_effects`, `cast_possible_truncation`, `cast_sign_loss`). The exception
  for Anchor-generated code falls away with Anchor. If a Shank derive trips one, the allowance goes on that item only,
  with a written reason, never on the crate [INF].

## Risks

- A new program with no outside review (critical). With Pinocchio, a forgotten check is a vulnerability (BP risks).
  Reduces: the `checks` module, a negative test per check, short files, one error per failure point.
- Pinocchio 0.11 may not build with the pinned toolchain, and Codama is untried on a Pinocchio IDL here (proposal
  §5.4). Reduces: the day-one build; the spike, with hand-written codecs as the fallback.
- Devnet SOL/USD updates every 62–64 s [F], so paid openings fail whenever the account is older than
  `max_price_age`. Reduces: `max_price_age` of at least 90 s on devnet (proposal §2.4.5).
- The opening price moves between preview and signature. Reduces: rounding toward Brot and the signed `max_lamports`.
- The `Campaign` account grows with the new fields, and its rent with it (about 0.0035 SOL for both accounts [INF]).
  T19 measures it.
- Unchecked clock drift (`Clock::unix_timestamp`, C12) shifts `entries_close_at`.
- The same account passed in two slots can corrupt the bookkeeping silently, since lamport moves between program
  accounts are plain balance edits; Pinocchio does not refuse it by itself [AC]. Reduces: `checks::distinct`.
- A team key that adds a prize follows a reading the sources do not write down [AC]; if the founder reads it
  otherwise, only the team path of `user_open_campaign` changes.

## Expected artifacts

`programs/brot-markets/src/` (`checks.rs`, `vault.rs`, `events.rs`, `error.rs`, `constants.rs`, `state/`,
`math/schedule.rs`, `math/opening.rs`, `math/fees.rs`, `math/payout.rs`, `instructions/admin/`,
`instructions/campaigns/open_campaign.rs`, `instructions/entries/`), the tests in `tests/` and
`programs/brot-markets/tests/`, the Shank IDL in `packages/sdk/src/idl`, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** the pot core on Pinocchio, with the paid opening and SOL entries.
- **Session log:** the T-items recorded at the opening; the day-one build; the spike's result; the event mechanism
  (T4); the measured sizes and rent; the Q12 confirmation.

## Record and retrospective

### How it ran (2026-10-08)

- **Wave 0, serial:** the branch from `docs/architecture-seeker-ai` (PR #27 still open); T15 (`7d770ce`); the
  day-one build; T4, which had to be settled here because it adds two accounts to every instruction; the D6 copy
  (`c82be03`); the frozen contract (`10fb4aa`): module tree with stubs, layouts, errors, constants, events, the
  instruction interface and the TypeScript test kit (`tests/brot/`), checked without the binary.
- **Wave 1, in parallel:** six lanes, one agent and one git worktree each, with one pre-built host target directory
  per lane so that no lane compiled the Agave tree from scratch; no SBF build in any lane (the founder's rule). The
  Workflow tool was not used: it caps concurrent agents at CPUs − 2, two on this machine.
- **Wave 2, serial:** the merges in the order A, C, B, D, E, F; one conflict (lanes C and D both created
  `tests/common/mod.rs`; D's moved to `tests/opening_support/`); then `bun run build:program`, every suite, the
  measurements and the X0.9 run. Every LiteSVM test the lanes wrote without the binary passed on the first
  integrated run.
- **Wave 3:** see "Reviews" below.

| Lane | Subagent | Files | Tests added | Result | Notes |
|---|---|---|---|---|---|
| A, `checks` | general-purpose | `checks.rs`, `scripts/checks-mutation.mjs` | 18 host, 23 Mollusk, 21 LiteSVM | All pass; X0.9 shown for all 15 refusals | `derive_address` of solana-address 2.8.0 (2.9.0's `try_` variant is not pinned) |
| B, admin and state | general-purpose | `CreationParams::validate`, `instructions/admin/*` | 16 host, 28 LiteSVM | All pass | An empty team is valid; the fee recipient may be any non-zero key |
| C, math | general-purpose | `math/*` (with `rounding.rs`) | 37 host, randomized | All pass | Exponents −18 to 0 [AC]; clippy's `arithmetic_side_effects` does not lint `#[test]` bodies |
| D, opening | general-purpose | `open_campaign.rs` and its three helpers, `readers/` | 24 host, 39 LiteSVM | All pass | No SOL/USD-specific codes for the reader's own refusals |
| E, entries | general-purpose | `join_campaign.rs`, `entry_account.rs`, `vault.rs` | 2 host, 16 LiteSVM, 3 for its TypeScript copy of the math | All pass | Found the contract's owner-before-id fix (`ec96505`) |
| F, tooling | general-purpose | `events/self_cpi.rs`, the IDL, the Codama client, build, CI, `CLAUDE.md` | 3 host, 14 TS (events, IDL drift, Codama) | All pass | `thiserror` 2.0.21 so that the IDL carries the errors |

| Wave 3 fixes | the orchestrator | `readers/price_touch.rs`, `constants.rs`, `state/mod.rs`, `join_campaign.rs`, `checks.rs` (header) | 1 host, 4 LiteSVM; 2 host tests changed | All pass; 21 call-site mutants all fail their tests | See Reviews |

**Totals** (after the review fixes): `bun run test:rust` 157 pass (brot-markets 146, pred-provable 11); `bun run test`
298 pass, 130 of them for the new program (TypeScript; all but the kit, IDL and math-copy tests run the binary in
LiteSVM); all nine filters of this file match passing tests (26, 21, 4, 5, 2, 3, 11, 1 and 1). At integration, before
the reviews, the counts were 156, 293 and 126.

### Day one (C14, C16)

`pinocchio` 0.11.2 and `pinocchio-system` 0.6.1 built with `cargo build-sbf` (Solana CLI 3.1.10, platform-tools
v1.52, rustc 1.89.0): a 4,720-byte minimal program. The crate links `std`, because the `shank` attributes crate does;
the entrypoint uses Pinocchio's std panic hook (about 200 bytes more). A self-CPI event round-tripped in npm
`litesvm` 1.5.0, whose `innerInstructions()` shows it at stack height 2; the program account must be passed in the
outer instruction (`MissingAccount` without it). The CI half of the gate is the pull request's run.

### Sizes and rent (T19)

| Account | Bytes | Rent on devnet and mainnet (lamports) | Rent in LiteSVM 1.5.0 / Mollusk |
|---|---|---|---|
| `GlobalConfig` | 400 | 2,682,240 | 3,674,880 |
| Fee vault | 0 | 650,240 | 890,880 |
| `Campaign` | 512 | 3,251,200 | 4,454,400 |
| Campaign vault | 0 | 650,240 | 890,880 |
| `Entry` | 100 | 1,158,240 | 1,586,880 |

Devnet and mainnet were read with `getMinimumBalanceForRentExemption` on 2026-10-08 at 20:05 UTC; their Rent sysvar
holds 5,080 lamports per byte with threshold 1.0, which is exactly what Pinocchio 0.11's `Rent` reads, so the
program's own rent matches the cluster's [F]. LiteSVM and Mollusk use 6,960 per byte; the tests read the rent from the
test cluster. An opening costs its creator 3,901,440 lamports of rent on devnet (about 0.0039 SOL; the TP estimated
0.0035), returned at close (Sprint 04).

| Instruction (LiteSVM, after the review fixes) | Compute units |
|---|---|
| `admin_initialize_config` | 13,609 |
| `admin_set_team`, `admin_set_creation_params`, `admin_set_fee_recipient` | 1,724; 1,712; 1,645 |
| `admin_transfer_admin`, `admin_accept_admin` | 1,641; 1,642 |
| `team_pause_entries`, `admin_resume_entries` | 1,581; 1,573 |
| `user_open_campaign`, paid (US$500, BTC/USD campaign) | 20,084 to 23,043 |
| `user_open_campaign`, free (team key) | 13,043 to 16,019 |
| `user_join_campaign`, first (creates the `Entry`) and second | 6,959 to 9,959; 4,285 |
| One event (`emit`) | 70 for the event frame, plus 946 the runtime charges the caller per CPI |

The ranges are not noise: finding a canonical PDA costs about 1,500 CU for each bump it tries, and the bump depends on
the campaign id and the baker's key, which differ between runs (three runs of the first join gave 6,959, 9,959 and
6,959). The review fixes added a few units (the vault owner at join: 4,276 to 4,285 for a second join).

The binary is 67,984 bytes after the review fixes (67,384 at integration), SHA-256
`d91462228e27830d13094de15e239436a5857f22be72b7b18a976a1d60dfc4f5`; at integration it was
`7c32220e837302da6921f04ce767ea62fa7bfe1e8e4ecd6bb7b6e7bd2d3bec62`, and a local rebuild gave the same. CI publishes
the program artifact only on a push to `main`, so the comparison with CI's `programs-<sha>` waits for the merge.

### X0.9: removing each check makes its test fail

`node scripts/checks-mutation.mjs` inserts `if true { return Ok(()); }` (for `canonical_pda`, the found bump) after
each `// X0.9 <id>` marker of `checks.rs`, rebuilds with `cargo build-sbf`, runs that check's Mollusk test and its
LiteSVM case, and restores the file. Run on 2026-10-08: exit 0, every mutant proven.

| Check | Without it, the negative test gets | Tests (Mollusk; LiteSVM) |
|---|---|---|
| `owned_by` | `ExternalAccountDataModified` from the runtime | `owned_by_refuses_the_config_under_another_owner`; `owned_by: the config under another owner` |
| `signer` | success: an unsigned admin changes the team | `signer_refuses_an_unsigned_admin`; `signer: an unsigned admin` |
| `writable` | `ReadonlyDataModified` from the runtime | `writable_refuses_a_read_only_config`; `writable: a read-only config` |
| `len` | `WrongTag` (the data-less fee vault as the config); a short or long config is still refused by the view's own length check | `len_refuses_the_data_less_fee_vault_as_the_config` |
| `tag` | success for another type's tag and another version; `PdaMismatch` for a zeroed config | `tag_refuses_*`; `tag: …` |
| `tag` (version) | success | `tag_version_refuses_another_layout_version` |
| `pda` | success: a look-alike config is written; a look-alike campaign is joined | `pda_refuses_a_look_alike_config`; `pda: a look-alike campaign at join` |
| `canonical_pda` | `PrivilegeEscalation` from the runtime | `canonical_pda_refuses_a_non_canonical_config_or_fee_vault` |
| `system_program` | `MissingAccount` from the runtime | `system_program_refuses_a_look_alike` |
| `upgrade_authority` | success: any key initializes, with another program's ProgramData, or an immutable one | `upgrade_authority_refuses_*` (3) |
| `upgrade_authority` (key) | success for another signer | `upgrade_authority_refuses_any_other_signer` |
| `create_pda_account` | `WrongLength` on the uncreated account | `create_refuses_*` (2); `create_tops_up_*` |
| `distinct` | `PdaMismatch` on the second slot (C42: the runtime and Pinocchio accept one account in two slots; the PDA check is the next line) | `distinct_refuses_the_config_as_the_fee_vault` |
| `event_accounts` (authority) | `InvalidArgument` from the self-CPI | `event_accounts_refuse_a_wrong_event_authority` |
| `event_accounts` (program) | `MissingAccount` from the self-CPI | `event_program_refuses_a_wrong_program_slot` |

Where the runtime refuses anyway (owner, writable, the System Program, the event slots), the check gives the refusal
its own code and catches it before any effect; where nothing else would (signer, tag, PDA, upgrade authority), the
check is the only guard. The lanes also showed X0.9 for the opening's own rules (11 host mutations, lane D). After the
review fixes the script ran again (2026-10-08, exit 0) and gave the same table.

**The call sites, one-off (2026-10-08).** The reviews pointed out that the script proves the 15 function bodies, not
each call to them. A one-off run removed one call or rule at a time from the instructions, rebuilt with `cargo
build-sbf` (or ran the host test), ran the named test and restored the file; every one of the 21 mutants made its
test fail. The script was kept outside the repository; each row below says exactly what was removed.

| Removed | Without it | Test |
|---|---|---|
| `checks::signer(authority)` in `admin_initialize_config` | success: with both accounts funded in advance, anyone names the upgrade authority unsigned and picks the admin | `signer: an unsigned upgrade authority, with the config and fee vault funded in advance`; also `initialize refuses a bad slot…` (`PrivilegeEscalation` instead) |
| `checks::signer(creator)` in `user_open_campaign` | success: an unsigned team key opens free when both rents were paid in advance | `an unsigned team key is refused, even with the campaign and vault funded in advance`; also `a creator that does not sign, or signs read-only` |
| `checks::signer(baker)` in `user_join_campaign` | `PrivilegeEscalation` from the System Program instead | `a slot that fails its check…`; `A cannot change, close or redirect B's Entry` |
| `checks::signer` in `admin_set_team`, `admin_set_creation_params`, `admin_set_fee_recipient`, `admin_transfer_admin`, `team_pause_entries` | success: an unsigned key acts (the only guard) | `every config instruction refuses a bad slot or bad data with that slot's own error` |
| `checks::signer` in `admin_accept_admin`, `admin_resume_entries` | another error first in that test's state | the same test |
| `require_admin` in the five admin instructions that call it | success: a stranger or a team key acts as admin | `every admin instruction refuses a signer that is not the admin, a team key included` |
| the team check in `team_pause_entries` | success: a stranger pauses | `the pause refuses a key that is not on the team, the admin's included` |
| the pending-admin check in `admin_accept_admin` | success: another key takes the admin role | `the admin changes in two steps, and only the named key can accept` |
| the stored keys of a later `Entry` | success on a forged `Entry` at the right address | `an Entry of another campaign or another baker (PdaMismatch), or one naming them (EntryMismatch)` |
| `checks::owned_by(vault)` in `user_join_campaign` | success: the entry goes into a vault the program does not own | `a vault at its own address that the program does not own: WrongOwner, and nothing moves` |
| the tag guard in `state::init` | the second `init` rewrites the tag | host `init_writes_the_tag_once_and_refuses_an_account_that_carries_one` |
| the clock-lead bound in `check_fresh_and_tight` | a price stamped 61 s, or any time, ahead is fresh | host `a_publish_time_up_to_a_minute_ahead_of_the_clock_is_fresh`, `extreme_times_give_an_answer_never_a_panic` |

### Deviations from the plan, and why

- **Mollusk 0.14.0, not 0.16.0** (TP §1, §9): 0.15 and later need Agave 4.3, which declares Rust 1.97.1 against the
  pinned 1.89. `.cargo/config.toml` keeps `cargo update` on versions Rust 1.89 builds. The same will hit the
  `litesvm` crate 0.17 that the TP picks for Sprint 03.
- **T4 was settled in Wave 0**, not in lane F, because self-CPI adds the event authority and the program to every
  instruction's accounts, which the contract had to freeze.
- **`Campaign::load_mut` now checks the owner before reading the stored id** (`ec96505`): the contract read it first.
- **The codemap skips `generated/`** directories, as it skips `dist/` and `build/`: the Codama client is rewritten
  by `bun run idl`.
- **`scripts/checks-mutation.mjs` reads bun's JUnit report** (`a9e0820`): bun names passing tests only on a terminal.
- **The branch was cut from `docs/architecture-seeker-ai`, not `main`** (`SPRINTS.md` §1, `docs/sprint-system.md`),
  as the task asked while PR #27 was open: PR #30 carries #27's commits, and `main` was merged in once (`21470da`).
- **Three drill values, not two:** the 5-minute entry close joins the 15-minute minimum duration and the 10-minute
  review window; without it the 24-hour floor would close a 15-minute campaign before it opens.
- **One `target` (i128)** in the campaign, where TP §3.4.1 lists `target` and `threshold`: every Sprint 02 kind needs
  one bound.
- **A team opening passes `opening_usd = 0`,** where TP §3.4.3 has the argument absent: the argument layout is fixed.
- **`min_entry_lamports` is read live at every join** (lanes B and E), against TP §3.4.1's "keeps the values it
  copied": a founder question (above).
- **The join creates the `Entry` before its last rule, the return estimate** (lane E); named in `checks.rs`.
- **The program depends on `thiserror` 2.0.21 and links `std`** (lane F, day one): shank-cli reads errors only from
  an enum that derives `thiserror::Error` (`shank_macro_impl-0.4.9/src/error/this_error.rs`), and the `shank` crate
  is not `no_std`.
- **From the reviews:** a price published more than 60 s ahead of the clock is refused as stale
  (`MAX_PRICE_CLOCK_LEAD_SECONDS` [AC]; lane D had accepted any lead); the join checks the vault's owner (lane E had
  only its address); `state::init` refuses an account that carries a tag.

### Carried to Sprints 03 to 05

Written into each sprint's file ("Carried over" and the definition of done), so that they are not lost here.

- 03: `outcome_knowable` and `try_resolve` (today `ReaderNotReady`), the join lock, the four other kinds, row 3 at
  both ends (C45; today a `Below` target of 1 opens), the epoch kinds and the duration rule (C46), `StaleFeed` (C47);
  the `litesvm` crate version; codes of its own for the SOL/USD read; the future-publish rule and the slot bound at
  the join lock and the proof; the exponent equality; the terms the creator saw; and, if the founder says yes, the
  feed list, `p − conf`, the SOL/USD feed as a constant and the team budget.
- 04: the in-program assertions of TP §3.4.13, open and join included; `owned_by` and `distinct` in every
  instruction that pays, with a generated slot matrix; `sweep_fees` refusing the fee vault; hand-sent lamports on
  `Campaign` and `Entry`; the reuse of an `id` after close; the valve's repair; layout versions; stored bumps; the
  first-baker wording.
- 05: the Codama decision (it reads Shank's IDL and round-trips; it has no events and no PDA seeds); the devnet
  deploy with the real program keypair (a `cargo build-sbf` run writes a throwaway keypair into `target/deploy` when
  none is there), the upgradeable loader and `admin_set_team` in the same session; the whole debit in the preview;
  one run on a real validator; a week of devnet price and clock data; a runbook line for a Pyth migration.

### Retrospective

- **Went well:** freezing the contract, with the TypeScript kit, before the lanes started: every test the lanes wrote
  without the binary passed on the first integrated run, and the merges had one trivial conflict. The X0.9 script
  turns "a test per check" into evidence. Reading the Rent sysvar on devnet closed a risk lane A raised.
- **Went badly:** the agent worktrees were created from `main`, not from the sprint branch; every lane had to
  fast-forward first, and one could not (the permission check refused it) and worked on a new branch. The MSRV
  conflict cost two resolution attempts before Mollusk 0.14. The lane worktrees under `.claude/worktrees/` make
  `os-self-test` and one OS test fail until they are removed.
- **Next time:** start lane worktrees from the sprint branch; check a dependency's declared `rust-version` (and its
  dependencies') before writing it into the plan.
- **From the reviews:** the X0.9 script proved what it was asked (each function of `checks.rs`), and two reviewers
  still found the gap next to it: a check called in the wrong place, or not called, is not covered by mutating the
  function. Mutating call sites is cheap here (a rebuild takes seconds), so it belongs in the proof from the start.
  The pre-funded paths deserve their own negatives in every sprint that creates accounts: there the signature is
  the only guard, and the runtime does not catch its absence.

### Reviews (Wave 3)

Four reviews ran in parallel on `f1a9bc0` (the coordinator on `f5982e7`), read-only.

| Reviewer | Lens | Confidence | In one line |
|---|---|---|---|
| `technical-security-red-team-agent` | the checks, roles, initialization, the bookkept vault, the opening rounding | 7 (8 implementation, 6 design) | No exploitable bug in scope; one design gap (any feed), one availability risk (the valve) |
| `multi-ai-review` 1: devil's advocate (Sonnet) | the `checks` module and the opening price | 7 (arithmetic 9, code 8, evidence of completeness 6, oracle policy 5) | No way to take SOL with this binary; the findings are about the assumptions around it |
| `multi-ai-review` 2: independent model (Fable) | correctness and exploitability | 8 | Arithmetic, check order and every slot right; the price window is a lever, not a hole |
| `coordinator-agent` | the closure | — | Ready for the PR after five text fixes; no gate breached |

**Reconciliation** (`multi-ai-review`). Net confidence, the minimum: 7. Every reviewer is at 7 or above and none found
an exploitable bug, so the decision is **proceed**, with the fixes below. Agreed by more than one reviewer: the price
kind accepts any Pyth feed; the vault was checked by address only at join; a publish time ahead of the clock had no
bound; the opening price protects the creator but not Brot (the mid price, a SOL/USD feed id checked only non-zero);
a leaked team key can fill the valve; X0.9 proved function bodies, not call sites, and two signer checks are the only
guard on the pre-funded paths. **For the founder:** how serious the feed question is, and whether D-i (no
accepted-account list) also covers feed ids. The security reviewer reads a feed list as reopening D-i; the devil's
advocate reads D-i as being about metric accounts only.

Each finding and what happened to it. S, D and I are the security, devil's advocate and independent reports, with
their own numbers. F: fixed in this PR. C: carried, written into that sprint's file. Q: a founder question.

| # | Finding | Severity | What happened |
|---|---|---|---|
| 1 | Any Pyth feed can back a price campaign; "price of a large asset" (TP §3.4.8) and "out of any creator's reach" (§3.4.10) are not enforced (S1, D1) | High, design | Q; C 03: check first whether any payer can create an unsponsored feed's shard-0 account |
| 2 | One leaked team key, or about US$50k, fills `max_open_campaigns` for up to 90 days (S2, D5) | Medium | Q (a budget for free openings, or voiding an empty `Open` campaign); C 04; TP §7 to align |
| 3 | Two signer checks are the only guard on the pre-funded paths, untested there; X0.9 covered bodies, not call sites (S3, D6) | Low; process | F: two LiteSVM negatives and 21 call-site mutants (X0.9 above); C 04: a generated slot matrix |
| 4 | A publish time ahead of the clock was fresh without bound (S4, D3) | Low to medium | F: refused beyond 60 s [AC], tests at +60 s and +61 s; C 03: the same rule at the join lock and the proof, with the slot bound |
| 5 | The SOL/USD feed id is checked only non-zero (S5, D4, I6) | Low | Q (a compiled constant) |
| 6 | No money invariant checked inside open and join (S6) | Low | C 04: the vault's change equals the bookkept change |
| 7 | The creator cannot lock the terms the preview showed (S7, D11) | Low | C 03: decide while the argument layout is unreleased |
| 8 | The event authority is a constant of the declared id (S8) | Info | C 05: the deploy refuses another keypair |
| 9 | The upgrade key can replace the program, so "nobody moves an entry" holds for instructions only (S9) | Info | TP §3.4.9 to align; the powers page (BR-41) says it |
| 10 | The join checked the vault by its PDA only (S10, D15, I3) | Info | F: `owned_by(vault)` and a LiteSVM test |
| 11 | No positive test of a paid campaign on SOL/USD itself (S11) | Info | F: test added |
| 12 | The join lock and row 3; the exponent; an `id` reused after close; hand-sent lamports on `Campaign` and `Entry`; the config's write lock (S12) | Info | C 03 and 04; the lock contention is measured in Sprint 06 |
| 13 | Row 3 refuses only targets already met; impossible and one-tick targets open (D2, I2) | Medium | C 03, both ends |
| 14 | The opening charges the mid price; a creator can pick the highest recent update (I1, D4) | Low | Q (charge at `p − conf`) |
| 15 | `state::init` wrote the tag of whatever it was given (D7) | Low | F: refuses a tag or a version, host test |
| 16 | Stored bumps are sound by an untyped invariant only (D8) | Low | C 04 |
| 17 | The join creates the `Entry` before its last rule (D9) | Info | F: named as the one exception in `checks.rs` |
| 18 | `upgrade_authority` assumes the upgradeable loader v3 (D10, I4) | Low | C 05: the deploy uses it, and initializes right after |
| 19 | Layout versions are exact-match, with no migration rule (D12) | Low to medium | C 04 |
| 20 | The valve counter has no repair path (D13) | Low | C 04: I7 in the randomized test, a runbook line |
| 21 | The evidence comes from runtimes other than the cluster's (D14) | Info | C 05: one run on a real validator |
| 22 | The confidence and age bounds have no measured distribution (D16) | Low | C 05: a week of devnet data |
| 23 | The Pyth ids and shard are compiled (D17) | Info | C 05: a runbook line |
| 24 | Spec drift: TP:372 and TP:1033 (D18) | Info | TP to align |
| 25 | `max_lamports` leaves out the two rents (I7) | Info | C 05: the preview shows the whole debit |
| 26 | The first-baker exemption covers a wallet's later joins (I5) | Info | C 04; TP §3.4.16 to align |
| 27 | The SOL/USD read surfaces the reader's codes (I8) | Info | C 03 |

**The coordinator's closure review** (16 items, all text). Done: the minimum-entry claim reworded and put to the
founder (1); the carried items written into Sprints 03 to 05 (2); the CHANGELOG contradictions (3); these sections
and the session log's (4); the codemap regenerated, X0.9 rerun, no error message changed (5); the X0.9 box ticked
with its scope (6); the deviations (7); the status lines of `SPRINTS.md` and `CLAUDE.md` (9); the definition of
done's wording (10); the unused error ranges, noted in the integration log (11); the numbers (12); the sources (13);
the lane worktrees and branches removed before the standard checks (15). Kept: the wording that assumes the PR is
open, since it is (14). Listed instead of edited: the stale TP lines, below, because the TP travels in PR #27 (8).
The privacy gate (16): `c82be03` changed the form's label ("when campaigns open on devnet"), not the consent sentence
under it, so `CONSENT_VERSION` stays `v1-2026-10-05`.

**Skills at closure:** `multi-ai-review` (above, and in the integration session log); `secrets-scan`: no `.env`
tracked, the three `.env.example` files hold placeholders only, and `node scripts/ci-secret-scan.js origin/main` is
clean over the branch.

**TP to align after PR #27 merges.** The TP travels in #27, which the founder has not reviewed, so it is not edited
here.

| TP | Says | Should say |
|---|---|---|
| :110 | `pinocchio-system` at the matching version [AC] | 0.6.1 |
| :114, :155 | events by self-CPI, or `sol_log_data` first | self-CPI (T4) |
| :115 | Shank pinned after the spike [AC] | 0.4.9 |
| :119, :1811, :2403 | `litesvm` crate 0.17.0, `mollusk-svm` 0.16.0 | Mollusk 0.14.0; `litesvm` 0.17 needs Agave 4.3 (Rust 1.97.1) |
| :242-243 | no instruction yet | ten instructions |
| :372 | `max_price_age` at least 90 on devnet | a floor in the code, or "set to 120 at initialization" |
| :377-379, :509 | open campaigns keep their values; the join reads the minimum | the founder's answer on the minimum entry |
| :412-414 | two drill values | three |
| :503-513 | the account lists | plus the event authority and the program |
| :733 | rent about 0.0035 SOL [INF] | 3,901,440 lamports on devnet [F] |
| :1033 | `checks::program_id` | `checks::system_program` |
| :1043 | `distinct` [AC] | C42 answered: the PDA check is the next line |
| §3.4.9 | move a baker's entry: nobody | by instruction; the upgrade key can replace the program |
| §3.4.16 | the one-sided table | the exemption covers the first wallet's later joins |
| §7 | `max_open_campaigns` bounds the burst | and a leaked team key can hold it, until the founder decides |
| :1685, :1718 | `trustedDependencies`; the npmmirror lockfile | both done (T15) |
| :1857-1862 | §10 "Today" | CI installs shank-cli 0.4.9 and runs the `mainnet` test |
| :2052 | the D6 landing copy pending | done (`c82be03`) |
| §14.4 | open items | C14, C15, C16, C17, C30, C42 and C43 closed; C44 built, awaiting the founder |
