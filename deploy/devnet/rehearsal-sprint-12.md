# Devnet rehearsal: five campaigns through every screen (Sprint 12)

Written on 2026-10-10 from a read-only look at the code and at public devnet (nothing was sent), then revised the same
day once its two scripts existed (`scripts/rehearsal/open-paid.ts`, `scripts/rehearsal/settle.ts`, run against the
program in LiteSVM by `tests/ops/rehearsal.test.ts`; not yet on a local surfnet or on devnet). Every write below is the
founder's to run. Program `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`, the real constants
(`deploy/devnet/README.md:34-38`).

The DoD line (docs/sprints/sprint-12-site-my-entries-states.md:46-47): "A devnet rehearsal with the keeper takes five
campaigns through every screen: a YES, a NO, a void, a one-sided pot, and a paid opening whose prize returns."

Markers: **[F]** checked in the code or on devnet; **[INF]** inference, not checked.

---

## 1. The five campaigns at a glance

| # | Ends as | Kind and metric | Opened by | Target | Bakers | Screens it exercises |
|---|---|---|---|---|---|---|
| C1 | YES (Split) | SupplyAtMost on mint M_YES (yours) | creator-yes (non-team, pays US$500) | supply at most 990,000 (of 1,000,000) | A YES 0.03 SOL, B NO 0.03 SOL | Open; Closed "outcome known" (seconds only); In review with the 6 h clock; Paid YES; the creator's 1%; the reserved creator credit and its claim |
| C2 | NO (Split) | SupplyAtMost on mint M_NO (yours, never burned) | team key (free) | supply at most 500,000 | A YES 0.02 SOL, B NO 0.05 SOL | Closed "entries closed" (24 h); In review; window ended; Paid NO; a team campaign (no prize, no 1%) |
| C3 | Void, MissedWindow | StakePoolTvlAtLeast on your own new stake pool P | creator-paid (pays) | pool at least 1 SOL at the start of epoch E = opening epoch + 1 | A YES 0.02 SOL, B NO 0.03 SOL | Closed "epoch started" (about a day); In review (void); Void: reason, every entry refunded without fee, prize back, opening's 10% back (house failure) |
| C4 | One-sided pot | SupplyAtMost on M_NO | creator-paid (pays) | supply at most 500,000 | A YES 0.02 SOL (must be first), B YES 0.05 SOL, C YES 0.03 SOL | Closed "entries closed"; In review; Paid, one-sided: A refunded whole, B and C less 1%, prize back, 10% kept |
| C5 | Paid opening, prize returns, no entry | SupplyAtMost on M_YES | creator-paid (pays) | supply at most 990,000 (resolves with C1's burn) | none | Open with an empty pot; In review; settled with no entry: prize back, 10% kept (the empty-campaign copy, an open [Q] of the sprint) |

Why these choices:

- Burn campaigns (SupplyAtMost) on mints you create are the only kind whose YES you control: YES as soon as the
  supply is at or below the target, before the deadline; NO only after the deadline [F]
  (`programs/brot-markets/src/readers/shared.rs:93-95`, `:101-124`; `readers/spl_mint.rs:109-118`).
- C1 and C5 share M_YES, so one burn resolves both on day 0, and C5's prize comes back the same day to pay for C3
  and C4 (section 3). C2 and C4 share M_NO, which is never burned.
- The creator's 1% exists only on a non-team opening that settles as a Split [F] (`instructions/campaigns/open_campaign/record.rs:50-60`;
  `instructions/settlement/settle_creator_share.rs:69-74`), so C1 is the paid YES with a NO side.
- C1's pot is 0.06 SOL on purpose: its 1% is 600,000 lamports, below devnet's rent-exempt minimum for an empty
  wallet, 650,240 lamports [F, `getMinimumBalanceForRentExemption(0)` on 2026-10-10]. With the creator wallet empty,
  the share is reserved in the vault instead of paid [F] (`packages/sdk/src/read/math/settle.ts:64-69`;
  `settle_creator_share.rs:101-108`).
- C3 is the only void that can be forced (section 7): a stake pool nobody updates during the measured epoch voids
  with MissedWindow as soon as the next epoch starts [F] (`readers/stake_pool.rs:186-188`).

---

## 2. What exists, and what is missing

Exists and is used here:

- `scripts/team/open.ts`: free opening with your team key (TEAM_KEYPAIR), no prize, no creator share [F]
  (`scripts/team/open.ts:56`, `:68`).
- `scripts/team/confirm.ts`: `team_confirm_result`, ends the window now and finalizes [F]
  (`instructions/resolution/team_confirm_result.rs:53-63`).
- `scripts/team/void.ts`: only for an automatic void, reasons TeamHouseFailure or TeamOutsideCause [F]
  (`scripts/team/void.ts:30-31`; `instructions/resolution/void_reason.rs:36-41`). Optional here.
- `solana` 3.1.10 and `spl-token` 5.5.0, installed on this machine [F]. The mints are made with `spl-token`; no script
  is needed.
- The site's campaign page `/c/<id>` joins with Phantom on devnet (Sprint 11). It is the best way to join.

Written for this rehearsal (Sprint 12), each simulating first and sending only with `--yes`:

### 2.1 `scripts/rehearsal/open-paid.ts`: a paid opening by a non-team wallet

`scripts/devnet-smoke.ts` pays, but only for a burn campaign on a mint it makes itself, inside one run
(`scripts/validator/cycle-open.ts:81-112`). Spec:

- Key: `CREATOR_KEYPAIR` (path), loaded with `keypairFromEnv` (`scripts/validator/keys.ts`), which refuses a key
  inside a Git work tree or readable by others. Cluster guard: `clusterArgs` and `openCluster`
  (`scripts/validator/clusters.ts`). Flags as in `scripts/team/open.ts` (reuse its `TeamCampaign`, `deadlineOf`,
  `feedHex`): `--kind`, `--metric`, `--target`, `--deadline`, `--epoch`, `--feed`, `--direction`, `--id`; plus
  `--usd` (default 500), `--cluster devnet`, `--yes`.
- Read the config (`configAddress`, `decodeGlobalConfig`); refuse when `isTeamKey(config, signer)` (a team key would
  open with no creator share) and when `--usd` is below `config.params.openingFeeUsd`.
- Preview as `previewOpening` does (`scripts/validator/cycle-open.ts:56-78`): `openingQuote` on `SOL_USD_ACCOUNT` with
  the cluster clock (its `maxLamports` is the charge plus 1%), `openingDebit` with `rentFor(ACCOUNT_LEN.campaign)` and
  `rentFor(0)`. Print the charge, prize, opening fee, max, both rents and the whole debit; refuse when the wallet holds
  less than the maximum debit.
- `id = --id ?? randomCampaignId()`; print the id and `campaignAddress(id)` before anything is sent (a retry passes
  `--id`).
- `buildOpenCampaign({ creator, args: { id, kind, direction, feedId, target, deadlineAt, openingUsd, maxLamports:
  quote.maxLamports, epoch, expectedParamsVersion: config.paramsVersion }, metricAccount })`.
- Simulate (`scripts/validator/simulate.ts`), print the program's answer; send only with `--yes`
  (`scripts/validator/rpc.ts` `send`); print the signature, the decoded events (CampaignOpened), and the stored
  `prizeLamports` and `openingFeeLamports`.

### 2.2 `scripts/rehearsal/settle.ts`: one campaign, one step at a time

`scripts/validator/cycle-settle.ts` and `scripts/devnet-settle-batch.ts` settle only a campaign they opened in the
same run, all steps at once (too fast to see In review). Spec:

- Usage: `bun run scripts/rehearsal/settle.ts <campaign address> <step> --cluster devnet [--yes]`. Payer:
  `DEVNET_WALLET` (default `~/.config/solana/pred-provable-devnet.json`). Every step: decode the campaign first, say
  why a step is not due (and skip it when its flag is already set), simulate, print the program's answer, send only
  with `--yes`, print the signature and the events.
- Entries of a campaign: the bakers are read from the campaign's own history (its `EntryAdded` events), then each
  baker's `Entry` at its PDA, decoded with `decodeEntry` (no account scan).
- Steps:
  - `status`: status, outcome, void reason, settle mode, `reviewEndsAt` against the cluster clock, `entriesOpen`,
    `entriesUntallied`, prize, opening fee, `creatorShare`, `creatorShareReserved`, the three flags; each entry (baker,
    amounts, `joinCount`/`joinsTallied`, `isFirst`) and, once finalized, its SDK `entryPayout`.
  - `resolve`: `buildResolveCampaign({ campaign, metricAccount: c.metricAccount })`, for when the keeper is down.
  - `tally`: for each entry with `joinsTallied < joinCount`, `buildTallyLateJoins({ campaign, baker, from:
    joinsTallied, to: joinCount })`. Needs InReview (`TallyNotReady`).
  - `finalize`: `buildFinalizeCampaign({ campaign })`. Needs the window ended (`ReviewNotEnded`) and every entry
    tallied (`NotTallied`).
  - `entries`: `buildSettleEntry({ campaign, baker })` for each open entry (one transaction may hold 12, as the
    settle batch showed); print the SDK's `entryPayout` next to each baker's real gain.
  - `share`: only when not a team campaign, mode Split and `creatorShare > 0`:
    `buildSettleCreatorShare({ campaign, creator: c.creator })`; afterwards say "paid" (CreatorShareSettled) or
    "reserved N lamports" (`creatorShareReserved > 0`, no event). Run again after the creator funds the wallet to claim.
  - `fee`: `buildCollectFee({ campaign })` (needs every entry settled).
  - `prize`: `buildSettlePrize({ campaign, recipient: c.creator })`.
  - `close`: `buildCloseCampaign({ campaign, rentPayer: c.rentPayer })`, with a warning: after it the site's page
    for the campaign shows nothing (section 10).
  - `sweep`: `buildSweepFees({ feeRecipient: config.feeRecipient })`.
- Builders: `packages/sdk/src/tx/builders/settlement.ts` (finalize, tally, entry, share, fee, prize, close, sweep) and
  `packages/sdk/src/tx/builders/campaign.ts` (resolve). Probably two files to stay under 200 lines.

### 2.3 Not written (optional): a join script

Only if a baker wallet is not in Phantom. `BAKER_KEYPAIR`; `<campaign address> --side yes|no --lamports <n>`;
`prepareJoin({ rpc, baker, campaign, side, amount, slippageBps: 100 })` from `@brot/sdk/tx`
(`packages/sdk/src/tx/prepare.ts:57-87`), or the computation of `joinAtEstimate`
(`scripts/validator/cycle-open.ts:115-158`: `estimateReturnBps`, `expectedEntryTotal = entryTotal(entry)`,
`joinIndex = entry?.joinCount ?? 0`); simulate; send with `--yes`.

### 2.4 Not installed: the SPL stake pool CLI (for C3)

`spl-stake-pool` is not on this machine [F]. It is installed with cargo, outside the repository (section 5.6). Its
flags below are from memory of the CLI and were not run here [INF]: check `spl-stake-pool create-pool --help` first.

---

## 3. Keys, wallets and SOL

| Name | What | Notes |
|---|---|---|
| PAYER | `DEVNET_WALLET`, default `~/.config/solana/pred-provable-devnet.json` (G5ch…) | pays the mints, the pool, resolve, tally, finalize and settlement fees; held 0.42 SOL on 2026-10-10 (session-log 2026-10-10-sprint-06-campanha-de-teste.md:11) |
| TEAM | your team key, `TEAM_KEYPAIR` | the only team key on devnet is `3EgrFsDDBks8zG31rquNvtP1BR91BVArypwtiBg6XwMz` (config read 2026-10-10); it holds 0.00436 SOL, less than C2's two rents plus fees: top it up |
| CY | `~/brot-rehearsal/creator-yes.json`, new | opens C1 only, then is emptied to 0 SOL (the reserve needs an empty wallet) |
| CP | `~/brot-rehearsal/creator-paid.json`, new | opens C5, C3 and C4 |
| A, B, C | three accounts in Phantom, set to devnet | join through the site; settlement needs only their addresses |

Devnet values read on 2026-10-10 16:21 UTC [F]:

- SOL/USD charged at price − conf = US$110.32: a US$500 opening moves 4.532 SOL into the vault (prize 4.079 SOL,
  opening fee 0.453 SOL); the signed maximum with the 1% margin is 4.578 SOL. It moves with the price.
- Rents: Campaign (512 bytes) 0.0032512 SOL; vault and any empty wallet 0.00065024 SOL; Entry (116 bytes)
  0.00123952 SOL; Join (96 bytes) 0.00113792 SOL; mint 0.0010668 SOL; token account 0.00148844 SOL.
- Minimum entry 0.01 SOL; fee 10% of the losing side; one-sided fee 1%; creator share 1%; prize 90%.

What each wallet needs:

| Wallet | Amount | Comes back |
|---|---|---|
| CY | 4.60 SOL (C1: 4.578 max + 0.0039 rents + fee) | rents at close; the 0.0006 share |
| CP, phase 1 | 4.60 SOL (C5) | C5's prize, about 4.08 SOL, on day 0 |
| CP, phase 2 | 9.17 SOL (C3 and C4) | C3's prize and 10%, C4's prize |
| TEAM | top up to 0.02 SOL | C2's rents at close |
| A | 0.12 SOL | wins C1 (about 4.135 SOL with the prize) |
| B | 0.20 SOL | wins C2 |
| C | 0.05 SOL | |
| PAYER | 0.10 SOL (mints, pool [INF 0.01 to 0.03 SOL], about 60 fees) | |

Two-phase plan (the recipe below): about 9.7 SOL at the start, plus about 1 SOL in phase 2 (CP is refilled from
C5's prize, from A's C1 winnings and from CY's leftover). Opening all five at once instead: about 18.9 SOL. Nearly
everything comes back: entries and prizes to your own wallets, and Brot's kept fees (about 1.36 SOL of opening fees
plus small house fees) to the fee recipient, `6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq`, Ronaldo's devnet key,
by `sweep`. On 2026-10-10 the public faucet answered 429 for the day (same session log, line 18).

A cheaper route, only by founder decision: the admin lowers `openingFeeUsd` on devnet with
`scripts/team/set-params.ts` (floor US$1, `programs/brot-markets/src/constants.rs:68`), runs the rehearsal with
`--usd` at that value, and sets it back to 500 afterwards. Each change raises `params_version`, so any opening
previewed before it is refused with `CreationParamsChanged` (`scripts/team/set-params.ts:1-9`), and the screens show
small prizes.

---

## 4. Timeline

T0 is the start of the opening session. The example column assumes T0 = 2026-10-11 10:00 UTC. Devnet epochs, measured
on 2026-10-10 (epoch 1179, slot index 271,069 of 432,000, 239.3 ms per slot over the last 60 samples): one epoch is
about 28.7 h; epoch 1180 starts about 2026-10-11 03:03, 1181 about 10-12 07:46, 1182 about 10-13 12:29 UTC [INF,
projection; allow an hour either way]. Recompute before starting (step 5.1).

| Offset | Example UTC | Campaign | What happens | Who |
|---|---|---|---|---|
| before T0 | | all | install `spl-stake-pool`; get devnet SOL | founder |
| T0+0:00 | 10-11 10:00 | | wallets, funding, mints M_YES and M_NO | founder |
| T0+0:20 | 10:20 | C2 | open (team, free), deadline +74h, so D2 = T0+74:20, entries close T0+50:20 | team key |
| T0+0:25 | 10:25 | C1 | open (paid), deadline +74h | CY |
| T0+0:30 | 10:30 | C5 | open (paid), deadline +74h | CP |
| T0+0:35 | 10:35 | C1 | empty CY to 0 SOL | CY |
| T0+0:40 | 10:40 | C1, C2 | joins on the site | A, B |
| T0+0:55 | 10:55 | C1, C5 | burn 10,000 of M_YES | PAYER |
| T0+0:56 | 10:56 | C1, C5 | the keeper records YES; window ends about T0+6:56 | keeper |
| T0+1:00 | 11:00 | C1 | tally A and B | PAYER |
| T0+1:30 | 11:30 | C1, C5 | team confirm (window ended early, snapshot taken) | team key |
| T0+1:35 | 11:35 | C1 | entries; share reserved; fund CY; claim; fee; prize | PAYER, founder |
| T0+1:50 | 11:50 | C5 | prize back to CP; fee | PAYER |
| T0+2:00 | 12:00 | | refill CP (A's winnings, plus about 1 SOL) | founder |
| T0+2:05 | 12:05 | C3 | create stake pool P (epoch 1180) | PAYER |
| T0+2:10 | 12:10 | C3 | open (paid), epoch E = 1181, deadline +74h | CP |
| T0+2:15 | 12:15 | C4 | open (paid), deadline +74h, so D4 = T0+76:15, entries close T0+52:15 | CP |
| T0+2:20 | 12:20 | C3, C4 | joins on the site (C4: A first) | A, B, C |
| T0+21:46 | 10-12 07:46 | C3 | epoch 1181 starts: entries locked, "epoch started" | chain |
| T0+50:20 | 10-13 12:20 | C2 | entries close | chain |
| T0+50:29 | 10-13 12:29 | C3 | epoch 1182 starts: the keeper records Void (MissedWindow); window ends about T0+56:29 | keeper |
| T0+50:35 | 10-13 12:35 | C3 | tally A and B | PAYER |
| T0+52:15 | 10-13 14:15 | C4 | entries close | chain |
| T0+56:30 | 10-13 18:30 | C3 | finalize; entries; prize and 10% back; fee (zero) | PAYER |
| T0+74:20 | 10-14 12:20 | C2 | deadline; the keeper records NO at its next cycle; window ends about T0+80:21 | keeper |
| T0+74:25 | 10-14 12:25 | C2 | tally A and B | PAYER |
| T0+76:15 | 10-14 14:15 | C4 | deadline; the keeper records NO; window ends about T0+82:16 | keeper |
| T0+76:20 | 10-14 14:20 | C4 | tally A, B and C | PAYER |
| T0+80:25 | 10-14 18:25 | C2 | finalize; entries; fee; prize (flag only) | PAYER |
| T0+82:20 | 10-14 20:20 | C4 | finalize; entries; fee; prize back to CP | PAYER |
| when every screen is recorded | | all | close each campaign; sweep once | PAYER |

The window always starts at the resolve transaction, not at the deadline: `review_ends_at = now + 6 h` [F]
(`instructions/resolution/resolve_campaign/record.rs:40-53`). Entries close `max(5% of the duration, 24 h)` before the
deadline, at most 7 days [F] (`packages/sdk/src/read/math/schedule.ts:30-37`, `:62-72`;
`programs/brot-markets/src/constants.rs:146-170`): 24 h for every campaign here.

---

## 5. Steps

Run from the repository root. Placeholders are in angle brackets; write each value down when a command prints it.

### 5.1 Session setup and checks (T0)

```bash
export PATH="$HOME/.bun/bin:$PATH"
cd ~/projects/solana/brot
export RPC=https://api.devnet.solana.com
export PAYER=~/.config/solana/pred-provable-devnet.json
export DEVNET_WALLET="$PAYER"
export TEAM_KEYPAIR=<path to your team key file>
solana epoch-info --url "$RPC"
solana balance --url "$RPC" "$PAYER"
solana-keygen pubkey "$PAYER"
```

The scripts default to the public RPC; a keyed one goes in `DEVNET_RPC_URL` (`scripts/validator/clusters.ts:48`),
never in a file or a log. This machine's Solana CLI defaults to mainnet, so every `solana` and `spl-token` command
passes `--url`.

From `solana epoch-info`, hours to the next epoch = (slots in epoch − slot index) × 0.239 / 3,600. Note the current
epoch N: C3 measures E = N + 1 if it opens in N.

### 5.2 Wallets and funding (T0+0:00)

```bash
mkdir -p ~/brot-rehearsal
chmod 700 ~/brot-rehearsal
solana-keygen new --no-bip39-passphrase --outfile ~/brot-rehearsal/creator-yes.json
solana-keygen new --no-bip39-passphrase --outfile ~/brot-rehearsal/creator-paid.json
chmod 600 ~/brot-rehearsal/creator-yes.json ~/brot-rehearsal/creator-paid.json
solana-keygen pubkey ~/brot-rehearsal/creator-yes.json
solana-keygen pubkey ~/brot-rehearsal/creator-paid.json
```

Check that neither address is `3EgrFsDDBks8zG31rquNvtP1BR91BVArypwtiBg6XwMz` (it cannot be: they are new). In
Phantom, create accounts A, B and C on devnet and copy their addresses.

```bash
solana transfer --url "$RPC" --from "$PAYER" --fee-payer "$PAYER" --allow-unfunded-recipient <CY_ADDRESS> 4.6
solana transfer --url "$RPC" --from "$PAYER" --fee-payer "$PAYER" --allow-unfunded-recipient <CP_ADDRESS> 4.6
solana transfer --url "$RPC" --from "$PAYER" --fee-payer "$PAYER" 3EgrFsDDBks8zG31rquNvtP1BR91BVArypwtiBg6XwMz 0.02
solana transfer --url "$RPC" --from "$PAYER" --fee-payer "$PAYER" --allow-unfunded-recipient <A_ADDRESS> 0.12
solana transfer --url "$RPC" --from "$PAYER" --fee-payer "$PAYER" --allow-unfunded-recipient <B_ADDRESS> 0.2
solana transfer --url "$RPC" --from "$PAYER" --fee-payer "$PAYER" --allow-unfunded-recipient <C_ADDRESS> 0.05
```

### 5.3 The two mints (T0+0:05)

Classic SPL Token, decimals 0, supply 1,000,000, mint authority revoked: the opening refuses a live authority
(`MintAuthorityLive`) and a Token-2022 mint (`ReaderWrongOwner`) [F] (`readers/spl_mint.rs:44-69`, `:86-105`).

```bash
spl-token create-token --url "$RPC" --fee-payer "$PAYER" --mint-authority <PAYER_ADDRESS> --decimals 0
spl-token create-account --url "$RPC" --fee-payer "$PAYER" --owner <PAYER_ADDRESS> <M_YES>
spl-token mint --url "$RPC" --fee-payer "$PAYER" --mint-authority "$PAYER" --recipient-owner <PAYER_ADDRESS> <M_YES> 1000000
spl-token authorize --url "$RPC" --fee-payer "$PAYER" --authority "$PAYER" <M_YES> mint --disable
spl-token supply --url "$RPC" <M_YES>
spl-token address --url "$RPC" --token <M_YES> --owner <PAYER_ADDRESS> --verbose
solana account --url "$RPC" <M_YES>
```

The first command prints M_YES. `spl-token address` prints M_YES_ATA, the token account the burn uses. `solana account`
must show owner `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`. Repeat the five lines for M_NO (you will never burn it).

### 5.4 Phase 1 openings (T0+0:20 to T0+0:35)

C2, team, free. First without `--yes` (simulation only), then with it; save the id and address it prints:

```bash
bun run scripts/team/open.ts --kind SupplyAtMost --metric <M_NO> --target 500000 --deadline +74h --cluster devnet
bun run scripts/team/open.ts --kind SupplyAtMost --metric <M_NO> --target 500000 --deadline +74h --cluster devnet --yes
```

Use `+74h`, not `+3d`: the script computes the deadline from the clock it reads before sending, so `+3d` lands a few
seconds under three days and the program refuses `DurationTooShort` [F] (`scripts/team/open.ts:46-53`, `:67`;
`instructions/campaigns/open_campaign.rs:124-127`). If an answer never comes, rerun with `--id <the printed id>`.

C1 and C5, paid:

```bash
CREATOR_KEYPAIR=~/brot-rehearsal/creator-yes.json bun run scripts/rehearsal/open-paid.ts --kind SupplyAtMost --metric <M_YES> --target 990000 --deadline +74h --cluster devnet --yes
CREATOR_KEYPAIR=~/brot-rehearsal/creator-paid.json bun run scripts/rehearsal/open-paid.ts --kind SupplyAtMost --metric <M_YES> --target 990000 --deadline +74h --cluster devnet --yes
```

990,000 is the closest target a 1,000,000 supply allows (1% minimum distance, `readers/spl_mint.rs:83-85`). A paid
opening also needs a fresh SOL/USD price (at most 120 s old, band at most 0.5%); a `SolUsdStale` refusal is retried
with the same `--id` [F] (`instructions/campaigns/open_campaign/payment.rs:62-83`; config `maxPriceAge` 120).

Empty CY, so C1's share is reserved later (CY never needs to sign again; close returns its rents to it):

```bash
solana transfer --url "$RPC" --from ~/brot-rehearsal/creator-yes.json --fee-payer ~/brot-rehearsal/creator-yes.json --allow-unfunded-recipient <CP_ADDRESS> ALL
solana balance --url "$RPC" <CY_ADDRESS>
```

The balance must read 0 SOL. Below 50,240 lamports also works (CY + 600,000 must stay under 650,240) [F]
(`packages/sdk/src/read/math/settle.ts:64-69`).

### 5.5 Phase 1 joins, burn, resolution and settlement (T0+0:40 to T0+1:50)

Joins on the site, `/c/<C1_ID>` and `/c/<C2_ID>`, one Phantom account at a time:

- C1: A joins YES 0.03; B joins NO 0.03.
- C2: A joins YES 0.02; B joins NO 0.05.
- Nobody joins C5.

Look at the Open screens of C1, C2 and C5 now (C5 shows an empty pot).

Burn with `/c/<C1_ID>` open in the browser; reload it within seconds, since the keeper on the server cycles every 15 s
(session-log/2026-10-10-sprint-06-proof-e-modo-real.md:15) and "outcome known" lasts only until its resolve:

```bash
spl-token burn --url "$RPC" --fee-payer "$PAYER" --owner "$PAYER" <M_YES_ATA> 10000
spl-token supply --url "$RPC" <M_YES>
```

Then, once C1 and C5 show In review:

```bash
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> status --cluster devnet
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> tally --cluster devnet --yes
```

If neither campaign is In review two minutes after the burn, the keeper is down; resolve by hand:

```bash
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> resolve --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C5_ADDRESS> resolve --cluster devnet --yes
```

Look at In review with the 6-hour clock on both pages for as long as you like (up to T0+6:56). Then end both windows
with your team key (tally first, or the program refuses `NotTallied`, `instructions/settlement/snapshot.rs:80-82`):

```bash
bun run scripts/team/confirm.ts <C1_ADDRESS> --cluster devnet
bun run scripts/team/confirm.ts <C1_ADDRESS> --cluster devnet --yes
bun run scripts/team/confirm.ts <C5_ADDRESS> --cluster devnet --yes
```

C1 is now Paid YES (Settling). C5, with no entry, goes straight to Settled [F] (`instructions/settlement/snapshot.rs:90-94`).
Look at both before paying anything.

C1, paying out:

```bash
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> entries --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> share --cluster devnet --yes
```

The share step must report "reserved 0.000600000 SOL". Look at the reserved credit on `/c/<C1_ID>` and `/my-entries`
with CY connected (import CY into Phantom). Then the claim: fund CY, then either "Receive" on the site (CY signs and pays
the fee, so CY needs the rent-exempt minimum plus the fee, 655,240 lamports today; 0.002 SOL covers it), or:

```bash
solana transfer --url "$RPC" --from "$PAYER" --fee-payer "$PAYER" --allow-unfunded-recipient <CY_ADDRESS> 0.002
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> share --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> fee --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> prize --cluster devnet --yes
```

The claim emits CreatorShareSettled for 600,000 lamports. Do not close C1 yet: close would pay a still-reserved share
to CY with the rents [F] (`instructions/settlement/close_campaign.rs:60-78`, `:113-119`), and after close the page
is gone (section 10).

C5, paying out (no tally, no entries, no share):

```bash
bun run scripts/rehearsal/settle.ts <C5_ADDRESS> prize --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C5_ADDRESS> fee --cluster devnet --yes
```

The prize goes back to CP; Brot keeps the 10% [F] (`instructions/settlement/collect_fee/amount.rs:57-88`).

### 5.6 Phase 2: the stake pool, C3 and C4 (T0+2:00 to T0+2:20)

Refill CP to about 9.2 SOL: send A's C1 winnings from Phantom to CP, then top up the rest:

```bash
solana balance --url "$RPC" <CP_ADDRESS>
solana transfer --url "$RPC" --from "$PAYER" --fee-payer "$PAYER" <CP_ADDRESS> 1
```

Install the stake pool CLI once, outside the repository (not done or tried here) [INF]:

```bash
cargo install --locked spl-stake-pool-cli
spl-stake-pool --version
spl-stake-pool create-pool --help
```

Create the pool. Flags to confirm against the help [INF]; if the CLI refuses the fees, add `--unsafe-fees`:

```bash
solana epoch-info --url "$RPC"
spl-stake-pool create-pool --url "$RPC" --fee-payer "$PAYER" --manager "$PAYER" --staker "$PAYER" --epoch-fee-numerator 1 --epoch-fee-denominator 100 --withdrawal-fee-numerator 1 --withdrawal-fee-denominator 1000 --max-validators 1
```

It prints the pool address P. From now on, run no other `spl-stake-pool` command on P: several of them update the
pool first [INF], and an update in epoch E turns the void into a NO. The opening requires the pool updated in this
epoch or the last one (`StakePoolNotUpdating`), a target at least 1% above its totals, and E after the current epoch
with its latest plausible start (500 ms slots) before the deadline [F] (`readers/stake_pool.rs:122-144`;
`readers/epoch.rs:120-148`; `constants.rs:132`). A new pool's update epoch is its creation epoch [INF; the opening's
simulation says `StakePoolNotUpdating` if not].

C3 and C4, paid; E = the epoch `solana epoch-info` printed, plus 1:

```bash
CREATOR_KEYPAIR=~/brot-rehearsal/creator-paid.json bun run scripts/rehearsal/open-paid.ts --kind StakePoolTvlAtLeast --metric <P> --target 1000000000 --epoch <E> --deadline +74h --cluster devnet --yes
CREATOR_KEYPAIR=~/brot-rehearsal/creator-paid.json bun run scripts/rehearsal/open-paid.ts --kind SupplyAtMost --metric <M_NO> --target 500000 --deadline +74h --cluster devnet --yes
```

Joins on the site, before epoch E starts (C3's entries lock then) [F] (`readers/stake_pool.rs:149-151`;
`packages/sdk/src/read/view.ts:52-60`):

- C3: A joins YES 0.02; B joins NO 0.03.
- C4: A joins YES 0.02 first (the first baker pays no one-sided fee, `instructions/entries/join_campaign.rs:138-143`);
  then B joins YES 0.05 and C joins YES 0.03. Nobody joins NO.

### 5.7 Day 1 (about T0+21:46)

Nothing to run. When epoch E starts, C3 shows Closed with the reason "epoch started" for about one epoch (28.7 h); the
keeper's resolve is "not yet" all that time [F] (`readers/stake_pool.rs:158-190`).

### 5.8 Day 2: the void (about T0+50:29)

When epoch E + 1 starts, the keeper records Void with reason MissedWindow [F] (`readers/stake_pool.rs:186-188`). Look
at In review (void), then:

```bash
bun run scripts/rehearsal/settle.ts <C3_ADDRESS> status --cluster devnet
bun run scripts/rehearsal/settle.ts <C3_ADDRESS> tally --cluster devnet --yes
```

At the same time C2 (T0+50:20) and C4 (T0+52:15) show Closed, entries closed on time.

After the window ends (about T0+56:29; look at the page once more between the end and the finalize):

```bash
bun run scripts/rehearsal/settle.ts <C3_ADDRESS> finalize --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C3_ADDRESS> entries --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C3_ADDRESS> prize --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C3_ADDRESS> fee --cluster devnet --yes
```

Every entry comes back whole; the prize and the opening fee go back to CP, since MissedWindow is a house failure [F]
(`instructions/resolution/void_reason.rs:13-18`; `instructions/settlement/collect_fee/amount.rs:74-86`).

Optional, by decision only: inside the window, a team key may restate the void as TeamOutsideCause, so the screen shows
the 10% kept. The script writes a permanent public record under `content/void-log/` that must be committed:

```bash
bun run scripts/team/void.ts <C3_ADDRESS> --reason TeamOutsideCause --note <note file> --cluster devnet
```

### 5.9 Day 3: the NO and the one-sided pot (from T0+74:20)

Right after each deadline the keeper records NO (a burn campaign after its deadline, `readers/shared.rs:101-124`).
Look at In review, then tally:

```bash
bun run scripts/rehearsal/settle.ts <C2_ADDRESS> tally --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C4_ADDRESS> tally --cluster devnet --yes
```

After each window (about T0+80:21 for C2, T0+82:16 for C4), let the page show the window ended, then pay:

```bash
bun run scripts/rehearsal/settle.ts <C2_ADDRESS> finalize --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C2_ADDRESS> entries --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C2_ADDRESS> fee --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C2_ADDRESS> prize --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C4_ADDRESS> finalize --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C4_ADDRESS> entries --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C4_ADDRESS> fee --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C4_ADDRESS> prize --cluster devnet --yes
```

C2's prize step only sets the flag (a Split moves nothing, `instructions/settlement/collect_fee/amount.rs:131-136`);
close needs the flag.

### 5.10 Close and sweep (after every screen is recorded)

```bash
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> close --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C2_ADDRESS> close --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C3_ADDRESS> close --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C4_ADDRESS> close --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C5_ADDRESS> close --cluster devnet --yes
bun run scripts/rehearsal/settle.ts <C1_ADDRESS> sweep --cluster devnet --yes
```

Close returns both rents to the stored rent payer, the opener [F] (`instructions/campaigns/open_campaign/record.rs:53`).
Sweep sends the fee vault above its rent to the fee recipient, `6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq`.

---

## 6. Screen checklist

| Screen (Sprint 12 DoD) | Campaign | When |
|---|---|---|
| Open, empty pot | C5 | T0+0:30 to the burn |
| Closed, outcome already known | C1 (and C5) | between the burn and the keeper's resolve: seconds |
| Closed, epoch started | C3 | T0+21:46 to T0+50:29 |
| Closed, entries closed on time | C2, C4 | T0+50:20 / T0+52:15 to each deadline |
| In review, 6-hour clock, value read, target | C1, C5 (day 0); C3 (void); C2, C4 | after each resolve |
| In review, window ended, not yet finalized | C3, C2, C4 | between window end and finalize |
| Paid YES, amount received | C1 (A receives about 4.135 SOL) | after `entries` |
| Paid NO | C2 (B receives 0.068 SOL) | after `entries` |
| Void: reason, entries refunded without fee, prize back, 10% back | C3 | after finalize and payouts |
| One-sided: refund, 1% for every baker but the first, prize back, 10% kept | C4 | after finalize and payouts |
| Creator's 1% | C1 | after the claim |
| Reserved creator credit and "Receive" | C1 | between the first and the second `share` |
| Settled with no entry (prize back, 10% kept) | C5 | after confirm, prize and fee |
| "My entries" for A, B, C; creator view for CY and CP | all | before and after `entries`; compare "received" with EntrySettled and CreatorShareSettled |
| Public record of voids | C3 | after the void |

Not reachable on devnet now: Contested (`team_open_contest` is refused until Sprint 14, `scripts/team/contest.ts`) and
the stale-feed void (section 7).

---

## 7. What cannot be forced, and why

- **StaleFeed** (price): the sponsored account must have had no update in the last max(120 s, 600 s) = 600 s before the
  deadline and none after it, when the keeper resolves 60 s or more after the deadline [F]
  (`readers/price_touch/proof.rs:104-124`; `constants.rs:155`). Devnet updates about every 63 s and nobody can write
  an older price. Only a Pyth outage could cause it; test the screen with fixtures.
- **UnreadableAccount**: only an account that cannot be read after the deadline (burn, DAMM) or after the epoch (stake
  pool) [F] (`readers/shared.rs:101-124`; `readers/stake_pool.rs:168-174`). A classic SPL mint, a DAMM v2 pool and a
  stake pool cannot be closed by their users [INF].
- **A team void of a YES or NO**: refused, `TeamVoidNotAutomatic` [F] (`instructions/resolution/void_reason.rs:36-41`).
- **MissedWindow by the deadline**: the opening requires E's latest start at 500 ms slots before the deadline; devnet
  runs about 239 ms, so E always starts well before it [F] (`readers/epoch.rs:120-148`).
- **MissedWindow by a skipped epoch** (C3): forceable with a pool nobody updates in E. Residual risk: anyone may update
  a pool (the SPL instruction is permissionless) [INF]; then C3 ends as a NO (its snapshot is about 0 against a 1 SOL
  target) instead of a void.
- Best-effort alternative to your own pool: `J5zyfdfTxRcTm3BDwNVWD7cEkVjAKEqk5J9DdKHzg6JF`, a third party's pool
  last updated in epoch 1178 (created 2026-10-09 16:40 UTC, four transactions, none since). It can be used only by an
  opening before epoch 1180 starts (about 2026-10-11 03:03 UTC), with E = 1180, and it voids at about 2026-10-12 07:46
  UTC only if its owner does not update it in epoch 1180. Of the 255 devnet pools, the five others updated in the
  current epoch are updated every epoch (four by a daily job at about 22:22 UTC, one several times an epoch), so each
  epoch gets a snapshot: no void.
- **"Outcome already known" for long**: the burn kind's lock lasts until the keeper's next cycle (15 s). Only C3's epoch
  lock lasts long, and the site names it "epoch started" (`packages/sdk/src/read/view.ts:52-60`).

---

## 8. Expected amounts (lamports)

Each first join costs the entry plus 1,239,520 (Entry) plus 1,137,920 (Join); tally moves the Join's rent into the
Entry and `settle_entry` pays both back to the baker, outside EntrySettled's `amount` [F]
(`instructions/settlement/tally_late_joins.rs`, `settle_entry.rs:128-149`). R is the prize, F the opening fee of
that campaign (about 4,079,000,000 and 453,000,000 at today's price).

| Campaign | Snapshot | Bakers receive | Opener | Brot keeps |
|---|---|---|---|---|
| C1 YES | V = P = 30,000,000; fee ceil(10%) = 3,000,000; share floor(1% × 60,000,000) = 600,000 from the losing side; viable since 30,000,000 > 3,600,000; distributable 56,400,000 + R | A 56,400,000 + R; B 0 | share 600,000 (reserved, then claimed) | 3,000,000 + F |
| C2 NO | V = 50,000,000, P = 20,000,000; fee 2,000,000; no share (team) | B 68,000,000; A 0 | nothing (no prize) | 2,000,000 |
| C3 Void (MissedWindow) | Refund | A 20,000,000; B 30,000,000 | R + F | 0 |
| C4 One-sided | OneSided | A 20,000,000 (first); B 49,500,000; C 29,700,000 | R | 800,000 + F |
| C5 no entry | Refund, no entry | none | R | F |

Sources [F]: `packages/sdk/src/read/math/payout.ts:8-14`, `snapshot.ts:82-86`, `:115-135`, `settle.ts:38-59`,
`fees.ts:13-25`, `void.ts:38-49`; program mirrors in `programs/brot-markets/src/math/` and
`instructions/settlement/collect_fee/amount.rs:60-145`.

---

## 9. Rules relied on

- Real constants on devnet: 3 to 90 days, 6 h window, entries close 24 h to 7 d before: `programs/brot-markets/src/constants.rs:141-170`; `packages/sdk/src/read/math/schedule.ts:30-37`, `:62-72`; `deploy/devnet/README.md:34-38`.
- Duration checked against the clock at execution: `instructions/campaigns/open_campaign.rs:124-128`.
- Free opening for a team key only; a team key that pays is still a team campaign: `open_campaign/payment.rs:55-61`; `open_campaign/record.rs:50-60`.
- Paid opening, US$ at price − conf, fresh and tight, at most `max_lamports`, 90/10: `open_campaign/payment.rs:62-108`.
- The keeper resolves only, every cycle, sending what the program accepts: `services/keeper/README.md:1-10`; `services/keeper/src/cycle.ts:25-38`; `services/keeper/src/resolve.ts:85-100`; cycle 15 s on the server (`session-log/2026-10-10-sprint-06-proof-e-modo-real.md:15`; default 60 s in `services/keeper/src/config.ts:94`).
- Resolve: Open only, writes InReview and `review_ends_at = now + 6 h`: `instructions/resolution/resolve_campaign.rs:51-56`; `resolve_campaign/record.rs:40-53`.
- Burn kind: `readers/spl_mint.rs:86-118`; facts and deadline: `readers/shared.rs:93-124`.
- Stake pool kind: `readers/stake_pool.rs:122-190`; epochs: `readers/epoch.rs:120-148`; `constants.rs:132`.
- Price kind, NO and StaleFeed: `readers/price_touch/proof.rs:51-63`, `:104-124`; `constants.rs:150-155`.
- Join lock and closing reasons: `instructions/entries/join_lock.rs:59`; `join_campaign.rs:116`, `:138-143`; `packages/sdk/src/read/view.ts:44-81`.
- Team window acts: `instructions/resolution/window.rs:11-29`; `team_confirm_result.rs:53-63`; `team_void_campaign.rs:64-86`; `void_reason.rs:13-41`.
- Finalize and snapshot: `instructions/settlement/finalize_campaign.rs:42-49`; `instructions/settlement/snapshot.rs:80-121`.
- Tally: `instructions/settlement/tally_late_joins.rs:54-62`.
- Payouts: `settle_entry.rs:108-149`; `settle_creator_share.rs:69-123`; `settle_prize.rs:47-56`; `collect_fee/amount.rs:60-145`; `close_campaign.rs:60-127`.
- Page after close: it says the campaign is closed; what each wallet received is read from its events on `/my-entries` (Sprint 12).

---

## 10. Open risks

1. **Devnet SOL.** About 9.7 SOL to start and 1 SOL more in phase 2 (18.9 SOL to open all at once). The faucet was
   rate-limited on 2026-10-10.
2. **The two scripts are new.** They passed against the program in LiteSVM (`tests/ops/rehearsal.test.ts`), not on a
   local surfnet or on devnet yet; read each simulation before adding `--yes`.
3. **History after payment.** `settle_entry` closes each Entry and `close_campaign` deletes the campaign. Since Sprint
   12 the campaign page says the campaign is closed and `/my-entries` reads what each wallet received from its own
   transactions (the last 50, more on request); the read API keeps no history until the indexer.
4. **No automatic payout on devnet.** The deployed keeper resolves only; every payment here is by hand. The site says
   "Waiting for payout" and promises no time (the founder's answer, 2026-10-10).
5. **C3 depends on nobody updating your pool during E**, on the `spl-stake-pool` CLI building and matching the devnet
   program, and on the epoch estimates (about an hour either way).
6. **The keeper must be up.** If a campaign is not In review a couple of minutes after its trigger, resolve by hand
   (step `resolve`).
7. **The "outcome known" screen** lasts seconds; it may be easier to check in an end-to-end test.
8. **Price and freshness** at each paid opening: the cost follows SOL/USD, and a stale SOL/USD account refuses the
   opening until the next update.
