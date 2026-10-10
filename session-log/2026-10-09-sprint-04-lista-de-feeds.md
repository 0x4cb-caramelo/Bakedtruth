# 2026-10-09 — Sprint 04: a lista compilada de feeds da Pyth e a conferência da contagem

## Context

A pergunta 1 do fundador: uma campanha de preço só pode nomear feeds de uma lista compilada, que começa com a lista
patrocinada oficial da Pyth. A forma da lista e o seu erro (`FeedNotOnList`, 6141) fazem parte do contrato congelado.

## Fonte e medição

- Lista documentada: a tabela que a página da Pyth embute (docs.pyth.network, push feeds em Solana), 64 feeds, cruzada
  com os ids da Hermes (1.883 feeds, sem chave) por `scripts/pyth-sponsored-feeds.ts`.
- Atividade: cada conta de fatia 0 foi lida a cada 20 s por 6 minutos, em cada cluster: mainnet das 16:59 às 17:05 UTC,
  devnet das 17:13 às 17:19 UTC, de 9/10/2026.
- "Atualizada" = o `publish_time` mudou dentro da janela.

## Resultado

| Cluster | Documentados com conta | Atualizados na janela | Excluídos |
|---|---|---|---|
| Mainnet | 63 | 63 (intervalo mediano entre atualizações: 53 a 58 s) | NTBILL/USD.RR (não está na Hermes) |
| Devnet | 17 | 17 | 47 documentados sem conta na devnet; NTBILL/USD.RR |

Fora da lista, sem nunca serem nomeáveis: 120 contas de fatia 0 na mainnet e 13 na devnet (`pyth-feeds-patrocinados.md`).

## Divergência para o fundador

A resposta de 9/10 diz **62** na mainnet. A medição de hoje, com a regra "atualizada na janela", dá **63**. A medição
anterior (`pyth-feeds-patrocinados.md`) também dizia 62 frescas e 1 da lista sem conta, mas o total de documentados com
conta nessa mesma medição é 63: uma das 63 não atualizou naquela janela. Hoje todas as 63 atualizaram. Eu compilei o
resultado da regra (63), porque a regra é a resposta do fundador e o número de 62 era a foto de uma janela. **O fundador
confirma se quer as 63 ou se quer uma delas de fora.** Não sei qual feed foi o que falhou na janela anterior; isso
precisa de outra medição.

## O que foi congelado (`programs/brot-markets/src/feeds.rs`)

- Uma lista por cluster, escolhida pela feature `mainnet`; ids em hexadecimal, decodificados com verificação (um id mal
  formado não casa com nenhum feed; um teste confere que todos decodificam).
- `require_listed(feed_id)`: `Ok` ou `FeedNotOnList` (6141). Chamada só na abertura.
- O SOL/USD e o BTC/USD estão nas duas listas. Um teste confere que os ids são os das contas capturadas
  (`tests/fixtures/pyth-*-mainnet.bin` e `*-devnet.bin`, bytes 41 a 73).
- Lista apenas de crescimento: um feed entra por revisão de código, e só depois que o keeper da Sprint 06 mantém a
  conta atualizada (pergunta 1, complemento).

## Ainda não feito

- O teste "feed fresco fora da lista é recusado" com uma conta real (RAY/USD, fatia 0). Precisa de uma captura nova com
  `scripts/capture-fixtures.ts`; fica para a frente H.
- Conferir a contagem contra a página da Pyth no dia da construção final (a página é lida pelo script).
