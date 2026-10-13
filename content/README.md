# content/

Public files the site reads on its server when it is built. Each changes only by a commit that two people review
(there is no CODEOWNERS file yet, so the second review is a team rule until Sprint 16). The site finds this folder or
fails its build (`app/lib/content.ts`); a change appears once it is merged and the site is built and deployed again.

| File                 | What it is                                                                                     | Page                                   |
| -------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| `void-log/`          | The team's public text for each void it records, and corrections (its own README)              | `/record`, and the campaign's page     |
| `powers.md`          | Who holds each key and the limit of each power (BR-41); Sprint 16 updates it with the multisig | `/record`                              |
| `unlisted.json`      | Campaigns the team took off the home page after a report (C-10)                                | The home page, and the campaign's page |
| `account-names.json` | Reviewed names of accounts a campaign can read (A-11); empty until the team adds one           | The creation box at `/abrir`           |

## Unlisting a campaign after a report

Reports arrive on X (https://x.com/brotmarkets), by direct message or mention. Unlisting is display only: the campaign
stays on-chain with its link, and its entries, result and payouts do not change.

1. Read the report and the campaign's page. Unlist only a campaign that misleads or abuses; a result someone dislikes
   is not a reason.
2. Add one entry to `unlisted.json`:

   ```json
   { "id": "<the campaign's number>", "opensAt": "<its opens_at>", "reason": "<public text>", "at": "<UTC time>" }
   ```

   - `opensAt` is the campaign's `opens_at` (Unix seconds), from `/api/v1/campaigns/<address>` or the account. A closed
     campaign's number can carry a new campaign later; the opening time keeps the entry on the right one.
   - `reason` is public and permanent in Git: no email address, @handle, URL or domain (the build refuses them), and no
     person's name. Keep it generic ("Misleading name."); naming a project as misleading is for the team to weigh.

3. Open a pull request; a second person reviews it; merge; build and deploy the site.

A malformed file fails the build, so a mistake never unlists the wrong campaign silently. The campaign page reads the
file on each request and keeps working without it if it cannot be read.

## Naming an account

A name helps a creator find an account in the creation box (`/abrir`); it is not a gate (D-i). An account with no
name still opens a campaign and shows its shortened address with an explorer link. Price accounts are named by Pyth's
list, which the program compiles, never here.

A Meteora launch curve (`curve`, the graduation kind) needs no entry to be named: the site reads its token's ticker
from the token's own metadata and shows it with the pool's last four characters, `$TEST (…7Dny)`, or `Token (…7Dny)`
when the ticker is missing, unprintable, longer than 10 characters or claims a reserved one: SOL, wrapped SOL, BROT
and the dollar tokens (`RESERVED_TICKERS` in `packages/sdk/src/read/chain/token-symbol.ts`; the A-11 exception, TP
§3.4.10). A reviewed entry drops the suffix: the title then reads `$BROT` alone, so review only a pool
whose token the team knows.

1. Read the account on an explorer: its owner is the kind's program (SPL Token for a burn, Meteora DAMM v2 for a lock,
   SPL Stake Pool for a stake pool, Vote for a validator, Meteora DBC for a curve), and the name is the one its own
   project publishes (for a curve, the token's ticker with its `$`).
2. Add one entry to `account-names.json`:

   ```json
   { "address": "<base58 address>", "kind": "burn", "name": "<short public name>" }
   ```

   `kind` is `burn`, `lock`, `pool`, `stake` or `curve`; `name` is 1 to 32 plain characters (letters, digits, spaces,
   `.`, `$`, `-`, `/`, and a `$` may come first), never a link, an @handle or a person. The second reviewer confirms
   the name is a project's or an organization's: a validator named after a person stays unnamed, since Git keeps every
   name for good and the code cannot tell a person's name from a project's (the Sprint 08 legal review).

3. Open a pull request; a second person reviews the address and the name; merge; build and deploy the site.
