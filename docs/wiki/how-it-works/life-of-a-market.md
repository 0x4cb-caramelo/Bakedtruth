---
title: Life of a market
description: The five states of a Brot market, from open to paid, and why entries close before the end.
---

# Life of a market

> **In one bite:** open, closed, in review, paid. And if something went wrong, annulled, with everyone refunded.

A market is a YES or NO question, an end date and a rule for deciding it, all fixed when it opens. For example: "Does
the supply of token T fall to 900 million by the 30th?"

## The five states

| State | What happens |
|---|---|
| **Open** | Takes entries on both sides |
| **Closed** | Entries have stopped. The market waits for the event or the end date |
| **In review** | The program has read the chain and recorded YES or NO. Our team has 6 hours to confirm or annul |
| **Paid** | The money has gone to the wallets of the people who were right |
| **Annulled** | The market couldn't be decided. Everyone gets back exactly what they put in |

## Opening

Whoever opens a market picks a type from the [five market types](../market-types.md), the Solana account to read,
the target and the end date. Markets last 3 to 90 days. The program checks on the spot that the account fits the type,
and if it doesn't, the market doesn't open.

There's no free text. The app writes the question from what was picked, so the words people read and the number the
program checks are always the same thing.

## Why entries close before the end

On an exchange, buying late is expensive. In a pot there's no price, so someone who walks in at the last minute gets
the same return as someone who took the risk from day one, and dilutes them.

An example. A pot has 500 on YES and 500 on NO. An hour is left, the event hasn't happened, and NO is almost certain.
The people on NO since the start would get 1.90 for every 1 USDC. Then someone puts 5,000 on NO. If NO wins, they take
home 409 of almost riskless profit, and everyone who was on NO from the start now gets 1.08.

So **entries close when 5% of the market's time is left**, never less than 24 hours and never more than 7 days before
the end.

| Market length | Entries close on day | Days without entries at the end |
|---|---|---|
| 3 days | 2 | 1 |
| 7 days | 6 | 1 |
| 30 days | 28.5 | 1.5 |
| 60 days | 57 | 3 |
| 90 days | 85.5 | 4.5 |

For events that can't be undone, like a burn, entries also stop the moment the event happens.

## Ending early

A market can end before its end date. If the burn it asks about happens on the 10th, the market resolves on the 10th.
What happens next is in [How a market is decided](how-a-market-is-decided.md).
