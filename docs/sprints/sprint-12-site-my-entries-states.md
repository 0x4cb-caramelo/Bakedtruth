# Sprint 12 — Site: my entries and campaign states

**Status:** planned · **Branch:** `sprint-12-site-my-entries-states` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B8 (TP §3.6, §3.4.5, §3.4.7) |
| Depends on | Sprint 11; Sprint 06, for real payouts |
| Requirements covered | BR-05 (five states), BR-10 (one-sided pot), BR-11 (void), BR-13 (automatic payout, reserve path), BR-25 (window and contest, as seen), BR-45 (void reasons) |

The file was renamed with `git mv` from its v0.0.1 name, under D6.

## Goal

A baker follows each entry until the SOL arrives: closed, in review with the clock, paid, voided, and the rare credit
that waits because it would leave an empty wallet below the rent minimum. A creator sees the 1% and any returned prize
in the same place.

## Definition of done

- [ ] The "my entries" route (named with L-01) shows each entry with side, amount, estimated return, state and amount
      received. Open entries come from the chain; history from the wallet's entries route of `/api/v1` (TP §6). It also
      shows what the wallet received as creator (the 1%) or as opener (a returned prize, a refunded 10%), from the
      settlement roles of the indexer (proposal Appendix B).
- [ ] `/c/[id]` exists in each state:
  - **closed:** the entry panel goes, with the reason: entries closed on time, or the outcome is already known;
  - **in review:** the result, the value read, the target, the link, the six-hour clock and "Pago sozinho, ao fim da
    janela de 6 horas" (P1 §4.6);
  - **contested:** payout paused and the new deadline; the public name per L-04 (the program calls it `Contested`);
  - **paid:** YES or NO, and the amount received;
  - **void:** the public reason (from `VoidReason` and `content/void-log/`); every entry refunded without fee; the
    prize returned to whoever opened; and whether the opening's 10% was refunded (house failure) or kept (outside
    cause) (P-4);
  - **void on a stale feed** (`StaleFeed`, D7): the price feed stopped updating before the deadline, so every entry is
    refunded rather than the campaign resolving NO.
- [ ] A one-sided pot explains the refund, the 1% for every baker but the first (`ceil(entry × 100 / 10,000)`), and
      the prize returning to whoever opened (BR-10; P-4).
- [ ] **A reserved credit (TP v0.0.1 Q2, answered b, adjusted to SOL):** a credit that would leave an empty wallet
      below the rent-exempt minimum (650,240 lamports, 0.00065024 SOL) stays in the vault. The screen shows the
      amount, says the keeper retries daily, and offers "receber": the recipient funds the wallet and calls the settle
      instruction from it. The destination stays fixed by the program. With a 0.01 SOL minimum entry, this concerns
      the creator share, not entries (proposal §2.4.6).
- [ ] The public record route (named with L-01) lists voids and decisions, with reasons, from `content/void-log/`.
- [ ] The campaign page says where to report a wrong result (L-13).
- [ ] No claim button exists outside the reserve path.
- [ ] A devnet rehearsal with the keeper takes five campaigns through every screen: a YES, a NO, a void, a one-sided
      pot, and a paid opening whose prize returns.
- [ ] The sum of "received" on screen matches the `EntrySettled` and `CreatorShareSettled` events for that wallet.
- [ ] `cd app && bun run lint && bun run build` passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The "my entries" and public record features in `app/features/`.
- The states of the campaign page and of the card.
- The public format of a `content/void-log/` record, which Sprint 05's team scripts started, and its JSON Schema
  check in CI.

## Out of scope

The contest by any baker, with a deposit (phase 1.2). Telling a baker about a resolution or a payout: no channel in the
MVP (L-16; proposal §3.9). A team dashboard. The two-stage dispute's instructions (14).

## Founder decisions that block the sprint

- L-13 (Product Brief v0.0.1 gap): the public channel for reporting a wrong result.
- L-04 (Product Brief v0.0.1 gap): the public name of the state while payout is paused.
- **[Q]** The copy for a campaign that ends with no entry. The BP has no written rule for it (P1 §3.5, "A campanha
  sem nenhuma entrada não tem regra escrita"); the screen shows what Sprint 04's program does.
- **Answered:** TP v0.0.1 Q2 (b, the recipient may call the settle instruction; with SOL only the below-rent case
  remains); Q1 (B, any wallet may trigger resolution and payout, choosing nothing); P-1; P-4; D7 (b).

## Agents and skills

- **Agents:** `dev-product-agent`, `copywriter-agent` (the copy of each state), `technical-security-red-team-agent`
  (the "receber" action), `coordinator-agent`.
- **Skills:** `feature-scaffold`, `sprint-management`, `verify-build-works`, `codemap`, `secrets-scan`,
  `release-check`.

## Security gates

- `content/void-log/` lives in Git and changes only with two people's review.
- "Receber" exists only for a reserved credit, and the destination is always the wallet the program recorded.
- The copy says "Pago sozinho, ao fim da janela de 6 horas", never "pago em minutos" (P1 §4.6).
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
(cd app && bun run lint && bun run build)
bun test tests/ -t "credit to an empty wallet below rent is reserved"   # Sprint 04's program test, re-run
bun test tests/ -t "received on screen matches settlement events"       # to add
bun test tests/ -t "every public state renders"                         # to add, one case per state
bun run e2e -- --grep "campaign states"                                 # to add to the Sprint 11 smoke
```

The five-campaign rehearsal on devnet, by hand, through every screen.

## Risks

- What was received exists only in events: if the indexer lags, the screen shows less until it catches up.
- With no notification channel, a baker learns of a payout only by coming back.
- The contested state has no exit before Sprint 14's dispute instructions.
- The opening's 10% and the prize follow different rules on a void; the copy must not blur them.

## Expected artifacts

`app/features/` ("my entries", public record), `content/void-log/`, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** "my entries"; the campaign states; the public record.
- **Session log:** the public contest channel chosen; the public name of the contested state; the copy for an empty
  campaign.

## Record and retrospective

Filled in during the sprint and at closure.
