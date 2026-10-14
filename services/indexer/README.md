# services/indexer — the indexer (Sprint 08, slices 1 to 3)

A copy of what the program did, in one SQLite file the indexer can rebuild from the chain (TP §4, Appendix B; proposal
§2.7), plus one evidence table that it cannot rebuild (`feed_history`). It reads only the chain and stores nothing about
a visitor. It serves five read routes over the file, ranks the home page, computes the points and the KPIs, writes the
partner report, and raises one alert. Nothing it stores decides money (K-05).

## What it does

- **Lists** the program's signatures at `finalized`, newest first, back to its checkpoint (the newest signature listed),
  and keeps each with its place in the chain (`ord`). A failed transaction is kept as done and never read.
- **Wakes** every `INDEXER_POLL_MS`, or sooner when `logsSubscribe` (the program only, at `finalized`) says a new
  transaction is there: a hint only, nothing from it is read or stored, and the ingest still lists and reads at
  `finalized`. Hints coalesce; two refreshes are at least 2 s apart. A quiet subscription is renewed every 5 minutes,
  since Kit 8.4 never reports a socket the node closed cleanly; a failed one is retried after 1 s to 60 s.
- **Reads** the pending ones oldest first (`getTransaction`, JSON, version 0) and decodes their events with the SDK's
  `decodeTransactionEvents`, under its four decoder rules, address lookup tables included.
- **Writes** each signature in one SQLite transaction: its events (`INSERT OR IGNORE` on the signature, the top-level
  index and the inner index), the projections of every campaign it touches, and the signature's own state.
- **Waits** when the node answers null for a transaction, so the chain's order holds; after five such answers it skips
  it and counts it. A call that fails (a timeout, a 429, a node down) only stops the refresh: an outage never costs a
  try. A campaign whose `seq` has a gap gets its own signatures listed and read again, once per refresh until it
  closes.
- **Derives**, from one live read after each refresh (the campaign accounts and the chain's clock): the **points**, by
  the SDK's rule (`pointsTable`, the founder's answer 3a), the same inputs `/api/v1/leaderboard` uses; and the
  **ranking** (`campaigns.rank`, `campaigns.listed`): a partner campaign of `content/partners.json` first during its
  highlight (at most 72 hours, and only when a team key opened it, P-3), then two-sided, one-sided and empty
  campaigns, more entries first, then the sooner entries close; no entry 24 hours after opening unlists a campaign
  from the home page (it keeps a rank after the listed ones). The prize, the opening payment, every amount and the
  creator's own entries never move a campaign (X1.9). A closed campaign has no rank.
- **Records** `feed_history`: every new publish time of the sponsored Pyth account of each feed with a price campaign
  whose result is not final, read at `finalized` every `INDEXER_FEED_POLL_MS` and checked by the SDK. 15 s sees every
  devnet update (62 to 64 s apart); mainnet updates every 5 to 11 s, so Sprint 18 sizes the read.
- **Alerts** on the journal (below).

## Read routes

On `INDEXER_API_HOST:INDEXER_API_PORT` (loopback only, port 4201; TP §3.5), all GET, each answer shaped by its schema in
`@brot/sdk/schemas` (`indexer.ts`) and carrying `as_of_slot` (the last slot read in full) and `chain_time`:

| Route | Returns |
|---|---|
| `/api/v1/campaigns/:address/activity` | Every entry, settlement and other event of one opening, in chain order |
| `/api/v1/campaigns/:address/chance` | The YES/NO split after each entry, in basis points |
| `/api/v1/activity?limit=` | The newest entries across campaigns (20, or 1 to 100) |
| `/api/v1/wallets/:address/entries` | One wallet's entries, one row per opening, with what reached it as a baker |
| `/api/v1/ranking?listed=&limit=&offset=` | The live openings in the home page's order: address, opening, id, rank, listed |

A campaign route takes the latest opening at the address unless `?opening=` names one. An unknown query parameter, a
bad address or a bad number answers 400; an unknown campaign or opening 404; errors are `{ error: { code, message } }`,
never cached and never a stack trace. `/healthz` answers the server's own check: freshness, the last refresh's time
and error name, the wake-up's state, the feeds' and the partners file's error names. Who reaches these routes from
outside (the read API in front, or a tunnel route) is still to be decided.

## The team's exports (no public route)

```bash
bun services/indexer/src/export.ts kpis /var/lib/brot-indexer/indexer.sqlite              # JSON on stdout
bun services/indexer/src/export.ts partners /var/lib/brot-indexer/indexer.sqlite <out dir> # one .txt per campaign
bun services/indexer/src/snapshot.ts /var/lib/brot-indexer/indexer.sqlite <new file>       # the nightly hook
```

Each opens the file read-only, beside the running ingest. **The KPIs** (no address in them): openings by team and by
other wallets; paid openings per UTC month (the N of P2 §5.2); for all campaigns and for those of other wallets, how
many are two-sided, one-sided or empty, how they ended, their volume and its share; the one-sided share; the 30-day
return (another campaign within 30 days of a wallet's first entry; young wallets counted apart); campaigns resolved
without error (never contested, not voided for a house failure); each partner's volume and wallets. "On time" needs a
rule per kind and is not computed. **The partner report** (L-24, 4a): per partner campaign, its result, entries and
distinct wallets per side, SOL per side and whether it ended one-sided, never an address. **The snapshot** is a new
file made by `VACUUM INTO`, with `feed_history`; the nightly timer and the copy to VM 2 are not written yet.

## Alerts

One JSON line on the journal per alert, in the keeper's shape (`event: "alert"`, `kind`, `key`, `transports:
"journal"`), until the email provider is decided (D4).

**`creator_own_entry`: entrada da própria carteira do criador.** *O que significa:* quem abriu a campanha entrou nela,
e o resultado dela pode ser controlado por quem abriu (queima, trava, stake ou graduação de curva; nunca preço),
enquanto o resultado não é final. O site já mostra o aviso nessas campanhas (BR-26) e a carteira dele não pontua (3a).
*Quem age:* o CTO, ou o revisor do dia. *Como:* abra a campanha pelo endereço (`campaign`) e a transação
(`signature`); veja o tamanho da entrada (`lamports`) e o lado (`side`) contra o pote. Se a entrada indica que o
criador vai mexer na conta medida para ganhar, registre e acompanhe a resolução na janela de revisão; anular é
decisão do time pelas regras da janela (TP §3.4.7), nunca automática. *Prazo:* olhar no mesmo dia; antes do fim da
janela de revisão, se a campanha já estiver em revisão.

## Tables

| Table | Holds |
|---|---|
| `signatures` | Every listed signature: slot, place in the chain, failed or not, `pending`, `done` or `skipped` |
| `events` | Every event: key, slot, place, block time, name, campaign, opening, `seq`, JSON payload and its own bytes |
| `campaigns` | One row per opening of a campaign address: terms, status, pools, times, and the ranking's `rank` and `listed` |
| `entries` | Every `EntryAdded`, with the creator's own wallet flagged (`is_creator`) and both pools after it |
| `settlements` | Every payout that reached a wallet: a baker's, the creator's share, the prize back to whoever opened |
| `points` | Devnet points per wallet, with the campaigns entered and decided |
| `checkpoints` | The newest signature listed for the program |
| `feed_history` | Evidence (A-4), not rebuildable: each publish time of each watched sponsored feed |
| `referrals` | One row per `ReferralLinked`: the link, its status against the referee's first entry, the window, the rebate, what it earned its referrer |
| `referral_entries` | One row per opening an active referee entered: the basis of its winning entry, checked against the snapshot, and its state |
| `tx_positions` | A transaction's index in its block, read only for a slot where a referee's link and first entry share a slot |

A file carries its schema version in `PRAGMA user_version`; a file of another version is refused, never migrated:
rebuild it. **Points and the faucet:** many wallets can inflate the ranking, and the brake is the devnet faucet. Read
on 2026-10-13 at https://faucet.solana.com: "Maximum of 2 requests every 8 hours", and a GitHub sign-in "to unlock a
higher airdrop limit"; the page gives no amount per request, and solana.com's faucet guide gives no number.

## Referral (Sprint 14)

**The rules, as built** (TP §3.4.11; the founder's answers of 2026-10-13). A link counts when its `ReferralLinked` comes
before every `EntryAdded` of the referee by chain order: the slot, then the transaction's place in its block (the
block is read once, `getBlock`, only for a tie), then the instruction; until a tied block is read, the link is
`undecided` and earns nothing. The referrer earns 20% of the fee Brot kept on each winning entry the referee made in the
90 days after its first entry's block time, `(fee − from_fee) × entry ÷ V` with V and the fee from the
`CampaignFinalized` snapshot; only `Split` pots count (a one-sided pot's 1%, a void and a late join earn nothing). Nothing
is payable until the campaign has no gap, every baker's early sums equal V and P, the referee's `EntrySettled` is what the
snapshot pays and the `FeeCollected` is `fee − from_fee`; an entry that fails a check is `held`, never paid. The referee's
rebate is the same kept fee on its first 0.4576 SOL of entries, due once its entries reach 2.2879 SOL, capped at
0.05 SOL. Every amount rounds down.

**The weekly routine** prepares the transfers; a person signs them from the operations wallet; no payout key is ever on
the server. The ledger (`referral_payouts`, with its batches) is its own SQLite file, never the indexer's: a rebuilt
indexer file swapped in can never erase what was paid. "Paid" is read from the chain: every transfer from the
operations wallet under a `brot-referral:<batch>:<index>` memo counts, by its signature, whatever the ledger says.

```bash
# On the server, as the indexer's user; the RPC URL from a credential file (REFERRAL_RPC_URL_FILE, else the indexer's).
bun scripts/referral/prepare.ts --indexer <indexer.sqlite> --ledger <ledger.sqlite> --ops <wallet> --dry-run [--new-ledger]
bun scripts/referral/prepare.ts --indexer <indexer.sqlite> --ledger <ledger.sqlite> --ops <wallet> --out <dir> [--new-ledger]
# Where the operations wallet signs (a keypair file or a Ledger), never on the server; ONCE; the URL from a file:
SIGNER=usb://ledger RPC_URL_FILE=<file holding the RPC URL> bash referral-batch-<n>.sh
# Back on the server, 2 minutes later: record what landed (and give up what did not with --cancel <n>).
bun scripts/referral/record.ts --ledger <ledger.sqlite> --ops <wallet> [--cancel <n>]
bun scripts/referral/report.ts --ledger <ledger.sqlite> --batch <n> --out <public file>   # wallets and amounts only
bun scripts/referral/snapshot.ts <ledger.sqlite> <new file>                                # the nightly hook
bun scripts/referral/rehearse.ts   # the signing file with the real CLI on an offline surfnet (throwaway keys)
```

**The signing file runs once.** Each line is sent once; before it, the file looks for that line's memo in the
operations wallet's recent history and skips a line already there; a line that fails is listed at the end and the run
goes on. It refuses another cluster (the genesis hash read at prepare) and another signer, and passes the RPC URL to
the CLI only through a private temporary config, never a command line. **After any stop or failure, do not run it
again:** wait 2 minutes (a blockhash expires and the chain finalizes), run `record` (it books what landed, by memo),
then `record --cancel <n>` (what did not land is owed again), then prepare a new batch. `--cancel` acts only with the
operations wallet the batch was prepared for. Batch numbers never repeat, even after a new or restored ledger reads the
old landings back, and `prepare` refuses an `--out` that already holds that batch's files before writing anything. The
summary says how far back the wallet's history was read: on a node that keeps no full history, the oldest signature
read is not the wallet's first, and a lost ledger could then miss an old payout.

**A line that cannot be credited is held for a person**: a sysvar, a builtin program or precompile, the incinerator,
an executable account, the operations wallet itself, or a line whose transfer fails when `prepare` simulates it. It is
carried with the reason, listed in the summary and never written in the signing file.

A transfer that would leave its wallet below the rent-exempt minimum, read from the RPC for the wallet's size (never a
constant: devnet and mainnet answer 650,240 lamports for an empty wallet, LiteSVM 890,880), is not sent: it is
`carried`, pending in the report, and owed again next week. `prepare` refuses while a batch is open, while the
indexer's file has a transaction pending or skipped or a campaign with a gap, and when the operations wallet cannot pay
the batch, a 5,000-lamport fee per transfer and its own minimum. Only `--new-ledger` starts a ledger.

## Run

```bash
cp services/indexer/.env.example /path/outside/repo/indexer.env   # fill it there, never in the repository
INDEXER_RPC_URL=... INDEXER_DB_PATH=/path/outside/repo/indexer.sqlite bun services/indexer/src/main.ts
INDEXER_RPC_URL=... bun services/indexer/src/rebuild.ts /path/outside/repo/rebuilt.sqlite   # a new file only
```

`INDEXER_RPC_URL` (or the credential file `INDEXER_RPC_URL_FILE`) carries the provider's key: keep it out of the
repository and the logs (the indexer logs counts and named errors only). The settings are in `.env.example`; the unit
is `deploy/vps/brot-indexer.service` (not installed).

## Tests

`bun test services/indexer` (no cluster: the file, the ingest against a scripted RPC, the points against the SDK's
rule, the ranking, the KPIs and the partner report, the partners file and the content check, feed_history and the
snapshot, the wake-up over a real WebSocket, the alert, the read routes, the settings and the server) and
`bun test tests/indexer` (the program in LiteSVM: whole cycles, each live row against its account and vault, the
rebuild, the points, the read routes, the ranking, the KPIs and the report on that data). The referral's are in
both: `services/indexer/tests/referral-*.test.ts` over hand-built event streams, `tests/indexer/referral-cycle.test.ts`
with the real `user_link_referrer` in LiteSVM.
