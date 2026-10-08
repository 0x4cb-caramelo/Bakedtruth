# Sprint 15 — Sponsorship: the sealed entry

**Status:** planned · **Branch:** `sprint-15-sponsorship` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B9 (TP §3.4.12) |
| Depends on | Sprints 04, 05 and 12 |
| Requirements covered | BR-16 (sponsorship is the opening; the request is removed), BR-17 (neutral prize or sealed entry), BR-18 (seal, name and link), BR-46 (the Cloak page, if P-8 allows) |

**Where it fits.** Track A, in parallel with Sprint 14 (proposal §4.0).

**What changed from v0.0.1.** With D-b, opening a campaign already is sponsoring at the minimum: US$500 in SOL, 90%
a neutral prize and 10% to Brot, built in Sprint 02. D-t removed the sponsor request, so its account, its escrow, the
team's accept and refuse path and the 14-day self-cancel are gone. The sprint shrinks to the sealed entry and, only if
the founder keeps it, `sponsor_add_prize` (proposal §2.4.8) **[FD]**.

## Goal

A sponsor puts money on one side of a campaign under its own name, and Brot's 10% of it waits in the vault until the
outcome. If the founder says yes, a third party can also add a prize to a campaign someone else opened.

## Definition of done

- [ ] **The sealed entry** (`SponsorEntry` in the D6 table) is an entry on YES or NO that also charges 10% (proposal
      §2.4.8). Whether it is a variant of `user_join_campaign` or its own instruction file is recorded at the sprint's
      opening; either way one instruction lives in one file. Of the amount paid, 90% becomes the entry and 10% the
      sponsor fee **[INF]** (P1 §3.7's 90/10, applied to the entry as TP v0.0.1 §3.4.12 applied 70/30).
- [ ] The 10% waits in the campaign vault, bookkept, until the outcome (TP v0.0.1 Q6, answered a; the same path as the
      opening's 10%, T23). Then it is swept to `fee_recipient`, or refunded on a house-failure void (`VoidReason`).
- [ ] The sealed entry follows the common rule of any entry in a one-sided pot and on a void (TP v0.0.1 Q5, answered
      a): refunded without fee on a void; charged 1% in a one-sided pot unless it is the first baker.
- [ ] The seal, the sponsor's name and its link live in `content/partners.json`, reviewed by two people; the card and
      the campaign page show them (BR-18). The perks beyond seal, name and link follow BP-3 (P-9, open).
- [ ] A sealed entry is disclosed by definition. An undisclosed sponsor gives only a neutral prize ("quem não mostra o
      nome só entra com prêmio neutro", P1 §3.7). The program cannot tell an undisclosed sponsor joining as a plain
      baker from any baker **[INF]**, so the sponsored campaign shows the notice that "o patrocinador pode controlar o
      resultado e pode ter entrado num dos lados" (P1 §3.7). The screen says "não divulgado", never "anônimo".
- [ ] **`sponsor_add_prize(lamports, disclosed)`**, built only if the founder keeps it (P1 §3.7's open question): a
      later prize on an existing campaign, at the same 90/10; the prize returns whole to that sponsor in a one-sided
      pot and on a void, and its 10% follows the cause, as P-4 rules for the opening **[INF]**; it stays outside the
      creator share's base (P-1, I12). If the answer is no, it is not built and the reason is recorded.
- [ ] With the pause on, the sealed entry and, if kept, `sponsor_add_prize` fail; resolution, payouts and refunds work
      (I10′).
- [ ] Two users: wallet A cannot settle, redirect or refund B's sealed entry or added prize.
- [ ] **The Cloak page (BR-17):** its own route, with no Cloak code on the entry page (K-10), built only if P-8
      confirms Cloak works with SOL. On devnet it is a demonstration.
- [ ] The seeded randomized test, extended with the sealed entry and, if kept, the added prize, keeps I1 to I15 (I3′
      and I15 with the sponsor fee in the bookkeeping).
- [ ] The IDL, the generated client and the SDK are regenerated; the program is redeployed to devnet from the CI
      artifact.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- In the program: the sealed entry and, if kept, `sponsor_add_prize`, each in its own file, with negative tests per
  check (T24). Size S–M (proposal §4.0).
- On the site: the sealed entry and, if kept, the added prize, with the screens L-11 asks for; the seal on cards and
  pages; the Cloak page if P-8 allows it.
- The `content/partners.json` fields for sponsors.

## Out of scope

The sponsor request, its escrow and its 14-day self-cancel (D-t). Fixed paid tiers (BP-3 proposes 500 as a floor,
with no tiers). The SODAX page (17). An undisclosed sponsorship end to end: Cloak works only on mainnet. Any change to
the opening, which already is the US$500 sponsorship (Sprint 02).

## Founder decisions that block the sprint

- **[Q]** May a third party add a prize to someone else's campaign (P1 §3.7, "Continua sem regra")? It is the only
  reason to keep `sponsor_add_prize`.
- **[Q]** The sealed entry's minimum: the US$500 floor of the pitch ("From $500") and of BP-3, or none. If the floor
  applies, the program prices it at the Pyth SOL/USD price with `max_lamports`, reusing the opening's conversion (TP
  §3.4.16).
- **BP-3** (P-9, open): the perks; recommended: seal, name and link for all, posts and highlight case by case.
- **P-8** (open): whether Cloak works with SOL.
- **L-11 and L-18** (Product Brief v0.0.1 gaps): the screens of the sealed entry and of the Cloak page.
- **Answered:** D-b and D-t (opening is sponsoring; no request); TP v0.0.1 Q5 (a) and Q6 (a); P-1; P-4.

## Agents and skills

- **Agents:** `technical-security-red-team-agent`, `business-red-team-agent` (the perks and the floor),
  `copywriter-agent`, `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review`, `feature-scaffold`, `privacy-audit` (sponsor names and links),
  `secrets-scan`, `codemap`, `verify-build-works`, `decision-log`, `release-check`.

## Security gates

- The randomized test passes again before any redeploy (gate 1).
- The sponsor's money is never stuck: void, one-sided pot and close each have a tested exit.
- No Cloak code on the entry page (K-10).
- The copy says "não divulgado", never "anônimo", with the notice above.
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun run build:program && bun run test && bun run test:rust
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
bun test tests/ -t "sealed entry holds its 10 percent until the outcome"   # to add
bun test tests/ -t "sealed entry follows the common rule"                  # to add: one-sided, void by cause
bun test tests/ -t "added prize returns to its sponsor"                    # to add, only if kept
bun test tests/ -t "paused campaign refuses new money, never payouts"      # I10′, extended
node scripts/codemap.js --check && node scripts/ci-secret-scan.js origin/main
```

One test per instruction and per error. The outcomes on devnet: resolved, one-sided, voided by an outside cause and
voided by a house failure.

## Risks

- A sponsor who controls the result also enters. The notice reduces the harm; the risk stays (P1 §3.7).
- The sprint is not ready when Sprint 16 cuts the release candidate: the founder chooses between waiting and auditing
  without it (Sprint 16).
- Cloak hides only small amounts well (P1 §3.7, citing P4 §2.2), so a large undisclosed prize may not stay hidden.

## Expected artifacts

The program files of Deliverables, `app/features/` (sealed entry, Cloak page if built), `content/partners.json`, the
IDL and generated client, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** the sealed entry; the added prize, if kept; the Cloak page, if built.
- **Session log:** the answers on the added prize and the floor; the perks decided; P-8's result.

## Record and retrospective

Filled in during the sprint and at closure.
