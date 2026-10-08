---
title: How a market is decided
description: The program reads a Solana account and records YES or NO. Then a 6-hour window, a two-step dispute if needed, and automatic payouts.
---

# How a market is decided

> **In one bite:** the program reads, a human can only say "that's wrong", and nobody can flip a result.

## The reading

1. Every market points at a Solana account from the moment it opens: a token's supply, a pool's state, a signed
   price.
2. At resolution, the program opens that account, reads the number and compares it with the target.
3. If the target was met, it records YES. If the end date passed without it, it records NO.

**Who triggers the reading.** A scheduled service checks every minute whether any market can be resolved. A second
service, run with a different provider, watches the first every 5 minutes, tries to restart it if it stops, and takes
over if it can't. There's no public "resolve" button, because the result doesn't depend on who presses it.

**Why the service can't miss.** The program can't tell, after the fact, on which day a target was met. If a burn
happens on the 10th and nothing reads it, by the 30th the market would end in NO, and the people who were right would
lose. That's why there are two services, and behind them the review window and annulment.

## The 6-hour window

After the reading, payouts wait 6 hours. In that window our team can do two things, and only two:

- **Confirm** the result, and payouts go out.
- **Annul** the market, and everyone gets back what they put in.

Nobody can switch YES and NO. If nobody acts, payouts go out on their own when the 6 hours end, so your money never
depends on someone on our team being awake. Every annulment is recorded with its reason.

## If a result looks wrong

Tell us, on X, at [@brotmarkets](https://x.com/brotmarkets). Today only our team can open a dispute, and a dispute
pauses the payout. It has two steps and no token vote, because token votes are exactly where results get bought.

| Step | What happens | How long |
|---|---|---|
| **Second source** | The same data is read again through an independent path. If it matches, payouts go out. If not, it moves up | Up to 1 hour |
| **Human review** | Three team members look at it, and two of three decide. They can still only confirm or annul, and the reason is published | Up to 48 hours |

In the worst case, payouts go out 55 hours after the result. Later, any wallet that entered a market will be able to
open a dispute, with a deposit.

## When a market is annulled

A market is annulled when:

- the account it reads can no longer be read;
- our services missed the reading;
- or the review finds the reading was wrong.

An annulled market refunds everyone exactly what they put in, with no fee. A half-baked market gets thrown out, not
sold.

## Check it yourself

Every market names the account it reads, and that account is fixed when the market opens. Open it in any Solana
explorer and you'll see the same number the program saw. Same account, same answer.
