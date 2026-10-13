# Sprint 18 — Mainnet

**Status:** in progress; the runbook and its Surfpool rehearsal are built (2026-10-13); everything else is blocked by Sprint 17, the founder and outside parties (see "Record") · **Branch:** `sprint-18-mainnet` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B9 (TP §7 "Before mainnet", §12); P4 §3.4 |
| Depends on | Sprint 17 |
| Requirements covered | BR-04 and BR-43 (treasury per P-7), BR-15 (the 25/75 split of the fee), BR-35 (the volume report the stop rule reads), BR-40 (both reports and the multisig); every flow, now with real money |

The file was renamed with `git mv` from its v0.0.1 name: the cap left the mainnet criteria (D-h).

## Goal

Open with real money only once both criteria are met in full: the two audit reports, with every serious finding
fixed, and the 2-of-3 multisig. There is no cap criterion any more (D-h). The company, the lawyer's written review and
the treasury rule are the founder's items that also gate the day.

## Definition of done

- [ ] **Criterion 1, the audits**, checked with evidence: two public reports on the exact version deployed, no
      serious finding open, every fix confirmed by the firm that found it (P4 §3.4).
- [ ] **Criterion 2, the multisig**, checked with evidence: the 2-of-3 multisig, on hardware devices, owns the upgrade
      authority and `admin`, has made a test signature, and every upgrade waits 24 to 48 hours in public (P4 §4.1).
- [ ] The deployed program is the `solana-verify build` artifact with the `mainnet` feature. The deploy is a multisig
      proposal. `verify-from-repo` passes, and the repository is public at the deployed commit.
- [ ] Deploy and initialize happen in one session. `admin` and `fee_recipient` are the multisig; `GlobalConfig` holds
      the values recorded in Sprint 16.
- [ ] The primary keeper, the standby, the indexer and `brot-rpc` point to mainnet, with SOL-only keeper wallets and
      separate paid RPC accounts sized by measurement (D4). The alerts reach two inboxes, tested. The low-SOL alert and
      the refill runbook from the fee account (a multisig transfer) are rehearsed.
- [ ] Price campaigns open on mainnet only if the keeper posts its own proofs with a Hermes key (D4; proposal §2.5).
      Otherwise the creation box offers the other four kinds and says why.
- [ ] One full cycle runs on mainnet with minimum entries (0.01 SOL): a team-key opening, entries on both sides,
      resolution, the six-hour window, and the payout received in the wallets.
- [ ] The incident plan is rehearsed once: pause and resume.
- [ ] **The treasury rule is written (P-7):** the platform receives and pays in SOL; the company converts monthly,
      outside the platform, what dollar costs need; the fee is split 25% treasury and 75% operations (BR-15); who
      signs and on which day; a monthly report in SOL with its US$ value at that day's Pyth SOL/USD price (BR-43;
      no CoinGecko since 2b, 2026-10-11; whether the accounts need a recognised reference rate is for the accountant
      and L0).
- [ ] The monthly volume report that the 180-day stop rule reads exists from the first mainnet day (BR-35).
- [ ] The site shows the mainnet notices, the terms and the country switch as L0 set them; the devnet notice is gone.
- [ ] Referral is live from the first mainnet day, if BP-9's reading holds (P-9).
- [ ] The `release-check` skill passes, and the `usage-monitor` skill is set up for RPC credits, the Pyth plan,
      and SOL received and spent.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The program on mainnet, its address published.
- The services and the site pointed at it.
- The public record of the evidence for each criterion.
- The treasury rule, the refill and conversion runbook, and the monthly reports.

## Out of scope

Phase 1.2 (the contest with a deposit; Token-2022). Phase 2 (early exit; sports). Tokens A and B (P3). The Android
app's release (Sprint 22). Any cap.

## Founder decisions that block the sprint

- **Confirm both criteria.** If one is missing, the opening waits (P4 §3.4).
- **The company exists** (P4 §5.2), so it can sign contracts and publish the app later (C-01).
- **L0, the lawyer's written review** (D-s; proposal §3.10). The BP's recommendation that an outside colleague reads
  it stays a proposal.
- **P-7, the treasury rule** (open; recommended as written above).
- **The new open item** (P4 §3.4): the one-report exception lost its cap; the BP recommends waiting for both reports.
- **BP-17** (P-9, open): whether the creation rules in the audited version become a third criterion. Sprint 16
  froze them either way.
- **The deck's line** "MAINNET After an audit, a multisig and a cap" must change; the BP proposes "MAINNET After an
  audit and a multisig." (P4 §3.1; K-12).
- **[Q]** Whether the first mainnet cycle also includes a paid opening (US$500 in SOL), to prove the Pyth-priced
  charge with real money.
- **Answered:** D-h (no cap), D-a (SOL only).

## Agents and skills

- **Agents:** `coordinator-agent`, `technical-security-red-team-agent`, `legal-compliance-agent`, `launch-agent`.
- **Skills:** `release-check`, `multi-ai-review` (the decision to open), `secrets-discipline`, `secrets-scan`,
  `verify-build-works`, `usage-monitor`, `decision-log`, `sprint-management`.

## Security gates

- **Mainnet only after both audit reports and the 2-of-3 multisig (gate 6).** Without both, the sprint does not open.
- The upgrade key was never in a file nor on an internet-connected machine.
- Whoever first calls initialize becomes `admin`: deploy and initialize in the same session.
- Any program change after the audit needs a new review.
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
solana-verify verify-from-repo                          # against the deployed program [AC: flags]
bun run smoke:devnet                                    # a last devnet cycle on the commit being deployed
curl -fsS https://brot.markets/api/v1/health | jq '.cluster, .entries_allowed, .program_last_deploy_slot'
```

The full cycle on mainnet with minimum entries. The pause rehearsal. Each alert fired once.

## Risks

- A new program with real money and no cap (critical): a bug's loss has no ceiling. What is left: both audits, the
  multisig, the pause and the exposure alert (proposal §2.4.7).
- The team does not review a resolution and a wrong result is paid: nothing corrects it after `Settling`.
- A creator who controls the measured account can force the outcome of a campaign on a worthless token; it pays once
  the other side holds just over US$56 of third-party money (`0.9 × X > 50`). Written risk; the founder's decision
  stands (D-h, D-i).
- The Brazilian rule (MP 1.394; P4 §6) and its removal duties for app stores (K-14).
- SOL's price: revenue arrives in SOL while costs are in dollars (P4 §4.7).

## Expected artifacts

The program's mainnet address, the `verify-from-repo` output, the evidence for both criteria, the treasury rule,
production environment files in `/etc/brot-markets` (never in the repository).

## Changelog and session log

- **Changelog:** mainnet opened, on the two criteria.
- **Session log:** the evidence for each criterion; the treasury rule; what was left for phase 1.2.

## Record and retrospective

**2026-10-13, the part that depends on no one (lane L18).** `deploy/mainnet/README.md` is the runbook, never
executed; `scripts/deploy/mainnet-*.ts` deploy only to mainnet-beta (checked by genesis hash), with the upgrade
authority on a hardware wallet and the binary bound to its typed SHA-256; `scripts/mainnet/` rehearses the whole day on
a Surfpool fork of mainnet (the `mainnet` build, the real Squads v4 program, real SOL/USD and mint accounts). The
rehearsal passed end to end four times, 43 checks in 13 steps. Sources settled three steps: the first deploy cannot be a
multisig proposal (Agave 3.1.10 refuses `DeployWithMaxDataLen` by CPI), so a hardware wallet deploys from a buffer and
hands the upgrade authority to the Squads vault in the same session; the vault initializes the config (admin and
`fee_recipient` are the vault); the Squads time lock is the session's last act.

Not rehearsed: hardware wallets (key files stood in), the real waits (the fork's clock jumps), the Squads app and CLI,
`solana-verify` (Docker; Sprint 16's CI job), the services on mainnet, and a deploy at the real mainnet id (no keypair
exists yet).

Open, with owners:
- **Before the freeze (Sprint 16, the lead):** a mainnet program id (a fresh keypair generated offline by a person) in
  `declare_id!` and `EVENT_AUTHORITY` under the `mainnet` feature; an IDL and an SDK program id per cluster;
  `[workspace.metadata.cli] solana = "3.1.10"` for `solana-verify`; CI's `brot_markets.mainnet.so`; a `mainnet` value
  for `KEEPER_CLUSTER`, `API_CLUSTER` and `scripts/validator/clusters.ts`, each checking the genesis hash; a
  hardware-signing path for `scripts/team`.
- **Founder (new, from the runbook):** M-1, one multisig or two (recommended: the same three devices in two 2-of-3
  multisigs, the locked one holding the upgrade authority and the unlocked one holding admin and fees, so a pause's
  resume, a leaked team key's removal and keeper refills do not wait the lock); M-2, the lock (24 h proposed); M-3, the
  four parameter proposals in `deploy/mainnet/init-params.mainnet.json`; M-4, who holds the deploy-day device, and
  whether the first cycle includes a paid opening.
- **Outside parties:** both audit reports (Sprint 17), the company, the lawyer's review (L0), the treasury rule (P-7),
  the paid RPC accounts and the Hermes key (D4), the three hardware wallets.
