# 2026-10-13 — Sprint 15: a entrada selada do patrocinador

Construída na execução paralela do líder (o registro geral do dia está em
`2026-10-13-auditoria-do-roteiro-e-faixas.md`, no PR #85). Nada foi publicado no devnet: a publicação depende da
mescla na `main` e das palavras do Ronaldo.

## As respostas do fundador que valem aqui (13/10, Ronaldo)

- O piso da entrada selada: **US$ 500, cobrados na rede ao preço SOL/USD da Pyth**, pela mesma conversão da abertura,
  com o teto de lamports.
- O prêmio de um terceiro na campanha de outro (`sponsor_add_prize`): **adiado**, para a conversa com os sócios. Não
  foi construído e nada ficou reservado para ele.

## Decisões de engenharia

- **Uma instrução própria** (`sponsor_join_campaign`) que chama o núcleo da entrada comum, extraído de
  `join_campaign.rs` sem mudar nenhum dos 40 testes dela.
- **Os 10% numa conta do patrocinador** (`SealedFee`), e não no cofre da campanha: o `Campaign` tinha só quatro bytes
  livres, que viraram o contador `sealed_fees_open`, e assim a contabilidade e a asserção do cofre (I1, I15) não
  mudaram. Uma instrução de liquidação (`settle_sealed_fee`) devolve a taxa ao patrocinador numa anulação por falha da
  casa e a manda ao cofre de taxas em todo outro caso; o `close_campaign` espera todas.
- **A versão das regras de criação fica travada** entre a prévia e a assinatura, como na abertura (pedido da revisão
  adversária): se o admin mudar a divisão 90/10 nesse meio-tempo, a entrada selada é recusada.

## A revisão adversária

Nada grave: o dinheiro só pode ir para o patrocinador gravado, para o cofre da campanha ou para o cofre de taxas, e a
separação do núcleo da entrada comum ficou idêntica. Quatro melhorias entraram antes do PR: a versão das regras travada,
o resumo com a parte da taxa em números, a preparação segura do SDK (`prepareSealedEntry`) e um teste da campanha de
preço SOL/USD.

## O teste de dinheiro

Sorteia a entrada selada, a liquidação da taxa, SOL mandado à mão para a conta e o fechamento esperando a taxa; verde
em 35 sementes. Ao estendê-lo, a faixa achou que o teste antigo só passava na própria semente: em 10 sementes novas,
5 falhavam por erros do modelo do teste (e não do programa), corrigidos aqui; a Sprint 14 corrigiu parte dos mesmos, e
as duas correções se juntam quando as sprints se encontrarem.

## O que fica com o fundador

Se a taxa de 10% de uma entrada selada feita tarde (depois da prova do SIM) fica com o Brot ou volta (hoje fica, e os
90% voltam inteiros); os benefícios do patrocinador (BP-3); as telas da entrada selada e da página do Cloak (L-11,
L-18); se o Cloak funciona com SOL (P-8); o prêmio de terceiros.
