# Sprint 07 — Standby keeper and watchdog

**Status:** closed 2026-10-10 for the Hackathon MVP by the founder's decision; its open code items are built since
2026-10-13 (the alerts, the second read through RPC B, the two-keepers test, the Pyth watch) and merged with PR #88,
whose release `88a00f9` runs on the primary since 2026-10-13 19:03 UTC; the standby is not deployed. Not tagged:
blocked by D4 (the VM at a second provider with wallet 2, the RPC account at another company, the email provider), the
founder (the path unit, the tag) and the server owner · **Branch:** `sprint-07-standby-watchdog` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B6, second half (TP §3.5, §12) |
| Depends on | Sprint 06 |
| Requirements covered | BR-24 (in full), BR-25 (the review queue fed by the second read), BR-08 (the exposure alert) |

## Goal

If the primary keeper falls, the second takes over and the CTO knows. The standby runs at another provider, with
another wallet and another company's RPC, sized for a full takeover. It also re-reads every resolution through that
other RPC and puts any mismatch in front of a person, so that review happens by exception (T22).

## Closure (2026-10-10, founder's decision)

The founder closed this sprint for the Hackathon MVP. The primary's restart endpoint is live on the server (release
`cc87637`, PR #48, merged). Each Definition-of-done item is disposed of below; none is ticked that was not verified.

| Item | Disposition |
|---|---|
| Standby on VM 2, with wallet 2 and RPC B | **Deferred to Post-Hackathon** (D4). Code exists and is tested in-process |
| Takeover (watchdog, restarts, takeover) | Built and tested in-process. The live drill and the email are **Deferred to Post-Hackathon** |
| Continuous feed watcher | Built and tested in-process; a live run is part of the deferred drill |
| `POST /restart` (HMAC, flag, root path unit) | Endpoint **live on the primary**. The path unit is **not installed, by decision** (2026-10-10) |
| Tunnel ops host (`/healthz` and `/restart` only) | **Deferred to Post-Hackathon** (founder: no Cloudflare change now) |
| Liveness alerts: campaign idle 10 and 30 min | **Not built.** Carried to Sprint 13 or 16 (founder to confirm) |
| Keeper SOL floor alert | Built; journal only |
| Second read: RPC B and the proof transaction at `posted_slot` | Partly built: price campaigns, two providers, no proof transaction. The proof-transaction check and RPC B are carried (founder to confirm) |
| Other kinds in the second read | **Not built.** Carried to Sprint 14 |
| Alerts by email, to two inboxes | **Deferred to Post-Hackathon** (D4). The journal carries the alerts |
| "Two keepers change nothing twice" test | **Not built.** Carried to Sprint 14 |
| VM 2 snapshot ready (Sprint 08) | **Deferred to Post-Hackathon** (D4) |
| Drill on devnet | **Deferred to Post-Hackathon** (D4) |
| Runbook per alert in `deploy/vps/` | Done (eight runbooks and an index) |
| Carried over: Pyth receiver and push-oracle watch | **Not built.** Carried to Sprint 16 |
| Common closure: secrets scan, codemap | Done (secrets scan clean on the PR; codemap current) |

**Still open for the program:** Sprint 06 is not closed, and the standby code is untested against a live primary.
Sprint 06's real resolve was seen after this closure: the keeper resolved `FmDo…` on its own on 2026-10-11 at
15:59:17 UTC (`23agRJq8nJtzUjNy…`).

**After closure (2026-10-13).** PR #88, the carry-over of Sprints 06 and 07, merged as `88a00f9`. At Ronaldo's
request that release runs on the server since 19:03 UTC, under the existing unit and with `KEEPER_SETTLE=on`, after a
dry run on port 4239; it settled the two campaigns that were waiting (Sprint 06's "After closure" lists the
transactions). The standby, VM 2, wallet 2, RPC B and the email channel stay deferred (D4), and the new unit with its
own identity is not installed (the server owner). The primary read the public devnet RPC, which answered 429s, until
later that day, when its RPC became Helius devnet at Ronaldo's request (D4's choice of 2026-10-10).

## Definition of done

- [ ] `services/keeper/src` gains `watchdog.ts` and `alert.ts`; the same package runs with `KEEPER_MODE=standby` on a
      small VM at a second provider, with keeper wallet 2 (different from wallet 1, SOL only) and an RPC account at
      another company, sized for a full takeover. **Deferred to Post-Hackathon** (founder, 2026-10-10: no second VM,
      no second RPC now). The code path exists and is tested in-process.
- [ ] **The takeover** (BR-24; P1 §4.4): the watchdog checks the primary every 5 minutes; after 10 minutes without an
      answer it asks for a restart up to 3 times; then it runs the same loop itself and emails the CTO. Tested with
      the primary down.
- [ ] **The standby watches the price feeds of open price campaigns continuously,** since its 5-minute loop would
      miss every touch (proposal §2.5).
- [ ] **`POST /restart`** checks an HMAC-SHA256 over the timestamp and the body, writes a flag file, and a root-owned
      systemd `path` unit restarts the keeper. No service identity gains sudo. An unsigned or stale request is refused
      (test).
- [ ] The tunnel's separate ops host exposes only `GET /healthz` and `POST /restart` of the keeper on 4210, for the
      watchdog; any other path returns nothing (TP §5, §12).
- [ ] **On-chain liveness:** a resolvable campaign idle for more than 10 minutes, a settling campaign idle for more
      than 30 minutes, and a keeper wallet below its SOL floor each raise an alert.
- [ ] **The second read** (proposal §2.11): for a price campaign, the transaction that wrote the proof account at
      `posted_slot` is fetched through RPC B and compared on price, `publish_time` and account; for the other kinds,
      the metric account is re-read and compared with `observed_value`. A mismatch puts the campaign in the review
      queue (T22). Tested with a forged mismatch.
- [ ] **Alerts by email, to two inboxes** (**email part deferred to Post-Hackathon**, founder 2026-10-10: the MVP alert
      channel is the journal, `transports: journal`): primary down; standby took over; keeper SOL low; NO recorded with
      `met_late`; second read differs; a reserved credit older than 7 days; `open_campaigns` above 80% of
      `max_open_campaigns`; openings per hour above a threshold; any opening by a team key; SOL/USD older than
      `max_price_age` (paid openings blocked); the SOL held in all open vaults (the exposure no cap bounds); the Pyth
      receiver's or push oracle's upgrade slot or configuration changed.
- [ ] With both keepers on, the second call of the same instruction fails and nothing changes (test).
- [ ] VM 2 is ready to receive the nightly snapshot that Sprint 08 produces. **Deferred to Post-Hackathon** (D4).
- [ ] **Drill on devnet, without `/rpc` load:** `brot-keeper.service` stopped; the standby takes over within the
      timings above; the email reaches both inboxes (X1.2, first half). Sprint 08, which builds the relay, repeats the
      drill under `/rpc` load. **Deferred to Post-Hackathon** (D4): it needs VM 2 and the email channel.
- [ ] **A runbook per alert** in `deploy/vps/` says who acts, how, and how fast (proposal Phase 1).
- [ ] Each item of "Carried over" below is done, or decided in writing with the reason.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The standby mode, the continuous feed watcher and the watchdog, on VM 2 (S each).
- The remote restart, the second read feeding the review queue, and the alerts (S each).
- The second provider, the second RPC company and the email provider chosen (T5, within D4). **Deferred to
  Post-Hackathon** (founder, 2026-10-10).

## Out of scope

`reread_campaign` and `admin_decide_contest` on-chain (Sprint 14). Telegram alerts (phase 2). The incident plan, the
named reviewer per day and the keeper key custody before mainnet (16). The alerts fed by the indexer (08).

## Founder decisions that block the sprint

- **D4, decided 2026-10-10 by the founder, Hackathon MVP mode: Deferred to Post-Hackathon.** No second VM, no RPC
  account at another company (the proposal's Alchemy Free or QuickNode Build, US$49 a month), and the email provider
  is deferred; alerts go to the journal. This overrides v0.0.1's recommendation to buy now, for this sprint only.
  The standby code stays, unused in production, and the drill moves with it.

## Agents and skills

- **Agents:** `technical-security-red-team-agent` (the HMAC, the `path` unit, what wallet 2 can reach);
  `devils-advocate-agent` (two services with the same code share the same defect); `coordinator-agent`.
- **Skills:** `sprint-management`, `cost-watchdog` (the second VM, the RPC and the email), `secrets-discipline`,
  `secrets-scan`, `verify-build-works`, `codemap`, `decision-log`, `release-check`.

## Security gates

- Wallet 2 differs from wallet 1 and holds only SOL for network fees.
- The HMAC secret lives only in the two keepers' credentials. The public ops host exposes only `/healthz` and
  `/restart`.
- Email leaves from the second provider; the neighbouring project's mail server is not used.
- The drill stops only `brot-*` units. Anything beyond that needs notice to the other side.
- `secrets-scan` at closure.

## Tests

`bun test services/keeper -t "watchdog"` with the primary simulated as down; the drill on devnet with both machines.

```bash
bun test services/keeper -t "watchdog"
bun test services/keeper -t "restart refuses unsigned or stale requests"
bun test services/keeper -t "second read mismatch goes to the review queue"
bun test services/keeper -t "two keepers change nothing twice"
```

## Carried over

From the adversarial review of the price reader (`knowledge-base/tecnologia/pyth-leitor-de-preco.md`, section 1.8),
re-read against proposal §2.11.

- **The watchdog also watches Pyth.** The reader trusts an outside program, the receiver `rec2HH…`. The watchdog
  follows its last upgrade slot (data account `3UV7w2yTaqVcUAbWm1KUXdcE1Ziw8CfyyCpZvhKFkPfX`, the same on both
  clusters [F]) and its configuration (price source, minimum signatures). The approved proposal adds the push
  oracle's upgrade slot and configuration. If either changes, an alert fires and the team decides whether to pause
  price campaigns.

## Risks

- Two services with the same code share the same defect (high). The six-hour window and the void stay behind them.
- The daily review still has no owner (P4 §5.1): the alert arrives, but someone must act. A named reviewer per day is
  a mainnet criterion (Sprint 16).
- The alert email lands in spam. Reduces: two inboxes, and a test email at the drill.
- The CTO receives the alerts and has no backup person (K-08); before mainnet, every alert goes to two inboxes.

## Expected artifacts

`services/keeper/src/watchdog.ts`, `alert.ts`, the `path` unit and the alert runbooks in `deploy/vps/`, the VM 2 setup
notes, the README with the rotation of each secret, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** the standby keeper and watchdog; alerts by email; the second read and the review queue.
- **Session log:** the provider chosen and its cost; the drill's result.

## Record and retrospective

Written 2026-10-10, during the sprint. **Not closed:** most of the Definition of done is open (see the list above).

- **Done in the repository:** the standby mode with its send gate in `send.ts` (refused while the primary answers,
  tested before the rest); the watchdog and the takeover timeline (alert at the first miss, restarts at 10, 15 and 20
  minutes, takeover at 25); `POST /restart` with HMAC-SHA256, 60 s window, constant-time compare; the feed watcher for
  price campaigns; the second read of price campaigns with the review queue; the alerts, on the journal only; the
  systemd units and the runbooks, not installed. `bun test services/keeper`: 59 tests.
- **Done on this machine:** two real processes (primary and standby) against an unreachable RPC: the primary's
  `/healthz` and `POST /restart` answer; the standby with its primary down emits the alert chain and takes over.
- **Not done:** VM 2, the second RPC company, the email provider (all founder decisions, D4); the devnet drill with both
  machines; the alerts not yet wired (listed in the session log); the proof-transaction second read; the server's changes (the flag's
  `ReadWritePaths`, the tunnel route, the HMAC secret, the path unit). No server action was taken in this session.
- **Decisions taken without the founder:** recorded in `session-log/2026-10-10-sprint-07-standby-e-watchdog.md`
  (restart spacing, no automatic hand-back, journal-only alerts, the two-provider second read, the 0.5 SOL floor).
- **Retrospective (so far):** the gate is the rule that matters most, so it sits at the send and not in the loop. A
  second read that compares two providers is weaker than the one the proposal describes, and the sprint should say so
  rather than claim the stronger check.

### 2026-10-13, the carry-over (lane L07 of the lead's run, branch `sprint-07-keeper-carryover`)

Built and tested: every declared alert now fires, each with a runbook and a test (a campaign idle 10 and 30 minutes,
NO with `met_late`, 80% of `max_open_campaigns`, openings per hour, an opening by a team key, the exposure in the
vaults, a reserved credit older than seven days, a stale SOL/USD, a change in Pyth's programs, an unchecked second
read); an alert's own fields can no longer be overwritten by its detail (found by the indexer lane); the second read
fetches a price campaign's proof transaction at `posted_slot` through `RPC_B_URL` and compares its signed message with
what the campaign recorded (a forged price lands in the review queue), and re-checks the other kinds through the SDK;
two keepers at once: one lands, the other gets `AlreadySettled`, no lamport moves twice; the Pyth watch on the
receiver's and the push oracle's ProgramData. Open: the receiver's config account (its layout is unverified); the
standby's VM, wallet 2, RPC B and email (D4); the [AC] thresholds for the founder (exposure 100 SOL, 20 openings an
hour, sweep minimum 0.01 SOL, priority fee ceilings).
