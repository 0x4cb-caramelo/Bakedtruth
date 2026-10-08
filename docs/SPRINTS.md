# Brot Markets — Sprint roadmap

**Version:** 0.1.0 · **Status:** written at the founder's request ("faca o plano de implementacao. todo em ingles");
awaits the founder's review · **Date:** 2026-10-08 · **Wizard stage:** Phase 4, stage 4.4 · **Supersedes:** v0.0.1 (Portuguese,
approved 2026-10-05, kept in git history at commit `0b40554`)

This file says in what order the product is built, what each sprint delivers and what counts as done. It has no dates
and no durations: the founder asked for no deadline (D-r). What holds is the sequence, the dependencies and the
definition of done. Each sprint has a file in `docs/sprints/`.

**Sources.** The architecture proposal 0.4 (`docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md`, approved 2026-10-08),
the Technical Plan v0.1.0 derived from it (`docs/technical/TECHNICAL-PLAN.md`), BP v0.0.4 (`docs/business/`), and
roadmap v0.0.1.

**References.** `B3` is a block of the Technical Plan (TP §3.1); `M` is the Android app's block. `T3`, `Q4` and `C7`
are TP §14.2–14.4 items. `BR-xx` are the business requirements of the proposal's Appendix A (TP Appendix A carries the
same IDs). `D-a`…`D-t` and `P-1`…`P-9` are the founder's decisions of 2026-10-08 and the BP proposals (proposal §5.1);
`L0`, `D3`…`D8` are proposal §5.2. "P4 §3.3" is BP v0.0.4 Part 4, section 3.3. `L-xx` are design gaps of Product
Brief v0.0.1, cited only where they are still the live handle for an open question.

**Labels.** **[F]** fact read in a file or measured on-chain. **[FD]** founder decision. **[DP]** decision kept from
v0.0.1 or the approved proposal. **[Q]** founder question. **[AC]** to verify. **[INF]** inference.

## Summary for the founder

There are 24 sprints in seven groups: 00 and 01 are done, and 22 remain. The order is the one you asked for: the
program and the services on devnet, then the site, then mainnet. The Android app is a separate track.

| Group | Sprints | What comes to exist |
|---|---|---|
| 1. The pot program | 00 to 05 | The program that holds each campaign's SOL, charges the US$500 opening at the Pyth price, records entries, reads the result on-chain and computes what each wallet receives, with Brot's fee and the creator's 1%. At the end, a full cycle runs on devnet by script: a wallet opens and pays, two wallets join, the result is read, the window passes, everyone is paid |
| 2. The services | 06 to 08 | The service that resolves and pays on its own, on the server we have; a second one, at another provider, that watches the first and emails the CTO; and the one that keeps the history, the ranking and the points |
| 3. The design system | -1 | The Ledger² colours, fonts and components in light and dark, the screens redrawn with the new words, the screen that opens a campaign, and layouts for phones |
| 4. The site | 09 to 13, and 19 | The campaign list, the campaign page with joining, "my entries", the campaign states, the ranking, the notices and the box that opens a campaign. Sprint 13 closes the devnet MVP |
| 5. Before mainnet | 14 and 15 | Referral, the second read of a dispute, and the sponsor's sealed entry |
| 6. Security and opening | 16 to 18 | The 2-of-3 multisig, a tested pause, the incident plan, the creation rules frozen, the two audits with their fixes and, only then, real money |
| 7. The Android app (Track B) | 20 to 22 | The app's skeleton, its money flows on devnet, and its release on the Solana dApp Store |

**Four things to know.**

1. **The program is written with Pinocchio, not Anchor (D-o).** Anchor checked every account by itself; Pinocchio
   does not. Every check now lives in one module, and each has a test that fails if the check is removed. Anchor and
   the old program leave the workspace in Sprint 03.
2. **Everything is SOL (D-a), and opening a campaign costs US$500 in SOL, priced on-chain by Pyth (D-b, D-f).** 90%
   becomes the campaign's prize; Brot's 10% waits in the campaign's vault until the outcome. The opening, the fee and
   the creator's 1% are in the core (Sprints 02 and 04, D-l). No service or screen uses the program before the money
   test of Sprint 04 passes: it runs hundreds of random operations and checks, after each one, that no lamport
   vanished or appeared (I1–I15).
3. **The box that opens a campaign has its own sprint, 19,** after the campaign page (11) and before the devnet MVP
   closes (13); its screen is designed in Sprint -1, with phone widths (D8). **The Android app is Track B (20 to
   22):** it runs only when you trade it for a named Track A item, never during Sprints 14 to 17, and its release
   waits for mainnet, the company and the lawyer's written review.
4. **Mainnet only after both audit reports, with the serious findings fixed, and the 2-of-3 multisig** (P4 §3.4).
   There is no cap any more (D-h): a program bug has no ceiling, so these two criteria carry the whole weight. If one
   is missing, the opening waits.

**What this roadmap does not promise:** a date. Section 6 gives the smallest sequence that leaves something
demonstrable on devnet.

## 1. How to read

- **Numbers are not a calendar.** Sprints with no dependency between them can run together: 06 with 08; 14 with 15;
  -1 with any sprint up to 08. Sprint 19 runs after 11 and before 13 closes. Sprints 20 and 21 run after 13, only as
  Track B; 22 follows 18.
- **Names.** File `docs/sprints/sprint-XX-topic.md` and a branch of the same name, opened from `main`; commits carry
  `[STAGE:CHEGADA]`. Four files were renamed in v0.1.0: 10, 11 and 12 for the new vocabulary, and 18 because the cap
  left the mainnet criteria.
- **The Phase 4 documents.** BP v0.0.4 is the business base. Proposal 0.4 was approved on 2026-10-08 ("sim para
  todos"), and the Technical Plan v0.1.0 is derived from it. **Two Phase 4 documents are not aligned yet:** the
  Product Brief still describes USDC, a cap, team-only opening and the sponsor request, and the design direction has
  no creation screen and no layout below 700 px. Both are listed in TP §14.1; the design half is Sprint -1.
- **Agents and skills** named in the sprint files are only the project's own (`.claude/agents/`, `.claude/skills/`).

## 2. The sprints

**Status.** Sprints 00 and 01 are closed, with tags `sprint-00` and `sprint-01`. Sprint 01 concluded that Pyth serves
on devnet; the Surfpool read it asked for was not done and moved to Sprint 03. The next is 02. It starts after the
founder reviews this plan, and its first identifier waits for the D6 rename (section 5).

**Outside the roadmap: the provisional site.** At the founder's request, `brot.markets` serves `services/landing`: a
"coming soon" page with a waitlist, a privacy page and the decks at `/pitch` and `/pitch2`. It is not a sprint and
does not change the order. It took two Sprint 06 items early (Brot's own tunnel and the domain) and leaves when Sprint
09 puts the real site at the same address. It stores emails (TP §8.1). Three edits wait there, outside the sprints:
the D6 copy pass (title, meta tags, H1, lead, form label, privacy text); the `/pitch2` fee line, which still shows
3.5% of the pot (proposal §5.2, D1); and the deck's mainnet line, which still says "and a cap" and whose new wording
waits for the founder (BP index, "Slide").

| # | Sprint | TP block | Depends on |
|---|---|---|---|
| -1 | [Design system, the opening screen and phone layouts](sprints/sprint--1-design-system.md) | Prerequisite of B8 and M | 00 |
| 00 | [Setup](sprints/sprint-00-setup.md) (closed) | B0 | — |
| 01 | [Foundation: price reader proof](sprints/sprint-01-foundation.md) (closed) | B1 | 00 |
| 02 | [Pot core on Pinocchio: config, paid opening, vault, entries](sprints/sprint-02-pot-core.md) | B2 | 00 |
| 03 | [Readers and resolution; Anchor leaves the workspace](sprints/sprint-03-readers-resolution.md) | B3 | 01, 02 |
| 04 | [Window, settlement, payout, fees, creator share and invariants](sprints/sprint-04-settlement-invariants.md) | B4 | 03 |
| 05 | [SDK and the devnet cycle](sprints/sprint-05-sdk-devnet-cycle.md) | B5 | 04 |
| 06 | [Server and primary keeper (Bun check first)](sprints/sprint-06-keeper-server.md) | B6 | 05 |
| 07 | [Standby keeper and watchdog](sprints/sprint-07-standby-watchdog.md) | B6 | 06 |
| 08 | [Indexer, API, relay and points](sprints/sprint-08-indexer-api-points.md) | B7 | 05; 06 to publish |
| 09 | [Site: shell, theme and wallet](sprints/sprint-09-site-shell.md) | B8 | 05, 06, 08, -1 |
| 10 | [Site: campaign list](sprints/sprint-10-site-campaign-list.md) | B8 | 09 |
| 11 | [Site: campaign page and entry](sprints/sprint-11-site-campaign-entry.md) | B8 | 09, 10 |
| 12 | [Site: my entries and campaign states](sprints/sprint-12-site-my-entries-states.md) | B8 | 11, 06 |
| 13 | [Site: ranking, notices and copy (closes the devnet MVP)](sprints/sprint-13-site-notices-copy.md) | B8 | 12, 08, 07, 19 |
| 14 | [Referral and second read](sprints/sprint-14-referral-second-read.md) | B9 | 04, 07, 08, 12 |
| 15 | [Sponsorship: the sealed entry](sprints/sprint-15-sponsorship.md) | B9 | 04, 05, 12 |
| 16 | [Hardening (multisig, pause, incident plan, creation rules frozen)](sprints/sprint-16-hardening.md) | B9 (TP §7, §7.1) | 14, 15, 07 |
| 17 | [Audits and fixes](sprints/sprint-17-audit-fixes.md) | B9 (TP §7, §8) | 16 |
| 18 | [Mainnet](sprints/sprint-18-mainnet.md) | B9 (TP §7, §12) | 17 |
| 19 | [Site: open a campaign (the creation box, `/abrir`)](sprints/sprint-19-site-open-campaign.md) | B8 | 11, -1 |
| 20 | [Android app: design pass and skeleton (M-1)](sprints/sprint-20-android-skeleton.md) | M (TP §3.7) | 13, 05 |
| 21 | [Android app: money flows on devnet (M-2)](sprints/sprint-21-android-money-flows.md) | M (TP §3.7) | 20 |
| 22 | [Android app: dApp Store release (M-3)](sprints/sprint-22-android-release.md) | M (TP §3.7) | 21, 18; the company exists; L0 |

## 3. Dependency map

```
00 ──┬──▶ 01 ──┐
     ├──▶ 02 ──┴──▶ 03 ──▶ 04 ──▶ 05 ──┬──▶ 06 ──▶ 07
     │                                 └──▶ 08   (publishes on the server once 06 exists)
     └──▶ -1   (in parallel; does not wait for the program)

05 + 06 + 08 + (-1) ──▶ 09 ──▶ 10 ──▶ 11 ──▶ 12 ──▶ 13   (13 also waits for 07 and 19)
                                       │
                                (-1) ──┴──▶ 19   (closes before 13 does)

04 + 07 + 08 + 12 ──▶ 14 ──┐
04 + 05 + 12 ───────▶ 15 ──┴──▶ 16 ──▶ 17 ──▶ 18

Track B, only by trade with a named Track A item, never during 14 to 17:
13 + 05 ──▶ 20 ──▶ 21
21 + 18 + the company + L0 ──▶ 22
```

**How Sprint -1 fits "program first".** Sprint -1 does not read the program: it neither blocks Sprints 00 to 08 nor
waits for them. With one work front, it goes after 08. It is a prerequisite only of the site (09 to 13 and 19) and of
the app's design pass (20).

## 4. What holds for every sprint

**The six gates of the roadmap.**

1. **Money.** The randomized invariant test (I1 to I15, TP §3.4.13) passes in Sprint 04 before any service or site
   sprint uses the program. It runs again, extended, whenever a later sprint (14 to 17) changes the program.
2. **Keys.** No key in the repository. The `secrets-scan` skill runs at the closure of every sprint.
3. **Shared server.** Ports only on `127.0.0.1`, in 4200–4299. From Sprint 06 every unit runs under its own identity,
   with secrets loaded by `LoadCredential=` from root-only files, with the server owner's agreement (proposal §2.10).
   Restarts, `apt upgrade` and firewall changes only with notice to the other side. Nothing of the other projects is
   touched.
4. **Build.** The program is built only in GitHub CI (`cargo build-sbf`), never on the server. What goes to a cluster
   is CI's artifact, with its SHA-256 checked.
5. **Personal data.** The `privacy-audit` skill runs before closing Sprints 08, 13 and 17, and in any sprint that adds
   an off-chain write tied to a wallet (proposal §3.5 H1, §3.9).
6. **Mainnet** only after both audit reports on the exact version, with serious findings fixed, and the 2-of-3
   hardware multisig (P4 §3.4, K-12). There is no cap criterion.

**Common closure.** Part of every sprint's definition of done:

1. The standard checks below pass.
2. `secrets-scan` is clean.
3. `node scripts/codemap.js` was run, with `CODEMAP.md` in the same commit.
4. `CHANGELOG.md` is updated and the decisions are in `session-log/`.
5. The `coordinator-agent` reviewed the sprint; an adversarial review ran when the sprint touches money, keys or
   personal data.
6. The sprint file carries its final state and retrospective; merge into `main` and tag (`docs/sprint-system.md`).

**Standard checks.** Until Sprint 03 closes, both programs are in the workspace: `brot-markets` is built with
`cargo build-sbf` from Sprint 02, and `pred-provable` with `anchor build`.

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run build:program && bun run test && bun run test:rust
cargo fmt --all -- --check
cargo clippy --locked -p pred-provable --all-targets --features no-entrypoint -- -D warnings   # until Sprint 03
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
bunx tsc --noEmit && bun run lint
(cd app && bun run lint && bun run build)
node --test services/landing/tests/*.test.mjs                                                   # until Sprint 09
node scripts/codemap.js --check && node scripts/os-self-test.js && node scripts/ci-secret-scan.js origin/main
```

**What changes when Anchor and `pred-provable` leave (Sprint 03).** `bun run build:program` becomes `cargo build-sbf`,
the Shank IDL and the Codama client (or the hand-written codecs, T9), synced into `packages/sdk`. The `pred-provable`
clippy line goes. `bun run test:rust` runs `brot-markets` only. CI no longer installs the Anchor CLI, and the IDL check
compares the Shank output and the generated client. From Sprint 06, `bun test services/` joins the list.

## 5. Founder decisions that block sprints

Each decision appears once, at the first sprint it blocks. Answered ones are shown with the answer.

**Taken as approved with the proposal.** The founder approved proposal 0.4 "as is" ("sim para todos"). This roadmap
therefore takes three of its recommendations as approved: **D6** (rename the copy first, then the code and docs in one
PR, per the rename table of proposal §5.2), **D7** (option b: `StaleFeed` voids a price campaign whose feed went
stale), and **D8** (option a: a design pass for the creation screen in Sprint -1, at web and phone widths, and a site
slot after Sprint 11, which is Sprint 19). If the founder meant otherwise, Sprints 02, 03, -1 and 19 change. The
recommendations of TP v0.0.1 §14.2, which the founder approved as the working default on 2026-10-05, also stand, re-read for
SOL.

| Sprint | What needs an answer |
|---|---|
| 00 (closed) | **Answered 2026-10-05:** the Phase 4 documents approved; the go-ahead to bring in `upstream/main` |
| 01 (closed) | **Answered by the sprint:** Pyth serves on devnet, so the five kinds stay (P1 §4.2) |
| -1 | **Open:** which dark is official and which theme is the default (TP §3.6); the site language (L-01); whether a campaign shows the history of the YES/NO split and the activity (L-23); the text of the "money stays locked" notice (L-03); where the partner's seal and highlight go (L-24); the creator notice, drawn as BP-14 recommends (P-9); for closure, approval of the redrawn screens, the creation screen and the phone layouts included. **Taken as approved:** D8 |
| 02 | **Answered:** D-a, D-b, D-c, D-d, D-f, D-h to D-l, D-o; P-3 (the team and launch partners pay nothing and keep no 1%); P-5 (minimum entry 0.01 SOL); Q3 (both sides allowed; the first-baker exemption covers the first wallet's whole entry); Q12 (keys with Lucas and Ronaldo). **Taken as approved:** D6, before the first identifier. **Open:** confirm the reading that both hold team keys (Q12) |
| 03 | **Answered:** Q1 (B: any wallet may trigger resolution and payout; it chooses nothing); Q4 (a: the price proved on-chain within 60 s; maximum price age set per campaign, with a 30 s floor). **Taken as approved:** D7 |
| 04 | **Answered:** P-1 (no creator share on a void, in a one-sided pot or on the prize); P-2 (the share from the pot while winners stay whole, the shortfall from Brot's fee); P-4 (the prize returns to whoever opened; the 10% follows the cause); Q2, re-read for SOL (a credit below rent to an empty wallet stays reserved, and its owner can claim it from their own wallet); Q6 (the 10% waits in the vault, T23). **Open [Q]:** a campaign with no entry at all has no written rule (P1 §3.5); the program builds the one-sided treatment as a switchable default (prize back to whoever opened, the 10% kept) [INF]. **Open [Q]:** whether a `StaleFeed` void counts as a house failure once the keeper holds a Hermes key, which decides whether the 10% is refunded; the working default is an outside cause, the 10% kept [INF] |
| 05 | **Open:** which of Lucas and Ronaldo holds the devnet upgrade key on deploy day (Q12); the program-address keypair backed up outside `target/deploy/` (Sprint 00 review, founder action). **Answered:** Q10 falls away (devnet SOL from the faucet; no test USDC) |
| 06 | **Open:** D4 for the keeper's RPC account (Q8 is folded into D4); the server owner's agreement to per-unit identities (T13); P-7, for the monthly conversion half of the SOL runbook. If the Bun check on the server fails, D-p comes back to the founder before anything else. **Answered:** Q11 (domain bought, on Cloudflare); the Pyth Hermes key waits for measurement ("ok", 2026-10-05), and paid openings need no Pyth plan (D4) |
| 07 | **Open:** D4 for the second provider's VM, the RPC account at another company and the email provider |
| 08 | **Answered:** Q7 (1 point per campaign entered on the right side, for devnet); D-e (CoinGecko for display). **Open:** D4 for the indexer's RPC account and the CoinGecko plan (the free plan's commercial terms are unclear; paid plans require attribution) |
| 09 | **Open [Q]:** what happens to the waitlist, its twelve-month purge, its deletion form and the decks at `/pitch` and `/pitch2` when the landing leaves (TP §8.1, §14.2), and whether and when the waitlist gets its promised notice; turning off the Cloudflare zone's analytics injection, which waits for the founder's agreement (`CHANGELOG.md`). Needs L-01 and the default theme from -1. D-q is decided (the inherited chat route goes); Bun or Node 22 for the site is decided by the staging test (D-p), not by the founder |
| 10 | None new. Needs the partner seal's place (L-24) from -1 |
| 11 | None new. Needs L-03 and L-23 from -1, and the creator notice as -1 drew it (BP-14) |
| 12 | **Open:** the public contest channel (L-13); the public name of the state while a payout is paused (L-04); the "my entries" route name, with L-01 |
| 13 | **Open:** what the points are worth after devnet (L-09); the partner report's format and what happens to a partner who does not post (L-24); where the report link leads (with L-13); BP-5's wording, "no human picks the winner", and BP-11, the mascot's names (P-9); the thresholds of the three demand tests, before the devnet beta (P2 §2.5). The suggestions page of v0.0.1 (L-17) is gone: BP v0.0.4 dropped it (P1 §4.1) |
| 14 | **Answered:** Q9 (b: the 90 days start at the referred baker's first entry). **Open:** P-6 (rebate ceiling 0.05 SOL); L-14 (stage 2 before phase 1.2, and the second oracle, T8); who signs the weekly referral payout; D5 (attestation and screening: (a) on devnet, decide before 14, after L0); BP-9 (referral from day one on mainnet, P-9); where the referral balance shows (L-10); whether the 1% a referred baker pays in a one-sided pot counts toward the 20% |
| 15 | **Answered:** Q5 (a: a sponsor's sided entry follows the common rule); Q6; D-t. **Open:** may a third party add a prize to someone else's campaign (P1 §3.7; keeps or drops `sponsor_add_prize`); the sponsor perks and whether the sealed entry has the US$500 floor (BP-3, P-9); P-8 and the Cloak page (L-18); the sponsor screens (L-11) |
| 16 | **Open:** the multisig's signers (BP-12, after the three co-founders' written agreement); the owner of the daily review and the CTO's backup (P4 §5.1); whether to open without 14 or 15 (P4 §3.3); D4 for Pyth (keyed proofs for mainnet price campaigns need Hermes Starter, US$500 a month, or price campaigns wait); BP-17 (creation rules, the Pyth charge and the 1% in the audited version, P-9). The cap's first value is gone (D-h) |
| 17 | **Open:** timing, scope and version for the two audit firms, and the second firm's name; L0, the lawyer's written review (D-s), which gives the terms (L-21) and the country-block text (L-20); the SODAX page (L-18, P-8); the one-report exception, which lost its cap (BP "Nova": wait for both reports); whether terms acceptance is recorded when real money starts (C-12; needs H1) |
| 18 | **Open:** confirm both criteria; the company exists; L0 done; P-7 (treasury); the deck's mainnet line (BP "Slide"); whether the first mainnet cycle includes a paid opening. **Answered:** no cap (D-h) |
| 19 | None new. Needs the creation screen approved in -1 (D8) and L-01 for the sentence templates |
| 20 | **Open:** the trade of M-1 and M-2 against a named Track A item (proposal §4.0); D4 for a Seeker and another Android phone; the mobile design pass approved. **Answered:** D-n and D3 (Android only, on the dApp Store; iPhone through the website) |
| 21 | **Open [Q]:** push notifications in the app, only with a founder decision and a privacy audit (TP §3.7). Otherwise none beyond 20's trade |
| 22 | **Open:** the company exists, as publisher (C-01); L0, signed country by country (X3.5); whether to block Brazil in the app (C-06, after L0); who owns the store presence and answers campaign reports (P4 §5.1) |

**Still open at the proposal level:** L0, D4, D5, P-6 to P-9, and the BP's two "Nova" items (the one-report
exception; whether "nao lidaremos com tokenomics" also covers tokens A and B).

**One question worth asking now,** although it blocks only 17: the timing and scope of the two audits (P4 §4.1 found
neither). The answer says whether the core can be read before 14 and 15 are done.

## 6. The smallest demonstrable devnet sequence

No date. Three steps, each one demonstrable.

1. **00 → 01 → 02 → 03 → 04 → 05.** A full cycle on devnet, driven by script: a wallet outside the team opens a
   campaign and pays the US$500 in devnet SOL at the Pyth price, two wallets join YES and NO, the result is read, the
   window passes, the winners and the creator are paid. No screen.
2. **Plus 06.** Resolution and payout happen on their own.
3. **Plus 08, -1, 09, 10 and 11.** A person outside the team opens the site, sees the campaigns and joins one. With
   12, they follow it until paid; with 19, they open a campaign from the site.

Sprint 07 is not needed to demonstrate, but it is what fulfils the two-service rule (BR-24).

v0.0.1's Cloak track was a hackathon demonstration. With no hackathon (D-r) it leaves this section: Cloak and SODAX
wait for P-8; the Cloak page is in Sprint 15 and the SODAX page in Sprint 17 (BR-46).

## 7. Coverage: every requirement in some sprint

The BR-xx IDs are the proposal's Appendix A. Short names only; the full text is there and in TP Appendix A.

| BR | Requirement | Sprints | BR | Requirement | Sprints |
|---|---|---|---|---|---|
| 01 | Any wallet opens for US$500 in SOL | 02, 03, 05, 19, 21 | 25 | Six-hour window; two-stage dispute | 04, 07, 12, 14 |
| 02 | Creation rules in the program | 02, 03, 05, 19 | 26 | Creator may join, with a notice | 08, 10, 11, 19 |
| 03 | The creator's 1% | 04, 05 | 27 | Copy and product words | 09, 11, 13 |
| 04 | Opening 90/10; Pyth price; treasury | 02, 04, 06, 08, 18 | 28 | Wallet only; country switch | 08, 09, 11, 17, 20, 21 |
| 05 | YES/NO; five states; ≤ 90 days | 02, 03, 04, 05, 10, 12, 20 | 29 | Devnet beta with points | 08, 13 |
| 06 | Entries close at 5%; early resolution | 02, 03, 11 | 30 | Partner test report | 08, 13 |
| 07 | Repeat entries; minimum entry | 02, 11, 21 | 31 | Third-party creation test | 08 |
| 08 | No cap; mainnet after audit and multisig | 02, 07, 16 (17 and 18 through BR-40) | 32 | Public fee page; refund policy | 13 |
| 09 | Fee 10% of the losing side; net estimate | 02, 04, 05, 10, 11 | 33 | Growth motors | 10, 13, 19 (referral: BR-20) |
| 10 | One-sided pot | 04, 12 | 34 | KPIs without personal data | 08 |
| 11 | Void refunds; the 10% follows the cause | 04, 12 | 35 | Stop rule at 180 days | 08, 18 |
| 12 | No early exit; lock notice | 02, 11, 21 | 36 | Investor list never published | None: outside the system |
| 13 | Automatic payout in SOL; reserve path | 04, 06, 12 | 37 | Prize fund; treasury; buyback | After 18 (section 8) |
| 14 | SOL only | 02, 06 | 38 | Tokens A and B on hold | After 18 (section 8) |
| 15 | Fee split 25/75 | 04, 18 | 39 | Program rewritten in Pinocchio | 02, 03, 04, 05 |
| 16 | Sponsorship is the opening | 02, 15 | 40 | Mainnet after both reports and multisig | 16, 17, 18 |
| 17 | Neutral prize or sealed entry; Cloak | 15 | 41 | Public table of powers | 13, 16 |
| 18 | Sponsor perks | 15 | 42 | Pause; incident plan | 02, 04, 16 |
| 19 | Launch partners, 72-hour highlight | 02, 08, 10 | 43 | Treasury in SOL | 18 |
| 20 | Referral | 14 | 44 | Home-page ordering | 08, 10 |
| 21 | Five kinds; price by touch | 01, 03, 10, 11 | 45 | Every void records its reason | 04, 12 |
| 22 | Excluded kinds | 03 | 46 | Cloak and SODAX on their own pages | 15, 17 |
| 23 | Anyone can re-check | 03, 05, 11, 21 | 47 | Unaudited and devnet notices | 09, 13, 17, 20, 21 |
| 24 | Two scheduled services | 06, 07 | — | Android app (D-n); no AI (D-q) | 20–22; 09 |

Each sprint file lists the same IDs under "Requirements covered". Sprint -1 is left out of the table: it designs the
screens of BR-01, 02, 05, 09 to 12, 19, 23, 26, 27, 33, 44 and 47, and builds no rule.

**Every requirement has a sprint except three, by design:** BR-36 lives outside the system, and BR-37 and BR-38 come
after Sprint 18 (section 8).

## 8. What stays out of the roadmap

| What | Where it is |
|---|---|
| **Phase 1.2:** a contest opened by any baker, with a deposit, and internal arbitration; the Token-2022 reader and the locked-tokens kind | P4 §3.1; P1 §4.3 |
| **Phase 2:** early exit; sports, with an oracle of its own; Telegram alerts for operations | P1 §3.10, §4.3; P4 §3.1; proposal §2.11 |
| **Tokens A and B,** with staking, the vault and the bridge; whether "nao lidaremos com tokenomics" covers them is a "Nova" item | P3; proposal, the note after Phase 3 |
| **No phase set:** small-token prices, in three steps; the prize fund (from month 10) and buyback (from month 13); entries closing less than 24 hours before the deadline with a second team signature, once there is traffic | P1 §3.6, §4.3; P2 §4.6; proposal §2.4.2 |
| **Excluded by design:** outcomes a single key decides; opinion | P1 §4.3 |
| **No screen in the MVP:** a team panel (L-12, the team works through `scripts/team/`); notifications (L-16; app push only with a founder decision and a privacy audit); visit analytics | Proposal §3.9; TP §3.6, §8 |
| **Not before mainnet, or until a trigger:** Solana Actions and blinks (after L0); sign-in with a wallet (H1, only for an approved off-chain write); the Seeker Genesis Token; a paid Pyth plan on devnet; PostgreSQL, Redis and a gRPC indexer | Proposal §2.12, §3.5, §3.7 |
| **Only if the founder chooses it:** a backend attestation of each entry, or third-party wallet screening (D5 b or c) | Proposal §5.2 |

**Removed from v0.0.1's list:** the X suggestions page (P1 §4.1), the per-campaign cap and the revised global cap
(D-h), a test currency of our own (D-a), the sponsor request (D-t), and affiliates and a builder fee, which BP v0.0.4
no longer carries. Raising a cap by steps, a routine of v0.0.1, went with the cap.

## 9. Where the roadmap departs from the TP blocks

- **B6 became two sprints** (06 and 07): the second service depends on a purchase (D4). The server base stays in 06.
- **B8 became seven sprints:** -1 for the design, 09 to 13, one per part of the site, and 19 for the creation box
  (D8).
- **B9 is split.** New functions in 14 and 15; the multisig, the verifiable build and the frozen creation rules in 16.
  The founder can cut 14 or 15 (P4 §3.3) without taking security with them. Sprint 15 shrank to the sealed entry
  (D-t, proposal §2.4.8).
- **Referral and the second read share Sprint 14,** with separate criteria.
- **Audits and mainnet close B9.** Their criteria come from TP §7 and P4 §3.4, not from a program block.
- **Terms, the country block and SODAX sit in 17,** in parallel with the audit, because they do not touch the program.
- **The Android app is Track B (M, Sprints 20–22),** not a block of B0–B9 (proposal §4.0).
- **Three placements settle where the proposal contradicts itself** [DP]:
  - The pause instructions (`team_pause_entries`, `admin_resume_entries`) are built in Sprint 02, as in v0.0.1:
    opening check 8 and BR-42 need them there, though the proposal's instruction table lists them with Sprint 04.
  - The `bun.lock` registry moves to npmjs.org at the opening of Sprint 02, before the Codama spike adds npm packages
    (T15 says "before 05"; proposal §2.10 says before any new dependency).
  - The failover drill runs in Sprint 07 without `/rpc` load and is repeated under `/rpc` load in Sprint 08, which
    builds the relay (X1.2).
- **One placement is this roadmap's reading** [INF]: the alerts the indexer feeds are wired in Sprint 08.
- **Files renamed now.** The proposal's D6 table names Sprints 11 and 12's files with the site language (L-01);
  this roadmap renamed them now, and only the "my entries" route waits for L-01.

**Points the sources leave open, which the sprints name without choosing** [AC]: how a team key adds a prize (02; the
TP's working reading is that it pays like any wallet, with a zero share); the minimum target distance per kind, how
`StakeAtLeast` stays closed until a devnet YES, and how the epoch kinds meet the 3-to-90-day rule with no `deadline_at`
in the proposal's sketch (03); how a campaign leaves `Contested` before Sprint 14, and whether `close_campaign` waits
for a reserved creator share (04); the SDK package's name and whether the public devnet deployment carries the drill
constants (05); the sealed entry's shape, a flag on the join or an instruction of its own (15). The TP settles one more
as a working reading [INF]: a price campaign copies its maximum price age from `GlobalConfig`, so its creator does not
choose it. Two of v0.0.1's open points are closed: creation is tested in Sprint 02 with the price reader that exists
since Sprint 01, and the prize enters the pot through the paid opening, before Sprint 15.
