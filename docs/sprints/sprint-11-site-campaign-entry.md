# Sprint 11 — Site: campaign page and entry

**Status:** planned · **Branch:** `sprint-11-site-campaign-entry` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B8 (TP §3.6; the relay's rules in TP §3.5) |
| Depends on | Sprints 09 and 10 |
| Requirements covered | BR-06, BR-07, BR-09, BR-12, BR-21, BR-23 (re-check panel), BR-26 (creator notice), BR-27 (D6 copy), BR-28; A-3, A-8, A-9 |

The file was renamed with `git mv` from its v0.0.1 name, under D6.

## Goal

A baker opens a campaign, checks the proof and re-checks it, picks YES or NO, sees what the entry may return net of
every fee, and signs. It is the first entry made through the site, and a retry can never add a second one.

## Definition of done

- [ ] `/c/[id]` shows the header and the proof: the value read now, through the SDK's copy of the program's reader
      logic; the target; the account with an explorer link; entries close and deadline, in UTC and local time.
- [ ] On a price campaign: the current price, the target, the campaign's maximum price age (30 s floor, TP v0.0.1 Q4
      answered), and what the screen says when no fresh price exists (L-22, Product Brief v0.0.1 gap).
- [ ] **The re-check panel (BR-23):** the account, the field, the value and the slot, and a copyable command that
      reads the same account through any RPC; the SDK's `recheck(campaign, rpcUrl)` backs it (proposal §2.9).
- [ ] **The creator notice (BR-26):** burn, lock and stake campaigns show "quem abriu pode controlar o resultado e
      pode ter entrado no SIM ou no NÃO", and the indexer's flag on an entry from the creator's own wallet shows on
      the page. Built as BP-14's recommendation, still open in P-9.
- [ ] **The entry panel:** YES or NO; the amount in SOL, at least 0.01 SOL (P-5); the estimated return net of the fee
      and the creator share, with the baker's own entry added to the pot. The panel's number equals the SDK estimate
      for that pot. The SDK reproduces P1 §3.2's table: with 300 on YES, 700 on NO and no prize, YES returns 3.10 per
      1 without the creator share and 3.067 with it.
- [ ] Before signing, the mandatory notices show: the return is an estimate and changes until entries close; a large
      entry lowers its own side's return (P1 §3.2); the money stays locked until the end, with no exit (BR-12; text
      per L-03); the fee; the devnet notice.
- [ ] Before signing, the panel re-reads the `Campaign` and the baker's `Entry` and simulates. The transaction carries
      `min_return_bps` and `expected_entry_total`. The deterministic summary (A-3), built by `@brot/sdk/tx`, shows
      side, amount, estimate net of fee and creator share, `min_return_bps` and network.
- [ ] **The retry guard (A-9; proposal §3.4 rule 6):** before handing the transaction to the wallet, the site saves
      the `Entry` it read and the transaction's `lastValidBlockHeight`. On a return without an answer it polls until
      that height passes before offering a retry. A duplicate fails on-chain through `expected_entry_total`.
- [ ] **Signing pauses during an upgrade (A-8):** the client compares the program's last-deploy slot (ProgramData,
      read through `/rpc`) with the slot its bundle was built for; on a mismatch it stops signing, backs off and
      reloads. Signing never depends on the indexer.
- [ ] Each failure has its own message from the SDK's error map: entries closed; outcome already known; no fresh
      price; pause; below the minimum; not enough SOL for the entry, the `Entry` rent and the network fee; entry changed
      since it was read; return below `min_return_bps`; signature refused; transaction failed; network down.
- [ ] A wallet with no devnet SOL gets the faucet link.
- [ ] The chance history and recent activity show only if the founder confirmed them (L-23).
- [ ] With `entries_allowed` false, the entry panel hides; the state, the proof and payouts stay visible (K-11).
- [ ] An entry made through the site appears on-chain, then in the API's activity.
- [ ] **The web smoke:** Playwright, pinned here, at desktop width and about 412 CSS px, with an injected test wallet,
      on Surfpool: entries on both sides, each failure message the smoke can provoke, and the retry guard
      (`bun run e2e`).
- [ ] **The relay's allowlist** for `brot-rpc` is taken from a trace of this client. The client polls
      `getSignatureStatuses` and opens no WebSocket, replacing today's `confirmTransaction` call
      (`app/lib/hooks.ts:228`) (proposal §2.6).
- [ ] **D6 copy:** every `copy.ts` of the site uses the D-m vocabulary ("campanha", "entrada", "entrar no SIM / no
      NÃO", "baker", "criador", "pote"), and a test fails on any word of the D6 table's copy row.
- [ ] `cd app && bun run lint && bun run build` passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The campaign-page and entry features in `app/features/`, with the copy of every notice and error in `copy.ts`.
- The re-check panel (size S), the creator notice (size S), the estimate net of fee and creator share (size S) and the
  web smoke (size M) (proposal §4.0).
- The relay allowlist trace, handed to `brot-rpc`'s configuration.

## Out of scope

"My entries" and the states after entries close (12). The creation box (19). The referral link (14). The sealed entry
(15). What the screen says with the country switch on (17).

## Founder decisions that block the sprint

- **Answered 2026-10-10, L-03 (the lock notice), approved by the founder, in English:** "Your entry stays locked until the
  campaign ends. You cannot take it out before then. Payouts go to your wallet automatically after the result is read."
  The entry panel shows this text before signing (BR-12). Any change to the text is a founder decision.
- From Sprint -1: the chance chart and activity (L-23), answered yes.
- **Answered:** P-5 (minimum entry 0.01 SOL); TP v0.0.1 Q3 (both sides allowed; the first-baker exemption covers the
  person); Q4 (maximum price age per campaign, 30 s floor); Q10 falls away with D-a (devnet SOL faucet, no test
  dollars).

## Agents and skills

- **Agents:** `technical-security-red-team-agent` (what the wallet signs; the simulation; the retry guard),
  `copywriter-agent` (notices and errors), `dev-product-agent`, `coordinator-agent`.
- **Skills:** `feature-scaffold`, `multi-ai-review` (the transaction the baker signs), `sprint-management`,
  `verify-build-works`, `codemap`, `secrets-scan`.

## Security gates

- No third-party code on the campaign page (K-10).
- The site only simulates; the program computes every value.
- No promise of a return anywhere; "chance" and "retorno estimado", never "price".
- The summary the baker reads comes from deterministic code (A-3).
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
(cd app && bun run lint && bun run build)
bun test tests/ -t "sdk math matches rust vectors"            # Sprint 05's vectors, re-run
bun test tests/ -t "entry panel estimate matches sdk"         # to add, with P1 §3.2's 3.10 and 3.067
bun test tests/ -t "a retried entry fails on expected total"  # to add (A-9)
bun test tests/ -t "copy uses the campaign vocabulary"        # to add (D6)
bun run e2e                                                   # to add here: Playwright smoke, desktop and 412 px
```

On devnet: entries on both sides; each failure provoked and its message seen; the estimate on screen against the SDK
and against what the program records.

## Risks

- The return falls after the entry: a baker who saw 3.10 may receive 1.63 (P1 §3.2). The notice and `min_return_bps`
  reduce it.
- On price campaigns, an entry needs a price no older than the campaign's maximum age; on devnet, with a 62–64 s
  cadence, that age is at least 90 s (proposal §2.5).
- The proof is read live by each visitor: the relay's short-TTL cache carries the load, and its limits apply.
- A wallet may append its own instructions, such as Phantom's Lighthouse assertions [E69]; the allowlist must accept
  them, with the program id recorded in Sprint 03 **[AC]**.

## Expected artifacts

`app/features/` (campaign page and entry), each feature's `copy.ts`, the Playwright configuration and the `e2e`
script, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** campaign page, re-check panel and entries through the site; web smoke.
- **Session log:** the final text of each mandatory notice; the pinned Playwright version; the relay allowlist.

## Record and retrospective

Filled in during the sprint and at closure.
