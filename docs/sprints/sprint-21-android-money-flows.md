# Sprint 21 — Android app: money flows on devnet (M-2)

**Status:** planned · **Branch:** `sprint-21-android-money-flows` · **Dates:** none, by the founder's decision

**Final state (audit of 2026-10-13):** blocked by Sprint 20 (and by the same trade). Push notifications need a founder decision and a privacy audit.

| | |
|---|---|
| Technical Plan block | M-2 (TP §3.7) |
| Depends on | Sprint 20 |
| Requirements covered | BR-01 (opening from the app), BR-07 (entries), BR-12 (lock notice), BR-23 (re-check), BR-28 (country switch in the app), BR-47 (notices); A-3, A-9; C-10 |

**Track B** (proposal §4.0), under the same rule as Sprint 20: only when the founder trades it against a named Track A
item, and never between Sprints 14 and 17.

## Goal

A baker joins and a creator opens a campaign from the Android app on devnet, through the same `@brot/sdk/tx`, the same
deterministic summary and the same retry guards as the site, and a full cycle ends with SOL in the wallet on a real
Seeker and on one other Android phone.

## Definition of done

- [ ] **Joining** goes through `@brot/sdk/tx`: re-read the `Campaign` and the `Entry`, simulate, show the deterministic
      summary (side, amount, estimate net of fee and creator share, `min_return_bps`, network) (A-3), and send with
      `expected_entry_total` through MWA's sign-and-send (proposal §3.6, flow F1). The mandatory notices of Sprint 11,
      the lock notice included, show before signing (BR-12).
- [ ] **Opening** goes through the app's creation box: the same `validateOpenCampaign`, the same Pyth-priced quote with
      `max_lamports`, the same preview struct and the same team-key path as the site (Sprint 19). No free text (D-j).
- [ ] **The retry guards (proposal §3.4 rule 9):** before the hand-off to the wallet, the pending-entry snapshot (the
      `Entry` read and the transaction's `lastValidBlockHeight`) and the opening's `id` are written to device storage.
      After process death or a frozen app, the app reads them back and offers no new send before that height passes.
- [ ] With `entries_allowed` false, the entry panel and the creation box hide; states and payouts stay visible (K-11).
- [ ] Every campaign has the report link the store asks for (C-10); its remedy is unlisting (proposal §2.7).
- [ ] The re-check panel and the share button (a plain intent link) work in the app; the devnet notices stay.
- [ ] **App end to end** on the emulator with the fake wallet, with the tool chosen in Sprint 20: join, open, both retry
      guards, the report link.
- [ ] **X3.2:** a full devnet cycle runs on a physical Seeker and on one other Android phone: connect, open a campaign,
      join, resolution, payout received in the wallet. If Seed Vault Wallet has no devnet mode, the cycle runs with
      Phantom or Solflare, and that is recorded.
- [ ] **X3.3:** process death or a frozen app while the wallet signs never yields a second entry or a second opening,
      shown on both devices.
- [ ] X3.1 and X3.4 still hold: the chain equals `/api/v1/health.cluster`; no paid key and no copied math in the bundle.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The join and opening flows in `mobile/`, with their retry guards.
- The app's end-to-end tests on the emulator.
- The device checklist for the Seeker and the other Android phone, with the cycle's evidence.

## Out of scope

The store listing (22). Mainnet: the app stays on devnet until Sprint 22. Push notifications through FCM, Web Push or
wallet alerts (proposal §3.9). The sealed entry and the added prize in the app.

## Founder decisions that block the sprint

- **The trade** (proposal §4.0), if M-1's trade did not cover M-2.
- **D4:** the devices, if Sprint 20 did not buy them.
- **[Q]** Push notifications in the app (FCM works natively on Seeker [E18]). Out of this sprint unless the founder
  decides, and then only with a privacy audit, because a device token ties a wallet to a device (proposal §3.9).
- **Answered:** D-n; P-5 (0.01 SOL minimum); P-3; D-j.

## Agents and skills

- **Agents:** `technical-security-red-team-agent` (what the wallet signs; process death), `bug-triage-agent`,
  `dev-product-agent`, `coordinator-agent`.
- **Skills:** `multi-ai-review` (the transactions signed from the app), `sprint-management`, `verify-build-works`,
  `secrets-scan`, `codemap`, `decision-log`.

## Security gates

- Every transaction is built by `@brot/sdk/tx` and summarised by deterministic code (A-3).
- No signing path outside the wallet; no paid key in the app (A-5, A-6).
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
cd mobile && bun install --frozen-lockfile && bun test
bun test -t "a retried entry survives process death"      # to add (X3.3)
bun test -t "a retried opening reuses its id"             # to add (X3.3)
bunx expo prebuild --platform android && (cd android && ./gradlew assembleRelease)   # local; signing stays offline
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

The emulator run with the fake wallet. The device checklist on the Seeker and the other phone, with the app killed
while the wallet is in front.

## Risks

- Android may stop the app's process while the wallet is in front [INF]; the snapshot written before the hand-off is
  the defence (proposal §3.4 rule 9).
- Seed Vault Wallet's approval (fingerprint or PIN, or a side-button double-tap) can be neither forced nor detected
  (proposal §3.6).
- The app and the site drift: one SDK (A-6) keeps the money right, but copy and screens change twice.

## Expected artifacts

`mobile/` (join and opening flows), the end-to-end tests, the device checklist with its evidence, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** joining and opening from the Android app on devnet.
- **Session log:** the wallet used for the device cycle; what process death showed; any difference from the site's
  flow and why.

## Record and retrospective

Filled in during the sprint and at closure.
