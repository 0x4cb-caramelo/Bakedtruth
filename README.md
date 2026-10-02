# pred-provable

**Provable KPI Markets on Solana.** Resolution is a read, not a judgement.

A sponsor posts a bounty on an on-chain goal by taking the NO side of a pari-mutuel market. Doers back YES and then go
move the metric. When the goal is met, anyone can resolve the market by reading the target account on-chain. There are no
oracles, no indexers and no committee.

Markets on cheap-to-move metrics turn into bounties for manipulation. This protocol leans into that: moving the metric
is the product. To keep it honest, every resolver reads state that flash capital cannot fake.

## Resolvers

| Kind | Reads | YES when | Why it can't be faked |
| --- | --- | --- | --- |
| `SupplyAtMost` | SPL Token mint | `supply <= threshold` by `deadline_slot` | Mint authority must be revoked, so supply only goes down |
| `Immutable` | Loader-v3 ProgramData | Upgrade authority revoked by `deadline_slot` | Revoking an upgrade authority is one-way |
| `StakeAtLeast { epoch }` | Vote account, via `sol_get_epoch_stake` (SIMD-0133) | Stake in `epoch` `>= threshold` | Stake is fixed per epoch and needs an epoch to activate |

The set is a closed enum on purpose: each variant checks the owner and layout of the account it reads, and the account
is locked into the market at creation.

## Market lifecycle

1. `create_market`: the sponsor locks the target, threshold and schedule, and deposits the NO bounty.
2. `place_bet`: stake YES or NO before `cutoff_slot`. Bets revert once the goal is visibly met (anti-sniping).
3. `resolve`: permissionless and top-level only (no CPI). Burn and immutability goals resolve YES as soon as they are
   met; past `deadline_slot` the market resolves NO.
4. `claim`: winners split the whole pot pro rata. If nobody backed the winning side, everyone is refunded.

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
  src/instructions/       create_market, place_bet, resolve, claim
  tests/                  Rust tests (anchor-litesvm)
tests/                    TypeScript tests (bun test + LiteSVM)
app/                      Next.js frontend
```

## Status

Hackathon MVP targeting devnet. Not audited; do not use with real funds.

## License

[MIT](LICENSE) © Ronaldo Pereira
