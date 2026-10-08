# Sprint 04 — Window, settlement, payout, fees, creator share and invariants

**Status:** planned · **Branch:** `sprint-04-settlement-invariants` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B4 (TP §3.4.4, §3.4.5, §3.4.7, §3.4.13, §3.4.16) |
| Depends on | Sprint 03 |
| Requirements covered | BR-03, BR-04 (the 10% swept or refunded at the outcome), BR-05, BR-09, BR-10, BR-11, BR-13 (in the program), BR-15 (the sweep to `fee_recipient`), BR-25 (the window, confirm, void, contest), BR-39, BR-42 (I10′ in full), BR-45 |

## Goal

Close the path of the money: the six-hour window, settlement in its three modes, the lamport payout straight to each
wallet, Brot's fee, the creator's 1% as decided (D-g, P-2), the prize and the held 10% following the cause (P-4), and
the close that returns rent. Then prove with the randomized test that the fifteen money invariants hold. **This is gate
1 of the roadmap:** no service or site sprint uses the program before this sprint closes.

## Definition of done

- [ ] **Instructions,** one per file, under 200 lines (TP §3.4.3): `team_confirm_result` (ends the window and runs
      the finalize snapshot at once), `team_void_campaign(reason, note_hash)`, `team_open_contest`,
      `finalize_campaign`, `settle_entry`, `settle_creator_share`, `collect_fee`, `settle_prize`, `close_campaign`,
      `sweep_fees`.
- [ ] Team instructions act only in `InReview` and never invert an outcome; outside the window nobody voids; an
      automatic void can be confirmed, never turned into YES or NO.
- [ ] **`VoidReason`** (TP §3.4.7) records every void (BR-45), with its class: `MissedWindow` (house failure, the 10%
      refunded); `UnreadableAccount` (outside cause, kept); `StaleFeed` (outside cause, kept: the working default,
      see the founder question below); `TeamHouseFailure` (refunded); `TeamOutsideCause` (kept). One test per reason.
- [ ] **`finalize_campaign`** snapshots the totals, records the mode (`Split`, `OneSided`, `Refund`), decrements
      `open_campaigns` (I7, TP §3.4.13), and computes the creator share with one pure function,
      `creator_share(V, P, R, fee, bps) → (from_pot, from_fee)`, per P-2: `fee = ceil(P × fee_bps ÷ 10,000)`;
      `C = floor((V + P) × creator_share_bps ÷ 10,000)`; `from_pot = min(C, P − fee + R)`;
      `from_fee = min(C − from_pot, fee)`; winners split `V + P − fee − from_pot + R`, never below `V`.
- [ ] **`settle_entry`** credits lamports from the vault straight to the baker's wallet and closes the `Entry`, rent
      back to the baker; a losing entry goes through the same instruction with zero. Each winning entry receives
      `floor(entry × distributable ÷ V)`, in `u128` with checked math. No token account is involved.
- [ ] **`settle_creator_share`** credits the share to `creator` only, once (I13).
- [ ] **The reserve path:** a credit that would leave an empty wallet with a positive balance below the rent-exempt
      minimum (650,240 lamports [F]) stays reserved in the vault, bookkept against its owner; the owner can fund the
      wallet and call the instruction (Q2); the keeper's daily retry is Sprint 06's. Since `close_campaign` waits for a
      reserved creator share, the team chooses here between keeping that wait and letting `close_campaign` pay the
      share together with the rent when the creator is the rent payer, and records it [AC] (TP §3.4.5).
- [ ] **The worked examples are test cases** (P1 §1.2, §3.4, §3.5; proposal §2.4.4): V 600 / P 400 with no prize
      (fee 40, creator 10, winners 950); the same with a 450 prize (winners 1,400); V 990 / P 10 and V 98,900 /
      P 1,100 with and without the prize, under the decided reading; the one-sided pot of Ana, Bruno and Carla
      (100, 198, 297 back; 5 to Brot). The literal reading of D-g exists only as a test oracle.
- [ ] **`OneSided` and `Refund`:** creator share 0 (P-1, I12); the prize returns whole to whoever opened (P-4); the
      10% opening fee stays with Brot in `OneSided` and on an outside-cause void, and returns to whoever opened on a
      house-failure void (P-4, T23). A team campaign has creator share 0 (I12).
- [ ] **`collect_fee`** moves what Brot keeps (the house fee net of `from_fee`, the one-sided fees, the opening fee
      unless refunded) to the fee vault; **`settle_prize`** returns the prize to whoever opened in `OneSided` and
      `Refund`, plus the opening fee on a house-failure void.
- [ ] **`close_campaign`,** once fee, prize and creator share are settled, moves dust and hand-sent surplus to the fee
      vault, returns the rent of the campaign and its vault to `rent_payer`, zeroes the data and reassigns both
      accounts to the System Program. `checks::close_account` gets its negative test: a revival in the same
      transaction fails the tag check.
- [ ] **`sweep_fees`** moves the fee vault's lamports above its rent-exempt minimum to `GlobalConfig.fee_recipient`,
      and nowhere else, and refuses a `fee_recipient` equal to the fee vault (`admin_set_fee_recipient` accepts any
      non-zero key, Sprint 02).
- [ ] **Every instruction that pays** (`settle_entry`, `settle_creator_share`, `collect_fee`, `settle_prize`,
      `close_campaign`, `sweep_fees`) checks `owned_by` on its vault and `distinct` between each recipient and the
      vault. Before the first of them merges, a slot matrix generated from the Shank account lists (each signer
      unsigned, each writable read-only, a stranger, an account of each program type, every writable pair aliased)
      runs in CI with a specific error and unchanged balances for each case, or every `checks::` call line is removed
      once with its test failing (Sprint 02 review: X0.9 proved the 15 checks and 21 call sites, not all ~70).
- [ ] **Randomized test with a fixed seed:** hundreds of random operations (paid and team openings, entries on both
      sides, pause and resume, lamports sent by hand, clock advances, resolve, confirm, void with each reason,
      contest, finalize, settlements out of order and twice, a credit to an empty wallet, close), with **I1 to I15**
      (TP §3.4.13) checked after each one (gate 1, X0.1).
- [ ] **The in-program assertions** of TP §3.4.13 (`math/invariant.rs`) also run at the end of `user_open_campaign`
      and `user_join_campaign`: the vault's lamport change across the instruction equals the bookkept change (the
      change, not "lamports ≥ rent + books", so hand-sent SOL never refuses a join; Sprint 02 review).
- [ ] **One-sided cases, one row each:** only winners, only losers, a single baker, with and without the prize, and a
      campaign with no entry at all, under a switchable default (see the founder questions below).
- [ ] Two wallets: A cannot receive, close or redirect B's `Entry`, and cannot take the creator share.
- [ ] With the pause on, only `user_join_campaign` and `user_open_campaign` fail; every other instruction runs, and
      no payout or refund is ever blocked (I10′).
- [ ] Every transition outside TP §3.4.2 is refused with its own error.
- [ ] **Math vectors:** the Rust pure functions emit at least 10,000 vectors (fees, payouts, both readings of the
      creator share, one-sided, void, the opening conversion), committed for Sprint 05's replay (X0.3, Rust half).
- [ ] **The settle batch is measured** in LiteSVM with self-CPI events (T3): entries per transaction and compute
      used; the per-account write limit under late entries (TP C7) is measured too. Both recorded.
- [x] ~~If Sprint 02 started with `sol_log_data`, events move to self-CPI here (T4).~~ Moot: Sprint 02 shipped
      self-CPI events.
- [ ] **How a campaign leaves `Contested` before Sprint 14** is decided by the team and recorded: the instruction
      stays disabled until then, or a path out is written [AC].
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- `math/fees.rs` and `math/payout.rs` completed (the modes, the one-sided fee and the creator share; Sprint 02 wrote
  the estimate the join needs), `math/invariant.rs`; the folders `instructions/resolution/` and
  `instructions/settlement/` (S each).
- `VoidReason` and the path of the 10% (S); `close_campaign` with rent returned and surplus swept (S).
- The randomized invariant test (M) and the math vectors (S).
- Events (TP §3.4.14): `ResultConfirmed`, `CampaignVoided`, `ContestOpened`, `CampaignFinalized`, `EntrySettled`,
  `CreatorShareSettled`, `FeeCollected`, `PrizeSettled`, `CampaignClosed`, `FeesSwept`.
- The measured batch size (T3).

## Out of scope

The second read and `admin_decide_contest` (Sprint 14). Referral and the sealed entry (14, 15). The keeper that sends
the settlements (06). A contest opened by a baker with a deposit (phase 1.2).

## Founder decisions that block the sprint

- **Answered:** P-1 (no creator share on a void, in a one-sided pot or on the prize); P-2 (the share comes from the pot
  while winners stay whole; only the shortfall from Brot's fee); P-4 (the prize returns to whoever opened; the 10%
  follows the cause); D-g; Q6 (the 10% waits in the vault, T23).
- **Q2, re-read for SOL:** with lamport credits, the closed or foreign USDC account case is gone. What remains is a
  credit below rent to an empty wallet: it takes the reserve path, and its owner can claim it from their own wallet
  (TP v0.0.1's recommendation b).
- **Open [Q]: a campaign with no entry at all.** BP v0.0.4 has no written rule for it (P1 §3.5). The program builds
  the one-sided treatment as a switchable default: the prize returns to whoever opened and the 10% stays with Brot,
  so junk costs US$50 per campaign (TP §3.4.10) [INF].
- **Open [Q]: does a `StaleFeed` void count as a house failure once the keeper holds a Hermes key?** The answer
  decides whether the 10% is refunded. The working default is an outside cause, so the 10% is kept (TP §3.4.7) [INF];
  a Pyth sponsorship that lapses is a third party's act.
- BP-5 (keep the window until the audit; say "no human picks the winner", P-9) changes only the copy of Sprint 13; the
  window is built here either way.

## Agents and skills

- **Agents:** `technical-security-red-team-agent`; `devils-advocate-agent` (I9, splitting an entry across wallets;
  the creator share at the threshold); `dev-product-agent`; `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review` (the creator share and the payout path), `codemap`,
  `verify-build-works`, `decision-log`, `secrets-scan`, `release-check`.

## Security gates

- No payout reads a vault's live balance; every amount comes from the snapshot.
- The destination is always the stored `baker`, `creator` or whoever opened; the caller chooses nothing.
- The pause never blocks a payout or a refund. Outside the window nobody voids.
- Adversarial review and `secrets-scan` at closure.

## Tests

Pure functions in `bun run test:rust`; everything else in `bun run test`, with LiteSVM. Filters to add in this sprint:

```bash
bun test tests/ -t "winners never get back less than their entry"     # I11
bun test tests/ -t "credit to an empty wallet below rent is reserved"
bun test tests/ -t "creator share follows the decided reading"
bun test tests/ -t "one-sided pot"
bun test tests/ -t "void refunds and the opening fee follows the cause"
bun test tests/ -t "close returns rent and sweeps the surplus"
bun test tests/ -t "pause never blocks a payout"                       # I10′
bun test tests/ -t "randomized invariants"                             # I1 to I15, fixed seed
```

## Carried over

From Sprint 02 and its reviews (`docs/sprints/sprint-02-pot-core.md`, "Reviews"; 2026-10-08).

- **Hand-sent lamports land on the `Campaign` and `Entry` accounts too,** not only on the vault (I15 names the
  vault). Settling and closing account for them.
- **After `close_campaign`, the same `id` can be opened again,** with the same `Entry` addresses. The indexer keys a
  campaign by address and opening signature, or the program keeps a tombstone [AC].
- **The valve has one writer until finalize.** The randomized test asserts I7, and the runbook says how to raise
  `max_open_campaigns` when the counter is stuck. A leaked team key can fill it for up to 90 days; the founder decides
  in PR #30 between a separate budget for free openings and letting the team void an `Open` campaign with no entries
  (which §3.4.7's "nobody voids outside the window" forbids today). Until then the risk is written in TP §7.
- **Layout versions are exact-match.** No `LAYOUT_VERSION` bump while version 1 accounts exist (or a dual read), v1
  byte fixtures with a test that the new binary loads them, and `Entry._reserved` (16 bytes) re-checked before the
  devnet deploy fixes the layout.
- **Stored bumps** are safe because every writer takes `canonical_pda`'s value; a `CanonicalBump` type built only
  there, or a test over every stored bump, keeps it so.
- **The first-baker exemption is per wallet, later joins included** (Q3 as written): TP §3.4.16's one-sided table says
  so, so nobody reads it as "the first entry only".

## Risks

- A rounding error locks or creates lamports. Reduces: fee rounded up, payouts down, `u128`, I3′ and I15 after every
  random operation.
- After `Settling` a wrong outcome has no correction. Reduces: the window, the second read (07) and the review queue.
- The batch with self-CPI events may fit fewer settlements per transaction than measured before; the keeper sizes its
  batches from T3.

## Expected artifacts

The files of Deliverables, the randomized test in `tests/`, the math vectors, the IDL, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** window, settlement, payouts in SOL, fees, the creator share and the invariant test.
- **Session log:** the defaults built for a campaign with no entry and for `StaleFeed`; the decision on `Contested`;
  the reserved share at close; the measured batch; the adversarial review's result.

## Record and retrospective

Filled in during the sprint and at closure.
