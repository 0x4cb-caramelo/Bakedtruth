# Brot Markets — Technical Plan

**Version:** 0.1.4 · **Status:** v0.1.0, written on 2026-10-08 at the founder's request ("faca o plano de implementacao.
todo em ingles") from the architecture proposal 0.4 the founder approved that day ("sim para todos") and from BP
v0.0.4, merged into `main` with PR #35 on 2026-10-08; v0.1.1 aligns it with what Sprint 02 built and measured
(`docs/sprints/sprint-02-pot-core.md`, "TP to align"); v0.1.2 aligns it with what Sprint 03 built and to the founder's
answers of 2026-10-09 (`docs/sprints/sprint-03-readers-resolution.md`, "Record and retrospective";
`session-log/2026-10-09-respostas-do-fundador-e-mescla-da-sprint-03.md`); v0.1.3 aligns it with Sprint 04 (§3.4.18) and
v0.1.4 with Sprint 05 (§3.4.19) · **Date:** 2026-10-09 · **Supersedes:** v0.0.1 of 2026-10-05,
written in Portuguese, approved by the founder ("docs aprovados, podemos dar início"). Its last text, with §8.1, is in
git history at commit `2089b81` (`git show 2089b81:docs/technical/TECHNICAL-PLAN.md`), the last commit that changed it;
`0b40554`, the `main` before v0.1.0, holds the same text; tag `sprint-01` holds it before §8.1 was added

**Sources.** The architecture proposal 0.4 (`docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md`), the primary source; TP
v0.0.1, the base design the proposal builds on; BP v0.0.4 (`docs/business/BUSINESS-PLAN.md` and its four parts); the
founder's words of 2026-10-08 (`docs/business/ideacao-perguntas-e-respostas.md`, "Decisões de 8 de outubro de 2026");
the closed Sprints 00 and 01 (`docs/sprints/sprint-00-setup.md`, `sprint-01-foundation.md`); the code as it stands
(`programs/brot-markets`, `programs/pred-provable`, `packages/sdk`, `services/landing`, `app/`). External sources keep
the proposal's IDs, E1 to E81, plus E82 and E83 for two sources TP v0.0.1 relied on (Appendix C).

This plan says how the product is built. It does not decide business rules: those come from BP v0.0.4 and from the
founder. Section numbers follow v0.0.1 where they can, because the sprint files and the proposal cite "TP §3.4.x". The
founder reads the summary below and section 14.2.

**Labels.**
- **[F]** fact read in a file (the path is given) or measured on-chain.
- **[FD]** founder decision: D-a to D-t and P-1 to P-5 of 2026-10-08, earlier decisions the BP keeps, and the answers
  carried over from v0.0.1 §14.2 (Q1 to Q12, except Q8, which is open inside D4). Since v0.1.1 also D6 and C44 as
  Sprint 02 built them, which the founder took as decided in PR #35 (§14.2). Since v0.1.2, the founder's answers of
  2026-10-09 (§14.2). Not reopened here.
- **[DP]** decision of this plan, kept from v0.0.1 or from the approved proposal.
- **[NEW]** new in v0.1.0 and in neither source. Each one carries its reason.
- **[Q]** needs the founder (§14.2). **[AC]** to verify (§14.4). **[INF]** inference.

**Short names.**
- BP = BP v0.0.4; P1 to P4 = its four parts; "P1 §3.4" = Part 1, section 3.4. "BP-14" = decision 14 of v0.0.3's list
  of nineteen; those still open are carried in P-9.
- "Proposal §2.4.5" = a section of the architecture proposal 0.4. "v0.0.1 §3.4.4" = a section of the previous TP.
- D-a to D-t = the founder's decisions of 2026-10-08 (proposal §5.1). P-1 to P-9 = the BP's proposals, of which P-1 to
  P-5 are decided. L0 and D3 to D8 = the proposal's decisions (proposal §5.2). Q- and T-items = §14.2, §14.3. C1 to C50
  = items to verify, §14.4; C-01 to C-17, with a hyphen, = the Android app's compliance items, §3.7.
- K-01 to K-20 (constraints), Z0 to Z5 (trust zones) and A-1 to A-11 (architecture invariants) keep the proposal's
  numbers. X0.1 to X3.5 = the exit criteria of the proposal's Phases 0 to 3 (proposal §4), cited where a test or check
  meets one. BR-01 to BR-47 = requirements, Appendix A. E1 to E81 = external sources, Appendix C, with E82 and E83
  added by this plan.
- L-xx = a gap of the Product Brief v0.0.1, cited only where it is still the live handle of an open design question. The
  Product Brief predates BP v0.0.4 (it still has USDC, the cap, team-only opening and the sponsor request) and is
  revised later; its rule and flow numbers are not current rules.
- "The program" = `programs/brot-markets`, crate `brot_markets`, program id
  `6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN` [F]. US$ values of SOL use US$109.27 per SOL (CoinGecko,
  2026-10-08 15:29 UTC, D-e) [E80]. They are display examples: the program charges at the Pyth price.

**Vocabulary (D-m).** Brot Markets runs **On-Chain Campaigns** ("campaigns"). A campaign asks one YES/NO question that
an on-chain account answers. A **baker** is a wallet that joins it; what it puts in is an **entry**; the **creator**
opened it; the winning side splits the **pot**; the **prize** is the neutral 90% of the **opening** payment, and the
**opening fee** is Brot's 10% of it. Code identifiers follow the D6 rename table (proposal §5.2).

## Summary for the founder

**What gets built.** One program on Solana holds every rule that moves money. A few small services call it and copy
what it records. A website shows it, and later an Android app. Everything is in SOL. Any wallet opens a campaign by
paying US$500 in SOL: the program reads the SOL price from Pyth at that moment, puts 90% into the pot as a prize and
holds 10% for Brot until the campaign ends. Bakers join YES or NO. The program reads the answer from the chain. After
the six-hour window, the SOL goes straight to the winners' wallets, minus Brot's 10% of the losing side and the
creator's 1%, as you decided.

| Piece | What it does | Where it runs |
|---|---|---|
| The program (`brot_markets`, written with Pinocchio) | Keeps each campaign's SOL in its own vault; charges the opening at the Pyth price; records entries; reads the answer from the measured account; computes and sends every payout | Solana: devnet now, mainnet after Sprint 18 |
| Primary keeper | Every minute: resolves what can be resolved, ends the six-hour window, pays out in batches, retries what could not be paid | The shared server (Hostinger), on Bun |
| Standby keeper and watchdog | Checks the primary every 5 minutes, restarts or replaces it, re-reads results through another provider, emails the CTO | A small machine at another provider |
| Indexer and read API | Copies what the program recorded into a small database; serves lists, history, ranking, points and the SOL price shown on screen | The shared server |
| `brot-rpc` relay | Lets browsers and the app reach the chain without a paid key | The shared server |
| The website | The Ledger² screens, the box that opens a campaign, the share card, the re-check panel | The shared server, behind Cloudflare |
| The Android app | The same backend with its own screens, signing through the wallet, on the Solana dApp Store | Phones; Sprints 20 to 22 |
| Team scripts and `content/` files | Team operations, partner links, account display names, the void log | Team machines; Git |

**What it rests on.** Your decisions of 2026-10-08: SOL only (D-a). The US$500 opening, 90% prize and 10% Brot (D-b),
charged at the Pyth price read on-chain, with CoinGecko only for display (D-e, D-f). The team and the 20 to 30 launch
partners open free and keep no 1% (D-c, D-d, P-3). The creator's 1% comes from the pot, and from Brot's fee only so
that winners never get back less than they put in (D-g, P-2); there is none on a void, in a one-sided pot or on the
prize (P-1). On a void or a one-sided pot the prize returns to whoever opened, and the 10% follows the cause (P-4). A
0.01 SOL minimum entry (P-5). No cap (D-h). No list of accepted accounts (D-i), except that a price campaign may name
only a feed on the program's own compiled list (founder answer 1, 2026-10-09; the narrowing applies to the price kind
only, the other kinds are unchanged). No free text (D-j). The minimum
opening rules (D-k). Pinocchio (D-o), Bun (D-p), no AI (D-q), no deadline (D-r), the Android app (D-n). The answers
you approved with v0.0.1 still hold where SOL did not change them (§14.2).

**Taken as approved with the proposal.** The proposal's recommendations for **D6** (rename the copy first, then the
code and documents in one pull request, per its table), **D7** (option b: a price campaign whose Pyth feed went stale
before the deadline is voided as `StaleFeed`, not resolved NO) and **D8** (option a: a design pass for the creation
screen in Sprint -1, at web and phone widths, and a site slot after Sprint 11, which is Sprint 19) are read as approved
with your "sim para todos" of 2026-10-08. This plan says so only here. If you meant otherwise for D7 or D8, say so: D7
changes the price reader in Sprint 03, and D8 Sprints -1 and 19. D6 is built, and you took it as decided in PR #35
(§14.2).

**What changed from v0.0.1.** USDC is gone: vaults hold SOL and pay wallets directly (§3.4.4, §3.4.5). Pinocchio
replaces Anchor, so every account check the framework made is now written by hand, in one module, with a test per check
(§3.4.17). Any wallet opens, inside rules the program checks; the two-person team approval and the global cap are gone
(§3.4.10). The creator's 1% enters the money math (§3.4.16). Sponsorship is now the opening itself, and the sponsor
request is gone (§3.4.12). A relay, a ranking for many campaigns and an Android app are added (§3.5 to §3.7).

**Three things to know.**
1. **With no cap, a bug in the program has no ceiling.** What remains: the audit by two firms, the 2-of-3 multisig, the
   pause, the randomized money test and one test per account check (§3.4.13, §3.4.17).
2. **A creator who controls the measured account can force the result.** On a worthless token, forcing pays once a
   little over US$56 of other people's money sits on the other side (§3.4.10). It is a written risk; your decision
   stands.
3. **Still open with you:** the lawyer's written review (L0), the budget (D4), attestation and wallet screening (D5,
   before Sprint 14), P-6 to P-9 and the BP's two new open items (§14.2).

## 1. Stack

What the repository pins today stays, unless a decision of 2026-10-08 changes it [F] (`rust-toolchain.toml`,
`Cargo.toml`, `package.json`, `.github/workflows/ci.yml`). Versions in the program, Bun and Pinocchio rows were read on
2026-10-08; the others on 2026-10-06 and 07 (proposal §2.2).

| Layer | Choice and version | Status |
|---|---|---|
| Program framework | `pinocchio` 0.11.x (0.11.2, published 2026-06-09) [E72]; `pinocchio-system` 0.6.1 for System Program CPIs, pinned `=0.6.1` with `pinocchio` `=0.11.2`, the matching pair (0.6.1 asks for `pinocchio` 0.11) **[F]** (`programs/brot-markets/Cargo.toml`) | **[FD]** D-o |
| Program toolchain | Rust 1.89.0 (`rust-toolchain.toml`); Solana CLI 3.1.10 with `cargo build-sbf` (`ci.yml:18`). Pinocchio 0.11 built with both on the first day of Sprint 02, locally and in CI (C14) **[F]** | **[F]**; build command **[DP]** |
| Program lints | Clippy denies `arithmetic_side_effects`, `cast_possible_truncation` and `cast_sign_loss` in the crate; `overflow-checks = true` in release | **[F]** `programs/brot-markets/Cargo.toml`, root `Cargo.toml` |
| Account checks | One `checks` module: owner, signer, writable, tag, PDA, length, account creation and closing; one negative test per check | **[DP]** proposal §2.1, T24 |
| Events | Hand-written self-CPI from Sprint 02 (T4): one event round-tripped in npm `litesvm` 1.5.0 on day one **[F]**. Every instruction ends with the `event_authority` and `program` accounts (§3.4.14) [E48] | **[DP]** |
| IDL | `shank` 0.4.9 attributes and `shank-cli` 0.4.9, exact pins; `bun run idl` refuses another CLI version **[F]** (`programs/brot-markets/Cargo.toml`, `ci.yml`) [E81]. shank-cli reads errors only from an enum that derives `thiserror::Error`, hence `thiserror` 2.0.21; the `shank` crate is not `no_std`, so the program links `std` **[F]** (Sprint 02) | **[DP]** T9 |
| Client generation | `codama` 1.11.0; `@codama/nodes-from-anchor` 1.5.6 (reads Shank's IDL **[F]**, Sprint 02 spike; that IDL carries no events and no PDA seeds); `@codama/renderers-js` 2.5.0 (needs Kit ≥ 8.3, renders events) [E50]. Fallback: hand-written codecs with a byte-for-byte test against the Rust serializer | **[DP]** T9 decided in Sprint 05: the Codama client is the SDK's codec and builder layer; the event table and the PDA seeds stay hand-written and are checked against the program's source (§3.4.19) |
| Price data | The hand-written `PriceUpdateV2` reader, upgraded receiver (`rec2HH…`) only, no Pyth crate; also used for SOL/USD at opening | **[F]** `readers/price_touch.rs`; SOL/USD **[DP]** |
| Epoch stake | The `sol_get_epoch_stake` syscall, through `solana-epoch-stake =3.0.0` or a Pinocchio binding **[AC]** in Sprint 02 | **[F]** pin in `programs/pred-provable/Cargo.toml:31` |
| Rust tests | `mollusk-svm` 0.14.0 for the `checks` module **[F]** (`programs/brot-markets/Cargo.toml`): 0.15 and 0.16 build on Agave 4.3, whose crates declare Rust 1.97.1, above the pinned 1.89. The `litesvm` crate 0.17 resolves the same Agave 4.3, so Sprint 03 uses the newest version that builds under 1.89 (0.16 **[AC]**) or records a Rust bump first; `set_epoch_stake` since 0.15.0 **[AC]** [E49] | **[DP]**; Mollusk **[F]** |
| Integration tests | Surfpool 1.6.0, binary checked by SHA-256 [E49] | **[DP]** Sprint 03 (carried from Sprint 01) |
| TypeScript tests | `@solana/kit` ~8.4.0 since Sprint 05 (its 27 sub-packages published at 8.4.0; a clean frozen install, the typecheck and every test passed on it); `litesvm` (npm) 1.5.0; `@solana/kit-plugin-litesvm` 0.19.0 | **[F]** `package.json` (Sprint 05) |
| Off-chain runtime | Bun 1.4.2, exact version, binary checksum verified at deploy; services on `Bun.serve`, no web framework; `zod` 4.x the one schema library, pinned at 4.6.5 in `packages/sdk` (Sprint 05) | **[FD]** D-p; zod **[DP]**, pin **[F]** |
| Store | SQLite through `bun:sqlite`, WAL mode, behind a small adapter | **[DP]** |
| SDK boundary | `@brot/sdk/read` and `@brot/sdk/tx`, split enforced by `dependency-cruiser` 18.4.0 (`.dependency-cruiser.cjs`, `bun run lint:sdk`) | **[DP]** proposal §2.3; **[F]** Sprint 05 |
| Website | Next.js 16.3.8, React 19.2.8, Tailwind v4; `@solana/wallet-adapter-react` 0.15.40; `@solana-mobile/wallet-standard-mobile` 0.6.0 with an explicit `registerMwa`; `@solana/web3.js` 1.99.0 while wallet-adapter needs it | **[F]** `app/package.json`; MWA registration **[DP]** |
| Website runtime | Bun 1.4.2 if the staging test passes (build, `next start`, the E2E smoke); Node 22 as the site's fallback only | **[FD]** D-p |
| Share card | `next/og` (`ImageResponse`), self-hosted fonts; the route convention checked in `app/node_modules/next/dist/docs/` first **[AC]** | **[DP]** |
| Display price | CoinGecko `simple/price`, server-side, plan per D4 [E79] | **[FD]** D-e, D-f |
| Android app | Expo (custom development build); React Native; `@wallet-ui/react-native-kit` 4.3.0 or the MWA protocol packages 2.3.0 / 0.4.0; `dapp-store-cli` 1.0.1; `solana-mobile` CLI 0.5.0, all in `mobile/package.json` [E2][E23] | **[FD]** D-n; versions pinned in Sprint 20 |
| Web end-to-end | Playwright, pinned in Sprint 11 | **[DP]** |
| Ops | `cloudflared` 2026.9.3 | **[F]** `knowledge-base/tecnologia/servidor-e-dominio.md` |
| Package registry | `bun.lock` moved from `registry.npmmirror.com` to npmjs.org at the opening of Sprint 02, before the Codama spike adds npm packages (T15); a root `bunfig.toml` pins the registry | **[F]** commit `7d770ce` |
| Verifiable build | `solana-verify`, pinned before mainnet | **[DP]** v0.0.1 §1; Sprint 16 |
| Removed | `anchor-lang`, `anchor-spl` and their `event-cpi` feature; the Anchor CLI; `@anchor-lang/core`; SPL Token CPIs for the pot; the USDC mint constant; every AI package and the inherited chat route | **[FD]** D-o, D-a, D-q |
| Not used | Quasar; gill (needs Kit ^5); Seeker Connect 0.1.x; Redis or Valkey; PostgreSQL | **[DP]** §2 |

Nothing alpha or beta [DP]. Pinocchio is below 1.0 but published, audited by Zellic **[AC: link the report]** and the
base of p-token [E73]. Bun 1.4.2 is the current stable release of its Rust port [E52]. A version marked "pinned after"
enters only after its spike or check passes (§14.4).

## 2. Stack rationale

| Piece | Choice | Rejected | Why |
|---|---|---|---|
| Program framework | Pinocchio **[FD]** (D-o) | **Anchor** 1.1.2, which `programs/brot-markets` uses today | The founder's decision. Pinocchio has no external dependencies, reads accounts in place and generates no code [E72]. The cost: every check Anchor made is written by hand, which is the newest risk in the program; hence one `checks` module and a negative test per check, each shown to fail without its check (§3.4.17, T24). The gain that matters here is no framework version coupling: the `solana-epoch-stake` pin and the Anchor CLI leave with the frozen program **[INF]**. Lower compute and smaller binaries are the usual claims; nothing depends on them |
| | | **Quasar** | Beta, unaudited, no published version; its README says it "has not been audited. APIs may change." [E74][E75] |
| Currency | SOL, in lamports **[FD]** (D-a) | **USDC** (the decision of 2026-10-04, reversed) | The founder's decision. Vaults are data-less program-owned accounts; payouts are direct lamport credits, with no token account, no associated account and no mint with a freeze authority. One new edge case replaces the old ones: a credit below the rent-exempt minimum to an empty wallet fails (§3.4.5) |
| Opening price | Pyth SOL/USD read by the program **[FD]** (D-f) | CoinGecko, written on-chain by a server of ours | A program reads only Solana accounts. A writer of ours would hold a key that decides the fee; CoinGecko's free plan leaves commercial use unclear and its paid plans require attribution [E79]. The program already reads Pyth, and the sponsored SOL/USD account is free to read. CoinGecko stays for display (D-e) |
| Price reader | Written by hand **[DP]** (T2, decided in Sprint 01) | The Pyth Rust crate | It checks owner, size, verification level and feed, and is tested on real captured accounts [F] (`programs/brot-markets/tests/price_reader.rs`). It trusts only the upgraded receiver |
| Time in the program | `Clock::unix_timestamp` **[DP]** (v0.0.1 §2) | Slot numbers | Rules speak in hours and days; devnet slots are about 235 ms, not 400 [F] (`CLAUDE.md`). Alpenglow may change slot time and the clock's source [E45], so price proofs are bounded by slot as well as by time (§3.4.8) |
| Off-chain runtime | Bun 1.4.2 for every service **[FD]** (D-p) | **Node** for the services; Rust services; Python | One language: the keeper, indexer, relay, site, app and tests import one SDK, so PDAs, money math, creation checks, event decoding and public state exist once. Rust services would be a second copy of the math; Python a third language. Bun ships SQLite and runs TypeScript without a build step. Node 22 stays only as the website's fallback, if the site fails its Bun staging test. Risks and checks: §3.5, §12 |
| Service framework | `Bun.serve` and zod 4 **[DP]** | NestJS, Express; gRPC between services | A handful of read-only routes and loopback calls (proposal §2.1) |
| Store | SQLite, WAL, rebuildable **[DP]** | PostgreSQL; Redis or Valkey; no database | The neighbour's PostgreSQL is off-limits and Docker is not available to the `brot` user [F] (`knowledge-base/tecnologia/servidor-e-dominio.md`). Without a database there is no ranking, history or "my entries" after payout (v0.0.1 §3.5). Triggers to revisit: proposal §2.12 |
| IDL and client | Shank attributes and a Codama-rendered Kit client **[DP]** (T9) | Anchor's IDL (gone with Anchor); hand-written codecs as the default | Pinocchio generates no IDL. A documented path exists [E81] but is untried here, hence a half-day spike in Sprint 02, the decision in Sprint 05, and hand-written codecs as the fallback |
| Events | Self-CPI **[DP]** (T4) | `sol_log_data` only | Self-CPI events survive log truncation [E48]. Forgery is handled by the decoder (§3.4.14). T4 was settled on day one of Sprint 02: one event round-tripped in npm `litesvm` 1.5.0 **[F]**, so self-CPI is used from Sprint 02. The cost: two more accounts at the end of every instruction, `event_authority` and `program` |
| Where the program is built | GitHub CI only **[DP]** (v0.0.1 §12) | A container on the shared server; a developer machine | The server is shared and has no compiler; CI already builds with the pinned versions and publishes the binary with its SHA-256 [F] (Sprint 00) |
| **AI** | None **[FD]** (D-q) | An assistant, an MCP server, a model in creation or resolution | The founder's decision ("there is not ai in the scope"). Outcomes come from typed reads of on-chain accounts only (K-02). The chat route inherited in `app/app/api/chat/` leaves in Sprint 09 |
| Mobile | A React Native and Expo app on the Solana dApp Store **[FD]** (D-n) | A web-shell APK; a Trusted Web Activity | D-n asks for a front of its own. Solana Mobile withdrew the TWA guide because Local Network Access breaks Mobile Wallet Adapter there [E6] (§3.7) |

## 3. Architecture

### 3.1 Components and build order

```
 bakers and creators (site, Android app) ──sign in their wallet──▶ program brot_markets (Solana)
        │  /api/v1, /rpc                                                ▲         │ accounts, events
        ▼                                                               │         ▼
 Cloudflare ──▶ brot-web  brot-indexer + API (SQLite)  brot-rpc   brot-keeper primary (VPS)
                                  ▲ reads the chain by RPC                 │ permissionless calls
                                  └─────────────────────────────── standby keeper + watchdog (VM 2) ──email──▶ CTO
```

The full topology, with providers and keys, is in proposal §1.4 and §3.5 here.

**Build order [FD].** Program and backend on devnet first, then the link between them, then the site (the founder's
order of 2026-10-05, v0.0.1 §3.1; "núcleo primeiro", P4 §3.3). The Android app is a phase of its own (D-n; P4 §3.1).
Blocks, without dates (D-r):

| Block | Delivers | Sprints | Depends on |
|---|---|---|---|
| B0 | Setup: the upstream readers and captured accounts, `programs/brot-markets`, `packages/sdk`, the extended CI | 00 (closed, tag `sprint-00`) | — |
| B1 | Price reader proof: a real `PriceUpdateV2` read on devnet | 01 (closed, tag `sprint-01`) | B0 |
| B2 | The pot core on Pinocchio: `checks`, `GlobalConfig`, paid and team opening of price campaigns, the lamport vault, entries, the pause, events; the Shank and Codama spike. The opening, its fee and the creator share's fields are in this core (D-l); the share is computed and paid with settlement, in B4 | 02 | B0 |
| B3 | The other four readers; the price split and `StaleFeed`; `resolve_campaign`; the Surfpool run; `pred-provable` and Anchor leave the workspace | 03 | B1, B2 |
| B4 | The window, finalize, settlement and payout, fees, the creator share, `VoidReason`, close; I1 to I15 in the randomized test | 04 | B3 |
| B5 | `@brot/sdk` (read and tx), the event decoder, the client, the creation preview, `recheck`; the React Native check; a full devnet cycle with a paid opening by a non-team wallet | 05 | B4 |
| B6 | Keepers: the primary on the VPS (Bun check first), then the standby and watchdog on VM 2 | 06, 07 | B5 |
| B7 | Indexer, read API, `brot-rpc`, ranking and listing, KPIs, points | 08 | B5; B6 to publish |
| B8 | The website: design system, creation screen and phone layouts (-1), shell to notices (09 to 13), the creation box at `/abrir` (19) | -1, 09–13, 19 | B5, B7, -1 |
| B9 | Before mainnet: referral and the second read (14), the sealed entry (15), hardening (16), audits (17), mainnet (18) | 14–18 | B4, B6, B7, B8 |
| M | The Android app: skeleton (M-1), money flows on devnet (M-2), dApp Store release (M-3) | 20, 21, 22 | 13 and 05; 22 also 18, the company and L0 |

Track B (proposal §4.0): Sprints 20 and 21 run after 13, only when the founder trades them against a named Track A
item, and never between Sprints 14 and 17; 22 follows 18. **Roadmap gate 1 [DP]:** no service or screen uses the
program before the Sprint 04 randomized money test passes.

**Trust zones [DP]** (proposal §1.5).

| Zone | What lives there | What it may do | What it may never do |
|---|---|---|---|
| Z0 On-chain | The program and its accounts | Move SOL as the rules say; recompute every value; enforce roles and states | Trust an off-chain input it can recompute |
| Z1 Wallet | The baker's or creator's keys (Seed Vault through Seed Vault Wallet on a Seeker; an extension or in-app wallet elsewhere) | Sign what its owner approves | — |
| Z1b Creator | Any wallet that opened a campaign | Open within the rules, on any account a reader accepts (D-i); join its own campaign (BP-14); receive the 1% | Choose the fee, the share, the opening price or any text |
| Z2 Service wallets | Keeper wallets 1 and 2, with SOL for network fees only | Call permissionless instructions | Choose an outcome, an amount or a destination; reach the fee account |
| Z3 Team and admin | One team key per person; the admin and upgrade authority, a 2-of-3 hardware multisig on mainnet | Team keys: confirm, void, contest, pause, open free with no creator share. Multisig: creation parameters, resume, team keys, upgrades, the fee recipient | Invert a result; move a baker's entry; change an open campaign's fee or share |
| Z4 Read path | Indexer, API, relay, site, app | Copy, aggregate, rank, relay allowlisted traffic, display | Hold a signing key; decide anything about money |
| Z5 Third parties | RPC providers, Pyth, CoinGecko, email, Cloudflare, the dApp Store | Provide data, transport and distribution | Be trusted for correctness |

**Architecture invariants [DP]** (proposal §1.5; A-2 was removed with D-q).
- **A-1** No off-chain process holds a key that can move SOL out of a vault, and no such key exists (§3.4.9).
- **A-3** Every transaction a baker or creator signs is built by `@brot/sdk/tx` from validated inputs, re-reads the
  accounts it depends on, is simulated and is summarised by deterministic code.
- **A-4** Every off-chain table can be rebuilt from the chain and `content/`, except two evidence tables (price-feed
  history; referral payout ledger), snapshotted nightly to VM 2.
- **A-5** No browser or app receives a paid RPC key, the Pyth key or the CoinGecko key.
- **A-6** The site and the app import the same `@brot/sdk` for PDAs, money math, creation checks, public state and
  event decoding; neither has a signing path outside the wallet.
- **A-7** Public state is computed by one SDK function against chain time, never the device clock.
- **A-8** A client stops signing when the program's last-deploy slot differs from the one its bundle was built for.
- **A-9** A retry never adds a second entry or a second opening (`expected_entry_total`; the client-chosen `id`).
- **A-10** No creation rule lives only in the site: every rule of §3.4.10 is checked in `user_open_campaign`; the SDK
  mirrors them for the preview, and a test feeds each refused case straight to the program.
- **A-11** No creator-supplied text is stored or shown. Names come from `content/account-names.json` or the pinned Pyth
  feed list, never from token metadata the token's owner can change.

**Data contracts that prevent desync [DP]** (proposal §2.3). Each contract has one source; consumers derive from it; a
check fails when they drift.

| Contract | Single source | Consumers | Drift check |
|---|---|---|---|
| Program interface | The Shank IDL from the CI build | `packages/sdk/src/idl`, the generated client | CI IDL check, moved to the Shank output |
| Account checks | `checks.rs` | Every instruction | One negative test per check, shown to fail without it (T24) |
| Events | `events.rs`, emitted by self-CPI | SDK `events` decoder (§3.4.14) | Forged, failed and lookup-table cases |
| Money math | `math/fees.rs`, `math/payout.rs`, `math/opening.rs`, `math/schedule.rs` | SDK `math` mirror | At least 10,000 vectors generated by the Rust pure functions, replayed in TypeScript (and later in the app's runtime) |
| Creation rules | `instructions/campaigns/open_campaign.rs` and `math/schedule.rs` | SDK `validateOpenCampaign`, preview only (A-10) | One test per refused case, fed to both; the SDK refuses at least what the program refuses |
| Public state | SDK `view`, against chain time | Site, app, API | A unit test per state |
| Read API | `@brot/sdk/read` zod schemas (Sprint 08) | Indexer, site, app | Contract tests; `/api/v1/health` reports deploy slot, schema version, cluster, `entries_allowed` |
| Hand-written content | `content/*.json` | Site, indexer, team scripts | JSON Schema check in CI |

### 3.2 Repository layout

**[DP] The program keeps its folder and address and is rewritten on Pinocchio.** Sprint 02 replaced its Anchor skeleton
with ten instructions [F] (`programs/brot-markets/src/instructions/`, `entrypoint.rs`): `admin_initialize_config`,
`admin_set_team`, `admin_set_creation_params`, `admin_set_fee_recipient`, `admin_transfer_admin`, `admin_accept_admin`,
`team_pause_entries`, `admin_resume_entries`, `user_open_campaign` (price kind only) and `user_join_campaign`; the
entrypoint also dispatches the event instruction of the self-CPI (§3.4.14). `programs/pred-provable` stays frozen until
its readers are ported, and leaves the workspace at the latest in Sprint 03, taking `anchor build`, the Anchor CLI
install and its clippy line with it (proposal §2.1). A ported file keeps the MIT authorship notice [F] (`LICENSE`).

```
programs/brot-markets/src/
  lib.rs  entrypoint.rs  constants.rs  error.rs  events.rs  checks.rs  vault.rs
  state/         config.rs  campaign.rs  entry.rs  enums.rs  referral.rs
  math/          fees.rs  payout.rs  opening.rs  schedule.rs  invariant.rs
  readers/       mod.rs  cursor.rs  price_touch.rs  spl_mint.rs  damm_v2.rs  stake_pool.rs  vote_stake.rs
  instructions/  admin/  campaigns/  entries/  resolution/  settlement/  referral/  sponsorship/
programs/brot-markets/tests/   readers on captured accounts; pure math; math vectors; checks negatives (Mollusk)
programs/pred-provable/        frozen; leaves the workspace by Sprint 03
packages/sdk/src/
  read/   pdas.ts  codecs/  math/  view.ts  events.ts  schemas/  errors.ts  recheck.ts  validate-open-campaign.ts
  tx/     builders/  simulate.ts  summary.ts
  idl/    generated/
services/keeper/src/    loop.ts  tasks/  health.ts  watchdog.ts  alert.ts  signer.ts  rpc.ts  landing.ts
services/indexer/src/   ingest.ts  db/  ranking.ts  points.ts  price.ts  api/
services/rpc/src/       relay.ts  allowlist.ts  budget.ts            (brot-rpc)
services/landing/       the provisional site; leaves at Sprint 09
app/                    app/ (routes)  features/<feature>/  components/ui/  styles/tokens.css
mobile/                 the Android app (Sprint 20 on), with its own lockfile
content/                partners.json  account-names.json  void-log/  powers.md
scripts/                devnet*.ts  team/  capture-fixtures.ts  load/
tests/                  bun test + LiteSVM, by feature; fixtures/ with index.json
deploy/vps/             systemd units, push-deploy.sh, bun checksum, README
```

**Rules [FD]** (`.claude/rules/`, `CLAUDE.md`). One instruction and one reader per file, each under 200 lines, with a
`Purpose:` header; `node scripts/codemap.js` with every file change. Checked math everywhere; the crate's clippy lints
deny unchecked arithmetic and truncating casts. Anchor's `init-if-needed` rule becomes: never re-initialise an account
that already carries a tag (proposal §2.1). If `readers/price_touch.rs` passes 200 lines once the touch rules land, the
`PriceUpdateV2` read moves to a file of its own **[INF]**.

**The SDK [DP].** `packages/sdk` replaces `app/lib` as the shared library in Sprint 05 and imports nothing from React,
Next.js, the DOM or Node built-ins (it must also run under React Native, §3.7). It has two entry points: `read` (PDAs,
codecs, math, public state, event decoders) and `tx` (transaction builders, simulation, the deterministic summary),
and a third, `schemas` (zod: the opening's input now, the read API's in Sprint 08), which `read` and `tx` never import:
zod 4's ESM build does not bundle under React Native's default Babel preset (§3.4.19). The indexer and the relay import
only `read`; `dependency-cruiser` rules enforce all of it. This plan calls the
package `@brot/sdk`, as the proposal does; Sprint 05 renamed `packages/sdk` from `@brot-markets/sdk` to `@brot/sdk`, so
the code and the documents use one name [F] (§3.4.19).

**Build [DP].** `bun run build:program` runs `cargo build-sbf`, then the Shank IDL and the Codama client (or the
hand-written codecs, T9), and syncs both into `packages/sdk`; CI's stale-IDL check compares them with its own build.
The Bun workspace keeps `app`, `packages/*` and `services/*` [F]; `mobile/` keeps its own lockfile. The root
`package.json` still carries the frozen program's name and scripts [F]; they change when it leaves.

### 3.3 What carries over, file by file

**Starting point [F].** Sprint 00 brought `upstream/main` in: `programs/pred-provable/src/resolver.rs` (732 lines, nine
readers), `tests/fixtures/*.bin` with `index.json`, and `scripts/capture-fixtures.ts`. Sprint 01 added the price
reader to `programs/brot-markets`. The BP's rule: the program is written from scratch, "olhando pro código dele para
reaproveitar os trechos e pedaços que nos interessam" (P1 §2.3); what carries over from the old readers is what they
know (addresses, layouts, real samples), and the code is rewritten (P4 §2.2).

| File | Fate | What happens |
|---|---|---|
| `programs/brot-markets/src/readers/price_touch.rs` | Adapts | The read (owner `rec2HH…`, 134 bytes, discriminator, Full verification, the named feed) stays; Anchor types and macros become Pinocchio's and the hand-written error enum. It gains the touch rules (Sprint 03) and serves the SOL/USD read at opening (Sprint 02) |
| `programs/brot-markets/src/readers/cursor.rs`, `tests/cursor.rs`, `tests/price_reader.rs` | Adapt | The bounds-checked byte reader and its fifteen tests stay, without Anchor |
| `programs/brot-markets/src/lib.rs` | Rewritten | The Anchor program macro becomes a Pinocchio entrypoint and instruction dispatch; the program id stays |
| `programs/brot-markets/src/constants.rs` | Adapts | `CONFIG_SEED`, `VAULT_SEED`, `FEE_VAULT_SEED`, `BPS_DENOMINATOR` and `MAX_FEE_BPS` stay. The USDC mint and decimals leave (D-a); the cap seed leaves (D-h); the seed and minimum constants of the old account names are replaced per D6 (`CAMPAIGN_SEED`, `ENTRY_SEED`, `min_entry_lamports` in config). New: `MAX_CREATOR_SHARE_BPS`, the Pyth program ids, the duration and window constants (§3.4.1) |
| `programs/brot-markets/src/error.rs` | Adapts | One enum, mapped to custom program errors; one code per refusal (proposal §2.1) |
| `programs/brot-markets/src/events.rs` | Rewritten | Self-CPI events (§3.4.14) |
| `programs/brot-markets/Cargo.toml` | Adapts | Anchor dependencies and the `idl-build`, `anchor-debug`, `custom-heap`, `custom-panic` features leave; `pinocchio` enters. The `mainnet` feature now only fixes the real review window and minimum duration (T12). The lints stay. The crate description changes per D6 |
| `resolver.rs` (frozen program) | Ported, rewritten | One reader per file under `readers/`: `SupplyAtMost`, `DammV2LockedAtLeast`, `StakePoolTvlAtLeast`, `StakeAtLeast`, each with `validate_at_creation`, `outcome_knowable` and `try_resolve`. The single-key kinds and `LockedAtLeast` stay out (P1 §4.3) |
| `state.rs` (frozen program) | Leaves | Its discipline stays: balances are bookkept in fields, never read from the vault |
| `outcome.rs` (frozen program) | Leaves | USDC transfers and token minting have no use with lamport vaults; `vault.rs` moves lamports between accounts the program owns, with no CPI |
| `instructions/resolve.rs` (frozen program) | Adapts | The top-level-only guard (`get_stack_height` at transaction level) stays in `resolve_campaign`; the late-read and epoch rules inform §3.4.6 |
| `instructions/create_market.rs` (frozen program) | Adapts | The vault at a PDA and the metric-account validation at creation stay, now in `user_open_campaign` |
| The frozen program's other eight instructions | Leave | Sale, pairs, pool, redemption and budget withdrawal belong to the old model |
| `tests/pred-provable.test.ts` | Leaves with the frozen program | Its randomized method (seeded operations with invariants checked after each) and its reader cases are kept |
| `tests/helpers.ts`, `tests/fixtures.test.ts`, `tests/fixtures/*`, `scripts/capture-fixtures.ts` | Kept | LiteSVM client, the SHA-256 index check, real mainnet and devnet bytes. Readers are tested on real bytes, never injected token accounts (`CLAUDE.md`) |
| `app/lib/market.ts`, `metric.ts` | Move to the SDK in Sprint 05 | PDAs and the read that mirrors the program stay. `decodeEvents` is rewritten: it decodes every `Program data:` line (`app/lib/market.ts:202-209`), a bug (§3.4.14). The pool math leaves; the chance, the estimate net of fee and creator share, and the opening quote enter |
| `app/lib/instructions.ts`, `view.ts`, `history.ts`, `hooks.ts`, `program.ts` | Rewritten | For the new instructions, states and events. `history.ts` logic moves to the indexer. `hooks.ts` confirms by WebSocket (`app/lib/hooks.ts:228`); the new client polls signature status (proposal §2.6). The hooks move to `app/features` |
| `app/lib/tokens.ts` | Changes role | Token names from on-chain metadata are not shown (A-11); names come from `content/account-names.json` or the Pyth feed list |
| `app/lib/format.ts`, `config.ts`, `brand.ts`, `mascot/` | Kept | `format.ts` shows lamports as SOL and times as dates; the name is Brot Markets |
| `app/lib/chat.ts`, `app/app/api/chat/route.ts`, `app/components/chat/` | Leave in Sprint 09 | D-q; `OPENROUTER_API_KEY` unset everywhere until then |
| `scripts/devnet.ts` | Kept | The devnet connection |
| `scripts/devnet-smoke.ts`, `devnet-seed.ts` | Rewritten in Sprint 05 | SOL only, with a campaign opened and paid for by a non-team wallet |
| `services/landing/` | Kept until Sprint 09 | The provisional site; its waitlist email is personal data (§8.1). Its copy changes per D6 |

Sprint 00's inherited item "record the USDC address in the config account" falls away with D-a. The risk it guarded,
deploying the wrong variant, remains in another form: a drill build on mainnet, or a wrong SOL/USD feed. The feed id
lives in `GlobalConfig` and is checked by the team at initialisation; CI checks that the mainnet artifact carries the
real window and duration (T12) **[INF]**.

### 3.4 The program `brot_markets` (Pinocchio)

Everything here is **[DP]** unless marked: v0.0.1's design (v0.0.1 §3.4) with the approved proposal's changes (proposal
§1.5, §2.1, §2.3, §2.4, §2.5, §5.2, §5.3), under the D6 names. Instructions are named `who_verb_object`, as in v0.0.1.
Every rule below says where it is enforced and which sprint builds it.

#### 3.4.1 Accounts

Every account the program owns starts with a one-byte **tag** (its type) and a layout version, has a fixed
little-endian layout read in place by offset, and is checked for exact length before any field is read (§3.4.17).
Enums are tagged by position: new variants are appended, never reordered [F] (`CLAUDE.md`). Every struct ends with a
`_reserved` area for later sprints (referral, sealed entry). Rent costs 5,080 lamports per byte including the 128-byte
account overhead [F] [E55]. Sprint 02 measured the sizes (T19, C17) [F]: `GlobalConfig` 400 bytes (2,682,240 lamports
of rent on devnet and mainnet), `Campaign` 512 (3,251,200), `Entry` 100 (1,158,240), each data-less vault 650,240.

| Account | Seeds | Holds | Rent paid by | Sprint |
|---|---|---|---|---|
| `GlobalConfig` | `["config"]` | Roles, the operating level, the creation parameters, the fee recipient, the SOL/USD read bounds | Whoever initialises | 02 |
| Fee vault | `["fee_vault"]` | Data-less, program-owned; lamports only: the fees Brot keeps, until `sweep_fees` | Whoever initialises | 02 |
| `Campaign` | `["campaign", id]` | Everything about one campaign | `rent_payer`: the creator, or the team key that opened it | 02 |
| Campaign vault | `["vault", campaign]` | Data-less, program-owned; lamports only: entries, prize, held opening fee | `rent_payer` | 02 |
| `Entry` | `["entry", campaign, baker]` | One baker's entry, both sides | The baker; returned at `settle_entry` | 02 |
| `ReferralLink` | `["referral", referee]` | Who referred whom | The referee | 14 |

**Removed [FD].** `CapState` and `max_pot` (D-h); `AcceptedAccount` and proposal 0.3's duplicate-guard account (D-i,
T17, proposal §2.4.1); the `SponsorRequest` and its escrow (D-t). The fee vault is v0.0.1's, kept and moved to
lamports (v0.0.1 §3.4.1, D-a): the proposal keeps `collect_fee` and `sweep_fees` "as in TP §3.4.3" (proposal §2.4.2).

**`GlobalConfig`.**

| Field | Type | Meaning | Source |
|---|---|---|---|
| `admin`, `pending_admin` | Pubkey | The admin, changed in two steps (zero when no change is pending) | v0.0.1 |
| `team`, `team_len` | [Pubkey; 5], u8 | Team keys, one per person, up to five: Lucas's, Ronaldo's and Bernardo's (Bernardo's is set when he starts, Sprint 05) | v0.0.1; Q12; founder answer 6, 2026-10-09 |
| `operating_level` | enum: `Normal`, `EntriesHalted` | The pause (§3.4.9) | v0.0.1; D6 |
| `fee_recipient` | Pubkey | Where `sweep_fees` sends the fee vault: the 2-of-3 multisig on mainnet, a team-held key on devnet | proposal §2.4.5; D6 |
| `fee_bps` | u16 | Brot's fee on the losing side: 1,000 (10%); never above `MAX_FEE_BPS` = 1,000. The neutral name replaces `loser_fee_bps` (T11) | P1 §3.3 |
| `one_sided_fee_bps` | u16 | Per entry in a one-sided pot: 100 (1%) | P1 §3.5 |
| `creator_share_bps` | u16 | 100 (1%); never above `MAX_CREATOR_SHARE_BPS` = 100 | D-g |
| `opening_fee_usd` | u64 | 500, whole US$ | D-b |
| `opening_prize_bps` | u16 | 9,000: the prize share of a paid opening | D-b |
| `min_entry_lamports` | u64 | 10,000,000 (0.01 SOL); the admin sets it between 1,000,000 and 1,000,000,000 lamports (0.001 and 1 SOL) | P-5; founder answer 5, 2026-10-09; the bounds are `MIN_ENTRY_FLOOR_LAMPORTS` and `MIN_ENTRY_CEILING_LAMPORTS` |
| `max_open_campaigns`, `open_campaigns` | u32, u32 | The valve on the services' work, and its counter (T18). 1,000 on devnet **[AC]**, code ceiling 10,000 (C43) | proposal §2.4.1 |
| `sol_usd_feed_id` | [u8; 32] | `ef0d8b6f…c280b56d`, the SOL/USD feed [F] (`knowledge-base/tecnologia/pyth-leitor-de-preco.md` §1.2). A compiled constant from Sprint 04, not a config field (founder answer 3, 2026-10-09); until then, the config field | D-f |
| Feed list (not a field) | — | Compiled into the program, one list per cluster, chosen by the `mainnet` feature. A price campaign may name only a feed on it. Day one: Pyth's official list of sponsored feeds, 62 on mainnet and 17 on devnet (2026-10-09); feeds are added from Sprint 06 (founder answer 1, 2026-10-09). Built in Sprint 04 | founder answer 1; `knowledge-base/tecnologia/pyth-feeds-patrocinados.md` |
| `max_price_age` | u32, seconds | SOL/USD freshness at opening. Code range 1 to 300 s; set to 120 s at initialization on devnet **[AC]** (C43), where the sponsored account updated every 62 to 64 s [F] (`knowledge-base/tecnologia/pyth-leitor-de-preco.md`) | proposal §2.4.5 |
| `max_price_conf_bps` | u16 | SOL/USD confidence bound at opening; 50 (0.5%) as for price campaigns **[INF]** | proposal §2.4.5 |
| `campaign_max_age` | u32, seconds | The join-time price age copied into each new price campaign; never below 30 s (§3.4.8) **[INF]** | Q4 answer |
| `bump`, `_reserved` | | | |

v0.0.1's question counter is dropped: campaign ids are chosen by the client (T17) **[INF]**. Every creation parameter is
changed by `admin_set_creation_params`, under its code ceiling. What the code does today [F]
(`instructions/campaigns/open_campaign/record.rs`, `instructions/entries/join_campaign.rs`,
`tests/brot/admin-params.test.ts`): the fee, the one-sided fee, the creator share and the join-time price age are copied
into each campaign at opening, and the opening fee, the prize share, the valve and the SOL/USD feed and bounds act only
at opening, so a change to any of them reaches future campaigns only. `min_entry_lamports` is copied into each campaign at
opening (founder answer 5, 2026-10-09; as the published terms promise, "An open market keeps the rules it opened with").
Sprint 03's code still reads it live from `GlobalConfig` at every join; Sprint 04 builds the copy. Ceilings for the parameters without one in the sources
(`opening_prize_bps`, `one_sided_fee_bps`, `min_entry_lamports`, `max_open_campaigns`, the price bounds) were written in
Sprint 02 **[AC]** (C43, §14.4). Changing the US$500 itself is a founder decision; the program only enforces the
ceilings.

**`Campaign`.**

| Group | Fields | Notes |
|---|---|---|
| Identity | `id` (u64), `creator`, `rent_payer`, `template_version` (u16), `creator_share_bps` (u16) | `id` is drawn at random by the client and saved before signing (T17). `creator_share_bps` is copied from config, or 0 when a team key opens (P-3). `template_version` names the sentence template the site renders (D-j) |
| Reading | `kind` (`ReaderKind`, §3.4.8), `target`, `metric_account`, `threshold`, `price_exponent`, `max_age` | `metric_account` is locked at opening. `price_exponent` and `max_age` are used by the price kind only |
| Time | `opens_at`, `entries_close_at`, `deadline_at` (i64, Unix seconds) | §3.4.10 |
| Opening | `opening_paid_lamports`, `opening_price` (price, exponent, publish time), `prize_lamports`, `opening_fee_lamports` | Zero for a team opening unless the team adds a prize. The opening fee is held in the vault until the outcome (T23) |
| Pot | `pool_yes`, `pool_no`, `first_baker`, `entries_open` (u32), `event_seq` (u64) | Bookkept, never read from the vault balance. `entries_open` counts `Entry` accounts not yet settled |
| Fees | `fee_bps`, `one_sided_fee_bps` | Copied at opening; never change |
| Result | `status`, `outcome`, `observed_value` (i128), `met_late`, `resolved_at`, `review_ends_at`, `contest_stage`, `contest_ends_at`, `void_reason`, `void_note_hash` ([u8; 32]) | §3.4.2, §3.4.6, §3.4.7 |
| Settlement | `settle_mode`, `winning_total`, `losing_total`, `distributable`, `fee_total`, `creator_share`, `creator_share_from_fee`, `paid_out_total`, `creator_share_settled`, `fee_collected`, `prize_settled` | Snapshotted at finalize; no payout reads the live vault balance |
| Bookkeeping | `bump`, `vault_bump`, `_reserved` | |

Gone from v0.0.1's question account: the proposer, the approver and the text hash (no approval, no text: D-j); the
prize funder (the creator is the opener); the held sponsor cut, which becomes `opening_fee_lamports` (proposal
§2.4.1).

**`Entry`** (`["entry", campaign, baker]`): `campaign`, `baker`, `amount_yes`, `amount_no` (u64), `is_first`, `bump`,
`_reserved`. One account per baker and campaign, holding both sides (Q3). It is created on the baker's first join and
closed by `settle_entry`.

**`ReferralLink`** (`["referral", referee]`, Sprint 14): `referee`, `referrer`, `created_at`, `bump`. Signed by the
referee, once, immutable (§3.4.11).

**Code constants.** `MAX_FEE_BPS` 1,000 [F]; `MAX_CREATOR_SHARE_BPS` 100; `BPS_DENOMINATOR` 10,000 [F]; the Pyth
receiver `rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp` and push-oracle program
`pyt2F414BA6dPttK6RddPZUdHfapoBN24GL5wbrPCou` [F]; `PRICE_UPDATE_V2_LEN` 134 [F]; minimum and maximum duration 3 and 90
days (D-k); the review window, 6 hours (P1 §4.5); the entry close, 5% of the duration clamped to 24 hours and 7 days (P1
§3.6); the proof delay, 60 s (Q4); the join-age floor, 30 s (Q4 answer); contest stage 1, one hour, and stage 2, 48
hours (P1 §4.5). Three of them have devnet-only drill values behind a `drill` cargo feature (T12) **[AC]**: the
minimum duration, 15 minutes; the review window, 10 minutes; and the entry close, at least 5 minutes before the
deadline instead of 24 hours, without which a 15-minute campaign would close before it opens [F] (`constants.rs`). The
`mainnet` feature refuses `drill` at compile time, and a CI step checks that the `mainnet` build carries the real
values (§10).

#### 3.4.2 States and transitions

The founder decided five public states [FD] (P1 §3.1). The program records `status` and `outcome`; "Closed" comes from
the clock and the reader, with no transaction. `Proposed` is gone: nobody approves a campaign any more (proposal
§2.4.1).

| Public state | In the program |
|---|---|
| Open | `Open`, entries allowed |
| Closed | `Open`, with `now ≥ entries_close_at`, or with the outcome already knowable (the fact happened, the measured epoch started, the price touched) |
| In review | `InReview`; or `Contested`, with payout paused |
| Paid | `Settling` (payouts going out) or `Settled`, with `outcome` `Yes` or `No` |
| Void | `Settling` or `Settled`, with `outcome` `Void` |

The SDK `view` computes the public state against chain time (A-7). After `close_campaign` the account is gone, and the
public state comes from the indexer's events.

```
Open ─resolve─▶ InReview ─confirm, or 6 h elapsed─▶ Settling ─last entry settled─▶ Settled ─close─▶ (account closed)
                  │  └─void─▶ Settling (Void)
                  └─contest─▶ Contested ─same reading, or decision─▶ Settling
```

| From | To | Instruction | Who | Condition | Sprint |
|---|---|---|---|---|---|
| — | `Open` | `user_open_campaign` | Any wallet; a team key | §3.4.10 | 02, 03 |
| `Open` | `InReview` | `resolve_campaign` | Any wallet, top level only | The reader returns `Yes`, `No`, or `Void` with a reason (§3.4.6) | 03 |
| `InReview` | `Settling` | `team_confirm_result` | A team key | Inside the window | 04 |
| `InReview` | `Settling` | `finalize_campaign` | Any wallet | `now ≥ review_ends_at` | 04 |
| `InReview` | `Settling` (`Void`) | `team_void_campaign` | A team key | Inside the window, with a `VoidReason` | 04 |
| `InReview` | `Contested` | `team_open_contest` | A team key | Inside the window. Entry only: nothing leaves `Contested` before Sprint 14 | 04 |
| `Contested` | `Settling` | `reread_campaign` (same reading) | Any wallet | Stage 1, within one hour | 14 |
| `Contested` | `Contested` (stage 2) | `reread_campaign` (different reading) | Any wallet | Opens 48 hours | 14 |
| `Contested` | `Settling` | `admin_decide_contest` | `admin` | Confirm or void only | 14 |
| `Settling` | `Settled` | `settle_entry` (the last one) | Any wallet | `entries_open` reaches 0 | 04 |
| `Settled` | closed | `close_campaign` | Any wallet | Fee collected, prize settled, creator share settled | 04 |

There is no arrow back. Any transition outside this table is refused with its own error. Decided 2026-10-09 (founder):
any path out of `Contested` stays disabled until Sprint 14. In Sprint 04 a team key can enter `Contested` through
`team_open_contest`, and the campaign is not left there; `reread_campaign` and `admin_decide_contest` are Sprint 14's.
Read literally, "`team_open_contest` disabled until Sprint 14" would leave `Contested` unreachable in Sprint 04. The
founder's answer of 2026-10-09 says a campaign leaves `Contested` only by a disabled instruction, so entry stays allowed
and the exits are disabled (§14.2).

#### 3.4.3 Instructions

Every instruction runs the per-slot checks of §3.4.17 before anything else, emits its one event (§3.4.14), followed by
`CampaignFinalized` when it also finalizes, and returns its own error for each refusal (X0.7). An open instruction has
the same effect whoever calls it: the second keeper to arrive gets an error and nothing changes (v0.0.1 §3.4.3).

**Admin and team.**

| Instruction | Who signs | What it checks and does | Event | Sprint |
|---|---|---|---|---|
| `admin_initialize_config` | The program's upgrade authority, read from its ProgramData account | Creates `GlobalConfig` and the fee vault, once. Publishing and initialising happen in the same session (v0.0.1 §7) | `ConfigInitialized` | 02 |
| `admin_set_team` | `admin` | Up to five team keys | `ConfigChanged` | 02 |
| `admin_set_creation_params` | `admin` | `opening_fee_usd`, `opening_prize_bps`, `fee_bps`, `one_sided_fee_bps`, `creator_share_bps`, `max_open_campaigns`, `min_entry_lamports`, the SOL/USD feed and bounds, `campaign_max_age`: each under its ceiling, for future campaigns only, except `min_entry_lamports`, which the join reads live (§3.4.1, **[Q]**) | `ConfigChanged` | 02 |
| `admin_set_fee_recipient` | `admin` | The destination of `sweep_fees` (D6's `fee_recipient`; v0.0.1's fee-owner setter) | `ConfigChanged` | 02 |
| `admin_transfer_admin`, `admin_accept_admin` | `admin`; then the new admin | Two-step change of `admin` | `ConfigChanged` | 02 |
| `team_pause_entries` | A team key | `Normal` → `EntriesHalted` only | `EntriesPaused` | 02 |
| `admin_resume_entries` | `admin` | `EntriesHalted` → `Normal` | `EntriesResumed` | 02 |
| `team_confirm_result` | A team key | `InReview`, inside the window: ends the window and runs the finalize snapshot at once ("pays now") | `ResultConfirmed`, then `CampaignFinalized` | 04 |
| `team_void_campaign(reason, note_hash)` | A team key | `InReview`, inside the window: `outcome = Void` with a team `VoidReason` and the hash of the text in `content/void-log/`; then the finalize snapshot in `Refund` | `CampaignVoided`, then `CampaignFinalized` | 04 |
| `team_open_contest` | A team key | `InReview`, inside the window: `Contested`, payout paused, stage 1 clock starts | `ContestOpened` | 04 |
| `admin_decide_contest(confirm or void, reason)` | `admin` (the 2-of-3 on mainnet) | Stage 2 only; confirm or void, never invert | `ContestClosed`, then `CampaignFinalized` | 14 |

**Bakers, creators and anyone.**

| Instruction | Who signs | What it checks and does | Event | Sprint |
|---|---|---|---|---|
| `user_open_campaign(id, params, opening_usd, max_lamports)` | Any wallet (pays); a team key (pays nothing unless it adds a prize) | The ten checks of §3.4.10; creates `Campaign` and the vault; moves the payment into the vault, bookkept as prize and held opening fee; increments `open_campaigns` | `CampaignOpened` | 02 (price kind); 03 (the other four) |
| `user_join_campaign(side, amount, min_return_bps, expected_entry_total)` | Any wallet | `Open`, before `entries_close_at`, outcome not knowable, pause off, `amount ≥ min_entry_lamports`, `expected_entry_total` matches, estimate ≥ `min_return_bps`; no cap (D-h). Creates `Entry` on the first join; moves the lamports into the vault by System Program CPI signed by the baker (§3.4.4) | `EntryAdded` | 02 |
| `resolve_campaign` | Any wallet, top level only | §3.4.6: reads the locked metric account (and, for price, the proof account), writes `outcome`, `observed_value`, `met_late` or the void reason, opens the window | `CampaignResolved` | 03 |
| `finalize_campaign` | Any wallet | `InReview` with `now ≥ review_ends_at`: snapshots the totals, sets `settle_mode`, computes the fee, the creator share and `distributable` (§3.4.16), decrements `open_campaigns` | `CampaignFinalized` | 04 |
| `settle_entry` | Any wallet | `Settling`: pays one `Entry` its computed amount and closes it in the same instruction, rent to the baker (§3.4.5) | `EntrySettled` | 04 |
| `settle_creator_share` | Any wallet | `Split` only, once: credits `creator_share` to `creator` | `CreatorShareSettled` | 04 |
| `collect_fee` | Any wallet | `Settled`: moves what Brot keeps (house fee net of `from_fee`, one-sided fees, the opening fee unless refunded) to the fee vault | `FeeCollected` | 04 |
| `settle_prize` | Any wallet | `OneSided` or `Refund`: returns `prize_lamports` to `creator`, plus `opening_fee_lamports` on a house-failure void (P-4). In `Split` the prize is inside `distributable` and this is marked settled at finalize | `PrizeSettled` | 04 |
| `close_campaign` | Any wallet | `Settled`, with fee, prize and creator share settled: moves dust and hand-sent surplus to the fee vault, returns the rent of `Campaign` and vault to `rent_payer`, zeroes the data and reassigns both accounts to the System Program | `CampaignClosed` | 04 |
| `sweep_fees` | Any wallet | Moves the fee vault's lamports above its rent-exempt minimum to `GlobalConfig.fee_recipient`, and nowhere else | `FeesSwept` | 04 |
| `reread_campaign` | Any wallet | Contest stage 1 (§3.4.7) | `ContestClosed` or stage-2 `ContestOpened` | 14 |
| `user_link_referrer(referrer)` | The referee | Creates `ReferralLink` once (§3.4.11) | `ReferralLinked` | 14 |
| The sealed entry | The sponsor | A join that also charges the 10% (§3.4.12) | `EntryAdded` | 15 |
| `sponsor_add_prize(lamports, disclosed)` | A third party | Only if the founder keeps it **[Q]** (P1 §3.7; §3.4.12) | — | 15, if kept |

Gone [FD]: the three proposal and approval instructions of v0.0.1 (replaced by `user_open_campaign`), the cap setter
(D-h) and the four sponsor-request instructions (D-t). `CampaignFinalized` is v0.0.1's `QuestionFinalized` under the D6
pattern. `FeesSwept` is new: v0.0.1's event list had none for `sweep_fees`, and the rule asks one per instruction
**[INF]**.

**`user_open_campaign` accounts.** The signer (writable; it pays), `GlobalConfig`, the new `Campaign` and vault
(writable), the metric account (read-only; for the price kind, the sponsored price account of `feed_id`), the SOL/USD
sponsored account (read-only; the program reads it only on a paid opening), the System Program, then `event_authority`
and the program, which end every instruction's accounts for the self-CPI event (§3.4.14) [F]. Arguments: `id` (u64);
`params` (the kind with its own fields, `target`, `threshold`, `deadline_at`); `opening_usd` (0 for a team key that adds
no prize: the argument layout is fixed [F]); `max_lamports` (the most the signer accepts to pay, T25). No argument is a
string (D-j). The zod shape is in Appendix B.

**`user_join_campaign` accounts.** The baker (signer, writable), `GlobalConfig` (read-only: pause and minimum),
`Campaign` and vault (writable), the `Entry` (writable; created on the first join), the metric account the reader needs
for `outcome_knowable` (for price, the sponsored account of the feed), the System Program, then `event_authority` and
the program [F]. The minimum is read live at every join, not copied at opening (§3.4.1, **[Q]**). Joins write no account
shared across campaigns: with no cap account, campaigns share no writable account on the join path (proposal §1.3)
**[INF]**. Openings and finalizations write `GlobalConfig.open_campaigns`; they are rare next to joins **[INF]**.

#### 3.4.4 The vault (native SOL, bookkept)

**[FD] D-a; design [DP]** (proposal §2.4.6).
- **The vault** is a data-less PDA, `["vault", campaign]`, owned by the program, created at opening with its
  rent-exempt minimum: 650,240 lamports (0.00065024 SOL) for 0 bytes, as `getMinimumBalanceForRentExemption` returned
  on 2026-10-08 [F] [E55]. Only the program can debit it, because it owns it; it moves lamports between accounts it
  owns with no CPI.
- **Anyone can credit it**, so the program never reads its balance as a pot. `pool_yes`, `pool_no`,
  `prize_lamports`, `opening_fee_lamports` and the fees are bookkept fields; SOL sent by hand never becomes an entry
  and never moves the chance (I15). This is the frozen program's discipline [F] (`programs/pred-provable/src/state.rs`).
- **Entries arrive** by System Program CPI from the baker's wallet, signed by the baker, after the checks of §3.4.3.
- **The opening payment arrives** the same way from the creator, all of it into the vault: 90% bookkept as the prize,
  10% as the opening fee held until the outcome (T23). Rent of the two new accounts is separate and returns to
  `rent_payer` at close (I14).
- **No vault is shared between campaigns.** A problem in one vault does not reach another (P4 §2.2). A bug in the
  code, however, reaches every vault: there is no cap (§13).
- **Creation tolerates a pre-funded address.** If anyone sent lamports to the vault's (or the `Campaign`'s, or an
  `Entry`'s) address in advance, `create_account` would fail; creation tops the account up to its rent minimum, then
  `allocate` and `assign`, signed with the PDA's seeds (§3.4.17). The pre-funded lamports are hand-sent surplus.
- **Closing** moves every lamport out and reassigns the account to the System Program, so a revived account fails the
  tag check (§3.4.17).

The USDC mint, the token-account vault, `transfer_checked` and the `mainnet` feature's mint switch are gone (D-a).

#### 3.4.5 Automatic payout (lamport credits, the reserve path)

[FD] "Auto payout. No claim button" (P1 §3.10). The keeper sends every payout; the program decides who and how much.

| Question | Answer |
|---|---|
| Who sends | The keeper calls `settle_entry` for every `Entry` of a campaign in `Settling`, then `settle_creator_share`, `collect_fee`, `settle_prize`, `close_campaign` and `sweep_fees` (proposal §1.7). Any wallet may call each one (Q1, §3.4.6) |
| How much, to whom | The program computes the amount from the snapshot of §3.4.16 and credits `Entry.baker` (or `creator`, or the fee vault) directly. The caller chooses neither the amount nor the destination |
| Never twice | `settle_entry` pays and closes the `Entry` in the same instruction. An `Entry` is born only while the campaign is `Open`, so it cannot be recreated after settlement |
| Network fee and rent | The keeper pays the network fee, 0.000005 SOL per transaction (P1 §3.10, citing a technical report). The `Entry` rent returns to the baker, losers included: a losing entry goes through the same instruction with a payout of zero |
| Batches | Several `settle_entry` per transaction, simulated first; one that fails drops out of the batch. The batch size is measured with self-CPI events in Sprint 04 (T3) |

**The reserve path [DP]** (proposal §2.4.6). A transaction fails if it leaves an account with a positive balance below
the rent-exempt minimum: 650,240 lamports for a data-less wallet [F]. Only an empty wallet is at risk; any wallet
that already holds SOL is above that minimum.
- **Entries are safe.** With the 0.01 SOL minimum entry (P-5), every winning payout is at least its entry (I11) and
  every one-sided refund at least 99% of it. A losing settlement credits only the `Entry` rent, which is above the
  minimum of a data-less account because the `Entry` holds data **[INF]**.
- **The prize and the opening-fee refund are safe:** about 4.12 SOL and 0.46 SOL at the reference price.
- **The creator share can be smaller.** 1% of a small pot (two 0.01 SOL entries give 200,000 lamports) is below the
  minimum, and the creator's wallet may be empty. The credit then fails; the share stays in the vault, bookkept, with
  no deadline. The keeper drops it from its batch by simulation and retries daily, and the creator can fund the wallet
  and call `settle_creator_share` from it (Q2, adapted to SOL). P1 §3.10 asks the TP to handle this case.
- **Consequence for closing.** `close_campaign` waits for the share. In Sprint 04 the team chooses between keeping the
  wait, as the proposal does, and letting `close_campaign` pay a reserved share together with the rent when the creator
  is the rent payer, a credit that always clears the minimum **[AC]**.
- **A referral rebate** can also be small; it is paid off-chain (§3.4.11), and the weekly routine holds it in the same
  way **[INF]**.

**The keeper never funds anyone's wallet [DP].** v0.0.1 rejected recreating closed token accounts at the service's
expense; the same reasoning keeps the keeper from topping up empty wallets: many minimum entries from many wallets would
drain it. Every settlement instruction is open, so winners' SOL is never stuck if the company stops.

#### 3.4.6 Resolution: who triggers it (incl. StaleFeed, D7)

There is no public resolve button [FD] ("Sobre o botão resolver, esquece", P1 §4.4). **Q1 [FD], option B:** any wallet
may call `resolve_campaign`, `finalize_campaign` and the settlement instructions, directly on-chain; the caller chooses
nothing, because the outcome comes from the data read and the destination is always the wallet that joined. If both
keepers fail, a baker, a partner or the team can still trigger. Confirming, voiding, contesting and pausing stay with
team keys. `resolve_campaign` refuses being called from another program's CPI: it must be a top-level instruction (the
frozen program's guard, kept [F]). The two keepers on two providers are BR-24 (§3.5).

| Family | Before the deadline | After the deadline |
|---|---|---|
| Irreversible fact (`SupplyAtMost`, `DammV2LockedAtLeast`) | Target met: `Yes`. Otherwise: refused, not resolvable yet | `No`. If the late read shows the target met, `No` with `met_late` set; the watchdog alerts and the team may void within the window |
| Epoch snapshot (`StakePoolTvlAtLeast`, `StakeAtLeast`) | In the measured epoch: `Yes` or `No` | Epoch missed: `Void` (`MissedWindow`). The frozen code records NO here [F] (`resolve_stake_pool`), which in a pot would pay out without a reading |
| Price touch (`PriceTouch`) | A valid proof of a touch: `Yes` (§3.4.8) | `No`, or `Void` (`StaleFeed`) by the test below (D7, option b) |
| Any | Unreadable account: refused | Unreadable account: `Void` (`UnreadableAccount`) |

**D7 (b).** If Pyth's sponsorship of a feed lapses, open price campaigns must not all
turn to NO (proposal §5.2). The window for NO opens `PROOF_DELAY_SECONDS` (60 s) after the deadline: until then only a
YES proof resolves. After it, with no valid proof, the program reads only the sponsored account and records `Void`
(`StaleFeed`) when `publish_time <= deadline` and `publish_time < deadline − max(max_age, STALE_FEED_MIN_SECONDS)`;
otherwise `No` **[F]** (`readers/price_touch/proof.rs`). `STALE_FEED_MIN_SECONDS` is 600 s **[AC]**. The test relies on
the push oracle never writing an older update, so `publish_time` is the last update before the deadline. The field
`prev_publish_time` is not used: it is Pythnet's previous aggregate, `publish_time − 1` in every captured account **[F]**
(Sprint 03). If an update landed after the deadline, the program cannot prove staleness and records `No`; the indexer's
feed history lets the team void within the window. An exponent change after the window voids as `UnreadableAccount`,
not as `StaleFeed` (Sprint 03 review, F3).

**Evidence.** `CampaignResolved` carries the value read and, for price, `publish_time`, `posted_slot` and the proof
account, so the standby's second read can re-fetch the transaction that wrote the proof through another provider
(proposal §2.5). The re-check panel on the site shows the account, field, value and slot ("Anyone can re-check. Same
account, same answer", P1 §4.4).

#### 3.4.7 The six-hour window, contest and void (VoidReason)

[FD] (P1 §4.5): after resolution the result waits about six hours for a team member to confirm it; the team only
confirms or voids, never inverts; if nobody reviews, payout goes at the end of the window; in the MVP only the team
opens a contest.

| Moment | Who records | Instruction |
|---|---|---|
| Result read; the window opens (`review_ends_at = resolved_at + 6 h`) | Keeper, or any wallet | `resolve_campaign` |
| Confirm, or void with a reason, inside the window | A team key | `team_confirm_result`, `team_void_campaign` |
| Nobody reviewed and the window ended | Keeper, or any wallet | `finalize_campaign` |
| Contest (MVP: team only) | A team key | `team_open_contest`; stage 1 within one hour |
| Stage 1: the second read (B9) | Any wallet | `reread_campaign`. Same reading: payout. Different: stage 2, 48 hours |
| Stage 2: two of three (B9) | `admin`, the 2-of-3 | `admin_decide_contest` |

- **Stage 2 needs no voting code.** The "two of three members" of P1 §4.5 are the multisig's signatures (v0.0.1).
- **Nobody voids outside the window.** After `Settling` the result is final. A team key voids only inside `InReview`.
  The automatic voids are written by `resolve_campaign` and pass through the same window; the team can confirm an
  automatic void, never turn it into `Yes` or `No`.
- **Worst case:** payout 55 hours after resolution (6 + 1 + 48), as P1 §4.5 says.
- **Review by exception** (T22): only the review queue of §3.5 puts a campaign in front of a person; everything else
  pays at the end of the window.
- **"No human in the loop."** The window is kept until the audit, and the copy says "no human picks the winner"
  (BP-5, recommendation still open in P-9).

**`VoidReason` [DP]** (proposal §2.4.2; P-4). Every void records its reason (BR-45); the code and the hash are on-chain,
the text in `content/void-log/`. The reason decides where the held opening fee goes: kept when the cause is outside the
house, refunded to whoever opened on a house failure (P-4, P4 §4.6).

| Reason | Written by | Class | The 10% opening fee | Source of the class |
|---|---|---|---|---|
| `MissedWindow` | `resolve_campaign` | House failure | Refunded | P1 §3.5: "a janela de leitura foi perdida por falha do serviço" |
| `UnreadableAccount` | `resolve_campaign` | Outside cause | Kept | P1 §3.5: the account can no longer be read |
| `StaleFeed` | `resolve_campaign` | Outside cause (founder answer 9, 2026-10-09) | Kept | Answer recorded in `session-log/2026-10-09-respostas-do-fundador-e-mescla-da-sprint-03.md`: the house keeps the US$ 50 |
| `TeamHouseFailure` | `team_void_campaign`, `admin_decide_contest` | House failure | Refunded | P1 §3.5: the review found the reading wrong through our fault |
| `TeamOutsideCause` | `team_void_campaign`, `admin_decide_contest` | Outside cause | Kept | P4 §4.6 |

The prize returns whole to whoever opened on every void (P-4). In a one-sided pot, the 10% is kept (P-4).

#### 3.4.8 Readers (the five kinds; price split; SOL/USD at opening)

`ReaderKind` is closed, with no generic reader [FD] (P1 §4.2; D-k). Each reader checks the owner and the layout of its
account before reading a field and returns an error, never a panic, on unexpected bytes [F]
(`programs/brot-markets/src/readers/mod.rs`). Each exposes `validate_at_creation` (check 2 of §3.4.10),
`outcome_knowable` (the join lock) and `try_resolve`. Layouts with options or strings are read through the
bounds-checked `Cursor`, never by slicing [F] (`CLAUDE.md`).

| Reader | Kind (P1 §4.2) | Owner checked | Notes | Sprint |
|---|---|---|---|---|
| `PriceTouch { feed_id, direction }` | Price of a large asset, by touch | Pyth receiver `rec2HH…` | Below | 01 (read), 02 (opening), 03 (rules) |
| `SupplyAtMost` | Burn | SPL Token (classic) | Mint authority must be revoked, so supply cannot grow; Token-2022 fails the owner check and is refused [F] (`programs/pred-provable/src/resolver.rs`) | 03 |
| `DammV2LockedAtLeast { shift }` | Liquidity locked on Meteora | DAMM v2, `cpamdpZC…` | Reads `permanent_lock_liquidity`, which only grows; 1,112-byte pool [F] (`tests/fixtures/index.json`) | 03 |
| `StakePoolTvlAtLeast { epoch }` | Stake pool size | SPL Stake Pool, `SPoo1Ku8…` | Reads the snapshot the pool writes at its first update of an epoch [F] (`resolver.rs`) | 03 |
| `StakeAtLeast { epoch }` | Validator stake | Vote program | Through `sol_get_epoch_stake`. Never returned YES in a test: LiteSVM's npm package returns zero [F] (`CLAUDE.md`); the crate's `set_epoch_stake` may allow it **[AC]**. Opens for real only after a YES checked on devnet (check 1, §3.4.10) | 03 |

**Kept out [FD]** (P1 §4.3): single-key outcomes (mint or freeze authority revoked, immutable program, immutable
metadata), locked tokens, Token-2022 for now, small-token prices (three steps, later), opinion, sports (phase 2).

**Epoch kinds and the duration rule [AC].** The proposal's parameter sketch gives the two epoch kinds an `epoch` and no
`deadline_at`, while the 3-to-90-day rule (D-k) and the entry close need times. Sprint 03 settles how the program
checks duration for them. The working reading **[INF]**: the creator also passes `deadline_at`, the program requires
the epoch to start before it, entries close at the earlier of `entries_close_at` and the epoch's start, and a missed
epoch voids as `MissedWindow`.

**The price kind: the split [DP]** (proposal §2.5; T2 and Q4). Anyone can push a newer signed update into the
sponsored account, and older ones are skipped; only the push oracle writes it [E51].

| Moment | Account accepted | Checks |
|---|---|---|
| Opening a price campaign | Only the sponsored account of `feed_id`, and `feed_id` on the program's compiled feed list (founder answer 1) | Owner `rec2HH…`, 134 bytes, Full verification, fresh (`campaign_max_age`), confidence at most 0.5% of the price, target not touched; the exponent is recorded |
| Pricing a paid opening (any kind) | Only the sponsored account of the SOL/USD feed id, a compiled constant (founder answer 3; Sprint 04 moves it out of `GlobalConfig`) | The same checks with `max_price_age` and `max_price_conf_bps` (§3.4.10); the price charged is `price − conf` (founder answer 2) |
| Joining | Only the sponsored account, derived on-chain from the push-oracle id, shard 0 and the campaign's `feed_id` | Owner, size, Full, the feed, and age ≤ the campaign's `max_age`, never below 30 s. Refused if price ± confidence reaches the target. A baker cannot choose an older price, because nobody can write one. The join lock's proximity buffer and the late-entry refund are in §3.4.16 |
| YES proof | Any Full `rec2HH…` account of the feed inside the campaign's window, at most 60 s old: the sponsored one, or a `post_update` account that only its own write authority can overwrite | `publish_time` inside the campaign's window; `now − publish_time ≤ 60 s` (Q4); `Clock::slot − posted_slot ≤ ceil(age_seconds × 1,000 ÷ MIN_SLOT_MS)`, with `MIN_SLOT_MS` = 100 **[AC]** (Sprint 03; a posted slot ahead of the clock counts as now); price minus confidence crosses the target in the campaign's direction |
| After the deadline with no proof | — | `No`, or `Void` (`StaleFeed`) per §3.4.6 |

- **Q4 [FD].** (a): the price the service proves on-chain within 60 s counts, so a touch of a few seconds may not
  count, and the campaign's rule says so. The founder answered the Sprint 01 question: the join-time maximum age is a
  per-campaign parameter with a 30 s floor ("mesmo que ajustassemos por pergunta, mesmo assim 30s é um bom tmepo
  minimo"). The creator does not choose it: it is copied from `GlobalConfig.campaign_max_age`, so a creator cannot open
  a campaign with a lax freshness rule **[INF]**. On devnet, where the sponsored account updated every 62 to 64 s [F],
  the initialization sets it to 120 s **[AC]** (C43; code range 30 to 300 s).
- **Why the split.** If any valid account counted at join, a baker could pick the oldest admitted price; if proofs came
  only from the sponsored account, anyone with a key could push a newer update and erase a short touch before the
  keeper resolves (proposal §2.5). Open creation lets anyone open a short price campaign built around that race, so
  mainnet price campaigns open only once the keeper can post its own proofs with a Hermes key (D4, §3.5).
- **The SOL/USD account** is `7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE`, the same on devnet and mainnet [F]
  (`knowledge-base/tecnologia/pyth-leitor-de-preco.md` §1.2). The program derives it rather than trusting a passed
  address. The feed id is a compiled constant from Sprint 04 (founder answer 3, 2026-10-09).
- **Who controls the receiver** is a mainnet risk: on devnet an ordinary key controls its upgrades [F] (Sprint 01). The
  reader accepts one receiver and one exact size, so a format change breaks the read instead of misreading it; the
  watchdog watches the receiver's and the push oracle's upgrade slots (Sprint 07); who controls them is checked before
  mainnet (Sprint 16).
- **Alpenglow [AC]** may make confirmed equal finalized, let the leader set the clock and shorten slots to about
  200 ms [E45]. Devnet is checked before Sprint 03 retests deadlines and the 60 s proof window.

#### 3.4.9 Powers and keys

| Power | Who | Limit in code |
|---|---|---|
| Upgrade the program; act as `admin` | Devnet: a file key held for the company; Lucas and Ronaldo hold the keys, and which of them holds the upgrade key on deploy day is set in Sprint 05 (Q12). Mainnet: the 2-of-3 multisig on hardware devices, with the three partners, and a public wait of 24 to 48 hours before an upgrade takes effect [FD] (P4 §4.1) | Verifiable build (Sprint 16); two-step `admin` change |
| Open a campaign, paying | Any wallet | Five kinds; an account the reader accepts; 3 to 90 days; fees from config; US$500 at the Pyth price (§3.4.10) |
| Open without paying | One team key, for the team or a launch partner | `creator_share_bps = 0`; no prize unless the team adds one (P-3). Every team-key opening raises an alert (§3.5) |
| Confirm, void, contest | One team key | Only in `InReview`; never inverts |
| Pause | One team key, to be fast | Only `Normal` → `EntriesHalted` |
| Resume; creation parameters; team keys; fee recipient; decide a contest | `admin` | Code ceilings; an open campaign's fee and share never change |
| Move the fees | Anyone calls `sweep_fees` | Only to `GlobalConfig.fee_recipient` |
| Resolve, settle, pay | Any wallet (Q1, B) | Destination and amount fixed by the program |
| Move a baker's entry | Nobody, by instruction | No instruction exists, and no emergency withdrawal. The upgrade key can still replace the program, and with it any rule (Sprint 02 review, finding 9); the powers page says so (BR-41) |

- **The pause never blocks payout or refunds** [FD] (P4 §4.5). `operating_level` is read by `user_join_campaign`,
  `user_open_campaign` and, if kept, `sponsor_add_prize` (I10′). A test runs every other instruction with the pause on.
- **Keys [FD] (Q12).** "tem eu e o Ronaldo": the reading that both hold team keys is to confirm. The mainnet signers
  are fixed after the partners' written agreement (BP-12, open in P-9). The multisig product, with a public wait, is
  still to choose (T7) **[AC]**.
- **Devnet keys** for `admin` and `fee_recipient` live on team machines, never on the VPS; the keeper wallets hold only
  SOL for network fees and have no on-chain privilege (proposal §2.10 item 8). A leaked team key opens free campaigns,
  so it is removed through `admin_set_team`, and every team-key opening alerts.
- **`content/powers.md`** publishes who holds each key and what it can do (BR-41, Sprint 13).

#### 3.4.10 Opening a campaign: who, what it costs, what is checked (replaces v0.0.1's global cap)

v0.0.1's global cap and its `CapState` are gone (D-h); this section takes its number. Opening moves from "two team
members" to "any wallet, inside the rules" (P1 §4.1; P4 §4.3): "regra fora da abertura não existe" (P4 §3.3).

**Who and what it costs [FD].**
- **Any wallet pays US$500 in SOL** at the Pyth SOL/USD price minus its confidence, `p − conf`, read in the same
  instruction (D-b, D-f; founder answer 2, 2026-10-09). At the reference
  price that is 4.5758 SOL: 4.1182 SOL becomes the prize, a neutral part of the pot on no side, and 0.4576 SOL is
  Brot's opening fee. `opening_usd` above 500 is allowed: the excess is a larger prize at the same 90/10 (D-b).
- **A team key opens free**, for the team or for a launch partner, with `creator_share_bps = 0` and no prize unless the
  team adds one (D-c, D-d, P-3, P1 §3.8). A team key's openings have their own unlimited budget, outside
  `max_open_campaigns` (founder answer 4, 2026-10-09). The team key stays the `creator`; `content/partners.json` links a partner's
  campaign to the partner for its 72-hour highlight and report. There is no `partner` argument (P-3). How a team key
  adds a prize is not written in the sources. Sprint 02 built the reading that it passes `opening_usd` and pays like
  any wallet, at least `opening_fee_usd`, at the same 90/10, keeping a zero share, and the founder took it as decided
  with PR #35 **[FD]** (C44, §14.2).
- **Rent** of the two new accounts is paid by the signer and returns to it at close: 3,901,440 lamports on devnet
  (`Campaign` 3,251,200 plus vault 650,240, at 5,080 lamports per byte, read on 2026-10-08) [F] (T19).
- **The creator receives 1% of the entries** in a two-sided outcome (§3.4.16), never on a void, in a one-sided pot or
  on the prize (P-1).
- **A stale SOL/USD feed** blocks paid openings until it updates; team keys still open, and an alert fires (proposal
  §2.4.5).

**What `user_open_campaign` checks.** Every row is a refusal with its own error and a test that feeds it straight to
the program (X0.7); the SDK mirrors them for the preview and must refuse at least the same set (A-10).

| # | Check | Rule | Source | Sprint |
|---|---|---|---|---|
| 1 | The kind is one of five; four open. `StakeAtLeast` opens only in a build with the feature `stake-at-least`, which no build enables until a devnet YES (Sprint 05) | Closed `ReaderKind`; `ReaderKindNotOpen` | P1 §4.2; D-k | 02 (price), 03 |
| 2 | The account fits the kind: owner, size, discriminator, through the reader's `validate_at_creation` | With no list, the only gate on the account (D-i), except the price kind's feed list (row 4) | P1 §4.2; D-i, D-k | 02, 03 |
| 3 | The target is not met yet and sits a minimum distance from the current value. Built (Sprint 03): a target already met, including zero or less on an "at least" kind, is `TargetAlreadyTouched`; a negative supply target and a `Below` price target at or below zero are `TargetUnreachable`; the minimum distance is 1% of the current value for each non-price kind (`MIN_DISTANCE_BPS_*`), and for the price kind it is measured from the edge of the confidence band **[AC]** | Otherwise the campaign is decided at birth | proposal §2.4.3 (OCR) | 02, 03 |
| 4 | Price kind: `feed_id` is on the program's compiled feed list (founder answer 1, 2026-10-09; day one: Pyth's official sponsored list, 62 feeds on mainnet and 17 on devnet on that date, built in Sprint 04); the sponsored account of `feed_id` exists, owner `rec2HH…`, Full, fresh, confidence ≤ 0.5% of the price | §3.4.8, §3.4.1 | P1 §4.2; proposal §2.5 | 02; 04 (list) |
| 5 | `deadline_at − now` is between 3 and 90 days; `entries_close_at` computed by `math/schedule.rs` | Duration chosen by the creator | P1 §3.6; D-k | 02 |
| 6 | Fee, one-sided fee, creator share and `min_entry_lamports` copied from `GlobalConfig`; the creator passes none of them; share 0 for a team key | Fixed fees; the minimum entry is kept by the campaign (founder answer 5, 2026-10-09) | P1 §4.2; D-k, P-3, P-5 | 02; 04 (minimum entry) |
| 7 | A non-team signer pays `opening_usd ≥ opening_fee_usd` at the SOL/USD price minus its confidence (`p − conf`, founder answer 2), at most `max_lamports`, all of it into the vault: 90% prize, 10% opening fee held (T23, T25). The SOL/USD feed id is a compiled constant (founder answer 3) | §3.4.16 | D-b, D-f | 02; 04 |
| 8 | The pause is off. A non-team signer needs `open_campaigns < max_open_campaigns`; a team key's opening is outside that valve, with no limit (founder answer 4). The terms the creator read are checked by `expected_params_version` (in `OpenCampaignArgs`, Sprint 03), refused as `CreationParamsChanged` (6090) when the version has moved | A valve on the services' work (T18); the terms check covers the fee, the one-sided fee, the creator share, the prize split, the opening price and the join's price age | proposal §2.4.3; Sprint 03 decision | 02; 03; 04 |
| 9 | No argument is a string; the sentence is rendered by template `template_version` from the stored fields | No free text | D-j | 02 |
| 10 | The `Campaign` account for `id` does not exist yet; creation tolerates a pre-funded address | Retry guard (T17) | proposal §2.4.3 | 02 |

**The schedule [FD]** (P1 §3.6): `entries_close_at = deadline_at − clamp(5% × (deadline_at − opens_at), 24 h, 7 d)`.
A 3-day campaign closes at day 2.0; a 30-day one at day 28.5; a 90-day one at day 85.5. For an irreversible fact,
entries also lock when the fact happens, through `outcome_knowable`. The team-only option of P1 §3.6, an entry close
less than 24 hours before the deadline with a second team signature, waits until there is traffic, as the founder said
(proposal §2.4.2), and is not in Sprints 02 to 04.

**The retry guard (T17, A-9).** The client draws the random u64 `id` once and saves it before handing the transaction
to the wallet. A rebuilt transaction reuses it, so a repeat fails on the existing account instead of charging US$500
twice. Exact duplicates are not refused: a second paid opening adds a second prize, not spam (proposal §2.4.1). The
page lives at `/c/{id}`.

**Display names (A-11).** `content/account-names.json` holds names and explorer links of accounts two people reviewed.
It is not a gate (D-i): an unnamed account can still be used, and shows its shortened address.

**What the checks do not stop [FD, written risk]** (P1 §4.2; P4 §4.3; proposal §2.4.7). Whoever controls the measured
thing can push it: a token team can burn its own token, a pool owner can lock liquidity, a staker can move stake. With
no list, any token qualifies, including a worthless one the creator can burn for free. The creator pays US$500, of
which US$450 goes to the winners; if the creator is alone on the side they force, the prize returns to them and the
net cost falls to about US$50. Forcing then pays once `0.9 × X > 50`, X being third-party money on the other side: a
little over US$56 **[INF]**. A large entry on the forced side carries no risk for the creator, so the threshold holds
almost always. The defences left are the US$500 opening, the automatic notice on burn, lock and stake campaigns
("whoever opened it can control the result and may have an entry on YES or NO", BP-14, open in P-9), and the indexer's
flag on the creator's own entry. Only the price kind is out of any creator's reach. The program cannot see who is
behind a wallet; the creator may join their own campaign (BP-14).

**A campaign with no entries [FD].** The BP has no written rule for it (P1 §3.5, §5.2; P4 §4.3). The founder's answer
of 2026-10-09 (Sprint 04 question, recorded in `session-log/2026-10-09-respostas-do-fundador-e-mescla-da-sprint-03.md`):
the prize returns to whoever opened and Brot keeps the 10% opening fee, so a campaign with no entry at all costs its
opener US$50. This is a rule with no switch (§3.4.16).

#### 3.4.11 Referral (B9)

**[DP] The program records only the link; the payout is a service routine** (v0.0.1 §3.4.11, the choice P4 §3.3 left
to the TP; kept by the proposal, K-05).

| Part | Where it lives |
|---|---|
| Who referred whom | `ReferralLink`, signed by the referee, once, immutable |
| "Before the first entry" | Checked by the indexer: both times are on-chain |
| The fee Brot actually received on each winning entry of the referee ("a taxa que o Brot de fato recebeu", P1 §3.9) | `(fee_total − from_fee) × entry ÷ V`, where `from_fee` is the part of the creator share taken from the fee (§3.4.16); from the events, checked against the `Campaign` |
| 20% of that fee for 90 days, to the referrer [FD] (P1 §3.9) | Weekly routine from the operations wallet, with a public report |
| The referee's rebate: the fee charged on the first US$50 of entries, after US$250, with a ceiling | Same routine. Ceiling 0.05 SOL and the thresholds in SOL (0.4576 and 2.2879 SOL at the reference price) are **[Q]** P-6 |
| When the 90 days start | At the referee's first entry [FD] (Q9, b) |
| How the link is born | A `?ref=<address>` link; the site proposes the signature before the first entry |
| "Day one" | The first day on mainnet (BP-9, recommendation open in P-9) |

- **The one exception to "no money decision reads the database"** (K-05): from Sprint 14 the weekly payout is computed
  from the indexer. It reads finalized rows only, and its ledger is an evidence table snapshotted nightly (A-4).
- **Rejected:** splitting the fee inside `settle_entry`. Accepted cost: the referrer depends on the company to be paid.
  Self-referral is possible and its gain has a ceiling (accepted risk, P1 §3.9).
- **Still open:** who signs the weekly payout (v0.0.1 roadmap), and the treasury rule it pays from (P-7) **[Q]**.

#### 3.4.12 Sponsorship, folded into opening (the sealed entry)

With D-b, opening is sponsoring at US$500, and D-t removed the sponsor request with its 14-day escrow, its refusal path
and its self-cancel (proposal §2.4.8). v0.0.1's four sponsorship instructions and the `SponsorRequest` account are gone.

- **A sponsor opens its own campaign** with `opening_usd ≥ 500`: 90% prize, 10% to Brot. The prize returns whole to
  whoever opened in `OneSided` and `Refund`; the 10% follows the cause (P-4).
- **An undisclosed sponsor** is allowed only with a neutral prize, which an opening's prize always is; the naming is
  off-chain. On mainnet it goes only through the Cloak page (P4 §2.2; Sprint 15, BR-17), once Cloak is checked to
  work with SOL (P-8).
- **The sealed entry** (`SponsorEntry` in the D6 table) is the sponsor's money on one side, under its name: a
  `user_join_campaign` that also charges the 10%, held in the vault until the outcome like the opening fee (Q6, a; T23).
  It follows the common entry rule in a one-sided pot and on a void (Q5, a). The name and seal live in
  `content/partners.json`. Whether it is a flag on the join or an instruction of its own, and its minimum, are set in
  Sprint 15 **[AC]**.
- **Launch partners need none of this:** a team key opens their campaigns, with no prize and no creator share.
- **[Q] P1 §3.7:** may a third party add a prize to someone else's campaign? It is the only reason to keep
  `sponsor_add_prize(lamports, disclosed)`, at the same 90/10. If kept, it is the third instruction the pause blocks
  (I10′), and the prize's return on a void needs a funder record **[INF]**.
- **Perks** (seal, name and link for all; posts and highlights case by case) are BP-3, open in P-9, and live
  off-chain.

Sprint 15 shrinks to the sealed entry and, if kept, `sponsor_add_prize`.

#### 3.4.13 Money invariants (I1–I15)

The invariants a single instruction can see (I1, I3′, I13, I14, I15) are asserted at the end of every instruction that
moves SOL. All fifteen are checked by the seeded randomized test after every operation: joining, opening, pausing,
sending SOL by hand, moving the clock, resolving, voiding, contesting, settling out of order and twice, emptying a
winner's wallet, closing (Sprint 04; roadmap gate 1) **[DP]**. V and P are the winning and losing totals, R the prize.

| # | Invariant |
|---|---|
| I1 | The vault's lamports minus its rent-exempt minimum equal entries + prize + held opening fee − everything already paid out of it, plus any SOL sent by hand. With no hand-sent SOL, exactly equal |
| I2 | `pool_yes` and `pool_no` are the sums of `amount_yes` and `amount_no` over every `Entry` of the campaign (and over its `EntryAdded` events) |
| I3′ | `Split`: `(fee − from_fee) + (from_pot + from_fee) + distributable = V + P + R`; payouts never exceed `distributable` |
| I4 | `OneSided`: payouts plus fees equal the entries; `first_baker` gets back exactly what it put in; the prize returns whole to whoever opened |
| I5 | `Refund`: each `Entry` gets back exactly its amount; the prize returns whole; the opening fee goes where `VoidReason` sends it |
| I6 | After the last entry settles, the dust left is less than the number of winning entries, in lamports; after `close_campaign`, the `Campaign` and the vault hold zero lamports and belong to the System Program |
| I7 | `open_campaigns` equals the campaigns opened and not yet finalized, and an opening never takes it above `max_open_campaigns`. This replaces v0.0.1's cap invariant, gone with D-h **[INF]** |
| I8 | No entry is paid twice; no payout goes to anyone but `Entry.baker`, `creator` (share, prize, refunded opening fee) or the fee vault |
| I9 | Splitting an entry across several wallets never increases the total received |
| I10′ | With the pause on, only `user_join_campaign`, `user_open_campaign`, and, if they exist, `sponsor_add_prize` and a separate sealed-entry instruction (C50) fail |
| I11 | In `Split`, every winning entry receives at least its amount (D-g) |
| I12 | The creator share is 0 in `OneSided`, in `Refund` and in every campaign a team key opens, for the team or a partner (P-1, P-3) |
| I13 | The creator share is paid at most once, only to `creator`, and `from_fee ≤ fee` |
| I14 | A paid opening moves exactly `opening_paid_lamports` from the signer into the vault, split as `prize_lamports + opening_fee_lamports`; a team opening moves nothing unless it adds a prize (P-3). Rent is separate and returns to `rent_payer` at close |
| I15 | The vault's lamports minus its rent-exempt minimum are at least the bookkept balance not yet paid. The difference is SOL sent by hand: never an entry, never a change in the chance, swept to the fee vault at close and from there to `fee_recipient` |

I3′ and I10′ replace v0.0.1's I3 and I10, which named instructions that no longer exist; I11 to I15 are the proposal's
(proposal §2.4.4).

#### 3.4.14 Events

One event per instruction, plus `CampaignFinalized` on the three paths that finalize without `finalize_campaign`
(`team_confirm_result`, `team_void_campaign`, `admin_decide_contest`). Events are defined in `events.rs` and emitted by
a hand-written self-CPI signed by an event-authority PDA, from Sprint 02 (T4: one event round-tripped in npm `litesvm`
1.5.0 on day one, whose `innerInstructions()` shows it at stack height 2) [F]. The authority is the PDA
`["__event_authority"]`, `E5CgcK5xs4YfPdBLnCWTAA9ruStbTqLjEzTxtVaRuB5o`, bump 254, a constant checked by a test [F]
(`constants.rs`). Every instruction ends its accounts with `event_authority` and the program: the runtime finds the
callee of a CPI among the caller's accounts, and without the program the self-CPI fails with `MissingAccount` [F]. The
inner instruction carries `[0xFF, event discriminator, event bytes]`; `0xFF` is reserved for it, and the program writes
no log lines. Every campaign-scoped event carries `campaign` and a contiguous `seq` (from `Campaign.event_seq`), so the
indexer notices a gap; admin and config events carry none (X0.4). Amounts are lamports.

| Event | Emitted by | Carries | Sprint |
|---|---|---|---|
| `ConfigInitialized`, `ConfigChanged` | The admin instructions | The new values; what changed | 02 |
| `EntriesPaused`, `EntriesResumed` | `team_pause_entries`, `admin_resume_entries` | The signer | 02 |
| `CampaignOpened` | `user_open_campaign` | `id`, creator, whether a team key opened it, kind and parameters, `template_version`, times, fees, share, opening paid, price used, prize, opening fee | 02 |
| `EntryAdded` | `user_join_campaign` | Baker, side, amount, both pool totals after the entry, `is_first` | 02 |
| `CampaignResolved` | `resolve_campaign` | Outcome, value read, `met_late` or the void reason, `review_ends_at`; for price: `publish_time`, `posted_slot`, the proof account | 03 |
| `ResultConfirmed`, `CampaignVoided` | Team instructions | The signer; for a void, the reason and the note hash | 04 |
| `ContestOpened`, `ContestClosed` | Contest instructions | Stage, deadline, result | 04, 14 |
| `CampaignFinalized` | `finalize_campaign` and the paths that finalize | `settle_mode`, V, P, R, fee, `from_pot`, `from_fee`, `distributable` | 04 |
| `EntrySettled` | `settle_entry` | Baker, amount paid, mode | 04 |
| `CreatorShareSettled` | `settle_creator_share` | Creator, amount, `from_pot`, `from_fee` | 04 |
| `FeeCollected`, `PrizeSettled` | `collect_fee`, `settle_prize` | Amounts and destination; the opening fee kept or refunded | 04 |
| `CampaignClosed` | `close_campaign` | Rent returned, surplus swept | 04 |
| `FeesSwept` | `sweep_fees` | Amount, `fee_recipient` | 04 |
| `ReferralLinked` | `user_link_referrer` | Referee, referrer | 14 |

v0.0.1's proposal, cancellation and four sponsorship events are gone; the old names map to these per D6.
`EntriesHalted`, in the D6 table, is the `operating_level` value set by the pause, not an event (v0.0.1 §3.4.1).

**Decoder rules [DP]** (proposal §2.3; they hold for the SDK, the indexer and every other consumer):
1. Skip any transaction whose `meta.err` is not null (`app/lib/history.ts` already does [F]).
2. Accept an event only from an inner instruction of this program signed by its event-authority PDA; never from a
   log line, which anyone's program can write. Today's decoder accepts every `Program data:` line [F]
   (`app/lib/market.ts:202-209`), a bug in its own right.
3. Resolve inner-instruction account indexes through `loadedAddresses`, so settle batches using lookup tables decode.
4. Key each event by `(signature, top-level instruction index, inner instruction index)`: one top-level instruction,
   such as a multisig execute, can hold two of our CPIs.

The tests: a forged event is ignored; a failed transaction is ignored; an event inside a lookup-table transaction
decodes (Sprint 05).

#### 3.4.15 Where each rule lives

Requirements use the proposal's BR-xx IDs (Appendix A). The Product Brief's R-xx map is superseded.

| Rule | Account or instruction | Sprint |
|---|---|---|
| BR-01 any wallet opens for US$500 in SOL; BR-16 sponsorship is the opening | `user_open_campaign`; `math/opening.rs` | 02 (price kind), 03 |
| BR-02 creation rules in the program | `user_open_campaign` checks 1 to 10; `ReaderKind`; `validate_at_creation`; `math/schedule.rs` | 02, 03 |
| BR-03 the creator's 1%, none for the team or partners | `math/payout.rs` (`creator_share`); `finalize_campaign`; `settle_creator_share`; I11 to I13 | 04 (fields and the copied `creator_share_bps` in 02, D-l) |
| BR-04 the opening: 90% prize, 10% held until the outcome, priced by Pyth | `math/opening.rs`; the SOL/USD read; `opening_fee_lamports`; `collect_fee`, `settle_prize`, `sweep_fees` | 02, 04 |
| BR-05 YES/NO; five public states; at most 90 days | `status`, `outcome`; `math/schedule.rs`; SDK `view` | 02 to 04 |
| BR-06 entries close at 5% of the duration (24 h to 7 d) or at the fact; early resolution | `math/schedule.rs`; `outcome_knowable`; `resolve_campaign` before the deadline | 02, 03 |
| BR-07 repeat entries per wallet, no tokens, a minimum | `Entry`; `user_join_campaign`; `expected_entry_total`; `min_entry_lamports` | 02 |
| BR-08 no cap, global or per campaign | No cap account, no `max_pot`; the exposure alert is off-chain (§3.5) | 02 |
| BR-09 fee 10% of the losing side; estimate net of fee and share | `math/fees.rs`, `math/payout.rs`; `min_return_bps` at join | 02, 04 |
| BR-10 one-sided pot | `OneSided`; `settle_entry`; `settle_prize` | 04 |
| BR-11 a void refunds without fee; the prize returns; the 10% follows the cause | `Refund`; `VoidReason`; `settle_prize`; `collect_fee` | 04 |
| BR-12 no early exit | No exit instruction exists | 02 |
| BR-13 automatic payout in SOL; reserved only below an empty wallet's rent minimum | `settle_entry`, `settle_creator_share`; the keeper's retry (§3.5) | 04; 06 |
| BR-14 SOL only | Lamport vaults; no mint | 02 |
| BR-15 fee split 25% treasury, 75% operations | Off-chain: `sweep_fees` to `fee_recipient`, then the monthly routine (P-7) | 04; 18 |
| BR-17 neutral prize or sealed entry | The opening's prize; the sealed entry; Cloak off-chain | 02; 15 |
| BR-19 launch partners | Team-key opening; `content/partners.json` | 02; 08 |
| BR-20 referral | `ReferralLink`; `user_link_referrer`; the weekly routine | 14 |
| BR-21 five kinds; a fresh price on every entry | `readers/*`; the join check of §3.4.8 | 01, 02, 03 |
| BR-22 exclusions | Closed `ReaderKind`; classic SPL Token only | 03 |
| BR-23 the program reads; anyone re-checks | `resolve_campaign`; `observed_value`; the `CampaignResolved` evidence | 03 |
| BR-25 six-hour window; confirm or void only; two-stage contest | `InReview`; team instructions; `reread_campaign`; `admin_decide_contest` | 04; 14 |
| BR-26 the creator may join their own campaign | Nothing blocks it in the program; the indexer flags it | 08 |
| BR-40 mainnet after both audits and the 2-of-3; creation rules audited (BP-17) | The audited version; `admin` and the upgrade authority on the multisig | 16 to 18 |
| BR-41 a public table of powers | `GlobalConfig.team`, `admin`; `content/powers.md` | 02; 13 |
| BR-42 the pause, never blocking payouts | `operating_level`; I10′ | 02 |
| BR-45 every void records its reason | `VoidReason`; `void_note_hash`; `content/void-log/` | 04 |

#### 3.4.16 The money math: fee, one-sided fee, creator share, opening conversion

All amounts are u64 lamports; intermediate products are u128 with checked math (clippy denies unchecked arithmetic and
truncating casts [F]). Fees round up, payouts and the share round down, and the opening rounds toward Brot. Each
function is pure, lives in `math/`, and generates the vectors the SDK mirror must match (X0.3: at least 10,000,
covering one-sided, void, both readings of the share and the opening conversion).

**The opening (`math/opening.rs`) [DP]** (proposal §2.4.5; T25). With the Pyth SOL/USD price `p` taken as `price − conf`
(founder answer 2, 2026-10-09; Sprint 03's code still charges the mid price) and exponent `e`:

```text
opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)          refused if > max_lamports
prize_lamports        = floor(opening_paid_lamports × opening_prize_bps ÷ 10,000)
opening_fee_lamports  = opening_paid_lamports − prize_lamports
```

**The fee and the modes (`math/fees.rs`, `math/payout.rs`) [FD]** (P1 §3.3, §3.5; v0.0.1 §3.4.4).

| Mode | When | Brot's fee | Creator share | Each entry receives |
|---|---|---|---|---|
| `Split` | `Yes` or `No`, both sides above zero | `fee = ceil(P × fee_bps ÷ 10,000)` | Below | Winners: `floor(winning_entry × distributable ÷ V)`; losers: zero |
| `OneSided` | `Yes` or `No`, one side at zero | Per entry `ceil(entry × one_sided_fee_bps ÷ 10,000)`, zero for `first_baker`: the wallet whose first join landed in an empty pot, its later joins included, since the exemption sits on its one `Entry` (Q3; Sprint 02 review, finding 26) [F] (`join_campaign.rs`, `math/fees.rs`) | 0 (P-1) | `entry − its fee`, whatever the outcome; the prize returns to whoever opened (P-4) |
| `Refund` | `Void` | 0 | 0 (P-1) | Its whole amount; the prize returns; the 10% follows `VoidReason` (P-4) |

**The creator share (`creator_share(V, P, R, fee, bps) → (from_pot, from_fee)`) [FD]** (D-g, read as P-2; P1 §3.4):

```text
fee           = ceil(P × fee_bps ÷ 10,000)
C             = floor((V + P) × creator_share_bps ÷ 10,000)          the prize is outside the base (P-1)
from_pot      = min(C, P − fee + R)
from_fee      = min(C − from_pot, fee)
creator gets  from_pot + from_fee;  Brot keeps fee − from_fee
distributable = V + P − fee − from_pot + R                            never below V
```

The literal reading of D-g (the whole 1% from the fee when the case fires, capped at the fee) survives only as a test
oracle. The case fires when the winning side holds more than 98.89% of the entries with no prize; with a US$450 prize,
only in very lopsided pots above about US$45,000 (P1 §3.4). Every campaign that carries a share also carries a prize,
because only paid openings have a share and every paid opening has a prize; the no-prize thresholds are test cases
**[INF]**. When even `from_fee` cannot cover the gap, the creator receives less than C and winners get back exactly
their entries: D-g's condition holds first.

**Worked example A: a paid campaign, YES wins** (lamports exact; US$ at the reference price, display only). The
examples take `p` with no band (conf = 0); a band lowers `p` and so raises the amount paid, to be recomputed in Sprint 04.

| Step | Lamports | SOL | US$ |
|---|---|---|---|
| Pyth SOL/USD at opening: `p` = 10,927,000,000, `e` = −8 | — | — | 109.27 per SOL |
| `opening_paid_lamports = ceil(500 × 10^17 ÷ 10,927,000,000)` | 4,575,821,360 | 4.5758 | 500.00 |
| `prize_lamports = floor(… × 9,000 ÷ 10,000)` | 4,118,239,224 | 4.1182 | 450.00 |
| `opening_fee_lamports` | 457,582,136 | 0.4576 | 50.00 |
| Vault after opening (rent 650,240 + payment) | 4,576,471,600 | | |
| Entries: Ana 4 SOL YES, Bruno 2 SOL YES (V); Carla 4 SOL NO (P) | V 6,000,000,000; P 4,000,000,000 | 6; 4 | 655.62; 437.08 |
| `fee = ceil(P × 1,000 ÷ 10,000)` | 400,000,000 | 0.4 | 43.71 |
| `C = floor((V + P) × 100 ÷ 10,000)`; `from_pot = min(C, P − fee + R)` = C; `from_fee` = 0 | 100,000,000 | 0.1 | 10.93 |
| `distributable = V + P − fee − from_pot + R` | 13,618,239,224 | 13.6182 | 1,488.07 |
| Ana: `floor(4,000,000,000 × distributable ÷ V)` | 9,078,826,149 | 9.0788 | 992.04 |
| Bruno: `floor(2,000,000,000 × distributable ÷ V)` | 4,539,413,074 | 4.5394 | 496.02 |
| Carla | 0 | 0 | 0 |
| Dust, to the fee vault at close (I6) | 1 | | |
| Brot keeps: `fee − from_fee` + the opening fee | 857,582,136 | 0.8576 | 93.71 |

Each 1 SOL on YES returns 2.2697 SOL; without the prize it would be 1.5833, the slide's 1.583 for a 60/40 pot. The
sums close: 9,078,826,149 + 4,539,413,074 + 100,000,000 + 857,582,136 + 1 = 14,575,821,360, the payment plus V plus P
(I1, I3′); the 650,240 lamports of vault rent return to the creator at close with the `Campaign`'s rent (I14).

**Worked example B: the case D-g guards against, with a prize.** V = 600 SOL (600,000,000,000), P = 1 SOL
(1,000,000,000), R = 4,118,239,224. `fee` = 100,000,000; `C` = 6,010,000,000 (US$656.71); `P − fee + R` =
5,018,239,224, so `from_pot` = 5,018,239,224 and `from_fee` = min(991,760,776, 100,000,000) = 100,000,000. The creator
gets 5,118,239,224 (5.1182 SOL, US$559.27), less than C; Brot keeps no house fee; `distributable` = 600,000,000,000 = V,
so every winner gets back exactly its entry (I11). The literal oracle gives the creator 100,000,000 and the winners
605,018,239,224.

**Worked example C: a one-sided pot.** Ana enters first with 1 SOL, then Bruno 2 SOL and Carla 3 SOL, all on YES; NO
stays empty. Fees: 0, 20,000,000 and 30,000,000 lamports; refunds: 1,000,000,000, 1,980,000,000 and 2,970,000,000.
Brot keeps 50,000,000 (0.05 SOL, US$5.46) and the opening fee; the prize returns to whoever opened; no creator share
(P-1, P-4). This is P1 §3.5's Ana, Bruno and Carla example in SOL.

**Example D: a void.** Every entry gets back its amount; the prize returns to whoever opened; the 457,582,136-lamport
opening fee is refunded on `MissedWindow` or `TeamHouseFailure` and kept otherwise (§3.4.7).

**No entries (founder answer, 2026-10-09; Sprint 04).** A campaign that closes with no entry at all returns its prize to
whoever opened and Brot keeps the 10% opening fee. This is a rule with no switch: the campaign costs its opener US$50
and no more (§3.4.10).

**Entries after the touch (founder answer, 2026-10-09; Sprint 04).** The join lock reads the sponsored account, which
updates about once a minute, while the YES proof accepts any account at most 60 s old, so a baker could see a touch in a
fresh update and join YES after it happened. Two rules close the gap, both built in Sprint 04:
- **Refund.** An entry joined at or after the YES proof's `publish_time` is refunded whole to its baker, so it neither
  wins nor loses.
- **Proximity buffer at the join lock.** When the sponsored price's confidence band edge is within a margin of the
  target, the join is refused. The margin is **[AC]**, derived from the sponsored account's update interval: about 60 s
  on devnet (updates 62 to 64 s apart [F]) and about 5 s on mainnet (5 to 6 s apart [F]).

**Other numbers [INF]** (P1 §3.4, P2): Brot's fee averages 3.70% of volume. A creator who puts 500 on each side of
their own campaign with no prize gets back 940 + 10 = 950 of 1,000: wash activity does not pay unless something outside
the pot rewards volume, which is why points and ranking stay off raw volume (proposal §2.4.4).

#### 3.4.17 The `checks` module (what Anchor did, now by hand)

Every check lives in `checks.rs`, in its submodules under `checks/` (`top_level.rs`, `upgrade.rs`; Sprint 03), or in the
instruction that needs it, and each has a negative test that feeds the wrong
account and must be refused; the test is shown to fail when the check is removed (T24, X0.9). The checks module is
tested with Mollusk; the instructions with LiteSVM [DP] (proposal §2.1, §2.2).

| Anchor gave | In the program | Negative test | Sprint |
|---|---|---|---|
| Owner check on typed accounts | `checks::owned_by` for every account the program treats as its own; each reader checks its kind's owner | The same bytes under another owner | 02 |
| `Signer`, `mut` | `checks::signer`, `checks::writable`, per account slot | An unsigned or read-only slot | 02 |
| 8-byte discriminator | `checks::tag`: a tag per account type, written at creation and checked on every load | A wrong tag; a zeroed account | 02 |
| `seeds` and `bump` | `checks::pda`: re-derive with the stored bump and compare the address | A look-alike address | 02 |
| Typed deserialization | `checks::len`: exact length per type before any read; fixed little-endian layouts read by offset | Short and long buffers | 02 |
| `init` | `checks::create_pda_account`: System Program `create_account` signed with the PDA's seeds; if the address was funded in advance, top it up, `allocate` and `assign` instead. Never re-initialise an account that carries a tag | A vault, `Campaign` or `Entry` address funded before creation; a second initialisation | 02 |
| `close` | `checks::close_account`: move all lamports out, zero the data, reassign to the System Program | Revival in the same transaction | 04 |
| `has_one` and constraints | Explicit comparisons with stored keys (`Entry.campaign`, `Entry.baker`, `Campaign.creator`, `GlobalConfig.fee_recipient`, `metric_account`) | An `Entry` of another campaign; a wrong recipient | 02, 04 |
| `Program<System>` | `checks::system_program` on the System Program slot before any CPI | A look-alike program | 02 |
| `emit_cpi!` | `checks::event_accounts` and the self-CPI event helper, signed by the event-authority PDA (T4) | A wrong event authority; a wrong program slot; the decoder tests (§3.4.14) | 02; decoder 05 |
| The upgrade-authority constraint at initialisation | `checks::upgrade_authority` (`checks/upgrade.rs`): read the program's ProgramData and compare its authority with the signer | Initialisation by any other key | 02 |
| — | `checks::top_level` (`checks/top_level.rs`): stack height at transaction level, for `resolve_campaign` [F] (the frozen program's guard) | A call through CPI | 03 |
| Duplicate-account protection **[NEW]** | `checks::distinct` wherever two slots must be different accounts (the vault and the fee vault; a recipient and the vault; two entries) | The same account in both slots | 02 |
| The IDL | Shank attributes on accounts and instructions; Codama renders the client (T9) | The CI IDL check | 02, 05 |
| Error codes | One enum mapped to custom program errors; each refusal has its own code. Codes start at 6000 and are contiguous to 6070 after Sprint 02; a new code is appended from 6071, never reusing a number [F] (`error.rs`) | X0.7: one test per refusal | 02 |

**[NEW] `checks::distinct`.** Neither source lists it. The reason: lamport moves between accounts the program owns are
plain balance edits, so the same account passed in two slots (a recipient that is also the vault) can corrupt the
bookkeeping silently. C42, answered in Sprint 02: neither Pinocchio nor the runtime refuses one account in two slots
[F]. Today a PDA check also catches it: without `distinct`, the config passed as the fee vault of
`admin_initialize_config` fails the fee vault's PDA check (X0.9). From Sprint 04, with payouts, `distinct` is the only
guard. The check costs one comparison per pair.

The checks module is the newest risk in the program, because each forgotten check is a vulnerability (P4 §1.4); the
audit scope in Sprint 17 names it.

### 3.5 Off-chain services (keeper pair, indexer, `brot-rpc` relay, API)

Every off-chain process is TypeScript on Bun 1.4.2, the exact version, with the binary's checksum verified at deploy
(D-p) **[FD]**. The services import `@brot/sdk`, so PDAs, money math, event decoding and public state exist once (A-6;
the invariants and data contracts are in §3.1). The indexer and the relay import only `@brot/sdk/read`, and a
`dependency-cruiser` rule enforces it, so the read path cannot build a transaction (proposal §2.3) **[DP]**. No
off-chain process holds a key that can move a baker's SOL, and no such key exists (A-1, K-01) **[DP]**. Sprints 06
(primary keeper), 07 (standby and watchdog) and 08 (indexer, API, relay and points) build them; the site that sits on
top is §3.6.

**The service catalogue** (proposal §1.7; TP v0.0.1 §3.5) **[DP]**.

| Service | Where | Listens on | State | Secrets (credentials, §11) | What its key controls | Sprint |
|---|---|---|---|---|---|---|
| `brot-keeper` primary | Shared VPS | 127.0.0.1:4210 | None: it re-reads the chain every cycle | Keeper wallet 1; RPC key (keeper account); HMAC secret; Hermes key once bought (D4) | SOL for network fees only. No baker money, no on-chain privilege | 06 |
| Standby keeper and watchdog | VM 2, at another provider | Outbound only | The nightly snapshots it receives | Keeper wallet 2, never the same as wallet 1; RPC key B (another company); email key; HMAC secret | The same as wallet 1 | 07 |
| `brot-indexer`, with the `/api/v1` read API | Shared VPS | 127.0.0.1:4201 | SQLite in WAL mode: rebuildable tables and two evidence tables (§4) | RPC key (indexer account); CoinGecko key, only on a paid plan | None | 08 |
| `brot-rpc` relay | Shared VPS | 127.0.0.1:4202 | A short-TTL cache in memory | RPC key (`/rpc` account, with a hard spending limit) | None | 08 |
| `brot-web`, the site | Shared VPS | 127.0.0.1:4200 | None | None | None | 09 (§3.6) |
| `services/landing`, the provisional site | Shared VPS | 127.0.0.1:4200 | `leads.jsonl` (§8.1) | None | None | Exists **[F]**; leaves at Sprint 09 |

Services talk over loopback HTTP and JSON: no gRPC and no message bus (proposal §1.6) **[DP]**. Services use
`Bun.serve` with no web framework, and zod 4 is the one schema library (proposal §2.1) **[DP]**.

**The keeper's cycle** (TP v0.0.1 §3.5; proposal §1.7, §2.7) **[DP]**. Every 60 seconds the primary keeper:

1. reads every open campaign's metric account, 100 per `getMultipleAccounts` call, and calls `resolve_campaign` where
   the reader can decide. Epoch kinds need work only near an epoch boundary; price kinds are handled per feed (below);
2. calls `finalize_campaign` once `review_ends_at` has passed;
3. calls `settle_entry` in simulated batches, dropping any instruction that fails from the batch, then
   `settle_creator_share`;
4. retries reserved credits once a day. With SOL these are only credits that would leave an empty wallet below the
   rent-exempt minimum (§3.4.5);
5. calls `collect_fee`, `settle_prize`, `close_campaign` and `sweep_fees`.

Each instruction has the same effect whoever calls it, so a second caller gets an error and nothing changes (§3.4.3).
The keeper decides off-chain what to try, with the same SDK readers the site uses, and simulates before sending. It
holds and spends only SOL (D-a; P4 §4.5: "update keeper for only uses SOL") **[FD]**. It never chooses an outcome, an
amount or a destination (§3.4.5–§3.4.6). Any wallet may call the same instructions, with no button on the site, so
payout does not depend on the keepers (Q1, §3.4.6).

**The price task** (proposal §2.5; reader rules in §3.4.8) **[DP]**.

- **Per feed, not per campaign.** Many price campaigns share a few feeds, so the work grows with the number of distinct
  feeds, which the sponsored list bounds.
- **With a Hermes key:** the keeper streams the feeds of open price campaigns. On a touch it posts the signed update to
  its own account and resolves every touched campaign of that feed in as few transactions as fit. It also pushes
  fresher updates into the sponsored account, the 10-second task of TP v0.0.1 §3.4.8.
- **Without a key** (devnet, until one is bought): it resolves when the sponsored account itself shows a touch. That is
  weak against erasure (§13), so it is acceptable on devnet only.
- **Mainnet:** price campaigns open only once the keeper can post its own proofs, which needs the Hermes plan of D4.
  Paid openings of the other four kinds need no key, because the SOL/USD sponsored account is free to read.
- **Standby:** watches the feeds continuously as well; its 5-minute loop alone would miss every touch.

**Transaction landing** (proposal §2.6) **[DP]**.

1. Build with `@brot/sdk/tx` and simulate with `replaceRecentBlockhash`; drop failing instructions from a settle batch.
2. Set the compute-unit limit from the simulation with a margin, under the 1.4M maximum [E44].
3. Set the priority fee from `getRecentPrioritizationFees` over the accounts the transaction writes, clamped between a
   floor and a ceiling in config [E44].
4. Send with `maxRetries: 0`; rebroadcast the same signed bytes every 2 s until `lastValidBlockHeight`, then rebuild
   [E44].
5. Confirm with `getSignatureStatuses`. A duplicate lands harmlessly.

Lookup tables and percentile fee estimators come in only if the Sprint 04 batch measurement (T3) shows a gain.

**The standby keeper and the watchdog (BR-24)** **[FD]** (founder, 2026-10-05; P1 §4.4; P4 §4.5). Every 5 minutes the
watchdog checks the primary's `GET /healthz`. After 10 minutes without an answer it asks for a restart up to 3 times,
with `POST /restart` signed by HMAC-SHA256 over the timestamp and the body. The primary writes a flag file, and a
systemd `path` unit owned by root restarts it, so the service users keep no sudo **[DP]** (TP v0.0.1 §3.5). If the
restarts fail, the standby takes over the same loop every 5 minutes, keeps its continuous feed watcher, and emails the
CTO: "o segundo assume o cron e envia notificação para o cto saber que tem um sistema down". The standby is sized for a
full takeover, not for idling (proposal §2.6). It also runs:

- **the second read:** for price campaigns, the proof transaction at `posted_slot` re-read through RPC B; for the other
  kinds, the metric account re-read and compared with `observed_value`. A mismatch puts the campaign in the review
  queue (TP v0.0.1 §3.5; proposal §2.5, §2.11);
- **the chain watch:** a resolvable campaign idle for more than 10 minutes, a settling campaign idle for more than
  30 minutes, keeper SOL below a floor, and the Pyth receiver's and push oracle's upgrade slot and configuration
  (Sprint 07; §13);
- **snapshot reception:** the indexer's nightly `VACUUM INTO` copy (T16).

**Review by exception (T22)** **[DP]**. Nobody can review every resolution of many campaigns in six hours (P4 §4.5).
Second-read mismatches, `met_late` resolutions and stale-feed voids form the review queue; everything else pays when
the window ends, as the BP allows. Before mainnet the queue has a named reviewer per day; who that is stays open
(P4 §5.1; §14.2).

**The indexer** (proposal §2.7; TP v0.0.1 §3.5) **[DP]**.

*Why a database at all.* The browser cannot carry the read side. An `Entry` closes at payout, so what a baker received
lives only in events; the ranking sums entries across campaigns; history read by every visitor would exhaust any RPC
quota; and the partner report, the KPIs and the referral computation are aggregations (TP v0.0.1 §3.5). The database
is a disposable copy of the chain: it is rebuilt from scratch if the file is lost, and no on-chain money decision reads
it (K-05). The one exception is the weekly referral payout of Sprint 14, computed from finalized rows only (§3.4.11).

| Concern | Rule |
|---|---|
| Source | `getSignaturesForAddress(programId)` at `finalized`, paged back to the checkpoint, processed oldest first; stop at the first `getTransaction` that returns null. `maxSupportedTransactionVersion` is the highest the RPC accepts [E44] |
| Latency | `logsSubscribe` with `mentions` (the program only) triggers a poll; otherwise poll every 15–30 s. WebSocket data is never stored [E44] |
| Decoding | The four decoder rules of §3.4.14: skip failed transactions; accept only this program's events; resolve lookup tables; key each event by signature and instruction indexes |
| Exactly once | One SQLite transaction per signature: `INSERT OR IGNORE` on the event key, projections updated, checkpoint moved, all together |
| Gaps | Each campaign's `seq` must be contiguous (§3.4.14); admin and config events carry none. A gap refetches that campaign's signatures |
| Rebuild | `rebuild` replays from the program's first signature into a fresh file, which must equal the live file; its totals must equal the on-chain `Campaign` accounts and vault balances (X1.3) |
| Snapshots | `VACUUM INTO` nightly, copied to VM 2 (T16): the evidence tables cannot be rebuilt, and rebuilding assumes archival history stays available |
| Store access | SQLite sits behind a small adapter, so a failed Bun check reopens D-p without rewriting the services (proposal §2.1) |
| Upgrade path | The source sits behind an `EventSource` interface. A Yellowstone gRPC stream replaces polling only on the trigger listed below; its TypeScript client is a native addon, unverified under Bun [E46] |

A baker sees their own pending transaction through its signature status until the indexer catches up.

*Ranking and listing* (proposal §2.7; P4 §7 counts on "a ordem da página") **[DP]**. The indexer computes `rank` and
`listed`, both rebuildable from the chain and `content/partners.json`:

1. partner campaigns during their 72-hour highlight (P1 §3.8);
2. two-sided campaigns, by entries (not by the prize) and by time left before entries close;
3. one-sided campaigns;
4. campaigns with no entry 24 hours after opening are unlisted from the home page. They stay reachable by link and in
   an "all campaigns" list with filters.

Ranking never uses distinct-wallet counts, the raw volume of one wallet, or anything a creator can pay for, the prize
included; any sponsor highlight follows the perks still open in BP-3 (P-9). Unlisting is display only: the campaign
stays on-chain, resolves and pays.

*KPIs, without personal data* (P2 §2.5, §6.3; BR-31, BR-34) **[DP]**. 30-day return; one-sided share; wallets and
volume per partner; campaigns opened by non-team wallets; paid openings per month (the N of K-09); how many receive
entries on both sides; how many end one-sided or empty; their share of volume; campaigns resolved without error and on
time. The team is known on-chain (`GlobalConfig.team`), so "third-party" is a column, not a guess. The acquisition
channel is measured only through `?ref=`. The partner report carries volume and wallet counts, never addresses.

*Creator flag* (BP-14, P-9) **[DP]**. The indexer flags an entry made by the creator's own wallet; the site shows the
notice of §3.6 on burn, lock and stake campaigns.

*Points, devnet only* (P2 §2.5 test 1; BR-29). Points are for correct calls, never for volume **[FD]** (TP v0.0.1
§3.5). The formula is Q7's working default: 1 point per campaign entered on the right side **[FD]** (§14.2). Many
wallets can inflate the ranking; the brake is how much test SOL a wallet can get from the devnet faucet **[AC]**. The
Seeker Genesis Token is an optional extra signal, not in the MVP (§3.7).

*Display price* (D-e, D-f) **[FD]**. The indexer fetches CoinGecko `simple/price` for SOL in US$ every few minutes,
server-side, and serves it at `/api/v1/price` with its source and time; Pyth SOL/USD is the fallback. It is for
display and reports only and never reaches the program [E79][E80]. If the plan bought under D4 requires attribution,
the site shows "Data provided by CoinGecko" [E79] **[AC]**.

*Evidence tables* (A-4) **[DP]**. Two tables cannot be rebuilt from RPC: the history of every sponsored feed with an
open campaign (`publish_time`, price, confidence), used to judge a void inside the window and as a reference for T8;
and the referral payout ledger, from Sprint 14. Both are snapshotted nightly to VM 2.

**The `brot-rpc` relay** (proposal §2.6; T14) **[DP]**. Clients never hold a paid key (A-5); this relay is the only path
from a browser or the app to a paid provider.

- **Its own unit and its own provider account,** so that an indexer crash loop cannot take away bakers' only RPC path,
  and `/rpc` traffic can never starve the keeper.
- **Reads:** the program's accounts, the caller's balance, the Pyth feeds (SOL/USD included) and the metric accounts the
  creation preview needs. With no list (D-i), a metric read is allowed by owner program: the relay returns an account
  only if one of the five readers accepts its owner. Methods: `getLatestBlockhash`, `getBlockHeight`,
  `getSignatureStatuses`, `getRecentPrioritizationFees`, balances. The final allowlist comes from a trace of the real
  client in Sprint 11; the new client polls signature status instead of opening a WebSocket, which today's client does
  (`app/lib/hooks.ts:228`) **[F]**.
- **Transactions:** `sendTransaction` and `simulateTransaction` accept only `brot_markets`, ComputeBudget and known
  wallet-assertion programs such as Lighthouse (program id **[AC]** [E69]). The System Program appears only as the
  program's own CPI. A join or opening is refused when `CF-IPCountry` is on the `GEO_BLOCK` list (K-11).
- **Limits:** no batches; bodies of at most 8 KB; a weighted token bucket per IP and per IPv6 /64, below the account's
  rate; a short-TTL cache for account reads; a daily credit budget. Cloudflare rate rules without challenges, because
  K-10 rules out Turnstile.
- **What it cannot gate.** On Android the wallet submits through `sign_and_send_transactions` [E1], so the relay's
  country gate covers simulation, not submission. The entry panel's switch therefore reads `entries_allowed` from
  `/api/v1/health` (§3.6).

**The read API.** `/api/v1` is served by the indexer process, read-only, with zod schemas from `@brot/sdk/read`; its
conventions and routes are §6.

**RPC accounts** (proposal §2.6; prices as listed on 2026-10-06 [E40]; limits are per plan **[AC]**) **[DP]**.

| Service | Devnet, now | Mainnet, Sprint 18 | Source |
|---|---|---|---|
| Keeper | Helius Developer, US$49 a month: 10M credits, 50 RPC calls/s, 150 WebSocket connections | A Helius tier sized by measured credits (Business, US$499, has 100M); Sender for sends | [E40] |
| Indexer | A separate account: Helius Free (1M credits, 10 RPC calls/s) or another free tier | Sized by measurement | [E40] |
| `/rpc` relay | A separate account with a hard spending limit | The same | — |
| Standby keeper, second read | Another company: Alchemy Free or QuickNode Build (US$49), sized for a full takeover | A paid tier at the same company | [E41][E42] |
| Never | Public endpoints: 100 requests per 10 s per IP, "not intended for production" | — | [E43] |

Per-method credit weights were not verified; Sprint 08 measures them **[AC]** (proposal §1.3). The budget is D4.

**Observability and alerting** (proposal §2.11; TP v0.0.1 §3.5) **[DP]**.

| Signal | How | Who looks |
|---|---|---|
| Logs | JSON lines to journald: service, level, event, signature, campaign, slot, duration. Never an IP or an email | Operator |
| Health | `/healthz` per service. Keeper: last full cycle, SOL balance, pending items, open campaigns. Indexer: last slot, lag, display-price age. Relay: budget left | Watchdog |
| Liveness | Primary down; standby took over; a resolvable campaign idle for more than 10 minutes; a settling one idle for more than 30; keeper SOL below a floor | CTO by email |
| Results | NO recorded with `met_late`; a second-read mismatch; a credit reserved for more than 7 days | CTO and the reviewer of the day |
| Open creation | `open_campaigns` above 80% of `max_open_campaigns`; openings per hour above a threshold; every opening by a team key; creator-held entries on burn, lock and stake campaigns | CTO |
| Opening price | SOL/USD older than `max_price_age` (paid openings blocked); CoinGecko and Pyth apart beyond a threshold | CTO |
| Exposure | SOL held in all open vaults, since no cap bounds a bug (§3.4.10; §13) | CTO; the founder monthly |
| Pyth programs | The receiver's and the push oracle's upgrade slot and configuration (Sprint 07) | CTO |
| Edge | Unknown tunnel connectors **[AC: the Cloudflare notification to use]**; `/rpc` rate-rule hits | CTO |
| Cost | Credits per RPC account; the Pyth and CoinGecko plans; SOL received and spent | The founder, monthly, with the `usage-monitor` skill (Sprint 18) |

Alerts go out from VM 2 through an email API, never the neighbour project's mail server (TP v0.0.1 §3.5); the
provider is T5. Telegram is a phase-2 channel (v0.0.2 P1:772). The plan's own risk applies: the alert has no backup
person and the review window no owner (P4 §5.1). Before mainnet, every alert goes to two inboxes and the review queue
has a named person per day **[DP]**.

**Not used, and what would change that** (proposal §2.12) **[DP]**.

| Option | Decision now | Revisit when |
|---|---|---|
| PostgreSQL or Supabase | No: a rebuildable copy, the neighbour's database is off-limits, no Docker (K-06) | More than one API instance; a ledger durable beyond nightly snapshots (token era, P3); leaving the shared VPS |
| Redis or Valkey | No: one process per role; the relay keeps its own cache | Shared rate limits or challenges across instances; a job queue. Valkey is BSD-licensed; Redis 8 is RSALv2, SSPLv1 or AGPLv3 [E54] |
| Yellowstone gRPC or LaserStream indexer | Not now (not in the proposal's Phases 0–3) | Ingest lag above 60 s at finalized for a week, or program activity above about 10 transactions a second |
| Webhooks | No: a public endpoint and a shared secret on a server with no open ports, and backfill still needs polling | — |
| Indexing frameworks | No: Carbon 2.0 is Rust-only, Substreams' Solana devnet support was not found [E47], and one program with about 25 event types needs none | — |

### 3.6 The website

**Base** **[F]** (`app/package.json`): `app/`, Next.js 16.3.8 with the App Router, React 19.2.8, Tailwind v4,
`@solana/wallet-adapter-react` 0.15.40. `app/AGENTS.md` says to read `app/node_modules/next/dist/docs/` before writing
app code, because this version has breaking changes. The site is built in Sprints 09 to 13 and 19, on the design
system of Sprint -1; it replaces the provisional `services/landing` on `127.0.0.1:4200` at Sprint 09.

| Topic | Decision |
|---|---|
| What stays | `providers.tsx`, `wallet-button.tsx`, `toast.tsx` and the mascot stay. The rest of `app/components` is direction C ("Tape") and is redone; `globals.css` carries its tokens **[F]** (TP v0.0.1 §3.6) |
| Organisation | `app/features/<feature>/{components,hooks,copy.ts}`, with screen copy in `copy.ts`, because the site language is open (L-01, Product Brief v0.0.1 gap). `components/ui/` holds only the Ledger² primitives. The "Saved" list stays in `localStorage` (L-16) **[DP]** |
| Design tokens | `app/styles/tokens.css` with the variables of `docs/product/DESIGN-DIRECTION.md`: the dark theme in `:root`, the light one in `:root[data-theme='light']`. Tailwind v4's `@theme` block points at them; no component uses a literal colour **[DP]** |
| Theme | `data-theme` on `<html>`, set by a short script in `<head>` before the CSS, as in the prototype. The `localStorage` key becomes `brot-theme`. Which dark is official and which theme is the default are Sprint -1 decisions (`DESIGN-DIRECTION.md:159, 448-450`) **[DP]** |
| Fonts | Barlow Condensed 700 and Inter 400, 500 and 600, served by the site itself; how this Next version serves fonts is C10 **[AC]** |
| Data | Lists and history from `/api/v1` (§6); chain reads, simulation and signature status through `/rpc` (§3.5). Before signing, the panel re-reads `Campaign` and `Entry` and simulates (A-3). Public state comes from the SDK's `view` against chain time, never the device clock (A-7) **[DP]** |
| Signing pause on upgrade | The client compares the program's last-deploy slot (ProgramData) with the one its bundle was built for; on a mismatch it stops signing, backs off and reloads. Signing never depends on the indexer (A-8) **[DP]** |
| Third-party code | None on campaign pages (K-10). Security headers and a CSP in `next.config.ts`, which is empty today **[F]** (Sprint 09 DoD). Cloak and SODAX get their own routes; X is reached only through a plain share-intent link, with no X script, widget or API **[DP]** |
| Country switch | `GEO_BLOCK`: when on, the server reads the visitor's country from Cloudflare (C9 **[AC]**) and hides the entry panel; it also reads `entries_allowed` from `/api/v1/health`. Entries, results and payouts stay visible, and payouts are never blocked (K-11; P4 §5.2) **[DP]** |
| Team panel | None in the MVP. The team operates through `scripts/team/`, each person with their own key. The public register page exists from the MVP (L-12) **[DP]** |

**Routes** (D6: `/c/[id]` and `/abrir`; proposal §2.9, §3.8) **[DP]**.

| Route | What it is | Sprint |
|---|---|---|
| `/` | Home: listed campaigns in ranking order (§3.5), partner highlight first | 10 |
| The "all campaigns" list | Every campaign, unlisted ones included, with filters (proposal §2.7) | 10 |
| `/c/[id]` | Campaign page: the generated sentence and rule, live value, pot and YES/NO split, entry panel, re-check panel, share button. `id` is the client-drawn u64 (§3.4.1) | 11 |
| `/c/[id]/opengraph-image` | The share card (below) | 10 |
| `/abrir` | The creation box (below) | Design in -1; built in 19 |
| "My entries" | A wallet's entries, results and payouts. Its path, like those of the ranking, register and fee pages, is named with the site language (L-01) | 12 |
| Ranking | Points on devnet (§3.5) | 13 |
| Register and powers | Who can do what, from `content/powers.md` (BR-41), and the void log from `content/void-log/` (BR-45) | 12–13 |
| Fees | A worked example net of fee and creator share; the refund policy (BR-32) | 13 |
| Incident page | Who pauses, who speaks, where it is published (BR-42) | 16 |
| Cloak and SODAX | Their own pages, never the signing page (BR-46); each waits for P-8. The Cloak page serves undisclosed sponsors (BR-17) | Cloak 15; SODAX 17 |
| `/.well-known/assetlinks.json` | The Android app's App Links (§3.7) **[AC]** | 20 |
| `app/manifest.ts` | Installable PWA, manifest and icons only (S2) | 13 |
| Removed | `/sugestoes`: the suggestions page leaves with open creation (P1 §4.1). `/api/chat`: Sprint 09 (below) | 09 |

**The creation box** (`app/features/open-campaign/`; proposal §2.9) **[DP]**.

- A typeahead over one sentence template per kind and over known names, with typed slots (number, date, account
  picker) rather than inline blanks, so it works with screen readers and in two languages. The account slot accepts
  any address and validates it live through `/rpc` against the reader's owner and layout rules (D-i). Text outside the
  grammar gets "we can't check this on-chain" and the nearest templates. No free text reaches the chain (D-j, A-11).
- The card before signing is built from the exact struct the transaction carries: the generated sentence; the rule in
  plain words (account and explorer link, deadline in UTC and local time, when entries close, what a missing value
  means, early resolution, one-sided and void refunds); the live value with "if resolved now: YES/NO"; the money (house
  fee, creator share, the opening in SOL with its US$ value and the 90/10 split, `max_lamports`, no cap); the share-card
  preview; and the "whoever opened it can control the result and may have an entry on YES or NO" notice on burn, lock
  and stake kinds (P1 §4.2).
- `validateOpenCampaign` mirrors every check of `user_open_campaign` for the preview; the program decides (A-10). The
  opening price comes from the same Pyth SOL/USD account the program reads, through `/rpc`; the US$ value shown next to
  it comes from `/api/v1/price` (D-f).
- The `id` is drawn once and saved before the wallet hand-off, so a retried opening fails on the existing account
  instead of charging US$500 twice (T17, A-9). `max_lamports` bounds the price move between preview and signature (T25).
- `/abrir` accepts a prefill by template id and slots; a link never signs anything (proposal §3.8).
- **Gap:** the approved prototype and `DESIGN-DIRECTION.md` have no creation screen. Under D8 (a) (Summary), Sprint -1
  designs it at web and phone widths and Sprint 19 builds it.

**The share card** (proposal §2.9) **[DP]**.

- `app/c/[id]/opengraph-image.tsx` (`next/og`, `ImageResponse`) renders the sentence, the live value, the deadline, the
  pot and the YES/NO split from the indexer's DTO, read over loopback, with self-hosted fonts. The route convention is
  checked in the Next.js docs first (C29 **[AC]**). Cards are cached at the edge for a short TTL, because rendering
  costs CPU on a 2-vCPU box (proposal §2.8).
- After resolution the same card shows the value read, the target and the result. The team routine
  `scripts/team/resolution-post.ts` writes the post text from a template, and a person posts it. No X API.
- The share button is a plain intent link. Blinks and Solana Actions stay out until after L0 (proposal §2.12).

**The re-check panel** (P1 §4.4: "Anyone can re-check. Same account, same answer") **[DP]**. Each campaign page shows
the account, field, value and slot, and a copyable command that reads the same account through any RPC. The SDK
exposes `recheck(campaign, rpcUrl)` (Sprint 05); the panel is Sprint 11.

**Notices and copy** (BR-12, BR-26, BR-27, BR-47) **[DP]**. A lock notice before signing, since there is no early exit
(P1 §3.10); the creator notice on burn, lock and stake kinds (BP-14); the estimate net of fee and creator share
(BR-09); the devnet and "Programa ainda sem auditoria" notices while true (P1 §4.6); "no human picks the winner"
(BP-5, still open in P-9). A "report this campaign" link, remedied by unlisting, in Sprint 13 (C-10). Copy follows
D-m: campaign, entry, baker, creator, pot, YES/NO.

**Wallets in the browser** (proposal §3.3–§3.4) **[DP]**.

- **Wallet Standard** through `@solana/wallet-adapter-react` for extensions and in-app wallets.
- **S1, explicit MWA registration (Sprint 09).** Today MWA reaches the web only because wallet-adapter 0.15.40 adds
  its legacy adapter, only in Android browsers, never inside a WebView, and only when no other wallet is installed.
  That adapter infers the network from the RPC URL, so behind `/rpc` it would ask for mainnet [E8]. The site calls
  `registerMwa` from `@solana-mobile/wallet-standard-mobile` 0.6.0 once, from `providers.tsx`, with all five options
  [E4][E7]. Its rules:
  1. one chain per environment, taken from config, never inferred; a test asserts it equals `/api/v1/health.cluster`
     [E1] (X2.1);
  2. the app-identity icon is a relative path: with an absolute URL, Seed Vault Wallet rejected the request and the
     library reported only a timeout [E9];
  3. connect only from a user gesture, labelled "Use Installed Wallet"; Chrome blocks programmatic launches [E4];
  4. send through `sendTransaction`, which maps to the mandatory `sign_and_send_transactions` [E1];
  5. on first connection Chrome shows an information dialog, the Local Network Access prompt and a success dialog,
     once per browser [E5];
  6. pending entries survive a frozen tab: before the hand-off the site saves the `Entry` it read and the transaction's
     `lastValidBlockHeight`; on return without an answer it polls until that height passes before offering a retry;
     the join carries `expected_entry_total`, so a duplicate fails on-chain (A-9). Entries cannot be withdrawn, so
     this is not optional [E9];
  7. MWA on the web works in Android Chrome and PWAs installed from it, with Seed Vault Wallet, Solflare or Phantom;
     Firefox and Opera are not supported; sources disagree on Brave [E4][E9];
  8. watch MWA JS v3 (ESM-only, Kit ≥ 8.3), approved but unreleased on 2026-10-06 [E3], and wallet-adapter-react 1.0,
     which will no longer add MWA by default [E7].
- **S1b, wallet in-app browsers (Sprints 09–13).** Phantom and Solflare on Android and iOS, checked by list. This is
  the iPhone path (D-n) and must include opening a campaign (X2.2).
- **S2, installable PWA (Sprint 13).** `app/manifest.ts` and icons only. No service worker, which would bring back the
  stale-file problem the landing already hit (commit `8e4684d`).
- **Links.** `?side=yes|no` and `?amount={lamports}` prefill the panel, never sign, and an amount that came from a link
  is labelled as such. `?ref={address}` is recorded only when the new baker signs `user_link_referrer` (Sprint 14).
  There is no custom `brot://` scheme, because any app can claim one (proposal §3.8).

**The inherited chat route leaves in Sprint 09** (D-q) **[FD]**. `app/app/api/chat/route.ts`, `app/lib/chat.ts` and
`app/components/chat/chat.tsx` come from the upstream app **[F]** (`CLAUDE.md`). Sprint 00's review found the route's
rate limit bypassable, with no spending ceiling and client-supplied context (`docs/sprints/sprint-00-setup.md:141`).
With no AI in scope, Sprint 09 deletes it, `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` leave `app/.env.example`, and
the key stays unset in every environment until then (X2.3).

**The site's runtime** (D-p) **[FD]**. Sprint 09 runs a staging test of the site under Bun 1.4.2: `bun --bun next
build`, `next start` on port 4200 and a load of every route; Sprint 11's E2E smoke then runs on the chosen runtime. If
it passes, `brot-web` runs on Bun; if not, it runs on Node 22, which the server already has (v22.23.3 **[F]**,
`knowledge-base/tecnologia/servidor-e-dominio.md`), and the reason is recorded (X2.4). The evidence is mixed: Bun's
guide says it runs a production Next.js server, the Next.js docs found do not confirm it, and a community report
describes a Next 16.3 build failing with Bun on Vercel [E78]. The services stay on Bun either way.

**When the site replaces the landing** (Sprint 09). The landing holds the waitlist, its deletion form at `/privacy`,
and the decks at `/pitch` and `/pitch2` **[F]** (`services/landing/README.md`). No source says what happens to them
when `brot-web` takes the address **[Q]** (§8.1, §14.2).

### 3.7 The Android app

**What it is** (D-n) **[FD]**. An Android app, published on the Solana dApp Store, with the same backend and a front
of its own; iPhone users stay on the website inside wallet in-app browsers. Mobile Wallet Adapter exists only on
Android; Solana Mobile says it is not available on iOS and that deep links are no replacement [E16]. The app lives in
`mobile/`, with its own lockfile and pinned CLIs (proposal Phase 3). It is built in three slots: Sprint 20 (M-1, the
design pass and the skeleton), Sprint 21 (M-2, the money flows on devnet) and Sprint 22 (M-3, the store release).

**When** (proposal §4.0) **[DP]**. Sprints 20 and 21 are Track B, under the rule of §3.1; Sprints 14 to 17 are the
audit path they never interrupt. Sprint 22 follows Sprint 18, the company's existence and L0's written review. P4 §3.1
places the app after mainnet; building M-1 and M-2 on devnet first is the approved proposal's option, and the release
stays where the BP puts it.

**What it reuses** (proposal §3.1) **[DP]**.

| Layer | Website | Android app |
|---|---|---|
| Read data | `/api/v1` | The same `/api/v1` |
| Chain reads and simulation | `/rpc` | The same `/rpc`; no paid key in the app (A-5) |
| Logic | `@brot/sdk/read` and `@brot/sdk/tx` | The same packages (A-6) |
| Front | Next.js | React Native with Expo, screens of its own |
| Wallet | Wallet Standard; MWA in Android browsers | MWA from a native client: Seed Vault Wallet, Phantom, Solflare |
| Country switch | Hides the entry panel (K-11) | The same, from `entries_allowed` in `/api/v1/health` |
| Distribution | brot.markets | The Solana dApp Store only |
| iOS | Wallet in-app browsers | None |

No backend service is added. The app's screens mirror the site's: home, campaign page, joining, "my entries", the
creation box, the re-check panel and the share button. The design direction has no layout below 700 px, so the app
gets its own design pass at the start of Sprint 20 (proposal §3.11) **[DP]**.

**The device.** Seeker is one Android device among others: Android 16, a 6.36-inch 2670 × 1200 display, Google
Mobile Services with the Play Store and the dApp Store preinstalled, and Seed Vault Wallet built in, operated by
Solflare [E18][E10]. Its portrait width is about 400–460 CSS px **[INF]**. No sourced figure exists for Seeker's
install base, the dApp Store's traffic or their Brazilian share **[INF]**; the decision stands without it (D-n), and
the figure becomes a KPI after listing.

**The SDK under React Native** (proposal §3.2), checked in Sprint 05 so that Sprint 20 does not discover it **[DP]**:

1. `@brot/sdk` imports no Node built-in, no DOM API and nothing from React or Next.js (`CLAUDE.md` already asks this of
   `app/lib`, with `Buffer` imported from `buffer`);
2. the app, not the SDK, polyfills `crypto.getRandomValues`, and `crypto.subtle` where Kit derives addresses
   (C33 **[AC]**: which Kit calls the app makes and what the Hermes engine provides);
3. money math uses `bigint`, which the app's engine must support (C33 **[AC]**);
4. the SDK ships ESM with `exports` that Metro resolves; a CI job bundles both halves for Android and runs the math
   vectors in the app's test runner;
5. MWA's React Native packages speak Kit 7-era types until MWA JS v3 ships, so the app wraps them [E2][E3];
6. MWA is a native module, so the app needs a custom Expo development build, not Expo Go **[INF]**.

**Wallet and signing** (proposal §3.4–§3.6) **[DP]**.

- The site's MWA rules 1, 2, 4 and 6 apply through the MWA React Native client [E2]: one chain from config, equal to
  `/api/v1/health.cluster` (X3.1); a relative icon; `sign_and_send_transactions`; the pending-entry snapshot.
- Android may stop the app's process while the wallet is in front, so the pending-entry snapshot and an opening's `id`
  are written to device storage before the hand-off **[INF]**. Process death or a frozen app never yields a second
  entry or a second opening (X3.3).
- `authorize` returns an opaque `auth_token` whose lifetime the wallet decides; the app keeps it in device storage and
  the backend never sees it (H0, §5) [E1]. `get_capabilities` reports supported transaction versions and the batch
  limit [E1].
- dApps never talk to Seed Vault; its SDK is for wallets. Approval is fingerprint or PIN in the docs, a side-button
  double-tap plus a fingerprint in Solana Mobile's blog; neither the site nor the app can force or detect it [E10].
- Whether Seed Vault Wallet supports devnet is not confirmed (C34 **[AC]**); Phantom and Solflare on a Seeker are the
  fallback for devnet tests, and X3.2 records which wallet was used.
- Every transaction the app hands to the wallet is built by `@brot/sdk/tx` and summarised by deterministic code before
  the baker or creator signs (A-3).

**Links** (proposal §3.8) **[DP]**. `https://brot.markets/c/{id}` is a verified App Link that opens the app when it is
installed; the site serves `/.well-known/assetlinks.json` with the app's certificate fingerprint (C35 **[AC]**). The
same prefill rules as the site apply. `solanadappstore://details?id=markets.brot.app` opens the listing from M-3
[E23]. Android returns to the app when the wallet's activity finishes [E1][E4]. No custom scheme; no Solana Pay
transaction requests; no Actions or blinks.

**Notifications** (proposal §3.9) **[DP]**. None in the web MVP (L-16). The app can receive push through FCM natively,
since Seeker ships Google Mobile Services [E18]. Every option (FCM in the app, Web Push from Android Chrome [E19],
wallet-level alerts [E36], Telegram) ties a wallet to a contact point or a device token, so each needs a founder
decision and the privacy audit (§8). The on-screen six-hour countdown is the signal meanwhile.

**Seeker Genesis Token** (proposal §3.7) **[DP]**. Optional and not in the MVP. A mainnet-only Token-2022 NFT, one per
Seeker; verification checks that the MetadataPointer address and the TokenGroupMember group both equal
`GT22s89nU4iWFkNXj1Bw6uYhJJWDRPpShHt4Bk8f99Te` [E11]. It could be one signal against many-wallet farming in points
(BR-29), but it proves a device, not a person, cannot be tested on devnet, needs a sign-in (H1) and ties a wallet to
a device, which is personal data **[INF]**.

**Distribution and compliance** (proposal §3.10). The dApp Store is the only store route (D-n) **[FD]**. Its Publisher
Policy does not name this kind of product; it requires legality, documentation for regulated financial services, apps
that load no untrusted web content, and a flag button where users generate content. The Developer Agreement allows
removal at any time, with or without cause [E20][E21]. Google Play's pilot for this category accepts only US
financial licences, for apps that target the US [E25][E26]. Apple bars binary-options apps ("Consider a web app
instead") and requires licences for derivatives and for geo-restricted real-money gaming; no rule names this kind of
product [E27]. Neither store is planned. The web, including wallet in-app browsers, stays the global path and the iOS
path.

| # | Item | Source | Component | Status or sprint |
|---|---|---|---|---|
| C-01 | The publisher is the company: 18+, KYC/KYB, a publisher wallet for every later submission, about 0.2 SOL for fees and storage, depending on APK size | [E21][E23] | Ops | Blocked: the company does not exist yet (P4 §5.2) |
| C-02 | Legality, and the "documentation required by Applicable Law" for regulated financial services | [E20] | Lawyer | L0 |
| C-03 | Developer warranties: no pending proceedings about its crypto activities, no government order against it, no sanctioned person using the platform, an export-compliant offer. Users warrant their own sanctions status | [E21][E22] | Ops; site, app and relay gates | Open |
| C-04 | Removal at any time, with or without cause | [E21] | Product | The web stays primary; a removal loses a channel, not the product |
| C-05 | No per-country availability found in the store's docs | Research of 2026-10-06 **[AC]** | Site, app, `brot-rpc` | All gating is ours |
| C-06 | Brazil: MP 1.394 arts. 21–22 reach app-store and OS providers; requests to Apple and Google to remove apps have been reported | [E28][E29] | Lawyer | **[Q]** block Brazil in the app? After L0 |
| C-07 | Age: store users must be 18+; ECA Digital forbids self-declaration where it applies; no age signal from Seeker was found | [E22][E30] | Lawyer; client | Open |
| C-08 | Privacy policy and EULA; a deletion path for off-chain data; a plain statement that on-chain records are permanent | [E20][E21]; §8 | Site; app; ops | 17; checked again at 22 |
| C-09 | No untrusted web content: no WebView of third-party pages; names per A-11; outside links open the system browser | [E20] | App | 20 |
| C-10 | Campaigns opened by any wallet are user-generated content to a store: a "report this campaign" link, remedied by unlisting; the campaign stays on-chain and pays | [E20]; BR-01 | Site; app; indexer | 13; 21 |
| C-11 | Country gate in the site, the app and `brot-rpc`. Wallet screening sends addresses to a third party, which K-04 rules out without a founder decision and a privacy audit | [E32][E33] | Site, app, relay; founder | D5 |
| C-12 | Terms acceptance recorded when real money starts | [E21][E13] | H1 store | 17 |
| C-13 | Store, app and site copy without the calls to action that Google's real-money rules restrict | [E26]; P1 §4.6 | Listing; site; app | D-m, D6 |
| C-14 | Log retention if Brazilian law applies (Marco Civil art. 15: six months of access logs), against "never the IP" | [E31]; §8 | Lawyer | Open |
| C-15 | Paying and receiving SOL may count as a regulated financial service in some places; USDC's freeze authority no longer applies (D-a) | [E20] | Lawyer | L0 |
| C-16 | Listing assets: a 512 × 512 icon, screenshots of at least 1080 px, a short description of at most 30 characters, a signed release APK with its own key; review in 3–5 business days; each release minted as an NFT | [E23] | Ops | 22 |
| C-17 | Keys and CLIs per §7 and §10: a local build without keys, offline signing, the publisher wallet offline, `*.keystore` and `*.jks` in the secret scan, a rotation note | [E6]; `.claude/rules/secrets.md` | Ops; CI | 20 |

**What the app costs** (proposal §3.3) **[INF]**. A second front, so every screen and copy change happens twice; a
custom Expo build, polyfills and wrappers; a 3–5 business-day review per release [E23]. It does not add iOS.

**Done when** (proposal Phase 3, X3) **[DP]**. The app's MWA chain always equals `/api/v1/health.cluster`; a full
devnet cycle (connect, open a campaign, join, resolution, payout received) runs on a physical Seeker and one other
Android phone; process death never yields a second entry or opening; the bundle holds no paid key and imports the SDK
rather than a copy of its math; and, for Sprint 22, every C-item is checked, the company is the publisher and the
team's lawyer has signed off in writing, country by country.

### 3.4.18 Sprint 04 alignment (v0.1.3, 2026-10-09)

What Sprint 04 built and the decisions it implements (`docs/sprints/sprint-04-settlement-invariants.md`, "Closure
status"; session log `2026-10-09-sprint-04-*`). Where this section and the text above disagree, this section is what
the code does.

- **Late joins.** A join is late only on a YES price result, when its time is at or after the YES proof's
  `publish_time`. Late amounts leave V and P, come back whole to their baker, and pay no fee. `tally_late_joins`
  (discriminator 21) sums each entry's late totals and moves the rent of its `Join` accounts into the `Entry`.
  `finalize_campaign` refuses `NotTallied` while `entries_untallied` is not zero, for every outcome.
- **One account per join.** `Join` (`["join", campaign, baker, index as u32 LE]`, 96 bytes, tag 5) records each join;
  `Entry` (116 bytes) keeps `join_count`, `joins_tallied`, `late_yes` and `late_no`. The join's rent sits in the
  `Entry` and goes back to the baker when the entry settles (`LateTallied`, `EntrySettled`).
- **Cut-off move.** A campaign in review moves its cut-off back, and only back, to an earlier YES price proof, before
  any tally has started. The review window does not move. Any other second proof is refused with `CutoffNotMovable`
  (6147), after the reader's own refusals (`NotResolvableYet`, `ProofStale`) for a NO or a void.
- **Team voids and contests.** A team key voids only an automatic void (`TeamVoidNotAutomatic`, 6097 for a YES or
  NO). `team_open_contest` is disabled (`ContestExitDisabled`, 6096) until Sprint 14, because a contest would freeze
  the pot with no exit.
- **Creator share.** It comes from the losing side less the house fee, then from the house fee, and never from the
  prize: `C = floor((V + P) × creator_share_bps ÷ 10,000)`, `from_pot = min(C, P − fee)`,
  `from_fee = min(C − from_pot, fee)`, and the winners split `V + P + R − fee − from_pot`, never below V. The house
  fee is charged on the losing side. A team campaign has no creator share (I12).
- **Economic Viability Rule (decision of 2026-10-09).** A pot splits only when the losing side is larger than the fees
  that would come out of it (the house fee plus the creator share on V + P). Otherwise it resolves one-sided: entries
  come back net of their one-sided fees and the prize returns to whoever opened. Worked examples: V 990 / P 10 and
  V 98,900 / P 1,100 are one-sided, with or without the prize; V 990 / P 13 splits, and V 990 / P 12 does not. Open
  point for the founder: the decision's words say "fees charged on the winning side's principal", while the code
  charges the house fee on the losing side (see the sprint file).
- **Prize flag.** `settle_prize` sets `prize_settled` on every settlement, Split included (it pays nothing for a
  Split); `close_campaign` needs the fee, prize and creator-share flags, and finalize sets the share flag when no share
  is due.
- **Reserved creator share.** A reserved share blocks `close_campaign` unless the creator is the rent payer, in which
  case close pays it with the rent (`ReserveNotClaimable`, 6111, otherwise).
- **Rent.** Read from the `Rent` sysvar at the moment of use, never a constant. Devnet measured: 650,240 lamports for a
  zero-byte account at 5,080 lamports per byte.
- **Feed list.** `require_listed` refuses a feed outside the compiled list (`FeedNotOnList`, 6141): 63 feeds on
  mainnet, 17 sponsored feeds on devnet, measured on 2026-10-09.
- **Measured (LiteSVM, `scripts/measure-settle.ts`, `scripts/measure-cu.ts`).** `settle_entry` costs 2,926 to 3,180
  compute units per entry; a transaction holds 12 entries (1,152 bytes of the 1,232 allowed); one campaign account
  takes about 3,850 settlements per block under the 12,000,000 compute units of the account write limit (C7). The
  opening costs 19,466 compute units when free and 25,022 when paid. `brot_markets.so` is 158,072 bytes.

### 3.4.19 Sprint 05 alignment (v0.1.4, 2026-10-09)

What Sprint 05 built for the SDK, after three reviews (`docs/sprints/sprint-05-sdk-devnet-cycle.md`, "Record and
retrospective"; session log `2026-10-09-sprint-05-sdk-e-ciclo-devnet.md`). Where this section and the text above
disagree, this section is what the code does.

- **The package.** `packages/sdk` is `@brot/sdk` (renamed from `@brot-markets/sdk`), ESM with an `exports` map: `read`,
  `tx`, `schemas` and `idl`. The repository root links it as a workspace dependency, so tests and scripts import it as
  any client does.
- **T9, decided.** The Codama client generated from the Shank IDL is the SDK's codec and builder layer. The IDL carries
  neither the events' discriminators nor the PDA seeds; both are written in the SDK and checked against the program's
  source by `tests/sdk/contract-*.test.ts`. Error messages come from the IDL, not from the Codama errors module, which
  reads `process.env` and blanks them in production bundles. The 22 builders give the same bytes and slots as the test
  kit's hand-written ones.
- **`read`.** The money math as a TypeScript mirror of `math/` and `settlement/rules.rs`; the opening's rules
  (`validateOpenCampaign`) and the join's (`checkJoin`) in the program's order, each returning the program's error,
  each fed the program's own refused cases with the same verdict (`checkJoin`'s estimate equals the program's to the
  basis point); the opening quote (`price − conf`, a `max_lamports` 1% above the charge by default) and the whole
  debit, with the two rents and the network fee on top; `publicState` from the Clock sysvar; `recheck`, which finds a
  price resolution's event newest first, a page at a time (up to 10,000 signatures), skips malformed answers, and says
  `consistent` when a later read moved the only way its field can; the event decoder of §3.4.14, which reads inner
  instructions by index (`getTransaction`) or by address (`simulateTransaction`) and refuses data longer than the
  largest event before decoding it; one message per error code.
- **`tx` (A-3).** `prepareJoin` and `prepareOpenCampaign` re-read the accounts, check them in the program's order (the
  opening prices after it validates), build, summarise the compiled bytes the wallet signs, and simulate; `ok` only
  when all of it passed, and the result carries the unsigned transaction the summary describes. `summarizeMessage`
  accepts legacy and v0 messages without lookup tables, names the fee payer (refused if it is not the signer named)
  and counts the base fee and the priority fee. It trusts this program's instructions only as the IDL shapes them
  (exact data size, account count and roles, the fee payer allowed in any slot) and compute-unit limits and prices,
  the priority fee `ceil(price × limit / 10^6)` bounded (1,400,000 units when no limit is set) and capped at 0.001 SOL
  unless the caller sets another cap; anything else is untrusted. It names the campaign a join points at, an opening's
  target in the feed's units, its creator, the SOL price below which its payment is refused, its terms and every value
  an admin act signs. A join signs a `min_return_bps` 1% below its estimate by default (at most 20%), and a retry passes
  the saved `expectedEntryTotal`, so a join that already landed is refused rather than doubled (A-9). The simulation
  names a custom error only when the instruction that failed is this program's.
- **`schemas`.** The opening's input (Appendix B) in zod 4.6.5, with `deadlineAt` for every kind, as the program
  requires. It is its own entry point: zod 4's ESM build does not bundle under React Native 0.87.1's Babel preset.
- **The vectors (X0.3).** `tests/vectors/math-vectors.csv` (Sprint 04) and `tests/vectors/snapshot-vectors.csv` (new:
  the finalize snapshot, about a sixth of its rows at the viability threshold, the entry payout, the join estimate,
  the schedule), 24,000 rows, replayed with 0 mismatches in Bun and on Hermes.
- **The boundaries.** `bun run lint:sdk`: dependency-cruiser 18.4.0 (`read` and `schemas` never import `tx`; `read`
  and `tx` never import `schemas` or zod; no Node built-in, React, Next.js, React Native, web3.js v1 or Anchor in the
  SDK; the indexer and the relay import no `tx`), the SDK's ES2022-only typecheck, and `scripts/sdk-portability.ts`,
  which refuses any name declared only by Node, Bun or the DOM. `tests/sdk/boundaries.test.ts` plants one violation of
  each rule in a copy of the SDK and fails unless every rule fires.
- **React Native.** `tests/react-native/` bundles both halves with Metro 0.87.1 for Android as React Native 0.87.1
  bundles a release, compiles them with that version's hermesc (Hermes 1.0.0) and replays the vectors on Hermes v0.13.0's
  VM, pinned by SHA-256; CI runs it as "Mobile bundle" from Sprint 05's pull request on. The bytecode itself ran once,
  by hand, on a 1.0.0 VM built from its tag. The app must add `crypto.subtle.digest` (SHA-256, for every PDA) and
  `crypto.getRandomValues` (the campaign id) (`knowledge-base/tecnologia/sdk-react-native.md`).
- **The test kit uses the SDK.** Every transaction a LiteSVM test sends has its events decoded by the SDK: the fields
  are cross-checked for the 7 events the kit lays out by hand, and Sprint 04's other 11 by discriminator and size
  against the Rust source. The common flows are built by the SDK's builders.
- **Settlement order.** Every campaign with entries needs one `tally_late_joins` per baker after `resolve_campaign` and
  before `team_confirm_result` or `finalize_campaign`, whatever its kind and outcome (`NotTallied`, §3.4.18); the
  keeper of Sprint 06 follows the same order.
- **The devnet deploy is prepared, not run** (`deploy/devnet/README.md`, `scripts/deploy/`): CI's artifact by run id,
  bound to the commit the operator reviewed (`--expect-commit`), from a checkout that contains it with the program,
  its build inputs and its IDL unchanged, the artifact's IDL byte for byte the checkout's, `SHA256SUMS` first and the
  binary's hash typed again at `--execute`; key files outside any Git work tree, mode 600; the program keypair only from
  its backup and only at the declared id; loader v3 only; a preflight of the program id, its ProgramData and the config
  address and of the balances each key needs; then `admin_initialize_config` and `admin_set_team` in the same session,
  the admin proven by its key or typed; an idempotent `--resume` for a deploy whose initialization did not land. It
  waits on the founder: the deploy path, who holds the upgrade key (Q12, §14.2), the keypair backup, the drill or real
  values and the devnet keys (`docs/sprints/sprint-05-sdk-devnet-cycle.md`).
- **The scripts.** `smoke:devnet` and `seed:devnet` run in SOL on the SDK, locally by default and on devnet only with
  `--cluster devnet`; `scripts/team/` holds one command per team act, each simulated unsigned and sent only with
  `--yes`; a void's text, free of emails, handles and URLs, is saved in `content/void-log/` with its SHA-256 on-chain.
  No script imports `app/lib` any more.
- **The local cluster.** `solana-test-validator` 3.1.10 needs AVX2; on the development machine the rehearsals and the
  negative run (the 373 slot cases, 50 rule refusals, a paid opening equal to the SDK) run on Surfpool 1.5.0
  `--offline` in a loopback-only network namespace. Surfpool is LiteSVM-based: a run on Agave's runtime is carried to
  Sprint 06 (`knowledge-base/tecnologia/devnet-o-que-so-o-cluster-mostra.md`).
- **Loader v3 stays.** Agave's current feature set declares Loader-v4's enabling gate as
  `LoaderV4WasAbandoned11111111111111111111111` and holds no gate that stops new loader-v3 deployments [F] (read on
  2026-10-09, `anza-xyz/agave`, `feature-set/src/lib.rs`, branch `master`).
- **Open: anyone can make a program id undeployable on a cluster.** Lamports sent to the ProgramData address of an id
  not yet deployed make `solana program deploy` fail for good ("Create Account ... already in use"), and no key can move
  them out [F] on the local cluster (Surfpool, on LiteSVM); the same on devnet [INF], since LiteSVM runs Agave's loader
  code. The id `6G2d…uVN` is public. The dry run
  names the case; the remedy is a new id. For mainnet, a fresh id kept unpublished until its deploy (Sprint 18).
- **Open: the team's finalizing paths emit no `CampaignFinalized`.** §3.4.3 and §3.4.14 say `team_confirm_result` and
  `team_void_campaign` emit their event, then `CampaignFinalized`; the Sprint 04 code runs the snapshot but emits only
  `ResultConfirmed` or `CampaignVoided` [F] (`instructions/resolution/team_confirm_result.rs`,
  `team_void_campaign.rs`). An indexer that follows events must read the snapshot from the `Campaign` account for those
  campaigns until the program emits it; the fix belongs before the indexer (Sprint 08).
- **Open: the deploy-slot check (A-8) belongs in the SDK.** Planned for the site in Sprint 11, it guards every client
  that signs, so `prepare*` should refuse when ProgramData's last-deploy slot differs from the one expected (A-6).

## 4. Data model

Four places hold data. Only the first decides anything about money.

| Place | What | Rebuildable | Section |
|---|---|---|---|
| On-chain accounts | `GlobalConfig`, the fee vault, `Campaign`, the campaign vault, `Entry`, `ReferralLink` | It is the source | §3.4.1 |
| The indexer's SQLite file | Projections of the program's events, ranking, points, KPIs; two evidence tables | Yes, except the evidence tables (A-4) | This section; Appendix B |
| `content/` in Git | Hand-written files, reviewed by two people | It is a source | This section |
| The visitor's device | Theme, "Saved" list, MWA `auth_token`, the pending-entry snapshot | No; losing it costs nothing on-chain | §3.6, §3.7 |

**Indexer tables** (proposal §2.8, Appendix B; names follow D6) **[DP]**. One writer (the ingest), readers in the API;
WAL mode; behind a small adapter (§3.5).

| Table | Holds | Kind |
|---|---|---|
| `events` | Every decoded event, keyed by `(signature, ix_index, inner_index)`, with slot, block time, campaign and `seq`; amounts as lamport strings | Rebuildable |
| `campaigns` | One row per campaign: kind, metric account, target, creator and `creator_is_team`, `creator_share_bps`, `template_version`, opening payment, price, prize and held fee, status, outcome, `void_reason`, pools, times, `last_seq`; derived `listed` and `rank` | Rebuildable |
| `entries` | Every entry, with baker, side, amount, `is_creator` and both pools after it, for the history of the split | Rebuildable |
| `settlements` | Every payout, with recipient, `role` (`baker`, `creator`, `opener`), amount paid, `reserved`, mode | Rebuildable |
| `points` | Devnet points per wallet (Q7) | Rebuildable |
| `referrals` | Links and the fee per referred winning entry (Sprint 14; TP v0.0.1 §3.5) | Rebuildable |
| `feed_history` | Every update of each sponsored feed with an open campaign | **Evidence**, snapshotted nightly |
| `referral_payouts` | The weekly payout ledger, with its basis and transaction | **Evidence**, snapshotted nightly |
| `checkpoints` | Ingest position per source | Rebuildable |

Every row keeps `signature`, `seq` and `block_time` where it comes from an event (TP v0.0.1 §3.5). A store for H1
sign-in challenges, if H1 is ever approved, is a separate, backed-up file owned by a write unit, never the indexer's
(proposal §2.8).

**Content files** **[DP]**. Each has a JSON Schema checked in CI (the data-contracts table, §3.1).

| File | Holds | Read by | Rule |
|---|---|---|---|
| `content/account-names.json` | Display names and explorer links of accounts that two people reviewed | Indexer (`/api/v1/names`), site, app | Not a gate (D-i): an unnamed account can still be used and shows its shortened address (A-11). Never token metadata the token's owner can change |
| `content/partners.json` | Which campaign belongs to which launch partner; the sealed entry's name and seal; highlight dates | Indexer (ranking, partner report), site | A team key opens each partner campaign and stays its `creator` with `creator_share_bps = 0` (P-3) |
| `content/void-log/` | The public text of each void, next to the on-chain `VoidReason` | Site (register) | Every void records its reason (P4 §4.6; BR-45) |
| `content/powers.md` | Who holds which key and power | Site (register) | BR-41; P4 §4.2 |
| `content/suggestions.json` | **Removed**: the suggestions page leaves with open creation (P1 §4.1) | — | — |

**What the prototype's mock data becomes** (TP v0.0.1 §4, with the D6 names; `prototype-lab/shared/mock-data.js`)
**[DP]**.

| In the mock | Becomes | Lives in |
|---|---|---|
| `markets[].id`, `cat` | `Campaign` id (the client-drawn u64); the reader kind, one of five | Chain |
| `name`, `icon`, `bg`, `tone` | A reviewed display name (A-11) or the shortened address; colour by kind | `content/`; site |
| `title` | The sentence the site generates from the stored fields, by `template_version`; no text on-chain (D-j) | Site |
| `yes` (a YES price) | **Leaves.** The YES/NO split, `pool_yes ÷ (pool_yes + pool_no)` | Computed |
| `volume` | Two totals, `pool_yes` and `pool_no`, plus the prize | Chain |
| `days`, `deadline` | Two moments: `entries_close_at` and `deadline_at` | Chain |
| `field`, `current`, `target`, `progress`, `proof`, `address` | A live read of the metric account; the target | Chain |
| `history` | The history of the split | Indexer (`entries`) |
| `resolved` | `status`, `outcome`, settle mode, `review_ends_at` | Chain |
| `upcoming[]` | **Leaves.** No public state exists before "open" | — |
| `activity[]` | `entries`, `settlements`, `events` | Indexer |
| `leaders[]` | `points`; profit and volume do not score | Indexer |
| `wallet.positions[]` | The wallet's `Entry` accounts; after payout, the indexer | Chain, then indexer |
| `sponsors{}` | The opening's prize and creator on-chain; seal and name in `content/partners.json` | Chain and Git |

What the mock lacks and the system needs: identifiers (`id`, `signature`, `seq`); record owners (`baker`, `creator`,
`rent_payer`); times; roles (`team`, `admin`, the operating level); the audit trail (events, `VoidReason`,
`content/void-log/`); and the program states that have no public name (`InReview`, `Contested`, `Settling`).

## 5. Auth model

| Who | How they are identified | What they can do |
|---|---|---|
| Visitor | Not identified | Read everything |
| Baker | Signs the transaction with their wallet; no signup, session or cookie (K-03) **[FD]** | Join a campaign; receive what is theirs; call any permissionless instruction |
| Creator | Any wallet that signed `user_open_campaign` and paid the opening | Open campaigns within the rules; join their own (BP-14); receive the 1%. Never choose the fee, the share, the opening price or any text |
| Team | A key in `GlobalConfig.team`, one per person | Confirm, void or contest within the window; pause entries; open campaigns free, with no creator share, for the team or a launch partner (D-c, D-d, P-3) |
| Company | The 2-of-3 hardware multisig on mainnet (`admin` and upgrade authority); a team-held key on devnet | Creation parameters, resuming entries, team keys, contest decisions, upgrades, the fee recipient (§3.4.9) |
| Services | Keeper wallets 1 and 2, SOL for network fees only | Call permissionless instructions; nothing else |

The signature identifies; the PDA derived from campaign and wallet says whose record it is. The site, the API and the
app have no login, no admin route and no write endpoint **[DP]** (TP v0.0.1 §5).

**Mobile Wallet Adapter: no backend handshake (H0)** (proposal §3.5) **[DP]**. MWA's handshake runs between the site
or app and the wallet: an intent with a `solana-wallet:/v1/associate/local?...` URI, a local WebSocket, an ECDH P-256
key agreement and AES-128-GCM encryption [E1]. The site caches the `auth_token` in `localStorage`, the library's
default [E4]; the app keeps it in device storage; the backend never sees it. Joining and opening are signed
transactions, and entries are public by address. This keeps K-03.

**Sign-in, only for an off-chain write the founder approves (H1)** (proposal §3.5) **[DP]**. Examples: a notification
opt-in, the terms-acceptance record of C-12. If approved, it runs in its own write unit (`brot-signin`) with a backed-up
store: `POST /api/v1/siws/challenge` returns a full SIWS input (domain `brot.markets`, uri, chain id, statement, a
single-use nonce of at least 8 alphanumeric characters bound to the purpose and a payload hash, issued and expiry
times, +300 s); the wallet signs it through `authorize`; `POST /api/v1/siws/verify` checks the ed25519 signature with
`verifySignIn` (`@solana/wallet-standard-util` 1.2.0), that the key is the address in the message, and the domain,
chain id, nonce, expiry, purpose and payload hash; then it consumes the nonce and stores the one approved write, with
no cookie and no session [E12][E13]. MWA gives the wallet no verified web origin (C36 **[AC]**), so a phishing page
could relay a signature made for brot.markets: never accept a contact point without proof through a second channel.
Every H1 write is personal data and needs the privacy audit (§8).

**Operations.** The only inbound secret on the server is the HMAC of `POST /restart`, on a separate ops host that
exposes only `GET /healthz` and `POST /restart` (TP v0.0.1 §5, §12) **[DP]**.

## 6. API conventions

**On-chain** **[DP]** (TP v0.0.1 §6; proposal §2.1).

- One error code per point of failure, with a test; each refusal of `user_open_campaign` has its own code (X0.7).
- One event per instruction, plus `CampaignFinalized` where an instruction also finalizes, emitted by self-CPI (T4);
  campaign-scoped events carry the campaign and its `seq` (§3.4.14).
- Amounts in lamports as `u64`; arithmetic in `u128` with checked math; fees rounded up and payouts down (§3.4.16).
- Entries move from the baker's wallet to the vault by System Program CPI, signed by the baker; payouts debit the
  program-owned vault and credit the recipient's wallet directly, with no token account (§3.4.4–§3.4.5).
- Instruction names follow `who_verb_object` (`user_`, `team_`, `admin_`, or none for permissionless ones), with the
  D6 identifiers.

**Off-chain: the read API** **[DP]** (TP v0.0.1 §6; proposal §1.6, §2.3). Read-only JSON under `/api/v1`.

| Convention | Rule |
|---|---|
| Values | Amounts as lamport strings; addresses in base58; times in Unix seconds, UTC. A US$ value is display-only and carries its source and time |
| Freshness | Every list response carries `as_of_slot` and `chain_time` (A-7) |
| Errors | `{ "error": { "code", "message" } }`, never a stack trace. An unknown query parameter returns 400 |
| Rate limit | In memory, keyed on `cf-connecting-ip` and per /64 for IPv6, because `x-forwarded-for` can be forged; nothing is stored |
| Caching | `Cache-Control` with `s-maxage` of 2–10 s, plus a Cloudflare Cache Rule with a cache key of the known parameters, since `s-maxage` alone does not cache JSON at paths without a file extension (C28 **[AC]**) |
| Change | Only by adding fields. `schema_version` is in `/api/v1/health` |
| Schemas | zod, in `@brot/sdk/read`, shared by the indexer, the site and the app; contract tests (Appendix B) |

| Route | Returns | Sprint |
|---|---|---|
| `GET /api/v1/campaigns` | Campaigns with `rank`, `listed` and filters | 08 |
| `GET /api/v1/campaigns/:id` | One `CampaignDTO` (Appendix B) | 08 |
| `GET /api/v1/campaigns/:id/activity` | Entries, settlements and events of one campaign | 08 |
| `GET /api/v1/campaigns/:id/chance` | The history of the YES/NO split | 08 |
| `GET /api/v1/activity` | Recent activity across campaigns (X1.4) | 08 |
| `GET /api/v1/wallets/:address/entries` | One wallet's entries, results and payouts ("my entries") | 08 |
| `GET /api/v1/leaderboard` | Devnet points | 08 |
| `GET /api/v1/names` | Display names from `content/account-names.json` and the pinned Pyth feed list | 08 |
| `GET /api/v1/price` | SOL in US$, with source and time | 08 |
| `GET /api/v1/health` | `program_last_deploy_slot`, `schema_version`, `cluster`, `entries_allowed` | 08 |

`campaigns`, `campaigns/:id`, its `activity` and `chance`, `wallets/:address/entries`, `leaderboard` and `health` are
TP v0.0.1's routes under the D6 names; `/api/v1/activity`, `names` and `price` come from the proposal's
Phase 1 and §2.8 (X1.4). The partner report has no public route; it is a team export without addresses.

**Off-chain: `/rpc`** **[DP]** (proposal §1.6, §2.6). JSON-RPC 2.0 over HTTPS through `brot-rpc`, with the content
allowlist, no batches, 8 KB bodies and a weighted rate budget of §3.5. Signature status is polled with
`getSignatureStatuses` and `getBlockHeight`; clients get no WebSocket.

**Event decoding.** The indexer, the site and the app decode events with the four rules of §3.4.14 (proposal §2.3);
`app/lib/history.ts:28,37` already applies the first **[F]**.

**Operations endpoints** **[DP]**. `GET /healthz` per service; `POST /restart` on the keeper, with HMAC-SHA256 over
timestamp and body; the keeper checks the signature and the timestamp (TP v0.0.1 §3.5, §7; proposal §1.6).

## 7. Security baseline

**The baseline (`.claude/rules/security-baseline.md`) applied here** (TP v0.0.1 §7, updated) **[DP]**.

| Rule | In this product |
|---|---|
| Secrets never in code | Secrets only in root-owned `0600` files, loaded with `LoadCredential=`, never in the environment (§11, §12; T13). `.env.example` files without values; the commit hook **[F]** (`.claude/hooks/block-secret-commit.js`); a secret scan at every sprint closure |
| Authentication before the sensitive feature; authorisation separate | Signatures and roles exist in Sprint 02, before any instruction moves SOL. Every instruction checks whose account it is, by hand, in the `checks` module (§3.4.17) |
| Never trust the client | The program recomputes every value; the site, the app and the keeper only simulate. No creation rule lives only in the site (A-10) |
| Test with two users | A cannot receive, close or redirect B's entry; cannot receive B's creator share or refund; cannot open free without a team key; cannot send the fee vault anywhere but `fee_recipient` |
| Admin routes, limits, errors | No admin route; limits on `/api/v1` and `/rpc`; no stack trace |
| Service keys server-side only | Keeper wallets, RPC keys, the Hermes key, the CoinGecko key, the HMAC secret and the tunnel token never in a `NEXT_PUBLIC_` variable or a client bundle (A-5) |
| Least privilege; signed webhooks | One RPC account per service; the Cloudflare token limited to the tunnel; `POST /restart` checks HMAC and time. No inbound webhooks |
| A leak | Rotate first. A keeper wallet has no on-chain privilege: generate another and move its SOL. A leaked team key opens free campaigns: remove it through the multisig. Record it in `session-log/` |

**Risks of this design** **[DP]**.

| Risk | Answer |
|---|---|
| Whoever calls initialisation first becomes admin | Only the upgrade authority initialises, checked against the ProgramData account; deploy and initialise in the same session (TP v0.0.1 §7) |
| A forgotten account check under Pinocchio | One `checks` module; a negative test per check that fails when the check is removed (T24, X0.9); the auditors read it first (§3.4.17) |
| An account revived after close | `close` moves all lamports, zeroes the data and reassigns to the System Program; the tag check refuses a revived account (proposal §2.1) |
| A vault address funded before opening | Creation tops up, allocates and assigns instead of failing (proposal §2.1) |
| A forged or foreign event misleads the indexer | The four decoder rules of §3.4.14 |
| Site taken over, asking for malicious signatures | Hardware second factor on the domain, Cloudflare, the server and GitHub; branch protection when available; pinned versions; the deterministic summary before every signature (A-3) |
| A process reads another's secrets on the shared server | Per-unit identities, `LoadCredential=`, `ProtectProc=invisible`, `ProcSubset=pid` (§12; T13). Today the tunnel token sits in the environment of a unit running as `brot` **[F]** (`services/landing/deploy/brot-tunnel.service`) |
| A leaked team key | Every team-key opening is an alert; the multisig removes the key; `max_open_campaigns` bounds the burst (proposal §2.10 item 8). The valve is shared, though: a leaked team key, or about US$50k of paid openings (1,000 of them at US$50 each once the prizes return to the opener, §3.4.10) **[INF]**, can hold it full for up to 90 days, the longest duration, and so stop every other opening (Sprint 02 review, finding 2). A separate budget for free openings, or voiding an empty `Open` campaign, waits for the founder **[Q]** (§14.2) |
| Supply chain | `bun.lock` resolves from `registry.npmjs.org` since the opening of Sprint 02, before any new npm dependency (T15): a root `bunfig.toml` pins the registry whatever a developer's `~/.npmrc` says, and `bun install --frozen-lockfile` checks every tarball against the lockfile's sha512 **[F]** (commit `7d770ce`). Exact versions for program crates and mobile tools; Bun's install-script block kept, with no `trustedDependencies` entry added without review. The two that existed, `sharp` and `unrs-resolver`, were reviewed and removed in the same commit (C30) **[F]**. A compromised `@solana/web3.js` release already happened once [E66] |
| Android signing keys | Build locally without keys, sign on an offline machine, keep the publisher wallet on hardware or offline (C37 **[AC]**), `*.keystore` and `*.jks` in the secret scan (C-17) |

**Before mainnet.** The founder's criteria **[FD]** (P4 §3.4, with the cap removed by D-h) and what makes them
checkable. Mainnet needs both audit reports and the 2-of-3 multisig; there is no cap criterion any more.

| Requirement | What counts as done |
|---|---|
| External audit | Both firms report on the exact version; every serious finding is fixed and re-checked by whoever raised it; the reports are public. Minimum scope: `checks`, opening (with the Pyth charge and the creator share), joining, resolution, settlement, payout, the five readers, sponsorship and configuration. Whether both firms review Pinocchio was not found (P4 §8) |
| 2-of-3 multisig | Owns the upgrade authority, `admin` and the `fee_recipient` account, on hardware devices, with a public 24–48 h wait and a test signature. The product is chosen in Sprint 16 (T7, C11) |
| Creation rules in the audited version | Proposed by the BP (BP-17, open in P-9): the opening rules, the Pyth charge and the 1% are frozen into the audited version (Sprint 16) |
| Verifiable build | `solana-verify build` in CI and `verify-from-repo` after deploy [E82]; a public repository at the deployed commit |
| Pause and incident plan | The pause tested with I10′; one page: who pauses, who speaks, where it is published, how fast, and who replaces the CTO on alerts (P4 §4.5, §5.1) |
| Keys | No internet-connected key with power over money; where each key lives and how to rotate it is written down |
| Full cycle and notice | One cycle on devnet and one on mainnet with a minimum pot; "Programa ainda sem auditoria" shown while true; every alert to two inboxes; a named reviewer per day |

**Deliberately deferred.** Token-2022 and the contest with a deposit (phase 1.2); a second oracle (L-14, T8); a key
vault for the keeper (before mainnet); the short entry close with a second team signature, until there is traffic (P1
§3.6); early exit (phase 2, P1 §3.10). The per-campaign cap, deferred in v0.0.1, is now removed (D-h).

### 7.1 Deferred in Sprint 00

The security-baseline rule asks to record here what was deferred on purpose. The adversarial review that closed
Sprint 00 found nothing critical; these are its deferred findings (`docs/sprints/sprint-00-setup.md:134-144`), re-read
for Pinocchio and SOL, with the sprint that inherits each.

| Finding | Risk while open | Sprint |
|---|---|---|
| Attest the origin of the `.so`; reproduce its hash with `solana-verify` | Whoever compromises the build job delivers a binary with a matching hash | 16 |
| Pin the SHA-256 of tools downloaded in CI (the Solana installer; the Anchor binary until it leaves in Sprint 03); build the deploy artifact without cache | A compromised tool source compromises the program | 16 |
| Build and publish the `mainnet` variant under its own name and check the cluster at deploy. With D-a there is no USDC address to store any more; the `mainnet` feature now only keeps the real review window and minimum duration (T12), and CI checks that the mainnet artifact carries the real values | Deploying the devnet variant, with drill constants, to mainnet | 16; the CI check from 02–04 |
| Secret-scan patterns: base58 keys, URLs with credentials, hex secrets, binaries; now also `*.keystore` and `*.jks` | One of these formats enters the repository unseen | 16 (gitleaks, per `docs/technical/registry-pick.md`); the Android patterns in 20 |
| `CODEOWNERS` for `.github/`, the scan and the hooks; protection of `main` | A direct push to `main` skips review. Branch protection is not available on a private repository of the free plan **[F]** | 16 |
| `bun.lock` resolved through `registry.npmmirror.com` | A third party's availability in every build; hashes never compared with the official registry | Done at the opening of Sprint 02, before the Codama spike (T15, commit `7d770ce`): `bunfig.toml` pins `registry.npmjs.org`, and a fresh-cache frozen install fetched 705 tarballs from it, every sha512 matching **[F]** |
| The upstream chat route, with a server key and a bypassable limit | With a key set, a free general-purpose model paid by the company | 09: removed (D-q); until then, no key anywhere |
| Download the artifact by run id; keep the program-address keypair outside `target/` | Deploying the wrong artifact, or losing the program address | 05 |
| A backup copy of the program-address keypair, today only in `target/deploy/` | Losing the address of the deployed program | The founder, before Sprint 05 |

## 8. Privacy and compliance baseline

Joining or opening a campaign collects no personal data, and the KPIs are computed without it (K-04) **[FD]** (TP
v0.0.1 §8; P2 §6.3). Three points remain, each answered with the nine questions of `.claude/rules/privacy-audit.md`.
v0.0.1's fourth column, the X username shown on the suggestions page, leaves with that page (P1 §4.1).

| Question | Wallet address | Visitor IP address and country | The Android app's device data **[INF]** |
|---|---|---|---|
| 1. What data | A public address and the entries, openings and payouts linked to it: pseudonymous, but linkable to a person | IP and country | The MWA `auth_token`, the pending-entry snapshot and the opening `id` |
| 2. Why | "My entries", activity, ranking, the creator flag | Limiting abuse; the country switch, if on | Surviving process death while the wallet signs (A-9) |
| 3. Where | On-chain, public and permanent; a copy in SQLite | In memory only; never on disk | On the device only |
| 4. Who can access | Anyone | The process only | The app on that device |
| 5. Control | None: it is public | No person reads it | Android's app sandbox |
| 6. Retention | On-chain, forever | Minutes | Until the transaction is confirmed or expires; the `auth_token` as long as the wallet allows [E1] |
| 7. Logs | Services log signatures, campaigns and wallets; never an IP or an email (proposal §2.11) | Cloudflare's logs follow Cloudflare's account (C13 **[AC]**) | None sent |
| 8. Deletion and export | The copy can be deleted; the chain cannot. The site says so before the first entry | Nothing to export | Clearing the app's data deletes it |
| 9. Document or consent | The privacy policy explains that entries are public and permanent (L-21; C-08) | The policy names the limiter and Cloudflare | The app's privacy policy (C-08) |

With no personal data: the program (public keys only), the keeper and the indexer, which copies the chain. There are no
visitor statistics; if they come in, the nine questions return (TP v0.0.1 §8). Cloudflare's zone still tries to inject
its analytics script (seen 2026-10-05); the site's CSP blocks it, so nothing is measured, and turning it off in the zone
waits for the founder (K-10; `CHANGELOG.md`, open items; §14.2). The partner report carries volume and wallet counts,
never addresses.

**What re-triggers the audit** (proposal §2.10, §3.5, §3.7, §3.9, §3.10) **[DP]**. Any H1 write (a notification
opt-in, the terms-acceptance record of C-12); push notifications of any kind; the Seeker Genesis Token signal, which
ties a wallet to a device; wallet screening through a third party (D5 (c)); and a backend attestation of each entry
(D5 (b)), which would see wallet and IP together. Each needs a founder decision first, because K-04 rules them out by
default.

**Compliance points the lawyer owns** (L0). The C-items of §3.7, of which C-07 (age), C-11 (screening), C-14 (Marco
Civil log retention against "never the IP") and C-15 (SOL as a regulated service) touch this section. The privacy
policy and EULA are Sprint 17 (C-08). The privacy audit runs before closing Sprints 08, 13 and 17 (roadmap gate 5),
and C-08 is checked again for the store at Sprint 22 (X3.5).

### 8.1 The provisional site: the waitlist email

On 2026-10-05 the founder asked for a "coming soon" page with an email waitlist (`services/landing`). It is the first
personal data the project keeps off-chain. The nine questions, answered before the merge (TP v0.0.1 §8.1, carried
over unchanged in substance) **[DP]**:

| Question | Answer |
|---|---|
| 1. What data | The email address, the date and time of sign-up, and the version of the consent sentence. Nothing else: no IP, no browser, no wallet |
| 2. Why | To tell subscribers when the product opens on devnet and, later, when it opens with real money. The basis is consent, given by sending the form, which carries the sentence right below the field |
| 3. Where | A text file, `/var/lib/brot-markets/leads/leads.jsonl`, on the project's server in the United States. The privacy page names the country |
| 4. Who can access | The site's service, as user `brot`, and whoever administers the server: Lucas and Ronaldo. The server's other projects cannot read the folder |
| 5. Control | File permissions (folder 0700, file 0600). No panel or route lists the list. The API answers "ok" both to someone already on the list and to someone leaving who is not on it, so it never reveals who signed up |
| 6. Retention | Until the person leaves, or twelve months after sign-up. The service deletes expired lines itself, at start and every 24 hours |
| 7. Logs | The service logs only counts ("lead added (total N)"): never the email, never the IP. The visitor's address is the limiter's key, in memory, for one minute. Cloudflare's logs follow Cloudflare's account (C13 **[AC]**) |
| 8. Deletion and export | The form at `/privacy` deletes at once. Export on request through X: the record is the items listed on the privacy page. There is no backup of the file, so deleting is final; if a backup ever exists, its retention goes here |
| 9. Document or consent | The `/privacy` page, in English, and the versioned consent sentence (`CONSENT_VERSION`). The site has no visitor statistics and no cookies |

**Accepted risks, with the reason.**

- **No confirmation email.** Someone can sign up another person's address. The consequence is one notice email, and
  the person leaves through the form. Confirming would need a sending service, which the project does not have yet.
- **Leaving without proof of ownership.** Whoever knows an address can remove it. The harm is not receiving the notice.
- **The privacy text has not been reviewed by a lawyer** and names no company, because none exists yet. It goes into
  the legal review before mainnet (L-20, L-21), now the team lawyer's written review (L0, D-s).
- **The contact channel is X.** The domain has no email address yet.

The founder's earlier decision that the investor list holds business contacts (P2) does not cover this list: here,
people sign up.

**Facts read in the code on 2026-10-08** **[F]**.

- Each line holds `email`, `at`, `consent` and `source` (`services/landing/lib/leads.mjs:57`). `source` is the
  constant `"landing"`, not personal data, but the privacy page lists only the email, the date and time and the
  consent version, and calls that "the whole record" (`services/landing/public/privacy.html:38-43`). The page, the
  README sample and this table should name the same fields (C31 **[AC]**).
- `CONSENT_VERSION` is `"v1-2026-10-05"` (`lib/leads.mjs:12`); the store caps the file at 50,000 lines
  (`lib/leads.mjs:46`); the limiter allows 5 requests a minute per address (`server.mjs:110`); request bodies are
  capped at 2,048 bytes (`lib/api.mjs:10`); retention is `RETENTION_MS = 365 days` (`server.mjs:20`). Changing the
  retention means changing the privacy page too, and changing the consent sentence means raising `CONSENT_VERSION`
  (`services/landing/README.md`).
- The privacy page still states the purpose with the old product words (`privacy.html:50`), which D6 replaces. A new
  purpose wording is a change to what people consented to, so it goes through this table before it ships.

**When the landing leaves (Sprint 09)** **[Q]**. No source says what happens to the waitlist file, its twelve-month
purge and the deletion form at `/privacy` when `brot-web` takes the address, nor to `/pitch` and `/pitch2`. Either
the new site keeps a deletion path and the purge running until the last line expires, or the list is used for its
stated purpose and then deleted. The founder chooses before Sprint 09 closes; the choice is recorded here.

## 9. Testing strategy

| Layer | What is tested | Tool | Sprint |
|---|---|---|---|
| `checks` module | One negative case per check of §3.4.17 (owner, signer, writable, tag, PDA, length, creation, closing, System Program id, upgrade authority, event accounts, top level, `distinct`), each failing when its check is removed (T24, X0.9) | `cargo test` with `mollusk-svm` 0.14.0 on the SBF binary (0.15 and later need a Rust above 1.89, §1); LiteSVM for each slot | 02 |
| Readers | Each against real captured accounts; truncated or malformed accounts give an error, never a panic | `cargo test` with `tests/fixtures/*.bin` **[F]**, checked by SHA-256 in `tests/fixtures/index.json` | 01, 03 |
| Money math | Fee, one-sided fee, creator share (both readings, the literal one as a test oracle), opening conversion, schedule and rounding as pure functions; the BP's examples as cases | `cargo test`; `bun test` in `packages/sdk` | 02–04 |
| Math vectors | At least 10,000 vectors generated by the Rust pure functions, replayed against the TypeScript mirror, one-sided, void and opening conversion included (X0.3) | `bun test`; the app's test runner in 20 | 04–05 |
| Instructions | One test per instruction and per error code; every transition, allowed and forbidden; each refusal of `user_open_campaign` (X0.7) | `bun test` with LiteSVM | 02–04 |
| **Invariants, randomized** | With a fixed seed, hundreds of random operations (open, join, pause, send SOL by hand, advance the clock, resolve, void, settle out of order and twice, credit an empty wallet below rent), with I1–I15 checked after each (X0.1) | `bun test` with LiteSVM, the method that already exists **[F]** (`tests/pred-provable.test.ts`) | 04; extended in 14 and 15 |
| Two users; one-sided pots | A against B on every owned account; one case each for winners only, losers only, nobody, a single baker, with and without a prize, a team opening | `bun test` | 02–04 |
| Price reader | Fresh, stale, wide-confidence, wrong-feed and fake accounts; a touch inside and outside the window; the SOL/USD charge; `StaleFeed` | LiteSVM with captured accounts; Surfpool 1.6.0 with its Pyth model | 02–03 |
| Retry guards | A retried entry fails through `expected_entry_total`; a retried opening fails on its `id` (X0.5) | `bun test` | 02 |
| Decoder and contracts | Forged, failed, duplicate and lookup-table events; zod contract tests of the read API; JSON Schema of `content/` | `bun test` | 05; 08 |
| Services | The keeper loop, batch dropping, the watchdog with the primary down, ingest, rebuild, relay rules, ranking and listing (X1.9) | `bun test services/` | 06–08 |
| Failover drill | On devnet, with the primary stopped, the standby takes over within the watchdog's timings (§3.5) and the email reaches both inboxes. Run without `/rpc` load in 07, then repeated under `/rpc` load in 08, once `brot-rpc` exists (X1.2) | By hand, on devnet | 07; 08 |
| Load | 1,000 open campaigns on Surfpool: one keeper cycle within 60 s (X1.8); `/api/v1/campaigns` p99 at or under 300 ms at the origin with 20 clients (X1.5) | Surfpool; `autocannon` | 06; 08 |
| Full cycle | Open, join, resolve, window, payout, with the real keeper and a non-team creator who pays (X0.2) | `bun run smoke:devnet`, rewritten for SOL | 05 |
| Web | Flows, states, copy and the creation box at desktop width and about 412 CSS px, with an injected test wallet, on Surfpool | Playwright, pinned in 11 | 11; 13; 19 |
| Wallet in-app browsers | Phantom and Solflare on Android and iOS, opening a campaign included (X2.2) | Checklist | 09–13 |
| MWA | Association, authorize, sign-and-send, error paths | `solana-mobile` 0.5.0 emulator and fake wallet [E2][E6] | 09; 20 |
| SDK under React Native | Same math, PDAs and decoders as the site | The app's test runner with the Rust vectors | 05; 20 |
| App end to end | Join, open, retry guards, report link | An Android UI test tool, chosen in 20 (C34 **[AC]**) | 21 |
| Real devices | Seed Vault Wallet approval, App Links, process death while signing, payout arrival | A Seeker and one other Android phone, by checklist (devices under D4) | 20; 21 |

**Only on a real cluster:** the `StakeAtLeast` YES path, unless the `litesvm` crate's `set_epoch_stake` covers it in a
version that builds under Rust 1.89 (§1; C20 **[AC]**); Pyth freshness on devnet, SOL/USD included; an epoch boundary;
the real settle batch size; the RPC providers' limits; Alpenglow's timing changes. They run by hand before each deploy.
The program is built before testing, because the tests load the binary **[F]** (`CLAUDE.md`).

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run build:program       # cargo build-sbf + Shank IDL + Codama client (only CI's build is trusted for deploys)
bun run test                # LiteSVM: instruction and error tests, seeded randomized I1–I15
bun run test:rust           # checks negatives (Mollusk), readers on fixtures, pure math, math vectors
bun test tests/ -t "open campaign refuses"                           # to add in Sprint 02: one case per check
bun test tests/ -t "checks refuse"                                   # to add in Sprint 02: one negative per check
bun test tests/ -t "opening charges 500 dollars at the pyth price"   # to add in Sprint 02: 90/10, max_lamports
bun test tests/ -t "winners never get back less than their entry"    # to add in Sprint 04 (I11)
bun test tests/ -t "credit to an empty wallet below rent is reserved" # to add in Sprint 04
bun test tests/ -t "sdk math matches rust vectors"                   # to add in Sprint 05
bun test tests/ -t "decoder rejects foreign, failed and duplicate events"   # to add in Sprint 05
bun test services/                                                   # Sprints 06-08
bun run smoke:devnet                                                 # Sprint 05 DoD: exits 0
```

A `-t` filter that matches no test exits non-zero, so a forgotten test fails loudly (proposal Phase 0).

## 10. CI/CD

**Today** **[F]** (`.github/workflows/ci.yml`, after Sprint 05). Four jobs on Ubuntu 24.04, with actions pinned by
hash. *Program:* Rust from `rust-toolchain.toml`, Solana CLI 3.1.10, shank-cli 0.4.9 installed with `cargo install --locked` and cached by version, Bun from
`package.json`; `bun install --frozen-lockfile`; `cargo fmt --check`, Prettier and `bun run lint:sdk` (inside `bun run
lint`); `cargo metadata --locked`;
`bun run build:program` after deleting the committed outputs, which runs `cargo build-sbf` for brot-markets and for the
test-only `cpi-proxy`, then `bun run idl` (the Shank IDL and the Codama client). CI has no Anchor: the Anchor CLI and
`pred-provable` left the workspace in Sprint 03. The stale-IDL check through `git status` covers `packages/sdk/src/idl`
only (the Shank output and the generated Codama client); an `idl-preview-<run id>` artifact is uploaded from the same
directory; three clippy lines, the last one for brot-markets
with the `mainnet` feature; `tsc --noEmit`; `bun run test`; `bun run test:rust`, whose Mollusk checks run the
brot-markets binary; the step "Mainnet build carries the real values",
`cargo test --locked -p brot-markets --features no-entrypoint,mainnet` (T12); and, on `main` only, a `programs-<sha>`
artifact with `brot_markets.so`, its IDL (`brot_markets.json`, the committed one) and `SHA256SUMS`. *Repo:*
`codemap.js --check`, `os-self-test.js`, the landing's tests and the secret scan over the branch. *App:* lint and
build. *Mobile bundle* (added in Sprint 05; its first run is that sprint's pull request): Node 24.21.0,
`npm ci --ignore-scripts` in `tests/react-native`, then `node run.mjs`.

**What changes** **[DP]** (proposal §2.1, §2.3, §6).

| Step | Change | Sprint |
|---|---|---|
| Build | `cargo build-sbf` replaces `anchor build`; then the Shank IDL and the Codama client (or the hand-written codecs, T9), synced into `packages/sdk` | 02 (done for brot-markets, with the spike's client), 03 (Anchor leaves), 05 (T9) |
| Toolchain | The Anchor CLI install and the `pred-provable` clippy line leave with the frozen program | 03 |
| IDL check | Over the Shank output and the generated client, instead of `target/idl`, `target/types` and `app/lib/idl` | 02 (added beside the old paths), 03–05 |
| New checks | `dependency-cruiser` read/tx rule and the SDK's portability check (`bun run lint:sdk`, inside `bun run lint`, done in 05); the Rust-generated math vectors (done in 04 and 05); JSON Schema of `content/`; a check that the mainnet build carries the real window and duration (T12, done in 02) | 02–05 |
| Mobile bundle | The "Mobile bundle" job (added in 05; first green run on its pull request): both SDK halves bundled by Metro 0.87.1 for Android as React Native 0.87.1 bundles a release, compiled with that version's hermesc, and the 24,000 math vectors replayed on a Hermes VM pinned by SHA-256 (`tests/react-native/run.mjs`) | 05 |
| Services | `bun test services/` | 06–08 |
| Web | The Playwright smoke at desktop and Android widths | 11 |
| Lockfile | `bun install --frozen-lockfile` resolving from npmjs.org (T15) | 02, at its opening, before the Codama spike (done, `7d770ce`) |
| Release integrity | `solana-verify build`, provenance attestation, pinned SHA-256 of downloaded tools, gitleaks or equivalent | 16 |
| Landing | Its tests leave with it | 09 |

**How code reaches each place** **[DP]**.

| Destination | How |
|---|---|
| Program on devnet | A person downloads the CI artifact by run id, checks its SHA-256 and deploys with the upgrade key from their own machine. The key never goes to GitHub or the server (TP v0.0.1 §10). Who holds it on deploy day is set in Sprint 05 (Q12) |
| Program on mainnet | The `solana-verify build` artifact; the upgrade is a proposal in the 2-of-3 multisig, after the public 24–48 h wait. Clients and services tolerate both IDLs during the wait (upgrade runbook, Sprint 06) |
| Site and services | `deploy/vps/push-deploy.sh` (to add in Sprint 06): a Git bundle over SSH; the release built in `releases/<sha>`; root switches `current` and restarts; if `/healthz` fails, it rolls back. The neighbour project's pattern [E83]. The script refuses a Bun binary whose checksum differs (X1.10) |
| Standby keeper | The same bundle, on VM 2 |
| Android app | Built locally (`expo prebuild`, Gradle) without keys, signed on an offline machine, submitted with `dapp-store-cli` 1.0.1 from that machine (Sprint 22) |

## 11. Environment variables

No values here. Non-secret settings live in `/etc/brot-markets/<unit>.env` (root, group `brot`, `0640`). From Sprint
06, secrets live in root-only `0600` files loaded with `LoadCredential=`, never in the environment (T13; proposal
§2.10). Until then the only secret on the server is `TUNNEL_TOKEN`, in `/etc/brot-markets/tunnel.env` (root, `0600`)
**[F]** (`knowledge-base/tecnologia/servidor-e-dominio.md`).

| Variable | Used by | Lives in | Secret |
|---|---|---|---|
| `NEXT_PUBLIC_CLUSTER`, `NEXT_PUBLIC_PROGRAM_ID` | Site | `web.env`; `app/.env.example` | No |
| `NEXT_PUBLIC_RPC_URL` | Site | Same; it points at `/rpc`, never at a paid provider (A-5) | No |
| `API_INTERNAL_URL`, `GEO_BLOCK`, `GEO_BLOCK_COUNTRIES` | Site, server side | `web.env` | No |
| `RPC_URL_INDEXER` | Indexer | Credential | Yes |
| `SQLITE_PATH`, `RATE_LIMIT_PER_MIN` | Indexer | `indexer.env` | No |
| The relay's provider URL (its own account, T14; name set in Sprint 08) | `brot-rpc` | Credential | Yes |
| The CoinGecko key, only on a paid plan (D4; name set in Sprint 08) | Indexer | Credential | Yes |
| `RPC_URL_KEEPER`, `KEEPER_KEYPAIR` | Keeper, one set per provider | Credential | Yes |
| `KEEPER_MODE` (`primary`, `standby`) | Keeper | `keeper.env` | No |
| `PRICE_SOURCE_URL`, `PRICE_SOURCE_KEY` | Keeper (Hermes; the key only once bought, D4) | `keeper.env`; the key as a credential | The key, yes |
| `PRIMARY_HEALTH_URL`, `ALERT_EMAIL_TO` | Watchdog | `keeper.env` on VM 2; two inboxes before mainnet | No |
| `ALERT_SMTP_URL` (renamed when T5 picks an email API) | Watchdog | Credential on VM 2 | Yes |
| `RESTART_HMAC_SECRET` | Watchdog and primary keeper | Credential, on both | Yes |
| `TUNNEL_TOKEN` | Tunnel | `tunnel.env` today **[F]**; a credential from Sprint 06, rotated when the new units land | Yes |
| `HOST`, `PORT`, `SITE_ORIGIN`, `LEADS_FILE` | `services/landing`, until Sprint 09 | `/etc/brot-markets/landing.env` **[F]** (`services/landing/.env.example`) | No |
| `DEVNET_WALLET`, `DEVNET_RPC_URL`, `TEAM_KEYPAIR` | Devnet and team scripts | The machine of whoever runs them **[F]**; on mainnet, hardware | The wallets, yes |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | Tunnel and DNS configuration | Outside this repository **[F]** | Yes |
| `OFFLINE_PUBLISHER_KEYPAIR` | `dapp-store` CLI, Sprint 22 | The offline signing machine only | Yes |
| Removed: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | The inherited chat | Sprint 09 deletes them from `app/.env.example` and every environment (D-q) | — |

The Android app holds no secret: its cluster and API base are build settings, and it never receives a paid key (A-5).
The devnet `fee_recipient` and admin keys live on team machines, never on the VPS (proposal §2.10 item 8). The copy the
partners can reach is the team's password vault, never the repository or a chat. `deploy/vps/README.md` (Sprint 06)
records, for each secret, where it lives and how to rotate it.

## 12. Deployment

**The server** **[F]** (`knowledge-base/tecnologia/servidor-e-dominio.md`; K-06). Hostinger KVM 2, 2 vCPU x86_64,
7.9 GB of RAM, Ubuntu 22.04.5, in the eastern United States, shared with the `ash` and `agent-rails` projects. It has
Node v22.23.3, Git and Docker; it has no Bun, Rust, Solana, Anchor or C compiler. User `brot`, `/srv/brot-markets` and
`/etc/brot-markets` exist.

**House rules** **[F]** (same file, §1.3), followed without exception: no port opened outward; service users without
Docker, sudo or SSH; secrets in root-owned files; code arrives as a Git bundle; no reboot, `apt upgrade` or firewall
change without notice to the other side.

**Units** (proposal §1.7, §2.10; TP v0.0.1 §12) **[DP]**.

| systemd unit | Identity | Listens on | Memory, starting point | Sprint |
|---|---|---|---|---|
| `brot-web.service` (Next.js on Bun 1.4.2, or Node 22) | Its own | 127.0.0.1:4200 | 768 MB | 09 |
| `brot-indexer.service` (Bun) | Its own | 127.0.0.1:4201 | 512 MB | 08 |
| `brot-rpc.service` (Bun) | Its own | 127.0.0.1:4202 | Set in Sprint 08 | 08 |
| `brot-keeper.service` (Bun) | Its own | 127.0.0.1:4210 | 384 MB | 06 |
| `brot-tunnel.service` (`cloudflared` 2026.9.3) | `brot` today **[F]**; its own from 06 | Outbound only; metrics on 127.0.0.1:4290 **[F]** | 256 MB **[F]** | Exists |
| `brot-landing.service` (Node) | `brot` **[F]** | 127.0.0.1:4200 | 256 MB **[F]** | Exists; leaves at 09 |
| Standby keeper and watchdog (Bun) | VM 2 | Outbound only | — | 07 |

Ports stay on `127.0.0.1`, in the free range 4200–4299 **[F]**. Each unit carries `MemoryMax` and `CPUQuota`, so it
cannot take memory from the neighbours.

**Hardening** (proposal §2.10, the 0.2 review's highest-severity finding; T13, Sprint 06, with the server owner's
agreement because it changes the house pattern of one user per project) **[DP]**. Today every service, the tunnel
included, runs as `brot`; the tunnel unit keeps `TUNNEL_TOKEN` in its environment; and a process of the same user can
read `/proc/<pid>/environ`, which `ProtectSystem=strict` does not hide. Code execution in a new public service could
then read the tunnel token, start a rogue connector and send visitors to a site that empties wallets. The fixes:

1. one identity per unit: `DynamicUser=yes`, or one user per service;
2. secrets through `LoadCredential=` from root-only `0600` files, never in the environment;
3. `ProtectProc=invisible` and `ProcSubset=pid`, which work only once the user ids differ;
4. the landing unit's sandbox (`services/landing/deploy/brot-landing.service`) applied to every unit;
5. Bun pinned to 1.4.2, its checksum verified by the deploy script, its install-script block kept;
6. the tunnel token rotated when the new units land, with an alert on unknown connectors (C27 **[AC]**);
7. the npm registry on npmjs.org since the opening of Sprint 02 (T15), and exact versions pinned;
8. the devnet `fee_recipient` and admin keys on team machines, never on the VPS; the keeper refill as a multisig
   transfer by runbook, triggered by the low-SOL alert, so no unattended process can move `fee_recipient`'s SOL.

**Bun on the VPS, the first step of Sprint 06** (D-p; C8) **[FD]**. Bun 1.4.2 needs glibc 2.17 or newer, recommends
kernel 5.6 or newer, and needs an x64 CPU with SSE4.2 [E76]. Ubuntu 22.04 ships glibc 2.35 and kernel 5.15; the VM's
CPU flags are unknown **[INF]**. If the check fails, D-p goes back to the founder before anything else.

```bash
# Sprint 06, first step, on the VPS as the service user:
ldd --version | head -1; uname -r; grep -m1 -o -w sse4_2 /proc/cpuinfo   # glibc ≥ 2.17; kernel ≥ 5.6; SSE4.2
sha256sum -c deploy/vps/bun-1.4.2.sha256 && bun --version                # to add: the pinned binary's checksum
curl -fsS http://127.0.0.1:4210/healthz
systemd-analyze security brot-keeper.service brot-indexer.service brot-rpc.service   # exposure score per unit
```

**Where the program is built** **[DP]** (TP v0.0.1 §12; K-07). In GitHub CI only, with the pinned versions, and the
deployed artifact's SHA-256 is checked. A container on the shared server was rejected (the build would hold both
CPUs for minutes next to the neighbours' services, and Docker there is root's); a developer machine is for iteration
only, because its result is not reproducible. The server receives the site, the services and the committed IDL.

**The tunnel** **[DP]**. Brot Markets' own Cloudflare tunnel, with its own token; the neighbour's tunnel is not touched
**[FD]**. Today it routes `brot.markets` and `www.brot.markets` to `127.0.0.1:4200` **[F]**. A separate ops host exposes
only `/healthz` and `/restart` on 4210, for the watchdog (Sprints 06–07); from Sprint 08 the main host also routes
`/api/v1` to 4201 and `/rpc` to 4202 (proposal §1.4). Edge rules: the Cloudflare Cache Rule for `/api/v1` (C28
**[AC]**), rate rules without challenges, short-TTL caching of share cards, and Cloudflare's analytics injection turned
off once the founder agrees (§8).

**The second machine** **[DP]**. A small VM outside Hostinger running the same bundle in standby mode. The GitHub
scheduler (5-minute minimum interval, runs may be delayed or dropped) and Vercel's (every minute only on the paid plan)
were rejected **[F]** (`knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` §3.2). Provider and cost are
D4 (Q8).

**Domain** **[F]**. `brot.markets` was bought and has been on Cloudflare since 2026-10-05 (Q11; same file).

**The provisional site** **[F]**. Until Sprint 09, the address serves `services/landing`: a "coming soon" page with the
waitlist (§8.1) and the deck at `/pitch`, plain Node with no dependencies, on the `127.0.0.1:4200` port the site will
inherit.

**Runbooks** (proposal Phase 1) **[DP]**. One per alert; the program upgrade, for the 24–48 h public wait, during which
clients and services must tolerate both IDLs; and the SOL refill and monthly conversion runbook, whose treasury rule is
P-7 (open).

**The Android app** **[DP]**. Distributed only through the Solana dApp Store (Sprint 22), never Google Play or the App
Store (§3.7). Each release is reviewed in 3–5 business days and minted as an NFT [E23].

## 13. Risks

The business risks are in P4 §7. These are the plan's. Severities marked "(P4 §7)" are the BP's.

| Risk | Severity | What reduces it | If it happens |
|---|---|---|---|
| A program bug with real money inside and no cap | Critical (P4 §7) | The `checks` module with a negative test per check; randomized I1–I15; both audits; the multisig; the pause; the exposure alert | Pause entries (payouts continue); fix through a multisig upgrade. Every lamport in every open vault was exposed (D-h) |
| A forgotten account check under Pinocchio | Critical (P4 §7) | One `checks` module; X0.9; the auditors read it first | As above |
| A creator forces the outcome of a campaign on an account they control, such as a worthless token they burn | Critical (P4 §7) | The opening payment, the automatic notice, the indexer's creator flag, unlisting. Weak: alone on the forced side, the creator's net cost is about US$50 and forcing pays once just over US$56 of third-party money sits on the other side (`0.9 × X > 50`) **[INF]** | No reversal: the read is correct. Written risk; the founder's decision stands (D-h, D-i) |
| The upgrade key stolen or in one hand | Critical (P4 §7) | 2-of-3 hardware multisig with a public wait; the devnet key off the VPS | The other signers rotate it |
| Both keepers stop; a true YES turns NO at the deadline | Critical (P4 §7) | Different providers; the watchdog; any wallet may trigger (Q1); alerts; the window | Void in the window; everyone is refunded |
| The Brazilian rule (MP 1.394) reaches the pot, the store or the partners | Critical (P4 §7) | L0 before real money; the country switch | Turn the switch on; payouts continue |
| Whoever controls the Pyth receiver's upgrade and governance controls what the reader reads; on mainnet the controller was not checked (Sprint 01) | Low on devnet, high on mainnet | One receiver and an exact size, so a format change breaks the read instead of misreading; a watch on the receiver's upgrade slot and configuration (07); who controls it, before mainnet (16) | Pause price campaigns' entries; void in the window |
| The sponsored feed lapses or goes stale (62–64 s cadence measured on devnet) | Medium | `max_age` per campaign with a 30 s floor, 120 s on devnet **[AC]**; `StaleFeed` voids instead of NO (D7); the keyed keeper | Entries in that price campaign are refused; paid openings fail until it updates (team keys still open); stale campaigns void |
| A short touch erased before the keeper resolves, without a Hermes key | Medium | The keyed keeper posts its own proofs; mainnet price campaigns wait for D4 | The team voids in the window if the service failed |
| `StakeAtLeast` has never returned YES in a test | High | A YES verified on devnet before such campaigns open (check row 1, §3.4.10) | The kind stays closed; the other four continue |
| The same code has the same bug in both keepers | High | The window; the second read through another provider | Void in the window |
| Nobody reviews and a wrong result is paid | High | Review by exception (T22); alerts on `met_late` and mismatches; a named reviewer per day before mainnet | No correction after `Settling` |
| One CTO on call, with no backup | High (P4 §5.1) | Two inboxes before mainnet; the incident page names a substitute | Campaigns still resolve and pay without people |
| A process reads another's secrets on the shared server | High **[INF]** | Per-unit identities and credentials (§12) | Rotate the tunnel token and the keeper keys |
| Site taken over, asking for malicious signatures | High (P4 §7) | Hardware second factor on domain, hosting and repository; CSP; the deterministic summary | Take it down; the vaults are unaffected |
| A leaked team key opens free campaigns, and can hold `max_open_campaigns` full for up to 90 days (§7) | Medium | An alert per team opening; removal through the multisig; `max_open_campaigns`; a separate free-opening budget if the founder chooses it **[Q]** | Remove the key; unlist |
| `/rpc` abuse drains the paid quota | Medium | Its own account with a hard limit; the weighted bucket; Cloudflare rate rules | The relay degrades; the keeper is unaffected |
| Bun 1.4 is the first release of its Rust port | Medium (P4 §7) | Exact version, checksum, soak test; SQLite behind an adapter; Node 22 for the site | Payouts are delayed; the money stays in the vault; D-p returns to the founder |
| Next.js under Bun | Medium | The Sprint 09 staging test | Node 22 |
| Alpenglow changes time and confirmation (the leader sets the Clock timestamp; slots near 200 ms) | Medium | Check devnet before Sprint 03 retests deadlines and the 60 s proof window; bound freshness by slot as well as time | Retune the bounds |
| The Shank and Codama path fails on Pinocchio | Low | The Sprint 02 spike; hand-written codecs with a byte-for-byte test (T9) | Hand-written codecs |
| MWA libraries move (JS v3, the legacy adapter in maintenance) | Low | Explicit registration; pinned versions; wrappers | Rewrap |
| The store removes the app | Medium (P4 §7) | The web stays the primary path, on the same backend | App users go through the site |
| Supply chain: the npm mirror, a compromised package | Medium | npmjs.org (T15); exact pins; the install-script block | Rotate and rebuild |
| The shared server | Medium | Per-unit limits; nothing installed system-wide; notice to the other side | Stop the `brot-*` units; the standby continues |
| The SOL price falls between receiving and paying costs | High (P4 §7) | Monthly conversion of what costs need (P-7, open) | The same revenue pays less |
| A credit below rent to an empty wallet | Low | The 0.01 SOL minimum entry (P-5); the reserve path; the daily retry | It stays reserved in the vault; the recipient can claim it from a funded wallet |
| SOL/USD stale at opening time | Low | `max_price_age`; an alert | Paid openings wait; team keys still open |

## 14. Open questions

### 14.1 Documents to align

| Document | What changes | When |
|---|---|---|
| `docs/product/PRODUCT-BRIEF.md` | Outdated against BP v0.0.4: USDC, the global cap (R-05, R-30), team-only opening (F7, R-32), the sponsor request (R-15 to R-20, F8), the suggestions page (F11). New flows for the creation box and the Android app, with the gaps the prototype shows for neither; §12 vocabulary per D-m. Until revised, its R-, F- and L-numbers are not current rules; L-items stay the handles of open design gaps | Next, per the BP index (`BUSINESS-PLAN.md`, "O que vem depois", item 2) |
| `docs/product/DESIGN-DIRECTION.md` | The creation screen (D8); layouts below 700 px for the web and the app (D-n); which dark is official; the default theme; the site language (L-01) | Sprint -1; the app's pass in 20 |
| `CLAUDE.md` | Product description (campaigns, the US$500 opening, the 1%, SOL only) and vocabulary; `build:program` with `cargo build-sbf`, Shank and Codama; the Anchor CLI line, the Anchor gotchas and the USDC notes leave with `pred-provable`; the `solana-epoch-stake` pin per §14.4; `init-if-needed` restated as "never re-initialise an account that carries a tag"; Bun 1.4.2; the in-app chat section leaves in Sprint 09 | 02; 03; 09 |
| `.github/workflows/ci.yml` | §10 | 02–05; 16 |
| `services/landing/public/` | The D6 copy is done (commit `c82be03`, Sprint 02): title, meta tags, H1, lead, form label, example and principles, and the privacy line, per D-m; the footer's legal notice (L0's text) and the founder's deck at `/pitch` were left as they were. Still to do: `/pitch2`'s 3.5% fee line, against the decided 10% of the losing side (`services/landing/pitch2-notes.md`); the deck's mainnet slide ("After an audit, a multisig and a cap") | D6 copy: done in 02. The rest: next, per the BP index ("O que vem depois", item 3) |
| `app/.env.example`, root `.env.example` | The OpenRouter variables leave (D-q). The root file is the operating system's generic template (AI, Supabase, Stripe keys) **[F]**; it does not describe this project | 09 |
| `package.json` (root) | Done: the name (`brot-markets`) and the description describe Brot Markets, and `deploy:devnet` runs the brot-markets deploy from CI's artifact (`scripts/deploy/devnet-deploy.ts`, Sprint 05) **[F]** | 03; 05 (done) |

### 14.2 Founder questions

**Open.** Each row says what the plan builds meanwhile and which sprint the answer blocks.

| # | Question | Recommendation or working default | Blocks |
|---|---|---|---|
| L0 | The team lawyer's written review (an action, D-s) | Classification first (is a pot inside MP 1.394, or CMN 5.298, or another regime?), then open creation, the US$500 opening, SOL, no caps and no list, the dApp Store, the C-items of §3.7. An outside reader stays a BP proposal (P4 §5.1) | D5; C-06; Sprint 22; the mainnet date (18) |
| D4 | Budget: RPC accounts, VM 2, email, the Pyth and CoinGecko plans, a Seeker and another Android phone. Includes v0.0.1's Q8 | Devnet below about US$150 a month **[INF]**: Helius Developer (US$49) for the keeper, free tiers elsewhere **[AC]**. Pyth: paid openings need no plan; keyed proofs for mainnet price campaigns need Hermes Starter, US$500 a month [E51], or price campaigns wait. CoinGecko: Demo terms unclear; paid plans require attribution [E79] | 06; 07; 08; 16 (Pyth); 20 (devices) |
| D5 | Attestation of each entry, and wallet screening | (a) None on devnet: gates live in the site, the app and `brot-rpc`. Decide after L0, before Sprint 14. (b) and (c) see wallets with IPs or send addresses to a third party (K-04) | 14 |
| P-6 | Ceiling of the referral rebate | 0.05 SOL; the US$50 and US$250 thresholds also in SOL (0.4576 and 2.2879 SOL at the reference price **[INF]**, P1 §3.9) | 14 |
| P-7 | The treasury, with a SOL-only platform | The platform receives and pays in SOL; the company converts monthly what it needs, outside it; `fee_recipient` under the multisig | 06 (runbook); 18 |
| P-8 | Do Cloak and SODAX work with SOL? | Check before use | 15 (the Cloak page for undisclosed sponsors, BR-17); 17 (the SODAX page) |
| P-9 | Still open from v0.0.3 | BP-3 sponsor perks: US$500 as the floor; seal, name and link for all; posts case by case (15). BP-5: keep the window until the audit; say "no human picks the winner" (window in 04, copy in 13). BP-8: token B against the pitch's ready answer (no architecture impact). BP-9: "Referrals, day one" means the first day on mainnet (14; live at 18). BP-11: the mascot is Baked in writing, Cacetinho in speech (copy only). BP-12: Bernardo's and Ronaldo's written agreement to appear in public versions (no architecture impact; it gates the multisig signers). BP-14: the creator may join their own campaign, with an automatic notice (08, 11). BP-17: the creation rules, the Pyth charge and the 1% inside the audited version (16) | As listed |
| New (P4 §3.4) | The 5/10/2026 exception (mainnet after one audit report, with a lower cap) has lost its cap | Wait for both reports; this plan assumes both (§7) | 18 |
| R4 | A reduced fee in the first three months: which fee, and how much (the mentors' review of 2026-10-08, `docs/business/_review/revisao-do-pitch-2026-10-08.md`) | The review recommends waiving only the opening fee (the 10%) on each creator's first three campaigns and leaving the pot fee alone. Not built meanwhile; a per-creator waiver would add state to `user_open_campaign` **[INF]** | 16, which freezes the creation rules |
| New (P3) | Does "nao lidaremos com tokenomics" also cover tokens A and B, or only the account list? | Confirm it was only about the list | Any token work (after 18) |
| Signers | Who signs the 2-of-3 multisig; the short written term between the partners, decided as P6 on 2026-10-05 and not recorded as written (P4 §5.2) | Fix the signers after the three partners' written agreement (P4 §4.1, §8) | 16 |
| Server owner | Agreement to per-unit identities, which changes the house pattern of one user per project (T13) | Ask before Sprint 06 (proposal Phase 1 entry) | 06 |
| Audits | Timing, scope and version of the two audits, the second firm's name, and whether both review Pinocchio (P4 §4.1, §8) | Ask now: the answer says whether the core can be read before 14 and 15 are done (roadmap v0.0.1 §5) | 17 |
| Owners | A named reviewer per day for the window, and a substitute for the CTO on alerts (P4 §5.1) | Name both before mainnet | 16 |
| Analytics | Turn off Cloudflare's analytics injection in the zone; today the CSP blocks it and each visitor's console shows an error (`CHANGELOG.md`, open items) | Turn it off: the plan has no visitor statistics (§8) | 09 |
| Slide | The deck's mainnet line | "MAINNET After an audit and a multisig" (P4 §3.1) | The next showing of the deck |
| Prize on another's campaign | May a third party add a prize to a campaign someone else opened (P1 §3.7)? The only reason to keep `sponsor_add_prize` (§3.4.3, §3.4.12) | No BP recommendation; without an answer, Sprint 15 builds only the sealed entry | 15 |
| `StaleFeed` and the 10% | **Closed 2026-10-09 (Sprint 04 question).** Is a `StaleFeed` void still an outside cause once the keeper holds a Hermes key, or a house failure that refunds the opening fee (§3.4.7)? | An outside cause: the 10% is kept (§3.4.7). The rule itself was built in Sprint 03 (review F2 and F3); the 10% handling is Sprint 04's | 04 |
| Empty campaign | **Closed 2026-10-09 (Sprint 04 question).** Where the prize and the held 10% go when a campaign gets no entry at all (P1 §3.5: "não tem regra escrita") | The prize returns to whoever opened and Brot keeps the 10% opening fee: a rule with no switch (§3.4.10, §3.4.16). Built in Sprint 04 | 04 |
| Entry after the touch (PR #40, question 8; question 7 in the answers of 2026-10-09) | **Closed 2026-10-09.** A baker can join YES after a touch that shows in a fresh update, because the join lock reads the sponsored account and the proof accepts any account at most 60 s old (Sprint 03 review F1) | Answered: the recommended pair, a proximity buffer at the join lock, and a refund of entries at or after the YES proof's `publish_time`, both in Sprint 04 (§3.4.16). The margin is **[AC]** | 04 |
| C-06 | Block Brazil in the app? | After L0 | 21; 22 |
| Waitlist | What happens to the waitlist, its purge, its deletion form and `/pitch` when the landing leaves (§8.1) **[Q]** | Keep a deletion path and the purge until the last line expires, or use the list once and delete it | 09 |
| Program key | A backup copy of the program-address keypair (Sprint 00) | Before Sprint 05 | 05 |
| Weekly referral payout | Who signs the weekly referral payout, sent from the operations wallet (§3.4.11; roadmap v0.0.1 §5), and the treasury rule it pays from | Ties to P-7 and the multisig signers | 14 |
| Demand-test thresholds | The thresholds of the three demand tests (P2 §2.5). Tests 1 and 2 have v0.0.2's; test 3 has none | Write them before the devnet beta | 13 |
| Price feeds | **Closed 2026-10-09 (answer 1).** Which Pyth feeds may a price campaign name, and does D-i (no accepted-account list) also cover feed ids? Today any Full feed of the upgraded receiver passes, so "price of a large asset" (§3.4.8) and "out of any creator's reach" (§3.4.10) are not enforced (Sprint 02 review, finding 1) | A list of our own, fixed in the program, per cluster. Day one: Pyth's official list of sponsored feeds (62 on mainnet, 17 on devnet, on 2026-10-09). Feeds are added from Sprint 06. D-i narrows to the price kind only. Built in Sprint 04 (§3.4.1, §3.4.10 row 4) | 04 |
| Free-opening budget | **Closed 2026-10-09 (answer 4).** A budget of its own for free team openings, or voiding an empty `Open` campaign, so that a leaked team key, or about US$50k of paid openings net of the returned prizes, cannot hold `max_open_campaigns` full for up to 90 days (§7; Sprint 02 review, finding 2) | Yes, and without a limit: a team key's openings sit outside `max_open_campaigns` (§3.4.10). Built in Sprint 04. A leaked team key can open campaigns without limit, but takes no money from anyone: the admin removes the key at once, and the pause stops openings too | 04 |
| Opening price | **Closed 2026-10-09 (answer 2).** Charge the opening at `p − conf`, the low edge of the Pyth price, instead of the mid price `p`? The creator posts the update the program reads, so with the mid price it can pick the highest of the last seconds, up to about 1% at the 300 s ceiling (Sprint 02 review, finding 14) | Yes: the opening is charged at `p − conf`. Built in Sprint 04 (§3.4.16) | 03 |
| SOL/USD feed id | **Closed 2026-10-09 (answer 3).** Make the SOL/USD feed id a compiled constant instead of a `GlobalConfig` field? Today the program checks it only non-zero, so an admin's typo changes what every paid opening reads (Sprint 02 review, finding 5) | Yes: a compiled constant, not a `GlobalConfig` field. Built in Sprint 04 (§3.4.1) | 03 |
| Minimum entry | **Closed 2026-10-09 (answer 5).** Does an open campaign keep the `min_entry_lamports` it opened with? v0.1.0 said so in §3.4.1 and implied the live read in §3.4.3; the published terms promise "An open market keeps the rules it opened with" (`/terms`) | Yes: each campaign copies `min_entry_lamports` at opening (0.01 SOL today; the admin sets 0.001 to 1 SOL). Built in Sprint 04 (§3.4.1, §3.4.10 row 6) | 04 |
| Q12 (confirmation) | **Closed 2026-10-09 (answer 6).** Do both Lucas and Ronaldo hold team keys ("tem eu e o Ronaldo")? | Three team keys: Lucas's, Ronaldo's and Bernardo's; Bernardo's is set when he starts. The reading that both Lucas and Ronaldo hold team keys is confirmed. Set at the devnet deploy (Sprint 05) | 05 |

**Design gaps still with the founder** (Product Brief v0.0.1 gaps, still the live handles).

| Gap | Question | Sprint |
|---|---|---|
| L-01 | The site language; it also names the "my entries", ranking, register and fee routes | -1 |
| L-03, L-23, L-24 | The stuck-money notice; the split-history chart; the partner seal and highlight | -1 |
| L-04, L-13 | The public name of the state during a dispute; the public contest channel | 12 |
| L-09 | What points are worth after devnet | 13 |
| L-10, L-14 | Where the referral balance is shown; stage 2 of the dispute before phase 1.2, and the second oracle (T8) | 14 |
| L-11, L-18 | The sealed-entry screens; the Cloak page (15) and the SODAX page (17) | 15; 17 |
| L-16 | Notifications: none in the web MVP; app push only with a decision and a privacy audit (§3.7) | — |
| L-20, L-21 | The country-block text; the privacy policy (with L0) | 17 |

L-08 (test USDC), L-17 (the suggestions page) and L-19 (the cap's value) fall away with D-a, P1 §4.1 and D-h.

**Answered.**

| # | Question | Answer |
|---|---|---|
| D-a to D-t | The founder's decisions of 2026-10-08 | Proposal §5.1 and BP v0.0.4; not reopened **[FD]** |
| P-1 | The 1% on a void, in a one-sided pot and on the prize | None in all three ("ok para recomendacao") **[FD]** |
| P-2 | The exact reading of D-g | From the pot while winners stay whole; only the shortfall from Brot's fee (§3.4.16); the literal reading survives as a test oracle **[FD]** |
| P-3 | Does the team keep the 1% and pay the US$500? Do partners keep the 1%? | No, no and no: "porque nos ja cobramos taxa"; "parceiros nao ficam com 1%". Every team-key opening: no payment, `creator_share_bps = 0`, no `partner` argument **[FD]** |
| P-4 | The US$450 prize and the 10% in a one-sided pot and on a void | The prize returns to whoever opened; the 10% follows the cause (`VoidReason`), held in the vault until the outcome (T23) **[FD]** |
| P-5 | Minimum entry | 0.01 SOL **[FD]** |
| D-f | The price source for the US$500 | Pyth SOL/USD read on-chain; CoinGecko for display **[FD]** |
| Bun for the site | The site on Bun too? (BP index, P4 §2.2) | Yes if the Sprint 09 staging test passes, Node 22 otherwise: decided with the approval of proposal 0.4 (D-p) **[FD]**, as BP v0.0.4 now records (P4 §2.2, §8; the index) |
| D3 | The Android app's scope | Decided by D-n; timing per §3.7 **[FD]** |
| D6 | Vocabulary in code and copy | (a): copy first, then code and docs in one PR, per the rename table, before Sprint 02 writes identifiers. Built that way in Sprint 02: the landing copy in `c82be03`, then the identifiers and documents in PR #30. The founder took what Sprint 02 built as decided, in PR #35 (2026-10-08): "as decisões ali são minhas e do Ronaldo, e escritas por ele. O que foi feito lá no código dele a gente traz como nova realidade [...] pode tocar ficha e continuar" **[FD]** |
| C44 | How a team key adds a prize to its own campaign | As Sprint 02 built it: the team key passes `opening_usd` and pays like any wallet, at least `opening_fee_usd`, at 90/10, keeping `creator_share_bps = 0`; taken as decided in PR #35, with the words quoted for D6 **[FD]** |
| D7 | A price campaign whose feed went stale | (b): `StaleFeed` voids it (see the Summary) |
| D8 | The creation screen | (a): a design pass in Sprint -1 at web and phone widths, and a site slot after Sprint 11, which is Sprint 19 (see the Summary) |
| D1, D2 | The fee base; the AI scope | Closed: 10% of the losing side (BP v0.0.3); no AI (D-q) |
| Q1 | Who may trigger resolution and payout | (B): any wallet, directly on-chain; it chooses nothing. No button on the site **[FD]** (approved with v0.0.1) |
| Q2 | A payout that cannot land | With lamport credits, the closed-USDC-account case is gone. What remains is a credit below rent to an empty wallet: it stays reserved, the keeper retries daily, and (b) the recipient can call the open instruction from their own funded wallet (L-15) **[FD]** |
| Q3 | Entry limits | Both sides allowed, since another wallet gets around a ban; the first baker's exemption covers everything that first wallet puts in; minimum 0.01 SOL (P-5) **[FD]** |
| Q4 | What counts as a touch; the price age on entry | (a): the price the keeper proves on-chain within 60 s of publication. The maximum age is set per campaign, with a 30 s floor ("mesmo assim 30s é um bom tmepo minimo") **[FD]** |
| Q5 | A sponsor's sided entry in a one-sided pot or a void | (a): it follows the common entry rule; today that is the sealed entry **[FD]** |
| Q6 | Where the sponsor's share waits | (a): in the campaign vault until the outcome, the same as T23 **[FD]** |
| Q7 | The devnet points formula | (a): 1 point per campaign entered on the right side **[FD]** |
| Q9 | When the referral's 90 days start | (b): at the referred baker's first entry **[FD]** |
| Q10 | Test money | Falls away: devnet SOL from a faucet, no test USDC (the faucet's limit is C5 **[AC]**) |
| Q11 | The domain | Done: bought and on Cloudflare since 2026-10-05 **[F]** |
| Q12 | Keys | With Lucas and Ronaldo ("tem eu e o Ronaldo") **[FD]**. Which of them holds the devnet upgrade key on deploy day is set in Sprint 05; the reading that both hold team keys is this team's, to confirm |
| Sprint 01 | Surfpool read; the Pyth service key | The Surfpool read stays deferred to Sprint 03 ("deixa adiado"); the Hermes key waits for measurement ("ok"), now inside D4 |

### 14.3 Team questions (T-items)

| # | Question | Decision or recommendation | Sprint |
|---|---|---|---|
| T1 | Bring `upstream/main` by merge or only the readers | Done: merged in Sprint 00 (`8e8b2ec`) **[F]** | 00 |
| T2 + Q4 | Price-reader numbers and accounts | Reader hand-written (Sprint 01). The split of §3.4.8: sponsored PDA on entry, any Full account for the proof, 60 s proof window, per-campaign maximum age with a 30 s floor, slot bounds | 03 |
| T3 | Settle batch size and per-instruction compute, with self-CPI events | Measure | 04 |
| T4 | Events: hand-written self-CPI or `sol_log_data` | Decided: self-CPI from Sprint 02, because one event round-tripped in npm `litesvm` 1.5.0 on day one **[F]**; `event_authority` and the program end every instruction's accounts (§3.4.14) | 02 (done) |
| T5 | RPC providers and the email service | §3.5's accounts table, within D4; the email provider still open | 06; 07 |
| T6 | Running the tunnel without Docker or root | Done 2026-10-05: a single `cloudflared` binary in `/srv/brot-markets/bin`, as a systemd unit **[F]**. Whether the visitor's country reaches the server is C9 | 06 |
| T7 | The multisig product, with a public wait for upgrades | Choose and test | 16 |
| T8 | A second oracle for disputes on price campaigns (L-14) | The feed-history table is its reference | 14 |
| T9 | SDK stack | Decided in Sprint 05: the Codama client generated from the Shank IDL is the codec and builder layer; the event table and the PDA seeds are written by hand and checked against the program's source (§3.4.19) | 02; 05 (done) |
| T10 | `expected_entry_total` on the join | Adopt | 02 |
| T11 | A neutral `fee_bps` in `GlobalConfig` | Adopt | 02 |
| T12 | Devnet-only drill constants behind a cargo feature | Adopt, with a CI check that the mainnet artifact carries the real values | 02–04 |
| T13 | Per-unit identities, `LoadCredential=`, tunnel-token rotation | Adopt, with the server owner's agreement | 06 |
| T14 | `brot-rpc` as its own unit, account and allowlist | Adopt | 08 |
| T15 | `bun.lock` registry moved to npmjs.org | Adopt, at the opening of Sprint 02, before the Codama spike adds npm packages; this meets the proposal's "before 05" (§1, §7.1) | 02 (opening) |
| T16 | Nightly `VACUUM INTO` snapshot to VM 2 | Adopt once the evidence tables exist | 08 |
| T17 | Retry guard for openings: the client-chosen `id` | Adopt | 02 |
| T18 | `max_open_campaigns` valve | Adopt, with an alert at 80% | 02 |
| T19 | Measure the real account sizes and rent | Adopt; replaces v0.0.1's C6 | 02 |
| T22 | Review by exception | Adopt; a named reviewer per day before mainnet | 07 |
| T23 | Where the 10% of a paid opening waits | In the campaign vault, bookkept, until the outcome; then to the fee vault and `fee_recipient`, or refunded on a house-failure void | 02; 04 |
| T24 | A negative test per check of `checks` | Adopt | 02 |
| T25 | `max_lamports` on a paid opening | Adopt | 02 |

T20 (the balance rule) and T21 (the cost-to-force script) were removed with the caps and the list (D-h, D-i).

### 14.4 To verify

The plan depends on these statements, and none was verified when it was written. C-numbers without a hyphen are
verification items; C-01 to C-17, with a hyphen, are the compliance items of §3.7. Closed since v0.0.1: C1, C2, C3
and the Surfpool version (Sprint 01); C6 is replaced by T19.

Closed in Sprint 02 (`docs/sprints/sprint-02-pot-core.md`; the two session logs of 2026-10-08):
- **C14.** `pinocchio` 0.11.2 with `pinocchio-system` 0.6.1, the matching pair, builds with `cargo build-sbf` under Rust
  1.89.0 and Solana CLI 3.1.10 (platform-tools v1.52), locally on day one and in CI (run 37849347333) [F].
- **C15.** Codama works on Shank's IDL: `@codama/nodes-from-anchor` reads it, and the rendered client round-trips in
  LiteSVM. The IDL carries no events and no PDA seeds; the client is committed but not exported, and the SDK decision
  stays Sprint 05's (T9) [F].
- **C16.** npm `litesvm` 1.5.0 exposes inner instructions: `innerInstructions()` shows the self-CPI event at stack
  height 2 [F].
- **C17.** `Campaign` is 512 bytes, 3,251,200 lamports of rent on devnet and mainnet; `GlobalConfig` 400 (2,682,240),
  `Entry` 100 (1,158,240), each data-less vault 650,240, at the 5,080 lamports per byte of the Rent sysvar, read on
  2026-10-08; LiteSVM and Mollusk use 6,960. An opening costs its creator 3,901,440 lamports of rent [F] (T19).
- **C30.** `sharp` 0.35.5 has no install script, and `unrs-resolver` 1.12.2's postinstall only re-fetches a binary bun
  already installs: both `trustedDependencies` entries were removed (`7d770ce`) [F].
- **C42.** Neither Pinocchio nor the runtime refuses one account in two slots; `checks::distinct` stays, and from
  Sprint 04 it is the only guard (§3.4.17) [F].
- **C43.** Written as the team's choices **[AC]** (`session-log/2026-10-08-sprint-02-abertura-t-items-e-contrato.md`):
  `max_open_campaigns` 1,000 on devnet, ceiling 10,000; `one_sided_fee_bps` up to 100; `opening_prize_bps` 9,000 to
  10,000; `opening_fee_usd` 1 to 5,000; `min_entry_lamports` 1,000,000 to 1,000,000,000; `max_price_age` 1 to 300 s,
  120 on devnet; `max_price_conf_bps` 1 to 100, 50 on devnet; `campaign_max_age` 30 to 300 s, 120 on devnet.
- **C44.** Decided as Sprint 02 built it **[FD]** (§14.2).

Closed in Sprint 05 (`docs/sprints/sprint-05-sdk-devnet-cycle.md`; `session-log/2026-10-09-sprint-05-sdk-e-ciclo-devnet.md`):
- **C25.** The SDK under React Native: Metro 0.87.1 bundles both halves for Android with React Native 0.87.1's preset,
  its hermesc (Hermes 1.0.0) compiles them, and the 24,000 vectors replay with no mismatch; `bigint` is native; the app
  must add `crypto.subtle.digest` and `crypto.getRandomValues` (`knowledge-base/tecnologia/sdk-react-native.md`) [F].
- **C26.** `@solana/kit` `~8.4.0`: all 27 sub-packages published, a clean frozen install, the typecheck and the tests
  pass [F].
- **C41.** One name, `@brot/sdk`, in the code and the documents [F].

| # | What to verify | Sprint |
|---|---|---|
| C4 | Whether Surfpool simulates epoch stake | 03 |
| C5 | The public devnet faucet's limit, which caps test SOL per baker (replaces the Circle faucet) | 08; 13 |
| C7 | How many settlements fit in one transaction; the per-account write limit under late-entry bursts | 04 |
| C8 | Bun 1.4.2 on the VPS (glibc, kernel, SSE4.2); `bun:sqlite` with one writer and many readers | 06 |
| C9 | Whether the visitor's country reaches the server through the tunnel (`CF-IPCountry`) | 08; 09 |
| C10 | How this Next.js version serves fonts | -1; 09 |
| C11 | A multisig with a public wait for program upgrades | 16 |
| C12 | `unix_timestamp` drift on devnet over time (one sample in Sprint 01: 1 s ahead) | 03 |
| C13 | What Cloudflare logs about visitors | 13; 17 |
| C18 | How the program reaches `sol_get_epoch_stake`: through `solana-epoch-stake =3.0.0` or a Pinocchio binding, and whether the pin is still needed once Anchor leaves (§1) | 02–03 |
| C19 | SOL/USD freshness on devnet, and which sponsored feeds stay fresh there | 02; 03 |
| C20 | The `litesvm` crate's `set_epoch_stake` for the `StakeAtLeast` YES path, in a version that builds under Rust 1.89 (0.16 is the candidate; 0.17 resolves Agave 4.3, §1) | 03 |
| C21 | The push oracle only moves forward on the live cluster | 03 |
| C22 | The Lighthouse program id, for the relay's allowlist | 03 |
| C23 | Alpenglow on devnet: dates, the Clock timestamp, slot length | Before 03 retests deadlines |
| C24 | Self-CPI compute cost inside a settle batch (one event alone, measured in LiteSVM in Sprint 02: 70 CU for the event frame plus 946 the runtime charges the caller per CPI) | 04 |
| C27 | The Cloudflare notification for unknown tunnel connectors | 06 |
| C28 | The Cloudflare Cache Rule needed to cache `/api/v1` JSON | 08 |
| C29 | The `next/og` route convention in this Next.js version | 10 |
| C31 | The waitlist record's fields named the same in code, README, privacy page and §8.1 | 09 |
| C32 | Per-method RPC credit weights; CoinGecko's commercial terms | 08 |
| C33 | Which Kit calls the app makes, and what the Hermes engine provides | 20 |
| C34 | Seed Vault Wallet on devnet; the Android UI test tool | 20 |
| C35 | The App Links certificate fingerprint and `assetlinks.json` | 20 |
| C36 | MWA gives the wallet no verified web origin | Before any H1 |
| C37 | The publisher wallet on hardware or offline; `dapp-store-cli` flags; the App NFT in the portal | 22 |
| C38 | Pinocchio's Zellic audit report, to link [E73] | 16 |
| C39 | Helius and other plan limits, which are per plan [E40] | 06; 18 |
| C40 | Who controls the Pyth receiver's upgrade authority on mainnet | 16 |
| C45 | The minimum distance between the target and the current value, per kind (check 3, §3.4.10) | 03 |
| C46 | How the epoch kinds meet the 3-to-90-day rule and the entry close, with no `deadline_at` in the proposal's sketch (§3.4.8) | 03 |
| C47 | The exact `StaleFeed` test, and the slot bound on a YES proof (§3.4.6, §3.4.8) | 03 |
| C48 | Closed 2026-10-09: nothing leaves `Contested` until Sprint 14 (§3.4.2); entry through `team_open_contest` is allowed | 04 |
| C49 | Whether `close_campaign` waits for a reserved creator share or pays it with the rent when the creator is the rent payer (§3.4.5) | 04 |
| C50 | The sealed entry: a flag on the join or an instruction of its own, and its minimum (§3.4.12) | 15 |

## Appendix A — Requirement traceability (BR-xx → BP source → component → sprint)

Forty-seven business requirements, catalogued from BP v0.0.3 by the proposal, updated for the founder's decisions of
2026-10-08 (P-1 to P-5 and D-f now decided) and checked against BP v0.0.4. Forty-six map to a component, a section of
this plan and a sprint; BR-36 stays outside the system. Sprint numbers are those of `docs/SPRINTS.md` v0.1.0. The
Android app comes from D-n, which BP v0.0.4 records in P1 §2.2 and places after mainnet in P4 §3.1.

| ID | Requirement (short) | BP source | Component | TP section | Sprint |
|---|---|---|---|---|---|
| BR-01 | Any wallet opens a campaign for US$500 in SOL, inside the rules | P1 §4.1; D-b | `user_open_campaign`; the creation box | §3.4.10, §3.4.16, §3.6 | 02–03; -1 and 19 |
| BR-02 | Creation rules in the program: five kinds, the account checked by its reader, no free text, 3–90 days, fixed fees; no list | P1 §4.2; P4 §4.3; D-i, D-k | The opening checks; A-10, A-11 | §3.4.8, §3.4.10 | 02–03 |
| BR-03 | The creator's 1% of entries, from the pot while winners stay whole, the shortfall from Brot's fee; none for the team or launch partners | P1 §3.4; D-g; P-2, P-3 (decided) | `creator_share()`; `settle_creator_share`; I11–I13 | §3.4.5, §3.4.13, §3.4.16 | 04 |
| BR-04 | The opening: 90% prize, 10% to Brot, held in the campaign vault and collected at the outcome (T23); priced by Pyth, shown with CoinGecko (D-f, decided); treasury per P-7 (open) | P1 §4.1; P4 §4.7; D-b, D-e, D-f | Opening conversion; `sweep_fees`; refill and conversion runbook | §3.4.4, §3.4.10, §3.4.16, §12 | 02; 04; 06; 18 |
| BR-05 | YES/NO; five public states; at most 90 days | P1 §3.1, §3.6 | State machine; `math/schedule.rs`; SDK `view` | §3.4.2, §3.6 | 02–05 |
| BR-06 | Entries close at 5% of the duration (24 h–7 d) or at an irreversible fact; early resolution | P1 §3.6, §4.1 | `schedule.rs`; `outcome_knowable` | §3.4.8, §3.4.10 | 02–03 |
| BR-07 | Repeat entries per wallet, no tokens; a minimum entry of 0.01 SOL (P-5, decided) | P1 §2.1, §3.1, §3.10 | `Entry` PDA; `user_join_campaign`; `expected_entry_total`; `min_entry_lamports` | §3.4.1, §3.4.3 | 02 |
| BR-08 | No cap, global or per campaign; mainnet after the audits and a multisig | P1 §3.2; P4 §4.4; D-h | No cap account or field; the exposure alert | §3.4.10, §3.5, §7 | 02; 16–18 |
| BR-09 | Fee 10% of the losing side; the estimate shown net of fee and creator share | P1 §3.2–3.3 | `math/fees.rs`, `payout.rs`; SDK `math`; panel copy | §3.4.16, §3.6 | 02–04; 11 |
| BR-10 | One-sided pot refunded; first wallet free, others 1%; the prize back to whoever opened (P-4, decided) | P1 §3.5 | `OneSided`; `settle_prize` | §3.4.5, §3.4.16 | 04 |
| BR-11 | A void refunds every entry without fee; the prize returns; the 10% follows the cause (P-4, decided) | P1 §3.5; P4 §4.6 | `Refund`; `settle_prize`; `VoidReason`; T23 | §3.4.7, §3.4.16 | 04 |
| BR-12 | No early exit; a lock notice before signing | P1 §3.10 | No exit instruction; panel notice; A-9 | §3.4.3, §3.6 | 02; 11 |
| BR-13 | Automatic payout in SOL to the wallet; reserved only below the rent minimum of an empty wallet | P1 §3.10; D-a | Settlement instructions; keeper batches and daily retry | §3.4.5, §3.5 | 04; 06 |
| BR-14 | SOL only, everywhere | D-a | Lamport vaults; no mint; SOL-only keeper | §3.4.4, §3.5 | 02 |
| BR-15 | Fee split: 25% treasury, 75% operations | P1 §1.3; P2 §4.2; P-7 | `sweep_fees` to `fee_recipient` (multisig); monthly routine | §3.4.3, §12 | 04; 18 |
| BR-16 | Sponsorship is the opening, from US$500, 90/10; the request is removed | P1 §3.7; D-b, D-t | `user_open_campaign` | §3.4.12 | 02; 15 |
| BR-17 | Neutral prize or sealed entry; an undisclosed sponsor only with a neutral prize, through Cloak | P1 §3.7; P4 §2.2; P-8 | Sealed entry; off-chain sponsor record; Cloak page; privacy audit | §3.4.12, §3.6, §8 | 15 |
| BR-18 | Sponsor perks: seal, name and link; posts case by case (BP-3) | P1 §3.7 | `content/partners.json` | §4 | 15 |
| BR-19 | 20–30 launch partners with a free campaign and a 72-hour highlight | P1 §3.8; D-d | Team-key campaigns; `content/partners.json`; ranking | §3.4.10, §3.5, §4 | 02; 08; 10 |
| BR-20 | Referral: 20% of the fee for 90 days; rebate up to 0.05 SOL (P-6, open); from day one on mainnet (BP-9) | P1 §3.9 | `ReferralLink`; indexer `referrals`; weekly routine; snapshot | §3.4.11, §3.5, §4 | 14 |
| BR-21 | Five campaign kinds; price by touch, with a fresh price on every entry | P1 §4.2 | `readers/*`; the price split | §3.4.8 | 01; 03 |
| BR-22 | Exclusions: single-key outcomes, opinion, sports (phase 2), Token-2022 for now, small-token prices by steps | P1 §4.3 | Closed `ReaderKind` | §3.4.8 | 03 |
| BR-23 | The program reads and compares; anyone can re-check the same account | P1 §4.4 | `resolve_campaign`; re-check panel; `recheck` | §3.4.6, §3.6 | 03; 05; 11 |
| BR-24 | Two scheduled services on different providers; no public resolve button | P1 §4.4; P4 §4.5 | Keeper primary, standby, watchdog | §3.5 | 06–07 |
| BR-25 | Six-hour window; confirm or void only; two-stage dispute | P1 §4.5 | `InReview`; team instructions; `reread_campaign`; `admin_decide_contest`; review queue | §3.4.7, §3.5 | 04; 07; 14 |
| BR-26 | The creator may join their own campaign, with an automatic notice (BP-14) | P1 §4.2 | Indexer flag; notice on burn, lock and stake kinds | §3.5, §3.6 | 08; 11 |
| BR-27 | Copy: the product words, "no human picks the winner" (BP-5), the devnet notice | P1 §4.6; D-m | `copy.ts`; D6 | §3.6 | 09–13 |
| BR-28 | Wallet only, no KYC; a country block as a switch | P1 §2.2; P4 §5.2 | Explicit MWA; `GEO_BLOCK` in the site, the app and `brot-rpc` | §3.5, §3.6, §3.7, §5 | 08; 09; 21 |
| BR-29 | Devnet beta with points for correct calls | P2 §2.5 | Indexer `points`; leaderboard; optional Seeker Genesis Token signal | §3.5, §3.7 | 08; 13 |
| BR-30 | Partner test: acceptance, posts, wallets and entries per partner | P2 §2.5 | Partner report without addresses | §3.5 | 08 |
| BR-31 | Third-party creation test: non-team campaigns, paid openings, two-sided, one-sided and empty, their share of volume | P2 §2.5, §6.3 | Indexer KPIs | §3.5 | 08 |
| BR-32 | Public fee page with a worked example net of fee and creator share; refund policy | P2 §3.3 | Site pages | §3.6 | 13 |
| BR-33 | Growth motors: partners, referral, a card per campaign and a post per resolution, creators | P2 §6.2 | Share card; `resolution-post.ts`; creation box | §3.6 | 10; 13; 19 |
| BR-34 | KPIs without personal data: 30-day return, one-sided share, per partner, campaigns resolved without error | P2 §6.3 | Indexer aggregates; acquisition channel only through `?ref=` | §3.5, §8 | 08 |
| BR-35 | Stop rule at 180 days | P2 §5.5 | Monthly volume report | §3.5 | 08 (the report); 18 (the rule starts) |
| BR-36 | Investor list never published | P2 §5.5 | Outside the system; never in the repository | — | — |
| BR-37 | Prize fund from month 10; treasury; buyback outside the model | P2 §4.6 | Treasury routine | §12 | After 18 |
| BR-38 | Tokens A and B on hold; whether "nao lidaremos com tokenomics" covers them is a new open item | P3 | Separate programs and audits; rebates off-chain | §14.2 | After 18 |
| BR-39 | Program rewritten in Pinocchio, reusing readers, vault design and test method | P4 §2.2; D-o | The program; `checks` | §3.3, §3.4, §3.4.17 | 02–05 |
| BR-40 | Mainnet only after both audit reports and a 2-of-3 multisig; creation rules audited (BP-17) | P4 §3.4, §4.1; D-h | The before-mainnet table | §7 | 16–18 |
| BR-41 | A public table of who can do what | P4 §4.2 | `content/powers.md`; the register page | §3.4.9, §4, §5 | 13 |
| BR-42 | Pause with two states, never blocking payouts; an incident plan | P4 §4.5 | Operating level; I10′; incident page | §3.4.9, §3.4.13, §7 | 02; 16 |
| BR-43 | Treasury: the platform in SOL, monthly conversion outside it (P-7, open) | P4 §4.7 | Multisig routine | §12 | 18 |
| BR-44 | Home-page ordering with many campaigns | P4 §7 | Ranking and listing | §3.5, §3.6 | 08; 10 |
| BR-45 | Every void records its reason | P4 §4.6 | `VoidReason`; `content/void-log/` | §3.4.7, §4 | 04; 12 |
| BR-46 | Cloak and SODAX on their own pages; no third-party code on the signing page | v0.0.3 P4 §2.2; P-8 | Site routes; K-10 | §3.6 | 15 (Cloak); 17 (SODAX) |
| BR-47 | "Programa ainda sem auditoria" and devnet notices | v0.0.3 P4 §4.1; P1 §4.6 | Site and app notices | §3.6, §3.7 | 13; 21 |
| Decision | The Android app on the Solana dApp Store | D-n; P1 §2.2; P4 §3.1 | `mobile/` | §3.7 | 20–22 |
| Decision | No AI in scope | D-q | Sprint 09 removes the inherited chat route | §3.6 | 09 |

## Appendix B — Data contract sketches

From proposal Appendix B, unchanged except that its section references point at this plan **[DP]**. They are sketches:
Sprint 05 (SDK) and Sprint 08 (indexer, API) write the real schemas, and the program's Shank IDL stays the single source
of the on-chain interface (proposal §2.3). No argument or field names a partner: a team key opens each partner campaign
and `content/partners.json` links it (P-3). Not sketched here: the `referrals` table (Sprint 14) and the H1 sign-in
store, which exists only if H1 is approved.

**SQLite (indexer), simplified.** Names follow D6.

```sql
CREATE TABLE events (
  signature TEXT NOT NULL, ix_index INTEGER NOT NULL, inner_index INTEGER NOT NULL,
  slot INTEGER NOT NULL, block_time INTEGER, name TEXT NOT NULL, campaign TEXT, seq INTEGER,
  data TEXT NOT NULL,                                  -- JSON, amounts as lamport strings
  PRIMARY KEY (signature, ix_index, inner_index)
);
CREATE TABLE campaigns (id TEXT PRIMARY KEY, address TEXT UNIQUE, kind TEXT, metric_account TEXT, target TEXT,
  creator TEXT, creator_is_team INTEGER, creator_share_bps INTEGER, template_version INTEGER,
  opening_paid_lamports TEXT, opening_price TEXT, prize_lamports TEXT, opening_fee_lamports TEXT,
  status TEXT, outcome TEXT, void_reason TEXT, pool_yes TEXT, pool_no TEXT,
  entries_close_at INTEGER, deadline_at INTEGER, review_ends_at INTEGER, last_seq INTEGER, updated_slot INTEGER,
  listed INTEGER, rank REAL);                          -- derived: ranking and listing (§3.5)
CREATE TABLE entries (signature TEXT, ix_index INTEGER, inner_index INTEGER, campaign TEXT,
  baker TEXT, side TEXT, amount TEXT, is_creator INTEGER, pool_yes_after TEXT, pool_no_after TEXT,
  slot INTEGER, block_time INTEGER, PRIMARY KEY (signature, ix_index, inner_index));
CREATE TABLE settlements (signature TEXT, ix_index INTEGER, inner_index INTEGER, campaign TEXT, recipient TEXT,
  role TEXT,                                           -- 'baker' | 'creator' | 'opener'
  paid TEXT, reserved INTEGER, mode TEXT, slot INTEGER, PRIMARY KEY (signature, ix_index, inner_index));
CREATE TABLE points (wallet TEXT PRIMARY KEY, points INTEGER NOT NULL, updated_slot INTEGER);
-- evidence tables: not rebuildable from RPC, snapshotted nightly
CREATE TABLE feed_history (feed_account TEXT, publish_time INTEGER, price TEXT, conf TEXT, exponent INTEGER,
  posted_slot INTEGER, PRIMARY KEY (feed_account, publish_time));
CREATE TABLE referral_payouts (week TEXT, referrer TEXT, amount TEXT, basis_json TEXT, tx_signature TEXT,
  PRIMARY KEY (week, referrer));
CREATE TABLE checkpoints (source TEXT PRIMARY KEY, last_signature TEXT, last_slot INTEGER);
```

**The creation parameters (zod), shared by the SDK, the site, the app and the preview.**

```ts
export const OpenCampaignParams = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("PriceTouch"), feedId: Hex32, direction: z.enum(["above", "below"]),
             target: z.string().regex(/^-?\d+$/), deadlineAt: UnixSeconds }).strict(),
  z.object({ kind: z.literal("SupplyAtMost"), mint: Base58, target: BaseUnits, deadlineAt: UnixSeconds }).strict(),
  z.object({ kind: z.literal("DammV2LockedAtLeast"), pool: Base58, target: BaseUnits, deadlineAt: UnixSeconds }).strict(),
  z.object({ kind: z.literal("StakePoolTvlAtLeast"), pool: Base58, target: BaseUnits, epoch: z.number().int() }).strict(),
  z.object({ kind: z.literal("StakeAtLeast"), voteAccount: Base58, target: BaseUnits, epoch: z.number().int() }).strict(),
]);
export const OpenCampaignArgs = z.object({
  id: U64String,                                   // drawn once by the client and saved: the retry guard (T17)
  params: OpenCampaignParams,
  openingUsd: z.number().int().min(500).optional(), // absent for a team key (P-3)
  maxLamports: BaseUnits.optional(),                // bound against price moves (T25)
}).strict();
// No string field carries text. validateOpenCampaign mirrors §3.4.10 for the preview; the program decides (A-10).
```

**One read-API DTO (zod).**

```ts
export const CampaignDTO = z.object({
  id: z.string(), address: Base58, kind: ReaderKindSchema, params: OpenCampaignParams, status: PublicStateSchema,
  outcome: OutcomeSchema.nullable(), creator: Base58, creatorIsTeam: z.boolean(), creatorShareBps: z.number().int(),
  poolYes: BaseUnits, poolNo: BaseUnits, prize: BaseUnits, openingPaid: BaseUnits, entriesCloseAt: UnixSeconds,
  deadlineAt: UnixSeconds, reviewEndsAt: UnixSeconds.nullable(), listed: z.boolean(), displayName: z.string().nullable(),
  asOfSlot: z.number().int(), chainTime: UnixSeconds,
});
// displayName: from A-11's sources only; null shows the shortened address.
```

## Appendix C — Sources

The proposal's list, with its E-numbers and URLs unchanged, read on 2026-10-06 and 07 unless a date is given; package
versions are registry `latest` then. Gaps in the numbering are unused: [E60]–[E71], 0.3's AI sources, were removed
with D-q except two still cited. Repository sources are cited inline. Where no URL was at hand, the source is named
without one. [E82] and [E83] are added by this plan, from sources TP v0.0.1 relied on.

**Solana Mobile and Seeker**
- [E1] Mobile Wallet Adapter specification 2.0 (changelog to 2.1.0): github.com/solana-mobile/mobile-wallet-adapter/blob/main/spec/spec.md
- [E2] npm: `@solana-mobile/wallet-standard-mobile` 0.6.0 (2026-08-17), `mobile-wallet-adapter-protocol` 2.3.0, `mobile-wallet-adapter-protocol-kit` 0.4.0, `@wallet-ui/react-native-kit` 4.3.0, `solana-mobile` CLI 0.5.0
- [E3] MWA JavaScript v3 release pull request #1642 (approved 2026-09-29, unreleased): github.com/solana-mobile/mobile-wallet-adapter/pull/1642
- [E4] Solana Mobile web guides (apps, installation, UX guidelines): docs.solanamobile.com/get-started/web/
- [E5] Local Network Access: docs.solanamobile.com/recipes/mobile-wallet-adapter/local-network-access; Chrome release notes: developer.chrome.com/release-notes/
- [E6] Publishing a web app and `webshell`: docs.solanamobile.com/recipes/general/publishing-a-web-app, docs.solanamobile.com/cli/webshell; TWA guide removed 2026-09-11: github.com/solana-mobile/solana-mobile-docs/pull/14
- [E7] Migrating to Wallet Standard: docs.solanamobile.com/recipes/mobile-wallet-adapter/migrating-to-wallet-standard
- [E8] wallet-adapter-react 0.15.40 source (automatic MWA, network inference): github.com/anza-xyz/wallet-adapter (packages/core/react/src/WalletProvider.tsx, getEnvironment)
- [E9] MWA issues #335 (Battery Saver), #1364 (Bubblewrap), #1458 (absolute icon URL), #1575: github.com/solana-mobile/mobile-wallet-adapter/issues
- [E10] Seed Vault: docs.solanamobile.com/solana-mobile-stack/seed-vault; solanamobile.com/blog/seed-vault-wallet-solana-seekers-native-mobile-wallet
- [E11] Seeker Genesis Token: docs.solanamobile.com/solana-mobile-stack/seeker-genesis-token; change of 2026-09-24: github.com/solana-mobile/solana-mobile-docs/pull/49
- [E12] Solana Mobile skills (SIWS backend recipe, SGT, Seeker Connect): github.com/solana-mobile/solana-mobile-skills
- [E13] Sign In With Solana: github.com/phantom/sign-in-with-solana; `verifySignIn` in `@solana/wallet-standard-util` 1.2.0: github.com/anza-xyz/wallet-standard (packages/core/util/src/signIn.ts)
- [E14] Seeker Connect: docs.solanamobile.com/solana-mobile-stack/seeker-connect; github.com/solana-mobile/seeker-connect
- [E16] Wallet signing on iOS: docs.solanamobile.com/recipes/mobile-wallet-adapter/wallet-signing-on-ios
- [E17] SKR and `.skr` domains: docs.solanamobile.com/solana-mobile-stack/skr
- [E18] Seeker hardware and software: solanamobile.com/seeker; release notes MR7 and MR9
- [E19] Push and Notification API support (WebView has neither): MDN browser-compat-data, `api/PushManager.json` and `api/Notification.json`
- [E35] Solana Pay and Actions: solana.com/docs/advanced/actions; Phantom on blinks: docs.phantom.com/developer-powertools/solana-actions-and-blinks
- [E36] Dialect alerts: docs.dialect.to; Solflare notifications: docs.solflare.com/solflare/technical/solflare-notifications

**Distribution, law and compliance**
- [E20] Solana dApp Store Publisher Policy (updated 2026-07-21): legal.solanamobile.com/publisher-policy-web
- [E21] Solana dApp Store Developer Agreement (2026-06-30): legal.solanamobile.com/developer-agreement-web
- [E22] Solana dApp Store Terms of Use (2025-12-03): solanamobile.com/dapp-store-tos
- [E23] dApp Store publishing docs (submit, update, CLI 1.0.1, listing guidelines, signing, listing links): docs.solanamobile.com/dapp-store/
- [E24] Solana Mobile grants and featured apps: solanamobile.com/grants; solanamobile.com/blog (several posts carry a date that looks like a site-migration artefact)
- [E25] Google Play pilot for its real-money category of this kind: support.google.com/googleplay/android-developer/answer/16902027 and /16926792
- [E26] Google Play real-money gaming policy and country list: support.google.com/googleplay/android-developer/answer/9877032 and /12256011
- [E27] Apple App Store Review Guidelines (updated 2026-06-08): developer.apple.com/app-store/review/guidelines/
- [E28] MP 1.394/2026, text and status in Congress: planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1394.htm; congressonacional.leg.br/materias/medidas-provisorias/-/mpv/175871
- [E29] Reported requests to Apple and Google to remove apps (secondary, 2026-04-18 and 2026-09-29): cnnbrasil.com.br; acritica.net
- [E30] ECA Digital, Lei 15.211/2025: planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15211.htm
- [E31] Marco Civil da Internet, Lei 12.965/2014: planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- [E32] OFAC, Sanctions Compliance Guidance for the Virtual Currency Industry (2021): ofac.treasury.gov/media/913571/download
- [E33] Range Risk API: docs.range.org/risk-api/risk-introduction; Chainalysis Sanctions Oracle deprecation: go.chainalysis.com/chainalysis-oracle-docs.html
- [E34] Cloudflare challenges and supported browsers: developers.cloudflare.com/cloudflare-challenges/reference/supported-browsers/

**Solana infrastructure**
- [E40] Helius plans (page updated 2026-10-06), LaserStream, Sender, priority-fee API: helius.dev/docs/billing/plans, /laserstream/grpc, /sending-transactions/sender, /priority-fee-api
- [E41] QuickNode pricing and add-ons: quicknode.com/pricing
- [E42] Alchemy Yellowstone gRPC, including the devnet endpoint: alchemy.com/docs/reference/yellowstone-grpc-overview
- [E43] Solana clusters and public endpoint limits: solana.com/docs/references/clusters
- [E44] Fees, `getRecentPrioritizationFees`, `logsSubscribe`, `getTransaction`, retries: solana.com/docs/core/fees; solana.com/docs/rpc; solana.com/developers/guides/advanced/retry
- [E45] Alpenglow: solana.com/upgrades/alpenglow; rollout dates from secondary reports (cryptoticker.io, 2026-09-29; Solana Compass, citing Anza), which disagree
- [E46] Yellowstone gRPC v16 and the TypeScript client 8.0.0: github.com/rpcpool/yellowstone-grpc; npm `@triton-one/yellowstone-grpc`
- [E47] Carbon 2.0 (Rust): github.com/sevenlabs-hq/carbon; Substreams for Solana: thegraph.com/docs/en/substreams/developing/solana/
- [E48] Self-CPI events and log truncation, as documented for Anchor's `emit_cpi!`: anchor-lang.com/docs/features/events
- [E49] Surfpool 1.6.0: solana.com/docs/tools/surfpool; LiteSVM 0.17.0 (`set_epoch_stake` since 0.15.0): crates.io/crates/litesvm; Mollusk 0.16.0: crates.io/crates/mollusk-svm. Read again on 2026-10-08 in Sprint 02: `mollusk-svm` 0.15 and 0.16 and the `litesvm` crate 0.17.0 resolve Agave 4.3 (`solana-program-runtime` 4.3.0), which declares Rust 1.97.1; `mollusk-svm` 0.14.0 resolves Agave 4.1.2 and is the one used (`session-log/2026-10-08-sprint-02-abertura-t-items-e-contrato.md`)
- [E50] `@solana/kit` 8.4.0 (2026-09-28): github.com/anza-xyz/kit/releases; `@solana/web3.js` 1.99.0 and 3.0.1; gill 0.14.0; Codama 1.11.0 and its packages (registry pages)
- [E51] Pyth receiver and push oracle source: github.com/pyth-network/pyth-crosschain/tree/main/target_chains/solana; push feeds (55 s / 0.5%): docs.pyth.network/price-feeds/core/push-feeds/solana; Hermes key: docs.pyth.network/price-feeds/core/upgrade/preparing; plans (Free has no API; Starter US$500 a month): app.pyth.com/plans; verification status: verify.osec.io
- [E52] Bun 1.4: bun.com/blog/bun-v1.4 (read 2026-10-08: 1.4.0 on 2026-08-19 or 20, the Rust port; 19 port regressions, all fixed); Bun in Rust: bun.com/blog/bun-in-rust; 1.4 breaking changes: github.com/oven-sh/bun/issues/28792; secondary: Appwrite, Wikipedia, alternativeto, The Pragmatic Engineer; Prisma's blog (Bun in production): prisma.io/blog/bun-rust-rewrite-prisma-compute; Node releases: nodejs.org/en/about/previous-releases
- [E54] Redis licences: redis.io/legal/licenses; Valkey: valkey.io/download; pg-boss: github.com/timgit/pg-boss
- [E55] Rent, measured with `getMinimumBalanceForRentExemption` on 2026-10-08: 650,240 lamports for 0 bytes (devnet) and 1,488,440 for 165 bytes (mainnet), that is 5,080 lamports per byte including the 128-byte account overhead. The 6,960 per byte used in 0.3 and OCR is outdated

**Security**
- [E66] CVE-2024-54134, a compromised `@solana/web3.js` release (1.95.6–1.95.7)
- [E69] Phantom Lighthouse: docs.phantom.com/developer-powertools/lighthouse

**Added in 0.4** (read on 2026-10-08)
- [E72] Pinocchio on crates.io: crates.io/crates/pinocchio (crate `pinocchio`, version 0.11.2, published 2026-06-09, Anza)
- [E73] p-token, built on Pinocchio, which replaced SPL Token on mainnet in 2026: Anza, anza.xyz/blog/febo-on-pinocchio-p-token-and-pushing-solanas-limits; OrbitFlare, orbitflare.com/blog/fundamentals/p-token. Pinocchio's Zellic audit as reported on 2026-10-08: named without a URL, none at hand **[AC: link the report]**
- [E74] Chainstack, "Pinocchio vs Quasar": docs.chainstack.com/docs/solana-pinocchio-vs-quasar
- [E75] The Quasar repository and its README ("has not been audited. APIs may change."); no published version: github.com/blueshift-gg/quasar
- [E76] Bun installation documentation: bun.com/docs/installation (glibc 2.17 or newer, kernel 5.6 or newer recommended, x64 with SSE4.2)
- [E77] CVE-2026-24910 (Bun, medium, fixed in 1.3.5): cvefeed.io/vuln/detail/CVE-2026-24910. Bun's blocked lifecycle scripts and `trustedDependencies` (secondary): named without a URL, none at hand
- [E78] Bun's Next.js guide: bun.com/guides/ecosystem/nextjs; a community report of a Next.js 16.3 build failing with Bun on Vercel (secondary): community.vercel.com/t/next-js-16-3-bun-runtime-1-3-12-build-failure-on-vercel-while-bun-1-3-14-works-locally/47139
- [E79] CoinGecko API pricing page: www.coingecko.com/en/api/pricing (the Demo plan, and the "Data provided by CoinGecko" attribution on paid plans); API terms: www.coingecko.com/en/api_terms
- [E80] CoinGecko public API, `simple/price`, SOL in US$: api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd, read 2026-10-08 at 15:29 UTC: US$109.27
- [E81] Shank IDL and Codama client for a Pinocchio program: QuickNode guide, www.quicknode.com/fr/guides/solana-development/pinocchio/how-to-build-and-deploy-a-solana-program-using-pinocchio; Codama clients in the Solana docs: solana.com/docs/programs/codama/clients

**Added in TP v0.1.0** (sources TP v0.0.1 relied on, outside this repository)
- [E82] solana-verify, for `solana-verify build` in CI and `verify-from-repo` after deploy, as TP v0.0.1 §7 read it in the local reference copy `solana-refs/solana-verifiable-build`: named without a URL, none at hand
- [E83] The neighbour project's deploy pattern and house rules on the shared VPS: `agenttokenfy/deploy/vps/README.md` and `agenttokenfy/docs/adr/ADR-019-self-hosted-platform.md`, outside this repository, as read for TP v0.0.1 §10 and §12 and summarised in `knowledge-base/tecnologia/servidor-e-dominio.md`
