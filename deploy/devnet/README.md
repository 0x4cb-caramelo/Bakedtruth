# Devnet deploy of brot-markets, from CI's artifact

Status: **prepared, not run** (Sprint 05, 2026-10-09). Nothing here has touched devnet. Every step was rehearsed on a
local, offline surfnet (`bun run scripts/deploy/rehearse.ts`), and the artifact download was tested on a real `main`
run (`37998756475`, which holds the Sprint 03 binary: see "Before deploy day").

Sources: Technical Plan §10 ("How code reaches each place"), §12 ("Where the program is built"), §3.4.3 and §3.4.9;
Sprint 05 file, "Deploy from CI's artifact"; Sprint 00's carried items (download by run id, SHA256SUMS, keypair backup).

## Decisions that gate deploy day (founder)

1. **The deploy path.** As planned: a person downloads CI's artifact by run id and deploys it from their own machine.
   The alternative (any binary built on a laptop or on the server) is what the security gates forbid.
2. **Who holds the upgrade key on deploy day**: Lucas or Ronaldo (Q12's remainder). That person runs every step below,
   in one session. The key never goes to GitHub or the server.
3. **The program keypair backup.** The keypair of `6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN` is not on the
   development machine (checked 2026-10-09: the two `target/deploy` keypairs there are throwaway ones). It must be backed
   up outside `target/deploy/`, and the deploy reads it only from that backup.
4. **Drill or real constants on the public devnet.** CI's artifact is the default build: the real constants (3-day
   minimum, 6-hour window). The smoke test needs no drill build: it resolves a burn campaign before its deadline and
   ends the window with a team confirmation. A drill build would need its own CI artifact.
5. **The devnet admin and fee recipient** (team machines, never the VPS; TP §3.4.9) and the **team keys** (Lucas,
   Ronaldo, Bernardo; founder answer 6, 2026-10-09): their public keys, collected before the day.

## Before deploy day

- Sprint 04 (PR #41) and Sprint 05 merged into `main`. CI publishes `programs-<sha>` **only for `main`**, so the
  deployable artifact exists only after both merges; today's `main` artifact is the Sprint 03 program.
- `gh` logged in with read access to `0x4cb-caramelo/Bakedtruth`; Solana CLI 3.1.10; Bun 1.4.2.
- The upgrade authority's keypair on the operator's machine; SOL on the fee payer for the program account: read the
  rent with `solana rent <binary size + 45> --url https://api.devnet.solana.com` (the deploy also writes a buffer of the
  same size first, refunded at the end), plus fees.
- This machine's Solana CLI defaults to **mainnet-beta**: every command below passes `--url` and every key explicitly.
- Rehearse: `bun run scripts/deploy/rehearse.ts` must end with "every step behaved as the deploy expects".

## The steps, in one session

1. **Pick the run**: the CI run of the merge commit on `main`.
   `gh run list --repo 0x4cb-caramelo/Bakedtruth --branch main --workflow CI --limit 5`
2. **Dry run**, which downloads and checks everything and sends nothing:
   ```bash
   bun run scripts/deploy/devnet-deploy.ts --run-id <id> \
     --program-keypair <backup>/brot_markets-keypair.json --upgrade-authority <path> \
     --fee-recipient <pubkey> --team <key1>,<key2>,<key3> \
     --url https://api.devnet.solana.com --cluster devnet
   ```
   It refuses: a run that is not a successful CI run on `main`; an artifact whose `SHA256SUMS` does not match, or that
   holds anything else; an IDL that declares another program id; a program keypair under `target/deploy/` or inside
   the repository, or whose address is not the declared id; a cluster whose genesis hash is not devnet's (mainnet is
   refused outright); a program or config that already exists. It prints the genesis hash and the three actions.
3. **Execute**: the same command with `--execute`, then type the program id when asked. In order:
   1. `solana program deploy` on the upgradeable loader (v3), never `program-v4`, never `--final`;
   2. the program account read back: loader v3, the upgrade authority recorded, the deployed bytes equal to the artifact;
   3. `admin_initialize_config`, signed by the upgrade authority, with `deploy/devnet/init-params.json`, read back;
   4. `admin_set_team`, signed by the admin, read back. If the admin is another person and is not present
      (`--admin <pubkey>` without `--admin-keypair`), the script stops and prints the admin's command
      (`scripts/team/set-team.ts`); until it runs, nobody can pause entries.
4. **Record** in the session log: the run id, the artifact's SHA-256, the signatures, who held the upgrade key, and
   the devnet checks of the sprint file.

## Why each rule

| Rule | Why |
|---|---|
| The artifact by run id, `SHA256SUMS` first | A name can be replaced; the hash detects a corrupted download (Sprint 00) |
| The keypair at the declared id | The event authority is derived from `crate::ID`: at another address every instruction fails at its event (rehearsed: `PrivilegeEscalation`) |
| Loader v3, never `--final` | `admin_initialize_config` reads the upgrade authority from the loader-v3 ProgramData; a loader-v4 or final program can never be initialized |
| Deploy and initialize in one session | Whoever initializes first becomes admin |
| `admin_set_team` at once | Initialization leaves the team empty, so nobody can pause until then |

## Rehearsal on this machine

`solana-test-validator` 3.1.10 does not start on the development machine ("Incompatible CPU detected: missing AVX2
support"). The rehearsal therefore runs Surfpool `--offline` (no datasource), inside a network namespace that has only
loopback (`unshare -rn`, `scripts/validator/isolate.ts`), so nothing can leave the machine. The program is placed at its
id by writing its loader accounts, with an upgrade authority held in memory; `solana program deploy` itself is
rehearsed at a throwaway address. A runner with AVX2 (GitHub's) can run `solana-test-validator` instead.
