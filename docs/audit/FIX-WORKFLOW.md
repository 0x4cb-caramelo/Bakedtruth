# How an audit finding becomes a fix

**Status:** written on 2026-10-13 for Sprint 17 (`docs/sprints/sprint-17-audit-fixes.md`). Items marked **[to decide]**
need the lead's or the founder's choice before the first finding arrives; items marked **[proposed]** are conventions
this document suggests where the repository has none yet.

## 0. Rules that hold for every fix

- **The freeze.** After the Sprint 16 release candidate is tagged, the program changes only by audit fix
  (`docs/sprints/sprint-16-hardening.md`, "Out of scope" and "Security gates"). No feature enters: "what enters after the
  audit was not audited" (`docs/sprints/sprint-17-audit-fixes.md`, "Out of scope"). A dependency upgrade, Pinocchio
  included, is a program change and needs a new review (`PINOCCHIO.md` §5).
- **Every fix passes the randomized test before it goes back to the firm** (Sprint 17, "Security gates"), and a fix that
  changes the program needs a new reading (Sprint 17, "Risks").
- **Mainnet waits for both reports** on the exact version, every serious finding fixed and confirmed (gate 6,
  `docs/SPRINTS.md` §4; TP §7 "Before mainnet").
- **House rules** (`CLAUDE.md`): one instruction and one reader per file, under 200 lines, a `Purpose:` header, checked
  math, the owner checked before any byte; error codes appended from 6153 and never reused (`src/error.rs:328`); enum
  variants appended, never reordered (`src/state/enums.rs:6-8`); `gh` commands pass `--repo 0x4cb-caramelo/Bakedtruth`.
  No secret, key or RPC URL with a key in a finding, a commit, a log or a report.

## 1. Intake

- **Channel [to decide].** The repository's root `SECURITY.md` describes the AI Dev Operating System, not this program
  (`SECURITY.md:3`), so the program has no written intake path. Before sending the package, agree with each firm on a
  private channel (for example a private GitHub security advisory on the repository, or the firm's own portal) and write
  it in the Sprint 17 file.
- **Finding id.** `<firm>-<n>`, with the firm's own number and a short lowercase slug per firm **[proposed]**: for
  example `poe-3` for proofofexploit.com (named in Sprint 17 as in negotiation, its name **[to verify]**), and the second
  firm's slug once it is named.
- **The register [proposed].** One row per finding, kept in `docs/audit/FINDINGS.md` (created with the first finding):
  id; firm; title; the firm's severity; our triage (§2); the `SCOPE.md` section it touches; status (`open`, `fixing`,
  `submitted`, `confirmed`, `acknowledged`); the fix branch, commit and binary hash; the firm's confirmation (date and
  words). Details of an unfixed serious finding stay out of public channels until it is fixed.
- **First reaction.** Re-read the finding against the frozen candidate, not against `main`: the firms read the tagged
  commit (README, release block).

## 2. Severity and triage

- The firm's severity is recorded as given. Our triage adds: the impact class (funds lost, funds locked, wrong outcome,
  griefing or liveness, informational); which money path (`SCOPE.md` §4–§16); and **whether the pause would contain
  it** — it would not for most: the pause stops only joins and openings (I10′, `SCOPE.md` §14), so a bug on resolution or
  payout keeps running while paused.
- **"Serious" [to decide].** Sprint 17 asks that "every serious finding" be fixed and confirmed. Proposed: critical, high
  and medium are serious; low and informational are fixed or acknowledged in writing with the reason.
- **A finding that meets a founder decision** (an accepted risk, `THREAT-MODEL.md` §6) is answered with the decision and
  its source. If the firm still rates it serious, it goes back to the founder, and the answer is recorded in the session
  log.
- **A finding already listed** in `SCOPE.md` §17 is linked to that item; the item then follows this workflow.

## 3. A reproducing test first

- Before any fix, write a test that **fails on the frozen candidate** and shows the finding. Its name starts with the
  finding id, so `bun test tests/ -t "<finding id>"` (the Sprint 17 test list) or `cargo test -p brot-markets --features
  no-entrypoint <finding_id>` runs it alone.
- Where it lives **[proposed]**: a transaction an attacker could send goes to LiteSVM against the binary,
  `tests/brot/audit-<firm>-<n>.test.ts`, named `"<firm>-<n>: <what the attacker does> is refused"`; a pure math or reader
  case to the host, `programs/brot-markets/tests/audit_<firm>_<n>.rs`; a hand-written check to Mollusk next to
  `tests/checks_mollusk.rs`.
- Record the red run: the command, the candidate's commit, and the failure output, in the fix's pull-request
  description and in the register. CI runs only the branch head, so the red run is the team's evidence that the test
  reproduces the finding.
- **If the finding is in a check** (`src/checks.rs`, `src/checks/`): the fixed check gets a `// X0.9 <id>` marker, a
  negative test per slot that reaches it (T24), and a row in `scripts/checks-mutation.mjs` (`PLAN`, and the file in
  `SOURCES` if it is new: `scripts/checks-mutation.mjs:26`, `:40-69`).
- **If the finding is about money:** add the scenario to the randomized test's operations or as a fixed case next to it
  (`tests/brot/invariant-ops.ts`, `tests/brot/invariant-program.test.ts`), so I1–I15 keep watching it.

## 4. The fix branch

- **Name:** `fix/audit-<firm>-<n>` (for example `fix/audit-poe-3`), following `.claude/rules/git-workflow.md`
  (`fix/<name>`). Cut it from the sprint branch `sprint-17-audit-fixes`; it merges back into that branch by pull request,
  and the sprint branch merges into `main` at the sprint's closure (the same rule file, "Merge discipline").
- **One finding per branch** where possible; a fix that closes several names every id in its commits.
- **Minimal change:** no refactor, no unrelated cleanup, no feature, no dependency bump unless the finding is the
  dependency.
- **Commit:** Conventional Commits with a Portuguese subject, like the history, ending with `[STAGE:CHEGADA]`; the id in
  the subject **[proposed]**, for example `fix(programa): … (poe-3) [STAGE:CHEGADA]`.
- **What a program change regenerates in the same branch:** the IDL and Codama client (`bun run idl`; CI fails on a
  stale IDL, `.github/workflows/ci.yml:121-128`); the slot matrix (`bun scripts/slot-matrix.ts`; CI check at
  `ci.yml:130-131`); the SDK's mirror when a rule or the math changes, since the SDK must refuse at least what the program
  refuses (A-10; `tests/sdk/validate-open-*.test.ts`, `tests/sdk/join-parity.test.ts`); the math vectors when the math
  changes (`tests/math_vectors.rs`, `tests/math_vectors_snapshot.rs`); `CODEMAP.md` (`node scripts/codemap.js`, in the
  same commit as the code).

## 5. The gates before the fix goes back to the firm

All of them, on the fix branch, recorded in the pull request:

1. **The standard checks** of `docs/SPRINTS.md` §4:

   ```bash
   export PATH="$HOME/.bun/bin:$PATH"
   bun run build:program && bun run test && bun run test:rust
   cargo fmt --all -- --check
   cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
   cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
   SBF_OUT_DIR=$PWD/target/deploy cargo test --locked -p brot-markets --features no-entrypoint,mainnet   # T12
   bunx tsc --noEmit && bun run lint
   (cd app && bun run lint && bun run build)
   node scripts/codemap.js --check && node scripts/os-self-test.js && node scripts/ci-secret-scan.js origin/main
   ```

2. **The reproducing test** now passes, and every earlier test still does.
3. **The seeded randomized invariant test, I1 to I15:** `bun test tests/brot/invariants.test.ts` (seed `0x0badc0de`,
   1,200 operations, `tests/brot/invariants.test.ts:16-18`). The seed is a constant in the file; for a money fix, also
   run a few other seeds by changing it locally, and record which **[proposed]**.
4. **The negative tests and the mutation proof:** `bun test tests/ -t "checks refuse"`; `cargo test -p brot-markets
   --features no-entrypoint --test checks_mollusk --test checks_mollusk_init`; the slot matrix,
   `bun test tests/brot/slot-matrix.test.ts`; and `node scripts/checks-mutation.mjs`, exit 0, whenever the fix touches
   `src/checks.rs`, `src/checks/` or a check's call site (after `SCOPE.md` gap G-1 is closed, the script also covers
   `checks/close.rs` and `checks/paying.rs`).
5. **The mainnet binary:** built by CI as `brot_markets.mainnet.so` with its `SHA256SUMS` and provenance attestation
   (Sprint 16 deliverables; README, note 1).
6. **`solana-verify build`**, run twice, gives the same hash, equal to CI's (Sprint 16 DoD; Sprint 17: "After the fixes,
   the standard checks, the seeded randomized test (I1 to I15) and `solana-verify build` pass").
7. **Review:** the `coordinator-agent`, plus an adversarial review by the `technical-security-red-team-agent`, since the
   fix touches money (`docs/SPRINTS.md` §4, common closure item 5; Sprint 17, "Agents and skills").
8. **CI green** on the pull request. A pull request in conflict with its base gets no CI run: merge the base in first.

## 6. Back to the firm, and its confirmation

- Send the firm that found it: the finding id; the fix commit (full SHA) and the diff or pull request; the reproducing
  test's name with its red output on the candidate and its green output on the fix; the new binary's SHA-256 and
  `solana-verify` hash; anything else the fix touched.
- **The firm that found the issue confirms the fix** (Sprint 17 DoD). Record its answer as given (date, who, words) in
  the register. Until it confirms, the finding stays `submitted`.
- **The other firm:** a fix changes code both firms read, so send it the same package **[to decide: how much of the
  change the second firm re-reads, and who pays for it]**.
- **Disagreement:** if the firm does not accept the fix, iterate on the same branch. If the team disputes a finding, the
  founder decides; the public report then shows it as acknowledged, with the reason.

## 7. The new release hash

- When every serious finding is confirmed: merge the fix branches into `sprint-17-audit-fixes`, then into `main` by pull
  request with CI green; tag the final audited version **[to decide: the tag's name]**; CI publishes
  `brot_markets.mainnet.so` with `SHA256SUMS` and its attestation; `solana-verify build` reproduces the hash.
- Record the tag, commit, binary hash, CI run and attestation in the register, in a "final" row of the README's
  release block, in `CHANGELOG.md` and in the session log.
- Each firm's report names that final commit and hash (Sprint 17 DoD: "Two reports on the exact version, with commit
  and hash"). The program deployed in Sprint 18 is that artifact, and `verify-from-repo` checks it
  (`docs/sprints/sprint-18-mainnet.md`, DoD).

## 8. The public report

- Both reports are published and linked from the site (Sprint 17 DoD). The notice "Programa ainda sem auditoria" leaves
  the site only once both are public (BR-47, Sprint 17 DoD).
- A finding acknowledged and not fixed is shown as such in the report, with the reason.
- Where the PDFs live in the repository and on the site **[to decide]**; the link and the notice change in the same pull
  request.

## 9. How the fix is recorded

- **`CHANGELOG.md`**, "Unreleased", in Portuguese like the rest of the file: one bullet per finding with its id,
  severity, what changed, its test and its commit.
- **`session-log/`**: one file per audit day or per batch of findings, named like the others
  (`session-log/YYYY-MM-DD-auditoria-<firm>-<topic>.md` **[proposed]**), with the finding, the reasoning, the alternatives
  rejected and the firm's confirmation; add it to `session-log/INDEX.md`.
- **The sprint file** `docs/sprints/sprint-17-audit-fixes.md`, "Record and retrospective": the list of findings and
  fixes.
- **The technical documents:** a fix that changes a rule updates the Technical Plan section that states it, and this
  package's `SCOPE.md` and `THREAT-MODEL.md` (the documentation-layers rule).
- **`CODEMAP.md`** regenerated in the same commit as the code (the codemap rule).
- The record rides in the fix's own pull request; no pull request is opened only to record it.

## 10. A finding that arrives after mainnet

Outside Sprint 17, the incident plan of Sprint 16 comes first. A team key can pause joins and openings at once; the
pause does not stop resolution or payouts (I10′), so a bug on those paths is contained only by an upgrade, which on
mainnet is a 2-of-3 multisig proposal with a public wait of 24 to 48 hours (TP §3.4.9). Whether the multisig product
allows a faster path for an emergency is Sprint 16's choice **[to verify]**. Then the same workflow, from §3.
