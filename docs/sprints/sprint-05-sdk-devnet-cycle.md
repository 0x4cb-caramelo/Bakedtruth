# Sprint 05 — SDK and the devnet cycle

**Status:** in review: the code is done, reviewed three times and verified locally; the devnet rows wait on the
founder (see "Record and retrospective") · **Branch:** `sprint-05-sdk-devnet-cycle`, stacked on PR #41 (Sprint 04, not merged) · **Dates:**
none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B5 (TP §3.2, §3.3, §3.4.14 for the decoder rules, §9, §10, §12; Appendix B) |
| Depends on | Sprint 04 |
| Requirements covered | BR-01 (the preview mirror and a paid opening on devnet), BR-02 (the SDK mirror of the creation rules), BR-03 and BR-09 (the math mirror), BR-05 (public state), BR-23 (`recheck`), BR-39 |

## Goal

Join the pieces. `packages/sdk` becomes the one library the site, the Android app, the services, the scripts and the
tests import (A-6), split into a read half and a transaction half. The program goes to devnet from CI's artifact, and a
full cycle runs there by script: a wallet outside the team opens a campaign and pays, two wallets join, the result is
read, the window passes, the winners and the creator are paid.

## Definition of done

- [x] **The SDK split** (proposal §2.3; TP §3.2). The `read` entry point holds PDAs, codecs, the math mirror (fees,
      payouts, the creator share, the opening conversion and quote, the schedule), public state (`view`), the event
      decoders, `validateOpenCampaign`, `recheck`, the error messages and the constants. The `tx` entry point holds the
      transaction builders, simulation and the deterministic summary (A-3). A `dependency-cruiser` rule (pinned here)
      keeps the read path from importing `tx`. The read API's zod schemas are a third entry point,
      `@brot/sdk/schemas`, never part of `read` (see the record). The proposal and the TP
      name the package `@brot/sdk`; `packages/sdk/package.json` names it `@brot-markets/sdk` today [F]. The two names
      are aligned here, and the choice is recorded [AC].
- [x] The SDK imports no React, Next.js, Node built-in or DOM API; `Buffer` comes from `buffer`. A lint rule fails if
      it does.
- [x] **T9 is decided and recorded:** the Codama client generated from the Shank IDL, or hand-written codecs with a
      byte-for-byte test against the Rust serializer. Sprint 02's spike: Codama 1.11 renders Shank's IDL and
      round-trips in LiteSVM, but that IDL carries no events and no PDA seeds, which stay hand-written either way.
- [x] **The decoder rules** (proposal §2.3) have tests: a failed transaction is skipped; only this program's events
      are accepted (signed by its event-authority PDA, or inside its own frame with `sol_log_data`); inner account
      indexes resolve through `loadedAddresses`; each event is keyed by signature, top-level index and inner index.
- [x] **The TypeScript math replays the at least 10,000 Rust vectors** of Sprint 04 with no mismatch (X0.3).
- [x] **`validateOpenCampaign` refuses at least every case the program refuses:** one test per refused case, fed to
      both (A-10; X0.7, SDK half).
- [x] The opening quote turns US$500 into lamports from the Pyth SOL/USD account, with the `max_lamports` the creator
      signs (T25).
- [x] `recheck(campaign, rpcUrl)` reads the same account through any RPC and returns the value the program recorded
      (BR-23).
- [x] `view` computes the public state from chain time, never the device clock (A-7); one unit test per state.
- [x] `errors` holds one message per program error code.
- [ ] **The React Native check** (proposal §3.2): the SDK ships ESM with `exports`; a CI job bundles both halves with
      Metro for Android and runs the math vectors under the React Native engine [AC: the tool, with no app yet]. What
      the app must polyfill (`crypto.getRandomValues`, `crypto.subtle`, `bigint`) is recorded.
- [x] `@solana/kit` moves to 8.4.0 if a frozen install and the typecheck pass; otherwise the reason is recorded
      (`CLAUDE.md` gotcha). zod 4 is pinned.
- [x] `tests/helpers.ts` uses the SDK. `app/lib` stops being the shared library; the old site keeps its copy until
      Sprint 09 [INF].
- [ ] **Deploy from CI's artifact** (TP §10, §12): downloaded by run id
      (`gh run download <run id> --repo 0x4cb-caramelo/Bakedtruth`), its `SHA256SUMS` checked; the program keypair
      taken from its backup outside `target/deploy/`; the deploy and `admin_initialize_config` in the same session,
      followed by `admin_set_team` (initialization leaves the team empty, so nobody can pause until then). The deploy
      refuses a keypair whose address is not the declared id (`crate::ID`: the event authority is derived from it,
      and every instruction fails at the event otherwise), and uses the upgradeable loader (v3), whose ProgramData
      `admin_initialize_config` reads: a loader-v4 or `--final` deploy can never initialize. The procedure is written
      in `deploy/`.
- [x] `scripts/team/` opens (team key, free), confirms, voids, contests, pauses and sets the creation params; each
      person uses their own key. A void saves its public text under `content/void-log/` and passes that text's hash
      with the `VoidReason` (TP §3.4.7); Sprint 12 gives the record its public format.
- [ ] **`bun run smoke:devnet`, rewritten for SOL, exits 0 on a full cycle** (X0.2, manual at closure): a wallet
      outside the team opens a campaign and pays at the Pyth price; two wallets join YES and NO; the result is read;
      the window ends (drill constants or a team confirmation); the winners and the creator share are paid.
- [ ] On devnet, a retried entry fails on `expected_entry_total` and a retried opening fails on its `id` (X0.5).
- [x] The opening preview shows the whole debit: `max_lamports` covers only what moves into the vault, and the two
      rents (3,901,440 lamports on devnet, Sprint 02) come on top.
- [ ] The negative tests, the slot tests and one paid opening run once on a real validator (Surfpool or
      `solana-test-validator`), since Mollusk 0.14 and npm LiteSVM 1.5 are not the cluster's runtime (Sprint 02
      review).
- [ ] `bun run seed:devnet`, rewritten, opens example campaigns with a team key, of the kinds that passed.
- [ ] **Checked on devnet and recorded:** a `StakeAtLeast` YES (or the kind stays closed); the SOL/USD account's age
      against `max_price_age`; an epoch turn; the real settle batch with self-CPI events and its compute cost (T3,
      C7); the rent of `Campaign` and `Entry`; the clock drift (C12).
- [ ] Whether the public devnet deployment carries the drill constants or the real ones is decided and recorded [AC].
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The SDK with both halves, its decoder, client, preview and `recheck` (M); the React Native check (S); the Kit bump
  (S).
- The team scripts, and `smoke:devnet` and `seed:devnet` rewritten for SOL.
- The program on devnet, with no cap.
- A note on what only a real cluster could check, in `knowledge-base/tecnologia/`.

## Out of scope

The service that resolves and pays on its own (Sprint 06): here, the script triggers everything. The indexer and the
read API schemas (08). The site (09). The Android app (20).

## Founder decisions that block the sprint

- **Open (Q12's remainder):** which of Lucas and Ronaldo holds the devnet upgrade key on deploy day.
- **Open (from Sprint 00's review, a founder action):** the program-address keypair backed up outside
  `target/deploy/`, before the deploy.
- **Answered:** Q10 falls away: devnet SOL comes from the faucet, and there is no test USDC.

## Agents and skills

- **Agents:** `dev-product-agent`; `technical-security-red-team-agent` (the deploy and initialization procedure; the
  deterministic summary); `bug-triage-agent`; `coordinator-agent`.
- **Skills:** `sprint-management`, `secrets-discipline` (devnet and team keys on the machine of whoever runs them),
  `secrets-scan`, `codemap`, `verify-build-works`, `decision-log`, `release-check`.

## Security gates

- The program is built in CI. Nothing built on a laptop or on the server goes to a cluster.
- The upgrade key goes neither to GitHub nor to the server.
- Whoever runs the initialization first becomes admin: deploy and initialize in the same session.
- `StakeAtLeast` opens no real campaign without a checked YES.
- No paid key in the SDK or any client bundle (A-5). `secrets-scan` at closure.

## Tests

`bun test tests/` (the SDK's tests are in `tests/sdk/`), checked against the program; the smoke on the cluster.
Filters to add in this sprint:

```bash
bun test tests/ -t "sdk math matches rust vectors"
bun test tests/ -t "decoder rejects foreign, failed and duplicate events"
bun test tests/ -t "sdk refuses at least what the program refuses"
bun test tests/ -t "public state follows chain time"
bun run smoke:devnet -- --cluster devnet               # exits 0 at closure (X0.2); without the flag it runs locally
```

## Carried over

From the security review that closed Sprint 00 (`docs/sprints/sprint-00-setup.md`; TP §7.1), re-read for the new
build.

- **Download the artifact by run id, never by name, and check `SHA256SUMS`.** Still applies, now to the
  `cargo build-sbf` artifact. Above.
- **Back up the program-address keypair outside `target/deploy/`** before the first deploy, and point the deploy
  command at the backup. Still applies; it is a founder action (above).
- **The SDK takes the program address from the IDL (`idl.address`).** Answered in Sprint 02: the Shank IDL carries it
  in `metadata.address`, and `tests/brot/idl.test.ts` checks it against the program id; keep it as the single source.

From Sprint 03 and its record, "Carried to Sprints 04 and 05" (`docs/sprints/sprint-03-readers-resolution.md`).

- **The devnet YES of `StakeAtLeast`**, and the reviewed change that turns the `stake-at-least` build feature on. Until
  then the kind stays closed in every build, and no key can open it.
- **The SDK's preview of the opening**: the 1% minimum distance, the far bound, the epoch's latest start and the
  params version, so a creator sees a refusal before signing. The feed list (Sprint 04) is part of the preview.
- **`smoke:devnet` and `seed:devnet` rewritten for the new program** (they still drive the frozen program's devnet
  deployment through `app/lib` until Sprint 09).

From Sprint 02's reviews (`docs/sprints/sprint-02-pot-core.md`, "Reviews"; 2026-10-08).

- **Measure before setting mainnet values:** a week of devnet SOL/USD age, confidence and cadence, and of
  `unix_timestamp` against wall time, recorded in `knowledge-base/`. The [AC] ceilings (price age 300 s, confidence
  100 bps) and devnet's 120 s are set from what it shows.
- **A runbook line for a Pyth migration:** the receiver, the push oracle and the shard are compiled constants, so a
  move by Pyth stops every price opening until an upgrade.

## Risks

- **A paid opening needs several devnet SOL:** 4.5758 SOL at the reference price of US$109.27, if devnet's SOL/USD
  account carries a similar price [INF]. The devnet faucet's per-request and rate limits were not read [AC]. Smoke
  runs and outside creators may stall on faucet SOL.
- The limits of the public RPC endpoint ("not intended for production") slow the smoke runs.
- No `StakeAtLeast` YES on devnet: the kind stays closed, and the other four go ahead.
- Kit 8.4.0 shipped once with unpublished sub-packages (`CLAUDE.md`); the bump waits for a clean frozen install.

## Expected artifacts

`packages/sdk/`, `scripts/team/`, `content/void-log/`, `scripts/devnet-smoke.ts`, `scripts/devnet-seed.ts`, the deploy
procedure, the devnet program address recorded, the note in `knowledge-base/tecnologia/`, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** the SDK; the first deploy of the program to devnet; the smoke cycle in SOL.
- **Session log:** T9's decision; who held the upgrade key on deploy day; the devnet checks and which kinds opened;
  the drill-constants choice.

## Record and retrospective

Written at the end of the sprint's work (2026-10-09), then corrected after three reviews (the night of 2026-10-09 to
10), before the pull request. A row of the Definition of done is ticked only when a test, a run or a record below
shows it. Decisions and their reasons: `session-log/2026-10-09-sprint-05-sdk-e-ciclo-devnet.md`.

**Base.** The branch starts from PR #41's head (`3f1ddcb`, Sprint 04, open with three green checks, not merged): this
sprint needs Sprint 04's settlement and vectors. The program's source did not change in Sprint 05 (only Rust test code:
the second vector generator), so the binary CI builds on `main` after PR #41 merges is the one this sprint tested.

**Evidence for the ticked rows**

| Row | Evidence |
|---|---|
| SDK split, name | `@brot/sdk` with `read`, `tx`, `schemas`, `idl` in `exports`; `bun run lint:sdk`: dependency-cruiser 18.4.0 (`.dependency-cruiser.cjs`) and the portability check. The zod schemas are a third entry (`@brot/sdk/schemas`), not part of `read`: zod 4's ESM build does not bundle under React Native 0.87.1's Babel preset (caught by the React Native check); `read` and `tx` may not import `schemas` at all, since the rules see direct imports only |
| No React, Next.js, Node or DOM | The SDK uses no `Buffer` at all. `tests/sdk/boundaries.test.ts` plants one violation of each of the nine dependency rules in a copy of the SDK and fails unless every rule fires; the portability check refused `window`, `Buffer`, `process`, `fetch`, `TextEncoder` and `setTimeout` on violations planted by hand |
| T9 | Decided: the Codama client; the event table and the PDA seeds written by hand and checked against the program's source (`tests/sdk/contract-*.test.ts`); the 22 builders equal to the kit's (`tests/sdk/builders.test.ts`) |
| Decoder rules | `tests/sdk/decoder.test.ts` on LiteSVM transactions in the RPC's shape: a forged event through another program is refused by the program (6016) and skipped; a failed transaction is skipped though it holds an event; an event inside a nested call and one whose authority is in a lookup table decode; keys are (signature, top-level index, inner index); duplicates collapse. `tests/sdk/decoder-shapes.test.ts`: the same rules whether the node writes indexes (`getTransaction`) or addresses (`simulateTransaction`); data longer than the largest event refused before base58 decoding. The seeds of the event authority sign only in `emit` (`tests/sdk/contract-source.test.ts`) |
| Math vectors | 24,000 rows (`math-vectors.csv`, Sprint 04, and `snapshot-vectors.csv`, new) with 0 mismatches, in Bun and on Hermes; about a sixth of the snapshot rows (one in three of the YES and NO ones) sit at the viability threshold. Mutation checks, run by hand (no script keeps them): the fee rounded down gave 6,954 mismatches; `>=` in the viability rule, 133 |
| `validateOpenCampaign` | `tests/sdk/validate-open-*.test.ts`: every refused case of the program's own tests that the SDK's builders can produce, fed to both (the closure review found five left out; `validate-open-extra.test.ts` adds them, and they agree): 37 distinct refusal codes, the same error, and the same stored charge when both accept. The slot and data-format refusals stay out: the builders cannot produce them |
| Quote, preview, debit | `openingQuote` (`price − conf`, `max_lamports` 1% above), `openingDebit` (the two rents and the fee on top); `tests/sdk/prepare.test.ts` and the smoke check them against the program to the lamport |
| `recheck` | `tests/sdk/recheck.test.ts` through a local RPC endpoint backed by LiteSVM: the burn, the stake pool and a price YES (its proof found through the event) equal to the recorded value, then the documented mismatch or `null` once the account moves, `consistent` when it moved the only way it can; the event found three pages deep, past malformed answers |
| `view` | `tests/sdk/view.test.ts`: one test per public state, with chain times decades from the machine's clock |
| `errors` | One message per code, from the IDL; `tests/sdk/contract-source.test.ts` against `error.rs` |
| Kit 8.4.0, zod | Kit `~8.4.0`: clean frozen install, typecheck and the 307 tests passed on it; zod 4.6.5 pinned |
| Test helpers on the SDK | `tests/helpers.ts` does not exist; the row maps to `tests/brot/setup.ts`, which decodes every event of every LiteSVM transaction through the SDK (the fields cross-checked for the 7 events the kit lays out; for Sprint 04's other 11, the discriminator and the size, against the Rust source), and `tests/brot/flows.ts`, which builds with the SDK. No script or test imports `app/lib` |
| Team scripts | `scripts/team/`, rehearsed (`bun run team:rehearse`, exit 0): every act simulated unsigned; the void's on-chain note hash equals the SHA-256 of the saved record, written as `.pending` until the ledger confirms |
| Whole debit | The smoke's preview: payment, `max_lamports`, both rents from the cluster, the network fee; the creator's debit equal to it |

**Open rows, and why**

- **React Native check:** passes locally (four runs; the last after the reviews' fixes: 24,000 vectors, 0 mismatches,
  `tx` with 39 exports, 44 s); the "Mobile bundle" CI job runs on this branch's pull request. Its tick will carry a
  caveat: CI runs the JavaScript on Hermes v0.13.0's VM (it reports 0.12.0), compiled by React Native 0.87.1's
  hermesc (Hermes 1.0.0); the bytecode itself ran once, by hand, on a 1.0.0 VM built from its tag.
- **Real validator:** `bun run validator:negative` exits 0 on Surfpool 1.5.0 `--offline` in a loopback-only namespace:
  373 slot cases, 50 refusals of `user_open_campaign` and `user_join_campaign`, one paid opening equal to the SDK. That
  is the row's letter, not its reason: Surfpool runs on LiteSVM, and the admin, resolve and settlement refusal suites
  did not run there. `solana-test-validator` 3.1.10 needs AVX2, which this machine lacks. A CI job on GitHub's runners
  is carried to Sprint 06.
- **Seed:** rewritten in SOL on the SDK and rehearsed locally (exit 0); the devnet run waits on the deploy, like the
  smoke.
- **Deploy, smoke and retries on devnet:** prepared (`deploy/devnet/README.md`) and rehearsed on the local cluster, not
  run: the founder has not chosen the deploy path. The deploy need not wait for this sprint's merge: CI's `main` build
  after PR #41 carries the tested binary, and `scripts/deploy/binding.ts` refuses a checkout whose program differs.
- **The devnet checks:** three are read-only (the SOL/USD account's age, the rents, the clock drift) and could run
  before any deploy; they wait on the founder's go-ahead to touch a cluster, which this session did not have. The epoch
  turn, the settle batch and a `StakeAtLeast` YES wait on the deploy.
- **Drill or real constants on devnet:** recommended real for this sprint (CI's default artifact; the smoke completes
  with them). Sprint 06's definition of done asks for the drill constants for X1.1, which takes a drill build with its
  own artifact, then an upgrade or a second program: to decide with Sprint 06.
- **Common closure:** the checks, the secret scan, the codemap, the changelog and the session log are done; the three
  reviews below are done and their fixes made; the merge and the tag are the founder's.

**Reviews** (read-only, file and line for each finding; reports summarized in the session log)

1. **Security red team, the SDK's money paths and the summary:** 1 High, 5 Medium, 11 Low, 6 Info, no Critical.
   Fixed, each with a test that fails without it: H1, a priority fee of any size behind a trusted summary (now bounded,
   counted and capped at 0.001 SOL by default); M1, `simulate` decoded no events from a real node (the decoder reads
   both shapes); M2, a retried join could add a second entry (`prepareJoin` takes the saved `expectedEntryTotal`); M5,
   the summary was not bound to the signed bytes (`summarizeMessage`); L1, L2, L3, L6, L8, L10, L11, I1, I6; and its
   out-of-scope Medium, the team scripts signed before simulating. In part: M3 (the summary names the campaign, the
   target in the feed's units, the creator, the price below which an opening is refused and its terms; account names
   wait on `content/account-names.json`, A-11) and L5 (`recheck` pages and survives malformed answers; a second RPC
   stays the reader's choice). Open: M4 (the deploy-slot check, A-8, planned for the site in Sprint 11; it belongs in
   the SDK, A-6), L7 (a second price source for the quote), L9 (one snapshot read), I2, I4, I5.
2. **Coordinator, the record:** approved with caveats. Its wording and contradiction findings are fixed in this file,
   the TP, the session log, `CLAUDE.md`, the README of the deploy and the Sprint 06 and 08 files; the five missing
   parity cases were added and agree; a join parity harness was added (`tests/sdk/join-parity.test.ts`: the SDK's
   estimate equals the program's to the basis point).
3. **Security red team, the deploy and initialization procedure** (the scope this sprint assigns): 4 Medium, 7 Low,
   2 Info, no Critical or High; the gates hold (only CI's artifact reaches the deploy command; initialization cannot be
   front-run; mainnet is refused whatever the flags say). Fixed: the run bound to the reviewed commit, the checkout and
   the IDL, and the binary's hash typed at `--execute` (F1); the admin proven by its key or typed (F3); the standings of
   the program id, its ProgramData and the config named before anything is sent, a funded config taken over (F4); an
   idempotent resume and a recovery table (F5); key files in no Git work tree, mode 600 (F6), never quoted (F7); the
   cluster's names (F8); the RPC's origin only (F9); the void log (F10); the CLI version and the server (F11); the
   drift (F13). Open for the founder: F2 (protect `main`; check the run's workflow file) and F12 (the program keypair's
   history), and the finding below.

**Findings that stay open**

- `team_confirm_result` and `team_void_campaign` run the finalize snapshot but emit no `CampaignFinalized`, which TP
  §3.4.3 and §3.4.14 promise: an indexer that follows events would miss the snapshot of team-finalized campaigns. A
  program fix (Sprint 04's code), carried to Sprint 08's file; it changes the events the smoke expects
  (`scripts/validator/cycle-settle.ts`).
- **Anyone can make the program id undeployable on a cluster.** Rehearsed on the local cluster: lamports sent to the
  ProgramData address of an id not yet deployed make `solana program deploy` fail for good ("Create Account ...
  already in use"), and no key can move them out. The id `6G2d…uVN` is public, so about 0.001 SOL could block it on
  devnet today and on mainnet later. The dry run names the case; the remedy is a new id. For mainnet: a fresh id kept
  unpublished until its deploy. For devnet: read that address's balance before deploy day (read-only).
- **Loader v3 stays the deploy path.** Agave's current feature set declares Loader-v4's enabling gate as
  `LoaderV4WasAbandoned11111111111111111111111` and holds no gate that stops new loader-v3 deployments (read on
  2026-10-09 from `anza-xyz/agave`, `feature-set/src/lib.rs`, branch `master`); the deploy review had flagged that, from
  memory, as a possible blocker.
- Sprint 04's deferred items stay open until after 2026-10-12, as the founder set them.

**Carried to later sprints:** to Sprint 06, the negative run on Agave's runtime (a CI job on `solana-test-validator`),
a week of devnet price and clock data (Sprint 02), the runbook line for a Pyth migration (Sprint 02, never written), and
`tally_late_joins` before confirm or finalize in the keeper's order; to Sprint 08, the `CampaignFinalized` fix and the
schemas entry point; to Sprint 11, the deploy-slot check in the SDK.

**Retrospective**

- What worked: replaying the program's own vectors and refusal tests through the SDK found no disagreement, and
  mutation checks showed the tests can fail. The React Native check paid for itself the first day: it caught zod.
- What did not: the first dependency-cruiser config excluded `node_modules`, so its package rules could never fire; it
  passed until a planted violation showed it. A rule is not tested until it has refused something, which is now a test.
- The fake simulator returned the shape the decoder read, not the shape a node returns, so the test agreed with the
  code instead of with the cluster; Kit's own types said otherwise. Fakes are written from the node's contract. The
  fix then dropped the program's error names, because Kit parses every RPC integer as a bigint; a new test caught it.
- Three reviews found what the tests could not: a summary that trusted any priority fee, a retry that doubled an
  entry, a deploy that took any green run and a program id anyone can block. Each fix came with its test or rehearsal.
- Two lanes ran in parallel (the React Native check; the deploy, team and smoke scripts) with disjoint files, and each
  claim was re-run here before it was recorded.
