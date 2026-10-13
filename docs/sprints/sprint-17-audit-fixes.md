# Sprint 17 — Audits and fixes

**Status:** in progress; the audit package is written (2026-10-13); the audits, the fixes and the legal texts wait for outside parties (see "Record") · **Branch:** `sprint-17-audit-fixes` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B9 (TP §7 "Before mainnet", §8) |
| Depends on | Sprint 16 |
| Requirements covered | BR-40 (both audit reports), BR-28 (the country switch's content), BR-46 (the SODAX page), BR-47 (mainnet notices); C-08, C-12, C-14 |

## Goal

Two outside firms read the exact version; every serious finding is fixed and confirmed by whoever found it; the
reports go public. While they read, the site gains what mainnet needs and the program does not touch: the terms, the
country switch's content and the SODAX page.

## Definition of done

**The audits.**

- [ ] Two reports on the exact version, with commit and hash, covering at least: the opening (the ten checks of
      TP §3.4.10, the Pyth-priced charge, `max_lamports`, the retry guard on `id`); entries (the minimum,
      `expected_entry_total`, the sealed entry); the five readers, the price split and `StaleFeed`; the window, the
      contest and the dispute; settlement and lamport payouts with the reserve path; the fee, the one-sided fee and
      the creator share (P-2); `VoidReason` and the 10% path (T23); closing and revival; the `checks` module (T24);
      the referral link; `sponsor_add_prize`, if kept; configuration, powers and the pause.
- [ ] Every serious finding is fixed, with a test that reproduces it, and confirmed by the firm that found it.
- [ ] After the fixes, the standard checks, the seeded randomized test (I1 to I15) and `solana-verify build` pass; the
      final version has a new hash.
- [ ] Both reports are public, linked from the site.

**On the site, in parallel.**

- [ ] The terms of use, the risk notice and the privacy policy are published, their content from the lawyer's written
      review (L0). The policy says entries are public and permanent on-chain, names the rate limiter and Cloudflare,
      and gives the deletion path for off-chain data (C-08).
- [ ] The country switch: `GEO_BLOCK` and its country list, per L0 (L-20). With it on, the entry panel and the creation
      box disappear for a listed country; states, entries and payouts stay visible (K-11); `brot-rpc` refuses a join
      or an opening from it (X1.7). Tested on and off.
- [ ] The SODAX page exists on its own route, with no SODAX code on any entry page (K-10), only if P-8 confirms SODAX
      works with SOL.
- [ ] The mainnet notices are ready: the devnet notice leaves; "Programa ainda sem auditoria" leaves only once both
      reports are public (BR-47).
- [ ] The `privacy-audit` skill answers the nine questions for the visitor's country and IP before closure (gate 5).
      The IP never reaches disk; whether Brazilian law requires access logs (C-14) is answered by L0; the policy says
      what Cloudflare logs (TP §14.4 C13).
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The fixes, each with its test, and the final version with its hash.
- The legal texts, the country switch's content and the SODAX page.

## Out of scope

Any new program feature: what enters after the audit was not audited. The legal opinion itself: the
`legal-compliance-agent` drafts, the team's lawyer decides (D-s). SODAX working end to end, which exists only on
mainnet.

## Founder decisions that block the sprint

- **The two firms:** timeline, scope, the version they need, and the second firm's name. One appears as
  proofofexploit.com, in negotiation; the other has no name (P4 §4.1). Whether they have read Pinocchio programs.
  Worth asking now, long before this sprint.
- **L0** (proposal §5.2): the team lawyer's written review (D-s). It gives the terms (L-21), the country list (L-20),
  Brazil in the app (C-06), age (C-07) and log retention (C-14). An outside colleague's reading stays a proposal.
- **The new open item** (P4 §3.4): the one-report exception, opening with one report and a lower cap, lost its cap.
  The BP recommends waiting for both reports, which this plan assumes (K-12).
- **P-8** (open): SODAX and Cloak with SOL. **L-18** (Product Brief v0.0.1 gap): the SODAX page's design.
- **D5**, if it was not settled before Sprint 14.
- **[Q]** Whether to record terms acceptance when real money starts (C-12). It needs the optional H1 sign-in store
  (proposal §3.5), a founder decision and a privacy audit.

## Agents and skills

- **Agents:** `technical-security-red-team-agent`, `bug-triage-agent`, `legal-compliance-agent` (drafts of the legal
  texts), `copywriter-agent`, `coordinator-agent`.
- **Skills:** `privacy-audit`, `multi-ai-review`, `release-check`, `secrets-scan`, `decision-log`,
  `sprint-management`, `codemap`.

## Security gates

- Every fix passes the randomized test before it goes back to the firm that found the issue.
- **Personal data (gate 5):** the visitor's country and IP pass the `privacy-audit` skill before closure; the IP never
  reaches disk.
- No SODAX or Cloak code on an entry page (K-10).
- No text promises price, return or yield.
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run build:program && bun run test && bun run test:rust
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
solana-verify build                                       # the final hash [AC: flags]
bun test tests/ -t "<finding id>"                         # to add: one reproducing test per serious finding
bun test tests/ -t "country switch hides entries only"    # to add: on and off
bun test services/ -t "relay refuses a blocked country"   # Sprint 08's relay rules (X1.7)
(cd app && bun run lint && bun run build)
```

## Risks

- The timeline belongs to third parties and is not in the files read.
- A fix that changes the program needs a new reading.
- Cloudflare may not pass the visitor's country through the tunnel (TP §14.4 C9 **[AC]**).
- Auditors new to Pinocchio read hand-written checks that Anchor used to generate; the `checks` module's negative
  tests (T24) are their map.

## Expected artifacts

Both reports, the commit and hash of the final version, the legal texts, `app/features/` (country switch, SODAX
page), `CODEMAP.md`.

## Changelog and session log

- **Changelog:** audits done and findings fixed; terms; country switch; SODAX page.
- **Session log:** each serious finding and its fix; what the lawyer's review concluded; that the one-report exception
  was not used, or why it was.

## Record and retrospective

**2026-10-13, the audit package (lane L17).** `docs/audit/` holds the scope (every instruction, the ten creation rules
of TP §3.4.10 with their code and error, every parameter ceiling, the readers, the money paths, I1–I15), the threat
model, Pinocchio's own audits (Zellic and Neodyme, both on 0.8.4; this program pins 0.11.2), the fix workflow, and a
README whose release-candidate block is filled at the freeze (Sprint 16). Its section 17 lists the gaps found while
mapping the code; the lead confirmed four (the vault assertion in `pay_from_vault` compares a value with itself and
`move_lamports` checks only the balance; `tally_late_joins` has no negative test for its two refusals; the mutation
script misses `checks/close.rs` and `checks/paying.rs`; free team openings sit outside the open-campaign limit, a
founder decision of 2026-10-09 whose mitigation is the team-key opening alert). They go to Sprint 16's pre-freeze
hardening, after 14 and 15.

Open, with owners: the Sprint 14 and 15 sections and the release-candidate block (the lead, at the freeze); the two
audit firms, their dates, scope and reports (the founder, outside parties); the lawyer's review L0, which gives the
terms, the country list and the log rules (outside party); the SODAX page (P-8); the one-report exception (founder);
the country switch and the mainnet notices (code, after L0).
