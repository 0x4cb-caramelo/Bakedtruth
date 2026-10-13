# Sprint 16 — Hardening (multisig, pause, incident plan, creation rules frozen)

**Status:** in progress; the CI and supply-chain items are built (2026-10-13); the rest waits for Sprints 14 and 15, the founder and the hardware multisig (see "Record") · **Branch:** `sprint-16-hardening` · **Dates:** none, by the founder's decision

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

- [ ] `solana-verify build` runs in CI and gives the same hash in two runs **[AC: its support for a Pinocchio crate
      built with `cargo build-sbf`]**.
- [ ] The `.so`'s origin is attested with `actions/attest-build-provenance` in a job of its own, and checked with
      `gh attestation verify` (every `gh` call passes `--repo 0x4cb-caramelo/Bakedtruth`).
- [ ] The 2-of-3 multisig exists, on hardware devices, with a public wait of 24 to 48 hours. On devnet it owns the
      upgrade authority and `admin` (by the two-step handover) and has made a test signature (T7; TP §14.4 C11 **[AC]**:
      a product with a public wait for program upgrades).
- [ ] **The creation rules are frozen (BP-17):** the release candidate carries `user_open_campaign` with the ten
      checks of TP §3.4.10, the Pyth-priced opening with `max_lamports`, the creator share per P-2, `VoidReason`
      with the 10% path (T23), and every creation parameter under its code ceiling. The audit's scope names each.
- [ ] **No cap:** the code has no `CapState` and no `max_pot`. The exposure alert (SOL held in all open vaults,
      proposal §2.11) fires in a devnet test, and so does the alert at 80% of `max_open_campaigns`.
- [ ] **The pause:** I10′ runs with every instruction of the version. Only `user_join_campaign`, `user_open_campaign`,
      the sealed entry and, if kept, `sponsor_add_prize` fail; resolution, payout and refund work with the pause on;
      only `admin` resumes.
- [ ] Every opening by a team key raises an alert, and removing a team key through the multisig is rehearsed on
      devnet: a leaked team key opens for free (proposal §2.10 item 8).
- [ ] `content/powers.md` is updated with who holds each key, the multisig included, and the limit of each power.
- [ ] The incident plan exists, on one page: who pauses, who speaks for the house, where it is published, how fast,
      and who backs up the CTO on alerts. The site publishes it as the incident page (TP §3.6, BR-42).
- [ ] Every alert reaches two inboxes, and the review queue has a named reviewer per day (proposal §2.11; T22).
- [ ] `deploy/vps/README.md` says where each key lives and how to rotate it. No internet-connected key has power over
      money. The keeper's wallet sits in a key vault **[AC: which one]** (TP v0.0.1 §7, deferred to before mainnet).
- [ ] The domain, Cloudflare, the server and GitHub use hardware-key second factors; `main` has branch protection, or
      the carried-over decision below is recorded.
- [ ] The mainnet values of the creation parameters are recorded: opening fee US$500, prize 9,000 bps, creator share
      100 bps, fee 1,000 bps, `min_entry_lamports` 10,000,000, `max_open_campaigns`, and the SOL/USD `max_price_age`
      and `max_price_conf_bps` for mainnet's cadence.
- [ ] A CI check proves the `mainnet` artifact carries the real review window and minimum duration, not the devnet
      drill constants (T12).
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
`Cargo.toml`. Checked locally: shellcheck, actionlint, the pinned installs (a wrong pin, a tampered cache and a wrong
version each fail), a local build byte-identical to CI's artifact of run 38352871035, the T12 tests on the mainnet
binary (and failing on a drill build), gitleaks over the 510 commits of history (clean). What only CI proves is in
`docs/technical/verifiable-build.md`; the first run on the branch is 38368538751.

**Blocked by the founder:** the provenance attestation (`actions/attest-build-provenance`) needs a public repository or
an Enterprise Cloud organisation; options: (a) make the repository public before mainnet, which `verify-from-repo` needs
anyway (recommended), (b) GitHub Pro (branch protection and CODEOWNERS, no attestation), (c) an Enterprise
organisation, (d) stay as is. Branch protection on `main` follows the same choice.

**Still to build here, after Sprints 14 and 15:** the pause (I10′) with every instruction; the exposure alert, the
80% alert and the team-key opening alert under test (the keeper lane is building them); `content/powers.md` (needs the
founders' second review); the incident plan and its page; where each key lives and how to rotate it; the mainnet
parameters (proposed in `deploy/mainnet/init-params.mainnet.json`, PR #85); a mainnet program id per cluster; the
pre-freeze fixes the audit package found (`docs/audit/SCOPE.md` §17); then the release candidate's tag (the founder's
go-ahead). **Outside parties:** the three signers' written agreement and three hardware wallets, hardware second
factors on the domain, Cloudflare, the server and GitHub.
