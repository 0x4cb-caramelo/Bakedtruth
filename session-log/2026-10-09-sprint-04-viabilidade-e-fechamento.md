# 2026-10-09 — Sprint 04: a regra de viabilidade, o corte da revisão e o fechamento

## Decisões que valem para o código

1. **Regra de viabilidade econômica (decisão 7 do fundador).** Um pote só divide quando o lado perdedor é maior que
   as taxas que sairiam dele: a taxa da Brot mais a parte do criador, calculada sobre V + P. Caso contrário, o pote
   resolve como de um lado só (reembolso líquido das taxas por entrada; o prêmio volta a quem abriu). Implementada em
   `math/snapshot.rs` (`split_is_viable`) e espelhada em `tests/brot/money-model.ts` (`splitIsViable`).
   - **Ambiguidade a confirmar com o fundador.** O texto da decisão diz "taxas cobradas sobre o principal do lado
     vencedor". O programa cobra a taxa da Brot sobre o lado perdedor (como sempre foi), e a parte do criador sobre o
     pote inteiro. Com a redação do fundador, a conta mudaria para os casos de V 990 / P 10 e V 98.900 / P 1.100.
     Até a resposta, vale o que está no código; a Sprint 04 registra a dúvida em "Closure status".
   - Fronteira testada: com V 990, um lado perdedor de 12 é de um lado só (taxas de 2 + 10 = 12, não é maior);
     de 13 divide.
2. **Corte da revisão (decisão 1).** Uma campanha em revisão move o corte só para trás, para uma prova SIM de preço
   anterior, antes de qualquer apuração. A janela de revisão não muda. Qualquer outra nova prova é recusada com
   `CutoffNotMovable` (6147). Para um NÃO ou um vazio em revisão, o leitor responde antes (`NotResolvableYet`,
   `ProofStale`), e só depois a recusa de corte: é a ordem do programa, e o modelo a segue.
3. **Marca do prêmio.** `settle_prize` marca o prêmio como liquidado em toda liquidação, inclusive num `Split`, em
   que não paga nada. A finalização não marca. O modelo estava marcando na finalização, e foi corrigido.
4. **Correções de modelo, não de programa.** Três correções foram feitas no teste aleatório, cada uma porque o modelo
   errava e o programa seguia sua própria regra:
   - I3 descontava as apurações tardias da soma paga aos vencedores; elas ficam fora da distribuível por construção.
   - A ordem de recusa em revisão (leitor antes do corte), como acima.
   - O prêmio liquidado (acima).

## O que não foi decidido aqui

- A redação da regra de viabilidade (item 1), para o fundador.
- A cobertura dos caminhos de time no teste aleatório: `confirm` e o `void` de time não tiveram sucesso na rodada.
- O axioma do pagamento no `bookkeeping.rs` (uma tautologia que precisa virar checagem real), apontado pela revisão.

## Medições (LiteSVM)

`settle_entry`: 2.926 a 3.180 CU por entrada; 12 entradas por transação (1.152 de 1.232 bytes); cerca de 3.850
liquidações por bloco numa campanha, sob o limite de 12.000.000 CU por conta. Abertura: 19.466 CU grátis, 25.022
paga. `brot_markets.so`: 158.072 bytes. O script `scripts/measure-settle.ts` tinha três erros de montagem (modo de
liquidação, entradas abertas, distribuível); foram corrigidos antes da medição.
