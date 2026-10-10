# Sprint 11 — Site: campaign page and entry

**Status:** built for the Hackathon MVP (2026-10-10), A-8 waiting for the founder · **Branch:** `sprint-11-site-campaign-entry` · **Dates:** none, by the founder's decision

## Record (2026-10-10)

- **Built:** `/c/[id]` (`app/features/campaign-page/`) reads the campaign, the config, the Clock, the account it reads,
  the wallet's `Entry` and the creator's own `Entry` through the SDK over the browser's RPC; the read API gives only its
  health, the stand-in for the entries switch (K-11: `entries_allowed` is not served yet), since it carries no account
  bytes, maximum price age, minimum entry or epoch. The header, the
  rule of each kind in plain words, the proof (the value read now by the SDK's reader, "if read now", the account with
  its explorer link, entries close and deadline in UTC and local time), the price facts, the pot, the recent entries and
  the YES-chance history, the re-check panel, and "Your entry". The entry panel (`app/features/entry/`): YES or NO, the
  amount as exact lamports, the estimate, the rents, the notices, the review sheet with the SDK's summary, the wallet,
  the watch, the retry guard, and one message per failure.
- **The estimate is the SDK's:** the panel shows `checkJoin`'s estimate, the one `prepareJoin` signs `min_return_bps`
  against, written to four decimals and never rounded up. P1 §3.2: 300 on YES and 700 on NO, no prize: 31,000 bps
  ("3.10") without the creator share and 30,666 bps ("3.0666", P1's 3.067 at three decimals) with it.
- **Tests before the UI** (`tests/site/`, 38, run by `bun run test` in CI): the estimate against the SDK and P1 §3.2;
  the retry guard end to end on the program in LiteSVM; one message per failure; the proof on real captured accounts;
  the re-check commands' byte ranges against the SDK's readers; the D6 vocabulary of every `copy*.ts`; the client's RPC
  trace against `docs/technical/relay-allowlist.md`.
- **The web smoke** (`bun run e2e`, `tests/e2e/`, Playwright 1.63.0 pinned, Chromium 1243): the built site, an
  injected Wallet Standard test wallet, the program in LiteSVM behind the recording RPC (not Surfpool: the same binary,
  with the captured Pyth accounts fresh, in process). 10 passed: both sides at desktop and 412 px, then at desktop
  each failure it can provoke and the retry guard across a reload. It found two bugs, fixed: "Use Installed Wallet" did
  nothing after a reload (Sprint 09's code; the adapter had the wallet selected already), and the guard reported a
  failed entry as landed when another entry of the same wallet moved its total.
- **Reviews:** the copy review (all points applied: "est." on every estimated number, a floor that is not a
  promise, a way out for each failure, rules per kind that match the program) and a red-team review of what the baker
  signs. Its findings were fixed here: the guard's record now lives in the page's memory as well as in localStorage,
  belongs to one attempt, and no new attempt is prepared while one is unresolved ("Still checking your entry", with
  "Check again"); a status counts only once confirmed; a chain error is the program's only when its own instruction
  failed (read from the landed transaction); the deadline grows to the blockhash life after the wallet's answer, and
  freshness before signing is judged in blocks; preflight refusals count as not sent; a receipt without a signature
  shows the entry's actual sides; the panel stays while an entry is under way; the build refuses an RPC URL with a
  key. **Deferred:** a CSP nonce instead of `'unsafe-inline'`; comparing a landed transaction with the summary; a smoke
  wallet that changes the bytes (Lighthouse, priority fees).
- **On devnet, to the point of signing:** through the public RPC, read-only, a join on each devnet campaign was
  re-read, checked, built, summarised (trusted) and simulated by the devnet program (OK, `EntryAdded`, about 13.3k
  compute units); the panel's estimate equals the prepared one. **Signing and landing on devnet are unverified:** they
  need a real wallet, and device and emulator tests are deferred.
- **Waiting:** A-8 (the founder chooses where ProgramData is read until the relay exists); the API's activity (Sprint
  08's rest); the `brot-rpc` configuration (the relay is not built; the trace is in `docs/technical/relay-allowlist.md`).

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

- [x] `/c/[id]` shows the header and the proof: the value read now, through the SDK's copy of the program's reader
      logic; the target; the account with an explorer link; entries close and deadline, in UTC and local time.
- [x] On a price campaign: the current price, the target, the campaign's maximum price age (30 s floor, TP v0.0.1 Q4
      answered), and what the screen says when no fresh price exists (L-22, Product Brief v0.0.1 gap).
- [x] **The re-check panel (BR-23):** the account, the field, the value and the slot, and a copyable command that
      reads the same account through any RPC; the SDK's `recheck(campaign, rpcUrl)` backs it (proposal §2.9).
- [x] **The creator notice (BR-26):** burn, lock and stake campaigns show "quem abriu pode controlar o resultado e
      pode ter entrado no SIM ou no NÃO", and the indexer's flag on an entry from the creator's own wallet shows on
      the page. Built as BP-14's recommendation, still open in P-9. **Done:** in English (L-01); the flag is read from
      the creator's own `Entry` on-chain, since the indexer is not built.
- [x] **The entry panel:** YES or NO; the amount in SOL, at least 0.01 SOL (P-5); the estimated return net of the fee
      and the creator share, with the baker's own entry added to the pot. The panel's number equals the SDK estimate
      for that pot. The SDK reproduces P1 §3.2's table: with 300 on YES, 700 on NO and no prize, YES returns 3.10 per
      1 without the creator share and 3.067 with it.
- [x] Before signing, the mandatory notices show: the return is an estimate and changes until entries close; a large
      entry lowers its own side's return (P1 §3.2); the money stays locked until the end, with no exit (BR-12; text
      per L-03); the fee; the devnet notice.
- [x] Before signing, the panel re-reads the `Campaign` and the baker's `Entry` and simulates. The transaction carries
      `min_return_bps` and `expected_entry_total`. The deterministic summary (A-3), built by `@brot/sdk/tx`, shows
      side, amount, estimate net of fee and creator share, `min_return_bps` and network.
- [x] **The retry guard (A-9; proposal §3.4 rule 6):** before handing the transaction to the wallet, the site saves
      the `Entry` it read and the transaction's `lastValidBlockHeight`. On a return without an answer it polls until
      that height passes before offering a retry. A duplicate fails on-chain through `expected_entry_total`. **Done,
      after the security review:** the record lives in the page's memory and in localStorage and belongs to one
      attempt; no new attempt while one is unresolved ("Check again"); the deadline grows to the processed height at
      the wallet's answer plus 150 blocks; a refusal in the wallet or in a preflight counts as not sent; a settled
      record is deleted after a day.
- [ ] **Signing pauses during an upgrade (A-8):** the client compares the program's last-deploy slot (ProgramData,
      read through `/rpc`) with the slot its bundle was built for; on a mismatch it stops signing, backs off and
      reloads. Signing never depends on the indexer. **Waiting (founder):** `/rpc` does not exist yet (Sprint 08's
      relay); whether to read ProgramData from the public RPC until then is the founder's question. Not built.
- [x] Each failure has its own message from the SDK's error map: entries closed; outcome already known; no fresh
      price; pause; below the minimum; not enough SOL for the entry, the `Entry` rent and the network fee; entry changed
      since it was read; return below `min_return_bps`; signature refused; transaction failed; network down.
- [x] A wallet with no devnet SOL gets the faucet link.
- [x] The chance history and recent activity show only if the founder confirmed them (L-23). **Done:** L-23 is yes;
      read from the campaign's last 20 transactions on-chain until the indexer serves them.
- [ ] With `entries_allowed` false, the entry panel hides; the state, the proof and payouts stay visible (K-11).
      **Partly:** the panel hides and the state card shows, but the read API serves no `entries_allowed` yet: the
      panel follows Sprint 09's stand-in, the API's health being `ok`, so it fails closed (no API, no panel).
- [ ] An entry made through the site appears on-chain, then in the API's activity. **Partly:** on-chain in the web
      smoke (LiteSVM) and on devnet up to the wallet (simulation); the page's own activity panel shows it from the
      chain's events. **Waiting:** the API has no activity route (Sprint 08's rest), and a signed devnet entry needs a
      real wallet.
- [x] **The web smoke:** Playwright, pinned here, at desktop width and about 412 CSS px, with an injected test wallet,
      on Surfpool: entries on both sides, each failure message the smoke can provoke, and the retry guard
      (`bun run e2e`). **Done on LiteSVM, not Surfpool** (record above); the failures run once, at desktop width.
- [x] **The relay's allowlist** for `brot-rpc` is taken from a trace of this client. The client polls
      `getSignatureStatuses` and opens no WebSocket, replacing today's `confirmTransaction` call
      (`app/lib/hooks.ts:228`) (proposal §2.6). **Done:** `docs/technical/relay-allowlist.md` (11 methods, no
      WebSocket; `app/lib/hooks.ts` left with the old app in Sprint 09). The relay itself is not built yet.
- [x] **D6 copy:** every `copy.ts` of the site uses the D-m vocabulary ("campanha", "entrada", "entrar no SIM / no
      NÃO", "baker", "criador", "pote"), and a test fails on any word of the D6 table's copy row. **Done** in English
      (L-01): campaign, entry, baker, creator, pot, YES/NO; `tests/site/copy-vocabulary.test.ts` fails on the D6 row's
      old words and their English equivalents (market, bet, odds, position, a chance in cents…) in every `copy*.ts`.
- [x] `cd app && bun run lint && bun run build` passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4). **Partly:** checks, secret scan, code map, CHANGELOG and
      session log done; the copy, security and coordinator reviews ran (record above); merge and tag wait for the founder.

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
- **Open, asked 2026-10-10 (blocks A-8 only):** where the client reads ProgramData's last-deploy slot until `/rpc`
  exists: the public devnet RPC now, or wait for Sprint 08's relay.
- **Open, does not block:** the floor a baker signs. The panel uses the SDK's default, `min_return_bps` 1% below the
  estimate (the SDK allows up to 20%); Sprint -1's design left the tolerance to confirm here.
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
bun test tests/ -t "entry panel estimate matches sdk"         # added: P1 §3.2's 3.10 and 3.067
bun test tests/ -t "a retried entry fails on expected total"  # added (A-9), with tests/ -t "the retry guard's rules"
bun test tests/ -t "copy uses the campaign vocabulary"        # added (D6)
bun run e2e                                                   # added: Playwright smoke, desktop and 412 px (LiteSVM)
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

The record is at the top of this file (2026-10-10). Retrospective:

- **What worked:** writing the money, the guard and the messages as pure modules with tests on the real program
  (LiteSVM behind a local RPC) before any component; and a browser smoke with an injected wallet, which found two bugs
  that unit tests could not see (a reconnect after reload, and the guard reading another entry's total as its own).
- **What did not:** the entry prompt was stale on L-03 (already approved and merged); this machine's program binary was
  older than the program id, so the SDK's LiteSVM tests failed until CI's artifact replaced it; Surfpool was not used
  for the smoke (LiteSVM gives the same binary with fresh Pyth accounts in process).
- **Carried:** A-8 (the founder's answer on ProgramData's source); a signed entry on devnet with a real wallet; the API's
  activity route and `entries_allowed` (Sprint 08); the relay's configuration from `docs/technical/relay-allowlist.md`
  (Sprint 08); the CSP against MWA's local WebSocket in the deferred mobile tests; and the security review's three
  deferrals (TP §7.2): a CSP nonce instead of `'unsafe-inline'`, comparing a landed transaction with the summary, and
  a smoke wallet that changes the bytes.
- **Coordinator review:** approved with caveats, no code blocker. Its documentation findings (the allowlist's
  commitments and callers, stale wording here and in the session log, the deferrals in the Technical Plan) and its
  privacy point (the guard's browser record is now deleted a day after it settles) were applied before the PR.
