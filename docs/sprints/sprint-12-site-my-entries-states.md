# Sprint 12 — Site: my entries and campaign states

**Status:** built, PR open, waiting for the founder's devnet rehearsal and three answers (2026-10-10) · **Branch:** `sprint-12-site-my-entries-states`, cut from `origin/main` at `sprint-11` · **Dates:** none, by the founder's decision

## Record (2026-10-10)

- **Built:** every public state of `/c/[id]` (`app/features/campaign-page/states.ts`, `state-panel.tsx`,
  `copy-states.ts`), the wallet's payout and the creator's lines (`payout-panel.tsx`), "My entries" at `/my-entries`
  (`app/features/my-entries/`), "Receive" for a reserved creator share (`app/features/claim/`, on the SDK's new
  `prepareClaim`), the public record at `/record` from `content/void-log/` (`app/features/record/`), the record's public
  format in zod with its generated JSON Schema (`packages/sdk/src/schemas/void-log.ts`,
  `content/void-log/record.schema.json`), and the card's state line (`app/features/campaigns/state-line.ts`). A
  campaign whose account was closed after its payouts shows as closed instead of "not found".
- **The money is the SDK's mirror of the program:** `packages/sdk/src/read/math/stored.ts` mirrors `pot_rule`
  (settle_entry.rs), `prize_return` and `opener_return` (collect_fee/amount.rs), the due check of
  `settle_creator_share` and the snapshot's `input_of`. What a wallet received is summed only from its `EntrySettled`,
  `CreatorShareSettled` and `PrizeSettled` events. Amounts owed or received are written to the lamport; estimates say
  "est.".
- **Where the data comes from (a deviation from the DoD's wording):** the read API has no
  `/api/v1/wallets/:address/entries` (Sprint 08's indexer is not built), so the history is read from the chain: the
  wallet's own transactions (`getSignaturesForAddress` on the wallet, 50 a page, "Read older transactions" for more),
  each decoded by the SDK. Open entries come from the chain (the `Entry` at its PDA in every campaign the API lists or
  the history names). The relay's allowlist gained these callers, no new method (`docs/technical/relay-allowlist.md`).
- **Tests before the UI**, on the program in LiteSVM behind the recording RPC: whole cycles (a paid opening, joins, NO
  or a stale-feed void, tally, finalize, every payout, close) checked against the events and against the SOL that
  reached each wallet (`tests/site/received.test.ts`, `tests/site/my-entries.test.ts`); the SDK's stored-campaign mirror
  against each payout and each void class (a house failure refunds the 10%, an outside cause keeps it, a pot with no
  entry keeps it even on a house failure) (`tests/sdk/stored.test.ts`); the reserve path end to end
  (`tests/sdk/prepare-claim.test.ts`); one render per public state (`tests/site/states-render.test.ts`); the void log's
  format (`tests/site/void-log.test.ts`); the relay trace with the new reads; the two rehearsal scripts
  (`tests/ops/rehearsal.test.ts`).
- **The web smoke** gained "campaign states" (`tests/e2e/states.e2e.ts`): every state on its page with the report link,
  then "My entries" equal to the events after a whole cycle, and "Receive" paying a reserved share through the injected
  wallet. 14 passed (12 skipped by design). Sprint 11's smoke now reads the wallet's amounts exactly ("0.5 SOL", not
  "0.5000").
- **The devnet rehearsal recipe** (`deploy/devnet/rehearsal-sprint-12.md`), written read-only, with the two scripts it
  needed (`scripts/rehearsal/open-paid.ts`, `scripts/rehearsal/settle.ts`): five campaigns over about 82 hours from T0,
  about 9.7 SOL to start plus 1 SOL later. The void is a stake-pool campaign on a pool nobody updates (MissedWindow); a
  stale-feed void and the contested state cannot be forced on devnet and are covered by the tests. Every devnet write
  is the founder's.
- **The founder's answers (2026-10-10):** L-01, the routes `/my-entries` and `/record`; L-04, "Contested"; L-13, the
  official X account, https://x.com/brotmarkets, linked from every campaign page once the result is read; the payout
  wording: until the keeper settles, the screen says "Waiting for payout" and promises no time. **On devnet this
  replaces "Pago sozinho, ao fim da janela de 6 horas"** (P1 §4.6) in the DoD and the security gate below. For the same
  reason the reserved credit does not say "the keeper retries daily": the deployed keeper only resolves.
- **Waiting:** the five-campaign rehearsal (the founder's devnet writes); the founder's approval of the empty-campaign
  copy ([Q] below) and of a devnet wording for the L-03 lock notice, which still promises automatic payouts; Sprint 11's
  Phantom entry (still "reported, not verified" until its signature or the wallet's devnet address is sent).

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

- [x] The "my entries" route (named with L-01) shows each entry with side, amount, estimated return, state and amount
      received. Open entries come from the chain; history from the wallet's entries route of `/api/v1` (TP §6). It also
      shows what the wallet received as creator (the 1%) or as opener (a returned prize, a refunded 10%), from the
      settlement roles of the indexer (proposal Appendix B). **Done at `/my-entries`, with the history from the chain:**
      the API has no wallet route and the indexer is not built, so the wallet's own transactions are read and decoded
      by the SDK (the settlement roles come from the events themselves).
- [x] `/c/[id]` exists in each state (`tests/site/states-render.test.ts`, one case each; the web smoke):
  - **closed:** the entry panel goes, with the reason: entries closed on time, or the outcome is already known;
  - **in review:** the result, the value read, the target, the link, the six-hour clock and "Pago sozinho, ao fim da
    janela de 6 horas" (P1 §4.6); **on devnet, by the founder's answer, no automatic payout and no time is promised:
    "Waiting for payout", and the rule says payouts are sent by hand for now;**
  - **contested:** payout paused and the new deadline; the public name per L-04 (the program calls it `Contested`);
    **L-04 answered "Contested"; not reachable on devnet until Sprint 14 (`team_open_contest` is refused);**
  - **paid:** YES or NO, and the amount received;
  - **void:** the public reason (from `VoidReason` and `content/void-log/`); every entry refunded without fee; the
    prize returned to whoever opened; and whether the opening's 10% was refunded (house failure) or kept (outside
    cause) (P-4);
  - **void on a stale feed** (`StaleFeed`, D7): the price feed stopped updating before the deadline, so every entry is
    refunded rather than the campaign resolving NO.
- [x] A one-sided pot explains the refund, the 1% for every baker but the first (`ceil(entry × 100 / 10,000)`), and
      the prize returning to whoever opened (BR-10; P-4).
- [x] **A reserved credit (TP v0.0.1 Q2, answered b, adjusted to SOL):** a credit that would leave an empty wallet
      below the rent-exempt minimum (650,240 lamports, 0.00065024 SOL) stays in the vault. The screen shows the
      amount, says the keeper retries daily, and offers "receber": the recipient funds the wallet and calls the settle
      instruction from it. The destination stays fixed by the program. With a 0.01 SOL minimum entry, this concerns
      the creator share, not entries (proposal §2.4.6). **Done ("Receive"), with two corrections:** the creator pays
      the network fee and the cluster refuses a fee payer left below the minimum, so the wallet needs the rent-exempt
      minimum plus the fee (the SDK's `claimFloor`); and the screen does not say the keeper retries daily, because the
      deployed keeper does not (the founder's payout answer).
- [x] The public record route (named with L-01) lists voids and decisions, with reasons, from `content/void-log/`.
      **Done at `/record`:** team voids and corrections (a correction names the record it corrects); contest decisions
      arrive with Sprint 14's instructions. The log is empty today.
- [x] The campaign page says where to report a wrong result (L-13). **Answered: https://x.com/brotmarkets**, a plain
      link (K-10), on every page once the result is read.
- [x] No claim button exists outside the reserve path. "Receive" renders only for a share the program reserved, and
      the SDK refuses to prepare anything else (`NothingReserved`).
- [ ] A devnet rehearsal with the keeper takes five campaigns through every screen: a YES, a NO, a void, a one-sided
      pot, and a paid opening whose prize returns. **Waiting for the founder:** the recipe and its two scripts are
      ready (`deploy/devnet/rehearsal-sprint-12.md`); every devnet write is the founder's.
- [x] The sum of "received" on screen matches the `EntrySettled` and `CreatorShareSettled` events for that wallet.
      Checked on whole cycles in LiteSVM and in the web smoke, against the events and the SOL that reached each wallet.
- [x] `cd app && bun run lint && bun run build` passes.
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

- **Answered 2026-10-10, L-13** (Product Brief v0.0.1 gap): wrong results are reported on the official X account,
  https://x.com/brotmarkets. The campaign page links it, plainly (no X script), once the result is read.
- **Answered 2026-10-10, L-04** (Product Brief v0.0.1 gap): the state while payout is paused is called "Contested".
- **Answered 2026-10-10, L-01:** the routes are `/my-entries` and `/record`.
- **Answered 2026-10-10, the payout wording on devnet:** until the keeper settles (a separate server task), the screen
  says "Waiting for payout" and promises no time. It replaces "Pago sozinho, ao fim da janela de 6 horas" on devnet.
- **[Q], waiting for approval:** the copy for a campaign that ends with no entry. The BP has no written rule for it
  (P1 §3.5, "A campanha sem nenhuma entrada não tem regra escrita"); the screen shows what Sprint 04's program does (the
  prize back to whoever opened, the 10% kept, even on a house-failure void). Draft, in `copy-states.ts`: "Nobody entered
  this campaign, so there is nothing to pay out. The prize goes back to whoever opened it, and Brot keeps the 10%
  opening fee."
- **New, waiting:** the L-03 lock notice (approved in Sprint 11) ends "Payouts go to your wallet automatically after the
  result is read", which devnet does not do yet. Any change to it is the founder's.
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
- The copy says "Pago sozinho, ao fim da janela de 6 horas", never "pago em minutos" (P1 §4.6). **On devnet, by the
  founder's answer (2026-10-10), until the keeper settles: "Waiting for payout", with no time promised.**
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
(cd app && bun run lint && bun run build)
bun test tests/ -t "credit to an empty wallet below rent is reserved"   # added: the reserve path and the claim, end to end
bun test tests/ -t "received on screen matches settlement events"       # added: whole cycles, events and balances
bun test tests/ -t "every public state renders"                         # added, one case per state
bun test tests/ -t "what a stored campaign owes"                        # added: the SDK's mirror of each payout
bun test tests/ -t "my entries rows"                                    # added
bun test tests/ -t "void log"                                           # added: the record's format and JSON Schema
bun test tests/ -t "rehearsal scripts"                                  # added: open-paid and settle on LiteSVM
bun run e2e -- --grep "campaign states"                                 # added to the Sprint 11 smoke
```

The five-campaign rehearsal on devnet, by hand, through every screen: `deploy/devnet/rehearsal-sprint-12.md`.

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
