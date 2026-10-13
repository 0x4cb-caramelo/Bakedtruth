# Runbook: a segunda leitura não conseguiu conferir a resolução

**Alerta:** `second_read_unchecked`: faltando menos de 1 hora para o fim da janela de revisão, o standby ainda não
conseguiu conferir a resolução de uma campanha pelo segundo RPC (`KEEPER_RPC_URL_B`). A campanha foi para a fila de
revisão (`KEEPER_REVIEW_QUEUE`) com o motivo `second_read_unchecked` e o detalhe do que faltou.

**O que significa.** Não é uma divergência: é a ausência de conferência. Para uma campanha de preço, o segundo RPC não
devolveu o evento `CampaignResolved` ou a transação que gravou a prova no `posted_slot` (bloco podado, RPC fora do ar,
ou uma prova postada por um programa que o keeper não lê). O campo `answeredBy` do diário diz qual RPC respondeu; se
`sameProvider` for `true`, o segundo RPC é da mesma empresa do primeiro e a conferência não é independente.

**Quem age.** O revisor do dia (ainda sem nome: o CTO até lá).

**Como.**
1. Leia a linha da fila: campanha, tipo e o que faltou.
2. Confira a resolução por outro caminho: o `recheck` do SDK (`@brot/sdk/read`, `recheck(campanha, rpcUrl)`) refaz,
   por qualquer RPC, a leitura que o programa fez; para preço, o explorador mostra a transação do `posted_slot`.
3. Se a conferência manual bater, nada a fazer além de registrar; se não bater, siga `second-read-mismatch.md`.

**Prazo.** Antes do fim da janela de revisão da campanha.
