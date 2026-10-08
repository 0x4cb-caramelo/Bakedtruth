# Sprint 02 — Pot core on Pinocchio: config, paid opening, vault, entries

**Status:** in review (pull request open, not merged) · **Branch:** `sprint-02-pot-core` · **Dates:** none, by the founder's decision

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
- [ ] **Day one:** Pinocchio 0.11.2, with its matching `pinocchio-system` [AC], builds in CI with `cargo build-sbf`
      under Rust 1.89 and Solana CLI 3.1.10. The result is recorded. If it does not build, the sprint stops there and
      the finding is reported before anything else [INF].
      Evidence: locally on day one, `pinocchio` 0.11.2 with `pinocchio-system` 0.6.1 (the matching pair: 0.6.1 asks
      for `pinocchio` 0.11) built with `cargo build-sbf` (Solana CLI 3.1.10, platform-tools v1.52, rustc 1.89.0). In
      CI: the pull request's run (Record).
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
- [ ] **Every check has a negative test** (T24), and disabling the check makes that test fail, shown once per check
      and recorded in this file (X0.9).
      Evidence: 18 host tests (`tests/checks_host*.rs`), 23 Mollusk tests (`tests/checks_mollusk*.rs`, on the real
      binary), 20 LiteSVM tests (`bun test tests/ -t "checks refuse"`); the X0.9 table in Record.
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
      to future campaigns only"`; the ceilings and the devnet values are in the opening session log (C43).
- [x] **`user_open_campaign` refuses every row of TP §3.4.10 with its own error** (X0.7, program half): rows 1 to 10
      for the price kind; the other four kinds are refused until Sprint 03. For row 3, the price target must not be
      touched yet; the minimum distance per kind is set in Sprint 03 [AC]. The SOL/USD account is derived from
      `GlobalConfig.sol_usd_feed_id`, never trusted as passed. A price campaign copies `campaign_max_age` (never below
      30 s) from the config: the creator does not choose it (TP §3.4.8 [INF]). Test filter: `open campaign refuses`.
      Evidence: `bun test tests/ -t "open campaign refuses"`: 26 pass.
- [x] **The paid opening** (TP §3.4.16): `opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)` in `u128` with
      checked math; `prize_lamports = floor(paid × 9,000 ÷ 10,000)`; `opening_fee_lamports = paid − prize`; all of it
      moves from the creator into the vault (I14, X0.8 first half). It is refused above `max_lamports` (T25), and
      when the SOL/USD account is older than `max_price_age` or wider than `max_price_conf_bps`. `opening_usd` above
      500 makes a larger prize at the same 90/10. Tested on the captured SOL/USD fixture.
      Evidence: `bun test tests/ -t "opening charges 500 dollars at the pyth price"`: 3 pass. At the captured price
      (US$119.21844516) US$500 is 4,193,981,891 lamports: prize 3,774,583,701, opening fee 419,398,190; the creator
      pays exactly that plus both rents. `tests/math_opening*.rs`: TP worked example A to the lamport.
- [x] **A team-key opening** without `opening_usd` moves no lamports besides rent, takes no `partner` argument and
      stores `creator_share_bps = 0` (P-3, I12); it still opens when SOL/USD is stale.
      Evidence: `bun test tests/ -t "team opening pays nothing"`: 4 pass.
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
      Evidence: `bun test tests/ -t "join refuses"`: 10 pass; `bun test tests/ -t "join adds an entry"`.
- [x] **`math/schedule.rs`** computes `entries_close_at = deadline_at − clamp(5% × duration, 24 h, 7 days)` and
      refuses durations outside 3 to 90 days (D-k). The six rows of the P1 §3.6 table (3, 7, 14, 30, 60, 90 days)
      are test cases. The review window and the minimum duration have drill values behind a `drill` cargo feature;
      the `mainnet` feature refuses `drill`, and a CI step checks that the `mainnet` build carries the real values
      (T12, TP §3.4.1).
      Evidence: `tests/math_schedule.rs` (`entries_close_at_five_percent_of_the_duration`); `bun test tests/ -t
      "entries close at five percent of the duration"`; `cargo check --features no-entrypoint,mainnet,drill` fails
      with the `compile_error!`; CI step "Mainnet build carries the real values" runs
      `mainnet_build_carries_the_real_values`.
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
- [ ] The committed IDL (and the generated client, if any) match CI's build (X0.6).
      Evidence: locally, `bun run build:program` regenerates both with no diff; CI's stale-IDL check on the pull
      request (Record).
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

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
- **D6, taken as approved with the proposal** (`docs/SPRINTS.md`, section 5).

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

**Totals:** `bun run test:rust` 156 pass (brot-markets 145, pred-provable 11); `bun run test` 293 pass (126 of them
for the new program); all nine filters of this file match passing tests (26, 20, 3, 4, 2, 3, 10, 1 and 1).

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

| Instruction (LiteSVM) | Compute units |
|---|---|
| `admin_initialize_config` | 13,603 |
| `admin_set_team`, `admin_set_creation_params`, `admin_set_fee_recipient` | 1,724; 1,712; 1,645 |
| `admin_transfer_admin`, `admin_accept_admin` | 1,641; 1,642 |
| `team_pause_entries`, `admin_resume_entries` | 1,581; 1,573 |
| `user_open_campaign`, paid (US$500, BTC/USD campaign) | 23,043 |
| `user_open_campaign`, free (team key) | 16,019 |
| `user_join_campaign`, first (creates the `Entry`) and second | 6,943; 4,276 |
| One event (`emit`) | 70 for the event frame, plus 946 the runtime charges the caller per CPI |

The binary is 67,384 bytes. A local rebuild gives the same SHA-256 (`7c32220e…`).

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
check is the only guard. The lanes also showed X0.9 for the opening's own rules (11 host mutations, lane D).

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

### Carried to Sprints 03 to 05

- 03: `outcome_knowable` and `try_resolve` (today `ReaderNotReady`), the join lock, the four other kinds, the minimum
  distance per kind (row 3, C45), the epoch kinds and the duration rule (C46), `StaleFeed` (C47); the `litesvm` crate
  version (above); whether the SOL/USD read gets codes of its own for owner and layout refusals.
- 04: the in-program assertions of TP §3.4.13 (`math/invariant.rs`), the close check, `sweep_fees` refusing a
  `fee_recipient` equal to the fee vault (`admin_set_fee_recipient` accepts any non-zero key).
- 05: the Codama decision (it reads Shank's IDL and round-trips; it has no events and no PDA seeds); the devnet
  deploy with the real program keypair (a `cargo build-sbf` run writes a throwaway keypair into `target/deploy` when
  none is there).

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

### Reviews (Wave 3)

Filled in after the reviews.
