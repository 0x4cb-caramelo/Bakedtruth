# Pitch deck: roteiro de fala

O que dizer em cada slide de `public/pitch/index.html`. O texto é do fundador, em inglês, como veio no deck original
de 5/10/2026. Este arquivo não é publicado: o servidor só entrega o que está em `public/`.

Onde o slide mudou na revisão de 5/10/2026, a fala foi ajustada para dizer a mesma coisa que a tela. Essas falas
estão marcadas com **(ajustada)**. O slide 2 é novo, e a fala dele é proposta, a aprovar.

## 1. Title

Hi, I'm Lucas, founder of Brot Markets. Brot is German for bread, and this grumpy bun is Baked. We're building a
prediction market on Solana where the outcome is never decided by a person, a vote or an AI. The chain decides.

## 2. Problem **(novo, a aprovar)**

Every prediction market needs someone to say who won, and that is where the category collects its complaints. On the
largest on-chain platform, a contested result goes to a token-holder vote that takes four to six days. More than
1,150 of its markets went to arbitration this year through May, more than in all of last year. And in about one in
five disputes, a voter held a position in the market being judged.

## 3. Solution

Our rule is simple: if the answer isn't stored in a Solana account, we don't open the market. The program reads the
account itself. You connect a wallet, bet in USDC, and if you're right the money lands in your wallet. No sign-up,
no claim button.

## 4. How it works

Here's one question end to end. 300 USDC on YES, 700 on NO, so the screen shows 30/70. Betting closes before the
deadline so nobody bets on a known result. Our scheduler tells the program to read the Pyth price on-chain. The team
gets six hours to confirm or void, never to flip the winner. Then winners are paid automatically.

## 5. Question types **(ajustada)**

We launch with five question types. Price is the one nobody controls and the topic crypto users bet on most, so we
built the Pyth reader first: it already parses real devnet price accounts. The other four have readers written in
our earlier program, and we are porting them. The filter we apply: can anyone decide the outcome for free? If one
keyholder can, the type stays out.

## 6. Fee model **(ajustada)**

A pool needs no order book and no market makers. Our fee is 10% of the losing side, which is the same as 10% of what
winners gain. A flat fee on the whole pot can make a winner lose money on a heavy favourite. Ours can't: being right
never costs you. In our model it works out to about 3.7% of volume, and that depends on the mix of questions, which
nobody has measured yet.

## 7. Sponsors

Our second customer is projects. A team that promised a burn can sponsor the question about that burn. Their
community bets, the question spreads, and the promise is proven on-chain. Sponsors pay 500, 1,500 or 5,000 dollars;
70% goes into the pool. At launch, 20 to 30 partner projects get a free question in exchange for posting it to their
communities.

## 8. Market **(ajustada)**

The category moved 21.7 billion dollars in thirty days, paid dollars, not face value. Solana's best showcase, World
inside Phantom, did about 15 million in September, roughly 300 times less than Polymarket. And token events already
draw real money: a single Polymarket token-launch market traded more than 4 million dollars. Those markets still
resolve off-chain, through price sources and a token vote. We settle token facts by reading the chain directly.

## 9. Business model **(ajustada)**

We run lean: three founders and infrastructure, 5,500 dollars a month. At a 3.7% average take, we cover that at about
209 thousand dollars of monthly volume. That's 1.4% of what World did in September. In our base case we break even
in month nine. These are our own projections, not promises.

## 10. Go-to-market

In Solana, distribution decides volume. Points campaigns bought volume for others and it left: Opinion and Myriad
dropped 80 to 94 percent quarter over quarter. Our channels bring people with a reason to bet: partner communities,
referrals from day one, question ideas from X, and a pump.fun token used purely as a traction channel. It gives no
rights in the company; its creator fees go to the prize pool.

## 11. Safety **(ajustada)**

Proof over promises applies to us too. By design there are two schedulers on different providers, so a dead service
can't turn a true YES into NO: after ten silent minutes and three restart attempts, the backup takes over. The team's
review can only confirm or void. A voided question refunds everyone with no fee. Each question has its own vault.
And we only go to mainnet after an external audit, a two-of-three multisig, and a low global cap.

## 12. Roadmap **(ajustada)**

We start from working code: nine on-chain readers to reuse, more than 160 tests green in CI, and a price reader that
already parses two real Pyth accounts from devnet. The hackathon month runs on devnet with test USDC and points.
Capped mainnet is our target for month two, and it only opens once the audit, the multisig and the cap are in place.

## 13. Close

That's Brot Markets: questions the chain can answer, pools anyone can verify, payouts nobody has to claim. Proof
over promises. Thanks.
