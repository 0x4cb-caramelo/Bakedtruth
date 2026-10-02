# pred-provable

[![CI](https://github.com/0xcf02/pred-provable/actions/workflows/ci.yml/badge.svg)](https://github.com/0xcf02/pred-provable/actions/workflows/ci.yml)

**Provable KPI Markets on Solana.** Resolution is a read, not a judgement.

A sponsor posts a bounty on an on-chain goal by selling YES outcome tokens below their payout. Doers buy YES and then
go move the metric. When the goal is met, anyone can resolve the market by reading the target account on-chain, and each
YES token redeems for its full face value in USDC. There are no oracles, no indexers, no committee and no dispute
window: the transaction that sees the goal met settles the market.

Markets on cheap-to-move metrics turn into bounties for manipulation. This protocol leans into that: moving the metric
is the product. To keep it honest, every resolver reads state that flash capital cannot fake.

## Resolvers

| Kind | Reads | YES when | Why it can't be faked |
| --- | --- | --- | --- |
| `SupplyAtMost` | SPL Token mint | `supply <= threshold` by `deadline_slot` | Mint authority must be revoked, so supply only goes down |
| `Immutable` | Loader-v3 ProgramData | Upgrade authority revoked by `deadline_slot` | Revoking an upgrade authority is one-way |
| `StakeAtLeast { epoch }` | Vote account, via `sol_get_epoch_stake` (SIMD-0133) | Stake in `epoch` `>= threshold` | Stake is fixed per epoch and needs an epoch to activate |
| `MintAuthorityRevoked` | SPL Token mint | Mint authority revoked by `deadline_slot` | A revoked mint authority can never be set again |
| `FreezeAuthorityRevoked` | SPL Token mint | Freeze authority revoked by `deadline_slot` | A revoked freeze authority can never be set again |
| `LockedAtLeast` | The incinerator's associated token account for the mint | Balance `>= threshold` by `deadline_slot` | Nobody holds the incinerator's key, so locked tokens (e.g. LP) can never leave |

The set is a closed enum on purpose: each variant checks the owner and layout of the account it reads, and the account
is locked into the market at creation.

## Outcome tokens

Each market has a YES mint and a NO mint (classic SPL Token, 6 decimals like USDC, minted only by the market PDA, no
freeze authority) and a USDC vault: a token account owned by the market PDA at the address `["vault", market]`. The
sponsor sets a YES price `p` in basis points and deposits a USDC budget. Every sale mints a fully backed pair:

| | Pays | Receives |
| --- | --- | --- |
| Buyer | `p` per YES (rounded up) | 1 YES |
| Sponsor's budget | the rest, `1 - p` | 1 NO |

So every YES/NO pair is backed 1:1 by USDC in the vault (one USDC base unit per outcome-token base unit). If YES
wins, YES holders redeem 1:1 and the sponsor's bounty is `1 - p` per token. If NO wins, the sponsor redeems NO and gets
everything back, including what buyers paid. Doers know their payout before they buy, and the tokens trade like any SPL
token: no position accounts, no pro-rata dilution.

The sponsor's budget caps the subsidized sale, not the market. Anyone can deposit USDC to mint unsubsidized YES/NO pairs
at 1:1 and burn them back before resolution. A pair is worth its collateral whichever side wins, so minting carries no
outcome risk: speculators and market makers keep the side they believe in and sell the other on any SPL market. That is
also how anyone other than the sponsor takes the NO side.

Collateral is pinned to USDC by `USDC_MINT` (exported in the IDL): Circle's devnet USDC
(`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`, from [faucet.circle.com](https://faucet.circle.com)) by default, or
mainnet USDC when built with `--features mainnet`. The minimum budget, YES purchase, pair mint and first pool deposit is
1 USDC.

## Guarded pool

Each market can have a constant-product pool of YES against NO, owned by the program. It applies the same check as the
sale: trading stops at `cutoff_slot`, the moment a goal is visibly met, or when the measured stake epoch starts. An
external AMM cannot read the metric, so once a goal is met the first transaction would buy every underpriced YES from
its liquidity providers. Here that transaction reverts. Providers can always withdraw, including after resolution.
Swaps pay a 1% fee to providers, and reserves are tracked in the market account, so tokens sent to the pool by hand
cannot move its price.

With `mint_pair` and `burn_pair`, every trade is a single transaction:

| Trade | Instructions |
| --- | --- |
| Buy YES with USDC | `mint_pair(x)` + `swap(NO in, x)` |
| Buy NO with USDC | `mint_pair(x)` + `swap(YES in, x)` |
| Sell YES for USDC | `swap(YES in, s)` + `burn_pair(q - s)`, with the split `s` computed client-side |
| Seed at YES price `p` | `mint_pair(L)` + `add_liquidity(L, L * p / (1 - p))`: YES costs `pool_no / (pool_yes + pool_no)` |

YES and NO are still standard SPL tokens, so anyone can list them on Raydium or Meteora. Those pools are unguarded:
their creators cannot pause them, so their liquidity providers carry the risk of being sniped.

## Market lifecycle

1. `create_market`: the sponsor locks the target, threshold, schedule and YES price, creates the outcome mints and the
   USDC vault, and deposits the budget.
2. `buy_yes`: buy YES at the fixed price before `cutoff_slot`, while the budget lasts. Purchases revert once the goal
   is visibly met (anti-sniping).
3. `mint_pair` / `burn_pair`: anyone, until resolution. Deposit USDC for the same number of YES and NO tokens, or
   burn equal YES and NO to get the USDC back. Never touches the sponsor's budget.
4. `add_liquidity` / `swap` / `remove_liquidity`: the guarded pool. Adding and swapping stop with the sale; removing
   is always open.
5. `resolve`: permissionless, top-level only (no CPI) and final in one instruction. Every goal except stake (burn,
   renounce, lock, immutability) resolves YES as soon as it is met; past `deadline_slot` the market resolves NO.
6. `redeem`: burn the winning token for USDC, 1:1. The emptied token account is closed and its rent refunded.
7. `withdraw_budget`: once the sale is closed (cutoff passed or market resolved), the sponsor takes back the unspent
   budget. It stays locked while the sale is open, so the bounty cannot be pulled from under doers.

## Stack

| Layer | Tooling |
| --- | --- |
| Program | Anchor 1.1.2, Solana CLI 3.1.10, Rust 1.89 |
| Tests | `bun test` + LiteSVM (`@solana/kit-plugin-litesvm`), `anchor-litesvm` for Rust |
| Client | `@anchor-lang/core`, `@solana/web3.js` |
| App | Next.js (App Router), Tailwind CSS, Solana wallet-adapter |
| Package manager | Bun workspaces |

## Getting started

Prerequisites: Rust, Solana CLI 3.1.x, Anchor CLI 1.1.2 (`avm install 1.1.2`) and Bun.

```bash
bun install
bun run build:program   # anchor build + copy the IDL into app/lib/idl
```

Run the tests:

```bash
NO_DNA=1 anchor test    # TypeScript suite on LiteSVM (no validator needed)
bun run test:rust       # Rust suite with anchor-litesvm
```

Run the app:

```bash
cp app/.env.example app/.env.local
bun run dev
```

## Repository layout

```
programs/pred-provable/   Anchor program
  src/resolver.rs         typed metric readers
  src/instructions/       create_market, buy_yes, mint_pair, burn_pair, add_liquidity, swap,
                          remove_liquidity, resolve, redeem, withdraw_budget
  src/outcome.rs          market-signed minting and transfers of outcome and LP tokens, USDC vault deposits and payouts
  tests/                  Rust tests (anchor-litesvm)
tests/                    TypeScript tests (bun test + LiteSVM)
app/                      Next.js frontend
```

## Status

Hackathon MVP targeting devnet. Not audited; do not use with real funds.

## License

[MIT](LICENSE) © Ronaldo Pereira
