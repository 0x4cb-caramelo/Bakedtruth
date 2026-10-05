# Como mercados de previsão ganham dinheiro

Pesquisa de 3 de outubro de 2026, pedida pelo Lucas ("me diga todas as formas, e todas as suas porcentagens"). Taxas
mudam com frequência: confira a fonte antes de usar um número.

**Fonte primária** = página oficial lida nesta data. **Secundária** = sites de terceiros; não confirmei na página
oficial. A tabela de taxas oficial da Kalshi respondeu HTTP 429 nas duas tentativas.

## Formas de receita e percentuais

| Forma | Quem | Quanto | Fonte |
|---|---|---|---|
| Taxa por negociação, ponderada pela incerteza | Polymarket US | `0,0695 × contratos × p × (1 − p)` para quem toma liquidez; teto de US$ 1,74 por 100 contratos a 50¢. Quem fornece liquidez recebe `0,0125 × C × p × (1 − p)`. Desconto de 10%, 25% ou 50% por volume mensal a partir de US$ 250 mil | Primária |
| Idem | Polymarket (internacional) | Mesma fórmula, coeficiente por categoria: cripto 0,07; esportes, economia, cultura, clima e outros 0,05; finanças, política, tech e menções 0,04; geopolítica 0. Só quem toma liquidez paga. De 15% a 25% das taxas volta a quem fornece liquidez. Sem taxa de depósito ou saque | Primária |
| Idem | Kalshi | `0,07 × C × P × (1 − P)` para quem toma liquidez, teto de 1,75¢ por contrato a 50¢; `0,0175 × C × P × (1 − P)` para ordens em espera em alguns mercados. Sem taxa de liquidação | Secundária |
| Corte do pote (parimutuel) | PancakeSwap Prediction | 3% do pote de cada rodada vai para a tesouraria. Pagamento = (pote total ÷ pote do lado vencedor) × aposta × (1 − 3%). Rodada cancelada devolve 100% | Primária |
| Idem | FactCheck (Solana) | 2,5% fixo no modelo de pote | Secundária |
| Taxa sobre o lucro e sobre o saque | PredictIt | 10% do lucro de cada posição vencedora, sem compensar perdas, mais 5% no saque | Secundária |
| Comissão sobre o ganho líquido | Betfair Exchange | 2%, 5% ou 8% do ganho líquido por mercado, conforme o plano | Secundária |
| Taxa de AMM repartida | Hedgehog (Solana) | 2% por negociação para quem fornece liquidez; o criador do mercado fica com 5% das taxas e quem indica com 45% | Secundária |
| Taxa que cresce perto da resolução | Limitless | De 0,03% até 3% | Secundária |
| Taxa definida pelo criador | Augur v2 | Taxa do criador, escolhida por ele, mais uma taxa de reporte | Secundária |
| Rendimento do dinheiro parado | Polymarket | Rende sobre as stablecoins travadas nos mercados; quanto fica com a empresa não é público | Secundária |
| Venda de dados | Polymarket | Licencia probabilidades em tempo real a instituições (parceria com a ICE) | Secundária |

## Ordem de grandeza

Segundo uma fonte secundária, a Kalshi teve US$ 263,5 milhões em taxas sobre US$ 22,9 bilhões negociados em 2025,
cerca de 1,15% do volume.

## Não encontrado

Percentuais do Drift BET e do Azuro. A taxa de ~3% atribuída ao Myriad vem de um agregador e não foi confirmada na
documentação dele.

## Leitura para o nosso caso (inferência, não fato)

No modelo de pote, a forma natural é o corte do pote, e as duas referências encontradas cobram 2,5% e 3%. Dividir parte
da taxa com quem cria o mercado e com quem indica tem precedente (Hedgehog, Augur). Rendimento sobre o USDC parado
existe como prática, mas acrescenta risco ao cofre.

## Fontes

- https://docs.polymarket.us/fees
- https://docs.polymarket.com/trading/fees
- https://docs.pancakeswap.finance/play/prediction/prediction-faq.md
- https://pm.wiki/learn/kalshi-fees-explained
- https://www.thelines.com/prediction-markets/kalshi/fees/
- https://defirate.com/prediction-markets/fees/
- https://www.sportinglife.com/free-bets/guides/betfair-exchange-education/how-does-commission-work
- https://solanacompass.com/projects/hedgehog-markets
- https://solanacompass.com/projects/category/rwa/prediction-markets
- https://pm.wiki/zh/compare/augur-vs-polymarket
- https://tech-insider.org/prediction-markets/how-does-polymarket-make-money/
- https://nextpredict.io/learn/kalshi-vs-polymarket/
