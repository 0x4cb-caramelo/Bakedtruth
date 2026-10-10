---
title: Why the chain decides
description: Every prediction market needs someone to say what happened. Brot Markets only lists questions whose answer is already stored on Solana.
---

# Why the chain decides

> **In one bite:** every prediction market needs a witness. We picked the one that can't be talked into anything.

Every prediction market has to answer one question at the end: what happened? Someone, or something, has to say it,
and that's where markets break.

| Platform | Who says what happened |
|---|---|
| Polymarket | Holders of a token vote when a result is disputed. Disputes take 4 to 6 days |
| World, inside Phantom | One company key writes the result |
| PNP | Two language models decide |

In March 2025, a Polymarket market worth $7 million settled as YES on an event that never happened.

Sources: Polymarket documentation; Chainstack Labs on World; PNP documentation; CoinDesk and Cointelegraph, March
2025.

## Our answer: read it, don't ask it

Every Brot market points at a Solana account from the moment it opens: a token's supply, a pool's locked liquidity,
a signed price. At the end, the program opens that account, reads the number and compares it with the target. If the
target was met, the result is YES. If the end date passed without it, the result is NO. Nobody reports anything.

The result comes from the data, not from whoever triggered the reading. Anyone can open the same account and see the
same number. [How a market is decided](../how-it-works/how-a-market-is-decided.md) walks through it step by step.

## What it costs us

We can only list what the chain records. No elections, no sports, no "will this person tweet". The questions we
can't list are exactly the ones where someone has to be trusted, so it's a trade we're happy with.

## Where people still show up

We'd rather say it than have you find it. After the program reads a result, our team has a 6-hour window in which it
can only **confirm** the result or **annul** the market, which refunds everyone. It can never switch YES and NO. The
team can also pause the program, and a pause never blocks a payout or a refund.

No human picks the winner. Humans can only stop a wrong result from being paid.
