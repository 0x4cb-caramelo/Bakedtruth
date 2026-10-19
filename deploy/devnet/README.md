# Devnet deploy of brot-markets, from CI's artifact

Status: **run on 2026-10-09** (Sprint 05). Program `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o` was deployed from CI
run 38014319993 (`main` at `c20e79a`, `brot_markets.so` sha256
`cf2359377323449bac0f67f6464f5e21dcb7ac85a9ffe07bfa52ec185b46a3a8`), initialized and its team set, in one session; the
signatures are in `session-log/2026-10-09-sprint-05-respostas-do-deploy-e-leituras-devnet.md`. Every step was first
rehearsed on a local, offline surfnet (`bun run deploy:rehearse`). **Upgraded on 2026-10-12** (01:08 UTC on the 13th)
to CI's build of `main` at `91a5bed`, the sixth kind: deploy slot 510454676 ("Upgrading" below;
`session-log/2026-10-12-upgrade-devnet-sexto-tipo.md`).

**The public RPC.** `https://api.devnet.solana.com` dropped buffer writes twice that night ("Data writes to account
failed: Max retries exceeded", then HTTP 429): each time a buffer was left holding its rent, and the upgrade authority
closed it (table below). The deploy now re-signs unconfirmed writes for 50 rounds with a small priority fee
(`scripts/deploy/checks.ts`), and the run that landed went through a keyed RPC passed with `--url`. A provider's key
never goes into a file in the repository; the deploy prints only the RPC's origin, and anything that may echo the full
URL (the Solana CLI's errors) is filtered before it reaches a log.

Sources: Technical Plan §10 ("How code reaches each place"), §12 ("Where the program is built"), §3.4.3 and §3.4.9;
Sprint 05 file, "Deploy from CI's artifact" and its reviews; Sprint 00's carried items (download by run id,
SHA256SUMS, keypair backup).

## Decisions that gate deploy day (founder)

Answered by Ronaldo on 2026-10-09 (`session-log/2026-10-09-sprint-05-respostas-do-deploy-e-leituras-devnet.md`): 1 as
planned, after PR #41 merged; 2 Ronaldo; 3 a new id, `5Rx8…n8o` (PR #45), because nobody had the first id's keypair, and
mainnet gets its own id, kept private until its deploy; 4 the real constants; 5 Ronaldo's devnet key as upgrade
authority, admin and fee recipient, and his team key as the only team key until the admin adds Lucas's and Bernardo's
(`scripts/team/set-team.ts`); 6 treated as protected, with no GitHub setting changed.

1. **The deploy path.** As planned: the holder of the upgrade key downloads CI's artifact by run id and deploys it
   from their own machine. Anything built on a laptop or on the server is what the security gates forbid, and the
   script has no way to take it.
2. **Who holds the upgrade key on deploy day**: Lucas or Ronaldo (Q12's remainder). That person runs every step below,
   in one session. The key never goes to GitHub or the server.
3. **The program keypair.** Until the first deploy it is worth as much as the upgrade key: whoever deploys first at the
   id picks the upgrade authority. The first id's keypair (`6G2d…uVN`) was not on the development machine, so on
   2026-10-09 the id became `5Rx8…n8o` (PR #45), its keypair made on Ronaldo's machine outside any repository.
4. **Drill or real constants on the public devnet.** CI's artifact is the default build: the real constants (3-day
   minimum, 6-hour window), and the smoke test needs no drill build. Sprint 06's X1.1 asks for the drill constants,
   which takes a drill build with its own artifact: decide with Sprint 06.
5. **The devnet admin and fee recipient** (team machines, never the VPS; TP §3.4.9) and the **team keys** (Lucas,
   Ronaldo, Bernardo; founder answer 6, 2026-10-09): their public keys, collected before the day.
6. **`main` protected** (pull request with a review, required checks, no direct or force push): the deploy trusts CI's
   run on `main`, and the run's identity is checked by its name, `CI`.

## Before deploy day

- **Which artifact.** CI publishes `programs-<sha>` for `main` only. Sprint 05 changed no program source, so the build
  of `main` after PR #41 (Sprint 04) merges is the binary Sprint 05 tested. The deploy runs from a checkout that
  contains that commit (`main` once Sprint 05 merges, or this branch before), and refuses one whose program, build
  inputs or IDL differ from the run's commit (`scripts/deploy/binding.ts`). Artifacts expire after 30 days: past that,
  run CI on `main` again (a manual dispatch) and record the new run and hash.
- **Tools:** `gh` logged in with read access to `0x4cb-caramelo/Bakedtruth`; Solana CLI 3.1.x (rehearsed with
  3.1.10; the script refuses another minor version); Bun 1.4.2.
- **Keys:** every key file outside any Git work tree and readable only by its owner (`chmod 600`); the script refuses
  anything else. The fee payer pays the program's rents (the buffer, refunded at the end, and ProgramData); the
  **upgrade authority pays the config's and the fee vault's rents** at initialization. The dry run prints what each
  key needs and holds.
- **Read-only checks of devnet** (they need the founder's go-ahead to touch the cluster): the dry run reads the program
  id, its ProgramData address and the config address and names their standing (next table). Do it days before, so a
  blocked id is found early.
- This machine's Solana CLI defaults to **mainnet-beta**: every command here passes `--url` and every key explicitly.
- Rehearse: `bun run deploy:rehearse` must end with "every step behaved as the deploy expects".
- **Since Sprint 16 (2026-10-13)** the `brot_markets.so` in `programs-<sha>` is the output of `solana-verify build` in the
  pinned image, equal byte for byte to a second clean build and to the binary the tests ran
  (`docs/technical/verifiable-build.md`); the folder's layout is unchanged, so this procedure is too. The `mainnet`
  build is a separate artifact, `programs-mainnet-<sha>`, never deployed here. A provenance attestation (checked with
  `gh attestation verify <file> --repo 0x4cb-caramelo/Bakedtruth`) is not produced yet: it waits for the founder's
  choice on the repository's visibility or plan.

| Standing, as the dry run names it | What it means | What to do |
|---|---|---|
| The config address holds lamports and no data | Anyone can send lamports to it | Nothing: initialization takes the account over (rehearsed) |
| The program address holds lamports | `solana program deploy` cannot create the program account (rehearsed) | The program keypair's holder moves them out: `solana transfer --from <its backup> <fee payer> ALL --fee-payer <fee payer> --allow-unfunded-recipient --url https://api.devnet.solana.com`; run again (rehearsed) |
| The ProgramData address is in use while the program is not deployed | The loader cannot create ProgramData, and no key can empty it (rehearsed): **this id can never be deployed on this cluster** | A new program id: a new keypair, `declare_id!`, the event authority, the IDL and the SDK's constants, through a pull request and CI |

## The steps, in one session

1. **Pick the run** of the commit you reviewed:
   `gh run list --repo 0x4cb-caramelo/Bakedtruth --branch main --workflow CI --limit 5`
2. **Dry run**, which downloads and checks everything and sends nothing:
   ```bash
   bun run scripts/deploy/devnet-deploy.ts --run-id <id> --expect-commit <the reviewed commit, 12+ hex> \
     --program-keypair <backup>/brot_markets-keypair.json --upgrade-authority <path> \
     --admin <pubkey> --admin-keypair <path> --fee-recipient <pubkey> --team <key1>,<key2>,<key3> \
     --url https://api.devnet.solana.com --cluster devnet
   ```
   It refuses: a run that is not a successful CI run on `main`, or not of the commit named; a checkout that lacks that
   commit, changed the program since, or holds uncommitted changes; an artifact whose `SHA256SUMS` does not match, that
   holds anything else, or whose IDL is not byte for byte the checkout's; a key file inside a Git work tree, readable
   by others, or (the program keypair) not at the declared id; an `--admin-keypair` that is not `--admin`; a cluster
   whose genesis hash is not devnet's (mainnet is refused outright); a standing from the table above; a key short of
   what the plan spends. It prints the binary's SHA-256 and the three actions.
3. **Execute**: the same command with `--execute --expect-sha256 <the hash the dry run printed>`, then type the
   program id when asked (and the admin's public key, from the admin's own record, when the admin is not the upgrade
   authority and has no key here). In order:
   1. `solana program deploy` on the upgradeable loader (v3), never `program-v4`, never `--final`;
   2. the program account read back: loader v3, the upgrade authority recorded, the deployed bytes equal to the artifact;
   3. `admin_initialize_config`, signed by the upgrade authority, with `deploy/devnet/init-params.json`, read back;
   4. `admin_set_team`, signed by the admin, read back. Without the admin's key the script needs `--team-later`, and
      prints the admin's command (`scripts/team/set-team.ts`); until it runs, nobody can pause entries.
4. **Record** in the session log: the run id, the commit, the artifact's SHA-256, the signatures, who held the upgrade
   key, and the devnet checks of the sprint file.
5. **Build the site again** after any deploy or upgrade (`cd app && bun run build`; its log names the slot, "A-8: this
   build is for the program deploy at slot …"). A site built for the previous deploy pauses signing until then (A-8).

## If it stops halfway

| Where it stopped | What is left | What to do |
|---|---|---|
| `solana program deploy` died while writing the buffer | A buffer holding its rent; only the upgrade authority can close it | `solana program show --buffers --buffer-authority <upgrade authority pubkey> --url https://api.devnet.solana.com`, then `solana program close <buffer> --authority <upgrade authority keypair> --url https://api.devnet.solana.com`; run the deploy again |
| The deploy landed; the initialization did not | A program, no config | The same command with `--resume` instead of `--program-keypair`: it deploys nothing, checks the deployed bytes against the artifact, then initializes and sets the team |
| The initialization landed; its read-back or the team did not | A config | `--resume` again: a config that holds the plan's values is left as it is and the run goes on to the team; one that differs is refused, never changed |
| The deployed bytes are not the artifact's | A program the script will not initialize | Stop and report. An upgrade with CI's artifact is a separate, reviewed act |

## Upgrading

An upgrade puts CI's build of a reviewed `main` commit in place of the program, at the same id, by the upgrade key's
holder, in one session. Done on 2026-10-12 (the sixth kind), and again on 2026-10-14 at Ronaldo's word
("pode mesclar o #93, atualizar o programa no devnet com o binário do CI da main depois dele e publicar o site"). The
second time put Sprints 14, 15 and 16's pre-freeze hardening (`main` `a5e6014`) in place:
- **The artifact.** Run 38510105826's `programs-a5e6014…`: `brot_markets.so`, 205,576 bytes, sha256 `86ecf1c8…462a`,
  the same as the local build, with its IDL identical to the repository's.
- **The extension.** 169,816 to 210,776 bytes. It cost 0.208 SOL: devnet charges 5,080 lamports a byte, which matches
  step 1's rate. Transaction `5Tg1LkAdo4sVLsmXTz3DxM2LxnCuDRFsnSDjAyp7DWvYUKZKG83FKzjHmXpHJoZUGGDoMiSrD34dzRDT8S9sPfdu`.
- **The upgrade.** Transaction `38cCtp8R5zGKjFwSN9rVXCMVVMXhMHzWhtdevRa1d8UPD4s4GV7NyAa2pduHnCL9izyZSFq72YxnCxEeqJiRfM9P`,
  deployed in slot 510863588. On-chain, the first 205,576 bytes hash to the artifact's value and the rest is zeros.
- **The keyed RPC.** It reached the CLI through a private temporary config (mode 600, deleted after), never on a
  command line, with every output filtered.
- **The keeper.** It refused one simulation in the upgrade's own slot (`UnsupportedProgramId`) and ran normally after. The script above deploys and initializes a new id
- **A third time the same morning** (`main` `2e7a28c`, PR #94: the review's follow-ups), at Ronaldo's word ("pode
  mergear a 94" and "e todo o resto atualizar ci etc publicar site"):
  - **The artifact.** Run 38516025275, 206,112 bytes, sha256 `9c5e9ffb…1610`, equal to the local build, with its IDL
    identical to the repository's.
  - **No extension.** The binary fits in the 210,776 bytes the morning's extension left.
  - **The upgrade.** Transaction
    `3BE3oCbwNYEXKZEPFnNvCkPysKWTx6FN6LnjPbnue18gotAgofugwWJUm1ESz6aNW9vojLQ3feLZxaTUubdf2PZo`, deployed in slot
    510880658, with the on-chain hash checked again. It cost only the fees.
- **A fourth time, the same morning** (`main` `6bd0f68`, PR #95: the last changes before the freeze), at Ronaldo's
  word ("pode mesclar o #95, atualizar o programa no devnet com o binário do CI da main depois dele e publicar o site"):
  - **The artifact.** Run 38521057703, 206,784 bytes, sha256 `c002c5c3…5b93b21`, equal to the local build.
  - **No extension.** The binary still fits in the account.
  - **The upgrade.** Transaction
    `x5geEUHNCGGUVPdv2DWTSHhAt1hJNbp7q9eZUqvpX8w7cgrGgdd75YrZQUtSjrCENWoSrvXaRv9ztQL7CaKZfUB`, deployed in slot
    510894454, with the on-chain hash checked. The authority keeps 4.384 SOL.
only, so an upgrade is these CLI steps, each command with `--url "$DEVNET_RPC_URL"` and the key passed explicitly:

1. **Read first, send nothing.** `solana program show <id>`: loader v3, the expected authority, `Data Length` and
   `Last Deployed In Slot`. The key pays a buffer the size of the binary (5,080 lamports a byte on devnet, about
   0.83 SOL for 163,800 bytes, returned at the end) and any extension.
2. **The artifact** by run id, `SHA256SUMS` checked, its IDL byte for byte the checkout's (as in step 2 above).
3. **When the binary is larger than `Data Length`, extend by hand, by at least 10,240 bytes:**
   `solana program extend <id> 10240 --keypair <upgrade authority>`. The CLI's auto-extend asks for exactly the
   shortfall, and the loader refuses any extension under 10,240 bytes ("ExtendProgram requires a minimum of 10240
   additional bytes"; the CLI shows only "Error processing Instruction 2: invalid program argument"). The extension
   cannot be undone. The CLI prints no signature; `solana transaction-history <ProgramData address> --limit 1` shows it.
   Then wait about 10 s: the extend writes its slot into ProgramData, and the loader refuses an upgrade in that slot.
4. **Upgrade:**

   ```bash
   solana program deploy <artifact>/brot_markets.so --program-id <id> \
     --upgrade-authority <key> --keypair <key> --url "$DEVNET_RPC_URL" \
     --use-rpc --with-compute-unit-price 10000 --max-sign-attempts 50 --no-auto-extend
   ```

   Loader v3, never `--final`. If it dies while writing the buffer, close the buffer as in the first row of the table
   above, then run it again.
5. **Read back:** `solana program show <id>` (the same authority, the new `Data Length`, a new `Last Deployed In
   Slot`), then `solana program dump <id> onchain.so` and `head -c <binary size> onchain.so | sha256sum`, which must
   print the artifact's hash; the rest of ProgramData is zeros.
6. **Build the site again** from a `main` that has the change (`deploy/vps/README.md`, "A new release"). Its log must
   name the new slot: until the new build is live, the site does not sign (A-8).

## Why each rule

| Rule | Why |
|---|---|
| The artifact by run id, of the reviewed commit, `SHA256SUMS` first, the IDL equal to the checkout's | A name can be replaced; any green run would otherwise pass; the SDK in the checkout encodes the initialization the binary decodes |
| The keypair at the declared id | The event authority is derived from `crate::ID`: at another address every instruction fails at its event (rehearsed: `PrivilegeEscalation`, or `ProgramFailedToComplete` in some runs) |
| Loader v3, never `--final` | `admin_initialize_config` reads the upgrade authority from the loader-v3 ProgramData; a loader-v4 or final program can never be initialized. Loader v4 is not coming: Agave declares its gate `LoaderV4WasAbandoned11111111111111111111111` (read 2026-10-09) |
| Deploy, initialize and set the team in one session | Only the upgrade authority can initialize, so nobody can take the admin role first; but until `admin_set_team` nobody can pause entries |
| The admin proven | A mistyped admin is permanent: no team, no pause, no parameter change until a program upgrade |

## Checking an opening (Sprint 19)

The creation box at `/open` opens a campaign from the site. Its devnet check is the founder's (every devnet write is),
by hand, once the site is built for devnet (`cd app && bun run build`, which reads the program's last deploy for A-8):

1. With a test wallet outside the team that holds no real funds (Phantom uses the same keys on every network) and
   enough test SOL for the total the box shows (US$500 of SOL at its price, plus about 0.005 SOL of rent and fees),
   open a paid campaign at `/open` (a fresh Pyth feed, a target 10% away, 7 days). The review sheet names the campaign
   id ("Open campaign #<id> on …"). The check below prints the creator's address: leave it out of anything recorded.
2. Read the opening back, read-only (it signs nothing):

   ```bash
   bun run scripts/team/check-opening.ts --campaign <id> --cluster devnet --url "$DEVNET_RPC_URL"
   ```

   It prints `opening_paid_lamports`, `prize_lamports` and `opening_fee_lamports` next to the formula at the price the
   program read (`ceil(opening_usd × 10^(9 − e) ÷ p)`, split 90/10) and ends with "The opening matches the formula."
3. With the team key's wallet, open one free: the box shows no payment and no creator share; the same check reports a
   free opening.

The wallet in-app browsers run the same steps on phones (`docs/technical/wallet-browser-checklist.md`).

## Rehearsal on this machine

`solana-test-validator` 3.1.10 does not start on the development machine ("Incompatible CPU detected: missing AVX2
support"). The rehearsal therefore runs Surfpool `--offline` (no datasource), inside a network namespace that has only
loopback (`unshare -rn`, `scripts/validator/isolate.ts`), so nothing can leave the machine. The program is placed at its
id by writing its loader accounts, with an upgrade authority held in memory; `solana program deploy` itself is
rehearsed at throwaway addresses, including the funded ones of the table above (`scripts/deploy/rehearse-funded.ts`).
A runner with AVX2 (GitHub's) can run `solana-test-validator` instead.
