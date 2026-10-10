# Keeper (Sprint 06, MVP happy path)

Watches the devnet program and resolves an open campaign when the program's reader says it can. Every 60 seconds it:

1. lists the campaign accounts of the program that are `Open` (one `getProgramAccounts` call, decoded by `@brot/sdk/read`);
2. for each one, builds `resolve_campaign` with the campaign's own metric account, simulates it (`@brot/sdk/tx`), and
   sends it only when the program accepts the simulation;
3. logs one JSON line per action and keeps the last cycle for `GET /healthz` on `127.0.0.1:4210`.

It keeps no state of its own and never creates an account. What it does **not** do yet (later in Sprint 06):
`finalize_campaign`, the settlement and payout tasks, the batched reads of 100 accounts, the Hermes price stream, the
priority-fee and rebroadcast tuning, and the systemd units and deploy script.

## Run

```bash
cp services/keeper/.env.example /path/outside/repo/keeper.env   # then fill it there, never in the repository
set -a; . /path/outside/repo/keeper.env; set +a
bun services/keeper/src/main.ts          # KEEPER_DRY_RUN=1 simulates and never sends
curl -s http://127.0.0.1:4210/healthz
```

Tests: `bun test services/keeper` (no cluster).
