---
title: The pot
description: How a Brot market's money works. Everyone's USDC goes into one pot, the people who were right split it, and the fee is 10% of the losing side.
---

# The pot

> **In one bite:** everyone's money goes into one pot, and whoever was right splits it. We take a slice of the losing
> side, never of the winners' stake.

Each market has one pot, in USDC, a digital dollar worth $1 (on devnet, test USDC worth nothing). You put USDC on YES
or on NO, as many times as you like. Each entry is recorded under your wallet. There are no YES or NO tokens and no
price when you enter.

When the market ends, the people who were right get their entry back plus a share of the losing side, in proportion
to what each one put in. The prize for being right is the money of the people who were wrong.

## An example

600 USDC on YES, 400 on NO. The market resolves YES.

| | USDC |
|---|---|
| The losing side | 400 |
| Our fee: 10% of the losing side | 40 |
| The share of whoever opened the market | 10 |
| Left for the people who were right | 950 |

Every 1 USDC on YES gets back 950 ÷ 600 = 1.583. Put in 60, get 95.

The opener's share is set out in the [Terms of Service](https://brot.markets/terms), section 7. Its fine print is
still being written, and this page will follow it.

## Why the fee comes from the losing side

There's no price in a pot, so we can't charge a little on every trade the way order-book markets do. Charging on the
whole pot would eat the winners' gain when nearly all the money sits on the winning side. So we charge on what the
winners win: 10% of the losing side.

With V on the winning side and P on the losing side, our fee is 0.10 × P, and every 1 USDC on the winning side gets
back (V + 0.90 × P) ÷ V. In a 1,000 USDC pot, before the opener's share:

| Share of the pot on the winning side | Our fee | Every 1 USDC gets back |
|---|---|---|
| 30% (the smaller side wins) | 70 | 3.100 |
| 50% | 50 | 1.900 |
| 60% | 40 | 1.600 |
| 90% | 10 | 1.100 |
| 99% | 1 | 1.009 |

With our fee alone, whoever is right always gets back more than they put in, even with 99% of the pot on their side.

## The odds are an estimate

The odds on screen are each side's share of the pot. They are not a price, and nothing guarantees them.

Take a pot with 300 on YES and 700 on NO. The screen shows YES at 30%, and if YES wins, every 1 USDC on YES gets back
3.10. Then someone puts another 700 on YES. If YES wins now, every 1 USDC on YES gets back 1.63. Whoever entered at
3.10 was never promised 3.10.

So the return is only final when entries close, and the app always calls it an estimate, with the fee and the
opener's share already taken off. One more thing follows: **a big entry lowers its own side's return.** A pot with
5,000 on each side pays 1.90. Add 10,000 on YES and, if YES wins, it pays 1.30.

## When nobody takes the other side

If only one side gets entries, there's no losing side to pay the winners, so everyone gets their entry back,
whatever the result. The first wallet in pays nothing, and everyone after pays 1% of their entry.

| Wallet | Put in | Fee | Gets back |
|---|---|---|---|
| The first | 100 | 0 | 100 |
| The second | 200 | 2 | 198 |
| The third | 300 | 3 | 297 |

The first wallet is free because charging it would punish the person every new market needs most.

## Getting paid

- **Payouts are automatic** once the [review window](how-a-market-is-decided.md) is over. There's no claim button.
  We pay the network fee for each transfer.
- **Our service can't choose** who gets paid or how much. The amounts come from the recorded entries and the recorded
  result. If the service stops, payouts are late, never lost: the money stays in the market's vault.
- **If you closed your USDC account** after entering, the transfer fails and your share waits in your name.
- **There's no early exit.** Your money stays in until the market ends. Leaving early is planned for a later phase.
