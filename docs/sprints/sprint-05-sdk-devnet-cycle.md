# Sprint 05 — SDK and the devnet cycle

**Status:** planned · **Branch:** `sprint-05-sdk-devnet-cycle` · **Dates:** none, by the founder's decision

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

- [ ] **The SDK split** (proposal §2.3; TP §3.2). The `read` entry point holds PDAs, codecs, the math mirror (fees,
      payouts, the creator share, the opening conversion and quote, the schedule), public state (`view`), the event
      decoders, `validateOpenCampaign`, `recheck`, the error messages and the constants. The `tx` entry point holds the
      transaction builders, simulation and the deterministic summary (A-3). A `dependency-cruiser` rule (pinned here)
      keeps the read path from importing `tx`. The read API's schemas join `read` in Sprint 08. The proposal and the TP
      name the package `@brot/sdk`; `packages/sdk/package.json` names it `@brot-markets/sdk` today [F]. The two names
      are aligned here, and the choice is recorded [AC].
- [ ] The SDK imports no React, Next.js, Node built-in or DOM API; `Buffer` comes from `buffer`. A lint rule fails if
      it does.
- [ ] **T9 is decided and recorded:** the Codama client generated from the Shank IDL, or hand-written codecs with a
      byte-for-byte test against the Rust serializer. Sprint 02's spike: Codama 1.11 renders Shank's IDL and
      round-trips in LiteSVM, but that IDL carries no events and no PDA seeds, which stay hand-written either way.
- [ ] **The decoder rules** (proposal §2.3) have tests: a failed transaction is skipped; only this program's events
      are accepted (signed by its event-authority PDA, or inside its own frame with `sol_log_data`); inner account
      indexes resolve through `loadedAddresses`; each event is keyed by signature, top-level index and inner index.
- [ ] **The TypeScript math replays the at least 10,000 Rust vectors** of Sprint 04 with no mismatch (X0.3).
- [ ] **`validateOpenCampaign` refuses at least every case the program refuses:** one test per refused case, fed to
      both (A-10; X0.7, SDK half).
- [ ] The opening quote turns US$500 into lamports from the Pyth SOL/USD account, with the `max_lamports` the creator
      signs (T25).
- [ ] `recheck(campaign, rpcUrl)` reads the same account through any RPC and returns the value the program recorded
      (BR-23).
- [ ] `view` computes the public state from chain time, never the device clock (A-7); one unit test per state.
- [ ] `errors` holds one message per program error code.
- [ ] **The React Native check** (proposal §3.2): the SDK ships ESM with `exports`; a CI job bundles both halves with
      Metro for Android and runs the math vectors under the React Native engine [AC: the tool, with no app yet]. What
      the app must polyfill (`crypto.getRandomValues`, `crypto.subtle`, `bigint`) is recorded.
- [ ] `@solana/kit` moves to 8.4.0 if a frozen install and the typecheck pass; otherwise the reason is recorded
      (`CLAUDE.md` gotcha). zod 4 is pinned.
- [ ] `tests/helpers.ts` uses the SDK. `app/lib` stops being the shared library; the old site keeps its copy until
      Sprint 09 [INF].
- [ ] **Deploy from CI's artifact** (TP §10, §12): downloaded by run id
      (`gh run download <run id> --repo 0x4cb-caramelo/Bakedtruth`), its `SHA256SUMS` checked; the program keypair
      taken from its backup outside `target/deploy/`; the deploy and `admin_initialize_config` in the same session,
      followed by `admin_set_team` (initialization leaves the team empty, so nobody can pause until then). The deploy
      refuses a keypair whose address is not the declared id (`crate::ID`: the event authority is derived from it,
      and every instruction fails at the event otherwise), and uses the upgradeable loader (v3), whose ProgramData
      `admin_initialize_config` reads: a loader-v4 or `--final` deploy can never initialize. The procedure is written
      in `deploy/`.
- [ ] `scripts/team/` opens (team key, free), confirms, voids, contests, pauses and sets the creation params; each
      person uses their own key. A void saves its public text under `content/void-log/` and passes that text's hash
      with the `VoidReason` (TP §3.4.7); Sprint 12 gives the record its public format.
- [ ] **`bun run smoke:devnet`, rewritten for SOL, exits 0 on a full cycle** (X0.2, manual at closure): a wallet
      outside the team opens a campaign and pays at the Pyth price; two wallets join YES and NO; the result is read;
      the window ends (drill constants or a team confirmation); the winners and the creator share are paid.
- [ ] On devnet, a retried entry fails on `expected_entry_total` and a retried opening fails on its `id` (X0.5).
- [ ] The opening preview shows the whole debit: `max_lamports` covers only what moves into the vault, and the two
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

`bun test` in `packages/sdk`, checked against the program; `bun run smoke:devnet` on the cluster. Filters to add in
this sprint:

```bash
bun test tests/ -t "sdk math matches rust vectors"
bun test tests/ -t "decoder rejects foreign, failed and duplicate events"
bun test tests/ -t "sdk refuses at least what the program refuses"
bun test tests/ -t "public state follows chain time"
bun run smoke:devnet                                   # exits 0 at closure (X0.2)
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

Filled in during the sprint and at closure.
