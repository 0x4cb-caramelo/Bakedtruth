# Sprint 07 — Standby keeper and watchdog

**Status:** planned · **Branch:** `sprint-07-standby-watchdog` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B6, second half (TP §3.5, §12) |
| Depends on | Sprint 06 |
| Requirements covered | BR-24 (in full), BR-25 (the review queue fed by the second read), BR-08 (the exposure alert) |

## Goal

If the primary keeper falls, the second takes over and the CTO knows. The standby runs at another provider, with
another wallet and another company's RPC, sized for a full takeover. It also re-reads every resolution through that
other RPC and puts any mismatch in front of a person, so that review happens by exception (T22).

## Definition of done

- [ ] `services/keeper/src` gains `watchdog.ts` and `alert.ts`; the same package runs with `KEEPER_MODE=standby` on a
      small VM at a second provider, with keeper wallet 2 (different from wallet 1, SOL only) and an RPC account at
      another company, sized for a full takeover.
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
- [ ] **Alerts by email, to two inboxes:** primary down; standby took over; keeper SOL low; NO recorded with
      `met_late`; second read differs; a reserved credit older than 7 days; `open_campaigns` above 80% of
      `max_open_campaigns`; openings per hour above a threshold; any opening by a team key; SOL/USD older than
      `max_price_age` (paid openings blocked); the SOL held in all open vaults (the exposure no cap bounds); the Pyth
      receiver's or push oracle's upgrade slot or configuration changed.
- [ ] With both keepers on, the second call of the same instruction fails and nothing changes (test).
- [ ] VM 2 is ready to receive the nightly snapshot that Sprint 08 produces.
- [ ] **Drill on devnet, without `/rpc` load:** `brot-keeper.service` stopped; the standby takes over within the
      timings above; the email reaches both inboxes (X1.2, first half). Sprint 08, which builds the relay, repeats the
      drill under `/rpc` load.
- [ ] **A runbook per alert** in `deploy/vps/` says who acts, how, and how fast (proposal Phase 1).
- [ ] Each item of "Carried over" below is done, or decided in writing with the reason.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The standby mode, the continuous feed watcher and the watchdog, on VM 2 (S each).
- The remote restart, the second read feeding the review queue, and the alerts (S each).
- The second provider, the second RPC company and the email provider chosen (T5, within D4).

## Out of scope

`reread_campaign` and `admin_decide_contest` on-chain (Sprint 14). Telegram alerts (phase 2). The incident plan, the
named reviewer per day and the keeper key custody before mainnet (16). The alerts fed by the indexer (08).

## Founder decisions that block the sprint

- **Open: D4** for the second provider's VM, the RPC account at another company (the proposal names Alchemy Free or
  QuickNode Build, US$49 a month) and the email provider. v0.0.1 recommended buying now rather than postponing the
  second service; that recommendation stands.

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

Filled in during the sprint and at closure.
