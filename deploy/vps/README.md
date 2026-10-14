# deploy/vps: the keeper on the shared server

What runs on the server for Brot Markets, and where each secret lives. No value is written here.

| What | Where on the server | Owner, mode | Notes |
|---|---|---|---|
| Keeper code (one release per commit) | `/srv/brot-markets/keeper/releases/<commit>`, `current` links to it | `brot`, 0750 | Installed with `bun install --frozen-lockfile --ignore-scripts --filter @brot/keeper` |
| Bun 1.4.2 binary | `/var/lib/brot-markets/bun/bun` | `brot`, 0700 | Its SHA-256 is in `bun-1.4.2.sha256` (the zip's hash) and in the sprint record |
| Keeper settings (incl. the RPC URL) | `/etc/brot-markets/keeper.env` | `root:brot`, 0640 | Copy of `services/keeper/.env.example`, filled on the server |
| Keeper keypair (devnet, throwaway) | `/etc/brot-markets/keeper-devnet.json` | `root:brot`, 0640 | A 64-byte array; never in the repository or a log |
| Unit | `/etc/systemd/system/brot-keeper.service` (a copy of `brot-keeper.service` here) | `root`, 0644 | `Restart=on-failure`, sandboxed, port 4210 on loopback |

**The keeper's own identity (not installed).** `brot-keeper.service` in this directory now runs the keeper as the user
`brot-keeper`, with its own copy of the pinned Bun (`/usr/local/lib/brot-keeper/bun`) and its three secrets as systemd
credentials (`LoadCredential=`, root-only `0400` files): `/etc/brot-markets/keeper-devnet.json` (the keypair),
`/etc/brot-markets/keeper-rpc-url` (the RPC URL with its key, out of `keeper.env`) and
`/etc/brot-markets/restart-secret`. `keeper.env` (root, `0600`) keeps only settings, and none of the variables the unit
sets (a value there overrides the unit's `Environment=`). The restart flag moves to the unit's runtime directory,
`/run/brot-keeper/restart.flag`. The steps, in order, are in the unit's header; installing it needs the server owner's
agreement to one identity per unit. Rotating the RPC key: write the new URL to `keeper-rpc-url` as root, then
`sudo systemctl restart brot-keeper`.

**Settlement (`KEEPER_SETTLE`).** Off by default: the keeper resolves and reports the pending settlement work on
`/healthz` (`last.settle.pending`), and sends nothing for it. Whether the devnet keeper pays is the founder's decision;
once taken, `KEEPER_SETTLE=on` in `keeper.env` and a restart make it tally, finalize, pay, collect, close and sweep.
`curl -s http://127.0.0.1:4210/healthz` then shows `"settle":"on"`.

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

## The keeper since 2026-10-13: release `88a00f9`, settlement on, the Helius RPC

**Settlement on.** At Ronaldo's request, `brot-keeper` runs release `88a00f9` (`main` at PR #88) since 2026-10-13 at
19:03 UTC, with `KEEPER_SETTLE=on`, under the existing unit (`User=brot`,
`EnvironmentFile=/etc/brot-markets/keeper.env`). The release was installed in
`/srv/brot-markets/keeper/releases/88a00f9` and tested with a dry run on port 4239 before `current` was switched; the
setting was appended to `keeper.env`. The env as it was before is backed up in
`/etc/brot-markets/bak-20261013/keeper.env`.
Rollback: point `current` back to `releases/cc87637`, restore the env backup, then
`sudo systemctl restart brot-keeper`. The unit with the keeper's own identity is not installed (the server owner).

**The RPC is Helius devnet.** Later the same day, at Ronaldo's request, `KEEPER_RPC_URL` in
`/etc/brot-markets/keeper.env` (`root:brot`, 0640) was pointed at Helius's devnet endpoint with the API key, the
founder's D4 choice of 2026-10-10. It replaced the public devnet RPC, which answered 429s. The key is never written in
the repository, a log or a chat; the keeper logs only the origin, `https://devnet.helius-rpc.com`. The env as it was
before the switch is backed up in `/etc/brot-markets/bak-20261013/keeper.env.before-helius`. To rotate the key, write
the new URL to that line as root and restart `brot-keeper`. After the switch: the unit active, 0 errors and 0 429s in
the first cycles, settlement on with nothing pending.

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
| Restart flag watcher (root; watches `/run/brot-keeper/restart.flag` since the keeper's own identity) | `brot-keeper-restart.path` | `/etc/systemd/system/` | Not installed, by decision (2026-10-10) |
| Restart action (root, oneshot) | `brot-keeper-restart.service` | `/etc/systemd/system/` | Not installed, by decision (2026-10-10) |
| Standby unit for VM 2 | `brot-keeper-standby.service` | VM 2's `/etc/systemd/system/` | Not installed; deferred to Post-Hackathon (D4) |
| Alert runbooks, one per alert kind | `runbooks/` | repository only | Written; the e-mail channel is not chosen |

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

## The site under /dev0x, `brot-site` and `brot-api` (not installed)

The campaign site (`app/`) at `https://brot.markets/dev0x`, and the read API it needs at `https://brot.markets/api/v1`
(the site takes no entry while `/api/v1/health` is not `ok`, K-11). The domain's root stays the landing
(`brot-landing`, port 4200): the tunnel sends the two paths to their units first and everything else to the landing,
as today. The team's prototype preview, which lived at `/dev0x/`, is served by the landing at `/prototype/` from this
release on. Decided by Ronaldo on 2026-10-11: the tunnel and systemd (no Nginx, no PM2), the API on the same host.

| What | Where on the server | Owner, mode | Notes |
|---|---|---|---|
| Release (site and API, one per commit) | `/srv/brot-markets/site/releases/<commit>`, `current` links to it | `root:brot-web`, 0750 | `git archive` of the commit, `bun install --frozen-lockfile --ignore-scripts`, the site built with `site-build.conf` |
| Bun 1.4.2 | `/usr/local/lib/brot-web/bun` | `root:brot-web`, 0750 | A copy of the keeper's pinned binary, compared with `cmp` |
| Next's cache | `<release>/app/.next/cache` | `brot-site`, 0750 | The only place the site writes |
| API settings | `/etc/brot-markets/api.env` | `root`, 0600 | From `services/api/.env.example`; no secret with the public RPC |
| Units | `/etc/systemd/system/brot-api.service`, `brot-site.service` | `root`, 0644 | Copies of the files here; ports 4220 and 4230 on loopback |

1. **Look first.** The two ports are free, and the landing's folder is noted for step 7.

   ```bash
   ss -ltn | grep -E '127\.0\.0\.1:(4220|4230)\b' || echo "4220 and 4230 are free"
   systemctl cat brot-landing | grep -E 'WorkingDirectory|ExecStart'
   ```

2. **The users.** Two users with no login, one per unit, so the site's process cannot read the API's settings, and a
   group for the release and the Bun copy.

   ```bash
   sudo groupadd --system brot-web
   sudo useradd --system --user-group --groups brot-web --home-dir /nonexistent --no-create-home --shell /usr/sbin/nologin brot-site
   sudo useradd --system --user-group --groups brot-web --home-dir /nonexistent --no-create-home --shell /usr/sbin/nologin brot-api
   ```

3. **Their Bun**, a root-owned copy of the pinned binary (the keeper's stays in `brot`'s home, 0750).

   ```bash
   sudo install -d -o root -g brot-web -m 0750 /usr/local/lib/brot-web
   sudo install -o root -g brot-web -m 0750 /var/lib/brot-markets/bun/bun /usr/local/lib/brot-web/bun
   sudo cmp /var/lib/brot-markets/bun/bun /usr/local/lib/brot-web/bun && echo same
   ```

4. **The release.** On your machine, from a checkout of the repository:

   ```bash
   git fetch origin && COMMIT=$(git rev-parse --short=12 origin/main)
   git archive --format=tar.gz -o "/tmp/brot-$COMMIT.tar.gz" origin/main
   scp "/tmp/brot-$COMMIT.tar.gz" <server>:/tmp/ && echo "$COMMIT"
   ```

   On the server, with the same twelve characters. The build prints `A-8: this build is for the program deploy at
   slot …`; a build that cannot read it does not sign, so build again then.

   ```bash
   COMMIT=<the twelve characters>
   R=/srv/brot-markets/site/releases/$COMMIT
   sudo install -d -o root -g brot-web -m 0750 /srv/brot-markets/site /srv/brot-markets/site/releases "$R"
   sudo tar -xzf "/tmp/brot-$COMMIT.tar.gz" -C "$R"
   cd "$R" && sudo /usr/local/lib/brot-web/bun install --frozen-lockfile --ignore-scripts
   cd "$R/app" && sudo bash -c 'set -a && . ../deploy/vps/site-build.conf && set +a && /usr/local/lib/brot-web/bun --bun node_modules/.bin/next build'
   sudo chown -R root:brot-web "$R" && sudo chmod -R g+rX,o-rwx "$R"
   sudo install -d -o brot-site -g brot-site -m 0750 "$R/app/.next/cache" && sudo chown -R brot-site:brot-site "$R/app/.next/cache"
   sudo ln -sfn "$R" /srv/brot-markets/site/current
   ```

5. **The API's settings.** The public devnet RPC needs no key. It answers 429 under load: if the demo needs more, a
   provider's URL goes in `API_RPC_URL` here (the file stays root-only) and never into the repository.

   ```bash
   sudo install -o root -g root -m 0600 /dev/null /etc/brot-markets/api.env
   printf '%s\n' API_RPC_URL=https://api.devnet.solana.com API_CLUSTER=devnet API_HOST=127.0.0.1 API_PORT=4220 \
     API_REFRESH_MS=15000 API_CORS_ORIGIN=https://brot.markets API_HISTORY_PER_REFRESH=200 \
     API_PRICE_REFRESH_MS=180000 | sudo tee /etc/brot-markets/api.env >/dev/null
   ```

6. **The units.** The API first: the site waits for it.

   ```bash
   sudo install -o root -g root -m 0644 "$R/deploy/vps/brot-api.service" "$R/deploy/vps/brot-site.service" /etc/systemd/system/
   sudo systemctl daemon-reload
   systemd-analyze security brot-api.service brot-site.service | grep -i overall
   sudo systemctl start brot-api && sleep 20 && curl -s http://127.0.0.1:4220/api/v1/health; echo
   sudo systemctl start brot-site && sleep 5 && curl -sI http://127.0.0.1:4230/dev0x | grep -iE '^HTTP|x-robots-tag'
   sudo systemctl enable brot-api brot-site
   ```

   Expected: the health says `"status":"ok"` once the first snapshot is read, and the site answers `200` with
   `x-robots-tag: noindex, nofollow, noarchive` (the demo stays out of search engines, as the preview at `/dev0x/` was).

7. **The landing**, so the preview moves to `/prototype/`. In the landing's folder (`<landing-root>`, from step 1),
   the move is one file: since the preview went live (`b05b4db`), `lib/campaigns.mjs` changed only its `PREFIX`.
   Copying the whole landing instead would also put live every other landing change on `main` (the deck, the privacy
   page, the age line), which is a separate decision. Its waitlist lives in `/var/lib/brot-markets/leads`, outside.

   ```bash
   sudo install -m 0644 "$R/services/landing/lib/campaigns.mjs" <landing-root>/services/landing/lib/campaigns.mjs
   sudo systemctl restart brot-landing && curl -sI http://127.0.0.1:4200/prototype/ | head -1
   ```

   The whole landing at this commit, when that is wanted: `sudo rsync -a --delete "$R/services/landing/"
   <landing-root>/services/landing/` and the same for `prototype-lab/campaigns/`, then the restart above.

8. **The tunnel's two routes**, in the Cloudflare dashboard (Zero Trust → Networks → Tunnels → `brot-markets` →
   Public hostnames). The tunnel takes the first rule that matches, so both go above the landing's:

   | Order | Subdomain | Domain | Path | Service |
   |---|---|---|---|---|
   | 1 | (empty) | `brot.markets` | `^/dev0x(/.*)?$` | HTTP, `127.0.0.1:4230` |
   | 2 | (empty) | `brot.markets` | `^/api/v1/` | HTTP, `127.0.0.1:4220` |
   | 3 (exists) | (empty) | `brot.markets` | (empty) | HTTP, `127.0.0.1:4200` |

9. **From outside.** The root is the landing as before; `/dev0x` is the site; the API and the preview answer.

   ```bash
   curl -sI https://brot.markets/ | grep -iE '^HTTP|content-security-policy' | head -2
   curl -sI https://brot.markets/dev0x | grep -iE '^HTTP|x-robots-tag'
   curl -s https://brot.markets/api/v1/health; echo
   curl -sI https://brot.markets/prototype/ | head -1
   ```

   Then in a browser: `https://brot.markets/dev0x`, a wallet connected, a campaign's page shows "Review entry" (not
   "Entries are not taken on this site right now").

**Rolling back:** delete the two routes in the dashboard (the landing then answers both paths with 404) and
`sudo systemctl disable --now brot-site brot-api`; or point `current` at the previous release and
`sudo systemctl restart brot-api brot-site`. **A new release:** step 4 with the new commit, then
`sudo systemctl restart brot-api brot-site`. Build again after every program upgrade (A-8).

## The indexer's routes through the read API (Sprint 08; not live)

The founder's routing answer (a), 2026-10-13: the indexer's read routes (`/api/v1/activity`, `/api/v1/ranking`,
`/api/v1/wallets/<address>/entries`, `/api/v1/campaigns/<address>/activity` and `/chance`) reach the public through
`brot-api`, which forwards them to the indexer on loopback. The tunnel's `^/api/v1/` rule already sends them to 4220:
**no Cloudflare or tunnel change.** `brot-api` reads the indexer's address from `API_INDEXER_URL` in
`/etc/brot-markets/api.env`: `http://127.0.0.1:4201` when unset, loopback http only (anything else stops its start),
`off` to stop forwarding. Until the indexer runs, the five routes answer 503 `indexer_unavailable`, and every other
route of the API is unchanged.

Publishing them is a server act for Ronaldo, in this order:

1. **The indexer**, installed and running on `127.0.0.1:4201` (`brot-indexer.service`; its header lists the steps,
   with its own RPC account, D4), and caught up: `curl -s http://127.0.0.1:4201/healthz`.
2. **The read API** at a commit with this forwarding: a new release (step 4 above), then `sudo systemctl restart
   brot-api`. Leave `API_INDEXER_URL` unset, or set it to the indexer's port if it is not 4201.
3. **Check** on the server, then from outside:

   ```bash
   curl -s 'http://127.0.0.1:4220/api/v1/activity?limit=1'; echo
   curl -s 'https://brot.markets/api/v1/ranking?limit=1'; echo
   ```

**Rolling back:** `API_INDEXER_URL=off` in `api.env` and `sudo systemctl restart brot-api`; the five routes answer 503
and the rest of the API does not move.
