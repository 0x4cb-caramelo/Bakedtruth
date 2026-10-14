# Keeper (Sprints 06 and 07)

Watches the devnet program, resolves an open campaign when the program's reader says it can, and, when settlement is
switched on, carries every campaign through to its close. It keeps no state of its own beyond retry timers and alert
memory, re-reads the chain every cycle, and never creates an account for anyone. Every 60 seconds it:

1. **reads in batches** (`chain.ts`): every campaign in one `getProgramAccounts`; the config, the fee vault, Pyth's
   SOL/USD account, each open campaign's metric account (each address once) and every vault through
   `getMultipleAccounts`, 100 per call; the clock from the Clock sysvar;
2. **resolves** (`resolve.ts`): simulates `resolve_campaign` for the open campaigns worth it (`prefilter.ts`: past
   the deadline, or whose outcome the SDK's mirror says is knowable) and sends what the program accepts;
3. **settles**, only with `KEEPER_SETTLE=on` (`settle-plan.ts`, `settle.ts`): tallies the joins (a YES price result
   once its proof is over 60 s old, as the program requires: until then an earlier proof can still move its cut-off
   back, `CutoffNotFinal`), finalizes after
   the window, pays every entry, the creator share and the prize, collects the fee, closes the campaign and sweeps
   the fee vault, each step only when the campaign's state allows it and every destination the stored one. Off by
   default: whether the devnet keeper pays is the founder's decision;
4. **watches** (`chain-watch.ts`, `watch-rules.ts`, `pyth-watch.ts`): raises the alerts of `alert.ts`, each with its
   runbook in `deploy/vps/runbooks/`;
5. logs one JSON line per action and keeps the last cycle for `GET /healthz` on `127.0.0.1:4210`: the counts, the
   pending settlement work, `open_campaigns` against `max_open_campaigns`, the SOL held in the vaults, Pyth's
   programs, the keeper's balance, the mode and the settlement switch.

**Landing** (`budget.ts`, `landing.ts`, `send.ts`): instructions are packed into transactions that fit 1,232 bytes;
a failing instruction is dropped from its batch by the simulation and recorded by the program's error name, the rest
go on; the compute-unit limit comes from the simulation with a margin, the priority fee from
`getRecentPrioritizationFees`, clamped by a floor, a ceiling per kind of instruction and a lamport cap; the same bytes
are sent again every 2 s until the blockhash expires. A transient RPC error is retried at once; a refused or failed
step waits one cycle, doubling up to an hour (`backoff.ts`). Every step is idempotent on the program's side: a second
keeper, or a retry, gets the program's refusal and nothing is paid twice.

## Standby mode (Sprint 07)

`KEEPER_MODE=standby` runs the same package on a second machine with its own wallet and RPC. It never sends while the
primary answers: a send is refused at the lowest point (`send.ts`), whatever the caller. Three loops run:

- **the watchdog** (`watchdog.ts`, `standby.ts`): every 5 minutes it probes the primary's `/healthz`. After 10 minutes
  of silence it asks for a restart up to 3 times, one watchdog interval apart (`POST /restart`, HMAC-SHA256 over the
  timestamp and the body). Then it takes over: from then on it sends, as long as the primary stays silent. Every step
  is an alert; today the only transport is the journal, because the email provider is a founder decision (D4);
- **the feed watcher** (`watcher.ts`): every 5 s it resolves open price campaigns, through the same send path;
- **the second read** (`second-read-pass.ts`, `second-check.ts`, `proof-tx.ts`): every campaign in review is checked
  once through RPC B. A price campaign is compared with the signed message of the transaction that wrote its proof at
  `posted_slot`; the other kinds go through the SDK's `recheck`. The journal names the origin that answered and says
  when it is the primary's own provider. A mismatch goes to the review queue (`review-queue.ts`) and alerts; a
  resolution still unchecked in the window's last hour is queued as unchecked.

The primary's `POST /restart` (`restart.ts`) writes a flag file only after a valid signature and a timestamp within 60
s; a root-owned systemd path unit restarts the keeper (`deploy/vps/`). The units in `deploy/vps/` run the keeper as
its own user with its secrets as systemd credentials (`KEEPER_KEYPAIR`, `KEEPER_RPC_URL_FILE`,
`KEEPER_RPC_URL_B_FILE`, `KEEPER_RESTART_SECRET_FILE`); not installed yet. Still open: the Hermes price stream, the
load run of 1,000 campaigns, the soak test.

## Run

```bash
cp services/keeper/.env.example /path/outside/repo/keeper.env   # then fill it there, never in the repository
set -a; . /path/outside/repo/keeper.env; set +a
bun services/keeper/src/main.ts          # KEEPER_DRY_RUN=1 simulates and never sends; KEEPER_SETTLE=on settles
curl -s http://127.0.0.1:4210/healthz
```

Tests: `bun test services/keeper` (no cluster). The settlement, two-keepers and second-read tests run the program's
binary in LiteSVM (`target/deploy/brot_markets.so`) behind an in-process RPC (`tests/kit/litesvm-rpc.ts`); the
second read's fixtures are devnet answers recorded by `scripts/capture-proof-tx.ts` (read-only).
