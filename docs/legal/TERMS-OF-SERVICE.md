# Terms of Service

**Brot Markets** · Draft 0.1 · 8 October 2026 · Not in force yet: waiting for legal review.

Hi. These are the rules for using Brot Markets. We wrote them to be read, which is rare in this genre. Every section
starts with **the crumb**, a one-line summary from Baked, our bread roll. Baked is grumpy and honest. The crumb helps
you read; the text under it is the rule.

## The whole thing in 30 seconds

1. You connect your own wallet. We never hold your keys, and we can't move your money.
2. Each market is a YES or NO question that the blockchain can answer. A program reads the answer from a Solana
   account. Nobody votes, and no judge picks the winner.
3. You put USDC on a side. When the market ends, the people who were right split the pot.
4. We keep 10% of the losing side. If you were right, you get your money back plus your share of the rest.
5. Money you put in stays in the market until it ends. There is no early exit.
6. Right now everything runs on Solana devnet with test USDC, which is worth nothing. The program is not audited.
7. You can lose everything you put into a market. Only put in what you can afford to lose.

## 1. Who we are

> **The crumb:** a few bakers, one oven, no company yet. We'll tell you when there is one.

"Brot Markets", "we" and "us" mean the people who build and run brot.markets: Bernardo Nery, Lucas Galvão and
Ronaldo Pereira. A company is being set up. When it exists, these terms will name it as **[COMPANY NAME, COUNTRY]**,
and that company will take our place in this agreement.

"You" means anyone who visits the site, connects a wallet, opens a market, or puts money into one.

You accept these terms when you connect a wallet to Brot Markets or sign a transaction through it. If you don't
agree, don't connect, and Baked won't take it personally. He might pretend to, though.

## 2. Who can use Brot Markets

> **The crumb:** adults only, and only where it's legal for you.

You can use Brot Markets only if all of these are true:

- You are at least 18, or the age of majority where you live, whichever is higher.
- Prediction markets are legal where you live and where you are when you use them. Checking that is your job.
- You are not in, and don't live in, a country or region on our restricted list: **[RESTRICTED LIST: to be set by the
  legal review]**. We may add places to the list at any time, and the site may block them.
- You are not on any sanctions list, and you are not acting for someone who is.
- You don't use a VPN or any other trick to get around a block.

## 3. Your wallet is yours

> **The crumb:** your keys, your money, your problem if you lose them. Sorry.

To use Brot Markets you connect a self-custody wallet, like Phantom. We don't create accounts, and we don't ask for
your name or ID.

- We never see, hold or recover your private keys or seed phrase. If you lose them, nobody can get them back, us
  included.
- Every transaction is signed by you, in your wallet. Read what you sign.
- Solana network fees are yours to pay when you sign a transaction.

## 4. How a market works

> **The crumb:** a question, a pot, and a program that reads the answer.

**The question.** Each market asks a YES or NO question about something recorded on Solana, with an end date and a
target. For example: "Will SOL touch $300 by 31 December?" or "Will token T's supply drop to 900 million by the 30th?"
At launch, only five kinds of question exist:

| Kind | What the program reads |
|---|---|
| Large-asset price | The asset's price from the Pyth oracle. YES if the price **touches** the target at any moment before the end date |
| Token burn | The token's total supply |
| Locked liquidity on Meteora | How much liquidity a pool has locked forever |
| Stake pool size | How much SOL a stake pool holds at the start of an epoch |
| Validator stake | How much SOL is staked with a validator in an epoch |

Markets about opinions, politics, sports or anything that needs a person to say what happened don't exist here. If the
chain can't answer it, the oven stays off.

**Your entry.** You put USDC on YES or on NO, as many times as you like, until entries close. Your entries are
recorded in your wallet's name.

**Entries close before the end.** Entries close when 5% of the market's duration is left. That's at least 24 hours
before the end and never more than 7 days before it. In a market about something that can't be undone, like a burn,
entries also close the moment it happens. Markets last between 3 and 90 days.

**Odds are an estimate.** The chance shown for each side is the share of the pot on that side. It is not a
probability, and the estimated return is not a promise. Every new entry changes it, and it only becomes final when
entries close. A big entry lowers the return of its own side.

**No early exit.** Once your money is in, it stays in until the market pays out, refunds or is annulled.

## 5. How a market is decided

> **The crumb:** the program reads, a human can only say "wait, that's wrong", and nobody can flip a result.

1. **The program reads the account.** Our scheduled service checks every minute whether a market can be decided.
   When it can, it asks the program to read the account and compare the number with the target. If the target was
   met, the result is YES. If the end date passes without it, the result is NO. Anyone can open the same account and
   see the same number.
2. **A market can end early.** If the target is met before the end date, the market is decided then.
3. **A 6-hour review window.** After a result is recorded, payouts wait 6 hours. In that window a member of our team
   can **confirm** the result or **annul** the market. Nobody, including us, can switch YES to NO or NO to YES. If
   nobody does anything, payouts go out on their own when the 6 hours end.
4. **Disputes.** If something looks wrong, tell us in public (see section 13). Our team can pause the payout and start
   a dispute within the 6 hours. First, the same data is read again through an independent route, which takes up to 1
   hour. If the two readings disagree, three team members review it, and two of them must agree. This takes up to 48
   hours, and the reason is published. A dispute can only end in confirm or annul. In the worst case, payouts go out
   55 hours after the result.

**Missed deadlines count as NO.** The program can't tell, after the fact, on which day a target was met. If our
service fails and the end date passes, the recorded result is NO. That is exactly what the review window is for: if a
result is wrong because something on our side broke, the market is annulled and everyone gets their money back.

**When a market is annulled.** We annul a market when the account it reads can no longer be read, when our service
missed the reading, or when the review finds the reading was wrong. A half-baked market gets thrown out, not sold.

## 6. Money: fees, payouts and refunds

> **The crumb:** we only take a slice of the losing side. Never from the winners' stake.

**Our fee: 10% of the losing side.** When a market is decided, we keep 10% of the money on the side that lost. Everything
else goes to the people who were right, split by how much each one put in.

Example: a pot has 600 USDC on the side that won and 400 on the side that lost. Our fee is 40 (10% of 400). The
person who opened the market gets 10 (section 7). The remaining 950 is split among the winners: someone who put in
60 gets 95. The prize from the seed (section 7) is left out here to keep the numbers simple; when there is one, it is
added to the winners' share and nobody takes a fee from it.

**One-sided pot.** If only one side got any entries, there is nobody to pay the winners, so everyone gets their entry
back. The first wallet that entered pays nothing. Every wallet after it pays 1% of what it put in.

**Annulled market.** Everyone gets back exactly what they put in. No fee.

**Automatic payouts.** After the review window, our service sends each wallet its share. There is no claim button.
The service can't choose who gets paid or how much: the amounts come from the recorded entries and the result. If the
service stops, payouts are late, and the money waits in the market's vault. If your USDC token account is closed when
we pay, the payment fails and the amount is kept in your name until you can receive it.

**Taxes.** Whatever taxes apply where you live are your business. We don't send tax reports.

## 7. Opening a market

> **The crumb:** anyone can open one. You bring the dough, we bring the oven.

**Anyone can open a market**, within the five kinds in section 4. To open one, you choose the kind, the Solana account
to be read, the target and the end date, and you put in a **seed of at least 500 USDC**.

- **90% of the seed becomes prize money** in the pot. It doesn't pick a side: whoever wins gets it.
- **10% of the seed is our opening fee.**
- **You earn 1% of the market's volume**, paid to your wallet with the payouts. **[TO CONFIRM: volume or pot, and
  whether there is a cap so winners never get back less than they put in.]**
- If the market ends one-sided or is annulled, the prize part of the seed goes back to you. You don't earn the 1%.
  **[TO CONFIRM: whether the 10% opening fee comes back when a market is annulled because something on our side broke.]**

**The site writes the question, not you.** The program checks the account when the market is opened and refuses it if
the account doesn't fit the kind. The question is built from the kind, the account, the target and the date, so what
people read is exactly what the program will check.

**If you can move the result, everyone will know you might.** Some markets are about things the person opening them
controls, like a project's own burn. That's the point of Brot Markets: a project puts its promise on the line. In kinds
where the result can be pushed, every market shows this warning: "The person who opened this market may control the
result and may have picked a side." You may open and fund a market about your own project. You may not hide that the
market is yours or lie about it.

**Our team can open markets too**, under the same rules. **[TO CONFIRM: whether the team keeps the 1%.]**

## 8. Things you may not do

> **The crumb:** don't poison the dough.

You may not:

- Attack, overload or try to break the site, the program or the services that run it.
- Use a bug you found. Report it to us instead, and we'll thank you properly.
- Tamper with an account or data source a market reads, except by doing the very thing the market asks about in the
  open. Burning your tokens for a burn market is fine. Attacking the price feed is not.
- Trade on information that was stolen, or that you promised to keep secret.
- Enter on both sides, or move money between your own wallets, just to inflate a market's volume.
- Use Brot Markets for money laundering, terrorist financing, dodging sanctions, or any fraud.
- Pretend to be another project, or open a market using a brand that isn't yours in a way that misleads people.
- Use someone else's wallet without permission.

If we see any of this, we may stop showing you the site and report it to the authorities. We can't take money that is
already in a market (see section 9).

## 9. What we control, and what we don't

> **The crumb:** we can turn the oven off. We can't eat your bread.

We say what power we have, because "trust us" isn't a business model.

| Power | Who has it | Its limit |
|---|---|---|
| Change the program's code | Today, two team members on devnet. On mainnet, a wallet that needs 2 of 3 founders' signatures | On mainnet, every change is announced and waits a public delay before it takes effect |
| Confirm or annul a result | One team key | It can never flip a result. Every annulment is recorded, with the reason |
| Pause markets | One team key, so it can act fast | A pause never blocks payouts or refunds |
| Change the fee | Nobody, while a market is open | The fee has a fixed ceiling in the program |
| Send payouts | Our scheduled service | It can't choose who gets paid or how much |

We can also block parts of the site, or the whole site, for some places or some wallets, and we can shut the site
down. We'll give as much notice as we can.

## 10. Risks you take

> **The crumb:** this is new technology and real risk. Baked has seen things.

- **You can lose all the money you put in a market.** That's how prediction markets work.
- **The program has not been audited yet.** On devnet, it runs with test money. We will only open with real money
  after an audit, a 2-of-3 founders' wallet and a cap on how much the whole platform can hold.
- **Programs have bugs.** A bug can lock or lose money, even after an audit.
- **Data sources can fail.** An oracle, a pool or a stake account can stop working or be manipulated. That's why some
  kinds of markets stay off the menu.
- **Our services can fail.** A late or missed reading can end in a wrong NO. The review window and annulment exist
  for this, but they depend on us noticing.
- **USDC is issued by a company**, Circle, which can freeze it. A stablecoin can lose its dollar value.
- **Solana can slow down, stop or fork.** We don't control it.
- **The law is changing fast**, and a change could force us to close the site or block your country, even with
  markets open. If we must stop, we'll annul open markets and refund, if the program still lets us.

## 11. Our responsibility

> **The crumb:** we'll own our mistakes. We can't insure the blockchain.

We run Brot Markets carefully, but we provide it "as is". We don't promise it will always work or be free of errors.

We're not responsible for losses caused by your wallet, your keys, your choices in a market, Solana, Pyth, Circle,
your internet, or any other service we don't control.

Where the law allows, our total liability to you for anything related to Brot Markets is limited to
**[LIMIT: to be set by the legal review, for example the fees you paid us in the 12 months before the claim]**. Nothing
here limits liability that the law where you live doesn't allow us to limit.

We don't give financial, investment, legal or tax advice. Market pages, the odds, the docs, our posts and Baked's
opinions are not advice. Especially Baked's.

## 12. Changes to these terms

> **The crumb:** we may change the recipe. Never for a market that's already in the oven.

We may update these terms. The date at the top will change, and we'll post about it on X. If you keep using Brot
Markets after a change, the new terms apply to you.

A market that is already open keeps the fee and payout rules it opened with until it pays out or is annulled.

## 13. Talking to us, and disputes

> **The crumb:** talk to us first. Most problems fit in a direct message.

- **Questions, bug reports, a result that looks wrong:** [@brotmarkets](https://x.com/brotmarkets) on X, or
  **[CONTACT EMAIL]**.
- **A legal dispute:** first write to us and give us 30 days to fix it. If that doesn't work, these terms are governed
  by the laws of **[GOVERNING LAW]**, and disputes go to **[FORUM: courts or arbitration, to be set by the legal
  review]**.

## 14. The small print, in normal size

- If one part of these terms is found invalid, the rest still applies.
- If we don't enforce a rule once, we haven't given it up.
- You can't transfer this agreement to someone else. We can transfer it to the company that will run Brot Markets.
- These terms and the [Privacy Policy](PRIVACY-POLICY.md) are the whole agreement between you and us about Brot
  Markets.

---

You read all the way to the end. Baked is mildly impressed, and he doesn't impress easily.

Proof > Promises.
