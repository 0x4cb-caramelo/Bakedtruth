---
title: Market types
description: The five kinds of market Brot Markets opens, what each one reads on Solana, who could push its result, and what stays out on purpose.
---

# Market types

> **In one bite:** five kinds of question, each with its answer already written on-chain. If we can't read it, we
> don't list it.

Each market type has a reader: a piece of the program that opens one kind of Solana account, reads one number and
answers YES or NO. No reader, no market type.

## The five types

| Type | What it asks | Example | Who could push the result |
|---|---|---|---|
| **Price** | Does a large asset's price touch a target before the end date? | "Does SOL touch $300 by Dec 31?" | Nobody. It's the whole market for that asset |
| **Burn** | Does a token's total supply fall to a number? | "Does the supply of token T fall to 900M by the 30th?" | Whoever holds the token and burns it. It costs them the tokens |
| **Locked liquidity** | Does a Meteora pool have at least X locked forever? | "Does the T/SOL pool reach X locked liquidity by the 30th?" | Whoever adds liquidity and locks it. The money stays locked |
| **Stake pool size** | Does a stake pool hold at least X SOL at the start of an epoch? | "Does JitoSOL start epoch E with X SOL or more?" | Whoever deposits. The money has to stay through the epoch change |
| **Validator stake** | Does a validator have at least X SOL staked with it in an epoch? | "Does validator V enter epoch E with X SOL or more?" | Whoever stakes with it before the epoch changes |

A few words, if you're new to Solana:

- **Supply** is the total amount of a token. A **burn** destroys tokens forever.
- **Locked liquidity** is money put into a trading pool and locked there for good. Meteora is one of Solana's pool
  platforms.
- A **validator** is a computer that confirms the network's transactions. **Stake** is the SOL people entrust to it.
  A **stake pool** gathers many people's SOL and spreads it across validators.
- An **epoch** is Solana's "day" for stake. It lasts about two days.

## Notes on each type

**Price markets** read Pyth, an oracle where exchanges and market makers publish signed prices that the program checks
on-chain. They're "touch" markets: YES if the price reaches the target at any moment before the end. Every entry
needs a fresh price, so nobody can enter after the price has already touched. On 4 October 2026, Pyth had 1,881 price
feeds, 423 of them crypto.

**Epoch markets** (stake pool size and validator stake) are read when an epoch begins, and the window to read them
lasts about two days.

**Projects can push their own results, and that's the point.** A project that promises a burn controls whether it
happens. That's what it's putting money behind. Markets where the opener may control the result carry a warning:
"The person who opened this market may control the result and may have picked a side."

## What stays out, and why

**Anything a single key decides for free.** A key is the permission that gives someone power over a token or a
program: to mint new tokens, freeze wallets or change code. Giving that power up forever is called renouncing. A
market on a renunciation would let the key holder enter early from another wallet, flip the switch and collect, at no
risk. So renunciations of minting or freezing, immutable programs and immutable metadata are all out.

**Small tokens' prices, for now.** In a small pool, the price is just the ratio of two reserves, and someone can move
it for an instant with money borrowed and repaid in the same transaction. It has happened on Solana: in the Mango
case, in October 2022, between $114 and $116 million was taken (SEC and CFTC complaints). Price markets start with
assets that have an oracle price. Tokens with a pool on Raydium or Meteora come later, through the average price over
a period of time.

**Token-2022 and locked tokens, at first.** Solana has two token programs, the classic one and the newer Token-2022.
Burn markets start with classic tokens only. Newer tokens, which include recent pump.fun launches, come later, with a
reader reviewed on its own.

**Opinion, by design.** Politics, geopolitics and anything that needs someone to say what happened. There are no
opinion markets on Brot.

**Sports, in phase 2.** A match result isn't born on-chain: someone has to publish it. We'd rather build an oracle
for it than borrow someone's word.
