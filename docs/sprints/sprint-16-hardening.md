# Sprint 16 — Hardening (multisig, pause, incident plan, creation rules frozen)

**Status:** in progress; the CI and supply-chain items merged 2026-10-13 (PR #87), with the verifiable build, the T12 check, the mainnet parameters and "no cap" done; the pre-freeze hardening of the program merged 2026-10-14 in three PRs (#93, #94, #95) and on devnet the same day (slot 510894454 since ~06:35 UTC), each round read by an adversarial review; the incident plan and the key inventory drafted; the rest waits for the founder and the hardware multisig (see "Record") · **Branch:** `sprint-16-hardening` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B9 in part, and TP §7 ("Before mainnet"), §7.1 |
| Depends on | Sprints 14 and 15, or the founder's decision to go on without one of them; Sprint 07 |
| Requirements covered | BR-08 (no cap; mainnet after audit and multisig), BR-40 (creation rules audited, BP-17), BR-41 (powers table), BR-42 (pause and incident plan) |

**What changed from v0.0.1.** There is no cap to set (D-h): `CapState`, the first cap value and the cap test leave the
sprint **[FD]**. In their place the sprint freezes the creation rules into the version both firms read (BP-17, open in
P-9; proposal §4.0) and puts the exposure alert under test, because no cap bounds what a bug could drain (proposal
§2.4.7) **[DP]**.

## Goal

Bring the program and its operation to the state that goes to audit: a verifiable build, a 2-of-3 multisig, the pause
tested with every instruction, an incident plan, the public table of powers, and the creation rules frozen into the
release candidate. The version that leaves this sprint is the one the two firms read.

## Definition of done

- [x] `solana-verify build` runs in CI and gives the same hash in two runs **[AC: its support for a Pinocchio crate
      built with `cargo build-sbf`]**. **Done:** on every push to `main` since PR #87: run 38460875753 (`7808fdc`) and
      run 38491785973 (`8af10e2`) built twice from zero, the job "Verifiable build is reproducible and tested"
      passed, and the published devnet binary is the tested one (`4a98884d…` at `8af10e2`, also the local build's
      hash). The [AC] is answered: it works for this Pinocchio crate.
- [ ] The `.so`'s origin is attested with `actions/attest-build-provenance` in a job of its own, and checked with
      `gh attestation verify` (every `gh` call passes `--repo 0x4cb-caramelo/Bakedtruth`).
      *Built, skipped while the repository is private:* the founder answered (a) on 2026-10-13, public before mainnet;
      the job runs from the day it is public. On 2026-10-14 Ronaldo added "repo publico por hora nao": not public
      for now.
- [ ] The 2-of-3 multisig exists, on hardware devices, with a public wait of 24 to 48 hours. On devnet it owns the
      upgrade authority and `admin` (by the two-step handover) and has made a test signature (T7; TP §14.4 C11 **[AC]**:
      a product with a public wait for program upgrades).
- [ ] **The creation rules are frozen (BP-17):** the release candidate carries `user_open_campaign` with the ten
      checks of TP §3.4.10, the Pyth-priced opening with `max_lamports`, the creator share per P-2, `VoidReason`
      with the 10% path (T23), and every creation parameter under its code ceiling. The audit's scope names each.
- [x] **No cap:** the code has no `CapState` and no `max_pot`. The exposure alert (SOL held in all open vaults,
      proposal §2.11) fires in a devnet test, and so does the alert at 80% of `max_open_campaigns`. **Done
      (2026-10-13):** no `CapState` or `max_pot` anywhere in the program or the SDK; the keeper of `main` (`5eacb70`),
      run read-only against devnet with `KEEPER_DRY_RUN=1`, a key holding no SOL and the thresholds lowered
      (`KEEPER_EXPOSURE_ALERT_LAMPORTS=1`, `KEEPER_OPEN_CAMPAIGNS_ALERT_BPS=1`), raised `exposure_high` (27.87 SOL in
      seven vaults) and `open_campaigns_high` (4 of 1,000) at 20:07 UTC. The approved thresholds (100 SOL, 80%) are
      the defaults.
- [x] **The pause:** I10′ runs with every instruction of the version. Only `user_join_campaign`, `user_open_campaign`,
      the sealed entry and, if kept, `sponsor_add_prize` fail; resolution, payout and refund work with the pause on;
      only `admin` resumes. **Done (2026-10-14, G-10):** `tests/brot/prefreeze-pause.test.ts` ("paused campaign
      refuses new money, never payouts") walks the 27 instructions of the IDL with the pause on. The pause refuses
      exactly the opening, the join and the sealed entry (`sponsor_add_prize` is deferred); `admin_initialize_config`
      and `team_pause_entries` refuse for their own reasons, and the other 22 run, with the payouts moving their
      lamports. Only the admin resumes: `tests/brot/admin.test.ts`, "one team key pauses, only the admin resumes".
- [ ] Every opening by a team key raises an alert, and removing a team key through the multisig is rehearsed on
      devnet: a leaked team key opens for free (proposal §2.10 item 8).
- [ ] `content/powers.md` is updated with who holds each key, the multisig included, and the limit of each power.
- [ ] The incident plan exists, on one page: who pauses, who speaks for the house, where it is published, how fast,
      and who backs up the CTO on alerts. The site publishes it as the incident page (TP §3.6, BR-42).
      *Partly (2026-10-14):* `deploy/vps/runbooks/incident-plan.md` says who pauses (one team key), what the pause
      stops and what it never stops, who resumes (`admin`), what a team key can do in the window, and the record
      afterwards. Its **[F]** blanks are the founder's: who speaks, where and how fast it is published, who backs up
      the CTO, and the leader's proposed rule "pause first, investigate after". The site's page waits for them and
      for the two-person review of `content/`. **Answered on 2026-10-14 (Ronaldo):** Bernardo speaks for the house, then
      Lucas, then Ronaldo; "pause first, investigate after" is approved. The CTO's backup on alerts (Lucas or
      Bernardo), and where and how fast to publish, are left to the team, with a reminder.
- [ ] Every alert reaches two inboxes, and the review queue has a named reviewer per day (proposal §2.11; T22).
- [ ] `deploy/vps/README.md` says where each key lives and how to rotate it. No internet-connected key has power over
      money. The keeper's wallet sits in a key vault **[AC: which one]** (TP v0.0.1 §7, deferred to before mainnet).
      *Partly (2026-10-14):* the section "Where each key lives, and how to rotate it" lists every devnet key and
      secret with its place, power and rotation, and says why no internet-connected key moves user money. Still open:
      the key vault for the keeper's mainnet wallet **[AC]** and the place of the referral operations wallet.
- [ ] The domain, Cloudflare, the server and GitHub use hardware-key second factors; `main` has branch protection, or
      the carried-over decision below is recorded.
- [x] The mainnet values of the creation parameters are recorded: opening fee US$500, prize 9,000 bps, creator share
      100 bps, fee 1,000 bps, `min_entry_lamports` 10,000,000, `max_open_campaigns`, and the SOL/USD `max_price_age`
      and `max_price_conf_bps` for mainnet's cadence. **Done:** `deploy/mainnet/init-params.mainnet.json` (PR #85),
      each value with its source; `max_open_campaigns` 1,000, `max_price_age` 60 s, `max_price_conf_bps` 50 and
      `campaign_max_age` 30 s approved by the founder on 2026-10-13 (M-3).
- [x] A CI check proves the `mainnet` artifact carries the real review window and minimum duration, not the devnet
      drill constants (T12). **Done:** since PR #87 every CI run executes the `mainnet` build's own tests
      ("Mainnet build carries the real values") and runs LiteSVM on the mainnet binary itself: a campaign of 3 days
      minus 1 s is refused and a resolution opens a six-hour window, both failing on a drill build. The binary is
      published as `programs-mainnet-<sha>`.
- [ ] The release candidate is tagged, with commit and hash, and sent to both firms. The audit scope links
      Pinocchio's own audit report (TP §14.4 C38 [AC]).
- [ ] Each carried-over item below is done, or decided in writing with the reason.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

The `solana-verify` and attestation jobs in CI; the multisig, with the product chosen; the incident plan; the updated
powers table; the recorded mainnet parameters; the tagged release candidate.

## Out of scope

Audit fixes, terms and the country list (17). Any cap, global or per campaign (D-h). An accepted-account list (D-i).
New program features: after this sprint the program changes only by audit fix.

## Founder decisions that block the sprint

- The three signers' names (P4 §4.1). BP-12 (P-9, open) recommends the partners' written agreement first.
- The owner of the daily review and the CTO's backup on alerts (P4 §5.1, "sem dono").
- **D4** (proposal §5.2): a Pyth Hermes key (Starter, US$500 a month [E51]) before mainnet price campaigns, or the
  price kind waits on mainnet. Paid openings of the other four kinds need no key.
- **[Q]** If Sprint 14 or 15 is not ready: wait, or cut the candidate without it and audit it later (v0.0.1 roadmap
  rule).
- **BP-17** (P-9, open): the creation rules as a third mainnet item. This plan freezes them here either way.
- **Answered:** D-h (no cap), D-i (no list), D-o (Pinocchio).

## Agents and skills

- **Agents:** `technical-security-red-team-agent`, `devils-advocate-agent` (the incident plan), `coordinator-agent`.
- **Skills:** `multi-ai-review`, `secrets-discipline`, `secrets-scan`, `decision-log`, `plain-portuguese-explainer`,
  `release-check`, `sprint-management`, `codemap`.

## Security gates

- After this sprint the program changes only by audit fix.
- No multisig signature lives in a file.
- `secrets-scan` at closure, over the release candidate.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run build:program && bun run test && bun run test:rust
cargo fmt --all -- --check
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
solana-verify build                                            # twice; the hashes must match [AC: flags]
bun test tests/ -t "paused campaign refuses new money, never payouts"   # I10′ with every instruction
bun test tests/ -t "mainnet artifact carries the real constants"        # to add (T12)
node scripts/codemap.js --check && node scripts/os-self-test.js && node scripts/ci-secret-scan.js origin/main
```

The pause and resume rehearsal on devnet through the multisig. The team-key removal rehearsal.

## Carried over

From Sprint 00's security review (`docs/sprints/sprint-00-setup.md`; TP §7.1), re-read for Pinocchio and SOL:

- Attest the `.so`'s origin and reproduce its hash with `solana-verify` (above).
- Pin the SHA-256 of the Solana installer and of every tool CI downloads, and build the publishing artifact in a job
  without cache. The Anchor binary left with `pred-provable` in Sprint 03; the Shank and Codama tools take its place.
- Build and publish the `mainnet` variant under its own name (`brot_markets.mainnet.so`), with an IDL per cluster and a
  deploy script that checks the cluster first. The USDC address that Sprint 02 was to record is gone (D-a); the
  feature now holds only the real review window and minimum duration (T12).
- Replace or back the secret scan with `gitleaks` (`docs/technical/registry-pick.md`): base58 keys, URLs with
  credentials, hex secrets, binaries; add `*.keystore` and `*.jks` for the Android app (proposal §2.10 item 9).
- `CODEOWNERS` for `.github/`, `scripts/ci-secret-scan.js` and `.claude/hooks/`. Branch protection on `main` is not
  available to a private repository on the free plan: decide between a paid plan and a public repository.
- The `bun.lock` registry moved from npmmirror.com to npmjs.org at the opening of Sprint 02 (T15): confirm it stayed
  there.

From Sprint 01's review of the price reader (`knowledge-base/tecnologia/pyth-leitor-de-preco.md`, §1.8):

- Before mainnet, find out who controls the upgrade of Pyth's programs there (the authority PDA
  `6oXTdojyfDS8m5VtTaYB9xRCxpKGSvKJFndLUPV3V3wT`) and who holds the governance authority in the receiver's
  configuration. It now matters twice: for price campaigns and for the SOL/USD read that prices every paid opening.
  The risk is in TP §13.

## Risks

- The multisig product has no public wait for program upgrades (C11).
- The three signers are the three partners (P4 §4.1), so the multisig guards against one person, not against the
  company **[INF]**.
- The incident plan depends on one person (P4 §5.1).
- With no cap, a bug's loss has no ceiling: the audit, the multisig, the pause and the exposure alert are what is left
  (proposal §2.4.7).

## Expected artifacts

`.github/workflows/ci.yml`, `content/powers.md`, the incident plan and its page in `app/features/`,
`deploy/vps/README.md`, the commit and hash of the release candidate, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** verifiable build; 2-of-3 multisig; pause tested; incident plan; powers table; creation rules frozen.
- **Session log:** the multisig product chosen; the signers; the mainnet parameters and why; D4's answer for Pyth.

## Record and retrospective

**2026-10-13, the CI and supply-chain items (lane L16).** Built: `solana-verify build` twice from clean, in the image
pinned by digest, compared byte for byte with each other and with the tested binaries; every downloaded tool pinned by
SHA-256 (`scripts/ci/install-pinned.sh`); the publishing build without cache; the `mainnet` variant published apart as
`programs-mainnet-<sha>` with its own IDL copy and `SHA256SUMS`, built with the same feature list the T12 tests use;
gitleaks backing the secret scan; `CODEOWNERS`; the registry check on `bun.lock`; `[workspace.metadata.cli]` in
`Cargo.toml`; and the services' tests in CI (`bun run test` now runs `bun test tests/ app/ services/`: the keeper,
the API, the relay and the landing, 163 tests on this branch, which no CI step ran since Sprint 06, although
`docs/SPRINTS.md` §4 listed them; found by the referral lane on 2026-10-13). Checked locally: shellcheck, actionlint, the pinned installs (a wrong pin, a tampered cache and a wrong
version each fail), a local build byte-identical to CI's artifact of run 38352871035, the T12 tests on the mainnet
binary (and failing on a drill build), gitleaks over the 510 commits of history (clean). What only CI proves is in
`docs/technical/verifiable-build.md`; the first run on the branch is 38368538751.

**Blocked by the founder:** the provenance attestation (`actions/attest-build-provenance`) needs a public repository or
an Enterprise Cloud organisation; options: (a) make the repository public before mainnet, which `verify-from-repo` needs
anyway (recommended), (b) GitHub Pro (branch protection and CODEOWNERS, no attestation), (c) an Enterprise
organisation, (d) stay as is. Branch protection on `main` follows the same choice. **Answered 2026-10-13 (Ronaldo):
(a)**, the repository goes public before mainnet; the attestation job runs from then (making it public is his act).
The team-key opening alert is built and unit-tested, but was not seen on devnet: it fires for a team opening inside its
one-hour look-back, so it needs an opening by a team key during a run.

**The pre-freeze hardening (2026-10-14, lane L16P, branch `sprint-16-prefreeze`).** Built on Sprints 14 and 15
merged, it fixed the gaps the audit package found before the freeze (`docs/audit/SCOPE.md` §17):
- **O-3**, a money defect in Sprint 04's code, which the randomized test reproduced. A partial tally left the YES
  cut-off movable, so a join made after the proven touch could share the losers' pot. Now `tally_late_joins` refuses
  a YES price result until the proof window has passed (`CutoffNotFinal`, 6178). The reproduction is a permanent
  test that fails on the old binary (`tests/brot/prefreeze-partial-tally.test.ts`).
- **G-2**, the vault assertion. Each paying instruction checks the vault's change against the books, and the close
  checks the books are covered (`VaultWatch`); no amount changed.
- **G-16:** every refusal of the tally through the program, and its Join slots checked (`check_join_slots`; slot
  matrix 513 cases).
- **G-10:** the pause with all 27 instructions.
- **G-1:** the mutation plan covers `checks/close.rs`, `checks/paying.rs` and the new ids (11 of 11 cases killed).
- **The SDK's event search** reads every transaction version the cluster serves.

The checks: 1,100 TypeScript, 562 Rust and 564 mainnet tests; the fixed seed and 24 more (12 by the lane, 12 by the
lead); the Surfpool negative suite 513 of 513. **The adversarial review** (read-only, 2026-10-14) found that O-3's
claim holds: any later tally finds no earlier proof still fresh, since the cluster's clock never goes back along a
fork. It also found that G-2 freezes no legitimate payout (Split, OneSided, Refund, reserves, the share taken from the
fee, sealed fees, SOL sent by hand, dust and campaigns opened before the upgrade), and that no test was weakened. Its
findings go to a follow-up before the freeze:
- **High, off-chain:** the indexer, the API's history, the site's my entries and the team scripts read with
  transaction version 0, so one v1 transaction that names the program stops the indexer's refresh and aborts the
  team scripts. They should share the SDK's constant and skip an unreadable transaction without stopping.
- **Medium:** the SDK's recheck can miss a v1 resolve when it falls back to version 0, and the relay allows only 0.
  The recheck should also compare the event's publish time with the campaign's.
- **Low:** a moved cut-off keeps the first proof's `observed_value` (a false second-read mismatch). G-2 checks
  unbooked moves, not a wrong amount: a cap per payout from the snapshot would.
- **Info:** a rent rise above the SOL sent by hand would block a close for good; the keeper can tally a YES price
  result from the proof window on, not the review window's end; the pause test with a free opening.

**The follow-ups, fixed the next morning (2026-10-14)**, on the branch `sprint-16-followups`:
- **The readers (lane R):** one transaction-version constant in every reader. An unreadable transaction is counted
  and skipped, so it never stops the indexer, the API's history or the team scripts. The referral's payout scan stops
  and names it, since a skip there could pay twice. The resolve-event search says "incomplete" instead of returning an
  older event, and checks the publish time. The relay allows versions 0 and 1. Devnet serves v1 transactions: a real
  one is a fixture now.
- **The program (lane P2):**
  - the cap per payout from the snapshot (`PaidOutAboveSnapshot`, 6179), behind LiteSVM tests at every call site;
  - the close returning `min(rent, vault − held)`;
  - a cut-off move storing that proof's price;
  - the pause test with a team key's free opening, plus a static check of the two pause gates;
  - the keeper tallying a YES price result once the cut-off is final.

  1,134 TypeScript, 565 Rust and 567 mainnet tests; the fixed seed and 12 more; the mutation run on the changed ids.
  **A second adversarial review** read the program's follow-ups before the PR. No settlement the program can
  produce, in any mode or order, reaches the new cap, and the new close never pays out what the books owe. It left one
  Low and three Info, recorded in `docs/audit/SCOPE.md` §17 as S-5 to S-7, to fix before the freeze or send to the
  firms: a per-entry check behind the running cap, a stricter static test of the pause, and the rent rule in I14 and
  I15.

**The last changes before the freeze (2026-10-14, branch `sprint-16-prefreeze-3`).**
- **The per-entry check.** In `Split`, `settle_entry` checks each payout against its share of the stored snapshot
  (`EntryPayoutAboveShare`, 6180), and the keeper raises `settle_invariant` when a settlement is refused with 6101,
  6179 or 6180.
- **The pause test.** Every file that names the pause's field has its count pinned.
- **The unit files.** They read their credentials by the spelled-out path, since the server's systemd 249 drops `%d`,
  as the indexer's first start showed.
- **Checks.** 1,152 TypeScript, 568 Rust and 570 mainnet tests; the fixed seed and 12 more; the mutation proof of the
  new check (both of its tests fail when it is removed).
- **A third adversarial review.** No legitimate payout trips 6180. It left one Low, recorded as S-8 in
  `docs/audit/SCOPE.md` §17 for the founder to decide with the freeze: the snapshot's own inputs, which the cap and
  6180 trust. Its Info findings on the tests and the unit comment were fixed. The alert's step attribution in a batch
  stays as is (info).

**S-8 fixed before the freeze (2026-10-15, branch `sprint-16-s8-snapshot`), at Ronaldo's word ("sim vamos corrigir
isso").** At finalize the snapshot's totals are held to the campaign's books (6102). Each `Refund` and `OneSided` payout
is checked against the entry's own amounts (6181, 6182), and the per-entry `Split` check no longer shares the payout's
helper. The keeper alerts on the new refusals. Checks: 1,155 TypeScript, 575 Rust and 577 mainnet tests, 13 seeds,
the mutation proof of the three new markers; a read-only adversarial review before the PR.

**The freeze waits for the founders** (Ronaldo, 2026-10-14): the third-party prize (`sponsor_add_prize`, still
deferred) and the two audit firms are decided with the partners before the release candidate's tag. Until then the
audit package cites `8af10e2`, and by function the files the hardening rewrote; the freeze refreshes the lines at the
tagged commit and fills the candidate block (`docs/audit/README.md`).

Still open:
- the other event readers that ask for version 0 (the app's activity and my entries, the indexer, the API's history,
  the relay's allowlist);
- an operation in the randomized test that tallies only part of one baker's joins.

**Still to build here:** the team-key opening alert seen on devnet, and the team key's removal through the multisig;
`content/powers.md` with who holds each key (the founders' second review); the incident page on the site (the founder's
blanks first); a mainnet program id per cluster; then the release candidate's tag (the founder's go-ahead). **Outside parties:** the three signers' written agreement and three hardware wallets, hardware second
factors on the domain, Cloudflare, the server and GitHub.
