# Keeper (Sprints 06 and 07)

Watches the devnet program and resolves an open campaign when the program's reader says it can. Every 60 seconds it:

1. lists the campaign accounts of the program that are `Open` (one `getProgramAccounts` call, decoded by `@brot/sdk/read`);
2. for each one, builds `resolve_campaign` with the campaign's own metric account, simulates it (`@brot/sdk/tx`), and
   sends it only when the program accepts the simulation;
3. logs one JSON line per action and keeps the last cycle for `GET /healthz` on `127.0.0.1:4210`.

It keeps no state of its own and never creates an account.

## Standby mode (Sprint 07)

`KEEPER_MODE=standby` runs the same package on a second machine with its own wallet and RPC. It never sends while the
primary answers: a send is refused at the lowest point (`send.ts`), whatever the caller. Three loops run:

- **the watchdog** (`watchdog.ts`, `standby.ts`): every 5 minutes it probes the primary's `/healthz`. After 10 minutes
  of silence it asks for a restart up to 3 times, one watchdog interval apart (`POST /restart`, HMAC-SHA256 over the
  timestamp and the body). Then it takes over: from then on it sends, as long as the primary stays silent. Every step
  is an alert (`alert.ts`); today the only transport is the journal, because the email provider is a founder decision
  (D4);
- **the feed watcher** (`watcher.ts`): every 5 s it resolves open price campaigns, through the same send path;
- **the second read** (`second-read.ts`): every InReview price campaign is read at both providers; a mismatch with the
  same publish time goes to the review queue (`review-queue.ts`) and alerts. Not built yet: the proof transaction at
  `posted_slot`, and the second read of the other four kinds.

The primary's `POST /restart` (`restart.ts`) writes a flag file only after a valid signature and a timestamp within 60
s; a root-owned systemd path unit restarts the keeper (`deploy/vps/`). Runbooks per alert: `deploy/vps/runbooks/`. What it does **not** do yet (later in Sprint 06):
`finalize_campaign`, the settlement and payout tasks, the batched reads of 100 accounts, the Hermes price stream, the
priority-fee and rebroadcast tuning, and the systemd units and deploy script.

## Run

```bash
cp services/keeper/.env.example /path/outside/repo/keeper.env   # then fill it there, never in the repository
set -a; . /path/outside/repo/keeper.env; set +a
bun services/keeper/src/main.ts          # KEEPER_DRY_RUN=1 simulates and never sends
curl -s http://127.0.0.1:4210/healthz
```

Tests: `bun test services/keeper` (no cluster; the watchdog tests use a fake fetch).
