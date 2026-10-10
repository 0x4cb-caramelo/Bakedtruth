# 2026-10-10 — Sprint 06: a campanha de teste para a resolução real, e o que impede de abri-la agora

## Pedido

O fundador pediu uma campanha curta no devnet, com alvo quase no preço atual, aberta pela carteira de teste de fumaça
(`G5ch…`, com SOL recebido hoje); depois, acompanhar o keeper até a transação de `resolve_campaign` ser enviada e confirmada.

## O que foi verificado

- A carteira `G5ch…` (`~/.config/solana/pred-provable-devnet.json`) tem **0,42 SOL**.
- **Ela não é uma chave de equipe.** A equipe on-chain é `3EgrFs…`. A abertura gratuita (`openingUsd = 0`) só vale para
  uma chave de equipe.
- **Abertura paga:** o programa exige pelo menos a taxa de abertura configurada, em dólares, pela qual a carteira paga em SOL
  (`programs/brot-markets/src/instructions/campaigns/open_campaign.rs:59`: "at least `opening_fee_usd` for any wallet").
  A taxa é da ordem de US$ 500. Com 0,42 SOL, não dá.
- **Alvo mínimo:** o programa só aceita alvo a pelo menos 1% do preço atual e além da faixa de confiança
  (`MIN_DISTANCE_BPS.price = 100`). "Quase no preço" não é aceito.
- A torneira pública do devnet já deu o limite do dia (429); não há como completar o saldo hoje sem o fundador.
- O keeper segue ativo, em modo real, sem nenhum `resolved` nos últimos minutos (as três campanhas seguem sem toque).

## O que foi feito

- `scripts/devnet-open-test.ts`: abre uma campanha de preço do BTC/USD, alvo 1,2% acima da faixa de confiança
  (acima do mínimo de 1%), prazo de quatro dias (o mínimo do programa no devnet é de três dias; `DurationTooShort`, 0x17a3, recusou dois). Exige `TEAM_KEYPAIR` (chave de equipe) e `-- --cluster devnet`. Sem a chave,
  recusa e não envia nada (conferido).
- Nenhuma campanha foi aberta; nenhuma transação foi enviada.

## Caminhos para a resolução real

1. **Chave de equipe**: o fundador roda `TEAM_KEYPAIR=<chave> bun scripts/devnet-open-test.ts -- --cluster devnet`. É a
   abertura gratuita, a mais simples.
2. **Financiar `G5ch…` com cerca de 4 SOL** (o valor exato depende do preço do SOL no momento), e então abrir pagando.
   Como a carteira não é de equipe, a abertura paga é o único caminho sem a chave.

Em ambos, o alvo de 1,2% pode levar horas ou dias para ser tocado; "em alguns minutos" não é garantido.
