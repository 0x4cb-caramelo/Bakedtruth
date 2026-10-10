# Who can do what

Every key that can act on the Brot Markets program, what it can do, and the limit written in the program's code. Keys
are named by role and address, never by person. Checked against the devnet program on 2026-10-10.

Program: `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`, on Solana devnet.

## The keys on devnet

| Role              | Address                                        | Held by                                            |
| ----------------- | ---------------------------------------------- | -------------------------------------------------- |
| Upgrade authority | `6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq` | A co-founder's devnet key                          |
| Admin             | `6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq` | The same key                                       |
| Fee recipient     | `6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq` | The same key                                       |
| Team key          | `3EgrFsDDBks8zG31rquNvtP1BR91BVArypwtiBg6XwMz` | A co-founder's team key; one team key is set today |

Brot's service, the keeper, holds no key with a power over the program. Its wallet holds SOL only to pay network fees,
and it asks the program to read results, as any wallet can.

## Every power and its limit

| Power                                                | Who                   | Limit in the program's code                                                                                                                                                                                                                                       |
| ---------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Replace the program                                  | The upgrade authority | On devnet, at any time and with no waiting period. A replaced program could do what this table rules out.                                                                                                                                                         |
| Open a campaign, paying                              | Any wallet            | US$500 in SOL at the Pyth SOL/USD price; the kinds this build opens (four today: price, burn, locked liquidity and stake pool; validator stake waits for its first devnet proof); an account the program's reader accepts; 3 to 90 days; fees set by the program. |
| Open a campaign without paying                       | One team key          | For the team or a launch partner: no prize and no creator share.                                                                                                                                                                                                  |
| Confirm a result in review                           | One team key          | Only while the campaign is in review, inside its 6-hour window. It never changes a YES or a NO.                                                                                                                                                                   |
| Void a campaign                                      | One team key          | Only a campaign the program already voided by itself (a missed reading, an unreadable account, a stale price feed), inside its 6-hour window; never a YES or a NO. Every team void is in the public record, with its reason.                                      |
| Open a contest                                       | Nobody yet            | The program refuses it until the dispute's second stage is built.                                                                                                                                                                                                 |
| Pause new entries and openings                       | One team key          | Never results, reviews, payouts or refunds.                                                                                                                                                                                                                       |
| Resume after a pause                                 | The admin             |                                                                                                                                                                                                                                                                   |
| Change the creation parameters                       | The admin             | New campaigns only, within ceilings written in the code. An open campaign's fees never change.                                                                                                                                                                    |
| Change the team keys, the fee recipient or the admin | The admin             | A new admin takes over in two steps.                                                                                                                                                                                                                              |
| Resolve, settle and pay                              | Any wallet            | Chooses nothing: the result comes from the account read, and every amount and destination from the program.                                                                                                                                                       |
| Move Brot's fees                                     | Any wallet            | Only to the fee recipient.                                                                                                                                                                                                                                        |
| Move or take a baker's entry                         | Nobody                | No instruction does it, and there is no emergency withdrawal. The upgrade authority could still replace the program (first row).                                                                                                                                  |

## On mainnet, later

Before real money, the upgrade authority, the admin and the fee recipient move to a 2-of-3 multisig on hardware
devices, and an upgrade waits 24 to 48 hours in public before it takes effect. This page changes with them.
