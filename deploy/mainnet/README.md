# Mainnet deploy of brot-markets (runbook)

Status: **written and rehearsed, never run.** Nothing in this folder has been sent to mainnet. Every step was rehearsed
on 2026-10-13 on a Surfpool fork of mainnet-beta, with the `mainnet` feature binary, the real Squads v4 program and
throwaway keys (`scripts/mainnet/rehearse.ts`, "Rehearsal" below). The day waits for the gates in the first table,
each of them the founder's or a third party's.

Sources: Sprint 18 file (DoD, security gates); TP §3.4.9, §7 "Before mainnet", §11, §12; BP v0.0.4 P4 §3.4 and §4.1
(decision P3: two of three partners, each on a hardware device, "toda troca de código espera de 24 a 48 horas, em
público", the same wallet receives the fee); `deploy/devnet/README.md`, whose procedure this one extends; the program
(`instructions/admin/initialize_config.rs`, `checks/upgrade.rs`, `checks/top_level.rs`); and, read on 2026-10-13:
Squads' docs on [time locks](https://docs.squads.so/main/navigating-your-squad/settings/time-locks),
[programs](https://docs.squads.so/main/navigating-your-squad/developers-assets/programs), the
[TX Builder](https://docs.squads.so/main/navigating-your-squad/developers-assets/transaction-builder) and the
[CLI](https://docs.squads.so/main/development/cli/commands); Squads v4's IDL and source (github.com/Squads-Protocol/v4,
`main`); Solana's [verified builds guide](https://solana.com/docs/programs/verified-builds); Anza's
[cluster page](https://docs.anza.xyz/clusters/available); Agave v3.1.10 `program-runtime/src/cpi.rs`.

## What this runbook decides, and why

1. **Deploy, then hand over; the first deploy cannot be a multisig proposal.** A Squads vault acts only through CPI, and
   the loader accepts by CPI only `Upgrade`, `SetAuthority`, `SetAuthorityChecked`, `ExtendProgramChecked` and `Close`
   (Agave v3.1.10, `check_authorized_program`), never `DeployWithMaxDataLen`. So one partner's hardware wallet deploys
   from a buffer and, in the same session, hands the upgrade authority to the multisig vault. Squads' own docs describe
   the same path: deploy, then transfer the authority to the Squad.
2. **The multisig initializes, and is `admin` from the first write.** `admin_initialize_config` must be signed by the
   upgrade authority the program reads from ProgramData (`checks/upgrade.rs`); on mainnet no key file ever holds it, and
   after step 6 it is the vault. The program refuses CPI only for `resolve_campaign` (`checks/top_level.rs`), so the
   vault signs through Squads. One vault transaction holds `admin_initialize_config` (admin and fee recipient: the
   vault) and `admin_set_team`: the program is never initialized without a team that can pause, and no interim admin
   key exists, so no two-step handover is needed at launch. The two-step handover (`admin_transfer_admin`, then
   `admin_accept_admin` by the new key) stays the way to move `admin` later, each step a proposal (option B below).
3. **The time lock is the session's last act.** Squads' time lock "applies globally to all Squad transactions once set"
   (time-locks page), and `vault_transaction_execute` refuses with `TimeLockNotReleased` until `time_lock` seconds have
   passed since the approval (`instructions/vault_transaction_execute.rs`; at most 90 days). Created without a lock, the
   multisig takes the upgrade authority, initializes and publishes the verified build within the session; then a config
   transaction sets the lock, and every later act waits it in public. Rehearsed: refused at once, refused 60 s before
   the end, executed one second after it.

## Gates (nothing starts until each is evidenced)

| Gate | Done when | Evidence | Who |
|---|---|---|---|
| Audit 1 and audit 2 (criterion 1) | Both reports public, on the exact commit and the SHA-256 of `brot_markets.mainnet.so`; every serious finding fixed with a reproducing test and confirmed in writing by the firm that raised it | The two report links, each naming commit and hash; the confirmations; `solana-verify build` of that commit printing that hash | The firms; the founder |
| The multisig (criterion 2) | Squads v4, 2 of 3, one hardware device per partner, no config authority; a test signature made; the time lock decided (M-1, M-2) | The multisig and vault addresses; the account read back (threshold, members, time lock); the test proposal's signature; this runbook's citations for the lock | The three partners |
| The company | It exists and can sign (P4 §5.2) | Its registration | The founder |
| L0 | The lawyer's written review (D-s) | The signed review; the terms and notices set from it | The founder |
| P-7 | The treasury rule written: SOL in, monthly conversion outside, 25/75 split, who signs and when, the monthly report | The written rule | The founder |
| The code for mainnet | The audited commit declares the mainnet id under the `mainnet` feature, with an IDL and an SDK program id per cluster; the services accept mainnet (step 11); CI publishes `brot_markets.mainnet.so` from `solana-verify build` | The commit; CI's artifact and `SHA256SUMS` | The team ("Code the day needs") |
| D4 | The Hermes key bought, or price campaigns stay closed on mainnet | The decision | The founder |

## Founder decisions this runbook needs

- **M-1, one multisig or two.** Squads' lock is per multisig, so with one multisig (the DoD's reading) the resume after
  a pause, the removal of a leaked team key and every fee transfer also wait the lock; a leaked team key can void
  campaigns in review until then. Option B: two Squads multisigs with the same three devices, both 2 of 3; one holds the
  upgrade authority with the lock, the other holds `admin` and receives the fees with no lock. Rehearsed both ways.
  **Proposal: option B**, since `admin` cannot move a baker's money (TP §3.4.9) and the incident powers need minutes.
- **M-2, the lock.** **Proposal: 24 hours** (86,400 s), the decision's lower end: bakers cannot exit during the wait in
  either case, and a fix waits one day instead of two.
- **M-3, the creation parameters** in `init-params.mainnet.json`: four are proposals (`maxOpenCampaigns`, `maxPriceAge`,
  `maxPriceConfBps`, `campaignMaxAge`), each with its reason in the file.
- **M-4, who holds the deploy-day device** (the upgrade authority between steps 5 and 6) and **whether the first cycle
  includes a paid opening** (the sprint's [Q]; rehearsed: it works at the real price).

## Code the day needs

None of it is in this folder; each is a change to reviewed code, most of it before the audit freeze.

- **The mainnet id in the audited binary:** `declare_id!` and `EVENT_AUTHORITY` (with its bump) chosen by the `mainnet`
  feature, an IDL per cluster, and an SDK that takes the program id per cluster (today one id, from the one IDL).
- **The verifiable build in CI:** `solana-verify build` with `--features mainnet`, `[workspace.metadata.cli] solana =
  "3.1.10"` in the root `Cargo.toml` (or `--base-image`), the artifact named `brot_markets.mainnet.so` with its
  `SHA256SUMS`, attested (Sprint 16).
- **The services on mainnet:** a `mainnet` value for `KEEPER_CLUSTER`, `API_CLUSTER` and
  `scripts/validator/clusters.ts`, each checking the genesis hash first (step 11); the alert and Hermes variables of TP
  §11 read by the code.
- **Team acts on hardware:** `scripts/team/` signs with a key file (`TEAM_KEYPAIR`); on mainnet the team keys are on
  devices, so the pause, the confirmation and the void need a signing path through a wallet (the site's wallet adapter,
  or a Ledger transport library), or the founder accepts team key files on an offline machine.
- **Shortcuts:** `deploy:mainnet` and `mainnet:rehearse` in `package.json`; `CODEMAP.md` regenerated.

## Before deploy day

- **The program id.** A new keypair, made on the deployer's machine, never in a repository:
  `solana-keygen new --no-bip39-passphrase -o <backup>/brot_markets-mainnet-keypair.json`. It must be the id the audited
  commit declares, so it is made before the audit freeze (Sprint 16): changing it later changes the binary's hash. Keep
  it private until the deploy lands: anyone can fund a public address, and a funded ProgramData address makes the id
  undeployable for good (rehearsed on 2026-10-09; `deploy/devnet/README.md`). So the repository stays private until
  step 8, the reports name the commit and the hash but not the id (ask the firms), and nothing else names it.
- **The binary.** CI's `brot_markets.mainnet.so` of the audited commit, built with `solana-verify build` (its image is
  picked from `[workspace.metadata.cli] solana = "3.1.10"` in the root `Cargo.toml`, or `--base-image`, per its
  README), two runs giving the same hash, the hash in both reports.
- **The multisig.** In the Squads app or with `squads-multisig-cli multisig-create`: the three members' device keys
  (`usb://ledger?key=0` on each), threshold 2, every permission, no config authority, **no time lock yet**. Record the
  multisig and its vault (index 0). Send the vault 0.01 SOL: it pays the config's and the fee vault's rents
  (0.004566 SOL on the fork). Make one test proposal (for instance 0.001 SOL from the vault back to a member).
- **The team keys.** One per partner, on the partner's device at another derivation than the member key (`?key=1`).
- **The session payer.** A fresh key file outside every repository (`chmod 600`), funded with what the dry run prints:
  2.3275 SOL on the fork for this 165,520-byte binary (the buffer, refunded at the deploy; ProgramData; the program
  account; 0.02 SOL of fees). It writes the buffer, so the device signs once instead of 170 times. It never holds an
  authority, and its rest goes to the vault at the end.
- **Tools.** Solana CLI 3.1.x (the script refuses others), Bun 1.4.2, `squads-multisig-cli` 0.1.8
  (`cargo install squads-multisig-cli`), `solana-verify` and Docker for the verified build, the Ledger Solana app.
- **A keyed mainnet RPC** in `MAINNET_RPC_URL`, never in a file of the repository or a log (the scripts print only its
  origin). The public RPC is rate-limited: the buffer's 170 writes need a provider.
- **The dry run, the day before and the morning of** (step 2). It reads the id's standing, so a funded address is
  found before anything is spent.

## The steps, in one session

All partners present, each with their device. Every command names `--url` and every key.

1. **The artifact.** Download CI's run of the audited commit by run id, check `SHA256SUMS`, and compare its hash with
   both reports and with `solana-verify get-executable-hash <file>`.
2. **Dry run** (sends nothing):
   ```bash
   bun run scripts/deploy/mainnet-deploy.ts --cluster mainnet --url "$MAINNET_RPC_URL" \
     --so <artifact>/brot_markets.mainnet.so --multisig <multisig> --team <team1>,<team2>,<team3> \
     --upgrade-authority 'usb://ledger?key=0' --upgrade-authority-pubkey <the device key> \
     --session-payer <path>/session-payer.json
   ```
   It refuses: a genesis hash other than mainnet-beta's (`5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d`, Anza's cluster
   page and `getGenesisHash` of the public RPC, 2026-10-13); a Surfpool fork or a loopback RPC; an upgrade authority
   that is not a `usb://ledger` URI (a key file is refused unread); a session payer inside a Git work tree or readable
   by others; a multisig that is not 2 of 3 with every permission and no config authority; an id whose program,
   ProgramData or config stands in the way (the devnet README's table); a payer or vault short of the plan. It prints
   the binary's SHA-256, the commands, and step 7's two instructions with the Squads CLI command and a base58 form.
3. **Execute:** the same command with `--execute --program-keypair <backup>/brot_markets-mainnet-keypair.json`. It
   asks for the reviewed SHA-256 and the program id, typed, and stops on any difference before sending; then it
   checks that the device shows the reviewed key. Steps 4 to 6 follow; the device asks for two approvals.
4. **The buffer:** written by the session payer, its authority moved to the device key, its bytes then read back equal
   to the binary.
5. **The deploy** from the buffer, loader v3, never `--final`, never `program-v4`; read back: the device's authority,
   the bytes equal to the binary.
6. **The handover:** `set-upgrade-authority` to the vault (the device signs); read back.
7. **The multisig initializes.** One member proposes the printed message (`squads-multisig-cli vault-transaction-create
   --keypair usb://ledger?key=0 --multisig-pubkey <multisig> --vault-index 0 --transaction-message [...]`, which also
   creates the proposal, or the app's TX Builder); the two approvers read its two instructions in Squads against the
   dry run's print, approve on their devices (`proposal-vote --action Approve`), and one executes
   (`vault-transaction-execute`). Then the script with `--verify-init` instead of `--execute`: admin and fee recipient
   the vault, the file's parameters, the team, no pending admin, entries open, the upgrade authority the vault.
8. **The verified build, public.** Make the repository public at the deployed commit. Then
   `solana-verify export-pda-tx <repo> --program-id <id> --uploader <vault> --encoding base58 --compute-unit-price 0`,
   with the build's `--features mainnet` passed as `verify-from-repo` takes it [AC: try on devnet], imported in the TX
   Builder, approved and executed (the vault is the upgrade authority, so it uploads); then
   `solana-verify remote submit-job --program-id <id> --uploader <vault>`. Anyone can then run
   `solana-verify verify-from-repo -um --program-id <id> <repo> --commit-hash <commit> --library-name brot_markets
   -- --features mainnet` (flags per the verified builds guide, whose example passes features after `--`).
9. **The lock:** a config transaction `SetTimeLock` (`config-transaction-create --action "SetTimeLock 86400"`), two
   approvals, executed; read back the multisig's `time_lock`. Squads cancels config proposals still pending.
10. **Record** in the session log: the run id, the commit, the hash, the id, the multisig and vault, each signature,
    who held the device; then sweep the session payer to the vault and destroy its file.

## After the session

11. **The services.** Today the keeper refuses any `KEEPER_CLUSTER` but `devnet` and `local`
    (`services/keeper/src/config.ts`), the API any `API_CLUSTER` but those (`services/api/src/config.ts`), and the team
    scripts any cluster but those (`scripts/validator/clusters.ts`): each needs a `mainnet` that checks the genesis hash
    first, like `scripts/deploy/mainnet-cluster.ts`. Then, in `/etc/brot-markets` (never the repository):

    | Unit | Variables (names the code reads today) | Mainnet value |
    |---|---|---|
    | Site | `NEXT_PUBLIC_CLUSTER`, `NEXT_PUBLIC_PROGRAM_ID`, `NEXT_PUBLIC_RPC_URL` | `mainnet-beta` (what `app/features/open-campaign` reads), the id, `/rpc` |
    | Keeper (primary) | `KEEPER_RPC_URL`, `KEEPER_KEYPAIR`, `KEEPER_CLUSTER`, `KEEPER_SOL_FLOOR_LAMPORTS` | Provider A (credential); a new SOL-only wallet; `mainnet`; sized by measurement |
    | Standby | `KEEPER_MODE=standby`, `KEEPER_RPC_URL_B`, `KEEPER_PRIMARY_URL`, `KEEPER_RESTART_SECRET_FILE` | Provider B (credential), the primary's ops host |
    | API (indexer) | `API_RPC_URL`, `API_HISTORY_RPC_URL`, `API_CLUSTER` | Credentials; `mainnet` |
    | `brot-rpc` | `RELAY_UPSTREAM_URL_FILE`, `RELAY_DAILY_BUDGET` | Its own account (T14), the budget of its plan |

    TP §11 also names `ALERT_EMAIL_TO` (two inboxes), `ALERT_SMTP_URL`, `PRICE_SOURCE_URL` and `PRICE_SOURCE_KEY`; no
    code reads them yet. Build the site again (A-8): its log must name the mainnet deploy slot.
12. **The first cycle, at the minimum.** A team key opens a free campaign (a `SupplyAtMost` on a real mint is the
    rehearsed one); two partners' own wallets join YES and NO with 0.01 SOL; after the deadline (at least three days)
    the keeper resolves; the six-hour window passes (or the team confirms); the keeper settles. Check each wallet's
    payout against the SDK (`entryOwed`), the fee swept to the fee recipient, the campaign closed. If M-4 says so, a
    paid opening too: US$500 at the Pyth price, its charge checked against `openingQuote`.
13. **The pause and resume.** One team key pauses (at once); a join is refused (`JoinWhilePaused`); the multisig holding
    `admin` proposes `admin_resume_entries`; it executes after its lock (option A: a day without entries or openings,
    so do it before the launch is announced) or at once (option B). A join then lands.

**Option B, if chosen** (M-1): a second multisig, the same three devices, 2 of 3, no lock. Between steps 7 and 9 the
first multisig proposes `admin_transfer_admin` to the second vault and the second proposes `admin_accept_admin` (neither
waits, since no lock is set yet), then `admin_set_fee_recipient` to its own vault; `--verify-init --admin <second
vault> --fee-recipient <second vault>` checks the result. Rehearsed after the lock (the first step waited it), then a
resume at once.

## Abort points

| Where it stopped | What is left | What to do |
|---|---|---|
| The dry run or the typed binding refused | Nothing sent | Fix the cause. A funded ProgramData means a new id, a new build and a new reading by the firms |
| `write-buffer` died | A buffer under the session payer | `solana program close <buffer> --authority <session payer> --url "$MAINNET_RPC_URL"`; run again |
| The buffer was handed over, the deploy failed | A buffer under the device | `solana program close <buffer> --authority 'usb://ledger?key=0' --url ...`; run again |
| The deploy landed, the handover did not | The program under the device | The same command with `--resume --execute`: it deploys nothing, hands over, reads back |
| The handover landed, step 7 did not | The program under the vault, no config | Nobody else can initialize (only the upgrade authority): propose step 7 again |
| Step 7 executed with a wrong value | A config that differs | Open nothing; correct it by proposals (`admin_set_creation_params`, `admin_set_team`, `admin_set_fee_recipient`) before step 9 |
| Bytes or authority not as planned | A program that is not the reviewed one | Stop. Nobody opens a campaign; an upgrade to the reviewed buffer is a separate, reviewed act |

## Upgrading

Through the multisig only: the binary written into a buffer by any key, the buffer handed to the vault (`solana program
set-buffer-authority <buffer> --new-buffer-authority <vault>`), its bytes checked against the binary under the vault's
authority (`checkBuffer` in `scripts/deploy/mainnet-loader.ts`), then the loader's `Upgrade` proposed (Squads app, "Add
upgrade"), approved, executed after the lock, read back, and the site built again (A-8). Rehearsed: refused during the
lock, executed after it, the buffer drained into the vault, the bytes equal to the binary. A larger binary needs the
program extended first: `ExtendProgramChecked` is signed by the upgrade authority, so it is a proposal too (whether
mainnet's loader still takes the unchecked `ExtendProgram` from any payer is to check); the devnet README's
"Upgrading" has the 10,240-byte minimum.

## Rehearsal

```bash
cargo build-sbf --manifest-path programs/brot-markets/Cargo.toml --features mainnet --sbf-out-dir <dir> -- --locked
MAINNET_REHEARSAL_KEYS=<private folder outside any repository> \
  bun run scripts/mainnet/rehearse.ts --so <dir>/brot_markets.so
```

It starts Surfpool forking mainnet on 127.0.0.1:4235 (`MAINNET_REHEARSAL_PORT`), so it reads mainnet (Squads, the
SOL/USD account, the mint) and sends only to the fork; it ends with "every step behaved as the runbook expects".

**Rehearsed** (on 2026-10-13, Surfpool 1.5.0: two passing runs of these scripts and one of the version just before them,
43 checks each): the deploy script's refusals and dry run; the deploy from a buffer by the Solana CLI and the handover,
at a throwaway id; the same at the declared id by the loader's own `DeployWithMaxDataLen` (its program account written
as `CreateAccount` leaves it, the only account of the deploy written by hand, since its keypair is not here); step 7
through Squads (about 49,100 CU); the lock set and proven on three proposals; a paid opening at the real SOL/USD account
(US$500 = 4.606 to 4.618 SOL; the price 1 to 5 s old, 2 to 3 bps wide); a team opening on WIF with 0.01 SOL entries; the
pause and the resume after the lock; an upgrade after the lock; NO after the deadline, the six-hour window enforced, the
payouts equal to the SDK's, the fee swept to the vault; option B.

**Not rehearsed:** hardware devices (stand-in key files sign; the device's screen, blind signing for Squads'
instructions and `solana-keygen pubkey usb://ledger` are untested); the real waits (the fork's clock jumps); the Squads
app and `squads-multisig-cli` (the rehearsal sends the same instructions by hand; the CLI's parsing of
`--transaction-message` and the app's base58 import are to try on devnet first); `solana-verify` (it needs Docker, which
this machine lacks) and the remote verification; CI's artifact (the local build's hash differs); the services on
mainnet; the public RPC's limits; the `--resume` path on mainnet; mainnet's real Pyth cadence over days. Surfpool
recorded a ProgramData deploy slot that did not move with the upgrade, so the rehearsal proves the upgrade by the
drained buffer instead.

## Why each rule

| Rule | Why |
|---|---|
| The cluster by genesis hash, a fork told apart by `surfnet-version` and its loopback URL | A fork of mainnet answers mainnet's genesis hash (seen on Surfpool 1.5.0) |
| The upgrade authority a `usb://` URI on mainnet, its key reviewed and shown by the device | The sprint's gate: the upgrade key was never in a file nor on an internet-connected machine |
| A buffer written by a session payer, handed to the device, checked under it | A device cannot approve 170 writes; the bytes are frozen under the device before it deploys them |
| The typed SHA-256 and id | A command line can be replayed or edited; a person types what was reviewed |
| Deploy and handover in one session; initialization by the vault | Only the upgrade authority can initialize, so nothing is open to a race; the vault never shares the role with a key |
| Initialization and team in one vault transaction | Until `admin_set_team` nobody can pause (TP §3.4.9) |
| The lock last | Everything the session needs runs without a wait, and nothing after it does |
| The id private until the deploy | A funded ProgramData address kills the id, and the audited binary carries it |
