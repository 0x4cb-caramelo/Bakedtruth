# Sprint 22 — Android app: dApp Store release (M-3)

**Status:** planned · **Branch:** `sprint-22-android-release` · **Dates:** none, by the founder's decision

**Final state (audit of 2026-10-13):** blocked by Sprints 21 and 18, the company (as publisher), the lawyer's written review (L0), whether to block Brazil in the app (C-06, after L0) and a named owner of the store presence.

| | |
|---|---|
| Technical Plan block | M-3 (TP §3.7; TP §7, §8 for keys and privacy) |
| Depends on | Sprints 21 and 18; the company exists; L0, the lawyer's written review |
| Requirements covered | D-n (the Solana dApp Store as the only store); C-01 to C-17 (proposal §3.10); X3.5 |

**Track B** (proposal §4.0). It follows Sprint 18, where the BP puts the app (P4 §3.1).

## Goal

The Android app is listed on the Solana dApp Store, published by the company, pointed at mainnet, with every store
and legal item checked and the lawyer's written sign-off country by country.

## Definition of done

- [ ] Every C-item of TP §3.7 (C-01 to C-17, from proposal §3.10) is checked, with evidence or the reason it does not
      apply.
- [ ] **The publisher is the company (C-01):** 18+, KYC/KYB done; the publisher wallet, required for every later
      submission, is on hardware or offline **[AC]**; about 0.2 SOL is set aside for fees and ArDrive storage.
- [ ] **The lawyer has signed off in writing, country by country (X3.5; L0).** The answer to C-06 (block Brazil in the
      app?) and to C-07 (age) is built into the app.
- [ ] The app points to mainnet, and its MWA chain still equals `/api/v1/health.cluster` (X3.1).
- [ ] A privacy policy and an EULA; a deletion path for off-chain data; a plain statement that on-chain records are
      permanent (C-08).
- [ ] The store copy and the app's copy use the D-m vocabulary and none of the calls to action that Google's rules
      for this category restrict (C-13).
- [ ] **The listing assets (C-16):** a 512 × 512 icon, screenshots of at least 1080 px, a short description of at most
      30 characters, and a release APK signed with its own key, never a Play key.
- [ ] The release is built locally and signed on an offline machine; `apksigner verify` passes; the portal key is read
      from a file (proposal §2.10 item 9).
- [ ] The release is submitted with `dapp-store-cli` 1.0.1. Review takes 3 to 5 business days, and each release is
      minted as an NFT [E23].
- [ ] The site links the listing (`solanadappstore://details?id=markets.brot.app`, proposal §3.8).
- [ ] An owner is named for publishing and maintaining the app and for answering campaign reports (P4 §5.1, "sem
      dono").
- [ ] The app's install count is tracked as a KPI from the listing on (proposal §3.1).
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The signed release and its listing.
- The release checklist, with every C-item.
- The privacy policy and EULA for the app.

## Out of scope

Google Play and Apple's App Store, which are not planned (proposal §3.10). iPhone, which uses the website. Push
notifications (proposal §3.9). Any program change.

## Founder decisions that block the sprint

- **The company exists** (P4 §5.2), as the store's publisher (C-01).
- **L0** (proposal §5.2): the written review, country by country, including whether the store counts as a provider
  under MP 1.394's art. 21 for users in Brazil (proposal §3.10, L0 question 6).
- **[Q]** C-06: block Brazil in the app, after L0.
- **[Q]** The named owner of the store presence and of campaign reports (P4 §5.1).
- **Answered:** D-n (the Solana dApp Store only).

## Agents and skills

- **Agents:** `legal-compliance-agent` (drafts of the policy and the EULA; the C-items), `launch-agent` (the listing),
  `technical-security-red-team-agent` (signing and keys), `coordinator-agent`.
- **Skills:** `privacy-audit`, `release-check`, `secrets-discipline`, `secrets-scan`, `decision-log`,
  `sprint-management`.

## Security gates

- The signing key and the publisher wallet never touch a connected machine or the repository.
- **Personal data:** the app's privacy policy and any data path pass the `privacy-audit` skill before submission.
- `secrets-scan` at closure, with the keystore patterns.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
cd mobile && bun install --frozen-lockfile && bun test
bunx expo prebuild --platform android && (cd android && ./gradlew assembleRelease)   # local; no key present
apksigner verify --print-certs android/app/build/outputs/apk/release/app-release.apk
# on the offline signing machine; the App NFT must already exist in the portal [AC: flags]:
bunx dapp-store --apk-file app-release.apk --whats-new "…" --keypair "$OFFLINE_PUBLISHER_KEYPAIR"
```

The device checklist of Sprint 21, rerun on mainnet with minimum entries, before submission.

## Risks

- The store may remove the app at any time, with or without cause (C-04): the website stays the primary channel.
- MP 1.394's art. 21 obliges app-store providers to prevent prohibited products (K-14); the store may act on its own.
- A lost publisher wallet blocks every later release (C-01).
- The store publishes no per-country availability (C-05): all gating is ours.

## Expected artifacts

The signed release APK (outside the repository), the release checklist, the listing, the app's privacy policy and
EULA, the rotation note.

## Changelog and session log

- **Changelog:** the Android app listed on the Solana dApp Store.
- **Session log:** the lawyer's sign-off and its countries; the answer to C-06; who owns the store presence.

## Record and retrospective

Filled in during the sprint and at closure.
