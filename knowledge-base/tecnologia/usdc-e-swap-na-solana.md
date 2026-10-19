# USDC e swap na Solana: o que custa converter, e como montar

Pesquisa de 19/10/2026, para a decisão de levar o Brot inteiro para USDC com conversão dentro do app (plano de
remuneração v3). SOL a ~US$ 105,4 no dia. Cotações são de um único momento. **[F]** = fato com fonte; **[I]** = inferência.

## A Jupiter em out/2026 **[F]**

- A Ultra API e a Metis (`/quote`, `/swap`, `/swap-instructions`) não são mais mantidas. Vale a **Swap V2**
  (`api.jup.ag/swap/v2`, com chave) ([docs](https://developers.jup.ag/docs/swap)).
- **`/order` e `/execute`:** a Jupiter monta e envia a transação, que não pode ser alterada. Taxa da Jupiter: 2 pontos-base
  em SOL e stablecoins, 10 nas outras, 50 em tokens com menos de 24 horas
  ([taxas](https://developers.jup.ag/docs/swap/fees)). Taxa de integrador de 50 a 255 pontos-base, e a Jupiter fica com
  20% dela.
- **`/build`:** devolve as instruções soltas, sem taxa da Jupiter. É o caminho para juntar a conversão e a entrada do Brot
  numa transação só ([build](https://developers.jup.ag/docs/swap/build)). O integrador escolhe a própria taxa
  (`platformFeeBps`).
- O campo de impacto de preço da cotação pode esconder o custo real: no teste com BONK, ele dizia zero e a ida e volta
  perdeu 0,2%. Melhor comparar com o preço da Pyth **[I]**.

## Quanto custa converter **[F]**

| Origem | Custo para virar USDC | Exemplo |
| --- | --- | --- |
| SOL, stablecoins, JUP | 1 a 5 pontos-base | US$ 5 mil em SOL viram US$ 4.955,6 (impacto de 0,0035%); o pool principal da Orca cobra 0,04% e tem US$ 28,7 mi |
| Moeda média (BONK) | 20 a 70 pontos-base | US$ 5 mil: impacto de 0,67% |
| Memecoin nova | 2% a mais de 15% | Num token com US$ 11 mil de liquidez: 2,3% em US$ 10, 10,7% em US$ 1 mil |

Fontes: APIs públicas da [Orca](https://api.orca.so/v2/solana/pools), da
[Raydium](https://api-v3.raydium.io/pools/info/mint) e da [Meteora](https://dlmm.datapi.meteora.ag/pools), e cotações
da Jupiter.

## O USDC e a rede **[F]**

- USDC na Solana: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`, seis casas decimais, programa de token clássico
  ([Circle](https://developers.circle.com/stablecoins/usdc-contract-addresses)). A Circle pode congelar contas.
- Uma conta de token custa 0,00203928 SOL de depósito (~US$ 0,21) ([contas](https://solana.com/docs/core/accounts)).
- Taxa base de 5.000 lamports por assinatura, mais a prioridade ([taxas](https://solana.com/docs/core/fees)).
- **Pagar a taxa pelo usuário:** o Kora, da Solana Foundation, assina como pagador com lista de programas permitidos,
  teto por transação e limite de assinaturas ([Kora](https://solana.com/docs/tools/kora)).

## Como os outros fazem

- Polymarket: colateral próprio (pUSD) a partir de USDC; depósito de outras redes convertido automaticamente; sem
  taxa de conversão declarada; saque grátis ([docs](https://docs.polymarket.com/developers/misc-endpoints/bridge-overview)).
- Limitless: USDC; taxas por operação de 0,40% a 3% ([docs](https://docs.limitless.exchange/user-guide/fees.md)).
- Carteiras: a Phantom cobra 0,85% por swap ([Phantom](https://help.phantom.com/hc/en-us/articles/5985106844435)); a
  Backpack zerou em mar/2026 ([Backpack](https://learn.backpack.exchange/blog/backpack-wallet-zero-fees-swaps-bridges)).

## O desenho recomendado no plano **[I]**

1. O Brot paga a conversão até o menor entre 25 pontos-base da entrada e US$ 2,50, só para uma lista de moedas (SOL,
   jitoSOL, mSOL, USDT, JUP), com fonte da Pyth, liquidez mínima e mais de 24 horas de vida.
2. Acima do teto paga o usuário, e o app recusa conversão com impacto acima de 1%.
3. O reembolso compara o valor pela Pyth com o USDC que chegou.
4. A conversão vem da `/build` e a entrada usa o mínimo garantido da conversão, nunca um número mandado pelo navegador.
5. Taxa de plataforma de 0,25% só nas moedas de fora da lista; zero nas da lista.
6. Tetos por carteira e por dia, entrada mínima de US$ 5, e a conta de USDC paga pelo Brot só depois da primeira entrada.
