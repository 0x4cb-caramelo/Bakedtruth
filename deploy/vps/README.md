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

**Since 2026-10-14: release `8af10e2`, the contest and the sealed fee, and RPC B.** At Ronaldo's request ("adicione o
novo keeper e segunda RPC"), `brot-keeper` runs release `8af10e2` (`main` after PRs #92 and #91) since 2026-10-14 at
00:46 UTC. It settles every sealed fee before a close, and in a contest's stage 1 it re-reads through RPC B. A
`git archive` of that commit was uploaded with its SHA-256 checked, unpacked into
`/srv/brot-markets/keeper/releases/8af10e2` and installed with `bun install --frozen-lockfile --filter @brot/keeper` as
`brot`. A dry run first: a transient `systemd-run` unit as `brot` on port 4239, with a temporary copy of `keeper.env`
plus the overrides in `/run` (deleted after), ran four cycles with no error and the second read on. Then
`KEEPER_RPC_URL_B=https://api.devnet.solana.com` was appended to `keeper.env`. RPC B is Solana's public devnet RPC, a
provider other than the primary's Helius, with no key. `current` was switched and the unit restarted. After the
restart: settlement on, `secondRead` true with origin `https://api.devnet.solana.com`, cycles every 15 s, no failure
and no 429. The env as it was before is backed up in `/etc/brot-markets/bak-20261014/keeper.env.before-8af10e2`.
Rollback: point `current` back to `releases/88a00f9`, restore that backup, then `sudo systemctl restart brot-keeper`.

**Since 2026-10-14 ~05:45 UTC: release `2e7a28c`** (`main` after PR #94). The keeper tallies a YES price result as soon
as its cut-off is final, and every reader of transactions takes any version the cluster serves. The release was
dry-run first on port 4239 (four cycles, no failure, the second read on), then `current` was switched. The env did not
change. Rollback: point `current` back to `releases/8af10e2` and restart.

**Since 2026-10-14 ~06:45 UTC: release `6bd0f68`** (`main` after PR #95), at Ronaldo's word ("atualize o keeper"). It
raises `settle_invariant` when a settlement is refused by a safety check (6101, 6179, 6180). It was dry-run on port
4239 first (four cycles, no failure), and the env did not change. Rollback: point `current` back to
`releases/2e7a28c` and restart. The indexer keeps the drop-in `credential-path.conf` of its first start: the unit file
in this directory no longer needs it, and installing that file and removing the drop-in is a cleanup for a later
release.

## Where each key lives, and how to rotate it (Sprint 16)

No value is written here. On devnet every key is a test key; the mainnet keys are in `deploy/mainnet/README.md` (two
Squads multisigs of the same three hardware wallets, decisions M-1 to M-4 of 2026-10-13).

| Key or secret | Where | Power | How to rotate |
|---|---|---|---|
| Keeper keypair (`BXnk…HALU` on devnet) | `/etc/brot-markets/keeper-devnet.json`, `root:brot` 0640 | Pays transaction fees. Every instruction it sends is open to any wallet; it moves no one's money but the program's rules | New keypair written as root, funded, the old balance swept to it, `restart brot-keeper` |
| The primary's RPC URL (Helius key) | `KEEPER_RPC_URL` in `/etc/brot-markets/keeper.env`, `root:brot` 0640 | Reads and sends; a leak spends the Helius plan's credits | New key in Helius, the line rewritten as root, `restart brot-keeper` |
| RPC B | `KEEPER_RPC_URL_B` in the same file | None: Solana's public devnet RPC, no key | — |
| Restart secret (primary and standby) | `/etc/brot-markets/restart-secret`, `root:brot` 0440 | Asks the primary to restart (loopback only) | New random value as root, restart both keepers |
| Tunnel token | `TUNNEL_TOKEN` in `/etc/brot-markets/tunnel.env`, `root` 0600 | Routes `brot.markets` to this server | New token in Cloudflare (the tunnel's page), the line rewritten as root, `restart brot-tunnel` |
| Read API's RPC | `API_RPC_URL` in `/etc/brot-markets/api.env`, `root` 0600 | None: the public devnet RPC, no key | — |
| Devnet upgrade authority, `admin` and fee recipient (`6N7r…4wcq`) | Ronaldo's machine (`~/.config/solana`), never on the server | Upgrades the program; `admin` resumes entries, changes the creation rules, decides a contest's stage 2; the fees go to it | Upgrade authority: `solana program set-upgrade-authority`. `admin`: `admin_transfer_admin` then `admin_accept_admin`. Fee recipient: `admin_set_fee_recipient` |
| Team key (Ronaldo's) | Ronaldo's machine, never on the server | Pauses entries, opens free campaigns, confirms a result in its window or records the cause of an automatic void, contests a result and sends a contest to stage 2 | `admin_set_team` without it (`scripts/team/set-team.ts`) |
| Program keypair (the id `5Rx8…n8o`) | Its backup on Ronaldo's machine, outside `target/deploy` | None after the deploy; needed only to deploy the same id again | — |

**No internet-connected key has power over money.** User money moves only by the program's rules. No key can withdraw
a vault: there is no emergency withdrawal, and a pause never stops payouts. On the server, the keeper keypair only pays
fees, and the other secrets reach a provider's plan or a route, never a vault. What remains open for mainnet: the key
vault for the keeper's wallet **[AC]**, and where the referral operations wallet lives (it holds the company's weekly
referral budget, and a person signs it).

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

   **The landing since 2026-10-19 ~03:25 UTC.** `<landing-root>` is `/srv/brot-markets/work/current`, a Git checkout
   owned by `brot` at `395efa5`. At Ronaldo's request only the three files of PR #103 (`services/landing/public/index.html`,
   `public/2/index.html` and `public/live.css`: the X and Discord logos at the top, Discord in the footer) were installed
   from `bf2a5ce` (`brot:brot`, 0664), and `brot-landing` restarted. Between `395efa5` and `bf2a5ce` nothing else in
   the landing changed, so it now serves `bf2a5ce`'s landing, and `git status` there shows those three files modified.
   The files as they were are in `/srv/brot-markets/work/bak-20261019-landing/`. Rollback: `sudo -u brot git -C
   /srv/brot-markets/work/current checkout -- services/landing/public` (or copy the backup back), then
   `sudo systemctl restart brot-landing`.

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
`sudo systemctl restart brot-api brot-site`. **Since 2026-10-19 ~03:30 UTC:** release `bf2a5ce3282a` (`main` after PR
#103: the X and Discord logos under the home page's subtitle, and Discord beside X in the footer), at Ronaldo's request,
built for the program deploy at slot 511223702 and tested on 4239 first (the eight pages answered as the live
release's, the same CSP, no error in the test unit's journal). It differs from the release before it only by PR #103,
so only `brot-site` restarted; `brot-api` still runs the files of `1f8427f98d5c`, whose API code is the same. The way
back is `1f8427f98d5c`. **From 2026-10-16 ~03:51 UTC:** release `1f8427f98d5c` (`main` after PR #102, which brought
the wallet fixes `a7c9b15` and `79318d1` and the site polish of PR #100 into `main`); found live on 2026-10-19 with no
record, so how it was tested is not known; the way back is `79318d17428d`. **From 2026-10-16 ~03:05 UTC:** release `79318d17428d` (branch
`fix/wallet-web-shell`: the CSP admits `ws://localhost:*`, the Mobile Wallet Adapter's socket), built for the program
deploy at slot 511223702, tested on 4239 first (the eight pages as the live release's, the new CSP served, no error).
Only `brot-site` restarted, since the API's code had not changed; the API still runs from `5df35297d05c`'s files. The way
back is `a7c9b1561f71`. **From 2026-10-15 ~21:40 UTC:** release `a7c9b1561f71` (the same branch: the Android app lists
only the Mobile Wallet Adapter, and Solflare opens on the site's network), tested the same way; the way back is
`5df35297d05c` (`main` after PR #99), live from 2026-10-15 with the program upgrade of that day; its way back is
`6bd0f68171d2`. **From 2026-10-14 ~06:35 UTC:** release `6bd0f68171d2` (`main` after PR #95), built
for the program deploy at slot 510894454 and tested on 4239 first (the eight pages as the live release's, no error); the
way back is `2e7a28c207bd`. **From ~05:40 UTC:** release `2e7a28c207bd` (`main` after PR
#94), built for the program deploy at slot 510880658, tested on 4239 first (its eight pages answered as the live
release's, no error in its log); the way back is `a5e6014e42f3`. **Before it, from ~04:21 UTC:** release `a5e6014e42f3` (`main` after PR
#93), built for the program deploy at slot 510863588 and tested on port 4239 first, through a transient unit as
`brot-site`; its eight pages answered as the live release's. The previous release was `353c2a3a1b90`, which is also
the way back. **A new release:** step 4 with the new commit, then
`sudo systemctl restart brot-api brot-site`. Build again after every program upgrade (A-8).

## The indexer's routes through the read API (Sprint 08; live since 2026-10-14)

The founder's routing answer (a), 2026-10-13: the indexer's read routes (`/api/v1/activity`, `/api/v1/ranking`,
`/api/v1/wallets/<address>/entries`, `/api/v1/campaigns/<address>/activity` and `/chance`) reach the public through
`brot-api`, which forwards them to the indexer on loopback. The tunnel's `^/api/v1/` rule already sends them to 4220:
**no Cloudflare or tunnel change.** `brot-api` reads the indexer's address from `API_INDEXER_URL` in
`/etc/brot-markets/api.env`: `http://127.0.0.1:4201` when unset, loopback http only (anything else stops its start),
`off` to stop forwarding. Until the indexer runs, the five routes answer 503 `indexer_unavailable`, and every other
route of the API is unchanged.

**Live since 2026-10-14 ~05:22 UTC**, at Ronaldo's word ("pode instalar o indexador"):
- **The user and the release.** `brot-indexer` is a system user with no login, with its own copy of the pinned Bun
  (`/usr/local/lib/brot-indexer/bun`, compared with `cmp`). The release is
  `/srv/brot-markets/indexer/releases/2e7a28c207bd` (`current`), installed with `--filter @brot/indexer`.
- **The settings.** `/etc/brot-markets/indexer.env` (`root:brot-indexer`, 0640) holds only the polls, the timeout and
  the CORS origin. The credential `/etc/brot-markets/indexer-rpc-url` (root, 0400) is Solana's public devnet RPC
  (D4: no paid account yet).
- **The unit's first start failed.** The server's systemd 249 cannot resolve `%d` in `Environment=` ("Invalid slot")
  and drops the line. A drop-in, `/etc/systemd/system/brot-indexer.service.d/credential-path.conf`, sets
  `INDEXER_RPC_URL_FILE=/run/credentials/brot-indexer.service/rpc-url`; the unit files in this directory now use that
  absolute path.
- **Now.** The unit is enabled, health `ok`, and it reads the program's history from the start. The public RPC
  answers 429 at times, so its refresh waits and goes on without skipping. The five routes answer through `brot-api`
  inside and outside (`/api/v1/activity` and `/ranking` 200).
- **Rolling back the indexer.** `sudo systemctl disable --now brot-indexer`: the routes answer 503 again, and nothing
  else changes.
- **Down since the server's reboot of 2026-10-17 ~18:15 UTC** (found on 2026-10-19, not fixed). The unit restarts
  every 5 s with `Cannot find module '@solana/kit'`, and the five routes answer 503. The cause: `bun install` run as
  root hard-links each package file from root's cache, so the indexer's release and every site release share the
  same files (one inode, 15 links for `@solana/kit`'s `package.json`), and step 4's `chown -R root:brot-web` of a
  site release gives those shared files to `brot-web`, which `brot-indexer` is not in. The process that was already
  running had its modules in memory; the reboot exposed it. The fix, for Ronaldo to approve: reinstall the indexer's
  `node_modules` with its own copies (`bun install --backend=copyfile`), `chown -R root:brot-indexer` the release, and
  restart the unit; and install the site's releases with copies too, so the next `chown` touches only them.

Publishing them was a server act for Ronaldo, in this order:

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
