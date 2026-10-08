# Sprint 02 — Pot core on Pinocchio: config, paid opening, vault, entries

**Status:** planned · **Branch:** `sprint-02-pot-core` · **Dates:** none, by the founder's decision

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

- [ ] **Entry, recorded in `session-log/` at the opening:** the team's choices on T4, T9, T10–T12, T17–T19 and
      T23–T25 (proposal §4, Phase 0 entry); the D6 rename done before the first identifier, the copy first, then code
      and docs in one PR (proposal §5.2).
- [ ] **T15, first, before the Codama spike adds npm packages:** `bun.lock` resolves from `registry.npmjs.org`
      instead of `registry.npmmirror.com`, `bun install --frozen-lockfile` passes, and the two existing
      `trustedDependencies` entries (`sharp`, `unrs-resolver`) are reviewed and recorded (TP §14.4 C30).
- [ ] **Day one:** Pinocchio 0.11.2, with its matching `pinocchio-system` [AC], builds in CI with `cargo build-sbf`
      under Rust 1.89 and Solana CLI 3.1.10. The result is recorded. If it does not build, the sprint stops there and
      the finding is reported before anything else [INF].
- [ ] `programs/brot-markets` depends on neither `anchor-lang` nor `anchor-spl` and leaves `Anchor.toml`.
      `bun run build:program` builds it with `cargo build-sbf`, writes the Shank IDL and syncs it into
      `packages/sdk`; `anchor build` builds only `pred-provable`, until Sprint 03. `CLAUDE.md`'s build line says so
      (TP §14.1).
- [ ] **The `checks` module** (TP §3.4.17) holds the checks of this sprint: owner, signer, writable, tag, PDA
      (re-derived with the stored bump), exact length, the System Program id, the upgrade authority at initialization,
      create, and `distinct`, which the TP adds as [NEW]: the same account is refused in two slots that must differ.
      Create tolerates an address funded in advance (top up, allocate, assign) and never re-initialises an account
      that carries a tag. The close check comes with the first instruction that closes an account (Sprint 04).
- [ ] **Every check has a negative test** (T24), and disabling the check makes that test fail, shown once per check
      and recorded in this file (X0.9).
- [ ] **Accounts** of TP §3.4.1: `GlobalConfig` (`["config"]`); the fee vault (`["fee_vault"]`, data-less,
      program-owned, created at initialization); `Campaign` (`["campaign", id]`); the campaign vault
      (`["vault", campaign]`, a data-less program-owned PDA created with its rent-exempt minimum, 650,240 lamports
      [F]); and `Entry` (`["entry", campaign, baker]`, created on the baker's first join). Each account with data
      carries a type tag and an exact size; the real sizes and rent are measured and recorded (T19). No `CapState`,
      `AcceptedAccount`, `SponsorRequest` or `max_pot` exists.
- [ ] **Instructions,** one per file, under 200 lines, each with a `Purpose:` header (TP §3.4.3):
      `admin_initialize_config`, `admin_set_team`, `admin_set_creation_params`, `admin_set_fee_recipient`,
      `admin_transfer_admin`, `admin_accept_admin`, `team_pause_entries`, `admin_resume_entries`, `user_open_campaign`
      for the price kind, and `user_join_campaign`.
- [ ] Only the program's upgrade authority, checked against its ProgramData account, can run the initialization.
- [ ] `admin_set_creation_params` changes the opening fee in US$, the prize share, the fee, the one-sided fee, the
      creator share, `max_open_campaigns`, `min_entry_lamports`, the SOL/USD feed and bounds, and
      `campaign_max_age`; each value stays under its code ceiling and applies to future campaigns only (test: an open
      campaign keeps its values). `MAX_FEE_BPS` (1,000) and `MAX_CREATOR_SHARE_BPS` (100) come from the sources; the
      ceilings of the other parameters and the devnet value of `max_open_campaigns` are written here and recorded
      [AC] (TP §3.4.1).
- [ ] **`user_open_campaign` refuses every row of TP §3.4.10 with its own error** (X0.7, program half): rows 1 to 10
      for the price kind; the other four kinds are refused until Sprint 03. For row 3, the price target must not be
      touched yet; the minimum distance per kind is set in Sprint 03 [AC]. The SOL/USD account is derived from
      `GlobalConfig.sol_usd_feed_id`, never trusted as passed. A price campaign copies `campaign_max_age` (never below
      30 s) from the config: the creator does not choose it (TP §3.4.8 [INF]). Test filter: `open campaign refuses`.
- [ ] **The paid opening** (TP §3.4.16): `opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)` in `u128` with
      checked math; `prize_lamports = floor(paid × 9,000 ÷ 10,000)`; `opening_fee_lamports = paid − prize`; all of it
      moves from the creator into the vault (I14, X0.8 first half). It is refused above `max_lamports` (T25), and
      when the SOL/USD account is older than `max_price_age` or wider than `max_price_conf_bps`. `opening_usd` above
      500 makes a larger prize at the same 90/10. Tested on the captured SOL/USD fixture.
- [ ] **A team-key opening** without `opening_usd` moves no lamports besides rent, takes no `partner` argument and
      stores `creator_share_bps = 0` (P-3, I12); it still opens when SOL/USD is stale.
- [ ] **How a team key adds a prize** is not written in the sources (I14 and P1 §4.1 allow it; proposal Appendix B
      leaves `opening_usd` absent for a team key) [AC]. The working reading of TP §3.4.10 is built and tested: the team
      key passes `opening_usd` and pays like any wallet, at the same 90/10, keeping a zero creator share. The choice is
      recorded at the sprint's opening.
- [ ] A retried opening with the same `id` fails on the existing account, and an address funded in advance does not
      block an opening (T17; X0.5, opening half).
- [ ] **`user_join_campaign`** moves the entry from the baker's wallet to the vault by System Program CPI. It refuses
      outside `Open`, after `entries_close_at`, with the pause on, below `min_entry_lamports` (10,000,000), when
      `expected_entry_total` differs from the stored entry (T10; X0.5, entry half), and when the estimated return
      falls below `min_return_bps`. It marks `first_baker` when the pot was empty. One wallet may hold both sides
      (Q3).
- [ ] **`math/schedule.rs`** computes `entries_close_at = deadline_at − clamp(5% × duration, 24 h, 7 days)` and
      refuses durations outside 3 to 90 days (D-k). The six rows of the P1 §3.6 table (3, 7, 14, 30, 60, 90 days)
      are test cases. The review window and the minimum duration have drill values behind a `drill` cargo feature;
      the `mainnet` feature refuses `drill`, and a CI step checks that the `mainnet` build carries the real values
      (T12, TP §3.4.1).
- [ ] Lamports sent by hand to a vault change neither `pool_yes`, `pool_no` nor `prize_lamports` (I15, first half).
- [ ] Two wallets: A cannot change, close or redirect B's `Entry`.
- [ ] With the pause on, only `user_join_campaign` and `user_open_campaign` fail; every other instruction of this
      sprint still runs (I10′, first half).
- [ ] **Events,** one per instruction: `ConfigInitialized`, `ConfigChanged`, `EntriesPaused`, `EntriesResumed`,
      `CampaignOpened`, `EntryAdded` (with both totals after the entry). By self-CPI if one event round-trips in
      LiteSVM on day one, otherwise `sol_log_data` until Sprint 04 (T4). Every campaign-scoped event carries the
      campaign and a contiguous `seq`. Whether npm `litesvm` exposes inner instructions is checked on day one [AC].
- [ ] **The Shank and Codama spike** (T9, size S): one account and one instruction rendered into a Kit client and
      round-tripped in LiteSVM. The result is recorded; the decision is Sprint 05's. If Codama fails, the IDL check
      covers the Shank output alone.
- [ ] One error enum, one code per refusal; `constants.rs` carries no USDC, cap or pre-D6 name.
- [ ] The committed IDL (and the generated client, if any) match CI's build (X0.6).
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

Filled in during the sprint and at closure.
