# Sprint 14 — Referral and second read

**Status:** in progress: the program, the SDK, the referral routine and the randomized test built and tested (2026-10-13), with the founder's answer to D2 built the same day; waiting for the second red-team pass, the merge and the devnet redeploy · **Branch:** `sprint-14-referral-second-read` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B9 (TP §3.4.7, §3.4.11; the routine and the second read in TP §3.5) |
| Depends on | Sprint 04 (program), Sprints 07 and 08 (services), Sprint 12 (site) |
| Requirements covered | BR-20 (referral), BR-25 (the two-stage dispute) |

**Where it fits.** Track A: 14 and 15 run in parallel, then 16, 17 and 18 (proposal §4.0). No Track B work runs from
here to Sprint 17.

## Goal

The two small program pieces that go in before mainnet. The halves are independent, and the founder can take one
without the other.

## Definition of done

**Half A, the referral.**

- [x] The `ReferralLink` account (`["referral", referee]`) and the `user_link_referrer` instruction exist, one file
      each under the house rules: signed by the referee, once, immutable. The event is `ReferralLinked`. Every check
      the instruction uses has a negative test that fails without it (T24).
      *Done 2026-10-13:* `instructions/referral/`; 23 refusal tests; 66 cases show no instruction changes a link.
- [x] The indexer gains the `referrals` table. "Before the first entry" is checked from the two on-chain times. The
      basis of each winning entry of the referee is the fee Brot actually kept, `(fee − from_fee) × entry ÷ V`, from
      the events and checked against the `Campaign` (P1 §3.9, "a taxa que o Brot de fato recebeu"; TP §3.4.16).
      *Done:* "before the first entry" by chain order, not time (the record says why); the basis checked against the snapshot.
- [x] The weekly routine pays the referrer 20% of that basis for 90 days from the referee's first entry (TP v0.0.1 Q9,
      answered b). It refunds the referee the fee on the first US$50 of entries once they pass US$250, capped at
      0.05 SOL (P-6, answered 2026-10-13: as recommended). The thresholds are SOL constants: 0.4576 and 2.2879 SOL
      at the reference price (P1 §3.9, inference).
      *Done* as the founder answered on 2026-10-13 ("as recommended"); he approved the five readings of the rules the same day.
- [x] The routine reads finalized rows only. Each payout is written to the `referral_payouts` evidence table, which is
      snapshotted nightly to VM 2 (K-05, A-4). A public report lists wallets and amounts only.
      *Done;* the nightly snapshot to VM 2 is a hook only (VM 2 is a D4 purchase).
- [x] A transfer that would leave an empty wallet below the rent-exempt minimum (650,240 lamports) is not sent; it
      carries to the next week and shows as pending **[INF]** (proposal §2.4.6; P-6's "small rebates may hit the
      reserve path").
      *Done:* the minimum read from the RPC (650,240 lamports on the clusters).
- [ ] The site accepts `?ref=<address>`, records nothing until the new baker signs `user_link_referrer` before their
      first entry (proposal §3.8), and shows the referral balance where L-10 says.
      *Not built:* the site part waits for the site lane, and the balance's place for L-10 (founder).

**Half B, the dispute.**

- [x] `reread_campaign`: the same reading pays, from stage 1's deadline on (D2: `RereadBeforeTimelock` before it); a
      different one goes to stage 2 at once, with 48 hours. `admin_decide_contest` only confirms or voids and never
      inverts. The event is `ContestClosed`.
      *Done;* D2 answered (a) on 2026-10-13 and built: `contest-reread.test.ts` (a matching re-read is refused before
      stage 1's 24 hours end, and pays at their end), `contest-decide.test.ts` ("decide contest never inverts").
- [x] Stage 1 lasts 24 hours from `team_open_contest` (D2, answered 2026-10-13; P1 §4.5 said one hour): a matching
      re-read pays only after them (`RereadBeforeTimelock`), and until then a team key can send the contest to stage 2
      by calling `team_open_contest` again (the escalation). The worst case, 78 hours from resolution to payout
      (6 + 24 + 48), is a test case.
      *Done:* the escalation and each of its refusals (`contest-escalate.test.ts`, `contest_mollusk_escalate.rs`); the
      78-hour bound holds on-chain with the keeper down for a week or re-reading a week late (`contest-worst-case.test.ts`).
- [ ] On a price campaign, the second read fetches the proof transaction at `posted_slot` through RPC B, on the
      standby (Sprint 07; proposal §2.5). On the other kinds, it re-reads the account and compares it with
      `observed_value`.
      *Partly:* the standby's second read through RPC B is built (PR #88, merged 2026-10-13); the keeper calling `reread_campaign` is not wired yet.
- [ ] The decision is published, with its reason, on the public record route (`content/void-log/`).
      *Partly:* `scripts/team/decide.ts` writes a void's record only, under a Team key header; a confirm publishes
      nothing; the admin form is a follow-up.

**Both halves.**

- [x] The seeded randomized test, extended with the new instructions, keeps I1 to I15. The pause list of I10′ does not
      grow: linking and contesting are never paused.
      *Done:* fixed seed plus 24 seeds (before D2) and 12 seeds after D2 (the fixed seed among them), 2,000 operations
      each, every exit from Contested, I7 on each.
- [x] Two users: wallet A cannot create, change or remove B's link.
      *Done:* `tests/brot/referral-wallets.test.ts`.
- [ ] The IDL, the generated client and the SDK are regenerated; the program is redeployed to devnet from the CI
      artifact.
      *The IDL, the client and the SDK: done, again after D2. The devnet redeploy: waits for the merge and Ronaldo's words.*
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- In the program: `state/referral.rs`, the `user_link_referrer` file, and the `reread_campaign` and
  `admin_decide_contest` files.
- In the services: the `referrals` table, the basis computation, the weekly routine and its report; the second read
  wired into the dispute.
- On the site: the link, the balance and the contested state with the published decision.

## Out of scope

The contest by any baker, with a deposit, and internal arbitration (phase 1.2). Splitting the fee inside
`settle_entry`, which the TP rejected (TP §3.4.11). A lock against self-referral: an accepted risk ("isso memso", P1
§3.9).

## Founder decisions that block the sprint

- **D2** (the review's high finding F1; S14-D2 in TP §14.2): **answered 2026-10-13 (Ronaldo): (a), with a 24-hour
  stage 1.** A matching re-read pays only after those 24 hours, and during them a team key can send the contest to
  stage 2; the worst case is 78 hours (6 + 24 + 48). Built the same day.
- **D5** (proposal §5.2): attestation of each entry and wallet screening. **Answered 2026-10-13 (Ronaldo): (a), none
  on devnet;** mainnet waits for L0. If (b), `user_join_campaign` also checks a backend ed25519 attestation, bound to
  program, cluster, campaign, baker, amount, expiry slot and nonce, and never gating settlement.
- **P-6:** **answered 2026-10-13 (Ronaldo): as recommended.** The rebate ceiling of 0.05 SOL and the SOL value of the
  US$50 and US$250 thresholds (0.4576 and 2.2879 SOL).
- **BP-9** (P-9, open): "Referrals, day one" read as the first day on mainnet.
- **L-10** (Product Brief v0.0.1 gap, open): where the baker sees the referral balance.
- **L-14** (Product Brief v0.0.1 gap): stage 2 before phase 1.2 **answered 2026-10-13 (Ronaldo): both stages now.**
  The second oracle for price campaigns (T8) stays open.
- **Who signs the weekly payout:** **answered 2026-10-13 (Ronaldo): as recommended.** A person signs each batch from an
  operations wallet; the routine prepares the signing file and no key goes on the server. The treasury rule it pays
  from stays with P-7.
- **The 1% a referee pays in a one-sided pot:** **answered 2026-10-13 (Ronaldo): as recommended.** It counts toward
  neither the 20% nor the rebate; P1 §3.9 counts winning entries only.
- **The five readings of the referral rules:** **approved 2026-10-13 (Ronaldo).** The 90 days count the entries joined
  in the window; every entry counts toward both thresholds; the rebate has no window; the one-sided 1% is refunded by
  neither; amounts round down per entry.
- **Answered:** TP v0.0.1 Q9 (b: the 90 days start at the referee's first entry).

## Agents and skills

- **Agents:** `technical-security-red-team-agent`, `business-red-team-agent` (the cost of self-referral),
  `dev-product-agent`, `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review` (the program changes after gate 1), `privacy-audit` (the referral
  report), `secrets-discipline`, `secrets-scan`, `codemap`, `verify-build-works`, `decision-log`, `release-check`.

## Security gates

- The randomized test passes again before any redeploy (gate 1).
- The weekly payout moves operations money: its key does not go on the server without a recorded decision.
- `admin_decide_contest` never inverts a result.
- The public report carries wallets and amounts only.
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run build:program && bun run test && bun run test:rust
cargo fmt --all -- --check
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
bun test tests/ -t "link referrer refuses"            # a second link, the zero address, the referee itself, each check
bun test tests/ -t "checks refuse"                    # Sprint 02's negatives
bun test tests/ -t "decide contest never inverts"
bun test tests/ -t "contest worst case is 78 hours"   # 6 + 24 + 48 (D2), with the keeper down or late
bun test tests/ -t "contest escalate"                 # a team key sends a stage-1 contest to the admin (D2)
bun test services/ -t "referral basis"                # the referral basis against a campaign's events
node scripts/codemap.js --check && node scripts/ci-secret-scan.js origin/main
```

The dispute by both paths on devnet: a matching re-read that pays, and a different one that goes to stage 2.

## Risks

- A referrer depends on the company to be paid: the accepted cost of keeping the payout off the program.
- The second oracle is not chosen when the sprint opens (L-14, T8).
- The share of the fee paid out in referrals exceeds the plan: the rule goes back to the founder.
- A program change after gate 1 must pass the randomized test again, and the audit reads it.

## Expected artifacts

The program and service files listed under Deliverables, an example payout report, the IDL and generated client,
`CODEMAP.md`.

## Changelog and session log

- **Changelog:** referral; two-stage dispute.
- **Session log:** the answers to D5, P-6, L-10 and L-14; who signs the weekly payout; which half went in, if only
  one.

## Record and retrospective

**2026-10-13, built in the lead's parallel run** (branch `sprint-14-referral-second-read`; the scaffold `fd67706`
shared with Sprint 15, the lead's addendum `a038f0b`, the Sprint 08 indexer merged in, then the lanes L14A, L14B and
L14R and the randomized test's extension). Not on devnet: a redeploy needs the merge into `main` (CI publishes the
artifact only from there) and Ronaldo's words.

**Half A, the referral.** `user_link_referrer` (instructions/referral/): signed by the referee once, with the
referee's rent; never changed or closed (66 cases over every writable slot of every instruction); the zero address and
the referee itself refused (`InvalidReferrer`); a pre-funded address topped up; never paused. The indexer's referral
tables decide "before the first entry" by chain order (slot, the transaction's place in the block, the instruction);
the basis of each winning entry is `(fee − from_fee) × entry ÷ V`, checked against the campaign's snapshot before
anything is owed; 20% for 90 days from the referee's first entry; the rebate on the first US$50 after US$250, capped at
0.05 SOL, with the thresholds as SOL constants; only winning entries count. The weekly routine (`scripts/referral/`)
reads finalized rows only, prepares a signing file for a person (no key on the server), records what landed by the
memo `brot-referral:<batch>:<index>` into a ledger in its own file, carries a transfer below the RPC's rent minimum to
the next week, and publishes a report of wallets and amounts only. The privacy audit is TP §8.5.

**Half B, the dispute.** `team_open_contest` enabled (inside the window, every entry tallied first); `reread_campaign`
(any wallet, top level only; the same reading pays with the stored outcome, a different one opens stage 2; it never
writes a result); `admin_decide_contest` (confirm or void with a team reason, never inverts, checked over all 65,536
argument pairs); the stage-2 lapse in `finalize_campaign`; the worst case enforced on-chain; the (Contested, Settled)
edge for a pot with no entry. The site's contested state and `content/void-log/` publication of the admin's decision
are a later site step.

**D2, answered and built the same day** (the review's high finding F1: any wallet could close a team's contest with a
same re-read and pay the contested result, and a [swap, re-read] transaction could build the equality on a curve).
Ronaldo answered (a), with a 24-hour stage 1, and lane L14B built it (`3d524c9` to `05fe0d8`): a matching re-read pays
only from stage 1's deadline on (`RereadBeforeTimelock`, 6176, before it); during those 24 hours a team key sends the
contest to stage 2 by calling `team_open_contest` again (`WrongContestStage` at stage 2 already,
`ContestDeadlinePassed` from stage 1's deadline on); the worst case is 78 hours (6 + 24 + 48), enforced on-chain with
or without a keeper. The SDK's view gives `contestTimelockEndsAt` and `contestEscalable`, and its summary says which
of the two acts a team key signs.

**Both halves.** The randomized test (I1 to I15) draws link, contest, re-read, decide and the lapse, and checks the
open count on every exit (fixed seed plus 24 seeds at 2,000 operations before D2; after D2, 12 seeds, the fixed one
among them, with the 24-hour wait and the escalation drawn too); the pause list did not grow; the IDL, the Codama client
and the SDK are regenerated; the team scripts use the real contest; the negative suite on Surfpool refused all 416
cases with their own errors (run before F4 and D2); after D2, the team rehearsal passed 44 of 44 checks, among them the
matching re-read refused during stage 1 and the team's escalation, and the full checks passed (963 TypeScript, 536 Rust
and 538 mainnet tests). The mutation proof covers every new check: the two referral rules (`referrer_not_zero`,
`referrer_not_referee`) and, after D2, the 17 ids of the dispute's rows (with `top_level` under the re-read's test) in
37 cases, each failing as it must; the link's rows on Sprint 02's shared checks have no recorded run.

**Open, with owners.**
- **The lead:** the second red-team pass on the post-review changes: review-14-second.md (result added by the lead).
- **The founder:** the notice text before the referee signs and on the privacy page; the ledger's retention; where the
  referral balance shows (L-10).
- **The lead, after the merge:** the devnet redeploy with Ronaldo; the keeper calling `reread_campaign` in stage 1 and
  `finalize_campaign` after a lapse, simulating each re-read first (a matching one is refused until
  `contestTimelockEndsAt`); the site's `?ref=` link, the referral balance (L-10) and the contested state.
- **A follow-up:** the void log's admin form (`scripts/team/decide.ts` writes a void's record under a Team key header,
  and a confirm publishes nothing).
- **Sprint 16:** the partial-tally cut-off defect the randomized test reproduced in Sprint 04 code (audit item O-3).
