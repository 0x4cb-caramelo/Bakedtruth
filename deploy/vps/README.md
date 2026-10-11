# deploy/vps: the keeper on the shared server

What runs on the server for Brot Markets, and where each secret lives. No value is written here.

| What | Where on the server | Owner, mode | Notes |
|---|---|---|---|
| Keeper code (one release per commit) | `/srv/brot-markets/keeper/releases/<commit>`, `current` links to it | `brot`, 0750 | Installed with `bun install --frozen-lockfile --ignore-scripts --filter @brot/keeper` |
| Bun 1.4.2 binary | `/var/lib/brot-markets/bun/bun` | `brot`, 0700 | Its SHA-256 is in `bun-1.4.2.sha256` (the zip's hash) and in the sprint record |
| Keeper settings (incl. the RPC URL) | `/etc/brot-markets/keeper.env` | `root:brot`, 0640 | Copy of `services/keeper/.env.example`, filled on the server |
| Keeper keypair (devnet, throwaway) | `/etc/brot-markets/keeper-devnet.json` | `root:brot`, 0640 | A 64-byte array; never in the repository or a log |
| Unit | `/etc/systemd/system/brot-keeper.service` (a copy of `brot-keeper.service` here) | `root`, 0644 | `Restart=on-failure`, sandboxed, port 4210 on loopback |

## Rotating the RPC URL

Edit `/etc/brot-markets/keeper.env` as root, change `KEEPER_RPC_URL`, then `sudo systemctl restart brot-keeper`.
The URL (for Helius, its API key) never goes into a file in the repository or into a chat.

## Turning the resolve on

`KEEPER_DRY_RUN=1` simulates and logs and sends nothing. Set it to `0` only when the keeper's address is funded and
the change is wanted; then restart the unit. Check with `curl -s http://127.0.0.1:4210/healthz`.

## Cycle length

`KEEPER_CYCLE_MS=15000` on the server (the code default is 60000). The devnet price account updates every 62 to
64 s, and the price proof must be at most 60 s old: a 60 s cycle often reads it just too late (`ProofStale`). See
`session-log/2026-10-10-sprint-06-proof-e-modo-real.md`.

## Stopping

`sudo systemctl stop brot-keeper` (or `disable --now` to keep it off after a reboot). The other units (`brot-landing`,
`brot-tunnel`) are not affected.

## Sprint 07: the standby, the restart and the alerts (closed for the Hackathon MVP, 2026-10-10)

On the server, as the founder authorised on 2026-10-10: `brot-keeper` runs release `cc87637` (`main` at PR #48), with
`ReadWritePaths=/run/brot-markets` in its unit, `/etc/brot-markets/restart-secret` (root:brot, 0440), the two
`KEEPER_RESTART_*` keys in `keeper.env`, and `/etc/tmpfiles.d/brot-markets.conf`. Backups of the previous env and unit
are in `/etc/brot-markets/bak-sprint07/`. Rollback: point `current` back to `releases/755798c` and restart.

The restart path unit is **not installed, by decision** (founder, 2026-10-10): the standby is deferred to
Post-Hackathon, so nothing needs a restart from outside. A signed `POST /restart` is accepted and writes the flag, but
nothing acts on it yet. The standby VM 2 and its unit are deferred too.

The files below are in the repository. None of the rest is installed on the server or on VM 2.

| What | File | Where it goes | Status |
|---|---|---|---|
| Restart flag watcher (root) | `brot-keeper-restart.path` | `/etc/systemd/system/` | Not installed, by decision (2026-10-10) |
| Restart action (root, oneshot) | `brot-keeper-restart.service` | `/etc/systemd/system/` | Not installed, by decision (2026-10-10) |
| Standby unit for VM 2 | `brot-keeper-standby.service` | VM 2's `/etc/systemd/system/` | Not installed; deferred to Post-Hackathon (D4) |
| Alert runbooks | `runbooks/` | repository only | Written; the e-mail channel is not chosen |

**The restart flag.** The keeper's `POST /restart` (signed with HMAC-SHA256) writes `/run/brot-markets/restart.flag`.
The path unit sees the file and starts `brot-keeper-restart.service` as root, which removes the flag and restarts
`brot-keeper`. The keeper's user never gets sudo. Before installing, the primary's unit needs `/run/brot-markets` writable
for the keeper (a `ReadWritePaths=/run/brot-markets` line under `ProtectSystem=strict`); that change is not made here.

The directory is created at boot by a line in `/etc/tmpfiles.d/brot-markets.conf` (root installs it):

```
d /run/brot-markets 0750 brot brot -
```

**The restart secret.** One HMAC key, shared by the primary (it verifies) and the standby (it signs). It is a file
owned by root, mode `0400`, read through `LoadCredential=` on each side: `/etc/brot-markets/restart-secret` on the
primary and on VM 2. The env file names it with `KEEPER_RESTART_SECRET_FILE`. The value never goes into a file of the
repository, a chat or a log. Rotation: write the new value to both machines, then restart both keepers (the primary
first). Changing it on one side only makes every request fail with a bad signature, which the watchdog reports as
`restart failed`.

**The standby's env file (VM 2).** `/etc/brot-markets/keeper-standby.env`, root-owned, mode `0640`, group `brot`. It
holds the primary's ops address (`KEEPER_PRIMARY_URL`), the second RPC (`KEEPER_RPC_URL_B`, another company), the
standby keypair (wallet 2, SOL only) and `KEEPER_MODE=standby`. Each value is filled on the machine, never here.

**Timings.** Watchdog every 5 minutes (`KEEPER_WATCHDOG_MS`); takeover after 10 minutes of silence
(`KEEPER_TAKEOVER_AFTER_MS`); 3 restart requests (`KEEPER_RESTART_TRIES`); the standby's feed watcher every 5 seconds
(`KEEPER_WATCH_MS`). The runbooks in `runbooks/` say who acts on each alert.

## The relay, `brot-rpc` (Sprint 08; not installed)

The relay between visitors' browsers and the paid RPC (`services/rpc/README.md`). Every step below is the founder's;
none is done. In this order:

1. **The account.** A provider account for the relay alone (T14), with a hard spending limit at the provider (D4).
   Read its privacy policy and data terms first (the legal review, R3): the site's privacy page names it.
2. **The user and its Bun.** A system user `brot-rpc`, with no login, and its own root-owned copy of the pinned Bun
   binary, which the unit runs. The keeper's binary and folders stay as they are: `/var/lib/brot-markets` is `brot`'s
   home (`0750`) and holds the waitlist, so the relay's user cannot enter it, and should not.

   ```bash
   sudo install -d -o root -g brot-rpc -m 0750 /usr/local/lib/brot-rpc
   sudo install -o root -g brot-rpc -m 0750 /var/lib/brot-markets/bun/bun /usr/local/lib/brot-rpc/bun
   sudo cmp /var/lib/brot-markets/bun/bun /usr/local/lib/brot-rpc/bun && echo same
   ```

   Keep `User=brot-rpc`: running it as `brot` would undo the separate identity the unit's sandbox relies on (the
   security review, M5).
3. **The release.** `/srv/brot-markets/rpc/releases/<commit>`, `current` linking to it, `root:brot-rpc`, `0750`,
   installed with `bun install --frozen-lockfile --ignore-scripts --filter @brot/rpc`.
4. **The settings and the credentials.** `/etc/brot-markets/rpc.env` (`root:brot-rpc`, `0640`) from
   `services/rpc/.env.example`, with no secret in it. Two credential files, `root`, `0400`, read by the unit with
   `LoadCredential=`: `/etc/brot-markets/rpc-upstream-url` (the provider's URL with its key) and
   `/etc/brot-markets/rpc-tunnel-secret` (at least 32 random characters, `openssl rand -hex 32`). Neither value goes
   into the repository, a chat or a log.
5. **Cloudflare, before the route opens.** A rate-limiting rule on `/rpc` per IP, below the relay's own bucket and
   without challenges (K-10): the relay's daily budget is shared by every visitor, so this rule is what stops one
   source from spending it (the security review, M3). And a request-header rule that sets `x-brot-tunnel` to the
   secret of step 4 on every `/rpc` request (set, not add, so a visitor's own header is overwritten): with it the
   relay refuses any local caller posing as a visitor (M4).
6. **The unit.** Copy `brot-rpc.service` to `/etc/systemd/system/`, `systemd-analyze security brot-rpc.service`, start
   it once and check `curl -s http://127.0.0.1:4202/healthz` (on the server it needs no tunnel header) and the start
   line's `"tunnelSecret": true`; then enable it.
7. **The route.** The tunnel's main host routes `/rpc` to `127.0.0.1:4202` (TP §12). Then the site's
   `NEXT_PUBLIC_RPC_URL` points at it, and the privacy page's relay text goes live the same day, before the switch
   (`docs/legal/2026-10-11-sprint-08-legal-review.md`, section (c)).

**Rotating** the provider's key or the tunnel's secret: write the new value to its credential file as root (for the
secret, change the Cloudflare rule at the same moment), then `sudo systemctl restart brot-rpc`. **Upgrading Bun:** the
relay's copy does not follow the keeper's; install the new pinned binary at both paths, compare them with `cmp`, and
restart both units.
