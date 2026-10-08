# Sprint 20 — Android app: design pass and skeleton (M-1)

**Status:** planned · **Branch:** `sprint-20-android-skeleton` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | M-1 (TP §3.7) |
| Depends on | Sprints 13 and 05 |
| Requirements covered | D-n (the Android app); BR-05 (public state from the SDK), BR-28 (wallet only, through MWA), BR-47 (notices); A-5, A-6, A-7; C-09, C-17 |

**Track B** (proposal §4.0). It runs after Sprint 13, only when the founder trades it against a named Track A item,
and never between Sprints 14 and 17, the audit path: the same three people do both tracks, and each extra devnet month
costs about US$5,500 (P2 §5.5). P4 §3.1 places the app after mainnet; building M-1 and M-2 on devnet earlier is the
proposal's option, and the release (Sprint 22) stays after Sprint 18.

**Entry** (proposal, Phase 3): X2 met for the flows the app mirrors; the SDK passed the React Native check of Sprint
05 (proposal §3.2); D4 covers a Seeker and one other Android phone; the founder made the trade.

## Goal

An Android app in `mobile/`, drawn from its own mobile design pass, that connects a wallet through Mobile Wallet
Adapter and shows the campaigns, a campaign page and "my entries" from the same `/api/v1` and SDK as the site. It
signs nothing yet.

## Definition of done

- [ ] **The app's design pass comes first.** The founder approved the app's screens (home, campaign page, joining,
      "my entries", the creation box, the re-check panel and the share button), drawn from Sprint -1's tokens and phone
      layouts at the Seeker's portrait width, about 400 to 460 CSS px **[INF]** (proposal §3.11), and on one other
      Android phone. `docs/product/DESIGN-DIRECTION.md` records them.
- [ ] `mobile/` holds the app: Expo with a custom development build (not Expo Go, since MWA is a native module),
      React Native, its own lockfile; Expo, the MWA packages, `solana-mobile` 0.5.0 and `dapp-store-cli` 1.0.1 pinned.
- [ ] MWA connects from a user gesture ("Use Installed Wallet") with Seed Vault Wallet, Phantom and Solflare. The chain
      comes from config, and a test asserts it equals `/api/v1/health.cluster` (X3.1). The icon is a relative path
      (proposal §3.4, rules 1, 2 and 9).
- [ ] Whether Seed Vault Wallet supports devnet is checked and recorded **[AC]** (proposal §3.6).
- [ ] Home, campaign page and "my entries" read `/api/v1`; public state comes from the SDK's `view` against
      `chain_time`, never the device clock (A-7).
- [ ] **App Links** for `https://brot.markets/c/{id}`: the site serves `/.well-known/assetlinks.json` with the app's
      certificate fingerprint **[AC]**. No custom `brot://` scheme (proposal §3.8).
- [ ] No WebView of third-party pages; outside links open the system browser (C-09).
- [ ] The app imports `@brot/sdk/read` and holds no copy of its math; its bundle holds no paid key. A CI check proves
      both (X3.4; A-5, A-6).
- [ ] A CI job bundles the SDK for Android through Metro and runs the Rust-generated math vectors in the app's test
      runner (proposal §3.2).
- [ ] The app, not the SDK, provides `crypto.getRandomValues` and, where Kit needs it, `crypto.subtle`; `bigint` works
      in the app's engine **[AC]** (proposal §3.2).
- [ ] **Keys (C-17):** the app builds locally (`expo prebuild` and Gradle) with no key present; `*.keystore` and `*.jks`
      are in the secret scan; a rotation note exists (proposal §2.10 item 9).
- [ ] The Android UI test tool is chosen and recorded **[AC]** (proposal §3.11).
- [ ] Every screen carries the devnet notice and "Programa ainda sem auditoria" (BR-47).
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The approved mobile design, recorded in the design direction.
- `mobile/`: the Expo development build, MWA connect, the three read screens, App Links.
- The CI jobs for the Metro bundle, the math vectors and the no-paid-key check.

## Out of scope

Joining and opening from the app (21). The store listing (22). iPhone, which stays on the website in wallet in-app
browsers (D-n). Push notifications (proposal §3.9: each option needs a founder decision and a privacy audit). Seeker
Genesis Token checks (proposal §3.7, not in the MVP).

## Founder decisions that block the sprint

- **The trade** (proposal §4.0): the named Track A item that M-1 is traded against.
- **D4** (proposal §5.2): a Seeker and one other Android phone.
- The approval of the app's design pass.
- L-01 (Product Brief v0.0.1 gap), which applies to the app's copy too.
- **Answered:** D-n (Android only, on the Solana dApp Store; iPhone through the website); D3, decided by D-n.

## Agents and skills

- **Agents:** `dev-product-agent` (scope against the site), `technical-security-red-team-agent` (MWA, keys, the
  bundle), `coordinator-agent`.
- **Skills:** `feature-scaffold`, `sprint-management`, `verify-build-works`, `secrets-discipline`, `secrets-scan`,
  `codemap`, `decision-log`.

## Security gates

- No paid key in the app (A-5); chain reads only through `/rpc`.
- The app never signs; the wallet does.
- No signing key, keystore or publisher key in the repository; the secret scan covers the new file types.
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
cd mobile && bun install --frozen-lockfile        # Expo, the MWA packages, solana-mobile 0.5.0, dapp-store-cli 1.0.1
bun test                                          # unit tests, including the Rust-generated math vectors
bun test -t "mwa chain equals the api cluster"    # to add (X3.1)
bunx solana-mobile doctor                         # JDK 17+, Android SDK
bunx solana-mobile device install fakewallet
bunx expo prebuild --platform android && (cd android && ./gradlew assembleDebug)
```

Connect and browse on the emulator with the fake wallet, and on a Seeker and one other Android phone.

## Risks

- A second front: every screen and copy change happens twice (proposal §3.3).
- MWA's React Native packages speak Kit 7-era types until MWA JavaScript v3 ships [E2][E3]; the app wraps them.
- Seed Vault Wallet may have no devnet mode; Phantom and Solflare on a Seeker are the fallback.
- The audience is unsized: no sourced figure exists for Seeker's install base or the store's traffic (proposal §3.1).
- Track B pulls people from Track A; hence the trade and the 14-to-17 exclusion.

## Expected artifacts

`mobile/` (app, lockfile, configuration), the updated `docs/product/DESIGN-DIRECTION.md`, the CI jobs, the rotation
note, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** the Android app's design pass and skeleton.
- **Session log:** the Track A item traded; the UI test tool; Seed Vault Wallet on devnet; what the design pass changed
  from the web.

## Record and retrospective

Filled in during the sprint and at closure.
