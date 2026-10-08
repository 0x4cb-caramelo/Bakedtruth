# Sprint 14 — Referral and second read

**Status:** planned · **Branch:** `sprint-14-referral-second-read` · **Dates:** none, by the founder's decision

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

- [ ] The `ReferralLink` account (`["referral", referee]`) and the `user_link_referrer` instruction exist, one file
      each under the house rules: signed by the referee, once, immutable. The event is `ReferralLinked`. Every check
      the instruction uses has a negative test that fails without it (T24).
- [ ] The indexer gains the `referrals` table. "Before the first entry" is checked from the two on-chain times. The
      basis of each winning entry of the referee is the fee Brot actually kept, `(fee − from_fee) × entry ÷ V`, from
      the events and checked against the `Campaign` (P1 §3.9, "a taxa que o Brot de fato recebeu"; TP §3.4.16).
- [ ] The weekly routine pays the referrer 20% of that basis for 90 days from the referee's first entry (TP v0.0.1 Q9,
      answered b). It refunds the referee the fee on the first US$50 of entries once they pass US$250, capped at
      0.05 SOL (P-6, open; built as recommended). The thresholds are SOL constants: 0.4576 and 2.2879 SOL at the
      reference price (P1 §3.9, inference).
- [ ] The routine reads finalized rows only. Each payout is written to the `referral_payouts` evidence table, which is
      snapshotted nightly to VM 2 (K-05, A-4). A public report lists wallets and amounts only.
- [ ] A transfer that would leave an empty wallet below the rent-exempt minimum (650,240 lamports) is not sent; it
      carries to the next week and shows as pending **[INF]** (proposal §2.4.6; P-6's "small rebates may hit the
      reserve path").
- [ ] The site accepts `?ref=<address>`, records nothing until the new baker signs `user_link_referrer` before their
      first entry (proposal §3.8), and shows the referral balance where L-10 says.

**Half B, the dispute.**

- [ ] `reread_campaign`: the same reading pays; a different one goes to stage 2, with 48 hours. `admin_decide_contest`
      only confirms or voids and never inverts. The event is `ContestClosed`.
- [ ] Stage 1 completes within 1 hour of `team_open_contest`. The worst case, 55 hours from resolution to payout, is a
      test case (P1 §4.5).
- [ ] On a price campaign, the second read fetches the proof transaction at `posted_slot` through RPC B, on the
      standby (Sprint 07; proposal §2.5). On the other kinds, it re-reads the account and compares it with
      `observed_value`.
- [ ] The decision is published, with its reason, on the public record route (`content/void-log/`).

**Both halves.**

- [ ] The seeded randomized test, extended with the new instructions, keeps I1 to I15. The pause list of I10′ does not
      grow: linking and contesting are never paused.
- [ ] Two users: wallet A cannot create, change or remove B's link.
- [ ] The IDL, the generated client and the SDK are regenerated; the program is redeployed to devnet from the CI
      artifact.
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

- **D5** (proposal §5.2): attestation of each entry and wallet screening. Recommendation: (a), none, on devnet; decide
  after L0 and before this sprint. If (b), `user_join_campaign` also checks a backend ed25519 attestation, bound to
  program, cluster, campaign, baker, amount, expiry slot and nonce, and never gating settlement.
- **P-6** (open): the rebate ceiling of 0.05 SOL and the SOL value of the US$50 and US$250 thresholds.
- **BP-9** (P-9, open): "Referrals, day one" read as the first day on mainnet.
- **L-10** (Product Brief v0.0.1 gap): where the baker sees the referral balance.
- **L-14** (Product Brief v0.0.1 gap): whether stage 2 applies before phase 1.2, and the second oracle for price
  campaigns (T8).
- **[Q]** Who signs the weekly payout, and from which account. On mainnet the fee account is a multisig (P-7); a weekly
  multisig transfer or a funded operations wallet are the two shapes. Carried open from TP v0.0.1.
- **[Q]** Whether the 1% a referee pays in a one-sided pot counts toward the 20%. P1 §3.9 counts winning entries only.
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
bun test tests/ -t "link referrer refuses"            # to add: a second link, a late link, another signer
bun test tests/ -t "checks refuse"                    # Sprint 02's negatives, extended to the new instructions
bun test tests/ -t "decide contest never inverts"     # to add
bun test tests/ -t "contest worst case is 55 hours"   # to add
bun test services/                                    # to extend: the referral basis against a campaign's events
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

Filled in during the sprint and at closure.
